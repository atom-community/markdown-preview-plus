import * as path from 'path'
import * as fs from 'fs'
import * as temp from 'temp'
import { MarkdownPreviewView } from '../lib/markdown-preview-view'
import * as markdownIt from '../lib/markdown-it-helper'
import mathjaxHelper = require('../lib/mathjax-helper')
import { expect } from 'chai'
import * as sinon from 'sinon'
import * as wrench from 'fs-extra'

import { waitsFor, expectPreviewInSplitPane } from './util'
import { TextEditorElement, TextEditor } from 'atom'

describe('MarkdownPreviewView', function() {
  let filePath: string
  let preview: MarkdownPreviewView
  let tempPath: string

  before(async () => atom.packages.activatePackage(path.join(__dirname, '..')))
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
    preview = new MarkdownPreviewView({ filePath })
    await preview.renderPromise
  })

  afterEach(async function() {
    atom.config.unset('markdown-preview-plus')
    for (const item of atom.workspace.getPaneItems()) {
      await atom.workspace.paneForItem(item)!.destroyItem(item, true)
    }
    await atom.packages.deactivatePackage('language-ruby')
    await atom.packages.deactivatePackage('language-javascript')
  })

  describe('::constructor', () =>
    it('shows an error message when there is an error', function() {
      preview.showError(new Error('Not a real file'))
      expect(preview.text()).to.contain('Failed')
    }))

  describe('serialization', function() {
    let newPreview: MarkdownPreviewView

    afterEach(function() {
      if (newPreview) newPreview.destroy()
    })

    it('recreates the preview when serialized/deserialized', async function() {
      newPreview = atom.deserializers.deserialize(
        preview.serialize(),
      ) as MarkdownPreviewView
      newPreview.element.focus()
      expect(newPreview.getPath()).to.equal(preview.getPath())
    })

    it('does not recreate a preview when the file no longer exists', function() {
      filePath = path.join(temp.mkdirSync('markdown-preview-'), 'foo.md')
      fs.writeFileSync(filePath, '# Hi')

      newPreview = new MarkdownPreviewView({ filePath })
      const serialized = newPreview.serialize()
      fs.unlinkSync(filePath)

      newPreview = atom.deserializers.deserialize(
        serialized,
      ) as MarkdownPreviewView
      expect(newPreview).to.not.exist
    })

    it('serializes the editor id when opened for an editor', async function() {
      preview.destroy()

      await atom.workspace.open('new.markdown')

      preview = new MarkdownPreviewView({
        editorId: atom.workspace.getActiveTextEditor()!.id,
      })

      expect(preview.getPath()).to.equal(
        atom.workspace.getActiveTextEditor()!.getPath(),
      )

      newPreview = atom.deserializers.deserialize(
        preview.serialize(),
      ) as MarkdownPreviewView
      await waitsFor(() => newPreview.getPath() === preview.getPath())
    })
  })

  describe('header rendering', function() {
    it('should render headings with and without space', async function() {
      await preview.renderMarkdown()

      const headlines = preview.findAll('h2')
      expect(headlines.length).to.equal(2)
      expect(headlines[0].outerHTML).to.equal(
        '<h2>Level two header without space</h2>',
      )
      expect(headlines[1].outerHTML).to.equal(
        '<h2>Level two header with space</h2>',
      )
    })

    it('should render headings with and without space', async function() {
      atom.config.set('markdown-preview-plus.useLazyHeaders', false)

      await preview.renderMarkdown()

      const headlines = preview.findAll('h2')
      expect(headlines.length).to.equal(1)
      expect(headlines[0].outerHTML).to.equal(
        '<h2>Level two header with space</h2>',
      )
    })
  })

  describe('code block conversion to atom-text-editor tags', function() {
    it('removes line decorations on rendered code blocks', function() {
      const editor = preview.find(
        "atom-text-editor[data-grammar='text plain null-grammar']",
      ) as TextEditorElement
      const decorations = editor
        .getModel()
        .getDecorations({ class: 'cursor-line', type: 'line' })
      expect(decorations.length).to.equal(0)
    })

    it('removes a trailing newline but preserves remaining leading and trailing whitespace', async function() {
      const newFilePath = path.join(tempPath, 'subdir/trim-nl.md')
      const newPreview = new MarkdownPreviewView({ filePath: newFilePath })

      await newPreview.renderMarkdown()

      const editor = newPreview.find('atom-text-editor') as TextEditorElement
      expect(editor).to.exist
      expect(editor.getModel().getText()).to.equal(`\

     a
    b
   c
  d
 e
f
\
`)

      newPreview.destroy()
    })

    describe("when the code block's fence name has a matching grammar", () =>
      it('assigns the grammar on the atom-text-editor', async function() {
        const rubyEditor = await waitsFor(
          () =>
            preview.find(
              "atom-text-editor[data-grammar='source ruby']",
            ) as TextEditorElement,
        )
        expect(rubyEditor).to.exist
        expect(rubyEditor.getModel().getText()).to.equal(`\
def func
  x = 1
end\
`)

        // nested in a list item
        const jsEditor = preview.find(
          "atom-text-editor[data-grammar='source js']",
        ) as TextEditorElement
        expect(jsEditor).to.exist
        expect(jsEditor.getModel().getText()).to.equal(`\
if a === 3 {
  b = 5
}\
`)
      }))

    describe("when the code block's fence name doesn't have a matching grammar", function() {
      it('does not assign a specific grammar', function() {
        const plainEditor = preview.find(
          "atom-text-editor[data-grammar='text plain null-grammar']",
        ) as TextEditorElement
        expect(plainEditor).to.exist
        expect(plainEditor.getModel().getText()).to.equal(`\
function f(x) {
  return x++;
}\
`)
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
        atom.commands.dispatch(
          atom.views.getView(ed),
          'markdown-preview-plus:toggle',
        ),
      ).to.be.ok

      const pv = await expectPreviewInSplitPane()

      // nested in a list item
      const jsEditor = await waitsFor(
        () => pv.find('atom-text-editor') as TextEditorElement,
      )
      expect(jsEditor).to.exist
      expect(jsEditor.getModel().getText()).to.equal('var x = 0;')
      expect(jsEditor.getModel().getGrammar().scopeName).to.equal('source.js')
    })
  })

  describe('image resolving', function() {
    let spy: sinon.SinonSpy
    beforeEach(async function() {
      spy && spy.restore()
      spy = sinon.spy(markdownIt, 'decode')
      await preview.renderMarkdown()
    })

    describe('when the image uses a relative path', () =>
      it('resolves to a path relative to the file', function() {
        const image = preview.find('img[alt=Image1]')
        expect(markdownIt.decode).to.be.called
        expect(image!.getAttribute('src')).to.startWith(
          path.join(tempPath, 'subdir/image1.png'),
        )
      }))

    describe('when the image uses an absolute path that does not exist', () =>
      it('resolves to a path relative to the project root', function() {
        const image = preview.find('img[alt=Image2]')
        expect(markdownIt.decode).to.be.called
        expect(image!.getAttribute('src')).to.startWith(
          path.join(tempPath, 'tmp/image2.png'),
        )
      }))

    describe('when the image uses an absolute path that exists', () =>
      it('adds a query to the URL', async function() {
        preview.destroy()

        filePath = path.join(temp.mkdirSync('atom'), 'foo.md')
        fs.writeFileSync(filePath, `![absolute](${filePath})`)
        preview = new MarkdownPreviewView({ filePath })

        await preview.renderMarkdown()

        expect(markdownIt.decode).to.be.called
        expect(
          preview.find('img[alt=absolute]')!.getAttribute('src'),
        ).to.startWith(`${filePath}?v=`)
      }))

    describe('when the image uses a URL', function() {
      it("doesn't change the web URL", function() {
        const image = preview.find('img[alt=Image3]')
        expect(markdownIt.decode).to.be.called
        expect(image!.getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
      })

      it("doesn't change the data URL", function() {
        const image = preview.find('img[alt=Image4]')
        expect(markdownIt.decode).to.be.called
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

        const imageURL = preview.find('img[alt=img1]')!.getAttribute('src')!
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

        imageURL = preview.find('img[alt=img1]')!.getAttribute('src')!
        expect(imageURL).to.exist
        imageVer = getImageVersion(img1Path, imageURL)
        expect(imageVer).not.to.equal('deleted')

        fs.writeFileSync(img1Path, 'still clearly not a png ;D')

        await waitsFor.msg('image src attribute to update', function() {
          imageURL = preview.find('img[alt=img1]')!.getAttribute('src')!
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

        const getImageElementsURL = () => [
          preview.find('img[alt=img1]')!.getAttribute('src')!,
          preview.find('img[alt=img2]')!.getAttribute('src')!,
          preview.find('img[alt=img3]')!.getAttribute('src')!,
        ]

        const expectQueryValues = function(queryValues: {
          [key: string]: null | undefined | string
        }) {
          const [img1URL, img2URL, img3URL] = getImageElementsURL()
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

        let [img1URL, img2URL, img3URL] = getImageElementsURL()

        let img1Ver = getImageVersion(img1Path, img1URL!)
        let img2Ver = getImageVersion(img2Path, img2URL!)
        const img3Ver = getImageVersion(img3Path, img3URL!)

        fs.writeFileSync(img1Path, 'still clearly not a png ;D')

        await waitsFor.msg('img1 src attribute to update', function() {
          img1URL = preview.find('img[alt=img1]')!.getAttribute('src')!
          return !img1URL.endsWith(img1Ver)
        })

        expectQueryValues({
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

        await waitsFor.msg('img2 src attribute to update', function() {
          img2URL = preview.find('img[alt=img2]')!.getAttribute('src')!
          return !img2URL.endsWith(img2Ver)
        })

        expectQueryValues({
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

        await waitsFor.msg('img3 src attribute to update', function() {
          img3URL = preview.find('img[alt=img3]')!.getAttribute('src')!
          return !img3URL.endsWith(img3Ver)
        })

        expectQueryValues({
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

        const editor = await atom.workspace.open(filePath)
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()

        imageURL = preview.find('img[alt=img1]')!.getAttribute('src')!
        imageVer = getImageVersion(img1Path, imageURL)
        expect(imageVer).not.to.equal('deleted')

        fs.unlinkSync(img1Path)

        await waitsFor.msg('image src attribute to update', function() {
          imageURL = preview.find('img[alt=img1]')!.getAttribute('src')!
          return !imageURL.endsWith(imageVer)
        })

        expect(imageURL).to.equal(img1Path)
        fs.writeFileSync(
          img1Path,
          'clearly not a png but good enough for tests',
        )
        await preview.renderMarkdown()

        await waitsFor.msg('image src attribute to update', function() {
          imageURL = preview.find('img[alt=img1]')!.getAttribute('src')!
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

        const editor = await atom.workspace.open(filePath)
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:toggle',
        )
        preview = await expectPreviewInSplitPane()

        imageURL = preview.find('img[alt=img1]')!.getAttribute('src')!
        imageVer = getImageVersion(img1Path, imageURL)
        expect(imageVer).not.to.equal('deleted')

        fs.renameSync(img1Path, img1Path + 'trol')

        await waitsFor.msg('image src attribute to update', function() {
          imageURL = preview.find('img[alt=img1]')!.getAttribute('src')!
          return !imageURL.endsWith(imageVer)
        })

        expect(imageURL).to.equal(img1Path)
        fs.renameSync(img1Path + 'trol', img1Path)
        await preview.renderMarkdown()

        await waitsFor.msg('image src attribute to update', function() {
          imageURL = preview.find('img[alt=img1]')!.getAttribute('src')!
          return imageURL !== img1Path
        })

        const newImageVer = getImageVersion(img1Path, imageURL)
        expect(parseInt(newImageVer, 10)).to.be.greaterThan(
          parseInt(imageVer, 10),
        )
      }))
  })

  describe('gfm newlines', function() {
    describe('when gfm newlines are not enabled', () =>
      it('creates a single paragraph with <br>', async function() {
        atom.config.set('markdown-preview-plus.breakOnSingleNewline', false)

        await preview.renderMarkdown()

        expect(preview.findAll('p:last-child br').length).to.equal(0)
      }))

    describe('when gfm newlines are enabled', () =>
      it('creates a single paragraph with no <br>', async function() {
        atom.config.set('markdown-preview-plus.breakOnSingleNewline', true)

        await preview.renderMarkdown()

        expect(preview.findAll('p:last-child br').length).to.equal(1)
      }))
  })

  describe('when core:save-as is triggered', function() {
    beforeEach(function() {
      preview.destroy()
      filePath = path.join(tempPath, 'subdir/code-block.md')
      preview = new MarkdownPreviewView({ filePath })
    })

    it('saves the rendered HTML and opens it', async function() {
      const outputPath = temp.path({ suffix: '.html' })
      const expectedFilePath = path.join(tempPath, 'saved-html.html')
      const expectedOutput = fs.readFileSync(expectedFilePath).toString()

      const createRule = (selector: string, css: string) => ({
        selectorText: selector,
        cssText: `${selector} ${css}`,
      })

      const markdownPreviewStyles = [
        {
          rules: [
            createRule('markdown-preview-plus-view', '{ color: orange; }'),
          ],
        },
        {
          rules: [
            createRule('.not-included', '{ color: green; }'),
            createRule(
              'markdown-preview-plus-view :host',
              '{ color: purple; }',
            ),
          ],
        },
      ]

      const atomTextEditorStyles = [
        'atom-text-editor .line { color: brown; }\natom-text-editor .number { color: cyan; }',
        'atom-text-editor :host .something { color: black; }',
        'atom-text-editor .hr { background: url(atom://markdown-preview-plus/assets/hr.png); }',
      ]

      expect(fs.existsSync(outputPath)).to.be.false

      await preview.renderMarkdown()

      let textEditor: TextEditor
      const openedPromise = new Promise(function(resolve) {
        const disp = atom.workspace.onDidAddTextEditor(function(event) {
          textEditor = event.textEditor
          disp.dispose()
          resolve()
        })
      })

      if (atom.getVersion() === '1.24.0') {
        sinon
          .stub((atom as any).applicationDelegate, 'showSaveDialog')
          .returns(outputPath)
      } else {
        sinon.stub(atom as any, 'showSaveDialogSync').returns(outputPath)
      }
      sinon
        .stub(preview, 'getDocumentStyleSheets')
        .returns(markdownPreviewStyles)
      sinon.stub(preview, 'getTextEditorStyles').returns(atomTextEditorStyles)
      atom.commands.dispatch(preview.element, 'core:save-as')

      await openedPromise

      expect(fs.existsSync(outputPath)).to.be.true
      expect(fs.realpathSync(textEditor!.getPath()!)).to.equal(
        fs.realpathSync(outputPath),
      )
      const savedHTML: string = textEditor!
        .getText()
        .replace(
          /<body class='markdown-preview'><div>/,
          "<body class='markdown-preview'>",
        )
        .replace(/\n<\/div><\/body>/, '</body>')
      expect(savedHTML).to.equal(expectedOutput.replace(/\r\n/g, '\n'))
    })
    // fs.writeFileSync(expectedFilePath, savedHTML, encoding: 'utf8')

    describe('text editor style extraction', function() {
      let extractedStyles: string[]

      const textEditorStyle = '.editor-style .extraction-test { color: blue; }'
      const unrelatedStyle = '.something else { color: red; }'

      beforeEach(function() {
        atom.styles.addStyleSheet(textEditorStyle, {
          context: 'atom-text-editor',
        })
        atom.styles.addStyleSheet(unrelatedStyle, {
          context: 'unrelated-context',
        })

        extractedStyles = preview.getTextEditorStyles()
      })

      it('returns an array containing atom-text-editor css style strings', function() {
        expect(extractedStyles.indexOf(textEditorStyle)).to.be.greaterThan(-1)
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
      preview = new MarkdownPreviewView({ filePath })

      await preview.renderMarkdown()

      atom.clipboard.write('initial clipboard content')

      atom.commands.dispatch(preview.element, 'core:copy')

      await waitsFor(
        () => atom.clipboard.read() !== 'initial clipboard content',
      )

      expect(atom.clipboard.read()).to.equal(`\
<h1>Code Block</h1>
<pre class="editor-colors lang-javascript"><span class="syntax--source syntax--js"><span class="syntax--keyword syntax--control syntax--js"><span>if</span></span><span> a </span><span class="syntax--keyword syntax--operator syntax--comparison syntax--js"><span>===</span></span><span> </span><span class="syntax--constant syntax--numeric syntax--decimal syntax--js"><span>3</span></span><span> </span><span class="syntax--meta syntax--brace syntax--curly syntax--js"><span>{</span></span></span>
<span class="syntax--source syntax--js"><span>  b </span><span class="syntax--keyword syntax--operator syntax--assignment syntax--js"><span>=</span></span><span> </span><span class="syntax--constant syntax--numeric syntax--decimal syntax--js"><span>5</span></span></span>
<span class="syntax--source syntax--js"><span class="syntax--meta syntax--brace syntax--curly syntax--js"><span>}</span></span></span>
</pre>
<p>encoding → issue</p>\
`)
    }))

  describe('when maths rendering is enabled by default', function() {
    it('notifies the user MathJax is loading when first preview is opened', async function() {
      preview.destroy()

      await atom.packages.activatePackage('notifications')

      const editor = await atom.workspace.open(filePath)

      mathjaxHelper.testing.resetMathJax()
      atom.config.set(
        'markdown-preview-plus.enableLatexRenderingByDefault',
        true,
      )
      atom.commands.dispatch(
        atom.views.getView(editor),
        'markdown-preview-plus:toggle',
      )

      preview = await expectPreviewInSplitPane()

      const workspaceElement = atom.views.getView(atom.workspace)

      await waitsFor.msg('notification', () =>
        workspaceElement.querySelector('atom-notification'),
      )

      const notification = workspaceElement.querySelector(
        'atom-notification.info',
      )
      expect(notification).to.exist
    })
  })

  describe('checkbox lists', function() {
    it('renders checkbox lists', function() {
      const checkBoxes = Array.from(
        preview.findAll('input[type=checkbox]'),
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
    it('renders checkbox lists', function() {
      const emojis = Array.from(
        preview.findAll('img.emoji'),
      ) as HTMLImageElement[]
      expect(emojis).to.have.lengthOf(11)
      for (const i of emojis) {
        expect(i.src).includes('file:///')
        expect(i.src).includes('/twemoji/')
        expect(i.src).includes('/svg/')
        expect(i.src).includes('.svg')
      }
    })
  })
})
