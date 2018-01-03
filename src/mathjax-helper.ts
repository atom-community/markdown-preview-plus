/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//
// mathjax-helper
//
// This module will handle loading the MathJax environment and provide a wrapper
// for calls to MathJax to process LaTeX equations.
//

import path = require('path')
import CSON = require('season')
import fs = require('fs-plus')

export = {
  //
  // Load MathJax environment
  //
  // @param listener method to call when the MathJax script was been
  //   loaded to the window. The method is passed no arguments.
  //
  loadMathJax(listener?: () => any) {
    const script = this.attachMathJax()
    if (listener) script.addEventListener('load', () => listener())
  },

  //
  // Attach main MathJax script to the document
  //
  attachMathJax() {
    if (!document.querySelector('script[src*="MathJax.js"]')) {
      return attachMathJax()
    }
    throw new Error('Duplicate attachMathJax call')
  },

  //
  // Remove MathJax from the document and reset attach method
  //
  resetMathJax() {
    // Detach MathJax from the document
    for (const el of Array.from(
      document.querySelectorAll('script[src*="MathJax.js"]'),
    )) {
      el.remove()
    }
    window.MathJax = undefined

    // Reset attach for any subsequent calls
    delete window.MathJax
  },

  //
  // Process DOM elements for LaTeX equations with MathJax
  //
  // @param domElements An array of DOM elements to be processed by MathJax. See
  //   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
  //   details on DOM elements.
  //
  mathProcessor(domElements: Node[]) {
    if (window.MathJax) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, domElements])
    } else {
      this.loadMathJax(() => {
        MathJax!.Hub.Queue(['Typeset', MathJax!.Hub, domElements])
      })
    }
  },

  //
  // Process maths in HTML fragment with MathJax
  //
  // @param html A HTML fragment string
  // @param callback A callback method that accepts a single parameter, a HTML
  //   fragment string that is the result of html processed by MathJax
  //
  processHTMLString(html: string, callback: (proHTML: string) => any) {
    const element = document.createElement('div')
    element.innerHTML = html

    const compileProcessedHTMLString = function() {
      const msvgh = document.getElementById('MathJax_SVG_Hidden')
      const svgGlyphs = msvgh && msvgh.parentNode!.cloneNode(true)
      if (svgGlyphs !== null) {
        element.insertBefore(svgGlyphs, element.firstChild)
      }
      return element.innerHTML
    }

    const queueProcessHTMLString = () => {
      MathJax!.Hub.Queue(
        ['setRenderer', MathJax!.Hub, 'SVG'],
        ['Typeset', MathJax!.Hub, element],
        ['setRenderer', MathJax!.Hub, 'HTML-CSS'],
        [() => callback(compileProcessedHTMLString())],
      )
    }

    if (window.MathJax) {
      queueProcessHTMLString()
    } else {
      this.loadMathJax(queueProcessHTMLString)
    }
  },
}

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
  if (fs.isFileSync(userMacrosPath)) {
    return loadMacrosFile(userMacrosPath)
  } else {
    console.log(
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
  MathJax!.Hub.Config({
    jax: ['input/TeX', 'output/HTML-CSS'],
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
    'HTML-CSS': {
      availableFonts: [],
      webFont: 'TeX',
    },
    messageStyle: 'none',
    showMathMenu: false,
    skipStartupTypeset: true,
  })
  MathJax!.Hub.Configured()

  // Notify user MathJax has loaded
  if (atom.inDevMode()) {
    atom.notifications.addSuccess('Loaded maths rendering engine MathJax')
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
  const script = document.createElement('script')
  script.src = `${require.resolve('MathJax')}?delayStartupUntil=configured`
  script.type = 'text/javascript'
  script.addEventListener('load', () => {
    configureMathJax()
  })
  document.getElementsByTagName('head')[0].appendChild(script)

  return script
}
