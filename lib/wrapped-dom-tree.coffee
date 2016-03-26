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

TwoDimArray = require './two-dim-array'

curHash = 0
hashTo  = {}

module.exports = class WrappedDomTree
  # @param dom A DOM element object
  #    https://developer.mozilla.org/en-US/docs/Web/API/element
  # @param clone Boolean flag indicating if this is the DOM tree to modify
  # @param rep WrappedDomTree of a DOM element node in dom
  constructor: (dom, clone, rep) ->
    if clone
      @shownTree  = new WrappedDomTree dom, false, this
      @dom        = dom.cloneNode true
    else
      @dom = dom
      @rep = rep

    @clone        = clone
    @hash         = curHash++
    hashTo[@hash] = this
    @isText       = dom.nodeType is 3
    @tagName      = dom.tagName
    @className    = dom.className
    @textData     = dom.data
    @diffHash     = {}

    if @isText
      @size = 1
    else
      rep = @rep
      @children = [].map.call @dom.childNodes, (dom, ind) ->
        new WrappedDomTree(dom, false, if rep then rep.children[ind] else null)
      @size = if @children.length then @children.reduce ( (prev, cur) ->
        prev + cur.size ), 0 else 0
      unless @size
        @size = 1

  # @param otherTree WrappedDomTree of a DOM element to diff against
  diffTo: (otherTree) ->
    if @clone
      return @shownTree.diffTo otherTree

    diff        = @rep.diff otherTree
    score       = diff.score
    operations  = diff.operations
    indexShift  = 0
    inserted    = []

    # Force variables to leak to diffTo scope
    [last, possibleReplace, r, lastOp, lastElmDeleted, lastElmInserted] = []

    if operations
      if operations instanceof Array
        for op in operations
          do (op) =>
            if op.type is "d"
              possibleLastDeleted = @children[op.tree + indexShift].dom
              r = @remove op.tree + indexShift
              @rep.remove op.tree + indexShift
              if not last or last.nextSibling is r or last is r
                last = r
                # Undefined errors can be throw so we add a condition on lastOp
                # being defined
                if last and lastOp and op.tree is lastOp.pos
                  lastElmDeleted = possibleLastDeleted
                else
                  lastElmDeleted  = null
                  lastElmInserted = null
                lastOp = op
              indexShift--
              return
            else if op.type is "i"
              @rep.insert op.pos + indexShift, otherTree.children[op.otherTree]
              r = @insert op.pos + indexShift, otherTree.children[op.otherTree], @rep.children[op.pos + indexShift]
              inserted.push(r)
              if not last or last.nextSibling is r
                last = r
                lastOp = op
                lastElmInserted = r
              indexShift++
              return
            else
              re = @children[op.tree + indexShift].diffTo otherTree.children[op.otherTree]
              if not last or (last.nextSibling is @children[op.tree + indexShift].dom and re.last)
                last = re.last
                if re.possibleReplace
                  lastElmInserted = re.possibleReplace.cur
                  lastElmDeleted  = re.possibleReplace.prev
                lastOp = op
              inserted = inserted.concat re.inserted
              return
      else
        console.log operations
        throw new Error "invalid operations"

    if lastOp and lastOp.type isnt 'i' and lastElmInserted and lastElmDeleted
      possibleReplace =
        cur: lastElmInserted
        prev: lastElmDeleted

    last: last
    inserted: inserted
    possibleReplace: possibleReplace

  insert: (i, tree, rep) ->
    dom = tree.dom.cloneNode true
    if i is @dom.childNodes.length
      @dom.appendChild dom
    else
      @dom.insertBefore dom, @dom.childNodes[i]

    ctree = new WrappedDomTree dom, false, rep
    @children.splice i, 0, ctree
    @dom.childNodes[i]

  remove: (i) ->
    @dom.removeChild @dom.childNodes[i]
    @children[i].removeSelf()
    @children.splice i, 1
    @dom.childNodes[i-1]

  diff: (otherTree, tmax) ->
    if @equalTo otherTree
      return score: 0, operations: null

    if @cannotReplaceWith otherTree
      return score: 1/0, operations: null

    key = otherTree.hash
    if key in @diffHash
      return @diffHash[key]

    if tmax is undefined
      tmax = 100000
    if tmax <= 0
      return 0

    offset = 0
    forwardSearch = (offset) =>
      offset < @children.length and
      offset < otherTree.children.length and
      @children[offset].equalTo otherTree.children[offset]
    while forwardSearch(offset)
      offset++

    dp = new TwoDimArray @children.length + 1 - offset, otherTree.children.length + 1 - offset
    p  = new TwoDimArray @children.length + 1 - offset, otherTree.children.length + 1 - offset
    dp.set 0, 0, 0

    sum = 0
    # Because coffescripts allows biderctional loops we need this condition
    # gaurd to prevent a decreasing array list
    if otherTree.children.length - offset > 1
      for i in [1..(otherTree.children.length - offset - 1)]
        dp.set 0, i, sum
        p.set 0, i, i-1
        sum += otherTree.children[i + offset].size
    if otherTree.children.length - offset > 0
      dp.set 0, otherTree.children.length - offset, sum
      p.set 0, otherTree.children.length - offset, otherTree.children.length - 1 - offset

    sum = 0
    # Because coffescripts allows biderctional loops we need this condition
    # gaurd to prevent a decreasing array list
    if @children.length - offset > 1
      for i in [1..(@children.length - offset - 1)]
        dp.set i, 0, sum
        p.set i, 0, (i-1)*p.col
        sum += @children[i + offset].size
    if @children.length - offset
      dp.set @children.length - offset, 0, sum
      p.set @children.length - offset, 0, (@children.length - 1 - offset)*p.col

    getScore = (i, j, max) =>
      if dp.get(i, j) isnt undefined
        return dp.get(i, j)
      if max is undefined
        max = 1/0
      if max <= 0
        return 1/0

      val     = max
      bound   = max
      subdiff = @children[i - 1 + offset].diff( otherTree.children[j - 1 + offset], bound).score
      force   = false
      if subdiff < bound and subdiff + 1 < @children[i - 1 + offset].size + otherTree.children[j - 1 + offset].size
        force = true
      val = getScore(i-1, j-1, bound - subdiff) + subdiff
      prev = p.getInd i-1, j-1

      unless force
        other = getScore(i-1, j, Math.min(val, max) - @children[i-1+offset].size) + @children[i-1+offset].size
        if other < val
          prev  = p.getInd i-1, j
          val   = other

        other = getScore(i, j-1, Math.min(val, max) - otherTree.children[j-1+offset].size) + otherTree.children[j-1+offset].size
        if other < val
          prev  = p.getInd i, j-1
          val   = other

      if val >= max
        val = 1/0

      dp.set i, j, val
      p.set i, j, prev
      val

    score = getScore @children.length - offset, otherTree.children.length - offset, tmax
    operations = []

    cur = p.getInd @children.length - offset, otherTree.children.length - offset
    cr  = @children.length - 1 - offset
    cc  = otherTree.children.length - 1 - offset

    while p.rawGet(cur) isnt undefined
      prev  = p.rawGet cur
      rc    = p.get2DInd prev
      pr    = rc.r - 1
      pc    = rc.c - 1

      if pr is cr
        operations.unshift
          type: "i"
          otherTree: cc + offset
          pos: cr + 1 + offset
      else if pc is cc
        operations.unshift
          type: "d"
          tree: cr + offset
      else
        op = @children[cr + offset].diff(otherTree.children[cc + offset]).operations
        if op and op.length
          operations.unshift
            type: "r"
            tree: cr + offset
            otherTree: cc + offset
      cur = prev
      cr  = pr
      cc  = pc

    @diffHash[key] =
      score: score
      operations: operations

    @diffHash[key]

  equalTo: (otherTree) ->
    @dom.isEqualNode otherTree.dom

  cannotReplaceWith: (otherTree) ->
    @isText or
    otherTree.isText or
    @tagName isnt otherTree.tagName or
    @className isnt otherTree.className or
    @className is "math" or
    @className is "atom-text-editor" or
    @tagName is "A" or
    (@tagName is "IMG" and not @dom.isEqualNode(otherTree.dom))

  getContent: ->
    if @dom.outerHTML
      return @dom.outerHTML
    else
      return @textData

  removeSelf: ->
    hashTo[@hash] = null
    @children and @children.forEach (c) ->
      c.removeSelf()
    return
