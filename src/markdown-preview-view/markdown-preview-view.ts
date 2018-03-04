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
import { UpdatePreview } from '../update-preview'
import markdownIt = require('../markdown-it-helper')
import imageWatcher = require('../image-watch-helper')
import { handlePromise, injectScript } from '../util'
import * as util from './util'

export interface SerializedMPV {
  deserializer: 'markdown-preview-plus/MarkdownPreviewView'
  editorId?: number
  filePath?: string
}

export type MarkdownPreviewViewElement = HTMLIFrameElement & {
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
  private rootElement?: HTMLElement
  private preview?: HTMLElement
  private updatePreview?: UpdatePreview
  private renderLaTeX: boolean = atom.config.get(
    'markdown-preview-plus.enableLatexRenderingByDefault',
  )
  private loaded = true // Do not show the loading spinnor on initial load
  private lastTarget?: HTMLElement

  protected constructor() {
    this.element = document.createElement('iframe') as any
    this.element.getModel = () => this
    this.element.classList.add('markdown-preview-plus', 'native-key-bindings')
    this.element.src = 'about:blank'
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
    this.renderPromise = new Promise((resolve) => {
      const onload = () => {
        if (this.destroyed) return
        if (this.updatePreview) this.updatePreview = undefined
        const doc = this.element.contentDocument
        this.updateStyles()
        handlePromise(
          injectScript(doc, require.resolve('../misc-stub')).then(() => {
            this.element.contentWindow.miscStub.handleScroll(this.handleScroll)
          }),
        )
        this.rootElement = doc.createElement('markdown-preview-plus-view')
        this.rootElement.classList.add('native-key-bindings')
        this.rootElement.tabIndex = -1
        if (atom.config.get('markdown-preview-plus.useGitHubStyle')) {
          this.rootElement.setAttribute('data-use-github-style', '')
        }
        this.preview = doc.createElement('div')
        this.preview.classList.add('update-preview')
        this.rootElement.appendChild(this.preview)
        doc.body.appendChild(this.rootElement)
        this.rootElement.oncontextmenu = (e) => {
          this.lastTarget = e.target as HTMLElement
          const pane = atom.workspace.paneForItem(this)
          if (pane) pane.activate()
          atom.contextMenu.showForEvent(
            Object.assign({}, e, { target: this.element }),
          )
        }

        this.emitter.emit('did-change-title')
        resolve(this.renderMarkdown())
      }
      this.element.addEventListener('load', onload)
    })
  }

  public text() {
    if (!this.rootElement) return ''
    return this.rootElement.textContent || ''
  }

  public find(what: string) {
    if (!this.rootElement) return null
    return this.rootElement.querySelector(what)
  }

  public findAll(what: string) {
    if (!this.rootElement) return []
    return this.rootElement.querySelectorAll(what)
  }

  public getRoot() {
    return this.rootElement
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

  public async refreshImages(oldsrc: string) {
    const imgs = this.findAll('img[src]') as NodeListOf<HTMLImageElement>
    const result = []
    for (const img of Array.from(imgs)) {
      let ovs: string | undefined
      let ov: number | undefined
      let src = img.getAttribute('src')!
      const match = src.match(/^(.*)\?v=(\d+)$/)
      if (match) {
        ;[, src, ovs] = match
      }
      if (src === oldsrc) {
        if (ovs !== undefined) {
          ov = parseInt(ovs, 10)
        }
        const v = await imageWatcher.getVersion(src, this.getPath())
        if (v !== ov) {
          if (v) {
            result.push((img.src = `${src}?v=${v}`))
          } else {
            result.push((img.src = `${src}`))
          }
        } else {
          result.push(undefined)
        }
      } else {
        result.push(undefined)
      }
    }
    return result
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
    if (!this.preview) return undefined
    if (!this.rootElement) return undefined
    const tokens = markdownIt.getTokens(text, this.renderLaTeX)
    const pathToToken = util.getPathToToken(tokens, line)

    let element = this.preview
    for (const token of pathToToken) {
      const candidateElement: HTMLElement | null = element
        .querySelectorAll(`:scope > ${token.tag}`)
        .item(token.index) as HTMLElement
      if (candidateElement) {
        element = candidateElement
      } else {
        break
      }
    }

    if (element.classList.contains('update-preview')) {
      return undefined
    } // Do not jump to the top of the preview for bad syncs

    if (!element.classList.contains('update-preview')) {
      element.scrollIntoView()
    }
    const maxScrollTop =
      this.rootElement.scrollHeight - this.rootElement.clientHeight
    if (!(this.rootElement.scrollTop >= maxScrollTop)) {
      this.rootElement.scrollTop -= this.rootElement.clientHeight / 4
    }

    element.classList.add('flash')
    setTimeout(() => element!.classList.remove('flash'), 1000)

    return element
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
        'core:move-up': () =>
          this.rootElement && this.rootElement.scrollBy({ top: -10 }),
        'core:move-down': () =>
          this.rootElement && this.rootElement.scrollBy({ top: 10 }),
        'core:copy': (event: CommandEvent) => {
          if (this.copyToClipboard()) event.stopPropagation()
        },
        'markdown-preview-plus:zoom-in': () => {
          if (!this.rootElement) return
          const zoomLevel = parseFloat(this.rootElement.style.zoom || '1')
          this.rootElement.style.zoom = (zoomLevel + 0.1).toString()
        },
        'markdown-preview-plus:zoom-out': () => {
          if (!this.rootElement) return
          const zoomLevel = parseFloat(this.rootElement.style.zoom || '1')
          this.rootElement.style.zoom = (zoomLevel - 0.1).toString()
        },
        'markdown-preview-plus:reset-zoom': () => {
          if (!this.rootElement) return
          this.rootElement.style.zoom = '1'
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
          if (newValue) {
            this.rootElement &&
              this.rootElement.setAttribute('data-use-github-style', '')
          } else {
            this.rootElement &&
              this.rootElement.removeAttribute('data-use-github-style')
          }
        },
      ),
    )
  }

  private async renderMarkdown(): Promise<void> {
    if (!this.loaded) {
      this.showLoading()
    }
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
      this.loaded = true
      // div.update-preview created after constructor st UpdatePreview cannot
      // be instanced in the constructor
      if (!this.preview) return
      if (!this.updatePreview) {
        this.updatePreview = new UpdatePreview(this.preview)
      }
      const domFragment = document.createDocumentFragment()
      for (const elem of Array.from(domDocument.body.childNodes)) {
        domFragment.appendChild(elem)
      }
      this.updatePreview.update(this.element, domFragment, this.renderLaTeX)
      const doc = this.element.contentDocument
      if (doc && domDocument.head.hasChildNodes) {
        let container = doc.head.querySelector('original-elements')
        if (!container) {
          container = doc.createElement('original-elements')
          doc.head.appendChild(container)
        }
        container.innerHTML = ''
        for (const headElement of Array.from(domDocument.head.childNodes)) {
          container.appendChild(headElement.cloneNode(true))
        }
      }
      this.emitter.emit('did-change-markdown')
    } catch (error) {
      this.showError(error as Error)
    }
  }

  private showError(error: Error) {
    console.error(error)
    if (!this.preview) return
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
    const errorDiv = this.element.contentDocument.createElement('div')
    errorDiv.innerHTML = `<h2>Previewing Markdown Failed</h2><h3>${
      error.message
    }</h3>`
    this.preview.appendChild(errorDiv)
  }

  private showLoading() {
    if (!this.preview) return
    this.loading = true
    const spinner = this.element.contentDocument.createElement('div')
    spinner.classList.add('markdown-spinner')
    spinner.innerText = 'Loading Markdown\u2026'
    this.preview.appendChild(spinner)
  }

  private copyToClipboard() {
    if (this.loading || !this.preview) {
      return false
    }

    const selection = window.getSelection()
    const selectedText = selection.toString()
    const selectedNode = selection.baseNode as HTMLElement

    // Use default copy event handler if there is selected text inside this view
    if (
      selectedText &&
      // tslint:disable-next-line:strict-type-predicates //TODO: complain on TS
      selectedNode != null &&
      (this.preview === selectedNode || this.preview.contains(selectedNode))
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
    const doc = this.element.contentDocument
    if (!doc) return
    let elem = doc.head.querySelector('atom-styles')
    if (!elem) {
      elem = doc.createElement('atom-styles')
      doc.head.appendChild(elem)
    }
    elem.innerHTML = ''
    for (const se of atom.styles.getStyleElements()) {
      elem.appendChild(se.cloneNode(true))
    }
  }

  private handleScroll = (event: WheelEvent) => {
    if (event.ctrlKey) {
      if (event.wheelDeltaY > 0) {
        atom.commands.dispatch(this.element, 'markdown-preview-plus:zoom-in')
      } else if (event.wheelDeltaY < 0) {
        atom.commands.dispatch(this.element, 'markdown-preview-plus:zoom-out')
      }
      event.preventDefault()
      event.stopPropagation()
    }
  }
}
