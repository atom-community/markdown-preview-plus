import morph = require('morphdom')
import { MathJaxController } from './mathjax-helper'

export class UpdatePreview {
  constructor(
    private dom: HTMLElement,
    private mjController: MathJaxController,
  ) {
    /* no-op */
  }

  public async update(newDom: Element, renderLaTeX: boolean): Promise<void> {
    for (const m of Array.from(newDom.querySelectorAll('span.math'))) {
      const mscr = m.firstElementChild as HTMLScriptElement | null
      if (!mscr || mscr.nodeName !== 'SCRIPT') continue
      m.isSameNode = function(target: Node) {
        if (target.nodeName !== 'SPAN') return false
        const el = target as HTMLSpanElement
        if (!el.classList.contains('math')) return false
        const scr = el.querySelector('script')
        if (!scr) return false
        return mscr.innerHTML === scr.innerHTML && mscr.type === scr.type
      }
    }

    morph(this.dom, newDom, {
      childrenOnly: true,
      onBeforeElUpdated: function(fromEl, toEl) {
        // do not recurse into element children if isEqualNode === true
        // spec - https://dom.spec.whatwg.org/#concept-node-equals
        return !fromEl.isEqualNode(toEl)
      },
      getNodeKey: function(node: Element) {
        if (node.closest && node.closest('svg') !== null) {
          return '' // ignore SVG id
        }
        return node.id
      },
    })

    // A very specific fix for #386 and #406
    for (const li of this.dom.querySelectorAll('li')) {
      if (
        li.firstElementChild &&
        li.firstElementChild === li.lastElementChild &&
        li.firstElementChild.tagName === 'P' &&
        li.firstChild &&
        li.firstChild.nodeType === Node.TEXT_NODE &&
        li.firstChild.textContent === '\n'
      ) {
        li.removeChild(li.firstChild)
      }
    }

    if (renderLaTeX) {
      return this.mjController.queueTypeset(this.dom)
    }
  }
}
