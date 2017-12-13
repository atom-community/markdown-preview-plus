let markdownIt = null;
let markdownItOptions = null;
let renderLaTeX = null;
let math = null;
let lazyHeaders = null;

const mathInline = string => `<span class='math'><script type='math/tex'>${string}</script></span>`;
const mathBlock = string => `<span class='math'><script type='math/tex; mode=display'>${string}</script></span>`;

const mathDollars = {
  inlineOpen: '$',
  inlineClose: '$',
  blockOpen: '$$',
  blockClose: '$$',
  inlineRenderer: mathInline,
  blockRenderer: mathBlock
};

const mathBrackets = {
  inlineOpen: '\\(',
  inlineClose: '\\)',
  blockOpen: '\\[',
  blockClose: '\\]',
  inlineRenderer: mathInline,
  blockRenderer: mathBlock
};

const getOptions = () =>
  ({
    html: true,
    xhtmlOut: false,
    breaks: atom.config.get('markdown-preview-plus.breakOnSingleNewline'),
    langPrefix: 'lang-',
    linkify: true,
    typographer: true
  })
;


const init = function(rL) {

  renderLaTeX = rL;

  markdownItOptions = getOptions();

  markdownIt = require('markdown-it')(markdownItOptions);

  if (renderLaTeX) {
    if (math == null) { math = require('markdown-it-math'); }
    markdownIt.use(math, mathDollars);
    markdownIt.use(math, mathBrackets);
  }

  lazyHeaders = atom.config.get('markdown-preview-plus.useLazyHeaders');

  if (lazyHeaders) {
    markdownIt.use(require('markdown-it-lazy-headers'));
  }
};


const needsInit = rL =>
  (markdownIt == null) ||
  (markdownItOptions.breaks !== atom.config.get('markdown-preview-plus.breakOnSingleNewline')) ||
  (lazyHeaders !== atom.config.get('markdown-preview-plus.useLazyHeaders')) ||
  (rL !== renderLaTeX)
;

exports.render = function(text, rL) {
  if (needsInit(rL)) { init(rL); }
  return markdownIt.render(text);
};

exports.decode = url => markdownIt.normalizeLinkText(url);

exports.getTokens = function(text, rL) {
  if (needsInit(rL)) { init(rL); }
  return markdownIt.parse(text, {});
};
