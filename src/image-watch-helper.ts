import fs = require('fs-plus')
import _ = require('lodash')
import { isMarkdownPreviewView } from './cast'
// import { watchPath, FilesystemChangeEvent, PathWatcher } from 'atom'

declare module 'pathwatcher' {
  export function watch(
    filename: string,
    listener?: (event: TEvent, path: string) => void,
  ): PathWatcher
  export type TEvent = 'rename' | 'delete' | 'change'
}
import path = require('path')
const pathWatcherPath = path.join(
  atom.packages.resourcePath,
  '/node_modules/pathwatcher/lib/main',
)
import _unused = require('pathwatcher')
// tslint:disable-next-line:no-var-requires
const { watch } = require(pathWatcherPath) as typeof _unused
import PathWatcher = _unused.PathWatcher
import TEvent = _unused.TEvent

interface ImageRegisterRec {
  version: number
  watcher: PathWatcher
  files: string[]
  watched: boolean
  path: string
}

let imageRegister: {
  [key: string]: ImageRegisterRec | undefined
} = {}

const refreshImages = _.debounce(async function(src: string) {
  for (const item of atom.workspace.getPaneItems()) {
    if (isMarkdownPreviewView(item)) {
      // TODO: check against imageRegister[src].version.files
      await item.refreshImages(src)
    }
  }
}, 250)

function srcClosure(src: string) {
  // return function(events: FilesystemChangeEvent) {
  return function(event: TEvent) {
    // for (const event of events) {
    const i = imageRegister[src]
    if (!i) return
    if (event === 'change' && fs.isFileSync(src)) {
      i.version = Date.now()
    } else {
      // i.watcher.dispose()
      i.watcher.close()
      delete imageRegister[src]
    }
    // tslint:disable-next-line: no-floating-promises
    refreshImages(src)
    // }
  }
}

export function removeFile(file: string) {
  imageRegister = _.mapValues(imageRegister, function(image) {
    if (!image) return image
    image.files = _.without(image.files, file)
    image.files = _.filter(image.files, fs.isFileSync)
    if (_.isEmpty(image.files)) {
      image.watched = false
      // image.watcher.dispose()
      image.watcher.close()
    }
    return image
  })
}

export async function getVersion(image: string, file?: string) {
  let version
  const i = imageRegister[image]
  if (!i) {
    if (fs.isFileSync(image)) {
      version = Date.now()
      imageRegister[image] = {
        path: image,
        watched: true,
        files: file ? [file] : [],
        version,
        // watcher: await watchPath(image, {}, srcClosure(image)),
        watcher: watch(image, srcClosure(image)),
      }
      return version
    } else {
      return false
    }
  }

  const files: string[] = i.files
  if (file && !_.includes(files, file)) {
    i.files.push(file)
  }

  version = i.version
  if (!version && fs.isFileSync(image)) {
    version = Date.now()
    i.version = version
  }
  return version
}
