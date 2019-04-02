import * as path from 'path'
import { MarkdownPreviewView } from '../lib/markdown-preview-view'
import { TextEditor } from 'atom'
import {
  expectPreviewInSplitPane,
  waitsFor,
  previewFragment,
  activateMe,
} from './util'
import { expect } from 'chai'

describe('the difference algorithm that updates the preview', function() {
  let editor: TextEditor
  let preview: MarkdownPreviewView

  before(async () => activateMe())
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
        orderedLists = Array.from(
          (await previewFragment(preview)).querySelectorAll('ol'),
        )
        return orderedLists.length > 0
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
        async () => {
          orderedLists = Array.from(
            (await previewFragment(preview)).querySelectorAll('ol'),
          )
          return orderedLists[0].getAttribute('start') != null
        },
      )
      expectOrderedListsToStartAt(['2', '1', '1', '1', '1'])

      editor.setTextInBufferRange([[148, 0], [148, 14]], '> 2. Ordered 1')
      await waitsFor.msg(
        'ordered list nested in blockquote start attribute to update',
        async () => {
          orderedLists = Array.from(
            (await previewFragment(preview)).querySelectorAll('ol'),
          )
          return orderedLists[2].getAttribute('start') != null
        },
      )
      expectOrderedListsToStartAt(['2', '1', '2', '1', '1'])

      editor.setTextInBufferRange([[205, 0], [205, 14]], '  2. Ordered 1')

      await waitsFor.msg(
        'ordered list nested in unordered list start attribute to update',
        async () => {
          orderedLists = Array.from(
            (await previewFragment(preview)).querySelectorAll('ol'),
          )
          return orderedLists[3].getAttribute('start') != null
        },
      )
      expectOrderedListsToStartAt(['2', '1', '2', '2', '1'])
    })

    it('removes the start attribute when the start number is changed to 1', async function() {
      editor.setTextInBufferRange([[35, 0], [35, 12]], '2. Ordered 1')
      editor.setTextInBufferRange([[148, 0], [148, 14]], '> 2. Ordered 1')
      editor.setTextInBufferRange([[205, 0], [205, 14]], '  2. Ordered 1')
      await waitsFor.msg(
        'ordered lists start attributes to update',
        async () => {
          orderedLists = Array.from(
            (await previewFragment(preview)).querySelectorAll('ol'),
          )
          return (
            orderedLists[0].getAttribute('start') != null &&
            orderedLists[2].getAttribute('start') != null &&
            orderedLists[3].getAttribute('start') != null
          )
        },
      )
      expectOrderedListsToStartAt(['2', '1', '2', '2', '1'])

      editor.setTextInBufferRange([[35, 0], [35, 12]], '1. Ordered 1')

      await waitsFor.msg(
        '1st ordered list start attribute to be removed',
        async () => {
          orderedLists = Array.from(
            (await previewFragment(preview)).querySelectorAll('ol'),
          )
          return orderedLists[0].getAttribute('start') == null
        },
      )
      expectOrderedListsToStartAt(['1', '1', '2', '2', '1'])

      editor.setTextInBufferRange([[148, 0], [148, 14]], '> 1. Ordered 1')

      await waitsFor.msg(
        'ordered list nested in blockquote start attribute to be removed',
        async () => {
          orderedLists = Array.from(
            (await previewFragment(preview)).querySelectorAll('ol'),
          )
          return orderedLists[2].getAttribute('start') == null
        },
      )
      expectOrderedListsToStartAt(['1', '1', '1', '2', '1'])

      editor.setTextInBufferRange([[205, 0], [205, 14]], '  1. Ordered 1')

      await waitsFor.msg(
        'ordered list nested in unordered list start attribute to be removed',
        async () => {
          orderedLists = Array.from(
            (await previewFragment(preview)).querySelectorAll('ol'),
          )
          return orderedLists[3].getAttribute('start') == null
        },
      )
      expectOrderedListsToStartAt(['1', '1', '1', '1', '1'])
    })
  })

  describe('when a maths block is modified', function() {
    let mathBlocks: HTMLElement[]

    beforeEach(async function() {
      await waitsFor.msg('LaTeX rendering to be enabled', () =>
        atom.config.set(
          'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault',
          true,
        ),
      )

      await loadPreviewInSplitPane()

      await waitsFor.msg(
        'preview to update DOM with span.math containers',
        async function() {
          mathBlocks = Array.from(
            (await previewFragment(preview)).querySelectorAll(
              'script[type*="math/tex"]',
            ),
          ).map((x) => x.parentElement!)
          return mathBlocks.length === 20
        },
      )

      await waitsFor.msg(
        'Maths blocks to be processed by MathJax',
        async function() {
          mathBlocks = Array.from(
            (await previewFragment(preview)).querySelectorAll(
              'script[type*="math/tex"]',
            ),
          ).map((x) => x.parentElement!)
          return mathBlocks.every(
            (x) =>
              !!x.querySelector('.MathJax_SVG, .MathJax, .MathJax_Display'),
          )
        },
      )
    })

    it('replaces the entire span.math container element', async function() {
      await preview.runJS<void>(`
        window.mathSpans = document.querySelectorAll('span.math')
        `)

      editor.setTextInBufferRange([[46, 0], [46, 43]], 'E=mc^2')

      await waitsFor.msg('math span to be updated', async () =>
        preview.runJS<boolean>(`
          !window.mathSpans[2].isSameNode(document.querySelectorAll('span.math')[2])
          `),
      )

      const numMathBlocks = await preview.runJS<number>(
        `window.mathSpans.length`,
      )
      expect(numMathBlocks).to.equal(20)

      const numSameMathBlocks = await preview.runJS<number>(`{
        const newMathSpans = document.querySelectorAll('span.math')
        Array.from(window.mathSpans).filter(
          (x, i) => x.isSameNode(newMathSpans[i])
        ).length
        }`)
      expect(numSameMathBlocks).to.equal(19)

      const mathBlocks = (await previewFragment(preview)).querySelectorAll(
        'span.math',
      )
      const modMathBlock = mathBlocks[2]
      expect(modMathBlock.querySelector('script')!.innerText).to.equal(
        'E=mc^2\n',
      )
    })

    it('subsequently only rerenders the maths block that was modified', async function() {
      await preview.runJS<void>(`
        window.mathSpans = Array.from(document.querySelectorAll('span.math'))
        `)

      editor.setTextInBufferRange([[46, 0], [46, 43]], 'E=mc^2')

      await waitsFor.msg('math span to be updated', async () =>
        preview.runJS<boolean>(`
          !window.mathSpans[2].isSameNode(document.querySelectorAll('span.math')[2])
          `),
      )

      await preview.runJS<boolean>(`
          window.newMath = Array.from(document.querySelectorAll('span.math'))
          `)

      await preview.runJS<boolean>(`
          window.diffMath = window.mathSpans.filter((x, idx) => ! x.isSameNode(window.newMath[idx]))
          `)

      expect(await preview.runJS<any>(`window.diffMath.length`)).to.equal(1)
      expect(
        await preview.runJS<any>(`window.diffMath[0].tagName.toLowerCase()`),
      ).to.equal('span')
      expect(await preview.runJS<any>(`window.diffMath[0].className`)).to.equal(
        'math display-math',
      )
      expect(
        await preview.runJS<any>(
          `window.diffMath[0].querySelector('script').textContent`,
        ),
      ).to.equal('E=mc^2\n')
    })
  })

  describe('when a code block is modified', () =>
    it('updates contents and attributes', async function() {
      await loadPreviewInSplitPane()

      const f = await previewFragment(preview)
      const atomTextEditors = Array.from(
        f.querySelectorAll('pre.editor-colors'),
      )
      expect(atomTextEditors).to.have.lengthOf(5)

      await preview.runJS(`
      document.querySelectorAll('pre.editor-colors').forEach((x) => {
        x.unmodified=true
      })
      `)

      const changed = new Promise<void>((resolve) => {
        const disp = preview.onDidChangeMarkdown(() => {
          disp.dispose()
          resolve()
        })
      })

      editor.setTextInBufferRange(
        [[23, 0], [24, 9]],
        '```js\nThis is a modified',
      )

      await changed

      const [unModLen, text] = await waitsFor(async () =>
        preview.runJS<[number, string]>(`
          [Array.from(document.querySelectorAll('pre.editor-colors.lang-js')).length,
           document.querySelector('pre.editor-colors.lang-js').innerText
          ]
        `),
      )
      expect(unModLen).to.equal(1)
      expect(text.split(/\r?\n/)[0]).to.equal('This is a modified')
    }))
})
