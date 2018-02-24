import path = require('path')
import highlight = require('atom-highlight')
import pandocHelper = require('./pandoc-helper')
import markdownIt = require('./markdown-it-helper') // Defer until used
import { scopeForFenceName } from './extension-helper'
import imageWatcher = require('./image-watch-helper')
import { Grammar } from 'atom'
import { isFileSync } from './util'

const { resourcePath } = atom.getLoadSettings()
const packagePath = path.dirname(__dirname)

export async function toHTML(
  text: string | null,
  filePath: string | undefined,
  grammar: Grammar | undefined,
  renderLaTeX: boolean,
  copyHTMLFlag: boolean,
) {
  if (text === null) {
    text = ''
  }
  const doc = await render(text, filePath, renderLaTeX, copyHTMLFlag)
  let defaultCodeLanguage: string | undefined
  // Default code blocks to be coffee in Literate CoffeeScript files
  if ((grammar && grammar.scopeName) === 'source.litcoffee') {
    defaultCodeLanguage = 'coffee'
  }
  if (
    !atom.config.get('markdown-preview-plus.enablePandoc') ||
    !atom.config.get('markdown-preview-plus.useNativePandocCodeStyles')
  ) {
    tokenizeCodeBlocks(doc, defaultCodeLanguage)
  }
  return {
    head: doc.head.innerHTML,
    body: doc.body.innerHTML,
  }
}

export async function render(
  text: string,
  filePath: string | undefined,
  renderLaTeX: boolean,
  copyHTMLFlag: boolean,
): Promise<HTMLDocument> {
  // Remove the <!doctype> since otherwise marked will escape it
  // https://github.com/chjj/marked/issues/354
  text = text.replace(/^\s*<!doctype(\s+.*)?>\s*/i, '')

  let html
  let error
  if (atom.config.get('markdown-preview-plus.enablePandoc')) {
    try {
      html = await pandocHelper.renderPandoc(text, filePath, renderLaTeX)
    } catch (err) {
      // tslint:disable:no-unsafe-any
      if (err.html === undefined) throw err
      error = err.message as string
      html = err.html as string
      // tslint:enable:no-unsafe-any
    }
  } else {
    html = markdownIt.render(text, renderLaTeX)
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  sanitize(doc)
  await resolveImagePaths(doc, filePath, copyHTMLFlag)
  if (error) {
    const errd = doc.createElement('div')
    const msgel = doc.createElement('code')
    msgel.innerText = error
    errd.innerHTML = `<h1>Pandoc Error:</h1>${msgel.outerHTML}<hr>`
    doc.body.insertBefore(errd, doc.body.firstElementChild)
  }
  return doc
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

async function resolveImagePaths(
  doc: HTMLDocument,
  filePath: string | undefined,
  copyHTMLFlag: boolean,
) {
  const [rootDirectory] = atom.project.relativizePath(filePath || '')
  await Promise.all(
    Array.from(doc.querySelectorAll('img')).map(async function(img) {
      let src = img.getAttribute('src')
      if (src) {
        if (!atom.config.get('markdown-preview-plus.enablePandoc')) {
          src = markdownIt.decode(src)
        }

        if (src.match(/^(https?|atom|data):/)) {
          return
        }
        // @ts-ignore
        if (src.startsWith(process.resourcesPath as string)) {
          return
        }
        if (src.startsWith(resourcePath)) {
          return
        }
        if (src.startsWith(packagePath)) {
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

        // Use most recent version of image
        if (!copyHTMLFlag) {
          const v = await imageWatcher.getVersion(src, filePath)
          if (v) {
            src = `${src}?v=${v}`
          }
        }

        img.src = src
      }
      return
    }),
  )
}

export function highlightCodeBlocks(
  domFragment: Element,
  defaultLanguage: string = 'text',
) {
  const fontFamily = atom.config.get('editor.fontFamily')
  if (fontFamily) {
    for (const codeElement of Array.from(
      domFragment.querySelectorAll('code'),
    )) {
      codeElement.style.fontFamily = fontFamily
    }
  }

  for (const preElement of Array.from(domFragment.querySelectorAll('pre'))) {
    const codeBlock =
      preElement.firstElementChild !== null
        ? preElement.firstElementChild
        : preElement
    const cbClass = codeBlock.className
    const fenceName = cbClass
      ? cbClass.replace(/^(lang-|sourceCode )/, '')
      : defaultLanguage

    // tslint:disable-next-line:no-unsafe-any
    preElement.outerHTML = highlight({
      fileContents: codeBlock.textContent!.replace(/\n$/, ''),
      scopeName: scopeForFenceName(fenceName),
      nbsp: false,
      lineDivs: true,
      editorDiv: true,
      editorDivTag: 'atom-text-editor',
      // The `editor` class messes things up as `.editor` has absolutely positioned lines
      editorDivClass: fenceName ? `lang-${fenceName}` : '',
    })
  }

  return domFragment
}

function tokenizeCodeBlocks(
  doc: HTMLDocument,
  defaultLanguage: string = 'text',
) {
  const fontFamily = atom.config.get('editor.fontFamily')
  if (fontFamily) {
    doc
      .querySelectorAll('code')
      .forEach((code) => (code.style.fontFamily = fontFamily || null))
  }

  doc.querySelectorAll('pre').forEach(function(preElement) {
    const codeBlock = preElement.firstElementChild as HTMLElement
    const fenceName =
      codeBlock.className.replace(/^(lang-|sourceCode )/, '') || defaultLanguage

    // tslint:disable-next-line:no-unsafe-any // TODO: tslint bug?
    const highlightedHtml: string = highlight({
      fileContents: codeBlock.innerText,
      scopeName: scopeForFenceName(fenceName),
      nbsp: false,
      lineDivs: false,
      editorDiv: true,
      editorDivTag: 'pre',
      // The `editor` class messes things up as `.editor` has absolutely positioned lines
      editorDivClass: fenceName
        ? `editor-colors lang-${fenceName}`
        : 'editor-colors',
    })

    preElement.outerHTML = highlightedHtml
  })
}
