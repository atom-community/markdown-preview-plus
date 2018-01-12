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
        this.element = document.createElement('div');
        this.element.getModel = () => this;
        this.element.classList.add('markdown-preview', 'native-key-bindings');
        this.element.tabIndex = -1;
        this.preview = document.createElement('div');
        this.preview.classList.add('update-preview');
        this.element.appendChild(this.preview);
        if (this.editorId !== undefined) {
            this.resolveEditor(this.editorId);
        }
        else if (this.filePath !== undefined) {
            this.subscribeToFilePath(this.filePath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUE2QjtBQUM3QiwrQkFTYTtBQUNiLDRCQUE0QjtBQUM1Qiw4QkFBOEI7QUFFOUIsdUNBQXVDO0FBQ3ZDLHFEQUFnRDtBQUNoRCxtREFBbUQ7QUFDbkQscURBQXFEO0FBQ3JELGlDQUFzQztBQWtCdEM7SUF3QkUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWE7UUF2QnJDLFlBQU8sR0FBWSxJQUFJLENBQUE7UUFHZixrQkFBYSxHQUFrQixJQUFJLE9BQU8sQ0FDeEQsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FDdEMsQ0FBQTtRQUdPLFlBQU8sR0FHVixJQUFJLGNBQU8sRUFBRSxDQUFBO1FBRVYsZ0JBQVcsR0FBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQzlDLHFEQUFxRCxDQUN0RCxDQUFBO1FBQ08sZ0JBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDdkMsV0FBTSxHQUFHLElBQUksQ0FBQTtRQU9uQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxJQUFJLENBQUMs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b2tlbiB9IGZyb20gJ21hcmtkb3duLWl0J1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmltcG9ydCB7XG4gIENvbW1hbmRFdmVudCxcbiAgRW1pdHRlcixcbiAgRGlzcG9zYWJsZSxcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgRmlsZSxcbiAgU3R5bGVNYW5hZ2VyLFxuICBUZXh0RWRpdG9yLFxuICBHcmFtbWFyLFxufSBmcm9tICdhdG9tJ1xuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtcGx1cycpXG5cbmltcG9ydCByZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKVxuaW1wb3J0IHsgVXBkYXRlUHJldmlldyB9IGZyb20gJy4vdXBkYXRlLXByZXZpZXcnXG5pbXBvcnQgbWFya2Rvd25JdCA9IHJlcXVpcmUoJy4vbWFya2Rvd24taXQtaGVscGVyJylcbmltcG9ydCBpbWFnZVdhdGNoZXIgPSByZXF1aXJlKCcuL2ltYWdlLXdhdGNoLWhlbHBlcicpXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc0VkaXRvciB7XG4gIGVkaXRvcklkOiBudW1iZXJcbiAgZmlsZVBhdGg/OiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNUFZQYXJhbXNQYXRoIHtcbiAgZWRpdG9ySWQ/OiB1bmRlZmluZWRcbiAgZmlsZVBhdGg6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBNUFZQYXJhbXMgPSBNUFZQYXJhbXNFZGl0b3IgfCBNUFZQYXJhbXNQYXRoXG5cbmV4cG9ydCB0eXBlIE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50ID0gSFRNTEVsZW1lbnQgJiB7XG4gIGdldE1vZGVsKCk6IE1hcmtkb3duUHJldmlld1ZpZXdcbn1cblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duUHJldmlld1ZpZXcge1xuICBwcml2YXRlIGxvYWRpbmc6IGJvb2xlYW4gPSB0cnVlXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bmluaXRpYWxpemVkXG4gIHByaXZhdGUgcmVzb2x2ZTogKCkgPT4gdm9pZFxuICBwdWJsaWMgcmVhZG9ubHkgcmVuZGVyUHJvbWlzZTogUHJvbWlzZTx2b2lkPiA9IG5ldyBQcm9taXNlPHZvaWQ+KFxuICAgIChyZXNvbHZlKSA9PiAodGhpcy5yZXNvbHZlID0gcmVzb2x2ZSksXG4gIClcbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50XG4gIHByaXZhdGUgcHJldmlldzogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSBlbWl0dGVyOiBFbWl0dGVyPHtcbiAgICAnZGlkLWNoYW5nZS10aXRsZSc6IHVuZGVmaW5lZFxuICAgICdkaWQtY2hhbmdlLW1hcmtkb3duJzogdW5kZWZpbmVkXG4gIH0+ID0gbmV3IEVtaXR0ZXIoKVxuICBwcml2YXRlIHVwZGF0ZVByZXZpZXc/OiBVcGRhdGVQcmV2aWV3XG4gIHByaXZhdGUgcmVuZGVyTGFUZVg6IGJvb2xlYW4gPSAhIWF0b20uY29uZmlnLmdldChcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JyxcbiAgKVxuICBwcml2YXRlIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBwcml2YXRlIGxvYWRlZCA9IHRydWUgLy8gRG8gbm90IHNob3cgdGhlIGxvYWRpbmcgc3Bpbm5vciBvbiBpbml0aWFsIGxvYWRcbiAgcHJpdmF0ZSBlZGl0b3JJZD86IG51bWJlclxuICBwcml2YXRlIGZpbGVQYXRoPzogc3RyaW5nXG4gIHByaXZhdGUgZmlsZT86IEZpbGVcbiAgcHJpdmF0ZSBlZGl0b3I/OiBUZXh0RWRpdG9yXG5cbiAgY29uc3RydWN0b3IoeyBlZGl0b3JJZCwgZmlsZVBhdGggfTogTVBWUGFyYW1zKSB7XG4gICAgdGhpcy5nZXRQYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50LmJpbmQodGhpcylcbiAgICB0aGlzLnN5bmNTb3VyY2UgPSB0aGlzLnN5bmNTb3VyY2UuYmluZCh0aGlzKVxuICAgIHRoaXMuZ2V0UGF0aFRvVG9rZW4gPSB0aGlzLmdldFBhdGhUb1Rva2VuLmJpbmQodGhpcylcbiAgICB0aGlzLnN5bmNQcmV2aWV3ID0gdGhpcy5zeW5jUHJldmlldy5iaW5kKHRoaXMpXG4gICAgdGhpcy5lZGl0b3JJZCA9IGVkaXRvcklkXG4gICAgdGhpcy5maWxlUGF0aCA9IGZpbGVQYXRoXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgYXMgYW55XG4gICAgdGhpcy5lbGVtZW50LmdldE1vZGVsID0gKCkgPT4gdGhpc1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1wcmV2aWV3JywgJ25hdGl2ZS1rZXktYmluZGluZ3MnKVxuICAgIHRoaXMuZWxlbWVudC50YWJJbmRleCA9IC0xXG4gICAgdGhpcy5wcmV2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnByZXZpZXcuY2xhc3NMaXN0LmFkZCgndXBkYXRlLXByZXZpZXcnKVxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnByZXZpZXcpXG5cbiAgICBpZiAodGhpcy5lZGl0b3JJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnJlc29sdmVFZGl0b3IodGhpcy5lZGl0b3JJZClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZmlsZVBhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zdWJzY3JpYmVUb0ZpbGVQYXRoKHRoaXMuZmlsZVBhdGgpXG4gICAgfVxuICB9XG5cbiAgdGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmlubmVyVGV4dFxuICB9XG5cbiAgZmluZCh3aGF0OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3Iod2hhdClcbiAgfVxuXG4gIGZpbmRBbGwod2hhdDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHdoYXQpXG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ01hcmtkb3duUHJldmlld1ZpZXcnLFxuICAgICAgZmlsZVBhdGg6IHRoaXMuZ2V0UGF0aCgpIHx8IHRoaXMuZmlsZVBhdGgsXG4gICAgICBlZGl0b3JJZDogdGhpcy5lZGl0b3JJZCxcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIHBhdGggJiYgaW1hZ2VXYXRjaGVyLnJlbW92ZUZpbGUocGF0aClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQoX2NhbGxiYWNrOiBhbnkpIHtcbiAgICAvLyBObyBvcCB0byBzdXBwcmVzcyBkZXByZWNhdGlvbiB3YXJuaW5nXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKClcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTWFya2Rvd24oY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLW1hcmtkb3duJywgY2FsbGJhY2spXG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICB9XG5cbiAgcmVzb2x2ZUVkaXRvcihlZGl0b3JJZDogbnVtYmVyKSB7XG4gICAgdGhpcy5lZGl0b3IgPSB0aGlzLmVkaXRvckZvcklkKGVkaXRvcklkKVxuXG4gICAgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGVkaXRvciB0aGlzIHByZXZpZXcgd2FzIGNyZWF0ZWQgZm9yIGhhcyBiZWVuIGNsb3NlZCBzbyBjbG9zZVxuICAgICAgLy8gdGhpcyBwcmV2aWV3IHNpbmNlIGEgcHJldmlldyBjYW5ub3QgYmUgcmVuZGVyZWQgd2l0aG91dCBhbiBlZGl0b3JcbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgcGFuZSAmJiBwYW5lLmRlc3Ryb3lJdGVtKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgZWRpdG9yRm9ySWQoZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICAgIGlmIChlZGl0b3IuaWQgPT09IGVkaXRvcklkKSB7XG4gICAgICAgIHJldHVybiBlZGl0b3JcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaGFuZGxlRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIoKCkgPT5cbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgIClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRVcGRhdGVHcmFtbWFyKFxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4gdGhpcy5lbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAtMTAgfSksXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PiB0aGlzLmVsZW1lbnQuc2Nyb2xsQnkoeyB0b3A6IDEwIH0pLFxuICAgICAgJ2NvcmU6c2F2ZS1hcyc6IChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMuc2F2ZUFzKCkpXG4gICAgICB9LFxuICAgICAgJ2NvcmU6Y29weSc6IChldmVudDogQ29tbWFuZEV2ZW50KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmNvcHlUb0NsaXBib2FyZCgpKSBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgfSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pbic6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLmVsZW1lbnQuc3R5bGUuem9vbSB8fCAnMScpXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS56b29tID0gKHpvb21MZXZlbCArIDAuMSkudG9TdHJpbmcoKVxuICAgICAgfSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHpvb21MZXZlbCA9IHBhcnNlRmxvYXQodGhpcy5lbGVtZW50LnN0eWxlLnpvb20gfHwgJzEnKVxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuem9vbSA9ICh6b29tTGV2ZWwgLSAwLjEpLnRvU3RyaW5nKClcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnJlc2V0LXpvb20nOiAoKSA9PiAodGhpcy5lbGVtZW50LnN0eWxlLnpvb20gPSAnMScpLFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXNvdXJjZSc6IChldmVudCkgPT4ge1xuICAgICAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgICAgIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKChzb3VyY2U/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3luY1NvdXJjZShzb3VyY2UsIGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgICB9KSxcbiAgICAgICAgKVxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgY29uc3QgY2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuXG4gICAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgIGlmIChwYW5lICE9PSB1bmRlZmluZWQgJiYgcGFuZSAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKSB7XG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5maWxlLm9uRGlkQ2hhbmdlKGNoYW5nZUhhbmRsZXIpKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyhmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uRGlkQ2hhbmdlUGF0aCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQoYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuZWRpdG9yKSwge1xuICAgICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1wcmV2aWV3JzogYXN5bmMgKF9ldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpXG4gICAgICAgICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuZWRpdG9yKSByZXR1cm5cbiAgICAgICAgICAgIHRoaXMuc3luY1ByZXZpZXcoc291cmNlLCB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdylcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICB9XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmJyZWFrT25TaW5nbGVOZXdsaW5lJyxcbiAgICAgICAgY2hhbmdlSGFuZGxlcixcbiAgICAgICksXG4gICAgKVxuXG4gICAgLy8gVG9nZ2xlIExhVGVYIHJlbmRlcmluZyBpZiBmb2N1cyBpcyBvbiBwcmV2aWV3IHBhbmUgb3IgYXNzb2NpYXRlZCBlZGl0b3IuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6ICgpID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpID09PSB0aGlzIHx8XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkgPT09IHRoaXMuZWRpdG9yXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckxhVGVYID0gIXRoaXMucmVuZGVyTGFUZVhcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScsXG4gICAgICAgICh1c2VHaXRIdWJTdHlsZSkgPT4ge1xuICAgICAgICAgIGlmICh1c2VHaXRIdWJTdHlsZSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJywgJycpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgKSxcbiAgICApXG4gIH1cblxuICBhc3luYyByZW5kZXJNYXJrZG93bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICB0aGlzLnNob3dMb2FkaW5nKClcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oYXN5bmMgKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJNYXJrZG93blRleHQoc291cmNlKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfSlcbiAgICB0aGlzLnJlc29sdmUoKVxuICB9XG5cbiAgYXN5bmMgcmVmcmVzaEltYWdlcyhvbGRzcmM6IHN0cmluZykge1xuICAgIGNvbnN0IGltZ3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW1nW3NyY10nKSBhcyBOb2RlTGlzdE9mPFxuICAgICAgSFRNTEltYWdlRWxlbWVudFxuICAgID5cbiAgICBjb25zdCByZXN1bHQgPSBbXVxuICAgIGZvciAoY29uc3QgaW1nIG9mIEFycmF5LmZyb20oaW1ncykpIHtcbiAgICAgIGxldCBvdnM6IHN0cmluZyB8IHVuZGVmaW5lZFxuICAgICAgbGV0IG92OiBudW1iZXIgfCB1bmRlZmluZWRcbiAgICAgIGxldCBzcmMgPSBpbWcuZ2V0QXR0cmlidXRlKCdzcmMnKSFcbiAgICAgIGNvbnN0IG1hdGNoID0gc3JjLm1hdGNoKC9eKC4qKVxcP3Y9KFxcZCspJC8pXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgO1ssIHNyYywgb3ZzXSA9IG1hdGNoXG4gICAgICB9XG4gICAgICBpZiAoc3JjID09PSBvbGRzcmMpIHtcbiAgICAgICAgaWYgKG92cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgb3YgPSBwYXJzZUludChvdnMsIDEwKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHYgPSBhd2FpdCBpbWFnZVdhdGNoZXIuZ2V0VmVyc2lvbihzcmMsIHRoaXMuZ2V0UGF0aCgpKVxuICAgICAgICBpZiAodiAhPT0gb3YpIHtcbiAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKGltZy5zcmMgPSBgJHtzcmN9P3Y9JHt2fWApKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoaW1nLnNyYyA9IGAke3NyY31gKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIGFzeW5jIGdldE1hcmtkb3duU291cmNlKCkge1xuICAgIGlmICh0aGlzLmZpbGUgJiYgdGhpcy5maWxlLmdldFBhdGgoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZWFkKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0VGV4dCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRIVE1MKGNhbGxiYWNrOiAoZXJyb3I6IEVycm9yIHwgbnVsbCwgaHRtbEJvZHk6IHN0cmluZykgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVuZGVyZXIudG9IVE1MKFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgKVxuICAgIH0pXG4gIH1cblxuICBhc3luYyByZW5kZXJNYXJrZG93blRleHQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHJlbmRlcmVyLnRvRE9NRnJhZ21lbnQoXG4gICAgICB0ZXh0LFxuICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAoZXJyb3IsIGRvbUZyYWdtZW50KSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgLy8gZGl2LnVwZGF0ZS1wcmV2aWV3IGNyZWF0ZWQgYWZ0ZXIgY29uc3RydWN0b3Igc3QgVXBkYXRlUHJldmlldyBjYW5ub3RcbiAgICAgICAgICAvLyBiZSBpbnN0YW5jZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgaWYgKCF0aGlzLnVwZGF0ZVByZXZpZXcgJiYgdGhpcy5wcmV2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcgPSBuZXcgVXBkYXRlUHJldmlldyh0aGlzLnByZXZpZXcpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyAmJlxuICAgICAgICAgICAgZG9tRnJhZ21lbnQgJiZcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldy51cGRhdGUoZG9tRnJhZ21lbnQgYXMgRWxlbWVudCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1tYXJrZG93bicpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKVxuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgaWYgKHAgJiYgdGhpcy5maWxlKSB7XG4gICAgICByZXR1cm4gYCR7cGF0aC5iYXNlbmFtZShwKX0gUHJldmlld2BcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5lZGl0b3IuZ2V0VGl0bGUoKX0gUHJldmlld2BcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdNYXJrZG93biBQcmV2aWV3J1xuICAgIH1cbiAgfVxuXG4gIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAnbWFya2Rvd24nXG4gIH1cblxuICBnZXRVUkkoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly8ke3RoaXMuZ2V0UGF0aCgpfWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9lZGl0b3IvJHt0aGlzLmVkaXRvcklkfWBcbiAgICB9XG4gIH1cblxuICBnZXRQYXRoKCkge1xuICAgIGlmICh0aGlzLmZpbGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0UGF0aCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFBhdGgoKVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBnZXRHcmFtbWFyKCk6IEdyYW1tYXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmVkaXRvciAmJiB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgfVxuXG4gIGdldERvY3VtZW50U3R5bGVTaGVldHMoKSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBleGlzdHMgc28gd2UgY2FuIHN0dWIgaXRcbiAgICByZXR1cm4gZG9jdW1lbnQuc3R5bGVTaGVldHNcbiAgfVxuXG4gIGdldFRleHRFZGl0b3JTdHlsZXMoKSB7XG4gICAgY29uc3QgdGV4dEVkaXRvclN0eWxlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnYXRvbS1zdHlsZXMnLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgJiB7IGluaXRpYWxpemUoc3R5bGVzOiBTdHlsZU1hbmFnZXIpOiB2b2lkIH1cbiAgICB0ZXh0RWRpdG9yU3R5bGVzLmluaXRpYWxpemUoYXRvbS5zdHlsZXMpXG4gICAgdGV4dEVkaXRvclN0eWxlcy5zZXRBdHRyaWJ1dGUoJ2NvbnRleHQnLCAnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0RWRpdG9yU3R5bGVzKVxuXG4gICAgLy8gRXh0cmFjdCBzdHlsZSBlbGVtZW50cyBjb250ZW50XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGV4dEVkaXRvclN0eWxlcy5jaGlsZE5vZGVzKS5tYXAoXG4gICAgICAoc3R5bGVFbGVtZW50KSA9PiAoc3R5bGVFbGVtZW50IGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHQsXG4gICAgKVxuICB9XG5cbiAgZ2V0TWFya2Rvd25QcmV2aWV3Q1NTKCkge1xuICAgIGNvbnN0IG1hcmtkb3dQcmV2aWV3UnVsZXMgPSBbXVxuICAgIGNvbnN0IHJ1bGVSZWdFeHAgPSAvXFwubWFya2Rvd24tcHJldmlldy9cbiAgICBjb25zdCBjc3NVcmxSZWZFeHAgPSAvdXJsXFwoYXRvbTpcXC9cXC9tYXJrZG93bi1wcmV2aWV3LXBsdXNcXC9hc3NldHNcXC8oLiopXFwpL1xuXG4gICAgZm9yIChjb25zdCBzdHlsZXNoZWV0IG9mIEFycmF5LmZyb20odGhpcy5nZXREb2N1bWVudFN0eWxlU2hlZXRzKCkpKSB7XG4gICAgICBpZiAoc3R5bGVzaGVldC5ydWxlcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAoY29uc3QgcnVsZSBvZiBBcnJheS5mcm9tKHN0eWxlc2hlZXQucnVsZXMpKSB7XG4gICAgICAgICAgLy8gV2Ugb25seSBuZWVkIGAubWFya2Rvd24tcmV2aWV3YCBjc3NcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAocnVsZS5zZWxlY3RvclRleHQgIT0gbnVsbFxuICAgICAgICAgICAgICA/IHJ1bGUuc2VsZWN0b3JUZXh0Lm1hdGNoKHJ1bGVSZWdFeHApXG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkKSAhPSBudWxsXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBtYXJrZG93UHJldmlld1J1bGVzLnB1c2gocnVsZS5jc3NUZXh0KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrZG93UHJldmlld1J1bGVzXG4gICAgICAuY29uY2F0KHRoaXMuZ2V0VGV4dEVkaXRvclN0eWxlcygpKVxuICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAucmVwbGFjZSgvYXRvbS10ZXh0LWVkaXRvci9nLCAncHJlLmVkaXRvci1jb2xvcnMnKVxuICAgICAgLnJlcGxhY2UoLzpob3N0L2csICcuaG9zdCcpIC8vIFJlbW92ZSBzaGFkb3ctZG9tIDpob3N0IHNlbGVjdG9yIGNhdXNpbmcgcHJvYmxlbSBvbiBGRlxuICAgICAgLnJlcGxhY2UoY3NzVXJsUmVmRXhwLCBmdW5jdGlvbihcbiAgICAgICAgX21hdGNoLFxuICAgICAgICBhc3NldHNOYW1lOiBzdHJpbmcsXG4gICAgICAgIF9vZmZzZXQsXG4gICAgICAgIF9zdHJpbmcsXG4gICAgICApIHtcbiAgICAgICAgLy8gYmFzZTY0IGVuY29kZSBhc3NldHNcbiAgICAgICAgY29uc3QgYXNzZXRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2Fzc2V0cycsIGFzc2V0c05hbWUpXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhhc3NldFBhdGgsICdiaW5hcnknKVxuICAgICAgICBjb25zdCBiYXNlNjREYXRhID0gbmV3IEJ1ZmZlcihvcmlnaW5hbERhdGEsICdiaW5hcnknKS50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgcmV0dXJuIGB1cmwoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtiYXNlNjREYXRhfScpYFxuICAgICAgfSlcbiAgfVxuXG4gIHNob3dFcnJvcihyZXN1bHQ6IEVycm9yKSB7XG4gICAgY29uc3QgZXJyb3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGVycm9yLmlubmVySFRNTCA9IGA8aDI+UHJldmlld2luZyBNYXJrZG93biBGYWlsZWQ8L2gyPjxoMz4ke1xuICAgICAgcmVzdWx0Lm1lc3NhZ2VcbiAgICB9PC9oMz5gXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKGVycm9yKVxuICB9XG5cbiAgc2hvd0xvYWRpbmcoKSB7XG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZVxuICAgIGNvbnN0IHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNwaW5uZXIuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tc3Bpbm5lcicpXG4gICAgc3Bpbm5lci5pbm5lclRleHQgPSAnTG9hZGluZyBNYXJrZG93blxcdTIwMjYnXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gIH1cblxuICBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKClcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzZWxlY3Rpb24uYmFzZU5vZGUgYXMgSFRNTEVsZW1lbnRcblxuICAgIC8vIFVzZSBkZWZhdWx0IGNvcHkgZXZlbnQgaGFuZGxlciBpZiB0aGVyZSBpcyBzZWxlY3RlZCB0ZXh0IGluc2lkZSB0aGlzIHZpZXdcbiAgICBpZiAoXG4gICAgICBzZWxlY3RlZFRleHQgJiZcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vVE9ETzogY29tcGxhaW4gb24gVFNcbiAgICAgIHNlbGVjdGVkTm9kZSAhPSBudWxsICYmXG4gICAgICAodGhpcy5lbGVtZW50ID09PSBzZWxlY3RlZE5vZGUgfHwgdGhpcy5lbGVtZW50LmNvbnRhaW5zKHNlbGVjdGVkTm9kZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgdGhpcy5nZXRIVE1MKGZ1bmN0aW9uKGVycm9yLCBodG1sKSB7XG4gICAgICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybignQ29weWluZyBNYXJrZG93biBhcyBIVE1MIGZhaWxlZCcsIGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGh0bWwpXG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgIClcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBhc3luYyBzYXZlQXMoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IGZpbGVQYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBsZXQgdGl0bGUgPSAnTWFya2Rvd24gdG8gSFRNTCdcbiAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgIHRpdGxlID0gcGF0aC5wYXJzZShmaWxlUGF0aCkubmFtZVxuICAgICAgZmlsZVBhdGggKz0gJy5odG1sJ1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICBmaWxlUGF0aCA9ICd1bnRpdGxlZC5tZC5odG1sJ1xuICAgICAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBmaWxlUGF0aClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBodG1sRmlsZVBhdGggPSBhdG9tLnNob3dTYXZlRGlhbG9nU3luYyhmaWxlUGF0aClcbiAgICBpZiAoaHRtbEZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRIVE1MKChlcnJvcjogRXJyb3IgfCBudWxsLCBodG1sQm9keTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybignU2F2aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IG1hdGhqYXhTY3JpcHRcbiAgICAgICAgICBpZiAodGhpcy5yZW5kZXJMYVRlWCkge1xuICAgICAgICAgICAgbWF0aGpheFNjcmlwdCA9IGBcXFxuXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L3gtbWF0aGpheC1jb25maWdcIj5cbiAgTWF0aEpheC5IdWIuQ29uZmlnKHtcbiAgICBqYXg6IFtcImlucHV0L1RlWFwiLFwib3V0cHV0L0hUTUwtQ1NTXCJdLFxuICAgIGV4dGVuc2lvbnM6IFtdLFxuICAgIFRlWDoge1xuICAgICAgZXh0ZW5zaW9uczogW1wiQU1TbWF0aC5qc1wiLFwiQU1Tc3ltYm9scy5qc1wiLFwibm9FcnJvcnMuanNcIixcIm5vVW5kZWZpbmVkLmpzXCJdXG4gICAgfSxcbiAgICBzaG93TWF0aE1lbnU6IGZhbHNlXG4gIH0pO1xuPC9zY3JpcHQ+XG48c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBzcmM9XCJodHRwczovL2Nkbi5tYXRoamF4Lm9yZy9tYXRoamF4L2xhdGVzdC9NYXRoSmF4LmpzXCI+XG48L3NjcmlwdD5cXFxuYFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXRoamF4U2NyaXB0ID0gJydcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaHRtbCA9XG4gICAgICAgICAgICBgXFxcbjwhRE9DVFlQRSBodG1sPlxuPGh0bWw+XG4gIDxoZWFkPlxuICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCIgLz5cbiAgICAgIDx0aXRsZT4ke3RpdGxlfTwvdGl0bGU+JHttYXRoamF4U2NyaXB0fVxuICAgICAgPHN0eWxlPiR7dGhpcy5nZXRNYXJrZG93blByZXZpZXdDU1MoKX08L3N0eWxlPlxuICA8L2hlYWQ+XG4gIDxib2R5IGNsYXNzPSdtYXJrZG93bi1wcmV2aWV3Jz4ke2h0bWxCb2R5fTwvYm9keT5cbjwvaHRtbD5gICsgJ1xcbicgLy8gRW5zdXJlIHRyYWlsaW5nIG5ld2xpbmVcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoaHRtbEZpbGVQYXRoLCBodG1sKVxuICAgICAgICAgIGhhbmRsZVByb21pc2UoYXRvbS53b3Jrc3BhY2Uub3BlbihodG1sRmlsZVBhdGgpKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlzRXF1YWwob3RoZXI6IG51bGwgfCBbTm9kZV0pIHtcbiAgICByZXR1cm4gdGhpc1swXSA9PT0gKG90aGVyICE9PSBudWxsID8gb3RoZXJbMF0gOiB1bmRlZmluZWQpIC8vIENvbXBhcmUgRE9NIGVsZW1lbnRzXG4gIH1cblxuICAvL1xuICAvLyBGaW5kIHRoZSBjbG9zZXN0IGFuY2VzdG9yIG9mIGFuIGVsZW1lbnQgdGhhdCBpcyBub3QgYSBkZWNlbmRhbnQgb2YgZWl0aGVyXG4gIC8vIGBzcGFuLm1hdGhgIG9yIGBzcGFuLmF0b20tdGV4dC1lZGl0b3JgLlxuICAvL1xuICAvLyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IGZyb20gd2hpY2ggdGhlIHNlYXJjaCBmb3IgYVxuICAvLyAgIGNsb3Nlc3QgYW5jZXN0b3IgYmVnaW5zLlxuICAvLyBAcmV0dXJuIHtIVE1MRWxlbWVudH0gVGhlIGNsb3Nlc3QgYW5jZXN0b3IgdG8gYGVsZW1lbnRgIHRoYXQgZG9lcyBub3RcbiAgLy8gICBjb250YWluIGVpdGhlciBgc3Bhbi5tYXRoYCBvciBgc3Bhbi5hdG9tLXRleHQtZWRpdG9yYC5cbiAgLy9cbiAgYnViYmxlVG9Db250YWluZXJFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgIGxldCB0ZXN0RWxlbWVudCA9IGVsZW1lbnRcbiAgICB3aGlsZSAodGVzdEVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRlc3RFbGVtZW50LnBhcmVudEVsZW1lbnRcbiAgICAgIGlmICghcGFyZW50KSBicmVha1xuICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ01hdGhKYXhfRGlzcGxheScpKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQucGFyZW50RWxlbWVudCFcbiAgICAgIH1cbiAgICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhdG9tLXRleHQtZWRpdG9yJykpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudFxuICAgICAgfVxuICAgICAgdGVzdEVsZW1lbnQgPSBwYXJlbnRcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBhIHN1YnNlcXVlbmNlIG9mIGEgc2VxdWVuY2Ugb2YgdG9rZW5zIHJlcHJlc2VudGluZyBhIHBhdGggdGhyb3VnaFxuICAvLyBIVE1MRWxlbWVudHMgdGhhdCBkb2VzIG5vdCBjb250aW51ZSBkZWVwZXIgdGhhbiBhIHRhYmxlIGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBwYXRoVG9Ub2tlbiBBcnJheSBvZiB0b2tlbnNcbiAgLy8gICByZXByZXNlbnRpbmcgYSBwYXRoIHRvIGEgSFRNTEVsZW1lbnQgd2l0aCB0aGUgcm9vdCBlbGVtZW50IGF0XG4gIC8vICAgcGF0aFRvVG9rZW5bMF0gYW5kIHRoZSB0YXJnZXQgZWxlbWVudCBhdCB0aGUgaGlnaGVzdCBpbmRleC4gRWFjaCBlbGVtZW50XG4gIC8vICAgY29uc2lzdHMgb2YgYSBgdGFnYCBhbmQgYGluZGV4YCByZXByZXNlbnRpbmcgaXRzIGluZGV4IGFtb25nc3QgaXRzXG4gIC8vICAgc2libGluZyBlbGVtZW50cyBvZiB0aGUgc2FtZSBgdGFnYC5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBUaGUgc3Vic2VxdWVuY2Ugb2YgcGF0aFRvVG9rZW4gdGhhdFxuICAvLyAgIG1haW50YWlucyB0aGUgc2FtZSByb290IGJ1dCB0ZXJtaW5hdGVzIGF0IGEgdGFibGUgZWxlbWVudCBvciB0aGUgdGFyZ2V0XG4gIC8vICAgZWxlbWVudCwgd2hpY2hldmVyIGNvbWVzIGZpcnN0LlxuICAvL1xuICBidWJibGVUb0NvbnRhaW5lclRva2VuKHBhdGhUb1Rva2VuOiBBcnJheTx7IHRhZzogc3RyaW5nOyBpbmRleDogbnVtYmVyIH0+KSB7XG4gICAgY29uc3QgZW5kID0gcGF0aFRvVG9rZW4ubGVuZ3RoIC0gMVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICBpZiAocGF0aFRvVG9rZW5baV0udGFnID09PSAndGFibGUnKSB7XG4gICAgICAgIHJldHVybiBwYXRoVG9Ub2tlbi5zbGljZSgwLCBpICsgMSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG4gIH1cblxuICAvL1xuICAvLyBFbmNvZGUgdGFncyBmb3IgbWFya2Rvd24taXQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgRW5jb2RlIHRoZSB0YWcgb2YgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7c3RyaW5nfSBFbmNvZGVkIHRhZy5cbiAgLy9cbiAgZW5jb2RlVGFnKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hdGgnKSkge1xuICAgICAgcmV0dXJuICdtYXRoJ1xuICAgIH1cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F0b20tdGV4dC1lZGl0b3InKSkge1xuICAgICAgcmV0dXJuICdjb2RlJ1xuICAgIH0gLy8gb25seSB0b2tlbi50eXBlIGlzIGBmZW5jZWAgY29kZSBibG9ja3Mgc2hvdWxkIGV2ZXIgYmUgZm91bmQgaW4gdGhlIGZpcnN0IGxldmVsIG9mIHRoZSB0b2tlbnMgYXJyYXlcbiAgICByZXR1cm4gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIC8vXG4gIC8vIERlY29kZSB0YWdzIHVzZWQgYnkgbWFya2Rvd24taXRcbiAgLy9cbiAgLy8gQHBhcmFtIHttYXJrZG93bi1pdC5Ub2tlbn0gdG9rZW4gRGVjb2RlIHRoZSB0YWcgb2YgdG9rZW4uXG4gIC8vIEByZXR1cm4ge3N0cmluZ3xudWxsfSBEZWNvZGVkIHRhZyBvciBgbnVsbGAgaWYgdGhlIHRva2VuIGhhcyBubyB0YWcuXG4gIC8vXG4gIGRlY29kZVRhZyh0b2tlbjogVG9rZW4pOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAodG9rZW4udGFnID09PSAnbWF0aCcpIHtcbiAgICAgIHJldHVybiAnc3BhbidcbiAgICB9XG4gICAgaWYgKHRva2VuLnRhZyA9PT0gJ2NvZGUnKSB7XG4gICAgICByZXR1cm4gJ3NwYW4nXG4gICAgfVxuICAgIGlmICh0b2tlbi50YWcgPT09ICcnKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICByZXR1cm4gdG9rZW4udGFnXG4gIH1cblxuICAvL1xuICAvLyBEZXRlcm1pbmUgcGF0aCB0byBhIHRhcmdldCBlbGVtZW50IGZyb20gYSBjb250YWluZXIgYC5tYXJrZG93bi1wcmV2aWV3YC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgSFRNTEVsZW1lbnQuXG4gIC8vIEByZXR1cm4geyh0YWc6IDx0YWc+LCBpbmRleDogPGluZGV4PilbXX0gQXJyYXkgb2YgdG9rZW5zIHJlcHJlc2VudGluZyBhIHBhdGhcbiAgLy8gICB0byBgZWxlbWVudGAgZnJvbSBgLm1hcmtkb3duLXByZXZpZXdgLiBUaGUgcm9vdCBgLm1hcmtkb3duLXByZXZpZXdgXG4gIC8vICAgZWxlbWVudCBpcyB0aGUgZmlyc3QgZWxlbWVudHMgaW4gdGhlIGFycmF5IGFuZCB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgLy8gICBgZWxlbWVudGAgYXQgdGhlIGhpZ2hlc3QgaW5kZXguIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZFxuICAvLyAgIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lXG4gIC8vICAgYHRhZ2AuXG4gIC8vXG4gIGdldFBhdGhUb0VsZW1lbnQoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICk6IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4ge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgfSxcbiAgICAgIF1cbiAgICB9XG5cbiAgICBlbGVtZW50ID0gdGhpcy5idWJibGVUb0NvbnRhaW5lckVsZW1lbnQoZWxlbWVudClcbiAgICBjb25zdCB0YWcgPSB0aGlzLmVuY29kZVRhZyhlbGVtZW50KVxuICAgIGNvbnN0IHNpYmxpbmdzID0gZWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblxuICAgIGxldCBzaWJsaW5nc0NvdW50ID0gMFxuXG4gICAgZm9yIChjb25zdCBzaWJsaW5nIG9mIEFycmF5LmZyb20oc2libGluZ3MpKSB7XG4gICAgICBjb25zdCBzaWJsaW5nVGFnID1cbiAgICAgICAgc2libGluZy5ub2RlVHlwZSA9PT0gMSA/IHRoaXMuZW5jb2RlVGFnKHNpYmxpbmcgYXMgSFRNTEVsZW1lbnQpIDogbnVsbFxuICAgICAgaWYgKHNpYmxpbmcgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGF0aFRvRWxlbWVudCA9IHRoaXMuZ2V0UGF0aFRvRWxlbWVudChlbGVtZW50LnBhcmVudEVsZW1lbnQhKVxuICAgICAgICBwYXRoVG9FbGVtZW50LnB1c2goe1xuICAgICAgICAgIHRhZyxcbiAgICAgICAgICBpbmRleDogc2libGluZ3NDb3VudCxcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHBhdGhUb0VsZW1lbnRcbiAgICAgIH0gZWxzZSBpZiAoc2libGluZ1RhZyA9PT0gdGFnKSB7XG4gICAgICAgIHNpYmxpbmdzQ291bnQrK1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWx1cmUgaW4gZ2V0UGF0aFRvRWxlbWVudCcpXG4gIH1cblxuICAvL1xuICAvLyBTZXQgdGhlIGFzc29jaWF0ZWQgZWRpdG9ycyBjdXJzb3IgYnVmZmVyIHBvc2l0aW9uIHRvIHRoZSBsaW5lIHJlcHJlc2VudGluZ1xuICAvLyB0aGUgc291cmNlIG1hcmtkb3duIG9mIGEgdGFyZ2V0IGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGFyZ2V0IGVsZW1lbnQgY29udGFpbmVkIHdpdGhpbiB0aGUgYXNzb2ljYXRlZFxuICAvLyAgIGAubWFya2Rvd24tcHJldmlld2AgY29udGFpbmVyLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0byBpZGVudGlmeSB0aGVcbiAgLy8gICBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgIGFuZCBzZXQgdGhlIGN1cnNvciB0byB0aGF0IGxpbmUuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YC4gSWYgbm9cbiAgLy8gICBsaW5lIGlzIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jU291cmNlKHRleHQ6IHN0cmluZywgZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQpXG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBkaXYubWFya2Rvd24tcHJldmlld1xuICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKSAvLyByZW1vdmUgZGl2LnVwZGF0ZS1wcmV2aWV3XG4gICAgaWYgKCFwYXRoVG9FbGVtZW50Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGxldCBmaW5hbFRva2VuID0gbnVsbFxuICAgIGxldCBsZXZlbCA9IDBcblxuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICBpZiAodG9rZW4ubGV2ZWwgPCBsZXZlbCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuLmhpZGRlbikge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKHRva2VuLnRhZyA9PT0gcGF0aFRvRWxlbWVudFswXS50YWcgJiYgdG9rZW4ubGV2ZWwgPT09IGxldmVsKSB7XG4gICAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAxKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vIFRPRE86IGNvbXBsYWluIG9uIERUXG4gICAgICAgICAgICBpZiAodG9rZW4ubWFwICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KClcbiAgICAgICAgICAgIGxldmVsKytcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHRva2VuLm5lc3RpbmcgPT09IDAgJiZcbiAgICAgICAgICBbJ21hdGgnLCAnY29kZScsICdociddLmluY2x1ZGVzKHRva2VuLnRhZylcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGZpbmFsVG9rZW4gPSB0b2tlblxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGF0aFRvRWxlbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmluYWxUb2tlbiAhPT0gbnVsbCAmJiB0aGlzLmVkaXRvcikge1xuICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2ZpbmFsVG9rZW4ubWFwWzBdLCAwXSlcbiAgICAgIHJldHVybiBmaW5hbFRva2VuLm1hcFswXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBwYXRoIHRvIGEgdGFyZ2V0IHRva2VuLlxuICAvL1xuICAvLyBAcGFyYW0geyhtYXJrZG93bi1pdC5Ub2tlbilbXX0gdG9rZW5zIEFycmF5IG9mIHRva2VucyBhcyByZXR1cm5lZCBieVxuICAvLyAgIGBtYXJrZG93bi1pdC5wYXJzZSgpYC5cbiAgLy8gQHBhcmFtIHtudW1iZXJ9IGxpbmUgTGluZSByZXByZXNlbnRpbmcgdGhlIHRhcmdldCB0b2tlbi5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBBcnJheSByZXByZXNlbnRpbmcgYSBwYXRoIHRvIHRoZVxuICAvLyAgIHRhcmdldCB0b2tlbi4gVGhlIHJvb3QgdG9rZW4gaXMgcmVwcmVzZW50ZWQgYnkgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlXG4gIC8vICAgYXJyYXkgYW5kIHRoZSB0YXJnZXQgdG9rZW4gYnkgdGhlIGxhc3QgZWxtZW50LiBFYWNoIGVsZW1lbnQgY29uc2lzdHMgb2YgYVxuICAvLyAgIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHMgc2libGluZyB0b2tlbnMgaW5cbiAgLy8gICBgdG9rZW5zYCBvZiB0aGUgc2FtZSBgdGFnYC4gYGxpbmVgIHdpbGwgbGllIGJldHdlZW4gdGhlIHByb3BlcnRpZXNcbiAgLy8gICBgbWFwWzBdYCBhbmQgYG1hcFsxXWAgb2YgdGhlIHRhcmdldCB0b2tlbi5cbiAgLy9cbiAgZ2V0UGF0aFRvVG9rZW4odG9rZW5zOiBUb2tlbltdLCBsaW5lOiBudW1iZXIpIHtcbiAgICBsZXQgcGF0aFRvVG9rZW46IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4gPSBbXVxuICAgIGxldCB0b2tlblRhZ0NvdW50OiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB8IHVuZGVmaW5lZCB9ID0ge31cbiAgICBsZXQgbGV2ZWwgPSAwXG5cbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgaWYgKHRva2VuLmxldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5oaWRkZW4pIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAtMSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCB0YWcgPSB0aGlzLmRlY29kZVRhZyh0b2tlbilcbiAgICAgIGlmICh0YWcgPT09IG51bGwpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIHRva2VuLnRhZyA9IHRhZ1xuXG4gICAgICBpZiAoXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vIFRPRE86IGNvbXBsYWluIG9uIERUXG4gICAgICAgIHRva2VuLm1hcCAhPSBudWxsICYmIC8vIHRva2VuLm1hcCAqY2FuKiBiZSBudWxsXG4gICAgICAgIGxpbmUgPj0gdG9rZW4ubWFwWzBdICYmXG4gICAgICAgIGxpbmUgPD0gdG9rZW4ubWFwWzFdIC0gMVxuICAgICAgKSB7XG4gICAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAxKSB7XG4gICAgICAgICAgcGF0aFRvVG9rZW4ucHVzaCh7XG4gICAgICAgICAgICB0YWc6IHRva2VuLnRhZyxcbiAgICAgICAgICAgIGluZGV4OiB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gfHwgMCxcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRva2VuVGFnQ291bnQgPSB7fVxuICAgICAgICAgIGxldmVsKytcbiAgICAgICAgfSBlbHNlIGlmICh0b2tlbi5uZXN0aW5nID09PSAwKSB7XG4gICAgICAgICAgcGF0aFRvVG9rZW4ucHVzaCh7XG4gICAgICAgICAgICB0YWc6IHRva2VuLnRhZyxcbiAgICAgICAgICAgIGluZGV4OiB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gfHwgMCxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodG9rZW4ubGV2ZWwgPT09IGxldmVsKSB7XG4gICAgICAgIGlmICh0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSErK1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSA9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHBhdGhUb1Rva2VuID0gdGhpcy5idWJibGVUb0NvbnRhaW5lclRva2VuKHBhdGhUb1Rva2VuKVxuICAgIHJldHVybiBwYXRoVG9Ub2tlblxuICB9XG5cbiAgLy9cbiAgLy8gU2Nyb2xsIHRoZSBhc3NvY2lhdGVkIHByZXZpZXcgdG8gdGhlIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSB0YXJnZXQgbGluZSBvZlxuICAvLyBvZiB0aGUgc291cmNlIG1hcmtkb3duLlxuICAvL1xuICAvLyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBUYXJnZXQgbGluZSBvZiBgdGV4dGAuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvXG4gIC8vICAgaWRlbnRpZnkgdGhlIGVsbWVudCBvZiB0aGUgYXNzb2NpYXRlZCBgLm1hcmtkb3duLXByZXZpZXdgIHRoYXQgcmVwcmVzZW50c1xuICAvLyAgIGBsaW5lYCBhbmQgc2Nyb2xsIHRoZSBgLm1hcmtkb3duLXByZXZpZXdgIHRvIHRoYXQgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBlbGVtZW50IHRoYXQgcmVwcmVzZW50cyBgbGluZWAuIElmIG5vIGVsZW1lbnQgaXNcbiAgLy8gICBpZGVudGlmaWVkIGBudWxsYCBpcyByZXR1cm5lZC5cbiAgLy9cbiAgc3luY1ByZXZpZXcodGV4dDogc3RyaW5nLCBsaW5lOiBudW1iZXIpIHtcbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGNvbnN0IHBhdGhUb1Rva2VuID0gdGhpcy5nZXRQYXRoVG9Ub2tlbih0b2tlbnMsIGxpbmUpXG5cbiAgICBsZXQgZWxlbWVudCA9IHRoaXMucHJldmlld1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgcGF0aFRvVG9rZW4pIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZUVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGVsZW1lbnRcbiAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoYDpzY29wZSA+ICR7dG9rZW4udGFnfWApXG4gICAgICAgIC5pdGVtKHRva2VuLmluZGV4KSBhcyBIVE1MRWxlbWVudFxuICAgICAgaWYgKGNhbmRpZGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudCA9IGNhbmRpZGF0ZUVsZW1lbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd1cGRhdGUtcHJldmlldycpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfSAvLyBEbyBub3QganVtcCB0byB0aGUgdG9wIG9mIHRoZSBwcmV2aWV3IGZvciBiYWQgc3luY3NcblxuICAgIGlmICghZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JykpIHtcbiAgICAgIGVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcoKVxuICAgIH1cbiAgICBjb25zdCBtYXhTY3JvbGxUb3AgPSB0aGlzLmVsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5lbGVtZW50LmNsaWVudEhlaWdodFxuICAgIGlmICghKHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgPj0gbWF4U2Nyb2xsVG9wKSkge1xuICAgICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCAtPSB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0IC8gNFxuICAgIH1cblxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZmxhc2gnKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gZWxlbWVudCEuY2xhc3NMaXN0LnJlbW92ZSgnZmxhc2gnKSwgMTAwMClcblxuICAgIHJldHVybiBlbGVtZW50XG4gIH1cbn1cbiJdfQ==