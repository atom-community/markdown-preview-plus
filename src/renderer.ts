import * as path from 'path'
import * as pandocHelper from './pandoc-helper'
import { MarkdownItWorker } from './markdown-it-helper'
import { Grammar } from 'atom'
import { isFileSync, atomConfig, packagePath } from './util'
import { getMedia } from './util-common'
import { ImageWatcher } from './image-watch-helper'
import { highlightCodeBlocks } from './highlighter'

const { resourcePath } = atom.getLoadSettings()

export type RenderMode = 'normal' | 'copy' | 'save'

export interface CommonRenderOptions<T extends RenderMode> {
  text: string
  filePath: string | undefined
  grammar?: Grammar
  renderLaTeX: boolean
  renderErrors: boolean
  mode: T
}

export type RenderOptions =
  | (CommonRenderOptions<'normal'> & { imageWatcher?: ImageWatcher })
  | (CommonRenderOptions<'save'> & { savePath: string })
  | CommonRenderOptions<'copy'>

export async function render(options: RenderOptions): Promise<HTMLDocument> {
  // Remove the <!doctype> since otherwise marked will escape it
  // https://github.com/chjj/marked/issues/354
  const text = options.text.replace(/^\s*<!doctype(\s+.*)?>\s*/i, '')

  let html
  let error
  if (atomConfig().renderer === 'pandoc') {
    try {
      html = await pandocHelper.renderPandoc(
        text,
        options.filePath,
        options.renderLaTeX,
        options.renderErrors,
      )
    } catch (err) {
      const e = err as Error & { html?: string }
      if (e.html === undefined) throw e
      error = e.message as string
      html = e.html as string
    }
  } else {
    html = await MarkdownItWorker.render(text, options.renderLaTeX)
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  sanitize(doc)
  if (options.mode === 'normal') {
    if (options.imageWatcher) options.imageWatcher.track()
    resolveImagePaths(
      doc,
      options.filePath,
      false,
      undefined,
      options.imageWatcher,
    )
    if (options.imageWatcher) options.imageWatcher.untrack()
  } else {
    switch (options.mode) {
      case 'save':
        handleImages({
          doc,
          filePath: options.filePath,
          savePath: options.savePath,
          behaviour: atomConfig().saveConfig.mediaOnSaveAsHTMLBehaviour,
        })
        break
      case 'copy':
        handleImages({
          doc,
          filePath: options.filePath,
          behaviour: atomConfig().saveConfig.mediaOnCopyAsHTMLBehaviour,
        })
        break
      default:
        throw invalidMode(options)
    }
  }
  let defaultCodeLanguage: string = 'text'
  // Default code blocks to be coffee in Literate CoffeeScript files
  if ((options.grammar && options.grammar.scopeName) === 'source.litcoffee') {
    defaultCodeLanguage = 'coffee'
  }
  if (
    !(
      atomConfig().renderer === 'pandoc' &&
      atomConfig().pandocConfig.useNativePandocCodeStyles
    )
  ) {
    await highlightCodeBlocks(doc, defaultCodeLanguage)
  }
  if (error) {
    const errd = doc.createElement('div')
    const msgel = doc.createElement('code')
    msgel.innerText = error
    errd.innerHTML = `<h1>Pandoc Error:</h1>${msgel.outerHTML}<hr>`
    doc.body.insertBefore(errd, doc.body.firstElementChild)
  }
  return doc
}

function invalidMode(mode: never) {
  return new Error(`Invalid render mode ${JSON.stringify(mode)}`)
}

function sanitize(doc: HTMLDocument) {
  // Do not remove MathJax script delimited blocks
  doc.querySelectorAll("script:not([type^='math/tex'])").forEach((elem) => {
    elem.remove()
  })
  const attributesToRemove = [
    'onabort',
    'onblur',
    'onchange',
    'onclick',
    'ondbclick',
    'onerror',
    'onfocus',
    'onkeydown',
    'onkeypress',
    'onkeyup',
    'onload',
    'onmousedown',
    'onmousemove',
    'onmouseover',
    'onmouseout',
    'onmouseup',
    'onreset',
    'onresize',
    'onscroll',
    'onselect',
    'onsubmit',
    'onunload',
  ]
  doc.querySelectorAll('*').forEach((elem) =>
    attributesToRemove.map((attribute) => {
      elem.removeAttribute(attribute)
    }),
  )
}

function handleImages(opts: {
  behaviour: 'relativized' | 'absolutized' | 'untouched'
  doc: HTMLDocument
  filePath?: string
  savePath?: string
}) {
  const relativize = opts.behaviour === 'relativized'
  switch (opts.behaviour) {
    case 'relativized':
    case 'absolutized':
      resolveImagePaths(opts.doc, opts.filePath, relativize, opts.savePath)
      break
    case 'untouched':
    /* noop */
  }
}

function resolveImagePaths(
  doc: HTMLDocument,
  filePath: string | undefined,
  relativize: boolean,
  savePath?: string,
  imageWatcher?: ImageWatcher,
) {
  const [rootDirectory] = atom.project.relativizePath(filePath || '')
  const media = getMedia(doc)
  Array.from(media).map(function (img) {
    let attrName: 'href' | 'src'
    if (img.tagName === 'LINK') attrName = 'href'
    else attrName = 'src'
    let src = img.getAttribute(attrName)
    if (src) {
      if (atomConfig().renderer !== 'pandoc') {
        src = decodeURI(src)
      }

      if (src.match(/^(https?|atom|data):/)) {
        return
      }
      if (process.resourcesPath && src.startsWith(process.resourcesPath)) {
        return
      }
      if (src.startsWith(resourcePath)) {
        return
      }
      if (src.startsWith(packagePath())) {
        return
      }

      if (src[0] === '/') {
        if (!isFileSync(src)) {
          try {
            if (rootDirectory !== null) {
              src = path.join(rootDirectory, src.substring(1))
            }
          } catch (e) {
            // noop
          }
        }
      } else if (filePath) {
        src = path.resolve(path.dirname(filePath), src)
      }

      if (relativize && (filePath !== undefined || savePath !== undefined)) {
        const fp = savePath !== undefined ? savePath : filePath!
        src = path.relative(path.dirname(fp), src)
      }

      // Watch image for changes
      if (imageWatcher) {
        const v = imageWatcher.watch(src)
        if (v !== undefined) src = `${src}?v=${v}`
      }

      img[attrName] = src
    }
  })
}
