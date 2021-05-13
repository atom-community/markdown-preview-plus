import * as path from 'path'
import * as fs from 'fs'
import * as temp from 'temp'
import * as yaml from 'yaml'
import { MarkdownItWorker } from '../src/markdown-it-helper'
import { MarkdownPreviewView } from '../src/markdown-preview-view'
import {
  waitsFor,
  expectPreviewInSplitPane,
  previewFragment,
  activateMe,
  sinonPrivateSpy,
} from './util'
import { expect } from 'chai'
import * as previewUtil from '../src/markdown-preview-view/util'
import {} from 'electron'

temp.track()

interface MyToken {
  path: Array<{ tag: string; index: number }>
  line: number
}

describe('Syncronization of source and preview', function () {
  let preview: MarkdownPreviewView
  let fixturesPath: string

  before(async () => activateMe())
  after(async () => atom.packages.deactivatePackage('markdown-preview-plus'))

  beforeEach(async function () {
    fixturesPath = path.join(__dirname, 'fixtures')

    atom.config.set(
      'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault',
      true,
    )
    const editor = await atom.workspace.open(path.join(fixturesPath, 'sync.md'))
    atom.commands.dispatch(
      atom.views.getView(editor),
      'markdown-preview-plus:toggle',
    )

    preview = await expectPreviewInSplitPane()

    await waitsFor.msg(
      'MathJax to finish processing',
      async () =>
        (
          await previewFragment(preview)
        ).querySelector('.MathJax_SVG_Display') != null,
    )
  })

  afterEach(async function () {
    atom.config.unset('markdown-preview-plus')
    for (const item of atom.workspace.getPaneItems()) {
      const pane = atom.workspace.paneForItem(item)
      if (pane) await pane.destroyItem(item, true)
    }
  })

  function findInPreview(token: MyToken) {
    expect(preview.element).not.to.be.undefined
    let el = preview.element!.querySelector('.update-preview')
    for (const element of token.path) {
      if (!el) {
        break
      }
      el = el.querySelectorAll(`:scope > ${element.tag}`)[element.index]
    }
    return el
  }

  describe('Syncronizing preview with source', function () {
    let sourceMap: MyToken[]
    let tokens: string

    beforeEach(async function () {
      sourceMap = yaml.parse(
        fs.readFileSync(path.join(fixturesPath, 'sync-preview.yaml'), {
          encoding: 'utf-8',
        }),
      ) as MyToken[]
      tokens = await MarkdownItWorker.getTokens(
        atom.workspace.getActiveTextEditor()!.getText(),
        true,
      )
    })

    it('identifies the correct HTMLElement path', () => {
      const elementPaths = previewUtil.buildLineMap(tokens)
      //////////////////////////////////////////////////////
      // const out = []
      // for (const [line, path] of Object.entries(elementPaths)) {
      //   out.push({ line: parseInt(line as any, 10), path })
      // }
      // const doc = new yaml.Document()
      // doc.setSchema()
      // doc.contents = doc.schema!.createNode(out)
      // console.log(doc.toString())
      //////////////////////////////////////////////////////
      for (const sourceLine of sourceMap) {
        if (sourceLine.path.length === 0) continue
        const elementPath = elementPaths[sourceLine.line]
        elementPath.forEach((_x, i) => {
          expect(elementPath[i].tag).to.equal(
            sourceLine.path[i].tag,
            `On line ${sourceLine.line} expected tag at ${i} to match`,
          )
          expect(elementPath[i].index).to.equal(
            sourceLine.path[i].index,
            `On line ${sourceLine.line} expected index at ${i} to match`,
          )
        })
      }
    })

    it('scrolls to the correct HTMLElement', () => {
      for (const sourceLine of sourceMap) {
        const element = findInPreview(sourceLine)
        if (element == null) {
          continue
        }
        const editor = atom.workspace.getActiveTextEditor()!
        editor.setCursorBufferPosition([sourceLine.line, 0])
        const spy = sinonPrivateSpy<typeof preview['syncPreview']>(
          preview,
          'syncPreview',
        )
        atom.commands.dispatch(
          atom.views.getView(editor),
          'markdown-preview-plus:sync-preview',
        )
        const syncElement = spy.lastCall.returnValue
        if (syncElement == null) {
          continue
        }
        expect(element).to.equal(syncElement)
      }
    })
  })

  describe('Syncronizing source with preview', () =>
    it('sets the editors cursor buffer location to the correct line', function () {
      const sourceMap = yaml.parse(
        fs.readFileSync(path.join(fixturesPath, 'sync-source.yaml'), {
          encoding: 'utf-8',
        }),
      ) as Array<MyToken>

      for (const sourceElement of sourceMap) {
        const element = findInPreview(sourceElement)
        if (!element) {
          continue
        }
        expect(preview.element).not.to.be.undefined
        atom.commands.dispatch(
          preview.element!,
          'markdown-preview-plus:sync-source',
        )
        const syncLine = atom.workspace
          .getActiveTextEditor()!
          .getLastCursor()
          .getBufferRow()
        if (syncLine) {
          expect(syncLine).to.equal(sourceElement.line)
        }
      }
    }))
})
