import { TextEditor, StyleManager } from 'atom'
import * as path from 'path'
import * as fs from 'fs'
import { Token } from 'markdown-it'
import { handlePromise } from '../util'

export function editorForId(editorId: number): TextEditor | undefined {
  for (const editor of atom.workspace.getTextEditors()) {
    if (editor.id === editorId) {
      return editor
    }
  }
  return undefined
}

// this weirdness allows overriding in tests
let getStylesOverride: typeof getStyles | undefined = undefined

export function __setGetStylesOverride(f?: typeof getStyles) {
  getStylesOverride = f
}

export function getStyles(context: string): string[] {
  if (getStylesOverride) return getStylesOverride(context)
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

function getMarkdownPreviewCSS() {
  const markdowPreviewRules = ['body { padding: 0; margin: 0; }']
  const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/

  return markdowPreviewRules
    .concat(getStyles('markdown-preview-plus'))
    .concat(getStyles('atom-text-editor'))
    .join('\n')
    .replace(/\batom-text-editor\b/g, 'pre.editor-colors')
    .replace(/\bmarkdown-preview-plus-view\b/g, '.markdown-preview-plus-view')
    .replace(
      /\b\.\.markdown-preview-plus-view\b/g,
      '.markdown-preview-plus-view',
    )
    .replace(cssUrlRefExp, function(
      _match,
      assetsName: string,
      _offset,
      _string,
    ) {
      // base64 encode assets
      const assetPath = path.join(__dirname, '../../assets', assetsName)
      const originalData = fs.readFileSync(assetPath, 'binary')
      const base64Data = new Buffer(originalData, 'binary').toString('base64')
      return `url('data:image/jpeg;base64,${base64Data}')`
    })
}

//
// Decode tags used by markdown-it
//
// @param {markdown-it.Token} token Decode the tag of token.
// @return {string|null} Decoded tag or `null` if the token has no tag.
//
function decodeTag(token: Token): string | null {
  if (token.tag === 'math') {
    return 'span'
  }
  if (token.tag === 'code') {
    return 'atom-text-editor'
  }
  if (token.tag === '') {
    return null
  }
  return token.tag
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
export function buildLineMap(tokens: ReadonlyArray<Readonly<Token>>) {
  const lineMap: { [line: number]: Array<{ tag: string; index: number }> } = {}
  const tokenTagCount: { [line: number]: { [tag: string]: number } } = {}
  tokenTagCount[0] = {}

  for (const token of tokens) {
    if (token.hidden) continue
    // tslint:disable-next-line:strict-type-predicates // TODO: complain on DT
    if (token.map == null) continue

    const tag = decodeTag(token)
    if (tag === null) continue

    if (token.nesting === 1) {
      // opening tag
      for (let line = token.map[0]; line < token.map[1]; line += 1) {
        // tslint:disable-next-line:strict-type-predicates
        if (lineMap[line] == null) lineMap[line] = []
        lineMap[line].push({
          tag: tag,
          index: tokenTagCount[token.level][tag] || 0,
        })
      }
      tokenTagCount[token.level + 1] = {}
    } else if (token.nesting === 0) {
      // self-closing tag
      for (let line = token.map[0]; line < token.map[1]; line += 1) {
        // tslint:disable-next-line:strict-type-predicates
        if (lineMap[line] == null) lineMap[line] = []
        lineMap[line].push({
          tag: tag,
          index: tokenTagCount[token.level][tag] || 0,
        })
      }
    }
    const ttc = tokenTagCount[token.level][tag]
    tokenTagCount[token.level][tag] = ttc ? ttc + 1 : 1
  }

  return lineMap
}

function mathJaxScript(texConfig: MathJax.TeXInputProcessor) {
  return `\
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    jax: ["input/TeX","output/HTML-CSS"],
    extensions: ["[a11y]/accessibility-menu.js"],
    TeX: ${JSON.stringify(texConfig, undefined, 2)},
    showMathMenu: true
  });
</script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js"></script>`
}

export function mkHtml(
  title: string,
  html: HTMLDocument,
  renderLaTeX: boolean,
  useGithubStyle: boolean,
  texConfig: MathJax.TeXInputProcessor,
) {
  const githubStyle = useGithubStyle ? ' data-use-github-style' : ''
  let maybeMathJaxScript: string
  if (renderLaTeX) {
    maybeMathJaxScript = mathJaxScript(texConfig)
  } else {
    maybeMathJaxScript = ''
  }
  return `\
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>${maybeMathJaxScript}
    <style>${getMarkdownPreviewCSS()}</style>
${html.head.innerHTML}
  </head>
  <body class="markdown-preview-plus-view"${githubStyle}>
    ${html.body.innerHTML}
  </body>
</html>
` // Ensure trailing newline
}

export function destroy(item: object) {
  const pane = atom.workspace.paneForItem(item)
  if (pane) handlePromise(pane.destroyItem(item))
}
