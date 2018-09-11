import * as fs from 'fs'
import { Emitter, CompositeDisposable, ConfigValues } from 'atom'
import { WebviewTag, shell } from 'electron'
import fileUriToPath = require('file-uri-to-path')

import { handlePromise, atomConfig } from '../util'
import { RequestReplyMap, ChannelMap } from '../../src-client/ipc'
import { getPreviewStyles } from './util'

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

  public init(
    atomHome: string,
    mathJaxConfig: MathJaxConfig,
    mathJaxRenderer = atomConfig().mathConfig.latexRenderer,
  ) {
    this._element.send<'init'>('init', {
      atomHome,
      mathJaxConfig,
      mathJaxRenderer,
    })
  }

  public updateImages(oldSource: string, version: number | undefined) {
    this._element.send<'update-images'>('update-images', {
      oldsrc: oldSource,
      v: version,
    })
  }

  public async saveToPDF(filePath: string) {
    const opts = atomConfig().saveConfig.saveToPDFOptions
    const customPageSize = parsePageSize(opts.customPageSize)
    const pageSize = opts.pageSize === 'Custom' ? customPageSize : opts.pageSize
    if (pageSize === undefined) {
      throw new Error(
        `Failed to parse custom page size: ${opts.customPageSize}`,
      )
    }
    const selection = await this.getSelection()
    const printSelectionOnly = selection ? opts.printSelectionOnly : false
    const newOpts = {
      ...opts,
      pageSize,
      printSelectionOnly,
    }
    await this.prepareSaveToPDF(newOpts)
    try {
      const data = await new Promise<Buffer>((resolve, reject) => {
        // TODO: Complain on Electron
        this._element.printToPDF(newOpts as any, (error, data) => {
          if (error) {
            reject(error)
            return
          }
          resolve(data)
        })
      })
      await new Promise<void>((resolve, reject) => {
        fs.writeFile(filePath, data, (error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
    } finally {
      handlePromise(this.finishSaveToPDF())
    }
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
    this._element.send<'style'>('style', { styles: getPreviewStyles(true) })
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

  private async prepareSaveToPDF(opts: {
    pageSize: PageSize
    landscape: boolean
  }): Promise<void> {
    const [width, height] = getPageWidth(opts.pageSize)
    return this.runRequest('set-width', {
      width: opts.landscape ? height : width,
    })
  }

  private async finishSaveToPDF(): Promise<void> {
    return this.runRequest('set-width', { width: undefined })
  }
}

type Unit = 'mm' | 'cm' | 'in'

function parsePageSize(size: string) {
  if (!size) return undefined
  const rx = /^([\d.,]+)(cm|mm|in)?x([\d.,]+)(cm|mm|in)?$/i
  const res = size.replace(/\s*/g, '').match(rx)
  if (res) {
    const width = parseFloat(res[1])
    const wunit = res[2] as Unit | undefined
    const height = parseFloat(res[3])
    const hunit = res[4] as Unit | undefined
    return {
      width: convert(width, wunit),
      height: convert(height, hunit),
    }
  } else {
    return undefined
  }
}

type PageSize =
  | Exclude<
      ConfigValues['markdown-preview-plus.saveConfig.saveToPDFOptions.pageSize'],
      'Custom'
    >
  | { width: number; height: number }

function convert(val: number, unit?: Unit) {
  return val * unitInMicrons(unit)
}

function unitInMicrons(unit: Unit = 'mm') {
  switch (unit) {
    case 'mm':
      return 1000
    case 'cm':
      return 10000
    case 'in':
      return 25400
  }
}

function getPageWidth(pageSize: PageSize) {
  switch (pageSize) {
    case 'A3':
      return [297, 420]
    case 'A4':
      return [210, 297]
    case 'A5':
      return [148, 210]
    case 'Legal':
      return [216, 356]
    case 'Letter':
      return [216, 279]
    case 'Tabloid':
      return [279, 432]
    default:
      return [pageSize.width / 1000, pageSize.height / 1000]
  }
}
