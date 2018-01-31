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

export class TwoDimArray<T> {
  private readonly _arr: T[]
  constructor(public readonly row: number, public readonly col: number) {
    this._arr = new Array(row * col)
  }

  getInd(row: number, col: number) {
    return row * this.col + col
  }

  get2DInd(ind: number) {
    return {
      r: (ind / this.col) | 0,
      c: ind % this.col,
    }
  }

  get(row: number, col: number): T | undefined {
    return this._arr[this.getInd(row, col)]
  }

  set(row: number, col: number, val: T) {
    this._arr[row * this.col + col] = val
  }

  rawGet(ind: number): T | undefined {
    return this._arr[ind]
  }
}
