path          = require 'path'
MarkdownPreviewView = require '../lib/markdown-preview-view'

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
      atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'

    expectPreviewInSplitPane()

  afterEach ->
    preview.destroy()

  expectPreviewInSplitPane = ->
    runs ->
      expect(atom.workspace.getPanes()).toHaveLength 2

    waitsFor "markdown preview to be created", ->
      preview = atom.workspace.getPanes()[1].getActiveItem()

    runs ->
      expect(preview).toBeInstanceOf(MarkdownPreviewView)
      expect(preview.getPath()).toBe atom.workspace.getActivePaneItem().getPath()

  describe "updating ordered lists start number", ->
    [orderedLists] = []

    beforeEach ->
      orderedLists = preview.find('ol')

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
