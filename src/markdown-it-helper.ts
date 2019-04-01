import markdownItModule = require('markdown-it')
import Token = require('markdown-it/lib/token')
import * as twemoji from 'twemoji'
import * as path from 'path'
import { pairUp, atomConfig } from './util'
import { isEqual } from 'lodash'

type InitState = Readonly<ReturnType<typeof currentConfig>>

function mathInline(text: string) {
  return `<span class='math inline-math'><script type='math/tex'>${text}</script></span>`
}

function mathBlock(text: string) {
  return `<span class='math display-math'><script type='math/tex; mode=display'>${text}</script></span>`
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
    imsize: config.useImsize,
    inlineMathSeparators: config.inlineMathSeparators,
    blockMathSeparators: config.blockMathSeparators,
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

  // tslint:disable:no-unsafe-any
  if (initState.lazyHeaders) markdownIt.use(require('markdown-it-lazy-headers'))
  if (initState.checkBoxes) markdownIt.use(require('markdown-it-task-lists'))
  if (initState.toc) {
    markdownIt.use(require('markdown-it-anchor'))
    markdownIt.use(require('markdown-it-table-of-contents'))
  }

  if (initState.emoji) {
    markdownIt.use(require('markdown-it-emoji'))
    markdownIt.renderer.rules.emoji = function(token, idx) {
      return twemoji.parse(token[idx].content, {
        folder: 'svg',
        ext: '.svg',
        base: path.dirname(require.resolve('twemoji')) + path.sep,
      })
    }
  }

  if (initState.criticMarkup) {
    markdownIt.use(require('./markdown-it-criticmarkup'))
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

export function getTokens(text: string, rL: boolean): Token[] {
  const markdownIt = initIfNeeded(currentConfig(rL))
  return markdownIt!.parse(text, {})
}
