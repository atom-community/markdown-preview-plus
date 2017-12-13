/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//
// mathjax-helper
//
// This module will handle loading the MathJax environment and provide a wrapper
// for calls to MathJax to process LaTeX equations.
//

const {$}     = require('atom-space-pen-views');
const path    = require('path');
const CSON    = require('season');
const fs      = require('fs-plus');
const _       = require('lodash');

export = {
  //
  // Load MathJax environment
  //
  // @param listener Optional method to call when the MathJax script was been
  //   loaded to the window. The method is passed no arguments.
  //
  loadMathJax(listener) {
    const script = this.attachMathJax();
    if (listener != null) { script.addEventListener("load", () => listener()); }
  },

  //
  // Attach main MathJax script to the document
  //
  attachMathJax: _.once(() => attachMathJax()),

  //
  // Remove MathJax from the document and reset attach method
  //
  resetMathJax() {
    // Detach MathJax from the document
    $('script[src*="MathJax.js"]').remove();
    window.MathJax = undefined;

    // Reset attach for any subsequent calls
    return this.attachMathJax = _.once(() => attachMathJax());
  },

  //
  // Process DOM elements for LaTeX equations with MathJax
  //
  // @param domElements An array of DOM elements to be processed by MathJax. See
  //   [element](https://developer.mozilla.org/en-US/docs/Web/API/element) for
  //   details on DOM elements.
  //
  mathProcessor(domElements) {
    if (typeof MathJax !== 'undefined' && MathJax !== null) {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, domElements]);
    } else { this.loadMathJax(() => MathJax.Hub.Queue(["Typeset", MathJax.Hub, domElements])); }
  },

  //
  // Process maths in HTML fragment with MathJax
  //
  // @param html A HTML fragment string
  // @param callback A callback method that accepts a single parameter, a HTML
  //   fragment string that is the result of html processed by MathJax
  //
  processHTMLString(html, callback) {
    const element = document.createElement('div');
    element.innerHTML = html;

    const compileProcessedHTMLString = function() {
      const svgGlyphs = __guard__(document.getElementById('MathJax_SVG_Hidden'), x => x.parentNode.cloneNode(true));
      if (svgGlyphs != null) { element.insertBefore(svgGlyphs, element.firstChild); }
      return element.innerHTML;
    };

    const queueProcessHTMLString = () =>
      MathJax.Hub.Queue(
        ["setRenderer", MathJax.Hub, "SVG"],
        ["Typeset", MathJax.Hub, element],
        ["setRenderer", MathJax.Hub, "HTML-CSS"],
        [ () => callback(compileProcessedHTMLString())]
      )
    ;

    if (typeof MathJax !== 'undefined' && MathJax !== null) {
    queueProcessHTMLString();
    } else { this.loadMathJax(queueProcessHTMLString); }

  }
};

//
// Define some functions to help get a hold of the user's Latex
// Macros.
//
const namePattern = new RegExp(`\
^[^a-zA-Z\\d\\s]$\
|\
^[a-zA-Z]*$\
`);             // letters, but no numerals.

const getUserMacrosPath = function() {
  const userMacrosPath =  CSON.resolve(path.join(atom.getConfigDirPath(), 'markdown-preview-plus'));
  return userMacrosPath != null ? userMacrosPath : path.join(atom.getConfigDirPath(), 'markdown-preview-plus.cson');
};

const loadMacrosFile = function(filePath) {
  if (!CSON.isObjectPath(filePath)) { return {}; }
  return CSON.readFileSync(filePath, function(error, object) {
    if (object == null) { object = {}; }
    if (error != null) {
      console.warn(`Error reading Latex Macros file '${filePath}': ${error.stack != null ? error.stack : error}`);
      if (atom.notifications != null) {
        atom.notifications.addError(`Failed to load Latex Macros from '${filePath}'`, {detail: error.message, dismissable: true});
      }
    }
    return object;
  });
};

const loadUserMacros = function() {
  let result;
  const userMacrosPath = getUserMacrosPath();
  if (fs.isFileSync(userMacrosPath)) {
    return result = loadMacrosFile(userMacrosPath);
  } else {
    console.log("Creating markdown-preview-plus.cson, this is a one-time operation.");
    createMacrosTemplate(userMacrosPath);
    return result = loadMacrosFile(userMacrosPath);
  }
};

var createMacrosTemplate = function(filePath) {
  const templatePath = path.join(__dirname, "../assets/macros-template.cson");
  const templateFile = fs.readFileSync(templatePath, 'utf8');
  return fs.writeFileSync(filePath, templateFile);
};

const checkMacros = function(macrosObject) {
  for (let name in macrosObject) {
    const value = macrosObject[name];
    if (!name.match(namePattern) || !valueMatchesPattern(value)) {
      delete macrosObject[name];
      if (atom.notifications != null) {
        atom.notifications.addError(`Failed to load LaTeX macro named '${name}'. Please see the [LaTeX guide](https://github.com/Galadirith/markdown-preview-plus/blob/master/LATEX.md#macro-names)`, {dismissable: true});
      }
    }
  }
  return macrosObject;
};

var valueMatchesPattern = function(value) {
  // Different check based on whether value is string or array
  switch (false) {
    // If it is an array then it should be [string, integer]
    case Object.prototype.toString.call(value) !== '[object Array]':
      var macroDefinition = value[0];
      var numberOfArgs = value[1];
      if (typeof numberOfArgs  === 'number') {
        return ((numberOfArgs % 1) === 0) && (typeof macroDefinition === 'string');
      } else {
        return false;
      }
    // If it is just a string then that's OK, any string is acceptable
    case typeof value !== 'string':
      return true;
    default: return false;
  }
};

// Configure MathJax environment. Similar to the TeX-AMS_HTML configuration with
// a few unnecessary features stripped away
//
const configureMathJax = function() {
  let userMacros = loadUserMacros();
  if (userMacros) {
    userMacros = checkMacros(userMacros);
  } else {
    userMacros = {};
  }

  //Now Configure MathJax
  MathJax.Hub.Config({
    jax: [
      "input/TeX",
      "output/HTML-CSS"
    ],
    extensions: [],
    TeX: {
      extensions: [
        "AMSmath.js",
        "AMSsymbols.js",
        "noErrors.js",
        "noUndefined.js"
      ],
      Macros: userMacros
    },
    "HTML-CSS": {
      availableFonts: [],
      webFont: "TeX"
    },
    messageStyle: "none",
    showMathMenu: false,
    skipStartupTypeset: true
  });
  MathJax.Hub.Configured();

  // Notify user MathJax has loaded
  if (atom.inDevMode()) { atom.notifications.addSuccess("Loaded maths rendering engine MathJax"); }

};

//
// Attach main MathJax script to the document
//
var attachMathJax = function() {
  // Notify user MathJax is loading
  if (atom.inDevMode()) { atom.notifications.addInfo("Loading maths rendering engine MathJax"); }

  // Attach MathJax script
  const script      = document.createElement("script");
  script.src  = `${require.resolve('MathJax')}?delayStartupUntil=configured`;
  script.type = "text/javascript";
  script.addEventListener("load", () => configureMathJax());
  document.getElementsByTagName("head")[0].appendChild(script);

  return script;
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
