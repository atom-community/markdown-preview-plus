import { Emitter, CompositeDisposable } from 'atom'
import { WebviewTag, shell } from 'electron'
import fileUriToPath = require('file-uri-to-path')

import { handlePromise, atomConfig } from '../util'
import { RequestReplyMap, ChannelMap } from '../../src-client/ipc'
import { getPreviewStyles } from './util'
import { UserStylesManager } from './user-styles'

export type ReplyCallbackStruct<
  T extends keyof RequestReplyMap = keyof RequestReplyMap
> = {
  [K in keyof RequestReplyMap]: {
    request: K
    callback: (reply: RequestReplyMap[K]) => void
  }
}[T]

interface PrintToPDFOptionsReal {
  /**
   * Specifies the type of margins to use. Uses 0 for default margin, 1 for no
   * margin, and 2 for minimum margin.
   */
  marginsType?: number
  /**
   * Specify page size of the generated PDF. Can be A3, A4, A5, Legal, Letter,
   * Tabloid or an Object containing height and width in microns.
   */
  pageSize?:
    | { width: number; height: number }
    | 'A3'
    | 'A4'
    | 'A5'
    | 'Legal'
    | 'Letter'
    | 'Tabloid'
  /**
   * Whether to print CSS backgrounds.
   */
  printBackground?: boolean
  /**
   * Whether to print selection only.
   */
  printSelectionOnly?: boolean
  /**
   * true for landscape, false for portrait.
   */
  landscape?: boolean
}

export class WebviewHandler {
  public readonly emitter = new Emitter<
    {},
    {
      'did-scroll-preview': { min: number; max: number }
    }
  >()
  protected disposables = new CompositeDisposable()
  private readonly _element: WebviewTag
  private destroyed = false
  private zoomLevel = 0
  private replyCallbacks = new Map<number, ReplyCallbackStruct>()
  private replyCallbackId = 0

  constructor(
    private context: 'pdf' | 'copy' | 'html' | 'live',
    init: () => void,
  ) {
    this._element = document.createElement('webview')
    this._element.classList.add('markdown-preview-plus', 'native-key-bindings')
    this._element.disablewebsecurity = 'true'
    this._element.nodeintegration = 'true'
    this._element.src = `file:///${__dirname}/../../client/template.html`
    this._element.style.width = '100%'
    this._element.style.height = '100%'
    this._element.addEventListener(
      'ipc-message',
      (e: Electron.IpcMessageEventCustom) => {
        switch (e.channel) {
          case 'zoom-in':
            this.zoomIn()
            break
          case 'zoom-out':
            this.zoomOut()
            break
          case 'did-scroll-preview':
            this.emitter.emit('did-scroll-preview', e.args[0])
            break
          case 'uncaught-error': {
            const err = e.args[0]
            const newErr = new Error()
            atom.notifications.addFatalError(
              `Uncaught error ${
                err.name
              } in markdown-preview-plus webview client`,
              {
                dismissable: true,
                stack: newErr.stack,
                detail: `${err.message}\n\nstack:\n${err.stack}`,
              },
            )
            break
          }
          // replies
          case 'request-reply': {
            const { id, request, result } = e.args[0]
            const cb = this.replyCallbacks.get(id)
            if (cb && request === cb.request) {
              const callback: (r: any) => void = cb.callback
              callback(result)
            }
            break
          }
        }
      },
    )
    this._element.addEventListener('will-navigate', async (e) => {
      const exts = atomConfig().previewConfig.shellOpenFileExtensions
      const forceOpenExternal = exts.some((ext) =>
        e.url.toLowerCase().endsWith(`.${ext.toLowerCase()}`),
      )
      if (e.url.startsWith('file://') && !forceOpenExternal) {
        handlePromise(atom.workspace.open(fileUriToPath(e.url)))
      } else {
        shell.openExternal(e.url)
      }
    })

    this.disposables.add(
      atom.styles.onDidAddStyleElement(() => {
        this.updateStyles()
      }),
      atom.styles.onDidRemoveStyleElement(() => {
        this.updateStyles()
      }),
      atom.styles.onDidUpdateStyleElement(() => {
        this.updateStyles()
      }),
      UserStylesManager.subscribe(() => this.updateStyles()),
    )

    const onload = () => {
      if (this.destroyed) return
      this._element.setZoomLevel(this.zoomLevel)
      this.updateStyles()
      init()
    }
    this._element.addEventListener('dom-ready', onload)
  }

  public get element(): HTMLElement {
    return this._element
  }

  public async runJS<T>(js: string) {
    return new Promise<T>((resolve) =>
      this._element.executeJavaScript(js, false, resolve),
    )
  }

  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.disposables.dispose()
    this._element.remove()
  }

  public async update(html: string, renderLaTeX: boolean) {
    if (this.destroyed) return undefined
    return this.runRequest('update-preview', {
      html,
      renderLaTeX,
    })
  }

  public setSourceMap(map: {
    [line: number]: { tag: string; index: number }[]
  }) {
    this._element.send<'set-source-map'>('set-source-map', { map })
  }

  public setBasePath(path?: string) {
    this._element.send<'set-base-path'>('set-base-path', { path })
  }

  public init(params: ChannelMap['init']) {
    this._element.send<'init'>('init', params)
  }

  public updateImages(oldSource: string, version: number | undefined) {
    this._element.send<'update-images'>('update-images', {
      oldsrc: oldSource,
      v: version,
    })
  }

  public async printToPDF(opts: PrintToPDFOptionsReal) {
    return new Promise<Buffer>((resolve, reject) => {
      // TODO: Complain on Electron
      this._element.printToPDF(opts as any, (error, data) => {
        if (error) {
          reject(error)
          return
        }
        resolve(data)
      })
    })
  }

  public sync(line: number, flash: boolean) {
    this._element.send<'sync'>('sync', { line, flash })
  }

  public async syncSource() {
    return this.runRequest('sync-source', {})
  }

  public scrollSync(firstLine: number, lastLine: number) {
    this._element.send<'scroll-sync'>('scroll-sync', { firstLine, lastLine })
  }

  public zoomIn() {
    this.zoomLevel += 0.1
    this._element.setZoomLevel(this.zoomLevel)
  }

  public zoomOut() {
    this.zoomLevel -= 0.1
    this._element.setZoomLevel(this.zoomLevel)
  }

  public resetZoom() {
    this.zoomLevel = 0
    this._element.setZoomLevel(this.zoomLevel)
  }

  public print() {
    this._element.print()
  }

  public openDevTools() {
    this._element.openDevTools()
  }

  public async reload() {
    await this.runRequest('reload', {})
    this._element.reload()
  }

  public error(msg: string) {
    this._element.send<'error'>('error', { msg })
  }

  public async getTeXConfig() {
    return this.runRequest('get-tex-config', {})
  }

  public async getSelection() {
    return this.runRequest('get-selection', {})
  }

  public updateStyles() {
    this._element.send<'style'>('style', {
      styles: getPreviewStyles(this.context),
    })
  }

  protected async runRequest<T extends keyof RequestReplyMap>(
    request: T,
    args: { [K in Exclude<keyof ChannelMap[T], 'id'>]: ChannelMap[T][K] },
  ) {
    const id = this.replyCallbackId++
    return new Promise<RequestReplyMap[T]>((resolve) => {
      this.replyCallbacks.set(id, {
        request: request,
        callback: (result: RequestReplyMap[T]) => {
          this.replyCallbacks.delete(id)
          resolve(result)
        },
      } as ReplyCallbackStruct<T>)
      const newargs = Object.assign({ id }, args)
      this._element.send<T>(request, newargs)
    })
  }
}
