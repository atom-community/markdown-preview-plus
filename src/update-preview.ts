// This file incorporates code from [markmon](https://github.com/yyjhao/markmon)
// covered by the following terms:
//
// Copyright (c) 2014, Yao Yujian, http://yjyao.com
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import { WrappedDomTree } from './wrapped-dom-tree'
import MathJaxHelper = require('./mathjax-helper')
import renderer = require('./renderer')

export class UpdatePreview {
  private domFragment?: Element
  private tree: WrappedDomTree
  // @param dom A DOM element object
  //    https://developer.mozilla.org/en-US/docs/Web/API/element
  constructor(dom: Element) {
    this.tree = new WrappedDomTree(dom, true)
  }

  public update(domFragment: Element, renderLaTeX: boolean) {
    prepareCodeBlocksForAtomEditors(domFragment)

    if (this.domFragment && domFragment.isEqualNode(this.domFragment)) {
      return undefined
    }

    const firstTime = this.domFragment === undefined
    this.domFragment = domFragment.cloneNode(true) as Element

    const newDom = document.createElement('div')
    newDom.className = 'update-preview'
    newDom.appendChild(domFragment)
    const newTree = new WrappedDomTree(newDom, false)

    const r = this.tree.diffTo(newTree)
    newTree.removeSelf()

    if (firstTime) {
      r.possibleReplace = undefined
      r.last = undefined
    }

    if (renderLaTeX) {
      r.inserted = r.inserted.map(function(elm: Node) {
        while (elm.parentElement && !(elm as HTMLElement).innerHTML) {
          elm = elm.parentElement
        }
        return elm
      })
      r.inserted = r.inserted.filter((elm) => !!elm)
      MathJaxHelper.mathProcessor(r.inserted)
    }

    if (
      !atom.config.get('markdown-preview-plus.enablePandoc') ||
      !atom.config.get('markdown-preview-plus.useNativePandocCodeStyles')
    ) {
      for (const elm of r.inserted) {
        if (elm instanceof Element) {
          renderer.convertCodeBlocksToAtomEditors(elm)
        }
      }
    }

    this.updateOrderedListsStart(this.domFragment)

    return r
  }

  private updateOrderedListsStart(fragment: Element) {
    if (this.tree.shownTree === undefined) {
      throw new Error('shownTree undefined in updateOrderedListsStart')
    }
    const previewOLs = this.tree.shownTree.dom.querySelectorAll('ol')
    const parsedOLs = fragment.querySelectorAll('ol')

    const end = parsedOLs.length - 1
    for (let i = 0; i <= end; i++) {
      const previewStart = previewOLs[i].getAttribute('start')
      const parsedStart = parsedOLs[i].getAttribute('start')

      if (previewStart === parsedStart) {
        continue
      } else if (parsedStart !== null) {
        previewOLs[i].setAttribute('start', parsedStart)
      } else {
        previewOLs[i].removeAttribute('start')
      }
    }
  }
}

function prepareCodeBlocksForAtomEditors(domFragment: Element) {
  for (const preElement of Array.from(domFragment.querySelectorAll('pre'))) {
    const preWrapper = document.createElement('span')
    preWrapper.className = 'atom-text-editor'
    preElement.parentNode!.insertBefore(preWrapper, preElement)
    preWrapper.appendChild(preElement)
  }
  return domFragment
}
