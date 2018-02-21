import path = require('path')
import {
  CommandEvent,
  Emitter,
  Disposable,
  CompositeDisposable,
  File,
  TextEditor,
  Grammar,
} from 'atom'
import _ = require('lodash')
import fs = require('fs')

import renderer = require('../renderer')
import { UpdatePreview } from '../update-preview'
import markdownIt = require('../markdown-it-helper')
import imageWatcher = require('../image-watch-helper')
import { handlePromise } from '../util'
import * as util from './util'

export interface MPVParamsEditor {
  editorId: number
  filePath?: undefined
}

export interface MPVParamsPath {
  editorId?: undefined
  filePath: string
}

export type MPVParams = MPVParamsEditor | MPVParamsPath

export type MarkdownPreviewViewElement = HTMLIFrameElement & {
  getModel(): MarkdownPreviewView
}

export class MarkdownPreviewView {
  private loading: boolean = true
  // tslint:disable-next-line:no-uninitialized
  private resolve: () => void
  public readonly renderPromise: Promise<void> = new Promise<void>(
    (resolve) => (this.resolve = resolve),
  )
  public readonly element: MarkdownPreviewViewElement
  private rootElement?: HTMLElement
  private preview?: HTMLElement
  private emitter: Emitter<{
    'did-change-title': undefined
    'did-change-markdown': undefined
  }> = new Emitter()
  private updatePreview?: UpdatePreview
  private renderLaTeX: boolean = atom.config.get(
    'markdown-preview-plus.enableLatexRenderingByDefault',
  )
  private disposables = new CompositeDisposable()
  private loaded = true // Do not show the loading spinnor on initial load
  private editorId?: number
  private filePath?: string
  private file?: File
  private editor?: TextEditor
  private lastTarget?: HTMLElement
  private destroyed = false

  constructor({ editorId, filePath }: MPVParams, deserialization = false) {
    this.editorId = editorId
    this.filePath = filePath
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
    const onload = () => {
      if (this.destroyed) return
      if (this.updatePreview) this.updatePreview = undefined
      const doc = this.element.contentDocument
      this.updateStyles()
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
      const didAttach = () => {
        if (this.destroyed) return
        if (this.editorId !== undefined && !this.editor) {
          this.resolveEditor(this.editorId)
        } else if (this.filePath !== undefined && !this.file) {
          this.subscribeToFilePath(this.filePath)
        }
        if (this.editor || this.file) handlePromise(this.renderMarkdown())
      }
      if (deserialization && this.editorId !== undefined) {
        // need to defer on deserialization since
        // editor might not be deserialized at this point
        setImmediate(didAttach)
        deserialization = false
      } else {
        didAttach()
      }
    }
    this.element.addEventListener('load', onload)
  }

  text() {
    if (!this.rootElement) return ''
    return this.rootElement.textContent || ''
  }

  find(what: string) {
    if (!this.rootElement) return null
    return this.rootElement.querySelector(what)
  }

  findAll(what: string) {
    if (!this.rootElement) return []
    return this.rootElement.querySelectorAll(what)
  }

  getRoot() {
    return this.rootElement
  }

  serialize() {
    return {
      deserializer: 'markdown-preview-plus/MarkdownPreviewView',
      filePath: this.getPath() || this.filePath,
      editorId: this.editorId,
    }
  }

  destroy() {
    if (this.destroyed) return
    this.destroyed = true
    const path = this.getPath()
    path && imageWatcher.removeFile(path)
    this.disposables.dispose()
    this.element.remove()
  }

  onDidChangeTitle(callback: () => void): Disposable {
    return this.emitter.on('did-change-title', callback)
  }

  onDidChangeMarkdown(callback: () => void): Disposable {
    return this.emitter.on('did-change-markdown', callback)
  }

  subscribeToFilePath(filePath: string) {
    this.file = new File(filePath)
    this.emitter.emit('did-change-title')
    this.handleEvents()
  }

  resolveEditor(editorId: number) {
    this.editor = util.editorForId(editorId)

    if (this.editor) {
      this.emitter.emit('did-change-title')
      this.handleEvents()
    } else {
      // The editor this preview was created for has been closed so close
      // this preview since a preview cannot be rendered without an editor
      const pane = atom.workspace.paneForItem(this)
      pane && pane.destroyItem(this)
    }
  }

  handleEvents() {
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

    const changeHandler = () => {
      handlePromise(this.renderMarkdown())

      const pane = atom.workspace.paneForItem(this)
      if (pane !== undefined && pane !== atom.workspace.getActivePane()) {
        pane.activateItem(this)
      }
    }

    if (this.file) {
      this.disposables.add(this.file.onDidChange(changeHandler))
    } else if (this.editor) {
      this.disposables.add(
        this.editor.getBuffer().onDidStopChanging(function() {
          if (atom.config.get('markdown-preview-plus.liveUpdate')) {
            changeHandler()
          }
        }),
        this.editor.onDidChangePath(() => {
          this.emitter.emit('did-change-title')
        }),
        this.editor.getBuffer().onDidSave(function() {
          if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
            changeHandler()
          }
        }),
        this.editor.getBuffer().onDidReload(function() {
          if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
            changeHandler()
          }
        }),
        atom.commands.add(atom.views.getView(this.editor), {
          'markdown-preview-plus:sync-preview': async (_event) => {
            const source = await this.getMarkdownSource()
            if (source === undefined) {
              return
            }
            if (!this.editor) return
            this.syncPreview(source, this.editor.getCursorBufferPosition().row)
          },
        }),
      )
    }

    this.disposables.add(
      atom.config.onDidChange(
        'markdown-preview-plus.breakOnSingleNewline',
        changeHandler,
      ),
    )

    // Toggle LaTeX rendering if focus is on preview pane or associated editor.
    this.disposables.add(
      atom.commands.add('atom-workspace', {
        'markdown-preview-plus:toggle-render-latex': () => {
          if (
            atom.workspace.getActivePaneItem() === this ||
            atom.workspace.getActiveTextEditor() === this.editor
          ) {
            this.renderLaTeX = !this.renderLaTeX
            changeHandler()
          }
        },
      }),
    )

    this.disposables.add(
      atom.config.onDidChange(
        'markdown-preview-plus.useGitHubStyle',
        (useGitHubStyle) => {
          if (useGitHubStyle) {
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

  async renderMarkdown(): Promise<void> {
    if (!this.loaded) {
      this.showLoading()
    }
    const source = await this.getMarkdownSource()
    if (source) await this.renderMarkdownText(source)

    this.resolve()
  }

  async refreshImages(oldsrc: string) {
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

  async getMarkdownSource() {
    if (this.file && this.file.getPath()) {
      return this.file.read()
    } else if (this.editor) {
      return this.editor.getText()
    } else {
      return undefined
    }
  }

  async getHTML(): Promise<string> {
    const source = await this.getMarkdownSource()
    if (source === undefined) throw new Error("Couldn't get Markdown source")
    return renderer.toHTML(
      source,
      this.getPath(),
      this.getGrammar(),
      this.renderLaTeX,
      false,
    )
  }

  async renderMarkdownText(text: string): Promise<void> {
    try {
      const domFragment = await renderer.toDOMFragment(
        text,
        this.getPath(),
        this.getGrammar(),
        this.renderLaTeX,
      )
      if (this.destroyed) return
      this.loading = false
      this.loaded = true
      // div.update-preview created after constructor st UpdatePreview cannot
      // be instanced in the constructor
      if (!this.updatePreview && this.preview) {
        this.updatePreview = new UpdatePreview(this.preview)
      }
      this.updatePreview &&
        domFragment &&
        this.updatePreview.update(
          this.element,
          domFragment as Element,
          this.renderLaTeX,
        )
      this.emitter.emit('did-change-markdown')
    } catch (error) {
      console.error(error)
      this.showError(error as Error)
    }
  }

  getTitle() {
    const p = this.getPath()
    if (p && this.file) {
      return `${path.basename(p)} Preview`
    } else if (this.editor) {
      return `${this.editor.getTitle()} Preview`
    } else {
      return 'Markdown Preview'
    }
  }

  getIconName() {
    return 'markdown'
  }

  getURI() {
    if (this.file) {
      return `markdown-preview-plus://${this.getPath()}`
    } else {
      return `markdown-preview-plus://editor/${this.editorId}`
    }
  }

  getPath() {
    if (this.file) {
      return this.file.getPath()
    } else if (this.editor) {
      return this.editor.getPath()
    }
    return undefined
  }

  getGrammar(): Grammar | undefined {
    return this.editor && this.editor.getGrammar()
  }

  showError(error: Error) {
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
    }
    const errorDiv = this.element.contentDocument.createElement('div')
    errorDiv.innerHTML = `<h2>Previewing Markdown Failed</h2><h3>${
      error.message
    }</h3>`
    this.preview.appendChild(errorDiv)
  }

  showLoading() {
    if (!this.preview) return
    this.loading = true
    const spinner = this.element.contentDocument.createElement('div')
    spinner.classList.add('markdown-spinner')
    spinner.innerText = 'Loading Markdown\u2026'
    this.preview.appendChild(spinner)
  }

  copyToClipboard() {
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
        atom.clipboard.write(html)
      }),
    )

    return true
  }

  getSaveDialogOptions() {
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

  saveAs(htmlFilePath: string | undefined) {
    if (htmlFilePath === undefined) return
    if (this.loading) return

    const title = path.parse(htmlFilePath).name

    handlePromise(
      this.getHTML().then(async (htmlBody) => {
        const html = util.mkHtml(
          title,
          htmlBody,
          this.renderLaTeX,
          atom.config.get('markdown-preview-plus.useGitHubStyle'),
        )

        fs.writeFileSync(htmlFilePath, html)
        return atom.workspace.open(htmlFilePath)
      }),
    )
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
  syncSource(text: string, element: HTMLElement) {
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

    if (finalToken !== null && this.editor) {
      // tslint:disable-next-line:no-floating-promises
      atom.workspace.open(this.editor, {
        initialLine: finalToken.map[0],
        searchAllPanes: true,
      })
      return finalToken.map[0]
    } else {
      return null
    }
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
  syncPreview(text: string, line: number) {
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
}
