import * as path from 'path'
import { Emitter, Disposable, CompositeDisposable, Grammar, Range } from 'atom'
import { debounce } from 'lodash'
import * as fs from 'fs'

import * as renderer from '../renderer'
import * as markdownIt from '../markdown-it-helper'
import { handlePromise, copyHtml, atomConfig } from '../util'
import * as util from './util'
import { WebviewHandler } from './webview-handler'
import { saveAsPDF } from './pdf-export-util'
import { loadUserMacros } from '../macros-util'
import { WebContentsHandler } from './web-contents-handler'

export interface SerializedMPV {
  deserializer: 'markdown-preview-plus/MarkdownPreviewView'
  editorId?: number
  filePath?: string
}

export abstract class MarkdownPreviewView {
  private static elementMap = new WeakMap<HTMLElement, MarkdownPreviewView>()
  // used for tests
  public abstract readonly classname: string
  public element!: HTMLElement
  protected emitter: Emitter<{
    'did-change-title': undefined
    'did-change-markdown': undefined
  }> = new Emitter()
  protected disposables = new CompositeDisposable()
  protected destroyed = false
  private loading: boolean = true
  private _initialRenderPromsie: Promise<void>

  protected constructor(
    private renderLaTeX: boolean = atomConfig().mathConfig
      .enableLatexRenderingByDefault,
    protected readonly handler = new Promise<WebContentsHandler>((resolve) => {
      const handler = new WebviewHandler(async () => {
        const config = atomConfig()
        await handler.init({
          userMacros: loadUserMacros(),
          mathJaxConfig: config.mathConfig,
          context: 'live-preview',
        })
        await handler.setBasePath(this.getPath())
        this.emitter.emit('did-change-title')
        resolve(handler)
      })
      this.element = handler.element
    }),
    el?: HTMLElement,
  ) {
    if (!this.element && el) this.element = el
    if (!this.element) {
      throw new Error(
        "Init function didn't set element and no element provided",
      )
    }
    MarkdownPreviewView.elementMap.set(this.element, this)
    this._initialRenderPromsie = this.handler
      .then(() => this.renderMarkdown())
      .then(() => {
        this.loading = false
      })
    handlePromise(
      this.handler.then(async (handler) => {
        this.disposables.add(handler.onDidDestroy(() => this.destroy()))
        return this.handleEvents()
      }),
    )
  }

  public static viewForElement(element: HTMLElement) {
    return MarkdownPreviewView.elementMap.get(element)
  }

  public abstract serialize(): SerializedMPV

  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.disposables.dispose()
    handlePromise(this.handler.then((h) => h.destroy()))
    if (this.element) MarkdownPreviewView.elementMap.delete(this.element)
  }

  public async runJS<T>(js: string) {
    return (await this.handler).runJS<T>(js)
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
        this.getMarkdownSource().then(async (mdSource) => {
          await saveAsPDF(
            mdSource,
            this.getPath(),
            this.getGrammar(),
            this.renderLaTeX,
            filePath,
          )
          if (atomConfig().saveConfig.openOnSave.pdf) {
            return atom.workspace.open(filePath)
          } else return undefined
        }),
      )
    } else {
      handlePromise(
        this.getHTMLToSave(filePath).then(async (html) => {
          const fullHtml = util.mkHtml(
            name,
            html,
            this.renderLaTeX,
            await (await this.handler).getTeXConfig(),
          )

          fs.writeFileSync(filePath, fullHtml)
          if (atomConfig().saveConfig.openOnSave.html) {
            return atom.workspace.open(filePath)
          } else return undefined
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

  protected async syncPreview(line: number, flash: boolean) {
    return (await this.handler).sync(line, flash)
  }

  protected abstract async openNewWindow(): Promise<void>

  private async handleEvents() {
    const handler = await this.handler
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
          handler.runJS('window.scrollBy({top:-30, behavior: "auto"})'),
        'core:move-down': () =>
          handler.runJS('window.scrollBy({top:30, behavior: "auto"})'),
        'core:move-left': () =>
          handler.runJS('window.scrollBy({left:-30, behavior: "auto"})'),
        'core:move-right': () =>
          handler.runJS('window.scrollBy({left:-30, behavior: "auto"})'),
        'core:page-up': () =>
          handler.runJS(
            'window.scrollBy({top:-window.innerHeight, behavior: "auto"})',
          ),
        'core:page-down': () =>
          handler.runJS(
            'window.scrollBy({top:window.innerHeight, behavior: "auto"})',
          ),
        'core:move-to-top': () =>
          handler.runJS(
            'window.scrollBy({top:-document.body.scrollHeight, behavior: "smooth"})',
          ),
        'core:move-to-bottom': () =>
          handler.runJS(
            'window.scrollBy({top:document.body.scrollHeight, behavior: "smooth"})',
          ),
        'core:cancel': (evt) => {
          if (handler.hasSearch()) handlePromise(handler.stopSearch())
          else evt.abortKeyBinding()
        },
        'core:copy': () => {
          handlePromise(this.copyToClipboard())
        },
        'markdown-preview-plus:open-dev-tools': () => {
          handlePromise(handler.openDevTools())
        },
        'markdown-preview-plus:new-window': () => {
          handlePromise(this.openNewWindow())
        },
        'markdown-preview-plus:print': () => {
          handlePromise(handler.print())
        },
        'markdown-preview-plus:zoom-in': () => {
          handlePromise(handler.zoomIn())
        },
        'markdown-preview-plus:zoom-out': () => {
          handlePromise(handler.zoomOut())
        },
        'markdown-preview-plus:reset-zoom': () => {
          handlePromise(handler.resetZoom())
        },
        'markdown-preview-plus:sync-source': async (_event) => {
          const line = await handler.syncSource()
          this.openSource(line)
        },
        'markdown-preview-plus:search-selection-in-source': async (_event) => {
          const text = await handler.getSelection()
          if (!text) return
          const path = this.getPath()
          if (path === undefined) return
          handlePromise(
            atom.workspace
              .open(path, { searchAllPanes: true })
              .then((editor) => {
                if (!atom.workspace.isTextEditor(editor)) return
                const rxs = text
                  .replace(/[\/\\^$*+?.()|[\]{}]/g, '\\$&')
                  .replace(/\n+$/, '')
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
              }),
          )
        },
        'markdown-preview-plus:find-next': async () => {
          handlePromise(handler.findNext())
        },
        'markdown-preview-plus:find-in-preview': () => {
          const activeElement = document.activeElement as HTMLElement | null
          const ed = atom.workspace.buildTextEditor({
            mini: true,
          })
          const edv = atom.views.getView(ed)
          const disp1 = edv.onDidAttach(() => {
            atom.views.getView(ed).focus()
            disp1.dispose()
          })
          edv.addEventListener('blur', () => {
            atom.commands.dispatch(edv, 'core:cancel')
          })
          const panel = atom.workspace.addModalPanel({
            item: ed,
            visible: true,
          })
          const disp = atom.commands.add(atom.views.getView(ed), {
            'core:confirm': () => {
              handlePromise(handler.search(ed.getText()))
              panel.destroy()
              disp.dispose()
              if (activeElement) activeElement.focus()
            },
            'core:cancel': () => {
              panel.destroy()
              disp.dispose()
              if (activeElement) activeElement.focus()
            },
          })
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
          handlePromise(handler.reload())
        },
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.mathConfig.numberEquations',
        () => {
          handlePromise(handler.reload())
        },
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.renderer',
        this.changeHandler,
      ),
      atom.config.onDidChange('markdown-preview-plus.useGitHubStyle', () => {
        handlePromise(handler.updateStyles())
      }),
      atom.config.onDidChange('markdown-preview-plus.syntaxThemeName', () => {
        handlePromise(handler.updateStyles())
      }),
      atom.config.onDidChange(
        'markdown-preview-plus.importPackageStyles',
        () => {
          handlePromise(handler.updateStyles())
        },
      ),

      // webview events
      handler.emitter.on('did-scroll-preview', ({ min, max }) => {
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
        imageWatcher: (await this.handler).imageWatcher,
      })

      if (this.destroyed) return
      const handler = await this.handler
      await handler.update(
        domDocument.documentElement!.outerHTML,
        this.renderLaTeX,
      )
      await handler.setSourceMap(
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
      return (await this.handler).error(error.message)
    }
  }

  private async copyToClipboard(): Promise<void> {
    const handler = await this.handler
    const selection = await handler.getSelection()
    // Use stupid copy event handler if there is selected text inside this view
    if (selection !== undefined) {
      if (atom.config.get('markdown-preview-plus.richClipboard')) {
        await handler.runJS('document.execCommand("copy")')
      } else {
        atom.clipboard.write(selection)
      }
    } else {
      const src = await this.getMarkdownSource()
      await copyHtml(src, this.getPath(), this.renderLaTeX)
    }
  }
}
