path = require 'path'
_ = require 'underscore-plus'
fs = require 'fs-plus'
highlight = require 'atom-highlight'
{$} = require 'atom-space-pen-views'
pandocHelper = null # Defer until used
markdownIt = null # Defer until used
{scopeForFenceName} = require './extension-helper'
imageWatcher = require './image-watch-helper'

highlighter = null
{resourcePath} = atom.getLoadSettings()
packagePath = path.dirname(__dirname)

exports.toDOMFragment = (text='', filePath, grammar, renderLaTeX, callback) ->
  render text, filePath, renderLaTeX, false, (error, html) ->
    return callback(error) if error?

    template = document.createElement('template')
    template.innerHTML = html
    domFragment = template.content.cloneNode(true)

    callback(null, domFragment)

exports.toHTML = (text='', filePath, grammar, renderLaTeX, copyHTMLFlag, callback) ->
  render text, filePath, renderLaTeX, copyHTMLFlag, (error, html) ->
    return callback(error) if error?
    # Default code blocks to be coffee in Literate CoffeeScript files
    defaultCodeLanguage = 'coffee' if grammar?.scopeName is 'source.litcoffee'
    unless atom.config.get('markdown-preview-plus.enablePandoc') \
        and atom.config.get('markdown-preview-plus.useNativePandocCodeStyles')
      html = tokenizeCodeBlocks(html, defaultCodeLanguage)
    callback(null, html)

render = (text, filePath, renderLaTeX, copyHTMLFlag, callback) ->
  # Remove the <!doctype> since otherwise marked will escape it
  # https://github.com/chjj/marked/issues/354
  text = text.replace(/^\s*<!doctype(\s+.*)?>\s*/i, '')

  callbackFunction = (error, html) ->
    return callback(error) if error?
    html = sanitize(html)
    html = resolveImagePaths(html, filePath, copyHTMLFlag)
    callback(null, html.trim())

  if atom.config.get('markdown-preview-plus.enablePandoc')
    pandocHelper ?= require './pandoc-helper'
    pandocHelper.renderPandoc text, filePath, renderLaTeX, callbackFunction
  else

    markdownIt ?= require './markdown-it-helper'

    callbackFunction null, markdownIt.render(text, renderLaTeX)

sanitize = (html) ->
  doc = document.createElement('div')
  doc.innerHTML = html
  # Do not remove MathJax script delimited blocks
  doc.querySelectorAll("script:not([type^='math/tex'])").forEach (elem) -> elem.remove()
  attributesToRemove = [
    'onabort'
    'onblur'
    'onchange'
    'onclick'
    'ondbclick'
    'onerror'
    'onfocus'
    'onkeydown'
    'onkeypress'
    'onkeyup'
    'onload'
    'onmousedown'
    'onmousemove'
    'onmouseover'
    'onmouseout'
    'onmouseup'
    'onreset'
    'onresize'
    'onscroll'
    'onselect'
    'onsubmit'
    'onunload'
  ]
  doc.querySelectorAll('*').forEach (elem) ->
    elem.removeAttribute(attribute) for attribute in attributesToRemove
  doc.innerHTML


resolveImagePaths = (html, filePath, copyHTMLFlag) ->
  if atom.project?
    [rootDirectory] = atom.project.relativizePath(filePath)
  doc = document.createElement('div')
  doc.innerHTML = html
  doc.querySelectorAll('img').forEach (img) ->
    if src = img.getAttribute('src')
      if not atom.config.get('markdown-preview-plus.enablePandoc')
        markdownIt ?= require './markdown-it-helper'
        src = markdownIt.decode(src)

      return if src.match(/^(https?|atom|data):/)
      return if src.startsWith(process.resourcesPath)
      return if src.startsWith(resourcePath)
      return if src.startsWith(packagePath)

      if src[0] is '/'
        unless fs.isFileSync(src)
          try
            src = path.join(rootDirectory, src.substring(1))
          catch e
      else
        src = path.resolve(path.dirname(filePath), src)

      # Use most recent version of image
      if not copyHTMLFlag
        v = imageWatcher.getVersion(src, filePath)
        src = "#{src}?v=#{v}" if v

      img.src = src

  doc.innerHTML

exports.convertCodeBlocksToAtomEditors = (domFragment, defaultLanguage='text') ->
  if fontFamily = atom.config.get('editor.fontFamily')
    for codeElement in domFragment.querySelectorAll('code')
      codeElement.style.fontFamily = fontFamily

  for preElement in domFragment.querySelectorAll('pre')
    codeBlock = preElement.firstElementChild ? preElement
    fenceName = codeBlock.getAttribute('class')?.replace(/^(lang-|sourceCode )/, '') ? defaultLanguage

    editorElement = document.createElement('atom-text-editor')
    editorElement.setAttributeNode(document.createAttribute('gutter-hidden'))
    editorElement.removeAttribute('tabindex') # make read-only

    preElement.parentNode.insertBefore(editorElement, preElement)
    preElement.remove()

    editor = editorElement.getModel()
    # remove the default selection of a line in each editor
    if editor.cursorLineDecorations?
      for cursorLineDecoration in editor.cursorLineDecorations
        cursorLineDecoration.destroy()
    else
      editor.getDecorations(class: 'cursor-line', type: 'line')[0].destroy()
    editor.setText(codeBlock.textContent.replace(/\n$/, ''))
    if grammar = atom.grammars.grammarForScopeName(scopeForFenceName(fenceName))
      editor.setGrammar(grammar)

  domFragment

tokenizeCodeBlocks = (html, defaultLanguage='text') ->
  doc = document.createElement('div')
  doc.innerHTML = html

  if fontFamily = atom.config.get('editor.fontFamily')
    doc.querySelectorAll('code').forEach (code) ->
      code.style.fontFamily = fontFamily

  doc.querySelectorAll("pre").forEach (preElement) ->
    codeBlock = preElement.firstElementChild
    fenceName = codeBlock.className.replace(/^(lang-|sourceCode )/, '') ? defaultLanguage

    highlightedHtml = highlight
      fileContents: codeBlock.innerText
      scopeName: scopeForFenceName(fenceName)
      nbsp: true
      lineDivs: true
      editorDiv: true
      editorDivTag: 'pre'
      # The `editor` class messes things up as `.editor` has absolutely positioned lines
      editorDivClass:
        if fenceName
          "editor-colors lang-#{fenceName}"
        else
          "editor-colors"

    preElement.outerHTML = highlightedHtml

  doc.innerHTML
