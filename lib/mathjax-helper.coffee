#
# mathjax-helper
#
# This module will handle loading the MathJax environment and provide a wrapper
# for calls to MathJax to process LaTeX equations.
#

cheerio = require 'cheerio'
path    = require 'path'
CSON    = require 'season'
fs      = require 'fs-plus'

module.exports =
  #
  # Load MathJax environment
  #
  loadMathJax: ->
    script = document.createElement("script")
    script.addEventListener "load", ->
      configureMathJax()
    script.type   = "text/javascript"
    try
      # atom.packages.resolvePackagePath('mathjax-wrapper') doesn't work but
      # does for other packages? Nor does 'atom://mathjax-wrapper' work (I get
      # CSP errors). getLoaded over getActive is important.
      mathjaxPath = atom.packages.getLoadedPackage('mathjax-wrapper')
      script.src  = path.join(
        mathjaxPath.path,
        "node_modules/MathJax/MathJax.js?delayStartupUntil=configured" )
      document.getElementsByTagName("head")[0].appendChild(script)
    finally
      return
    return

  #
  # Process DOM elements for LaTeX equations with MathJax
  #
  # @param domElements An array of DOM elements to be processed by MathJax. See
  #   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
  #   details on DOM elements.
  #
  mathProcessor: (domElements) ->
    if MathJax?
      MathJax.Hub.Queue ["Typeset", MathJax.Hub, domElements]
    else
      atom.notifications.addInfo """
        It looks like your trying to render maths but
        [`markdown-preview-plus`](https://atom.io/packages/markdown-preview-plus)
        cannot find its maths rendering engine right now. Please make sure that
        you have installed
        [`mathjax-wrapper`](https://atom.io/packages/mathjax-wrapper) and try
        re-opening your markdown preview.
        """, dismissable: true
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
    messageStyle: "none"
    showMathMenu: false
    skipStartupTypeset: true
  MathJax.Hub.Configured()
  return
