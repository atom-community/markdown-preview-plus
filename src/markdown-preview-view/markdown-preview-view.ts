import path = require('path')
import {
  CommandEvent,
  Emitter,
  Disposable,
  CompositeDisposable,
  Grammar,
} from 'atom'
import _ = require('lodash')
import fs = require('fs')
import {} from 'electron' // this is here soley for typings

import renderer = require('../renderer')
import markdownIt = require('../markdown-it-helper')
import imageWatcher = require('../image-watch-helper')
import { handlePromise, copyHtml, atomConfig } from '../util'
import * as util from './util'
import { RequestReplyMap } from '../../src-client/ipc'

export interface SerializedMPV {
  deserializer: 'markdown-preview-plus/MarkdownPreviewView'
  editorId?: number
  filePath?: string
}

export type MarkdownPreviewViewElement = Electron.WebviewTag & {
  getModel(): MarkdownPreviewView
}

export abstract class MarkdownPreviewView {
  public readonly renderPromise: Promise<void>
  public readonly element: MarkdownPreviewViewElement
  protected emitter: Emitter<{
    'did-change-title': undefined
    'did-change-markdown': undefined
  }> = new Emitter()
  protected disposables = new CompositeDisposable()
  protected destroyed = false

  private loading: boolean = true
  private zoomLevel = 0
  private replyCallbacks = new Map<
    number,
    {
      [K in keyof RequestReplyMap]: {
        request: K
        callback: (reply: RequestReplyMap[K]) => void
      }
    }[keyof RequestReplyMap]
  >()
  private replyCallbackId = 0

  protected constructor(
    private defaultRenderMode: Exclude<renderer.RenderMode, 'save'> = 'normal',
    private renderLaTeX: boolean = atomConfig().mathConfig
      .enableLatexRenderingByDefault,
  ) {
    this.element = document.createElement('webview') as any
    this.element.getModel = () => this
    this.element.classList.add('markdown-preview-plus', 'native-key-bindings')
    this.element.disablewebsecurity = 'true'
    this.element.nodeintegration = 'true'
    this.element.src = `file:///${__dirname}/../../client/template.html`
    this.element.style.width = '100%'
    this.element.style.height = '100%'
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
    this.handleEvents()
    this.element.addEventListener(
      'ipc-message',
      (e: Electron.IpcMessageEventCustom) => {
        switch (e.channel) {
          case 'zoom-in':
            atom.commands.dispatch(
              this.element,
              'markdown-preview-plus:zoom-in',
            )
            break
          case 'zoom-out':
            atom.commands.dispatch(
              this.element,
              'markdown-preview-plus:zoom-out',
            )
            break
          case 'open-source':
            this.openSource(e.args[0].initialLine)
            break
          case 'did-scroll-preview':
            const { min, max } = e.args[0]
            this.didScrollPreview(min, max)
            break
          case 'reload':
            this.element.reload()
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
    this.element.addEventListener('will-navigate', async (e) => {
      const { shell } = await import('electron')
      const fileUriToPath = await import('file-uri-to-path')
      if (e.url.startsWith('file://')) {
        handlePromise(atom.workspace.open(fileUriToPath(e.url)))
      } else {
        shell.openExternal(e.url)
      }
    })
    this.renderPromise = new Promise((resolve) => {
      const onload = () => {
        if (this.destroyed) return
        this.element.setZoomLevel(this.zoomLevel)
        this.updateStyles()
        this.element.send<'use-github-style'>('use-github-style', {
          value: atom.config.get('markdown-preview-plus.useGitHubStyle'),
        })
        this.element.send<'set-atom-home'>('set-atom-home', {
          home: atom.getConfigDirPath(),
        })
        this.element.send<'set-number-eqns'>('set-number-eqns', {
          numberEqns: atomConfig().mathConfig.numberEquations,
        })
        this.element.send<'set-base-path'>('set-base-path', {
          path: this.getPath(),
        })
        this.emitter.emit('did-change-title')
        resolve(this.renderMarkdown())
      }
      this.element.addEventListener('dom-ready', onload)
    })
  }

  public async runJS<T>(js: string) {
    return new Promise<T>((resolve) =>
      this.element.executeJavaScript(js, false, resolve),
    )
  }

  public async getHTMLSVG() {
    return this.runRequest('get-html-svg')
  }

  public abstract serialize(): SerializedMPV

  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    const path = this.getPath()
    path && imageWatcher.removeFile(path)
    this.disposables.dispose()
    this.element.remove()
  }

  public onDidChangeTitle(callback: () => void): Disposable {
    return this.emitter.on('did-change-title', callback)
  }

  public onDidChangeMarkdown(callback: () => void): Disposable {
    return this.emitter.on('did-change-markdown', callback)
  }

  public toggleRenderLatex() {
    this.renderLaTeX = !this.renderLaTeX
    this.changeHandler()
  }

  public async refreshImages(oldsrc: string): Promise<void> {
    const v = await imageWatcher.getVersion(oldsrc, this.getPath())
    this.element.send<'update-images'>('update-images', { oldsrc, v })
  }

  public abstract getTitle(): string

  public getDefaultLocation(): 'left' | 'right' | 'bottom' | 'center' {
    return atomConfig().previewConfig.previewDock
  }

  public getIconName() {
    return 'markdown'
  }

  public abstract getURI(): string

  public abstract getPath(): string | undefined

  public getSaveDialogOptions() {
    let defaultPath = this.getPath()
    if (defaultPath === undefined) {
      const projectPath = atom.project.getPaths()[0]
      defaultPath = 'untitled.md'
      if (projectPath) {
        defaultPath = path.join(projectPath, defaultPath)
      }
    }
    defaultPath += '.' + atomConfig().saveConfig.defaultSaveFormat
    return { defaultPath }
  }

  public saveAs(filePath: string | undefined) {
    if (filePath === undefined) return
    if (this.loading) throw new Error('Preview is still loading')

    const { name, ext } = path.parse(filePath)

    if (ext === '.pdf') {
      this.element.printToPDF({}, (error, data) => {
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
    } else {
      handlePromise(
        this.getHTMLToSave(filePath).then(async (html) => {
          const fullHtml = util.mkHtml(
            name,
            html,
            this.renderLaTeX,
            atom.config.get('markdown-preview-plus.useGitHubStyle'),
            await this.runRequest('get-tex-config'),
          )

          fs.writeFileSync(filePath, fullHtml)
          return atom.workspace.open(filePath)
        }),
      )
    }
  }

  protected didScrollPreview(_min: number, _max: number) {
    /* noop, implementation in editor preview */
  }

  protected changeHandler = () => {
    handlePromise(this.renderMarkdown())

    const pane = atom.workspace.paneForItem(this)
    if (pane !== undefined && pane !== atom.workspace.getActivePane()) {
      pane.activateItem(this)
    }
  }

  protected abstract async getMarkdownSource(): Promise<string>

  protected abstract getGrammar(): Grammar | undefined

  protected openSource(initialLine?: number) {
    const path = this.getPath()
    if (path === undefined) return
    handlePromise(
      atom.workspace.open(path, {
        initialLine,
        searchAllPanes: true,
      }),
    )
  }

  //
  // Scroll the associated preview to the element representing the target line of
  // of the source markdown.
  //
  // @param {string} text Source markdown of the associated editor.
  // @param {number} line Target line of `text`. The method will attempt to
  //   identify the elment of the associated `markdown-preview-plus-view` that represents
  //   `line` and scroll the `markdown-preview-plus-view` to that element.
  // @return {number|null} The element that represents `line`. If no element is
  //   identified `null` is returned.
  //
  protected syncPreview(line: number) {
    this.element.send<'sync'>('sync', { line })
  }

  protected openNewWindow() {
    const path = this.getPath()
    if (!path) {
      atom.notifications.addWarning(
        'Can not open this preview in new window: no file path',
      )
      return
    }
    atom.open({
      pathsToOpen: [`markdown-preview-plus://file/${path}`],
      newWindow: true,
    })
    util.destroy(this)
  }

  private async runRequest<T extends keyof RequestReplyMap>(request: T) {
    const id = this.replyCallbackId++
    return new Promise<RequestReplyMap[T]>((resolve) => {
      this.replyCallbacks.set(id, {
        request: request as any,
        callback: (result: RequestReplyMap[T]) => {
          this.replyCallbacks.delete(id)
          resolve(result)
        },
      })
      this.element.send<T>(request, { id })
    })
  }

  private handleEvents() {
    this.disposables.add(
      atom.grammars.onDidAddGrammar(() =>
        _.debounce(() => {
          handlePromise(this.renderMarkdown())
        }, 250),
      ),
      atom.grammars.onDidUpdateGrammar(
        _.debounce(() => {
          handlePromise(this.renderMarkdown())
        }, 250),
      ),
    )

    this.disposables.add(
      atom.commands.add(this.element, {
        'core:move-up': () => this.element.scrollBy({ top: -10 }),
        'core:move-down': () => this.element.scrollBy({ top: 10 }),
        'core:copy': (event: CommandEvent) => {
          if (this.copyToClipboard()) event.stopPropagation()
        },
        'markdown-preview-plus:open-dev-tools': () => {
          this.element.openDevTools()
        },
        'markdown-preview-plus:new-window': () => {
          this.openNewWindow()
        },
        'markdown-preview-plus:print': () => {
          this.element.print()
        },
        'markdown-preview-plus:zoom-in': () => {
          this.zoomLevel += 0.1
          this.element.setZoomLevel(this.zoomLevel)
        },
        'markdown-preview-plus:zoom-out': () => {
          this.zoomLevel -= 0.1
          this.element.setZoomLevel(this.zoomLevel)
        },
        'markdown-preview-plus:reset-zoom': () => {
          this.zoomLevel = 0
          this.element.setZoomLevel(this.zoomLevel)
        },
        'markdown-preview-plus:sync-source': async (_event) => {
          this.element.send<'sync-source'>('sync-source', undefined)
        },
      }),
    )

    this.disposables.add(
      atom.config.onDidChange('markdown-preview-plus.markdownItConfig', () => {
        if (atomConfig().renderer === 'markdown-it') this.changeHandler()
      }),
      atom.config.onDidChange('markdown-preview-plus.pandocConfig', () => {
        if (atomConfig().renderer === 'pandoc') this.changeHandler()
      }),
      atom.config.onDidChange(
        'markdown-preview-plus.mathConfig.latexRenderer',
        this.changeHandler,
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.mathConfig.numberEquations',
        () => {
          this.element.send<'reload'>('reload', undefined)
        },
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.renderer',
        this.changeHandler,
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.useGitHubStyle',
        ({ newValue }) => {
          this.element.send<'use-github-style'>('use-github-style', {
            value: newValue,
          })
        },
      ),
    )
  }

  private async renderMarkdown(): Promise<void> {
    const source = await this.getMarkdownSource()
    await this.renderMarkdownText(source)
  }

  private async getHTMLToSave(savePath: string) {
    const source = await this.getMarkdownSource()
    return renderer.render(
      source,
      this.getPath(),
      this.getGrammar(),
      this.renderLaTeX,
      'save',
      savePath,
    )
  }

  private async renderMarkdownText(text: string): Promise<void> {
    try {
      const domDocument = await renderer.render(
        text,
        this.getPath(),
        this.getGrammar(),
        this.renderLaTeX,
        this.defaultRenderMode,
      )
      if (this.destroyed) return
      this.loading = false
      this.element.send<'update-preview'>('update-preview', {
        html: domDocument.documentElement.outerHTML,
        renderLaTeX: this.renderLaTeX,
        mjrenderer: atomConfig().mathConfig.latexRenderer,
      })
      this.element.send<'set-source-map'>('set-source-map', {
        map: util.buildLineMap(markdownIt.getTokens(text, this.renderLaTeX)),
      })
      this.emitter.emit('did-change-markdown')
    } catch (error) {
      this.showError(error as Error)
    }
  }

  private showError(error: Error) {
    if (this.destroyed) {
      atom.notifications.addFatalError(
        'Error reported on a destroyed Markdown Preview Plus view',
        {
          dismissable: true,
          stack: error.stack,
          detail: error.message,
        },
      )
      return
    }
    this.element.send<'error'>('error', { msg: error.message })
  }

  private copyToClipboard() {
    if (this.loading) {
      return false
    }

    const selection = window.getSelection()
    const selectedText = selection.toString()
    const selectedNode = selection.baseNode as HTMLElement

    // Use default copy event handler if there is selected text inside this view
    if (
      selectedText &&
      // tslint:disable-next-line:strict-type-predicates //TODO: complain on TS
      selectedNode != null // &&
      // (this.preview === selectedNode || this.preview.contains(selectedNode))
    ) {
      return false
    }

    handlePromise(
      this.getMarkdownSource().then(async (src) =>
        copyHtml(src, this.getPath(), this.renderLaTeX),
      ),
    )

    return true
  }

  private updateStyles() {
    const styles: string[] = []
    for (const se of atom.styles.getStyleElements()) {
      styles.push(se.innerHTML)
    }
    this.element.send<'style'>('style', { styles })
  }
}
