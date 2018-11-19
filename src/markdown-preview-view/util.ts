import { TextEditor } from 'atom'
import * as path from 'path'
import * as fs from 'fs'
import Token = require('markdown-it/lib/token')
import { handlePromise, atomConfig } from '../util'
import { UserStylesManager } from './user-styles'

export function editorForId(editorId: number): TextEditor | undefined {
  for (const editor of atom.workspace.getTextEditors()) {
    if (editor.id === editorId) {
      return editor
    }
  }
  return undefined
}

// this weirdness allows overriding in tests
let getStylesOverride: typeof getPreviewStyles | undefined = undefined

export function __setGetStylesOverride(f?: typeof getPreviewStyles) {
  getStylesOverride = f
}

function* getStyles(context?: string | null): IterableIterator<string> {
  const elements = atom.styles.getStyleElements()

  for (const element of elements) {
    if (context === undefined || element.getAttribute('context') === context) {
      yield element.innerText
    }
  }
}

function getClientStyle(file: string): string {
  return atom.themes.loadStylesheet(
    path.join(__dirname, '..', '..', 'styles-client', `${file}.less`),
  )
}

export function getUserStyles() {
  const el =
    atom.styles.styleElementsBySourcePath[atom.styles.getUserStyleSheetPath()]
  if (!el) return []
  return [el.innerText]
}

function getSyntaxTheme(themeName: string): Iterable<string> {
  if (themeName !== '') {
    const themes = atom.themes.getLoadedThemes()
    if (themes) {
      const [theme] = themes.filter((x) => x.name === themeName)
      if (theme) {
        const stshts = theme
          .getStylesheetPaths()
          .map((p) => atom.themes.loadStylesheet(p))
        return processEditorStyles(stshts)
      }
    }
    atom.notifications.addWarning('Failed to load syntax theme', {
      detail: `Markdown-preview-plus couldn't find '${themeName}'`,
    })
  }
  // default
  return processEditorStyles(getStyles('atom-text-editor'))
}

function* getActivePackageStyles(
  packageName: string,
): IterableIterator<string> {
  const pack = atom.packages.getActivePackage(packageName)
  if (!pack) return
  const stylesheets = pack.getStylesheetPaths()
  for (const ss of stylesheets) {
    const element = atom.styles.styleElementsBySourcePath[ss]
    if (element) yield element.innerText
  }
}

export function getPreviewStyles(
  context: 'pdf' | 'copy' | 'html' | 'live',
): string[] {
  if (getStylesOverride) return getStylesOverride(context)
  const styles = []
  // tslint:disable-next-line:totality-check
  if (context === 'live') {
    // global editor styles
    const globalStyles =
      atom.styles.styleElementsBySourcePath['global-text-editor-styles']
    if (globalStyles) {
      styles.push(...processWorkspaceStyles([globalStyles.innerText]))
    }
    styles.push(getClientStyle('editor-global-font'))
    // package styles
    const packList = atomConfig().importPackageStyles
    if (packList.includes('*')) {
      styles.push(...processEditorStyles(getStyles()))
      styles.push(getClientStyle('patch'))
    } else {
      for (const pack of packList) {
        styles.push(...processEditorStyles(getActivePackageStyles(pack)))
      }
      // explicit compatibility with the fonts package
      if (packList.includes('fonts')) {
        const fontsVar =
          atom.styles.styleElementsBySourcePath['fonts-package-editorfont']
        if (fontsVar) styles.push(...processEditorStyles([fontsVar.innerText]))
      }
    }
  }

  styles.push(getClientStyle('generic'))
  // tslint:disable-next-line:totality-check
  if (context === 'live') styles.push(getClientStyle('display'))
  if (atomConfig().useGitHubStyle) {
    styles.push(getClientStyle('github'))
  } else {
    styles.push(getClientStyle('default'))
  }
  styles.push(...getSyntaxTheme(atomConfig().syntaxThemeName))
  styles.push(...processEditorStyles(getUserStyles()))
  styles.push(
    ...UserStylesManager.getStyleFiles(context).map((f) =>
      atom.themes.loadStylesheet(f),
    ),
  )
  return styles
}

function* processEditorStyles(styles: Iterable<string>) {
  for (const style of styles) {
    yield style.replace(/\batom-text-editor\b/g, 'pre.editor-colors')
  }
}

function* processWorkspaceStyles(styles: Iterable<string>) {
  for (const style of styles) {
    yield style.replace(/\batom-workspace\b/g, ':root')
  }
}

function getMarkdownPreviewCSSForHTMLExport() {
  const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/

  return getPreviewStyles('html')
    .join('\n')
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
    'HTML-CSS': {
      availableFonts: [],
      webFont: 'TeX',
      undefinedFamily: ${JSON.stringify(
        atomConfig().mathConfig.undefinedFamily,
      )},
      mtextFontInherit: true,
    },
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
  texConfig: MathJax.TeXInputProcessor,
) {
  let maybeMathJaxScript: string
  if (renderLaTeX) {
    maybeMathJaxScript = mathJaxScript(texConfig)
  } else {
    maybeMathJaxScript = ''
  }
  return `\
<!DOCTYPE html>
<html data-markdown-preview-plus-context="html-export">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>${maybeMathJaxScript}
    <style>${getMarkdownPreviewCSSForHTMLExport()}</style>
${html.head!.innerHTML}
  </head>
  <body>
    ${html.body.innerHTML}
  </body>
</html>
` // Ensure trailing newline
}

export function destroy(item: object) {
  const pane = atom.workspace.paneForItem(item)
  if (pane) handlePromise(pane.destroyItem(item))
}
