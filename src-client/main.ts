import { ipcRenderer } from 'electron'
import { UpdatePreview } from './update-preview'
import { MathJaxController, processHTMLString } from './mathjax-helper'
import * as util from './util'
import { getMedia } from '../src/util-common'

let handlerId: number
let nativePageScrollKeys = false

window.addEventListener('error', (e) => {
  const err = e.error as Error
  ipcRenderer.send<'atom-markdown-preview-plus-ipc-uncaught-error'>(
    'atom-markdown-preview-plus-ipc-uncaught-error',
    handlerId,
    {
      message: err.message,
      name: err.name,
      stack: err.stack,
    },
  )
})

window.addEventListener('unhandledrejection', (evt) => {
  const err = (evt as any).reason as Error
  ipcRenderer.send<'atom-markdown-preview-plus-ipc-uncaught-error'>(
    'atom-markdown-preview-plus-ipc-uncaught-error',
    handlerId,
    {
      message: err.message,
      name: err.name,
      stack: err.stack,
    },
  )
})

function mkResPromise<T>() {
  let resFn: (value?: T | PromiseLike<T> | undefined) => void
  const p = new Promise<T>((resolve) => (resFn = resolve)) as Promise<T> & {
    resolve: typeof resFn
  }
  p.resolve = resFn!
  return p
}

const atomVars = {
  mathJax: mkResPromise<MathJaxController>(),
  sourceLineMap: new Map<number, Element>(),
  revSourceMap: new WeakMap<Element, number[]>(),
}

ipcRenderer.on<'set-id'>('set-id', (_evt, id) => {
  handlerId = id
})

ipcRenderer.on<'init'>('init', (_evt, params) => {
  atomVars.mathJax.resolve(
    MathJaxController.create(params.userMacros, params.mathJaxConfig),
  )
  document.documentElement!.dataset.markdownPreviewPlusContext = params.context
  // tslint:disable-next-line:totality-check
  if (params.context === 'pdf-export') {
    document.documentElement!.style.setProperty(
      'width',
      `${params.pdfExportOptions.width}mm`,
      'important',
    )
  }
})

ipcRenderer.on<'set-native-keys'>('set-native-keys', (_evt, val) => {
  nativePageScrollKeys = val
})

ipcRenderer.on<'set-source-map'>('set-source-map', (_evt, { map }) => {
  const root = document.querySelector('div.update-preview')
  if (!root) throw new Error('No root element!')
  const slsm = new Map<number, Element>()
  const rsm = new WeakMap<Element, number[]>()
  for (const [lineS, path] of Object.entries(map)) {
    const line = parseInt(lineS, 10)
    const elem = util.resolveElement(root, path)
    if (elem) {
      slsm.set(line, elem)
      const rsmel = rsm.get(elem)
      if (rsmel) rsmel.push(line)
      else rsm.set(elem, [line])
    }
  }
  atomVars.sourceLineMap = slsm
  atomVars.revSourceMap = rsm
})

ipcRenderer.on<'scroll-sync'>(
  'scroll-sync',
  (_evt, { firstLine, lastLine }) => {
    const slm = atomVars.sourceLineMap
    const lines = Array.from(slm.keys()).sort((a, b) => a - b)
    let lowix = lines.findIndex((x) => x >= firstLine)
    if (lowix > 0) lowix--
    let highix = lines.findIndex((x) => x >= lastLine)
    if (highix === -1) highix = lines.length - 1
    else if (highix < lines.length - 1) highix++
    const low = lines[lowix]
    const high = lines[highix]
    let norm = 0
    let meanScroll = 0
    const entries = Array.from(slm.entries()).slice(lowix, highix + 1)
    for (const [line, item] of entries) {
      const weight = line <= (high + low) / 2 ? line - low + 1 : high - line + 1
      norm += weight
      meanScroll += item.getBoundingClientRect().top * weight
    }
    if (norm === 0) return
    const offset = document.documentElement!.scrollTop
    const clientHeight = document.documentElement!.clientHeight
    const top = offset - clientHeight / 2 + meanScroll / norm
    window.scroll({ top })
  },
)

ipcRenderer.on<'style'>('style', (_event, { styles }) => {
  let styleElem = document.head!.querySelector('style#atom-styles')
  if (!styleElem) {
    styleElem = document.createElement('style')
    styleElem.id = 'atom-styles'
    document.head!.appendChild(styleElem)
  }
  styleElem.innerHTML = styles.join('\n')
})

ipcRenderer.on<'update-images'>('update-images', (_event, { oldsrc, v }) => {
  const imgs = getMedia(document)
  for (const img of Array.from(imgs)) {
    let ovs: string | undefined
    let ov: number | undefined
    let attrName: 'href' | 'src'
    if (img.tagName === 'LINK') attrName = 'href'
    else attrName = 'src'
    let src = img.getAttribute(attrName)!
    const match = src.match(/^(.*)\?v=(\d+)$/)
    if (match) [, src, ovs] = match
    if (src === oldsrc) {
      if (ovs !== undefined) ov = parseInt(ovs, 10)
      if (v !== ov) img[attrName] = v ? `${src}?v=${v}` : `${src}`
    }
  }
})

ipcRenderer.on<'sync'>('sync', (_event, { line, flash }) => {
  const root = document.querySelector('div.update-preview')
  if (!root) return

  let element = atomVars.sourceLineMap.get(line)

  if (!element) {
    for (let i = line - 1; i >= 0; i -= 1) {
      element = atomVars.sourceLineMap.get(line)
      if (element) break
    }
  }

  if (!element) return

  element.scrollIntoViewIfNeeded(true)

  if (flash) {
    element.classList.add('flash')
    setTimeout(() => element!.classList.remove('flash'), 1000)
  }
})

let updatePreview: UpdatePreview | undefined

ipcRenderer.on<'update-preview'>(
  'update-preview',
  async (_event, { id, html, renderLaTeX }) => {
    // div.update-preview created after constructor st UpdatePreview cannot
    // be instanced in the constructor
    const preview = document.querySelector('div.update-preview')
    if (!preview) return
    if (!updatePreview) {
      updatePreview = new UpdatePreview(
        preview as HTMLElement,
        await atomVars.mathJax,
      )
    }
    const parser = new DOMParser()
    const domDocument = parser.parseFromString(html, 'text/html')
    const doc = document
    if (doc && domDocument.head!.hasChildNodes) {
      let container = doc.head!.querySelector('original-elements')
      if (!container) {
        container = doc.createElement('original-elements')
        doc.head!.appendChild(container)
      }
      container.innerHTML = ''
      for (const headElement of Array.from(domDocument.head!.childNodes)) {
        container.appendChild(headElement)
      }
    }
    await updatePreview.update(domDocument.body, renderLaTeX)
    ipcRenderer.send<'atom-markdown-preview-plus-ipc-request-reply'>(
      'atom-markdown-preview-plus-ipc-request-reply',
      handlerId,
      {
        id,
        request: 'update-preview',
        result: processHTMLString(preview),
      },
    )
  },
)

ipcRenderer.on<'await-fully-ready'>(
  'await-fully-ready',
  async (_event, { id }) => {
    // tslint:disable-next-line: totality-check
    if (document.readyState === 'complete') {
      ipcRenderer.send<'atom-markdown-preview-plus-ipc-request-reply'>(
        'atom-markdown-preview-plus-ipc-request-reply',
        handlerId,
        {
          id,
          request: 'await-fully-ready',
          result: void 0,
        },
      )
      return
    }
    function loaded() {
      ipcRenderer.send<'atom-markdown-preview-plus-ipc-request-reply'>(
        'atom-markdown-preview-plus-ipc-request-reply',
        handlerId,
        {
          id,
          request: 'await-fully-ready',
          result: void 0,
        },
      )
      document.removeEventListener('load', loaded)
    }
    document.addEventListener('load', loaded)
  },
)

const baseElement = document.createElement('base')
document.head!.appendChild(baseElement)

ipcRenderer.on<'set-base-path'>('set-base-path', (_evt, { path }) => {
  if (path) baseElement.href = path
  else baseElement.href = ''
})

ipcRenderer.on<'error'>('error', (_evt, { msg }) => {
  const preview = document.querySelector('div.update-preview')
  if (!preview) return
  const errorDiv = document.createElement('div')
  errorDiv.innerHTML = `<h2>Previewing Markdown Failed</h2><h3>${msg}</h3>`
  preview.appendChild(errorDiv)
})

document.addEventListener('wheel', (event) => {
  if (event.ctrlKey) {
    if (event.deltaY > 0) {
      ipcRenderer.send<'atom-markdown-preview-plus-ipc-zoom-in'>(
        'atom-markdown-preview-plus-ipc-zoom-in',
        handlerId,
      )
    } else if (event.deltaY < 0) {
      ipcRenderer.send<'atom-markdown-preview-plus-ipc-zoom-out'>(
        'atom-markdown-preview-plus-ipc-zoom-out',
        handlerId,
      )
    }
    event.preventDefault()
    event.stopPropagation()
  }
})

document.addEventListener('scroll', (_event) => {
  const el = document.documentElement!
  const height = el.clientHeight
  const visible = Array.from(atomVars.sourceLineMap.entries())
    .filter(([_line, elem]) => {
      const { top, bottom } = elem.getBoundingClientRect()
      return top > 0 && bottom < height
    })
    .map(([line, _elem]) => line)
  ipcRenderer.send<'atom-markdown-preview-plus-ipc-did-scroll-preview'>(
    'atom-markdown-preview-plus-ipc-did-scroll-preview',
    handlerId,
    {
      max: Math.max(...visible),
      min: Math.min(...visible),
    },
  )
})

function keyEventHandler(type: 'keydown' | 'keyup', e: KeyboardEvent) {
  if (
    nativePageScrollKeys &&
    !e.altKey &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.metaKey &&
    e.code.match(/^(Arrow.*|Page.*|Space|Home|End)$/)
  ) {
    return
  }
  const data = {
    type: type,
    altKey: e.altKey,
    ctrlKey: e.ctrlKey,
    bubbles: e.bubbles,
    cancelable: e.cancelable,
    code: e.code,
    composed: e.composed,
    detail: e.detail,
    isComposing: e.isComposing,
    key: e.key,
    location: e.location,
    metaKey: e.metaKey,
    repeat: e.repeat,
    shiftKey: e.shiftKey,
  } as const
  ipcRenderer.send<'atom-markdown-preview-plus-ipc-key'>(
    'atom-markdown-preview-plus-ipc-key',
    handlerId,
    data,
  )
  e.preventDefault()
}

document.addEventListener('keydown', keyEventHandler.bind(this, 'keydown'))
document.addEventListener('keyup', keyEventHandler.bind(this, 'keyup'))

let lastContextMenuTarget: HTMLElement
document.addEventListener('contextmenu', (e) => {
  lastContextMenuTarget = e.target as HTMLElement
  ipcRenderer.send<'atom-markdown-preview-plus-ipc-show-context-menu'>(
    'atom-markdown-preview-plus-ipc-show-context-menu',
    handlerId,
  )
})

ipcRenderer.on<'sync-source'>('sync-source', (_, { id }) => {
  let element = lastContextMenuTarget
  const rsm = atomVars.revSourceMap
  let lines = rsm.get(element)

  while (!lines && element.parentElement) {
    element = element.parentElement
    lines = rsm.get(element)
  }
  if (!lines) return

  ipcRenderer.send<'atom-markdown-preview-plus-ipc-request-reply'>(
    'atom-markdown-preview-plus-ipc-request-reply',
    handlerId,
    {
      id,
      request: 'sync-source',
      result: Math.min(...lines),
    },
  )
})

ipcRenderer.on<'reload'>('reload', (_, { id }) => {
  window.onbeforeunload = null
  ipcRenderer.send<'atom-markdown-preview-plus-ipc-request-reply'>(
    'atom-markdown-preview-plus-ipc-request-reply',
    handlerId,
    {
      id,
      request: 'reload',
      result: undefined,
    },
  )
})

window.onbeforeunload = function () {
  return false
}

ipcRenderer.on<'get-tex-config'>('get-tex-config', async (_, { id }) => {
  ipcRenderer.send<'atom-markdown-preview-plus-ipc-request-reply'>(
    'atom-markdown-preview-plus-ipc-request-reply',
    handlerId,
    {
      id,
      request: 'get-tex-config',
      result: (await atomVars.mathJax).jaxTeXConfig(),
    },
  )
})

ipcRenderer.on<'get-selection'>('get-selection', async (_, { id }) => {
  const selection = window.getSelection()
  const selectedText = selection && selection.toString()
  const selectedNode = selection && selection.anchorNode

  ipcRenderer.send<'atom-markdown-preview-plus-ipc-request-reply'>(
    'atom-markdown-preview-plus-ipc-request-reply',
    handlerId,
    {
      id,
      request: 'get-selection',
      result: selectedText && selectedNode ? selectedText : undefined,
    },
  )
})

document.addEventListener('click', (event) => {
  if (!event.target) return
  const el = event.target as HTMLElement
  if (el.tagName === 'A') {
    const href = el.getAttribute('href')
    if (href && href.startsWith('#')) {
      event.preventDefault()
      const anchor = document.getElementById(decodeURIComponent(href).slice(1))
      if (anchor) anchor.scrollIntoView()
    }
  }
})
