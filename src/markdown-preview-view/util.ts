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

export function getMarkdownPreviewCSS() {
  const markdowPreviewRules = ['body { padding: 0; margin: 0; }']
  const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/

  return markdowPreviewRules
    .concat(getStyles('markdown-preview-plus'))
    .concat(getStyles('atom-text-editor'))
    .join('\n')
    .replace(/atom-text-editor/g, 'pre.editor-colors')
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
// Find the closest ancestor of an element that is not a decendant of either
// `span.math` or `span.atom-text-editor`.
//
// @param {HTMLElement} element The element from which the search for a
//   closest ancestor begins.
// @return {HTMLElement} The closest ancestor to `element` that does not
//   contain either `span.math` or `span.atom-text-editor`.
//
export function bubbleToContainerElement(element: HTMLElement): HTMLElement {
  let testElement = element
  for (;;) {
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
export function bubbleToContainerToken(
  pathToToken: Array<{ tag: string; index: number }>,
) {
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
export function encodeTag(element: HTMLElement): string {
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
export function decodeTag(token: Token): string | null {
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
export function getPathToElement(
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

  element = bubbleToContainerElement(element)
  const tag = encodeTag(element)
  const siblings = element.parentElement!.children
  let siblingsCount = 0

  for (const sibling of Array.from(siblings)) {
    const siblingTag =
      sibling.nodeType === 1 ? encodeTag(sibling as HTMLElement) : null
    if (sibling === element) {
      const pathToElement = getPathToElement(element.parentElement!)
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
export function getPathToToken(tokens: Token[], line: number) {
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

    const tag = decodeTag(token)
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

  pathToToken = bubbleToContainerToken(pathToToken)
  return pathToToken
}

export const mathJaxScript = `\
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

export function mkHtml(
  title: string,
  body: string,
  renderLaTeX: boolean,
  useGithubStyle: boolean,
) {
  const githubStyle = useGithubStyle ? ' data-use-github-style' : ''
  let maybeMathJaxScript
  if (renderLaTeX) {
    maybeMathJaxScript = mathJaxScript
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
  </head>
  <body>
    <markdown-preview-plus-view${githubStyle}>
      ${body}
    </markdown-preview-plus-view>
  </body>
</html>
` // Ensure trailing newline
}

export function destroy(item: object) {
  const pane = atom.workspace.paneForItem(item)
  if (pane) handlePromise(pane.destroyItem(item))
}
