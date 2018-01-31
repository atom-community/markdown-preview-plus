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
import { TwoDimArray } from './two-dim-array'

let curHash = 0
const hashTo: { [key: string]: WrappedDomTree | undefined } = {}

type Operation =
  | { type: 'r'; tree: number; otherTree: number }
  | { type: 'd'; tree: number }
  | { type: 'i'; otherTree: number; pos: number }

export class WrappedDomTree {
  public readonly shownTree?: WrappedDomTree
  public readonly dom: Element
  private textData: string
  private children: WrappedDomTree[] = []
  private size: number = 0
  private diffHash: {
    [key: string]: {
      score: number
      operations?: Operation[]
    }
  }
  private className: string
  private tagName: string
  private rep?: WrappedDomTree
  private isText: boolean
  private hash: number
  private clone: boolean
  // tslint:disable-next-line:no-uninitialized
  // @param dom A DOM element object
  //    https://developer.mozilla.org/en-US/docs/Web/API/element
  // @param clone Boolean flag indicating if this is the DOM tree to modify
  // @param rep WrappedDomTree of a DOM element node in dom
  constructor(dom: Element, clone: true)
  constructor(dom: Element, clone: false, rep?: WrappedDomTree)
  constructor(dom: Element, clone: boolean, rep?: WrappedDomTree) {
    if (clone) {
      this.shownTree = new WrappedDomTree(dom, false, this)
      this.dom = dom.cloneNode(true) as Element
    } else {
      this.dom = dom
      this.rep = rep
    }

    this.clone = clone
    this.hash = curHash++
    hashTo[this.hash] = this
    this.isText = dom.nodeType === 3
    this.tagName = dom.tagName
    this.className = dom.className
    this.textData = (dom as Element & { data: string }).data
    this.diffHash = {}

    if (this.isText) {
      this.size = 1
    } else {
      this.children = Array.from(this.dom.childNodes).map(
        (dom, ind) =>
          new WrappedDomTree(
            dom as Element,
            false,
            rep ? rep.children[ind] : undefined,
          ),
      )
      this.size = this.children.length
        ? this.children.reduce((prev, cur) => prev + cur.size, 0)
        : 0
      if (!this.size) {
        this.size = 1
      }
    }
  }

  // @param otherTree WrappedDomTree of a DOM element to diff against
  public diffTo(
    otherTree: WrappedDomTree,
  ): {
    possibleReplace?: {
      cur?: Node
      prev?: Element
    }
    inserted: Node[]
    last?: Node
  } {
    if (this.clone && this.shownTree) {
      return this.shownTree.diffTo(otherTree)
    }

    const diff = this.rep && this.rep.diff(otherTree)
    const operations = diff && diff.operations
    let indexShift = 0
    let inserted: Node[] = []

    // Force variables to leak to diffTo scope
    let last: Node | undefined
    let possibleReplace
    let r
    let lastOp: Operation | undefined
    let lastElmDeleted: Element | undefined
    let lastElmInserted: Element | undefined

    if (operations) {
      if (Array.isArray(operations)) {
        for (const op of operations) {
          if (op.type === 'd') {
            const possibleLastDeleted = this.children[op.tree + indexShift].dom
            r = this.remove(op.tree + indexShift)
            this.rep && this.rep.remove(op.tree + indexShift)
            if (!last || last.nextSibling === r || last === r) {
              last = r
              // Undefined errors can be throw so we add a condition on lastOp
              // being defined
              if (
                last &&
                lastOp &&
                lastOp.type === 'i' &&
                op.tree === lastOp.pos
              ) {
                lastElmDeleted = possibleLastDeleted
              } else {
                lastElmDeleted = undefined
                lastElmInserted = undefined
              }
              lastOp = op
            }
            indexShift--
          } else if (op.type === 'i') {
            this.rep &&
              this.rep.insert(
                op.pos + indexShift,
                otherTree.children[op.otherTree],
              )
            r = this.insert(
              op.pos + indexShift,
              otherTree.children[op.otherTree],
              this.rep && this.rep.children[op.pos + indexShift],
            )
            inserted.push(r)
            if (!last || last.nextSibling === r) {
              last = r
              lastOp = op
              lastElmInserted = r as Element
            }
            indexShift++
          } else {
            const re = this.children[op.tree + indexShift].diffTo(
              otherTree.children[op.otherTree],
            )
            if (
              !last ||
              (last.nextSibling === this.children[op.tree + indexShift].dom &&
                re.last)
            ) {
              ;({ last } = re)
              if (re.possibleReplace) {
                lastElmInserted = re.possibleReplace.cur as Element | undefined
                lastElmDeleted = re.possibleReplace.prev
              }
              lastOp = op
            }
            inserted = inserted.concat(re.inserted)
          }
        }
      } else {
        console.debug(operations)
        throw new Error('invalid operations')
      }
    }

    if (lastOp && lastOp.type !== 'i' && lastElmInserted && lastElmDeleted) {
      possibleReplace = {
        cur: lastElmInserted,
        prev: lastElmDeleted,
      }
    }

    return {
      last,
      inserted,
      possibleReplace,
    }
  }

  insert(i: number, tree: WrappedDomTree, rep?: WrappedDomTree) {
    const dom = tree.dom.cloneNode(true)
    if (i === this.dom.childNodes.length) {
      this.dom.appendChild(dom)
    } else {
      this.dom.insertBefore(dom, this.dom.childNodes[i])
    }

    const ctree = new WrappedDomTree(dom as Element, false, rep)
    this.children.splice(i, 0, ctree)
    return this.dom.childNodes[i]
  }

  remove(i: number) {
    this.dom.removeChild(this.dom.childNodes[i])
    this.children[i].removeSelf()
    this.children.splice(i, 1)
    return this.dom.childNodes[i - 1]
  }

  private diff(
    otherTree: WrappedDomTree,
    tmax?: number,
  ): {
    score: number
    operations?: Operation[]
  } {
    let i
    if (this.equalTo(otherTree)) {
      return { score: 0, operations: undefined }
    }

    if (this.cannotReplaceWith(otherTree)) {
      return { score: 1 / 0, operations: undefined }
    }

    const key = otherTree.hash
    if (Object.keys(this.diffHash).includes(key.toString())) {
      return this.diffHash[key]
    }

    if (tmax === undefined) {
      tmax = 100000
    }
    if (tmax <= 0) {
      return { score: 0 }
    }

    let offset = 0
    const forwardSearch = (offset: number) =>
      offset < this.children.length &&
      offset < otherTree.children.length &&
      this.children[offset].equalTo(otherTree.children[offset])
    while (forwardSearch(offset)) {
      offset++
    }

    const dp = new TwoDimArray<number>(
      this.children.length + 1 - offset,
      otherTree.children.length + 1 - offset,
    )
    const p = new TwoDimArray<number>(
      this.children.length + 1 - offset,
      otherTree.children.length + 1 - offset,
    )
    dp.set(0, 0, 0)

    let sum = 0
    // Because coffescripts allows biderctional loops we need this condition
    // gaurd to prevent a decreasing array list
    if (otherTree.children.length - offset > 1) {
      let asc: boolean
      let end: number
      for (
        i = 1, end = otherTree.children.length - offset - 1, asc = 1 <= end;
        asc ? i <= end : i >= end;
        asc ? i++ : i--
      ) {
        dp.set(0, i, sum)
        p.set(0, i, i - 1)
        sum += otherTree.children[i + offset].size
      }
    }
    if (otherTree.children.length - offset > 0) {
      dp.set(0, otherTree.children.length - offset, sum)
      p.set(
        0,
        otherTree.children.length - offset,
        otherTree.children.length - 1 - offset,
      )
    }

    sum = 0
    // Because coffescripts allows biderctional loops we need this condition
    // gaurd to prevent a decreasing array list
    if (this.children.length - offset > 1) {
      let asc1: boolean
      let end1: number
      for (
        i = 1, end1 = this.children.length - offset - 1, asc1 = 1 <= end1;
        asc1 ? i <= end1 : i >= end1;
        asc1 ? i++ : i--
      ) {
        dp.set(i, 0, sum)
        p.set(i, 0, (i - 1) * p.col)
        sum += this.children[i + offset].size
      }
    }
    if (this.children.length - offset) {
      dp.set(this.children.length - offset, 0, sum)
      p.set(
        this.children.length - offset,
        0,
        (this.children.length - 1 - offset) * p.col,
      )
    }

    const getScore = (i: number, j: number, max?: number): number => {
      const res = dp.get(i, j)
      if (res !== undefined) {
        return res
      }
      if (max === undefined) {
        max = 1 / 0
      }
      if (max <= 0) {
        return 1 / 0
      }

      let val = max
      const bound = max
      const subdiff = this.children[i - 1 + offset].diff(
        otherTree.children[j - 1 + offset],
        bound,
      ).score
      let force = false
      if (
        subdiff < bound &&
        subdiff + 1 <
          this.children[i - 1 + offset].size +
            otherTree.children[j - 1 + offset].size
      ) {
        force = true
      }
      val = getScore(i - 1, j - 1, bound - subdiff) + subdiff
      let prev = p.getInd(i - 1, j - 1)

      if (!force) {
        let other =
          getScore(
            i - 1,
            j,
            Math.min(val, max) - this.children[i - 1 + offset].size,
          ) + this.children[i - 1 + offset].size
        if (other < val) {
          prev = p.getInd(i - 1, j)
          val = other
        }

        other =
          getScore(
            i,
            j - 1,
            Math.min(val, max) - otherTree.children[j - 1 + offset].size,
          ) + otherTree.children[j - 1 + offset].size
        if (other < val) {
          prev = p.getInd(i, j - 1)
          val = other
        }
      }

      if (val >= max) {
        val = 1 / 0
      }

      dp.set(i, j, val)
      p.set(i, j, prev)
      return val
    }

    const score = getScore(
      this.children.length - offset,
      otherTree.children.length - offset,
      tmax,
    )
    const operations: Operation[] = []

    let cur = p.getInd(
      this.children.length - offset,
      otherTree.children.length - offset,
    )
    let cr = this.children.length - 1 - offset
    let cc = otherTree.children.length - 1 - offset

    while (p.rawGet(cur) !== undefined) {
      const prev = p.rawGet(cur)!
      const rc = p.get2DInd(prev)
      const pr = rc.r - 1
      const pc = rc.c - 1

      if (pr === cr) {
        operations.unshift({
          type: 'i',
          otherTree: cc + offset,
          pos: cr + 1 + offset,
        })
      } else if (pc === cc) {
        operations.unshift({
          type: 'd',
          tree: cr + offset,
        })
      } else {
        const op = this.children[cr + offset].diff(
          otherTree.children[cc + offset],
        ).operations
        if (op && op.length) {
          operations.unshift({
            type: 'r',
            tree: cr + offset,
            otherTree: cc + offset,
          })
        }
      }
      cur = prev
      cr = pr
      cc = pc
    }

    this.diffHash[key] = {
      score,
      operations,
    }

    return this.diffHash[key]
  }

  equalTo(otherTree: WrappedDomTree) {
    return this.dom.isEqualNode(otherTree.dom)
  }

  cannotReplaceWith(otherTree: WrappedDomTree) {
    return (
      this.isText ||
      otherTree.isText ||
      this.tagName !== otherTree.tagName ||
      this.className !== otherTree.className ||
      this.className === 'math' ||
      this.className === 'atom-text-editor' ||
      this.tagName === 'A' ||
      (this.tagName === 'IMG' && !this.dom.isEqualNode(otherTree.dom))
    )
  }

  getContent() {
    if (this.dom.outerHTML) {
      return this.dom.outerHTML
    } else {
      return this.textData
    }
  }

  removeSelf() {
    hashTo[this.hash] = undefined
    this.children &&
      this.children.forEach((c) => {
        c.removeSelf()
      })
  }
}
