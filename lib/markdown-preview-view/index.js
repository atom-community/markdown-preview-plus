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
            const domFragment = await renderer.toDOMFragment(text, this.getPath(), this.getGrammar(), this.renderLaTeX);
            if (this.destroyed)
                return;
            this.loading = false;
            this.loaded = true;
            if (!this.updatePreview && this.preview) {
                this.updatePreview = new update_preview_1.UpdatePreview(this.preview);
            }
            this.updatePreview &&
                domFragment &&
                this.updatePreview.update(this.element, domFragment, this.renderLaTeX);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQVFhO0FBQ2IsNEJBQTRCO0FBQzVCLHlCQUF5QjtBQUV6Qix3Q0FBd0M7QUFDeEMsc0RBQWlEO0FBQ2pELG9EQUFvRDtBQUNwRCxzREFBc0Q7QUFDdEQsa0NBQXVDO0FBQ3ZDLCtCQUE4QjtBQWtCOUI7SUEyQkUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWEsRUFBRSxlQUFlLEdBQUcsS0FBSztRQTFCOUQsWUFBTyxHQUFZLElBQUksQ0FBQTtRQUdmLGtCQUFhLEdBQWtCLElBQUksT0FBTyxDQUN4RCxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUN0QyxDQUFBO1FBSU8sWUFBTyxHQUdWLElBQUksY0FBTyxFQUFFLENBQUE7UUFFVixnQkFBVyxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUM1QyxxREFBcUQsQ0FDdEQsQ0FBQTtRQUNPLGdCQUFXLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO1FBQ3ZDLFdBQU0sR0FBRyxJQUFJLENBQUE7UUFNYixjQUFTLEdBQUcsS0FBSyxDQUFBO1FBR3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQVEsQ0FBQTtRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUE7UUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLHFCQUFxQixDQUFD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QUFDLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDdEMsQ0FBQztJQUNILENBQUM7Q0FDRjtBQXJvQkQsa0RBcW9CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5pbXBvcnQge1xuICBDb21tYW5kRXZlbnQsXG4gIEVtaXR0ZXIsXG4gIERpc3Bvc2FibGUsXG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIEZpbGUsXG4gIFRleHRFZGl0b3IsXG4gIEdyYW1tYXIsXG59IGZyb20gJ2F0b20nXG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcycpXG5cbmltcG9ydCByZW5kZXJlciA9IHJlcXVpcmUoJy4uL3JlbmRlcmVyJylcbmltcG9ydCB7IFVwZGF0ZVByZXZpZXcgfSBmcm9tICcuLi91cGRhdGUtcHJldmlldydcbmltcG9ydCBtYXJrZG93bkl0ID0gcmVxdWlyZSgnLi4vbWFya2Rvd24taXQtaGVscGVyJylcbmltcG9ydCBpbWFnZVdhdGNoZXIgPSByZXF1aXJlKCcuLi9pbWFnZS13YXRjaC1oZWxwZXInKVxuaW1wb3J0IHsgaGFuZGxlUHJvbWlzZSB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGludGVyZmFjZSBNUFZQYXJhbXNFZGl0b3Ige1xuICBlZGl0b3JJZDogbnVtYmVyXG4gIGZpbGVQYXRoPzogdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTVBWUGFyYW1zUGF0aCB7XG4gIGVkaXRvcklkPzogdW5kZWZpbmVkXG4gIGZpbGVQYXRoOiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgTVBWUGFyYW1zID0gTVBWUGFyYW1zRWRpdG9yIHwgTVBWUGFyYW1zUGF0aFxuXG5leHBvcnQgdHlwZSBNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudCA9IEhUTUxJRnJhbWVFbGVtZW50ICYge1xuICBnZXRNb2RlbCgpOiBNYXJrZG93blByZXZpZXdWaWV3XG59XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3IHtcbiAgcHJpdmF0ZSBsb2FkaW5nOiBib29sZWFuID0gdHJ1ZVxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdW5pbml0aWFsaXplZFxuICBwcml2YXRlIHJlc29sdmU6ICgpID0+IHZvaWRcbiAgcHVibGljIHJlYWRvbmx5IHJlbmRlclByb21pc2U6IFByb21pc2U8dm9pZD4gPSBuZXcgUHJvbWlzZTx2b2lkPihcbiAgICAocmVzb2x2ZSkgPT4gKHRoaXMucmVzb2x2ZSA9IHJlc29sdmUpLFxuICApXG4gIHB1YmxpYyByZWFkb25seSBlbGVtZW50OiBNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudFxuICBwcml2YXRlIHJvb3RFbGVtZW50PzogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSBwcmV2aWV3PzogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSBlbWl0dGVyOiBFbWl0dGVyPHtcbiAgICAnZGlkLWNoYW5nZS10aXRsZSc6IHVuZGVmaW5lZFxuICAgICdkaWQtY2hhbmdlLW1hcmtkb3duJzogdW5kZWZpbmVkXG4gIH0+ID0gbmV3IEVtaXR0ZXIoKVxuICBwcml2YXRlIHVwZGF0ZVByZXZpZXc/OiBVcGRhdGVQcmV2aWV3XG4gIHByaXZhdGUgcmVuZGVyTGFUZVg6IGJvb2xlYW4gPSBhdG9tLmNvbmZpZy5nZXQoXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCcsXG4gIClcbiAgcHJpdmF0ZSBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgcHJpdmF0ZSBsb2FkZWQgPSB0cnVlIC8vIERvIG5vdCBzaG93IHRoZSBsb2FkaW5nIHNwaW5ub3Igb24gaW5pdGlhbCBsb2FkXG4gIHByaXZhdGUgZWRpdG9ySWQ/OiBudW1iZXJcbiAgcHJpdmF0ZSBmaWxlUGF0aD86IHN0cmluZ1xuICBwcml2YXRlIGZpbGU/OiBGaWxlXG4gIHByaXZhdGUgZWRpdG9yPzogVGV4dEVkaXRvclxuICBwcml2YXRlIGxhc3RUYXJnZXQ/OiBIVE1MRWxlbWVudFxuICBwcml2YXRlIGRlc3Ryb3llZCA9IGZhbHNlXG5cbiAgY29uc3RydWN0b3IoeyBlZGl0b3JJZCwgZmlsZVBhdGggfTogTVBWUGFyYW1zLCBkZXNlcmlhbGl6YXRpb24gPSBmYWxzZSkge1xuICAgIHRoaXMuZWRpdG9ySWQgPSBlZGl0b3JJZFxuICAgIHRoaXMuZmlsZVBhdGggPSBmaWxlUGF0aFxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpIGFzIGFueVxuICAgIHRoaXMuZWxlbWVudC5nZXRNb2RlbCA9ICgpID0+IHRoaXNcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tcHJldmlldy1wbHVzJywgJ25hdGl2ZS1rZXktYmluZGluZ3MnKVxuICAgIHRoaXMuZWxlbWVudC5zcmMgPSAnYWJvdXQ6YmxhbmsnXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJzEwMCUnXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxMDAlJ1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB9KSxcbiAgICAgIGF0b20uc3R5bGVzLm9uRGlkUmVtb3ZlU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgfSksXG4gICAgICBhdG9tLnN0eWxlcy5vbkRpZFVwZGF0ZVN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgIH0pLFxuICAgIClcbiAgICBjb25zdCBvbmxvYWQgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgaWYgKHRoaXMudXBkYXRlUHJldmlldykgdGhpcy51cGRhdGVQcmV2aWV3ID0gdW5kZWZpbmVkXG4gICAgICBjb25zdCBkb2MgPSB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50XG4gICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB0aGlzLnJvb3RFbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ21hcmtkb3duLXByZXZpZXctcGx1cy12aWV3JylcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgICB0aGlzLnJvb3RFbGVtZW50LnRhYkluZGV4ID0gLTFcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScpKSB7XG4gICAgICAgIHRoaXMucm9vdEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnLCAnJylcbiAgICAgIH1cbiAgICAgIHRoaXMucHJldmlldyA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgdGhpcy5wcmV2aWV3LmNsYXNzTGlzdC5hZGQoJ3VwZGF0ZS1wcmV2aWV3JylcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5wcmV2aWV3KVxuICAgICAgZG9jLmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5yb290RWxlbWVudClcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQub25jb250ZXh0bWVudSA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMubGFzdFRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50XG4gICAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgICBpZiAocGFuZSkgcGFuZS5hY3RpdmF0ZSgpXG4gICAgICAgIGF0b20uY29udGV4dE1lbnUuc2hvd0ZvckV2ZW50KFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oe30sIGUsIHsgdGFyZ2V0OiB0aGlzLmVsZW1lbnQgfSksXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpZEF0dGFjaCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICAgICAgaWYgKHRoaXMuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCAmJiAhdGhpcy5lZGl0b3IpIHtcbiAgICAgICAgICB0aGlzLnJlc29sdmVFZGl0b3IodGhpcy5lZGl0b3JJZClcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmZpbGVQYXRoICE9PSB1bmRlZmluZWQgJiYgIXRoaXMuZmlsZSkge1xuICAgICAgICAgIHRoaXMuc3Vic2NyaWJlVG9GaWxlUGF0aCh0aGlzLmZpbGVQYXRoKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmVkaXRvciB8fCB0aGlzLmZpbGUpIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgfVxuICAgICAgaWYgKGRlc2VyaWFsaXphdGlvbiAmJiB0aGlzLmVkaXRvcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gbmVlZCB0byBkZWZlciBvbiBkZXNlcmlhbGl6YXRpb24gc2luY2VcbiAgICAgICAgLy8gZWRpdG9yIG1pZ2h0IG5vdCBiZSBkZXNlcmlhbGl6ZWQgYXQgdGhpcyBwb2ludFxuICAgICAgICBzZXRJbW1lZGlhdGUoZGlkQXR0YWNoKVxuICAgICAgICBkZXNlcmlhbGl6YXRpb24gPSBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlkQXR0YWNoKClcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbmxvYWQpXG4gIH1cblxuICB0ZXh0KCkge1xuICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuICcnXG4gICAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnQudGV4dENvbnRlbnQgfHwgJydcbiAgfVxuXG4gIGZpbmQod2hhdDogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm4gbnVsbFxuICAgIHJldHVybiB0aGlzLnJvb3RFbGVtZW50LnF1ZXJ5U2VsZWN0b3Iod2hhdClcbiAgfVxuXG4gIGZpbmRBbGwod2hhdDogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm4gW11cbiAgICByZXR1cm4gdGhpcy5yb290RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHdoYXQpXG4gIH1cblxuICBnZXRSb290KCkge1xuICAgIHJldHVybiB0aGlzLnJvb3RFbGVtZW50XG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ21hcmtkb3duLXByZXZpZXctcGx1cy9NYXJrZG93blByZXZpZXdWaWV3JyxcbiAgICAgIGZpbGVQYXRoOiB0aGlzLmdldFBhdGgoKSB8fCB0aGlzLmZpbGVQYXRoLFxuICAgICAgZWRpdG9ySWQ6IHRoaXMuZWRpdG9ySWQsXG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZVxuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIHBhdGggJiYgaW1hZ2VXYXRjaGVyLnJlbW92ZUZpbGUocGF0aClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTWFya2Rvd24oY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLW1hcmtkb3duJywgY2FsbGJhY2spXG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICB9XG5cbiAgcmVzb2x2ZUVkaXRvcihlZGl0b3JJZDogbnVtYmVyKSB7XG4gICAgdGhpcy5lZGl0b3IgPSB1dGlsLmVkaXRvckZvcklkKGVkaXRvcklkKVxuXG4gICAgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBlZGl0b3IgdGhpcyBwcmV2aWV3IHdhcyBjcmVhdGVkIGZvciBoYXMgYmVlbiBjbG9zZWQgc28gY2xvc2VcbiAgICAgIC8vIHRoaXMgcHJldmlldyBzaW5jZSBhIHByZXZpZXcgY2Fubm90IGJlIHJlbmRlcmVkIHdpdGhvdXQgYW4gZWRpdG9yXG4gICAgICB1dGlsLmRlc3Ryb3kodGhpcylcbiAgICB9XG4gIH1cblxuICBoYW5kbGVFdmVudHMoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkQWRkR3JhbW1hcigoKSA9PlxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkVXBkYXRlR3JhbW1hcihcbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PlxuICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQgJiYgdGhpcy5yb290RWxlbWVudC5zY3JvbGxCeSh7IHRvcDogLTEwIH0pLFxuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PlxuICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQgJiYgdGhpcy5yb290RWxlbWVudC5zY3JvbGxCeSh7IHRvcDogMTAgfSksXG4gICAgICAgICdjb3JlOmNvcHknOiAoZXZlbnQ6IENvbW1hbmRFdmVudCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmNvcHlUb0NsaXBib2FyZCgpKSBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm5cbiAgICAgICAgICBjb25zdCB6b29tTGV2ZWwgPSBwYXJzZUZsb2F0KHRoaXMucm9vdEVsZW1lbnQuc3R5bGUuem9vbSB8fCAnMScpXG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudC5zdHlsZS56b29tID0gKHpvb21MZXZlbCArIDAuMSkudG9TdHJpbmcoKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0JzogKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuXG4gICAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLnJvb3RFbGVtZW50LnN0eWxlLnpvb20gfHwgJzEnKVxuICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQuc3R5bGUuem9vbSA9ICh6b29tTGV2ZWwgLSAwLjEpLnRvU3RyaW5nKClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpyZXNldC16b29tJzogKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuXG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudC5zdHlsZS56b29tID0gJzEnXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1zb3VyY2UnOiAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgbGFzdFRhcmdldCA9IHRoaXMubGFzdFRhcmdldFxuICAgICAgICAgIGlmICghbGFzdFRhcmdldCkgcmV0dXJuXG4gICAgICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgICAgIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKChzb3VyY2U/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGhpcy5zeW5jU291cmNlKHNvdXJjZSwgbGFzdFRhcmdldClcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIClcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcblxuICAgIGNvbnN0IGNoYW5nZUhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcblxuICAgICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgICBpZiAocGFuZSAhPT0gdW5kZWZpbmVkICYmIHBhbmUgIT09IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSkge1xuICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbSh0aGlzKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZpbGUpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZShjaGFuZ2VIYW5kbGVyKSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRTdG9wQ2hhbmdpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5lZGl0b3Iub25EaWRDaGFuZ2VQYXRoKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICAgIH0pLFxuICAgICAgICB0aGlzLmVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAgIHV0aWwuZGVzdHJveSh0aGlzKVxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRTYXZlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFJlbG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQoYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuZWRpdG9yKSwge1xuICAgICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1wcmV2aWV3JzogYXN5bmMgKF9ldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpXG4gICAgICAgICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuZWRpdG9yKSByZXR1cm5cbiAgICAgICAgICAgIHRoaXMuc3luY1ByZXZpZXcoc291cmNlLCB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdylcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICB9XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmJyZWFrT25TaW5nbGVOZXdsaW5lJyxcbiAgICAgICAgY2hhbmdlSGFuZGxlcixcbiAgICAgICksXG4gICAgKVxuXG4gICAgLy8gVG9nZ2xlIExhVGVYIHJlbmRlcmluZyBpZiBmb2N1cyBpcyBvbiBwcmV2aWV3IHBhbmUgb3IgYXNzb2NpYXRlZCBlZGl0b3IuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6ICgpID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpID09PSB0aGlzIHx8XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkgPT09IHRoaXMuZWRpdG9yXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckxhVGVYID0gIXRoaXMucmVuZGVyTGFUZVhcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnLFxuICAgICAgICAodXNlR2l0SHViU3R5bGUpID0+IHtcbiAgICAgICAgICBpZiAodXNlR2l0SHViU3R5bGUpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQgJiZcbiAgICAgICAgICAgICAgdGhpcy5yb290RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScsICcnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50ICYmXG4gICAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgKVxuICB9XG5cbiAgYXN5bmMgcmVuZGVyTWFya2Rvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgdGhpcy5zaG93TG9hZGluZygpXG4gICAgfVxuICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgIGlmIChzb3VyY2UpIGF3YWl0IHRoaXMucmVuZGVyTWFya2Rvd25UZXh0KHNvdXJjZSlcblxuICAgIHRoaXMucmVzb2x2ZSgpXG4gIH1cblxuICBhc3luYyByZWZyZXNoSW1hZ2VzKG9sZHNyYzogc3RyaW5nKSB7XG4gICAgY29uc3QgaW1ncyA9IHRoaXMuZmluZEFsbCgnaW1nW3NyY10nKSBhcyBOb2RlTGlzdE9mPEhUTUxJbWFnZUVsZW1lbnQ+XG4gICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICBmb3IgKGNvbnN0IGltZyBvZiBBcnJheS5mcm9tKGltZ3MpKSB7XG4gICAgICBsZXQgb3ZzOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgICAgIGxldCBvdjogbnVtYmVyIHwgdW5kZWZpbmVkXG4gICAgICBsZXQgc3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJykhXG4gICAgICBjb25zdCBtYXRjaCA9IHNyYy5tYXRjaCgvXiguKilcXD92PShcXGQrKSQvKVxuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIDtbLCBzcmMsIG92c10gPSBtYXRjaFxuICAgICAgfVxuICAgICAgaWYgKHNyYyA9PT0gb2xkc3JjKSB7XG4gICAgICAgIGlmIChvdnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG92ID0gcGFyc2VJbnQob3ZzLCAxMClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2ID0gYXdhaXQgaW1hZ2VXYXRjaGVyLmdldFZlcnNpb24oc3JjLCB0aGlzLmdldFBhdGgoKSlcbiAgICAgICAgaWYgKHYgIT09IG92KSB7XG4gICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKChpbWcuc3JjID0gYCR7c3JjfT92PSR7dn1gKSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKGltZy5zcmMgPSBgJHtzcmN9YCkpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBhc3luYyBnZXRNYXJrZG93blNvdXJjZSgpIHtcbiAgICBpZiAodGhpcy5maWxlICYmIHRoaXMuZmlsZS5nZXRQYXRoKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGUucmVhZCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFRleHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0SFRNTCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZ2V0IE1hcmtkb3duIHNvdXJjZVwiKVxuICAgIHJldHVybiByZW5kZXJlci50b0hUTUwoXG4gICAgICBzb3VyY2UsXG4gICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgIGZhbHNlLFxuICAgIClcbiAgfVxuXG4gIGFzeW5jIHJlbmRlck1hcmtkb3duVGV4dCh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZG9tRnJhZ21lbnQgPSBhd2FpdCByZW5kZXJlci50b0RPTUZyYWdtZW50KFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgICAgdGhpcy5nZXRHcmFtbWFyKCksXG4gICAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICApXG4gICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2VcbiAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZVxuICAgICAgLy8gZGl2LnVwZGF0ZS1wcmV2aWV3IGNyZWF0ZWQgYWZ0ZXIgY29uc3RydWN0b3Igc3QgVXBkYXRlUHJldmlldyBjYW5ub3RcbiAgICAgIC8vIGJlIGluc3RhbmNlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgIGlmICghdGhpcy51cGRhdGVQcmV2aWV3ICYmIHRoaXMucHJldmlldykge1xuICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcgPSBuZXcgVXBkYXRlUHJldmlldyh0aGlzLnByZXZpZXcpXG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZVByZXZpZXcgJiZcbiAgICAgICAgZG9tRnJhZ21lbnQgJiZcbiAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3LnVwZGF0ZShcbiAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgZG9tRnJhZ21lbnQgYXMgRWxlbWVudCxcbiAgICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICApXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1tYXJrZG93bicpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBhcyBFcnJvcilcbiAgICB9XG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICBjb25zdCBwID0gdGhpcy5nZXRQYXRoKClcbiAgICBpZiAocCAmJiB0aGlzLmZpbGUpIHtcbiAgICAgIHJldHVybiBgJHtwYXRoLmJhc2VuYW1lKHApfSBQcmV2aWV3YFxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmVkaXRvci5nZXRUaXRsZSgpfSBQcmV2aWV3YFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ01hcmtkb3duIFByZXZpZXcnXG4gICAgfVxuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuICdtYXJrZG93bidcbiAgfVxuXG4gIGdldFVSSSgpIHtcbiAgICBpZiAodGhpcy5maWxlKSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovLyR7dGhpcy5nZXRQYXRoKCl9YFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL2VkaXRvci8ke3RoaXMuZWRpdG9ySWR9YFxuICAgIH1cbiAgfVxuXG4gIGdldFBhdGgoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRQYXRoKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0UGF0aCgpXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGdldEdyYW1tYXIoKTogR3JhbW1hciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yICYmIHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKVxuICB9XG5cbiAgc2hvd0Vycm9yKGVycm9yOiBFcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgaWYgKCF0aGlzLnByZXZpZXcpIHJldHVyblxuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IoXG4gICAgICAgICdFcnJvciByZXBvcnRlZCBvbiBhIGRlc3Ryb3llZCBNYXJrZG93biBQcmV2aWV3IFBsdXMgdmlldycsXG4gICAgICAgIHtcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICB9LFxuICAgICAgKVxuICAgIH1cbiAgICBjb25zdCBlcnJvckRpdiA9IHRoaXMuZWxlbWVudC5jb250ZW50RG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBlcnJvckRpdi5pbm5lckhUTUwgPSBgPGgyPlByZXZpZXdpbmcgTWFya2Rvd24gRmFpbGVkPC9oMj48aDM+JHtcbiAgICAgIGVycm9yLm1lc3NhZ2VcbiAgICB9PC9oMz5gXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKGVycm9yRGl2KVxuICB9XG5cbiAgc2hvd0xvYWRpbmcoKSB7XG4gICAgaWYgKCF0aGlzLnByZXZpZXcpIHJldHVyblxuICAgIHRoaXMubG9hZGluZyA9IHRydWVcbiAgICBjb25zdCBzcGlubmVyID0gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNwaW5uZXIuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tc3Bpbm5lcicpXG4gICAgc3Bpbm5lci5pbm5lclRleHQgPSAnTG9hZGluZyBNYXJrZG93blxcdTIwMjYnXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gIH1cblxuICBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZyB8fCAhdGhpcy5wcmV2aWV3KSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKVxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGlvbi5iYXNlTm9kZSBhcyBIVE1MRWxlbWVudFxuXG4gICAgLy8gVXNlIGRlZmF1bHQgY29weSBldmVudCBoYW5kbGVyIGlmIHRoZXJlIGlzIHNlbGVjdGVkIHRleHQgaW5zaWRlIHRoaXMgdmlld1xuICAgIGlmIChcbiAgICAgIHNlbGVjdGVkVGV4dCAmJlxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy9UT0RPOiBjb21wbGFpbiBvbiBUU1xuICAgICAgc2VsZWN0ZWROb2RlICE9IG51bGwgJiZcbiAgICAgICh0aGlzLnByZXZpZXcgPT09IHNlbGVjdGVkTm9kZSB8fCB0aGlzLnByZXZpZXcuY29udGFpbnMoc2VsZWN0ZWROb2RlKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGhhbmRsZVByb21pc2UoXG4gICAgICB0aGlzLmdldEhUTUwoKS50aGVuKGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoaHRtbClcbiAgICAgIH0pLFxuICAgIClcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBnZXRTYXZlRGlhbG9nT3B0aW9ucygpIHtcbiAgICBsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIGlmIChkZWZhdWx0UGF0aCkge1xuICAgICAgZGVmYXVsdFBhdGggKz0gJy5odG1sJ1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICBkZWZhdWx0UGF0aCA9ICd1bnRpdGxlZC5tZC5odG1sJ1xuICAgICAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgICAgIGRlZmF1bHRQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBkZWZhdWx0UGF0aClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgZGVmYXVsdFBhdGggfVxuICB9XG5cbiAgc2F2ZUFzKGh0bWxGaWxlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKGh0bWxGaWxlUGF0aCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICBpZiAodGhpcy5sb2FkaW5nKSByZXR1cm5cblxuICAgIGNvbnN0IHRpdGxlID0gcGF0aC5wYXJzZShodG1sRmlsZVBhdGgpLm5hbWVcblxuICAgIGhhbmRsZVByb21pc2UoXG4gICAgICB0aGlzLmdldEhUTUwoKS50aGVuKGFzeW5jIChodG1sQm9keSkgPT4ge1xuICAgICAgICBjb25zdCBodG1sID0gdXRpbC5ta0h0bWwoXG4gICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgaHRtbEJvZHksXG4gICAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScpLFxuICAgICAgICApXG5cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhodG1sRmlsZVBhdGgsIGh0bWwpXG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGh0bWxGaWxlUGF0aClcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIC8vXG4gIC8vIFNldCB0aGUgYXNzb2NpYXRlZCBlZGl0b3JzIGN1cnNvciBidWZmZXIgcG9zaXRpb24gdG8gdGhlIGxpbmUgcmVwcmVzZW50aW5nXG4gIC8vIHRoZSBzb3VyY2UgbWFya2Rvd24gb2YgYSB0YXJnZXQgZWxlbWVudC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgZWxlbWVudCBjb250YWluZWQgd2l0aGluIHRoZSBhc3NvaWNhdGVkXG4gIC8vICAgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCBjb250YWluZXIuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvIGlkZW50aWZ5IHRoZVxuICAvLyAgIGxpbmUgb2YgYHRleHRgIHRoYXQgcmVwcmVzZW50cyBgZWxlbWVudGAgYW5kIHNldCB0aGUgY3Vyc29yIHRvIHRoYXQgbGluZS5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgLiBJZiBub1xuICAvLyAgIGxpbmUgaXMgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gIC8vXG4gIHN5bmNTb3VyY2UodGV4dDogc3RyaW5nLCBlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IHBhdGhUb0VsZW1lbnQgPSB1dGlsLmdldFBhdGhUb0VsZW1lbnQoZWxlbWVudClcbiAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KCkgLy8gcmVtb3ZlIG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3XG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBkaXYudXBkYXRlLXByZXZpZXdcbiAgICBpZiAoIXBhdGhUb0VsZW1lbnQubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGNvbnN0IHRva2VucyA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zKHRleHQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgbGV0IGZpbmFsVG9rZW4gPSBudWxsXG4gICAgbGV0IGxldmVsID0gMFxuXG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgIGlmICh0b2tlbi5sZXZlbCA8IGxldmVsKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4uaGlkZGVuKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4udGFnID09PSBwYXRoVG9FbGVtZW50WzBdLnRhZyAmJiB0b2tlbi5sZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IDEpIHtcbiAgICAgICAgICBpZiAocGF0aFRvRWxlbWVudFswXS5pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy8gVE9ETzogY29tcGxhaW4gb24gRFRcbiAgICAgICAgICAgIGlmICh0b2tlbi5tYXAgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBmaW5hbFRva2VuID0gdG9rZW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKVxuICAgICAgICAgICAgbGV2ZWwrK1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50WzBdLmluZGV4LS1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdG9rZW4ubmVzdGluZyA9PT0gMCAmJlxuICAgICAgICAgIFsnbWF0aCcsICdjb2RlJywgJ2hyJ10uaW5jbHVkZXModG9rZW4udGFnKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAocGF0aFRvRWxlbWVudFswXS5pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50WzBdLmluZGV4LS1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwYXRoVG9FbGVtZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaW5hbFRva2VuICE9PSBudWxsICYmIHRoaXMuZWRpdG9yKSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZmxvYXRpbmctcHJvbWlzZXNcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4odGhpcy5lZGl0b3IsIHtcbiAgICAgICAgaW5pdGlhbExpbmU6IGZpbmFsVG9rZW4ubWFwWzBdLFxuICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICByZXR1cm4gZmluYWxUb2tlbi5tYXBbMF1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBTY3JvbGwgdGhlIGFzc29jaWF0ZWQgcHJldmlldyB0byB0aGUgZWxlbWVudCByZXByZXNlbnRpbmcgdGhlIHRhcmdldCBsaW5lIG9mXG4gIC8vIG9mIHRoZSBzb3VyY2UgbWFya2Rvd24uXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRhcmdldCBsaW5lIG9mIGB0ZXh0YC4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG9cbiAgLy8gICBpZGVudGlmeSB0aGUgZWxtZW50IG9mIHRoZSBhc3NvY2lhdGVkIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdGhhdCByZXByZXNlbnRzXG4gIC8vICAgYGxpbmVgIGFuZCBzY3JvbGwgdGhlIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdG8gdGhhdCBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGBsaW5lYC4gSWYgbm8gZWxlbWVudCBpc1xuICAvLyAgIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jUHJldmlldyh0ZXh0OiBzdHJpbmcsIGxpbmU6IG51bWJlcikge1xuICAgIGlmICghdGhpcy5wcmV2aWV3KSByZXR1cm4gdW5kZWZpbmVkXG4gICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3QgdG9rZW5zID0gbWFya2Rvd25JdC5nZXRUb2tlbnModGV4dCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICBjb25zdCBwYXRoVG9Ub2tlbiA9IHV0aWwuZ2V0UGF0aFRvVG9rZW4odG9rZW5zLCBsaW5lKVxuXG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLnByZXZpZXdcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHBhdGhUb1Rva2VuKSB7XG4gICAgICBjb25zdCBjYW5kaWRhdGVFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSBlbGVtZW50XG4gICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKGA6c2NvcGUgPiAke3Rva2VuLnRhZ31gKVxuICAgICAgICAuaXRlbSh0b2tlbi5pbmRleCkgYXMgSFRNTEVsZW1lbnRcbiAgICAgIGlmIChjYW5kaWRhdGVFbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQgPSBjYW5kaWRhdGVFbGVtZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygndXBkYXRlLXByZXZpZXcnKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH0gLy8gRG8gbm90IGp1bXAgdG8gdGhlIHRvcCBvZiB0aGUgcHJldmlldyBmb3IgYmFkIHN5bmNzXG5cbiAgICBpZiAoIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd1cGRhdGUtcHJldmlldycpKSB7XG4gICAgICBlbGVtZW50LnNjcm9sbEludG9WaWV3KClcbiAgICB9XG4gICAgY29uc3QgbWF4U2Nyb2xsVG9wID1cbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5yb290RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICBpZiAoISh0aGlzLnJvb3RFbGVtZW50LnNjcm9sbFRvcCA+PSBtYXhTY3JvbGxUb3ApKSB7XG4gICAgICB0aGlzLnJvb3RFbGVtZW50LnNjcm9sbFRvcCAtPSB0aGlzLnJvb3RFbGVtZW50LmNsaWVudEhlaWdodCAvIDRcbiAgICB9XG5cbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ZsYXNoJylcbiAgICBzZXRUaW1lb3V0KCgpID0+IGVsZW1lbnQhLmNsYXNzTGlzdC5yZW1vdmUoJ2ZsYXNoJyksIDEwMDApXG5cbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTdHlsZXMoKSB7XG4gICAgY29uc3QgZG9jID0gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudFxuICAgIGlmICghZG9jKSByZXR1cm5cbiAgICBsZXQgZWxlbSA9IGRvYy5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ2F0b20tc3R5bGVzJylcbiAgICBpZiAoIWVsZW0pIHtcbiAgICAgIGVsZW0gPSBkb2MuY3JlYXRlRWxlbWVudCgnYXRvbS1zdHlsZXMnKVxuICAgICAgZG9jLmhlYWQuYXBwZW5kQ2hpbGQoZWxlbSlcbiAgICB9XG4gICAgZWxlbS5pbm5lckhUTUwgPSAnJ1xuICAgIGZvciAoY29uc3Qgc2Ugb2YgYXRvbS5zdHlsZXMuZ2V0U3R5bGVFbGVtZW50cygpKSB7XG4gICAgICBlbGVtLmFwcGVuZENoaWxkKHNlLmNsb25lTm9kZSh0cnVlKSlcbiAgICB9XG4gIH1cbn1cbiJdfQ==