#
# mathjax-helper
#
# This module will handle loading the MathJax environment, and attaching
# the appropriate event listeners to markdown-preview pane items so that
# latex display equations can be rendered.
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
  # Prepare LaTeX equations to be passed through the markdown parser and
  # protect from being processed for markdown.
  #
  # @param text String of source markdown containing LaTeX equations.
  #
  preprocessor: (text) ->
    # Begining of file cannot begin with $, prepend with '\n' if is so
    if text.charAt(0) is '$'
      text = ['\n', text].join('')

    # End of file cannot end with $, postfix with '\n' if is so
    if text.charAt(text.length-1) is '$'
      text = [text, '\n'].join('')

    # Parse displayed equations
    regex       = /^(?:\$\$|\\\[)[^\S\n]*\n((?:[^\n]*\n+)*?)^(?:\$\$|\\\])[^\S\n]*(?=\n)/gm
    parsedText  = text.replace(regex, "\n\n<span class=\"math\">`<script type=\"math/tex; mode=display\">$1</script>`</span>\n\n")

    # Parse inline equations
    regex = /([^\\\$])\$(?!\$)([\s\S]*?)([^\\])\$/gm
    parsedText = parsedText.replace( regex, "$1<span class=\"math\">`<script type=\"math/tex\">$2$3</script>`</span>")

    # Parse escaped $
    regex = /[\\]\$/gm
    parsedText = parsedText.replace( regex, "$")

    return parsedText

  #
  # Remove <code> tags added to protect LaTeX equations from processing when
  # they were passed through the markdown parser
  #
  # @param html String of parsed markdown containing LaTeX equations.
  # @param callback Callback taking arguments (error, html) where html is a
  #   string representation of the parsed markdown.
  #
  postprocessor: (html, callback) ->
    o = cheerio.load(html.html())
    regex = /(?:<code>|<\/code>)/gm
    o("span[class='math']").contents().replaceWith () ->
      # The .text decodes the HTML entities for &,<,> as in code blocks the
      # are automatically converted into HTML entities
      o(this).text().replace regex, (match) ->
        switch match
          when '<code>'   then ''
          when '</code>'  then ''
          else ''

    callback(null, o.html())
    return

  #
  # Process DOM elements for LaTeX equations with MathJax
  #
  # @param domElements An array of DOM elements to be processed by MathJax. See
  #   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
  #   details on DOM elements.
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
