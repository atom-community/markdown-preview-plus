import markdownItModule = require('markdown-it')
import twemoji = require('twemoji')
import * as path from 'path'
import { pairUp } from './util'
import * as _ from 'lodash'
import { ConfigValues } from 'atom'
let markdownIt: markdownItModule.MarkdownIt | null = null
type Config = ConfigValues['markdown-preview-plus']
type InitState = Readonly<{
  renderLaTeX: boolean
  lazyHeaders: Config['useLazyHeaders']
  checkBoxes: Config['useCheckBoxes']
  emoji: Config['useEmoji']
  breaks: Config['breakOnSingleNewline']
  inlineMathSeparators: Config['inlineMathSeparators']
  blockMathSeparators: Config['blockMathSeparators']
}>
let initState: InitState | null = null

function mathInline(text: string) {
  return `<span class='math'><script type='math/tex'>${text}</script></span>`
}

function mathBlock(text: string) {
  return `<span class='math'><script type='math/tex; mode=display'>${text}</script></span>`
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

function currentConfig(rL: boolean): InitState {
  const config = atom.config.get('markdown-preview-plus')
  return {
    renderLaTeX: rL,
    lazyHeaders: config.useLazyHeaders,
    checkBoxes: config.useCheckBoxes,
    emoji: config.useEmoji,
    breaks: config.breakOnSingleNewline,
    inlineMathSeparators: config.inlineMathSeparators,
    blockMathSeparators: config.blockMathSeparators,
  }
}

function init(rL: boolean) {
  initState = currentConfig(rL)
  markdownIt = markdownItModule(getOptions(initState.breaks))

  if (rL) {
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

  if (initState.lazyHeaders) {
    markdownIt.use(require('markdown-it-lazy-headers'))
  }

  if (initState.checkBoxes) {
    markdownIt.use(require('markdown-it-task-lists'))
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
}

function needsInit(rL: boolean) {
  return (
    markdownIt === null ||
    initState === null ||
    !_.isEqual(initState, currentConfig(rL))
  )
}

export function render(text: string, rL: boolean) {
  if (needsInit(rL)) init(rL)
  return markdownIt!.render(text)
}

export function decode(url: string) {
  if (!markdownIt) throw new Error('markdownIt not initialized')
  return markdownIt.normalizeLinkText(url)
}

export function getTokens(text: string, rL: boolean) {
  if (needsInit(rL)) init(rL)
  return markdownIt!.parse(text, {})
}
