/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.frconst cbClass = codeBlock.className
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import path = require("path")
import fs = require("fs-plus")
import highlight = require("atom-highlight")
import pandocHelper = require("./pandoc-helper")
import markdownIt = require("./markdown-it-helper") // Defer until used
import { scopeForFenceName } from "./extension-helper"
import imageWatcher = require("./image-watch-helper")
import { Grammar, TextEditorElement } from "atom"

const { resourcePath } = atom.getLoadSettings()
const packagePath = path.dirname(__dirname)

export function toDOMFragment(
  text: string,
  filePath: any,
  _grammar: any,
  renderLaTeX: boolean,
  callback: (error: Error | null, domFragment?: Node) => string
): string {
  if (text == null) {
    text = ""
  }
  return render(text, filePath, renderLaTeX, false, function(
    error: Error | null,
    html?: string
  ) {
    if (error != null) {
      return callback(error)
    }

    const template = document.createElement("template")
    template.innerHTML = html!
    const domFragment = template.content.cloneNode(true)

    return callback(null, domFragment)
  })
}

export function toHTML(
  text: string | null,
  filePath: string | undefined,
  grammar: Grammar | null,
  renderLaTeX: boolean,
  copyHTMLFlag: boolean,
  callback: (error: Error | null, html: string) => string
): string {
  if (text == null) {
    text = ""
  }
  return render(text, filePath, renderLaTeX, copyHTMLFlag, function(
    error,
    html
  ) {
    let defaultCodeLanguage: string | undefined
    if (error != null) {
      return callback(error, "")
    }
    // Default code blocks to be coffee in Literate CoffeeScript files
    if ((grammar && grammar.scopeName) === "source.litcoffee") {
      defaultCodeLanguage = "coffee"
    }
    if (
      !atom.config.get("markdown-preview-plus.enablePandoc") ||
      !atom.config.get("markdown-preview-plus.useNativePandocCodeStyles")
    ) {
      html = tokenizeCodeBlocks(html, defaultCodeLanguage)
    }
    return callback(null, html)
  })
}

function render(
  text: string,
  filePath: string | undefined,
  renderLaTeX: boolean,
  copyHTMLFlag: boolean,
  callback: (error: Error | null, html: string) => string
): string {
  // Remove the <!doctype> since otherwise marked will escape it
  // https://github.com/chjj/marked/issues/354
  text = text.replace(/^\s*<!doctype(\s+.*)?>\s*/i, "")

  const callbackFunction = function(error: Error | null, html: string) {
    if (error != null) {
      return callback(error, "")
    }
    html = sanitize(html)
    html = resolveImagePaths(html, filePath, copyHTMLFlag)
    return callback(null, html.trim())
  }

  if (atom.config.get("markdown-preview-plus.enablePandoc")) {
    return pandocHelper.renderPandoc(
      text,
      filePath,
      renderLaTeX,
      callbackFunction
    )
  } else {
    return callbackFunction(null, markdownIt.render(text, renderLaTeX))
  }
}

function sanitize(html: string) {
  const doc = document.createElement("div")
  doc.innerHTML = html
  // Do not remove MathJax script delimited blocks
  doc
    .querySelectorAll("script:not([type^='math/tex'])")
    .forEach(elem => elem.remove())
  const attributesToRemove = [
    "onabort",
    "onblur",
    "onchange",
    "onclick",
    "ondbclick",
    "onerror",
    "onfocus",
    "onkeydown",
    "onkeypress",
    "onkeyup",
    "onload",
    "onmousedown",
    "onmousemove",
    "onmouseover",
    "onmouseout",
    "onmouseup",
    "onreset",
    "onresize",
    "onscroll",
    "onselect",
    "onsubmit",
    "onunload"
  ]
  doc
    .querySelectorAll("*")
    .forEach(elem =>
      Array.from(attributesToRemove).map(attribute =>
        elem.removeAttribute(attribute)
      )
    )
  return doc.innerHTML
}

function resolveImagePaths(
  html: string,
  filePath: string | undefined,
  copyHTMLFlag: boolean
) {
  let rootDirectory: string
  if (atom.project != null) {
    ;[rootDirectory] = Array.from(atom.project.relativizePath(filePath || ""))
  }
  const doc = document.createElement("div")
  doc.innerHTML = html
  doc.querySelectorAll("img").forEach(function(img) {
    let src
    if ((src = img.getAttribute("src"))) {
      if (!atom.config.get("markdown-preview-plus.enablePandoc")) {
        src = markdownIt.decode(src)
      }

      if (src.match(/^(https?|atom|data):/)) {
        return
      }
      // @ts-ignore
      if (src.startsWith(process.resourcesPath)) {
        return
      }
      if (src.startsWith(resourcePath)) {
        return
      }
      if (src.startsWith(packagePath)) {
        return
      }

      if (src[0] === "/") {
        if (!fs.isFileSync(src)) {
          try {
            src = path.join(rootDirectory, src.substring(1))
          } catch (e) {}
        }
      } else if (filePath) {
        src = path.resolve(path.dirname(filePath), src)
      }

      // Use most recent version of image
      if (!copyHTMLFlag) {
        const v = imageWatcher.getVersion(src, filePath)
        if (v) {
          src = `${src}?v=${v}`
        }
      }

      return (img.src = src)
    }
    return
  })

  return doc.innerHTML
}

export function convertCodeBlocksToAtomEditors(
  domFragment: HTMLElement,
  defaultLanguage: string
) {
  let fontFamily
  if (defaultLanguage == null) {
    defaultLanguage = "text"
  }
  if ((fontFamily = atom.config.get("editor.fontFamily"))) {
    for (let codeElement of Array.from(domFragment.querySelectorAll("code"))) {
      codeElement.style.fontFamily = fontFamily
    }
  }

  for (let preElement of Array.from(domFragment.querySelectorAll("pre"))) {
    const codeBlock =
      preElement.firstElementChild != null
        ? preElement.firstElementChild
        : preElement
    const cbClass = codeBlock.className
    const fenceName = cbClass
      ? cbClass.replace(/^(lang-|sourceCode )/, "")
      : defaultLanguage

    const editorElement = document.createElement(
      "atom-text-editor"
    ) as TextEditorElement
    editorElement.setAttributeNode(document.createAttribute("gutter-hidden"))
    editorElement.removeAttribute("tabindex") // make read-only

    preElement.parentElement!.replaceChild(editorElement, preElement)

    const editor = editorElement.getModel()
    // remove the default selection of a line in each editor
    if (editor.cursorLineDecorations != null) {
      for (let cursorLineDecoration of editor.cursorLineDecorations) {
        cursorLineDecoration.destroy()
      }
    }

    editor.setText(codeBlock.textContent!.replace(/\n$/, ""))
    const grammar = atom.grammars.grammarForScopeName(
      scopeForFenceName(fenceName)
    )
    if (grammar) editor.setGrammar(grammar)
  }

  return domFragment
}

function tokenizeCodeBlocks(html: string, defaultLanguage: string = "text") {
  let fontFamily: string | undefined
  const doc = document.createElement("div")
  doc.innerHTML = html

  if ((fontFamily = atom.config.get("editor.fontFamily"))) {
    doc
      .querySelectorAll("code")
      .forEach(code => (code.style.fontFamily = fontFamily || null))
  }

  doc.querySelectorAll("pre").forEach(function(preElement) {
    let left
    const codeBlock = preElement.firstElementChild as HTMLElement
    const fenceName =
      (left = codeBlock.className.replace(/^(lang-|sourceCode )/, "")) != null
        ? left
        : defaultLanguage

    const highlightedHtml = highlight({
      fileContents: codeBlock.innerText,
      scopeName: scopeForFenceName(fenceName),
      nbsp: false,
      lineDivs: false,
      editorDiv: true,
      editorDivTag: "pre",
      // The `editor` class messes things up as `.editor` has absolutely positioned lines
      editorDivClass: fenceName
        ? `editor-colors lang-${fenceName}`
        : "editor-colors"
    })

    return (preElement.outerHTML = highlightedHtml)
  })

  return doc.innerHTML
}
