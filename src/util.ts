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

import { MarkdownPreviewViewString } from './markdown-preview-view'
export async function copyHtml(
  text: string,
  renderLaTeX: boolean,
): Promise<void> {
  const view = new MarkdownPreviewViewString(text, 'copy', renderLaTeX)
  view.element.style.visibility = 'hidden'
  view.element.style.position = 'absolute'
  view.element.style.pointerEvents = 'none'
  const ws = atom.views.getView(atom.workspace)
  ws.appendChild(view.element)
  await view.renderPromise
  const res = await view.getHTMLSVG()
  if (res) atom.clipboard.write(res)
  view.destroy()
}

export function atomConfig() {
  return atom.config.get('markdown-preview-plus')
}
