import * as path from 'path'
import { Emitter, Disposable, CompositeDisposable, Grammar, Range } from 'atom'
import { debounce } from 'lodash'
import * as fs from 'fs'
import { remote } from 'electron'

import * as renderer from '../renderer'
import { MarkdownItWorker } from '../markdown-it-helper'
import { handlePromise, copyHtml, atomConfig, shellOpen } from '../util'
import * as util from './util'
import { WebviewHandler } from './webview-handler'
import { saveAsPDF } from './pdf-export-util'
import { loadUserMacros } from '../macros-util'
import { WebContentsHandler } from './web-contents-handler'
import { modalTextEditorView } from '../modal-text-editor-view'
import { BrowserWindowHandler } from './browserwindow-handler'
import {
  MarkdownPreviewController,
  MarkdownPreviewControllerEditor,
  MarkdownPreviewControllerFile,
  MarkdownPreviewControllerText,
  SerializedMPV,
} from './controller'
import { openPreviewPane } from './helpers'
import * as clipboard from '../clipboard'
import { pathToFileURL } from 'url'

export type { SerializedMPV }

export class MarkdownPreviewView {
  private static elementMap = new WeakMap<HTMLElement, MarkdownPreviewView>()
  // used for tests
  public get type() {
    return this.controller.type
  }
  public readonly element: HTMLElement
  protected emitter: Emitter<{
    'did-change-title': undefined
    'did-change-markdown': undefined
    'did-init': undefined
    'did-destroy': undefined
  }> = new Emitter()
  protected disposables = new CompositeDisposable()
  protected controllerDisposables?: CompositeDisposable
  protected destroyed = false
  protected readonly handler: WebContentsHandler
  private loading: boolean = true
  private _initialRenderPromsie: Promise<void>

  constructor(
    private controller: MarkdownPreviewController,
    private renderLaTeX: boolean = atomConfig().mathConfig
      .enableLatexRenderingByDefault,
    handlerConstructor: new (
      clientStyle: util.ClientStyle,
      x: () => Promise<void>,
    ) => WebContentsHandler = WebviewHandler,
  ) {
    this.disposables.add(this.emitter)
    const config = atomConfig()
    this.handler = new handlerConstructor(config.style, async () => {
      await this.handler.init({
        userMacros: loadUserMacros(),
        mathJaxConfig: config.mathConfig,
        context: 'live-preview',
      })
      await this.handler.setBasePath(this.getPath())
      await this.handler.setNativeKeys(
        config.previewConfig.nativePageScrollKeys,
      )
      this.emitter.emit('did-change-title')
      this.emitter.emit('did-init')
    })
    this.disposables.add(
      atom.config.onDidChange('markdown-preview-plus.style', (val) => {
        handlePromise(this.handler.setClientStyle(val.newValue))
      }),
    )
    this.element = document.createElement('div')
    this.element.tabIndex = -1
    this.element.classList.add('markdown-preview-plus')
    MarkdownPreviewView.elementMap.set(this.element, this)
    this.subscribeController()
    this._initialRenderPromsie = new Promise((resolve) => {
      this.disposables.add(
        this.emitter.on('did-init', () => {
          handlePromise(
            this.renderMarkdown().then(() => {
              this.loading = false
              resolve()
            }),
          )
        }),
      )
    })
    if (this.handler.element) this.element.appendChild(this.handler.element)
    this.handler.registerViewEvents(this)
    this.disposables.add(this.handler.onDidDestroy(() => this.destroy()))
    this.handleEvents()
  }

  public static viewForElement(element: HTMLElement) {
    return MarkdownPreviewView.elementMap.get(element)
  }

  public serialize(): SerializedMPV {
    return this.controller.serialize()
  }

  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.emitter.emit('did-destroy')
    this.disposables.dispose()
    this.controller.destroy()
    this.handler.destroy()
    MarkdownPreviewView.elementMap.delete(this.element)
    this.element.remove()
  }

  public onDidDestroy(callback: () => void) {
    return this.emitter.on('did-destroy', callback)
  }

  public async runJS<T>(js: string) {
    return this.handler.runJS<T>(js)
  }

  public async initialRenderPromise() {
    await this._initialRenderPromsie
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

  public getTitle(): string {
    return this.controller.getTitle()
  }

  public getDefaultLocation(): 'left' | 'right' | 'bottom' | 'center' {
    return atomConfig().previewConfig.previewDock
  }

  public getIconName() {
    return 'markdown'
  }

  public getURI(): string {
    return this.controller.getURI()
  }

  public getPath(): string | undefined {
    return this.controller.getPath()
  }

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

    const config = atomConfig()
    if (ext === '.pdf') {
      handlePromise(
        this.getMarkdownSource().then(async (mdSource) => {
          await saveAsPDF(
            mdSource,
            this.getPath(),
            this.getGrammar(),
            this.renderLaTeX,
            filePath,
          )
          if (config.saveConfig.openOnSave.pdf) {
            return shellOpen(pathToFileURL(filePath).toString())
          } else return
        }),
      )
    } else {
      const style = config.style
      handlePromise(
        this.getHTMLToSave(filePath).then(async (html) => {
          const fullHtml = util.mkHtml(
            name,
            html,
            this.renderLaTeX,
            await this.handler.getTeXConfig(),
            style,
          )

          fs.writeFileSync(filePath, fullHtml)
          if (config.saveConfig.openOnSave.html) {
            return atom.workspace.open(filePath)
          } else return undefined
        }),
      )
    }
  }

  public openMainWindow(): void {
    const ctrl = this.createNewFromThis(WebviewHandler)
    handlePromise(openPreviewPane(ctrl))
    util.destroy(this)
  }

  protected openNewWindow(): void {
    const ctrl = this.createNewFromThis(BrowserWindowHandler)
    atom.views.getView(atom.workspace).appendChild(ctrl.element)
    util.destroy(this)
  }

  protected createNewFromThis(
    handler: new (
      clientStyle: util.ClientStyle,
      x: () => Promise<void>,
    ) => WebContentsHandler,
  ) {
    const curController = this.controller
    // this will get destroyed shortly, but we create it for consistency
    this.controller = new MarkdownPreviewControllerText(
      this.getMarkdownSource(),
    )
    this.subscribeController()
    return new MarkdownPreviewView(curController, this.renderLaTeX, handler)
  }

  protected changeHandler = () => {
    handlePromise(this.renderMarkdown())

    const pane = atom.workspace.paneForItem(this)
    if (pane !== undefined && pane !== atom.workspace.getActivePane()) {
      pane.activateItem(this)
    }
  }

  protected async getMarkdownSource(): Promise<string> {
    return this.controller.getMarkdownSource()
  }

  protected getGrammar(): Grammar | undefined {
    return this.controller.getGrammar()
  }

  protected async openSource(initialLine?: number) {
    const path = this.getPath()
    if (path === undefined) return undefined
    const ed = await atom.workspace.open(path, {
      initialLine,
      searchAllPanes: true,
    })
    if (!atom.workspace.isTextEditor(ed)) return undefined
    if (this.controller.type !== 'editor') {
      this.controller.destroy()
      this.controller = new MarkdownPreviewControllerEditor(ed)
      this.subscribeController()
    }
    return ed
  }

  protected async syncPreview(line: number, flash: boolean) {
    return this.handler.sync(line, flash)
  }

  private handleEvents() {
    this.disposables.add(
      // atom events
      atom.grammars.onDidAddGrammar(() =>
        debounce(() => {
          handlePromise(this.renderMarkdown())
        }, 250),
      ),
      atom.grammars.onDidUpdateGrammar(
        debounce(() => {
          handlePromise(this.renderMarkdown())
        }, 250),
      ),
      atom.commands.add(this.element, {
        'core:move-up': () =>
          this.handler.runJS('window.scrollBy({top:-30, behavior: "auto"})'),
        'core:move-down': () =>
          this.handler.runJS('window.scrollBy({top:30, behavior: "auto"})'),
        'core:move-left': () =>
          this.handler.runJS('window.scrollBy({left:-30, behavior: "auto"})'),
        'core:move-right': () =>
          this.handler.runJS('window.scrollBy({left:-30, behavior: "auto"})'),
        'core:page-up': () =>
          this.handler.runJS(
            'window.scrollBy({top:-0.9*window.innerHeight, behavior: "auto"})',
          ),
        'core:page-down': () =>
          this.handler.runJS(
            'window.scrollBy({top:0.9*window.innerHeight, behavior: "auto"})',
          ),
        'core:move-to-top': () =>
          this.handler.runJS(
            'window.scrollBy({top:-document.body.scrollHeight, behavior: "smooth"})',
          ),
        'core:move-to-bottom': () =>
          this.handler.runJS(
            'window.scrollBy({top:document.body.scrollHeight, behavior: "smooth"})',
          ),
        'core:cancel': (evt) => {
          if (this.handler.hasSearch()) handlePromise(this.handler.stopSearch())
          else evt.abortKeyBinding()
        },
        'core:copy': () => {
          handlePromise(this.copyToClipboard())
        },
        'markdown-preview-plus:open-dev-tools': () => {
          handlePromise(this.handler.openDevTools())
        },
        'markdown-preview-plus:new-window': () => {
          this.openNewWindow()
        },
        'markdown-preview-plus:print': () => {
          handlePromise(this.handler.print())
        },
        'markdown-preview-plus:zoom-in': () => {
          handlePromise(this.handler.zoomIn())
        },
        'markdown-preview-plus:zoom-out': () => {
          handlePromise(this.handler.zoomOut())
        },
        'markdown-preview-plus:reset-zoom': () => {
          handlePromise(this.handler.resetZoom())
        },
        'markdown-preview-plus:sync-source': (_event) => {
          handlePromise(
            this.handler.syncSource().then((line) => this.openSource(line)),
          )
        },
        'markdown-preview-plus:search-selection-in-source': () => {
          handlePromise(this.searchSelectionInSource())
        },
        'markdown-preview-plus:find-next': () => {
          handlePromise(this.handler.findNext())
        },
        'markdown-preview-plus:find-in-preview': () => {
          const cw = remote.getCurrentWindow()
          const fw = remote.BrowserWindow.getFocusedWindow()
          if (fw !== cw) cw.focus()
          handlePromise(
            modalTextEditorView('Find in preview').then((text) => {
              if (fw && fw !== cw) fw.focus()
              if (!text) return undefined
              return this.handler.search(text)
            }),
          )
        },
      }),
      atom.config.onDidChange('markdown-preview-plus.markdownItConfig', () => {
        if (atomConfig().renderer === 'markdown-it') this.changeHandler()
      }),
      atom.config.onDidChange('markdown-preview-plus.pandocConfig', () => {
        if (atomConfig().renderer === 'pandoc') this.changeHandler()
      }),
      atom.config.onDidChange(
        'markdown-preview-plus.mathConfig.latexRenderer',
        () => handlePromise(this.handler.reload()),
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.mathConfig.numberEquations',
        () => handlePromise(this.handler.reload()),
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.previewConfig.nativePageScrollKeys',
        ({ newValue }) => handlePromise(this.handler.setNativeKeys(newValue)),
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.renderer',
        this.changeHandler,
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.previewConfig.highlighter',
        this.changeHandler,
      ),

      // webview events
      this.handler.emitter.on('did-scroll-preview', ({ min, max }) => {
        this.controller.didScrollPreview(min, max)
      }),
    )
  }

  private async renderMarkdown(): Promise<void> {
    return this.renderMarkdownText(await this.getMarkdownSource())
  }

  private async getHTMLToSave(savePath: string) {
    const source = await this.getMarkdownSource()
    return renderer.render({
      text: source,
      filePath: this.getPath(),
      grammar: this.getGrammar(),
      renderLaTeX: this.renderLaTeX,
      renderErrors: false,
      mode: 'save',
      savePath,
    })
  }

  private async renderMarkdownText(text: string): Promise<void> {
    try {
      const domDocument = await renderer.render({
        text,
        filePath: this.getPath(),
        grammar: this.getGrammar(),
        renderLaTeX: this.renderLaTeX,
        renderErrors: true,
        mode: 'normal',
        imageWatcher: this.handler.imageWatcher,
      })

      if (this.destroyed) return
      const config = atomConfig()
      await this.handler.update(
        domDocument.documentElement!.outerHTML,
        this.renderLaTeX,
        config.previewConfig.diffMethod,
        util.buildLineMap(
          domDocument.querySelector('[data-pos]')
            ? domDocument
            : await MarkdownItWorker.getTokens(text, this.renderLaTeX),
        ),
        config.syncConfig.syncPreviewOnEditorScroll
          ? this.controller.getScrollSyncParams()
          : undefined,
      )
      this.emitter.emit('did-change-markdown')
    } catch (error) {
      await this.showError(error as Error)
    }
  }

  private async showError(error: Error) {
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
    } else if (this.loading) {
      atom.notifications.addFatalError(
        'Error reported when Markdown Preview Plus view is loading',
        {
          dismissable: true,
          stack: error.stack,
          detail: error.message,
        },
      )
      return
    } else {
      return this.handler.error(error.message)
    }
  }

  private async copyToClipboard(): Promise<void> {
    const selection = await this.handler.getSelection()
    // Use stupid copy event handler if there is selected text inside this view
    if (selection !== undefined) {
      if (atom.config.get('markdown-preview-plus.richClipboard')) {
        await this.handler.runJS('document.execCommand("copy")')
      } else {
        clipboard.writePlain(selection)
      }
    } else {
      const src = await this.getMarkdownSource()
      await copyHtml(src, this.getPath(), this.renderLaTeX, atomConfig().style)
    }
  }

  private async searchSelectionInSource() {
    const text = await this.handler.getSelection()
    if (!text) return
    const editor = await this.openSource()
    if (!editor) return
    const rxs = text
      .replace(/[\/\\^$*+?.()|[\]{}]/g, '\\$&')
      .replace(/\n+$/, '')
      .replace(/\s+/g, '\\s+')
    const rx = new RegExp(rxs)
    let found = false
    editor.scanInBufferRange(
      rx,
      new Range(
        editor.getCursors()[0].getBufferPosition(),
        editor.getBuffer().getRange().end,
      ),
      (it) => {
        editor.scrollToBufferPosition(it.range.start)
        editor.setSelectedBufferRange(it.range)
        found = true
        it.stop()
      },
    )
    if (found) return
    editor.scan(rx, (it) => {
      editor.scrollToBufferPosition(it.range.start)
      editor.setSelectedBufferRange(it.range)
      it.stop()
    })
  }

  private subscribeController() {
    if (this.controllerDisposables) {
      this.disposables.remove(this.controllerDisposables)
      this.controllerDisposables.dispose()
    }
    this.controllerDisposables = new CompositeDisposable()
    this.disposables.add(this.controllerDisposables)
    this.controllerDisposables.add(
      this.controller.onDidChange(this.changeHandler),
      this.controller.onDidChangePath((path) => {
        handlePromise(this.handler.setBasePath(path))
        this.emitter.emit('did-change-title')
      }),
      this.controller.onDidDestroy(() => {
        if (atomConfig().previewConfig.closePreviewWithEditor) {
          util.destroy(this)
        } else {
          const path = this.controller.getPath()
          if (path) {
            this.controller = new MarkdownPreviewControllerFile(path)
          } else {
            this.controller = new MarkdownPreviewControllerText(
              this.controller.getMarkdownSource(),
            )
          }
          this.subscribeController()
        }
      }),
      this.controller.onActivate((edPane) => {
        const pane = atom.workspace.paneForItem(this)
        if (!pane) return
        if (pane === edPane) return
        pane.activateItem(this)
      }),
      this.controller.onScrollSync(({ firstLine, lastLine }) => {
        handlePromise(this.handler.scrollSync(firstLine, lastLine))
      }),
      this.controller.onSearch((text) => {
        handlePromise(this.handler.search(text))
      }),
      this.controller.onSync(([pos, flash]) => {
        handlePromise(this.syncPreview(pos, flash))
      }),
    )
  }
}
