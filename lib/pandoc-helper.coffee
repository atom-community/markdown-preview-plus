_ = require 'underscore-plus'
cheerio = null
fs = null
path = null

# Current markdown text
currentText = null

atomConfig = null

config = {}

###*
 * Sets local mathjaxPath if available
 ###
getMathJaxPath = ->
  try
    config.mathjax = require.resolve 'MathJax'
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
    if newPath isnt filePath and not _.contains(atom.project.getPaths(), newPath)
      findFileRecursive newPath, fileName
    else
      false

CP = null
pdc = (text, flavor, out, args, opts, callback) ->
  CP ?= require 'child_process'
  atomConfig = atom.config.get('markdown-preview-plus')

  proc = CP.execFile(atomConfig.pandocPath, [
    '-f', flavor,
    '-t', out,
    args...
    ], opts, callback)
  proc.stdin.end(text)


###*
 * Sets local variables needed for everything
 * @param {string} path to markdown file
 *
 ###
setPandocOptions = (filePath) ->
  atomConfig = atom.config.get('markdown-preview-plus')
  pdc.path = atomConfig.pandocPath
  config.flavor = atomConfig.pandocMarkdownFlavor
  config.args = {}
  config.opts = {}
  path ?= require 'path'
  config.opts.cwd = path.dirname(filePath) if filePath?
  getMathJaxPath() unless config.mathjax?
  config.args.mathjax = if config.renderMath then config.mathjax else undefined
  if atomConfig.pandocBibliography
    config.args.filter = ['pandoc-citeproc']
    bibFile = findFileRecursive filePath, atomConfig.pandocBIBFile
    bibFile = atomConfig.pandocBIBFileFallback unless bibFile
    config.args.bibliography = if bibFile then bibFile else undefined
    cslFile = findFileRecursive filePath, atomConfig.pandocCSLFile
    cslFile = atomConfig.pandocCSLFileFallback unless cslFile
    config.args.csl = if cslFile then cslFile else undefined
  config

###*
 * Handle error response from pdc
 * @param {error} Returned error
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 ###
handleError = (error, html, stderr) ->
  referenceSearch = /pandoc-citeproc: reference ([\S]+) not found(<br>)?/ig
  [messageArr..., empty] = stderr.split '\n'

  traceRaw =
    messageArr
    .filter (s) -> s.match(/^line \d+:/)

  trace = []
  for s in traceRaw when not s.match(/^line \d+: \[\]$/)
    i = parseInt(s.match(/^line (\d+):/).slice(1)) - 1
    continue if i is 0 and last?
    children = null
    if last? and i <= last
      children = trace.filter (n) -> n.i >= i
      trace = trace.filter (n) -> n.i < i
    # this should work, but Pandoc emits wrong line numbers for child
    # elements, more wrong the deeper the tree.
    # There seems to be no obvious band-aid.
    # trace.push {i, children}
    trace.push {i}
    last = i

  messageArr = messageArr.filter (s) -> not s.match(/^line \d+:/)

  cheerio ?= require 'cheerio'
  o = cheerio.load(html)
  buildMap = (trace) -> (index, element) ->
    t1 = trace[index]
    t2 = trace[index+1]
    t2 ?= t1
    o(element).attr('data-map-lines', [t1.i...t2.i].join(' '))
    if t1.children?
      o(element).children().each buildMap(t1.children)
  o.root().children().each buildMap(trace)
  html = o.html()

  if messageArr.length isnt 0
    message = messageArr.join('<br>')
    html = "<h1>Pandoc Error:</h1><p><b>#{message}</b></p><hr>#{html}"

  handleSuccess html

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
handleResponse = (error, html, stderr) ->
  array = if stderr then handleError error, html, stderr else handleSuccess html
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
  pdc text, config.flavor, 'html', getArguments(config.args), config.opts, handleResponse

getArguments = (args) ->
  args = _.reduce args,
    (res, val, key) ->
      unless _.isEmpty val
        val = _.flatten([val])
        _.forEach val, (v) ->
          res.push "--#{key}=#{v}" unless _.isEmpty v
      return res
    , []
  args = _.union args, atom.config.get('markdown-preview-plus.pandocArguments')
  args.push '--trace'
  args = _.map args,
    (val) ->
      val = val.replace(/^(--[\w\-]+)\s(.+)$/i, "$1=$2")
      if val.substr(0, 1) isnt '-' then undefined else val
  _.reject args, _.isEmpty

module.exports =
  renderPandoc: renderPandoc,
  __testing__:
    findFileRecursive: findFileRecursive
    setPandocOptions: setPandocOptions
    getArguments: getArguments
