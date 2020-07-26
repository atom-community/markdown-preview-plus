import morph from 'morphdom'
import { MathJaxController } from './mathjax-helper'
import { diff } from './diff'
import { TDiffMethod } from './ipc'

function isEqualMath(a: Node, b: Node) {
  const tcs = getMathContents(a, b)
  return tcs && tcs[0].textContent === tcs[1].textContent
}

function getMathContents(a: Node, b: Node) {
  if (!isElement(a) || !isElement(b)) return false
  if (
    a.tagName !== 'SPAN' ||
    b.tagName !== 'SPAN' ||
    !a.classList.contains('math') ||
    !b.classList.contains('math')
  ) {
    return false
  }
  const ascr = a.querySelector<HTMLScriptElement>(':scope > script')
  if (!ascr) return false
  const bscr = b.querySelector<HTMLScriptElement>(':scope > script')
  if (!bscr) return false
  if (ascr.type !== bscr.type) return false
  return [ascr, bscr] as const
}

function isElement(a: Node): a is Element {
  return a.nodeType === Node.ELEMENT_NODE
}

function checkDocumentType(a: DocumentType, b: DocumentType) {
  return (
    a.name === b.name && a.publicId === b.publicId && a.systemId === b.systemId
  )
}

function checkElement(a: Element, b: Element) {
  if (a.attributes.length !== b.attributes.length) return false
  return Array.from(a.attributes).every((x) =>
    x.isEqualNode(b.attributes.getNamedItemNS(x.namespaceURI, x.localName)),
  )
}

function checkAttr(a: Attr, b: Attr) {
  return (
    a.namespaceURI === b.namespaceURI &&
    a.localName === b.localName &&
    a.value === b.value
  )
}

function checkProcInstr(a: ProcessingInstruction, b: ProcessingInstruction) {
  return a.target === b.target && a.data === b.data
}

function checkData(a: { data: string }, b: { data: string }) {
  return a.data === b.data
}

// based on https://dom.spec.whatwg.org/#concept-node-equals
function isEqual(a: Node, b: Node): boolean {
  // early bailouts
  if (a.isEqualNode(b)) return true
  if (isEqualMath(a, b)) return true

  // node checks
  if (a.nodeType !== b.nodeType) return false
  if (a.childNodes.length !== b.childNodes.length) return false

  // recursively check children
  let ac = a.firstChild
  let bc = b.firstChild
  while (ac && bc) {
    if (!isEqual(ac, bc)) return false
    ac = ac.nextSibling
    bc = bc.nextSibling
  }

  switch (a.nodeType) {
    case Node.DOCUMENT_TYPE_NODE:
      return checkDocumentType(a as DocumentType, b as DocumentType)
    case Node.ELEMENT_NODE:
      return checkElement(a as Element, b as Element)
    case Node.ATTRIBUTE_NODE:
      return checkAttr(a as Attr, b as Attr)
    case Node.PROCESSING_INSTRUCTION_NODE:
      return checkProcInstr(
        a as ProcessingInstruction,
        b as ProcessingInstruction,
      )
    case Node.TEXT_NODE:
    case Node.COMMENT_NODE:
      return checkData(a as Text | Comment, b as Text | Comment)
    default:
      return true
  }
}

function* allChildren(node: Element): IterableIterator<Element> {
  for (const c of node.children) {
    if (c.tagName === 'SPAN' && c.classList.contains('MathJax')) continue
    if (c.tagName === 'SPAN' && c.classList.contains('MathJax_SVG')) continue
    if (c.tagName === 'SCRIPT') continue
    if (c.tagName === 'DIV' && c.classList.contains('MathJax_Display')) continue
    if (c.tagName === 'DIV' && c.classList.contains('MathJax_SVG_Display')) {
      continue
    }
    yield c
    if (c.tagName === 'PRE' && c.classList.contains('editor-colors')) continue
    yield* allChildren(c)
  }
}

function runHeuristic(
  idMap: WeakMap<Node, string>,
  newDom: Element,
  oldDom: Element,
): void {
  let idx = 0
  // pre-match nodes in both trees
  function matchEls(newRoot: Node, oldRoot: Node) {
    let newEl = newRoot.firstChild
    let oldEl = oldRoot.firstChild
    const newCount = newRoot.childNodes.length
    const oldCount = oldRoot.childNodes.length
    if (newCount > oldCount) {
      // checking for insertions
      while (oldEl && newEl) {
        if (isEqual(newEl, oldEl)) {
          if (newEl.nodeType === Node.ELEMENT_NODE) {
            const sidx = idx.toString(36)
            idMap.set(oldEl, sidx)
            idMap.set(newEl, sidx)
            idx++
          }
          matchEls(newEl, oldEl)
          oldEl = oldEl.nextSibling
        }
        newEl = newEl.nextSibling
      }
    } else if (newCount < oldCount) {
      // checking for deletions
      while (oldEl && newEl) {
        if (isEqual(newEl, oldEl)) {
          if (newEl.nodeType === Node.ELEMENT_NODE) {
            const sidx = idx.toString(36)
            idMap.set(oldEl, sidx)
            idMap.set(newEl, sidx)
            idx++
          }
          matchEls(newEl, oldEl)
          newEl = newEl.nextSibling
        }
        oldEl = oldEl.nextSibling
      }
    }
  }
  matchEls(newDom, oldDom)
}

function time<T>(cb: () => T): T {
  const start = performance.now()
  const res = cb()
  console.log(cb.toString(), performance.now() - start, 'ms')
  return res
}
export async function update(
  oldDom: Element,
  newDom: Element,
  opts: {
    mjController: MathJaxController
    renderLaTeX: boolean
    diffMethod: TDiffMethod
  },
): Promise<void> {
  const idMap = new WeakMap<Node, string>()
  switch (opts.diffMethod) {
    case 'heuristic': {
      time(() => runHeuristic(idMap, newDom, oldDom))
      break
    }
    case 'myers': {
      const a = time(() => Array.from(allChildren(oldDom)))
      const b = time(() => Array.from(allChildren(newDom)))
      let ncomp = 0
      let idx = 0
      time(() =>
        diff(
          a,
          b,
          (a, b) => {
            ncomp++
            return isEqual(a, b)
          },
          (pairs) => {
            for (const [x, y] of pairs) {
              const sidx = idx.toString(36)
              idMap.set(x, sidx)
              idMap.set(y, sidx)
              idx++
            }
          },
        ),
      )
      console.log('a:', a.length, 'b:', b.length, 'comp:', ncomp)
      break
    }
    case 'none':
      break
  }

  try {
    morph(oldDom, newDom, {
      childrenOnly: true,
      onBeforeElUpdated(fromEl, toEl) {
        if (fromEl.isEqualNode(toEl)) return false
        const tcs = getMathContents(fromEl, toEl)
        if (tcs) {
          if (tcs[0].textContent !== tcs[1].textContent) {
            tcs[0].textContent = tcs[1].textContent
          }
          return false
        }
        return true
      },
      getNodeKey(node: Element) {
        return idMap.get(node) || ''
      },
    })
  } catch (e) {
    console.error(e)
    oldDom.innerHTML = newDom.innerHTML
  }

  if (opts.renderLaTeX) await opts.mjController.queueTypeset(oldDom)
}
