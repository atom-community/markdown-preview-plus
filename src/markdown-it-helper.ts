import markdownItModule = require('markdown-it')
import Token = require('markdown-it/lib/token')
import * as twemoji from 'twemoji'
import * as path from 'path'
import { pairUp, atomConfig } from './util'
import { isEqual } from 'lodash'

type InitState = Readonly<ReturnType<typeof currentConfig>>

function mathInline(tok: Token) {
  return `<span class='math inline-math'><script type='math/tex'>${tok.content}</script></span>`
}

function mathBlock(tok: Token) {
  let attrs = tok.attrs && tok.attrs.map(([n, v]) => `${n}="${v}"`).join(' ')
  if (!attrs) attrs = ''
  else attrs = ' ' + attrs
  return `<span class='math display-math'${attrs}><script type='math/tex; mode=display'>${tok.content}</script></span>`
}

function addSourceMapData(token: Token) {
  if (token.map && token.nesting >= 0) {
    token.attrSet('data-source-lines', `${token.map[0]} ${token.map[1]}`)
  }
  return token
}

function recurseTokens(fn: (t: Token) => Token) {
  const rf = function(token: Token) {
    if (token.children) token.children = token.children.map(rf)
    fn(token)
    return token
  }
  return rf
}

function sourceLineData(md: markdownItModule) {
  md.core.ruler.push('logger', function(state: any): any {
    // tslint:disable-next-line: no-unsafe-any
    if (!state.env.sourceMap) return state
    // tslint:disable-next-line: no-unsafe-any
    state.tokens = state.tokens.map(recurseTokens(addSourceMapData))
    return state
  })
}

function getOptions(breaks: boolean) {
  return {
    html: true,
    xhtmlOut: false,
    breaks,
    langPrefix: 'lang-',
    linkify: true,
    typographer: true,
  }
}

function currentConfig(rL: boolean) {
  const config = atomConfig().markdownItConfig
  return {
    renderLaTeX: rL,
    lazyHeaders: config.useLazyHeaders,
    checkBoxes: config.useCheckBoxes,
    toc: config.useToc,
    emoji: config.useEmoji,
    breaks: config.breakOnSingleNewline,
    criticMarkup: config.useCriticMarkup,
    footnote: config.useFootnote,
    imsize: config.useImsize,
    inlineMathSeparators: config.inlineMathSeparators,
    blockMathSeparators: config.blockMathSeparators,
    forceFullToc: config.forceFullToc,
    tocDepth: config.tocDepth,
  }
}

function init(initState: InitState): markdownItModule {
  const markdownIt = markdownItModule(getOptions(initState.breaks))

  if (initState.renderLaTeX) {
    const inlineDelim = pairUp(
      initState.inlineMathSeparators,
      'inlineMathSeparators',
    )
    const blockDelim = pairUp(
      initState.blockMathSeparators,
      'blockMathSeparators',
    )
    // tslint:disable-next-line:no-unsafe-any
    markdownIt.use(require('./markdown-it-math').math_plugin, {
      inlineDelim,
      blockDelim,
      inlineRenderer: mathInline,
      blockRenderer: mathBlock,
    })
  }

  markdownIt.use(sourceLineData)

  // tslint:disable:no-unsafe-any
  if (initState.lazyHeaders) markdownIt.use(require('markdown-it-lazy-headers'))
  if (initState.checkBoxes) markdownIt.use(require('markdown-it-task-lists'))
  if (initState.toc) {
    markdownIt.use(require('markdown-it-anchor'))
    markdownIt.use(require('markdown-it-table-of-contents'), {
      includeLevel: Array.from({ length: initState.tocDepth }, (_, i) => i + 1),
      forceFullToc: initState.forceFullToc,
    })
  }

  if (initState.emoji) {
    markdownIt.use(require('markdown-it-emoji'))
    markdownIt.renderer.rules.emoji = function(token, idx) {
      return twemoji.parse(token[idx].content, {
        folder: path.join('assets', 'svg'),
        ext: '.svg',
        base: path.dirname(require.resolve('twemoji-assets')) + path.sep,
      })
    }
  }

  if (initState.criticMarkup) {
    markdownIt.use(require('./markdown-it-criticmarkup'))
  }
  if (initState.footnote) {
    markdownIt.use(require('markdown-it-footnote'))
  }
  if (initState.imsize) markdownIt.use(require('markdown-it-imsize'))
  // tslint:enable:no-unsafe-any

  return markdownIt
}

function wrapInitIfNeeded(initf: typeof init): typeof init {
  let markdownIt: markdownItModule | null = null
  let initState: InitState | null = null

  return function(newState: InitState) {
    if (markdownIt === null || !isEqual(initState, newState)) {
      initState = newState
      markdownIt = initf(newState)
    }
    return markdownIt
  }
}

const initIfNeeded = wrapInitIfNeeded(init)

export function render(text: string, rL: boolean) {
  const markdownIt = initIfNeeded(currentConfig(rL))
  return markdownIt.render(text)
}

export function getTokens(text: string, rL: boolean) {
  const markdownIt = initIfNeeded(currentConfig(rL))
  return markdownIt.render(text, { sourceMap: true })
}
