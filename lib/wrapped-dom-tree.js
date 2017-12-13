/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
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

let WrappedDomTree;
const TwoDimArray = require('./two-dim-array');

let curHash = 0;
const hashTo  = {};

module.exports = (WrappedDomTree = class WrappedDomTree {
  // @param dom A DOM element object
  //    https://developer.mozilla.org/en-US/docs/Web/API/element
  // @param clone Boolean flag indicating if this is the DOM tree to modify
  // @param rep WrappedDomTree of a DOM element node in dom
  constructor(dom, clone, rep) {
    if (clone) {
      this.shownTree  = new WrappedDomTree(dom, false, this);
      this.dom        = dom.cloneNode(true);
    } else {
      this.dom = dom;
      this.rep = rep;
    }

    this.clone        = clone;
    this.hash         = curHash++;
    hashTo[this.hash] = this;
    this.isText       = dom.nodeType === 3;
    this.tagName      = dom.tagName;
    this.className    = dom.className;
    this.textData     = dom.data;
    this.diffHash     = {};

    if (this.isText) {
      this.size = 1;
    } else {
      ({ rep } = this);
      this.children = [].map.call(this.dom.childNodes, (dom, ind) => new WrappedDomTree(dom, false, rep ? rep.children[ind] : null));
      this.size = this.children.length ? this.children.reduce(( (prev, cur) => prev + cur.size), 0) : 0;
      if (!this.size) {
        this.size = 1;
      }
    }
  }

  // @param otherTree WrappedDomTree of a DOM element to diff against
  diffTo(otherTree) {
    if (this.clone) {
      return this.shownTree.diffTo(otherTree);
    }

    const diff        = this.rep.diff(otherTree);
    const { score }       = diff;
    const { operations }  = diff;
    let indexShift  = 0;
    let inserted    = [];

    // Force variables to leak to diffTo scope
    let [last, possibleReplace, r, lastOp, lastElmDeleted, lastElmInserted] = Array.from([]);

    if (operations) {
      if (operations instanceof Array) {
        for (let op of Array.from(operations)) {
          (op => {
            if (op.type === "d") {
              const possibleLastDeleted = this.children[op.tree + indexShift].dom;
              r = this.remove(op.tree + indexShift);
              this.rep.remove(op.tree + indexShift);
              if (!last || (last.nextSibling === r) || (last === r)) {
                last = r;
                // Undefined errors can be throw so we add a condition on lastOp
                // being defined
                if (last && lastOp && (op.tree === lastOp.pos)) {
                  lastElmDeleted = possibleLastDeleted;
                } else {
                  lastElmDeleted  = null;
                  lastElmInserted = null;
                }
                lastOp = op;
              }
              indexShift--;
              return;
            } else if (op.type === "i") {
              this.rep.insert(op.pos + indexShift, otherTree.children[op.otherTree]);
              r = this.insert(op.pos + indexShift, otherTree.children[op.otherTree], this.rep.children[op.pos + indexShift]);
              inserted.push(r);
              if (!last || (last.nextSibling === r)) {
                last = r;
                lastOp = op;
                lastElmInserted = r;
              }
              indexShift++;
              return;
            } else {
              const re = this.children[op.tree + indexShift].diffTo(otherTree.children[op.otherTree]);
              if (!last || ((last.nextSibling === this.children[op.tree + indexShift].dom) && re.last)) {
                ({ last } = re);
                if (re.possibleReplace) {
                  lastElmInserted = re.possibleReplace.cur;
                  lastElmDeleted  = re.possibleReplace.prev;
                }
                lastOp = op;
              }
              inserted = inserted.concat(re.inserted);
              return;
            }
          })(op);
        }
      } else {
        console.log(operations);
        throw new Error("invalid operations");
      }
    }

    if (lastOp && (lastOp.type !== 'i') && lastElmInserted && lastElmDeleted) {
      possibleReplace = {
        cur: lastElmInserted,
        prev: lastElmDeleted
      };
    }

    return {
      last,
      inserted,
      possibleReplace
    };
  }

  insert(i, tree, rep) {
    const dom = tree.dom.cloneNode(true);
    if (i === this.dom.childNodes.length) {
      this.dom.appendChild(dom);
    } else {
      this.dom.insertBefore(dom, this.dom.childNodes[i]);
    }

    const ctree = new WrappedDomTree(dom, false, rep);
    this.children.splice(i, 0, ctree);
    return this.dom.childNodes[i];
  }

  remove(i) {
    this.dom.removeChild(this.dom.childNodes[i]);
    this.children[i].removeSelf();
    this.children.splice(i, 1);
    return this.dom.childNodes[i-1];
  }

  diff(otherTree, tmax) {
    let i;
    if (this.equalTo(otherTree)) {
      return {score: 0, operations: null};
    }

    if (this.cannotReplaceWith(otherTree)) {
      return {score: 1/0, operations: null};
    }

    const key = otherTree.hash;
    if (Array.from(this.diffHash).includes(key)) {
      return this.diffHash[key];
    }

    if (tmax === undefined) {
      tmax = 100000;
    }
    if (tmax <= 0) {
      return 0;
    }

    let offset = 0;
    const forwardSearch = offset => {
      return (offset < this.children.length) &&
      (offset < otherTree.children.length) &&
      this.children[offset].equalTo(otherTree.children[offset]);
    };
    while (forwardSearch(offset)) {
      offset++;
    }

    const dp = new TwoDimArray((this.children.length + 1) - offset, (otherTree.children.length + 1) - offset);
    const p  = new TwoDimArray((this.children.length + 1) - offset, (otherTree.children.length + 1) - offset);
    dp.set(0, 0, 0);

    let sum = 0;
    // Because coffescripts allows biderctional loops we need this condition
    // gaurd to prevent a decreasing array list
    if ((otherTree.children.length - offset) > 1) {
      let asc, end;
      for (i = 1, end = otherTree.children.length - offset - 1, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
        dp.set(0, i, sum);
        p.set(0, i, i-1);
        sum += otherTree.children[i + offset].size;
      }
    }
    if ((otherTree.children.length - offset) > 0) {
      dp.set(0, otherTree.children.length - offset, sum);
      p.set(0, otherTree.children.length - offset, otherTree.children.length - 1 - offset);
    }

    sum = 0;
    // Because coffescripts allows biderctional loops we need this condition
    // gaurd to prevent a decreasing array list
    if ((this.children.length - offset) > 1) {
      let asc1, end1;
      for (i = 1, end1 = this.children.length - offset - 1, asc1 = 1 <= end1; asc1 ? i <= end1 : i >= end1; asc1 ? i++ : i--) {
        dp.set(i, 0, sum);
        p.set(i, 0, (i-1)*p.col);
        sum += this.children[i + offset].size;
      }
    }
    if (this.children.length - offset) {
      dp.set(this.children.length - offset, 0, sum);
      p.set(this.children.length - offset, 0, (this.children.length - 1 - offset)*p.col);
    }

    var getScore = (i, j, max) => {
      if (dp.get(i, j) !== undefined) {
        return dp.get(i, j);
      }
      if (max === undefined) {
        max = 1/0;
      }
      if (max <= 0) {
        return 1/0;
      }

      let val     = max;
      const bound   = max;
      const subdiff = this.children[(i - 1) + offset].diff( otherTree.children[(j - 1) + offset], bound).score;
      let force   = false;
      if ((subdiff < bound) && ((subdiff + 1) < (this.children[(i - 1) + offset].size + otherTree.children[(j - 1) + offset].size))) {
        force = true;
      }
      val = getScore(i-1, j-1, bound - subdiff) + subdiff;
      let prev = p.getInd(i-1, j-1);

      if (!force) {
        let other = getScore(i-1, j, Math.min(val, max) - this.children[(i-1)+offset].size) + this.children[(i-1)+offset].size;
        if (other < val) {
          prev  = p.getInd(i-1, j);
          val   = other;
        }

        other = getScore(i, j-1, Math.min(val, max) - otherTree.children[(j-1)+offset].size) + otherTree.children[(j-1)+offset].size;
        if (other < val) {
          prev  = p.getInd(i, j-1);
          val   = other;
        }
      }

      if (val >= max) {
        val = 1/0;
      }

      dp.set(i, j, val);
      p.set(i, j, prev);
      return val;
    };

    const score = getScore(this.children.length - offset, otherTree.children.length - offset, tmax);
    const operations = [];

    let cur = p.getInd(this.children.length - offset, otherTree.children.length - offset);
    let cr  = this.children.length - 1 - offset;
    let cc  = otherTree.children.length - 1 - offset;

    while (p.rawGet(cur) !== undefined) {
      const prev  = p.rawGet(cur);
      const rc    = p.get2DInd(prev);
      const pr    = rc.r - 1;
      const pc    = rc.c - 1;

      if (pr === cr) {
        operations.unshift({
          type: "i",
          otherTree: cc + offset,
          pos: cr + 1 + offset
        });
      } else if (pc === cc) {
        operations.unshift({
          type: "d",
          tree: cr + offset
        });
      } else {
        const op = this.children[cr + offset].diff(otherTree.children[cc + offset]).operations;
        if (op && op.length) {
          operations.unshift({
            type: "r",
            tree: cr + offset,
            otherTree: cc + offset
          });
        }
      }
      cur = prev;
      cr  = pr;
      cc  = pc;
    }

    this.diffHash[key] = {
      score,
      operations
    };

    return this.diffHash[key];
  }

  equalTo(otherTree) {
    return this.dom.isEqualNode(otherTree.dom);
  }

  cannotReplaceWith(otherTree) {
    return this.isText ||
    otherTree.isText ||
    (this.tagName !== otherTree.tagName) ||
    (this.className !== otherTree.className) ||
    (this.className === "math") ||
    (this.className === "atom-text-editor") ||
    (this.tagName === "A") ||
    ((this.tagName === "IMG") && !this.dom.isEqualNode(otherTree.dom));
  }

  getContent() {
    if (this.dom.outerHTML) {
      return this.dom.outerHTML;
    } else {
      return this.textData;
    }
  }

  removeSelf() {
    hashTo[this.hash] = null;
    this.children && this.children.forEach(c => c.removeSelf());
  }
});
