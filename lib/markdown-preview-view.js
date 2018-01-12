"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const atom_1 = require("atom");
const _ = require("lodash");
const fs = require("fs-plus");
const renderer = require("./renderer");
const update_preview_1 = require("./update-preview");
const markdownIt = require("./markdown-it-helper");
const imageWatcher = require("./image-watch-helper");
const util_1 = require("./util");
class MarkdownPreviewView {
    constructor({ editorId, filePath }) {
        this.loading = true;
        this.renderPromise = new Promise((resolve) => (this.resolve = resolve));
        this.emitter = new atom_1.Emitter();
        this.renderLaTeX = !!atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
        this.disposables = new atom_1.CompositeDisposable();
        this.loaded = true;
        this.getPathToElement = this.getPathToElement.bind(this);
        this.syncSource = this.syncSource.bind(this);
        this.getPathToToken = this.getPathToToken.bind(this);
        this.syncPreview = this.syncPreview.bind(this);
        this.editorId = editorId;
        this.filePath = filePath;
        this.element = document.createElement('iframe');
        this.element.getModel = () => this;
        this.element.classList.add('markdown-preview', 'native-key-bindings');
        this.element.src = 'about:blank';
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.div = document.createElement('div');
        this.div.classList.add('markdown-preview', 'native-key-bindings');
        this.div.tabIndex = -1;
        this.preview = document.createElement('div');
        this.preview.classList.add('update-preview');
        this.div.appendChild(this.preview);
        this.element.onload = () => {
            for (const se of atom.styles.getStyleElements()) {
                this.element.contentDocument.head.appendChild(se);
            }
            this.element.contentDocument.body.appendChild(this.div);
            this.div.oncontextmenu = (e) => {
                this.lastTarget = e.target;
                atom.contextMenu.showForEvent(Object.assign({}, e, { target: this.element }));
            };
        };
        if (this.editorId !== undefined) {
            this.resolveEditor(this.editorId);
        }
        else if (this.filePath !== undefined) {
            this.subscribeToFilePath(this.filePath);
        }
    }
    text() {
        return this.div.innerText;
    }
    find(what) {
        return this.div.querySelector(what);
    }
    findAll(what) {
        return this.div.querySelectorAll(what);
    }
    getRoot() {
        return this.div;
    }
    serialize() {
        return {
            deserializer: 'MarkdownPreviewView',
            filePath: this.getPath() || this.filePath,
            editorId: this.editorId,
        };
    }
    destroy() {
        const path = this.getPath();
        path && imageWatcher.removeFile(path);
        this.disposables.dispose();
        this.element.remove();
    }
    onDidChangeTitle(callback) {
        return this.emitter.on('did-change-title', callback);
    }
    onDidChangeModified(_callback) {
        return new atom_1.Disposable();
    }
    onDidChangeMarkdown(callback) {
        return this.emitter.on('did-change-markdown', callback);
    }
    subscribeToFilePath(filePath) {
        this.file = new atom_1.File(filePath);
        this.emitter.emit('did-change-title');
        this.handleEvents();
        util_1.handlePromise(this.renderMarkdown());
    }
    resolveEditor(editorId) {
        this.editor = this.editorForId(editorId);
        if (this.editor) {
            this.emitter.emit('did-change-title');
            this.handleEvents();
            util_1.handlePromise(this.renderMarkdown());
        }
        else {
            const pane = atom.workspace.paneForItem(this);
            pane && pane.destroyItem(this);
        }
    }
    editorForId(editorId) {
        for (const editor of atom.workspace.getTextEditors()) {
            if (editor.id === editorId) {
                return editor;
            }
        }
        return undefined;
    }
    handleEvents() {
        this.disposables.add(atom.grammars.onDidAddGrammar(() => _.debounce(() => {
            util_1.handlePromise(this.renderMarkdown());
        }, 250)));
        this.disposables.add(atom.grammars.onDidUpdateGrammar(_.debounce(() => {
            util_1.handlePromise(this.renderMarkdown());
        }, 250)));
        atom.commands.add(this.element, {
            'core:move-up': () => this.div.scrollBy({ top: -10 }),
            'core:move-down': () => this.div.scrollBy({ top: 10 }),
            'core:save-as': (event) => {
                event.stopPropagation();
                util_1.handlePromise(this.saveAs());
            },
            'core:copy': (event) => {
                if (this.copyToClipboard())
                    event.stopPropagation();
            },
            'markdown-preview-plus:zoom-in': () => {
                const zoomLevel = parseFloat(this.div.style.zoom || '1');
                this.div.style.zoom = (zoomLevel + 0.1).toString();
            },
            'markdown-preview-plus:zoom-out': () => {
                const zoomLevel = parseFloat(this.div.style.zoom || '1');
                this.div.style.zoom = (zoomLevel - 0.1).toString();
            },
            'markdown-preview-plus:reset-zoom': () => (this.div.style.zoom = '1'),
            'markdown-preview-plus:sync-source': (_event) => {
                const lastTarget = this.lastTarget;
                if (!lastTarget)
                    return;
                util_1.handlePromise(this.getMarkdownSource().then((source) => {
                    if (source === undefined) {
                        return;
                    }
                    this.syncSource(source, lastTarget);
                }));
            },
        });
        const changeHandler = () => {
            util_1.handlePromise(this.renderMarkdown());
            const pane = atom.workspace.paneForItem(this);
            if (pane !== undefined && pane !== atom.workspace.getActivePane()) {
                pane.activateItem(this);
            }
        };
        if (this.file) {
            this.disposables.add(this.file.onDidChange(changeHandler));
        }
        else if (this.editor) {
            this.disposables.add(this.editor.getBuffer().onDidStopChanging(function () {
                if (atom.config.get('markdown-preview-plus.liveUpdate')) {
                    changeHandler();
                }
            }));
            this.disposables.add(this.editor.onDidChangePath(() => {
                this.emitter.emit('did-change-title');
            }));
            this.disposables.add(this.editor.getBuffer().onDidSave(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    changeHandler();
                }
            }));
            this.disposables.add(this.editor.getBuffer().onDidReload(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    changeHandler();
                }
            }));
            this.disposables.add(atom.commands.add(atom.views.getView(this.editor), {
                'markdown-preview-plus:sync-preview': async (_event) => {
                    const source = await this.getMarkdownSource();
                    if (source === undefined) {
                        return;
                    }
                    if (!this.editor)
                        return;
                    this.syncPreview(source, this.editor.getCursorBufferPosition().row);
                },
            }));
        }
        this.disposables.add(atom.config.onDidChange('markdown-preview-plus.breakOnSingleNewline', changeHandler));
        this.disposables.add(atom.commands.add('atom-workspace', {
            'markdown-preview-plus:toggle-render-latex': () => {
                if (atom.workspace.getActivePaneItem() === this ||
                    atom.workspace.getActiveTextEditor() === this.editor) {
                    this.renderLaTeX = !this.renderLaTeX;
                    changeHandler();
                }
            },
        }));
        this.disposables.add(atom.config.observe('markdown-preview-plus.useGitHubStyle', (useGitHubStyle) => {
            if (useGitHubStyle) {
                this.div.setAttribute('data-use-github-style', '');
            }
            else {
                this.div.removeAttribute('data-use-github-style');
            }
        }));
    }
    async renderMarkdown() {
        if (!this.loaded) {
            this.showLoading();
        }
        await this.getMarkdownSource().then(async (source) => {
            if (source) {
                return this.renderMarkdownText(source);
            }
            return;
        });
        this.resolve();
    }
    async refreshImages(oldsrc) {
        const imgs = this.findAll('img[src]');
        const result = [];
        for (const img of Array.from(imgs)) {
            let ovs;
            let ov;
            let src = img.getAttribute('src');
            const match = src.match(/^(.*)\?v=(\d+)$/);
            if (match) {
                ;
                [, src, ovs] = match;
            }
            if (src === oldsrc) {
                if (ovs !== undefined) {
                    ov = parseInt(ovs, 10);
                }
                const v = await imageWatcher.getVersion(src, this.getPath());
                if (v !== ov) {
                    if (v) {
                        result.push((img.src = `${src}?v=${v}`));
                    }
                    else {
                        result.push((img.src = `${src}`));
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
    }
    async getMarkdownSource() {
        if (this.file && this.file.getPath()) {
            return this.file.read();
        }
        else if (this.editor) {
            return this.editor.getText();
        }
        else {
            return undefined;
        }
    }
    async getHTML(callback) {
        return this.getMarkdownSource().then((source) => {
            if (source === undefined) {
                return undefined;
            }
            return renderer.toHTML(source, this.getPath(), this.getGrammar(), this.renderLaTeX, false, callback);
        });
    }
    async renderMarkdownText(text) {
        return renderer.toDOMFragment(text, this.getPath(), this.getGrammar(), this.renderLaTeX, (error, domFragment) => {
            if (error) {
                this.showError(error);
            }
            else {
                this.loading = false;
                this.loaded = true;
                if (!this.updatePreview && this.preview) {
                    this.updatePreview = new update_preview_1.UpdatePreview(this.preview);
                }
                this.updatePreview &&
                    domFragment &&
                    this.updatePreview.update(domFragment, this.renderLaTeX);
                this.emitter.emit('did-change-markdown');
            }
        });
    }
    getTitle() {
        const p = this.getPath();
        if (p && this.file) {
            return `${path.basename(p)} Preview`;
        }
        else if (this.editor) {
            return `${this.editor.getTitle()} Preview`;
        }
        else {
            return 'Markdown Preview';
        }
    }
    getIconName() {
        return 'markdown';
    }
    getURI() {
        if (this.file) {
            return `markdown-preview-plus://${this.getPath()}`;
        }
        else {
            return `markdown-preview-plus://editor/${this.editorId}`;
        }
    }
    getPath() {
        if (this.file) {
            return this.file.getPath();
        }
        else if (this.editor) {
            return this.editor.getPath();
        }
        return undefined;
    }
    getGrammar() {
        return this.editor && this.editor.getGrammar();
    }
    getDocumentStyleSheets() {
        return document.styleSheets;
    }
    getTextEditorStyles() {
        const textEditorStyles = document.createElement('atom-styles');
        textEditorStyles.initialize(atom.styles);
        textEditorStyles.setAttribute('context', 'atom-text-editor');
        document.body.appendChild(textEditorStyles);
        return Array.from(textEditorStyles.childNodes).map((styleElement) => styleElement.innerText);
    }
    getMarkdownPreviewCSS() {
        const markdowPreviewRules = [];
        const ruleRegExp = /\.markdown-preview/;
        const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/;
        for (const stylesheet of Array.from(this.getDocumentStyleSheets())) {
            if (stylesheet.rules != null) {
                for (const rule of Array.from(stylesheet.rules)) {
                    if ((rule.selectorText != null
                        ? rule.selectorText.match(ruleRegExp)
                        : undefined) != null) {
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
            .replace(cssUrlRefExp, function (_match, assetsName, _offset, _string) {
            const assetPath = path.join(__dirname, '../assets', assetsName);
            const originalData = fs.readFileSync(assetPath, 'binary');
            const base64Data = new Buffer(originalData, 'binary').toString('base64');
            return `url('data:image/jpeg;base64,${base64Data}')`;
        });
    }
    showError(result) {
        const error = document.createElement('div');
        error.innerHTML = `<h2>Previewing Markdown Failed</h2><h3>${result.message}</h3>`;
        this.preview.appendChild(error);
    }
    showLoading() {
        this.loading = true;
        const spinner = document.createElement('div');
        spinner.classList.add('markdown-spinner');
        spinner.innerText = 'Loading Markdown\u2026';
        this.preview.appendChild(spinner);
    }
    copyToClipboard() {
        if (this.loading) {
            return false;
        }
        const selection = window.getSelection();
        const selectedText = selection.toString();
        const selectedNode = selection.baseNode;
        if (selectedText &&
            selectedNode != null &&
            (this.preview === selectedNode || this.preview.contains(selectedNode))) {
            return false;
        }
        util_1.handlePromise(this.getHTML(function (error, html) {
            if (error !== null) {
                console.warn('Copying Markdown as HTML failed', error);
            }
            else {
                atom.clipboard.write(html);
            }
        }));
        return true;
    }
    async saveAs() {
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
            const projectPath = atom.project.getPaths()[0];
            filePath = 'untitled.md.html';
            if (projectPath) {
                filePath = path.join(projectPath, filePath);
            }
        }
        const htmlFilePath = atom.showSaveDialogSync(filePath);
        if (htmlFilePath) {
            return this.getHTML((error, htmlBody) => {
                if (error !== null) {
                    console.warn('Saving Markdown as HTML failed', error);
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
                        mathjaxScript = '';
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
</html>` + '\n';
                    fs.writeFileSync(htmlFilePath, html);
                    util_1.handlePromise(atom.workspace.open(htmlFilePath));
                }
            });
        }
    }
    isEqual(other) {
        return this[0] === (other !== null ? other[0] : undefined);
    }
    bubbleToContainerElement(element) {
        let testElement = element;
        while (testElement !== document.body) {
            const parent = testElement.parentElement;
            if (!parent)
                break;
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
        const end = pathToToken.length - 1;
        for (let i = 0; i <= end; i++) {
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
        if (token.tag === '') {
            return null;
        }
        return token.tag;
    }
    getPathToElement(element) {
        if (element.classList.contains('markdown-preview')) {
            return [
                {
                    tag: 'div',
                    index: 0,
                },
            ];
        }
        element = this.bubbleToContainerElement(element);
        const tag = this.encodeTag(element);
        const siblings = element.parentElement.children;
        let siblingsCount = 0;
        for (const sibling of Array.from(siblings)) {
            const siblingTag = sibling.nodeType === 1 ? this.encodeTag(sibling) : null;
            if (sibling === element) {
                const pathToElement = this.getPathToElement(element.parentElement);
                pathToElement.push({
                    tag,
                    index: siblingsCount,
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
            return null;
        }
        const tokens = markdownIt.getTokens(text, this.renderLaTeX);
        let finalToken = null;
        let level = 0;
        for (const token of tokens) {
            if (token.level < level) {
                break;
            }
            if (token.hidden) {
                continue;
            }
            if (token.tag === pathToElement[0].tag && token.level === level) {
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
                else if (token.nesting === 0 &&
                    ['math', 'code', 'hr'].includes(token.tag)) {
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
        if (finalToken !== null && this.editor) {
            this.editor.setCursorBufferPosition([finalToken.map[0], 0]);
            return finalToken.map[0];
        }
        else {
            return null;
        }
    }
    getPathToToken(tokens, line) {
        let pathToToken = [];
        let tokenTagCount = {};
        let level = 0;
        for (const token of tokens) {
            if (token.level < level) {
                break;
            }
            if (token.hidden) {
                continue;
            }
            if (token.nesting === -1) {
                continue;
            }
            const tag = this.decodeTag(token);
            if (tag === null) {
                continue;
            }
            token.tag = tag;
            if (token.map != null &&
                line >= token.map[0] &&
                line <= token.map[1] - 1) {
                if (token.nesting === 1) {
                    pathToToken.push({
                        tag: token.tag,
                        index: tokenTagCount[token.tag] || 0,
                    });
                    tokenTagCount = {};
                    level++;
                }
                else if (token.nesting === 0) {
                    pathToToken.push({
                        tag: token.tag,
                        index: tokenTagCount[token.tag] || 0,
                    });
                    break;
                }
            }
            else if (token.level === level) {
                if (tokenTagCount[token.tag] !== undefined) {
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
        const tokens = markdownIt.getTokens(text, this.renderLaTeX);
        const pathToToken = this.getPathToToken(tokens, line);
        let element = this.preview;
        for (const token of pathToToken) {
            const candidateElement = element
                .querySelectorAll(`:scope > ${token.tag}`)
                .item(token.index);
            if (candidateElement) {
                element = candidateElement;
            }
            else {
                break;
            }
        }
        if (element.classList.contains('update-preview')) {
            return undefined;
        }
        if (!element.classList.contains('update-preview')) {
            element.scrollIntoView();
        }
        const maxScrollTop = this.div.scrollHeight - this.div.clientHeight;
        if (!(this.div.scrollTop >= maxScrollTop)) {
            this.div.scrollTop -= this.div.clientHeight / 4;
        }
        element.classList.add('flash');
        setTimeout(() => element.classList.remove('flash'), 1000);
        return element;
    }
}
exports.MarkdownPreviewView = MarkdownPreviewView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUE2QjtBQUM3QiwrQkFTYTtBQUNiLDRCQUE0QjtBQUM1Qiw4QkFBOEI7QUFFOUIsdUNBQXVDO0FBQ3ZDLHFEQUFnRDtBQUNoRCxtREFBbUQ7QUFDbkQscURBQXFEO0FBQ3JELGlDQUFzQztBQWtCdEM7SUEwQkUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWE7UUF6QnJDLFlBQU8sR0FBWSxJQUFJLENBQUE7UUFHZixrQkFBYSxHQUFrQixJQUFJLE9BQU8sQ0FDeEQsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FDdEMsQ0FBQTtRQUlPLFlBQU8sR0FHVixJQUFJLGNBQU8sRUFBRSxDQUFBO1FBRVYsZ0JBQVcsR0FBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQzlDLHFEQUFxRCxDQUN0RCxDQUFBO1FBQ08sZ0JBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDdkMsV0FBTSxHQUFHLElBQUksQ0FBQTtRQVFuQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxJQUFJLENBQUMs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LENBQUMsT0FBTyxDQUFBO0lBQ2hCLENBQUM7Q0FDRjtBQTMzQkQsa0RBMjNCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRva2VuIH0gZnJvbSAnbWFya2Rvd24taXQnXG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuaW1wb3J0IHtcbiAgQ29tbWFuZEV2ZW50LFxuICBFbWl0dGVyLFxuICBEaXNwb3NhYmxlLFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBGaWxlLFxuICBTdHlsZU1hbmFnZXIsXG4gIFRleHRFZGl0b3IsXG4gIEdyYW1tYXIsXG59IGZyb20gJ2F0b20nXG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1wbHVzJylcblxuaW1wb3J0IHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlcicpXG5pbXBvcnQgeyBVcGRhdGVQcmV2aWV3IH0gZnJvbSAnLi91cGRhdGUtcHJldmlldydcbmltcG9ydCBtYXJrZG93bkl0ID0gcmVxdWlyZSgnLi9tYXJrZG93bi1pdC1oZWxwZXInKVxuaW1wb3J0IGltYWdlV2F0Y2hlciA9IHJlcXVpcmUoJy4vaW1hZ2Utd2F0Y2gtaGVscGVyJylcbmltcG9ydCB7IGhhbmRsZVByb21pc2UgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBpbnRlcmZhY2UgTVBWUGFyYW1zRWRpdG9yIHtcbiAgZWRpdG9ySWQ6IG51bWJlclxuICBmaWxlUGF0aD86IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc1BhdGgge1xuICBlZGl0b3JJZD86IHVuZGVmaW5lZFxuICBmaWxlUGF0aDogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIE1QVlBhcmFtcyA9IE1QVlBhcmFtc0VkaXRvciB8IE1QVlBhcmFtc1BhdGhcblxuZXhwb3J0IHR5cGUgTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnQgPSBIVE1MSUZyYW1lRWxlbWVudCAmIHtcbiAgZ2V0TW9kZWwoKTogTWFya2Rvd25QcmV2aWV3Vmlld1xufVxuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHByaXZhdGUgbG9hZGluZzogYm9vbGVhbiA9IHRydWVcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuaW5pdGlhbGl6ZWRcbiAgcHJpdmF0ZSByZXNvbHZlOiAoKSA9PiB2b2lkXG4gIHB1YmxpYyByZWFkb25seSByZW5kZXJQcm9taXNlOiBQcm9taXNlPHZvaWQ+ID0gbmV3IFByb21pc2U8dm9pZD4oXG4gICAgKHJlc29sdmUpID0+ICh0aGlzLnJlc29sdmUgPSByZXNvbHZlKSxcbiAgKVxuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnRcbiAgcHVibGljIHJlYWRvbmx5IGRpdjogSFRNTERpdkVsZW1lbnRcbiAgcHJpdmF0ZSBwcmV2aWV3OiBIVE1MRWxlbWVudFxuICBwcml2YXRlIGVtaXR0ZXI6IEVtaXR0ZXI8e1xuICAgICdkaWQtY2hhbmdlLXRpdGxlJzogdW5kZWZpbmVkXG4gICAgJ2RpZC1jaGFuZ2UtbWFya2Rvd24nOiB1bmRlZmluZWRcbiAgfT4gPSBuZXcgRW1pdHRlcigpXG4gIHByaXZhdGUgdXBkYXRlUHJldmlldz86IFVwZGF0ZVByZXZpZXdcbiAgcHJpdmF0ZSByZW5kZXJMYVRlWDogYm9vbGVhbiA9ICEhYXRvbS5jb25maWcuZ2V0KFxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnLFxuICApXG4gIHByaXZhdGUgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIHByaXZhdGUgbG9hZGVkID0gdHJ1ZSAvLyBEbyBub3Qgc2hvdyB0aGUgbG9hZGluZyBzcGlubm9yIG9uIGluaXRpYWwgbG9hZFxuICBwcml2YXRlIGVkaXRvcklkPzogbnVtYmVyXG4gIHByaXZhdGUgZmlsZVBhdGg/OiBzdHJpbmdcbiAgcHJpdmF0ZSBmaWxlPzogRmlsZVxuICBwcml2YXRlIGVkaXRvcj86IFRleHRFZGl0b3JcbiAgcHJpdmF0ZSBsYXN0VGFyZ2V0PzogSFRNTEVsZW1lbnRcblxuICBjb25zdHJ1Y3Rvcih7IGVkaXRvcklkLCBmaWxlUGF0aCB9OiBNUFZQYXJhbXMpIHtcbiAgICB0aGlzLmdldFBhdGhUb0VsZW1lbnQgPSB0aGlzLmdldFBhdGhUb0VsZW1lbnQuYmluZCh0aGlzKVxuICAgIHRoaXMuc3luY1NvdXJjZSA9IHRoaXMuc3luY1NvdXJjZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5nZXRQYXRoVG9Ub2tlbiA9IHRoaXMuZ2V0UGF0aFRvVG9rZW4uYmluZCh0aGlzKVxuICAgIHRoaXMuc3luY1ByZXZpZXcgPSB0aGlzLnN5bmNQcmV2aWV3LmJpbmQodGhpcylcbiAgICB0aGlzLmVkaXRvcklkID0gZWRpdG9ySWRcbiAgICB0aGlzLmZpbGVQYXRoID0gZmlsZVBhdGhcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKSBhcyBhbnlcbiAgICB0aGlzLmVsZW1lbnQuZ2V0TW9kZWwgPSAoKSA9PiB0aGlzXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXByZXZpZXcnLCAnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgdGhpcy5lbGVtZW50LnNyYyA9ICdhYm91dDpibGFuaydcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSAnMTAwJSdcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnXG4gICAgdGhpcy5kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuZGl2LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXByZXZpZXcnLCAnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgdGhpcy5kaXYudGFiSW5kZXggPSAtMVxuICAgIHRoaXMucHJldmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5wcmV2aWV3LmNsYXNzTGlzdC5hZGQoJ3VwZGF0ZS1wcmV2aWV3JylcbiAgICB0aGlzLmRpdi5hcHBlbmRDaGlsZCh0aGlzLnByZXZpZXcpXG4gICAgdGhpcy5lbGVtZW50Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIGZvciAoY29uc3Qgc2Ugb2YgYXRvbS5zdHlsZXMuZ2V0U3R5bGVFbGVtZW50cygpKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5jb250ZW50RG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzZSlcbiAgICAgIH1cbiAgICAgIHRoaXMuZWxlbWVudC5jb250ZW50RG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRpdilcbiAgICAgIHRoaXMuZGl2Lm9uY29udGV4dG1lbnUgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLmxhc3RUYXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudFxuICAgICAgICBhdG9tLmNvbnRleHRNZW51LnNob3dGb3JFdmVudChcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBlLCB7IHRhcmdldDogdGhpcy5lbGVtZW50IH0pLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5yZXNvbHZlRWRpdG9yKHRoaXMuZWRpdG9ySWQpXG4gICAgfSBlbHNlIGlmICh0aGlzLmZpbGVQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc3Vic2NyaWJlVG9GaWxlUGF0aCh0aGlzLmZpbGVQYXRoKVxuICAgIH1cbiAgfVxuXG4gIHRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2LmlubmVyVGV4dFxuICB9XG5cbiAgZmluZCh3aGF0OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5kaXYucXVlcnlTZWxlY3Rvcih3aGF0KVxuICB9XG5cbiAgZmluZEFsbCh3aGF0OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5kaXYucXVlcnlTZWxlY3RvckFsbCh3aGF0KVxuICB9XG5cbiAgZ2V0Um9vdCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXZcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnTWFya2Rvd25QcmV2aWV3VmlldycsXG4gICAgICBmaWxlUGF0aDogdGhpcy5nZXRQYXRoKCkgfHwgdGhpcy5maWxlUGF0aCxcbiAgICAgIGVkaXRvcklkOiB0aGlzLmVkaXRvcklkLFxuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgcGF0aCAmJiBpbWFnZVdhdGNoZXIucmVtb3ZlRmlsZShwYXRoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpXG4gIH1cblxuICBvbkRpZENoYW5nZVRpdGxlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VNb2RpZmllZChfY2FsbGJhY2s6IGFueSkge1xuICAgIC8vIE5vIG9wIHRvIHN1cHByZXNzIGRlcHJlY2F0aW9uIHdhcm5pbmdcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VNYXJrZG93bihjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtbWFya2Rvd24nLCBjYWxsYmFjaylcbiAgfVxuXG4gIHN1YnNjcmliZVRvRmlsZVBhdGgoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuZmlsZSA9IG5ldyBGaWxlKGZpbGVQYXRoKVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gIH1cblxuICByZXNvbHZlRWRpdG9yKGVkaXRvcklkOiBudW1iZXIpIHtcbiAgICB0aGlzLmVkaXRvciA9IHRoaXMuZWRpdG9yRm9ySWQoZWRpdG9ySWQpXG5cbiAgICBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgIHRoaXMuaGFuZGxlRXZlbnRzKClcbiAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgZWRpdG9yIHRoaXMgcHJldmlldyB3YXMgY3JlYXRlZCBmb3IgaGFzIGJlZW4gY2xvc2VkIHNvIGNsb3NlXG4gICAgICAvLyB0aGlzIHByZXZpZXcgc2luY2UgYSBwcmV2aWV3IGNhbm5vdCBiZSByZW5kZXJlZCB3aXRob3V0IGFuIGVkaXRvclxuICAgICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgICBwYW5lICYmIHBhbmUuZGVzdHJveUl0ZW0odGhpcylcbiAgICB9XG4gIH1cblxuICBlZGl0b3JGb3JJZChlZGl0b3JJZDogbnVtYmVyKSB7XG4gICAgZm9yIChjb25zdCBlZGl0b3Igb2YgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSkge1xuICAgICAgaWYgKGVkaXRvci5pZCA9PT0gZWRpdG9ySWQpIHtcbiAgICAgICAgcmV0dXJuIGVkaXRvclxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBoYW5kbGVFdmVudHMoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkQWRkR3JhbW1hcigoKSA9PlxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZFVwZGF0ZUdyYW1tYXIoXG4gICAgICAgIF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgICB9LCAyNTApLFxuICAgICAgKSxcbiAgICApXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PiB0aGlzLmRpdi5zY3JvbGxCeSh7IHRvcDogLTEwIH0pLFxuICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT4gdGhpcy5kaXYuc2Nyb2xsQnkoeyB0b3A6IDEwIH0pLFxuICAgICAgJ2NvcmU6c2F2ZS1hcyc6IChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMuc2F2ZUFzKCkpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6Y29weSc6IChldmVudDogQ29tbWFuZEV2ZW50KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmNvcHlUb0NsaXBib2FyZCgpKSBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgfSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pbic6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLmRpdi5zdHlsZS56b29tIHx8ICcxJylcbiAgICAgICAgdGhpcy5kaXYuc3R5bGUuem9vbSA9ICh6b29tTGV2ZWwgKyAwLjEpLnRvU3RyaW5nKClcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0JzogKCkgPT4ge1xuICAgICAgICBjb25zdCB6b29tTGV2ZWwgPSBwYXJzZUZsb2F0KHRoaXMuZGl2LnN0eWxlLnpvb20gfHwgJzEnKVxuICAgICAgICB0aGlzLmRpdi5zdHlsZS56b29tID0gKHpvb21MZXZlbCAtIDAuMSkudG9TdHJpbmcoKVxuICAgICAgfSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cmVzZXQtem9vbSc6ICgpID0+ICh0aGlzLmRpdi5zdHlsZS56b29tID0gJzEnKSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1zb3VyY2UnOiAoX2V2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGxhc3RUYXJnZXQgPSB0aGlzLmxhc3RUYXJnZXRcbiAgICAgICAgaWYgKCFsYXN0VGFyZ2V0KSByZXR1cm5cbiAgICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgICB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnN5bmNTb3VyY2Uoc291cmNlLCBsYXN0VGFyZ2V0KVxuICAgICAgICAgIH0pLFxuICAgICAgICApXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBjb25zdCBjaGFuZ2VIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG5cbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgaWYgKHBhbmUgIT09IHVuZGVmaW5lZCAmJiBwYW5lICE9PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkpIHtcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maWxlKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmZpbGUub25EaWRDaGFuZ2UoY2hhbmdlSGFuZGxlcikpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU3RvcENoYW5naW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgdGhpcy5lZGl0b3Iub25EaWRDaGFuZ2VQYXRoKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU2F2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFJlbG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5lZGl0b3IpLCB7XG4gICAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnOiBhc3luYyAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICAgICAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5lZGl0b3IpIHJldHVyblxuICAgICAgICAgICAgdGhpcy5zeW5jUHJldmlldyhzb3VyY2UsIHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93KVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgIH1cblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYnJlYWtPblNpbmdsZU5ld2xpbmUnLFxuICAgICAgICBjaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICApXG5cbiAgICAvLyBUb2dnbGUgTGFUZVggcmVuZGVyaW5nIGlmIGZvY3VzIGlzIG9uIHByZXZpZXcgcGFuZSBvciBhc3NvY2lhdGVkIGVkaXRvci5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKCkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgPT09IHRoaXMgfHxcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSA9PT0gdGhpcy5lZGl0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTGFUZVggPSAhdGhpcy5yZW5kZXJMYVRlWFxuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyxcbiAgICAgICAgKHVzZUdpdEh1YlN0eWxlKSA9PiB7XG4gICAgICAgICAgaWYgKHVzZUdpdEh1YlN0eWxlKSB7XG4gICAgICAgICAgICB0aGlzLmRpdi5zZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScsICcnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRpdi5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgKSxcbiAgICApXG4gIH1cblxuICBhc3luYyByZW5kZXJNYXJrZG93bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICB0aGlzLnNob3dMb2FkaW5nKClcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oYXN5bmMgKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJNYXJrZG93blRleHQoc291cmNlKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfSlcbiAgICB0aGlzLnJlc29sdmUoKVxuICB9XG5cbiAgYXN5bmMgcmVmcmVzaEltYWdlcyhvbGRzcmM6IHN0cmluZykge1xuICAgIGNvbnN0IGltZ3MgPSB0aGlzLmZpbmRBbGwoJ2ltZ1tzcmNdJykgYXMgTm9kZUxpc3RPZjxIVE1MSW1hZ2VFbGVtZW50PlxuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG4gICAgZm9yIChjb25zdCBpbWcgb2YgQXJyYXkuZnJvbShpbWdzKSkge1xuICAgICAgbGV0IG92czogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAgICBsZXQgb3Y6IG51bWJlciB8IHVuZGVmaW5lZFxuICAgICAgbGV0IHNyYyA9IGltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpIVxuICAgICAgY29uc3QgbWF0Y2ggPSBzcmMubWF0Y2goL14oLiopXFw/dj0oXFxkKykkLylcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICA7Wywgc3JjLCBvdnNdID0gbWF0Y2hcbiAgICAgIH1cbiAgICAgIGlmIChzcmMgPT09IG9sZHNyYykge1xuICAgICAgICBpZiAob3ZzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBvdiA9IHBhcnNlSW50KG92cywgMTApXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdiA9IGF3YWl0IGltYWdlV2F0Y2hlci5nZXRWZXJzaW9uKHNyYywgdGhpcy5nZXRQYXRoKCkpXG4gICAgICAgIGlmICh2ICE9PSBvdikge1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoaW1nLnNyYyA9IGAke3NyY30/dj0ke3Z9YCkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKChpbWcuc3JjID0gYCR7c3JjfWApKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgYXN5bmMgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAmJiB0aGlzLmZpbGUuZ2V0UGF0aCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWxlLnJlYWQoKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRUZXh0KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEhUTUwoY2FsbGJhY2s6IChlcnJvcjogRXJyb3IgfCBudWxsLCBodG1sQm9keTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKChzb3VyY2U/OiBzdHJpbmcpID0+IHtcbiAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZW5kZXJlci50b0hUTUwoXG4gICAgICAgIHNvdXJjZSxcbiAgICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIGFzeW5jIHJlbmRlck1hcmtkb3duVGV4dCh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gcmVuZGVyZXIudG9ET01GcmFnbWVudChcbiAgICAgIHRleHQsXG4gICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgIChlcnJvciwgZG9tRnJhZ21lbnQpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgdGhpcy5zaG93RXJyb3IoZXJyb3IpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2VcbiAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWVcbiAgICAgICAgICAvLyBkaXYudXBkYXRlLXByZXZpZXcgY3JlYXRlZCBhZnRlciBjb25zdHJ1Y3RvciBzdCBVcGRhdGVQcmV2aWV3IGNhbm5vdFxuICAgICAgICAgIC8vIGJlIGluc3RhbmNlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgICBpZiAoIXRoaXMudXBkYXRlUHJldmlldyAmJiB0aGlzLnByZXZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyA9IG5ldyBVcGRhdGVQcmV2aWV3KHRoaXMucHJldmlldylcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3ICYmXG4gICAgICAgICAgICBkb21GcmFnbWVudCAmJlxuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3LnVwZGF0ZShkb21GcmFnbWVudCBhcyBFbGVtZW50LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLW1hcmtkb3duJylcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApXG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICBjb25zdCBwID0gdGhpcy5nZXRQYXRoKClcbiAgICBpZiAocCAmJiB0aGlzLmZpbGUpIHtcbiAgICAgIHJldHVybiBgJHtwYXRoLmJhc2VuYW1lKHApfSBQcmV2aWV3YFxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmVkaXRvci5nZXRUaXRsZSgpfSBQcmV2aWV3YFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ01hcmtkb3duIFByZXZpZXcnXG4gICAgfVxuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuICdtYXJrZG93bidcbiAgfVxuXG4gIGdldFVSSSgpIHtcbiAgICBpZiAodGhpcy5maWxlKSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovLyR7dGhpcy5nZXRQYXRoKCl9YFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL2VkaXRvci8ke3RoaXMuZWRpdG9ySWR9YFxuICAgIH1cbiAgfVxuXG4gIGdldFBhdGgoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRQYXRoKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0UGF0aCgpXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGdldEdyYW1tYXIoKTogR3JhbW1hciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yICYmIHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKVxuICB9XG5cbiAgZ2V0RG9jdW1lbnRTdHlsZVNoZWV0cygpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGV4aXN0cyBzbyB3ZSBjYW4gc3R1YiBpdFxuICAgIHJldHVybiBkb2N1bWVudC5zdHlsZVNoZWV0c1xuICB9XG5cbiAgZ2V0VGV4dEVkaXRvclN0eWxlcygpIHtcbiAgICBjb25zdCB0ZXh0RWRpdG9yU3R5bGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcbiAgICAgICdhdG9tLXN0eWxlcycsXG4gICAgKSBhcyBIVE1MRWxlbWVudCAmIHsgaW5pdGlhbGl6ZShzdHlsZXM6IFN0eWxlTWFuYWdlcik6IHZvaWQgfVxuICAgIHRleHRFZGl0b3JTdHlsZXMuaW5pdGlhbGl6ZShhdG9tLnN0eWxlcylcbiAgICB0ZXh0RWRpdG9yU3R5bGVzLnNldEF0dHJpYnV0ZSgnY29udGV4dCcsICdhdG9tLXRleHQtZWRpdG9yJylcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRleHRFZGl0b3JTdHlsZXMpXG5cbiAgICAvLyBFeHRyYWN0IHN0eWxlIGVsZW1lbnRzIGNvbnRlbnRcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0ZXh0RWRpdG9yU3R5bGVzLmNoaWxkTm9kZXMpLm1hcChcbiAgICAgIChzdHlsZUVsZW1lbnQpID0+IChzdHlsZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dCxcbiAgICApXG4gIH1cblxuICBnZXRNYXJrZG93blByZXZpZXdDU1MoKSB7XG4gICAgY29uc3QgbWFya2Rvd1ByZXZpZXdSdWxlcyA9IFtdXG4gICAgY29uc3QgcnVsZVJlZ0V4cCA9IC9cXC5tYXJrZG93bi1wcmV2aWV3L1xuICAgIGNvbnN0IGNzc1VybFJlZkV4cCA9IC91cmxcXChhdG9tOlxcL1xcL21hcmtkb3duLXByZXZpZXctcGx1c1xcL2Fzc2V0c1xcLyguKilcXCkvXG5cbiAgICBmb3IgKGNvbnN0IHN0eWxlc2hlZXQgb2YgQXJyYXkuZnJvbSh0aGlzLmdldERvY3VtZW50U3R5bGVTaGVldHMoKSkpIHtcbiAgICAgIGlmIChzdHlsZXNoZWV0LnJ1bGVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIEFycmF5LmZyb20oc3R5bGVzaGVldC5ydWxlcykpIHtcbiAgICAgICAgICAvLyBXZSBvbmx5IG5lZWQgYC5tYXJrZG93bi1yZXZpZXdgIGNzc1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIChydWxlLnNlbGVjdG9yVGV4dCAhPSBudWxsXG4gICAgICAgICAgICAgID8gcnVsZS5zZWxlY3RvclRleHQubWF0Y2gocnVsZVJlZ0V4cClcbiAgICAgICAgICAgICAgOiB1bmRlZmluZWQpICE9IG51bGxcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIG1hcmtkb3dQcmV2aWV3UnVsZXMucHVzaChydWxlLmNzc1RleHQpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtkb3dQcmV2aWV3UnVsZXNcbiAgICAgIC5jb25jYXQodGhpcy5nZXRUZXh0RWRpdG9yU3R5bGVzKCkpXG4gICAgICAuam9pbignXFxuJylcbiAgICAgIC5yZXBsYWNlKC9hdG9tLXRleHQtZWRpdG9yL2csICdwcmUuZWRpdG9yLWNvbG9ycycpXG4gICAgICAucmVwbGFjZSgvOmhvc3QvZywgJy5ob3N0JykgLy8gUmVtb3ZlIHNoYWRvdy1kb20gOmhvc3Qgc2VsZWN0b3IgY2F1c2luZyBwcm9ibGVtIG9uIEZGXG4gICAgICAucmVwbGFjZShjc3NVcmxSZWZFeHAsIGZ1bmN0aW9uKFxuICAgICAgICBfbWF0Y2gsXG4gICAgICAgIGFzc2V0c05hbWU6IHN0cmluZyxcbiAgICAgICAgX29mZnNldCxcbiAgICAgICAgX3N0cmluZyxcbiAgICAgICkge1xuICAgICAgICAvLyBiYXNlNjQgZW5jb2RlIGFzc2V0c1xuICAgICAgICBjb25zdCBhc3NldFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vYXNzZXRzJywgYXNzZXRzTmFtZSlcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxEYXRhID0gZnMucmVhZEZpbGVTeW5jKGFzc2V0UGF0aCwgJ2JpbmFyeScpXG4gICAgICAgIGNvbnN0IGJhc2U2NERhdGEgPSBuZXcgQnVmZmVyKG9yaWdpbmFsRGF0YSwgJ2JpbmFyeScpLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICByZXR1cm4gYHVybCgnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwke2Jhc2U2NERhdGF9JylgXG4gICAgICB9KVxuICB9XG5cbiAgc2hvd0Vycm9yKHJlc3VsdDogRXJyb3IpIHtcbiAgICBjb25zdCBlcnJvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZXJyb3IuaW5uZXJIVE1MID0gYDxoMj5QcmV2aWV3aW5nIE1hcmtkb3duIEZhaWxlZDwvaDI+PGgzPiR7XG4gICAgICByZXN1bHQubWVzc2FnZVxuICAgIH08L2gzPmBcbiAgICB0aGlzLnByZXZpZXcuYXBwZW5kQ2hpbGQoZXJyb3IpXG4gIH1cblxuICBzaG93TG9hZGluZygpIHtcbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlXG4gICAgY29uc3Qgc3Bpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgc3Bpbm5lci5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1zcGlubmVyJylcbiAgICBzcGlubmVyLmlubmVyVGV4dCA9ICdMb2FkaW5nIE1hcmtkb3duXFx1MjAyNidcbiAgICB0aGlzLnByZXZpZXcuYXBwZW5kQ2hpbGQoc3Bpbm5lcilcbiAgfVxuXG4gIGNvcHlUb0NsaXBib2FyZCgpIHtcbiAgICBpZiAodGhpcy5sb2FkaW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKVxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGlvbi5iYXNlTm9kZSBhcyBIVE1MRWxlbWVudFxuXG4gICAgLy8gVXNlIGRlZmF1bHQgY29weSBldmVudCBoYW5kbGVyIGlmIHRoZXJlIGlzIHNlbGVjdGVkIHRleHQgaW5zaWRlIHRoaXMgdmlld1xuICAgIGlmIChcbiAgICAgIHNlbGVjdGVkVGV4dCAmJlxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy9UT0RPOiBjb21wbGFpbiBvbiBUU1xuICAgICAgc2VsZWN0ZWROb2RlICE9IG51bGwgJiZcbiAgICAgICh0aGlzLnByZXZpZXcgPT09IHNlbGVjdGVkTm9kZSB8fCB0aGlzLnByZXZpZXcuY29udGFpbnMoc2VsZWN0ZWROb2RlKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGhhbmRsZVByb21pc2UoXG4gICAgICB0aGlzLmdldEhUTUwoZnVuY3Rpb24oZXJyb3IsIGh0bWwpIHtcbiAgICAgICAgaWYgKGVycm9yICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdDb3B5aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoaHRtbClcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGFzeW5jIHNhdmVBcygpIHtcbiAgICBpZiAodGhpcy5sb2FkaW5nKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgZmlsZVBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIGxldCB0aXRsZSA9ICdNYXJrZG93biB0byBIVE1MJ1xuICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgdGl0bGUgPSBwYXRoLnBhcnNlKGZpbGVQYXRoKS5uYW1lXG4gICAgICBmaWxlUGF0aCArPSAnLmh0bWwnXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgIGZpbGVQYXRoID0gJ3VudGl0bGVkLm1kLmh0bWwnXG4gICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIGZpbGVQYXRoKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGh0bWxGaWxlUGF0aCA9IGF0b20uc2hvd1NhdmVEaWFsb2dTeW5jKGZpbGVQYXRoKVxuICAgIGlmIChodG1sRmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEhUTUwoKGVycm9yOiBFcnJvciB8IG51bGwsIGh0bWxCb2R5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGVycm9yICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdTYXZpbmcgTWFya2Rvd24gYXMgSFRNTCBmYWlsZWQnLCBlcnJvcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgbWF0aGpheFNjcmlwdFxuICAgICAgICAgIGlmICh0aGlzLnJlbmRlckxhVGVYKSB7XG4gICAgICAgICAgICBtYXRoamF4U2NyaXB0ID0gYFxcXG5cbjxzY3JpcHQgdHlwZT1cInRleHQveC1tYXRoamF4LWNvbmZpZ1wiPlxuICBNYXRoSmF4Lkh1Yi5Db25maWcoe1xuICAgIGpheDogW1wiaW5wdXQvVGVYXCIsXCJvdXRwdXQvSFRNTC1DU1NcIl0sXG4gICAgZXh0ZW5zaW9uczogW10sXG4gICAgVGVYOiB7XG4gICAgICBleHRlbnNpb25zOiBbXCJBTVNtYXRoLmpzXCIsXCJBTVNzeW1ib2xzLmpzXCIsXCJub0Vycm9ycy5qc1wiLFwibm9VbmRlZmluZWQuanNcIl1cbiAgICB9LFxuICAgIHNob3dNYXRoTWVudTogZmFsc2VcbiAgfSk7XG48L3NjcmlwdD5cbjxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cImh0dHBzOi8vY2RuLm1hdGhqYXgub3JnL21hdGhqYXgvbGF0ZXN0L01hdGhKYXguanNcIj5cbjwvc2NyaXB0PlxcXG5gXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hdGhqYXhTY3JpcHQgPSAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBodG1sID1cbiAgICAgICAgICAgIGBcXFxuPCFET0NUWVBFIGh0bWw+XG48aHRtbD5cbiAgPGhlYWQ+XG4gICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIiAvPlxuICAgICAgPHRpdGxlPiR7dGl0bGV9PC90aXRsZT4ke21hdGhqYXhTY3JpcHR9XG4gICAgICA8c3R5bGU+JHt0aGlzLmdldE1hcmtkb3duUHJldmlld0NTUygpfTwvc3R5bGU+XG4gIDwvaGVhZD5cbiAgPGJvZHkgY2xhc3M9J21hcmtkb3duLXByZXZpZXcnPiR7aHRtbEJvZHl9PC9ib2R5PlxuPC9odG1sPmAgKyAnXFxuJyAvLyBFbnN1cmUgdHJhaWxpbmcgbmV3bGluZVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhodG1sRmlsZVBhdGgsIGh0bWwpXG4gICAgICAgICAgaGFuZGxlUHJvbWlzZShhdG9tLndvcmtzcGFjZS5vcGVuKGh0bWxGaWxlUGF0aCkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaXNFcXVhbChvdGhlcjogbnVsbCB8IFtOb2RlXSkge1xuICAgIHJldHVybiB0aGlzWzBdID09PSAob3RoZXIgIT09IG51bGwgPyBvdGhlclswXSA6IHVuZGVmaW5lZCkgLy8gQ29tcGFyZSBET00gZWxlbWVudHNcbiAgfVxuXG4gIC8vXG4gIC8vIEZpbmQgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igb2YgYW4gZWxlbWVudCB0aGF0IGlzIG5vdCBhIGRlY2VuZGFudCBvZiBlaXRoZXJcbiAgLy8gYHNwYW4ubWF0aGAgb3IgYHNwYW4uYXRvbS10ZXh0LWVkaXRvcmAuXG4gIC8vXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgZnJvbSB3aGljaCB0aGUgc2VhcmNoIGZvciBhXG4gIC8vICAgY2xvc2VzdCBhbmNlc3RvciBiZWdpbnMuXG4gIC8vIEByZXR1cm4ge0hUTUxFbGVtZW50fSBUaGUgY2xvc2VzdCBhbmNlc3RvciB0byBgZWxlbWVudGAgdGhhdCBkb2VzIG5vdFxuICAvLyAgIGNvbnRhaW4gZWl0aGVyIGBzcGFuLm1hdGhgIG9yIGBzcGFuLmF0b20tdGV4dC1lZGl0b3JgLlxuICAvL1xuICBidWJibGVUb0NvbnRhaW5lckVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBIVE1MRWxlbWVudCB7XG4gICAgbGV0IHRlc3RFbGVtZW50ID0gZWxlbWVudFxuICAgIHdoaWxlICh0ZXN0RWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgY29uc3QgcGFyZW50ID0gdGVzdEVsZW1lbnQucGFyZW50RWxlbWVudFxuICAgICAgaWYgKCFwYXJlbnQpIGJyZWFrXG4gICAgICBpZiAocGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnTWF0aEpheF9EaXNwbGF5JykpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudC5wYXJlbnRFbGVtZW50IVxuICAgICAgfVxuICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F0b20tdGV4dC1lZGl0b3InKSkge1xuICAgICAgICByZXR1cm4gcGFyZW50XG4gICAgICB9XG4gICAgICB0ZXN0RWxlbWVudCA9IHBhcmVudFxuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgLy9cbiAgLy8gRGV0ZXJtaW5lIGEgc3Vic2VxdWVuY2Ugb2YgYSBzZXF1ZW5jZSBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGEgcGF0aCB0aHJvdWdoXG4gIC8vIEhUTUxFbGVtZW50cyB0aGF0IGRvZXMgbm90IGNvbnRpbnVlIGRlZXBlciB0aGFuIGEgdGFibGUgZWxlbWVudC5cbiAgLy9cbiAgLy8gQHBhcmFtIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IHBhdGhUb1Rva2VuIEFycmF5IG9mIHRva2Vuc1xuICAvLyAgIHJlcHJlc2VudGluZyBhIHBhdGggdG8gYSBIVE1MRWxlbWVudCB3aXRoIHRoZSByb290IGVsZW1lbnQgYXRcbiAgLy8gICBwYXRoVG9Ub2tlblswXSBhbmQgdGhlIHRhcmdldCBlbGVtZW50IGF0IHRoZSBoaWdoZXN0IGluZGV4LiBFYWNoIGVsZW1lbnRcbiAgLy8gICBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHNcbiAgLy8gICBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lIGB0YWdgLlxuICAvLyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IFRoZSBzdWJzZXF1ZW5jZSBvZiBwYXRoVG9Ub2tlbiB0aGF0XG4gIC8vICAgbWFpbnRhaW5zIHRoZSBzYW1lIHJvb3QgYnV0IHRlcm1pbmF0ZXMgYXQgYSB0YWJsZSBlbGVtZW50IG9yIHRoZSB0YXJnZXRcbiAgLy8gICBlbGVtZW50LCB3aGljaGV2ZXIgY29tZXMgZmlyc3QuXG4gIC8vXG4gIGJ1YmJsZVRvQ29udGFpbmVyVG9rZW4ocGF0aFRvVG9rZW46IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4pIHtcbiAgICBjb25zdCBlbmQgPSBwYXRoVG9Ub2tlbi5sZW5ndGggLSAxXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gZW5kOyBpKyspIHtcbiAgICAgIGlmIChwYXRoVG9Ub2tlbltpXS50YWcgPT09ICd0YWJsZScpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhUb1Rva2VuLnNsaWNlKDAsIGkgKyAxKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGF0aFRvVG9rZW5cbiAgfVxuXG4gIC8vXG4gIC8vIEVuY29kZSB0YWdzIGZvciBtYXJrZG93bi1pdC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBFbmNvZGUgdGhlIHRhZyBvZiBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtzdHJpbmd9IEVuY29kZWQgdGFnLlxuICAvL1xuICBlbmNvZGVUYWcoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWF0aCcpKSB7XG4gICAgICByZXR1cm4gJ21hdGgnXG4gICAgfVxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnYXRvbS10ZXh0LWVkaXRvcicpKSB7XG4gICAgICByZXR1cm4gJ2NvZGUnXG4gICAgfSAvLyBvbmx5IHRva2VuLnR5cGUgaXMgYGZlbmNlYCBjb2RlIGJsb2NrcyBzaG91bGQgZXZlciBiZSBmb3VuZCBpbiB0aGUgZmlyc3QgbGV2ZWwgb2YgdGhlIHRva2VucyBhcnJheVxuICAgIHJldHVybiBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgLy9cbiAgLy8gRGVjb2RlIHRhZ3MgdXNlZCBieSBtYXJrZG93bi1pdFxuICAvL1xuICAvLyBAcGFyYW0ge21hcmtkb3duLWl0LlRva2VufSB0b2tlbiBEZWNvZGUgdGhlIHRhZyBvZiB0b2tlbi5cbiAgLy8gQHJldHVybiB7c3RyaW5nfG51bGx9IERlY29kZWQgdGFnIG9yIGBudWxsYCBpZiB0aGUgdG9rZW4gaGFzIG5vIHRhZy5cbiAgLy9cbiAgZGVjb2RlVGFnKHRva2VuOiBUb2tlbik6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICh0b2tlbi50YWcgPT09ICdtYXRoJykge1xuICAgICAgcmV0dXJuICdzcGFuJ1xuICAgIH1cbiAgICBpZiAodG9rZW4udGFnID09PSAnY29kZScpIHtcbiAgICAgIHJldHVybiAnc3BhbidcbiAgICB9XG4gICAgaWYgKHRva2VuLnRhZyA9PT0gJycpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIHJldHVybiB0b2tlbi50YWdcbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBwYXRoIHRvIGEgdGFyZ2V0IGVsZW1lbnQgZnJvbSBhIGNvbnRhaW5lciBgLm1hcmtkb3duLXByZXZpZXdgLlxuICAvL1xuICAvLyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRhcmdldCBIVE1MRWxlbWVudC5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBBcnJheSBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGEgcGF0aFxuICAvLyAgIHRvIGBlbGVtZW50YCBmcm9tIGAubWFya2Rvd24tcHJldmlld2AuIFRoZSByb290IGAubWFya2Rvd24tcHJldmlld2BcbiAgLy8gICBlbGVtZW50IGlzIHRoZSBmaXJzdCBlbGVtZW50cyBpbiB0aGUgYXJyYXkgYW5kIHRoZSB0YXJnZXQgZWxlbWVudFxuICAvLyAgIGBlbGVtZW50YCBhdCB0aGUgaGlnaGVzdCBpbmRleC4gRWFjaCBlbGVtZW50IGNvbnNpc3RzIG9mIGEgYHRhZ2AgYW5kXG4gIC8vICAgYGluZGV4YCByZXByZXNlbnRpbmcgaXRzIGluZGV4IGFtb25nc3QgaXRzIHNpYmxpbmcgZWxlbWVudHMgb2YgdGhlIHNhbWVcbiAgLy8gICBgdGFnYC5cbiAgLy9cbiAgZ2V0UGF0aFRvRWxlbWVudChcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgKTogQXJyYXk8eyB0YWc6IHN0cmluZzsgaW5kZXg6IG51bWJlciB9PiB7XG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtYXJrZG93bi1wcmV2aWV3JykpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgIGluZGV4OiAwLFxuICAgICAgICB9LFxuICAgICAgXVxuICAgIH1cblxuICAgIGVsZW1lbnQgPSB0aGlzLmJ1YmJsZVRvQ29udGFpbmVyRWxlbWVudChlbGVtZW50KVxuICAgIGNvbnN0IHRhZyA9IHRoaXMuZW5jb2RlVGFnKGVsZW1lbnQpXG4gICAgY29uc3Qgc2libGluZ3MgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuXG4gICAgbGV0IHNpYmxpbmdzQ291bnQgPSAwXG5cbiAgICBmb3IgKGNvbnN0IHNpYmxpbmcgb2YgQXJyYXkuZnJvbShzaWJsaW5ncykpIHtcbiAgICAgIGNvbnN0IHNpYmxpbmdUYWcgPVxuICAgICAgICBzaWJsaW5nLm5vZGVUeXBlID09PSAxID8gdGhpcy5lbmNvZGVUYWcoc2libGluZyBhcyBIVE1MRWxlbWVudCkgOiBudWxsXG4gICAgICBpZiAoc2libGluZyA9PT0gZWxlbWVudCkge1xuICAgICAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQucGFyZW50RWxlbWVudCEpXG4gICAgICAgIHBhdGhUb0VsZW1lbnQucHVzaCh7XG4gICAgICAgICAgdGFnLFxuICAgICAgICAgIGluZGV4OiBzaWJsaW5nc0NvdW50LFxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gcGF0aFRvRWxlbWVudFxuICAgICAgfSBlbHNlIGlmIChzaWJsaW5nVGFnID09PSB0YWcpIHtcbiAgICAgICAgc2libGluZ3NDb3VudCsrXG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignZmFpbHVyZSBpbiBnZXRQYXRoVG9FbGVtZW50JylcbiAgfVxuXG4gIC8vXG4gIC8vIFNldCB0aGUgYXNzb2NpYXRlZCBlZGl0b3JzIGN1cnNvciBidWZmZXIgcG9zaXRpb24gdG8gdGhlIGxpbmUgcmVwcmVzZW50aW5nXG4gIC8vIHRoZSBzb3VyY2UgbWFya2Rvd24gb2YgYSB0YXJnZXQgZWxlbWVudC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgZWxlbWVudCBjb250YWluZWQgd2l0aGluIHRoZSBhc3NvaWNhdGVkXG4gIC8vICAgYC5tYXJrZG93bi1wcmV2aWV3YCBjb250YWluZXIuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvIGlkZW50aWZ5IHRoZVxuICAvLyAgIGxpbmUgb2YgYHRleHRgIHRoYXQgcmVwcmVzZW50cyBgZWxlbWVudGAgYW5kIHNldCB0aGUgY3Vyc29yIHRvIHRoYXQgbGluZS5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgLiBJZiBub1xuICAvLyAgIGxpbmUgaXMgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gIC8vXG4gIHN5bmNTb3VyY2UodGV4dDogc3RyaW5nLCBlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IHBhdGhUb0VsZW1lbnQgPSB0aGlzLmdldFBhdGhUb0VsZW1lbnQoZWxlbWVudClcbiAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KCkgLy8gcmVtb3ZlIGRpdi5tYXJrZG93bi1wcmV2aWV3XG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBkaXYudXBkYXRlLXByZXZpZXdcbiAgICBpZiAoIXBhdGhUb0VsZW1lbnQubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGNvbnN0IHRva2VucyA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zKHRleHQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgbGV0IGZpbmFsVG9rZW4gPSBudWxsXG4gICAgbGV0IGxldmVsID0gMFxuXG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgIGlmICh0b2tlbi5sZXZlbCA8IGxldmVsKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4uaGlkZGVuKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4udGFnID09PSBwYXRoVG9FbGVtZW50WzBdLnRhZyAmJiB0b2tlbi5sZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IDEpIHtcbiAgICAgICAgICBpZiAocGF0aFRvRWxlbWVudFswXS5pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy8gVE9ETzogY29tcGxhaW4gb24gRFRcbiAgICAgICAgICAgIGlmICh0b2tlbi5tYXAgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBmaW5hbFRva2VuID0gdG9rZW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKVxuICAgICAgICAgICAgbGV2ZWwrK1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50WzBdLmluZGV4LS1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdG9rZW4ubmVzdGluZyA9PT0gMCAmJlxuICAgICAgICAgIFsnbWF0aCcsICdjb2RlJywgJ2hyJ10uaW5jbHVkZXModG9rZW4udGFnKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAocGF0aFRvRWxlbWVudFswXS5pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50WzBdLmluZGV4LS1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwYXRoVG9FbGVtZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaW5hbFRva2VuICE9PSBudWxsICYmIHRoaXMuZWRpdG9yKSB7XG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbZmluYWxUb2tlbi5tYXBbMF0sIDBdKVxuICAgICAgcmV0dXJuIGZpbmFsVG9rZW4ubWFwWzBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gRGV0ZXJtaW5lIHBhdGggdG8gYSB0YXJnZXQgdG9rZW4uXG4gIC8vXG4gIC8vIEBwYXJhbSB7KG1hcmtkb3duLWl0LlRva2VuKVtdfSB0b2tlbnMgQXJyYXkgb2YgdG9rZW5zIGFzIHJldHVybmVkIGJ5XG4gIC8vICAgYG1hcmtkb3duLWl0LnBhcnNlKClgLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBMaW5lIHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IHRva2VuLlxuICAvLyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IEFycmF5IHJlcHJlc2VudGluZyBhIHBhdGggdG8gdGhlXG4gIC8vICAgdGFyZ2V0IHRva2VuLiBUaGUgcm9vdCB0b2tlbiBpcyByZXByZXNlbnRlZCBieSB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGVcbiAgLy8gICBhcnJheSBhbmQgdGhlIHRhcmdldCB0b2tlbiBieSB0aGUgbGFzdCBlbG1lbnQuIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhXG4gIC8vICAgYHRhZ2AgYW5kIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIHRva2VucyBpblxuICAvLyAgIGB0b2tlbnNgIG9mIHRoZSBzYW1lIGB0YWdgLiBgbGluZWAgd2lsbCBsaWUgYmV0d2VlbiB0aGUgcHJvcGVydGllc1xuICAvLyAgIGBtYXBbMF1gIGFuZCBgbWFwWzFdYCBvZiB0aGUgdGFyZ2V0IHRva2VuLlxuICAvL1xuICBnZXRQYXRoVG9Ub2tlbih0b2tlbnM6IFRva2VuW10sIGxpbmU6IG51bWJlcikge1xuICAgIGxldCBwYXRoVG9Ub2tlbjogQXJyYXk8eyB0YWc6IHN0cmluZzsgaW5kZXg6IG51bWJlciB9PiA9IFtdXG4gICAgbGV0IHRva2VuVGFnQ291bnQ6IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIHwgdW5kZWZpbmVkIH0gPSB7fVxuICAgIGxldCBsZXZlbCA9IDBcblxuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICBpZiAodG9rZW4ubGV2ZWwgPCBsZXZlbCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuLmhpZGRlbikge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IC0xKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhZyA9IHRoaXMuZGVjb2RlVGFnKHRva2VuKVxuICAgICAgaWYgKHRhZyA9PT0gbnVsbCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgdG9rZW4udGFnID0gdGFnXG5cbiAgICAgIGlmIChcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy8gVE9ETzogY29tcGxhaW4gb24gRFRcbiAgICAgICAgdG9rZW4ubWFwICE9IG51bGwgJiYgLy8gdG9rZW4ubWFwICpjYW4qIGJlIG51bGxcbiAgICAgICAgbGluZSA+PSB0b2tlbi5tYXBbMF0gJiZcbiAgICAgICAgbGluZSA8PSB0b2tlbi5tYXBbMV0gLSAxXG4gICAgICApIHtcbiAgICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IDEpIHtcbiAgICAgICAgICBwYXRoVG9Ub2tlbi5wdXNoKHtcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnLFxuICAgICAgICAgICAgaW5kZXg6IHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSB8fCAwLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgdG9rZW5UYWdDb3VudCA9IHt9XG4gICAgICAgICAgbGV2ZWwrK1xuICAgICAgICB9IGVsc2UgaWYgKHRva2VuLm5lc3RpbmcgPT09IDApIHtcbiAgICAgICAgICBwYXRoVG9Ub2tlbi5wdXNoKHtcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnLFxuICAgICAgICAgICAgaW5kZXg6IHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSB8fCAwLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0b2tlbi5sZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgaWYgKHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdG9rZW5UYWdDb3VudFt0b2tlbi50YWddISsrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5UYWdDb3VudFt0b2tlbi50YWddID0gMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGF0aFRvVG9rZW4gPSB0aGlzLmJ1YmJsZVRvQ29udGFpbmVyVG9rZW4ocGF0aFRvVG9rZW4pXG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG4gIH1cblxuICAvL1xuICAvLyBTY3JvbGwgdGhlIGFzc29jaWF0ZWQgcHJldmlldyB0byB0aGUgZWxlbWVudCByZXByZXNlbnRpbmcgdGhlIHRhcmdldCBsaW5lIG9mXG4gIC8vIG9mIHRoZSBzb3VyY2UgbWFya2Rvd24uXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRhcmdldCBsaW5lIG9mIGB0ZXh0YC4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG9cbiAgLy8gICBpZGVudGlmeSB0aGUgZWxtZW50IG9mIHRoZSBhc3NvY2lhdGVkIGAubWFya2Rvd24tcHJldmlld2AgdGhhdCByZXByZXNlbnRzXG4gIC8vICAgYGxpbmVgIGFuZCBzY3JvbGwgdGhlIGAubWFya2Rvd24tcHJldmlld2AgdG8gdGhhdCBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGBsaW5lYC4gSWYgbm8gZWxlbWVudCBpc1xuICAvLyAgIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jUHJldmlldyh0ZXh0OiBzdHJpbmcsIGxpbmU6IG51bWJlcikge1xuICAgIGNvbnN0IHRva2VucyA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zKHRleHQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgY29uc3QgcGF0aFRvVG9rZW4gPSB0aGlzLmdldFBhdGhUb1Rva2VuKHRva2VucywgbGluZSlcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5wcmV2aWV3XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiBwYXRoVG9Ub2tlbikge1xuICAgICAgY29uc3QgY2FuZGlkYXRlRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gZWxlbWVudFxuICAgICAgICAucXVlcnlTZWxlY3RvckFsbChgOnNjb3BlID4gJHt0b2tlbi50YWd9YClcbiAgICAgICAgLml0ZW0odG9rZW4uaW5kZXgpIGFzIEhUTUxFbGVtZW50XG4gICAgICBpZiAoY2FuZGlkYXRlRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50ID0gY2FuZGlkYXRlRWxlbWVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JykpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9IC8vIERvIG5vdCBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIHByZXZpZXcgZm9yIGJhZCBzeW5jc1xuXG4gICAgaWYgKCFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygndXBkYXRlLXByZXZpZXcnKSkge1xuICAgICAgZWxlbWVudC5zY3JvbGxJbnRvVmlldygpXG4gICAgfVxuICAgIGNvbnN0IG1heFNjcm9sbFRvcCA9IHRoaXMuZGl2LnNjcm9sbEhlaWdodCAtIHRoaXMuZGl2LmNsaWVudEhlaWdodFxuICAgIGlmICghKHRoaXMuZGl2LnNjcm9sbFRvcCA+PSBtYXhTY3JvbGxUb3ApKSB7XG4gICAgICB0aGlzLmRpdi5zY3JvbGxUb3AgLT0gdGhpcy5kaXYuY2xpZW50SGVpZ2h0IC8gNFxuICAgIH1cblxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZmxhc2gnKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gZWxlbWVudCEuY2xhc3NMaXN0LnJlbW92ZSgnZmxhc2gnKSwgMTAwMClcblxuICAgIHJldHVybiBlbGVtZW50XG4gIH1cbn1cbiJdfQ==