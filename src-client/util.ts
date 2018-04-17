export function handlePromise(promise: Promise<any>): void {
  if (!promise) return
  promise.catch((error: Error) => {
    console.error(error)
  })
}
import { lstatSync, existsSync } from 'fs'
export function isFileSync(filePath: string) {
  if (!existsSync(filePath)) return false
  return lstatSync(filePath).isFile()
}

export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
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
