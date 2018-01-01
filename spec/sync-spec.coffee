path          = require 'path'
temp          = require('temp').track()
cson          = require 'season'
markdownIt    = require '../lib/markdown-it-helper'
mathjaxHelper = require '../lib/mathjax-helper'
{MarkdownPreviewView} = require '../lib/markdown-preview-view'

describe "Syncronization of source and preview", ->
  [preview, workspaceElement, fixturesPath] = []

  beforeEach ->
    fixturesPath = path.join(__dirname, 'fixtures')

    # Setup Jasmine environment
    jasmine.useRealClock() # MathJax queue's will NOT work without this
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM workspaceElement

    # Redirect atom to a temp config directory
    configDirPath = temp.mkdirSync('atom-config-dir-')
    spyOn(atom, 'getConfigDirPath').andReturn configDirPath

    mathjaxHelper.resetMathJax()

    waitsForPromise ->
      atom.packages.activatePackage("markdown-preview-plus")

    waitsFor "LaTeX rendering to be enabled", ->
      atom.config.set 'markdown-preview-plus.enableLatexRenderingByDefault', true

    waitsForPromise ->
      atom.workspace.open path.join(fixturesPath, 'sync.md')

    runs ->
      spyOn(mathjaxHelper, 'mathProcessor').andCallThrough()
      atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'

    expectPreviewInSplitPane()

    waitsFor "mathjaxHelper.mathProcessor to be called", ->
      mathjaxHelper.mathProcessor.calls.length

    waitsFor "MathJax to load", ->
      MathJax?

    waitsForQueuedMathJax()

  afterEach ->
    preview.destroy()
    mathjaxHelper.resetMathJax()

  expectPreviewInSplitPane = ->
    waitsFor ->
      atom.workspace.getCenter().getPanes().length is 2

    waitsFor "markdown preview to be created", ->
      preview = atom.workspace.getCenter().getPanes()[1].getActiveItem()

    runs ->
      expect(preview).toBeInstanceOf(MarkdownPreviewView)
      expect(preview.getPath()).toBe atom.workspace.getActivePaneItem().getPath()

  waitsForQueuedMathJax = ->
    [done] = []

    callback = -> done = true
    runs -> MathJax.Hub.Queue [callback]
    waitsFor "queued MathJax operations to complete", -> done

  findInPreview = (token) ->
    el = preview.element.querySelector('.update-preview')
    for element in token.path
      el = el.querySelectorAll(":scope > #{element.tag}")[element.index]
      break unless el
    return el

  describe "Syncronizing preview with source", ->
    [sourceMap, tokens] = []

    beforeEach ->
      sourceMap = cson.readFileSync path.join(fixturesPath, 'sync-preview.cson')
      tokens = markdownIt.getTokens preview.editor.getText(), true

    it "identifies the correct HTMLElement path", ->
      for sourceLine in sourceMap
        elementPath = preview.getPathToToken tokens, sourceLine.line
        for i in [0..(elementPath.length-1)] by 1
          expect(elementPath[i].tag).toBe(sourceLine.path[i].tag)
          expect(elementPath[i].index).toBe(sourceLine.path[i].index)

    it "scrolls to the correct HTMLElement", ->
      for sourceLine in sourceMap
        element = findInPreview(sourceLine)
        continue unless element?
        syncElement = preview.syncPreview preview.editor.getText(), sourceLine.line
        continue unless syncElement?
        expect(element).toBe(syncElement)
        console.debug(element, syncElement, preview.editor.getBuffer().getLines()[sourceLine.line]) if element isnt syncElement

  describe "Syncronizing source with preview", ->
    it "sets the editors cursor buffer location to the correct line", ->
      sourceMap = cson.readFileSync path.join(fixturesPath, 'sync-source.cson')

      for sourceElement in sourceMap
        element = findInPreview(sourceElement)
        continue unless element
        syncLine = preview.syncSource preview.editor.getText(), element
        expect(syncLine).toBe(sourceElement.line) if syncLine
