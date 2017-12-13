"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const { Emitter, Disposable, CompositeDisposable } = require('atom');
const { $, $$$, ScrollView } = require('atom-space-pen-views');
const Grim = require('grim');
const _ = require('lodash');
const fs = require('fs-plus');
const { File } = require('atom');
const renderer = require("./renderer");
const update_preview_1 = require("./update-preview");
const markdownIt = require("./markdown-it-helper");
const imageWatcher = require("./image-watch-helper");
class MarkdownPreviewView extends ScrollView {
    static content() {
        return this.div({ class: 'markdown-preview native-key-bindings', tabindex: -1 }, () => {
            return this.div({ class: 'update-preview' });
        });
    }
    constructor({ editorId, filePath }) {
        super();
        this.getPathToElement = this.getPathToElement.bind(this);
        this.syncSource = this.syncSource.bind(this);
        this.getPathToToken = this.getPathToToken.bind(this);
        this.syncPreview = this.syncPreview.bind(this);
        this.editorId = editorId;
        this.filePath = filePath;
        this.updatePreview = null;
        this.renderLaTeX = atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
        this.emitter = new Emitter;
        this.disposables = new CompositeDisposable;
        this.loaded = true;
    }
    attached() {
        if (this.isAttached) {
            return;
        }
        this.isAttached = true;
        if (this.editorId != null) {
            return this.resolveEditor(this.editorId);
        }
        else {
            if (atom.workspace != null) {
                return this.subscribeToFilePath(this.filePath);
            }
            else {
                return this.disposables.add(atom.packages.onDidActivateInitialPackages(() => {
                    return this.subscribeToFilePath(this.filePath);
                }));
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
        if (imageWatcher == null) {
            imageWatcher = require('./image-watch-helper');
        }
        imageWatcher.removeFile(this.getPath());
        return this.disposables.dispose();
    }
    onDidChangeTitle(callback) {
        return this.emitter.on('did-change-title', callback);
    }
    onDidChangeModified(callback) {
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
                if (this.editor != null) {
                    this.emitter.emit('did-change-title');
                }
                this.handleEvents();
                return this.renderMarkdown();
            }
            else {
                return __guard__(atom.workspace != null ? atom.workspace.paneForItem(this) : undefined, x => x.destroyItem(this));
            }
        };
        if (atom.workspace != null) {
            return resolve();
        }
        else {
            return this.disposables.add(atom.packages.onDidActivateInitialPackages(resolve));
        }
    }
    editorForId(editorId) {
        for (let editor of Array.from(atom.workspace.getTextEditors())) {
            if (editor.id === editorId) {
                return editor;
            }
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
            'core:copy': (event) => {
                if (this.copyToClipboard())
                    event.stopPropagation();
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
                return this.getMarkdownSource().then((source) => {
                    if (source == null) {
                        return;
                    }
                    return this.syncSource(source, event.target);
                });
            }
        });
        const changeHandler = () => {
            let left;
            this.renderMarkdown();
            const pane = (left = (typeof atom.workspace.paneForItem === 'function' ? atom.workspace.paneForItem(this) : undefined)) != null ? left : atom.workspace.paneForURI(this.getURI());
            if ((pane != null) && (pane !== atom.workspace.getActivePane())) {
                return pane.activateItem(this);
            }
        };
        if (this.file != null) {
            this.disposables.add(this.file.onDidChange(changeHandler));
        }
        else if (this.editor != null) {
            this.disposables.add(this.editor.getBuffer().onDidStopChanging(function () {
                if (atom.config.get('markdown-preview-plus.liveUpdate')) {
                    return changeHandler();
                }
            }));
            this.disposables.add(this.editor.onDidChangePath(() => this.emitter.emit('did-change-title')));
            this.disposables.add(this.editor.getBuffer().onDidSave(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    return changeHandler();
                }
            }));
            this.disposables.add(this.editor.getBuffer().onDidReload(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    return changeHandler();
                }
            }));
            this.disposables.add(atom.commands.add(atom.views.getView(this.editor), {
                'markdown-preview-plus:sync-preview': _event => {
                    return this.getMarkdownSource().then((source) => {
                        if (source == null) {
                            return;
                        }
                        return this.syncPreview(source, this.editor.getCursorBufferPosition().row);
                    });
                }
            }));
        }
        this.disposables.add(atom.config.onDidChange('markdown-preview-plus.breakOnSingleNewline', changeHandler));
        this.disposables.add(atom.commands.add('atom-workspace', {
            'markdown-preview-plus:toggle-render-latex': () => {
                if ((atom.workspace.getActivePaneItem() === this) || (atom.workspace.getActiveTextEditor() === this.editor)) {
                    this.renderLaTeX = !this.renderLaTeX;
                    changeHandler();
                }
            }
        }));
        return this.disposables.add(atom.config.observe('markdown-preview-plus.useGitHubStyle', useGitHubStyle => {
            if (useGitHubStyle) {
                return this.element.setAttribute('data-use-github-style', '');
            }
            else {
                return this.element.removeAttribute('data-use-github-style');
            }
        }));
    }
    renderMarkdown() {
        if (!this.loaded) {
            this.showLoading();
        }
        return this.getMarkdownSource().then(source => { if (source != null) {
            return this.renderMarkdownText(source);
        } });
    }
    refreshImages(oldsrc) {
        const imgs = this.element.querySelectorAll("img[src]");
        return (() => {
            const result = [];
            for (let img of Array.from(imgs)) {
                var left, ov;
                let src = img.getAttribute('src');
                const match = src.match(/^(.*)\?v=(\d+)$/);
                [src, ov] = Array.from((left = __guardMethod__(match, 'slice', o => o.slice(1))) != null ? left : [src]);
                if (src === oldsrc) {
                    if (ov != null) {
                        ov = parseInt(ov);
                    }
                    const v = imageWatcher.getVersion(src, this.getPath());
                    if (v !== ov) {
                        if (v) {
                            result.push(img.src = `${src}?v=${v}`);
                        }
                        else {
                            result.push(img.src = `${src}`);
                        }
                    }
                    else {
                        result.push(undefined);
                    }
                }
                else {
                    result.push(undefined);
                }
            }
            return result;
        })();
    }
    getMarkdownSource() {
        if ((this.file != null ? this.file.getPath() : undefined)) {
            return this.file.read();
        }
        else if (this.editor != null) {
            return Promise.resolve(this.editor.getText());
        }
        else {
            return Promise.resolve(null);
        }
    }
    getHTML(callback) {
        return this.getMarkdownSource().then(source => {
            if (source == null) {
                return;
            }
            return renderer.toHTML(source, this.getPath(), this.getGrammar(), this.renderLaTeX, false, callback);
        });
    }
    renderMarkdownText(text) {
        return renderer.toDOMFragment(text, this.getPath(), this.getGrammar(), this.renderLaTeX, (error, domFragment) => {
            if (error) {
                return this.showError(error);
            }
            else {
                this.loading = false;
                this.loaded = true;
                if (!this.updatePreview) {
                    this.updatePreview = new update_preview_1.UpdatePreview(this.find("div.update-preview")[0]);
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
        }
        else if (this.editor != null) {
            return `${this.editor.getTitle()} Preview`;
        }
        else {
            return "Markdown Preview";
        }
    }
    getIconName() {
        return "markdown";
    }
    getURI() {
        if (this.file != null) {
            return `markdown-preview-plus://${this.getPath()}`;
        }
        else {
            return `markdown-preview-plus://editor/${this.editorId}`;
        }
    }
    getPath() {
        if (this.file != null) {
            return this.file.getPath();
        }
        else if (this.editor != null) {
            return this.editor.getPath();
        }
    }
    getGrammar() {
        return (this.editor != null ? this.editor.getGrammar() : undefined);
    }
    getDocumentStyleSheets() {
        return document.styleSheets;
    }
    getTextEditorStyles() {
        const textEditorStyles = document.createElement("atom-styles");
        textEditorStyles.initialize(atom.styles);
        textEditorStyles.setAttribute("context", "atom-text-editor");
        document.body.appendChild(textEditorStyles);
        return Array.prototype.slice.apply(textEditorStyles.childNodes).map(styleElement => styleElement.innerText);
    }
    getMarkdownPreviewCSS() {
        const markdowPreviewRules = [];
        const ruleRegExp = /\.markdown-preview/;
        const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/;
        for (let stylesheet of Array.from(this.getDocumentStyleSheets())) {
            if (stylesheet.rules != null) {
                for (let rule of Array.from(stylesheet.rules)) {
                    if ((rule.selectorText != null ? rule.selectorText.match(ruleRegExp) : undefined) != null) {
                        markdowPreviewRules.push(rule.cssText);
                    }
                }
            }
        }
        return markdowPreviewRules
            .concat(this.getTextEditorStyles())
            .join('\n')
            .replace(/atom-text-editor/g, 'pre.editor-colors')
            .replace(/:host/g, '.host')
            .replace(cssUrlRefExp, function (match, assetsName, offset, string) {
            const assetPath = path.join(__dirname, '../assets', assetsName);
            const originalData = fs.readFileSync(assetPath, 'binary');
            const base64Data = new Buffer(originalData, 'binary').toString('base64');
            return `url('data:image/jpeg;base64,${base64Data}')`;
        });
    }
    showError(result) {
        const failureMessage = result != null ? result.message : undefined;
        return this.html($$$(function () {
            this.h2('Previewing Markdown Failed');
            if (failureMessage != null) {
                return this.h3(failureMessage);
            }
        }));
    }
    showLoading() {
        this.loading = true;
        return this.html($$$(function () {
            return this.div({ class: 'markdown-spinner' }, 'Loading Markdown\u2026');
        }));
    }
    copyToClipboard() {
        if (this.loading) {
            return false;
        }
        const selection = window.getSelection();
        const selectedText = selection.toString();
        const selectedNode = selection.baseNode;
        if (selectedText && (selectedNode != null) && ((this[0] === selectedNode) || $.contains(this[0], selectedNode))) {
            return false;
        }
        this.getHTML(function (error, html) {
            if (error != null) {
                return console.warn('Copying Markdown as HTML failed', error);
            }
            else {
                return atom.clipboard.write(html);
            }
        });
        return true;
    }
    saveAs() {
        let htmlFilePath;
        if (this.loading) {
            return;
        }
        let filePath = this.getPath();
        let title = 'Markdown to HTML';
        if (filePath) {
            title = path.parse(filePath).name;
            filePath += '.html';
        }
        else {
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
                }
                else {
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
                    }
                    else {
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
</html>` + "\n";
                    fs.writeFileSync(htmlFilePath, html);
                    return atom.workspace.open(htmlFilePath);
                }
            });
        }
    }
    isEqual(other) {
        return this[0] === (other != null ? other[0] : undefined);
    }
    bubbleToContainerElement(element) {
        let testElement = element;
        while (testElement !== document.body) {
            const parent = testElement.parentElement;
            if (parent.classList.contains('MathJax_Display')) {
                return parent.parentElement;
            }
            if (parent.classList.contains('atom-text-editor')) {
                return parent;
            }
            testElement = parent;
        }
        return element;
    }
    bubbleToContainerToken(pathToToken) {
        for (let i = 0, end = pathToToken.length - 1; i <= end; i++) {
            if (pathToToken[i].tag === 'table') {
                return pathToToken.slice(0, i + 1);
            }
        }
        return pathToToken;
    }
    encodeTag(element) {
        if (element.classList.contains('math')) {
            return 'math';
        }
        if (element.classList.contains('atom-text-editor')) {
            return 'code';
        }
        return element.tagName.toLowerCase();
    }
    decodeTag(token) {
        if (token.tag === 'math') {
            return 'span';
        }
        if (token.tag === 'code') {
            return 'span';
        }
        if (token.tag === "") {
            return null;
        }
        return token.tag;
    }
    getPathToElement(element) {
        if (element.classList.contains('markdown-preview')) {
            return [{
                    tag: 'div',
                    index: 0
                }
            ];
        }
        element = this.bubbleToContainerElement(element);
        const tag = this.encodeTag(element);
        const siblings = element.parentElement.children;
        let siblingsCount = 0;
        for (let sibling of Array.from(siblings)) {
            const siblingTag = sibling.nodeType === 1 ? this.encodeTag(sibling) : null;
            if (sibling === element) {
                const pathToElement = this.getPathToElement(element.parentElement);
                pathToElement.push({
                    tag,
                    index: siblingsCount
                });
                return pathToElement;
            }
            else if (siblingTag === tag) {
                siblingsCount++;
            }
        }
        throw new Error('failure in getPathToElement');
    }
    syncSource(text, element) {
        const pathToElement = this.getPathToElement(element);
        pathToElement.shift();
        pathToElement.shift();
        if (!pathToElement.length) {
            return;
        }
        if (markdownIt == null) {
            markdownIt = require('./markdown-it-helper');
        }
        const tokens = markdownIt.getTokens(text, this.renderLaTeX);
        let finalToken = null;
        let level = 0;
        for (let token of Array.from(tokens)) {
            if (token.level < level) {
                break;
            }
            if (token.hidden) {
                continue;
            }
            if ((token.tag === pathToElement[0].tag) && (token.level === level)) {
                if (token.nesting === 1) {
                    if (pathToElement[0].index === 0) {
                        if (token.map != null) {
                            finalToken = token;
                        }
                        pathToElement.shift();
                        level++;
                    }
                    else {
                        pathToElement[0].index--;
                    }
                }
                else if ((token.nesting === 0) && ['math', 'code', 'hr'].includes(token.tag)) {
                    if (pathToElement[0].index === 0) {
                        finalToken = token;
                        break;
                    }
                    else {
                        pathToElement[0].index--;
                    }
                }
            }
            if (pathToElement.length === 0) {
                break;
            }
        }
        if (finalToken != null) {
            this.editor.setCursorBufferPosition([finalToken.map[0], 0]);
            return finalToken.map[0];
        }
        else {
            return null;
        }
    }
    getPathToToken(tokens, line) {
        let pathToToken = [];
        let tokenTagCount = [];
        let level = 0;
        for (let token of tokens) {
            if (token.level < level) {
                break;
            }
            if (token.hidden) {
                continue;
            }
            if (token.nesting === -1) {
                continue;
            }
            token.tag = this.decodeTag(token);
            if (token.tag == null) {
                continue;
            }
            if ((token.map != null) && (line >= token.map[0]) && (line <= (token.map[1] - 1))) {
                if (token.nesting === 1) {
                    pathToToken.push({
                        tag: token.tag,
                        index: tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0
                    });
                    tokenTagCount = [];
                    level++;
                }
                else if (token.nesting === 0) {
                    pathToToken.push({
                        tag: token.tag,
                        index: tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0
                    });
                    break;
                }
            }
            else if (token.level === level) {
                if (tokenTagCount[token.tag] != null) {
                    tokenTagCount[token.tag]++;
                }
                else {
                    tokenTagCount[token.tag] = 1;
                }
            }
        }
        pathToToken = this.bubbleToContainerToken(pathToToken);
        return pathToToken;
    }
    syncPreview(text, line) {
        if (markdownIt == null) {
            markdownIt = require('./markdown-it-helper');
        }
        const tokens = markdownIt.getTokens(text, this.renderLaTeX);
        const pathToToken = this.getPathToToken(tokens, line);
        let element = this.find('.update-preview').eq(0);
        for (let token of Array.from(pathToToken)) {
            const candidateElement = element.children(token.tag).eq(token.index);
            if (candidateElement.length !== 0) {
                element = candidateElement;
            }
            else {
                break;
            }
        }
        if (element[0].classList.contains('update-preview')) {
            return null;
        }
        if (!element[0].classList.contains('update-preview')) {
            element[0].scrollIntoView();
        }
        const maxScrollTop = this.element.scrollHeight - this.innerHeight();
        if (!(this.scrollTop() >= maxScrollTop)) {
            this.element.scrollTop -= this.innerHeight() / 4;
        }
        element.addClass('flash');
        setTimeout((() => element.removeClass('flash')), 1000);
        return element[0];
    }
}
exports.MarkdownPreviewView = MarkdownPreviewView;
function __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __guardMethod__(obj, methodName, transform) {
    if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
        return transform(obj, methodName);
    }
    else {
        return undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU3QixNQUFNLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRSxNQUFNLEVBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUMsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUM3RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5QixNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRS9CLHVDQUF3QztBQUN4QyxxREFBOEM7QUFDOUMsbURBQW1EO0FBQ25ELHFEQUFxRDtBQWNyRCx5QkFBaUMsU0FBUSxVQUFVO0lBRWpELE1BQU0sQ0FBQyxPQUFPO1FBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUUsc0NBQXNDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFDLEVBQUUsR0FBRyxFQUFFO1lBRWxGLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxZQUFZLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBWTtRQUN6QyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FB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QUFDekYsQ0FBQztBQUNELHlCQUF5QixHQUFHLEVBQUUsVUFBVSxFQUFFLFNBQVM7SUFDakQsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztRQUN4RixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ25CLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbWFuZEV2ZW50IH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgeyBUb2tlbiB9IGZyb20gJ21hcmtkb3duLWl0JztcblxuLypcbiAqIGRlY2FmZmVpbmF0ZSBzdWdnZXN0aW9uczpcbiAqIERTMTAxOiBSZW1vdmUgdW5uZWNlc3NhcnkgdXNlIG9mIEFycmF5LmZyb21cbiAqIERTMTAyOiBSZW1vdmUgdW5uZWNlc3NhcnkgY29kZSBjcmVhdGVkIGJlY2F1c2Ugb2YgaW1wbGljaXQgcmV0dXJuc1xuICogRFMxMDM6IFJld3JpdGUgY29kZSB0byBubyBsb25nZXIgdXNlIF9fZ3VhcmRfX1xuICogRFMxMDQ6IEF2b2lkIGlubGluZSBhc3NpZ25tZW50c1xuICogRFMyMDU6IENvbnNpZGVyIHJld29ya2luZyBjb2RlIHRvIGF2b2lkIHVzZSBvZiBJSUZFc1xuICogRFMyMDc6IENvbnNpZGVyIHNob3J0ZXIgdmFyaWF0aW9ucyBvZiBudWxsIGNoZWNrc1xuICogRnVsbCBkb2NzOiBodHRwczovL2dpdGh1Yi5jb20vZGVjYWZmZWluYXRlL2RlY2FmZmVpbmF0ZS9ibG9iL21hc3Rlci9kb2NzL3N1Z2dlc3Rpb25zLm1kXG4gKi9cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IHtFbWl0dGVyLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHskLCAkJCQsIFNjcm9sbFZpZXd9ID0gcmVxdWlyZSgnYXRvbS1zcGFjZS1wZW4tdmlld3MnKTtcbmNvbnN0IEdyaW0gPSByZXF1aXJlKCdncmltJyk7XG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbmNvbnN0IHtGaWxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuaW1wb3J0IHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlcicpO1xuaW1wb3J0IHtVcGRhdGVQcmV2aWV3fSBmcm9tICcuL3VwZGF0ZS1wcmV2aWV3J1xuaW1wb3J0IG1hcmtkb3duSXQgPSByZXF1aXJlKCcuL21hcmtkb3duLWl0LWhlbHBlcicpXG5pbXBvcnQgaW1hZ2VXYXRjaGVyID0gcmVxdWlyZSgnLi9pbWFnZS13YXRjaC1oZWxwZXInKVxuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc0VkaXRvciB7XG4gIGVkaXRvcklkOiBudW1iZXJcbiAgZmlsZVBhdGg/OiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNUFZQYXJhbXNQYXRoIHtcbiAgZWRpdG9ySWQ/OiB1bmRlZmluZWRcbiAgZmlsZVBhdGg6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBNUFZQYXJhbXMgPSBNUFZQYXJhbXNFZGl0b3IgfCBNUFZQYXJhbXNQYXRoXG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3IGV4dGVuZHMgU2Nyb2xsVmlldyB7XG4gIHByaXZhdGUgZWxlbWVudDogSFRNTEVsZW1lbnRcbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2KHtjbGFzczogJ21hcmtkb3duLXByZXZpZXcgbmF0aXZlLWtleS1iaW5kaW5ncycsIHRhYmluZGV4OiAtMX0sICgpID0+IHtcbiAgICAgIC8vIElmIHlvdSBkb250IGV4cGxpY2l0bHkgZGVjbGFyZSBhIGNsYXNzIHRoZW4gdGhlIGVsZW1lbnRzIHdvbnQgYmUgY3JlYXRlZFxuICAgICAgcmV0dXJuIHRoaXMuZGl2KHtjbGFzczogJ3VwZGF0ZS1wcmV2aWV3J30pO1xuICAgIH0pO1xuICB9XG5cbiAgY29uc3RydWN0b3Ioe2VkaXRvcklkLCBmaWxlUGF0aH06IE1QVlBhcmFtcykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5nZXRQYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5zeW5jU291cmNlID0gdGhpcy5zeW5jU291cmNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5nZXRQYXRoVG9Ub2tlbiA9IHRoaXMuZ2V0UGF0aFRvVG9rZW4uYmluZCh0aGlzKTtcbiAgICB0aGlzLnN5bmNQcmV2aWV3ID0gdGhpcy5zeW5jUHJldmlldy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWRpdG9ySWQgPSBlZGl0b3JJZDtcbiAgICB0aGlzLmZpbGVQYXRoID0gZmlsZVBhdGg7XG4gICAgdGhpcy51cGRhdGVQcmV2aWV3ICA9IG51bGw7XG4gICAgdGhpcy5yZW5kZXJMYVRlWCAgICA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0Jyk7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXI7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICAgIHRoaXMubG9hZGVkID0gdHJ1ZTsgLy8gRG8gbm90IHNob3cgdGhlIGxvYWRpbmcgc3Bpbm5vciBvbiBpbml0aWFsIGxvYWRcbiAgfVxuXG4gIGF0dGFjaGVkKCkge1xuICAgIGlmICh0aGlzLmlzQXR0YWNoZWQpIHsgcmV0dXJuOyB9XG4gICAgdGhpcy5pc0F0dGFjaGVkID0gdHJ1ZTtcblxuICAgIGlmICh0aGlzLmVkaXRvcklkICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlc29sdmVFZGl0b3IodGhpcy5lZGl0b3JJZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChhdG9tLndvcmtzcGFjZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZVRvRmlsZVBhdGgodGhpcy5maWxlUGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmVUb0ZpbGVQYXRoKHRoaXMuZmlsZVBhdGgpO1xuICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICBsZXQgbGVmdDtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnTWFya2Rvd25QcmV2aWV3VmlldycsXG4gICAgICBmaWxlUGF0aDogKGxlZnQgPSB0aGlzLmdldFBhdGgoKSkgIT0gbnVsbCA/IGxlZnQgOiB0aGlzLmZpbGVQYXRoLFxuICAgICAgZWRpdG9ySWQ6IHRoaXMuZWRpdG9ySWRcbiAgICB9O1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAoaW1hZ2VXYXRjaGVyID09IG51bGwpIHsgaW1hZ2VXYXRjaGVyID0gcmVxdWlyZSgnLi9pbWFnZS13YXRjaC1oZWxwZXInKTsgfVxuICAgIGltYWdlV2F0Y2hlci5yZW1vdmVGaWxlKHRoaXMuZ2V0UGF0aCgpKTtcbiAgICByZXR1cm4gdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBvbkRpZENoYW5nZVRpdGxlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQoY2FsbGJhY2spIHtcbiAgICAvLyBObyBvcCB0byBzdXBwcmVzcyBkZXByZWNhdGlvbiB3YXJuaW5nXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VNYXJrZG93bihjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtbWFya2Rvd24nLCBjYWxsYmFjayk7XG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aCk7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKTtcbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpO1xuICAgIHJldHVybiB0aGlzLnJlbmRlck1hcmtkb3duKCk7XG4gIH1cblxuICByZXNvbHZlRWRpdG9yKGVkaXRvcklkOiBudW1iZXIpIHtcbiAgICBjb25zdCByZXNvbHZlID0gKCkgPT4ge1xuICAgICAgdGhpcy5lZGl0b3IgPSB0aGlzLmVkaXRvckZvcklkKGVkaXRvcklkKTtcblxuICAgICAgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHsgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKTsgfVxuICAgICAgICB0aGlzLmhhbmRsZUV2ZW50cygpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJNYXJrZG93bigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIGVkaXRvciB0aGlzIHByZXZpZXcgd2FzIGNyZWF0ZWQgZm9yIGhhcyBiZWVuIGNsb3NlZCBzbyBjbG9zZVxuICAgICAgICAvLyB0aGlzIHByZXZpZXcgc2luY2UgYSBwcmV2aWV3IGNhbm5vdCBiZSByZW5kZXJlZCB3aXRob3V0IGFuIGVkaXRvclxuICAgICAgICByZXR1cm4gX19ndWFyZF9fKGF0b20ud29ya3NwYWNlICE9IG51bGwgPyBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKSA6IHVuZGVmaW5lZCwgeCA9PiB4LmRlc3Ryb3lJdGVtKHRoaXMpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKGF0b20ud29ya3NwYWNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVJbml0aWFsUGFja2FnZXMocmVzb2x2ZSkpO1xuICAgIH1cbiAgfVxuXG4gIGVkaXRvckZvcklkKGVkaXRvcklkOiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgQXJyYXkuZnJvbShhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpKSkge1xuICAgICAgaWYgKGVkaXRvci5pZCA9PT0gZWRpdG9ySWQpIHsgcmV0dXJuIGVkaXRvcjsgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGhhbmRsZUV2ZW50cygpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmdyYW1tYXJzLm9uRGlkQWRkR3JhbW1hcigoKSA9PiBfLmRlYm91bmNlKCgoKSA9PiB0aGlzLnJlbmRlck1hcmtkb3duKCkpLCAyNTApKSk7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5ncmFtbWFycy5vbkRpZFVwZGF0ZUdyYW1tYXIoXy5kZWJvdW5jZSgoKCkgPT4gdGhpcy5yZW5kZXJNYXJrZG93bigpKSwgMjUwKSkpO1xuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zY3JvbGxVcCgpO1xuICAgICAgfSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsRG93bigpO1xuICAgICAgfSxcbiAgICAgICdjb3JlOnNhdmUtYXMnOiBldmVudCA9PiB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICByZXR1cm4gdGhpcy5zYXZlQXMoKTtcbiAgICAgIH0sXG4gICAgICAnY29yZTpjb3B5JzogKGV2ZW50OiBDb21tYW5kRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY29weVRvQ2xpcGJvYXJkKCkpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pbic6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLmNzcygnem9vbScpKSB8fCAxO1xuICAgICAgICByZXR1cm4gdGhpcy5jc3MoJ3pvb20nLCB6b29tTGV2ZWwgKyAuMSk7XG4gICAgICB9LFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLW91dCc6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLmNzcygnem9vbScpKSB8fCAxO1xuICAgICAgICByZXR1cm4gdGhpcy5jc3MoJ3pvb20nLCB6b29tTGV2ZWwgLSAuMSk7XG4gICAgICB9LFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpyZXNldC16b29tJzogKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jc3MoJ3pvb20nLCAxKTtcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtc291cmNlJzogZXZlbnQgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgICAgIGlmIChzb3VyY2UgPT0gbnVsbCkgeyByZXR1cm47IH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5zeW5jU291cmNlKHNvdXJjZSwgZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBjaGFuZ2VIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgbGV0IGxlZnQ7XG4gICAgICB0aGlzLnJlbmRlck1hcmtkb3duKCk7XG5cbiAgICAgIC8vIFRPRE86IFJlbW92ZSBwYW5lRm9yVVJJIGNhbGwgd2hlbiA6OnBhbmVGb3JJdGVtIGlzIHJlbGVhc2VkXG4gICAgICBjb25zdCBwYW5lID0gKGxlZnQgPSAodHlwZW9mIGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtID09PSAnZnVuY3Rpb24nID8gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcykgOiB1bmRlZmluZWQpKSAhPSBudWxsID8gbGVmdCA6IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkodGhpcy5nZXRVUkkoKSk7XG4gICAgICBpZiAoKHBhbmUgIT0gbnVsbCkgJiYgKHBhbmUgIT09IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSkpIHtcbiAgICAgICAgcmV0dXJuIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5maWxlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZShjaGFuZ2VIYW5kbGVyKSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyhmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkgeyByZXR1cm4gY2hhbmdlSGFuZGxlcigpOyB9XG4gICAgICB9KVxuICAgICAgKTtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZWRpdG9yLm9uRGlkQ2hhbmdlUGF0aCgoKSA9PiB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpKSk7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7IHJldHVybiBjaGFuZ2VIYW5kbGVyKCk7IH1cbiAgICAgIH0pXG4gICAgICApO1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7IHJldHVybiBjaGFuZ2VIYW5kbGVyKCk7IH1cbiAgICAgIH0pXG4gICAgICApO1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmVkaXRvciksIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnOiBfZXZlbnQgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoc291cmNlID09IG51bGwpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zeW5jUHJldmlldyhzb3VyY2UsIHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93KTtcbiAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnbWFya2Rvd24tcHJldmlldy1wbHVzLmJyZWFrT25TaW5nbGVOZXdsaW5lJywgY2hhbmdlSGFuZGxlcikpO1xuXG4gICAgLy8gVG9nZ2xlIExhVGVYIHJlbmRlcmluZyBpZiBmb2N1cyBpcyBvbiBwcmV2aWV3IHBhbmUgb3IgYXNzb2NpYXRlZCBlZGl0b3IuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKCkgPT4ge1xuICAgICAgICBpZiAoKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgPT09IHRoaXMpIHx8IChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkgPT09IHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAgIHRoaXMucmVuZGVyTGFUZVggPSAhdGhpcy5yZW5kZXJMYVRlWDtcbiAgICAgICAgICBjaGFuZ2VIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJywgdXNlR2l0SHViU3R5bGUgPT4ge1xuICAgICAgaWYgKHVzZUdpdEh1YlN0eWxlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnLCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJyk7XG4gICAgICB9XG4gICAgfSlcbiAgICApO1xuICB9XG5cbiAgcmVuZGVyTWFya2Rvd24oKSB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkgeyB0aGlzLnNob3dMb2FkaW5nKCk7IH1cbiAgICByZXR1cm4gdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oc291cmNlID0+IHsgaWYgKHNvdXJjZSAhPSBudWxsKSB7IHJldHVybiB0aGlzLnJlbmRlck1hcmtkb3duVGV4dChzb3VyY2UpOyB9IH0pO1xuICB9XG5cbiAgcmVmcmVzaEltYWdlcyhvbGRzcmM6IHN0cmluZykge1xuICAgIGNvbnN0IGltZ3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcImltZ1tzcmNdXCIpIGFzIE5vZGVMaXN0T2Y8SFRNTEltYWdlRWxlbWVudD5cbiAgICByZXR1cm4gKCgpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgICAgZm9yIChsZXQgaW1nIG9mIEFycmF5LmZyb20oaW1ncykpIHtcbiAgICAgICAgdmFyIGxlZnQsIG92O1xuICAgICAgICBsZXQgc3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJykhXG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3JjLm1hdGNoKC9eKC4qKVxcP3Y9KFxcZCspJC8pO1xuICAgICAgICBbc3JjLCBvdl0gPSBBcnJheS5mcm9tKChsZWZ0ID0gX19ndWFyZE1ldGhvZF9fKG1hdGNoLCAnc2xpY2UnLCBvID0+IG8uc2xpY2UoMSkpKSAhPSBudWxsID8gbGVmdCA6IFtzcmNdKTtcbiAgICAgICAgaWYgKHNyYyA9PT0gb2xkc3JjKSB7XG4gICAgICAgICAgaWYgKG92ICE9IG51bGwpIHsgb3YgPSBwYXJzZUludChvdik7IH1cbiAgICAgICAgICBjb25zdCB2ID0gaW1hZ2VXYXRjaGVyLmdldFZlcnNpb24oc3JjLCB0aGlzLmdldFBhdGgoKSk7XG4gICAgICAgICAgaWYgKHYgIT09IG92KSB7XG4gICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaChpbWcuc3JjID0gYCR7c3JjfT92PSR7dn1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGltZy5zcmMgPSBgJHtzcmN9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSkoKTtcbiAgfVxuXG4gIGdldE1hcmtkb3duU291cmNlKCkge1xuICAgIGlmICgodGhpcy5maWxlICE9IG51bGwgPyB0aGlzLmZpbGUuZ2V0UGF0aCgpIDogdW5kZWZpbmVkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZWFkKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuZWRpdG9yLmdldFRleHQoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0SFRNTChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbihzb3VyY2UgPT4ge1xuICAgICAgaWYgKHNvdXJjZSA9PSBudWxsKSB7IHJldHVybjsgfVxuXG4gICAgICByZXR1cm4gcmVuZGVyZXIudG9IVE1MKHNvdXJjZSwgdGhpcy5nZXRQYXRoKCksIHRoaXMuZ2V0R3JhbW1hcigpLCB0aGlzLnJlbmRlckxhVGVYLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyTWFya2Rvd25UZXh0KHRleHQ6IHN0cmluZykge1xuICAgIHJldHVybiByZW5kZXJlci50b0RPTUZyYWdtZW50KHRleHQsIHRoaXMuZ2V0UGF0aCgpLCB0aGlzLmdldEdyYW1tYXIoKSwgdGhpcy5yZW5kZXJMYVRlWCwgKGVycm9yLCBkb21GcmFnbWVudCkgPT4ge1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNob3dFcnJvcihlcnJvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgICAgICAvLyBkaXYudXBkYXRlLXByZXZpZXcgY3JlYXRlZCBhZnRlciBjb25zdHJ1Y3RvciBzdCBVcGRhdGVQcmV2aWV3IGNhbm5vdFxuICAgICAgICAvLyBiZSBpbnN0YW5jZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgIGlmICghdGhpcy51cGRhdGVQcmV2aWV3KSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3ID0gbmV3IFVwZGF0ZVByZXZpZXcodGhpcy5maW5kKFwiZGl2LnVwZGF0ZS1wcmV2aWV3XCIpWzBdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcudXBkYXRlKGRvbUZyYWdtZW50LCB0aGlzLnJlbmRlckxhVGVYKTtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtbWFya2Rvd24nKTtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luYWxUcmlnZ2VyKCdtYXJrZG93bi1wcmV2aWV3LXBsdXM6bWFya2Rvd24tY2hhbmdlZCcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gYCR7cGF0aC5iYXNlbmFtZSh0aGlzLmdldFBhdGgoKSl9IFByZXZpZXdgO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGAke3RoaXMuZWRpdG9yLmdldFRpdGxlKCl9IFByZXZpZXdgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJNYXJrZG93biBQcmV2aWV3XCI7XG4gICAgfVxuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuIFwibWFya2Rvd25cIjtcbiAgfVxuXG4gIGdldFVSSSgpIHtcbiAgICBpZiAodGhpcy5maWxlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vJHt0aGlzLmdldFBhdGgoKX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL2VkaXRvci8ke3RoaXMuZWRpdG9ySWR9YDtcbiAgICB9XG4gIH1cblxuICBnZXRQYXRoKCkge1xuICAgIGlmICh0aGlzLmZpbGUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRQYXRoKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0UGF0aCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldEdyYW1tYXIoKSB7XG4gICAgcmV0dXJuICh0aGlzLmVkaXRvciAhPSBudWxsID8gdGhpcy5lZGl0b3IuZ2V0R3JhbW1hcigpIDogdW5kZWZpbmVkKTtcbiAgfVxuXG4gIGdldERvY3VtZW50U3R5bGVTaGVldHMoKSB7IC8vIFRoaXMgZnVuY3Rpb24gZXhpc3RzIHNvIHdlIGNhbiBzdHViIGl0XG4gICAgcmV0dXJuIGRvY3VtZW50LnN0eWxlU2hlZXRzO1xuICB9XG5cbiAgZ2V0VGV4dEVkaXRvclN0eWxlcygpIHtcblxuICAgIGNvbnN0IHRleHRFZGl0b3JTdHlsZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXRvbS1zdHlsZXNcIik7XG4gICAgdGV4dEVkaXRvclN0eWxlcy5pbml0aWFsaXplKGF0b20uc3R5bGVzKTtcbiAgICB0ZXh0RWRpdG9yU3R5bGVzLnNldEF0dHJpYnV0ZShcImNvbnRleHRcIiwgXCJhdG9tLXRleHQtZWRpdG9yXCIpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGV4dEVkaXRvclN0eWxlcyk7XG5cbiAgICAvLyBFeHRyYWN0IHN0eWxlIGVsZW1lbnRzIGNvbnRlbnRcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KHRleHRFZGl0b3JTdHlsZXMuY2hpbGROb2RlcykubWFwKHN0eWxlRWxlbWVudCA9PiBzdHlsZUVsZW1lbnQuaW5uZXJUZXh0KTtcbiAgfVxuXG4gIGdldE1hcmtkb3duUHJldmlld0NTUygpIHtcbiAgICBjb25zdCBtYXJrZG93UHJldmlld1J1bGVzID0gW107XG4gICAgY29uc3QgcnVsZVJlZ0V4cCA9IC9cXC5tYXJrZG93bi1wcmV2aWV3LztcbiAgICBjb25zdCBjc3NVcmxSZWZFeHAgPSAvdXJsXFwoYXRvbTpcXC9cXC9tYXJrZG93bi1wcmV2aWV3LXBsdXNcXC9hc3NldHNcXC8oLiopXFwpLztcblxuICAgIGZvciAobGV0IHN0eWxlc2hlZXQgb2YgQXJyYXkuZnJvbSh0aGlzLmdldERvY3VtZW50U3R5bGVTaGVldHMoKSkpIHtcbiAgICAgIGlmIChzdHlsZXNoZWV0LnJ1bGVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yIChsZXQgcnVsZSBvZiBBcnJheS5mcm9tKHN0eWxlc2hlZXQucnVsZXMpKSB7XG4gICAgICAgICAgLy8gV2Ugb25seSBuZWVkIGAubWFya2Rvd24tcmV2aWV3YCBjc3NcbiAgICAgICAgICBpZiAoKHJ1bGUuc2VsZWN0b3JUZXh0ICE9IG51bGwgPyBydWxlLnNlbGVjdG9yVGV4dC5tYXRjaChydWxlUmVnRXhwKSA6IHVuZGVmaW5lZCkgIT0gbnVsbCkgeyBtYXJrZG93UHJldmlld1J1bGVzLnB1c2gocnVsZS5jc3NUZXh0KTsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtkb3dQcmV2aWV3UnVsZXNcbiAgICAgIC5jb25jYXQodGhpcy5nZXRUZXh0RWRpdG9yU3R5bGVzKCkpXG4gICAgICAuam9pbignXFxuJylcbiAgICAgIC5yZXBsYWNlKC9hdG9tLXRleHQtZWRpdG9yL2csICdwcmUuZWRpdG9yLWNvbG9ycycpXG4gICAgICAucmVwbGFjZSgvOmhvc3QvZywgJy5ob3N0JykgLy8gUmVtb3ZlIHNoYWRvdy1kb20gOmhvc3Qgc2VsZWN0b3IgY2F1c2luZyBwcm9ibGVtIG9uIEZGXG4gICAgICAucmVwbGFjZShjc3NVcmxSZWZFeHAsIGZ1bmN0aW9uKG1hdGNoLCBhc3NldHNOYW1lLCBvZmZzZXQsIHN0cmluZykgeyAvLyBiYXNlNjQgZW5jb2RlIGFzc2V0c1xuICAgICAgICBjb25zdCBhc3NldFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vYXNzZXRzJywgYXNzZXRzTmFtZSk7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhhc3NldFBhdGgsICdiaW5hcnknKTtcbiAgICAgICAgY29uc3QgYmFzZTY0RGF0YSA9IG5ldyBCdWZmZXIob3JpZ2luYWxEYXRhLCAnYmluYXJ5JykudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgICByZXR1cm4gYHVybCgnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwke2Jhc2U2NERhdGF9JylgO1xuICAgIH0pO1xuICB9XG5cbiAgc2hvd0Vycm9yKHJlc3VsdCkge1xuICAgIGNvbnN0IGZhaWx1cmVNZXNzYWdlID0gcmVzdWx0ICE9IG51bGwgPyByZXN1bHQubWVzc2FnZSA6IHVuZGVmaW5lZDtcblxuICAgIHJldHVybiB0aGlzLmh0bWwoJCQkKGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5oMignUHJldmlld2luZyBNYXJrZG93biBGYWlsZWQnKTtcbiAgICAgIGlmIChmYWlsdXJlTWVzc2FnZSAhPSBudWxsKSB7IHJldHVybiB0aGlzLmgzKGZhaWx1cmVNZXNzYWdlKTsgfVxuICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHNob3dMb2FkaW5nKCkge1xuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuaHRtbCgkJCQoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXYoe2NsYXNzOiAnbWFya2Rvd24tc3Bpbm5lcid9LCAnTG9hZGluZyBNYXJrZG93blxcdTIwMjYnKTtcbiAgICB9KVxuICAgICk7XG4gIH1cblxuICBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKTtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzZWxlY3Rpb24uYmFzZU5vZGU7XG5cbiAgICAvLyBVc2UgZGVmYXVsdCBjb3B5IGV2ZW50IGhhbmRsZXIgaWYgdGhlcmUgaXMgc2VsZWN0ZWQgdGV4dCBpbnNpZGUgdGhpcyB2aWV3XG4gICAgaWYgKHNlbGVjdGVkVGV4dCAmJiAoc2VsZWN0ZWROb2RlICE9IG51bGwpICYmICgodGhpc1swXSA9PT0gc2VsZWN0ZWROb2RlKSB8fCAkLmNvbnRhaW5zKHRoaXNbMF0sIHNlbGVjdGVkTm9kZSkpKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgdGhpcy5nZXRIVE1MKGZ1bmN0aW9uKGVycm9yLCBodG1sKSB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdDb3B5aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGF0b20uY2xpcGJvYXJkLndyaXRlKGh0bWwpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBzYXZlQXMoKSB7XG4gICAgbGV0IGh0bWxGaWxlUGF0aDtcbiAgICBpZiAodGhpcy5sb2FkaW5nKSB7IHJldHVybjsgfVxuXG4gICAgbGV0IGZpbGVQYXRoID0gdGhpcy5nZXRQYXRoKCk7XG4gICAgbGV0IHRpdGxlID0gJ01hcmtkb3duIHRvIEhUTUwnO1xuICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgdGl0bGUgPSBwYXRoLnBhcnNlKGZpbGVQYXRoKS5uYW1lO1xuICAgICAgZmlsZVBhdGggKz0gJy5odG1sJztcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHByb2plY3RQYXRoO1xuICAgICAgZmlsZVBhdGggPSAndW50aXRsZWQubWQuaHRtbCc7XG4gICAgICBpZiAocHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSkge1xuICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgZmlsZVBhdGgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChodG1sRmlsZVBhdGggPSBhdG9tLnNob3dTYXZlRGlhbG9nU3luYyhmaWxlUGF0aCkpIHtcblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0SFRNTCgoZXJyb3IsIGh0bWxCb2R5KSA9PiB7XG4gICAgICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybignU2F2aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBtYXRoamF4U2NyaXB0O1xuICAgICAgICAgIGlmICh0aGlzLnJlbmRlckxhVGVYKSB7XG4gICAgICAgICAgICBtYXRoamF4U2NyaXB0ID0gYFxcXG5cbjxzY3JpcHQgdHlwZT1cInRleHQveC1tYXRoamF4LWNvbmZpZ1wiPlxuICBNYXRoSmF4Lkh1Yi5Db25maWcoe1xuICAgIGpheDogW1wiaW5wdXQvVGVYXCIsXCJvdXRwdXQvSFRNTC1DU1NcIl0sXG4gICAgZXh0ZW5zaW9uczogW10sXG4gICAgVGVYOiB7XG4gICAgICBleHRlbnNpb25zOiBbXCJBTVNtYXRoLmpzXCIsXCJBTVNzeW1ib2xzLmpzXCIsXCJub0Vycm9ycy5qc1wiLFwibm9VbmRlZmluZWQuanNcIl1cbiAgICB9LFxuICAgIHNob3dNYXRoTWVudTogZmFsc2VcbiAgfSk7XG48L3NjcmlwdD5cbjxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cImh0dHBzOi8vY2RuLm1hdGhqYXgub3JnL21hdGhqYXgvbGF0ZXN0L01hdGhKYXguanNcIj5cbjwvc2NyaXB0PlxcXG5gO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXRoamF4U2NyaXB0ID0gXCJcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaHRtbCA9IGBcXFxuPCFET0NUWVBFIGh0bWw+XG48aHRtbD5cbiAgPGhlYWQ+XG4gICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIiAvPlxuICAgICAgPHRpdGxlPiR7dGl0bGV9PC90aXRsZT4ke21hdGhqYXhTY3JpcHR9XG4gICAgICA8c3R5bGU+JHt0aGlzLmdldE1hcmtkb3duUHJldmlld0NTUygpfTwvc3R5bGU+XG4gIDwvaGVhZD5cbiAgPGJvZHkgY2xhc3M9J21hcmtkb3duLXByZXZpZXcnPiR7aHRtbEJvZHl9PC9ib2R5PlxuPC9odG1sPmAgKyBcIlxcblwiOyAvLyBFbnN1cmUgdHJhaWxpbmcgbmV3bGluZVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhodG1sRmlsZVBhdGgsIGh0bWwpO1xuICAgICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGh0bWxGaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlzRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpc1swXSA9PT0gKG90aGVyICE9IG51bGwgPyBvdGhlclswXSA6IHVuZGVmaW5lZCk7IC8vIENvbXBhcmUgRE9NIGVsZW1lbnRzXG4gIH1cblxuICAvL1xuICAvLyBGaW5kIHRoZSBjbG9zZXN0IGFuY2VzdG9yIG9mIGFuIGVsZW1lbnQgdGhhdCBpcyBub3QgYSBkZWNlbmRhbnQgb2YgZWl0aGVyXG4gIC8vIGBzcGFuLm1hdGhgIG9yIGBzcGFuLmF0b20tdGV4dC1lZGl0b3JgLlxuICAvL1xuICAvLyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IGZyb20gd2hpY2ggdGhlIHNlYXJjaCBmb3IgYVxuICAvLyAgIGNsb3Nlc3QgYW5jZXN0b3IgYmVnaW5zLlxuICAvLyBAcmV0dXJuIHtIVE1MRWxlbWVudH0gVGhlIGNsb3Nlc3QgYW5jZXN0b3IgdG8gYGVsZW1lbnRgIHRoYXQgZG9lcyBub3RcbiAgLy8gICBjb250YWluIGVpdGhlciBgc3Bhbi5tYXRoYCBvciBgc3Bhbi5hdG9tLXRleHQtZWRpdG9yYC5cbiAgLy9cbiAgYnViYmxlVG9Db250YWluZXJFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgIGxldCB0ZXN0RWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgd2hpbGUgKHRlc3RFbGVtZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSB0ZXN0RWxlbWVudC5wYXJlbnRFbGVtZW50IVxuICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ01hdGhKYXhfRGlzcGxheScpKSB7IHJldHVybiBwYXJlbnQucGFyZW50RWxlbWVudCEgfVxuICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F0b20tdGV4dC1lZGl0b3InKSkgeyByZXR1cm4gcGFyZW50IH1cbiAgICAgIHRlc3RFbGVtZW50ID0gcGFyZW50XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgLy9cbiAgLy8gRGV0ZXJtaW5lIGEgc3Vic2VxdWVuY2Ugb2YgYSBzZXF1ZW5jZSBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGEgcGF0aCB0aHJvdWdoXG4gIC8vIEhUTUxFbGVtZW50cyB0aGF0IGRvZXMgbm90IGNvbnRpbnVlIGRlZXBlciB0aGFuIGEgdGFibGUgZWxlbWVudC5cbiAgLy9cbiAgLy8gQHBhcmFtIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IHBhdGhUb1Rva2VuIEFycmF5IG9mIHRva2Vuc1xuICAvLyAgIHJlcHJlc2VudGluZyBhIHBhdGggdG8gYSBIVE1MRWxlbWVudCB3aXRoIHRoZSByb290IGVsZW1lbnQgYXRcbiAgLy8gICBwYXRoVG9Ub2tlblswXSBhbmQgdGhlIHRhcmdldCBlbGVtZW50IGF0IHRoZSBoaWdoZXN0IGluZGV4LiBFYWNoIGVsZW1lbnRcbiAgLy8gICBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHNcbiAgLy8gICBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lIGB0YWdgLlxuICAvLyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IFRoZSBzdWJzZXF1ZW5jZSBvZiBwYXRoVG9Ub2tlbiB0aGF0XG4gIC8vICAgbWFpbnRhaW5zIHRoZSBzYW1lIHJvb3QgYnV0IHRlcm1pbmF0ZXMgYXQgYSB0YWJsZSBlbGVtZW50IG9yIHRoZSB0YXJnZXRcbiAgLy8gICBlbGVtZW50LCB3aGljaGV2ZXIgY29tZXMgZmlyc3QuXG4gIC8vXG4gIGJ1YmJsZVRvQ29udGFpbmVyVG9rZW4ocGF0aFRvVG9rZW46IEFycmF5PHt0YWc6IHN0cmluZywgaW5kZXg6IG51bWJlcn0+KSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGVuZCA9IHBhdGhUb1Rva2VuLmxlbmd0aC0xOyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICBpZiAocGF0aFRvVG9rZW5baV0udGFnID09PSAndGFibGUnKSB7IHJldHVybiBwYXRoVG9Ub2tlbi5zbGljZSgwLCBpKzEpOyB9XG4gICAgfVxuICAgIHJldHVybiBwYXRoVG9Ub2tlbjtcbiAgfVxuXG4gIC8vXG4gIC8vIEVuY29kZSB0YWdzIGZvciBtYXJrZG93bi1pdC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBFbmNvZGUgdGhlIHRhZyBvZiBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtzdHJpbmd9IEVuY29kZWQgdGFnLlxuICAvL1xuICBlbmNvZGVUYWcoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWF0aCcpKSB7IHJldHVybiAnbWF0aCc7IH1cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F0b20tdGV4dC1lZGl0b3InKSkgeyByZXR1cm4gJ2NvZGUnOyB9IC8vIG9ubHkgdG9rZW4udHlwZSBpcyBgZmVuY2VgIGNvZGUgYmxvY2tzIHNob3VsZCBldmVyIGJlIGZvdW5kIGluIHRoZSBmaXJzdCBsZXZlbCBvZiB0aGUgdG9rZW5zIGFycmF5XG4gICAgcmV0dXJuIGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgLy9cbiAgLy8gRGVjb2RlIHRhZ3MgdXNlZCBieSBtYXJrZG93bi1pdFxuICAvL1xuICAvLyBAcGFyYW0ge21hcmtkb3duLWl0LlRva2VufSB0b2tlbiBEZWNvZGUgdGhlIHRhZyBvZiB0b2tlbi5cbiAgLy8gQHJldHVybiB7c3RyaW5nfG51bGx9IERlY29kZWQgdGFnIG9yIGBudWxsYCBpZiB0aGUgdG9rZW4gaGFzIG5vIHRhZy5cbiAgLy9cbiAgZGVjb2RlVGFnKHRva2VuOiBUb2tlbik6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICh0b2tlbi50YWcgPT09ICdtYXRoJykgeyByZXR1cm4gJ3NwYW4nOyB9XG4gICAgaWYgKHRva2VuLnRhZyA9PT0gJ2NvZGUnKSB7IHJldHVybiAnc3Bhbic7IH1cbiAgICBpZiAodG9rZW4udGFnID09PSBcIlwiKSB7IHJldHVybiBudWxsOyB9XG4gICAgcmV0dXJuIHRva2VuLnRhZztcbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBwYXRoIHRvIGEgdGFyZ2V0IGVsZW1lbnQgZnJvbSBhIGNvbnRhaW5lciBgLm1hcmtkb3duLXByZXZpZXdgLlxuICAvL1xuICAvLyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRhcmdldCBIVE1MRWxlbWVudC5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBBcnJheSBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGEgcGF0aFxuICAvLyAgIHRvIGBlbGVtZW50YCBmcm9tIGAubWFya2Rvd24tcHJldmlld2AuIFRoZSByb290IGAubWFya2Rvd24tcHJldmlld2BcbiAgLy8gICBlbGVtZW50IGlzIHRoZSBmaXJzdCBlbGVtZW50cyBpbiB0aGUgYXJyYXkgYW5kIHRoZSB0YXJnZXQgZWxlbWVudFxuICAvLyAgIGBlbGVtZW50YCBhdCB0aGUgaGlnaGVzdCBpbmRleC4gRWFjaCBlbGVtZW50IGNvbnNpc3RzIG9mIGEgYHRhZ2AgYW5kXG4gIC8vICAgYGluZGV4YCByZXByZXNlbnRpbmcgaXRzIGluZGV4IGFtb25nc3QgaXRzIHNpYmxpbmcgZWxlbWVudHMgb2YgdGhlIHNhbWVcbiAgLy8gICBgdGFnYC5cbiAgLy9cbiAgZ2V0UGF0aFRvRWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCk6IEFycmF5PHt0YWc6IHN0cmluZywgaW5kZXg6IG51bWJlcn0+IHtcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hcmtkb3duLXByZXZpZXcnKSkge1xuICAgICAgcmV0dXJuIFt7XG4gICAgICAgIHRhZzogJ2RpdicsXG4gICAgICAgIGluZGV4OiAwXG4gICAgICB9XG4gICAgICBdO1xuICAgIH1cblxuICAgIGVsZW1lbnQgICAgICAgPSB0aGlzLmJ1YmJsZVRvQ29udGFpbmVyRWxlbWVudChlbGVtZW50KTtcbiAgICBjb25zdCB0YWcgICAgICAgICAgID0gdGhpcy5lbmNvZGVUYWcoZWxlbWVudCk7XG4gICAgY29uc3Qgc2libGluZ3MgICAgICA9IGVsZW1lbnQucGFyZW50RWxlbWVudCEuY2hpbGRyZW47XG4gICAgbGV0IHNpYmxpbmdzQ291bnQgPSAwO1xuXG4gICAgZm9yIChsZXQgc2libGluZyBvZiBBcnJheS5mcm9tKHNpYmxpbmdzKSkge1xuICAgICAgY29uc3Qgc2libGluZ1RhZyAgPSBzaWJsaW5nLm5vZGVUeXBlID09PSAxID8gdGhpcy5lbmNvZGVUYWcoc2libGluZyBhcyBIVE1MRWxlbWVudCkgOiBudWxsO1xuICAgICAgaWYgKHNpYmxpbmcgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGF0aFRvRWxlbWVudCA9IHRoaXMuZ2V0UGF0aFRvRWxlbWVudChlbGVtZW50LnBhcmVudEVsZW1lbnQhKTtcbiAgICAgICAgcGF0aFRvRWxlbWVudC5wdXNoKHtcbiAgICAgICAgICB0YWcsXG4gICAgICAgICAgaW5kZXg6IHNpYmxpbmdzQ291bnRcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwYXRoVG9FbGVtZW50O1xuICAgICAgfSBlbHNlIGlmIChzaWJsaW5nVGFnID09PSB0YWcpIHtcbiAgICAgICAgc2libGluZ3NDb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWx1cmUgaW4gZ2V0UGF0aFRvRWxlbWVudCcpXG4gIH1cblxuICAvL1xuICAvLyBTZXQgdGhlIGFzc29jaWF0ZWQgZWRpdG9ycyBjdXJzb3IgYnVmZmVyIHBvc2l0aW9uIHRvIHRoZSBsaW5lIHJlcHJlc2VudGluZ1xuICAvLyB0aGUgc291cmNlIG1hcmtkb3duIG9mIGEgdGFyZ2V0IGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGFyZ2V0IGVsZW1lbnQgY29udGFpbmVkIHdpdGhpbiB0aGUgYXNzb2ljYXRlZFxuICAvLyAgIGAubWFya2Rvd24tcHJldmlld2AgY29udGFpbmVyLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0byBpZGVudGlmeSB0aGVcbiAgLy8gICBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgIGFuZCBzZXQgdGhlIGN1cnNvciB0byB0aGF0IGxpbmUuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YC4gSWYgbm9cbiAgLy8gICBsaW5lIGlzIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jU291cmNlKHRleHQsIGVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQpO1xuICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKTsgLy8gcmVtb3ZlIGRpdi5tYXJrZG93bi1wcmV2aWV3XG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpOyAvLyByZW1vdmUgZGl2LnVwZGF0ZS1wcmV2aWV3XG4gICAgaWYgKCFwYXRoVG9FbGVtZW50Lmxlbmd0aCkgeyByZXR1cm47IH1cblxuICAgIGlmIChtYXJrZG93bkl0ID09IG51bGwpIHsgIG1hcmtkb3duSXQgPSByZXF1aXJlKCcuL21hcmtkb3duLWl0LWhlbHBlcicpOyB9XG4gICAgY29uc3QgdG9rZW5zICAgICAgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKTtcbiAgICBsZXQgZmluYWxUb2tlbiAgPSBudWxsO1xuICAgIGxldCBsZXZlbCAgICAgICA9IDA7XG5cbiAgICBmb3IgKGxldCB0b2tlbiBvZiBBcnJheS5mcm9tKHRva2VucykpIHtcbiAgICAgIGlmICh0b2tlbi5sZXZlbCA8IGxldmVsKSB7IGJyZWFrOyB9XG4gICAgICBpZiAodG9rZW4uaGlkZGVuKSB7IGNvbnRpbnVlOyB9XG4gICAgICBpZiAoKHRva2VuLnRhZyA9PT0gcGF0aFRvRWxlbWVudFswXS50YWcpICYmICh0b2tlbi5sZXZlbCA9PT0gbGV2ZWwpKSB7XG4gICAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAxKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGlmICh0b2tlbi5tYXAgIT0gbnVsbCkgeyBmaW5hbFRva2VuID0gdG9rZW47IH1cbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKTtcbiAgICAgICAgICAgIGxldmVsKys7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnRbMF0uaW5kZXgtLTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoKHRva2VuLm5lc3RpbmcgPT09IDApICYmIFsnbWF0aCcsICdjb2RlJywgJ2hyJ10uaW5jbHVkZXModG9rZW4udGFnKSkge1xuICAgICAgICAgIGlmIChwYXRoVG9FbGVtZW50WzBdLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICBmaW5hbFRva2VuID0gdG9rZW47XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHBhdGhUb0VsZW1lbnQubGVuZ3RoID09PSAwKSB7IGJyZWFrOyB9XG4gICAgfVxuXG4gICAgaWYgKGZpbmFsVG9rZW4gIT0gbnVsbCkge1xuICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2ZpbmFsVG9rZW4ubWFwWzBdLCAwXSk7XG4gICAgICByZXR1cm4gZmluYWxUb2tlbi5tYXBbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBwYXRoIHRvIGEgdGFyZ2V0IHRva2VuLlxuICAvL1xuICAvLyBAcGFyYW0geyhtYXJrZG93bi1pdC5Ub2tlbilbXX0gdG9rZW5zIEFycmF5IG9mIHRva2VucyBhcyByZXR1cm5lZCBieVxuICAvLyAgIGBtYXJrZG93bi1pdC5wYXJzZSgpYC5cbiAgLy8gQHBhcmFtIHtudW1iZXJ9IGxpbmUgTGluZSByZXByZXNlbnRpbmcgdGhlIHRhcmdldCB0b2tlbi5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBBcnJheSByZXByZXNlbnRpbmcgYSBwYXRoIHRvIHRoZVxuICAvLyAgIHRhcmdldCB0b2tlbi4gVGhlIHJvb3QgdG9rZW4gaXMgcmVwcmVzZW50ZWQgYnkgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlXG4gIC8vICAgYXJyYXkgYW5kIHRoZSB0YXJnZXQgdG9rZW4gYnkgdGhlIGxhc3QgZWxtZW50LiBFYWNoIGVsZW1lbnQgY29uc2lzdHMgb2YgYVxuICAvLyAgIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHMgc2libGluZyB0b2tlbnMgaW5cbiAgLy8gICBgdG9rZW5zYCBvZiB0aGUgc2FtZSBgdGFnYC4gYGxpbmVgIHdpbGwgbGllIGJldHdlZW4gdGhlIHByb3BlcnRpZXNcbiAgLy8gICBgbWFwWzBdYCBhbmQgYG1hcFsxXWAgb2YgdGhlIHRhcmdldCB0b2tlbi5cbiAgLy9cbiAgZ2V0UGF0aFRvVG9rZW4odG9rZW5zOiBUb2tlbltdLCBsaW5lOiBudW1iZXIpIHtcbiAgICBsZXQgcGF0aFRvVG9rZW46IEFycmF5PHt0YWc6IHN0cmluZywgaW5kZXg6IG51bWJlcn0+ICAgPSBbXTtcbiAgICBsZXQgdG9rZW5UYWdDb3VudDogbnVtYmVyW10gPSBbXTtcbiAgICBsZXQgbGV2ZWwgICAgICAgICA9IDA7XG5cbiAgICBmb3IgKGxldCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgIGlmICh0b2tlbi5sZXZlbCA8IGxldmVsKSB7IGJyZWFrOyB9XG4gICAgICBpZiAodG9rZW4uaGlkZGVuKSB7IGNvbnRpbnVlOyB9XG4gICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gLTEpIHsgY29udGludWU7IH1cblxuICAgICAgdG9rZW4udGFnID0gdGhpcy5kZWNvZGVUYWcodG9rZW4pO1xuICAgICAgaWYgKHRva2VuLnRhZyA9PSBudWxsKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgIGlmICgodG9rZW4ubWFwICE9IG51bGwpICYmIChsaW5lID49IHRva2VuLm1hcFswXSkgJiYgKGxpbmUgPD0gKHRva2VuLm1hcFsxXS0xKSkpIHtcbiAgICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IDEpIHtcbiAgICAgICAgICBwYXRoVG9Ub2tlbi5wdXNoKHtcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnLFxuICAgICAgICAgICAgaW5kZXg6IHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSAhPSBudWxsID8gdG9rZW5UYWdDb3VudFt0b2tlbi50YWddIDogMFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRva2VuVGFnQ291bnQgPSBbXTtcbiAgICAgICAgICBsZXZlbCsrO1xuICAgICAgICB9IGVsc2UgaWYgKHRva2VuLm5lc3RpbmcgPT09IDApIHtcbiAgICAgICAgICBwYXRoVG9Ub2tlbi5wdXNoKHtcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnLFxuICAgICAgICAgICAgaW5kZXg6IHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSAhPSBudWxsID8gdG9rZW5UYWdDb3VudFt0b2tlbi50YWddIDogMFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRva2VuLmxldmVsID09PSBsZXZlbCkge1xuICAgICAgICBpZiAodG9rZW5UYWdDb3VudFt0b2tlbi50YWddICE9IG51bGwpIHtcbiAgICAgICAgdG9rZW5UYWdDb3VudFt0b2tlbi50YWddKys7XG4gICAgICAgIH0gZWxzZSB7IHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSA9IDE7IH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYXRoVG9Ub2tlbiA9IHRoaXMuYnViYmxlVG9Db250YWluZXJUb2tlbihwYXRoVG9Ub2tlbik7XG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuO1xuICB9XG5cbiAgLy9cbiAgLy8gU2Nyb2xsIHRoZSBhc3NvY2lhdGVkIHByZXZpZXcgdG8gdGhlIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSB0YXJnZXQgbGluZSBvZlxuICAvLyBvZiB0aGUgc291cmNlIG1hcmtkb3duLlxuICAvL1xuICAvLyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBUYXJnZXQgbGluZSBvZiBgdGV4dGAuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvXG4gIC8vICAgaWRlbnRpZnkgdGhlIGVsbWVudCBvZiB0aGUgYXNzb2NpYXRlZCBgLm1hcmtkb3duLXByZXZpZXdgIHRoYXQgcmVwcmVzZW50c1xuICAvLyAgIGBsaW5lYCBhbmQgc2Nyb2xsIHRoZSBgLm1hcmtkb3duLXByZXZpZXdgIHRvIHRoYXQgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBlbGVtZW50IHRoYXQgcmVwcmVzZW50cyBgbGluZWAuIElmIG5vIGVsZW1lbnQgaXNcbiAgLy8gICBpZGVudGlmaWVkIGBudWxsYCBpcyByZXR1cm5lZC5cbiAgLy9cbiAgc3luY1ByZXZpZXcodGV4dCwgbGluZSkge1xuICAgIGlmIChtYXJrZG93bkl0ID09IG51bGwpIHsgIG1hcmtkb3duSXQgPSByZXF1aXJlKCcuL21hcmtkb3duLWl0LWhlbHBlcicpOyB9XG4gICAgY29uc3QgdG9rZW5zICAgICAgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKTtcbiAgICBjb25zdCBwYXRoVG9Ub2tlbiA9IHRoaXMuZ2V0UGF0aFRvVG9rZW4odG9rZW5zLCBsaW5lKTtcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5maW5kKCcudXBkYXRlLXByZXZpZXcnKS5lcSgwKTtcbiAgICBmb3IgKGxldCB0b2tlbiBvZiBBcnJheS5mcm9tKHBhdGhUb1Rva2VuKSkge1xuICAgICAgY29uc3QgY2FuZGlkYXRlRWxlbWVudCA9IGVsZW1lbnQuY2hpbGRyZW4odG9rZW4udGFnKS5lcSh0b2tlbi5pbmRleCk7XG4gICAgICBpZiAoY2FuZGlkYXRlRWxlbWVudC5sZW5ndGggIT09IDApIHtcbiAgICAgIGVsZW1lbnQgPSBjYW5kaWRhdGVFbGVtZW50O1xuICAgICAgfSBlbHNlIHsgYnJlYWs7IH1cbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudFswXS5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JykpIHsgcmV0dXJuIG51bGw7IH0gLy8gRG8gbm90IGp1bXAgdG8gdGhlIHRvcCBvZiB0aGUgcHJldmlldyBmb3IgYmFkIHN5bmNzXG5cbiAgICBpZiAoIWVsZW1lbnRbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKCd1cGRhdGUtcHJldmlldycpKSB7IGVsZW1lbnRbMF0uc2Nyb2xsSW50b1ZpZXcoKTsgfVxuICAgIGNvbnN0IG1heFNjcm9sbFRvcCA9IHRoaXMuZWxlbWVudC5zY3JvbGxIZWlnaHQgLSB0aGlzLmlubmVySGVpZ2h0KCk7XG4gICAgaWYgKCEodGhpcy5zY3JvbGxUb3AoKSA+PSBtYXhTY3JvbGxUb3ApKSB7IHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgLT0gdGhpcy5pbm5lckhlaWdodCgpLzQ7IH1cblxuICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2ZsYXNoJyk7XG4gICAgc2V0VGltZW91dCgoICgpID0+IGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ZsYXNoJykpLCAxMDAwKTtcblxuICAgIHJldHVybiBlbGVtZW50WzBdO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9fZ3VhcmRfXyh2YWx1ZSwgdHJhbnNmb3JtKSB7XG4gIHJldHVybiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSAhPT0gbnVsbCkgPyB0cmFuc2Zvcm0odmFsdWUpIDogdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gX19ndWFyZE1ldGhvZF9fKG9iaiwgbWV0aG9kTmFtZSwgdHJhbnNmb3JtKSB7XG4gIGlmICh0eXBlb2Ygb2JqICE9PSAndW5kZWZpbmVkJyAmJiBvYmogIT09IG51bGwgJiYgdHlwZW9mIG9ialttZXRob2ROYW1lXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB0cmFuc2Zvcm0ob2JqLCBtZXRob2ROYW1lKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iXX0=