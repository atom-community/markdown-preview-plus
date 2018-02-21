import { Token } from 'markdown-it'
import path = require('path')
import {
  CommandEvent,
  Emitter,
  Disposable,
  CompositeDisposable,
  File,
  StyleManager,
  TextEditor,
  Grammar,
} from 'atom'
import _ = require('lodash')
import fs = require('fs')

import renderer = require('./renderer')
import { UpdatePreview } from './update-preview'
import markdownIt = require('./markdown-it-helper')
import imageWatcher = require('./image-watch-helper')
import { handlePromise } from './util'

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
  public rootElement?: HTMLElement
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
    this.getPathToElement = this.getPathToElement.bind(this)
    this.getPathToToken = this.getPathToToken.bind(this)
    this.syncPreview = this.syncPreview.bind(this)
    this.editorId = editorId
    this.filePath = filePath
    this.element = document.createElement('iframe') as any
    this.element.getModel = () => this
    this.element.classList.add('markdown-preview-plus', 'native-key-bindings')
    this.element.src = 'about:blank'
    this.element.style.width = '100%'
    this.element.style.height = '100%'
    const onload = () => {
      const document = this.element.contentDocument
      if (this.updatePreview) this.updatePreview = undefined
      if (this.destroyed) return
      this.disposables.add(
        atom.styles.observeStyleElements((se) => {
          document.head.appendChild(se.cloneNode(true))
        }),
      )
      this.rootElement = document.createElement('markdown-preview-plus-view')
      this.rootElement.classList.add('native-key-bindings')
      this.rootElement.tabIndex = -1
      this.preview = document.createElement('div')
      this.preview.classList.add('update-preview')
      this.rootElement.appendChild(this.preview)
      document.body.appendChild(this.rootElement)
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
        if (this.editorId !== undefined) {
          this.resolveEditor(this.editorId)
        } else if (this.filePath !== undefined) {
          this.subscribeToFilePath(this.filePath)
        }
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
    console.debug('destroyed')
    if (this.destroyed) return
    this.destroyed = true
    const path = this.getPath()
    path && imageWatcher.removeFile(path)
    this.disposables.dispose()
    this.element.remove()
  }

  onDidChangeTitle(callback: () => void) {
    return this.emitter.on('did-change-title', callback)
  }

  onDidChangeModified(_callback: any) {
    // No op to suppress deprecation warning
    return new Disposable()
  }

  onDidChangeMarkdown(callback: () => void) {
    return this.emitter.on('did-change-markdown', callback)
  }

  subscribeToFilePath(filePath: string) {
    this.file = new File(filePath)
    this.emitter.emit('did-change-title')
    this.handleEvents()
    handlePromise(this.renderMarkdown())
  }

  resolveEditor(editorId: number) {
    this.editor = this.editorForId(editorId)

    if (this.editor) {
      this.emitter.emit('did-change-title')
      this.handleEvents()
      handlePromise(this.renderMarkdown())
    } else {
      // The editor this preview was created for has been closed so close
      // this preview since a preview cannot be rendered without an editor
      const pane = atom.workspace.paneForItem(this)
      pane && pane.destroyItem(this)
    }
  }

  editorForId(editorId: number) {
    for (const editor of atom.workspace.getTextEditors()) {
      if (editor.id === editorId) {
        return editor
      }
    }
    return undefined
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
      atom.config.observe(
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
    await this.getMarkdownSource().then(async (source?: string) => {
      if (source) {
        return this.renderMarkdownText(source)
      }
      return
    })
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

  async getHTML(callback: (error: Error | null, htmlBody: string) => void) {
    return this.getMarkdownSource().then((source?: string) => {
      if (source === undefined) {
        return undefined
      }

      return renderer.toHTML(
        source,
        this.getPath(),
        this.getGrammar(),
        this.renderLaTeX,
        false,
        callback,
      )
    })
  }

  async renderMarkdownText(text: string): Promise<void> {
    return renderer.toDOMFragment(
      text,
      this.getPath(),
      this.getGrammar(),
      this.renderLaTeX,
      (error, domFragment) => {
        if (error) {
          this.showError(error)
        } else {
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
        }
      },
    )
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

  getStyles(context: string) {
    const textEditorStyles = document.createElement(
      'atom-styles',
    ) as HTMLElement & { initialize(styles: StyleManager): void }
    textEditorStyles.initialize(atom.styles)
    textEditorStyles.setAttribute('context', context)

    // Extract style elements content
    return Array.from(textEditorStyles.childNodes).map(
      (styleElement) => (styleElement as HTMLStyleElement).innerText,
    )
  }

  getMarkdownPreviewCSS() {
    const markdowPreviewRules = ['body { padding: 0; margin: 0; }']
    const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/

    return markdowPreviewRules
      .concat(this.getStyles('markdown-preview-plus'))
      .concat(this.getStyles('atom-text-editor'))
      .join('\n')
      .replace(/atom-text-editor/g, 'pre.editor-colors')
      .replace(cssUrlRefExp, function(
        _match,
        assetsName: string,
        _offset,
        _string,
      ) {
        // base64 encode assets
        const assetPath = path.join(__dirname, '../assets', assetsName)
        const originalData = fs.readFileSync(assetPath, 'binary')
        const base64Data = new Buffer(originalData, 'binary').toString('base64')
        return `url('data:image/jpeg;base64,${base64Data}')`
      })
  }

  showError(result: Error) {
    if (!this.preview) return
    const error = this.element.contentDocument.createElement('div')
    error.innerHTML = `<h2>Previewing Markdown Failed</h2><h3>${
      result.message
    }</h3>`
    this.preview.appendChild(error)
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
      this.getHTML(function(error, html) {
        if (error !== null) {
          console.warn('Copying Markdown as HTML failed', error)
        } else {
          atom.clipboard.write(html)
        }
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

  async saveAs(htmlFilePath: string) {
    if (this.loading) {
      return
    }
    const pane = atom.workspace.paneForItem(this)
    if (!pane) return

    const title = path.parse(htmlFilePath).name

    if (htmlFilePath) {
      return this.getHTML((error: Error | null, htmlBody: string) => {
        if (error !== null) {
          console.warn('Saving Markdown as HTML failed', error)
        } else {
          let mathjaxScript
          if (this.renderLaTeX) {
            mathjaxScript = `\

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    jax: ["input/TeX","output/HTML-CSS"],
    extensions: [],
    TeX: {
      extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
    },
    showMathMenu: false
  });
</script>
<script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js">
</script>\
`
          } else {
            mathjaxScript = ''
          }
          const githubStyle = atom.config.get(
            'markdown-preview-plus.useGitHubStyle',
          )
            ? ' data-use-github-style'
            : ''
          const html =
            `\
<!DOCTYPE html>
<html>
  <head>
      <meta charset="utf-8" />
      <title>${title}</title>${mathjaxScript}
      <style>${this.getMarkdownPreviewCSS()}</style>
  </head>
  <body>
    <markdown-preview-plus-view${githubStyle}>
      ${htmlBody}
    </markdown-preview-plus-view>
  </body>
</html>` + '\n' // Ensure trailing newline

          fs.writeFileSync(htmlFilePath, html)
          handlePromise(atom.workspace.open(htmlFilePath))
        }
      })
    }
  }

  isEqual(other: null | [Node]) {
    return this[0] === (other !== null ? other[0] : undefined) // Compare DOM elements
  }

  //
  // Find the closest ancestor of an element that is not a decendant of either
  // `span.math` or `span.atom-text-editor`.
  //
  // @param {HTMLElement} element The element from which the search for a
  //   closest ancestor begins.
  // @return {HTMLElement} The closest ancestor to `element` that does not
  //   contain either `span.math` or `span.atom-text-editor`.
  //
  bubbleToContainerElement(element: HTMLElement): HTMLElement {
    let testElement = element
    while (testElement !== this.element.contentDocument.body) {
      const parent = testElement.parentElement
      if (!parent) break
      if (parent.classList.contains('MathJax_Display')) {
        return parent.parentElement!
      }
      if (parent.classList.contains('atom-text-editor')) {
        return parent
      }
      testElement = parent
    }
    return element
  }

  //
  // Determine a subsequence of a sequence of tokens representing a path through
  // HTMLElements that does not continue deeper than a table element.
  //
  // @param {(tag: <tag>, index: <index>)[]} pathToToken Array of tokens
  //   representing a path to a HTMLElement with the root element at
  //   pathToToken[0] and the target element at the highest index. Each element
  //   consists of a `tag` and `index` representing its index amongst its
  //   sibling elements of the same `tag`.
  // @return {(tag: <tag>, index: <index>)[]} The subsequence of pathToToken that
  //   maintains the same root but terminates at a table element or the target
  //   element, whichever comes first.
  //
  bubbleToContainerToken(pathToToken: Array<{ tag: string; index: number }>) {
    const end = pathToToken.length - 1
    for (let i = 0; i <= end; i++) {
      if (pathToToken[i].tag === 'table') {
        return pathToToken.slice(0, i + 1)
      }
    }
    return pathToToken
  }

  //
  // Encode tags for markdown-it.
  //
  // @param {HTMLElement} element Encode the tag of element.
  // @return {string} Encoded tag.
  //
  encodeTag(element: HTMLElement): string {
    if (element.classList.contains('math')) {
      return 'math'
    }
    if (element.classList.contains('atom-text-editor')) {
      return 'code'
    } // only token.type is `fence` code blocks should ever be found in the first level of the tokens array
    return element.tagName.toLowerCase()
  }

  //
  // Decode tags used by markdown-it
  //
  // @param {markdown-it.Token} token Decode the tag of token.
  // @return {string|null} Decoded tag or `null` if the token has no tag.
  //
  decodeTag(token: Token): string | null {
    if (token.tag === 'math') {
      return 'span'
    }
    if (token.tag === 'code') {
      return 'span'
    }
    if (token.tag === '') {
      return null
    }
    return token.tag
  }

  //
  // Determine path to a target element from a container `markdown-preview-plus-view`.
  //
  // @param {HTMLElement} element Target HTMLElement.
  // @return {(tag: <tag>, index: <index>)[]} Array of tokens representing a path
  //   to `element` from `markdown-preview-plus-view`. The root `markdown-preview-plus-view`
  //   element is the first elements in the array and the target element
  //   `element` at the highest index. Each element consists of a `tag` and
  //   `index` representing its index amongst its sibling elements of the same
  //   `tag`.
  //
  getPathToElement(
    element: HTMLElement,
  ): Array<{ tag: string; index: number }> {
    if (element.tagName.toLowerCase() === 'markdown-preview-plus-view') {
      return [
        {
          tag: 'div',
          index: 0,
        },
      ]
    }

    element = this.bubbleToContainerElement(element)
    const tag = this.encodeTag(element)
    const siblings = element.parentElement!.children
    let siblingsCount = 0

    for (const sibling of Array.from(siblings)) {
      const siblingTag =
        sibling.nodeType === 1 ? this.encodeTag(sibling as HTMLElement) : null
      if (sibling === element) {
        const pathToElement = this.getPathToElement(element.parentElement!)
        pathToElement.push({
          tag,
          index: siblingsCount,
        })
        return pathToElement
      } else if (siblingTag === tag) {
        siblingsCount++
      }
    }
    throw new Error('failure in getPathToElement')
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
    const pathToElement = this.getPathToElement(element)
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
  // Determine path to a target token.
  //
  // @param {(markdown-it.Token)[]} tokens Array of tokens as returned by
  //   `markdown-it.parse()`.
  // @param {number} line Line representing the target token.
  // @return {(tag: <tag>, index: <index>)[]} Array representing a path to the
  //   target token. The root token is represented by the first element in the
  //   array and the target token by the last elment. Each element consists of a
  //   `tag` and `index` representing its index amongst its sibling tokens in
  //   `tokens` of the same `tag`. `line` will lie between the properties
  //   `map[0]` and `map[1]` of the target token.
  //
  getPathToToken(tokens: Token[], line: number) {
    let pathToToken: Array<{ tag: string; index: number }> = []
    let tokenTagCount: { [key: string]: number | undefined } = {}
    let level = 0

    for (const token of tokens) {
      if (token.level < level) {
        break
      }
      if (token.hidden) {
        continue
      }
      if (token.nesting === -1) {
        continue
      }

      const tag = this.decodeTag(token)
      if (tag === null) {
        continue
      }
      token.tag = tag

      if (
        // tslint:disable-next-line:strict-type-predicates // TODO: complain on DT
        token.map != null && // token.map *can* be null
        line >= token.map[0] &&
        line <= token.map[1] - 1
      ) {
        if (token.nesting === 1) {
          pathToToken.push({
            tag: token.tag,
            index: tokenTagCount[token.tag] || 0,
          })
          tokenTagCount = {}
          level++
        } else if (token.nesting === 0) {
          pathToToken.push({
            tag: token.tag,
            index: tokenTagCount[token.tag] || 0,
          })
          break
        }
      } else if (token.level === level) {
        if (tokenTagCount[token.tag] !== undefined) {
          tokenTagCount[token.tag]!++
        } else {
          tokenTagCount[token.tag] = 1
        }
      }
    }

    pathToToken = this.bubbleToContainerToken(pathToToken)
    return pathToToken
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
    const pathToToken = this.getPathToToken(tokens, line)

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
}
