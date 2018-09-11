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

const mjSrc = `${global.require.resolve(
  'mathjax',
)}?delayStartupUntil=configured`

//
// Process DOM elements for LaTeX equations with MathJax
//
// @param domElements An array of DOM elements to be processed by MathJax. See
//   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
//   details on DOM elements.
//
export async function mathProcessor(domElement: Node) {
  await loadMathJax()
  await queueTypeset(domElement)
}

//
// Process maths in HTML fragment with MathJax
//
// @param html A HTML fragment string
// @param callback A callback method that accepts a single parameter, a HTML
//   fragment string that is the result of html processed by MathJax
//
export async function processHTMLString(element: Element) {
  const msvgh = document.getElementById('MathJax_SVG_Hidden')
  const svgGlyphs = msvgh && msvgh.parentElement
  if (svgGlyphs !== null) {
    return svgGlyphs.innerHTML + element.innerHTML
  } else {
    return element.innerHTML
  }
}

export async function rerenderMath() {
  if (mjPromise !== undefined) {
    await mjPromise
    return new Promise<void>((resolve) => {
      MathJax.Hub.Queue(['Rerender', MathJax.Hub])
      MathJax.Hub.Queue([resolve])
    })
  } else {
    return
  }
}

//
// Load MathJax environment
let mjPromise: Promise<void> | undefined
async function loadMathJax(): Promise<void> {
  if (mjPromise) return mjPromise
  mjPromise = attachMathJax()
  return mjPromise
}

// for testing
export function unloadMathJax(): void {
  mjPromise = undefined
  const script = document.head.querySelector(`script[src='${mjSrc}']`)
  if (script) script.remove()
}

export async function jaxTeXConfig() {
  let userMacros = await loadUserMacros()
  if (userMacros) {
    userMacros = checkMacros(userMacros)
  } else {
    userMacros = {}
  }
  const mathJaxConfig: MathJaxConfig = await window.atomVars.mathJaxConfig

  return {
    extensions: mathJaxConfig.texExtensions,
    Macros: userMacros,
    equationNumbers: mathJaxConfig.numberEquations
      ? {
          autoNumber: 'AMS',
          useLabelIds: false,
        }
      : {},
  }
}

// private

async function getUserMacrosPath(): Promise<string> {
  const home = await window.atomVars.home
  const userMacrosPath: string | undefined | null = CSON.resolve(
    path.join(home, 'markdown-preview-plus'),
  )
  return userMacrosPath != null
    ? userMacrosPath
    : path.join(home, 'markdown-preview-plus.cson')
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

async function loadUserMacros() {
  const userMacrosPath = await getUserMacrosPath()
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
async function configureMathJax() {
  const mathJaxConfig = await window.atomVars.mathJaxConfig
  MathJax.Hub.Config({
    jax: ['input/TeX', `output/${mathJaxConfig.renderer}`],
    extensions: [],
    TeX: await jaxTeXConfig(),
    'HTML-CSS': {
      availableFonts: [],
      webFont: 'TeX',
      imageFont: null as any, // TODO: complain on DT
      undefinedFamily: mathJaxConfig.undefinedFamily as any, // TODO: complain on DT
      mtextFontInherit: true,
    },
    messageStyle: 'none',
    showMathMenu: false,
    skipStartupTypeset: true,
  })
  MathJax.Hub.Configured()

  // Notify user MathJax has loaded
  console.log('Loaded maths rendering engine MathJax')
}

//
// Attach main MathJax script to the document
//
async function attachMathJax(): Promise<void> {
  console.log('Loading maths rendering engine MathJax')

  // Attach MathJax script
  await Promise.all([injectScript(mjSrc)])
  await configureMathJax()
}

async function injectScript(scriptSrc: string) {
  const script = document.createElement('script')
  script.src = scriptSrc
  script.type = 'text/javascript'
  document.head.appendChild(script)
  return new Promise<void>((resolve) => {
    script.addEventListener('load', () => resolve())
  })
}

async function queueTypeset(domElement: Node) {
  const hasUnprocessedMath = Array.from(
    document.querySelectorAll('script[type^="math/tex"]'),
  ).some((x) => !x.id)
  if (!hasUnprocessedMath) return
  const mathJaxConfig: MathJaxConfig = await window.atomVars.mathJaxConfig
  return new Promise<void>((resolve) => {
    if (MathJax.InputJax.TeX) {
      MathJax.Hub.Queue(['resetEquationNumbers', MathJax.InputJax.TeX])
      if (mathJaxConfig.numberEquations) {
        MathJax.Hub.Queue(['PreProcess', MathJax.Hub])
        MathJax.Hub.Queue(['Reprocess', MathJax.Hub])
      }
    }

    MathJax.Hub.Queue(['Typeset', MathJax.Hub, domElement])
    MathJax.Hub.Queue([resolve])
  })
}
