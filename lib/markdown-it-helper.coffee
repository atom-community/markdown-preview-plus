
markdownItOptions =
  html: true
  xhtmlOut: false
  breaks: atom.config.get('markdown-preview-plus.breakOnSingleNewline')
  langPrefix: 'lang-'
  linkify: true
  typographer: true

mathInline = (string) -> "<span class='math'><script type='math/tex'>#{string}</script></span>"
mathBlock = (string) -> "<span class='math'><script type='math/tex; mode=display'>#{string}</script></span>"

mathDollars =
  inlineOpen: '$'
  inlineClose: '$'
  blockOpen: '$$'
  blockClose: '$$'
  inlineRenderer: mathInline
  blockRenderer: mathBlock

mathBrackets =
  inlineOpen: '\\('
  inlineClose: '\\)'
  blockOpen: '\\['
  blockClose: '\\]'
  inlineRenderer: mathInline
  blockRenderer: mathBlock

markdownIt = require('markdown-it')(markdownItOptions)

math = require('markdown-it-math')

markdownIt.use math, mathDollars
markdownIt.use math, mathBrackets

module.exports = (text) ->
  markdownIt.render text
