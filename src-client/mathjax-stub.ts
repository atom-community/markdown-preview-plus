const mathJaxStub = {
  jaxConfigure(userMacros: object, renderer: MathJaxRenderer) {
    MathJax.Hub.Config({
      jax: ['input/TeX', `output/${renderer}`],
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

  async queueTypeset(domElements: Node[]) {
    domElements.forEach((elem) => {
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, elem])
    })
    return new Promise((resolve) => {
      MathJax.Hub.Queue([resolve])
    })
  },
}

interface Window {
  mathJaxStub: MathJaxStub
}

type MathJaxRenderer = 'SVG' | 'HTML-CSS'

type MathJaxStub = typeof mathJaxStub

window.mathJaxStub = mathJaxStub
