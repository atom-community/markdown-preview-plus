/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of
 * DS102: Remove unnecessary code created because of implicit s
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as path from 'path'
import * as fs from 'fs-plus'
import * as temp from 'temp'
import * as wrench from 'fs-extra'
import { MarkdownPreviewView } from '../lib/markdown-preview-view'
import * as Main from '../lib/main'

import { waitsFor, expectPreviewInSplitPane } from './util'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { TextEditor, TextEditorElement } from 'atom'

describe('Markdown preview plus package', function() {
  let workspaceElement: HTMLElement
  let preview: MarkdownPreviewView
  let tempPath: string

  beforeEach(async function() {
    const fixturesPath = path.join(__dirname, 'fixtures')
    tempPath = temp.mkdirSync('atom')
    wrench.copySync(fixturesPath, tempPath)
    atom.project.setPaths([tempPath])

    workspaceElement = atom.views.getView(atom.workspace)

    await atom.packages.activatePackage(path.join(__dirname, '..'))

    await atom.packages.activatePackage('language-gfm')
  })

  afterEach(async function() {
    atom.config.unset('markdown-preview-plus')
    for (const item of atom.workspace.getPaneItems()) {
      await atom.workspace.paneForItem(item)!.destroyItem(item, true)
    }
  })

  describe('when a preview has not been created for the file', function() {
    it('displays a markdown preview in a split pane', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/file.markdown'))
      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      preview = await expectPreviewInSplitPane()

      const [editorPane] = atom.workspace.getPanes()
      expect(editorPane.getItems()).to.have.length(1)
      expect(editorPane.isActive()).to.equal(true)
    })

    describe("when the editor's path does not exist", () =>
      it('splits the current pane to the right with a markdown preview for the file', async function() {
        await atom.workspace.open('new.markdown')
        atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
        preview = await expectPreviewInSplitPane()
      }))

    describe('when the editor does not have a path', () =>
      it('splits the current pane to the right with a markdown preview for the file', async function() {
        await atom.workspace.open('')
        atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
        preview = await expectPreviewInSplitPane()
      }))

    // https://github.com/atom/markdown-preview/issues/28
    describe('when the path contains a space', function() {
      it('renders the preview', async function() {
        await atom.workspace.open(
          path.join(tempPath, 'subdir/file with space.md'),
        )
        atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
        preview = await expectPreviewInSplitPane()
      })
    })

    // https://github.com/atom/markdown-preview/issues/29
    describe('when the path contains accented characters', function() {
      it('renders the preview', async function() {
        await atom.workspace.open(path.join(tempPath, 'subdir/áccéntéd.md'))
        atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
        preview = await expectPreviewInSplitPane()
      })
    })
  })

  describe('when a preview has been created for the file', function() {
    beforeEach(async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/file.markdown'))

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      preview = await expectPreviewInSplitPane()
    })

    it('closes the existing preview when toggle is triggered a second time on the editor and when the preview is its panes active item', function() {
      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')

      const [editorPane, previewPane] = atom.workspace.getPanes()
      expect(editorPane.isActive()).to.equal(true)
      expect(previewPane.getActiveItem()).to.be.undefined
    })

    it('activates the existing preview when toggle is triggered a second time on the editor and when the preview is not its panes active item #nottravis', async function() {
      const [editorPane, previewPane] = atom.workspace.getPanes()

      editorPane.activate()
      await atom.workspace.open(path.join(tempPath, 'subdir/simple.md'))

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')

      await waitsFor.msg(
        'second markdown preview to be created',
        () => previewPane.getItems().length === 2,
      )

      await waitsFor.msg(
        'second markdown preview to be activated',
        () => previewPane.getActiveItemIndex() === 1,
      )

      const preview1 = previewPane.getActiveItem() as MarkdownPreviewView
      expect(preview1.constructor.name).to.be.equal('MarkdownPreviewView')
      expect(preview1.getPath()).to.equal(
        (editorPane.getActiveItem() as TextEditor).getPath(),
      )
      expect(preview1.getPath()).to.equal(
        atom.workspace.getActiveTextEditor()!.getPath(),
      )

      editorPane.activate()
      editorPane.activateItemAtIndex(0)

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')

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

    it('closes the existing preview when toggle is triggered on it and it has focus', function() {
      const [, previewPane] = atom.workspace.getPanes()
      previewPane.activate()

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      expect(previewPane.getActiveItem()).to.be.undefined
    })

    describe('when the editor is modified', function() {
      it('re-renders the preview', async function() {
        const spy = sinon.spy(preview, 'showLoading')

        const markdownEditor = atom.workspace.getActiveTextEditor()!
        markdownEditor.setText('Hey!')

        await waitsFor(() => preview.text().indexOf('Hey!') >= 0)
        expect(spy).not.to.be.called
      })

      it('invokes ::onDidChangeMarkdown listeners', async function() {
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
        it('re-renders the preview but does not make it active', async function() {
          const markdownEditor = atom.workspace.getActiveTextEditor()!
          const previewPane = atom.workspace.getPanes()[1]
          previewPane.activate()

          await atom.workspace.open()

          markdownEditor.setText('Hey!')

          await waitsFor(() => preview.text().indexOf('Hey!') >= 0)

          expect(previewPane.isActive()).to.equal(true)
          expect(previewPane.getActiveItem()).not.to.equal(preview)
        }))

      describe('when the preview is not the active item and not in the active pane', () =>
        it('re-renders the preview and makes it active', async function() {
          const markdownEditor = atom.workspace.getActiveTextEditor()!
          const [editorPane, previewPane] = atom.workspace.getPanes()
          previewPane.splitRight({ copyActiveItem: true })
          previewPane.activate()

          await atom.workspace.open()

          editorPane.activate()
          markdownEditor.setText('Hey!')

          await waitsFor(() => preview.text().indexOf('Hey!') >= 0)

          expect(editorPane.isActive()).to.equal(true)
          expect(previewPane.getActiveItem()).to.equal(preview)
        }))

      describe('when the liveUpdate config is set to false', () =>
        it('only re-renders the markdown when the editor is saved, not when the contents are modified', async function() {
          atom.config.set('markdown-preview-plus.liveUpdate', false)

          const didStopChangingHandler = sinon.spy()
          const editor = atom.workspace.getActiveTextEditor()!
          editor.getBuffer().onDidStopChanging(didStopChangingHandler)
          editor.setText('ch ch changes')

          await waitsFor(() => didStopChangingHandler.callCount > 0)

          expect(preview.text()).not.to.contain('ch ch changes')
          await editor.save()

          await waitsFor(() => preview.text().indexOf('ch ch changes') >= 0)
        }))
    })

    describe('when a new grammar is loaded', () =>
      it('re-renders the preview', async function() {
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
          () => {
            const ed = preview.find('atom-text-editor') as HTMLElement
            return ed && ed.dataset.grammar === 'text plain null-grammar'
          },
        )

        let grammarAdded = false
        atom.grammars.onDidAddGrammar(() => (grammarAdded = true))

        expect(atom.packages.isPackageActive('language-javascript')).to.equal(
          false,
        )
        await atom.packages.activatePackage('language-javascript')

        await waitsFor.msg('grammar to be added', () => grammarAdded)

        await waitsFor.msg(
          'markdown to be rendered after grammar was added',
          () => {
            const el = preview.find('atom-text-editor') as TextEditorElement
            return el && el.dataset.grammar !== 'text plain null-grammar'
          },
        )
      }))
  })

  describe('when the markdown preview view is requested by file URI', () =>
    it('opens a preview editor and watches the file for changes', async function() {
      const filePath = path.join(tempPath, 'subdir/file.markdown')
      await atom.workspace.open(`markdown-preview-plus://${filePath}`)

      preview = atom.workspace.getActivePaneItem() as any
      expect(preview.constructor.name).to.be.equal('MarkdownPreviewView')

      const spy = sinon.spy(preview, 'renderMarkdownText')
      fs.writeFileSync(filePath, fs.readFileSync(filePath).toString('utf8'))

      await waitsFor.msg(
        'markdown to be re-rendered after file changed',
        () => spy.called,
      )
    }))

  describe("when the editor's grammar it not enabled for preview", function() {
    beforeEach(function() {
      atom.config.set('markdown-preview-plus.grammars', [])
    })
    afterEach(function() {
      atom.config.unset('markdown-preview-plus.grammars')
    })
    it('does not open the markdown preview', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/file.markdown'))

      const spy = sinon.spy(atom.workspace, 'open')
      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      expect(spy).not.to.be.called
    })
  })

  describe("when the editor's path changes", function() {
    it("updates the preview's title", async function() {
      const titleChangedCallback = sinon.spy()

      const ted = (await atom.workspace.open(
        'subdir/file.markdown',
      )) as TextEditor

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')

      preview = await expectPreviewInSplitPane()

      expect(preview.getTitle()).to.equal('file.markdown Preview')
      preview.onDidChangeTitle(titleChangedCallback)
      const filePath = atom.workspace.getActiveTextEditor()!.getPath()!
      if (process.platform !== 'linux') {
        fs.renameSync(filePath, path.join(path.dirname(filePath), 'file2.md'))
      } else {
        await ted.saveAs(path.join(path.dirname(filePath), 'file2.md'))
      }

      await waitsFor(() => preview.getTitle() === 'file2.md Preview')

      expect(titleChangedCallback).to.be.called
      preview.destroy()
    })
  })

  describe('when the URI opened does not have a markdown-preview-plus protocol', () =>
    it('does not throw an error trying to decode the URI (regression)', async function() {
      await atom.workspace.open('%')
      expect(atom.workspace.getActiveTextEditor()).to.exist
    }))

  describe('when markdown-preview-plus:copy-html is triggered', function() {
    let spy: sinon.SinonSpy
    beforeEach(function() {
      spy = sinon.spy(atom.clipboard, 'write')
    })
    afterEach(function() {
      spy.restore()
    })

    it('copies the HTML to the clipboard', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/simple.md'))

      atom.commands.dispatch(
        workspaceElement,
        'markdown-preview-plus:copy-html',
      )

      await waitsFor.msg(
        'atom.clipboard.write to have been called',
        () => spy.callCount === 1,
      )

      expect(atom.clipboard.read()).to.equal(`\
<p><em>italic</em></p>
<p><strong>bold</strong></p>
<p>encoding \u2192 issue</p>\
`)

      atom.workspace.getActiveTextEditor()!.setSelectedBufferRange([
        [0, 0],
        [1, 0],
      ])
      atom.commands.dispatch(
        workspaceElement,
        'markdown-preview-plus:copy-html',
      )

      await waitsFor.msg(
        'atom.clipboard.write to have been called',
        () => spy.callCount === 2,
      )

      expect(atom.clipboard.read()).to.equal(`\
<p><em>italic</em></p>\
`)
    })

    describe('code block tokenization', function() {
      const element = document.createElement('div')

      beforeEach(async function() {
        await atom.packages.activatePackage('language-ruby')

        await atom.packages.activatePackage('markdown-preview-plus')

        await atom.workspace.open(path.join(tempPath, 'subdir/file.markdown'))

        workspaceElement = atom.views.getView(atom.workspace)
        atom.commands.dispatch(
          workspaceElement,
          'markdown-preview-plus:copy-html',
        )

        await waitsFor.msg(
          'atom.clipboard.write to have been called',
          () => spy.callCount === 1,
        )

        element.innerHTML = atom.clipboard.read()
      })

      describe("when the code block's fence name has a matching grammar", function() {
        it('tokenizes the code block with the grammar', function() {
          expect(
            element.querySelector(
              'pre span.syntax--entity.syntax--name.syntax--function.syntax--ruby',
            ),
          ).to.exist
        })
      })

      describe("when the code block's fence name doesn't have a matching grammar", () =>
        it('does not tokenize the code block', function() {
          expect(
            element.querySelectorAll('pre.lang-kombucha .syntax--null-grammar')
              .length,
          ).to.equal(2)
        }))

      describe('when the code block contains empty lines', () =>
        it("doesn't remove the empty lines", function() {
          expect(
            element.querySelector('pre.lang-python')!.children.length,
          ).to.equal(6)
          expect(
            (element.querySelector(
              'pre.lang-python span:nth-child(2)',
            )! as HTMLElement).innerText.trim(),
          ).to.equal('')
          expect(
            (element.querySelector(
              'pre.lang-python span:nth-child(4)',
            )! as HTMLElement).innerText.trim(),
          ).to.equal('')
          expect(
            (element.querySelector(
              'pre.lang-python span:nth-child(5)',
            )! as HTMLElement).innerText.trim(),
          ).to.equal('')
        }))

      describe('when the code block is nested in a list', () =>
        it('detects and styles the block', () =>
          expect(
            Array.from(
              (element.querySelector('pre.lang-javascript')! as HTMLElement)
                .classList,
            ),
          ).to.contain('editor-colors')))
    })
  })

  describe('when main::copyHtml() is called directly', function() {
    let mpp: typeof Main
    let spy: sinon.SinonSpy

    beforeEach(function() {
      mpp = (atom.packages.getActivePackage('markdown-preview-plus') as any)
        .mainModule as typeof Main
      spy = sinon.spy(atom.clipboard, 'write')
    })

    afterEach(function() {
      spy.restore()
    })

    it('copies the HTML to the clipboard by default', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/simple.md'))

      await mpp.copyHtml()
      await waitsFor.msg(
        'atom.clipboard.write to have been called',
        () => spy.callCount === 1,
      )

      expect(atom.clipboard.read()).to.equal(`\
<p><em>italic</em></p>
<p><strong>bold</strong></p>
<p>encoding \u2192 issue</p>\
`)

      atom.workspace.getActiveTextEditor()!.setSelectedBufferRange([
        [0, 0],
        [1, 0],
      ])
      await mpp.copyHtml()
      await waitsFor.msg(
        'atom.clipboard.write to have been called',
        () => spy.callCount === 2,
      )

      expect(atom.clipboard.read()).to.equal(`\
<p><em>italic</em></p>\
`)
    })

    it('passes the HTML to a callback if supplied as the first argument', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/simple.md'))

      let savedHtml: string | undefined
      await mpp.copyHtml((html) => (savedHtml = html))
      await waitsFor(() => savedHtml)

      expect(savedHtml!).to.equal(`\
<p><em>italic</em></p>
<p><strong>bold</strong></p>
<p>encoding \u2192 issue</p>\
`)
      savedHtml = undefined
      atom.workspace.getActiveTextEditor()!.setSelectedBufferRange([
        [0, 0],
        [1, 0],
      ])
      await mpp.copyHtml((html) => (savedHtml = html))
      await waitsFor(() => savedHtml)

      expect(savedHtml).to.equal(`\
<p><em>italic</em></p>\
`)
    })

    describe('when LaTeX rendering is enabled by default', function() {
      beforeEach(async function() {
        await waitsFor.msg('LaTeX rendering to be enabled', () =>
          atom.config.set(
            'markdown-preview-plus.enableLatexRenderingByDefault',
            true,
          ),
        )

        await atom.workspace.open(path.join(tempPath, 'subdir/simple.md'))

        atom.workspace.getActiveTextEditor()!.setText('$$\\int_3^4$$')
      })

      it("copies the HTML with maths blocks as svg's to the clipboard by default", async function() {
        await mpp.copyHtml()

        await waitsFor.msg(
          'atom.clipboard.write to have been called',
          () => spy.callCount === 1,
        )

        const clipboard = atom.clipboard.read()
        expect(clipboard.match(/MathJax\_SVG\_Hidden/)!.length).to.equal(1)
        expect(clipboard.match(/class\=\"MathJax\_SVG\"/)!.length).to.equal(1)
      })

      it("scales the svg's if the scaleMath parameter is passed", async function() {
        await mpp.copyHtml(undefined, 200)

        await waitsFor.msg(
          'atom.clipboard.write to have been called',
          () => spy.callCount === 1,
        )

        const clipboard = atom.clipboard.read()
        expect(clipboard.match(/font\-size\: 200%/)!.length).to.equal(1)
      })

      it('passes the HTML to a callback if supplied as the first argument', async function() {
        let html: string
        await mpp.copyHtml((proHTML) => (html = proHTML))

        await waitsFor.msg(
          'markdown to be parsed and processed by MathJax',
          () => html,
        )

        expect(html!.match(/MathJax\_SVG\_Hidden/)!.length).to.equal(1)
        expect(html!.match(/class\=\"MathJax\_SVG\"/)!.length).to.equal(1)
      })
    })
  })

  describe('sanitization', function() {
    it('removes script tags and attributes that commonly contain inline scripts', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/evil.md'))

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      preview = await expectPreviewInSplitPane()

      expect(preview.find('div.update-preview')!.innerHTML).to.equal(`\
<p>hello</p>


<p>sad
<img>
world</p>\
`)
    })

    it('remove the first <!doctype> tag at the beginning of the file', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/doctype-tag.md'))

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      preview = await expectPreviewInSplitPane()

      expect(preview.find('div.update-preview')!.innerHTML).to.equal(`\
<p>content
&lt;!doctype html&gt;</p>\
`)
    })
  })

  describe('when the markdown contains an <html> tag', () =>
    it('does not throw an exception', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/html-tag.md'))

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      preview = await expectPreviewInSplitPane()

      expect(preview.find('div.update-preview')!.innerHTML).to.equal('content')
    }))

  describe('when the markdown contains a <pre> tag', () =>
    it('does not throw an exception', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/pre-tag.md'))

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      preview = await expectPreviewInSplitPane()

      expect(preview.find('atom-text-editor')).to.exist
    }))

  // WARNING If focus is given to this spec alone your `config.cson` may be
  // overwritten. Please ensure that you have yours backed up :D
  describe('GitHub style markdown preview', function() {
    beforeEach(() =>
      atom.config.set('markdown-preview-plus.useGitHubStyle', false),
    )

    it('renders markdown using the default style when GitHub styling is disabled', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/simple.md'))

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      preview = await expectPreviewInSplitPane()

      expect(preview.element.getAttribute('data-use-github-style')).not.to.exist
    })

    it('renders markdown using the GitHub styling when enabled', async function() {
      atom.config.set('markdown-preview-plus.useGitHubStyle', true)

      await atom.workspace.open(path.join(tempPath, 'subdir/simple.md'))

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      preview = await expectPreviewInSplitPane()

      expect(preview.element.getAttribute('data-use-github-style')).to.equal('')
    })

    it('updates the rendering style immediately when the configuration is changed', async function() {
      await atom.workspace.open(path.join(tempPath, 'subdir/simple.md'))

      atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle')
      preview = await expectPreviewInSplitPane()

      expect(preview.element.getAttribute('data-use-github-style')).not.to.exist

      atom.config.set('markdown-preview-plus.useGitHubStyle', true)
      expect(preview.element.getAttribute('data-use-github-style')).to.exist

      atom.config.set('markdown-preview-plus.useGitHubStyle', false)
      expect(preview.element.getAttribute('data-use-github-style')).not.to.exist
    })
  })
})
