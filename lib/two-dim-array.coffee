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

module.exports = class TwoDimArray
  constructor: (rows, cols) ->
    @_arr = new Array(rows*cols)
    @row = rows
    @col = cols
    return

  getInd: (row, col) ->
    row*@col + col

  get2DInd: (ind) ->
    r: ind/@col | 0,
    c: ind % @col

  get: (row, col) ->
    @_arr[@getInd(row, col)]

  set: (row, col, val) ->
    @_arr[row*@col + col] = val
    return

  rawGet: (ind) ->
    @_arr[ind]
