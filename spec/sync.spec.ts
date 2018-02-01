import * as path from 'path'
import * as temp from 'temp'
import * as cson from 'season'
import * as markdownIt from '../lib/markdown-it-helper'
import mathjaxHelper = require('../lib/mathjax-helper')
import { MarkdownPreviewView } from '../lib/markdown-preview-view'
import * as sinon from 'sinon'
import { waitsFor, expectPreviewInSplitPane } from './util'
import { expect } from 'chai'
import { Token } from 'markdown-it'

temp.track()

interface MyToken {
  path: Array<{ tag: string; index: number }>
  line: number
}

describe('Syncronization of source and preview', function() {
  let preview: MarkdownPreviewView
  let fixturesPath: string
  let stub: sinon.SinonStub

  before(async () => atom.packages.activatePackage(path.join(__dirname, '..')))
  after(async () => atom.packages.deactivatePackage('markdown-preview-plus'))

  beforeEach(async function() {
    fixturesPath = path.join(__dirname, 'fixtures')

    // Redirect atom to a temp config directory
    const configDirPath = temp.mkdirSync('atom-config-dir-')
    stub = sinon.stub(atom, 'getConfigDirPath').returns(configDirPath)

    mathjaxHelper.testing.resetMathJax()

    atom.config.set('markdown-preview-plus.enableLatexRenderingByDefault', true)
    const editor = await atom.workspace.open(path.join(fixturesPath, 'sync.md'))
    const spy = sinon.spy(mathjaxHelper, 'mathProcessor')
    atom.commands.dispatch(
      atom.views.getView(editor),
      'markdown-preview-plus:toggle',
    )

    preview = await expectPreviewInSplitPane()

    await waitsFor.msg(
      'mathjaxHelper.mathProcessor to be called',
      () => spy.called,
    )
    spy.restore()

    await waitsFor.msg(
      'MathJax to load',
      () => typeof MathJax !== 'undefined' && MathJax !== null,
    )

    await waitsForQueuedMathJax()
  })

  afterEach(async function() {
    stub.restore()
    mathjaxHelper.testing.resetMathJax()

    atom.config.unset('markdown-preview-plus')
    for (const item of atom.workspace.getPaneItems()) {
      await atom.workspace.paneForItem(item)!.destroyItem(item, true)
    }
  })

  async function waitsForQueuedMathJax() {
    let done: boolean = false

    const callback = () => (done = true)
    MathJax.Hub.Queue([callback])
    await waitsFor.msg('queued MathJax operations to complete', () => done)
  }

  function findInPreview(token: MyToken) {
    let el = preview.element.querySelector('.update-preview')
    for (const element of token.path) {
      if (!el) {
        break
      }
      el = el.querySelectorAll(`:scope > ${element.tag}`)[element.index]
    }
    return el
  }

  describe('Syncronizing preview with source', function() {
    let sourceMap: MyToken[]
    let tokens: Token[]

    beforeEach(function() {
      sourceMap = cson.readFileSync(
        path.join(fixturesPath, 'sync-preview.cson'),
      ) as MyToken[]
      tokens = markdownIt.getTokens(
        atom.workspace.getActiveTextEditor()!.getText(),
        true,
      )
    })

    it('identifies the correct HTMLElement path', () => {
      for (const sourceLine of sourceMap) {
        const elementPath = preview.getPathToToken(tokens, sourceLine.line)
        elementPath.forEach((_x, i) => {
          expect(elementPath[i].tag).to.equal(sourceLine.path[i].tag)
          expect(elementPath[i].index).to.equal(sourceLine.path[i].index)
        })
      }
    })

    it('scrolls to the correct HTMLElement', () => {
      for (const sourceLine of sourceMap) {
        const element = findInPreview(sourceLine)
        if (element == null) {
          continue
        }
        const syncElement = preview.syncPreview(
          atom.workspace.getActiveTextEditor()!.getText(),
          sourceLine.line,
        )
        if (syncElement == null) {
          continue
        }
        expect(element).to.equal(syncElement)
      }
    })
  })

  describe('Syncronizing source with preview', () =>
    it('sets the editors cursor buffer location to the correct line', function() {
      const sourceMap = cson.readFileSync(
        path.join(fixturesPath, 'sync-source.cson'),
      ) as Array<MyToken>

      for (const sourceElement of sourceMap) {
        const element = findInPreview(sourceElement)
        if (!element) {
          continue
        }
        const syncLine = preview.syncSource(
          atom.workspace.getActiveTextEditor()!.getText(),
          element as HTMLElement,
        )
        if (syncLine) {
          expect(syncLine).to.equal(sourceElement.line)
        }
      }
    }))
})
