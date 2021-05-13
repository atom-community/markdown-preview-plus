import { Emitter, CompositeDisposable } from 'atom'
import { WebContents, remote } from 'electron'
import { handlePromise, shellOpen, packagePath } from '../util'
import {
  RequestReplyMap,
  ChannelMap,
  ReplyMap,
  TDiffMethod,
} from '../../src-client/ipc'
import { ClientStyle, getPreviewStyles } from './util'
import { ImageWatcher } from '../image-watch-helper'
import * as path from 'path'

export type ReplyCallbackStruct<
  T extends keyof RequestReplyMap = keyof RequestReplyMap,
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

export abstract class WebContentsHandler {
  private static _id: number = 0
  public readonly emitter = new Emitter<
    { 'did-destroy': void },
    {
      'did-scroll-preview': { min: number; max: number }
    }
  >()
  public readonly imageWatcher: ImageWatcher
  protected destroyed = false
  protected readonly disposables = new CompositeDisposable()
  private zoomLevel = 0
  private replyCallbackId = 0
  private lastSearchText?: string
  private readonly replyCallbacks = new Map<number, ReplyCallbackStruct>()
  private readonly id: number = ++WebContentsHandler._id
  private readonly listeners: {
    [key: string]: (evt: unknown, id: number, ...args: any) => void
  } = {}
  private readonly contents: Promise<WebContents>
  private stylesReady = false

  constructor(
    contents: Promise<WebContents>,
    showContextMenu: () => void,
    private clientStyle: ClientStyle,
    private readonly initCont: () => void | Promise<void>,
  ) {
    this.addListeners({
      'atom-markdown-preview-plus-ipc-zoom-in': this.zoomIn.bind(this),
      'atom-markdown-preview-plus-ipc-zoom-out': this.zoomOut.bind(this),
      'atom-markdown-preview-plus-ipc-did-scroll-preview': (minmax) => {
        this.emitter.emit('did-scroll-preview', minmax)
      },
      'atom-markdown-preview-plus-ipc-uncaught-error': (err) => {
        const newErr = new Error()
        atom.notifications.addFatalError(
          `Uncaught error ${err.name} in markdown-preview-plus webview client`,
          {
            dismissable: true,
            stack: newErr.stack,
            detail: `${err.message}\n\nstack:\n${err.stack}`,
          },
        )
      },
      'atom-markdown-preview-plus-ipc-show-context-menu': () => {
        showContextMenu()
      },
      'atom-markdown-preview-plus-ipc-request-reply': ({
        id,
        request,
        result,
      }) => {
        const cb = this.replyCallbacks.get(id)
        if (cb && request === cb.request) {
          const callback: (r: any) => void = cb.callback
          callback(result)
        }
      },
      'atom-markdown-preview-plus-ipc-key': (data) => {
        const evt = new KeyboardEvent(data.type, data)
        if (this.element) this.element.dispatchEvent(evt)
      },
    })

    this.disposables.add(
      atom.styles.onDidAddStyleElement(() => {
        handlePromise(this.updateStyles())
      }),
      atom.styles.onDidRemoveStyleElement(() => {
        handlePromise(this.updateStyles())
      }),
      atom.styles.onDidUpdateStyleElement(() => {
        handlePromise(this.updateStyles())
      }),
      atom.config.onDidChange('markdown-preview-plus.useGitHubStyle', () => {
        handlePromise(this.updateStyles())
      }),
      atom.config.onDidChange('markdown-preview-plus.syntaxThemeName', () => {
        handlePromise(this.updateStyles())
      }),
      atom.config.onDidChange(
        'markdown-preview-plus.importPackageStyles',
        () => {
          handlePromise(this.updateStyles())
        },
      ),
    )

    this.contents = contents.then(this.initializeContents)

    this.disposables.add(
      (this.imageWatcher = new ImageWatcher(this.updateImages.bind(this))),
    )
  }

  public async setClientStyle(style: ClientStyle) {
    this.clientStyle = style
    return this.updateStyles()
  }

  public abstract get element(): HTMLElement

  public abstract registerViewEvents(_view: object): void

  public async runJS<T>(js: string) {
    const contents = await this.contents
    return contents.executeJavaScript(js, false) as Promise<T>
  }

  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    for (const [channel, handler] of Object.entries(this.listeners)) {
      remote.ipcMain.removeListener(channel, handler)
      delete this.listeners[channel]
    }
    this.emitter.emit('did-destroy')
    this.disposables.dispose()
    this.emitter.dispose()
  }

  public onDidDestroy(callback: () => void) {
    return this.emitter.on('did-destroy', callback)
  }

  public async update(
    html: string,
    renderLaTeX: boolean,
    diffMethod: TDiffMethod = 'none',
    map?: { [line: number]: { tag: string; index: number }[] },
    scrollSyncParams?: ChannelMap['scroll-sync'],
  ) {
    if (this.destroyed) return undefined
    return this.runRequest('update-preview', {
      html,
      renderLaTeX,
      map,
      diffMethod,
      scrollSyncParams,
    })
  }

  public async fullyReady() {
    if (this.destroyed) return
    return this.runRequest('await-fully-ready', {})
  }

  public async setBasePath(path?: string) {
    return this.send<'set-base-path'>('set-base-path', { path })
  }

  public async setNativeKeys(val: boolean) {
    return this.send<'set-native-keys'>('set-native-keys', val)
  }

  public async init(params: ChannelMap['init']) {
    return this.send<'init'>('init', params)
  }

  public async updateImages(oldSource: string, version: number | undefined) {
    return this.send<'update-images'>('update-images', {
      oldsrc: oldSource,
      v: version,
    })
  }

  public async printToPDF(opts: PrintToPDFOptionsReal) {
    const contents = await this.contents
    return contents.printToPDF(opts)
  }

  public async sync(line: number, flash: boolean) {
    return this.send<'sync'>('sync', { line, flash })
  }

  public async syncSource() {
    return this.runRequest('sync-source', {})
  }

  public async scrollSync(firstLine: number, lastLine: number) {
    return this.send<'scroll-sync'>('scroll-sync', { firstLine, lastLine })
  }

  public async zoomIn() {
    this.zoomLevel += 0.1
    ;(await this.contents).setZoomLevel(this.zoomLevel)
  }

  public async zoomOut() {
    this.zoomLevel -= 0.1
    ;(await this.contents).setZoomLevel(this.zoomLevel)
  }

  public async resetZoom() {
    this.zoomLevel = 0
    ;(await this.contents).setZoomLevel(this.zoomLevel)
  }

  public async print() {
    ;(await this.contents).print()
  }

  public async openDevTools() {
    ;(await this.contents).openDevTools()
  }

  public async reload() {
    await this.runRequest('reload', {})
    ;(await this.contents).reload()
  }

  public async error(msg: string) {
    return this.send<'error'>('error', { msg })
  }

  public async getTeXConfig() {
    return this.runRequest('get-tex-config', {})
  }

  public async getSelection() {
    return this.runRequest('get-selection', {})
  }

  public async search(text: string) {
    const c = await this.contents
    c.findInPage(text)
    this.lastSearchText = text
  }

  public async findNext() {
    if (!this.lastSearchText) return
    const c = await this.contents
    c.findInPage(this.lastSearchText, { findNext: true })
  }

  public hasSearch() {
    return !!this.lastSearchText
  }

  public async stopSearch() {
    const c = await this.contents
    this.lastSearchText = undefined
    c.stopFindInPage('keepSelection')
  }

  protected async updateStyles() {
    if (!this.stylesReady) return
    return this.send<'style'>('style', {
      styles: getPreviewStyles(true, this.clientStyle),
    })
  }

  protected async runRequest<T extends keyof RequestReplyMap>(
    request: T,
    args: { [K in Exclude<keyof ChannelMap[T], 'id'>]: ChannelMap[T][K] },
  ) {
    const id = this.replyCallbackId++
    const result = new Promise<RequestReplyMap[T]>((resolve) => {
      this.replyCallbacks.set(id, {
        request: request,
        callback: (result: RequestReplyMap[T]) => {
          this.replyCallbacks.delete(id)
          resolve(result)
        },
      } as unknown as ReplyCallbackStruct<T>)
    })
    const newargs = Object.assign({ id }, args)
    await this.send<T>(request, newargs as ChannelMap[T])
    return result
  }

  protected async send<T extends keyof ChannelMap>(
    channel: T,
    value: ChannelMap[T],
  ): Promise<void> {
    ;(await this.contents).send<T>(channel, value)
  }

  private addListeners<T extends keyof ReplyMap>(
    listeners: {
      [K in T]: (...args: ReplyMap[K]) => void
    },
  ): void {
    for (const [channel, handler] of Object.entries(listeners)) {
      this.listeners[channel] = (
        _event: any,
        id: number,
        ...args: ReplyMap[typeof channel]
      ) => {
        if (this.id !== id) {
          return
        }
        handler(...args)
      }
      remote.ipcMain.on(channel, this.listeners[channel])
    }
  }

  private initializeContents = async (
    contents: WebContents,
  ): Promise<WebContents> => {
    contents.once('destroyed', () => this.destroy())
    contents.on('will-navigate', async (e, url) => {
      e.preventDefault()
      shellOpen(url)
    })

    if (!contents.getURL().includes('client/template.html')) {
      await contents.loadFile(
        path.join(packagePath(), 'client', 'template.html'),
        { hash: atom.inDevMode() ? 'dev' : undefined },
      )
    }

    const onload = async () => {
      if (this.destroyed) return
      contents.send<'set-id'>('set-id', this.id)
      contents.setZoomLevel(this.zoomLevel)
      this.stylesReady = true
      handlePromise(this.updateStyles().then(this.initCont))
    }
    await onload()
    contents.on('dom-ready', onload)
    return contents
  }
}
