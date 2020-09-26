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

  public async queueTypeset(domElement: Element) {
    const allMath = Array.from(
      domElement.querySelectorAll('span.math > script[type^="math/tex"]'),
    )
    const unprocessedMath = allMath.filter((x) => {
      const jax = MathJax.Hub.getJaxFor(x) as MathJax.ElementJax | null
      try {
        return !jax || x.id !== jax.inputID || jax.needsUpdate()
      } catch (e) {
        console.error(e)
        return true
      }
    })
    if (unprocessedMath.length === 0) return
    return new Promise<void>((resolve) => {
      if (MathJax.InputJax.TeX) {
        MathJax.Hub.Queue(['resetEquationNumbers', MathJax.InputJax.TeX])
      }
      const { temps, spans } = this.setupTemps(allMath)
      MathJax.Hub.Queue(['PreProcess', MathJax.Hub, temps])
      MathJax.Hub.Queue(['Reprocess', MathJax.Hub, temps])
      MathJax.Hub.Queue(() => this.cleanupTemps(temps, spans))
      MathJax.Hub.Queue([resolve])
    })
  }

  private cleanupTemps(temps: HTMLElement[], spans: HTMLElement[]) {
    for (const span of spans) span.remove()
    for (const temp of temps) {
      temp.style.visibility = ''
      temp.style.position = ''
      temp.style.width = ''
      temp.style.display = ''
      temp.classList.remove('temp-MathJax')
    }
  }

  private setupTemps(scriptElements: Element[]) {
    const temps: HTMLElement[] = []
    const spans: HTMLElement[] = []
    for (const script of scriptElements) {
      const span = script.parentElement
      if (!span) continue
      const par = span.parentElement
      if (!par) continue
      const disp = script.previousElementSibling
      if (disp) {
        // update render
        const temp = span.cloneNode(false) as HTMLSpanElement
        temp.classList.add('temp-MathJax')
        temp.appendChild(script.cloneNode(true))
        temps.push(temp)
        spans.push(span)
        par.insertBefore(temp, span)
        temp.style.visibility = 'hidden'
        temp.style.position = 'absolute'
        if ((script as HTMLScriptElement).type.includes('display')) {
          temp.style.width = window.getComputedStyle(disp).width
          temp.style.display = 'block'
        }
      } else {
        // initial render
        temps.push(span)
      }
    }
    return { temps, spans }
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
