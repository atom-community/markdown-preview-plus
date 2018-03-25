import * as path from 'path'
import { MarkdownPreviewView } from '../lib/markdown-preview-view'
import * as renderer from '../lib/renderer'
import { TextEditor, TextEditorElement } from 'atom'
import { expectPreviewInSplitPane, waitsFor } from './util'
import { expect } from 'chai'
import * as sinon from 'sinon'

describe('the difference algorithm that updates the preview', function() {
  let editor: TextEditor
  let preview: MarkdownPreviewView

  before(async () => atom.packages.activatePackage(path.join(__dirname, '..')))
  after(async () => atom.packages.deactivatePackage('markdown-preview-plus'))

  beforeEach(async function() {
    await atom.workspace.open(path.join(__dirname, 'fixtures', 'sync.md'))

    editor = atom.workspace.getActiveTextEditor()!
  })

  afterEach(async function() {
    atom.config.unset('markdown-preview-plus')
    for (const item of atom.workspace.getPaneItems()) {
      const pane = atom.workspace.paneForItem(item)
      if (pane) await pane.destroyItem(item, true)
    }
  })

  async function loadPreviewInSplitPane() {
    atom.commands.dispatch(
      atom.views.getView(editor),
      'markdown-preview-plus:toggle',
    )
    preview = await expectPreviewInSplitPane()
  }

  describe('updating ordered lists start number', function() {
    let orderedLists: Element[]

    beforeEach(async function() {
      await loadPreviewInSplitPane()
      await waitsFor(async function() {
        orderedLists = Array.from(await preview.findAll('ol'))
        return orderedLists.length !== 0
      })
    })

    function expectOrderedListsToStartAt(startNumbers: string[]) {
      startNumbers.forEach((_x, i) => {
        if (startNumbers[i] === '1') {
          expect(orderedLists[i].getAttribute('start')).not.to.exist
        } else {
          expect(orderedLists[i].getAttribute('start')).to.equal(
            startNumbers[i],
          )
        }
      })
    }

    it("sets the start attribute when the start number isn't 1", async function() {
      expectOrderedListsToStartAt(['1', '1', '1', '1', '1'])

      editor.setTextInBufferRange([[35, 0], [35, 12]], '2. Ordered 1')
      await waitsFor.msg(
        '1st ordered list start attribute to update',
        () => orderedLists[0].getAttribute('start') != null,
      )
      expectOrderedListsToStartAt(['2', '1', '1', '1', '1'])

      editor.setTextInBufferRange([[148, 0], [148, 14]], '> 2. Ordered 1')
      await waitsFor.msg(
        'ordered list nested in blockquote start attribute to update',
        () => orderedLists[2].getAttribute('start') != null,
      )
      expectOrderedListsToStartAt(['2', '1', '2', '1', '1'])

      editor.setTextInBufferRange([[205, 0], [205, 14]], '  2. Ordered 1')

      await waitsFor.msg(
        'ordered list nested in unordered list start attribute to update',
        () => orderedLists[3].getAttribute('start') != null,
      )
      expectOrderedListsToStartAt(['2', '1', '2', '2', '1'])
    })

    it('removes the start attribute when the start number is changed to 1', async function() {
      editor.setTextInBufferRange([[35, 0], [35, 12]], '2. Ordered 1')
      editor.setTextInBufferRange([[148, 0], [148, 14]], '> 2. Ordered 1')
      editor.setTextInBufferRange([[205, 0], [205, 14]], '  2. Ordered 1')
      await waitsFor.msg(
        'ordered lists start attributes to update',
        () =>
          orderedLists[0].getAttribute('start') != null &&
          orderedLists[2].getAttribute('start') != null &&
          orderedLists[3].getAttribute('start') != null,
      )
      expectOrderedListsToStartAt(['2', '1', '2', '2', '1'])

      editor.setTextInBufferRange([[35, 0], [35, 12]], '1. Ordered 1')

      await waitsFor.msg(
        '1st ordered list start attribute to be removed',
        () => orderedLists[0].getAttribute('start') == null,
      )
      expectOrderedListsToStartAt(['1', '1', '2', '2', '1'])

      editor.setTextInBufferRange([[148, 0], [148, 14]], '> 1. Ordered 1')

      await waitsFor.msg(
        'ordered list nested in blockquote start attribute to be removed',
        () => orderedLists[2].getAttribute('start') == null,
      )
      expectOrderedListsToStartAt(['1', '1', '1', '2', '1'])

      editor.setTextInBufferRange([[205, 0], [205, 14]], '  1. Ordered 1')

      await waitsFor.msg(
        'ordered list nested in unordered list start attribute to be removed',
        () => orderedLists[3].getAttribute('start') == null,
      )
      expectOrderedListsToStartAt(['1', '1', '1', '1', '1'])
    })
  })

  describe('when a maths block is modified', function() {
    let mathBlocks: HTMLElement[]

    beforeEach(async function() {
      await waitsFor.msg('LaTeX rendering to be enabled', () =>
        atom.config.set(
          'markdown-preview-plus.enableLatexRenderingByDefault',
          true,
        ),
      )

      await loadPreviewInSplitPane()

      await waitsFor.msg(
        'preview to update DOM with span.math containers',
        async function() {
          mathBlocks = Array.from(
            await preview.findAll('script[type*="math/tex"]'),
          ).map((x) => x.parentElement!)
          return mathBlocks.length === 20
        },
      )

      await waitsFor.msg(
        'Maths blocks to be processed by MathJax',
        async function() {
          mathBlocks = Array.from(
            await preview.findAll('script[type*="math/tex"]'),
          ).map((x) => x.parentElement!)
          return mathBlocks.every(
            (x) =>
              !!x.querySelector('.MathJax_SVG, .MathJax, .MathJax_Display'),
          )
        },
      )
    })

    xit('replaces the entire span.math container element', async function() {
      // TODO!
      const mathjaxHelper: any = ''
      const stub = sinon
        .stub(mathjaxHelper, 'mathProcessor')
        .callsFake(function() {
          /* noop */
        })

      editor.setTextInBufferRange([[46, 0], [46, 43]], 'E=mc^2')

      await waitsFor.msg(
        'mathjaxHelper.mathProcessor to be called',
        () => stub.called,
      )
      stub.restore()

      mathBlocks = Array.from(await preview.findAll('script[type*="math/tex"]'))
        .map((x) => x.parentElement!)
        .filter((x) => x !== null)
      expect(mathBlocks.length).to.equal(20)

      const mathHTMLCSS = mathBlocks
        .map((x) => x.querySelector('.MathJax_SVG, .MathJax, .MathJax_Display'))
        .filter((x) => x !== null)
      expect(mathHTMLCSS.length).to.equal(19)

      const modMathBlock = mathBlocks[2]
      expect(modMathBlock.children.length).to.equal(1)
      expect(modMathBlock.querySelector('script')!.innerText).to.equal(
        'E=mc^2\n',
      )
    })

    xit('subsequently only rerenders the maths block that was modified', async function() {
      let unprocessedMathBlocks: HTMLElement[] = []

      // TODO!
      const mathjaxHelper: any = ''
      const stub = sinon
        .stub(mathjaxHelper, 'mathProcessor')
        .callsFake((_iframe: any, domElements: HTMLElement[]) => {
          unprocessedMathBlocks = domElements
        })

      editor.setTextInBufferRange([[46, 0], [46, 43]], 'E=mc^2')

      await waitsFor.msg(
        'mathjaxHelper.mathProcessor to be called',
        () => stub.called,
      )
      stub.restore()

      expect(unprocessedMathBlocks.length).to.equal(1)
      expect(unprocessedMathBlocks[0].tagName.toLowerCase()).to.equal('span')
      expect(unprocessedMathBlocks[0].className).to.equal('math')
      expect(unprocessedMathBlocks[0].children.length).to.equal(1)
      expect(unprocessedMathBlocks[0].children[0].textContent).to.equal(
        'E=mc^2\n',
      )
    })
  })

  describe('when a code block is modified', () =>
    xit('replaces the entire span.atom-text-editor container element', async function() {
      // TODO!
      const spy = sinon.spy(renderer as any, 'highlightCodeBlocks')

      await loadPreviewInSplitPane()

      await waitsFor.msg(
        'renderer.highlightCodeBlocks to be called',
        () => spy.called,
      )
      spy.restore()

      const f = await preview.fragment()
      const codeBlocks = Array.from(f.querySelectorAll('span.atom-text-editor'))
      expect(codeBlocks.length).to.equal(5)

      const atomTextEditors = ([] as TextEditorElement[]).concat(
        ...codeBlocks.map((x) =>
          Array.from(x.querySelectorAll('atom-text-editor')),
        ),
      )
      expect(atomTextEditors).to.have.lengthOf(5)

      // TODO!
      const stub = sinon
        .stub(renderer as any, 'highlightCodeBlocks')
        .callsFake(function() {
          /* noop */
        })
      editor.setTextInBufferRange([[24, 0], [24, 9]], 'This is a modified')

      await waitsFor.msg(
        'renderer.highlightCodeBlocks to be called',
        () => stub.called,
      )
      stub.restore()

      const f1 = await preview.fragment()
      const codeBlocks2 = Array.from(
        f1.querySelectorAll('span.atom-text-editor'),
      )
      expect(codeBlocks2.length).to.equal(5)

      const atomTextEditors2 = ([] as TextEditorElement[]).concat(
        ...codeBlocks2.map((x) =>
          Array.from(x.querySelectorAll('atom-text-editor')),
        ),
      )
      expect(atomTextEditors2.length).to.equal(4)

      const modCodeBlock = codeBlocks2[0]
      expect(modCodeBlock.children.length).to.equal(1)
      expect(modCodeBlock.children[0].tagName.toLowerCase()).to.equal('pre')
    }))
})
