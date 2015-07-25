
markdownItOptions =
  html: true
  xhtmlOut: false
  breaks: atom.config.get('markdown-preview-plus.breakOnSingleNewline')
  langPrefix: 'lang-'
  linkify: true
  typographer: true

mathInline = (string) -> "<script type='math/tex'>#{string}</script>"
mathBlock = (string) -> "<script type='math/tex; mode=display'>#{string}</script>"

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
