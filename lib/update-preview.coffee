# This file incorporates code from [markmon](https://github.com/yyjhao/markmon)
# covered by the following terms:
#
# Copyright (c) 2014, Yao Yujian, http://yjyao.com
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
"use strict"

WrappedDomTree  = require './wrapped-dom-tree'
MathJaxHelper   = require './mathjax-helper'
renderer        = require './renderer'

module.exports = class UpdatePreview
  # @param dom A DOM element object
  #    https://developer.mozilla.org/en-US/docs/Web/API/element
  constructor: (dom) ->
    @tree         = new WrappedDomTree dom, true
    @domFragment  = document.createDocumentFragment()

  update: (domFragment, renderLaTeX) ->
    prepareCodeBlocksForAtomEditors(domFragment)

    if domFragment.isEqualNode(@domFragment)
      return

    firstTime     = @domFragment.childElementCount is 0
    @domFragment  = domFragment.cloneNode(true)

    newDom            = document.createElement "div"
    newDom.className  = "update-preview"
    newDom.appendChild domFragment
    newTree           = new WrappedDomTree newDom

    r = @tree.diffTo newTree
    newTree.removeSelf()

    if firstTime
      r.possibleReplace = null
      r.last            = null

    if renderLaTeX
      r.inserted = r.inserted.map (elm) ->
        while elm and not elm.innerHTML
          elm = elm.parentElement
        elm
      r.inserted = r.inserted.filter (elm) ->
        !!elm
      MathJaxHelper.mathProcessor r.inserted

    for elm in r.inserted
      if elm instanceof Element
        renderer.convertCodeBlocksToAtomEditors elm

    @updateOrderedListsStart()

    return r

  updateOrderedListsStart: ->
    previewOLs = @tree.shownTree.dom.querySelectorAll('ol')
    parsedOLs  = @domFragment.querySelectorAll('ol')

    for i in [0..(parsedOLs.length-1)] by 1
      previewStart  = previewOLs[i].getAttribute 'start'
      parsedStart   = parsedOLs[i].getAttribute 'start'

      if previewStart is parsedStart
        continue
      else if parsedStart?
        previewOLs[i].setAttribute 'start', parsedStart
      else
        previewOLs[i].removeAttribute 'start'

    return

prepareCodeBlocksForAtomEditors = (domFragment) ->
  for preElement in domFragment.querySelectorAll('pre')
    preWrapper = document.createElement('span')
    preWrapper.className = 'atom-text-editor'
    preElement.parentNode.insertBefore(preWrapper, preElement)
    preWrapper.appendChild(preElement)
  domFragment
