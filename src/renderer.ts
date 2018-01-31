import path = require('path')
import highlight = require('atom-highlight')
import pandocHelper = require('./pandoc-helper')
import markdownIt = require('./markdown-it-helper') // Defer until used
import { scopeForFenceName } from './extension-helper'
import imageWatcher = require('./image-watch-helper')
import { Grammar, TextEditorElement } from 'atom'
import { isFileSync } from './util'

const { resourcePath } = atom.getLoadSettings()
const packagePath = path.dirname(__dirname)

export async function toDOMFragment<T>(
  text: string,
  filePath: string | undefined,
  _grammar: any,
  renderLaTeX: boolean,
  callback: (error: Error | null, domFragment?: Node) => T,
): Promise<T> {
  return render(text, filePath, renderLaTeX, false, function(
    error: Error | null,
    html?: string,
  ) {
    if (error !== null) {
      return callback(error)
    }

    const template = document.createElement('template')
    template.innerHTML = html!
    const domFragment = template.content.cloneNode(true)

    return callback(null, domFragment)
  })
}

export async function toHTML(
  text: string | null,
  filePath: string | undefined,
  grammar: Grammar | undefined,
  renderLaTeX: boolean,
  copyHTMLFlag: boolean,
  callback: (error: Error | null, html: string) => void,
): Promise<void> {
  if (text === null) {
    text = ''
  }
  return render(text, filePath, renderLaTeX, copyHTMLFlag, function(
    error,
    html,
  ) {
    let defaultCodeLanguage: string | undefined
    if (error !== null) {
      callback(error, '')
    }
    // Default code blocks to be coffee in Literate CoffeeScript files
    if ((grammar && grammar.scopeName) === 'source.litcoffee') {
      defaultCodeLanguage = 'coffee'
    }
    if (
      !atom.config.get('markdown-preview-plus.enablePandoc') ||
      !atom.config.get('markdown-preview-plus.useNativePandocCodeStyles')
    ) {
      html = tokenizeCodeBlocks(html, defaultCodeLanguage)
    }
    callback(null, html)
  })
}

async function render<T>(
  text: string,
  filePath: string | undefined,
  renderLaTeX: boolean,
  copyHTMLFlag: boolean,
  callback: (error: Error | null, html: string) => T,
): Promise<T> {
  // Remove the <!doctype> since otherwise marked will escape it
  // https://github.com/chjj/marked/issues/354
  text = text.replace(/^\s*<!doctype(\s+.*)?>\s*/i, '')

  const callbackFunction = async function(error: Error | null, html: string) {
    if (error !== null) {
      callback(error, '')
    }
    html = sanitize(html)
    html = await resolveImagePaths(html, filePath, copyHTMLFlag)
    return callback(null, html.trim())
  }

  if (atom.config.get('markdown-preview-plus.enablePandoc')) {
    return pandocHelper.renderPandoc(
      text,
      filePath,
      renderLaTeX,
      callbackFunction,
    )
  } else {
    return callbackFunction(null, markdownIt.render(text, renderLaTeX))
  }
}

function sanitize(html: string) {
  const doc = document.createElement('div')
  doc.innerHTML = html
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
  return doc.innerHTML
}

async function resolveImagePaths(
  html: string,
  filePath: string | undefined,
  copyHTMLFlag: boolean,
) {
  const [rootDirectory] = atom.project.relativizePath(filePath || '')
  const doc = document.createElement('div')
  doc.innerHTML = html
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

  return doc.innerHTML
}

export function convertCodeBlocksToAtomEditors(
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

    const editorElement = document.createElement(
      'atom-text-editor',
    ) as TextEditorElement
    editorElement.setAttributeNode(document.createAttribute('gutter-hidden'))
    editorElement.removeAttribute('tabindex') // make read-only

    preElement.parentElement!.replaceChild(editorElement, preElement)

    const editor = editorElement.getModel()
    // remove the default selection of a line in each editor
    if (editor.cursorLineDecorations != null) {
      for (const cursorLineDecoration of editor.cursorLineDecorations) {
        cursorLineDecoration.destroy()
      }
    }

    editor.setText(codeBlock.textContent!.replace(/\n$/, ''))
    const grammar = atom.grammars.grammarForScopeName(
      scopeForFenceName(fenceName),
    )
    if (grammar) {
      editor.setGrammar(grammar)
      editorElement.dataset.grammar = grammar.scopeName.replace(/\./g, ' ')
    }
  }

  return domFragment
}

function tokenizeCodeBlocks(html: string, defaultLanguage: string = 'text') {
  const doc = document.createElement('div')
  doc.innerHTML = html

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

  return doc.innerHTML
}
