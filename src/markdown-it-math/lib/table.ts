// markdown-it-math@4802439:lib/rules_block/table.js
// GFM table, non-standard
// tslint:disable:no-unsafe-any

function getLine(state: any, line: number) {
  const pos = state.bMarks[line] + state.blkIndent
  const max = state.eMarks[line]

  return state.src.substr(pos, max - pos)
}

/**
 * Parse a table row for columns/cells
 *
 * @param string str
 *   The table row to parse for columns.
 * @param  array of string openDelims
 *   The opening delimiter sequences for inlines that prevents any contained
 *   pipes from delimiting columns of the parent table block.
 * @param  array of string closeDelims
 *   The closing delimiter sequence for an inline that prevents any containing
 *   pipes from delimiting columns of the parent table block.
 * @return array of string
 *   The unparsed content of the cells/columns identified in str returned as
 *   individual elements of an array. The content is still to be parsed by the
 *   inline rules.
 */
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
  let lastDelim = 0
  let delimed = false
  let delimMaskMap
  let openDelimIdx = -1
  let closeDelimIdx = -1

  ch = str.charCodeAt(pos)

  // Def map for matching open/close delimiter sequence with str@pos
  delimMaskMap = function(e: string) {
    return str.substring(pos, pos + e.length) === e
  }

  while (pos < max) {
    // Determine ID of first matching open/close delimiter sequence
    openDelimIdx = openDelims.map(delimMaskMap).indexOf(true)
    closeDelimIdx = closeDelims.map(delimMaskMap).indexOf(true)

    // Does str@pos match any opening delimiter?
    if (openDelimIdx > -1 && escapes % 2 === 0 && !delimed) {
      delimed = !delimed
      lastDelim = pos + openDelims[openDelimIdx].length - 1
      pos += openDelims[openDelimIdx].length - 1
      // Does str@pos match any closing delimiter?
    } else if (closeDelimIdx > -1 && escapes % 2 === 0 && delimed) {
      delimed = !delimed
      lastDelim = pos + closeDelims[closeDelimIdx].length - 1
      pos += closeDelims[closeDelimIdx].length - 1
    } else if (ch === 0x7c /* | */ && escapes % 2 === 0 && !delimed) {
      result.push(str.substring(lastPos, pos))
      lastPos = pos + 1
    } else if (ch === 0x5c /* \ */) {
      escapes++
    } else {
      escapes = 0
    }

    pos++

    // If there was an un-closed delimiter sequence, go back to just after
    // the last delimiter sequence, but as if it was a normal character
    if (pos === max && delimed) {
      delimed = false
      pos = lastDelim + 1
    }

    ch = str.charCodeAt(pos)
  }

  result.push(str.substring(lastPos))

  return result
}

/**
 * A table plock parser with restrictions on pipe placement
 *
 * Partially poulated docstring describing parameters added to
 * `markdown-it-math@4802439:lib/rules_block/table.js`.
 *
 * @param  array of string openDelims
 *   The opening delimiter sequences for inlines that prevents any contained
 *   pipes from delimiting columns of the parent table block.
 * @param  array of string closeDelims
 *   The closing delimiter sequence for an inline that prevents any containing
 *   pipes from delimiting columns of the parent table block.
 */
function table(
  openDelims: string[],
  closeDelims: string[],
  state: any,
  startLine: number,
  endLine: number,
  silent: boolean,
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

  // should have at least three lines
  if (startLine + 2 > endLine) {
    return false
  }

  nextLine = startLine + 1

  if (state.sCount[nextLine] < state.blkIndent) {
    return false
  }

  // first character of the second line should be '|' or '-'

  pos = state.bMarks[nextLine] + state.tShift[nextLine]
  if (pos >= state.eMarks[nextLine]) {
    return false
  }

  ch = state.src.charCodeAt(pos)
  if (ch !== 0x7c /* | */ && ch !== 0x2d /* - */ && ch !== 0x3a /* : */) {
    return false
  }

  lineText = getLine(state, startLine + 1)
  if (!/^[-:| ]+$/.test(lineText)) {
    return false
  }

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
  token.map = tableLines = [startLine, 0]

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
  token.map = tbodyLines = [startLine + 2, 0]

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) {
      break
    }

    lineText = getLine(state, nextLine).trim()
    if (lineText.indexOf('|') === -1) {
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
  token = state.push('table_close', 'table', -1)

  tableLines[1] = tbodyLines[1] = nextLine
  state.line = nextLine
  return true
}

/**
 * Prepare a table plock parser with restrictions on pipe placement
 *
 * @param  string open
 *   The opening delimiter sequence for an inline that prevents any contained
 *   pipes from delimiting columns of the parent table block.
 * @param  string close
 *   The closing delimiter sequence for an inline that prevents any containing
 *   pipes from delimiting columns of the parent table block.
 * @return function
 *   The table block parser that should be used in place of the existing table
 *   block parser such that the specified inline by `open` and `close` is
 *   respected. The delimiters are added to existing list of delimiter pairs in
 *   `escapedSplitDelimiters` allowing `markdown-it-math` to be `use`'d multiple
 *   times leading to multiple inline delimiters.
 */
export function makeTable(options: Options) {
  const openDelims = options.inlineDelim.map((i) => i[0])
  const closeDelims = options.inlineDelim.map((i) => i[1])

  openDelims.unshift('`')
  closeDelims.unshift('`')

  return table.bind(null, openDelims, closeDelims)
}

export interface Options {
  inlineDelim: [[string, string]]
  blockDelim: [[string, string]]
}
