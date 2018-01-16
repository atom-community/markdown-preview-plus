import markdownItModule = require('markdown-it')
import twemoji = require('twemoji')
import * as path from 'path'
import { pairUp } from './util'
import * as _ from 'lodash'
let markdownIt: markdownItModule.MarkdownIt | null = null
let markdownItOptions: markdownItModule.Options | null = null
let renderLaTeX: boolean | null = null
let math: any = null
let lazyHeaders: any = null
let checkBoxes: any = null
let emoji: any = null
let inlineMathSeparators: any = null
let blockMathSeparators: any = null

const mathInline = (text: string) =>
  `<span class='math'><script type='math/tex'>${text}</script></span>`
const mathBlock = (text: string) =>
  `<span class='math'><script type='math/tex; mode=display'>${text}</script></span>`

const getOptions = () => ({
  html: true,
  xhtmlOut: false,
  breaks: atom.config.get('markdown-preview-plus.breakOnSingleNewline'),
  langPrefix: 'lang-',
  linkify: true,
  typographer: true,
})

function init(rL: boolean) {
  renderLaTeX = rL

  markdownItOptions = getOptions()

  markdownIt = markdownItModule(markdownItOptions)

  if (renderLaTeX) {
    if (math == null) {
      // tslint:disable-next-line:no-unsafe-any
      math = require('./markdown-it-math').math_plugin
    }
    const inlineDelim = pairUp(
      (inlineMathSeparators = atom.config.get(
        'markdown-preview-plus.inlineMathSeparators',
      )),
      'inlineMathSeparators',
    )
    const blockDelim = pairUp(
      (blockMathSeparators = atom.config.get(
        'markdown-preview-plus.blockMathSeparators',
      )),
      'blockMathSeparators',
    )
    markdownIt.use(math, {
      inlineDelim,
      blockDelim,
      inlineRenderer: mathInline,
      blockRenderer: mathBlock,
    })
  }

  lazyHeaders = atom.config.get('markdown-preview-plus.useLazyHeaders')

  if (lazyHeaders) {
    markdownIt.use(require('markdown-it-lazy-headers'))
  }

  checkBoxes = atom.config.get('markdown-preview-plus.useCheckBoxes')

  if (checkBoxes) {
    markdownIt.use(require('markdown-it-task-lists'))
  }

  emoji = atom.config.get('markdown-preview-plus.useEmoji')

  if (emoji) {
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

const needsInit = (rL: boolean) =>
  markdownIt === null ||
  markdownItOptions === null ||
  markdownItOptions.breaks !==
    atom.config.get('markdown-preview-plus.breakOnSingleNewline') ||
  lazyHeaders !== atom.config.get('markdown-preview-plus.useLazyHeaders') ||
  checkBoxes !== atom.config.get('markdown-preview-plus.useCheckBoxes') ||
  emoji !== atom.config.get('markdown-preview-plus.emoji') ||
  rL !== renderLaTeX ||
  !_.isEqual(
    inlineMathSeparators,
    atom.config.get('markdown-preview-plus.inlineMathSeparators'),
  ) ||
  !_.isEqual(
    blockMathSeparators,
    atom.config.get('markdown-preview-plus.blockMathSeparators'),
  )

export function render(text: string, rL: boolean) {
  if (needsInit(rL)) {
    init(rL)
  }
  return markdownIt!.render(text)
}

export function decode(url: string) {
  if (!markdownIt) throw new Error('markdownIt not initialized')
  return markdownIt.normalizeLinkText(url)
}

export function getTokens(text: string, rL: boolean) {
  if (needsInit(rL)) {
    init(rL)
  }
  return markdownIt!.parse(text, {})
}
