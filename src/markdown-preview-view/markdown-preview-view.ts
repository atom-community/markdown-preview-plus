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

import renderer = require('../renderer')
import markdownIt = require('../markdown-it-helper')
import imageWatcher = require('../image-watch-helper')
import { handlePromise, copyHtml, atomConfig } from '../util'
import * as util from './util'
import { WebviewHandler } from './webview-handler'

export interface SerializedMPV {
  deserializer: 'markdown-preview-plus/MarkdownPreviewView'
  editorId?: number
  filePath?: string
}

export abstract class MarkdownPreviewView {
  private static elementMap = new WeakMap<HTMLElement, MarkdownPreviewView>()

  public readonly renderPromise: Promise<void>
  public readonly runJS: MarkdownPreviewView['handler']['runJS']
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

  protected constructor(
    private defaultRenderMode: Exclude<renderer.RenderMode, 'save'> = 'normal',
    private renderLaTeX: boolean = atomConfig().mathConfig
      .enableLatexRenderingByDefault,
  ) {
    this.renderPromise = new Promise((resolve) => {
      this.handler = new WebviewHandler(() => {
        this.handler.init(
          atom.getConfigDirPath(),
          atomConfig().mathConfig.numberEquations,
        )
        // TODO: observe
        this.handler.setUseGitHubStyle(
          atom.config.get('markdown-preview-plus.useGitHubStyle'),
        )
        this.handler.setBasePath(this.getPath())
        this.emitter.emit('did-change-title')
        resolve(this.renderMarkdown())
      })
      MarkdownPreviewView.elementMap.set(this.element, this)
    })
    this.runJS = this.handler.runJS.bind(this.handler)
    this.handleEvents()
    this.handler.emitter.on('did-scroll-preview', ({ min, max }) => {
      this.didScrollPreview(min, max)
    })
  }

  public static viewForElement(element: HTMLElement) {
    return MarkdownPreviewView.elementMap.get(element)
  }

  public abstract serialize(): SerializedMPV

  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    const path = this.getPath()
    path && imageWatcher.removeFile(path)
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

  public async refreshImages(oldsrc: string): Promise<void> {
    const v = await imageWatcher.getVersion(oldsrc, this.getPath())
    this.handler.updateImages(oldsrc, v)
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
      this.handler.saveToPDF(filePath)
    } else {
      handlePromise(
        this.getHTMLToSave(filePath).then(async (html) => {
          const fullHtml = util.mkHtml(
            name,
            html,
            this.renderLaTeX,
            atom.config.get('markdown-preview-plus.useGitHubStyle'),
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

  protected syncPreview(line: number) {
    this.handler.sync(line)
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
          handlePromise(this.handler.reload())
        },
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.renderer',
        this.changeHandler,
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.useGitHubStyle',
        ({ newValue }) => {
          this.handler.setUseGitHubStyle(newValue)
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
      handlePromise(
        this.handler.update(
          domDocument.documentElement.outerHTML,
          this.renderLaTeX,
          atomConfig().mathConfig.latexRenderer,
        ),
      )
      this.handler.setSourceMap(
        util.buildLineMap(markdownIt.getTokens(text, this.renderLaTeX)),
      )
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
    this.handler.error(error.message)
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
}
