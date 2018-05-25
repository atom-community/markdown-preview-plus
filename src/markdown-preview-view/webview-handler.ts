import * as fs from 'fs'
import { Emitter, CompositeDisposable } from 'atom'
import { WebviewTag, shell } from 'electron'
import fileUriToPath = require('file-uri-to-path')

import { handlePromise } from '../util'
import { RequestReplyMap, ChannelMap } from '../../src-client/ipc'

export type ReplyCallbackStruct<
  T extends keyof RequestReplyMap = keyof RequestReplyMap
> = {
  [K in keyof RequestReplyMap]: {
    request: K
    callback: (reply: RequestReplyMap[K]) => void
  }
}[T]

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

  constructor(init: () => void) {
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
      if (e.url.startsWith('file://')) {
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

  public async update(
    html: string,
    renderLaTeX: boolean,
    mjrenderer: MathJaxRenderer,
  ) {
    if (this.destroyed) return undefined
    return this.runRequest('update-preview', {
      html,
      renderLaTeX,
      mjrenderer,
    })
  }

  public setSourceMap(map: {
    [line: number]: { tag: string; index: number }[]
  }) {
    this._element.send<'set-source-map'>('set-source-map', { map })
  }

  public setUseGitHubStyle(value: boolean) {
    this._element.send<'use-github-style'>('use-github-style', { value })
  }

  public setBasePath(path?: string) {
    this._element.send<'set-base-path'>('set-base-path', { path })
  }

  public init(atomHome: string, numberEqns: boolean,
    mjxTeXExtensions: string[], mjxUndefinedFamily: string[]) {
    this._element.send<'init'>('init', { atomHome, numberEqns, mjxTeXExtensions, mjxUndefinedFamily })
  }

  public updateImages(oldSource: string, version: number | false) {
    this._element.send<'update-images'>('update-images', {
      oldsrc: oldSource,
      v: version,
    })
  }

  public saveToPDF(filePath: string) {
    this._element.printToPDF({}, (error, data) => {
      if (error) {
        atom.notifications.addError('Failed saving to PDF', {
          description: error.toString(),
          dismissable: true,
          stack: error.stack,
        })
        return
      }
      fs.writeFileSync(filePath, data)
    })
  }

  public sync(line: number) {
    this._element.send<'sync'>('sync', { line })
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

  private updateStyles() {
    const styles: string[] = []
    for (const se of atom.styles.getStyleElements()) {
      styles.push(se.innerHTML)
    }
    this._element.send<'style'>('style', { styles })
  }
}
