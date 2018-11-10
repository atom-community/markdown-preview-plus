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

export class MathJaxController {
  private static mjSrc = `${global.require.resolve(
    'mathjax',
  )}?delayStartupUntil=configured`
  private readonly readyPromise: Promise<void>

  private constructor(
    private atomHome: string,
    private mathJaxConfig: MathJaxConfig,
  ) {
    this.readyPromise = this.attachMathJax()
  }

  public static async create(atomHome: string, mathJaxConfig: MathJaxConfig) {
    const controller = new MathJaxController(atomHome, mathJaxConfig)
    await controller.readyPromise
    return controller
  }

  public processHTMLString(element: Element) {
    const msvgh = document.getElementById('MathJax_SVG_Hidden')
    const svgGlyphs = msvgh && msvgh.parentElement
    if (svgGlyphs !== null) {
      return svgGlyphs.outerHTML + element.innerHTML
    } else {
      return element.innerHTML
    }
  }

  public async rerenderMath() {
    return new Promise<void>((resolve) => {
      MathJax.Hub.Queue(['Rerender', MathJax.Hub])
      MathJax.Hub.Queue([resolve])
    })
  }

  // for testing
  public dispose(): void {
    const script = document.head!.querySelector(
      `script[src='${MathJaxController.mjSrc}']`,
    )
    if (script) script.remove()
  }

  public jaxTeXConfig() {
    let userMacros = loadUserMacros(this.atomHome)
    if (userMacros) {
      userMacros = checkMacros(userMacros)
    } else {
      userMacros = {}
    }

    return {
      extensions: this.mathJaxConfig.texExtensions,
      Macros: userMacros,
      equationNumbers: this.mathJaxConfig.numberEquations
        ? {
            autoNumber: 'AMS',
            useLabelIds: false,
          }
        : {},
    }
  }

  public async queueTypeset(domElement: Node) {
    const hasUnprocessedMath = Array.from(
      document.querySelectorAll('script[type^="math/tex"]'),
    ).some((x) => !x.id)
    if (!hasUnprocessedMath) return
    return new Promise<void>((resolve) => {
      if (MathJax.InputJax.TeX) {
        MathJax.Hub.Queue(['resetEquationNumbers', MathJax.InputJax.TeX])
        if (this.mathJaxConfig.numberEquations) {
          MathJax.Hub.Queue(['PreProcess', MathJax.Hub])
          MathJax.Hub.Queue(['Reprocess', MathJax.Hub])
        }
      }

      MathJax.Hub.Queue(['Typeset', MathJax.Hub, domElement])
      MathJax.Hub.Queue([resolve])
    })
  }

  private async attachMathJax(): Promise<void> {
    console.log('Loading maths rendering engine MathJax')

    // Attach MathJax script
    await injectScript(MathJaxController.mjSrc)

    MathJax.Hub.Config({
      jax: ['input/TeX', `output/${this.mathJaxConfig.latexRenderer}`],
      extensions: [],
      TeX: this.jaxTeXConfig(),
      'HTML-CSS': {
        availableFonts: [],
        webFont: 'TeX',
        imageFont: null as any, // TODO: complain on DT
        undefinedFamily: this.mathJaxConfig.undefinedFamily as any, // TODO: complain on DT
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
}

function getUserMacrosPath(atomHome: string): string {
  const userMacrosPath: string | undefined | null = CSON.resolve(
    path.join(atomHome, 'markdown-preview-plus'),
  )
  return userMacrosPath != null
    ? userMacrosPath
    : path.join(atomHome, 'markdown-preview-plus.cson')
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

function loadUserMacros(atomHome: string) {
  const userMacrosPath = getUserMacrosPath(atomHome)
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

async function injectScript(scriptSrc: string) {
  const script = document.createElement('script')
  script.src = scriptSrc
  script.type = 'text/javascript'
  document.head!.appendChild(script)
  return new Promise<void>((resolve) => {
    script.addEventListener('load', () => resolve())
  })
}
