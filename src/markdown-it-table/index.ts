/// from markdown-it/lib/rules_block/table.js@d29f421927e93e88daf75f22089a3e732e195bd2
// GFM table, non-standard

import StateBlock from 'markdown-it/lib/rules_block/state_block'
import { Nesting } from 'markdown-it/lib/token'
import MarkdownIt from 'markdown-it'

function getLine(state: StateBlock, line: number) {
  const pos = state.bMarks[line] + state.blkIndent
  const max = state.eMarks[line]

  return state.src.substr(pos, max - pos)
}

function escapedSplit(
  str: string,
  openDelims: string[],
  closeDelims: string[],
) {
  const result = []
  let pos = 0
  const max = str.length
  let ch
  let escapes = 0
  let lastPos = 0
  let backTicked = false
  let lastBackTick = 0
  let lastDelim = 0
  let delimed = -1
  let openDelimIdx = -1
  let closeDelimIdx = -1

  ch = str.charCodeAt(pos)

  // Def map for matching open/close delimiter sequence with str@pos
  function delimMaskMap(e: string) {
    return str.substring(pos, pos + e.length) === e
  }

  while (pos < max) {
    openDelimIdx = openDelims.map(delimMaskMap).indexOf(true)
    closeDelimIdx = closeDelims.map(delimMaskMap).indexOf(true)

    if (!backTicked) {
      if (openDelimIdx > -1 && escapes % 2 === 0 && delimed === -1) {
        delimed = openDelimIdx
        lastDelim = pos + openDelims[openDelimIdx].length - 1
        pos += openDelims[openDelimIdx].length - 1
      } else if (
        closeDelimIdx > -1 &&
        escapes % 2 === 0 &&
        delimed === closeDelimIdx
      ) {
        delimed = -1
        lastDelim = pos + closeDelims[closeDelimIdx].length - 1
        pos += closeDelims[closeDelimIdx].length - 1
      }
    }
    if (ch === 0x60 /* ` */) {
      if (backTicked) {
        // make \` close code sequence, but not open it;
        // the reason is: `\` is correct code block
        backTicked = false
        lastBackTick = pos
      } else if (escapes % 2 === 0) {
        backTicked = true
        lastBackTick = pos
      }
    } else if (
      ch === 0x7c /* | */ &&
      escapes % 2 === 0 &&
      delimed === -1 &&
      !backTicked
    ) {
      result.push(str.substring(lastPos, pos))
      lastPos = pos + 1
    }

    if (ch === 0x5c /* \ */) {
      escapes++
    } else {
      escapes = 0
    }

    pos++

    // If there was an un-closed delimiter sequence, go back to just after
    // the last delimiter sequence, but as if it was a normal character
    if (pos === max && delimed > -1) {
      delimed = -1
      pos = lastDelim + 1
    }
    // If there was an un-closed backtick, go back to just after
    // the last backtick, but as if it was a normal character
    if (pos === max && backTicked) {
      backTicked = false
      pos = lastBackTick + 1
    }

    ch = str.charCodeAt(pos)
  }

  result.push(str.substring(lastPos))

  return result
}

function table(
  openDelims: string[],
  closeDelims: string[],
  caption: boolean,
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: any,
) {
  let ch
  let lineText
  let pos
  let i
  let nextLine
  let columns
  let columnCount
  let token
  let aligns
  let t
  let tableLines
  let tbodyLines
  let captionParsed: ReturnType<typeof parse_caption> | undefined

  // should have at least two lines
  if (startLine + 2 > endLine) {
    return false
  }

  if (caption) {
    captionParsed = parse_caption(state, startLine)
    if (captionParsed) {
      startLine = captionParsed.nextLine
    }
  }
  nextLine = startLine + 1

  if (state.sCount[nextLine] < state.blkIndent) {
    return false
  }

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[nextLine] - state.blkIndent >= 4) {
    return false
  }

  // first character of the second line should be '|', '-', ':',
  // and no other characters are allowed but spaces;
  // basically, this is the equivalent of /^[-:|][-:|\s]*$/ regexp

  pos = state.bMarks[nextLine] + state.tShift[nextLine]
  if (pos >= state.eMarks[nextLine]) {
    return false
  }

  ch = state.src.charCodeAt(pos++)
  if (ch !== 0x7c /* | */ && ch !== 0x2d /* - */ && ch !== 0x3a /* : */) {
    return false
  }

  while (pos < state.eMarks[nextLine]) {
    ch = state.src.charCodeAt(pos)

    if (
      ch !== 0x7c /* | */ &&
      ch !== 0x2d /* - */ &&
      ch !== 0x3a /* : */ &&
      !state.md.utils.isSpace(ch)
    ) {
      return false
    }

    pos++
  }

  lineText = getLine(state, startLine + 1)

  columns = lineText.split('|')
  aligns = []
  for (i = 0; i < columns.length; i++) {
    t = columns[i].trim()
    if (!t) {
      // allow empty columns before and after table, but not in between columns;
      // e.g. allow ` |---| `, disallow ` ---||--- `
      if (i === 0 || i === columns.length - 1) {
        continue
      } else {
        return false
      }
    }

    if (!/^:?-+:?$/.test(t)) {
      return false
    }
    if (t.charCodeAt(t.length - 1) === 0x3a /* : */) {
      aligns.push(t.charCodeAt(0) === 0x3a /* : */ ? 'center' : 'right')
    } else if (t.charCodeAt(0) === 0x3a /* : */) {
      aligns.push('left')
    } else {
      aligns.push('')
    }
  }

  lineText = getLine(state, startLine).trim()
  if (lineText.indexOf('|') === -1) {
    return false
  }
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false
  }
  columns = escapedSplit(
    lineText.replace(/^\||\|$/g, ''),
    openDelims,
    closeDelims,
  )

  // header row will define an amount of columns in the entire table,
  // and align row shouldn't be smaller than that (the rest of the rows can)
  columnCount = columns.length
  if (columnCount > aligns.length) {
    return false
  }

  if (silent) {
    return true
  }

  token = state.push('table_open', 'table', 1)
  token.map = [startLine, 0]
  tableLines = token.map

  token = state.push('thead_open', 'thead', 1)
  token.map = [startLine, startLine + 1]

  token = state.push('tr_open', 'tr', 1)
  token.map = [startLine, startLine + 1]

  for (i = 0; i < columns.length; i++) {
    token = state.push('th_open', 'th', 1)
    token.map = [startLine, startLine + 1]
    if (aligns[i]) {
      token.attrs = [['style', 'text-align:' + aligns[i]]]
    }

    token = state.push('inline', '', 0)
    token.content = columns[i].trim()
    token.map = [startLine, startLine + 1]
    token.children = []

    token = state.push('th_close', 'th', -1)
  }

  token = state.push('tr_close', 'tr', -1)
  token = state.push('thead_close', 'thead', -1)

  token = state.push('tbody_open', 'tbody', 1)
  token.map = [startLine + 2, 0]
  tbodyLines = token.map

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) {
      break
    }

    lineText = getLine(state, nextLine).trim()
    if (lineText.indexOf('|') === -1) {
      break
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      break
    }
    columns = escapedSplit(
      lineText.replace(/^\||\|$/g, ''),
      openDelims,
      closeDelims,
    )

    token = state.push('tr_open', 'tr', 1)
    for (i = 0; i < columnCount; i++) {
      token = state.push('td_open', 'td', 1)
      if (aligns[i]) {
        token.attrs = [['style', 'text-align:' + aligns[i]]]
      }

      token = state.push('inline', '', 0)
      token.content = columns[i] ? columns[i].trim() : ''
      token.children = []

      token = state.push('td_close', 'td', -1)
    }
    token = state.push('tr_close', 'tr', -1)
  }
  token = state.push('tbody_close', 'tbody', -1)

  if (caption) {
    if (!captionParsed) {
      captionParsed = parse_caption(state, nextLine)
      if (captionParsed) nextLine = captionParsed.nextLine
    }
    if (captionParsed) {
      pushTokens(state, captionParsed.tokens)
    }
  }

  token = state.push('table_close', 'table', -1)

  tableLines[1] = tbodyLines[1] = nextLine
  state.line = nextLine
  return true
}

interface TempToken {
  args: [string, string, Nesting]
  props: { [key: string]: any }
}

function parse_caption(
  state: StateBlock,
  startLine: number,
):
  | false
  | {
      nextLine: number
      tokens: TempToken[]
    } {
  let nextLine = startLine
  const pos = state.bMarks[nextLine] + state.tShift[nextLine]
  if (!state.src.slice(pos).match(/^\s*\w*:/)) return false
  let bpos = state.bMarks[nextLine] + state.tShift[nextLine]
  let epos = state.eMarks[nextLine]
  let line = state.src.slice(bpos, epos)
  while (line.match(/^\s*$/)) {
    nextLine++
    bpos = state.bMarks[nextLine] + state.tShift[nextLine]
    epos = state.eMarks[nextLine]
    line = state.src.slice(bpos, epos)
  }
  if (state.sCount[nextLine] - state.blkIndent >= 4) return false

  while (state.src.charCodeAt(bpos) !== 0x3a /*:*/) bpos++

  const inlinePos = bpos + 1
  const beginLine = nextLine
  let cepos
  while (!line.match(/^\s*$/)) {
    cepos = state.eMarks[nextLine]
    nextLine++
    bpos = state.bMarks[nextLine] + state.tShift[nextLine]
    epos = state.eMarks[nextLine]
    line = state.src.slice(bpos, epos)
  }
  const inlineEnd = cepos
  const endLine = nextLine - 1
  const tokens: TempToken[] = []
  tokens.push({
    args: ['caption_open', 'caption', 1],
    props: { map: [beginLine, endLine] },
  })
  tokens.push({
    args: ['inline', '', 0],
    props: {
      content: state.src.slice(inlinePos, inlineEnd),
      children: [],
    },
  })
  tokens.push({
    args: ['caption_close', 'caption', -1],
    props: {
      content: state.src.slice(inlinePos, inlineEnd),
      children: [],
    },
  })
  while (line.match(/^\s*$/)) {
    nextLine++
    bpos = state.bMarks[nextLine] + state.tShift[nextLine]
    epos = state.eMarks[nextLine]
    line = state.src.slice(bpos, epos)
  }
  return {
    nextLine,
    tokens,
  }
}

function pushTokens(
  state: StateBlock,
  tokens: Exclude<ReturnType<typeof parse_caption>, false>['tokens'],
) {
  for (const tok of tokens) {
    const token = state.push(...tok.args)
    for (const [k, v] of Object.entries(tok.props)) {
      token[k] = v as any
    }
  }
}

export function makeTable(md: MarkdownIt, options: Options = {}) {
  const openDelims = options?.inlineDelim
    ? options.inlineDelim.map((i) => i[0])
    : []
  const closeDelims = options?.inlineDelim
    ? options.inlineDelim.map((i) => i[1])
    : []
  const parser = table.bind(null, openDelims, closeDelims, !!options?.caption)

  md.block.ruler.at('table', parser, {
    alt: ['paragraph', 'reference'],
  })
}

export interface Options {
  inlineDelim?: [[string, string]]
  caption?: boolean
}
