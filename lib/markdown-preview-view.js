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
class MarkdownPreviewView {
    constructor({ editorId, filePath }) {
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
        this.renderMarkdown();
    }
    resolveEditor(editorId) {
        this.editor = this.editorForId(editorId);
        if (this.editor) {
            this.emitter.emit('did-change-title');
            this.handleEvents();
            this.renderMarkdown();
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
            this.renderMarkdown();
        }, 250)));
        this.disposables.add(atom.grammars.onDidUpdateGrammar(_.debounce(() => {
            this.renderMarkdown();
        }, 250)));
        atom.commands.add(this.element, {
            'core:move-up': () => this.element.scrollBy({ top: -10 }),
            'core:move-down': () => this.element.scrollBy({ top: 10 }),
            'core:save-as': (event) => {
                event.stopPropagation();
                this.saveAs();
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
                this.getMarkdownSource().then((source) => {
                    if (source === undefined) {
                        return;
                    }
                    this.syncSource(source, event.target);
                });
            },
        });
        const changeHandler = () => {
            this.renderMarkdown();
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
                return;
            }
            renderer.toHTML(source, this.getPath(), this.getGrammar(), this.renderLaTeX, false, callback);
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
        this.getHTML(function (error, html) {
            if (error !== null) {
                console.warn('Copying Markdown as HTML failed', error);
            }
            else {
                atom.clipboard.write(html);
            }
        });
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
                    atom.workspace.open(htmlFilePath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUE2QjtBQUk3QiwrQkFRYTtBQUNiLDRCQUE0QjtBQUM1Qiw4QkFBOEI7QUFFOUIsdUNBQXVDO0FBQ3ZDLHFEQUFnRDtBQUNoRCxtREFBbUQ7QUFDbkQscURBQXFEO0FBY3JEO0lBeUJFLFlBQVksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFhO1FBdEI3QixrQkFBYSxHQUFrQixJQUFJLE9BQU8sQ0FDeEQsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FDdEMsQ0FBQTtRQUlPLFlBQU8sR0FHVixJQUFJLGNBQU8sRUFBRSxDQUFBO1FBRVYsZ0JBQVcsR0FBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQzlDLHFEQUFxRCxDQUN0RCxDQUFBO1FBQ08sZ0JBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDdkMsV0FBTSxHQUFHLElBQUksQ0FBQTtRQVFuQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUN4QixJQUFJLENBQUMsUUFB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LE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xELE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUMxQixDQUFDO1FBQ0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUE7UUFDMUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUE7UUFDekQsQ0FBQztRQUVELE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUUxRCxNQUFNLENBQUMsT0FBTyxDQUFBO0lBQ2hCLENBQUM7Q0FDRjtBQXAyQkQsa0RBbzJCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRva2VuIH0gZnJvbSAnbWFya2Rvd24taXQnXG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG4vLyBUT0RPOiBGaXhtZVxuLy8gdHNsaW50OmRpc2FibGU6IG5vLWZsb2F0aW5nLXByb21pc2VzXG5pbXBvcnQge1xuICBDb21tYW5kRXZlbnQsXG4gIEVtaXR0ZXIsXG4gIERpc3Bvc2FibGUsXG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIEZpbGUsXG4gIFN0eWxlTWFuYWdlcixcbiAgVGV4dEVkaXRvcixcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKVxuXG5pbXBvcnQgcmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyJylcbmltcG9ydCB7IFVwZGF0ZVByZXZpZXcgfSBmcm9tICcuL3VwZGF0ZS1wcmV2aWV3J1xuaW1wb3J0IG1hcmtkb3duSXQgPSByZXF1aXJlKCcuL21hcmtkb3duLWl0LWhlbHBlcicpXG5pbXBvcnQgaW1hZ2VXYXRjaGVyID0gcmVxdWlyZSgnLi9pbWFnZS13YXRjaC1oZWxwZXInKVxuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc0VkaXRvciB7XG4gIGVkaXRvcklkOiBudW1iZXJcbiAgZmlsZVBhdGg/OiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNUFZQYXJhbXNQYXRoIHtcbiAgZWRpdG9ySWQ/OiB1bmRlZmluZWRcbiAgZmlsZVBhdGg6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBNUFZQYXJhbXMgPSBNUFZQYXJhbXNFZGl0b3IgfCBNUFZQYXJhbXNQYXRoXG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3IHtcbiAgcHJpdmF0ZSBsb2FkaW5nOiBib29sZWFuXG4gIHByaXZhdGUgcmVzb2x2ZTogKCkgPT4gdm9pZFxuICBwdWJsaWMgcmVhZG9ubHkgcmVuZGVyUHJvbWlzZTogUHJvbWlzZTx2b2lkPiA9IG5ldyBQcm9taXNlPHZvaWQ+KFxuICAgIChyZXNvbHZlKSA9PiAodGhpcy5yZXNvbHZlID0gcmVzb2x2ZSksXG4gIClcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuaW5pdGlhbGl6ZWRcbiAgcHJpdmF0ZSBlbGVtZW50OiBIVE1MRWxlbWVudFxuICBwcml2YXRlIHByZXZpZXc6IEhUTUxFbGVtZW50XG4gIHByaXZhdGUgZW1pdHRlcjogRW1pdHRlcjx7XG4gICAgJ2RpZC1jaGFuZ2UtdGl0bGUnOiB1bmRlZmluZWRcbiAgICAnZGlkLWNoYW5nZS1tYXJrZG93bic6IHVuZGVmaW5lZFxuICB9PiA9IG5ldyBFbWl0dGVyKClcbiAgcHJpdmF0ZSB1cGRhdGVQcmV2aWV3PzogVXBkYXRlUHJldmlld1xuICBwcml2YXRlIHJlbmRlckxhVGVYOiBib29sZWFuID0gISFhdG9tLmNvbmZpZy5nZXQoXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCcsXG4gIClcbiAgcHJpdmF0ZSBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgcHJpdmF0ZSBsb2FkZWQgPSB0cnVlIC8vIERvIG5vdCBzaG93IHRoZSBsb2FkaW5nIHNwaW5ub3Igb24gaW5pdGlhbCBsb2FkXG4gIHByaXZhdGUgZWRpdG9ySWQ/OiBudW1iZXJcbiAgcHJpdmF0ZSBmaWxlUGF0aD86IHN0cmluZ1xuICBwcml2YXRlIGZpbGU/OiBGaWxlXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bmluaXRpYWxpemVkXG4gIHByaXZhdGUgZWRpdG9yPzogVGV4dEVkaXRvclxuXG4gIGNvbnN0cnVjdG9yKHsgZWRpdG9ySWQsIGZpbGVQYXRoIH06IE1QVlBhcmFtcykge1xuICAgIHRoaXMuZ2V0UGF0aFRvRWxlbWVudCA9IHRoaXMuZ2V0UGF0aFRvRWxlbWVudC5iaW5kKHRoaXMpXG4gICAgdGhpcy5zeW5jU291cmNlID0gdGhpcy5zeW5jU291cmNlLmJpbmQodGhpcylcbiAgICB0aGlzLmdldFBhdGhUb1Rva2VuID0gdGhpcy5nZXRQYXRoVG9Ub2tlbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5zeW5jUHJldmlldyA9IHRoaXMuc3luY1ByZXZpZXcuYmluZCh0aGlzKVxuICAgIHRoaXMuZWRpdG9ySWQgPSBlZGl0b3JJZFxuICAgIHRoaXMuZmlsZVBhdGggPSBmaWxlUGF0aFxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXByZXZpZXcnLCAnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgdGhpcy5lbGVtZW50LnRhYkluZGV4ID0gLTFcbiAgICB0aGlzLnByZXZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMucHJldmlldy5jbGFzc0xpc3QuYWRkKCd1cGRhdGUtcHJldmlldycpXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMucHJldmlldylcblxuICAgIC8vIFRPRE86IG9uIGF0dGFjaD9cbiAgICBpZiAodGhpcy5lZGl0b3JJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnJlc29sdmVFZGl0b3IodGhpcy5lZGl0b3JJZClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZmlsZVBhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zdWJzY3JpYmVUb0ZpbGVQYXRoKHRoaXMuZmlsZVBhdGgpXG4gICAgfVxuICB9XG5cbiAgdGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmlubmVyVGV4dFxuICB9XG5cbiAgZmluZCh3aGF0OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3Iod2hhdClcbiAgfVxuXG4gIGZpbmRBbGwod2hhdDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHdoYXQpXG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ01hcmtkb3duUHJldmlld1ZpZXcnLFxuICAgICAgZmlsZVBhdGg6IHRoaXMuZ2V0UGF0aCgpIHx8IHRoaXMuZmlsZVBhdGgsXG4gICAgICBlZGl0b3JJZDogdGhpcy5lZGl0b3JJZCxcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIHBhdGggJiYgaW1hZ2VXYXRjaGVyLnJlbW92ZUZpbGUocGF0aClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQoX2NhbGxiYWNrOiBhbnkpIHtcbiAgICAvLyBObyBvcCB0byBzdXBwcmVzcyBkZXByZWNhdGlvbiB3YXJuaW5nXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKClcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTWFya2Rvd24oY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLW1hcmtkb3duJywgY2FsbGJhY2spXG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICAgIHRoaXMucmVuZGVyTWFya2Rvd24oKVxuICB9XG5cbiAgcmVzb2x2ZUVkaXRvcihlZGl0b3JJZDogbnVtYmVyKSB7XG4gICAgdGhpcy5lZGl0b3IgPSB0aGlzLmVkaXRvckZvcklkKGVkaXRvcklkKVxuXG4gICAgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgICB0aGlzLnJlbmRlck1hcmtkb3duKClcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGVkaXRvciB0aGlzIHByZXZpZXcgd2FzIGNyZWF0ZWQgZm9yIGhhcyBiZWVuIGNsb3NlZCBzbyBjbG9zZVxuICAgICAgLy8gdGhpcyBwcmV2aWV3IHNpbmNlIGEgcHJldmlldyBjYW5ub3QgYmUgcmVuZGVyZWQgd2l0aG91dCBhbiBlZGl0b3JcbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgcGFuZSAmJiBwYW5lLmRlc3Ryb3lJdGVtKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgZWRpdG9yRm9ySWQoZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICAgIGlmIChlZGl0b3IuaWQgPT09IGVkaXRvcklkKSB7XG4gICAgICAgIHJldHVybiBlZGl0b3JcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaGFuZGxlRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIoKCkgPT5cbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5yZW5kZXJNYXJrZG93bigpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgIClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRVcGRhdGVHcmFtbWFyKFxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnJlbmRlck1hcmtkb3duKClcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4gdGhpcy5lbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAtMTAgfSksXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PiB0aGlzLmVsZW1lbnQuc2Nyb2xsQnkoeyB0b3A6IDEwIH0pLFxuICAgICAgJ2NvcmU6c2F2ZS1hcyc6IChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZmxvYXRpbmctcHJvbWlzZXNcbiAgICAgICAgdGhpcy5zYXZlQXMoKVxuICAgICAgfSxcbiAgICAgICdjb3JlOmNvcHknOiAoZXZlbnQ6IENvbW1hbmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb3B5VG9DbGlwYm9hcmQoKSkgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHpvb21MZXZlbCA9IHBhcnNlRmxvYXQodGhpcy5lbGVtZW50LnN0eWxlLnpvb20gfHwgJzEnKVxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuem9vbSA9ICh6b29tTGV2ZWwgKyAwLjEpLnRvU3RyaW5nKClcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0JzogKCkgPT4ge1xuICAgICAgICBjb25zdCB6b29tTGV2ZWwgPSBwYXJzZUZsb2F0KHRoaXMuZWxlbWVudC5zdHlsZS56b29tIHx8ICcxJylcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnpvb20gPSAoem9vbUxldmVsIC0gMC4xKS50b1N0cmluZygpXG4gICAgICB9LFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpyZXNldC16b29tJzogKCkgPT4gKHRoaXMuZWxlbWVudC5zdHlsZS56b29tID0gJzEnKSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1zb3VyY2UnOiAoZXZlbnQpID0+IHtcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWZsb2F0aW5nLXByb21pc2VzXG4gICAgICAgIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKChzb3VyY2U/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnN5bmNTb3VyY2Uoc291cmNlLCBldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpXG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBjb25zdCBjaGFuZ2VIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgdGhpcy5yZW5kZXJNYXJrZG93bigpXG5cbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgaWYgKHBhbmUgIT09IHVuZGVmaW5lZCAmJiBwYW5lICE9PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkpIHtcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maWxlKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmZpbGUub25EaWRDaGFuZ2UoY2hhbmdlSGFuZGxlcikpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU3RvcENoYW5naW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgdGhpcy5lZGl0b3Iub25EaWRDaGFuZ2VQYXRoKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU2F2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFJlbG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5lZGl0b3IpLCB7XG4gICAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnOiBhc3luYyAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICAgICAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5lZGl0b3IpIHJldHVyblxuICAgICAgICAgICAgdGhpcy5zeW5jUHJldmlldyhzb3VyY2UsIHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93KVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgIH1cblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYnJlYWtPblNpbmdsZU5ld2xpbmUnLFxuICAgICAgICBjaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICApXG5cbiAgICAvLyBUb2dnbGUgTGFUZVggcmVuZGVyaW5nIGlmIGZvY3VzIGlzIG9uIHByZXZpZXcgcGFuZSBvciBhc3NvY2lhdGVkIGVkaXRvci5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKCkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgPT09IHRoaXMgfHxcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSA9PT0gdGhpcy5lZGl0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTGFUZVggPSAhdGhpcy5yZW5kZXJMYVRlWFxuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyxcbiAgICAgICAgKHVzZUdpdEh1YlN0eWxlKSA9PiB7XG4gICAgICAgICAgaWYgKHVzZUdpdEh1YlN0eWxlKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnLCAnJylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJylcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApLFxuICAgIClcbiAgfVxuXG4gIGFzeW5jIHJlbmRlck1hcmtkb3duKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgIHRoaXMuc2hvd0xvYWRpbmcoKVxuICAgIH1cbiAgICBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbihhc3luYyAoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlck1hcmtkb3duVGV4dChzb3VyY2UpXG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICB9KVxuICAgIHRoaXMucmVzb2x2ZSgpXG4gIH1cblxuICBhc3luYyByZWZyZXNoSW1hZ2VzKG9sZHNyYzogc3RyaW5nKSB7XG4gICAgY29uc3QgaW1ncyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbWdbc3JjXScpIGFzIE5vZGVMaXN0T2Y8XG4gICAgICBIVE1MSW1hZ2VFbGVtZW50XG4gICAgPlxuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG4gICAgZm9yIChjb25zdCBpbWcgb2YgQXJyYXkuZnJvbShpbWdzKSkge1xuICAgICAgbGV0IG92czogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAgICBsZXQgb3Y6IG51bWJlciB8IHVuZGVmaW5lZFxuICAgICAgbGV0IHNyYyA9IGltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpIVxuICAgICAgY29uc3QgbWF0Y2ggPSBzcmMubWF0Y2goL14oLiopXFw/dj0oXFxkKykkLylcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICA7Wywgc3JjLCBvdnNdID0gbWF0Y2hcbiAgICAgIH1cbiAgICAgIGlmIChzcmMgPT09IG9sZHNyYykge1xuICAgICAgICBpZiAob3ZzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBvdiA9IHBhcnNlSW50KG92cywgMTApXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdiA9IGF3YWl0IGltYWdlV2F0Y2hlci5nZXRWZXJzaW9uKHNyYywgdGhpcy5nZXRQYXRoKCkpXG4gICAgICAgIGlmICh2ICE9PSBvdikge1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoaW1nLnNyYyA9IGAke3NyY30/dj0ke3Z9YCkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKChpbWcuc3JjID0gYCR7c3JjfWApKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgYXN5bmMgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAmJiB0aGlzLmZpbGUuZ2V0UGF0aCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWxlLnJlYWQoKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRUZXh0KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEhUTUwoY2FsbGJhY2s6IChlcnJvcjogRXJyb3IgfCBudWxsLCBodG1sQm9keTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKChzb3VyY2U/OiBzdHJpbmcpID0+IHtcbiAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgcmVuZGVyZXIudG9IVE1MKFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgKVxuICAgIH0pXG4gIH1cblxuICBhc3luYyByZW5kZXJNYXJrZG93blRleHQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHJlbmRlcmVyLnRvRE9NRnJhZ21lbnQoXG4gICAgICB0ZXh0LFxuICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAoZXJyb3IsIGRvbUZyYWdtZW50KSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgLy8gZGl2LnVwZGF0ZS1wcmV2aWV3IGNyZWF0ZWQgYWZ0ZXIgY29uc3RydWN0b3Igc3QgVXBkYXRlUHJldmlldyBjYW5ub3RcbiAgICAgICAgICAvLyBiZSBpbnN0YW5jZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgaWYgKCF0aGlzLnVwZGF0ZVByZXZpZXcgJiYgdGhpcy5wcmV2aWV3KSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcgPSBuZXcgVXBkYXRlUHJldmlldyh0aGlzLnByZXZpZXcpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyAmJlxuICAgICAgICAgICAgZG9tRnJhZ21lbnQgJiZcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldy51cGRhdGUoZG9tRnJhZ21lbnQgYXMgRWxlbWVudCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1tYXJrZG93bicpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKVxuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgaWYgKHAgJiYgdGhpcy5maWxlKSB7XG4gICAgICByZXR1cm4gYCR7cGF0aC5iYXNlbmFtZShwKX0gUHJldmlld2BcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5lZGl0b3IuZ2V0VGl0bGUoKX0gUHJldmlld2BcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdNYXJrZG93biBQcmV2aWV3J1xuICAgIH1cbiAgfVxuXG4gIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAnbWFya2Rvd24nXG4gIH1cblxuICBnZXRVUkkoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly8ke3RoaXMuZ2V0UGF0aCgpfWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9lZGl0b3IvJHt0aGlzLmVkaXRvcklkfWBcbiAgICB9XG4gIH1cblxuICBnZXRQYXRoKCkge1xuICAgIGlmICh0aGlzLmZpbGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0UGF0aCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFBhdGgoKVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBnZXRHcmFtbWFyKCkge1xuICAgIHJldHVybiB0aGlzLmVkaXRvciAmJiB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgfVxuXG4gIGdldERvY3VtZW50U3R5bGVTaGVldHMoKSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBleGlzdHMgc28gd2UgY2FuIHN0dWIgaXRcbiAgICByZXR1cm4gZG9jdW1lbnQuc3R5bGVTaGVldHNcbiAgfVxuXG4gIGdldFRleHRFZGl0b3JTdHlsZXMoKSB7XG4gICAgY29uc3QgdGV4dEVkaXRvclN0eWxlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnYXRvbS1zdHlsZXMnLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgJiB7IGluaXRpYWxpemUoc3R5bGVzOiBTdHlsZU1hbmFnZXIpOiB2b2lkIH1cbiAgICB0ZXh0RWRpdG9yU3R5bGVzLmluaXRpYWxpemUoYXRvbS5zdHlsZXMpXG4gICAgdGV4dEVkaXRvclN0eWxlcy5zZXRBdHRyaWJ1dGUoJ2NvbnRleHQnLCAnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0RWRpdG9yU3R5bGVzKVxuXG4gICAgLy8gRXh0cmFjdCBzdHlsZSBlbGVtZW50cyBjb250ZW50XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGV4dEVkaXRvclN0eWxlcy5jaGlsZE5vZGVzKS5tYXAoXG4gICAgICAoc3R5bGVFbGVtZW50KSA9PiAoc3R5bGVFbGVtZW50IGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHQsXG4gICAgKVxuICB9XG5cbiAgZ2V0TWFya2Rvd25QcmV2aWV3Q1NTKCkge1xuICAgIGNvbnN0IG1hcmtkb3dQcmV2aWV3UnVsZXMgPSBbXVxuICAgIGNvbnN0IHJ1bGVSZWdFeHAgPSAvXFwubWFya2Rvd24tcHJldmlldy9cbiAgICBjb25zdCBjc3NVcmxSZWZFeHAgPSAvdXJsXFwoYXRvbTpcXC9cXC9tYXJrZG93bi1wcmV2aWV3LXBsdXNcXC9hc3NldHNcXC8oLiopXFwpL1xuXG4gICAgZm9yIChjb25zdCBzdHlsZXNoZWV0IG9mIEFycmF5LmZyb20odGhpcy5nZXREb2N1bWVudFN0eWxlU2hlZXRzKCkpKSB7XG4gICAgICBpZiAoc3R5bGVzaGVldC5ydWxlcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAoY29uc3QgcnVsZSBvZiBBcnJheS5mcm9tKHN0eWxlc2hlZXQucnVsZXMpKSB7XG4gICAgICAgICAgLy8gV2Ugb25seSBuZWVkIGAubWFya2Rvd24tcmV2aWV3YCBjc3NcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAocnVsZS5zZWxlY3RvclRleHQgIT0gbnVsbFxuICAgICAgICAgICAgICA/IHJ1bGUuc2VsZWN0b3JUZXh0Lm1hdGNoKHJ1bGVSZWdFeHApXG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkKSAhPSBudWxsXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBtYXJrZG93UHJldmlld1J1bGVzLnB1c2gocnVsZS5jc3NUZXh0KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrZG93UHJldmlld1J1bGVzXG4gICAgICAuY29uY2F0KHRoaXMuZ2V0VGV4dEVkaXRvclN0eWxlcygpKVxuICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAucmVwbGFjZSgvYXRvbS10ZXh0LWVkaXRvci9nLCAncHJlLmVkaXRvci1jb2xvcnMnKVxuICAgICAgLnJlcGxhY2UoLzpob3N0L2csICcuaG9zdCcpIC8vIFJlbW92ZSBzaGFkb3ctZG9tIDpob3N0IHNlbGVjdG9yIGNhdXNpbmcgcHJvYmxlbSBvbiBGRlxuICAgICAgLnJlcGxhY2UoY3NzVXJsUmVmRXhwLCBmdW5jdGlvbihcbiAgICAgICAgX21hdGNoLFxuICAgICAgICBhc3NldHNOYW1lOiBzdHJpbmcsXG4gICAgICAgIF9vZmZzZXQsXG4gICAgICAgIF9zdHJpbmcsXG4gICAgICApIHtcbiAgICAgICAgLy8gYmFzZTY0IGVuY29kZSBhc3NldHNcbiAgICAgICAgY29uc3QgYXNzZXRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2Fzc2V0cycsIGFzc2V0c05hbWUpXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhhc3NldFBhdGgsICdiaW5hcnknKVxuICAgICAgICBjb25zdCBiYXNlNjREYXRhID0gbmV3IEJ1ZmZlcihvcmlnaW5hbERhdGEsICdiaW5hcnknKS50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgcmV0dXJuIGB1cmwoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtiYXNlNjREYXRhfScpYFxuICAgICAgfSlcbiAgfVxuXG4gIHNob3dFcnJvcihyZXN1bHQ6IEVycm9yKSB7XG4gICAgY29uc3QgZXJyb3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGVycm9yLmlubmVySFRNTCA9IGA8aDI+UHJldmlld2luZyBNYXJrZG93biBGYWlsZWQ8L2gyPjxoMz4ke1xuICAgICAgcmVzdWx0Lm1lc3NhZ2VcbiAgICB9PC9oMz5gXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKGVycm9yKVxuICB9XG5cbiAgc2hvd0xvYWRpbmcoKSB7XG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZVxuICAgIGNvbnN0IHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNwaW5uZXIuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tc3Bpbm5lcicpXG4gICAgc3Bpbm5lci5pbm5lclRleHQgPSAnTG9hZGluZyBNYXJrZG93blxcdTIwMjYnXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gIH1cblxuICBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKClcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzZWxlY3Rpb24uYmFzZU5vZGUgYXMgSFRNTEVsZW1lbnRcblxuICAgIC8vIFVzZSBkZWZhdWx0IGNvcHkgZXZlbnQgaGFuZGxlciBpZiB0aGVyZSBpcyBzZWxlY3RlZCB0ZXh0IGluc2lkZSB0aGlzIHZpZXdcbiAgICBpZiAoXG4gICAgICBzZWxlY3RlZFRleHQgJiZcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vVE9ETzogY29tcGxhaW4gb24gVFNcbiAgICAgIHNlbGVjdGVkTm9kZSAhPSBudWxsICYmXG4gICAgICAodGhpcy5lbGVtZW50ID09PSBzZWxlY3RlZE5vZGUgfHwgdGhpcy5lbGVtZW50LmNvbnRhaW5zKHNlbGVjdGVkTm9kZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZmxvYXRpbmctcHJvbWlzZXNcbiAgICB0aGlzLmdldEhUTUwoZnVuY3Rpb24oZXJyb3IsIGh0bWwpIHtcbiAgICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0NvcHlpbmcgTWFya2Rvd24gYXMgSFRNTCBmYWlsZWQnLCBlcnJvcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGh0bWwpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBhc3luYyBzYXZlQXMoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IGZpbGVQYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBsZXQgdGl0bGUgPSAnTWFya2Rvd24gdG8gSFRNTCdcbiAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgIHRpdGxlID0gcGF0aC5wYXJzZShmaWxlUGF0aCkubmFtZVxuICAgICAgZmlsZVBhdGggKz0gJy5odG1sJ1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICBmaWxlUGF0aCA9ICd1bnRpdGxlZC5tZC5odG1sJ1xuICAgICAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBmaWxlUGF0aClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBodG1sRmlsZVBhdGggPSBhdG9tLnNob3dTYXZlRGlhbG9nU3luYyhmaWxlUGF0aClcbiAgICBpZiAoaHRtbEZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRIVE1MKChlcnJvcjogRXJyb3IgfCBudWxsLCBodG1sQm9keTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybignU2F2aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IG1hdGhqYXhTY3JpcHRcbiAgICAgICAgICBpZiAodGhpcy5yZW5kZXJMYVRlWCkge1xuICAgICAgICAgICAgbWF0aGpheFNjcmlwdCA9IGBcXFxuXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L3gtbWF0aGpheC1jb25maWdcIj5cbiAgTWF0aEpheC5IdWIuQ29uZmlnKHtcbiAgICBqYXg6IFtcImlucHV0L1RlWFwiLFwib3V0cHV0L0hUTUwtQ1NTXCJdLFxuICAgIGV4dGVuc2lvbnM6IFtdLFxuICAgIFRlWDoge1xuICAgICAgZXh0ZW5zaW9uczogW1wiQU1TbWF0aC5qc1wiLFwiQU1Tc3ltYm9scy5qc1wiLFwibm9FcnJvcnMuanNcIixcIm5vVW5kZWZpbmVkLmpzXCJdXG4gICAgfSxcbiAgICBzaG93TWF0aE1lbnU6IGZhbHNlXG4gIH0pO1xuPC9zY3JpcHQ+XG48c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBzcmM9XCJodHRwczovL2Nkbi5tYXRoamF4Lm9yZy9tYXRoamF4L2xhdGVzdC9NYXRoSmF4LmpzXCI+XG48L3NjcmlwdD5cXFxuYFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXRoamF4U2NyaXB0ID0gJydcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaHRtbCA9XG4gICAgICAgICAgICBgXFxcbjwhRE9DVFlQRSBodG1sPlxuPGh0bWw+XG4gIDxoZWFkPlxuICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCIgLz5cbiAgICAgIDx0aXRsZT4ke3RpdGxlfTwvdGl0bGU+JHttYXRoamF4U2NyaXB0fVxuICAgICAgPHN0eWxlPiR7dGhpcy5nZXRNYXJrZG93blByZXZpZXdDU1MoKX08L3N0eWxlPlxuICA8L2hlYWQ+XG4gIDxib2R5IGNsYXNzPSdtYXJrZG93bi1wcmV2aWV3Jz4ke2h0bWxCb2R5fTwvYm9keT5cbjwvaHRtbD5gICsgJ1xcbicgLy8gRW5zdXJlIHRyYWlsaW5nIG5ld2xpbmVcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoaHRtbEZpbGVQYXRoLCBodG1sKVxuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oaHRtbEZpbGVQYXRoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlzRXF1YWwob3RoZXI6IG51bGwgfCBbTm9kZV0pIHtcbiAgICByZXR1cm4gdGhpc1swXSA9PT0gKG90aGVyICE9PSBudWxsID8gb3RoZXJbMF0gOiB1bmRlZmluZWQpIC8vIENvbXBhcmUgRE9NIGVsZW1lbnRzXG4gIH1cblxuICAvL1xuICAvLyBGaW5kIHRoZSBjbG9zZXN0IGFuY2VzdG9yIG9mIGFuIGVsZW1lbnQgdGhhdCBpcyBub3QgYSBkZWNlbmRhbnQgb2YgZWl0aGVyXG4gIC8vIGBzcGFuLm1hdGhgIG9yIGBzcGFuLmF0b20tdGV4dC1lZGl0b3JgLlxuICAvL1xuICAvLyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IGZyb20gd2hpY2ggdGhlIHNlYXJjaCBmb3IgYVxuICAvLyAgIGNsb3Nlc3QgYW5jZXN0b3IgYmVnaW5zLlxuICAvLyBAcmV0dXJuIHtIVE1MRWxlbWVudH0gVGhlIGNsb3Nlc3QgYW5jZXN0b3IgdG8gYGVsZW1lbnRgIHRoYXQgZG9lcyBub3RcbiAgLy8gICBjb250YWluIGVpdGhlciBgc3Bhbi5tYXRoYCBvciBgc3Bhbi5hdG9tLXRleHQtZWRpdG9yYC5cbiAgLy9cbiAgYnViYmxlVG9Db250YWluZXJFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgIGxldCB0ZXN0RWxlbWVudCA9IGVsZW1lbnRcbiAgICB3aGlsZSAodGVzdEVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRlc3RFbGVtZW50LnBhcmVudEVsZW1lbnQhXG4gICAgICBpZiAocGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnTWF0aEpheF9EaXNwbGF5JykpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudC5wYXJlbnRFbGVtZW50IVxuICAgICAgfVxuICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F0b20tdGV4dC1lZGl0b3InKSkge1xuICAgICAgICByZXR1cm4gcGFyZW50XG4gICAgICB9XG4gICAgICB0ZXN0RWxlbWVudCA9IHBhcmVudFxuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgLy9cbiAgLy8gRGV0ZXJtaW5lIGEgc3Vic2VxdWVuY2Ugb2YgYSBzZXF1ZW5jZSBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGEgcGF0aCB0aHJvdWdoXG4gIC8vIEhUTUxFbGVtZW50cyB0aGF0IGRvZXMgbm90IGNvbnRpbnVlIGRlZXBlciB0aGFuIGEgdGFibGUgZWxlbWVudC5cbiAgLy9cbiAgLy8gQHBhcmFtIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IHBhdGhUb1Rva2VuIEFycmF5IG9mIHRva2Vuc1xuICAvLyAgIHJlcHJlc2VudGluZyBhIHBhdGggdG8gYSBIVE1MRWxlbWVudCB3aXRoIHRoZSByb290IGVsZW1lbnQgYXRcbiAgLy8gICBwYXRoVG9Ub2tlblswXSBhbmQgdGhlIHRhcmdldCBlbGVtZW50IGF0IHRoZSBoaWdoZXN0IGluZGV4LiBFYWNoIGVsZW1lbnRcbiAgLy8gICBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHNcbiAgLy8gICBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lIGB0YWdgLlxuICAvLyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IFRoZSBzdWJzZXF1ZW5jZSBvZiBwYXRoVG9Ub2tlbiB0aGF0XG4gIC8vICAgbWFpbnRhaW5zIHRoZSBzYW1lIHJvb3QgYnV0IHRlcm1pbmF0ZXMgYXQgYSB0YWJsZSBlbGVtZW50IG9yIHRoZSB0YXJnZXRcbiAgLy8gICBlbGVtZW50LCB3aGljaGV2ZXIgY29tZXMgZmlyc3QuXG4gIC8vXG4gIGJ1YmJsZVRvQ29udGFpbmVyVG9rZW4ocGF0aFRvVG9rZW46IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4pIHtcbiAgICBjb25zdCBlbmQgPSBwYXRoVG9Ub2tlbi5sZW5ndGggLSAxXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gZW5kOyBpKyspIHtcbiAgICAgIGlmIChwYXRoVG9Ub2tlbltpXS50YWcgPT09ICd0YWJsZScpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhUb1Rva2VuLnNsaWNlKDAsIGkgKyAxKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGF0aFRvVG9rZW5cbiAgfVxuXG4gIC8vXG4gIC8vIEVuY29kZSB0YWdzIGZvciBtYXJrZG93bi1pdC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBFbmNvZGUgdGhlIHRhZyBvZiBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtzdHJpbmd9IEVuY29kZWQgdGFnLlxuICAvL1xuICBlbmNvZGVUYWcoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBzdHJpbmcge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWF0aCcpKSB7XG4gICAgICByZXR1cm4gJ21hdGgnXG4gICAgfVxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnYXRvbS10ZXh0LWVkaXRvcicpKSB7XG4gICAgICByZXR1cm4gJ2NvZGUnXG4gICAgfSAvLyBvbmx5IHRva2VuLnR5cGUgaXMgYGZlbmNlYCBjb2RlIGJsb2NrcyBzaG91bGQgZXZlciBiZSBmb3VuZCBpbiB0aGUgZmlyc3QgbGV2ZWwgb2YgdGhlIHRva2VucyBhcnJheVxuICAgIHJldHVybiBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgLy9cbiAgLy8gRGVjb2RlIHRhZ3MgdXNlZCBieSBtYXJrZG93bi1pdFxuICAvL1xuICAvLyBAcGFyYW0ge21hcmtkb3duLWl0LlRva2VufSB0b2tlbiBEZWNvZGUgdGhlIHRhZyBvZiB0b2tlbi5cbiAgLy8gQHJldHVybiB7c3RyaW5nfG51bGx9IERlY29kZWQgdGFnIG9yIGBudWxsYCBpZiB0aGUgdG9rZW4gaGFzIG5vIHRhZy5cbiAgLy9cbiAgZGVjb2RlVGFnKHRva2VuOiBUb2tlbik6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICh0b2tlbi50YWcgPT09ICdtYXRoJykge1xuICAgICAgcmV0dXJuICdzcGFuJ1xuICAgIH1cbiAgICBpZiAodG9rZW4udGFnID09PSAnY29kZScpIHtcbiAgICAgIHJldHVybiAnc3BhbidcbiAgICB9XG4gICAgaWYgKHRva2VuLnRhZyA9PT0gJycpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIHJldHVybiB0b2tlbi50YWdcbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBwYXRoIHRvIGEgdGFyZ2V0IGVsZW1lbnQgZnJvbSBhIGNvbnRhaW5lciBgLm1hcmtkb3duLXByZXZpZXdgLlxuICAvL1xuICAvLyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRhcmdldCBIVE1MRWxlbWVudC5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBBcnJheSBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGEgcGF0aFxuICAvLyAgIHRvIGBlbGVtZW50YCBmcm9tIGAubWFya2Rvd24tcHJldmlld2AuIFRoZSByb290IGAubWFya2Rvd24tcHJldmlld2BcbiAgLy8gICBlbGVtZW50IGlzIHRoZSBmaXJzdCBlbGVtZW50cyBpbiB0aGUgYXJyYXkgYW5kIHRoZSB0YXJnZXQgZWxlbWVudFxuICAvLyAgIGBlbGVtZW50YCBhdCB0aGUgaGlnaGVzdCBpbmRleC4gRWFjaCBlbGVtZW50IGNvbnNpc3RzIG9mIGEgYHRhZ2AgYW5kXG4gIC8vICAgYGluZGV4YCByZXByZXNlbnRpbmcgaXRzIGluZGV4IGFtb25nc3QgaXRzIHNpYmxpbmcgZWxlbWVudHMgb2YgdGhlIHNhbWVcbiAgLy8gICBgdGFnYC5cbiAgLy9cbiAgZ2V0UGF0aFRvRWxlbWVudChcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgKTogQXJyYXk8eyB0YWc6IHN0cmluZzsgaW5kZXg6IG51bWJlciB9PiB7XG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtYXJrZG93bi1wcmV2aWV3JykpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0YWc6ICdkaXYnLFxuICAgICAgICAgIGluZGV4OiAwLFxuICAgICAgICB9LFxuICAgICAgXVxuICAgIH1cblxuICAgIGVsZW1lbnQgPSB0aGlzLmJ1YmJsZVRvQ29udGFpbmVyRWxlbWVudChlbGVtZW50KVxuICAgIGNvbnN0IHRhZyA9IHRoaXMuZW5jb2RlVGFnKGVsZW1lbnQpXG4gICAgY29uc3Qgc2libGluZ3MgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQhLmNoaWxkcmVuXG4gICAgbGV0IHNpYmxpbmdzQ291bnQgPSAwXG5cbiAgICBmb3IgKGNvbnN0IHNpYmxpbmcgb2YgQXJyYXkuZnJvbShzaWJsaW5ncykpIHtcbiAgICAgIGNvbnN0IHNpYmxpbmdUYWcgPVxuICAgICAgICBzaWJsaW5nLm5vZGVUeXBlID09PSAxID8gdGhpcy5lbmNvZGVUYWcoc2libGluZyBhcyBIVE1MRWxlbWVudCkgOiBudWxsXG4gICAgICBpZiAoc2libGluZyA9PT0gZWxlbWVudCkge1xuICAgICAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQucGFyZW50RWxlbWVudCEpXG4gICAgICAgIHBhdGhUb0VsZW1lbnQucHVzaCh7XG4gICAgICAgICAgdGFnLFxuICAgICAgICAgIGluZGV4OiBzaWJsaW5nc0NvdW50LFxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gcGF0aFRvRWxlbWVudFxuICAgICAgfSBlbHNlIGlmIChzaWJsaW5nVGFnID09PSB0YWcpIHtcbiAgICAgICAgc2libGluZ3NDb3VudCsrXG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignZmFpbHVyZSBpbiBnZXRQYXRoVG9FbGVtZW50JylcbiAgfVxuXG4gIC8vXG4gIC8vIFNldCB0aGUgYXNzb2NpYXRlZCBlZGl0b3JzIGN1cnNvciBidWZmZXIgcG9zaXRpb24gdG8gdGhlIGxpbmUgcmVwcmVzZW50aW5nXG4gIC8vIHRoZSBzb3VyY2UgbWFya2Rvd24gb2YgYSB0YXJnZXQgZWxlbWVudC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgZWxlbWVudCBjb250YWluZWQgd2l0aGluIHRoZSBhc3NvaWNhdGVkXG4gIC8vICAgYC5tYXJrZG93bi1wcmV2aWV3YCBjb250YWluZXIuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvIGlkZW50aWZ5IHRoZVxuICAvLyAgIGxpbmUgb2YgYHRleHRgIHRoYXQgcmVwcmVzZW50cyBgZWxlbWVudGAgYW5kIHNldCB0aGUgY3Vyc29yIHRvIHRoYXQgbGluZS5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgLiBJZiBub1xuICAvLyAgIGxpbmUgaXMgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gIC8vXG4gIHN5bmNTb3VyY2UodGV4dDogc3RyaW5nLCBlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IHBhdGhUb0VsZW1lbnQgPSB0aGlzLmdldFBhdGhUb0VsZW1lbnQoZWxlbWVudClcbiAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KCkgLy8gcmVtb3ZlIGRpdi5tYXJrZG93bi1wcmV2aWV3XG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBkaXYudXBkYXRlLXByZXZpZXdcbiAgICBpZiAoIXBhdGhUb0VsZW1lbnQubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGNvbnN0IHRva2VucyA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zKHRleHQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgbGV0IGZpbmFsVG9rZW4gPSBudWxsXG4gICAgbGV0IGxldmVsID0gMFxuXG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgIGlmICh0b2tlbi5sZXZlbCA8IGxldmVsKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4uaGlkZGVuKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4udGFnID09PSBwYXRoVG9FbGVtZW50WzBdLnRhZyAmJiB0b2tlbi5sZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IDEpIHtcbiAgICAgICAgICBpZiAocGF0aFRvRWxlbWVudFswXS5pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXNcbiAgICAgICAgICAgIGlmICh0b2tlbi5tYXAgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBmaW5hbFRva2VuID0gdG9rZW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKVxuICAgICAgICAgICAgbGV2ZWwrK1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50WzBdLmluZGV4LS1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdG9rZW4ubmVzdGluZyA9PT0gMCAmJlxuICAgICAgICAgIFsnbWF0aCcsICdjb2RlJywgJ2hyJ10uaW5jbHVkZXModG9rZW4udGFnKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAocGF0aFRvRWxlbWVudFswXS5pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50WzBdLmluZGV4LS1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwYXRoVG9FbGVtZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaW5hbFRva2VuICE9PSBudWxsICYmIHRoaXMuZWRpdG9yKSB7XG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbZmluYWxUb2tlbi5tYXBbMF0sIDBdKVxuICAgICAgcmV0dXJuIGZpbmFsVG9rZW4ubWFwWzBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gRGV0ZXJtaW5lIHBhdGggdG8gYSB0YXJnZXQgdG9rZW4uXG4gIC8vXG4gIC8vIEBwYXJhbSB7KG1hcmtkb3duLWl0LlRva2VuKVtdfSB0b2tlbnMgQXJyYXkgb2YgdG9rZW5zIGFzIHJldHVybmVkIGJ5XG4gIC8vICAgYG1hcmtkb3duLWl0LnBhcnNlKClgLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBMaW5lIHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IHRva2VuLlxuICAvLyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IEFycmF5IHJlcHJlc2VudGluZyBhIHBhdGggdG8gdGhlXG4gIC8vICAgdGFyZ2V0IHRva2VuLiBUaGUgcm9vdCB0b2tlbiBpcyByZXByZXNlbnRlZCBieSB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGVcbiAgLy8gICBhcnJheSBhbmQgdGhlIHRhcmdldCB0b2tlbiBieSB0aGUgbGFzdCBlbG1lbnQuIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhXG4gIC8vICAgYHRhZ2AgYW5kIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIHRva2VucyBpblxuICAvLyAgIGB0b2tlbnNgIG9mIHRoZSBzYW1lIGB0YWdgLiBgbGluZWAgd2lsbCBsaWUgYmV0d2VlbiB0aGUgcHJvcGVydGllc1xuICAvLyAgIGBtYXBbMF1gIGFuZCBgbWFwWzFdYCBvZiB0aGUgdGFyZ2V0IHRva2VuLlxuICAvL1xuICBnZXRQYXRoVG9Ub2tlbih0b2tlbnM6IFRva2VuW10sIGxpbmU6IG51bWJlcikge1xuICAgIGxldCBwYXRoVG9Ub2tlbjogQXJyYXk8eyB0YWc6IHN0cmluZzsgaW5kZXg6IG51bWJlciB9PiA9IFtdXG4gICAgbGV0IHRva2VuVGFnQ291bnQ6IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIHwgdW5kZWZpbmVkIH0gPSB7fVxuICAgIGxldCBsZXZlbCA9IDBcblxuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICBpZiAodG9rZW4ubGV2ZWwgPCBsZXZlbCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuLmhpZGRlbikge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IC0xKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhZyA9IHRoaXMuZGVjb2RlVGFnKHRva2VuKVxuICAgICAgaWYgKHRhZyA9PT0gbnVsbCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgdG9rZW4udGFnID0gdGFnXG5cbiAgICAgIGlmIChcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXNcbiAgICAgICAgdG9rZW4ubWFwICE9IG51bGwgJiYgLy8gdG9rZW4ubWFwICpjYW4qIGJlIG51bGwgLy8gVE9ETzogY29tcGxhaW4gb24gRFRcbiAgICAgICAgbGluZSA+PSB0b2tlbi5tYXBbMF0gJiZcbiAgICAgICAgbGluZSA8PSB0b2tlbi5tYXBbMV0gLSAxXG4gICAgICApIHtcbiAgICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IDEpIHtcbiAgICAgICAgICBwYXRoVG9Ub2tlbi5wdXNoKHtcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnLFxuICAgICAgICAgICAgaW5kZXg6IHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSB8fCAwLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgdG9rZW5UYWdDb3VudCA9IHt9XG4gICAgICAgICAgbGV2ZWwrK1xuICAgICAgICB9IGVsc2UgaWYgKHRva2VuLm5lc3RpbmcgPT09IDApIHtcbiAgICAgICAgICBwYXRoVG9Ub2tlbi5wdXNoKHtcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnLFxuICAgICAgICAgICAgaW5kZXg6IHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSB8fCAwLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0b2tlbi5sZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgaWYgKHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdG9rZW5UYWdDb3VudFt0b2tlbi50YWddISsrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5UYWdDb3VudFt0b2tlbi50YWddID0gMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGF0aFRvVG9rZW4gPSB0aGlzLmJ1YmJsZVRvQ29udGFpbmVyVG9rZW4ocGF0aFRvVG9rZW4pXG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG4gIH1cblxuICAvL1xuICAvLyBTY3JvbGwgdGhlIGFzc29jaWF0ZWQgcHJldmlldyB0byB0aGUgZWxlbWVudCByZXByZXNlbnRpbmcgdGhlIHRhcmdldCBsaW5lIG9mXG4gIC8vIG9mIHRoZSBzb3VyY2UgbWFya2Rvd24uXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRhcmdldCBsaW5lIG9mIGB0ZXh0YC4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG9cbiAgLy8gICBpZGVudGlmeSB0aGUgZWxtZW50IG9mIHRoZSBhc3NvY2lhdGVkIGAubWFya2Rvd24tcHJldmlld2AgdGhhdCByZXByZXNlbnRzXG4gIC8vICAgYGxpbmVgIGFuZCBzY3JvbGwgdGhlIGAubWFya2Rvd24tcHJldmlld2AgdG8gdGhhdCBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGBsaW5lYC4gSWYgbm8gZWxlbWVudCBpc1xuICAvLyAgIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jUHJldmlldyh0ZXh0OiBzdHJpbmcsIGxpbmU6IG51bWJlcikge1xuICAgIGNvbnN0IHRva2VucyA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zKHRleHQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgY29uc3QgcGF0aFRvVG9rZW4gPSB0aGlzLmdldFBhdGhUb1Rva2VuKHRva2VucywgbGluZSlcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5wcmV2aWV3XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiBwYXRoVG9Ub2tlbikge1xuICAgICAgY29uc3QgY2FuZGlkYXRlRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gZWxlbWVudFxuICAgICAgICAucXVlcnlTZWxlY3RvckFsbChgOnNjb3BlID4gJHt0b2tlbi50YWd9YClcbiAgICAgICAgLml0ZW0odG9rZW4uaW5kZXgpIGFzIEhUTUxFbGVtZW50XG4gICAgICBpZiAoY2FuZGlkYXRlRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50ID0gY2FuZGlkYXRlRWxlbWVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JykpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9IC8vIERvIG5vdCBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIHByZXZpZXcgZm9yIGJhZCBzeW5jc1xuXG4gICAgaWYgKCFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygndXBkYXRlLXByZXZpZXcnKSkge1xuICAgICAgZWxlbWVudC5zY3JvbGxJbnRvVmlldygpXG4gICAgfVxuICAgIGNvbnN0IG1heFNjcm9sbFRvcCA9IHRoaXMuZWxlbWVudC5zY3JvbGxIZWlnaHQgLSB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgaWYgKCEodGhpcy5lbGVtZW50LnNjcm9sbFRvcCA+PSBtYXhTY3JvbGxUb3ApKSB7XG4gICAgICB0aGlzLmVsZW1lbnQuc2Nyb2xsVG9wIC09IHRoaXMuZWxlbWVudC5jbGllbnRIZWlnaHQgLyA0XG4gICAgfVxuXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmbGFzaCcpXG4gICAgc2V0VGltZW91dCgoKSA9PiBlbGVtZW50IS5jbGFzc0xpc3QucmVtb3ZlKCdmbGFzaCcpLCAxMDAwKVxuXG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxufVxuIl19