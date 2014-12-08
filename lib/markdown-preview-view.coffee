path = require 'path'

{$, $$$, ScrollView} = require 'atom'
_ = require 'underscore-plus'
fs = require 'fs-plus'
{File} = require 'pathwatcher'

renderer = require './renderer'
UpdatePreview = require './update-preview'

module.exports =
class MarkdownPreviewView extends ScrollView
  @content: ->
    @div class: 'markdown-preview native-key-bindings', tabindex: -1, =>
      # If you dont explicitly declare a class then the elements wont be created
      @div class: 'update-preview'

  constructor: ({@editorId, @filePath}) ->
    @updatePreview  = null
    @renderLaTeX    = atom.config.get 'markdown-preview-plus.enableLatexRenderingByDefault'
    super

  afterAttach: ->
    return if @attached

    @attached = true
    if @editorId?
      @resolveEditor(@editorId)
    else
      if atom.workspace? and atom.workspaceView?
        @subscribeToFilePath(@filePath)
      else
        @subscribe atom.packages.once 'activated', =>
          @subscribeToFilePath(@filePath)

  beforeRemove: ->
    @attached = false

  serialize: ->
    deserializer: 'MarkdownPreviewView'
    filePath: @getPath()
    editorId: @editorId

  destroy: ->
    @unsubscribe()

  subscribeToFilePath: (filePath) ->
    @file = new File(filePath)
    @trigger 'title-changed'
    @handleEvents()
    @renderMarkdown()

  resolveEditor: (editorId) ->
    resolve = =>
      @editor = @editorForId(editorId)

      if @editor?
        @trigger 'title-changed' if @editor?
        @handleEvents()
        @renderMarkdown()
      else
        # The editor this preview was created for has been closed so close
        # this preview since a preview cannot be rendered without an editor
        @parents('.pane').view()?.destroyItem(this)

    if atom.workspace? and atom.workspaceView?
      resolve()
    else
      @subscribe atom.packages.once('activated', resolve)

  editorForId: (editorId) ->
    for editor in atom.workspace.getEditors()
      return editor if editor.id?.toString() is editorId.toString()
    null

  handleEvents: ->
    @subscribe atom.syntax, 'grammar-added grammar-updated', _.debounce((=> @renderMarkdown()), 250)
    @subscribe this, 'core:move-up', => @scrollUp()
    @subscribe this, 'core:move-down', => @scrollDown()
    @subscribe this, 'core:save-as', =>
      @saveAs()
      false
    @subscribe this, 'core:copy', =>
      return false if @copyToClipboard()

    @subscribeToCommand atom.workspaceView, 'markdown-preview-plus:zoom-in', =>
      zoomLevel = parseFloat(@css('zoom')) or 1
      @css('zoom', zoomLevel + .1)

    @subscribeToCommand atom.workspaceView, 'markdown-preview-plus:zoom-out', =>
      zoomLevel = parseFloat(@css('zoom')) or 1
      @css('zoom', zoomLevel - .1)

    @subscribeToCommand atom.workspaceView, 'markdown-preview-plus:reset-zoom', =>
      @css('zoom', 1)

    changeHandler = =>
      @renderMarkdown()

      # TODO: Remove paneForUri call when ::paneForItem is released
      pane = atom.workspace.paneForItem?(this) ? atom.workspace.paneForUri(@getUri())
      if pane? and pane isnt atom.workspace.getActivePane()
        pane.activateItem(this)

    if @file?
      @subscribe(@file, 'contents-changed', changeHandler)
    else if @editor?
      @subscribe @editor.getBuffer(), 'contents-modified', =>
        changeHandler() if atom.config.get 'markdown-preview-plus.liveUpdate'
      @subscribe @editor, 'path-changed', => @trigger 'title-changed'
      @subscribe @editor.getBuffer(), 'reloaded saved', =>
        changeHandler() unless atom.config.get 'markdown-preview-plus.liveUpdate'

    @subscribe atom.config.observe 'markdown-preview-plus.breakOnSingleNewline', callNow: false, changeHandler

    @subscribeToCommand atom.workspaceView, 'markdown-preview-plus:toggle-render-latex', () =>
      if (atom.workspaceView.getActiveView() is @) or (atom.workspace.getActiveTextEditor() is @editor)
        @renderLaTeX = !@renderLaTeX
        @renderMarkdown()
      return

  renderMarkdown: ->
    if @file?
      @file.read().then (contents) => @renderMarkdownText(contents)
    else if @editor?
      @renderMarkdownText(@editor.getText())

  renderMarkdownText: (text) ->
    renderer.toHtml text, @getPath(), @getGrammar(), @renderLaTeX, (error, html) =>
      if error
        @showError(error)
      else
        @loading = false
        # div.update-preview created after constructor st UpdatePreview cannot
        # be instanced in the constructor
        if !@updatePreview
          @updatePreview = new UpdatePreview(@find("div.update-preview")[0])
        @updatePreview.update(html, @renderLaTeX)
        @trigger('markdown-preview-plus:markdown-changed')

  getTitle: ->
    if @file?
      "#{path.basename(@getPath())} Preview"
    else if @editor?
      "#{@editor.getTitle()} Preview"
    else
      "Markdown Preview"

  getIconName: ->
    "markdown"

  getUri: ->
    if @file?
      "markdown-preview-plus://#{@getPath()}"
    else
      "markdown-preview-plus://editor/#{@editorId}"

  getPath: ->
    if @file?
      @file.getPath()
    else if @editor?
      @editor.getPath()

  getGrammar: ->
    @editor?.getGrammar()

  showError: (result) ->
    failureMessage = result?.message

    @html $$$ ->
      @h2 'Previewing Markdown Failed'
      @h3 failureMessage if failureMessage?

  showLoading: ->
    @loading = true
    @html $$$ ->
      @div class: 'markdown-spinner', 'Loading Markdown\u2026'

  copyToClipboard: ->
    return false if @loading

    selection = window.getSelection()
    selectedText = selection.toString()
    selectedNode = selection.baseNode

    # Use default copy event handler if there is selected text inside this view
    return false if selectedText and selectedNode? and (@[0] is selectedNode or $.contains(@[0], selectedNode))

    atom.clipboard.write(@[0].innerHTML)
    true

  saveAs: ->
    return if @loading

    filePath = @getPath()
    if filePath
      filePath += '.html'
    else
      filePath = 'untitled.md.html'
      if projectPath = atom.project.getPath()
        filePath = path.join(projectPath, filePath)

    if htmlFilePath = atom.showSaveDialogSync(filePath)
      # Hack to prevent encoding issues
      # https://github.com/atom/markdown-preview/issues/96
      html = @[0].innerHTML.split('').join('')

      fs.writeFileSync(htmlFilePath, html)
      atom.workspace.open(htmlFilePath)

  isEqual: (other) ->
    @[0] is other?[0] # Compare DOM elements
