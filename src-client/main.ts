import { ipcRenderer } from 'electron'
import { UpdatePreview } from './update-preview'
import { processHTMLString, jaxTeXConfig } from './mathjax-helper'
import * as util from './util'
import { getMedia } from '../src/util-common'

function mkResPromise<T>(): ResolvablePromise<T> {
  let resFn: (value?: T | PromiseLike<T> | undefined) => void
  const p = new Promise<T>((resolve) => (resFn = resolve)) as ResolvablePromise<
    T
  >
  p.resolve = resFn!
  return p
}

window.atomVars = {
  home: mkResPromise(),
  numberEqns: mkResPromise(),
  sourceLineMap: new Map(),
  revSourceMap: new WeakMap(),
}

ipcRenderer.on<'set-atom-home'>('set-atom-home', (_evt, { home }) => {
  window.atomVars.home.resolve(home)
})

ipcRenderer.on<'set-number-eqns'>('set-number-eqns', (_evt, { numberEqns }) => {
  window.atomVars.numberEqns.resolve(numberEqns)
})

ipcRenderer.on<'set-source-map'>('set-source-map', (_evt, { map }) => {
  const root = document.querySelector('div.update-preview')
  if (!root) throw new Error('No root element!')
  const slsm = new Map<number, Element>()
  const rsm = new WeakMap<Element, number[]>()
  for (const lineS of Object.keys(map)) {
    const line = parseInt(lineS, 10)
    const path = map[line]
    const elem = util.resolveElement(root, path)
    if (elem) {
      slsm.set(line, elem)
      const rsmel = rsm.get(elem)
      if (rsmel) rsmel.push(line)
      else rsm.set(elem, [line])
    }
  }
  window.atomVars.sourceLineMap = slsm
  window.atomVars.revSourceMap = rsm
})

ipcRenderer.on<'scroll-sync'>(
  'scroll-sync',
  (_evt, { firstLine, lastLine }) => {
    const mean = Math.floor(0.5 * (firstLine + lastLine))
    const slm = window.atomVars.sourceLineMap
    let topLine
    let topBound
    for (topLine = mean; topLine >= 0; topLine -= 1) {
      topBound = slm.get(topLine)
      if (topBound) break
    }
    if (!topBound) return

    const max = Math.max(...Array.from(slm.keys()))
    let bottomLine
    let bottomBound
    for (bottomLine = mean + 1; bottomLine < max; bottomLine += 1) {
      bottomBound = slm.get(bottomLine)
      if (bottomBound) break
    }
    if (!bottomBound) return
    const topScroll = topBound.getBoundingClientRect().top
    const bottomScroll = bottomBound.getBoundingClientRect().top
    const frac = (mean - firstLine) / (lastLine - firstLine)
    const offset = document.documentElement.scrollTop
    const clientHeight = document.documentElement.clientHeight
    const top =
      offset - clientHeight / 2 + topScroll + frac * (bottomScroll - topScroll)
    window.scroll({ top })
  },
)

ipcRenderer.on<'style'>('style', (_event, { styles }) => {
  let styleElem = document.head.querySelector('style#atom-styles')
  if (!styleElem) {
    styleElem = document.createElement('style')
    styleElem.id = 'atom-styles'
    document.head.appendChild(styleElem)
  }
  styleElem.innerHTML = styles.join('\n')
})

ipcRenderer.on<'update-images'>('update-images', (_event, { oldsrc, v }) => {
  const imgs = getMedia(document)
  for (const img of Array.from(imgs)) {
    let ovs: string | undefined
    let ov: number | undefined
    let src = img.getAttribute('src')!
    const match = src.match(/^(.*)\?v=(\d+)$/)
    if (match) [, src, ovs] = match
    if (src === oldsrc) {
      if (ovs !== undefined) ov = parseInt(ovs, 10)
      if (v !== ov) img.src = v ? `${src}?v=${v}` : `${src}`
    }
  }
})

ipcRenderer.on<'sync'>('sync', (_event, { line }) => {
  const root = document.querySelector('div.update-preview')
  if (!root) return

  let element = window.atomVars.sourceLineMap.get(line)

  if (!element) {
    for (let i = line - 1; i >= 0; i -= 1) {
      element = window.atomVars.sourceLineMap.get(line)
      if (element) break
    }
  }

  if (!element) return

  element.scrollIntoViewIfNeeded(true)

  element.classList.add('flash')
  setTimeout(() => element!.classList.remove('flash'), 1000)
})

ipcRenderer.on<'use-github-style'>('use-github-style', (_event, { value }) => {
  const elem = document.querySelector('markdown-preview-plus-view')
  if (!elem) throw new Error(`Can't find MPP-view`)
  if (value) {
    elem.setAttribute('data-use-github-style', '')
  } else {
    elem.removeAttribute('data-use-github-style')
  }
})

let updatePreview: UpdatePreview | undefined

ipcRenderer.on<'update-preview'>(
  'update-preview',
  (_event, { html, renderLaTeX, mjrenderer }) => {
    // div.update-preview created after constructor st UpdatePreview cannot
    // be instanced in the constructor
    const preview = document.querySelector('div.update-preview')
    if (!preview) return
    if (!updatePreview) {
      updatePreview = new UpdatePreview(preview as HTMLElement)
    }
    const parser = new DOMParser()
    const domDocument = parser.parseFromString(html, 'text/html')
    const domFragment = document.createDocumentFragment()
    for (const elem of Array.from(domDocument.body.childNodes)) {
      domFragment.appendChild(elem)
    }
    updatePreview.update(domFragment, renderLaTeX, mjrenderer)
    const doc = document
    if (doc && domDocument.head.hasChildNodes) {
      let container = doc.head.querySelector('original-elements')
      if (!container) {
        container = doc.createElement('original-elements')
        doc.head.appendChild(container)
      }
      container.innerHTML = ''
      for (const headElement of Array.from(domDocument.head.childNodes)) {
        container.appendChild(headElement.cloneNode(true))
      }
    }
  },
)

const baseElement = document.createElement('base')
document.head.appendChild(baseElement)

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

document.addEventListener('mousewheel', (event) => {
  if (event.ctrlKey) {
    if (event.wheelDeltaY > 0) {
      ipcRenderer.sendToHost<'zoom-in'>('zoom-in', undefined)
    } else if (event.wheelDeltaY < 0) {
      ipcRenderer.sendToHost<'zoom-out'>('zoom-out', undefined)
    }
    event.preventDefault()
    event.stopPropagation()
  }
})

document.addEventListener('scroll', (_event) => {
  const el = document.documentElement
  const height = el.clientHeight
  const visible = Array.from(window.atomVars.sourceLineMap.entries())
    .filter(([_line, elem]) => {
      const { top, bottom } = elem.getBoundingClientRect()
      return top > 0 && bottom < height
    })
    .map(([line, _elem]) => line)
  ipcRenderer.sendToHost<'did-scroll-preview'>('did-scroll-preview', {
    max: Math.max(...visible),
    min: Math.min(...visible),
  })
})

let lastContextMenuTarget: HTMLElement
document.addEventListener('contextmenu', (e) => {
  lastContextMenuTarget = e.target as HTMLElement
})

ipcRenderer.on<'sync-source'>('sync-source', () => {
  let element = lastContextMenuTarget
  const rsm = window.atomVars.revSourceMap
  let lines = rsm.get(element)

  while (!lines && element.parentElement) {
    element = element.parentElement
    lines = rsm.get(element)
  }
  if (!lines) return

  ipcRenderer.sendToHost<'open-source'>('open-source', {
    initialLine: Math.min(...lines),
  })
})

ipcRenderer.on<'get-html-svg'>('get-html-svg', async (_, { id }) => {
  const el = document.querySelector('markdown-preview-plus-view > div')
  if (!el) {
    ipcRenderer.sendToHost<'request-reply'>('request-reply', {
      id,
      request: 'get-html-svg',
      result: undefined,
    })
    return
  }
  ipcRenderer.sendToHost<'request-reply'>('request-reply', {
    id,
    request: 'get-html-svg',
    result: await processHTMLString(el),
  })
})

ipcRenderer.on<'reload'>('reload', () => {
  window.onbeforeunload = null
  ipcRenderer.sendToHost<'reload'>('reload', undefined)
})

window.onbeforeunload = function() {
  return false
}

ipcRenderer.on<'get-tex-config'>('get-tex-config', async (_, { id }) => {
  ipcRenderer.sendToHost<'request-reply'>('request-reply', {
    id,
    request: 'get-tex-config',
    result: await jaxTeXConfig(),
  })
})
