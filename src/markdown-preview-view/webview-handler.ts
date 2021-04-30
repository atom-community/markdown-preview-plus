import { WebContents, remote } from 'electron'
import { ClientStyle } from './util'
import { WebContentsHandler } from './web-contents-handler'

export class WebviewHandler extends WebContentsHandler {
  private readonly _element: HTMLElement
  private readonly _webview: HTMLElement
  private readonly _observer: ResizeObserver
  private _observer2?: MutationObserver
  private readonly dragStart: () => void
  private readonly dragEnd: () => void
  constructor(clientStyle: ClientStyle, init: () => void | Promise<void>) {
    const webview = document.createElement('webview')
    super(
      new Promise<WebContents>((resolve) => {
        const initialLoad = () => {
          webview.removeEventListener('dom-ready', initialLoad)
          resolve(remote.webContents.fromId(webview.getWebContentsId()))
        }
        webview.addEventListener('dom-ready', initialLoad)
      }),
      () => {
        atom.contextMenu.showForEvent({ target: this._element })
      },
      clientStyle,
      init,
    )
    this._element = document.createElement('div')
    this._element.style.width = '100%'
    this._element.style.height = '100%'
    webview.style.display = 'none'

    this._observer = new ResizeObserver(() => {
      requestAnimationFrame(this.updatePosition.bind(this))
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

    webview.disablewebsecurity = true
    webview.nodeintegration = true
    webview.src = 'about:blank'
    webview.style.position = 'absolute'
    webview.style.zIndex = '0'
    this._webview = webview
    atom.views.getView(atom.workspace).appendChild(webview)
  }

  public registerViewEvents(view: object) {
    this._webview.addEventListener('focus', () => {
      const pane = atom.workspace.paneForItem(view)
      if (pane) {
        pane.activate()
        this._webview.focus()
      }
    })
    const elt = atom.views.getView(view)
    this._observer2 = new MutationObserver((es) => {
      for (const e of es) {
        if (Array.from(e.addedNodes).includes(elt)) this.updatePosition()
      }
    })
    this._observer2.observe(
      atom.views.getView(atom.workspace).querySelector('atom-workspace-axis')!,
      {
        childList: true,
        subtree: true,
      },
    )
  }

  public get element(): HTMLElement {
    return this._element
  }

  public destroy() {
    if (this.destroyed) return
    super.destroy()
    window.removeEventListener('dragstart', this.dragStart)
    window.removeEventListener('dragend', this.dragEnd)
    this._observer.disconnect()
    if (this._observer2) this._observer2.disconnect()
    this._element.remove()
    this._webview.remove()
  }

  public updatePosition() {
    const rect = this._element.getBoundingClientRect()
    this._webview.style.display = ''
    this._webview.style.left = `${rect.left}px`
    this._webview.style.top = `${rect.top}px`
    this._webview.style.right = `${rect.right}px`
    this._webview.style.bottom = `${rect.bottom}px`
    this._webview.style.width = `${rect.width}px`
    this._webview.style.height = `${rect.height}px`
    this._webview.style.pointerEvents = this._element.style.pointerEvents
    this._webview.style.opacity = this._element.style.opacity
  }
}
