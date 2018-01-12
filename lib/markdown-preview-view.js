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
    constructor({ editorId, filePath }, deserialization = false) {
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
        this.element = document.createElement('div');
        this.element.getModel = () => this;
        this.element.classList.add('markdown-preview', 'native-key-bindings');
        this.element.tabIndex = -1;
        this.preview = document.createElement('div');
        this.preview.classList.add('update-preview');
        this.element.appendChild(this.preview);
        const didAttach = () => {
            if (this.editorId !== undefined) {
                this.resolveEditor(this.editorId);
            }
            else if (this.filePath !== undefined) {
                this.subscribeToFilePath(this.filePath);
            }
        };
        if (deserialization && this.editorId !== undefined) {
            setImmediate(didAttach);
        }
        else {
            didAttach();
        }
    }
    text() {
        return this.element.innerText;
    }
    find(what) {
        return this.element.querySelector(what);
    }
    findAll(what) {
        return this.element.querySelectorAll(what);
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
            'core:move-up': () => this.element.scrollBy({ top: -10 }),
            'core:move-down': () => this.element.scrollBy({ top: 10 }),
            'core:save-as': (event) => {
                event.stopPropagation();
                util_1.handlePromise(this.saveAs());
            },
            'core:copy': (event) => {
                if (this.copyToClipboard())
                    event.stopPropagation();
            },
            'markdown-preview-plus:zoom-in': () => {
                const zoomLevel = parseFloat(this.element.style.zoom || '1');
                this.element.style.zoom = (zoomLevel + 0.1).toString();
            },
            'markdown-preview-plus:zoom-out': () => {
                const zoomLevel = parseFloat(this.element.style.zoom || '1');
                this.element.style.zoom = (zoomLevel - 0.1).toString();
            },
            'markdown-preview-plus:reset-zoom': () => (this.element.style.zoom = '1'),
            'markdown-preview-plus:sync-source': (event) => {
                util_1.handlePromise(this.getMarkdownSource().then((source) => {
                    if (source === undefined) {
                        return;
                    }
                    this.syncSource(source, event.target);
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
                this.element.setAttribute('data-use-github-style', '');
            }
            else {
                this.element.removeAttribute('data-use-github-style');
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
        const imgs = this.element.querySelectorAll('img[src]');
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
            (this.element === selectedNode || this.element.contains(selectedNode))) {
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
        const maxScrollTop = this.element.scrollHeight - this.element.clientHeight;
        if (!(this.element.scrollTop >= maxScrollTop)) {
            this.element.scrollTop -= this.element.clientHeight / 4;
        }
        element.classList.add('flash');
        setTimeout(() => element.classList.remove('flash'), 1000);
        return element;
    }
}
exports.MarkdownPreviewView = MarkdownPreviewView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUE2QjtBQUM3QiwrQkFTYTtBQUNiLDRCQUE0QjtBQUM1Qiw4QkFBOEI7QUFFOUIsdUNBQXVDO0FBQ3ZDLHFEQUFnRDtBQUNoRCxtREFBbUQ7QUFDbkQscURBQXFEO0FBQ3JELGlDQUFzQztBQWtCdEM7SUF3QkUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWEsRUFBRSxlQUFlLEdBQUcsS0FBSztRQXZCOUQsWUFBTyxHQUFZLElBQUksQ0FBQTtRQUdmLGtCQUFhLEdBQWtCLElBQUksT0FBTyxDQUN4RCxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUN0QyxDQUFBO1FBR08sWUFBTyxHQUdWLElBQUksY0FBTyxFQUFFLENBQUE7UUFFVixnQkFBVyxHQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDOUMscURBQXFELENBQ3RELENBQUE7UUFDTyxnQkFBVyxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQTtRQUN2QyxXQUFNLEdBQUcsSUFBSSxDQUFBO1FBT25CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3hELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDNUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNwRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxD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QztRQUVELE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUUxRCxNQUFNLENBQUMsT0FBTyxDQUFBO0lBQ2hCLENBQUM7Q0FDRjtBQTUyQkQsa0RBNDJCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRva2VuIH0gZnJvbSAnbWFya2Rvd24taXQnXG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuaW1wb3J0IHtcbiAgQ29tbWFuZEV2ZW50LFxuICBFbWl0dGVyLFxuICBEaXNwb3NhYmxlLFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBGaWxlLFxuICBTdHlsZU1hbmFnZXIsXG4gIFRleHRFZGl0b3IsXG4gIEdyYW1tYXIsXG59IGZyb20gJ2F0b20nXG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1wbHVzJylcblxuaW1wb3J0IHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlcicpXG5pbXBvcnQgeyBVcGRhdGVQcmV2aWV3IH0gZnJvbSAnLi91cGRhdGUtcHJldmlldydcbmltcG9ydCBtYXJrZG93bkl0ID0gcmVxdWlyZSgnLi9tYXJrZG93bi1pdC1oZWxwZXInKVxuaW1wb3J0IGltYWdlV2F0Y2hlciA9IHJlcXVpcmUoJy4vaW1hZ2Utd2F0Y2gtaGVscGVyJylcbmltcG9ydCB7IGhhbmRsZVByb21pc2UgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBpbnRlcmZhY2UgTVBWUGFyYW1zRWRpdG9yIHtcbiAgZWRpdG9ySWQ6IG51bWJlclxuICBmaWxlUGF0aD86IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc1BhdGgge1xuICBlZGl0b3JJZD86IHVuZGVmaW5lZFxuICBmaWxlUGF0aDogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIE1QVlBhcmFtcyA9IE1QVlBhcmFtc0VkaXRvciB8IE1QVlBhcmFtc1BhdGhcblxuZXhwb3J0IHR5cGUgTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnQgPSBIVE1MRWxlbWVudCAmIHtcbiAgZ2V0TW9kZWwoKTogTWFya2Rvd25QcmV2aWV3Vmlld1xufVxuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHByaXZhdGUgbG9hZGluZzogYm9vbGVhbiA9IHRydWVcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuaW5pdGlhbGl6ZWRcbiAgcHJpdmF0ZSByZXNvbHZlOiAoKSA9PiB2b2lkXG4gIHB1YmxpYyByZWFkb25seSByZW5kZXJQcm9taXNlOiBQcm9taXNlPHZvaWQ+ID0gbmV3IFByb21pc2U8dm9pZD4oXG4gICAgKHJlc29sdmUpID0+ICh0aGlzLnJlc29sdmUgPSByZXNvbHZlKSxcbiAgKVxuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnRcbiAgcHJpdmF0ZSBwcmV2aWV3OiBIVE1MRWxlbWVudFxuICBwcml2YXRlIGVtaXR0ZXI6IEVtaXR0ZXI8e1xuICAgICdkaWQtY2hhbmdlLXRpdGxlJzogdW5kZWZpbmVkXG4gICAgJ2RpZC1jaGFuZ2UtbWFya2Rvd24nOiB1bmRlZmluZWRcbiAgfT4gPSBuZXcgRW1pdHRlcigpXG4gIHByaXZhdGUgdXBkYXRlUHJldmlldz86IFVwZGF0ZVByZXZpZXdcbiAgcHJpdmF0ZSByZW5kZXJMYVRlWDogYm9vbGVhbiA9ICEhYXRvbS5jb25maWcuZ2V0KFxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnLFxuICApXG4gIHByaXZhdGUgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIHByaXZhdGUgbG9hZGVkID0gdHJ1ZSAvLyBEbyBub3Qgc2hvdyB0aGUgbG9hZGluZyBzcGlubm9yIG9uIGluaXRpYWwgbG9hZFxuICBwcml2YXRlIGVkaXRvcklkPzogbnVtYmVyXG4gIHByaXZhdGUgZmlsZVBhdGg/OiBzdHJpbmdcbiAgcHJpdmF0ZSBmaWxlPzogRmlsZVxuICBwcml2YXRlIGVkaXRvcj86IFRleHRFZGl0b3JcblxuICBjb25zdHJ1Y3Rvcih7IGVkaXRvcklkLCBmaWxlUGF0aCB9OiBNUFZQYXJhbXMsIGRlc2VyaWFsaXphdGlvbiA9IGZhbHNlKSB7XG4gICAgdGhpcy5nZXRQYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50LmJpbmQodGhpcylcbiAgICB0aGlzLnN5bmNTb3VyY2UgPSB0aGlzLnN5bmNTb3VyY2UuYmluZCh0aGlzKVxuICAgIHRoaXMuZ2V0UGF0aFRvVG9rZW4gPSB0aGlzLmdldFBhdGhUb1Rva2VuLmJpbmQodGhpcylcbiAgICB0aGlzLnN5bmNQcmV2aWV3ID0gdGhpcy5zeW5jUHJldmlldy5iaW5kKHRoaXMpXG4gICAgdGhpcy5lZGl0b3JJZCA9IGVkaXRvcklkXG4gICAgdGhpcy5maWxlUGF0aCA9IGZpbGVQYXRoXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgYXMgYW55XG4gICAgdGhpcy5lbGVtZW50LmdldE1vZGVsID0gKCkgPT4gdGhpc1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1wcmV2aWV3JywgJ25hdGl2ZS1rZXktYmluZGluZ3MnKVxuICAgIHRoaXMuZWxlbWVudC50YWJJbmRleCA9IC0xXG4gICAgdGhpcy5wcmV2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnByZXZpZXcuY2xhc3NMaXN0LmFkZCgndXBkYXRlLXByZXZpZXcnKVxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnByZXZpZXcpXG4gICAgY29uc3QgZGlkQXR0YWNoID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnJlc29sdmVFZGl0b3IodGhpcy5lZGl0b3JJZClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5maWxlUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9GaWxlUGF0aCh0aGlzLmZpbGVQYXRoKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGVzZXJpYWxpemF0aW9uICYmIHRoaXMuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gbmVlZCB0byBkZWZlciBvbiBkZXNlcmlhbGl6YXRpb24gc2luY2VcbiAgICAgIC8vIGVkaXRvciBtaWdodCBub3QgYmUgZGVzZXJpYWxpemVkIGF0IHRoaXMgcG9pbnRcbiAgICAgIHNldEltbWVkaWF0ZShkaWRBdHRhY2gpXG4gICAgfSBlbHNlIHtcbiAgICAgIGRpZEF0dGFjaCgpXG4gICAgfVxuICB9XG5cbiAgdGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmlubmVyVGV4dFxuICB9XG5cbiAgZmluZCh3aGF0OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3Iod2hhdClcbiAgfVxuXG4gIGZpbmRBbGwod2hhdDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHdoYXQpXG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ01hcmtkb3duUHJldmlld1ZpZXcnLFxuICAgICAgZmlsZVBhdGg6IHRoaXMuZ2V0UGF0aCgpIHx8IHRoaXMuZmlsZVBhdGgsXG4gICAgICBlZGl0b3JJZDogdGhpcy5lZGl0b3JJZCxcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIHBhdGggJiYgaW1hZ2VXYXRjaGVyLnJlbW92ZUZpbGUocGF0aClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQoX2NhbGxiYWNrOiBhbnkpIHtcbiAgICAvLyBObyBvcCB0byBzdXBwcmVzcyBkZXByZWNhdGlvbiB3YXJuaW5nXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKClcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTWFya2Rvd24oY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLW1hcmtkb3duJywgY2FsbGJhY2spXG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICB9XG5cbiAgcmVzb2x2ZUVkaXRvcihlZGl0b3JJZDogbnVtYmVyKSB7XG4gICAgdGhpcy5lZGl0b3IgPSB0aGlzLmVkaXRvckZvcklkKGVkaXRvcklkKVxuXG4gICAgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGVkaXRvciB0aGlzIHByZXZpZXcgd2FzIGNyZWF0ZWQgZm9yIGhhcyBiZWVuIGNsb3NlZCBzbyBjbG9zZVxuICAgICAgLy8gdGhpcyBwcmV2aWV3IHNpbmNlIGEgcHJldmlldyBjYW5ub3QgYmUgcmVuZGVyZWQgd2l0aG91dCBhbiBlZGl0b3JcbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgcGFuZSAmJiBwYW5lLmRlc3Ryb3lJdGVtKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgZWRpdG9yRm9ySWQoZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICAgIGlmIChlZGl0b3IuaWQgPT09IGVkaXRvcklkKSB7XG4gICAgICAgIHJldHVybiBlZGl0b3JcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaGFuZGxlRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIoKCkgPT5cbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgIClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRVcGRhdGVHcmFtbWFyKFxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4gdGhpcy5lbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAtMTAgfSksXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PiB0aGlzLmVsZW1lbnQuc2Nyb2xsQnkoeyB0b3A6IDEwIH0pLFxuICAgICAgJ2NvcmU6c2F2ZS1hcyc6IChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMuc2F2ZUFzKCkpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6Y29weSc6IChldmVudDogQ29tbWFuZEV2ZW50KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmNvcHlUb0NsaXBib2FyZCgpKSBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgfSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pbic6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLmVsZW1lbnQuc3R5bGUuem9vbSB8fCAnMScpXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS56b29tID0gKHpvb21MZXZlbCArIDAuMSkudG9TdHJpbmcoKVxuICAgICAgfSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHpvb21MZXZlbCA9IHBhcnNlRmxvYXQodGhpcy5lbGVtZW50LnN0eWxlLnpvb20gfHwgJzEnKVxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuem9vbSA9ICh6b29tTGV2ZWwgLSAwLjEpLnRvU3RyaW5nKClcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnJlc2V0LXpvb20nOiAoKSA9PiAodGhpcy5lbGVtZW50LnN0eWxlLnpvb20gPSAnMScpLFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXNvdXJjZSc6IChldmVudCkgPT4ge1xuICAgICAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgICAgIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKChzb3VyY2U/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3luY1NvdXJjZShzb3VyY2UsIGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgICB9KSxcbiAgICAgICAgKVxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgY29uc3QgY2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuXG4gICAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgIGlmIChwYW5lICE9PSB1bmRlZmluZWQgJiYgcGFuZSAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKSB7XG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5maWxlLm9uRGlkQ2hhbmdlKGNoYW5nZUhhbmRsZXIpKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyhmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uRGlkQ2hhbmdlUGF0aCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQoYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuZWRpdG9yKSwge1xuICAgICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1wcmV2aWV3JzogYXN5bmMgKF9ldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpXG4gICAgICAgICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuZWRpdG9yKSByZXR1cm5cbiAgICAgICAgICAgIHRoaXMuc3luY1ByZXZpZXcoc291cmNlLCB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdylcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICB9XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmJyZWFrT25TaW5nbGVOZXdsaW5lJyxcbiAgICAgICAgY2hhbmdlSGFuZGxlcixcbiAgICAgICksXG4gICAgKVxuXG4gICAgLy8gVG9nZ2xlIExhVGVYIHJlbmRlcmluZyBpZiBmb2N1cyBpcyBvbiBwcmV2aWV3IHBhbmUgb3IgYXNzb2NpYXRlZCBlZGl0b3IuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6ICgpID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpID09PSB0aGlzIHx8XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkgPT09IHRoaXMuZWRpdG9yXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckxhVGVYID0gIXRoaXMucmVuZGVyTGFUZVhcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScsXG4gICAgICAgICh1c2VHaXRIdWJTdHlsZSkgPT4ge1xuICAgICAgICAgIGlmICh1c2VHaXRIdWJTdHlsZSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJywgJycpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgKSxcbiAgICApXG4gIH1cblxuICBhc3luYyByZW5kZXJNYXJrZG93bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICB0aGlzLnNob3dMb2FkaW5nKClcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oYXN5bmMgKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJNYXJrZG93blRleHQoc291cmNlKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfSlcbiAgICB0aGlzLnJlc29sdmUoKVxuICB9XG5cbiAgYXN5bmMgcmVmcmVzaEltYWdlcyhvbGRzcmM6IHN0cmluZykge1xuICAgIGNvbnN0IGltZ3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW1nW3NyY10nKSBhcyBOb2RlTGlzdE9mPFxuICAgICAgSFRNTEltYWdlRWxlbWVudFxuICAgID5cbiAgICBjb25zdCByZXN1bHQgPSBbXVxuICAgIGZvciAoY29uc3QgaW1nIG9mIEFycmF5LmZyb20oaW1ncykpIHtcbiAgICAgIGxldCBvdnM6IHN0cmluZyB8IHVuZGVmaW5lZFxuICAgICAgbGV0IG92OiBudW1iZXIgfCB1bmRlZmluZWRcbiAgICAgIGxldCBzcmMgPSBpbWcuZ2V0QXR0cmlidXRlKCdzcmMnKSFcbiAgICAgIGNvbnN0IG1hdGNoID0gc3JjLm1hdGNoKC9eKC4qKVxcP3Y9KFxcZCspJC8pXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgO1ssIHNyYywgb3ZzXSA9IG1hdGNoXG4gICAgICB9XG4gICAgICBpZiAoc3JjID09PSBvbGRzcmMpIHtcbiAgICAgICAgaWYgKG92cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgb3YgPSBwYXJzZUludChvdnMsIDEwKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHYgPSBhd2FpdCBpbWFnZVdhdGNoZXIuZ2V0VmVyc2lvbihzcmMsIHRoaXMuZ2V0UGF0aCgpKVxuICAgICAgICBpZiAodiAhPT0gb3YpIHtcbiAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKGltZy5zcmMgPSBgJHtzcmN9P3Y9JHt2fWApKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoaW1nLnNyYyA9IGAke3NyY31gKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIGFzeW5jIGdldE1hcmtkb3duU291cmNlKCkge1xuICAgIGlmICh0aGlzLmZpbGUgJiYgdGhpcy5maWxlLmdldFBhdGgoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZWFkKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0VGV4dCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRIVE1MKGNhbGxiYWNrOiAoZXJyb3I6IEVycm9yIHwgbnVsbCwgaHRtbEJvZHk6IHN0cmluZykgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVuZGVyZXIudG9IVE1MKFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgKVxuICAgIH0pXG4gIH1cblxuICBhc3luYyByZW5kZXJNYXJrZG93blRleHQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHJlbmRlcmVyLnRvRE9NRnJhZ21lbnQoXG4gICAgICB0ZXh0LFxuICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAoZXJyb3IsIGRvbUZyYWdtZW50KSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgLy8gZGl2LnVwZGF0ZS1wcmV2aWV3IGNyZWF0ZWQgYWZ0ZXIgY29uc3RydWN0b3Igc3QgVXBkYXRlUHJldmlldyBjYW5ub3RcbiAgICAgICAgICAvLyBiZSBpbnN0YW5jZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgaWYgKCF0aGlzLnVwZGF0ZVByZXZpZXcgJiYgdGhpcy5wcmV2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcgPSBuZXcgVXBkYXRlUHJldmlldyh0aGlzLnByZXZpZXcpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyAmJlxuICAgICAgICAgICAgZG9tRnJhZ21lbnQgJiZcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldy51cGRhdGUoZG9tRnJhZ21lbnQgYXMgRWxlbWVudCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1tYXJrZG93bicpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKVxuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgaWYgKHAgJiYgdGhpcy5maWxlKSB7XG4gICAgICByZXR1cm4gYCR7cGF0aC5iYXNlbmFtZShwKX0gUHJldmlld2BcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5lZGl0b3IuZ2V0VGl0bGUoKX0gUHJldmlld2BcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdNYXJrZG93biBQcmV2aWV3J1xuICAgIH1cbiAgfVxuXG4gIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAnbWFya2Rvd24nXG4gIH1cblxuICBnZXRVUkkoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly8ke3RoaXMuZ2V0UGF0aCgpfWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9lZGl0b3IvJHt0aGlzLmVkaXRvcklkfWBcbiAgICB9XG4gIH1cblxuICBnZXRQYXRoKCkge1xuICAgIGlmICh0aGlzLmZpbGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0UGF0aCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFBhdGgoKVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBnZXRHcmFtbWFyKCk6IEdyYW1tYXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmVkaXRvciAmJiB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgfVxuXG4gIGdldERvY3VtZW50U3R5bGVTaGVldHMoKSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBleGlzdHMgc28gd2UgY2FuIHN0dWIgaXRcbiAgICByZXR1cm4gZG9jdW1lbnQuc3R5bGVTaGVldHNcbiAgfVxuXG4gIGdldFRleHRFZGl0b3JTdHlsZXMoKSB7XG4gICAgY29uc3QgdGV4dEVkaXRvclN0eWxlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnYXRvbS1zdHlsZXMnLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgJiB7IGluaXRpYWxpemUoc3R5bGVzOiBTdHlsZU1hbmFnZXIpOiB2b2lkIH1cbiAgICB0ZXh0RWRpdG9yU3R5bGVzLmluaXRpYWxpemUoYXRvbS5zdHlsZXMpXG4gICAgdGV4dEVkaXRvclN0eWxlcy5zZXRBdHRyaWJ1dGUoJ2NvbnRleHQnLCAnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0RWRpdG9yU3R5bGVzKVxuXG4gICAgLy8gRXh0cmFjdCBzdHlsZSBlbGVtZW50cyBjb250ZW50XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGV4dEVkaXRvclN0eWxlcy5jaGlsZE5vZGVzKS5tYXAoXG4gICAgICAoc3R5bGVFbGVtZW50KSA9PiAoc3R5bGVFbGVtZW50IGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHQsXG4gICAgKVxuICB9XG5cbiAgZ2V0TWFya2Rvd25QcmV2aWV3Q1NTKCkge1xuICAgIGNvbnN0IG1hcmtkb3dQcmV2aWV3UnVsZXMgPSBbXVxuICAgIGNvbnN0IHJ1bGVSZWdFeHAgPSAvXFwubWFya2Rvd24tcHJldmlldy9cbiAgICBjb25zdCBjc3NVcmxSZWZFeHAgPSAvdXJsXFwoYXRvbTpcXC9cXC9tYXJrZG93bi1wcmV2aWV3LXBsdXNcXC9hc3NldHNcXC8oLiopXFwpL1xuXG4gICAgZm9yIChjb25zdCBzdHlsZXNoZWV0IG9mIEFycmF5LmZyb20odGhpcy5nZXREb2N1bWVudFN0eWxlU2hlZXRzKCkpKSB7XG4gICAgICBpZiAoc3R5bGVzaGVldC5ydWxlcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAoY29uc3QgcnVsZSBvZiBBcnJheS5mcm9tKHN0eWxlc2hlZXQucnVsZXMpKSB7XG4gICAgICAgICAgLy8gV2Ugb25seSBuZWVkIGAubWFya2Rvd24tcmV2aWV3YCBjc3NcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAocnVsZS5zZWxlY3RvclRleHQgIT0gbnVsbFxuICAgICAgICAgICAgICA/IHJ1bGUuc2VsZWN0b3JUZXh0Lm1hdGNoKHJ1bGVSZWdFeHApXG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkKSAhPSBudWxsXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBtYXJrZG93UHJldmlld1J1bGVzLnB1c2gocnVsZS5jc3NUZXh0KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrZG93UHJldmlld1J1bGVzXG4gICAgICAuY29uY2F0KHRoaXMuZ2V0VGV4dEVkaXRvclN0eWxlcygpKVxuICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAucmVwbGFjZSgvYXRvbS10ZXh0LWVkaXRvci9nLCAncHJlLmVkaXRvci1jb2xvcnMnKVxuICAgICAgLnJlcGxhY2UoLzpob3N0L2csICcuaG9zdCcpIC8vIFJlbW92ZSBzaGFkb3ctZG9tIDpob3N0IHNlbGVjdG9yIGNhdXNpbmcgcHJvYmxlbSBvbiBGRlxuICAgICAgLnJlcGxhY2UoY3NzVXJsUmVmRXhwLCBmdW5jdGlvbihcbiAgICAgICAgX21hdGNoLFxuICAgICAgICBhc3NldHNOYW1lOiBzdHJpbmcsXG4gICAgICAgIF9vZmZzZXQsXG4gICAgICAgIF9zdHJpbmcsXG4gICAgICApIHtcbiAgICAgICAgLy8gYmFzZTY0IGVuY29kZSBhc3NldHNcbiAgICAgICAgY29uc3QgYXNzZXRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2Fzc2V0cycsIGFzc2V0c05hbWUpXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhhc3NldFBhdGgsICdiaW5hcnknKVxuICAgICAgICBjb25zdCBiYXNlNjREYXRhID0gbmV3IEJ1ZmZlcihvcmlnaW5hbERhdGEsICdiaW5hcnknKS50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgcmV0dXJuIGB1cmwoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtiYXNlNjREYXRhfScpYFxuICAgICAgfSlcbiAgfVxuXG4gIHNob3dFcnJvcihyZXN1bHQ6IEVycm9yKSB7XG4gICAgY29uc3QgZXJyb3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGVycm9yLmlubmVySFRNTCA9IGA8aDI+UHJldmlld2luZyBNYXJrZG93biBGYWlsZWQ8L2gyPjxoMz4ke1xuICAgICAgcmVzdWx0Lm1lc3NhZ2VcbiAgICB9PC9oMz5gXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKGVycm9yKVxuICB9XG5cbiAgc2hvd0xvYWRpbmcoKSB7XG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZVxuICAgIGNvbnN0IHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNwaW5uZXIuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tc3Bpbm5lcicpXG4gICAgc3Bpbm5lci5pbm5lclRleHQgPSAnTG9hZGluZyBNYXJrZG93blxcdTIwMjYnXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gIH1cblxuICBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKClcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzZWxlY3Rpb24uYmFzZU5vZGUgYXMgSFRNTEVsZW1lbnRcblxuICAgIC8vIFVzZSBkZWZhdWx0IGNvcHkgZXZlbnQgaGFuZGxlciBpZiB0aGVyZSBpcyBzZWxlY3RlZCB0ZXh0IGluc2lkZSB0aGlzIHZpZXdcbiAgICBpZiAoXG4gICAgICBzZWxlY3RlZFRleHQgJiZcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vVE9ETzogY29tcGxhaW4gb24gVFNcbiAgICAgIHNlbGVjdGVkTm9kZSAhPSBudWxsICYmXG4gICAgICAodGhpcy5lbGVtZW50ID09PSBzZWxlY3RlZE5vZGUgfHwgdGhpcy5lbGVtZW50LmNvbnRhaW5zKHNlbGVjdGVkTm9kZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgdGhpcy5nZXRIVE1MKGZ1bmN0aW9uKGVycm9yLCBodG1sKSB7XG4gICAgICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybignQ29weWluZyBNYXJrZG93biBhcyBIVE1MIGZhaWxlZCcsIGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGh0bWwpXG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgIClcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBhc3luYyBzYXZlQXMoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IGZpbGVQYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBsZXQgdGl0bGUgPSAnTWFya2Rvd24gdG8gSFRNTCdcbiAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgIHRpdGxlID0gcGF0aC5wYXJzZShmaWxlUGF0aCkubmFtZVxuICAgICAgZmlsZVBhdGggKz0gJy5odG1sJ1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICBmaWxlUGF0aCA9ICd1bnRpdGxlZC5tZC5odG1sJ1xuICAgICAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBmaWxlUGF0aClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBodG1sRmlsZVBhdGggPSBhdG9tLnNob3dTYXZlRGlhbG9nU3luYyhmaWxlUGF0aClcbiAgICBpZiAoaHRtbEZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRIVE1MKChlcnJvcjogRXJyb3IgfCBudWxsLCBodG1sQm9keTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybignU2F2aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IG1hdGhqYXhTY3JpcHRcbiAgICAgICAgICBpZiAodGhpcy5yZW5kZXJMYVRlWCkge1xuICAgICAgICAgICAgbWF0aGpheFNjcmlwdCA9IGBcXFxuXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L3gtbWF0aGpheC1jb25maWdcIj5cbiAgTWF0aEpheC5IdWIuQ29uZmlnKHtcbiAgICBqYXg6IFtcImlucHV0L1RlWFwiLFwib3V0cHV0L0hUTUwtQ1NTXCJdLFxuICAgIGV4dGVuc2lvbnM6IFtdLFxuICAgIFRlWDoge1xuICAgICAgZXh0ZW5zaW9uczogW1wiQU1TbWF0aC5qc1wiLFwiQU1Tc3ltYm9scy5qc1wiLFwibm9FcnJvcnMuanNcIixcIm5vVW5kZWZpbmVkLmpzXCJdXG4gICAgfSxcbiAgICBzaG93TWF0aE1lbnU6IGZhbHNlXG4gIH0pO1xuPC9zY3JpcHQ+XG48c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBzcmM9XCJodHRwczovL2Nkbi5tYXRoamF4Lm9yZy9tYXRoamF4L2xhdGVzdC9NYXRoSmF4LmpzXCI+XG48L3NjcmlwdD5cXFxuYFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXRoamF4U2NyaXB0ID0gJydcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaHRtbCA9XG4gICAgICAgICAgICBgXFxcbjwhRE9DVFlQRSBodG1sPlxuPGh0bWw+XG4gIDxoZWFkPlxuICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCIgLz5cbiAgICAgIDx0aXRsZT4ke3RpdGxlfTwvdGl0bGU+JHttYXRoamF4U2NyaXB0fVxuICAgICAgPHN0eWxlPiR7dGhpcy5nZXRNYXJrZG93blByZXZpZXdDU1MoKX08L3N0eWxlPlxuICA8L2hlYWQ+XG4gIDxib2R5IGNsYXNzPSdtYXJrZG93bi1wcmV2aWV3Jz4ke2h0bWxCb2R5fTwvYm9keT5cbjwvaHRtbD5gICsgJ1xcbicgLy8gRW5zdXJlIHRyYWlsaW5nIG5ld2xpbmVcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoaHRtbEZpbGVQYXRoLCBodG1sKVxuICAgICAgICAgIGhhbmRsZVByb21pc2UoYXRvbS53b3Jrc3BhY2Uub3BlbihodG1sRmlsZVBhdGgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlzRXF1YWwob3RoZXI6IG51bGwgfCBbTm9kZV0pIHtcbiAgICByZXR1cm4gdGhpc1swXSA9PT0gKG90aGVyICE9PSBudWxsID8gb3RoZXJbMF0gOiB1bmRlZmluZWQpIC8vIENvbXBhcmUgRE9NIGVsZW1lbnRzXG4gIH1cblxuICAvL1xuICAvLyBGaW5kIHRoZSBjbG9zZXN0IGFuY2VzdG9yIG9mIGFuIGVsZW1lbnQgdGhhdCBpcyBub3QgYSBkZWNlbmRhbnQgb2YgZWl0aGVyXG4gIC8vIGBzcGFuLm1hdGhgIG9yIGBzcGFuLmF0b20tdGV4dC1lZGl0b3JgLlxuICAvL1xuICAvLyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IGZyb20gd2hpY2ggdGhlIHNlYXJjaCBmb3IgYVxuICAvLyAgIGNsb3Nlc3QgYW5jZXN0b3IgYmVnaW5zLlxuICAvLyBAcmV0dXJuIHtIVE1MRWxlbWVudH0gVGhlIGNsb3Nlc3QgYW5jZXN0b3IgdG8gYGVsZW1lbnRgIHRoYXQgZG9lcyBub3RcbiAgLy8gICBjb250YWluIGVpdGhlciBgc3Bhbi5tYXRoYCBvciBgc3Bhbi5hdG9tLXRleHQtZWRpdG9yYC5cbiAgLy9cbiAgYnViYmxlVG9Db250YWluZXJFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgIGxldCB0ZXN0RWxlbWVudCA9IGVsZW1lbnRcbiAgICB3aGlsZSAodGVzdEVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRlc3RFbGVtZW50LnBhcmVudEVsZW1lbnRcbiAgICAgIGlmICghcGFyZW50KSBicmVha1xuICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ01hdGhKYXhfRGlzcGxheScpKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQucGFyZW50RWxlbWVudCFcbiAgICAgIH1cbiAgICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhdG9tLXRleHQtZWRpdG9yJykpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudFxuICAgICAgfVxuICAgICAgdGVzdEVsZW1lbnQgPSBwYXJlbnRcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBhIHN1YnNlcXVlbmNlIG9mIGEgc2VxdWVuY2Ugb2YgdG9rZW5zIHJlcHJlc2VudGluZyBhIHBhdGggdGhyb3VnaFxuICAvLyBIVE1MRWxlbWVudHMgdGhhdCBkb2VzIG5vdCBjb250aW51ZSBkZWVwZXIgdGhhbiBhIHRhYmxlIGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBwYXRoVG9Ub2tlbiBBcnJheSBvZiB0b2tlbnNcbiAgLy8gICByZXByZXNlbnRpbmcgYSBwYXRoIHRvIGEgSFRNTEVsZW1lbnQgd2l0aCB0aGUgcm9vdCBlbGVtZW50IGF0XG4gIC8vICAgcGF0aFRvVG9rZW5bMF0gYW5kIHRoZSB0YXJnZXQgZWxlbWVudCBhdCB0aGUgaGlnaGVzdCBpbmRleC4gRWFjaCBlbGVtZW50XG4gIC8vICAgY29uc2lzdHMgb2YgYSBgdGFnYCBhbmQgYGluZGV4YCByZXByZXNlbnRpbmcgaXRzIGluZGV4IGFtb25nc3QgaXRzXG4gIC8vICAgc2libGluZyBlbGVtZW50cyBvZiB0aGUgc2FtZSBgdGFnYC5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBUaGUgc3Vic2VxdWVuY2Ugb2YgcGF0aFRvVG9rZW4gdGhhdFxuICAvLyAgIG1haW50YWlucyB0aGUgc2FtZSByb290IGJ1dCB0ZXJtaW5hdGVzIGF0IGEgdGFibGUgZWxlbWVudCBvciB0aGUgdGFyZ2V0XG4gIC8vICAgZWxlbWVudCwgd2hpY2hldmVyIGNvbWVzIGZpcnN0LlxuICAvL1xuICBidWJibGVUb0NvbnRhaW5lclRva2VuKHBhdGhUb1Rva2VuOiBBcnJheTx7IHRhZzogc3RyaW5nOyBpbmRleDogbnVtYmVyIH0+KSB7XG4gICAgY29uc3QgZW5kID0gcGF0aFRvVG9rZW4ubGVuZ3RoIC0gMVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICBpZiAocGF0aFRvVG9rZW5baV0udGFnID09PSAndGFibGUnKSB7XG4gICAgICAgIHJldHVybiBwYXRoVG9Ub2tlbi5zbGljZSgwLCBpICsgMSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG4gIH1cblxuICAvL1xuICAvLyBFbmNvZGUgdGFncyBmb3IgbWFya2Rvd24taXQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgRW5jb2RlIHRoZSB0YWcgb2YgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7c3RyaW5nfSBFbmNvZGVkIHRhZy5cbiAgLy9cbiAgZW5jb2RlVGFnKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hdGgnKSkge1xuICAgICAgcmV0dXJuICdtYXRoJ1xuICAgIH1cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F0b20tdGV4dC1lZGl0b3InKSkge1xuICAgICAgcmV0dXJuICdjb2RlJ1xuICAgIH0gLy8gb25seSB0b2tlbi50eXBlIGlzIGBmZW5jZWAgY29kZSBibG9ja3Mgc2hvdWxkIGV2ZXIgYmUgZm91bmQgaW4gdGhlIGZpcnN0IGxldmVsIG9mIHRoZSB0b2tlbnMgYXJyYXlcbiAgICByZXR1cm4gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIC8vXG4gIC8vIERlY29kZSB0YWdzIHVzZWQgYnkgbWFya2Rvd24taXRcbiAgLy9cbiAgLy8gQHBhcmFtIHttYXJrZG93bi1pdC5Ub2tlbn0gdG9rZW4gRGVjb2RlIHRoZSB0YWcgb2YgdG9rZW4uXG4gIC8vIEByZXR1cm4ge3N0cmluZ3xudWxsfSBEZWNvZGVkIHRhZyBvciBgbnVsbGAgaWYgdGhlIHRva2VuIGhhcyBubyB0YWcuXG4gIC8vXG4gIGRlY29kZVRhZyh0b2tlbjogVG9rZW4pOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAodG9rZW4udGFnID09PSAnbWF0aCcpIHtcbiAgICAgIHJldHVybiAnc3BhbidcbiAgICB9XG4gICAgaWYgKHRva2VuLnRhZyA9PT0gJ2NvZGUnKSB7XG4gICAgICByZXR1cm4gJ3NwYW4nXG4gICAgfVxuICAgIGlmICh0b2tlbi50YWcgPT09ICcnKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICByZXR1cm4gdG9rZW4udGFnXG4gIH1cblxuICAvL1xuICAvLyBEZXRlcm1pbmUgcGF0aCB0byBhIHRhcmdldCBlbGVtZW50IGZyb20gYSBjb250YWluZXIgYC5tYXJrZG93bi1wcmV2aWV3YC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgSFRNTEVsZW1lbnQuXG4gIC8vIEByZXR1cm4geyh0YWc6IDx0YWc+LCBpbmRleDogPGluZGV4PilbXX0gQXJyYXkgb2YgdG9rZW5zIHJlcHJlc2VudGluZyBhIHBhdGhcbiAgLy8gICB0byBgZWxlbWVudGAgZnJvbSBgLm1hcmtkb3duLXByZXZpZXdgLiBUaGUgcm9vdCBgLm1hcmtkb3duLXByZXZpZXdgXG4gIC8vICAgZWxlbWVudCBpcyB0aGUgZmlyc3QgZWxlbWVudHMgaW4gdGhlIGFycmF5IGFuZCB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgLy8gICBgZWxlbWVudGAgYXQgdGhlIGhpZ2hlc3QgaW5kZXguIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZFxuICAvLyAgIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lXG4gIC8vICAgYHRhZ2AuXG4gIC8vXG4gIGdldFBhdGhUb0VsZW1lbnQoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICk6IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4ge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgfSxcbiAgICAgIF1cbiAgICB9XG5cbiAgICBlbGVtZW50ID0gdGhpcy5idWJibGVUb0NvbnRhaW5lckVsZW1lbnQoZWxlbWVudClcbiAgICBjb25zdCB0YWcgPSB0aGlzLmVuY29kZVRhZyhlbGVtZW50KVxuICAgIGNvbnN0IHNpYmxpbmdzID0gZWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblxuICAgIGxldCBzaWJsaW5nc0NvdW50ID0gMFxuXG4gICAgZm9yIChjb25zdCBzaWJsaW5nIG9mIEFycmF5LmZyb20oc2libGluZ3MpKSB7XG4gICAgICBjb25zdCBzaWJsaW5nVGFnID1cbiAgICAgICAgc2libGluZy5ub2RlVHlwZSA9PT0gMSA/IHRoaXMuZW5jb2RlVGFnKHNpYmxpbmcgYXMgSFRNTEVsZW1lbnQpIDogbnVsbFxuICAgICAgaWYgKHNpYmxpbmcgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGF0aFRvRWxlbWVudCA9IHRoaXMuZ2V0UGF0aFRvRWxlbWVudChlbGVtZW50LnBhcmVudEVsZW1lbnQhKVxuICAgICAgICBwYXRoVG9FbGVtZW50LnB1c2goe1xuICAgICAgICAgIHRhZyxcbiAgICAgICAgICBpbmRleDogc2libGluZ3NDb3VudCxcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHBhdGhUb0VsZW1lbnRcbiAgICAgIH0gZWxzZSBpZiAoc2libGluZ1RhZyA9PT0gdGFnKSB7XG4gICAgICAgIHNpYmxpbmdzQ291bnQrK1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWx1cmUgaW4gZ2V0UGF0aFRvRWxlbWVudCcpXG4gIH1cblxuICAvL1xuICAvLyBTZXQgdGhlIGFzc29jaWF0ZWQgZWRpdG9ycyBjdXJzb3IgYnVmZmVyIHBvc2l0aW9uIHRvIHRoZSBsaW5lIHJlcHJlc2VudGluZ1xuICAvLyB0aGUgc291cmNlIG1hcmtkb3duIG9mIGEgdGFyZ2V0IGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGFyZ2V0IGVsZW1lbnQgY29udGFpbmVkIHdpdGhpbiB0aGUgYXNzb2ljYXRlZFxuICAvLyAgIGAubWFya2Rvd24tcHJldmlld2AgY29udGFpbmVyLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0byBpZGVudGlmeSB0aGVcbiAgLy8gICBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgIGFuZCBzZXQgdGhlIGN1cnNvciB0byB0aGF0IGxpbmUuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YC4gSWYgbm9cbiAgLy8gICBsaW5lIGlzIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jU291cmNlKHRleHQ6IHN0cmluZywgZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQpXG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBkaXYubWFya2Rvd24tcHJldmlld1xuICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKSAvLyByZW1vdmUgZGl2LnVwZGF0ZS1wcmV2aWV3XG4gICAgaWYgKCFwYXRoVG9FbGVtZW50Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGxldCBmaW5hbFRva2VuID0gbnVsbFxuICAgIGxldCBsZXZlbCA9IDBcblxuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICBpZiAodG9rZW4ubGV2ZWwgPCBsZXZlbCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuLmhpZGRlbikge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKHRva2VuLnRhZyA9PT0gcGF0aFRvRWxlbWVudFswXS50YWcgJiYgdG9rZW4ubGV2ZWwgPT09IGxldmVsKSB7XG4gICAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAxKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vIFRPRE86IGNvbXBsYWluIG9uIERUXG4gICAgICAgICAgICBpZiAodG9rZW4ubWFwICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KClcbiAgICAgICAgICAgIGxldmVsKytcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHRva2VuLm5lc3RpbmcgPT09IDAgJiZcbiAgICAgICAgICBbJ21hdGgnLCAnY29kZScsICdociddLmluY2x1ZGVzKHRva2VuLnRhZylcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGZpbmFsVG9rZW4gPSB0b2tlblxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGF0aFRvRWxlbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmluYWxUb2tlbiAhPT0gbnVsbCAmJiB0aGlzLmVkaXRvcikge1xuICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2ZpbmFsVG9rZW4ubWFwWzBdLCAwXSlcbiAgICAgIHJldHVybiBmaW5hbFRva2VuLm1hcFswXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBwYXRoIHRvIGEgdGFyZ2V0IHRva2VuLlxuICAvL1xuICAvLyBAcGFyYW0geyhtYXJrZG93bi1pdC5Ub2tlbilbXX0gdG9rZW5zIEFycmF5IG9mIHRva2VucyBhcyByZXR1cm5lZCBieVxuICAvLyAgIGBtYXJrZG93bi1pdC5wYXJzZSgpYC5cbiAgLy8gQHBhcmFtIHtudW1iZXJ9IGxpbmUgTGluZSByZXByZXNlbnRpbmcgdGhlIHRhcmdldCB0b2tlbi5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBBcnJheSByZXByZXNlbnRpbmcgYSBwYXRoIHRvIHRoZVxuICAvLyAgIHRhcmdldCB0b2tlbi4gVGhlIHJvb3QgdG9rZW4gaXMgcmVwcmVzZW50ZWQgYnkgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlXG4gIC8vICAgYXJyYXkgYW5kIHRoZSB0YXJnZXQgdG9rZW4gYnkgdGhlIGxhc3QgZWxtZW50LiBFYWNoIGVsZW1lbnQgY29uc2lzdHMgb2YgYVxuICAvLyAgIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHMgc2libGluZyB0b2tlbnMgaW5cbiAgLy8gICBgdG9rZW5zYCBvZiB0aGUgc2FtZSBgdGFnYC4gYGxpbmVgIHdpbGwgbGllIGJldHdlZW4gdGhlIHByb3BlcnRpZXNcbiAgLy8gICBgbWFwWzBdYCBhbmQgYG1hcFsxXWAgb2YgdGhlIHRhcmdldCB0b2tlbi5cbiAgLy9cbiAgZ2V0UGF0aFRvVG9rZW4odG9rZW5zOiBUb2tlbltdLCBsaW5lOiBudW1iZXIpIHtcbiAgICBsZXQgcGF0aFRvVG9rZW46IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4gPSBbXVxuICAgIGxldCB0b2tlblRhZ0NvdW50OiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB8IHVuZGVmaW5lZCB9ID0ge31cbiAgICBsZXQgbGV2ZWwgPSAwXG5cbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgaWYgKHRva2VuLmxldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5oaWRkZW4pIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAtMSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCB0YWcgPSB0aGlzLmRlY29kZVRhZyh0b2tlbilcbiAgICAgIGlmICh0YWcgPT09IG51bGwpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIHRva2VuLnRhZyA9IHRhZ1xuXG4gICAgICBpZiAoXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vIFRPRE86IGNvbXBsYWluIG9uIERUXG4gICAgICAgIHRva2VuLm1hcCAhPSBudWxsICYmIC8vIHRva2VuLm1hcCAqY2FuKiBiZSBudWxsXG4gICAgICAgIGxpbmUgPj0gdG9rZW4ubWFwWzBdICYmXG4gICAgICAgIGxpbmUgPD0gdG9rZW4ubWFwWzFdIC0gMVxuICAgICAgKSB7XG4gICAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAxKSB7XG4gICAgICAgICAgcGF0aFRvVG9rZW4ucHVzaCh7XG4gICAgICAgICAgICB0YWc6IHRva2VuLnRhZyxcbiAgICAgICAgICAgIGluZGV4OiB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gfHwgMCxcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRva2VuVGFnQ291bnQgPSB7fVxuICAgICAgICAgIGxldmVsKytcbiAgICAgICAgfSBlbHNlIGlmICh0b2tlbi5uZXN0aW5nID09PSAwKSB7XG4gICAgICAgICAgcGF0aFRvVG9rZW4ucHVzaCh7XG4gICAgICAgICAgICB0YWc6IHRva2VuLnRhZyxcbiAgICAgICAgICAgIGluZGV4OiB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gfHwgMCxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodG9rZW4ubGV2ZWwgPT09IGxldmVsKSB7XG4gICAgICAgIGlmICh0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSErK1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSA9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHBhdGhUb1Rva2VuID0gdGhpcy5idWJibGVUb0NvbnRhaW5lclRva2VuKHBhdGhUb1Rva2VuKVxuICAgIHJldHVybiBwYXRoVG9Ub2tlblxuICB9XG5cbiAgLy9cbiAgLy8gU2Nyb2xsIHRoZSBhc3NvY2lhdGVkIHByZXZpZXcgdG8gdGhlIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSB0YXJnZXQgbGluZSBvZlxuICAvLyBvZiB0aGUgc291cmNlIG1hcmtkb3duLlxuICAvL1xuICAvLyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBUYXJnZXQgbGluZSBvZiBgdGV4dGAuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvXG4gIC8vICAgaWRlbnRpZnkgdGhlIGVsbWVudCBvZiB0aGUgYXNzb2NpYXRlZCBgLm1hcmtkb3duLXByZXZpZXdgIHRoYXQgcmVwcmVzZW50c1xuICAvLyAgIGBsaW5lYCBhbmQgc2Nyb2xsIHRoZSBgLm1hcmtkb3duLXByZXZpZXdgIHRvIHRoYXQgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBlbGVtZW50IHRoYXQgcmVwcmVzZW50cyBgbGluZWAuIElmIG5vIGVsZW1lbnQgaXNcbiAgLy8gICBpZGVudGlmaWVkIGBudWxsYCBpcyByZXR1cm5lZC5cbiAgLy9cbiAgc3luY1ByZXZpZXcodGV4dDogc3RyaW5nLCBsaW5lOiBudW1iZXIpIHtcbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGNvbnN0IHBhdGhUb1Rva2VuID0gdGhpcy5nZXRQYXRoVG9Ub2tlbih0b2tlbnMsIGxpbmUpXG5cbiAgICBsZXQgZWxlbWVudCA9IHRoaXMucHJldmlld1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgcGF0aFRvVG9rZW4pIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZUVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGVsZW1lbnRcbiAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoYDpzY29wZSA+ICR7dG9rZW4udGFnfWApXG4gICAgICAgIC5pdGVtKHRva2VuLmluZGV4KSBhcyBIVE1MRWxlbWVudFxuICAgICAgaWYgKGNhbmRpZGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudCA9IGNhbmRpZGF0ZUVsZW1lbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd1cGRhdGUtcHJldmlldycpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfSAvLyBEbyBub3QganVtcCB0byB0aGUgdG9wIG9mIHRoZSBwcmV2aWV3IGZvciBiYWQgc3luY3NcblxuICAgIGlmICghZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JykpIHtcbiAgICAgIGVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcoKVxuICAgIH1cbiAgICBjb25zdCBtYXhTY3JvbGxUb3AgPSB0aGlzLmVsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5lbGVtZW50LmNsaWVudEhlaWdodFxuICAgIGlmICghKHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPj0gbWF4U2Nyb2xsVG9wKSkge1xuICAgICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCAtPSB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0IC8gNFxuICAgIH1cblxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZmxhc2gnKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gZWxlbWVudCEuY2xhc3NMaXN0LnJlbW92ZSgnZmxhc2gnKSwgMTAwMClcblxuICAgIHJldHVybiBlbGVtZW50XG4gIH1cbn1cbiJdfQ==