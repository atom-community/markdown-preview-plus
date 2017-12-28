import fs = require('fs-plus')
import _ = require('lodash')
import { isMarkdownPreviewView } from './cast'
import { watchPath, FilesystemChangeEvent, PathWatcher } from 'atom'

// TODO: Fixme
// tslint:disable: no-unsafe-any

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
  return function(events: FilesystemChangeEvent) {
    for (const event of events) {
      const i = imageRegister[src]
      if (!i) return
      if (event.action === 'modified' && fs.isFileSync(src)) {
        i.version = Date.now()
      } else {
        i.watcher.dispose()
        delete imageRegister[src]
      }
      // tslint:disable-next-line: no-floating-promises
      refreshImages(src)
    }
  }
}

export function removeFile(file: string) {
  imageRegister = _.mapValues(imageRegister, function(image) {
    if (!image) return image
    image.files = _.without(image.files, file)
    image.files = _.filter(image.files, fs.isFileSync)
    if (_.isEmpty(image.files)) {
      image.watched = false
      image.watcher.dispose()
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
        watcher: await watchPath(image, {}, srcClosure(image)),
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
