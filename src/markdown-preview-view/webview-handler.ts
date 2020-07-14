import { WebContents } from 'electron'
import { WebContentsHandler } from './web-contents-handler'

export class WebviewHandler extends WebContentsHandler {
  private readonly _element: HTMLElement
  constructor(init: () => void | Promise<void>) {
    const element = document.createElement('webview')
    super(
      new Promise<WebContents>((resolve) => {
        const createHandler = () => {
          element.removeEventListener('dom-ready', createHandler)
          resolve(element.getWebContents())
        }
        element.addEventListener('dom-ready', createHandler)
      }),
      () => {
        atom.contextMenu.showForEvent({ target: element })
      },
      init,
    )
    this._element = document.createElement('div')
    this._element.tabIndex = -1
    this._element.classList.add('markdown-preview-plus')
    element.addEventListener('focus', () => {
      this._element.focus()
    })
    element.disablewebsecurity = 'true'
    element.nodeintegration = 'true'
    element.src = 'about:blank'
    element.style.width = '100%'
    element.style.height = '100%'
    this._element.appendChild(element)
  }

  public get element(): HTMLElement {
    return this._element
  }

  public destroy() {
    if (this.destroyed) return
    super.destroy()
    this._element.remove()
  }
}
