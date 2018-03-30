import { ipcRenderer } from 'electron'
import { UpdatePreview } from './update-preview'
import { processHTMLString } from './mathjax-helper'
import * as util from './util'

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
  const imgs = document.querySelectorAll('img[src]') as NodeListOf<
    HTMLImageElement
  >
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

ipcRenderer.on<'sync'>('sync', (_event, { pathToToken }) => {
  let element = document.querySelector('div.update-preview')
  if (!element) return

  for (const token of pathToToken) {
    const candidateElement: HTMLElement | null = element
      .querySelectorAll(`:scope > ${token.tag}`)
      .item(token.index) as HTMLElement
    if (candidateElement) {
      element = candidateElement
    } else {
      break
    }
  }

  if (element.classList.contains('update-preview')) {
    return
  } // Do not jump to the top of the preview for bad syncs

  if (!element.classList.contains('update-preview')) {
    element.scrollIntoView()
  }
  const maxScrollTop = document.body.scrollHeight - document.body.clientHeight
  if (!(document.body.scrollTop >= maxScrollTop)) {
    document.body.scrollTop -= document.body.clientHeight / 4
  }

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
      updatePreview = new UpdatePreview(preview)
    }
    const parser = new DOMParser()
    const domDocument = parser.parseFromString(html, 'text/html')
    const domFragment = document.createDocumentFragment()
    for (const elem of Array.from(domDocument.body.childNodes)) {
      domFragment.appendChild(elem)
    }
    updatePreview.update(document, domFragment, renderLaTeX, mjrenderer)
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

declare global {
  interface Window {
    resolveAtomHome(home: string): void
    atomHome: Promise<string>
  }
}

ipcRenderer.on<'set-atom-home'>('set-atom-home', (_evt, { home }) => {
  window.resolveAtomHome(home)
})

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

let lastContextMenuTarget: HTMLElement
document.addEventListener('contextmenu', (e) => {
  lastContextMenuTarget = e.target as HTMLElement
})

ipcRenderer.on<'sync-source'>('sync-source', (_evt: any, { tokens }) => {
  const element = lastContextMenuTarget
  const pathToElement = util.getPathToElement(element)
  pathToElement.shift() // remove markdown-preview-plus-view
  pathToElement.shift() // remove div.update-preview
  if (!pathToElement.length) {
    return null
  }

  let finalToken = null
  let level = 0

  for (const token of tokens) {
    if (token.level < level) {
      break
    }
    if (token.hidden) {
      continue
    }
    if (token.tag === pathToElement[0].tag && token.level === level) {
      if (token.nesting === 1) {
        if (pathToElement[0].index === 0) {
          // tslint:disable-next-line:strict-type-predicates // TODO: complain on DT
          if (token.map != null) {
            finalToken = token
          }
          pathToElement.shift()
          level++
        } else {
          pathToElement[0].index--
        }
      } else if (
        token.nesting === 0 &&
        ['math', 'code', 'hr'].includes(token.tag)
      ) {
        if (pathToElement[0].index === 0) {
          finalToken = token
          break
        } else {
          pathToElement[0].index--
        }
      }
    }
    if (pathToElement.length === 0) {
      break
    }
  }

  if (finalToken !== null) {
    ipcRenderer.sendToHost<'open-source'>('open-source', {
      initialLine: finalToken.map[0],
    })
    return finalToken.map[0]
  } else {
    return null
  }
})

ipcRenderer.on<'get-html-svg'>('get-html-svg', async () => {
  const el = document.querySelector('markdown-preview-plus-view > div')
  if (!el) return
  const res = await processHTMLString(el)
  ipcRenderer.sendToHost<'html-svg-result'>('html-svg-result', res)
})

window.onbeforeunload = function() {
  return false
}
