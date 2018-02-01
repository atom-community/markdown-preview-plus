import _ = require('lodash')
import { isMarkdownPreviewView } from './cast'
import { CompositeDisposable, File } from 'atom'
import { handlePromise, isFileSync } from './util'

interface ImageRegisterRec {
  version: number
  watcher: CompositeDisposable
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

function srcClosure(src: string, event: 'change' | 'delete' | 'rename') {
  return function() {
    const i = imageRegister[src]
    if (!i) return
    if (event === 'change' && isFileSync(src)) {
      i.version = Date.now()
    } else {
      i.watcher.dispose()
      delete imageRegister[src]
    }
    handlePromise(refreshImages(src))
  }
}

export function removeFile(file: string) {
  imageRegister = _.mapValues(imageRegister, function(image) {
    if (!image) return image
    image.files = _.without(image.files, file)
    image.files = _.filter(image.files, isFileSync)
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
    if (isFileSync(image)) {
      version = Date.now()
      const watcher = new CompositeDisposable()
      const af = new File(image)
      watcher.add(
        af.onDidChange(srcClosure(image, 'change')),
        af.onDidDelete(srcClosure(image, 'delete')),
        af.onDidRename(srcClosure(image, 'rename')),
      )
      imageRegister[image] = {
        path: image,
        watched: true,
        files: file ? [file] : [],
        version,
        watcher,
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
  if (!version && isFileSync(image)) {
    version = Date.now()
    i.version = version
  }
  return version
}
