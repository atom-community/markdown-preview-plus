path = require 'path'

{Emitter, Disposable, CompositeDisposable} = require 'atom'
{$, $$$, ScrollView} = require 'atom-space-pen-views'
Grim = require 'grim'
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
    @emitter = new Emitter
    @disposables = new CompositeDisposable

  attached: ->
    return if @isAttached
    @isAttached = true

    if @editorId?
      @resolveEditor(@editorId)
    else
      if atom.workspace?
        @subscribeToFilePath(@filePath)
      else
        @disposables.add atom.packages.onDidActivateAll =>
          @subscribeToFilePath(@filePath)

  serialize: ->
    deserializer: 'MarkdownPreviewView'
    filePath: @getPath()
    editorId: @editorId

  destroy: ->
    @disposables.dispose()

  onDidChangeTitle: (callback) ->
    @emitter.on 'did-change-title', callback

  onDidChangeModified: (callback) ->
    # No op to suppress deprecation warning
    new Disposable

  onDidChangeMarkdown: (callback) ->
    @emitter.on 'did-change-markdown', callback

  on: (eventName) ->
    if eventName is 'markdown-preview-plus:markdown-changed'
      Grim.deprecate("Use MarkdownPreviewView::onDidChangeMarkdown instead of the 'markdown-preview-plus:markdown-changed' jQuery event")
    super

  subscribeToFilePath: (filePath) ->
    @file = new File(filePath)
    @emitter.emit 'did-change-title'
    @handleEvents()
    @renderMarkdown()

  resolveEditor: (editorId) ->
    resolve = =>
      @editor = @editorForId(editorId)

      if @editor?
        @emitter.emit 'did-change-title' if @editor?
        @handleEvents()
        @renderMarkdown()
      else
        # The editor this preview was created for has been closed so close
        # this preview since a preview cannot be rendered without an editor
        @parents('.pane').view()?.destroyItem(this)

    if atom.workspace?
      resolve()
    else
      @disposables.add atom.packages.onDidActivateAll(resolve)

  editorForId: (editorId) ->
    for editor in atom.workspace.getTextEditors()
      return editor if editor.id?.toString() is editorId.toString()
    null

  handleEvents: ->
    @disposables.add atom.grammars.onDidAddGrammar _.debounce((=> @renderMarkdown()), 250)
    @disposables.add atom.grammars.onDidUpdateGrammar _.debounce((=> @renderMarkdown()), 250)

    atom.commands.add @element,
      'core:move-up': =>
        @scrollUp()
      'core:move-down': =>
        @scrollDown()
      'core:save-as': (event) =>
        event.stopPropagation()
        @saveAs()
      'core:copy': (event) =>
        event.stopPropagation() if @copyToClipboard()
      'markdown-preview-plus:zoom-in': =>
        zoomLevel = parseFloat(@css('zoom')) or 1
        @css('zoom', zoomLevel + .1)
      'markdown-preview-plus:zoom-out': =>
        zoomLevel = parseFloat(@css('zoom')) or 1
        @css('zoom', zoomLevel - .1)
      'markdown-preview-plus:reset-zoom': =>
        @css('zoom', 1)
      'markdown-preview-plus:toggle-render-latex': =>
        @renderLaTeX = !@renderLaTeX
        @renderMarkdown()
        return

    # Toggle LaTeX rendering if focus is on the editor. I don't know how (or
    # even if it is possible) to target the DOM element of the editor associated
    # with this view. As such we target the DOM of the workspace with
    # 'atom-workspace'. I suspect this will mean that each time a new preview
    # window is opened and hence a new MarkdownPreviewView object, this command
    # for the workspace will be overwritten each such time. I don't know yet if
    # that will cause errors if that is true, but be aware of this possible
    # scenario :D
    # https://github.com/atom/atom/blob/8fa6fdb90cefcad7482808ded81dbb3e9616d211/src/command-registry.coffee#L106
    atom.commands.add 'atom-workspace',
      'markdown-preview-plus:toggle-render-latex': =>
        if atom.workspace.getActiveTextEditor() is @editor
          @renderLaTeX = !@renderLaTeX
          @renderMarkdown()
        return

    changeHandler = =>
      @renderMarkdown()

      # TODO: Remove paneForUri call when ::paneForItem is released
      pane = atom.workspace.paneForItem?(this) ? atom.workspace.paneForUri(@getUri())
      if pane? and pane isnt atom.workspace.getActivePane()
        pane.activateItem(this)

    if @file?
      @disposables.add @file.onDidChange(changeHandler)
    else if @editor?
      @disposables.add @editor.getBuffer().onDidStopChanging =>
        changeHandler() if atom.config.get 'markdown-preview-plus.liveUpdate'
      @disposables.add @editor.onDidChangePath => @emitter.emit 'did-change-title'
      @disposables.add @editor.getBuffer().onDidSave =>
        changeHandler() unless atom.config.get 'markdown-preview-plus.liveUpdate'
      @disposables.add @editor.getBuffer().onDidReload =>
        changeHandler() unless atom.config.get 'markdown-preview-plus.liveUpdate'

    @disposables.add atom.config.onDidChange 'markdown-preview-plus.breakOnSingleNewline', changeHandler

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
        @emitter.emit 'did-change-markdown'
        @originalTrigger('markdown-preview-plus:markdown-changed')

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
