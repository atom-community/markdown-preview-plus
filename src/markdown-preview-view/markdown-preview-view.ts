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
import { handlePromise } from '../util'
import * as util from './util'

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
  private renderLaTeX: boolean = atom.config.get(
    'markdown-preview-plus.enableLatexRenderingByDefault',
  )
  private lastTarget?: HTMLElement
  private zoomLevel = 0

  protected constructor() {
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
    this.element.addEventListener('ipc-message', (e) => {
      switch (e.channel) {
        case 'context-menu':
          this.lastTarget = e.target as HTMLElement
          const pane = atom.workspace.paneForItem(this)
          if (pane) pane.activate()
          const evt = e.args[0] as PointerEvent
          atom.contextMenu.showForEvent(
            Object.assign({}, evt, { target: this.element }),
          )
          break
        case 'zoom-in':
          atom.commands.dispatch(this.element, 'markdown-preview-plus:zoom-in')
          break
        case 'zoom-out':
          atom.commands.dispatch(this.element, 'markdown-preview-plus:zoom-out')
          break
        default:
          throw new Error(`Unknown message recieved ${e.channel}`)
      }
    })
    this.renderPromise = new Promise((resolve) => {
      const onload = () => {
        if (this.destroyed) return
        this.element.openDevTools()
        this.updateStyles()
        this.element.send(
          'use-github-style',
          atom.config.get('markdown-preview-plus.useGitHubStyle'),
        )
        this.emitter.emit('did-change-title')
        resolve(this.renderMarkdown())
      }
      this.element.addEventListener('dom-ready', onload)
    })
  }

  public async text() {
    const text = await this.runJS('getText()')
    return text
  }

  public async html() {
    const text = await this.runJS('getHTML()')
    return text
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
    this.element.send('update-images', oldsrc, v)
  }

  public abstract getTitle(): string

  public getIconName() {
    return 'markdown'
  }

  public abstract getURI(): string

  public abstract getPath(): string | undefined

  public getSaveDialogOptions() {
    let defaultPath = this.getPath()
    if (defaultPath) {
      defaultPath += '.html'
    } else {
      const projectPath = atom.project.getPaths()[0]
      defaultPath = 'untitled.md.html'
      if (projectPath) {
        defaultPath = path.join(projectPath, defaultPath)
      }
    }
    return { defaultPath }
  }

  public saveAs(htmlFilePath: string | undefined) {
    if (htmlFilePath === undefined) return
    if (this.loading) return

    const title = path.parse(htmlFilePath).name

    handlePromise(
      this.getHTML().then(async (html) => {
        const fullHtml = util.mkHtml(
          title,
          html,
          this.renderLaTeX,
          atom.config.get('markdown-preview-plus.useGitHubStyle'),
        )

        fs.writeFileSync(htmlFilePath, fullHtml)
        return atom.workspace.open(htmlFilePath)
      }),
    )
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
  protected syncPreview(text: string, line: number) {
    const tokens = markdownIt.getTokens(text, this.renderLaTeX)
    const pathToToken = util.getPathToToken(tokens, line)
    this.element.send('sync', pathToToken)
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
        'markdown-preview-plus:sync-source': (_event) => {
          const lastTarget = this.lastTarget
          if (!lastTarget) return
          handlePromise(
            this.getMarkdownSource().then((source?: string) => {
              if (source === undefined) {
                return
              }
              this.syncSource(source, lastTarget)
            }),
          )
        },
      }),
    )

    this.disposables.add(
      atom.config.onDidChange(
        'markdown-preview-plus.breakOnSingleNewline',
        this.changeHandler,
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.useLazyHeaders',
        this.changeHandler,
      ),
      atom.config.onDidChange(
        'markdown-preview-plus.useGitHubStyle',
        ({ newValue }) => {
          this.element.send('use-github-style', newValue)
        },
      ),
    )
  }

  private async runJS<T>(js: string) {
    return new Promise<T>((resolve) =>
      this.element.executeJavaScript(js, false, resolve),
    )
  }

  private async renderMarkdown(): Promise<void> {
    const source = await this.getMarkdownSource()
    await this.renderMarkdownText(source)
  }

  private async getHTML() {
    const source = await this.getMarkdownSource()
    return renderer.toHTML(
      source,
      this.getPath(),
      this.getGrammar(),
      this.renderLaTeX,
      false,
    )
  }

  private async renderMarkdownText(text: string): Promise<void> {
    try {
      const domDocument = await renderer.render(
        text,
        this.getPath(),
        this.renderLaTeX,
        false,
      )
      if (this.destroyed) return
      this.loading = false
      this.element.send(
        'update-preview',
        domDocument.documentElement.outerHTML,
        this.renderLaTeX,
        !atom.config.get('markdown-preview-plus.enablePandoc') ||
          !atom.config.get('markdown-preview-plus.useNativePandocCodeStyles'),
        atom.config.get('markdown-preview-plus.latexRenderer'),
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
    this.element.send('error', error.message)
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
      this.getHTML().then(function(html) {
        atom.clipboard.write(html.body.innerHTML)
      }),
    )

    return true
  }

  //
  // Set the associated editors cursor buffer position to the line representing
  // the source markdown of a target element.
  //
  // @param {string} text Source markdown of the associated editor.
  // @param {HTMLElement} element Target element contained within the assoicated
  //   `markdown-preview-plus-view` container. The method will attempt to identify the
  //   line of `text` that represents `element` and set the cursor to that line.
  // @return {number|null} The line of `text` that represents `element`. If no
  //   line is identified `null` is returned.
  //
  private syncSource(text: string, element: HTMLElement) {
    const filePath = this.getPath()
    if (!filePath) return null
    const pathToElement = util.getPathToElement(element)
    pathToElement.shift() // remove markdown-preview-plus-view
    pathToElement.shift() // remove div.update-preview
    if (!pathToElement.length) {
      return null
    }

    const tokens = markdownIt.getTokens(text, this.renderLaTeX)
    let finalToken = null
    let level = 0

    for (const token of tokens) {
      if (token.level < level) {
        break
      }
      if (token.hidden) {
        continue
      }
      if (token.tag === pathToElement[0].tag && token.level === level) {
        if (token.nesting === 1) {
          if (pathToElement[0].index === 0) {
            // tslint:disable-next-line:strict-type-predicates // TODO: complain on DT
            if (token.map != null) {
              finalToken = token
            }
            pathToElement.shift()
            level++
          } else {
            pathToElement[0].index--
          }
        } else if (
          token.nesting === 0 &&
          ['math', 'code', 'hr'].includes(token.tag)
        ) {
          if (pathToElement[0].index === 0) {
            finalToken = token
            break
          } else {
            pathToElement[0].index--
          }
        }
      }
      if (pathToElement.length === 0) {
        break
      }
    }

    if (finalToken !== null) {
      // tslint:disable-next-line:no-floating-promises
      atom.workspace.open(filePath, {
        initialLine: finalToken.map[0],
        searchAllPanes: true,
      })
      return finalToken.map[0]
    } else {
      return null
    }
  }

  private updateStyles() {
    const styles: string[] = []
    for (const se of atom.styles.getStyleElements()) {
      styles.push(se.innerHTML)
    }
    this.element.send('style', styles)
  }
}
