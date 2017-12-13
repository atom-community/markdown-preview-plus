/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
"use strict";

let UpdatePreview;
const WrappedDomTree  = require('./wrapped-dom-tree');
const MathJaxHelper   = require('./mathjax-helper');
const renderer        = require('./renderer');

module.exports = (UpdatePreview = class UpdatePreview {
  // @param dom A DOM element object
  //    https://developer.mozilla.org/en-US/docs/Web/API/element
  constructor(dom) {
    this.tree         = new WrappedDomTree(dom, true);
    this.domFragment  = document.createDocumentFragment();
  }

  update(domFragment, renderLaTeX) {
    prepareCodeBlocksForAtomEditors(domFragment);

    if (domFragment.isEqualNode(this.domFragment)) {
      return;
    }

    const firstTime     = this.domFragment.childElementCount === 0;
    this.domFragment  = domFragment.cloneNode(true);

    const newDom            = document.createElement("div");
    newDom.className  = "update-preview";
    newDom.appendChild(domFragment);
    const newTree           = new WrappedDomTree(newDom);

    const r = this.tree.diffTo(newTree);
    newTree.removeSelf();

    if (firstTime) {
      r.possibleReplace = null;
      r.last            = null;
    }

    if (renderLaTeX) {
      r.inserted = r.inserted.map(function(elm) {
        while (elm && !elm.innerHTML) {
          elm = elm.parentElement;
        }
        return elm;
      });
      r.inserted = r.inserted.filter(elm => !!elm);
      MathJaxHelper.mathProcessor(r.inserted);
    }

    if (!atom.config.get('markdown-preview-plus.enablePandoc') 
        || !atom.config.get('markdown-preview-plus.useNativePandocCodeStyles')) {
      for (let elm of Array.from(r.inserted)) {
        if (elm instanceof Element) {
          renderer.convertCodeBlocksToAtomEditors(elm);
        }
      }
    }

    this.updateOrderedListsStart();

    return r;
  }

  updateOrderedListsStart() {
    const previewOLs = this.tree.shownTree.dom.querySelectorAll('ol');
    const parsedOLs  = this.domFragment.querySelectorAll('ol');

    for (let i = 0, end = parsedOLs.length-1; i <= end; i++) {
      const previewStart  = previewOLs[i].getAttribute('start');
      const parsedStart   = parsedOLs[i].getAttribute('start');

      if (previewStart === parsedStart) {
        continue;
      } else if (parsedStart != null) {
        previewOLs[i].setAttribute('start', parsedStart);
      } else {
        previewOLs[i].removeAttribute('start');
      }
    }

  }
});

var prepareCodeBlocksForAtomEditors = function(domFragment) {
  for (let preElement of Array.from(domFragment.querySelectorAll('pre'))) {
    const preWrapper = document.createElement('span');
    preWrapper.className = 'atom-text-editor';
    preElement.parentNode.insertBefore(preWrapper, preElement);
    preWrapper.appendChild(preElement);
  }
  return domFragment;
};
