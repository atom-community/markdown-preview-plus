import path = require('path')
import { Emitter, Disposable, CompositeDisposable, Grammar } from 'atom'
import { debounce } from 'lodash'
import fs = require('fs')

import renderer = require('../renderer')
import markdownIt = require('../markdown-it-helper')
import { handlePromise, copyHtml, atomConfig } from '../util'
import * as util from './util'
import { WebviewHandler } from './webview-handler'
import { ImageWatcher } from '../image-watch-helper'
import { saveAsPDF } from './pdf-export-util'
import { loadUserMacros } from '../macros-util'

export interface SerializedMPV {
  deserializer: 'markdown-preview-plus/MarkdownPreviewView'
  editorId?: number
  filePath?: string
}

export abstract class MarkdownPreviewView {
  private static elementMap = new WeakMap<HTMLElement, MarkdownPreviewView>()

  public readonly initialRenderPromise: Promise<void>
  public runJS!: MarkdownPreviewView['handler']['runJS']
  protected handler!: WebviewHandler
  public get element(): HTMLElement {
    return this.handler.element
  }
  protected emitter: Emitter<{
    'did-change-title': undefined
    'did-change-markdown': undefined
  }> = new Emitter()
  protected disposables = new CompositeDisposable()
  protected destroyed = false
  private loading: boolean = true
  private imageWatcher!: ImageWatcher

  protected constructor(
    private renderLaTeX: boolean = atomConfig().mathConfig
      .enableLatexRenderingByDefault,
  ) {
    this.initialRenderPromise = new Promise((resolve) => {
      this.handler = new WebviewHandler(async () => {
        const config = atomConfig()
        await this.handler.init({
          userMacros: loadUserMacros(),
          mathJaxConfig: config.mathConfig,
          context: 'live-preview',
        })
        await this.handler.setBasePath(this.getPath())
        this.emitter.emit('did-change-title')
        resolve(
          this.renderMarkdown().then(() => {
            this.loading = false
          }),
        )
      })
      this.runJS = this.handler.runJS.bind(this.handler)
      this.imageWatcher = new ImageWatcher(
        this.handler.updateImages.bind(this.handler),
      )
      MarkdownPreviewView.elementMap.set(this.element, this)
    })
    this.handleEvents()
  }

  public static viewForElement(element: HTMLElement) {
    return MarkdownPreviewView.elementMap.get(element)
  }

  public abstract serialize(): SerializedMPV

  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.imageWatcher.dispose()
    this.disposables.dispose()
    this.handler.destroy()
    MarkdownPreviewView.elementMap.delete(this.element)
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
      handlePromise(
        this.getMarkdownSource().then(async (mdSource) =>
          saveAsPDF(
            mdSource,
            this.getPath(),
            this.getGrammar(),
            this.renderLaTeX,
            filePath,
          ),
        ),
      )
    } else {
      handlePromise(
        this.getHTMLToSave(filePath).then(async (html) => {
          const fullHtml = util.mkHtml(
            name,
            html,
            this.renderLaTeX,
            await this.handler.getTeXConfig(),
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

  protected syncPreview(line: number, flash: boolean) {
    handlePromise(this.handler.sync(line, flash))
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
        'core:move-up': () => this.element.scrollBy({ top: -10 }),
        'core:move-down': () => this.element.scrollBy({ top: 10 }),
        'core:copy': () => {
          handlePromise(this.copyToClipboard())
        },
        'markdown-preview-plus:open-dev-tools': () => {
          this.handler.openDevTools()
        },
        'markdown-preview-plus:new-window': () => {
          this.openNewWindow()
        },
        'markdown-preview-plus:print': () => {
          this.handler.print()
        },
        'markdown-preview-plus:zoom-in': () => {
          this.handler.zoomIn()
        },
        'markdown-preview-plus:zoom-out': () => {
          this.handler.zoomOut()
        },
        'markdown-preview-plus:reset-zoom': () => {
          this.handler.resetZoom()
        },
        'markdown-preview-plus:sync-source': async (_event) => {
          const line = await this.handler.syncSource()
          this.openSource(line)
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
        () => {
          handlePromise(this.handler.reload())
        },
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.mathConfig.numberEquations',
        () => {
          handlePromise(this.handler.reload())
        },
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.renderer',
        this.changeHandler,
      ),
      atom.config.onDidChange('markdown-preview-plus.useGitHubStyle', () => {
        handlePromise(this.handler.updateStyles())
      }),
      atom.config.onDidChange('markdown-preview-plus.syntaxThemeName', () => {
        handlePromise(this.handler.updateStyles())
      }),
      atom.config.onDidChange(
        'markdown-preview-plus.importPackageStyles',
        () => {
          handlePromise(this.handler.updateStyles())
        },
      ),

      // webview events
      this.handler.emitter.on('did-scroll-preview', ({ min, max }) => {
        this.didScrollPreview(min, max)
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
        mode: 'normal',
        imageWatcher: this.imageWatcher,
      })

      if (this.destroyed) return
      await this.handler.update(
        domDocument.documentElement!.outerHTML,
        this.renderLaTeX,
      )
      await this.handler.setSourceMap(
        util.buildLineMap(markdownIt.getTokens(text, this.renderLaTeX)),
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
    await this.initialRenderPromise
    const selection = await this.handler.getSelection()
    // Use stupid copy event handler if there is selected text inside this view
    if (selection !== undefined) {
      // TODO: rich clipboard support
      atom.clipboard.write(selection)
    } else {
      const src = await this.getMarkdownSource()
      await copyHtml(src, this.getPath(), this.renderLaTeX)
    }
  }
}
