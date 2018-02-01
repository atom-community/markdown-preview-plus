// tslint:disable: no-string-literal

window['jaxConfigure'] = function(userMacros: object) {
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
}

window['queueTypeset'] = function(domElements: Node[]) {
  domElements.forEach((elem) => {
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, elem])
  })
}
