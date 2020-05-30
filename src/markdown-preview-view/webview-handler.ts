import { WebviewTag, WebContents } from 'electron'
import { WebContentsHandler } from './web-contents-handler'

export class WebviewHandler extends WebContentsHandler {
  private readonly _element: WebviewTag
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
      element,
      init,
    )
    this._element = element
    element.classList.add('markdown-preview-plus', 'native-key-bindings')
    element.disablewebsecurity = 'true'
    element.nodeintegration = 'true'
    element.src = 'about:blank'
    element.style.width = '100%'
    element.style.height = '100%'
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
