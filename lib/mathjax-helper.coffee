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
    script.src    = require.resolve('MathJax/MathJax')+"?delayStartupUntil=configured"
    document.getElementsByTagName("head")[0].appendChild(script)
    return

  #
  # Process DOM elements for LaTeX equations with MathJax
  #
  # @param domElements An array of DOM elements to be processed by MathJax. See
  #   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
  #   details on DOM elements.
  #
  mathProcessor: (domElements) ->
    if MathJax
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
