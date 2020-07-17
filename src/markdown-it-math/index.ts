/* Process inline math */

import mdIt from 'markdown-it'
import Token from 'markdown-it/lib/token'
import { RuleInline } from 'markdown-it/lib/parser_inline'
import { RuleBlock } from 'markdown-it/lib/parser_block'

function scanDelims(
  state: import('markdown-it/lib/rules_inline/state_inline'),
  start: number,
  delimLength: number,
) {
  let pos = start
  let lastChar
  let nextChar
  let count
  let canOpen
  let canClose
  let isLastWhiteSpace
  let isLastPunctChar
  let isNextWhiteSpace
  let isNextPunctChar
  let leftFlanking = true
  let rightFlanking = true
  const max = state.posMax
  const utils = state.md.utils

  // treat beginning of the line as a whitespace
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : 0x20

  if (pos >= max) {
    canOpen = false
  }

  pos += delimLength

  count = pos - start

  // treat end of the line as a whitespace
  nextChar = pos < max ? state.src.charCodeAt(pos) : 0x20

  isLastPunctChar =
    utils.isMdAsciiPunct(lastChar) ||
    utils.isPunctChar(String.fromCharCode(lastChar))
  isNextPunctChar =
    utils.isMdAsciiPunct(nextChar) ||
    utils.isPunctChar(String.fromCharCode(nextChar))

  isLastWhiteSpace = utils.isWhiteSpace(lastChar)
  isNextWhiteSpace = utils.isWhiteSpace(nextChar)

  if (isNextWhiteSpace) {
    leftFlanking = false
  } else if (isNextPunctChar) {
    if (!(isLastWhiteSpace || isLastPunctChar)) {
      leftFlanking = false
    }
  }

  if (isLastWhiteSpace) {
    rightFlanking = false
  } else if (isLastPunctChar) {
    if (!(isNextWhiteSpace || isNextPunctChar)) {
      rightFlanking = false
    }
  }

  canOpen = leftFlanking
  canClose = rightFlanking

  return {
    can_open: canOpen,
    can_close: canClose,
    delims: count,
  }
}

function makeMath_inline(
  name: 'math_inline' | 'math_block',
  delims: [[string, string]],
): RuleInline {
  return function math_inline(state, silent) {
    let startCount
    let found
    let res
    let token
    let closeDelim
    const max = state.posMax
    const start = state.pos
    const foundDelims = delims.find(function (i) {
      const open = i[0]
      const openDelim = state.src.slice(start, start + open.length)
      return openDelim === open
    })
    if (!foundDelims) {
      return false
    }
    const open = foundDelims[0]
    const close = foundDelims[1]
    if (silent) {
      return false
    } // Don’t run any pairs in validation mode

    res = scanDelims(state, start, open.length)
    startCount = res.delims

    if (!res.can_open && name === 'math_inline') {
      state.pos += startCount
      // Earlier we checked !silent, but this implementation does not need it
      state.pending += state.src.slice(start, state.pos)
      return true
    }

    state.pos = start + open.length

    while (state.pos < max) {
      closeDelim = state.src.slice(state.pos, state.pos + close.length)
      if (closeDelim === close) {
        res = scanDelims(state, state.pos, close.length)
        if (res.can_close || name !== 'math_inline') {
          found = true
          break
        }
      }
      // skip braces and escapes
      let nesting = 0
      while (state.pos < max) {
        switch (state.src.charCodeAt(state.pos)) {
          case 0x7b /*{*/:
            state.pos++
            nesting++
            break
          case 0x7d /*}*/:
            state.pos++
            nesting--
            break
          case 0x5c /*\*/:
            state.pos += 2
            break
          default:
            state.pos++
            break
        }
        if (nesting <= 0) break
      }
    }

    if (state.pos - start - open.length === 0 || !found) {
      // Parser failed to find ending tag, or contents are empty,
      // so it is not a valid math
      state.pos = start
      return false
    }

    // Found!
    state.posMax = state.pos
    state.pos = start + close.length

    // Earlier we checked !silent, but this implementation does not need it
    token = state.push(name, 'math', 0)
    token.meta = { rawContent: state.src.slice(state.pos, state.posMax) }
    token.markup = open

    state.pos = state.posMax + close.length
    state.posMax = max

    return true
  }
}

function makeMath_block(delims: [[string, string]]): RuleBlock {
  return function math_block(state, startLine, endLine, silent) {
    let len
    let nextLine
    let token
    let firstLine: string
    let lastLine
    let lastLinePos
    let closeDelim
    let haveEndMarker = false
    let closeStartsAtNewline = false
    let pos: number = state.bMarks[startLine] + state.tShift[startLine]
    let max: number = state.eMarks[startLine]

    const foundDelims = delims.find(function (i) {
      const open = i[0]
      const openDelim = state.src.slice(pos, pos + open.length)
      return openDelim === open
    })
    if (!foundDelims) {
      return false
    }
    const open = foundDelims[0]
    let close = foundDelims[1]

    if (close[0] === '\n') {
      closeStartsAtNewline = true
      close = close.slice(1)
    }

    if (pos + open.length > max + 1) {
      return false
    }

    pos += open.length
    firstLine = state.src.slice(pos, max)

    // Since start is found, we can report success here in validation mode
    if (silent) {
      return true
    }

    if (firstLine.trim().slice(-close.length) === close) {
      // Single line expression
      firstLine = firstLine.trim().slice(0, -close.length)
      haveEndMarker = true
    }

    // search end of block
    nextLine = startLine

    for (;;) {
      if (haveEndMarker) {
        break
      }

      nextLine++

      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break
      }

      pos = state.bMarks[nextLine] + state.tShift[nextLine]
      max = state.eMarks[nextLine]

      if (pos < max && state.tShift[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        break
      }

      closeDelim = closeStartsAtNewline
        ? state.src.slice(pos, max).trim()
        : state.src.slice(pos, max).trim().slice(-close.length)

      if (closeDelim !== close) {
        continue
      }

      if (state.tShift[nextLine] - state.blkIndent >= 4) {
        // closing block math should be indented less then 4 spaces
        continue
      }

      lastLinePos = state.src.slice(0, max).lastIndexOf(close)
      lastLine = state.src.slice(pos, lastLinePos)

      pos += lastLine.length + close.length

      // make sure tail has spaces only
      pos = state.skipSpaces(pos)

      if (pos < max) {
        continue
      }

      // found!
      haveEndMarker = true
    }

    // If math block has heading spaces, they should be removed from its inner block
    len = state.tShift[startLine]

    state.line = nextLine + (haveEndMarker ? 1 : 0)

    token = state.push('math_block', 'math', 0)
    token.block = true
    token.meta = {
      rawContent:
        (firstLine && firstLine.trim() ? firstLine + '\n' : '') +
        state.getLines(startLine + 1, nextLine, len, true) +
        (lastLine && lastLine.trim() ? lastLine : ''),
    }
    token.map = [startLine, state.line]
    token.markup = open

    return true
  }
}

export interface RenderingOptions {
  display?: 'block'
}

export interface MathMeta {
  rawContent: string
}

function makeMathRenderer(renderingOptions: RenderingOptions = {}) {
  return renderingOptions.display === 'block'
    ? function (tokens: Token[], idx: number) {
        return (
          '<div class="math block">' +
          (tokens[idx].meta as MathMeta).rawContent +
          '</div>\n'
        )
      }
    : function (tokens: Token[], idx: number) {
        return (
          '<span class="math inline">' +
          (tokens[idx].meta as MathMeta).rawContent +
          '</span>'
        )
      }
}

export interface PluginOptions {
  inlineDelim?: [[string, string]]
  blockDelim?: [[string, string]]
  inlineRenderer?: (tok: Token, md: mdIt) => string
  blockRenderer?: (tok: Token, md: mdIt) => string
  renderingOptions?: RenderingOptions
  parseDisplayMathInline?: boolean
}

export function math_plugin(md: mdIt, options: PluginOptions = {}) {
  // Default options
  const inlineDelim = options.inlineDelim || [['$$', '$$']]
  const blockDelim = options.blockDelim || [['$$$', '$$$']]
  const oInlineRenderer = options.inlineRenderer
  const oBlockRenderer = options.blockRenderer
  const inlineRenderer = oInlineRenderer
    ? function (tokens: Token[], idx: number) {
        return oInlineRenderer(tokens[idx], md)
      }
    : makeMathRenderer(options.renderingOptions)
  const blockRenderer = oBlockRenderer
    ? function (tokens: Token[], idx: number) {
        return oBlockRenderer(tokens[idx], md) + '\n'
      }
    : makeMathRenderer(
        Object.assign({ display: 'block' }, options.renderingOptions),
      )

  md.inline.ruler.before(
    'escape',
    'math_inline',
    makeMath_inline('math_inline', inlineDelim),
  )

  if (options.parseDisplayMathInline) {
    md.inline.ruler.before(
      'math_inline',
      'math_block',
      makeMath_inline('math_block', blockDelim),
    )
  } else {
    md.block.ruler.after(
      'blockquote',
      'math_block',
      makeMath_block(blockDelim),
      {
        alt: ['paragraph', 'reference', 'blockquote', 'list'],
      },
    )
  }
  md.renderer.rules.math_inline = inlineRenderer
  md.renderer.rules.math_block = blockRenderer
}
