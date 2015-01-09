#
# mathjax-helper
#
# This module will handle loading the MathJax environment and provide a wrapper
# for calls to MathJax to process LaTeX equations.
#

cheerio = require 'cheerio'
path    = require 'path'

module.exports =
  #
  # Load MathJax environment
  #
  loadMathJax: ->
    script = document.createElement("script")
    script.addEventListener "load", () ->
      configureMathJax()
    script.type   = "text/javascript";
    try
      # atom.packages.resolvePackagePath('mathjax-wrapper') doesnt work but
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
    return

#
# Configure MathJax environment. Similar to the TeX-AMS_HTML configuration with
# a few unnessesary features stripped away
#
configureMathJax = ->
  MathJax.Hub.Config
    jax: ["input/TeX","output/HTML-CSS"]
    extensions: []
    TeX:
      extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
    messageStyle: "none"
    showMathMenu: false
  MathJax.Hub.Configured()
  return
