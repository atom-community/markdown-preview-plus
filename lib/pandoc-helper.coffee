cheerio = require 'cheerio'
pdc = require 'pdc'
_ = require 'underscore-plus'

# Arguments for pandoc
args = null

# Pandocs markdown flavor
flavor = null

# Callback function for result
callback = null

# Whether to render the math
renderMath = null

# Current markdown text
currentText = null

# Local Mathjax Path
mathjaxPath = null

###*
 * Sets local mathjaxPath if available
 ###
getMathJaxPath = () ->
  try
    path = require 'path'
    mathjaxPath = atom.packages.getLoadedPackage('mathjax-wrapper')
    mathjaxPath = path.join mathjaxPath.path, 'node_modules/MathJax/MathJax.js'
    mathjaxPath = "=#{mathjaxPath}"
  catch e
    mathjaxPath = ''

###*
 * Sets local variables needed for everything
 * @param {string} document in markdown
 * @param {boolean} whether to render the math with mathjax
 * @param {function} callbackFunction
 ###
setSettings = (text, math, cb) ->
  currentText = text
  renderMath = math
  callback = cb
  pdc.path = atom.config.get('markdown-preview-plus.pandocOptsPath')
  flavor = atom.config.get('markdown-preview-plus.pandocOptsMarkdownFlavor')
  args = atom.config.get('markdown-preview-plus.pandocOptsArguments')
  getMathJaxPath() unless mathjaxPath?
  args.push "--mathjax#{mathjaxPath}" if renderMath
  args.push '--bibliography=/Users/leipert/testbib.bib'

###*
 * Handle error response from pdc
 * @param {error} Returned error
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 ###
handleError = (error, html) ->
  search = /pandoc-citeproc: reference ([\S]+) not found\n?/ig
  matches = error.message.match search
  message = error.message.replace search, ''
  if message.length is 0
    error = null
    matches = _.uniq matches
    html = "<b>#{ matches.join('<br>') }</b>"
    matches = matches.forEach (match) ->
      match = match.replace search, '$1'
      r = new RegExp "@#{match}", 'gi'
      currentText = currentText.replace(r, "&#64;#{match}")
    currentText = html + '<br>' + currentText
    pdc currentText, flavor, 'html', args, handleResponse
  else
    message = error.message.replace /\n/g, '<br>'
    html = "<h1>Pandoc Error</h1><p><b>#{message}</b></p>"
  [null, html]

###*
 * Adjusts all math environments in HTML
 * @param {string} HTML to be adjusted
 * @return {string} HTML with adjusted math environments
 ###
handleMath = (html) ->
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

###*
 * Handle successful response from pdc
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 ###
handleSuccess = (html) ->
  html = handleMath html if renderMath
  [null, html]

###*
 * Handle response from pdc
 * @param {Object} error if thrown
 * @param {string} Returned HTML
 ###
handleResponse = (error, html) ->
  array = if error? then handleError error, html else handleSuccess html
  callback.apply callback, array

###*
 * Renders markdown with pandoc
 * @param {string} document in markdown
 * @param {boolean} whether to render the math with mathjax
 * @param {function} callbackFunction
 ###
renderPandoc = (text, renderMath, cb) ->
  setSettings text, renderMath, cb
  pdc text, flavor, 'html', args, handleResponse

module.exports =
  renderPandoc: renderPandoc
