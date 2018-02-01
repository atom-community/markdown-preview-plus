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

let isMathJaxDisabled = false

//
// Process DOM elements for LaTeX equations with MathJax
//
// @param domElements An array of DOM elements to be processed by MathJax. See
//   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
//   details on DOM elements.
//
export async function mathProcessor(
  frame: HTMLIFrameElement,
  domElements: Node[],
) {
  if (isMathJaxDisabled) return
  const jax = await loadMathJax(frame)
  jax.queueTypeset(domElements)
}

//
// Process maths in HTML fragment with MathJax
//
// @param html A HTML fragment string
// @param callback A callback method that accepts a single parameter, a HTML
//   fragment string that is the result of html processed by MathJax
//
export async function processHTMLString(
  frame: HTMLIFrameElement,
  html: string,
) {
  if (isMathJaxDisabled) {
    return html
  }
  const element = document.createElement('div')
  element.innerHTML = html

  const jax = await loadMathJax(frame)

  await new Promise((resolve) => {
    jax.queueProcessHTMLString(element, resolve)
  })

  const msvgh = document.getElementById('MathJax_SVG_Hidden')
  const svgGlyphs = msvgh && msvgh.parentNode!.cloneNode(true)
  if (svgGlyphs !== null) {
    element.insertBefore(svgGlyphs, element.firstChild)
  }
  return element.innerHTML
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
async function loadMathJax(frame: HTMLIFrameElement): Promise<MathJaxStub> {
  if (frame.contentWindow.mathJaxStub) return frame.contentWindow.mathJaxStub
  if (frame.contentDocument.querySelector('head')) {
    return attachMathJax(frame)
  } else {
    return new Promise<MathJaxStub>((resolve) => {
      const onload = () => {
        frame.removeEventListener('load', onload)
        resolve(loadMathJax(frame))
      }
      frame.addEventListener('load', onload)
    })
  }
}

//
// Attach main MathJax script to the document
//
async function attachMathJax(frame: HTMLIFrameElement): Promise<MathJaxStub> {
  if (!frame.contentDocument.querySelector('script[src*="MathJax.js"]')) {
    return attachMathJaxInternal(frame)
  }
  throw new Error('Duplicate attachMathJax call')
}

export const testing = {
  loadMathJax,
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
const configureMathJax = function(jax: MathJaxStub) {
  let userMacros = loadUserMacros()
  if (userMacros) {
    userMacros = checkMacros(userMacros)
  } else {
    userMacros = {}
  }

  jax.jaxConfigure(userMacros)

  // Notify user MathJax has loaded
  if (atom.inDevMode()) {
    atom.notifications.addSuccess('Loaded maths rendering engine MathJax')
  }
}

//
// Attach main MathJax script to the document
//
async function attachMathJaxInternal(
  frame: HTMLIFrameElement,
): Promise<MathJaxStub> {
  // Notify user MathJax is loading
  if (atom.inDevMode()) {
    atom.notifications.addInfo('Loading maths rendering engine MathJax')
  }

  // Attach MathJax script
  await Promise.all([
    injectScript(
      frame.contentDocument,
      `${require.resolve('MathJax')}?delayStartupUntil=configured`,
    ),
    injectScript(frame.contentDocument, require.resolve('./mathjax-stub')),
  ])
  configureMathJax(frame.contentWindow.mathJaxStub)
  return frame.contentWindow.mathJaxStub
}

async function injectScript(doc: HTMLDocument, scriptSrc: string) {
  const script = doc.createElement('script')
  script.src = scriptSrc
  script.type = 'text/javascript'
  doc.querySelector('head')!.appendChild(script)
  return new Promise<void>((resolve) => {
    script.addEventListener('load', () => resolve())
  })
}
