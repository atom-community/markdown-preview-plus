//
// mathjax-helper
//
// This module will handle loading the MathJax environment and provide a wrapper
// for calls to MathJax to process LaTeX equations.
//

import path = require('path')
import CSON = require('season')
import fs = require('fs')
import { isFileSync } from './util'
// tslint:disable-next-line:no-var-requires
import mjAPI = require('mathjax-node')

let isMathJaxDisabled = false
let isMathJaxLoaded = false

//
// Process DOM elements for LaTeX equations with MathJax
//
// @param domElements An array of DOM elements to be processed by MathJax. See
//   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
//   details on DOM elements.
//
export async function mathProcessor(domElements: Node[]) {
  if (isMathJaxDisabled) return
  loadMathJax()
  for (const elem of domElements as HTMLElement[]) {
    await processHTMLElement(elem)
  }
}

//
// Process maths in HTML fragment with MathJax
//
// @param html A HTML fragment string
// @param callback A callback method that accepts a single parameter, a HTML
//   fragment string that is the result of html processed by MathJax
//
export async function processHTMLString(html: string): Promise<string> {
  if (isMathJaxDisabled) {
    return html
  }
  loadMathJax()
  const element = document.createElement('div')
  element.innerHTML = html

  await processHTMLElement(element)

  return element.innerHTML
}

async function processHTMLElement(element: HTMLElement) {
  const maths = element.querySelectorAll(
    'script[type^="math/tex"]',
  ) as NodeListOf<HTMLScriptElement>

  for (const math of Array.from(maths)) {
    try {
      const display = math.type
        .split(';')
        .some((x) => x.trim() === 'mode=display')
      const res = await mjAPI.typeset({
        svg: true,
        format: display ? 'TeX' : 'inline-TeX',
        math: math.text,
      })
      if (res.svg) math.outerHTML = res.svg
    } catch (e) {
      console.error(e)
    }
  }
}

// For testing
function disableMathJax(disable: boolean) {
  isMathJaxDisabled = disable
}

//
// Load MathJax environment
//
// @param listener method to call when the MathJax script was been
//   loaded to the window. The method is passed no arguments.
//
function loadMathJax(listener?: () => any) {
  if (!isMathJaxLoaded) {
    isMathJaxLoaded = true
    attachMathJax()
  }
  if (listener) {
    listener()
  }
}

//
// Attach main MathJax script to the document
//
function attachMathJax() {
  // Notify user MathJax is loading
  if (atom.inDevMode()) {
    atom.notifications.addInfo('Loading maths rendering engine MathJax')
  }

  // Attach MathJax script
  configureMathJax()
}

//
// Remove MathJax from the document and reset attach method
//
function resetMathJax() {
  mjAPI.start()
}

export const testing = {
  loadMathJax,
  resetMathJax,
  disableMathJax,
}

// private

//
// Define some functions to help get a hold of the user's Latex
// Macros.
//
const namePattern = new RegExp(`\
^[^a-zA-Z\\d\\s]$\
|\
^[a-zA-Z]*$\
`) // letters, but no numerals.

function getUserMacrosPath(): string {
  const userMacrosPath: string | undefined | null = CSON.resolve(
    path.join(atom.getConfigDirPath(), 'markdown-preview-plus'),
  )
  return userMacrosPath != null
    ? userMacrosPath
    : path.join(atom.getConfigDirPath(), 'markdown-preview-plus.cson')
}

function loadMacrosFile(filePath: string): object {
  if (!CSON.isObjectPath(filePath)) {
    return {}
  }
  return CSON.readFileSync(filePath, function(error?: Error, object?: object) {
    if (object === undefined) {
      object = {}
    }
    if (error !== undefined) {
      console.warn(
        `Error reading Latex Macros file '${filePath}': ${
          error.stack !== undefined ? error.stack : error
        }`,
      )
      atom.notifications.addError(
        `Failed to load Latex Macros from '${filePath}'`,
        { detail: error.message, dismissable: true },
      )
    }
    return object
  })
}

function loadUserMacros() {
  const userMacrosPath = getUserMacrosPath()
  if (isFileSync(userMacrosPath)) {
    return loadMacrosFile(userMacrosPath)
  } else {
    console.debug(
      'Creating markdown-preview-plus.cson, this is a one-time operation.',
    )
    createMacrosTemplate(userMacrosPath)
    return loadMacrosFile(userMacrosPath)
  }
}

function createMacrosTemplate(filePath: string) {
  const templatePath = path.join(__dirname, '../assets/macros-template.cson')
  const templateFile = fs.readFileSync(templatePath, 'utf8')
  fs.writeFileSync(filePath, templateFile)
}

function checkMacros(macrosObject: object) {
  for (const name in macrosObject) {
    const value = macrosObject[name]
    if (!name.match(namePattern) || !valueMatchesPattern(value)) {
      delete macrosObject[name]
      atom.notifications.addError(
        `Failed to load LaTeX macro named '${name}'. Please see the [LaTeX guide](https://github.com/Galadirith/markdown-preview-plus/blob/master/LATEX.md#macro-names)`,
        { dismissable: true },
      )
    }
  }
  return macrosObject
}

function valueMatchesPattern(value: any) {
  // Different check based on whether value is string or array
  if (Array.isArray(value)) {
    const macroDefinition = value[0]
    const numberOfArgs = value[1]
    if (typeof numberOfArgs === 'number') {
      return numberOfArgs % 1 === 0 && typeof macroDefinition === 'string'
    } else {
      return false
    }
  } else if (typeof value === 'string') {
    return true
  } else {
    return false
  }
}

// Configure MathJax environment. Similar to the TeX-AMS_HTML configuration with
// a few unnecessary features stripped away
//
const configureMathJax = function() {
  let userMacros = loadUserMacros()
  if (userMacros) {
    userMacros = checkMacros(userMacros)
  } else {
    userMacros = {}
  }

  // Now Configure MathJax
  mjAPI.config({
    MathJax: {
      jax: ['input/TeX', 'output/SVG'],
      extensions: [],
      TeX: {
        extensions: [
          'AMSmath.js',
          'AMSsymbols.js',
          'noErrors.js',
          'noUndefined.js',
        ],
        Macros: userMacros,
      },
      messageStyle: 'none',
      showMathMenu: false,
      // skipStartupTypeset: true,
    },
  })

  // Notify user MathJax has loaded
  if (atom.inDevMode()) {
    atom.notifications.addSuccess('Loaded maths rendering engine MathJax')
  }
}
