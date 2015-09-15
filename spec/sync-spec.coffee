{$}           = require 'atom-space-pen-views'
path          = require 'path'
temp          = require('temp').track()
cson          = require 'season'
markdownIt    = require '../lib/markdown-it-helper'
mathjaxHelper = require '../lib/mathjax-helper'
MarkdownPreviewView = require '../lib/markdown-preview-view'

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
    runs ->
      expect(atom.workspace.getPanes()).toHaveLength 2

    waitsFor "markdown preview to be created", ->
      preview = atom.workspace.getPanes()[1].getActiveItem()

    runs ->
      expect(preview).toBeInstanceOf(MarkdownPreviewView)
      expect(preview.getPath()).toBe atom.workspace.getActivePaneItem().getPath()

  waitsForQueuedMathJax = ->
    [done] = []

    callback = -> done = true
    runs -> MathJax.Hub.Queue [callback]
    waitsFor "queued MathJax operations to complete", -> done

  generateSelector = (token) ->
    selector = null
    for element in token.path
      if selector is null
      then selector = ".update-preview > #{element.tag}:eq(#{element.index})"
      else selector = "#{selector} > #{element.tag}:eq(#{element.index})"
    return selector

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
        selector = generateSelector(sourceLine)
        if selector? then element = preview.find(selector)[0] else continue
        syncElement = preview.syncPreview preview.editor.getText(), sourceLine.line
        expect(element).toBe(syncElement)

  describe "Syncronizing source with preview", ->
    it "sets the editors cursor buffer location to the correct line", ->
      sourceMap = cson.readFileSync path.join(fixturesPath, 'sync-source.cson')

      for sourceElement in sourceMap
        selector = generateSelector(sourceElement)
        if selector? then element = preview.find(selector)[0] else continue
        syncLine = preview.syncSource preview.editor.getText(), element
        expect(syncLine).toBe(sourceElement.line) if syncLine
