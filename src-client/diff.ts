//  This code is ported from
//  <https://github.com/RobertElderSoftware/roberteldersoftwarediff/>
//
//  The license for the original code is:
//
//  Copyright 2017 Robert Elder Software Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.import random

import { zip } from './util'

export function diff<T, U>(
  left: ArrayLike<T>,
  right: ArrayLike<U>,
  compare: (t: T, u: U) => boolean,
  match: (pairs: Iterable<[T, U]>) => void,
): void {
  const slices: [any[], any[]][] = []
  function go(e: Array<T>, f: Array<U>, i = 0, j = 0): void {
    // Adapted from http://blog.robertelder.org/diff-algorithm/
    // Licensed under Apache 2.0
    const [N, M, L, Z] = [
      e.length,
      f.length,
      e.length + f.length,
      2 * Math.min(e.length, f.length) + 2,
    ]
    if (N > 0 && M > 0) {
      const [w, g, p] = [
        N - M,
        Array(Z).fill(0) as number[],
        Array(Z).fill(0) as number[],
      ]
      for (let h = 0; h < L / 2 + (L % 2) + 1; h++) {
        for (let r = 0; r < 2; r++) {
          const [c, d, o, m] = r === 0 ? [g, p, 1, 1] : [p, g, 0, -1]
          for (
            let k = -(h - 2 * Math.max(0, h - M));
            k < h - 2 * Math.max(0, h - N) + 1;
            k += 2
          ) {
            let a =
              k === -h || (k !== h && c[(k - 1) % Z] < c[(k + 1) % Z])
                ? c[(k + 1) % Z]
                : c[(k - 1) % Z] + 1
            let b = a - k
            const [s, t] = [a, b]
            while (
              a < N &&
              b < M &&
              compare(
                e[(1 - o) * N + m * a + (o - 1)],
                f[(1 - o) * M + m * b + (o - 1)],
              )
            ) {
              a++, b++
            }
            c[k % Z] = a
            const z = -(k - w)
            if (
              L % 2 === o &&
              z >= -(h - o) &&
              z <= h - o &&
              c[k % Z] + d[z % Z] >= N
            ) {
              const [D, x, y, u, v] =
                o === 1
                  ? [2 * h - 1, s, t, a, b]
                  : [2 * h, N - a, M - b, N - s, M - t]
              if (D > 1 || (x !== u && y !== v)) {
                if (x !== u && y !== v) {
                  slices.push([e.slice(x, u), f.slice(y, v)])
                }
                // return go(e.slice(0, x), f.slice(0, y), i, j).concat(
                //   go(e.slice(u, N), f.slice(v, M), i + u, j + v),
                go(e.slice(0, x), f.slice(0, y), i, j)
                go(e.slice(u, N), f.slice(v, M), i + u, j + v)
                return
              } else if (M > N) {
                slices.push([e.slice(0, N), f.slice(0, N)])
                return
                // return go([], f.slice(N, M), i + N, j + N)
              } else if (M < N) {
                slices.push([e.slice(0, M), f.slice(0, M)])
                return
                // return go(e.slice(M, N), [], i + M, j + M)
              } // else return []
            }
          }
        }
      }
    } /* else if (N > 0) {
      console.log('delete', e)
      return
    } else {
      console.log('insert', e)
    }*/
  }
  go(Array.from(left), Array.from(right))
  match(slicesToItems(slices))
}

function* slicesToItems(slices: [any[], any[]][]) {
  for (const [a, b] of slices) {
    yield* zip(a, b)
  }
}
