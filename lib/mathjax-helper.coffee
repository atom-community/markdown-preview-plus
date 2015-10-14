#
# mathjax-helper
#
# This module will handle loading the MathJax environment and provide a wrapper
# for calls to MathJax to process LaTeX equations.
#

{$}     = require 'atom-space-pen-views'
cheerio = require 'cheerio'
path    = require 'path'
CSON    = require 'season'
fs      = require 'fs-plus'
_       = require 'underscore-plus'

module.exports =
  #
  # Load MathJax environment
  #
  # @param listener Optional method to call when the MathJax script was been
  #   loaded to the window. The method is passed no arguments.
  #
  loadMathJax: (listener) ->
    script = @attachMathJax()
    if listener? then script.addEventListener "load", -> listener()
    return

  #
  # Attach main MathJax script to the document
  #
  attachMathJax: _.once -> attachMathJax()

  #
  # Remove MathJax from the document and reset attach method
  #
  resetMathJax: ->
    # Detach MathJax from the document
    $('script[src*="MathJax.js"]').remove()
    window.MathJax = undefined

    # Reset attach for any subsequent calls
    @attachMathJax = _.once -> attachMathJax()

  #
  # Process DOM elements for LaTeX equations with MathJax
  #
  # @param domElements An array of DOM elements to be processed by MathJax. See
  #   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
  #   details on DOM elements.
  #
  mathProcessor: (domElements) ->
    if MathJax?
    then MathJax.Hub.Queue ["Typeset", MathJax.Hub, domElements]
    else @loadMathJax -> MathJax.Hub.Queue ["Typeset", MathJax.Hub, domElements]
    return

  #
  # Process maths in HTML fragment with MathJax
  #
  # @param html A HTML fragment string
  # @param callback A callback method that accepts a single parameter, a HTML
  #   fragment string that is the result of html processed by MathJax
  #
  processHTMLString: (html, callback) ->
    element = document.createElement('div')
    element.innerHTML = html

    compileProcessedHTMLString = ->
      svgGlyphs = document.getElementById('MathJax_SVG_Hidden')?.parentNode.cloneNode(true)
      element.insertBefore(svgGlyphs, element.firstChild) if svgGlyphs?
      return element.innerHTML

    queueProcessHTMLString = ->
      MathJax.Hub.Queue(
        ["setRenderer", MathJax.Hub, "SVG"],
        ["Typeset", MathJax.Hub, element],
        ["setRenderer", MathJax.Hub, "HTML-CSS"],
        [ -> callback compileProcessedHTMLString()]
      )

    if MathJax?
    then queueProcessHTMLString()
    else @loadMathJax queueProcessHTMLString

    return

#
# Define some functions to help get a hold of the user's Latex
# Macros.
#
namePattern = ///             # The name of a macro can be either
              ^[^a-zA-Z\d\s]$ # a single non-alphanumeric character
              |               # or
              ^[a-zA-Z]*$     # any number of lower and upper case
              ///             # letters, but no numerals.

getUserMacrosPath = ->
  userMacrosPath =  CSON.resolve(path.join(atom.getConfigDirPath(), 'markdown-preview-plus'))
  userMacrosPath ? path.join(atom.getConfigDirPath(), 'markdown-preview-plus.cson')

loadMacrosFile = (filePath) ->
  return {} unless CSON.isObjectPath(filePath)
  CSON.readFileSync filePath, (error, object={}) ->
    if error?
      console.warn "Error reading Latex Macros file '#{filePath}': #{error.stack ? error}"
      atom.notifications?.addError("Failed to load Latex Macros from '#{filePath}'", {detail: error.message, dismissable: true})
    object

loadUserMacros = ->
  userMacrosPath = getUserMacrosPath()
  if fs.isFileSync(userMacrosPath)
    result = loadMacrosFile(userMacrosPath)
  else
    console.log "Creating markdown-preview-plus.cson, this is a one-time operation."
    createMacrosTemplate(userMacrosPath)
    result = loadMacrosFile(userMacrosPath)

createMacrosTemplate = (filePath) ->
  templatePath = path.join(__dirname, "../assets/macros-template.cson")
  templateFile = fs.readFileSync templatePath, 'utf8'
  fs.writeFileSync filePath, templateFile

checkMacros = (macrosObject) ->
  for name, value of macrosObject
    unless name.match(namePattern) and valueMatchesPattern(value)
      delete macrosObject[name]
      atom.notifications?.addError("Failed to load LaTeX macro named '#{name}'. Please see the [LaTeX guide](https://github.com/Galadirith/markdown-preview-plus/blob/master/LATEX.md#macro-names)", {dismissable: true})
  macrosObject

valueMatchesPattern = (value) ->
  # Different check based on whether value is string or array
  switch
    # If it is an array then it should be [string, integer]
    when Object::toString.call(value) is '[object Array]'
      macroDefinition = value[0]
      numberOfArgs = value[1]
      if typeof numberOfArgs  is 'number'
        numberOfArgs % 1 is 0 and typeof macroDefinition is 'string'
      else
        false
    # If it is just a string then that's OK, any string is acceptable
    when typeof value is 'string'
      true
    else false

# Configure MathJax environment. Similar to the TeX-AMS_HTML configuration with
# a few unnecessary features stripped away
#
configureMathJax = ->
  userMacros = loadUserMacros()
  if userMacros
    userMacros = checkMacros(userMacros)
  else
    userMacros = {}

  #Now Configure MathJax
  MathJax.Hub.Config
    jax: [
      "input/TeX",
      "output/HTML-CSS"
    ]
    extensions: []
    TeX:
      extensions: [
        "AMSmath.js",
        "AMSsymbols.js",
        "noErrors.js",
        "noUndefined.js"
      ]
      Macros: userMacros
    "HTML-CSS":
      availableFonts: []
      webFont: "TeX"
    messageStyle: "none"
    showMathMenu: false
    skipStartupTypeset: true
  MathJax.Hub.Configured()

  # Notify user MathJax has loaded
  atom.notifications.addSuccess "Loaded maths rendering engine MathJax", dismissable: true

  return

#
# Attach main MathJax script to the document
#
attachMathJax = ->
  # Notify user MathJax is loading
  atom.notifications.addInfo "Loading maths rendering engine MathJax", dismissable: true

  # Attach MathJax script
  script      = document.createElement("script")
  script.src  = "#{require.resolve('MathJax')}?delayStartupUntil=configured"
  script.type = "text/javascript"
  script.addEventListener "load", -> configureMathJax()
  document.getElementsByTagName("head")[0].appendChild(script)

  return script
