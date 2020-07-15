import { WebContents } from 'electron'
import { WebContentsHandler } from './web-contents-handler'

export class WebviewHandler extends WebContentsHandler {
  private readonly _element: HTMLElement
  private readonly _webview: HTMLElement
  private readonly _observer: ResizeObserver
  private readonly dragStart: () => void
  private readonly dragEnd: () => void
  constructor(init: () => void | Promise<void>) {
    const webview = document.createElement('webview')
    super(
      new Promise<WebContents>((resolve) => {
        const initialLoad = () => {
          webview.removeEventListener('dom-ready', initialLoad)
          resolve(webview.getWebContents())
        }
        webview.addEventListener('dom-ready', initialLoad)
      }),
      () => {
        atom.contextMenu.showForEvent({ target: this._element })
      },
      init,
    )
    this._element = document.createElement('div')
    this._element.style.width = '100%'
    this._element.style.height = '100%'

    this._observer = new ResizeObserver(() => {
      const rect = this._element.getBoundingClientRect()
      webview.style.left = `${rect.left}px`
      webview.style.top = `${rect.top}px`
      webview.style.right = `${rect.right}px`
      webview.style.bottom = `${rect.bottom}px`
      webview.style.width = `${rect.width}px`
      webview.style.height = `${rect.height}px`
    })
    this._observer.observe(this._element)

    this.dragStart = () => {
      webview.style.pointerEvents = 'none'
    }

    this.dragEnd = () => {
      webview.style.pointerEvents = 'auto'
    }

    window.addEventListener('dragstart', this.dragStart)
    window.addEventListener('dragend', this.dragEnd)

    webview.disablewebsecurity = 'true'
    webview.nodeintegration = 'true'
    webview.src = 'about:blank'
    webview.style.position = 'absolute'
    webview.style.zIndex = '0'
    this._webview = webview
    atom.views.getView(atom.workspace).appendChild(webview)
  }

  public get element(): HTMLElement {
    return this._element
  }

  public registerElementEvents(el: { focus: () => void }) {
    this._webview.addEventListener('focus', () => {
      el.focus()
    })
  }

  public destroy() {
    if (this.destroyed) return
    super.destroy()
    window.removeEventListener('dragstart', this.dragStart)
    window.removeEventListener('dragend', this.dragEnd)
    this._observer.disconnect()
    this._element.remove()
    this._webview.remove()
  }
}
