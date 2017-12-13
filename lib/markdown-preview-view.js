/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MarkdownPreviewView;
const path = require('path');

const {Emitter, Disposable, CompositeDisposable} = require('atom');
const {$, $$$, ScrollView} = require('atom-space-pen-views');
const Grim = require('grim');
const _ = require('lodash');
const fs = require('fs-plus');
const {File} = require('atom');

const renderer = require('./renderer');
const UpdatePreview = require('./update-preview');
let markdownIt = null; // Defer until used
let imageWatcher = null;

module.exports =
(MarkdownPreviewView = class MarkdownPreviewView extends ScrollView {
  static content() {
    return this.div({class: 'markdown-preview native-key-bindings', tabindex: -1}, () => {
      // If you dont explicitly declare a class then the elements wont be created
      return this.div({class: 'update-preview'});
    });
  }

  constructor({editorId, filePath}) {
    super(...arguments);
    this.getPathToElement = this.getPathToElement.bind(this);
    this.syncSource = this.syncSource.bind(this);
    this.getPathToToken = this.getPathToToken.bind(this);
    this.syncPreview = this.syncPreview.bind(this);
    this.editorId = editorId;
    this.filePath = filePath;
    this.updatePreview  = null;
    this.renderLaTeX    = atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
    this.emitter = new Emitter;
    this.disposables = new CompositeDisposable;
    this.loaded = true; // Do not show the loading spinnor on initial load
  }

  attached() {
    if (this.isAttached) { return; }
    this.isAttached = true;

    if (this.editorId != null) {
      return this.resolveEditor(this.editorId);
    } else {
      if (atom.workspace != null) {
        return this.subscribeToFilePath(this.filePath);
      } else {
        return this.disposables.add(atom.packages.onDidActivateInitialPackages(() => {
          return this.subscribeToFilePath(this.filePath);
        })
        );
      }
    }
  }

  serialize() {
    let left;
    return {
      deserializer: 'MarkdownPreviewView',
      filePath: (left = this.getPath()) != null ? left : this.filePath,
      editorId: this.editorId
    };
  }

  destroy() {
    if (imageWatcher == null) { imageWatcher = require('./image-watch-helper'); }
    imageWatcher.removeFile(this.getPath());
    return this.disposables.dispose();
  }

  onDidChangeTitle(callback) {
    return this.emitter.on('did-change-title', callback);
  }

  onDidChangeModified(callback) {
    // No op to suppress deprecation warning
    return new Disposable;
  }

  onDidChangeMarkdown(callback) {
    return this.emitter.on('did-change-markdown', callback);
  }

  subscribeToFilePath(filePath) {
    this.file = new File(filePath);
    this.emitter.emit('did-change-title');
    this.handleEvents();
    return this.renderMarkdown();
  }

  resolveEditor(editorId) {
    const resolve = () => {
      this.editor = this.editorForId(editorId);

      if (this.editor != null) {
        if (this.editor != null) { this.emitter.emit('did-change-title'); }
        this.handleEvents();
        return this.renderMarkdown();
      } else {
        // The editor this preview was created for has been closed so close
        // this preview since a preview cannot be rendered without an editor
        return __guard__(atom.workspace != null ? atom.workspace.paneForItem(this) : undefined, x => x.destroyItem(this));
      }
    };

    if (atom.workspace != null) {
      return resolve();
    } else {
      return this.disposables.add(atom.packages.onDidActivateInitialPackages(resolve));
    }
  }

  editorForId(editorId) {
    for (let editor of Array.from(atom.workspace.getTextEditors())) {
      if ((editor.id != null ? editor.id.toString() : undefined) === editorId.toString()) { return editor; }
    }
    return null;
  }

  handleEvents() {
    this.disposables.add(atom.grammars.onDidAddGrammar(() => _.debounce((() => this.renderMarkdown()), 250)));
    this.disposables.add(atom.grammars.onDidUpdateGrammar(_.debounce((() => this.renderMarkdown()), 250)));

    atom.commands.add(this.element, {
      'core:move-up': () => {
        return this.scrollUp();
      },
      'core:move-down': () => {
        return this.scrollDown();
      },
      'core:save-as': event => {
        event.stopPropagation();
        return this.saveAs();
      },
      'core:copy': event => {
        if (this.copyToClipboard()) { return event.stopPropagation(); }
      },
      'markdown-preview-plus:zoom-in': () => {
        const zoomLevel = parseFloat(this.css('zoom')) || 1;
        return this.css('zoom', zoomLevel + .1);
      },
      'markdown-preview-plus:zoom-out': () => {
        const zoomLevel = parseFloat(this.css('zoom')) || 1;
        return this.css('zoom', zoomLevel - .1);
      },
      'markdown-preview-plus:reset-zoom': () => {
        return this.css('zoom', 1);
      },
      'markdown-preview-plus:sync-source': event => {
        return this.getMarkdownSource().then(source => {
          if (source == null) { return; }
          return this.syncSource(source, event.target);
        });
      }
    }
    );

    const changeHandler = () => {
      let left;
      this.renderMarkdown();

      // TODO: Remove paneForURI call when ::paneForItem is released
      const pane = (left = (typeof atom.workspace.paneForItem === 'function' ? atom.workspace.paneForItem(this) : undefined)) != null ? left : atom.workspace.paneForURI(this.getURI());
      if ((pane != null) && (pane !== atom.workspace.getActivePane())) {
        return pane.activateItem(this);
      }
    };

    if (this.file != null) {
      this.disposables.add(this.file.onDidChange(changeHandler));
    } else if (this.editor != null) {
      this.disposables.add(this.editor.getBuffer().onDidStopChanging(function() {
        if (atom.config.get('markdown-preview-plus.liveUpdate')) { return changeHandler(); }
      })
      );
      this.disposables.add(this.editor.onDidChangePath(() => this.emitter.emit('did-change-title')));
      this.disposables.add(this.editor.getBuffer().onDidSave(function() {
        if (!atom.config.get('markdown-preview-plus.liveUpdate')) { return changeHandler(); }
      })
      );
      this.disposables.add(this.editor.getBuffer().onDidReload(function() {
        if (!atom.config.get('markdown-preview-plus.liveUpdate')) { return changeHandler(); }
      })
      );
      this.disposables.add(atom.commands.add( atom.views.getView(this.editor), {
        'markdown-preview-plus:sync-preview': event => {
          return this.getMarkdownSource().then(source => {
            if (source == null) { return; }
            return this.syncPreview(source, this.editor.getCursorBufferPosition().row);
        });
        }
      } )
      );
    }

    this.disposables.add(atom.config.onDidChange('markdown-preview-plus.breakOnSingleNewline', changeHandler));

    // Toggle LaTeX rendering if focus is on preview pane or associated editor.
    this.disposables.add(atom.commands.add('atom-workspace', {
      'markdown-preview-plus:toggle-render-latex': () => {
        if ((atom.workspace.getActivePaneItem() === this) || (atom.workspace.getActiveTextEditor() === this.editor)) {
          this.renderLaTeX = !this.renderLaTeX;
          changeHandler();
        }
      }
    }
    )
    );

    return this.disposables.add(atom.config.observe('markdown-preview-plus.useGitHubStyle', useGitHubStyle => {
      if (useGitHubStyle) {
        return this.element.setAttribute('data-use-github-style', '');
      } else {
        return this.element.removeAttribute('data-use-github-style');
      }
    })
    );
  }

  renderMarkdown() {
    if (!this.loaded) { this.showLoading(); }
    return this.getMarkdownSource().then(source => { if (source != null) { return this.renderMarkdownText(source); } });
  }

  refreshImages(oldsrc) {
    const imgs = this.element.querySelectorAll("img[src]");
    if (imageWatcher == null) { imageWatcher = require('./image-watch-helper'); }
    return (() => {
      const result = [];
      for (let img of Array.from(imgs)) {
        var left, ov;
        let src = img.getAttribute('src');
        const match = src.match(/^(.*)\?v=(\d+)$/);
        [src, ov] = Array.from((left = __guardMethod__(match, 'slice', o => o.slice(1))) != null ? left : [src]);
        if (src === oldsrc) {
          if (ov != null) { ov = parseInt(ov); }
          const v = imageWatcher.getVersion(src, this.getPath());
          if (v !== ov) {
            if (v) {
              result.push(img.src = `${src}?v=${v}`);
            } else {
              result.push(img.src = `${src}`);
            }
          } else {
            result.push(undefined);
          }
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  getMarkdownSource() {
    if ((this.file != null ? this.file.getPath() : undefined)) {
      return this.file.read();
    } else if (this.editor != null) {
      return Promise.resolve(this.editor.getText());
    } else {
      return Promise.resolve(null);
    }
  }

  getHTML(callback) {
    return this.getMarkdownSource().then(source => {
      if (source == null) { return; }

      return renderer.toHTML(source, this.getPath(), this.getGrammar(), this.renderLaTeX, false, callback);
    });
  }

  renderMarkdownText(text) {
    return renderer.toDOMFragment(text, this.getPath(), this.getGrammar(), this.renderLaTeX, (error, domFragment) => {
      if (error) {
        return this.showError(error);
      } else {
        this.loading = false;
        this.loaded = true;
        // div.update-preview created after constructor st UpdatePreview cannot
        // be instanced in the constructor
        if (!this.updatePreview) {
          this.updatePreview = new UpdatePreview(this.find("div.update-preview")[0]);
        }
        this.updatePreview.update(domFragment, this.renderLaTeX);
        this.emitter.emit('did-change-markdown');
        return this.originalTrigger('markdown-preview-plus:markdown-changed');
      }
    });
  }

  getTitle() {
    if (this.file != null) {
      return `${path.basename(this.getPath())} Preview`;
    } else if (this.editor != null) {
      return `${this.editor.getTitle()} Preview`;
    } else {
      return "Markdown Preview";
    }
  }

  getIconName() {
    return "markdown";
  }

  getURI() {
    if (this.file != null) {
      return `markdown-preview-plus://${this.getPath()}`;
    } else {
      return `markdown-preview-plus://editor/${this.editorId}`;
    }
  }

  getPath() {
    if (this.file != null) {
      return this.file.getPath();
    } else if (this.editor != null) {
      return this.editor.getPath();
    }
  }

  getGrammar() {
    return (this.editor != null ? this.editor.getGrammar() : undefined);
  }

  getDocumentStyleSheets() { // This function exists so we can stub it
    return document.styleSheets;
  }

  getTextEditorStyles() {

    const textEditorStyles = document.createElement("atom-styles");
    textEditorStyles.initialize(atom.styles);
    textEditorStyles.setAttribute("context", "atom-text-editor");
    document.body.appendChild(textEditorStyles);

    // Extract style elements content
    return Array.prototype.slice.apply(textEditorStyles.childNodes).map(styleElement => styleElement.innerText);
  }

  getMarkdownPreviewCSS() {
    const markdowPreviewRules = [];
    const ruleRegExp = /\.markdown-preview/;
    const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/;

    for (let stylesheet of Array.from(this.getDocumentStyleSheets())) {
      if (stylesheet.rules != null) {
        for (let rule of Array.from(stylesheet.rules)) {
          // We only need `.markdown-review` css
          if ((rule.selectorText != null ? rule.selectorText.match(ruleRegExp) : undefined) != null) { markdowPreviewRules.push(rule.cssText); }
        }
      }
    }

    return markdowPreviewRules
      .concat(this.getTextEditorStyles())
      .join('\n')
      .replace(/atom-text-editor/g, 'pre.editor-colors')
      .replace(/:host/g, '.host') // Remove shadow-dom :host selector causing problem on FF
      .replace(cssUrlRefExp, function(match, assetsName, offset, string) { // base64 encode assets
        const assetPath = path.join(__dirname, '../assets', assetsName);
        const originalData = fs.readFileSync(assetPath, 'binary');
        const base64Data = new Buffer(originalData, 'binary').toString('base64');
        return `url('data:image/jpeg;base64,${base64Data}')`;
    });
  }

  showError(result) {
    const failureMessage = result != null ? result.message : undefined;

    return this.html($$$(function() {
      this.h2('Previewing Markdown Failed');
      if (failureMessage != null) { return this.h3(failureMessage); }
    })
    );
  }

  showLoading() {
    this.loading = true;
    return this.html($$$(function() {
      return this.div({class: 'markdown-spinner'}, 'Loading Markdown\u2026');
    })
    );
  }

  copyToClipboard() {
    if (this.loading) { return false; }

    const selection = window.getSelection();
    const selectedText = selection.toString();
    const selectedNode = selection.baseNode;

    // Use default copy event handler if there is selected text inside this view
    if (selectedText && (selectedNode != null) && ((this[0] === selectedNode) || $.contains(this[0], selectedNode))) { return false; }

    this.getHTML(function(error, html) {
      if (error != null) {
        return console.warn('Copying Markdown as HTML failed', error);
      } else {
        return atom.clipboard.write(html);
      }
    });

    return true;
  }

  saveAs() {
    let htmlFilePath;
    if (this.loading) { return; }

    let filePath = this.getPath();
    let title = 'Markdown to HTML';
    if (filePath) {
      title = path.parse(filePath).name;
      filePath += '.html';
    } else {
      let projectPath;
      filePath = 'untitled.md.html';
      if (projectPath = atom.project.getPaths()[0]) {
        filePath = path.join(projectPath, filePath);
      }
    }

    if (htmlFilePath = atom.showSaveDialogSync(filePath)) {

      return this.getHTML((error, htmlBody) => {
        if (error != null) {
          return console.warn('Saving Markdown as HTML failed', error);
        } else {
          let mathjaxScript;
          if (this.renderLaTeX) {
            mathjaxScript = `\

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    jax: ["input/TeX","output/HTML-CSS"],
    extensions: [],
    TeX: {
      extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
    },
    showMathMenu: false
  });
</script>
<script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js">
</script>\
`;
          } else {
            mathjaxScript = "";
          }
          const html = `\
<!DOCTYPE html>
<html>
  <head>
      <meta charset="utf-8" />
      <title>${title}</title>${mathjaxScript}
      <style>${this.getMarkdownPreviewCSS()}</style>
  </head>
  <body class='markdown-preview'>${htmlBody}</body>
</html>` + "\n"; // Ensure trailing newline

          fs.writeFileSync(htmlFilePath, html);
          return atom.workspace.open(htmlFilePath);
        }
      });
    }
  }

  isEqual(other) {
    return this[0] === (other != null ? other[0] : undefined); // Compare DOM elements
  }

  //
  // Find the closest ancestor of an element that is not a decendant of either
  // `span.math` or `span.atom-text-editor`.
  //
  // @param {HTMLElement} element The element from which the search for a
  //   closest ancestor begins.
  // @return {HTMLElement} The closest ancestor to `element` that does not
  //   contain either `span.math` or `span.atom-text-editor`.
  //
  bubbleToContainerElement(element) {
    let testElement = element;
    while (testElement !== document.body) {
      const parent = testElement.parentNode;
      if (parent.classList.contains('MathJax_Display')) { return parent.parentNode; }
      if (parent.classList.contains('atom-text-editor')) { return parent; }
      testElement = parent;
    }
    return element;
  }

  //
  // Determine a subsequence of a sequence of tokens representing a path through
  // HTMLElements that does not continue deeper than a table element.
  //
  // @param {(tag: <tag>, index: <index>)[]} pathToToken Array of tokens
  //   representing a path to a HTMLElement with the root element at
  //   pathToToken[0] and the target element at the highest index. Each element
  //   consists of a `tag` and `index` representing its index amongst its
  //   sibling elements of the same `tag`.
  // @return {(tag: <tag>, index: <index>)[]} The subsequence of pathToToken that
  //   maintains the same root but terminates at a table element or the target
  //   element, whichever comes first.
  //
  bubbleToContainerToken(pathToToken) {
    for (let i = 0, end = pathToToken.length-1; i <= end; i++) {
      if (pathToToken[i].tag === 'table') { return pathToToken.slice(0, i+1); }
    }
    return pathToToken;
  }

  //
  // Encode tags for markdown-it.
  //
  // @param {HTMLElement} element Encode the tag of element.
  // @return {string} Encoded tag.
  //
  encodeTag(element) {
    if (element.classList.contains('math')) { return 'math'; }
    if (element.classList.contains('atom-text-editor')) { return 'code'; } // only token.type is `fence` code blocks should ever be found in the first level of the tokens array
    return element.tagName.toLowerCase();
  }

  //
  // Decode tags used by markdown-it
  //
  // @param {markdown-it.Token} token Decode the tag of token.
  // @return {string|null} Decoded tag or `null` if the token has no tag.
  //
  decodeTag(token) {
    if (token.tag === 'math') { return 'span'; }
    if (token.tag === 'code') { return 'span'; }
    if (token.tag === "") { return null; }
    return token.tag;
  }

  //
  // Determine path to a target element from a container `.markdown-preview`.
  //
  // @param {HTMLElement} element Target HTMLElement.
  // @return {(tag: <tag>, index: <index>)[]} Array of tokens representing a path
  //   to `element` from `.markdown-preview`. The root `.markdown-preview`
  //   element is the first elements in the array and the target element
  //   `element` at the highest index. Each element consists of a `tag` and
  //   `index` representing its index amongst its sibling elements of the same
  //   `tag`.
  //
  getPathToElement(element) {
    if (element.classList.contains('markdown-preview')) {
      return [{
        tag: 'div',
        index: 0
      }
      ];
    }

    element       = this.bubbleToContainerElement(element);
    const tag           = this.encodeTag(element);
    const siblings      = element.parentNode.childNodes;
    let siblingsCount = 0;

    for (let sibling of Array.from(siblings)) {
      const siblingTag  = sibling.nodeType === 1 ? this.encodeTag(sibling) : null;
      if (sibling === element) {
        const pathToElement = this.getPathToElement(element.parentNode);
        pathToElement.push({
          tag,
          index: siblingsCount
        });
        return pathToElement;
      } else if (siblingTag === tag) {
        siblingsCount++;
      }
    }

  }

  //
  // Set the associated editors cursor buffer position to the line representing
  // the source markdown of a target element.
  //
  // @param {string} text Source markdown of the associated editor.
  // @param {HTMLElement} element Target element contained within the assoicated
  //   `.markdown-preview` container. The method will attempt to identify the
  //   line of `text` that represents `element` and set the cursor to that line.
  // @return {number|null} The line of `text` that represents `element`. If no
  //   line is identified `null` is returned.
  //
  syncSource(text, element) {
    const pathToElement = this.getPathToElement(element);
    pathToElement.shift(); // remove div.markdown-preview
    pathToElement.shift(); // remove div.update-preview
    if (!pathToElement.length) { return; }

    if (markdownIt == null) {  markdownIt = require('./markdown-it-helper'); }
    const tokens      = markdownIt.getTokens(text, this.renderLaTeX);
    let finalToken  = null;
    let level       = 0;

    for (let token of Array.from(tokens)) {
      if (token.level < level) { break; }
      if (token.hidden) { continue; }
      if ((token.tag === pathToElement[0].tag) && (token.level === level)) {
        if (token.nesting === 1) {
          if (pathToElement[0].index === 0) {
            if (token.map != null) { finalToken = token; }
            pathToElement.shift();
            level++;
          } else {
            pathToElement[0].index--;
          }
        } else if ((token.nesting === 0) && ['math', 'code', 'hr'].includes(token.tag)) {
          if (pathToElement[0].index === 0) {
            finalToken = token;
            break;
          } else {
            pathToElement[0].index--;
          }
        }
      }
      if (pathToElement.length === 0) { break; }
    }

    if (finalToken != null) {
      this.editor.setCursorBufferPosition([finalToken.map[0], 0]);
      return finalToken.map[0];
    } else {
      return null;
    }
  }

  //
  // Determine path to a target token.
  //
  // @param {(markdown-it.Token)[]} tokens Array of tokens as returned by
  //   `markdown-it.parse()`.
  // @param {number} line Line representing the target token.
  // @return {(tag: <tag>, index: <index>)[]} Array representing a path to the
  //   target token. The root token is represented by the first element in the
  //   array and the target token by the last elment. Each element consists of a
  //   `tag` and `index` representing its index amongst its sibling tokens in
  //   `tokens` of the same `tag`. `line` will lie between the properties
  //   `map[0]` and `map[1]` of the target token.
  //
  getPathToToken(tokens, line) {
    let pathToToken   = [];
    let tokenTagCount = [];
    let level         = 0;

    for (let token of Array.from(tokens)) {
      if (token.level < level) { break; }
      if (token.hidden) { continue; }
      if (token.nesting === -1) { continue; }

      token.tag = this.decodeTag(token);
      if (token.tag == null) { continue; }

      if ((token.map != null) && (line >= token.map[0]) && (line <= (token.map[1]-1))) {
        if (token.nesting === 1) {
          pathToToken.push({
            tag: token.tag,
            index: tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0
          });
          tokenTagCount = [];
          level++;
        } else if (token.nesting === 0) {
          pathToToken.push({
            tag: token.tag,
            index: tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0
          });
          break;
        }
      } else if (token.level === level) {
        if (tokenTagCount[token.tag] != null) {
        tokenTagCount[token.tag]++;
        } else { tokenTagCount[token.tag] = 1; }
      }
    }

    pathToToken = this.bubbleToContainerToken(pathToToken);
    return pathToToken;
  }

  //
  // Scroll the associated preview to the element representing the target line of
  // of the source markdown.
  //
  // @param {string} text Source markdown of the associated editor.
  // @param {number} line Target line of `text`. The method will attempt to
  //   identify the elment of the associated `.markdown-preview` that represents
  //   `line` and scroll the `.markdown-preview` to that element.
  // @return {number|null} The element that represents `line`. If no element is
  //   identified `null` is returned.
  //
  syncPreview(text, line) {
    if (markdownIt == null) {  markdownIt = require('./markdown-it-helper'); }
    const tokens      = markdownIt.getTokens(text, this.renderLaTeX);
    const pathToToken = this.getPathToToken(tokens, line);

    let element = this.find('.update-preview').eq(0);
    for (let token of Array.from(pathToToken)) {
      const candidateElement = element.children(token.tag).eq(token.index);
      if (candidateElement.length !== 0) {
      element = candidateElement;
      } else { break; }
    }

    if (element[0].classList.contains('update-preview')) { return null; } // Do not jump to the top of the preview for bad syncs

    if (!element[0].classList.contains('update-preview')) { element[0].scrollIntoView(); }
    const maxScrollTop = this.element.scrollHeight - this.innerHeight();
    if (!(this.scrollTop() >= maxScrollTop)) { this.element.scrollTop -= this.innerHeight()/4; }

    element.addClass('flash');
    setTimeout(( () => element.removeClass('flash')), 1000);

    return element[0];
  }
});

if (Grim.includeDeprecatedAPIs) {
  let cls;
  (cls = MarkdownPreviewView).prototype.on = function(eventName) {
    if (eventName === 'markdown-preview:markdown-changed') {
      Grim.deprecate("Use MarkdownPreviewView::onDidChangeMarkdown instead of the 'markdown-preview:markdown-changed' jQuery event");
    }
    return cls.prototype.__proto__.on.call(this, ...arguments);
  };
}

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}
