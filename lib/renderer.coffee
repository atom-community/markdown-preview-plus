path = require 'path'
_ = require 'underscore-plus'
cheerio = require 'cheerio'
fs = require 'fs-plus'
Highlights = require 'highlights'
{$} = require 'atom-space-pen-views'
roaster = null # Defer until used
pandoc = null # Defer until used
{scopeForFenceName} = require './extension-helper'
mathjaxHelper = require './mathjax-helper'

highlighter = null
{resourcePath} = atom.getLoadSettings()
packagePath = path.dirname(__dirname)

exports.toDOMFragment = (text='', filePath, grammar, callback) ->
  render text, filePath, (error, html) ->
    return callback(error) if error?

    template = document.createElement('template')
    template.innerHTML = html
    domFragment = template.content.cloneNode(true)

    # Default code blocks to be coffee in Literate CoffeeScript files
    defaultCodeLanguage = 'coffee' if grammar?.scopeName is 'source.litcoffee'
    convertCodeBlocksToAtomEditors(domFragment, defaultCodeLanguage)
    callback(null, domFragment)

exports.toHTML = (text='', filePath, grammar, renderLaTeX, callback) ->
  render text, filePath, renderLaTeX, (error, html) ->
    return callback(error) if error?
    # Default code blocks to be coffee in Literate CoffeeScript files
    defaultCodeLanguage = 'coffee' if grammar?.scopeName is 'source.litcoffee'
    html = tokenizeCodeBlocks(html, defaultCodeLanguage)
    callback(null, html)

render = (text, filePath, renderLaTeX, callback) ->
  # Remove the <!doctype> since otherwise marked will escape it
  # https://github.com/chjj/marked/issues/354
  text = text.replace(/^\s*<!doctype(\s+.*)?>\s*/i, '')

  callbackFunction = (error, html) ->
    return callback(error) if error?
    html = sanitize(html)
    html = resolveImagePaths(html, filePath)
    callback(null, html.trim())

  if atom.config.get('markdown-preview-plus.enableRenderingWithPandoc')
    pandoc ?= require path.join(packagePath, 'node_modules/pdc/pdc')
    pandoc.path = atom.config.get('markdown-preview-plus.pandocPath')
    pandoc text, 'markdown-raw_tex', 'html', ['--mathjax'], callbackFunction
  else
    roaster ?= require path.join(packagePath, 'node_modules/roaster/lib/roaster')
    options =
      mathjax: renderLaTeX
      sanitize: false
      breaks: atom.config.get('markdown-preview-plus.breakOnSingleNewline')
    roaster text, options, callbackFunction

sanitize = (html) ->
  o = cheerio.load("<div>#{html}</div>")
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

resolveImagePaths = (html, filePath) ->
  o = cheerio.load(html)
  for imgElement in o('img')
    img = o(imgElement)
    if src = img.attr('src')
      continue if src.match(/^(https?|atom):\/\//)
      continue if src.startsWith(process.resourcesPath)
      continue if src.startsWith(resourcePath)
      continue if src.startsWith(packagePath)

      if src[0] is '/'
        unless fs.isFileSync(src)
          img.attr('src', atom.project.getDirectories()[0]?.resolve(src.substring(1)))
      else
        img.attr('src', path.resolve(path.dirname(filePath), src))

  o.html()

convertCodeBlocksToAtomEditors = (domFragment, defaultLanguage='text') ->
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
    editor.setText(codeBlock.textContent.trim())
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
