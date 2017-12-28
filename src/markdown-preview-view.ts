import { Token } from 'markdown-it'
import path = require('path')

// TODO: Fixme
// tslint:disable: no-unsafe-any no-floating-promises
import {
  CommandEvent,
  Emitter,
  Disposable,
  CompositeDisposable,
  File,
  StyleManager,
  TextEditor,
} from 'atom'
const { $, $$$, ScrollView }: {
  $: JQueryStatic
  $$$: JQueryStatic
  ScrollView: any
// tslint:disable-next-line:no-var-requires no-unsafe-any
} = require('atom-space-pen-views')
import _ = require('lodash')
import fs = require('fs-plus')

import renderer = require('./renderer')
import { UpdatePreview } from './update-preview'
import markdownIt = require('./markdown-it-helper')
import imageWatcher = require('./image-watch-helper')

export interface MPVParamsEditor {
  editorId: number
  filePath?: undefined
}

export interface MPVParamsPath {
  editorId?: undefined
  filePath: string
}

export type MPVParams = MPVParamsEditor | MPVParamsPath

export class MarkdownPreviewView extends ScrollView {
  // tslint:disable-next-line:no-uninitialized
  private element: HTMLElement
  private emitter: Emitter<{
    'did-change-title': undefined
    'did-change-markdown': undefined
  }> = new Emitter()
  private updatePreview?: UpdatePreview
  private renderLaTeX: boolean = !!atom.config.get(
    'markdown-preview-plus.enableLatexRenderingByDefault',
  )
  private disposables = new CompositeDisposable()
  private loaded = true // Do not show the loading spinnor on initial load
  private editorId?: number
  private filePath?: string
  private file?: File
  // tslint:disable-next-line:no-uninitialized
  private editor?: TextEditor
  static content() {
    return this.div(
      { class: 'markdown-preview native-key-bindings', tabindex: -1 },
      // If you dont explicitly declare a class then the elements wont be created
      () => this.div({ class: 'update-preview' }),
    )
  }

  constructor({ editorId, filePath }: MPVParams) {
    // @ts-ignore
    super()
    this.getPathToElement = this.getPathToElement.bind(this)
    this.syncSource = this.syncSource.bind(this)
    this.getPathToToken = this.getPathToToken.bind(this)
    this.syncPreview = this.syncPreview.bind(this)
    this.editorId = editorId
    this.filePath = filePath
  }

  attached() {
    if (this.isAttached) {
      return
    }
    this.isAttached = true

    if (this.editorId !== undefined) {
      this.resolveEditor(this.editorId)
    } else if (this.filePath !== undefined) {
      this.subscribeToFilePath(this.filePath)
    }
  }

  serialize() {
    return {
      deserializer: 'MarkdownPreviewView',
      filePath: this.getPath() || this.filePath,
      editorId: this.editorId,
    }
  }

  destroy() {
    const path = this.getPath()
    path && imageWatcher.removeFile(path)
    this.disposables.dispose()
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
    this.renderMarkdown()
  }

  resolveEditor(editorId: number) {
    const resolve = () => {
      this.editor = this.editorForId(editorId)

      if (this.editor) {
        this.emitter.emit('did-change-title')
        this.handleEvents()
        this.renderMarkdown()
      } else {
        // The editor this preview was created for has been closed so close
        // this preview since a preview cannot be rendered without an editor
        const pane = atom.workspace.paneForItem(this)
        pane && pane.destroyItem(this)
      }
    }

    resolve()
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
        _.debounce(() => { this.renderMarkdown() }, 250),
      ),
    )
    this.disposables.add(
      atom.grammars.onDidUpdateGrammar(
        _.debounce(() => { this.renderMarkdown() }, 250),
      ),
    )

    atom.commands.add(this.element, {
      'core:move-up': () => this.scrollUp(),
      'core:move-down': () => this.scrollDown(),
      'core:save-as': (event) => {
        event.stopPropagation()
        // tslint:disable-next-line:no-floating-promises
        this.saveAs()
      },
      'core:copy': (event: CommandEvent) => {
        if (this.copyToClipboard()) event.stopPropagation()
      },
      'markdown-preview-plus:zoom-in': () => {
        const zoomLevel = parseFloat(this.css('zoom')) || 1
        this.css('zoom', zoomLevel + 0.1)
      },
      'markdown-preview-plus:zoom-out': () => {
        const zoomLevel = parseFloat(this.css('zoom')) || 1
        this.css('zoom', zoomLevel - 0.1)
      },
      'markdown-preview-plus:reset-zoom': () => this.css('zoom', 1),
      'markdown-preview-plus:sync-source': (event) => {
        // tslint:disable-next-line:no-floating-promises
        this.getMarkdownSource().then((source?: string) => {
          if (source === undefined) {
            return
          }
          this.syncSource(source, event.target as HTMLElement)
        })
      },
    })

    const changeHandler = () => {
      this.renderMarkdown()

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
      )
      this.disposables.add(
        this.editor.onDidChangePath(() => {
          this.emitter.emit('did-change-title')
        }),
      )
      this.disposables.add(
        this.editor.getBuffer().onDidSave(function() {
          if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
            changeHandler()
          }
        }),
      )
      this.disposables.add(
        this.editor.getBuffer().onDidReload(function() {
          if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
            changeHandler()
          }
        }),
      )
      this.disposables.add(
        atom.commands.add(atom.views.getView(this.editor), {
          'markdown-preview-plus:sync-preview': async (_event) => {
            const source = await this.getMarkdownSource()
            if (source === undefined) {
              return
            }
            if (!this.editor) return
            this.syncPreview(
              source,
              this.editor.getCursorBufferPosition().row,
            )
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
            this.element.setAttribute('data-use-github-style', '')
          } else {
            this.element.removeAttribute('data-use-github-style')
          }
        },
      ),
    )
  }

  async renderMarkdown(): Promise<void> {
    if (!this.loaded) {
      this.showLoading()
    }
    return this.getMarkdownSource().then((source?: string) => {
      if (source) {
        this.renderMarkdownText(source)
      }
    })
  }

  refreshImages(oldsrc: string) {
    const imgs = this.element.querySelectorAll('img[src]') as NodeListOf<
      HTMLImageElement
    >
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
        const v = imageWatcher.getVersion(src, this.getPath())
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
        return
      }

      renderer.toHTML(
        source,
        this.getPath(),
        this.getGrammar(),
        this.renderLaTeX,
        false,
        callback,
      )
    })
  }

  renderMarkdownText(text: string) {
    renderer.toDOMFragment(
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
          if (!this.updatePreview && this.find('div.update-preview')[0]) {
            this.updatePreview = new UpdatePreview(
              this.find('div.update-preview')[0],
            )
          }
          this.updatePreview &&
            domFragment &&
            this.updatePreview.update(domFragment as Element, this.renderLaTeX)
          this.emitter.emit('did-change-markdown')
          return this.originalTrigger('markdown-preview-plus:markdown-changed')
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

  getGrammar() {
    return this.editor && this.editor.getGrammar()
  }

  getDocumentStyleSheets() {
    // This function exists so we can stub it
    return document.styleSheets
  }

  getTextEditorStyles() {
    const textEditorStyles = document.createElement(
      'atom-styles',
    ) as HTMLElement & { initialize(styles: StyleManager): void }
    textEditorStyles.initialize(atom.styles)
    textEditorStyles.setAttribute('context', 'atom-text-editor')
    document.body.appendChild(textEditorStyles)

    // Extract style elements content
    return Array.from(textEditorStyles.childNodes).map(
      (styleElement) => (styleElement as HTMLElement).innerText,
    )
  }

  getMarkdownPreviewCSS() {
    const markdowPreviewRules = []
    const ruleRegExp = /\.markdown-preview/
    const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/

    for (const stylesheet of Array.from(this.getDocumentStyleSheets())) {
      if (stylesheet.rules != null) {
        for (const rule of Array.from(stylesheet.rules)) {
          // We only need `.markdown-review` css
          if (
            (rule.selectorText != null
              ? rule.selectorText.match(ruleRegExp)
              : undefined) != null
          ) {
            markdowPreviewRules.push(rule.cssText)
          }
        }
      }
    }

    return markdowPreviewRules
      .concat(this.getTextEditorStyles())
      .join('\n')
      .replace(/atom-text-editor/g, 'pre.editor-colors')
      .replace(/:host/g, '.host') // Remove shadow-dom :host selector causing problem on FF
      .replace(cssUrlRefExp, function(_match, assetsName: string, _offset, _string) {
        // base64 encode assets
        const assetPath = path.join(__dirname, '../assets', assetsName)
        const originalData = fs.readFileSync(assetPath, 'binary')
        const base64Data = new Buffer(originalData, 'binary').toString('base64')
        return `url('data:image/jpeg;base64,${base64Data}')`
      })
  }

  showError(result: Error) {
    this.html(
      $$$(function() {
        // @ts-ignore
        this.h2('Previewing Markdown Failed')
        // @ts-ignore
        this.h3(result.message)
      }),
    )
  }

  showLoading() {
    this.loading = true
    this.html(
      $$$(function() {
        // @ts-ignore
        this.div({ class: 'markdown-spinner' }, 'Loading Markdown\u2026')
      }),
    )
  }

  copyToClipboard() {
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
      selectedNode != null &&
      (this[0] === selectedNode || $.contains(this[0], selectedNode))
    ) {
      return false
    }

    // tslint:disable-next-line:no-floating-promises
    this.getHTML(function(error, html) {
      if (error !== null) {
        console.warn('Copying Markdown as HTML failed', error)
      } else {
        atom.clipboard.write(html)
      }
    })

    return true
  }

  async saveAs() {
    if (this.loading) {
      return
    }

    let filePath = this.getPath()
    let title = 'Markdown to HTML'
    if (filePath) {
      title = path.parse(filePath).name
      filePath += '.html'
    } else {
      const projectPath = atom.project.getPaths()[0]
      filePath = 'untitled.md.html'
      if (projectPath) {
        filePath = path.join(projectPath, filePath)
      }
    }

    const htmlFilePath = atom.showSaveDialogSync(filePath)
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
          const html =
            `\
<!DOCTYPE html>
<html>
  <head>
      <meta charset="utf-8" />
      <title>${title}</title>${mathjaxScript}
      <style>${this.getMarkdownPreviewCSS()}</style>
  </head>
  <body class='markdown-preview'>${htmlBody}</body>
</html>` + '\n' // Ensure trailing newline

          fs.writeFileSync(htmlFilePath, html)
          // tslint:disable-next-line:no-floating-promises
          atom.workspace.open(htmlFilePath)
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
    while (testElement !== document.body) {
      const parent = testElement.parentElement!
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
  // Determine path to a target element from a container `.markdown-preview`.
  //
  // @param {HTMLElement} element Target HTMLElement.
  // @return {(tag: <tag>, index: <index>)[]} Array of tokens representing a path
  //   to `element` from `.markdown-preview`. The root `.markdown-preview`
  //   element is the first elements in the array and the target element
  //   `element` at the highest index. Each element consists of a `tag` and
  //   `index` representing its index amongst its sibling elements of the same
  //   `tag`.
  //
  getPathToElement(
    element: HTMLElement,
  ): Array<{ tag: string; index: number }> {
    if (element.classList.contains('markdown-preview')) {
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
  //   `.markdown-preview` container. The method will attempt to identify the
  //   line of `text` that represents `element` and set the cursor to that line.
  // @return {number|null} The line of `text` that represents `element`. If no
  //   line is identified `null` is returned.
  //
  syncSource(text: string, element: HTMLElement) {
    const pathToElement = this.getPathToElement(element)
    pathToElement.shift() // remove div.markdown-preview
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
            // tslint:disable-next-line:strict-type-predicates
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
      this.editor.setCursorBufferPosition([finalToken.map[0], 0])
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
    let tokenTagCount: number[] = []
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
        // tslint:disable-next-line:strict-type-predicates
        token.map != null && // token.map *can* be null // TODO: complain on DT
        line >= token.map[0] &&
        line <= token.map[1] - 1
      ) {
        if (token.nesting === 1) {
          pathToToken.push({
            tag: token.tag,
            index:
              tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0,
          })
          tokenTagCount = []
          level++
        } else if (token.nesting === 0) {
          pathToToken.push({
            tag: token.tag,
            index:
              tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0,
          })
          break
        }
      } else if (token.level === level) {
        if (tokenTagCount[token.tag] != null) {
          tokenTagCount[token.tag]++
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
  //   identify the elment of the associated `.markdown-preview` that represents
  //   `line` and scroll the `.markdown-preview` to that element.
  // @return {number|null} The element that represents `line`. If no element is
  //   identified `null` is returned.
  //
  syncPreview(text: string, line: number) {
    const tokens = markdownIt.getTokens(text, this.renderLaTeX)
    const pathToToken = this.getPathToToken(tokens, line)

    let element: JQuery = this.find('.update-preview').eq(0)
    for (const token of pathToToken) {
      const candidateElement = element.children(token.tag).eq(token.index)
      if (candidateElement.length !== 0) {
        element = candidateElement
      } else {
        break
      }
    }

    if (element[0].classList.contains('update-preview')) {
      return null
    } // Do not jump to the top of the preview for bad syncs

    if (!element[0].classList.contains('update-preview')) {
      element[0].scrollIntoView()
    }
    const maxScrollTop = this.element.scrollHeight - this.innerHeight()
    if (!(this.scrollTop() >= maxScrollTop)) {
      this.element.scrollTop -= this.innerHeight() / 4
    }

    element.addClass('flash')
    setTimeout(() => element.removeClass('flash'), 1000)

    return element[0]
  }
}
