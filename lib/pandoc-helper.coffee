pdc = require 'pdc'
_ = require 'underscore-plus'
cheerio = null
fs = null
path = null

# Current markdown text
currentText = null

atomConfig = null

config = { }

###*
 * Sets local mathjaxPath if available
 ###
getMathJaxPath = () ->
  try
    path ?= require 'path'
    config.mathjax = atom.packages.getLoadedPackage('mathjax-wrapper')
    config.mathjax = path.join config.mathjax.path, 'node_modules/MathJax/MathJax.js'
    config.mathjax = "=#{config.mathjax}"
  catch e
    config.mathjax = ''

findFileRecursive = (filePath, fileName) ->
  fs ?= require 'fs'
  path ?= require 'path'
  bibFile = path.join filePath, '../', fileName
  if fs.existsSync bibFile
    bibFile
  else
    newPath = path.join bibFile, '..'
    if newPath isnt filePath
      findFileRecursive newPath, fileName
    else
      false

###*
 * Sets local variables needed for everything
 * @param {string} document in markdown
 * @param {boolean} whether to render the math with mathjax
 * @param {function} callbackFunction
 ###
setPandocOptions = (filePath) ->
  atomConfig = atom.config.get('markdown-preview-plus')
  pdc.path = atomConfig.pandocPath
  config.flavor = atomConfig.pandocMarkdownFlavor
  config.args = atom.config.get('markdown-preview-plus.pandocArguments')
  getMathJaxPath() unless config.mathjax?
  config.args.push "--mathjax#{config.mathjax}" if config.renderMath
  if atomConfig.pandocBibliography
    bibFile = findFileRecursive filePath, atomConfig.pandocBIBFile
    config.args.push "--bibliography=#{bibFile}" if bibFile
    cslFile = findFileRecursive filePath, atomConfig.pandocCSLFile
    config.args.push "--csl=#{cslFile}" if bibFile and cslFile

###*
 * Handle error response from pdc
 * @param {error} Returned error
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 ###
handleError = (error, html) ->
  referenceSearch = /pandoc-citeproc: reference ([\S]+) not found(<br>)?/ig
  message =
    _.uniq error.message.split '\n'
    .join('<br>')
  html = "<h1>Pandoc Error:</h1><p><b>#{message}</b></p><hr>"
  isOnlyMissingReferences =
    message.replace referenceSearch, ''
    .length is 0
  if isOnlyMissingReferences
    message.match referenceSearch
    .forEach (match) ->
      match = match.replace referenceSearch, '$1'
      r = new RegExp "@#{match}", 'gi'
      currentText = currentText.replace(r, "&#64;#{match}")
    currentText = html + currentText
    pdc currentText, config.flavor, 'html', config.args, handleResponse
  [null, html]

###*
 * Adjusts all math environments in HTML
 * @param {string} HTML to be adjusted
 * @return {string} HTML with adjusted math environments
 ###
handleMath = (html) ->
  cheerio ?= require 'cheerio'
  o = cheerio.load("<div>#{html}</div>")
  o('.math').each (i, elem) ->
    math = cheerio(this).text()
    # Set mode if it is block math
    mode = if math.indexOf('\\[') > -1  then '; mode=display' else ''

    # Remove sourrounding \[ \] and \( \)
    math = math.replace(/\\[[()\]]/g, '')
    newContent =
      '<span class="math">' +
      "<script type='math/tex#{mode}'>#{math}</script>" +
      '</span>'

    cheerio(this).replaceWith newContent

  o('div').html()

removeReferences = (html) ->
  cheerio ?= require 'cheerio'
  o = cheerio.load("<div>#{html}</div>")
  o('.references').each (i, elem) ->
    cheerio(this).remove()
  o('div').html()

###*
 * Handle successful response from pdc
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 ###
handleSuccess = (html) ->
  html = handleMath html if config.renderMath
  html = removeReferences html if atomConfig.pandocRemoveReferences
  [null, html]

###*
 * Handle response from pdc
 * @param {Object} error if thrown
 * @param {string} Returned HTML
 ###
handleResponse = (error, html) ->
  array = if error? then handleError error, html else handleSuccess html
  config.callback.apply config.callback, array

###*
 * Renders markdown with pandoc
 * @param {string} document in markdown
 * @param {boolean} whether to render the math with mathjax
 * @param {function} callbackFunction
 ###
renderPandoc = (text, filePath, renderMath, cb) ->
  currentText = text
  config.renderMath = renderMath
  config.callback = cb
  setPandocOptions filePath
  pdc text, config.flavor, 'html', config.args, handleResponse

module.exports =
  renderPandoc: renderPandoc
