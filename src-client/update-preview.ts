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
import morph = require('morphdom')
import MathJaxHelper = require('./mathjax-helper')

export class UpdatePreview {
  private cachedMJRenderer?: MathJaxRenderer
  constructor(private dom: HTMLElement) {
    /* no-op */
  }

  public async update(
    newDom: Element,
    renderLaTeX: boolean,
    mjrenderer: MathJaxRenderer,
  ): Promise<void> {
    const lastMJRenderer =
      this.cachedMJRenderer === undefined ? mjrenderer : this.cachedMJRenderer
    this.cachedMJRenderer = mjrenderer

    for (const m of Array.from(newDom.querySelectorAll('span.math'))) {
      const mscr = m.firstElementChild as HTMLScriptElement | null
      if (!mscr || mscr.nodeName !== 'SCRIPT') continue
      m.isSameNode = function(target: Node) {
        if (lastMJRenderer !== mjrenderer) return false
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
      onElUpdated: function(el) {
        if (el.tagName === 'LI') el.innerHTML = el.innerHTML // force re-render
      },
    })

    if (renderLaTeX) {
      return MathJaxHelper.mathProcessor(this.dom, mjrenderer)
    }
  }
}
