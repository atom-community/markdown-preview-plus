// This file incorporates code from https://github.com/wafer-li/markdown-it-criticmarkup
// covered by the following terms:
// Copyright 2017 Wafer Li
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
// SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
// CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

import mdIt from 'markdown-it'
import Token from 'markdown-it/lib/token'

const specialChars = ['-', '+', '~', '=', '>']

function isOpening(str: string, pos: number): [string, string] | null {
  if (
    str[pos] === '{' &&
    specialChars.includes(str[pos + 1]) &&
    str[pos + 2] === str[pos + 1]
  ) {
    const op = str.slice(pos + 1, pos + 3)
    const cl = op[0] === '>' ? '<<}' : op + '}'
    return [op, cl]
  } else {
    return null
  }
}

function criticInline(
  state: { src: string; pos: number; push: (token: string) => Token },
  silent: boolean,
) {
  const { src, pos } = state
  const tags = isOpening(src, pos)
  if (tags === null) return false
  const [opening, closing] = tags
  const endPos = src.indexOf(closing, pos + 3)
  const content = endPos >= 0 ? src.slice(pos + 3, endPos) : null
  if (content === null) return false
  if (silent) return true
  const token = state.push('critic-markup')
  token.content = content
  token.tag = opening
  state.pos = endPos + closing.length
  return true
}

function criticRender(tokens: Token[], idx: number) {
  const token = tokens[idx]
  const tag = token.tag
  const content = token.content
  if (tag === '--') {
    return `<del>${content}</del>`
  } else if (tag === '++') {
    return `<ins>${content}</ins>`
  } else if (tag === '==') {
    return `<mark>${content}</mark>`
  } else if (tag === '>>') {
    return `<span tabindex="-1" class="critic comment"><span>${content}</span></span>`
  } else {
    // {~~[text1]~>[text2]~~}
    const arr = content.split('~>')
    if (arr.length === 2) {
      return `<del>${arr[0]}</del><ins>${arr[1]}</ins>`
    } else {
      return `<code>Error: ~> not found.</code>`
    }
  }
}

export function criticMarkup(md: mdIt) {
  md.inline.ruler.before('strikethrough', 'critic-markup', criticInline as any)
  md.renderer.rules['critic-markup'] = criticRender
}
