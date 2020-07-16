import { table } from './table'

export function makeTable(options: Options) {
  const openDelims = options.inlineDelim.map((i) => i[0])
  const closeDelims = options.inlineDelim.map((i) => i[1])
  return table.bind(null, openDelims, closeDelims)
}

export interface Options {
  inlineDelim: [[string, string]]
}
