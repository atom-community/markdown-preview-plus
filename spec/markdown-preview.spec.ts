import * as path from 'path'
import * as fs from 'fs'
import * as temp from 'temp'
import * as wrench from 'fs-extra'
import {
  MarkdownPreviewView,
  createFileView,
} from '../src/markdown-preview-view'

import {
  waitsFor,
  expectPreviewInSplitPane,
  previewText,
  previewFragment,
  previewHTML,
  activateMe,
  stubClipboard,
  sinonPrivateSpy,
  WithFileType,
  withFileGen,
} from './util'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { TextEditor, TextEditorElement, ConfigValues } from 'atom'

describe('Markdown preview plus package', function () {
  const clipboard = stubClipboard()
  let preview: MarkdownPreviewView
  let tempPath: string
  let withFile: WithFileType

  before(async function () {
    await Promise.all([
      activateMe(),
      atom.packages.activatePackage('language-gfm'),
    ])
    const fixturesPath = path.join(__dirname, 'fixtures')
    tempPath = temp.mkdirSync('atom')
    wrench.copySync(fixturesPath, tempPath)
    atom.project.setPaths([tempPath])
    withFile = withFileGen(tempPath)
  })

  after(async function () {
    await atom.packages.deactivatePackage('markdown-preview-plus')
    await atom.packages.deactivatePackage('language-gfm')
    wrench.removeSync(tempPath)
    atom.project.setPaths([])
  })

  afterEach(async function () {
    atom.config.unset('markdown-preview-plus')
    for (const item of atom.workspace.getPaneItems()) {
      const pane = atom.workspace.paneForItem(item)
      if (pane) await pane.destroyItem(item, true)
    }
  })

  describe('when markdown-preview-plus:copy-html is triggered', function () {
    async function copyHtml(editor: object) {
      clipboard.stub!.resetHistory()
      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:copy-html',
      )
      await waitsFor.msg(
        'clipboard.write to have been called',
        () => clipboard.stub!.called,
      )
    }

    describe('when rich clipboard is disabled', function () {
      before(function () {
        atom.config.set('markdown-preview-plus.richClipboard', false)
      })
      after(function () {
        atom.config.unset('markdown-preview-plus.richClipboard')
      })

      it('should use atom.clipboard', async function () {
        const editor = await atom.workspace.open(
          path.join(tempPath, 'subdir/simple.md'),
        )

        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:copy-html',
        )

        await waitsFor.msg(
          'atom.clipboard.write to have been called',
          () => clipboard.stub.called,
        )

        expect(clipboard.contents).to.not.equal('')
      })
    })

    it('copies the HTML to the clipboard', async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/simple.md'),
      )

      await copyHtml(editor)

      expect(clipboard.contents).to.equal(`\
<p><em>italic</em></p>
<p><strong>bold</strong></p>
<p>encoding \u2192 issue</p>
`)

      atom.workspace.getActiveTextEditor()!.setSelectedBufferRange([
        [0, 0],
        [1, 0],
      ])

      await copyHtml(editor)

      expect(clipboard.contents).to.equal(`\
<p><em>italic</em></p>
`)
    })

    describe('when LaTeX rendering is enabled by default', function () {
      beforeEach(async function () {
        atom.config.set(
          'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault',
          true,
        )

        const editor = (await atom.workspace.open(
          path.join(tempPath, 'subdir/simple.md'),
        )) as TextEditor

        editor.setText('$$\\int_3^4$$')
        await copyHtml(editor)
      })

      it("copies the HTML with maths blocks as svg's to the clipboard by default", async function () {
        const cb = clipboard.contents
        expect(cb.match(/MathJax_SVG_Hidden/g)!.length).to.equal(1)
        expect(cb.match(/class="MathJax_SVG_Display"/g)!.length).to.equal(1)
        expect(cb.match(/class="MathJax_SVG"/g)!.length).to.equal(1)
        expect(cb.match(/file:\/\//g)).to.equal(null, 'no references to files')
      })
    })

    describe('code block tokenization', function () {
      const element = document.createElement('div')

      beforeEach(async function () {
        await atom.packages.activatePackage('language-ruby')

        await atom.packages.activatePackage('markdown-preview-plus')

        const editor = await atom.workspace.open(
          path.join(tempPath, 'subdir/file.markdown'),
        )

        const ev = atom.views.getView(editor)
        atom.commands.dispatch(ev, 'markdown-preview-plus:copy-html')

        await waitsFor.msg(
          'clipboard.write to have been called',
          () => clipboard.stub!.called,
        )

        element.innerHTML = clipboard.contents
      })

      describe("when the code block's fence name has a matching grammar", function () {
        it('tokenizes the code block with the grammar', function () {
          expect(element.querySelector('pre.lang-ruby span.syntax--control')).to
            .exist
        })
      })

      describe("when the code block's fence name doesn't have a matching grammar", () =>
        it('does not tokenize the code block', function () {
          expect(
            element.querySelectorAll('pre.lang-kombucha .syntax--null-grammar')
              .length,
          ).to.equal(2)
        }))

      describe('when the code block contains empty lines', () =>
        it("doesn't remove the empty lines", function () {
          expect(
            element.querySelector('pre.lang-python')!.children.length,
          ).to.equal(6)
          expect(
            (
              element.querySelector(
                'pre.lang-python span:nth-child(2)',
              )! as HTMLElement
            ).innerText.trim(),
          ).to.equal('')
          expect(
            (
              element.querySelector(
                'pre.lang-python span:nth-child(4)',
              )! as HTMLElement
            ).innerText.trim(),
          ).to.equal('')
          expect(
            (
              element.querySelector(
                'pre.lang-python span:nth-child(5)',
              )! as HTMLElement
            ).innerText.trim(),
          ).to.equal('')
        }))

      describe('when the code block is nested in a list', () =>
        it('detects and styles the block', () => {
          expect(
            Array.from(
              (element.querySelector('pre.lang-javascript')! as HTMLElement)
                .classList,
            ),
          ).to.contain('editor-colors')
        }))
    })
  })

  describe('sanitization', function () {
    it('removes script tags and attributes that commonly contain inline scripts', async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/evil.md'),
      )

      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      preview = await expectPreviewInSplitPane()

      expect(await previewHTML(preview)).to.equal(`\
<p>hello</p>


<p>sad
<img>
world</p>
`)
    })

    it('remove the first <!doctype> tag at the beginning of the file', async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/doctype-tag.md'),
      )

      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      preview = await expectPreviewInSplitPane()

      expect(await previewHTML(preview)).to.equal(`\
<p>content
&lt;!doctype html&gt;</p>
`)
    })
  })

  describe('when the markdown contains an <html> tag', () =>
    it('does not throw an exception', async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/html-tag.md'),
      )

      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      preview = await expectPreviewInSplitPane()

      expect(await previewHTML(preview)).to.equal('content\n')
    }))

  describe('when the markdown contains a <pre> tag', () =>
    it('does not throw an exception', async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/pre-tag.md'),
      )

      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      preview = await expectPreviewInSplitPane()

      expect(
        (await previewFragment(preview)).querySelector('pre.editor-colors'),
      ).to.exist
    }))

  describe('GitHub style markdown preview', function () {
    beforeEach(() => atom.config.set('markdown-preview-plus.style', 'default'))

    async function usesGithubStyle(preview: MarkdownPreviewView) {
      return preview.runJS<boolean>(
        `window.getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)'`,
      )
    }

    it('renders markdown using the default style when GitHub styling is disabled', async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/simple.md'),
      )

      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      preview = await expectPreviewInSplitPane()

      await preview.initialRenderPromise()

      expect(await usesGithubStyle(preview)).to.be.false
    })

    it('renders markdown using the GitHub styling when enabled', async function () {
      atom.config.set('markdown-preview-plus.style', 'github')

      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/simple.md'),
      )

      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      preview = await expectPreviewInSplitPane()

      expect(await usesGithubStyle(preview)).to.be.true
    })

    it('updates the rendering style immediately when the configuration is changed', async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/simple.md'),
      )

      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      preview = await expectPreviewInSplitPane()

      expect(await usesGithubStyle(preview)).to.be.false

      atom.config.set('markdown-preview-plus.style', 'github')
      await waitsFor(async () => (await usesGithubStyle(preview)) === true)
      expect(await usesGithubStyle(preview)).to.be.true

      atom.config.set('markdown-preview-plus.style', 'default')
      await waitsFor(async () => (await usesGithubStyle(preview)) === false)
      expect(await usesGithubStyle(preview)).to.be.false
    })
  })

  describe('Binding and unbinding based on config', function () {
    let spy: sinon.SinonSpy<any>
    before(async function () {
      await atom.packages.activatePackage('language-javascript')
      spy = sinon.spy(atom.commands, 'add')
    })
    after(async function () {
      await atom.packages.deactivatePackage('language-javascript')
      spy.restore()
    })
    beforeEach(function () {
      spy.resetHistory()
    })
    it('Binds to new scopes when config is changed', async function () {
      atom.config.set('markdown-preview-plus.grammars', ['source.js'])

      await waitsFor(() => spy.called)

      const editor = await atom.workspace.open('source.js')

      expect(
        await atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        ),
      ).to.be.ok
      preview = await expectPreviewInSplitPane()
    })
    it('Unbinds from scopes when config is changed', async function () {
      atom.config.set('markdown-preview-plus.grammars', ['no-such-grammar'])

      await waitsFor(() => spy.called)

      const editor = await atom.workspace.open()
      const buffer = editor.getBuffer()
      atom.grammars.assignLanguageMode(buffer, 'source.gfm')

      expect(
        await atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        ),
      ).not.to.be.ok
    })
  })

  describe('Math separators configuration', function () {
    beforeEach(function () {
      atom.config.set(
        'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault',
        true,
      )
    })
    describe('Uses new math separators', async function () {
      let preview: MarkdownPreviewView

      beforeEach(async function () {
        atom.config.set(
          'markdown-preview-plus.markdownItConfig.inlineMathSeparators',
          ['$$', '$$'],
        )
        atom.config.set(
          'markdown-preview-plus.markdownItConfig.blockMathSeparators',
          ['$$\n', '\n$$'],
        )

        const editor = await atom.workspace.open(
          path.join(tempPath, 'subdir/kramdown-math.md'),
        )

        expect(
          await atom.commands.dispatch(
            atom.views.getView(editor),
            'markdown-preview-plus:toggle',
          ),
        ).to.be.ok
        preview = await expectPreviewInSplitPane()
      })

      it('works for inline math', async function () {
        const inline = (await previewFragment(preview)).querySelectorAll(
          'span.math > script[type="math/tex"]',
        ) as NodeListOf<HTMLElement>
        expect(inline.length).to.equal(1)
        expect(inline[0].innerText).to.equal('inlineMath')
      })
      it('works for block math', async function () {
        const block = (await previewFragment(preview)).querySelectorAll(
          'span.math > script[type="math/tex; mode=display"]',
        ) as NodeListOf<HTMLElement>
        expect(block.length).to.be.greaterThan(0)
        expect(block[0].innerText).to.equal('displayMath\n')
      })
      it('respects newline in block math closing tag', async function () {
        const block = (await previewFragment(preview)).querySelectorAll(
          'span.math > script[type="math/tex; mode=display"]',
        ) as NodeListOf<HTMLElement>
        expect(block.length).to.be.greaterThan(1)
        expect(block[1].innerText).to.equal('displayMath$$\n')
      })
    })
    it('Shows warnings on odd number of math separators', async function () {
      await atom.packages.activatePackage('notifications')

      atom.config.set(
        'markdown-preview-plus.markdownItConfig.inlineMathSeparators',
        ['$$', '$$', '$'],
      )
      atom.config.set(
        'markdown-preview-plus.markdownItConfig.blockMathSeparators',
        ['$$\n', '\n$$', '$$$'],
      )

      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/kramdown-math.md'),
      )

      expect(
        await atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        ),
      ).to.be.ok
      preview = await expectPreviewInSplitPane()

      await waitsFor.msg(
        'notification',
        () => document.querySelectorAll('atom-notification.warning').length > 0,
        60000,
      )

      const notifications = Array.from(
        document.querySelectorAll(
          'atom-notification.warning',
        ) as NodeListOf<HTMLElement>,
      )
      expect(notifications.length).to.equal(2)
      expect(notifications).to.satisfy((x: HTMLElement[]) =>
        x.some((y) => y.innerText.includes('inlineMathSeparators')),
      )
      expect(notifications).to.satisfy((x: HTMLElement[]) =>
        x.some((y) => y.innerText.includes('blockMathSeparators')),
      )

      await atom.packages.deactivatePackage('notifications')
    })
  })
  describe('saveConfig configuration', () => {
    beforeEach(async () => {
      preview = createFileView(path.join(tempPath, 'subdir', 'file.markdown'))
      atom.views
        .getView(atom.workspace)
        .appendChild(atom.views.getView(preview))
      await preview.initialRenderPromise()
    })
    afterEach(() => {
      preview.destroy()
    })
    describe('when defaultSaveFormat is changed', () => {
      it('changes default options', async () => {
        // default
        expect(preview.getSaveDialogOptions().defaultPath.endsWith('.html')).to
          .be.true
        // html
        atom.config.set(
          'markdown-preview-plus.saveConfig.defaultSaveFormat',
          'html',
        )
        expect(preview.getSaveDialogOptions().defaultPath.endsWith('.html')).to
          .be.true
        // pdf
        atom.config.set(
          'markdown-preview-plus.saveConfig.defaultSaveFormat',
          'pdf',
        )
        expect(preview.getSaveDialogOptions().defaultPath.endsWith('.pdf')).to
          .be.true
      })
    })
    describe('depending on mediaOnSaveAsHTMLBehaviour value', () => {
      let outPath: string
      beforeEach(() => {
        outPath = path.join(tempPath, 'test.html')
      })
      async function readHTML(path: string) {
        await waitsFor(() => {
          try {
            fs.accessSync(path)
            return true
          } catch (e) {
            return false
          }
        })
        const content = fs.readFileSync(path, { encoding: 'utf-8' })
        const dom = new DOMParser()
        const doc = dom.parseFromString(content, 'text/html')
        return doc
      }
      async function getImgs(
        settingVal: ConfigValues['markdown-preview-plus.saveConfig.mediaOnSaveAsHTMLBehaviour'],
      ) {
        atom.config.set(
          'markdown-preview-plus.saveConfig.mediaOnSaveAsHTMLBehaviour',
          settingVal,
        )
        preview.saveAs(outPath)
        const doc = await readHTML(outPath)
        const imgs = Array.from(doc.body.querySelectorAll('img')).slice(-4)
        expect(imgs.length).to.equal(4)
        return imgs
      }
      it('doesnt touch media if it is "untouched"', async () => {
        const imgs = await getImgs('untouched')
        expect(imgs[0].getAttribute('src')).to.equal('image1.png')
        expect(imgs[1].getAttribute('src')).to.equal('/tmp/image2.png')
        expect(imgs[2].getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
        expect(imgs[3].getAttribute('src')!.startsWith('data:')).to.be.true
      })
      it('relativizes paths if it is "relativized"', async () => {
        const imgs = await getImgs('relativized')
        expect(imgs[0].getAttribute('src')).to.equal(
          path.join('subdir', 'image1.png'),
        )
        expect(imgs[1].getAttribute('src')).to.equal(
          path.join('tmp', 'image2.png'),
        )
        expect(imgs[2].getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
        expect(imgs[3].getAttribute('src')!.startsWith('data:')).to.be.true
      })
      it('absolutizes paths if it is "absolutized"', async () => {
        const imgs = await getImgs('absolutized')
        expect(imgs[0].getAttribute('src')).to.equal(
          path.join(tempPath, 'subdir', 'image1.png'),
        )
        expect(imgs[1].getAttribute('src')).to.equal(
          path.join(tempPath, 'tmp', 'image2.png'),
        )
        expect(imgs[2].getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
        expect(imgs[3].getAttribute('src')!.startsWith('data:')).to.be.true
      })
    })
    describe('depending on mediaOnCopyAsHTMLBehaviour value', () => {
      async function readHTML() {
        clipboard.stub!.resetHistory()
        await atom.commands.dispatch(atom.views.getView(preview), 'core:copy')
        await waitsFor(() => clipboard.stub!.called)
        const dom = new DOMParser()
        const doc = dom.parseFromString(clipboard.contents, 'text/html')
        return doc
      }
      async function getImgs(
        settingVal: ConfigValues['markdown-preview-plus.saveConfig.mediaOnCopyAsHTMLBehaviour'],
      ) {
        atom.config.set(
          'markdown-preview-plus.saveConfig.mediaOnCopyAsHTMLBehaviour',
          settingVal,
        )
        const doc = await readHTML()
        const imgs = Array.from(doc.body.querySelectorAll('img')).slice(-4)
        expect(imgs.length).to.equal(4)
        return imgs
      }
      it('doesnt touch media if it is "untouched"', async () => {
        const imgs = await getImgs('untouched')
        expect(imgs[0].getAttribute('src')).to.equal('image1.png')
        expect(imgs[1].getAttribute('src')).to.equal('/tmp/image2.png')
        expect(imgs[2].getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
        expect(imgs[3].getAttribute('src')!.startsWith('data:')).to.be.true
      })
      it('relativizes paths if it is "relativized"', async () => {
        const imgs = await getImgs('relativized')
        expect(imgs[0].getAttribute('src')).to.equal(path.join('image1.png'))
        expect(imgs[1].getAttribute('src')).to.equal(
          path.join('..', 'tmp', 'image2.png'),
        )
        expect(imgs[2].getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
        expect(imgs[3].getAttribute('src')!.startsWith('data:')).to.be.true
      })
      it('absolutizes paths if it is "absolutized"', async () => {
        const imgs = await getImgs('absolutized')
        expect(imgs[0].getAttribute('src')).to.equal(
          path.join(tempPath, 'subdir', 'image1.png'),
        )
        expect(imgs[1].getAttribute('src')).to.equal(
          path.join(tempPath, 'tmp', 'image2.png'),
        )
        expect(imgs[2].getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
        expect(imgs[3].getAttribute('src')!.startsWith('data:')).to.be.true
      })
    })
  })

  describe('when a preview has not been created for the file', function () {
    it('displays a markdown preview in a split pane', async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/file.markdown'),
      )
      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      preview = await expectPreviewInSplitPane()

      const [editorPane] = atom.workspace.getPanes()
      expect(editorPane.getItems()).to.have.length(1)
      expect(editorPane.isActive()).to.equal(true)
    })

    describe("when the editor's path does not exist", () =>
      it('splits the current pane to the right with a markdown preview for the file', async function () {
        const editor = await atom.workspace.open('new.markdown')
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()
      }))

    describe('when the editor does not have a path', () =>
      it('splits the current pane to the right with a markdown preview for the file', async function () {
        const editor = await atom.workspace.open('')
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()
      }))

    // https://github.com/atom/markdown-preview/issues/28
    describe('when the path contains a space', function () {
      it('renders the preview', async function () {
        const editor = await atom.workspace.open(
          path.join(tempPath, 'subdir/file with space.md'),
        )
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()
      })
    })

    // https://github.com/atom/markdown-preview/issues/29
    describe('when the path contains accented characters', function () {
      it('renders the preview', async function () {
        const editor = await atom.workspace.open(
          path.join(tempPath, 'subdir/áccéntéd.md'),
        )
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()
      })
    })
  })

  describe('when a preview has been created for the file', function () {
    beforeEach(async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/file.markdown'),
      )

      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      preview = await expectPreviewInSplitPane()
    })

    it('closes the existing preview when toggle is triggered a second time on the editor and when the preview is its panes active item', function () {
      atom.commands.dispatch(
        atom.views.getView(atom.workspace.getActivePaneItem()),
        'markdown-preview-plus:toggle',
      )

      const [editorPane, previewPane] = atom.workspace.getPanes()
      expect(editorPane.isActive()).to.equal(true)
      expect(previewPane.getActiveItem()).to.be.undefined
    })

    it('activates the existing preview when toggle is triggered a second time on the editor and when the preview is not its panes active item #nottravis', async function () {
      const [editorPane, previewPane] = atom.workspace.getPanes()

      editorPane.activate()
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/simple.md'),
      )

      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )

      await waitsFor.msg(
        'second markdown preview to be created',
        () => previewPane.getItems().length === 2,
      )

      await waitsFor.msg(
        'second markdown preview to be activated',
        () => previewPane.getActiveItemIndex() === 1,
      )

      const preview1 = previewPane.getActiveItem() as MarkdownPreviewView
      expect(preview1.type).to.be.equal('editor')
      expect(preview1.getPath()).to.equal(
        (editorPane.getActiveItem() as TextEditor).getPath(),
      )
      expect(preview1.getPath()).to.equal(
        atom.workspace.getActiveTextEditor()!.getPath(),
      )

      editorPane.activate()
      editorPane.activateItemAtIndex(0)

      atom.commands.dispatch(
        atom.views.getView(editorPane.getActiveItem()),
        'markdown-preview-plus:toggle',
      )

      await waitsFor.msg(
        'first preview to be activated',
        () => previewPane.getActiveItemIndex() === 0,
      )

      const preview2 = previewPane.getActiveItem() as MarkdownPreviewView
      expect(previewPane.getItems().length).to.equal(2)
      expect(preview2.getPath()).to.equal(
        (editorPane.getActiveItem() as TextEditor).getPath(),
      )
      preview1.destroy()
      preview2.destroy()
    })

    it('closes the existing preview when toggle is triggered on it and it has focus', async function () {
      const [, previewPane] = atom.workspace.getPanes()
      previewPane.activate()

      expect(
        await atom.commands.dispatch(
          atom.views.getView(previewPane.getActiveItem()),
          'markdown-preview-plus:toggle',
        ),
      ).to.be.ok
      expect(previewPane.getActiveItem()).to.be.undefined
    })

    describe('when the editor is modified', function () {
      it('re-renders the preview', async function () {
        const markdownEditor = atom.workspace.getActiveTextEditor()!
        markdownEditor.setText('Hey!')

        await waitsFor(
          async () => (await previewText(preview)).indexOf('Hey!') >= 0,
        )
      })

      it('invokes ::onDidChangeMarkdown listeners', async function () {
        let listener: sinon.SinonSpy
        const markdownEditor = atom.workspace.getActiveTextEditor()!
        preview.onDidChangeMarkdown((listener = sinon.spy()))

        markdownEditor.setText('Hey!')

        await waitsFor.msg(
          '::onDidChangeMarkdown handler to be called',
          () => listener.callCount > 0,
        )
      })

      describe('when the preview is in the active pane but is not the active item', () =>
        it('re-renders the preview but does not make it active', async function () {
          const markdownEditor = atom.workspace.getActiveTextEditor()!
          const previewPane = atom.workspace.getPanes()[1]
          previewPane.activate()

          await atom.workspace.open()

          markdownEditor.setText('Hey!')

          await waitsFor(
            async () => (await previewText(preview)).indexOf('Hey!') >= 0,
          )

          expect(previewPane.isActive()).to.equal(true)
          expect(previewPane.getActiveItem()).not.to.equal(preview)
        }))

      describe('when the preview is not the active item and not in the active pane', () =>
        it('re-renders the preview and makes it active', async function () {
          const markdownEditor = atom.workspace.getActiveTextEditor()!
          const editorPane = atom.workspace.paneForItem(markdownEditor)!
          const previewPane = atom.workspace.paneForItem(preview)!
          previewPane.activate()

          const newEditor = await atom.workspace.open()

          await waitsFor(() => previewPane.getActiveItem() === newEditor)

          editorPane.activate()
          markdownEditor.setText('Hey!')

          await waitsFor(
            async () => (await previewText(preview)).indexOf('Hey!') >= 0,
          )

          expect(editorPane.isActive()).to.equal(
            true,
            'expecting editorPane to be active',
          )
          expect(previewPane.getActiveItem()).to.equal(preview)
        }))

      describe('when the liveUpdate config is set to false', () =>
        it('only re-renders the markdown when the editor is saved, not when the contents are modified', async function () {
          atom.config.set(
            'markdown-preview-plus.previewConfig.liveUpdate',
            false,
          )

          const didStopChangingHandler = sinon.spy()
          const editor = atom.workspace.getActiveTextEditor()!
          editor.getBuffer().onDidStopChanging(didStopChangingHandler)
          editor.setText('ch ch changes')

          await waitsFor(() => didStopChangingHandler.callCount > 0)

          expect(await previewText(preview)).not.to.contain('ch ch changes')
          await editor.save()

          await waitsFor(
            async () =>
              (await previewText(preview)).indexOf('ch ch changes') >= 0,
          )
        }))
    })

    describe('when a new grammar is loaded', () =>
      it('re-renders the preview', async function () {
        expect(preview.getPath()).to.equal(
          atom.workspace.getActiveTextEditor()!.getPath(),
        )
        atom.workspace.getActiveTextEditor()!.setText(`\
\`\`\`javascript
var x = y;
\`\`\`\
`)
        await waitsFor.msg(
          'markdown to be rendered after its text changed',
          async () => {
            const ed = (await previewFragment(preview)).querySelector(
              'pre.editor-colors',
            ) as HTMLElement
            return ed && ed.classList.contains('lang-javascript')
          },
        )

        let grammarAdded = false
        const disp = atom.grammars.onDidAddGrammar(() => (grammarAdded = true))

        expect(atom.packages.isPackageActive('language-javascript')).to.equal(
          false,
        )
        await atom.packages.activatePackage('language-javascript')

        await waitsFor.msg('grammar to be added', () => grammarAdded)

        await waitsFor.msg(
          'markdown to be rendered after grammar was added',
          async () => {
            const el = (await previewFragment(preview)).querySelector(
              'pre.editor-colors',
            ) as TextEditorElement
            return el && el.dataset.grammar !== 'text plain null-grammar'
          },
        )

        await atom.packages.deactivatePackage('language-javascript')
        disp.dispose()
      }))
  })

  describe('when the markdown preview view is requested by file URI', () =>
    it('opens a preview editor and watches the file for changes', async function () {
      const filePath = path.join(tempPath, 'subdir', 'file.markdown')
      await atom.workspace.open(`markdown-preview-plus://file/${filePath}`)

      preview = atom.workspace.getActivePaneItem() as any
      expect(preview.type).to.be.equal('file')

      const spy = sinonPrivateSpy<typeof preview['renderMarkdownText']>(
        preview,
        'renderMarkdownText',
      )
      await withFile(
        filePath,
        fs.readFileSync(filePath).toString('utf8'),
        async () => {
          await waitsFor.msg(
            'markdown to be re-rendered after file changed',
            () => spy.called,
          )
        },
      )
    }))

  describe("when the editor's grammar it not enabled for preview", function () {
    beforeEach(function () {
      atom.config.set('markdown-preview-plus.grammars', [])
    })
    afterEach(function () {
      atom.config.unset('markdown-preview-plus.grammars')
    })
    it('does not open the markdown preview', async function () {
      const editor = await atom.workspace.open(
        path.join(tempPath, 'subdir/file.markdown'),
      )

      const spy = sinon.spy(atom.workspace, 'open')
      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )
      expect(spy).not.to.be.called
    })
  })

  describe("when the editor's path changes", function () {
    it("updates the preview's title", async function () {
      const titleChangedCallback = sinon.spy()

      const ted = (await atom.workspace.open(
        'subdir/file.markdown',
      )) as TextEditor

      atom.commands.dispatch(
        atom.views.getView(ted),
        'markdown-preview-plus:toggle',
      )

      preview = await expectPreviewInSplitPane()

      expect(preview.getTitle()).to.equal('file.markdown Preview')
      preview.onDidChangeTitle(titleChangedCallback)
      const filePath = atom.workspace.getActiveTextEditor()!.getPath()!
      await ted.saveAs(path.join(path.dirname(filePath), 'file2.md'))

      await waitsFor(() => preview.getTitle() === 'file2.md Preview')

      expect(titleChangedCallback).to.be.called
      preview.destroy()
    })
  })

  describe('when the URI opened does not have a markdown-preview-plus protocol', () =>
    it('does not throw an error trying to decode the URI (regression)', async function () {
      await atom.workspace.open('%')
      expect(atom.workspace.getActiveTextEditor()).to.exist
    }))
})
