// @ts-ignore
declare namespace NodeJS {
  interface Process {
    type: string
  }
}

import * as electron from 'electron'

// Using clipboard in renderer process is not safe on Linux.
const clipboard =
  process.platform === 'linux' && process.type === 'renderer'
    ? electron.remote.clipboard
    : electron.clipboard

// Proxy for easy stubbing
export = {
  write: function(arg: electron.Data) {
    return clipboard.write(arg)
  },
}
