_ = require 'underscore-plus'
CP = require 'child_process'
fs = null
path = null

atomConfig = -> atom.config.get('markdown-preview-plus')

###*
 * Sets local mathjaxPath if available
 ###
getMathJaxPath = do ->
  cached = null
  ->
    return cached if cached?
    try
      return cached = require.resolve 'MathJax'
    catch e
      return ''

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

###*
 * Sets local variables needed for everything
 * @param {string} path to markdown file
 *
 ###
setPandocOptions = (filePath, renderMath) ->
  args =
    from: atomConfig().pandocMarkdownFlavor
    to: 'html'
  opts = maxBuffer: Infinity # see https://github.com/atom-community/markdown-preview-plus/issues/316
  path ?= require 'path'
  opts.cwd = path.dirname(filePath) if filePath?
  mathjaxPath = getMathJaxPath()
  args.mathjax = if renderMath then mathjaxPath else undefined
  args.filter = atomConfig().pandocFilters
  if atomConfig().pandocBibliography
    args.filter.push 'pandoc-citeproc'
    bibFile = findFileRecursive filePath, atomConfig().pandocBIBFile
    bibFile = atomConfig().pandocBIBFileFallback unless bibFile
    args.bibliography = if bibFile then bibFile else undefined
    cslFile = findFileRecursive filePath, atomConfig().pandocCSLFile
    cslFile = atomConfig().pandocCSLFileFallback unless cslFile
    args.csl = if cslFile then cslFile else undefined
  {args, opts}

###*
 * Handle error response from Pandoc
 * @param {error} Returned error
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 ###
handleError = (error, html, renderMath) ->
  message =
    _.uniq error.split '\n'
    .join('<br>')
  html = "<h1>Pandoc Error:</h1><pre>#{error}</pre><hr>#{html}"
  handleSuccess html, renderMath

###*
 * Adjusts all math environments in HTML
 * @param {string} HTML to be adjusted
 * @return {string} HTML with adjusted math environments
 ###
handleMath = (html) ->
  doc = document.createElement('div')
  doc.innerHTML = html
  doc.querySelectorAll('.math').forEach (elem) ->
    math = elem.innerText
    # Set mode if it is block math
    mode = if math.indexOf('\\[') > -1  then '; mode=display' else ''

    # Remove sourrounding \[ \] and \( \)
    math = math.replace(/\\[[()\]]/g, '')
    elem.outerHTML =
      '<span class="math">' +
      "<script type='math/tex#{mode}'>#{math}</script>" +
      '</span>'

  doc.innerHTML

removeReferences = (html) ->
  doc = document.createElement('div')
  doc.innerHTML = html
  doc.querySelectorAll('.references').forEach (elem) ->
    elem.remove()
  doc.innerHTML

###*
 * Handle successful response from Pandoc
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 ###
handleSuccess = (html, renderMath) ->
  html = handleMath html if renderMath
  html = removeReferences html if atomConfig().pandocRemoveReferences
  [null, html]

###*
 * Handle response from Pandoc
 * @param {Object} error if thrown
 * @param {string} Returned HTML
 ###
handleResponse = (error, html, renderMath) ->
  if error then handleError error, html, renderMath else handleSuccess html, renderMath

###*
 * Renders markdown with pandoc
 * @param {string} document in markdown
 * @param {boolean} whether to render the math with mathjax
 * @param {function} callbackFunction
 ###
renderPandoc = (text, filePath, renderMath, cb) ->
  {args, opts} = setPandocOptions filePath, renderMath
  cp = CP.execFile atomConfig().pandocPath, getArguments(args), opts, (error, stdout, stderr) ->
    if (error)
      atom.notifications.addError error.toString(),
        stack: error.stack
        dismissable: true
    cbargs = handleResponse (stderr ? ''), (stdout ? ''), renderMath
    cb cbargs...
  cp.stdin.write(text)
  cp.stdin.end()

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
