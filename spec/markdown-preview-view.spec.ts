import * as path from 'path'
import * as fs from 'fs'
import * as temp from 'temp'
import {
  MarkdownPreviewView,
  MarkdownPreviewViewFile,
  MarkdownPreviewViewEditor,
} from '../lib/markdown-preview-view'
import { expect } from 'chai'
import * as sinon from 'sinon'
import * as wrench from 'fs-extra'
import * as previewUtil from '../lib/markdown-preview-view/util'
import {} from 'electron'

import {
  waitsFor,
  expectPreviewInSplitPane,
  previewText,
  previewFragment,
  activateMe,
  previewHTML,
  previewHeadHTML,
  sinonPrivateSpy,
} from './util'
import { TextEditorElement, TextEditor } from 'atom'
import { PlaceholderView } from '../lib/placeholder-view'

declare module 'atom' {
  interface AtomEnvironment {
    applicationDelegate: {
      showSaveDialog(options: {}, callback: Function): void
    }
  }
}

describe('MarkdownPreviewView', function() {
  let filePath: string
  let preview: MarkdownPreviewView
  let tempPath: string
  const previews: Set<MarkdownPreviewView> = new Set()

  const createMarkdownPreviewViewFile = async function(filePath: string) {
    const mpv = new MarkdownPreviewViewFile(filePath)
    window.workspaceDiv.appendChild(mpv.element)
    previews.add(mpv)
    await mpv.renderPromise
    return mpv
  }
  const createMarkdownPreviewViewEditor = async function(editor: TextEditor) {
    const mpv = MarkdownPreviewViewEditor.create(editor)
    window.workspaceDiv.appendChild(mpv.element)
    previews.add(mpv)
    await mpv.renderPromise
    return mpv
  }

  before(async () => activateMe())
  after(async () => atom.packages.deactivatePackage('markdown-preview-plus'))

  beforeEach(async function() {
    await Promise.all([
      atom.packages.activatePackage('language-ruby'),
      atom.packages.activatePackage('language-javascript'),
    ])

    await waitsFor(() => atom.grammars.grammarForScopeName('source.ruby'))

    await waitsFor(() => atom.grammars.grammarForScopeName('source.js'))

    const fixturesPath = path.join(__dirname, 'fixtures')
    tempPath = temp.mkdirSync('atom')
    wrench.copySync(fixturesPath, tempPath)
    atom.project.setPaths([tempPath])

    filePath = path.join(tempPath, 'subdir/file.markdown')
    preview = await createMarkdownPreviewViewFile(filePath)
  })

  afterEach(async function() {
    previews.forEach((pv) => pv.destroy())
    previews.clear()
    atom.config.unset('markdown-preview-plus')
    for (const item of atom.workspace.getPaneItems()) {
      const pane = atom.workspace.paneForItem(item)
      if (pane) await pane.destroyItem(item, true)
    }
    await atom.packages.deactivatePackage('language-ruby')
    await atom.packages.deactivatePackage('language-javascript')
  })

  describe('::constructor', () =>
    it('shows an error message when there is an error', async function() {
      // tslint:disable-next-line: no-unsafe-any
      ;(preview as any).showError(new Error('Not a real file'))
      expect(await previewText(preview)).to.contain('Failed')
    }))

  describe('serialization', function() {
    let newPreview: MarkdownPreviewView

    afterEach(function() {
      newPreview.destroy()
    })

    it('recreates the preview when serialized/deserialized', async function() {
      newPreview = atom.deserializers.deserialize(
        preview.serialize(),
      ) as MarkdownPreviewView
      window.workspaceDiv.appendChild(newPreview.element)
      expect(newPreview.getPath()).to.equal(preview.getPath())
      await newPreview.renderPromise
    })

    it('does not recreate a preview when the file no longer exists', async function() {
      filePath = path.join(temp.mkdirSync('markdown-preview-'), 'foo.md')
      fs.writeFileSync(filePath, '# Hi')

      newPreview = await createMarkdownPreviewViewFile(filePath)
      const serialized = newPreview.serialize()
      fs.unlinkSync(filePath)

      const nonExistentPreview = atom.deserializers.deserialize(
        serialized,
      ) as MarkdownPreviewView
      expect(nonExistentPreview).to.not.exist
    })

    it('serializes the editor id when opened for an editor', async function() {
      preview.destroy()

      await atom.workspace.open('new.markdown')

      preview = await createMarkdownPreviewViewEditor(
        atom.workspace.getActiveTextEditor()!,
      )

      expect(preview.getPath()).to.equal(
        atom.workspace.getActiveTextEditor()!.getPath(),
      )

      const newPlaceholder = atom.deserializers.deserialize(
        preview.serialize(),
      ) as PlaceholderView
      newPreview = await waitsFor(() => newPlaceholder.getView())

      window.workspaceDiv.appendChild(newPreview.element)
      await waitsFor(() => newPreview.getPath() === preview.getPath())
      await newPreview.renderPromise
    })
  })

  describe('header rendering', function() {
    it('should render headings with and without space', async function() {
      const headlines = (await previewFragment(preview)).querySelectorAll('h2')
      expect(headlines.length).to.equal(2)
      expect(headlines[0].outerHTML).to.equal(
        '<h2>Level two header without space</h2>',
      )
      expect(headlines[1].outerHTML).to.equal(
        '<h2>Level two header with space</h2>',
      )
    })

    it('should render headings with and without space', async function() {
      atom.config.set(
        'markdown-preview-plus.markdownItConfig.useLazyHeaders',
        false,
      )

      await waitsFor(
        async () =>
          (await previewFragment(preview)).querySelectorAll('h2').length === 1,
      )
      const headlines = (await previewFragment(preview)).querySelectorAll('h2')
      expect(headlines.length).to.equal(1)
      expect(headlines[0].outerHTML).to.equal(
        '<h2>Level two header with space</h2>',
      )
    })
  })

  describe('code block conversion to pre tags', function() {
    it('removes a trailing newline but preserves remaining leading and trailing whitespace', async function() {
      const newFilePath = path.join(tempPath, 'subdir/trim-nl.md')
      const newPreview = await createMarkdownPreviewViewFile(newFilePath)

      const editor = (await previewFragment(newPreview)).querySelector(
        'pre.editor-colors',
      ) as TextEditorElement
      expect(editor).to.exist
      expect(editor.textContent).to.equal(
        ' \n     a\n    b\n   c\n  d\n e\nf\n ',
      )

      newPreview.destroy()
    })

    describe("when the code block's fence name has a matching grammar", () =>
      it('assigns the grammar on the element', async function() {
        const rubyEditor = await waitsFor(
          async () =>
            (await previewFragment(preview)).querySelector(
              'pre.editor-colors.lang-ruby',
            ) as TextEditorElement,
        )
        expect(rubyEditor).to.exist
        expect(rubyEditor.textContent).to.equal(`\
def func
  x = 1
end`)

        // nested in a list item
        const jsEditor = (await previewFragment(preview)).querySelector(
          'pre.editor-colors.lang-javascript',
        ) as TextEditorElement
        expect(jsEditor).to.exist
        expect(jsEditor.textContent).to.equal(`\
if a === 3 {
  b = 5
}`)
      }))

    describe("when the code block's fence name doesn't have a matching grammar", function() {
      it('does not assign a specific grammar', async function() {
        const plainEditor = (await previewFragment(preview)).querySelector(
          'pre.editor-colors.lang-text',
        ) as TextEditorElement
        expect(plainEditor).to.exist
        expect(plainEditor.textContent).to.equal(`\
function f(x) {
  return x++;
}`)
      })
    })

    it('ignores case of the fence name', async function() {
      const ed = await atom.workspace.open()
      ed.setText(`\
~~~JavaScript
var x = 0;
~~~
`)
      expect(
        await atom.commands.dispatch(
          atom.views.getView(ed),
          'markdown-preview-plus:toggle',
        ),
      ).to.be.ok

      const pv = await expectPreviewInSplitPane()

      // nested in a list item
      const jsEditor = await waitsFor(
        async () =>
          (await previewFragment(pv)).querySelector(
            'pre.editor-colors',
          ) as TextEditorElement,
      )
      expect(jsEditor).to.exist
      expect(jsEditor.textContent).to.equal('var x = 0;')
      expect(jsEditor.querySelector('.syntax--source.syntax--js')!.className).to
        .be.ok
    })
  })

  describe('image resolving', function() {
    describe('when the image uses a relative path', () =>
      it('resolves to a path relative to the file', async function() {
        const image = (await previewFragment(preview)).querySelector(
          'img[alt=Image1]',
        )
        expect(image!.getAttribute('src')).to.startWith(
          path.join(tempPath, 'subdir/image1.png'),
        )
      }))

    describe('when the image uses an absolute path that does not exist', () =>
      it('resolves to a path relative to the project root', async function() {
        const image = (await previewFragment(preview)).querySelector(
          'img[alt=Image2]',
        )
        expect(image!.getAttribute('src')).to.startWith(
          path.join(tempPath, 'tmp/image2.png'),
        )
      }))

    describe('when the image uses an absolute path that exists', () =>
      it('adds a query to the URL', async function() {
        preview.destroy()

        filePath = path.join(temp.mkdirSync('atom'), 'foo.md')
        fs.writeFileSync(filePath, `![absolute](${filePath})`)
        preview = await createMarkdownPreviewViewFile(filePath)

        expect(
          (await previewFragment(preview))
            .querySelector('img[alt=absolute]')!
            .getAttribute('src'),
        ).to.startWith(`${filePath}?v=`)
      }))

    describe('when the image uses a URL', function() {
      it("doesn't change the web URL", async function() {
        const image = (await previewFragment(preview)).querySelector(
          'img[alt=Image3]',
        )
        expect(image!.getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
      })

      it("doesn't change the data URL", async function() {
        const image = (await previewFragment(preview)).querySelector(
          'img[alt=Image4]',
        )
        expect(image!.getAttribute('src')).to.equal(
          'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
        )
      })
    })
  })

  describe('image modification', function() {
    let dirPath: string
    let img1Path: string

    beforeEach(function() {
      preview.destroy()

      dirPath = temp.mkdirSync('atom')
      filePath = path.join(dirPath, 'image-modification.md')
      img1Path = path.join(dirPath, 'img1.png')

      fs.writeFileSync(filePath, `![img1](${img1Path})`)
      fs.writeFileSync(img1Path, 'clearly not a png but good enough for tests')
    })

    const getImageVersion = function(
      imagePath: string,
      imageURL: string,
    ): string {
      expect(imageURL).to.startWith(`${imagePath}?v=`)
      return imageURL.split('?v=')[1]
    }

    describe('when a local image is previewed', () =>
      it('adds a timestamp query to the URL', async function() {
        const editor = await atom.workspace.open(filePath)
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()

        const imageURL = (await previewFragment(preview))
          .querySelector('img[alt=img1]')!
          .getAttribute('src')!
        const imageVer = getImageVersion(img1Path, imageURL)
        expect(imageVer).not.to.equal('deleted')
      }))

    describe('when a local image is modified during a preview #notwercker', () =>
      it('rerenders the image with a more recent timestamp query', async function() {
        let imageURL: string
        let imageVer: string

        const editor = await atom.workspace.open(filePath)
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()

        imageURL = (await previewFragment(preview))
          .querySelector('img[alt=img1]')!
          .getAttribute('src')!
        expect(imageURL).to.exist
        imageVer = getImageVersion(img1Path, imageURL)
        expect(imageVer).not.to.equal('deleted')

        fs.writeFileSync(img1Path, 'still clearly not a png ;D')

        await waitsFor.msg('image src attribute to update', async function() {
          imageURL = (await previewFragment(preview))
            .querySelector('img[alt=img1]')!
            .getAttribute('src')!
          return !imageURL.endsWith(imageVer)
        })

        const newImageVer = getImageVersion(img1Path, imageURL)
        expect(newImageVer).not.to.equal('deleted')
        expect(parseInt(newImageVer, 10)).to.be.greaterThan(
          parseInt(imageVer, 10),
        )
      }))

    describe('when three images are previewed and all are modified #notwercker', () =>
      it('rerenders the images with a more recent timestamp as they are modified', async function() {
        preview.destroy()

        const img2Path = path.join(dirPath, 'img2.png')
        const img3Path = path.join(dirPath, 'img3.png')

        fs.writeFileSync(img2Path, "i'm not really a png ;D")
        fs.writeFileSync(img3Path, 'neither am i ;D')
        fs.writeFileSync(
          filePath,
          `\
![img1](${img1Path})
![img2](${img2Path})
![img3](${img3Path})\
`,
        )

        const editor = await atom.workspace.open(filePath)
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()

        const getImageElementsURL = async () => [
          (await previewFragment(preview))
            .querySelector('img[alt=img1]')!
            .getAttribute('src')!,
          (await previewFragment(preview))
            .querySelector('img[alt=img2]')!
            .getAttribute('src')!,
          (await previewFragment(preview))
            .querySelector('img[alt=img3]')!
            .getAttribute('src')!,
        ]

        const expectQueryValues = async function(queryValues: {
          [key: string]: null | undefined | string
        }) {
          const [img1URL, img2URL, img3URL] = await getImageElementsURL()
          if (queryValues.img1 != null) {
            expect(img1URL).to.startWith(`${img1Path}?v=`)
            expect(img1URL).to.equal(`${img1Path}?v=${queryValues.img1}`)
          }
          if (queryValues.img2 != null) {
            expect(img2URL).to.startWith(`${img2Path}?v=`)
            expect(img2URL).to.equal(`${img2Path}?v=${queryValues.img2}`)
          }
          if (queryValues.img3 != null) {
            expect(img3URL).to.startWith(`${img3Path}?v=`)
            expect(img3URL).to.equal(`${img3Path}?v=${queryValues.img3}`)
          }
        }

        let [img1URL, img2URL, img3URL] = await getImageElementsURL()

        let img1Ver = getImageVersion(img1Path, img1URL!)
        let img2Ver = getImageVersion(img2Path, img2URL!)
        const img3Ver = getImageVersion(img3Path, img3URL!)

        fs.writeFileSync(img1Path, 'still clearly not a png ;D')

        await waitsFor.msg('img1 src attribute to update', async function() {
          img1URL = (await previewFragment(preview))
            .querySelector('img[alt=img1]')!
            .getAttribute('src')!
          return !img1URL.endsWith(img1Ver)
        })

        await expectQueryValues({
          img2: img2Ver,
          img3: img3Ver,
        })

        const newImg1Ver = getImageVersion(img1Path, img1URL)
        expect(newImg1Ver).not.to.equal('deleted')
        expect(parseInt(newImg1Ver, 10)).to.be.greaterThan(
          parseInt(img1Ver, 10),
        )
        img1Ver = newImg1Ver

        fs.writeFileSync(img2Path, 'still clearly not a png either ;D')

        await waitsFor.msg('img2 src attribute to update', async function() {
          img2URL = (await previewFragment(preview))
            .querySelector('img[alt=img2]')!
            .getAttribute('src')!
          return !img2URL.endsWith(img2Ver)
        })

        await expectQueryValues({
          img1: img1Ver,
          img3: img3Ver,
        })

        const newImg2Ver = getImageVersion(img2Path, img2URL)
        expect(newImg2Ver).not.to.equal('deleted')
        expect(parseInt(newImg2Ver, 10)).to.be.greaterThan(
          parseInt(img2Ver, 10),
        )
        img2Ver = newImg2Ver

        fs.writeFileSync(img3Path, "you better believe i'm not a png ;D")

        await waitsFor.msg('img3 src attribute to update', async function() {
          img3URL = (await previewFragment(preview))
            .querySelector('img[alt=img3]')!
            .getAttribute('src')!
          return !img3URL.endsWith(img3Ver)
        })

        await expectQueryValues({
          img1: img1Ver,
          img2: img2Ver,
        })

        const newImg3Ver = getImageVersion(img3Path, img3URL)
        expect(newImg3Ver).not.to.equal('deleted')
        expect(parseInt(newImg3Ver, 10)).to.be.greaterThan(
          parseInt(img3Ver, 10),
        )
      }))

    describe('when a previewed image is deleted then restored', () =>
      it('removes the query timestamp and restores the timestamp after a rerender', async function() {
        let imageURL: string
        let imageVer: string

        const editor = (await atom.workspace.open(filePath)) as TextEditor
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()

        imageURL = (await previewFragment(preview))
          .querySelector('img[alt=img1]')!
          .getAttribute('src')!
        imageVer = getImageVersion(img1Path, imageURL)
        expect(imageVer).not.to.equal('deleted')

        fs.unlinkSync(img1Path)

        await waitsFor.msg('image src attribute to update', async function() {
          imageURL = (await previewFragment(preview))
            .querySelector('img[alt=img1]')!
            .getAttribute('src')!
          return !imageURL.endsWith(imageVer)
        })

        expect(imageURL).to.equal(img1Path)
        fs.writeFileSync(
          img1Path,
          'clearly not a png but good enough for tests',
        )

        editor.setTextInBufferRange([[0, 0], [0, 0]], '')

        await waitsFor.msg('image src attribute to update', async function() {
          imageURL = (await previewFragment(preview))
            .querySelector('img[alt=img1]')!
            .getAttribute('src')!
          return imageURL !== img1Path
        })

        const newImageVer = getImageVersion(img1Path, imageURL)
        expect(parseInt(newImageVer, 10)).to.be.greaterThan(
          parseInt(imageVer, 10),
        )
      }))

    describe('when a previewed image is renamed and then restored with its original name', () =>
      it('removes the query timestamp and restores the timestamp after a rerender', async function() {
        let imageURL: string
        let imageVer: string

        const editor = (await atom.workspace.open(filePath)) as TextEditor
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()

        imageURL = (await previewFragment(preview))
          .querySelector('img[alt=img1]')!
          .getAttribute('src')!
        imageVer = getImageVersion(img1Path, imageURL)
        expect(imageVer).not.to.equal('deleted')

        fs.renameSync(img1Path, img1Path + 'trol')

        await waitsFor.msg('image src attribute to update', async function() {
          imageURL = (await previewFragment(preview))
            .querySelector('img[alt=img1]')!
            .getAttribute('src')!
          return !imageURL.endsWith(imageVer)
        })

        expect(imageURL).to.equal(img1Path)
        fs.renameSync(img1Path + 'trol', img1Path)

        editor.setTextInBufferRange([[0, 0], [0, 0]], '')

        await waitsFor.msg('image src attribute to update', async function() {
          imageURL = (await previewFragment(preview))
            .querySelector('img[alt=img1]')!
            .getAttribute('src')!
          return imageURL !== img1Path
        })

        const newImageVer = getImageVersion(img1Path, imageURL)
        expect(parseInt(newImageVer, 10)).to.be.greaterThan(
          parseInt(imageVer, 10),
        )
      }))
  })

  describe('css modification', function() {
    let dirPath: string
    let css1path: string

    beforeEach(function() {
      preview.destroy()

      dirPath = temp.mkdirSync('atom')
      filePath = path.join(dirPath, 'css-modification.md')
      css1path = path.join(dirPath, 'theme.css')

      fs.writeFileSync(
        filePath,
        '<link rel="stylesheet" type="text/css" href="theme.css"><div class="test">Test</div>',
      )
      fs.writeFileSync(css1path, '.test { text-decoration: underline; }')
    })

    const getMediaVersion = function(
      imagePath: string,
      imageURL: string,
    ): string {
      expect(imageURL).to.startWith(`${imagePath}?v=`)
      return imageURL.split('?v=')[1]
    }

    describe('when a local image is modified during a preview #notwercker', () =>
      it('rerenders the image with a more recent timestamp query', async function() {
        let mediaURL: string
        let mediaVer: string

        const editor = await atom.workspace.open(filePath)
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()

        mediaURL = (await previewFragment(preview, previewHeadHTML))
          .querySelector('link')!
          .getAttribute('href')!
        expect(mediaURL).to.exist
        mediaVer = getMediaVersion(css1path, mediaURL)
        console.log(mediaVer)
        expect(mediaVer).not.to.equal('deleted')

        expect(
          await preview.runJS<string>(
            `window.getComputedStyle(document.querySelector('div.test')).textDecoration`,
          ),
        ).to.startWith('underline ')

        fs.writeFileSync(css1path, '.test { text-decoration: none; }')

        await waitsFor.msg('link href attribute to update', async function() {
          mediaURL = (await previewFragment(preview, previewHeadHTML))
            .querySelector('link')!
            .getAttribute('href')!
          console.log(mediaURL)
          return !mediaURL.endsWith(mediaVer)
        })

        expect(
          await preview.runJS<string>(
            `window.getComputedStyle(document.querySelector('div.test')).textDecoration`,
          ),
        ).to.startWith('none ')

        const newImageVer = getMediaVersion(css1path, mediaURL)
        expect(newImageVer).not.to.equal('deleted')
        expect(parseInt(newImageVer, 10)).to.be.greaterThan(
          parseInt(mediaVer, 10),
        )
      }))
  })

  describe('gfm newlines', function() {
    describe('when gfm newlines are not enabled', () =>
      it('creates a single paragraph with <br>', async function() {
        atom.config.set(
          'markdown-preview-plus.markdownItConfig.breakOnSingleNewline',
          false,
        )

        await waitsFor(
          async () =>
            (await previewFragment(preview)).querySelectorAll('p:last-child br')
              .length === 0,
        )

        expect(
          (await previewFragment(preview)).querySelectorAll('p:last-child br')
            .length,
        ).to.equal(0)
      }))

    describe('when gfm newlines are enabled', () =>
      it('creates a single paragraph with no <br>', async function() {
        atom.config.set(
          'markdown-preview-plus.markdownItConfig.breakOnSingleNewline',
          true,
        )

        await waitsFor(
          async () =>
            (await previewFragment(preview)).querySelectorAll('p:last-child br')
              .length === 1,
        )

        expect(
          (await previewFragment(preview)).querySelectorAll('p:last-child br')
            .length,
        ).to.equal(1)
      }))
  })

  describe('when core:save-as is triggered', function() {
    beforeEach(async function() {
      filePath = path.join(tempPath, 'subdir', 'code-block.md')
      preview = (await atom.workspace.open(
        `markdown-preview-plus://file/${filePath}`,
      )) as MarkdownPreviewView
    })

    it('saves the rendered HTML and opens it', async function() {
      const outputPath = path.join(tempPath, 'subdir', 'code-block.html')
      const expectedFilePath = path.join(tempPath, 'saved-html.html')
      const expectedOutput = fs.readFileSync(expectedFilePath).toString()
      const expectedOutputArr = expectedOutput.split('\n')

      const styles = [
        'body { color: orange; }',
        'pre.editor-colors .line { color: brown; }\npre.editor-colors .number { color: cyan; }',
        'pre.editor-colors .hr { background: url(atom://markdown-preview-plus/assets/hr.png); }',
      ]

      expect(fs.existsSync(outputPath)).to.be.false

      await preview.renderPromise

      let textEditor: TextEditor
      const openedPromise = new Promise(function(resolve) {
        const disp = atom.workspace.onDidAddTextEditor(function(event) {
          textEditor = event.textEditor
          disp.dispose()
          resolve()
        })
      })

      const stubs = []
      stubs.push(
        sinon
          .stub(atom.applicationDelegate, 'showSaveDialog')
          .callsFake((_options, callback: Function) => {
            if (callback) callback(outputPath)
            return outputPath
          }),
      )
      previewUtil.__setGetStylesOverride(() => styles)
      try {
        atom.commands.dispatch(preview.element, 'core:save-as')

        await openedPromise

        expect(fs.existsSync(outputPath)).to.be.true
        expect(fs.realpathSync(textEditor!.getPath()!)).to.equal(
          fs.realpathSync(outputPath),
        )
        const savedHTML: string = textEditor!.getText()
        savedHTML.split('\n').forEach((s, i) => {
          expect(s).to.equal(expectedOutputArr[i])
        })
        expect(savedHTML).to.equal(expectedOutput)
        stubs.forEach((stub) => stub.restore())
      } finally {
        previewUtil.__setGetStylesOverride()
      }
    })
    // fs.writeFileSync(expectedFilePath, savedHTML, encoding: 'utf8')

    describe('text editor style extraction', function() {
      let extractedStyles: string[]

      const textEditorStyle = '.editor-style .extraction-test { color: blue; }'
      const replacementTextEditorStyle =
        'atom-text-editor .extraction-test { color: green; }'
      const replacementTextEditorStyleExpected =
        'pre.editor-colors .extraction-test { color: green; }'
      const unrelatedStyle = '.something else { color: red; }'

      beforeEach(function() {
        atom.styles.addStyleSheet(textEditorStyle, {
          context: 'atom-text-editor',
        })
        atom.styles.addStyleSheet(replacementTextEditorStyle, {
          context: 'atom-text-editor',
        })
        atom.styles.addStyleSheet(unrelatedStyle, {
          context: 'unrelated-context',
        })

        extractedStyles = previewUtil.getPreviewStyles('html')
      })

      it('returns an array containing atom-text-editor css style strings', function() {
        expect(extractedStyles.indexOf(textEditorStyle)).to.be.greaterThan(-1)
      })

      it('replaces atom-text-editor selector with pre.editor-colors', function() {
        expect(
          extractedStyles.indexOf(replacementTextEditorStyleExpected),
        ).to.be.greaterThan(-1)
      })

      it('does not return other styles', function() {
        expect(extractedStyles.indexOf(unrelatedStyle)).to.equal(-1)
      })
    })
  })

  describe('when core:copy is triggered', () =>
    it('writes the rendered HTML to the clipboard', async function() {
      preview.destroy()

      filePath = path.join(tempPath, 'subdir/code-block.md')
      preview = await createMarkdownPreviewViewFile(filePath)

      atom.clipboard.write('initial clipboard content')

      atom.commands.dispatch(preview.element, 'core:copy')

      await waitsFor(
        () => atom.clipboard.read() !== 'initial clipboard content',
      )

      expect(atom.clipboard.read()).to.equal(`\
<h1>Code Block</h1>
<pre class="editor-colors lang-javascript"><span><span class="syntax--source syntax--js"><span class="syntax--keyword syntax--control">if</span> a <span class="syntax--keyword syntax--operator syntax--js">===</span> <span class="syntax--constant syntax--numeric">3</span> <span class="syntax--punctuation syntax--definition syntax--function syntax--body syntax--begin syntax--bracket syntax--curly">{</span></span></span>
<span class=""><span class="syntax--source syntax--js"><span class="leading-whitespace">  </span>b <span class="syntax--keyword syntax--operator syntax--js">=</span> <span class="syntax--constant syntax--numeric">5</span></span></span>
<span class=""><span class="syntax--source syntax--js"><span class="syntax--punctuation syntax--definition syntax--function syntax--body syntax--end syntax--bracket syntax--curly">}</span></span></span></pre>
<p>encoding → issue</p>
`)
    }))

  describe('checkbox lists', function() {
    it('renders checkbox lists', async function() {
      const checkBoxes = Array.from(
        (await previewFragment(preview)).querySelectorAll(
          'input[type=checkbox]',
        ),
      ) as HTMLInputElement[]
      expect(checkBoxes).to.have.lengthOf(3)
      expect(checkBoxes[0].checked).to.be.false
      expect(checkBoxes[1].checked).to.be.true
      expect(checkBoxes[2].checked).to.be.false
      const list = checkBoxes[0].closest('ul')! as HTMLUListElement
      expect(list.childElementCount).to.be.equal(4)
      const lastItem = list.lastElementChild! as HTMLLIElement
      expect(lastItem.tagName.toLowerCase()).to.be.equal('li')
      expect(lastItem.querySelector('input[type=checkbox]')).to.be.null
    })
  })

  describe('emoji', function() {
    it('renders them', async function() {
      const emojis = Array.from(
        (await previewFragment(preview)).querySelectorAll('img.emoji'),
      ) as HTMLImageElement[]
      expect(emojis).to.have.lengthOf(11)
      for (const i of emojis) {
        const p = path.normalize(i.getAttribute('src') || '')
        expect(p.split(path.sep)).includes('twemoji')
        expect(p.split(path.sep)).includes('svg')
        expect(p.endsWith('.svg')).to.be.true
      }
    })
  })

  describe('imsize', function() {
    beforeEach(() => {
      atom.config.set('markdown-preview-plus.markdownItConfig.useImsize', true)
    })
    afterEach(() => {
      atom.config.unset('markdown-preview-plus.markdownItConfig.useImsize')
    })
    it('allows specifying image size', async function() {
      const editor = (await atom.workspace.open('nonexistent.md')) as TextEditor
      editor.setText(`![Some Image](img.png "title" =100x200)`)
      const pv = await createMarkdownPreviewViewEditor(editor)
      console.log(await previewFragment(pv))
      const [height, width, title] = await pv.runJS<[number, number, string]>(
        `{ let img = document.querySelector('img');
          [img.getAttribute('height'), img.getAttribute('width'), img.getAttribute('title')];
        }`,
      )
      expect(width).to.equal('100')
      expect(height).to.equal('200')
      expect(title).to.equal('title')
    })
  })

  describe('Critic Markup', function() {
    beforeEach(() => {
      atom.config.set(
        'markdown-preview-plus.markdownItConfig.useCriticMarkup',
        true,
      )
    })
    afterEach(() => {
      atom.config.unset(
        'markdown-preview-plus.markdownItConfig.useCriticMarkup',
      )
    })
    it('renders it', async function() {
      const pv = await createMarkdownPreviewViewFile(
        path.join(tempPath, 'subdir/criticMarkup.md'),
      )
      const html = await previewHTML(pv)
      expect(html).to.equal(
        '<p>Don’t go around saying<del> to people that</del> the' +
          ' world owes you a living. The world owes you nothing. ' +
          'It was here first. <del>One</del><ins>Only one</ins> thing ' +
          'is impossible for God: To find <ins>any</ins> sense in any ' +
          'copyright law on the planet. <mark>Truth is stranger than ' +
          'fiction</mark><span tabindex="-1" class="critic comment">' +
          '<span>strange but true</span></span>, but it is because ' +
          'Fiction is obliged to stick to possibilities; Truth isn’t.</p>\n',
      )
    })
  })

  describe('table alignment', function() {
    it('realigns table if markdown changed', async function() {
      const editor = (await atom.workspace.open('nonexistent.md')) as TextEditor
      editor.setText(`\
| Tables        |      Are      |  Cool |
|:--------------|:-------------:|------:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |
`)
      const pv = await createMarkdownPreviewViewEditor(editor)
      let ths = Array.from(
        (await previewFragment(pv)).querySelectorAll('th'),
      ) as HTMLElement[]
      expect(ths.length).to.equal(3)
      expect(ths[0].style.textAlign).to.equal('left')
      expect(ths[1].style.textAlign).to.equal('center')
      expect(ths[2].style.textAlign).to.equal('right')
      const spy = sinonPrivateSpy<typeof pv['renderMarkdown']>(
        pv,
        'renderMarkdown',
      )
      editor.setText(`\
| Tables        |      Are      |  Cool |
|:--------------|:-------------:|:------|
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |
`)
      await waitsFor(() => spy.called)
      await (spy.lastCall.returnValue as Promise<void>)
      ths = Array.from(
        (await previewFragment(pv)).querySelectorAll('th'),
      ) as HTMLElement[]
      expect(ths.length).to.equal(3)
      expect(ths[0].style.textAlign).to.equal('left')
      expect(ths[1].style.textAlign).to.equal('center')
      expect(ths[2].style.textAlign).to.equal('left')
    })
  })

  describe('Equation numbering', () => {
    describe('When numberEquations is enabled', () => {
      before(() => {
        atom.config.set(
          'markdown-preview-plus.mathConfig.numberEquations',
          true,
        )
        atom.config.set(
          'markdown-preview-plus.mathConfig.latexRenderer',
          'HTML-CSS',
        )
        atom.config.set(
          'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault',
          true,
        )
      })
      after(() => {
        atom.config.unset('markdown-preview-plus.mathConfig.numberEquations')
        atom.config.unset('markdown-preview-plus.mathConfig.latexRenderer')
        atom.config.unset(
          'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault',
        )
      })
      it('Renders equation numbers', async () => {
        const editor = (await atom.workspace.open(
          'nonexistent.md',
        )) as TextEditor
        editor.setText(`\
$$
\\begin{equation}
\\int_0^x \\sin(x) dx
\\label{eq:test}
\\end{equation}
$$

<span id="math-ref">$\\eqref{eq:test}$</span>
        `)
        const pv = await createMarkdownPreviewViewEditor(editor)
        const res = await waitsFor(async () =>
          pv.runJS<string>(`document.querySelector('#math-ref').innerText`),
        )
        expect(res).to.equal('(1)')
      })
    })
    describe('When numberEquations is disabled', () => {
      before(() => {
        atom.config.set(
          'markdown-preview-plus.mathConfig.numberEquations',
          false,
        )
        atom.config.set(
          'markdown-preview-plus.mathConfig.latexRenderer',
          'HTML-CSS',
        )
        atom.config.set(
          'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault',
          true,
        )
      })
      after(() => {
        atom.config.unset('markdown-preview-plus.mathConfig.numberEquations')
        atom.config.unset('markdown-preview-plus.mathConfig.latexRenderer')
        atom.config.unset(
          'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault',
        )
      })
      it('Renders equation numbers', async () => {
        const editor = (await atom.workspace.open(
          'nonexistent.md',
        )) as TextEditor
        editor.setText(`\
$$
\\begin{equation}
\\int_0^x \\sin(x) dx
\\label{eq:test}
\\end{equation}
$$

<span id="math-ref">$\\eqref{eq:test}$</span>
        `)
        const pv = await createMarkdownPreviewViewEditor(editor)
        const res = await waitsFor(async () =>
          pv.runJS<string>(`document.querySelector('#math-ref').innerText`),
        )
        expect(res).to.equal('(???)')
      })
    })
  })

  describe('configurable tab width', function() {
    let pv: MarkdownPreviewView
    let ed: TextEditor
    beforeEach(async function() {
      ed = (await atom.workspace.open()) as TextEditor
      ed.setText('```\ndef func():\n\treturn\n```')
      atom.grammars.assignLanguageMode(ed.getBuffer(), 'source.python')
      pv = await createMarkdownPreviewViewEditor(ed)
    })
    afterEach(async function() {
      pv.destroy()
      const pane = atom.workspace.paneForItem(ed)
      if (pane) {
        await pane.destroyItem(ed, true)
      }
    })
    async function checkTabWidth(expectedWidth: number) {
      const frag = await previewFragment(pv)
      console.log(frag)
      const tab: HTMLSpanElement | null = frag.querySelector('.hard-tab')
      if (!tab) throw new Error('No hard tab found')
      expect(tab.innerText.length).to.equal(expectedWidth)
    }
    it('by default uses 2-space tabs', async function() {
      await checkTabWidth(2)
    })
    describe('When Atom core setting changed', function() {
      before(function() {
        atom.config.set('editor.tabLength', 4)
      })
      after(function() {
        atom.config.unset('editor.tabLength')
      })
      it('respects that', async function() {
        await checkTabWidth(4)
      })
    })
    describe('When MPP setting changed', function() {
      before(function() {
        atom.config.set('markdown-preview-plus.codeTabWidth', 8)
      })
      after(function() {
        atom.config.unset('markdown-preview-plus.codeTabWidth')
      })
      it('respects that', async function() {
        await checkTabWidth(8)
      })
    })
    describe('When both settings changed', function() {
      before(function() {
        atom.config.set('editor.tabLength', 4)
        atom.config.set('markdown-preview-plus.codeTabWidth', 8)
      })
      after(function() {
        atom.config.unset('markdown-preview-plus.codeTabWidth')
        atom.config.unset('editor.tabLength')
      })
      it('MPP overrides', async function() {
        await checkTabWidth(8)
      })
    })
  })
})
