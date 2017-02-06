markdownIt = null
markdownItOptions = null
renderLaTeX = null
math = null
lazyHeaders = null

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

getOptions = ->
  html: true
  xhtmlOut: false
  breaks: atom.config.get('markdown-preview-plus.breakOnSingleNewline')
  langPrefix: 'lang-'
  linkify: true
  typographer: true


init = (rL) ->

  renderLaTeX = rL

  markdownItOptions = getOptions()

  markdownIt = require('markdown-it')(markdownItOptions)

  if renderLaTeX
    math ?= require('markdown-it-math')
    markdownIt.use math, mathDollars
    markdownIt.use math, mathBrackets

  markdownIt.core.ruler.push 'logger', (state) ->
    return state unless state.env.sourceMap
    recurse = (token) ->
      if token.children?
        token.children = token.children.map(recurse)
      if token.map?
        token.attrSet('data-map-lines', [token.map[0]...token.map[1]].join(' '))
        return token
      else
        return token
    state.tokens = state.tokens.map(recurse)
    return state

  lazyHeaders = atom.config.get('markdown-preview-plus.useLazyHeaders')

  if lazyHeaders
    markdownIt.use require('markdown-it-lazy-headers')


needsInit = (rL) ->
  not markdownIt? or
  markdownItOptions.breaks isnt atom.config.get('markdown-preview-plus.breakOnSingleNewline') or
  lazyHeaders isnt atom.config.get('markdown-preview-plus.useLazyHeaders') or
  rL isnt renderLaTeX

exports.render = (text, {renderLaTeX, sourceMap} = {}) ->
  init(renderLaTeX) if needsInit(renderLaTeX)
  markdownIt.render text, {sourceMap}

exports.decode = (url) ->
  markdownIt.normalizeLinkText url

exports.getTokens = (text, rL) ->
  init(rL) if needsInit(rL)
  markdownIt.parse text, {}
