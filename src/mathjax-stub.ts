const mathJaxStub = {
  jaxConfigure(userMacros: object) {
    MathJax.Hub.Config({
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
    MathJax.Hub.Configured()
  },

  queueTypeset(domElements: Node[]) {
    domElements.forEach((elem) => {
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, elem])
    })
  },

  queueProcessHTMLString(element: HTMLElement, callback: () => void) {
    MathJax.Hub.Queue(
      ['setRenderer', MathJax.Hub, 'SVG'],
      ['Typeset', MathJax.Hub, element],
      ['setRenderer', MathJax.Hub, 'HTML-CSS'],
      [callback],
    )
  },

  async waitForQueue() {
    await new Promise((resolve) => {
      MathJax.Hub.Queue([resolve])
    })
  },
}

interface Window {
  mathJaxStub: MathJaxStub
}

type MathJaxStub = typeof mathJaxStub

window.mathJaxStub = mathJaxStub
