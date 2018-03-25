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
  domElements: Node[],
  renderer: MathJaxRenderer,
) {
  if (isMathJaxDisabled) return
  const jax = await loadMathJax(renderer)
  await jax.queueTypeset(domElements)
}

//
// Process maths in HTML fragment with MathJax
//
// @param html A HTML fragment string
// @param callback A callback method that accepts a single parameter, a HTML
//   fragment string that is the result of html processed by MathJax
//
export async function processHTMLString(
  frame: Electron.WebviewTag,
  element: HTMLElement,
) {
  if (isMathJaxDisabled) {
    return element.innerHTML
  }
  const jax = await loadMathJax('SVG')
  await jax.queueTypeset([element])

  const msvgh = await new Promise<HTMLElement>((resolve) =>
    frame.executeJavaScript(
      `return document.getElementById('MathJax_SVG_Hidden')`,
      false,
      resolve,
    ),
  )
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
async function loadMathJax(renderer: MathJaxRenderer): Promise<MathJaxStub> {
  if (window.mathJaxStub) return window.mathJaxStub

  return attachMathJax(renderer)
}

export const testing = {
  loadMathJax,
  disableMathJax,
}

// private

function getUserMacrosPath(): string {
  // TODO!
  return path.join(process.env.HOME, 'markdown-preview-plus.cson')
  // const userMacrosPath: string | undefined | null = CSON.resolve(
  //   path.join(atom.getConfigDirPath(), 'markdown-preview-plus'),
  // )
  // return userMacrosPath != null
  //   ? userMacrosPath
  //   : path.join(atom.getConfigDirPath(), 'markdown-preview-plus.cson')
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
      console.error(`Failed to load Latex Macros from '${filePath}'`, {
        detail: error.message,
        dismissable: true,
      })
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
  const namePattern = /^[^a-zA-Z\d\s]$|^[a-zA-Z]*$/ // letters, but no numerals.
  for (const name in macrosObject) {
    const value = macrosObject[name]
    if (!name.match(namePattern) || !valueMatchesPattern(value)) {
      delete macrosObject[name]
      console.error(
        `Failed to load LaTeX macro named '${name}'. Please see the [LaTeX guide](https://github.com/atom-community/markdown-preview-plus/blob/master/docs/math.md#macro-names)`,
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
const configureMathJax = function(jax: MathJaxStub, renderer: MathJaxRenderer) {
  let userMacros = loadUserMacros()
  if (userMacros) {
    userMacros = checkMacros(userMacros)
  } else {
    userMacros = {}
  }

  jax.jaxConfigure(userMacros, renderer)

  // Notify user MathJax has loaded
  console.log('Loaded maths rendering engine MathJax')
}

//
// Attach main MathJax script to the document
//
async function attachMathJax(renderer: MathJaxRenderer): Promise<MathJaxStub> {
  console.log('Loading maths rendering engine MathJax')

  // Attach MathJax script
  await Promise.all([
    injectScript(`${require.resolve('mathjax')}?delayStartupUntil=configured`),
    injectScript(require.resolve('./mathjax-stub')),
  ])
  configureMathJax(window.mathJaxStub, renderer)
  return window.mathJaxStub
}

export async function injectScript(scriptSrc: string) {
  const script = document.createElement('script')
  script.src = scriptSrc
  script.type = 'text/javascript'
  document.head.appendChild(script)
  return new Promise<void>((resolve) => {
    script.addEventListener('load', () => resolve())
  })
}
