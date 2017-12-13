/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('lodash');
const CP = require('child_process');
let fs = null;
let path = null;

const atomConfig = () => atom.config.get('markdown-preview-plus');

/**
 * Sets local mathjaxPath if available
 */
const getMathJaxPath = (function() {
  let cached = null;
  return function() {
    if (cached != null) { return cached; }
    try {
      return cached = require.resolve('MathJax');
    } catch (e) {
      return '';
    }
  };
})();

var findFileRecursive = function(filePath, fileName) {
  if (fs == null) { fs = require('fs'); }
  if (path == null) { path = require('path'); }
  const bibFile = path.join(filePath, '../', fileName);
  if (fs.existsSync(bibFile)) {
    return bibFile;
  } else {
    const newPath = path.join(bibFile, '..');
    if ((newPath !== filePath) && !_.includes(atom.project.getPaths(), newPath)) {
      return findFileRecursive(newPath, fileName);
    } else {
      return false;
    }
  }
};

/**
 * Sets local variables needed for everything
 * @param {string} path to markdown file
 *
 */
const setPandocOptions = function(filePath, renderMath) {
  const args = {
    from: atomConfig().pandocMarkdownFlavor,
    to: 'html'
  };
  const opts = {maxBuffer: Infinity}; // see https://github.com/atom-community/markdown-preview-plus/issues/316
  if (path == null) { path = require('path'); }
  if (filePath != null) { opts.cwd = path.dirname(filePath); }
  const mathjaxPath = getMathJaxPath();
  args.mathjax = renderMath ? mathjaxPath : undefined;
  args.filter = atomConfig().pandocFilters;
  if (atomConfig().pandocBibliography) {
    args.filter.push('pandoc-citeproc');
    let bibFile = findFileRecursive(filePath, atomConfig().pandocBIBFile);
    if (!bibFile) { bibFile = atomConfig().pandocBIBFileFallback; }
    args.bibliography = bibFile ? bibFile : undefined;
    let cslFile = findFileRecursive(filePath, atomConfig().pandocCSLFile);
    if (!cslFile) { cslFile = atomConfig().pandocCSLFileFallback; }
    args.csl = cslFile ? cslFile : undefined;
  }
  return {args, opts};
};

/**
 * Handle error response from Pandoc
 * @param {error} Returned error
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 */
const handleError = function(error, html, renderMath) {
  const message =
    _.uniq(error.split('\n'))
    .join('<br>');
  html = `<h1>Pandoc Error:</h1><pre>${error}</pre><hr>${html}`;
  return handleSuccess(html, renderMath);
};

/**
 * Adjusts all math environments in HTML
 * @param {string} HTML to be adjusted
 * @return {string} HTML with adjusted math environments
 */
const handleMath = function(html) {
  const doc = document.createElement('div');
  doc.innerHTML = html;
  doc.querySelectorAll('.math').forEach(function(elem) {
    let math = elem.innerText;
    // Set mode if it is block math
    const mode = math.indexOf('\\[') > -1  ? '; mode=display' : '';

    // Remove sourrounding \[ \] and \( \)
    math = math.replace(/\\[[()\]]/g, '');
    return elem.outerHTML =
      '<span class="math">' +
      `<script type='math/tex${mode}'>${math}</script>` +
      '</span>';
  });

  return doc.innerHTML;
};

const removeReferences = function(html) {
  const doc = document.createElement('div');
  doc.innerHTML = html;
  doc.querySelectorAll('.references').forEach(elem => elem.remove());
  return doc.innerHTML;
};

/**
 * Handle successful response from Pandoc
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 */
var handleSuccess = function(html, renderMath) {
  if (renderMath) { html = handleMath(html); }
  if (atomConfig().pandocRemoveReferences) { html = removeReferences(html); }
  return [null, html];
};

/**
 * Handle response from Pandoc
 * @param {Object} error if thrown
 * @param {string} Returned HTML
 */
const handleResponse = function(error, html, renderMath) {
  if (error) { return handleError(error, html, renderMath); } else { return handleSuccess(html, renderMath); }
};

/**
 * Renders markdown with pandoc
 * @param {string} document in markdown
 * @param {boolean} whether to render the math with mathjax
 * @param {function} callbackFunction
 */
const renderPandoc = function(text, filePath, renderMath, cb) {
  const {args, opts} = setPandocOptions(filePath, renderMath);
  const cp = CP.execFile(atomConfig().pandocPath, getArguments(args), opts, function(error, stdout, stderr) {
    if (error) {
      atom.notifications.addError(error.toString(), {
        stack: error.stack,
        dismissable: true
      }
      );
    }
    const cbargs = handleResponse((stderr != null ? stderr : ''), (stdout != null ? stdout : ''), renderMath);
    return cb(...Array.from(cbargs || []));
  });
  cp.stdin.write(text);
  return cp.stdin.end();
};

var getArguments = function(args) {
  args = _.reduce(args,
    function(res, val, key) {
      if (!_.isEmpty(val)) {
        val = _.flatten([val]);
        _.forEach(val, function(v) {
          if (!_.isEmpty(v)) { return res.push(`--${key}=${v}`); }
        });
      }
      return res;
    }
    , []);
  args = _.union(args, atom.config.get('markdown-preview-plus.pandocArguments'));
  args = _.map(args,
    function(val) {
      val = val.replace(/^(--[\w\-]+)\s(.+)$/i, "$1=$2");
      if (val.substr(0, 1) !== '-') { return undefined; } else { return val; }
  });
  return _.reject(args, _.isEmpty);
};

module.exports = {
  renderPandoc,
  __testing__: {
    findFileRecursive,
    setPandocOptions,
    getArguments
  }
};
