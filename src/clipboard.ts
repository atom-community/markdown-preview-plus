import * as electron from 'electron'

// Using clipboard in renderer process is not safe on Linux.
const clipboard =
  process.platform === 'linux' && process.type === 'renderer'
    ? electron.remote.clipboard
    : electron.clipboard

export function write(arg: electron.Data) {
  return clipboard.write(arg)
}
