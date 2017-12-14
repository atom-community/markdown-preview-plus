import markdownItModule = require('markdown-it')
let markdownIt: markdownItModule.MarkdownIt | null = null
let markdownItOptions: markdownItModule.Options | null = null
let renderLaTeX: boolean | null = null
let math: any = null
let lazyHeaders: any = null

const mathInline = (text: string) =>
  `<span class='math'><script type='math/tex'>${text}</script></span>`
const mathBlock = (text: string) =>
  `<span class='math'><script type='math/tex; mode=display'>${text}</script></span>`

const mathDollars = {
  inlineOpen: '$',
  inlineClose: '$',
  blockOpen: '$$',
  blockClose: '$$',
  inlineRenderer: mathInline,
  blockRenderer: mathBlock,
}

const mathBrackets = {
  inlineOpen: '\\(',
  inlineClose: '\\)',
  blockOpen: '\\[',
  blockClose: '\\]',
  inlineRenderer: mathInline,
  blockRenderer: mathBlock,
}

const getOptions = () => ({
  html: true,
  xhtmlOut: false,
  breaks: atom.config.get('markdown-preview-plus.breakOnSingleNewline'),
  langPrefix: 'lang-',
  linkify: true,
  typographer: true,
})

const init = function(rL: boolean) {
  renderLaTeX = rL

  markdownItOptions = getOptions()

  markdownIt = markdownItModule(markdownItOptions)

  if (renderLaTeX) {
    if (math == null) {
      math = require('markdown-it-math')
    }
    markdownIt.use(math, mathDollars)
    markdownIt.use(math, mathBrackets)
  }

  lazyHeaders = atom.config.get('markdown-preview-plus.useLazyHeaders')

  if (lazyHeaders) {
    markdownIt.use(require('markdown-it-lazy-headers'))
  }
}

const needsInit = (rL: boolean) =>
  markdownIt == null ||
  markdownItOptions == null ||
  markdownItOptions.breaks !==
    atom.config.get('markdown-preview-plus.breakOnSingleNewline') ||
  lazyHeaders !== atom.config.get('markdown-preview-plus.useLazyHeaders') ||
  rL !== renderLaTeX

export function render(text: string, rL: boolean) {
  if (needsInit(rL)) {
    init(rL)
  }
  return markdownIt!.render(text)
}

export function decode(url: string) {
  return markdownIt.normalizeLinkText(url)
}

export function getTokens(text: string, rL: boolean) {
  if (needsInit(rL)) {
    init(rL)
  }
  return markdownIt!.parse(text, {})
}
