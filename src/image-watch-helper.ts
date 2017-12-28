import fs = require('fs-plus')
import _ = require('lodash')
import path = require('path')
import { isMarkdownPreviewView } from './cast'
const pathWatcherPath = path.join(
  atom.packages.resourcePath,
  '/node_modules/pathwatcher/lib/main',
)
// tslint:disable-next-line:no-var-requires
const pathWatcher = require(pathWatcherPath)

// TODO: Fixme
// tslint:disable: no-unsafe-any

let imageRegister: { [key: string]: {
  version: number
  watcher: any
  files: string[]
  watched: boolean
  path: string
} | undefined } = {}

const refreshImages = _.debounce(function(src: string) {
  for (const item of atom.workspace.getPaneItems()) {
    if (isMarkdownPreviewView(item)) {
      // TODO: check against imageRegister[src].version.files
      item.refreshImages(src)
    }
  }
}, 250)

function srcClosure(src: string) {
  return function(event: string, _path: string) {
    const i = imageRegister[src]
    if (!i) return
    if (event === 'change' && fs.isFileSync(src)) {
      i.version = Date.now()
    } else {
      i.watcher.close()
      delete imageRegister[src]
    }
    refreshImages(src)
  }
}

export function removeFile(file: string) {
  imageRegister = _.mapValues(imageRegister, function(image) {
    if (!image) return image
    image.files = _.without(image.files, file)
    image.files = _.filter(image.files, fs.isFileSync)
    if (_.isEmpty(image.files)) {
      image.watched = false
      image.watcher.close()
    }
    return image
  })
}

export function getVersion(image: string, file?: string) {
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
        watcher: pathWatcher.watch(image, srcClosure(image)),
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
