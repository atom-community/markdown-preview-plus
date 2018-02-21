"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const atom_1 = require("atom");
const _ = require("lodash");
const fs = require("fs");
const renderer = require("../renderer");
const update_preview_1 = require("../update-preview");
const markdownIt = require("../markdown-it-helper");
const imageWatcher = require("../image-watch-helper");
const util_1 = require("../util");
const util = require("./util");
class MarkdownPreviewView {
    constructor({ editorId, filePath }, deserialization = false) {
        this.loading = true;
        this.renderPromise = new Promise((resolve) => (this.resolve = resolve));
        this.emitter = new atom_1.Emitter();
        this.renderLaTeX = atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
        this.disposables = new atom_1.CompositeDisposable();
        this.loaded = true;
        this.destroyed = false;
        this.editorId = editorId;
        this.filePath = filePath;
        this.element = document.createElement('iframe');
        this.element.getModel = () => this;
        this.element.classList.add('markdown-preview-plus', 'native-key-bindings');
        this.element.src = 'about:blank';
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.disposables.add(atom.styles.onDidAddStyleElement(() => {
            this.updateStyles();
        }), atom.styles.onDidRemoveStyleElement(() => {
            this.updateStyles();
        }), atom.styles.onDidUpdateStyleElement(() => {
            this.updateStyles();
        }));
        const onload = () => {
            if (this.destroyed)
                return;
            if (this.updatePreview)
                this.updatePreview = undefined;
            const doc = this.element.contentDocument;
            this.updateStyles();
            this.rootElement = doc.createElement('markdown-preview-plus-view');
            this.rootElement.classList.add('native-key-bindings');
            this.rootElement.tabIndex = -1;
            if (atom.config.get('markdown-preview-plus.useGitHubStyle')) {
                this.rootElement.setAttribute('data-use-github-style', '');
            }
            this.preview = doc.createElement('div');
            this.preview.classList.add('update-preview');
            this.rootElement.appendChild(this.preview);
            doc.body.appendChild(this.rootElement);
            this.rootElement.oncontextmenu = (e) => {
                this.lastTarget = e.target;
                const pane = atom.workspace.paneForItem(this);
                if (pane)
                    pane.activate();
                atom.contextMenu.showForEvent(Object.assign({}, e, { target: this.element }));
            };
            const didAttach = () => {
                if (this.destroyed)
                    return;
                if (this.editorId !== undefined && !this.editor) {
                    this.resolveEditor(this.editorId);
                }
                else if (this.filePath !== undefined && !this.file) {
                    this.subscribeToFilePath(this.filePath);
                }
                if (this.editor || this.file)
                    util_1.handlePromise(this.renderMarkdown());
            };
            if (deserialization && this.editorId !== undefined) {
                setImmediate(didAttach);
                deserialization = false;
            }
            else {
                didAttach();
            }
        };
        this.element.addEventListener('load', onload);
    }
    text() {
        if (!this.rootElement)
            return '';
        return this.rootElement.textContent || '';
    }
    find(what) {
        if (!this.rootElement)
            return null;
        return this.rootElement.querySelector(what);
    }
    findAll(what) {
        if (!this.rootElement)
            return [];
        return this.rootElement.querySelectorAll(what);
    }
    getRoot() {
        return this.rootElement;
    }
    serialize() {
        return {
            deserializer: 'markdown-preview-plus/MarkdownPreviewView',
            filePath: this.getPath() || this.filePath,
            editorId: this.editorId,
        };
    }
    destroy() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        const path = this.getPath();
        path && imageWatcher.removeFile(path);
        this.disposables.dispose();
        this.element.remove();
    }
    onDidChangeTitle(callback) {
        return this.emitter.on('did-change-title', callback);
    }
    onDidChangeMarkdown(callback) {
        return this.emitter.on('did-change-markdown', callback);
    }
    subscribeToFilePath(filePath) {
        this.file = new atom_1.File(filePath);
        this.emitter.emit('did-change-title');
        this.handleEvents();
    }
    resolveEditor(editorId) {
        this.editor = util.editorForId(editorId);
        if (this.editor) {
            this.emitter.emit('did-change-title');
            this.handleEvents();
        }
        else {
            util.destroy(this);
        }
    }
    handleEvents() {
        this.disposables.add(atom.grammars.onDidAddGrammar(() => _.debounce(() => {
            util_1.handlePromise(this.renderMarkdown());
        }, 250)), atom.grammars.onDidUpdateGrammar(_.debounce(() => {
            util_1.handlePromise(this.renderMarkdown());
        }, 250)));
        this.disposables.add(atom.commands.add(this.element, {
            'core:move-up': () => this.rootElement && this.rootElement.scrollBy({ top: -10 }),
            'core:move-down': () => this.rootElement && this.rootElement.scrollBy({ top: 10 }),
            'core:copy': (event) => {
                if (this.copyToClipboard())
                    event.stopPropagation();
            },
            'markdown-preview-plus:zoom-in': () => {
                if (!this.rootElement)
                    return;
                const zoomLevel = parseFloat(this.rootElement.style.zoom || '1');
                this.rootElement.style.zoom = (zoomLevel + 0.1).toString();
            },
            'markdown-preview-plus:zoom-out': () => {
                if (!this.rootElement)
                    return;
                const zoomLevel = parseFloat(this.rootElement.style.zoom || '1');
                this.rootElement.style.zoom = (zoomLevel - 0.1).toString();
            },
            'markdown-preview-plus:reset-zoom': () => {
                if (!this.rootElement)
                    return;
                this.rootElement.style.zoom = '1';
            },
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
        }));
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
            }), this.editor.onDidChangePath(() => {
                this.emitter.emit('did-change-title');
            }), this.editor.onDidDestroy(() => {
                util.destroy(this);
            }), this.editor.getBuffer().onDidSave(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    changeHandler();
                }
            }), this.editor.getBuffer().onDidReload(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    changeHandler();
                }
            }), atom.commands.add(atom.views.getView(this.editor), {
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
        this.disposables.add(atom.config.onDidChange('markdown-preview-plus.useGitHubStyle', (useGitHubStyle) => {
            if (useGitHubStyle) {
                this.rootElement &&
                    this.rootElement.setAttribute('data-use-github-style', '');
            }
            else {
                this.rootElement &&
                    this.rootElement.removeAttribute('data-use-github-style');
            }
        }));
    }
    async renderMarkdown() {
        if (!this.loaded) {
            this.showLoading();
        }
        const source = await this.getMarkdownSource();
        if (source)
            await this.renderMarkdownText(source);
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
    async getHTML() {
        const source = await this.getMarkdownSource();
        if (source === undefined)
            throw new Error("Couldn't get Markdown source");
        return renderer.toHTML(source, this.getPath(), this.getGrammar(), this.renderLaTeX, false);
    }
    async renderMarkdownText(text) {
        try {
            const domDocument = await renderer.render(text, this.getPath(), this.renderLaTeX, false);
            if (this.destroyed)
                return;
            this.loading = false;
            this.loaded = true;
            if (!this.preview)
                return;
            if (!this.updatePreview) {
                this.updatePreview = new update_preview_1.UpdatePreview(this.preview);
            }
            const domFragment = document.createDocumentFragment();
            for (const elem of Array.from(domDocument.body.childNodes)) {
                domFragment.appendChild(elem);
            }
            this.updatePreview.update(this.element, domFragment, this.renderLaTeX);
            const doc = this.element.contentDocument;
            if (doc && domDocument.head.hasChildNodes) {
                let container = doc.head.querySelector('original-elements');
                if (!container) {
                    container = doc.createElement('original-elements');
                    doc.head.appendChild(container);
                }
                container.innerHTML = '';
                for (const headElement of Array.from(domDocument.head.childNodes)) {
                    container.appendChild(headElement.cloneNode(true));
                }
            }
            this.emitter.emit('did-change-markdown');
        }
        catch (error) {
            console.error(error);
            this.showError(error);
        }
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
    showError(error) {
        console.error(error);
        if (!this.preview)
            return;
        if (this.destroyed) {
            atom.notifications.addFatalError('Error reported on a destroyed Markdown Preview Plus view', {
                dismissable: true,
                stack: error.stack,
                detail: error.message,
            });
        }
        const errorDiv = this.element.contentDocument.createElement('div');
        errorDiv.innerHTML = `<h2>Previewing Markdown Failed</h2><h3>${error.message}</h3>`;
        this.preview.appendChild(errorDiv);
    }
    showLoading() {
        if (!this.preview)
            return;
        this.loading = true;
        const spinner = this.element.contentDocument.createElement('div');
        spinner.classList.add('markdown-spinner');
        spinner.innerText = 'Loading Markdown\u2026';
        this.preview.appendChild(spinner);
    }
    copyToClipboard() {
        if (this.loading || !this.preview) {
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
        util_1.handlePromise(this.getHTML().then(function (html) {
            atom.clipboard.write(html);
        }));
        return true;
    }
    getSaveDialogOptions() {
        let defaultPath = this.getPath();
        if (defaultPath) {
            defaultPath += '.html';
        }
        else {
            const projectPath = atom.project.getPaths()[0];
            defaultPath = 'untitled.md.html';
            if (projectPath) {
                defaultPath = path.join(projectPath, defaultPath);
            }
        }
        return { defaultPath };
    }
    saveAs(htmlFilePath) {
        if (htmlFilePath === undefined)
            return;
        if (this.loading)
            return;
        const title = path.parse(htmlFilePath).name;
        util_1.handlePromise(this.getHTML().then(async (htmlBody) => {
            const html = util.mkHtml(title, htmlBody, this.renderLaTeX, atom.config.get('markdown-preview-plus.useGitHubStyle'));
            fs.writeFileSync(htmlFilePath, html);
            return atom.workspace.open(htmlFilePath);
        }));
    }
    syncSource(text, element) {
        const pathToElement = util.getPathToElement(element);
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
            atom.workspace.open(this.editor, {
                initialLine: finalToken.map[0],
                searchAllPanes: true,
            });
            return finalToken.map[0];
        }
        else {
            return null;
        }
    }
    syncPreview(text, line) {
        if (!this.preview)
            return undefined;
        if (!this.rootElement)
            return undefined;
        const tokens = markdownIt.getTokens(text, this.renderLaTeX);
        const pathToToken = util.getPathToToken(tokens, line);
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
        const maxScrollTop = this.rootElement.scrollHeight - this.rootElement.clientHeight;
        if (!(this.rootElement.scrollTop >= maxScrollTop)) {
            this.rootElement.scrollTop -= this.rootElement.clientHeight / 4;
        }
        element.classList.add('flash');
        setTimeout(() => element.classList.remove('flash'), 1000);
        return element;
    }
    updateStyles() {
        const doc = this.element.contentDocument;
        if (!doc)
            return;
        let elem = doc.head.querySelector('atom-styles');
        if (!elem) {
            elem = doc.createElement('atom-styles');
            doc.head.appendChild(elem);
        }
        elem.innerHTML = '';
        for (const se of atom.styles.getStyleElements()) {
            elem.appendChild(se.cloneNode(true));
        }
    }
}
exports.MarkdownPreviewView = MarkdownPreviewView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQVFhO0FBQ2IsNEJBQTRCO0FBQzVCLHlCQUF5QjtBQUV6Qix3Q0FBd0M7QUFDeEMsc0RBQWlEO0FBQ2pELG9EQUFvRDtBQUNwRCxzREFBc0Q7QUFDdEQsa0NBQXVDO0FBQ3ZDLCtCQUE4QjtBQWtCOUI7SUEyQkUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWEsRUFBRSxlQUFlLEdBQUcsS0FBSztRQTFCOUQsWUFBTyxHQUFZLElBQUksQ0FBQTtRQUdmLGtCQUFhLEdBQWtCLElBQUksT0FBTyxDQUN4RCxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUN0QyxDQUFBO1FBSU8sWUFBTyxHQUdWLElBQUksY0FBTyxFQUFFLENBQUE7UUFFVixnQkFBVyxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUM1QyxxREFBcUQsQ0FDdEQsQ0FBQTtRQUNPLGdCQUFXLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO1FBQ3ZDLFdBQU0sR0FBRyxJQUFJLENBQUE7UUFNYixjQUFTLEdBQUcsS0FBSyxDQUFBO1FBR3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQVEsQ0FBQTtRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUE7UUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLHFCQUFxQixDQUFD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Q29tbWFuZEV2ZW50LFxuICBFbWl0dGVyLFxuICBEaXNwb3NhYmxlLFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBGaWxlLFxuICBUZXh0RWRpdG9yLFxuICBHcmFtbWFyLFxufSBmcm9tICdhdG9tJ1xuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKVxuXG5pbXBvcnQgcmVuZGVyZXIgPSByZXF1aXJlKCcuLi9yZW5kZXJlcicpXG5pbXBvcnQgeyBVcGRhdGVQcmV2aWV3IH0gZnJvbSAnLi4vdXBkYXRlLXByZXZpZXcnXG5pbXBvcnQgbWFya2Rvd25JdCA9IHJlcXVpcmUoJy4uL21hcmtkb3duLWl0LWhlbHBlcicpXG5pbXBvcnQgaW1hZ2VXYXRjaGVyID0gcmVxdWlyZSgnLi4vaW1hZ2Utd2F0Y2gtaGVscGVyJylcbmltcG9ydCB7IGhhbmRsZVByb21pc2UgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBpbnRlcmZhY2UgTVBWUGFyYW1zRWRpdG9yIHtcbiAgZWRpdG9ySWQ6IG51bWJlclxuICBmaWxlUGF0aD86IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc1BhdGgge1xuICBlZGl0b3JJZD86IHVuZGVmaW5lZFxuICBmaWxlUGF0aDogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIE1QVlBhcmFtcyA9IE1QVlBhcmFtc0VkaXRvciB8IE1QVlBhcmFtc1BhdGhcblxuZXhwb3J0IHR5cGUgTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnQgPSBIVE1MSUZyYW1lRWxlbWVudCAmIHtcbiAgZ2V0TW9kZWwoKTogTWFya2Rvd25QcmV2aWV3Vmlld1xufVxuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHByaXZhdGUgbG9hZGluZzogYm9vbGVhbiA9IHRydWVcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuaW5pdGlhbGl6ZWRcbiAgcHJpdmF0ZSByZXNvbHZlOiAoKSA9PiB2b2lkXG4gIHB1YmxpYyByZWFkb25seSByZW5kZXJQcm9taXNlOiBQcm9taXNlPHZvaWQ+ID0gbmV3IFByb21pc2U8dm9pZD4oXG4gICAgKHJlc29sdmUpID0+ICh0aGlzLnJlc29sdmUgPSByZXNvbHZlKSxcbiAgKVxuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnRcbiAgcHJpdmF0ZSByb290RWxlbWVudD86IEhUTUxFbGVtZW50XG4gIHByaXZhdGUgcHJldmlldz86IEhUTUxFbGVtZW50XG4gIHByaXZhdGUgZW1pdHRlcjogRW1pdHRlcjx7XG4gICAgJ2RpZC1jaGFuZ2UtdGl0bGUnOiB1bmRlZmluZWRcbiAgICAnZGlkLWNoYW5nZS1tYXJrZG93bic6IHVuZGVmaW5lZFxuICB9PiA9IG5ldyBFbWl0dGVyKClcbiAgcHJpdmF0ZSB1cGRhdGVQcmV2aWV3PzogVXBkYXRlUHJldmlld1xuICBwcml2YXRlIHJlbmRlckxhVGVYOiBib29sZWFuID0gYXRvbS5jb25maWcuZ2V0KFxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnLFxuICApXG4gIHByaXZhdGUgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIHByaXZhdGUgbG9hZGVkID0gdHJ1ZSAvLyBEbyBub3Qgc2hvdyB0aGUgbG9hZGluZyBzcGlubm9yIG9uIGluaXRpYWwgbG9hZFxuICBwcml2YXRlIGVkaXRvcklkPzogbnVtYmVyXG4gIHByaXZhdGUgZmlsZVBhdGg/OiBzdHJpbmdcbiAgcHJpdmF0ZSBmaWxlPzogRmlsZVxuICBwcml2YXRlIGVkaXRvcj86IFRleHRFZGl0b3JcbiAgcHJpdmF0ZSBsYXN0VGFyZ2V0PzogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSBkZXN0cm95ZWQgPSBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yKHsgZWRpdG9ySWQsIGZpbGVQYXRoIH06IE1QVlBhcmFtcywgZGVzZXJpYWxpemF0aW9uID0gZmFsc2UpIHtcbiAgICB0aGlzLmVkaXRvcklkID0gZWRpdG9ySWRcbiAgICB0aGlzLmZpbGVQYXRoID0gZmlsZVBhdGhcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKSBhcyBhbnlcbiAgICB0aGlzLmVsZW1lbnQuZ2V0TW9kZWwgPSAoKSA9PiB0aGlzXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXByZXZpZXctcGx1cycsICduYXRpdmUta2V5LWJpbmRpbmdzJylcbiAgICB0aGlzLmVsZW1lbnQuc3JjID0gJ2Fib3V0OmJsYW5rJ1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9ICcxMDAlJ1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMTAwJSdcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uc3R5bGVzLm9uRGlkQWRkU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgfSksXG4gICAgICBhdG9tLnN0eWxlcy5vbkRpZFJlbW92ZVN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgIH0pLFxuICAgICAgYXRvbS5zdHlsZXMub25EaWRVcGRhdGVTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB9KSxcbiAgICApXG4gICAgY29uc3Qgb25sb2FkID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICAgIGlmICh0aGlzLnVwZGF0ZVByZXZpZXcpIHRoaXMudXBkYXRlUHJldmlldyA9IHVuZGVmaW5lZFxuICAgICAgY29uc3QgZG9jID0gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudFxuICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgdGhpcy5yb290RWxlbWVudCA9IGRvYy5jcmVhdGVFbGVtZW50KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlldycpXG4gICAgICB0aGlzLnJvb3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ25hdGl2ZS1rZXktYmluZGluZ3MnKVxuICAgICAgdGhpcy5yb290RWxlbWVudC50YWJJbmRleCA9IC0xXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnKSkge1xuICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJywgJycpXG4gICAgICB9XG4gICAgICB0aGlzLnByZXZpZXcgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIHRoaXMucHJldmlldy5jbGFzc0xpc3QuYWRkKCd1cGRhdGUtcHJldmlldycpXG4gICAgICB0aGlzLnJvb3RFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMucHJldmlldylcbiAgICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKHRoaXMucm9vdEVsZW1lbnQpXG4gICAgICB0aGlzLnJvb3RFbGVtZW50Lm9uY29udGV4dG1lbnUgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLmxhc3RUYXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudFxuICAgICAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgICAgaWYgKHBhbmUpIHBhbmUuYWN0aXZhdGUoKVxuICAgICAgICBhdG9tLmNvbnRleHRNZW51LnNob3dGb3JFdmVudChcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBlLCB7IHRhcmdldDogdGhpcy5lbGVtZW50IH0pLFxuICAgICAgICApXG4gICAgICB9XG4gICAgICBjb25zdCBkaWRBdHRhY2ggPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgICAgIGlmICh0aGlzLmVkaXRvcklkICE9PSB1bmRlZmluZWQgJiYgIXRoaXMuZWRpdG9yKSB7XG4gICAgICAgICAgdGhpcy5yZXNvbHZlRWRpdG9yKHRoaXMuZWRpdG9ySWQpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5maWxlUGF0aCAhPT0gdW5kZWZpbmVkICYmICF0aGlzLmZpbGUpIHtcbiAgICAgICAgICB0aGlzLnN1YnNjcmliZVRvRmlsZVBhdGgodGhpcy5maWxlUGF0aClcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5lZGl0b3IgfHwgdGhpcy5maWxlKSBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgIH1cbiAgICAgIGlmIChkZXNlcmlhbGl6YXRpb24gJiYgdGhpcy5lZGl0b3JJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIG5lZWQgdG8gZGVmZXIgb24gZGVzZXJpYWxpemF0aW9uIHNpbmNlXG4gICAgICAgIC8vIGVkaXRvciBtaWdodCBub3QgYmUgZGVzZXJpYWxpemVkIGF0IHRoaXMgcG9pbnRcbiAgICAgICAgc2V0SW1tZWRpYXRlKGRpZEF0dGFjaClcbiAgICAgICAgZGVzZXJpYWxpemF0aW9uID0gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpZEF0dGFjaCgpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25sb2FkKVxuICB9XG5cbiAgdGV4dCgpIHtcbiAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVybiAnJ1xuICAgIHJldHVybiB0aGlzLnJvb3RFbGVtZW50LnRleHRDb250ZW50IHx8ICcnXG4gIH1cblxuICBmaW5kKHdoYXQ6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gdGhpcy5yb290RWxlbWVudC5xdWVyeVNlbGVjdG9yKHdoYXQpXG4gIH1cblxuICBmaW5kQWxsKHdoYXQ6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuIFtdXG4gICAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCh3aGF0KVxuICB9XG5cbiAgZ2V0Um9vdCgpIHtcbiAgICByZXR1cm4gdGhpcy5yb290RWxlbWVudFxuICB9XG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldycsXG4gICAgICBmaWxlUGF0aDogdGhpcy5nZXRQYXRoKCkgfHwgdGhpcy5maWxlUGF0aCxcbiAgICAgIGVkaXRvcklkOiB0aGlzLmVkaXRvcklkLFxuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWVcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBwYXRoICYmIGltYWdlV2F0Y2hlci5yZW1vdmVGaWxlKHBhdGgpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKClcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlVGl0bGUoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2spXG4gIH1cblxuICBvbkRpZENoYW5nZU1hcmtkb3duKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1tYXJrZG93bicsIGNhbGxiYWNrKVxuICB9XG5cbiAgc3Vic2NyaWJlVG9GaWxlUGF0aChmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5maWxlID0gbmV3IEZpbGUoZmlsZVBhdGgpXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgIHRoaXMuaGFuZGxlRXZlbnRzKClcbiAgfVxuXG4gIHJlc29sdmVFZGl0b3IoZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIHRoaXMuZWRpdG9yID0gdXRpbC5lZGl0b3JGb3JJZChlZGl0b3JJZClcblxuICAgIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgZWRpdG9yIHRoaXMgcHJldmlldyB3YXMgY3JlYXRlZCBmb3IgaGFzIGJlZW4gY2xvc2VkIHNvIGNsb3NlXG4gICAgICAvLyB0aGlzIHByZXZpZXcgc2luY2UgYSBwcmV2aWV3IGNhbm5vdCBiZSByZW5kZXJlZCB3aXRob3V0IGFuIGVkaXRvclxuICAgICAgdXRpbC5kZXN0cm95KHRoaXMpXG4gICAgfVxuICB9XG5cbiAgaGFuZGxlRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIoKCkgPT5cbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZFVwZGF0ZUdyYW1tYXIoXG4gICAgICAgIF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgICB9LCAyNTApLFxuICAgICAgKSxcbiAgICApXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT5cbiAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50ICYmIHRoaXMucm9vdEVsZW1lbnQuc2Nyb2xsQnkoeyB0b3A6IC0xMCB9KSxcbiAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT5cbiAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50ICYmIHRoaXMucm9vdEVsZW1lbnQuc2Nyb2xsQnkoeyB0b3A6IDEwIH0pLFxuICAgICAgICAnY29yZTpjb3B5JzogKGV2ZW50OiBDb21tYW5kRXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5jb3B5VG9DbGlwYm9hcmQoKSkgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLWluJzogKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuXG4gICAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLnJvb3RFbGVtZW50LnN0eWxlLnpvb20gfHwgJzEnKVxuICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQuc3R5bGUuem9vbSA9ICh6b29tTGV2ZWwgKyAwLjEpLnRvU3RyaW5nKClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLW91dCc6ICgpID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVyblxuICAgICAgICAgIGNvbnN0IHpvb21MZXZlbCA9IHBhcnNlRmxvYXQodGhpcy5yb290RWxlbWVudC5zdHlsZS56b29tIHx8ICcxJylcbiAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnN0eWxlLnpvb20gPSAoem9vbUxldmVsIC0gMC4xKS50b1N0cmluZygpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cmVzZXQtem9vbSc6ICgpID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVyblxuICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQuc3R5bGUuem9vbSA9ICcxJ1xuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtc291cmNlJzogKF9ldmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGxhc3RUYXJnZXQgPSB0aGlzLmxhc3RUYXJnZXRcbiAgICAgICAgICBpZiAoIWxhc3RUYXJnZXQpIHJldHVyblxuICAgICAgICAgIGhhbmRsZVByb21pc2UoXG4gICAgICAgICAgICB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRoaXMuc3luY1NvdXJjZShzb3VyY2UsIGxhc3RUYXJnZXQpXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICApXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApXG5cbiAgICBjb25zdCBjaGFuZ2VIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG5cbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgaWYgKHBhbmUgIT09IHVuZGVmaW5lZCAmJiBwYW5lICE9PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkpIHtcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maWxlKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmZpbGUub25EaWRDaGFuZ2UoY2hhbmdlSGFuZGxlcikpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU3RvcENoYW5naW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uRGlkQ2hhbmdlUGF0aCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5lZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgICB1dGlsLmRlc3Ryb3kodGhpcylcbiAgICAgICAgfSksXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU2F2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIGF0b20uY29tbWFuZHMuYWRkKGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmVkaXRvciksIHtcbiAgICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtcHJldmlldyc6IGFzeW5jIChfZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLmVkaXRvcikgcmV0dXJuXG4gICAgICAgICAgICB0aGlzLnN5bmNQcmV2aWV3KHNvdXJjZSwgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cpXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICApXG4gICAgfVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZScsXG4gICAgICAgIGNoYW5nZUhhbmRsZXIsXG4gICAgICApLFxuICAgIClcblxuICAgIC8vIFRvZ2dsZSBMYVRlWCByZW5kZXJpbmcgaWYgZm9jdXMgaXMgb24gcHJldmlldyBwYW5lIG9yIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1yZW5kZXItbGF0ZXgnOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSA9PT0gdGhpcyB8fFxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpID09PSB0aGlzLmVkaXRvclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCA9ICF0aGlzLnJlbmRlckxhVGVYXG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyxcbiAgICAgICAgKHVzZUdpdEh1YlN0eWxlKSA9PiB7XG4gICAgICAgICAgaWYgKHVzZUdpdEh1YlN0eWxlKSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50ICYmXG4gICAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnLCAnJylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yb290RWxlbWVudCAmJlxuICAgICAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJylcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApLFxuICAgIClcbiAgfVxuXG4gIGFzeW5jIHJlbmRlck1hcmtkb3duKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgIHRoaXMuc2hvd0xvYWRpbmcoKVxuICAgIH1cbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICBpZiAoc291cmNlKSBhd2FpdCB0aGlzLnJlbmRlck1hcmtkb3duVGV4dChzb3VyY2UpXG5cbiAgICB0aGlzLnJlc29sdmUoKVxuICB9XG5cbiAgYXN5bmMgcmVmcmVzaEltYWdlcyhvbGRzcmM6IHN0cmluZykge1xuICAgIGNvbnN0IGltZ3MgPSB0aGlzLmZpbmRBbGwoJ2ltZ1tzcmNdJykgYXMgTm9kZUxpc3RPZjxIVE1MSW1hZ2VFbGVtZW50PlxuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG4gICAgZm9yIChjb25zdCBpbWcgb2YgQXJyYXkuZnJvbShpbWdzKSkge1xuICAgICAgbGV0IG92czogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAgICBsZXQgb3Y6IG51bWJlciB8IHVuZGVmaW5lZFxuICAgICAgbGV0IHNyYyA9IGltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpIVxuICAgICAgY29uc3QgbWF0Y2ggPSBzcmMubWF0Y2goL14oLiopXFw/dj0oXFxkKykkLylcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICA7Wywgc3JjLCBvdnNdID0gbWF0Y2hcbiAgICAgIH1cbiAgICAgIGlmIChzcmMgPT09IG9sZHNyYykge1xuICAgICAgICBpZiAob3ZzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBvdiA9IHBhcnNlSW50KG92cywgMTApXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdiA9IGF3YWl0IGltYWdlV2F0Y2hlci5nZXRWZXJzaW9uKHNyYywgdGhpcy5nZXRQYXRoKCkpXG4gICAgICAgIGlmICh2ICE9PSBvdikge1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoaW1nLnNyYyA9IGAke3NyY30/dj0ke3Z9YCkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKChpbWcuc3JjID0gYCR7c3JjfWApKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgYXN5bmMgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAmJiB0aGlzLmZpbGUuZ2V0UGF0aCgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWxlLnJlYWQoKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRUZXh0KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEhUTUwoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGdldCBNYXJrZG93biBzb3VyY2VcIilcbiAgICByZXR1cm4gcmVuZGVyZXIudG9IVE1MKFxuICAgICAgc291cmNlLFxuICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICBmYWxzZSxcbiAgICApXG4gIH1cblxuICBhc3luYyByZW5kZXJNYXJrZG93blRleHQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRvbURvY3VtZW50ID0gYXdhaXQgcmVuZGVyZXIucmVuZGVyKFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgZmFsc2UsXG4gICAgICApXG4gICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2VcbiAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZVxuICAgICAgLy8gZGl2LnVwZGF0ZS1wcmV2aWV3IGNyZWF0ZWQgYWZ0ZXIgY29uc3RydWN0b3Igc3QgVXBkYXRlUHJldmlldyBjYW5ub3RcbiAgICAgIC8vIGJlIGluc3RhbmNlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgIGlmICghdGhpcy5wcmV2aWV3KSByZXR1cm5cbiAgICAgIGlmICghdGhpcy51cGRhdGVQcmV2aWV3KSB7XG4gICAgICAgIHRoaXMudXBkYXRlUHJldmlldyA9IG5ldyBVcGRhdGVQcmV2aWV3KHRoaXMucHJldmlldylcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRvbUZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgICBmb3IgKGNvbnN0IGVsZW0gb2YgQXJyYXkuZnJvbShkb21Eb2N1bWVudC5ib2R5LmNoaWxkTm9kZXMpKSB7XG4gICAgICAgIGRvbUZyYWdtZW50LmFwcGVuZENoaWxkKGVsZW0pXG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZVByZXZpZXcudXBkYXRlKHRoaXMuZWxlbWVudCwgZG9tRnJhZ21lbnQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgICBjb25zdCBkb2MgPSB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50XG4gICAgICBpZiAoZG9jICYmIGRvbURvY3VtZW50LmhlYWQuaGFzQ2hpbGROb2Rlcykge1xuICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jLmhlYWQucXVlcnlTZWxlY3Rvcignb3JpZ2luYWwtZWxlbWVudHMnKVxuICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgIGNvbnRhaW5lciA9IGRvYy5jcmVhdGVFbGVtZW50KCdvcmlnaW5hbC1lbGVtZW50cycpXG4gICAgICAgICAgZG9jLmhlYWQuYXBwZW5kQ2hpbGQoY29udGFpbmVyKVxuICAgICAgICB9XG4gICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBmb3IgKGNvbnN0IGhlYWRFbGVtZW50IG9mIEFycmF5LmZyb20oZG9tRG9jdW1lbnQuaGVhZC5jaGlsZE5vZGVzKSkge1xuICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWFkRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLW1hcmtkb3duJylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yIGFzIEVycm9yKVxuICAgIH1cbiAgfVxuXG4gIGdldFRpdGxlKCkge1xuICAgIGNvbnN0IHAgPSB0aGlzLmdldFBhdGgoKVxuICAgIGlmIChwICYmIHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIGAke3BhdGguYmFzZW5hbWUocCl9IFByZXZpZXdgXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgcmV0dXJuIGAke3RoaXMuZWRpdG9yLmdldFRpdGxlKCl9IFByZXZpZXdgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnTWFya2Rvd24gUHJldmlldydcbiAgICB9XG4gIH1cblxuICBnZXRJY29uTmFtZSgpIHtcbiAgICByZXR1cm4gJ21hcmtkb3duJ1xuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIGlmICh0aGlzLmZpbGUpIHtcbiAgICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vJHt0aGlzLmdldFBhdGgoKX1gXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vZWRpdG9yLyR7dGhpcy5lZGl0b3JJZH1gXG4gICAgfVxuICB9XG5cbiAgZ2V0UGF0aCgpIHtcbiAgICBpZiAodGhpcy5maWxlKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWxlLmdldFBhdGgoKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRQYXRoKClcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgZ2V0R3JhbW1hcigpOiBHcmFtbWFyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IgJiYgdGhpcy5lZGl0b3IuZ2V0R3JhbW1hcigpXG4gIH1cblxuICBzaG93RXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICBpZiAoIXRoaXMucHJldmlldykgcmV0dXJuXG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihcbiAgICAgICAgJ0Vycm9yIHJlcG9ydGVkIG9uIGEgZGVzdHJveWVkIE1hcmtkb3duIFByZXZpZXcgUGx1cyB2aWV3JyxcbiAgICAgICAge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgICBkZXRhaWw6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIH0sXG4gICAgICApXG4gICAgfVxuICAgIGNvbnN0IGVycm9yRGl2ID0gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGVycm9yRGl2LmlubmVySFRNTCA9IGA8aDI+UHJldmlld2luZyBNYXJrZG93biBGYWlsZWQ8L2gyPjxoMz4ke1xuICAgICAgZXJyb3IubWVzc2FnZVxuICAgIH08L2gzPmBcbiAgICB0aGlzLnByZXZpZXcuYXBwZW5kQ2hpbGQoZXJyb3JEaXYpXG4gIH1cblxuICBzaG93TG9hZGluZygpIHtcbiAgICBpZiAoIXRoaXMucHJldmlldykgcmV0dXJuXG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZVxuICAgIGNvbnN0IHNwaW5uZXIgPSB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgc3Bpbm5lci5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1zcGlubmVyJylcbiAgICBzcGlubmVyLmlubmVyVGV4dCA9ICdMb2FkaW5nIE1hcmtkb3duXFx1MjAyNidcbiAgICB0aGlzLnByZXZpZXcuYXBwZW5kQ2hpbGQoc3Bpbm5lcilcbiAgfVxuXG4gIGNvcHlUb0NsaXBib2FyZCgpIHtcbiAgICBpZiAodGhpcy5sb2FkaW5nIHx8ICF0aGlzLnByZXZpZXcpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKVxuICAgIGNvbnN0IHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gc2VsZWN0aW9uLmJhc2VOb2RlIGFzIEhUTUxFbGVtZW50XG5cbiAgICAvLyBVc2UgZGVmYXVsdCBjb3B5IGV2ZW50IGhhbmRsZXIgaWYgdGhlcmUgaXMgc2VsZWN0ZWQgdGV4dCBpbnNpZGUgdGhpcyB2aWV3XG4gICAgaWYgKFxuICAgICAgc2VsZWN0ZWRUZXh0ICYmXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c3RyaWN0LXR5cGUtcHJlZGljYXRlcyAvL1RPRE86IGNvbXBsYWluIG9uIFRTXG4gICAgICBzZWxlY3RlZE5vZGUgIT0gbnVsbCAmJlxuICAgICAgKHRoaXMucHJldmlldyA9PT0gc2VsZWN0ZWROb2RlIHx8IHRoaXMucHJldmlldy5jb250YWlucyhzZWxlY3RlZE5vZGUpKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaGFuZGxlUHJvbWlzZShcbiAgICAgIHRoaXMuZ2V0SFRNTCgpLnRoZW4oZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShodG1sKVxuICAgICAgfSksXG4gICAgKVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGdldFNhdmVEaWFsb2dPcHRpb25zKCkge1xuICAgIGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgaWYgKGRlZmF1bHRQYXRoKSB7XG4gICAgICBkZWZhdWx0UGF0aCArPSAnLmh0bWwnXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgIGRlZmF1bHRQYXRoID0gJ3VudGl0bGVkLm1kLmh0bWwnXG4gICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgZGVmYXVsdFBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIGRlZmF1bHRQYXRoKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBkZWZhdWx0UGF0aCB9XG4gIH1cblxuICBzYXZlQXMoaHRtbEZpbGVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoaHRtbEZpbGVQYXRoID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIGlmICh0aGlzLmxvYWRpbmcpIHJldHVyblxuXG4gICAgY29uc3QgdGl0bGUgPSBwYXRoLnBhcnNlKGh0bWxGaWxlUGF0aCkubmFtZVxuXG4gICAgaGFuZGxlUHJvbWlzZShcbiAgICAgIHRoaXMuZ2V0SFRNTCgpLnRoZW4oYXN5bmMgKGh0bWxCb2R5KSA9PiB7XG4gICAgICAgIGNvbnN0IGh0bWwgPSB1dGlsLm1rSHRtbChcbiAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICBodG1sQm9keSxcbiAgICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICAgIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyksXG4gICAgICAgIClcblxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGh0bWxGaWxlUGF0aCwgaHRtbClcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oaHRtbEZpbGVQYXRoKVxuICAgICAgfSksXG4gICAgKVxuICB9XG5cbiAgLy9cbiAgLy8gU2V0IHRoZSBhc3NvY2lhdGVkIGVkaXRvcnMgY3Vyc29yIGJ1ZmZlciBwb3NpdGlvbiB0byB0aGUgbGluZSByZXByZXNlbnRpbmdcbiAgLy8gdGhlIHNvdXJjZSBtYXJrZG93biBvZiBhIHRhcmdldCBlbGVtZW50LlxuICAvL1xuICAvLyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAvLyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRhcmdldCBlbGVtZW50IGNvbnRhaW5lZCB3aXRoaW4gdGhlIGFzc29pY2F0ZWRcbiAgLy8gICBgbWFya2Rvd24tcHJldmlldy1wbHVzLXZpZXdgIGNvbnRhaW5lci4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG8gaWRlbnRpZnkgdGhlXG4gIC8vICAgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YCBhbmQgc2V0IHRoZSBjdXJzb3IgdG8gdGhhdCBsaW5lLlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGxpbmUgb2YgYHRleHRgIHRoYXQgcmVwcmVzZW50cyBgZWxlbWVudGAuIElmIG5vXG4gIC8vICAgbGluZSBpcyBpZGVudGlmaWVkIGBudWxsYCBpcyByZXR1cm5lZC5cbiAgLy9cbiAgc3luY1NvdXJjZSh0ZXh0OiBzdHJpbmcsIGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgcGF0aFRvRWxlbWVudCA9IHV0aWwuZ2V0UGF0aFRvRWxlbWVudChlbGVtZW50KVxuICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKSAvLyByZW1vdmUgbWFya2Rvd24tcHJldmlldy1wbHVzLXZpZXdcbiAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KCkgLy8gcmVtb3ZlIGRpdi51cGRhdGUtcHJldmlld1xuICAgIGlmICghcGF0aFRvRWxlbWVudC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgY29uc3QgdG9rZW5zID0gbWFya2Rvd25JdC5nZXRUb2tlbnModGV4dCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICBsZXQgZmluYWxUb2tlbiA9IG51bGxcbiAgICBsZXQgbGV2ZWwgPSAwXG5cbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgaWYgKHRva2VuLmxldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5oaWRkZW4pIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi50YWcgPT09IHBhdGhUb0VsZW1lbnRbMF0udGFnICYmIHRva2VuLmxldmVsID09PSBsZXZlbCkge1xuICAgICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gMSkge1xuICAgICAgICAgIGlmIChwYXRoVG9FbGVtZW50WzBdLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c3RyaWN0LXR5cGUtcHJlZGljYXRlcyAvLyBUT0RPOiBjb21wbGFpbiBvbiBEVFxuICAgICAgICAgICAgaWYgKHRva2VuLm1hcCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGZpbmFsVG9rZW4gPSB0b2tlblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpXG4gICAgICAgICAgICBsZXZlbCsrXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnRbMF0uaW5kZXgtLVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0b2tlbi5uZXN0aW5nID09PSAwICYmXG4gICAgICAgICAgWydtYXRoJywgJ2NvZGUnLCAnaHInXS5pbmNsdWRlcyh0b2tlbi50YWcpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChwYXRoVG9FbGVtZW50WzBdLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICBmaW5hbFRva2VuID0gdG9rZW5cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnRbMF0uaW5kZXgtLVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHBhdGhUb0VsZW1lbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpbmFsVG9rZW4gIT09IG51bGwgJiYgdGhpcy5lZGl0b3IpIHtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih0aGlzLmVkaXRvciwge1xuICAgICAgICBpbml0aWFsTGluZTogZmluYWxUb2tlbi5tYXBbMF0sXG4gICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgICAgfSlcbiAgICAgIHJldHVybiBmaW5hbFRva2VuLm1hcFswXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFNjcm9sbCB0aGUgYXNzb2NpYXRlZCBwcmV2aWV3IHRvIHRoZSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IGxpbmUgb2ZcbiAgLy8gb2YgdGhlIHNvdXJjZSBtYXJrZG93bi5cbiAgLy9cbiAgLy8gQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgLy8gQHBhcmFtIHtudW1iZXJ9IGxpbmUgVGFyZ2V0IGxpbmUgb2YgYHRleHRgLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0b1xuICAvLyAgIGlkZW50aWZ5IHRoZSBlbG1lbnQgb2YgdGhlIGFzc29jaWF0ZWQgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0aGF0IHJlcHJlc2VudHNcbiAgLy8gICBgbGluZWAgYW5kIHNjcm9sbCB0aGUgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0byB0aGF0IGVsZW1lbnQuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgZWxlbWVudCB0aGF0IHJlcHJlc2VudHMgYGxpbmVgLiBJZiBubyBlbGVtZW50IGlzXG4gIC8vICAgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gIC8vXG4gIHN5bmNQcmV2aWV3KHRleHQ6IHN0cmluZywgbGluZTogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLnByZXZpZXcpIHJldHVybiB1bmRlZmluZWRcbiAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGNvbnN0IHBhdGhUb1Rva2VuID0gdXRpbC5nZXRQYXRoVG9Ub2tlbih0b2tlbnMsIGxpbmUpXG5cbiAgICBsZXQgZWxlbWVudCA9IHRoaXMucHJldmlld1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgcGF0aFRvVG9rZW4pIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZUVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGVsZW1lbnRcbiAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoYDpzY29wZSA+ICR7dG9rZW4udGFnfWApXG4gICAgICAgIC5pdGVtKHRva2VuLmluZGV4KSBhcyBIVE1MRWxlbWVudFxuICAgICAgaWYgKGNhbmRpZGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudCA9IGNhbmRpZGF0ZUVsZW1lbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd1cGRhdGUtcHJldmlldycpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfSAvLyBEbyBub3QganVtcCB0byB0aGUgdG9wIG9mIHRoZSBwcmV2aWV3IGZvciBiYWQgc3luY3NcblxuICAgIGlmICghZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JykpIHtcbiAgICAgIGVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcoKVxuICAgIH1cbiAgICBjb25zdCBtYXhTY3JvbGxUb3AgPVxuICAgICAgdGhpcy5yb290RWxlbWVudC5zY3JvbGxIZWlnaHQgLSB0aGlzLnJvb3RFbGVtZW50LmNsaWVudEhlaWdodFxuICAgIGlmICghKHRoaXMucm9vdEVsZW1lbnQuc2Nyb2xsVG9wID49IG1heFNjcm9sbFRvcCkpIHtcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuc2Nyb2xsVG9wIC09IHRoaXMucm9vdEVsZW1lbnQuY2xpZW50SGVpZ2h0IC8gNFxuICAgIH1cblxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZmxhc2gnKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gZWxlbWVudCEuY2xhc3NMaXN0LnJlbW92ZSgnZmxhc2gnKSwgMTAwMClcblxuICAgIHJldHVybiBlbGVtZW50XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVN0eWxlcygpIHtcbiAgICBjb25zdCBkb2MgPSB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50XG4gICAgaWYgKCFkb2MpIHJldHVyblxuICAgIGxldCBlbGVtID0gZG9jLmhlYWQucXVlcnlTZWxlY3RvcignYXRvbS1zdHlsZXMnKVxuICAgIGlmICghZWxlbSkge1xuICAgICAgZWxlbSA9IGRvYy5jcmVhdGVFbGVtZW50KCdhdG9tLXN0eWxlcycpXG4gICAgICBkb2MuaGVhZC5hcHBlbmRDaGlsZChlbGVtKVxuICAgIH1cbiAgICBlbGVtLmlubmVySFRNTCA9ICcnXG4gICAgZm9yIChjb25zdCBzZSBvZiBhdG9tLnN0eWxlcy5nZXRTdHlsZUVsZW1lbnRzKCkpIHtcbiAgICAgIGVsZW0uYXBwZW5kQ2hpbGQoc2UuY2xvbmVOb2RlKHRydWUpKVxuICAgIH1cbiAgfVxufVxuIl19