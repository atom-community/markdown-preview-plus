//
// mathjax-helper
//
// This module will handle loading the MathJax environment and provide a wrapper
// for calls to MathJax to process LaTeX equations.
//

export function processHTMLString(element: Element) {
  const msvgh = document.getElementById('MathJax_SVG_Hidden')
  const svgGlyphs = msvgh && msvgh.parentElement
  if (svgGlyphs !== null) {
    return svgGlyphs.outerHTML + element.innerHTML
  } else {
    return element.innerHTML
  }
}

export class MathJaxController {
  private static mjSrc = `${global.require.resolve(
    'mathjax',
  )}?delayStartupUntil=configured`
  private readonly readyPromise: Promise<void>

  private constructor(
    private userMacros: object,
    private mathJaxConfig: MathJaxConfig,
  ) {
    this.readyPromise = this.attachMathJax()
  }

  public static async create(userMacros: object, mathJaxConfig: MathJaxConfig) {
    const controller = new MathJaxController(userMacros, mathJaxConfig)
    await controller.readyPromise
    return controller
  }

  // for testing
  public dispose(): void {
    const script = document.head!.querySelector(
      `script[src='${MathJaxController.mjSrc}']`,
    )
    if (script) script.remove()
  }

  public jaxTeXConfig() {
    return {
      extensions: this.mathJaxConfig.texExtensions,
      Macros: this.userMacros,
      equationNumbers: this.mathJaxConfig.numberEquations
        ? {
            autoNumber: 'AMS',
            useLabelIds: false,
          }
        : {},
    }
  }

  public async queueTypeset(domElement: Node) {
    const unprocessedMath = Array.from(
      document.querySelectorAll('span.math > script[type^="math/tex"]'),
    ).filter((x) => !x.id)
    if (unprocessedMath.length === 0) return
    return new Promise<void>((resolve) => {
      if (MathJax.InputJax.TeX) {
        MathJax.Hub.Queue(['resetEquationNumbers', MathJax.InputJax.TeX])
      }
      if (this.mathJaxConfig.numberEquations) {
        MathJax.Hub.Queue(['PreProcess', MathJax.Hub])
        MathJax.Hub.Queue(['Reprocess', MathJax.Hub])
      } else {
        MathJax.Hub.Queue(['PreProcess', MathJax.Hub, unprocessedMath])
        MathJax.Hub.Queue(['Reprocess', MathJax.Hub, unprocessedMath])
      }
      MathJax.Hub.Queue([resolve])
    })
  }

  private async attachMathJax(): Promise<void> {
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
