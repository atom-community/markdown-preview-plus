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

async function injectScript(scriptSrc: string) {
  const script = document.createElement('script')
  script.src = scriptSrc
  script.type = 'text/javascript'
  document.head!.appendChild(script)
  return new Promise<void>((resolve) => {
    script.addEventListener('load', () => resolve())
  })
}
