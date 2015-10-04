path                = require 'path'
MarkdownPreviewView = require '../lib/markdown-preview-view'
mathjaxHelper       = require '../lib/mathjax-helper'
renderer            = require '../lib/renderer'

describe "the difference algorithm that updates the preview", ->
  [editor, preview, workspaceElement] = []

  beforeEach ->
    jasmine.useRealClock()
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM workspaceElement

    waitsForPromise ->
      atom.packages.activatePackage("markdown-preview-plus")

    waitsForPromise ->
      atom.workspace.open path.join(__dirname, 'fixtures', 'sync.md')

    runs ->
      editor = atom.workspace.getPanes()[0].getActiveItem()

  afterEach ->
    preview.destroy()

  loadPreviewInSplitPane = ->
    runs ->
      atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expect(atom.workspace.getPanes()).toHaveLength 2

    waitsFor "markdown preview to be created", ->
      preview = atom.workspace.getPanes()[1].getActiveItem()

    runs ->
      expect(preview).toBeInstanceOf(MarkdownPreviewView)
      expect(preview.getPath()).toBe atom.workspace.getActivePaneItem().getPath()

  describe "updating ordered lists start number", ->
    [orderedLists] = []

    beforeEach ->
      loadPreviewInSplitPane()
      runs -> orderedLists = preview.find('ol')

    expectOrderedListsToStartAt = (startNumbers) ->
      runs ->
        for i in [0..(startNumbers.length-1)]
          if startNumbers[i] is "1"
          then expect(orderedLists[i].getAttribute('start')).not.toExist()
          else expect(orderedLists[i].getAttribute('start')).toBe(startNumbers[i])
        return

    it "sets the start attribute when the start number isn't 1", ->
      expectOrderedListsToStartAt ["1", "1", "1", "1", "1"]

      runs -> editor.setTextInBufferRange([[35, 0], [35, 12]], "2. Ordered 1")
      waitsFor "1st ordered list start attribute to update", ->
        orderedLists[0].getAttribute('start')?
      expectOrderedListsToStartAt ["2", "1", "1", "1", "1"]

      runs -> editor.setTextInBufferRange([[148, 0], [148, 14]], "> 2. Ordered 1")
      waitsFor "ordered list nested in blockquote start attribute to update", ->
        orderedLists[2].getAttribute('start')?
      expectOrderedListsToStartAt ["2", "1", "2", "1", "1"]

      runs -> editor.setTextInBufferRange([[205, 0], [205, 14]], "  2. Ordered 1")
      waitsFor "ordered list nested in unordered list start attribute to update", ->
        orderedLists[3].getAttribute('start')?
      expectOrderedListsToStartAt ["2", "1", "2", "2", "1"]

    it "removes the start attribute when the start number is changed to 1", ->
      editor.setTextInBufferRange([[35, 0], [35, 12]], "2. Ordered 1")
      editor.setTextInBufferRange([[148, 0], [148, 14]], "> 2. Ordered 1")
      editor.setTextInBufferRange([[205, 0], [205, 14]], "  2. Ordered 1")
      waitsFor "ordered lists start attributes to update", ->
        orderedLists[0].getAttribute('start')? and
        orderedLists[2].getAttribute('start')? and
        orderedLists[3].getAttribute('start')?
      expectOrderedListsToStartAt ["2", "1", "2", "2", "1"]

      runs -> editor.setTextInBufferRange([[35, 0], [35, 12]], "1. Ordered 1")
      waitsFor "1st ordered list start attribute to be removed", ->
        not orderedLists[0].getAttribute('start')?
      expectOrderedListsToStartAt ["1", "1", "2", "2", "1"]

      runs -> editor.setTextInBufferRange([[148, 0], [148, 14]], "> 1. Ordered 1")
      waitsFor "ordered list nested in blockquote start attribute to be removed", ->
        not orderedLists[2].getAttribute('start')?
      expectOrderedListsToStartAt ["1", "1", "1", "2", "1"]

      runs -> editor.setTextInBufferRange([[205, 0], [205, 14]], "  1. Ordered 1")
      waitsFor "ordered list nested in unordered list start attribute to be removed", ->
        not orderedLists[3].getAttribute('start')?
      expectOrderedListsToStartAt ["1", "1", "1", "1", "1"]

  describe "when a maths block is modified", ->
    [mathBlocks] = []

    beforeEach ->
      waitsFor "LaTeX rendering to be enabled", ->
        atom.config.set 'markdown-preview-plus.enableLatexRenderingByDefault', true

      loadPreviewInSplitPane()

      waitsFor "MathJax to load", ->
        MathJax?

      waitsFor "preview to update DOM with span.math containers", ->
        mathBlocks = preview.find('script[type*="math/tex"]').parent()
        mathBlocks.length is 20

      waitsFor "Maths blocks to be processed by MathJax", ->
        mathBlocks = preview.find('script[type*="math/tex"]').parent()
        mathBlocks.children('span.MathJax, div.MathJax_Display').not('.MathJax_Processing').length is 20

    afterEach ->
      mathjaxHelper.resetMathJax()

    it "replaces the entire span.math container element", ->
      spyOn(mathjaxHelper, 'mathProcessor').andCallFake -> return

      runs -> editor.setTextInBufferRange([[46, 0], [46, 43]], "E=mc^2")

      waitsFor "mathjaxHelper.mathProcessor to be called", ->
        mathjaxHelper.mathProcessor.calls.length

      runs ->
        mathBlocks  = preview.find('script[type*="math/tex"]').parent()
        expect(mathBlocks.length).toBe(20)

        mathHTMLCSS = mathBlocks.children('span.MathJax, div.MathJax_Display')
        expect(mathHTMLCSS.length).toBe(19)

        modMathBlock = mathBlocks.eq(2)
        expect(modMathBlock.children().length).toBe(1)
        expect(modMathBlock.children('script').text()).toBe("E=mc^2\n")

    it "subsequently only rerenders the maths block that was modified", ->
      [unprocessedMathBlocks] = []

      spyOn(mathjaxHelper, 'mathProcessor').andCallFake (domElements) ->
        unprocessedMathBlocks = domElements

      runs -> editor.setTextInBufferRange([[46, 0], [46, 43]], "E=mc^2")

      waitsFor "mathjaxHelper.mathProcessor to be called", ->
        mathjaxHelper.mathProcessor.calls.length

      runs ->
        expect(unprocessedMathBlocks.length).toBe(1)
        expect(unprocessedMathBlocks[0].tagName.toLowerCase()).toBe('span')
        expect(unprocessedMathBlocks[0].className).toBe('math')
        expect(unprocessedMathBlocks[0].children.length).toBe(1)
        expect(unprocessedMathBlocks[0].children[0].textContent).toBe("E=mc^2\n")

  describe "when a code block is modified", ->
    it "replaces the entire span.atom-text-editor container element", ->
      loadPreviewInSplitPane()

      runs ->
        codeBlocks = preview.find('span.atom-text-editor')
        expect(codeBlocks.length).toBe(5)
        expect(codeBlocks.children().length).toBe(5)

        atomTextEditors = codeBlocks.children('atom-text-editor')
        expect(atomTextEditors.length).toBe(5)

        spyOn(renderer, 'convertCodeBlocksToAtomEditors').andCallFake -> return
        editor.setTextInBufferRange([[24, 0], [24, 9]], "This is a modified")

      waitsFor "renderer.convertCodeBlocksToAtomEditors to be called", ->
        renderer.convertCodeBlocksToAtomEditors.calls.length

      runs ->
        codeBlocks = preview.find('span.atom-text-editor')
        expect(codeBlocks.length).toBe(5)
        expect(codeBlocks.children().length).toBe(5)

        atomTextEditors = codeBlocks.children('atom-text-editor')
        expect(atomTextEditors.length).toBe(4)

        modCodeBlock = codeBlocks.eq(0)
        expect(modCodeBlock.children().length).toBe(1)
        expect(modCodeBlock.children().prop('tagName').toLowerCase()).toBe('pre')
