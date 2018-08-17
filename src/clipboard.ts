// @ts-ignore
declare namespace NodeJS {
  interface Process {
    type: string
  }
}

import * as electron from 'electron'

// Using clipboard in renderer process is not safe on Linux.
export = process.platform === 'linux' && process.type === 'renderer'
  ? electron.remote.clipboard
  : electron.clipboard
