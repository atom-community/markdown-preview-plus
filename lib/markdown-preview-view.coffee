path = require 'path'

{Emitter, Disposable, CompositeDisposable} = require 'atom'
{$, $$$, ScrollView} = require 'atom-space-pen-views'
Grim = require 'grim'
_ = require 'underscore-plus'
fs = require 'fs-plus'
{File} = require 'pathwatcher-without-runas'

renderer = require './renderer'
UpdatePreview = require './update-preview'
markdownIt = null # Defer until used

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
    @loaded = true # Do not show the loading spinnor on initial load

  attached: ->
    return if @isAttached
    @isAttached = true

    if @editorId?
      @resolveEditor(@editorId)
    else
      if atom.workspace?
        @subscribeToFilePath(@filePath)
      else
        @disposables.add atom.packages.onDidActivateInitialPackages =>
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
        atom.workspace?.paneForItem(this)?.destroyItem(this)

    if atom.workspace?
      resolve()
    else
      @disposables.add atom.packages.onDidActivateInitialPackages(resolve)

  editorForId: (editorId) ->
    for editor in atom.workspace.getTextEditors()
      return editor if editor.id?.toString() is editorId.toString()
    null

  handleEvents: ->
    @disposables.add atom.grammars.onDidAddGrammar => _.debounce((=> @renderMarkdown()), 250)
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
      'markdown-preview-plus:sync-source': (event) =>
        @getMarkdownSource().then (source) =>
          return unless source?
          @syncSource source, event.target

    changeHandler = =>
      @renderMarkdown()

      # TODO: Remove paneForURI call when ::paneForItem is released
      pane = atom.workspace.paneForItem?(this) ? atom.workspace.paneForURI(@getURI())
      if pane? and pane isnt atom.workspace.getActivePane()
        pane.activateItem(this)

    if @file?
      @disposables.add @file.onDidChange(changeHandler)
    else if @editor?
      @disposables.add @editor.getBuffer().onDidStopChanging ->
        changeHandler() if atom.config.get 'markdown-preview-plus.liveUpdate'
      @disposables.add @editor.onDidChangePath => @emitter.emit 'did-change-title'
      @disposables.add @editor.getBuffer().onDidSave ->
        changeHandler() unless atom.config.get 'markdown-preview-plus.liveUpdate'
      @disposables.add @editor.getBuffer().onDidReload ->
        changeHandler() unless atom.config.get 'markdown-preview-plus.liveUpdate'
      @disposables.add atom.commands.add( atom.views.getView(@editor),
        'markdown-preview-plus:sync-preview': (event) =>
          @getMarkdownSource().then (source) =>
            return unless source?
            @syncPreview source, @editor.getCursorBufferPosition().row )

    @disposables.add atom.config.onDidChange 'markdown-preview-plus.breakOnSingleNewline', changeHandler

    # Toggle LaTeX rendering if focus is on preview pane or associated editor.
    @disposables.add atom.commands.add 'atom-workspace',
      'markdown-preview-plus:toggle-render-latex': =>
        if (atom.workspace.getActivePaneItem() is this) or (atom.workspace.getActiveTextEditor() is @editor)
          @renderLaTeX = not @renderLaTeX
          changeHandler()
        return

    @disposables.add atom.config.observe 'markdown-preview-plus.useGitHubStyle', (useGitHubStyle) =>
      if useGitHubStyle
        @element.setAttribute('data-use-github-style', '')
      else
        @element.removeAttribute('data-use-github-style')

  renderMarkdown: ->
    @showLoading() unless @loaded
    @getMarkdownSource().then (source) => @renderMarkdownText(source) if source?

  getMarkdownSource: ->
    if @file?
      @file.read()
    else if @editor?
      Promise.resolve(@editor.getText())
    else
      Promise.resolve(null)

  getHTML: (callback) ->
    @getMarkdownSource().then (source) =>
      return unless source?

      renderer.toHTML source, @getPath(), @getGrammar(), @renderLaTeX, callback

  renderMarkdownText: (text) ->
    renderer.toDOMFragment text, @getPath(), @getGrammar(), @renderLaTeX, (error, domFragment) =>
      if error
        @showError(error)
      else
        @loading = false
        @loaded = true
        # div.update-preview created after constructor st UpdatePreview cannot
        # be instanced in the constructor
        unless @updatePreview
          @updatePreview = new UpdatePreview(@find("div.update-preview")[0])
        if @renderLaTeX and not MathJax?
          @updatePreview.update(
            '<p><strong>It looks like somethings missing. Lets fix
            that :D</strong></p>
            <p>Recent versions of
            <a href="https://github.com/Galadirith/markdown-preview-plus">
              markdown-preview-plus
            </a>
            require the package
            <a href="https://github.com/Galadirith/mathjax-wrapper">
              mathjax-wrapper
            </a>
            to be installed to preview LaTeX.
            </p>
            <p>
            To install
            <a href="https://github.com/Galadirith/mathjax-wrapper">
              mathjax-wrapper
            </a>
            simply search for <strong>mathjax-wrapper</strong> in the menu
            <strong>File &rsaquo; Settings &rsaquo; Packages</strong> and click
            <strong>Install</strong>.'
            , false)
        else
          @updatePreview.update(domFragment, @renderLaTeX)
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

  getURI: ->
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

  getDocumentStyleSheets: -> # This function exists so we can stub it
    document.styleSheets

  getTextEditorStyles: ->

    textEditorStyles = document.createElement("atom-styles")
    textEditorStyles.setAttribute "context", "atom-text-editor"
    document.body.appendChild textEditorStyles

    # Force styles injection
    textEditorStyles.initialize()

    # Extract style elements content
    Array.prototype.slice.apply(textEditorStyles.childNodes).map (styleElement) ->
      styleElement.innerText

  getMarkdownPreviewCSS: ->
    markdowPreviewRules = []
    ruleRegExp = /\.markdown-preview/
    cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/

    for stylesheet in @getDocumentStyleSheets()
      if stylesheet.rules?
        for rule in stylesheet.rules
          # We only need `.markdown-review` css
          markdowPreviewRules.push(rule.cssText) if rule.selectorText?.match(ruleRegExp)?

    markdowPreviewRules
      .concat(@getTextEditorStyles())
      .join('\n')
      .replace(/atom-text-editor/g, 'pre.editor-colors')
      .replace(/:host/g, '.host') # Remove shadow-dom :host selector causing problem on FF
      .replace cssUrlRefExp, (match, assetsName, offset, string) -> # base64 encode assets
        assetPath = path.join __dirname, '../assets', assetsName
        originalData = fs.readFileSync assetPath, 'binary'
        base64Data = new Buffer(originalData, 'binary').toString('base64')
        "url('data:image/jpeg;base64,#{base64Data}')"

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

    @getHTML (error, html) ->
      if error?
        console.warn('Copying Markdown as HTML failed', error)
      else
        atom.clipboard.write(html)

    true

  saveAs: ->
    return if @loading

    filePath = @getPath()
    title = 'Markdown to HTML'
    if filePath
      title = path.parse(filePath).name
      filePath += '.html'
    else
      filePath = 'untitled.md.html'
      if projectPath = atom.project.getPaths()[0]
        filePath = path.join(projectPath, filePath)

    if htmlFilePath = atom.showSaveDialogSync(filePath)

      @getHTML (error, htmlBody) =>
        if error?
          console.warn('Saving Markdown as HTML failed', error)
        else
          if @renderLaTeX
            mathjaxScript = """

              <script type="text/x-mathjax-config">
                MathJax.Hub.Config({
                  jax: ["input/TeX","output/HTML-CSS"],
                  extensions: [],
                  TeX: {
                    extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
                  },
                  showMathMenu: false
                });
              </script>
              <script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js">
              </script>
              """
          else
            mathjaxScript = ""
          html = """
            <!DOCTYPE html>
            <html>
              <head>
                  <meta charset="utf-8" />
                  <title>#{title}</title>#{mathjaxScript}
                  <style>#{@getMarkdownPreviewCSS()}</style>
              </head>
              <body class='markdown-preview'>#{htmlBody}</body>
            </html>""" + "\n" # Ensure trailing newline

          fs.writeFileSync(htmlFilePath, html)
          atom.workspace.open(htmlFilePath)

  isEqual: (other) ->
    @[0] is other?[0] # Compare DOM elements

  bubbleToContainerElement: (element) ->
    testElement = element
    while testElement isnt document.body
      parent = testElement.parentNode
      return parent.parentNode if parent.classList.contains('MathJax_Display')
      return parent if parent.classList.contains('atom-text-editor')
      testElement = parent
    return element

  bubbleToContainerToken: (pathToToken) ->
    for i in [0..(pathToToken.length-1)] by 1
      return pathToToken.slice(0, i+1) if pathToToken[i].tag is 'table'
    return pathToToken

  encodeTag: (element) ->
    return 'math' if element.classList.contains('math')
    return 'code' if element.classList.contains('atom-text-editor') # only token.type is `fence` code blocks should ever be found in the first level of the tokens array
    return element.tagName.toLowerCase()

  decodeTag: (token) ->
    return 'span' if token.tag is 'math'
    return 'span' if token.tag is 'code'
    return null if token.tag is ""
    return token.tag

  getPathToElement: (element) =>
    if element.classList.contains('markdown-preview')
      return [
        tag: 'div'
        index: 0
      ]

    element       = @bubbleToContainerElement element
    tag           = @encodeTag element
    siblings      = element.parentNode.childNodes
    siblingsCount = 0

    for sibling in siblings
      siblingTag  = if sibling.nodeType is 1 then @encodeTag(sibling) else null
      if sibling is element
        pathToElement = @getPathToElement(element.parentNode)
        pathToElement.push
          tag: tag
          index: siblingsCount
        return pathToElement
      else if siblingTag is tag
        siblingsCount++

    return

  syncSource: (text, element) =>
    pathToElement = @getPathToElement element
    pathToElement.shift() # remove div.markdown-preview
    pathToElement.shift() # remove div.update-preview
    return unless pathToElement.length

    markdownIt  ?= require './markdown-it-helper'
    tokens      = markdownIt.getTokens text, @renderLaTeX
    finalToken  = null
    level       = 0

    for token in tokens
      break if token.level < level
      continue if token.hidden
      if token.tag is pathToElement[0].tag and token.level is level
        if token.nesting is 1
          if pathToElement[0].index is 0
            finalToken = token if token.map?
            pathToElement.shift()
            level++
          else
            pathToElement[0].index--
        else if token.nesting is 0 and token.tag in ['math', 'code']
          if pathToElement[0].index is 0
            finalToken = token
            break
          else
            pathToElement[0].index--
      break if pathToElement.length is 0

    if finalToken?
      @editor.setCursorBufferPosition [finalToken.map[0], 0]
      return finalToken.map[0]
    else
      return null

  getPathToToken: (tokens, line) =>
    pathToToken   = []
    tokenTagCount = []
    level         = 0

    for token in tokens
      break if token.level < level
      continue if token.hidden
      continue if token.nesting is -1

      token.tag = @decodeTag token
      continue unless token.tag?

      if token.map? and line >= token.map[0] and line <= (token.map[1]-1)
        if token.nesting is 1
          pathToToken.push
            tag: token.tag
            index: tokenTagCount[token.tag] ? 0
          tokenTagCount = []
          level++
        else if token.nesting is 0
          pathToToken.push
            tag: token.tag
            index: tokenTagCount[token.tag] ? 0
          break
      else if token.level is level
        if tokenTagCount[token.tag]?
        then tokenTagCount[token.tag]++
        else tokenTagCount[token.tag] = 1

    pathToToken = @bubbleToContainerToken pathToToken
    return pathToToken

  syncPreview: (text, line) =>
    markdownIt  ?= require './markdown-it-helper'
    tokens      = markdownIt.getTokens text, @renderLaTeX
    pathToToken = @getPathToToken tokens, line

    element = @find('.update-preview').eq(0)
    for token in pathToToken
      candidateElement = element.children(token.tag).eq(token.index)
      if candidateElement.length isnt 0
      then element = candidateElement
      else break

    return null if element[0].classList.contains('update-preview') # Do not jump to the top of the preview for bad syncs

    element[0].scrollIntoView() unless element[0].classList.contains('update-preview')
    maxScrollTop = @element.scrollHeight - @innerHeight()
    @element.scrollTop -= @innerHeight()/4 unless @scrollTop() >= maxScrollTop

    element.addClass('flash')
    setTimeout ( -> element.removeClass('flash') ), 1000

    return element[0]

if Grim.includeDeprecatedAPIs
  MarkdownPreviewView::on = (eventName) ->
    if eventName is 'markdown-preview:markdown-changed'
      Grim.deprecate("Use MarkdownPreviewView::onDidChangeMarkdown instead of the 'markdown-preview:markdown-changed' jQuery event")
    super
