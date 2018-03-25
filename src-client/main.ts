import { ipcRenderer } from 'electron'
import { UpdatePreview } from './update-preview'

ipcRenderer.on('style', (_event: any, style: string[]) => {
  let styleElem = document.head.querySelector('style#atom-styles')
  if (!styleElem) {
    styleElem = document.createElement('style')
    styleElem.id = 'atom-styles'
    document.head.appendChild(styleElem)
  }
  styleElem.innerHTML = style.join('\n')
})

ipcRenderer.on(
  'update-images',
  (_event: any, oldsrc: string, v: number | false) => {
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
  },
)

ipcRenderer.on(
  'sync',
  (_event: any, pathToToken: Array<{ tag: string; index: number }>) => {
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
  },
)

ipcRenderer.on('use-github-style', (_event: any, value: boolean) => {
  const elem = document.querySelector('markdown-preview-plus-view')
  if (!elem) throw new Error(`Can't find MPP-view`)
  if (value) {
    elem.setAttribute('data-use-github-style', '')
  } else {
    elem.removeAttribute('data-use-github-style')
  }
})

let updatePreview: UpdatePreview | undefined

ipcRenderer.on(
  'update-preview',
  (
    _event: any,
    html: string,
    renderLaTeX: boolean,
    highlightCodeBlocks: boolean,
    mjrenderer: MathJaxRenderer,
  ) => {
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
    updatePreview.update(
      document,
      domFragment,
      renderLaTeX,
      highlightCodeBlocks,
      mjrenderer,
    )
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

ipcRenderer.on('error', (_evt: any, msg: string) => {
  const preview = document.querySelector('div.update-preview')
  if (!preview) return
  const errorDiv = document.createElement('div')
  errorDiv.innerHTML = `<h2>Previewing Markdown Failed</h2><h3>${msg}</h3>`
  preview.appendChild(errorDiv)
})

document.addEventListener('mousewheel', (event) => {
  if (event.ctrlKey) {
    if (event.wheelDeltaY > 0) {
      ipcRenderer.sendToHost('zoom-in')
    } else if (event.wheelDeltaY < 0) {
      ipcRenderer.sendToHost('zoom-out')
    }
    event.preventDefault()
    event.stopPropagation()
  }
})

export function getText() {
  const el = document.querySelector('markdown-preview-plus-view > div')
  if (!el) return ''
  return el.textContent
}

export function getHTML() {
  const el = document.querySelector('markdown-preview-plus-view > div')
  if (!el) return ''
  return el.innerHTML
}
