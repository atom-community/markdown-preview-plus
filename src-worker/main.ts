import markdownItModule from 'markdown-it'
import Token from 'markdown-it/lib/token'
import * as twemoji from 'twemoji'
import { isEqual } from 'lodash'
import { MathMeta } from './markdown-it-math'
import { MessageToWorker, MessageFromWorker } from './ipc'

let config = {
  useLazyHeaders: true,
  useCheckBoxes: true,
  useToc: false,
  useEmoji: true,
  breakOnSingleNewline: false,
  typographicReplacements: true,
  useCriticMarkup: false,
  useFootnote: true,
  useImsize: false,
  inlineMathSeparators: ['$', '$'],
  blockMathSeparators: ['$$', '$$'],
  tocDepth: 0,
  useAttributes: true,
  useSpans: true,
  useDivs: true,
  useDeflist: true,
  useFontmatter: true,
  useImplicitFigures: true,
  useSubscript: true,
  useSuperscript: true,
  parseDisplayMathInline: true,
  tableCaptions: true,
}

type MyMessageEvent = Omit<MessageEvent, 'data'> & { data: MessageToWorker }
type PostMessageT = typeof globalThis.postMessage
type Params = PostMessageT extends (a: any, ...args: infer P) => any ? P : never
type MyPostMessageT = (
  message: MessageFromWorker,
  ...args: Params
) => ReturnType<PostMessageT>

const postMessage: MyPostMessageT = globalThis.postMessage

onmessage = function (evt: MyMessageEvent) {
  const data = evt.data
  switch (data.cmd) {
    case 'config':
      config = data.arg
      break
    case 'render':
      postMessage({
        cmd: 'render',
        id: data.id,
        result: render(data.text, data.rL),
      })
      break
    case 'getTokens':
      postMessage({
        cmd: 'getTokens',
        id: data.id,
        result: getTokens(data.text, data.rL),
      })
      break
  }
}

function pairUp<T>(arr: T[], option: string): Array<[T, T]> {
  if (arr.length % 2 !== 0) {
    postMessage({ evt: 'odd-separators', arr, option })
  }

  return arr.reduce<Array<[T, T]>>(function (result, _value, index, array) {
    if (index % 2 === 0) result.push([array[index], array[index + 1]])
    return result
  }, [])
}

type InitState = Readonly<ReturnType<typeof currentConfig>>

function mathInline(tok: Token) {
  return `<span class='math inline-math'><script type='math/tex'>${
    (tok.meta as MathMeta).rawContent
  }</script></span>`
}

function mathBlock(tok: Token) {
  let attrs = tok.attrs && tok.attrs.map(([n, v]) => `${n}="${v}"`).join(' ')
  if (!attrs) attrs = ''
  else attrs = ' ' + attrs
  return `<span class='math display-math'${attrs}><script type='math/tex; mode=display'>${
    (tok.meta as MathMeta).rawContent
  }</script></span>`
}

function addSourceMapData(token: Token) {
  if (token.map && token.nesting >= 0) {
    token.attrSet('data-source-lines', `${token.map[0]} ${token.map[1]}`)
  }
  return token
}

function recurseTokens(fn: (t: Token) => Token) {
  const rf = function (token: Token) {
    if (token.children) token.children = token.children.map(rf)
    fn(token)
    return token
  }
  return rf
}

function sourceLineData(md: markdownItModule) {
  md.core.ruler.push('logger', function (state: any): any {
    // tslint:disable-next-line: no-unsafe-any
    if (!state.env.sourceMap) return state
    // tslint:disable-next-line: no-unsafe-any
    state.tokens = state.tokens.map(recurseTokens(addSourceMapData))
    return state
  })
}

function getOptions(opts: {
  breaks: boolean
  typographer: boolean
}): markdownItModule.Options {
  return {
    html: true,
    xhtmlOut: false,
    langPrefix: 'lang-',
    linkify: true,
    ...opts,
  }
}

function currentConfig(rL: boolean) {
  return {
    renderLaTeX: rL,
    lazyHeaders: config.useLazyHeaders,
    checkBoxes: config.useCheckBoxes,
    toc: config.useToc,
    emoji: config.useEmoji,
    breaks: config.breakOnSingleNewline,
    typographer: config.typographicReplacements,
    criticMarkup: config.useCriticMarkup,
    footnote: config.useFootnote,
    imsize: config.useImsize,
    inlineMathSeparators: config.inlineMathSeparators,
    blockMathSeparators: config.blockMathSeparators,
    tocDepth: config.tocDepth,
    attributes: config.useAttributes, // "markdown-it-attrs"
    spans: config.useSpans, // "markdown-it-bracketed-spans"
    divs: config.useDivs, // "markdown-it-container"
    deflist: config.useDeflist, // "markdown-it-deflist"
    fontmatter: config.useFontmatter, // "markdown-it-front-matter"
    implicitFigures: config.useImplicitFigures, // "markdown-it-implicit-figures"
    subscript: config.useSubscript, // "markdown-it-sub"
    superscript: config.useSuperscript, // "markdown-it-sup"
    parseDisplayMathInline: config.parseDisplayMathInline,
    tableCaptions: config.tableCaptions,
  }
}

function init(initState: InitState): markdownItModule {
  const markdownIt = markdownItModule(
    getOptions({
      breaks: initState.breaks,
      typographer: initState.typographer,
    }),
  )

  let inlineDelim: [string, string][] = []
  if (initState.renderLaTeX) {
    inlineDelim = pairUp(initState.inlineMathSeparators, 'inlineMathSeparators')
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
      parseDisplayMathInline: initState.parseDisplayMathInline,
    })
  }

  markdownIt.use(sourceLineData)

  if (initState.renderLaTeX || initState.tableCaptions) {
    // tslint:disable-next-line: no-unsafe-any
    markdownIt.use(require('./markdown-it-table').makeTable, {
      inlineDelim,
      caption: initState.tableCaptions,
    })
  }

  // tslint:disable:no-unsafe-any
  if (initState.lazyHeaders) markdownIt.use(require('markdown-it-lazy-headers'))
  if (initState.checkBoxes) markdownIt.use(require('markdown-it-task-lists'))
  if (initState.toc) {
    markdownIt.use(require('markdown-it-anchor'))
    markdownIt.use(require('markdown-it-table-of-contents'), {
      includeLevel: Array.from({ length: initState.tocDepth }, (_, i) => i + 1),
    })
  }

  if (initState.emoji) {
    markdownIt.use(require('markdown-it-emoji'))
    markdownIt.renderer.rules.emoji = function (token, idx) {
      return twemoji.parse(token[idx].content, {
        folder: 'assets/svg',
        ext: '.svg',
        base: 'atom://markdown-preview-plus/node_modules/twemoji-assets/',
      })
    }
  }

  if (initState.criticMarkup) {
    markdownIt.use(require('./markdown-it-criticmarkup').criticMarkup)
  }
  if (initState.footnote) {
    markdownIt.use(require('markdown-it-footnote'))
  }
  if (initState.imsize) {
    markdownIt.use(require('./markdown-it-imsize').imsize_plugin)
  }
  if (initState.spans) {
    markdownIt.use(require('markdown-it-bracketed-spans'))
  }
  if (initState.divs || initState.spans || initState.attributes) {
    markdownIt.use(require('markdown-it-attrs'))
  }
  if (initState.divs) {
    markdownIt.use(require('markdown-it-container'), 'dynamic', {
      // adapted from https://github.com/markdown-it/markdown-it-container/issues/23
      validate: () => true,
      render: function (
        tokens: { [x: string]: any },
        idx: string | number,
        _options: any,
        _env: any,
        slf: { renderAttrs: (arg0: any) => any },
      ) {
        const token = tokens[idx]
        const className = token.info.trim()
        const renderedAttrs = slf.renderAttrs(token)
        if (token.nesting === 1) {
          return className && className !== '{}'
            ? '<div class="' + className + '">'
            : '<div' + renderedAttrs + '>'
        } else {
          return '</div>'
        }
      },
    })
  }
  if (initState.deflist) {
    markdownIt.use(require('markdown-it-deflist'))
  }
  if (initState.fontmatter) {
    markdownIt.use(require('markdown-it-front-matter'), () => void 0)
  }
  if (initState.implicitFigures) {
    markdownIt.use(require('markdown-it-implicit-figures'), {
      figcaption: true,
    })
  }
  if (initState.subscript) {
    markdownIt.use(require('markdown-it-sub'))
  }
  if (initState.superscript) {
    markdownIt.use(require('markdown-it-sup'))
  }
  // tslint:enable:no-unsafe-any

  return markdownIt
}

function wrapInitIfNeeded(initf: typeof init): typeof init {
  let markdownIt: markdownItModule | null = null
  let initState: InitState | null = null

  return function (newState: InitState) {
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
