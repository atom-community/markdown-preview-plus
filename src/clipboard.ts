import * as electron from 'electron'

// Using clipboard in renderer process is not safe on Linux.
const clipboard =
  process.platform === 'linux' && process.type === 'renderer'
    ? electron.remote.clipboard
    : electron.clipboard

export function write(arg: electron.Data) {
  if (window['markdown-preview-plus-tests']?.clipboardWrite) {
    return window['markdown-preview-plus-tests'].clipboardWrite(arg)
  } else {
    return clipboard.write(arg)
  }
}

export function writePlain(arg: string) {
  if (window['markdown-preview-plus-tests']?.clipboardWrite) {
    return window['markdown-preview-plus-tests'].clipboardWrite(arg)
  } else {
    return atom.clipboard.write(arg)
  }
}
