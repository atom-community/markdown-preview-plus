export function handlePromise(promise: Promise<any>): void {
  if (!promise) return
  promise.catch((error: Error) => {
    console.error(error)
    atom.notifications.addFatalError(error.toString(), {
      detail: error.message,
      stack: error.stack,
      dismissable: true,
    })
  })
}
import { lstatSync, existsSync } from 'fs'
export function isFileSync(filePath: string) {
  if (!existsSync(filePath)) return false
  return lstatSync(filePath).isFile()
}

export function pairUp<T>(arr: T[], option?: string): Array<[T, T]> {
  if (arr.length % 2 !== 0) {
    atom.notifications.addWarning(
      `Invalid math delimiter configuration${option ? `in ${option}` : ''}`,
      {
        detail: `Expected even number of elements, but got "${arr.join(', ')}"`,
        dismissable: true,
      },
    )
  }
  return arr.reduce<Array<[T, T]>>(function(result, _value, index, array) {
    if (index % 2 === 0) result.push([array[index], array[index + 1]])
    return result
  }, [])
}

export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

import { WebviewHandler } from './markdown-preview-view/webview-handler'
import * as renderer from './renderer'
import { loadUserMacros } from './macros-util'
export async function copyHtml(
  text: string,
  filePath: string | undefined,
  renderLaTeX: boolean,
): Promise<void> {
  const view = new WebviewHandler('copy', async () => {
    view.init({
      userMacros: loadUserMacros(),
      mathJaxConfig: { ...atomConfig().mathConfig, latexRenderer: 'SVG' },
      context: 'copy-html',
    })
    view.setBasePath(filePath)

    const domDocument = await renderer.render({
      text,
      filePath,
      renderLaTeX,
      mode: 'copy',
    })
    const res = await view.update(
      domDocument.documentElement!.outerHTML,
      renderLaTeX,
    )
    if (res) {
      const html = res.replace(/"file:\/\/[^"#]*/g, '"')
      if (atom.config.get('markdown-preview-plus.richClipboard')) {
        const clipboard = await import('./clipboard')
        clipboard.write({ text: html, html })
      } else {
        atom.clipboard.write(html)
      }
    }
    view.destroy()
  })
  view.element.style.pointerEvents = 'none'
  view.element.style.position = 'absolute'
  view.element.style.width = '0px'
  view.element.style.height = '0px'
  const ws = atom.views.getView(atom.workspace)
  ws.appendChild(view.element)
}

export function atomConfig() {
  return atom.config.get('markdown-preview-plus')
}
