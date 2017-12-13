/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const fs = require('fs-plus');
const highlight = require('atom-highlight');
const {$} = require('atom-space-pen-views');
let pandocHelper = null; // Defer until used
let markdownIt = null; // Defer until used
const {scopeForFenceName} = require('./extension-helper');
const imageWatcher = require('./image-watch-helper');

const highlighter = null;
const {resourcePath} = atom.getLoadSettings();
const packagePath = path.dirname(__dirname);

export function toDOMFragment(text, filePath, grammar, renderLaTeX, callback) {
  if (text == null) { text = ''; }
  return render(text, filePath, renderLaTeX, false, function(error, html) {
    if (error != null) { return callback(error); }

    const template = document.createElement('template');
    template.innerHTML = html;
    const domFragment = template.content.cloneNode(true);

    return callback(null, domFragment);
  });
};

export function toHTML(text, filePath, grammar, renderLaTeX, copyHTMLFlag, callback) {
  if (text == null) { text = ''; }
  return render(text, filePath, renderLaTeX, copyHTMLFlag, function(error, html) {
    let defaultCodeLanguage;
    if (error != null) { return callback(error); }
    // Default code blocks to be coffee in Literate CoffeeScript files
    if ((grammar != null ? grammar.scopeName : undefined) === 'source.litcoffee') { defaultCodeLanguage = 'coffee'; }
    if (!atom.config.get('markdown-preview-plus.enablePandoc')
        || !atom.config.get('markdown-preview-plus.useNativePandocCodeStyles')) {
      html = tokenizeCodeBlocks(html, defaultCodeLanguage);
    }
    return callback(null, html);
  });
};

function render(text, filePath, renderLaTeX, copyHTMLFlag, callback) {
  // Remove the <!doctype> since otherwise marked will escape it
  // https://github.com/chjj/marked/issues/354
  text = text.replace(/^\s*<!doctype(\s+.*)?>\s*/i, '');

  const callbackFunction = function(error, html) {
    if (error != null) { return callback(error); }
    html = sanitize(html);
    html = resolveImagePaths(html, filePath, copyHTMLFlag);
    return callback(null, html.trim());
  };

  if (atom.config.get('markdown-preview-plus.enablePandoc')) {
    if (pandocHelper == null) { pandocHelper = require('./pandoc-helper'); }
    return pandocHelper.renderPandoc(text, filePath, renderLaTeX, callbackFunction);
  } else {

    if (markdownIt == null) { markdownIt = require('./markdown-it-helper'); }

    return callbackFunction(null, markdownIt.render(text, renderLaTeX));
  }
};

function sanitize(html) {
  const doc = document.createElement('div');
  doc.innerHTML = html;
  // Do not remove MathJax script delimited blocks
  doc.querySelectorAll("script:not([type^='math/tex'])").forEach(elem => elem.remove());
  const attributesToRemove = [
    'onabort',
    'onblur',
    'onchange',
    'onclick',
    'ondbclick',
    'onerror',
    'onfocus',
    'onkeydown',
    'onkeypress',
    'onkeyup',
    'onload',
    'onmousedown',
    'onmousemove',
    'onmouseover',
    'onmouseout',
    'onmouseup',
    'onreset',
    'onresize',
    'onscroll',
    'onselect',
    'onsubmit',
    'onunload'
  ];
  doc.querySelectorAll('*').forEach(elem => Array.from(attributesToRemove).map((attribute) => elem.removeAttribute(attribute)));
  return doc.innerHTML;
};


function resolveImagePaths(html, filePath, copyHTMLFlag) {
  let rootDirectory;
  if (atom.project != null) {
    [rootDirectory] = Array.from(atom.project.relativizePath(filePath));
  }
  const doc = document.createElement('div');
  doc.innerHTML = html;
  doc.querySelectorAll('img').forEach(function(img) {
    let src;
    if (src = img.getAttribute('src')) {
      if (!atom.config.get('markdown-preview-plus.enablePandoc')) {
        if (markdownIt == null) { markdownIt = require('./markdown-it-helper'); }
        src = markdownIt.decode(src);
      }

      if (src.match(/^(https?|atom|data):/)) { return; }
      if (src.startsWith(process.resourcesPath)) { return; }
      if (src.startsWith(resourcePath)) { return; }
      if (src.startsWith(packagePath)) { return; }

      if (src[0] === '/') {
        if (!fs.isFileSync(src)) {
          try {
            src = path.join(rootDirectory, src.substring(1));
          } catch (e) {}
        }
      } else {
        src = path.resolve(path.dirname(filePath), src);
      }

      // Use most recent version of image
      if (!copyHTMLFlag) {
        const v = imageWatcher.getVersion(src, filePath);
        if (v) { src = `${src}?v=${v}`; }
      }

      return img.src = src;
    }
  });

  return doc.innerHTML;
};

export function convertCodeBlocksToAtomEditors(domFragment, defaultLanguage) {
  let fontFamily;
  if (defaultLanguage == null) { defaultLanguage = 'text'; }
  if (fontFamily = atom.config.get('editor.fontFamily')) {
    for (let codeElement of Array.from(domFragment.querySelectorAll('code'))) {
      codeElement.style.fontFamily = fontFamily;
    }
  }

  for (let preElement of Array.from(domFragment.querySelectorAll('pre'))) {
    var grammar, left;
    const codeBlock = preElement.firstElementChild != null ? preElement.firstElementChild : preElement;
    const fenceName = (left = __guard__(codeBlock.getAttribute('class'), x => x.replace(/^(lang-|sourceCode )/, ''))) != null ? left : defaultLanguage;

    const editorElement = document.createElement('atom-text-editor');
    editorElement.setAttributeNode(document.createAttribute('gutter-hidden'));
    editorElement.removeAttribute('tabindex'); // make read-only

    preElement.parentNode.insertBefore(editorElement, preElement);
    preElement.remove();

    const editor = editorElement.getModel();
    // remove the default selection of a line in each editor
    if (editor.cursorLineDecorations != null) {
      for (let cursorLineDecoration of Array.from(editor.cursorLineDecorations)) {
        cursorLineDecoration.destroy();
      }
    } else {
      editor.getDecorations({class: 'cursor-line', type: 'line'})[0].destroy();
    }
    editor.setText(codeBlock.textContent.replace(/\n$/, ''));
    if (grammar = atom.grammars.grammarForScopeName(scopeForFenceName(fenceName))) {
      editor.setGrammar(grammar);
    }
  }

  return domFragment;
};

function tokenizeCodeBlocks(html, defaultLanguage) {
  let fontFamily;
  if (defaultLanguage == null) { defaultLanguage = 'text'; }
  const doc = document.createElement('div');
  doc.innerHTML = html;

  if (fontFamily = atom.config.get('editor.fontFamily')) {
    doc.querySelectorAll('code').forEach(code => code.style.fontFamily = fontFamily);
  }

  doc.querySelectorAll("pre").forEach(function(preElement) {
    let left;
    const codeBlock = preElement.firstElementChild;
    const fenceName = (left = codeBlock.className.replace(/^(lang-|sourceCode )/, '')) != null ? left : defaultLanguage;

    const highlightedHtml = highlight({
      fileContents: codeBlock.innerText,
      scopeName: scopeForFenceName(fenceName),
      nbsp: false,
      lineDivs: false,
      editorDiv: true,
      editorDivTag: 'pre',
      // The `editor` class messes things up as `.editor` has absolutely positioned lines
      editorDivClass:
        fenceName ?
          `editor-colors lang-${fenceName}`
        :
          "editor-colors"
    });

    return preElement.outerHTML = highlightedHtml;
  });

  return doc.innerHTML;
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
