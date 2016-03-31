path = require 'path'
_ = require 'underscore-plus'
cheerio = require 'cheerio'
fs = require 'fs-plus'
Highlights = require 'highlights-native'
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
  o = cheerio.load(html)
  # Do not remove MathJax script delimited blocks
  o("script:not([type^='math/tex'])").remove()
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
  o('*').removeAttr(attribute) for attribute in attributesToRemove
  o.html()


resolveImagePaths = (html, filePath, copyHTMLFlag) ->
  if atom.project?
    [rootDirectory] = atom.project.relativizePath(filePath)
  o = cheerio.load(html)
  for imgElement in o('img')
    img = o(imgElement)
    if src = img.attr('src')
      if not atom.config.get('markdown-preview-plus.enablePandoc')
        markdownIt ?= require './markdown-it-helper'
        src = markdownIt.decode(src)

      continue if src.match(/^(https?|atom):\/\//)
      continue if src.startsWith(process.resourcesPath)
      continue if src.startsWith(resourcePath)
      continue if src.startsWith(packagePath)

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

      img.attr('src', src)

  o.html()

exports.convertCodeBlocksToAtomEditors = (domFragment, defaultLanguage='text') ->
  if fontFamily = atom.config.get('editor.fontFamily')
    for codeElement in domFragment.querySelectorAll('code')
      codeElement.style.fontFamily = fontFamily

  for preElement in domFragment.querySelectorAll('pre')
    codeBlock = preElement.firstElementChild ? preElement
    fenceName = codeBlock.getAttribute('class')?.replace(/^lang-/, '') ? defaultLanguage

    editorElement = document.createElement('atom-text-editor')
    editorElement.setAttributeNode(document.createAttribute('gutter-hidden'))
    editorElement.removeAttribute('tabindex') # make read-only

    preElement.parentNode.insertBefore(editorElement, preElement)
    preElement.remove()

    editor = editorElement.getModel()
    # remove the default selection of a line in each editor
    editor.getDecorations(class: 'cursor-line', type: 'line')[0].destroy()
    editor.setText(codeBlock.textContent.replace(/\n$/, ''))
    if grammar = atom.grammars.grammarForScopeName(scopeForFenceName(fenceName))
      editor.setGrammar(grammar)

  domFragment

tokenizeCodeBlocks = (html, defaultLanguage='text') ->
  o = cheerio.load(html)

  if fontFamily = atom.config.get('editor.fontFamily')
    o('code').css('font-family', fontFamily)

  for preElement in o("pre")
    codeBlock = o(preElement).children().first()
    fenceName = codeBlock.attr('class')?.replace(/^lang-/, '') ? defaultLanguage

    highlighter ?= new Highlights(registry: atom.grammars)
    highlightedHtml = highlighter.highlightSync
      fileContents: codeBlock.text()
      scopeName: scopeForFenceName(fenceName)

    highlightedBlock = o(highlightedHtml)
    # The `editor` class messes things up as `.editor` has absolutely positioned lines
    highlightedBlock.removeClass('editor').addClass("lang-#{fenceName}")

    o(preElement).replaceWith(highlightedBlock)

  o.html()
