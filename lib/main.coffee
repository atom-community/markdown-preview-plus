url = require 'url'
fs = require 'fs-plus'

MarkdownPreviewView = null
renderer = null
mathjaxHelper = null

isMarkdownPreviewView = (object) ->
  MarkdownPreviewView ?= require './markdown-preview-view'
  object instanceof MarkdownPreviewView

module.exports =
  config:
    breakOnSingleNewline:
      type: 'boolean'
      default: false
      order: 0
    liveUpdate:
      type: 'boolean'
      default: true
      order: 10
    openPreviewInSplitPane:
      type: 'boolean'
      default: true
      order: 20
    grammars:
      type: 'array'
      default: [
        'source.gfm'
        'source.litcoffee'
        'text.html.basic'
        'text.md'
        'text.plain'
        'text.plain.null-grammar'
      ]
      order: 30
    enableLatexRenderingByDefault:
      title: 'Enable Math Rendering By Default'
      type: 'boolean'
      default: false
      order: 40
    useLazyHeaders:
      title: 'Use Lazy Headers'
      description: 'Require no space after headings #'
      type: 'boolean'
      default: true
      order: 45
    useGitHubStyle:
      title: 'Use GitHub.com style'
      type: 'boolean'
      default: false
      order: 50
    enablePandoc:
      type: 'boolean'
      default: false
      title: 'Enable Pandoc Parser'
      order: 100
    pandocPath:
      type: 'string'
      default: 'pandoc'
      title: 'Pandoc Options: Path'
      description: 'Please specify the correct path to your pandoc executable'
      dependencies: ['enablePandoc']
      order: 110
    pandocArguments:
      type: 'array'
      default: []
      title: 'Pandoc Options: Commandline Arguments'
      description: 'Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.'
      dependencies: ['enablePandoc']
      order: 120
    pandocMarkdownFlavor:
      type: 'string'
      default: 'markdown-raw_tex+tex_math_single_backslash'
      title: 'Pandoc Options: Markdown Flavor'
      description: 'Enter the pandoc markdown flavor you want'
      dependencies: ['enablePandoc']
      order: 130
    pandocBibliography:
      type: 'boolean'
      default: false
      title: 'Pandoc Options: Citations'
      description: 'Enable this for bibliography parsing'
      dependencies: ['enablePandoc']
      order: 140
    pandocRemoveReferences:
      type: 'boolean'
      default: true
      title: 'Pandoc Options: Remove References'
      description: 'Removes references at the end of the HTML preview'
      dependencies: ['pandocBibliography']
      order: 150
    pandocBIBFile:
      type: 'string'
      default: 'bibliography.bib'
      title: 'Pandoc Options: Bibliography (bibfile)'
      description: 'Name of bibfile to search for recursivly'
      dependencies: ['pandocBibliography']
      order: 160
    pandocBIBFileFallback:
      type: 'string'
      default: ''
      title: 'Pandoc Options: Fallback Bibliography (bibfile)'
      description: 'Full path to fallback bibfile'
      dependencies: ['pandocBibliography']
      order: 165
    pandocCSLFile:
      type: 'string'
      default: 'custom.csl'
      title: 'Pandoc Options: Bibliography Style (cslfile)'
      description: 'Name of cslfile to search for recursivly'
      dependencies: ['pandocBibliography']
      order: 170
    pandocCSLFileFallback:
      type: 'string'
      default: ''
      title: 'Pandoc Options: Fallback Bibliography Style (cslfile)'
      description: 'Full path to fallback cslfile'
      dependencies: ['pandocBibliography']
      order: 175


  activate: ->
    if parseFloat(atom.getVersion()) < 1.7
      atom.deserializers.add
        name: 'MarkdownPreviewView'
        deserialize: module.exports.createMarkdownPreviewView.bind(module.exports)

    atom.commands.add 'atom-workspace',
      'markdown-preview-plus:toggle': =>
        @toggle()
      'markdown-preview-plus:copy-html': =>
        @copyHtml()
      'markdown-preview-plus:toggle-break-on-single-newline': ->
        keyPath = 'markdown-preview-plus.breakOnSingleNewline'
        atom.config.set(keyPath, not atom.config.get(keyPath))

    previewFile = @previewFile.bind(this)
    atom.commands.add '.tree-view .file .name[data-name$=\\.markdown]', 'markdown-preview-plus:preview-file', previewFile
    atom.commands.add '.tree-view .file .name[data-name$=\\.md]', 'markdown-preview-plus:preview-file', previewFile
    atom.commands.add '.tree-view .file .name[data-name$=\\.mdown]', 'markdown-preview-plus:preview-file', previewFile
    atom.commands.add '.tree-view .file .name[data-name$=\\.mkd]', 'markdown-preview-plus:preview-file', previewFile
    atom.commands.add '.tree-view .file .name[data-name$=\\.mkdown]', 'markdown-preview-plus:preview-file', previewFile
    atom.commands.add '.tree-view .file .name[data-name$=\\.ron]', 'markdown-preview-plus:preview-file', previewFile
    atom.commands.add '.tree-view .file .name[data-name$=\\.txt]', 'markdown-preview-plus:preview-file', previewFile

    atom.workspace.addOpener (uriToOpen) =>
      try
        {protocol, host, pathname} = url.parse(uriToOpen)
      catch error
        return

      return unless protocol is 'markdown-preview-plus:'

      try
        pathname = decodeURI(pathname) if pathname
      catch error
        return

      if host is 'editor'
        @createMarkdownPreviewView(editorId: pathname.substring(1))
      else
        @createMarkdownPreviewView(filePath: pathname)

  createMarkdownPreviewView: (state) ->
    if state.editorId or fs.isFileSync(state.filePath)
      MarkdownPreviewView ?= require './markdown-preview-view'
      new MarkdownPreviewView(state)

  toggle: ->
    if isMarkdownPreviewView(atom.workspace.getActivePaneItem())
      atom.workspace.destroyActivePaneItem()
      return

    editor = atom.workspace.getActiveTextEditor()
    return unless editor?

    grammars = atom.config.get('markdown-preview-plus.grammars') ? []
    return unless editor.getGrammar().scopeName in grammars

    @addPreviewForEditor(editor) unless @removePreviewForEditor(editor)

  uriForEditor: (editor) ->
    "markdown-preview-plus://editor/#{editor.id}"

  removePreviewForEditor: (editor) ->
    uri = @uriForEditor(editor)
    previewPane = atom.workspace.paneForURI(uri)
    if previewPane?
      preview = previewPane.itemForURI(uri)
      if preview isnt previewPane.getActiveItem()
        previewPane.activateItem(preview)
        return false
      previewPane.destroyItem(preview)
      true
    else
      false

  addPreviewForEditor: (editor) ->
    uri = @uriForEditor(editor)
    previousActivePane = atom.workspace.getActivePane()
    options =
      searchAllPanes: true
    if atom.config.get('markdown-preview-plus.openPreviewInSplitPane')
      options.split = 'right'
    atom.workspace.open(uri, options).then (markdownPreviewView) ->
      if isMarkdownPreviewView(markdownPreviewView)
        previousActivePane.activate()

  previewFile: ({target}) ->
    filePath = target.dataset.path
    return unless filePath

    for editor in atom.workspace.getTextEditors() when editor.getPath() is filePath
      @addPreviewForEditor(editor)
      return

    atom.workspace.open "markdown-preview-plus://#{encodeURI(filePath)}", searchAllPanes: true

  copyHtml: (callback = atom.clipboard.write.bind(atom.clipboard), scaleMath = 100) ->
    editor = atom.workspace.getActiveTextEditor()
    return unless editor?

    renderer ?= require './renderer'
    text = editor.getSelectedText() or editor.getText()
    renderLaTeX = atom.config.get 'markdown-preview-plus.enableLatexRenderingByDefault'
    renderer.toHTML text, editor.getPath(), editor.getGrammar(), renderLaTeX, true, (error, html) ->
      if error
        console.warn('Copying Markdown as HTML failed', error)
      else if renderLaTeX
        mathjaxHelper ?= require './mathjax-helper'
        mathjaxHelper.processHTMLString html, (proHTML) ->
          proHTML = proHTML.replace /MathJax\_SVG.*?font\-size\: 100%/g, (match) ->
            match.replace /font\-size\: 100%/, "font-size: #{scaleMath}%"
          callback(proHTML)
      else
        callback(html)
