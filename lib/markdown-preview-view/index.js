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
    constructor({ editor, filePath }) {
        this.loading = true;
        this.renderPromise = new Promise((resolve) => (this.resolve = resolve));
        this.emitter = new atom_1.Emitter();
        this.renderLaTeX = atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
        this.disposables = new atom_1.CompositeDisposable();
        this.loaded = true;
        this.destroyed = false;
        this.editor = editor;
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
        if (filePath !== undefined) {
            this.file = new atom_1.File(filePath);
        }
        this.handleEvents();
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
            if (this.destroyed)
                return;
            if (this.editor || this.file) {
                this.emitter.emit('did-change-title');
                util_1.handlePromise(this.renderMarkdown());
            }
        };
        this.element.addEventListener('load', onload);
    }
    static create(params) {
        if (params.editor) {
            let mppv = MarkdownPreviewView.editorMap.get(params.editor);
            if (!mppv) {
                mppv = new MarkdownPreviewView(params);
                MarkdownPreviewView.editorMap.set(params.editor, mppv);
            }
            return mppv;
        }
        else {
            return new MarkdownPreviewView(params);
        }
    }
    static viewForEditor(editor) {
        return MarkdownPreviewView.editorMap.get(editor);
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
            filePath: this.file && this.file.getPath(),
            editorId: this.editor && this.editor.id,
        };
    }
    destroy() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        if (this.editor)
            MarkdownPreviewView.editorMap.delete(this.editor);
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
        this.disposables.add(atom.config.onDidChange('markdown-preview-plus.useGitHubStyle', ({ newValue }) => {
            if (newValue) {
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
            return `markdown-preview-plus://file/${this.getPath()}`;
        }
        else if (this.editor) {
            return `markdown-preview-plus://editor/${this.editor.id}`;
        }
        else {
            return `markdown-preview-plus://unknown`;
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
            atom.clipboard.write(html.body.innerHTML);
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
        util_1.handlePromise(this.getHTML().then(async (html) => {
            const fullHtml = util.mkHtml(title, html, this.renderLaTeX, atom.config.get('markdown-preview-plus.useGitHubStyle'));
            fs.writeFileSync(htmlFilePath, fullHtml);
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
MarkdownPreviewView.editorMap = new WeakMap();
exports.MarkdownPreviewView = MarkdownPreviewView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQVFhO0FBQ2IsNEJBQTRCO0FBQzVCLHlCQUF5QjtBQUV6Qix3Q0FBd0M7QUFDeEMsc0RBQWlEO0FBQ2pELG9EQUFvRDtBQUNwRCxzREFBc0Q7QUFDdEQsa0NBQXVDO0FBQ3ZDLCtCQUE4QjtBQXdCOUI7SUEwQ0UsWUFBb0IsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFhO1FBekMzQyxZQUFPLEdBQVksSUFBSSxDQUFBO1FBR2Ysa0JBQWEsR0FBa0IsSUFBSSxPQUFPLENBQ3hELENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQ3RDLENBQUE7UUFJTyxZQUFPLEdBR1YsSUFBSSxjQUFPLEVBQUUsQ0FBQTtRQUVWLGdCQUFXLEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQzVDLHFEQUFxRCxDQUN0RCxDQUFBO1FBQ08sZ0JBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDdkMsV0FBTSxHQUFHLElBQUksQ0FBQTtRQUliLGNBQVMsR0FBRyxLQUFLLENBQUE7UUFvQnZCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQVEsQ0FBQTtRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUE7UUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLHFCQUFxQixDQUFDLENBQUE7UUFDMUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFBO1FB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YXRoJylcbmltcG9ydCB7XG4gIENvbW1hbmRFdmVudCxcbiAgRW1pdHRlcixcbiAgRGlzcG9zYWJsZSxcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgRmlsZSxcbiAgVGV4dEVkaXRvcixcbiAgR3JhbW1hcixcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuaW1wb3J0IHJlbmRlcmVyID0gcmVxdWlyZSgnLi4vcmVuZGVyZXInKVxuaW1wb3J0IHsgVXBkYXRlUHJldmlldyB9IGZyb20gJy4uL3VwZGF0ZS1wcmV2aWV3J1xuaW1wb3J0IG1hcmtkb3duSXQgPSByZXF1aXJlKCcuLi9tYXJrZG93bi1pdC1oZWxwZXInKVxuaW1wb3J0IGltYWdlV2F0Y2hlciA9IHJlcXVpcmUoJy4uL2ltYWdlLXdhdGNoLWhlbHBlcicpXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlIH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6ZWRNUFYge1xuICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldydcbiAgZWRpdG9ySWQ/OiBudW1iZXJcbiAgZmlsZVBhdGg/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNUFZQYXJhbXNFZGl0b3Ige1xuICBlZGl0b3I6IFRleHRFZGl0b3JcbiAgZmlsZVBhdGg/OiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNUFZQYXJhbXNQYXRoIHtcbiAgZWRpdG9yPzogdW5kZWZpbmVkXG4gIGZpbGVQYXRoOiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgTVBWUGFyYW1zID0gTVBWUGFyYW1zRWRpdG9yIHwgTVBWUGFyYW1zUGF0aFxuXG5leHBvcnQgdHlwZSBNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudCA9IEhUTUxJRnJhbWVFbGVtZW50ICYge1xuICBnZXRNb2RlbCgpOiBNYXJrZG93blByZXZpZXdWaWV3XG59XG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3IHtcbiAgcHJpdmF0ZSBsb2FkaW5nOiBib29sZWFuID0gdHJ1ZVxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdW5pbml0aWFsaXplZFxuICBwcml2YXRlIHJlc29sdmU6ICgpID0+IHZvaWRcbiAgcHVibGljIHJlYWRvbmx5IHJlbmRlclByb21pc2U6IFByb21pc2U8dm9pZD4gPSBuZXcgUHJvbWlzZTx2b2lkPihcbiAgICAocmVzb2x2ZSkgPT4gKHRoaXMucmVzb2x2ZSA9IHJlc29sdmUpLFxuICApXG4gIHB1YmxpYyByZWFkb25seSBlbGVtZW50OiBNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudFxuICBwcml2YXRlIHJvb3RFbGVtZW50PzogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSBwcmV2aWV3PzogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSBlbWl0dGVyOiBFbWl0dGVyPHtcbiAgICAnZGlkLWNoYW5nZS10aXRsZSc6IHVuZGVmaW5lZFxuICAgICdkaWQtY2hhbmdlLW1hcmtkb3duJzogdW5kZWZpbmVkXG4gIH0+ID0gbmV3IEVtaXR0ZXIoKVxuICBwcml2YXRlIHVwZGF0ZVByZXZpZXc/OiBVcGRhdGVQcmV2aWV3XG4gIHByaXZhdGUgcmVuZGVyTGFUZVg6IGJvb2xlYW4gPSBhdG9tLmNvbmZpZy5nZXQoXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCcsXG4gIClcbiAgcHJpdmF0ZSBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgcHJpdmF0ZSBsb2FkZWQgPSB0cnVlIC8vIERvIG5vdCBzaG93IHRoZSBsb2FkaW5nIHNwaW5ub3Igb24gaW5pdGlhbCBsb2FkXG4gIHByaXZhdGUgZmlsZT86IEZpbGVcbiAgcHJpdmF0ZSBlZGl0b3I/OiBUZXh0RWRpdG9yXG4gIHByaXZhdGUgbGFzdFRhcmdldD86IEhUTUxFbGVtZW50XG4gIHByaXZhdGUgZGVzdHJveWVkID0gZmFsc2VcblxuICBwcml2YXRlIHN0YXRpYyBlZGl0b3JNYXAgPSBuZXcgV2Vha01hcDxUZXh0RWRpdG9yLCBNYXJrZG93blByZXZpZXdWaWV3PigpXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHBhcmFtczogTVBWUGFyYW1zKSB7XG4gICAgaWYgKHBhcmFtcy5lZGl0b3IpIHtcbiAgICAgIGxldCBtcHB2ID0gTWFya2Rvd25QcmV2aWV3Vmlldy5lZGl0b3JNYXAuZ2V0KHBhcmFtcy5lZGl0b3IpXG4gICAgICBpZiAoIW1wcHYpIHtcbiAgICAgICAgbXBwdiA9IG5ldyBNYXJrZG93blByZXZpZXdWaWV3KHBhcmFtcylcbiAgICAgICAgTWFya2Rvd25QcmV2aWV3Vmlldy5lZGl0b3JNYXAuc2V0KHBhcmFtcy5lZGl0b3IsIG1wcHYpXG4gICAgICB9XG4gICAgICByZXR1cm4gbXBwdlxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXcocGFyYW1zKVxuICAgIH1cbiAgfVxuICBwdWJsaWMgc3RhdGljIHZpZXdGb3JFZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gICAgcmV0dXJuIE1hcmtkb3duUHJldmlld1ZpZXcuZWRpdG9yTWFwLmdldChlZGl0b3IpXG4gIH1cblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKHsgZWRpdG9yLCBmaWxlUGF0aCB9OiBNUFZQYXJhbXMpIHtcbiAgICB0aGlzLmVkaXRvciA9IGVkaXRvclxuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpIGFzIGFueVxuICAgIHRoaXMuZWxlbWVudC5nZXRNb2RlbCA9ICgpID0+IHRoaXNcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tcHJldmlldy1wbHVzJywgJ25hdGl2ZS1rZXktYmluZGluZ3MnKVxuICAgIHRoaXMuZWxlbWVudC5zcmMgPSAnYWJvdXQ6YmxhbmsnXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJzEwMCUnXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxMDAlJ1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB9KSxcbiAgICAgIGF0b20uc3R5bGVzLm9uRGlkUmVtb3ZlU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgfSksXG4gICAgICBhdG9tLnN0eWxlcy5vbkRpZFVwZGF0ZVN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgIH0pLFxuICAgIClcbiAgICBpZiAoZmlsZVBhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5maWxlID0gbmV3IEZpbGUoZmlsZVBhdGgpXG4gICAgfVxuICAgIHRoaXMuaGFuZGxlRXZlbnRzKClcbiAgICBjb25zdCBvbmxvYWQgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgaWYgKHRoaXMudXBkYXRlUHJldmlldykgdGhpcy51cGRhdGVQcmV2aWV3ID0gdW5kZWZpbmVkXG4gICAgICBjb25zdCBkb2MgPSB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50XG4gICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB0aGlzLnJvb3RFbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ21hcmtkb3duLXByZXZpZXctcGx1cy12aWV3JylcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgICB0aGlzLnJvb3RFbGVtZW50LnRhYkluZGV4ID0gLTFcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScpKSB7XG4gICAgICAgIHRoaXMucm9vdEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnLCAnJylcbiAgICAgIH1cbiAgICAgIHRoaXMucHJldmlldyA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgdGhpcy5wcmV2aWV3LmNsYXNzTGlzdC5hZGQoJ3VwZGF0ZS1wcmV2aWV3JylcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5wcmV2aWV3KVxuICAgICAgZG9jLmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5yb290RWxlbWVudClcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQub25jb250ZXh0bWVudSA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMubGFzdFRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50XG4gICAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgICBpZiAocGFuZSkgcGFuZS5hY3RpdmF0ZSgpXG4gICAgICAgIGF0b20uY29udGV4dE1lbnUuc2hvd0ZvckV2ZW50KFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oe30sIGUsIHsgdGFyZ2V0OiB0aGlzLmVsZW1lbnQgfSksXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICAgIGlmICh0aGlzLmVkaXRvciB8fCB0aGlzLmZpbGUpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbmxvYWQpXG4gIH1cblxuICB0ZXh0KCkge1xuICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuICcnXG4gICAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnQudGV4dENvbnRlbnQgfHwgJydcbiAgfVxuXG4gIGZpbmQod2hhdDogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm4gbnVsbFxuICAgIHJldHVybiB0aGlzLnJvb3RFbGVtZW50LnF1ZXJ5U2VsZWN0b3Iod2hhdClcbiAgfVxuXG4gIGZpbmRBbGwod2hhdDogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm4gW11cbiAgICByZXR1cm4gdGhpcy5yb290RWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHdoYXQpXG4gIH1cblxuICBnZXRSb290KCkge1xuICAgIHJldHVybiB0aGlzLnJvb3RFbGVtZW50XG4gIH1cblxuICBzZXJpYWxpemUoKTogU2VyaWFsaXplZE1QViB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ21hcmtkb3duLXByZXZpZXctcGx1cy9NYXJrZG93blByZXZpZXdWaWV3JyxcbiAgICAgIGZpbGVQYXRoOiB0aGlzLmZpbGUgJiYgdGhpcy5maWxlLmdldFBhdGgoKSxcbiAgICAgIGVkaXRvcklkOiB0aGlzLmVkaXRvciAmJiB0aGlzLmVkaXRvci5pZCxcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlXG4gICAgaWYgKHRoaXMuZWRpdG9yKSBNYXJrZG93blByZXZpZXdWaWV3LmVkaXRvck1hcC5kZWxldGUodGhpcy5lZGl0b3IpXG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgcGF0aCAmJiBpbWFnZVdhdGNoZXIucmVtb3ZlRmlsZShwYXRoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpXG4gIH1cblxuICBvbkRpZENoYW5nZVRpdGxlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VNYXJrZG93bihjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtbWFya2Rvd24nLCBjYWxsYmFjaylcbiAgfVxuXG4gIGhhbmRsZUV2ZW50cygpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRBZGRHcmFtbWFyKCgpID0+XG4gICAgICAgIF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgICB9LCAyNTApLFxuICAgICAgKSxcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRVcGRhdGVHcmFtbWFyKFxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgJ2NvcmU6bW92ZS11cCc6ICgpID0+XG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudCAmJiB0aGlzLnJvb3RFbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAtMTAgfSksXG4gICAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+XG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudCAmJiB0aGlzLnJvb3RFbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAxMCB9KSxcbiAgICAgICAgJ2NvcmU6Y29weSc6IChldmVudDogQ29tbWFuZEV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuY29weVRvQ2xpcGJvYXJkKCkpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pbic6ICgpID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVyblxuICAgICAgICAgIGNvbnN0IHpvb21MZXZlbCA9IHBhcnNlRmxvYXQodGhpcy5yb290RWxlbWVudC5zdHlsZS56b29tIHx8ICcxJylcbiAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnN0eWxlLnpvb20gPSAoem9vbUxldmVsICsgMC4xKS50b1N0cmluZygpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm5cbiAgICAgICAgICBjb25zdCB6b29tTGV2ZWwgPSBwYXJzZUZsb2F0KHRoaXMucm9vdEVsZW1lbnQuc3R5bGUuem9vbSB8fCAnMScpXG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudC5zdHlsZS56b29tID0gKHpvb21MZXZlbCAtIDAuMSkudG9TdHJpbmcoKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnJlc2V0LXpvb20nOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm5cbiAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnN0eWxlLnpvb20gPSAnMSdcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXNvdXJjZSc6IChfZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBsYXN0VGFyZ2V0ID0gdGhpcy5sYXN0VGFyZ2V0XG4gICAgICAgICAgaWYgKCFsYXN0VGFyZ2V0KSByZXR1cm5cbiAgICAgICAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgICAgICAgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aGlzLnN5bmNTb3VyY2Uoc291cmNlLCBsYXN0VGFyZ2V0KVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgY29uc3QgY2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuXG4gICAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgIGlmIChwYW5lICE9PSB1bmRlZmluZWQgJiYgcGFuZSAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKSB7XG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5maWxlLm9uRGlkQ2hhbmdlKGNoYW5nZUhhbmRsZXIpKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyhmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICB0aGlzLmVkaXRvci5vbkRpZENoYW5nZVBhdGgoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgICAgfSksXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgICAgdXRpbC5kZXN0cm95KHRoaXMpXG4gICAgICAgIH0pLFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkUmVsb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5lZGl0b3IpLCB7XG4gICAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnOiBhc3luYyAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICAgICAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5lZGl0b3IpIHJldHVyblxuICAgICAgICAgICAgdGhpcy5zeW5jUHJldmlldyhzb3VyY2UsIHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93KVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgIH1cblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYnJlYWtPblNpbmdsZU5ld2xpbmUnLFxuICAgICAgICBjaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICApXG5cbiAgICAvLyBUb2dnbGUgTGFUZVggcmVuZGVyaW5nIGlmIGZvY3VzIGlzIG9uIHByZXZpZXcgcGFuZSBvciBhc3NvY2lhdGVkIGVkaXRvci5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKCkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgPT09IHRoaXMgfHxcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSA9PT0gdGhpcy5lZGl0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTGFUZVggPSAhdGhpcy5yZW5kZXJMYVRlWFxuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScsXG4gICAgICAgICh7IG5ld1ZhbHVlIH0pID0+IHtcbiAgICAgICAgICBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQgJiZcbiAgICAgICAgICAgICAgdGhpcy5yb290RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScsICcnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50ICYmXG4gICAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgKVxuICB9XG5cbiAgYXN5bmMgcmVuZGVyTWFya2Rvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgdGhpcy5zaG93TG9hZGluZygpXG4gICAgfVxuICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgIGlmIChzb3VyY2UpIGF3YWl0IHRoaXMucmVuZGVyTWFya2Rvd25UZXh0KHNvdXJjZSlcblxuICAgIHRoaXMucmVzb2x2ZSgpXG4gIH1cblxuICBhc3luYyByZWZyZXNoSW1hZ2VzKG9sZHNyYzogc3RyaW5nKSB7XG4gICAgY29uc3QgaW1ncyA9IHRoaXMuZmluZEFsbCgnaW1nW3NyY10nKSBhcyBOb2RlTGlzdE9mPEhUTUxJbWFnZUVsZW1lbnQ+XG4gICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICBmb3IgKGNvbnN0IGltZyBvZiBBcnJheS5mcm9tKGltZ3MpKSB7XG4gICAgICBsZXQgb3ZzOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgICAgIGxldCBvdjogbnVtYmVyIHwgdW5kZWZpbmVkXG4gICAgICBsZXQgc3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJykhXG4gICAgICBjb25zdCBtYXRjaCA9IHNyYy5tYXRjaCgvXiguKilcXD92PShcXGQrKSQvKVxuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIDtbLCBzcmMsIG92c10gPSBtYXRjaFxuICAgICAgfVxuICAgICAgaWYgKHNyYyA9PT0gb2xkc3JjKSB7XG4gICAgICAgIGlmIChvdnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG92ID0gcGFyc2VJbnQob3ZzLCAxMClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2ID0gYXdhaXQgaW1hZ2VXYXRjaGVyLmdldFZlcnNpb24oc3JjLCB0aGlzLmdldFBhdGgoKSlcbiAgICAgICAgaWYgKHYgIT09IG92KSB7XG4gICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKChpbWcuc3JjID0gYCR7c3JjfT92PSR7dn1gKSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKGltZy5zcmMgPSBgJHtzcmN9YCkpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBhc3luYyBnZXRNYXJrZG93blNvdXJjZSgpIHtcbiAgICBpZiAodGhpcy5maWxlICYmIHRoaXMuZmlsZS5nZXRQYXRoKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGUucmVhZCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFRleHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0SFRNTCgpIHtcbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGdldCBNYXJrZG93biBzb3VyY2VcIilcbiAgICByZXR1cm4gcmVuZGVyZXIudG9IVE1MKFxuICAgICAgc291cmNlLFxuICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICBmYWxzZSxcbiAgICApXG4gIH1cblxuICBhc3luYyByZW5kZXJNYXJrZG93blRleHQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRvbURvY3VtZW50ID0gYXdhaXQgcmVuZGVyZXIucmVuZGVyKFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgZmFsc2UsXG4gICAgICApXG4gICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2VcbiAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZVxuICAgICAgLy8gZGl2LnVwZGF0ZS1wcmV2aWV3IGNyZWF0ZWQgYWZ0ZXIgY29uc3RydWN0b3Igc3QgVXBkYXRlUHJldmlldyBjYW5ub3RcbiAgICAgIC8vIGJlIGluc3RhbmNlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgIGlmICghdGhpcy5wcmV2aWV3KSByZXR1cm5cbiAgICAgIGlmICghdGhpcy51cGRhdGVQcmV2aWV3KSB7XG4gICAgICAgIHRoaXMudXBkYXRlUHJldmlldyA9IG5ldyBVcGRhdGVQcmV2aWV3KHRoaXMucHJldmlldylcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRvbUZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgICBmb3IgKGNvbnN0IGVsZW0gb2YgQXJyYXkuZnJvbShkb21Eb2N1bWVudC5ib2R5LmNoaWxkTm9kZXMpKSB7XG4gICAgICAgIGRvbUZyYWdtZW50LmFwcGVuZENoaWxkKGVsZW0pXG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZVByZXZpZXcudXBkYXRlKHRoaXMuZWxlbWVudCwgZG9tRnJhZ21lbnQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgICBjb25zdCBkb2MgPSB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50XG4gICAgICBpZiAoZG9jICYmIGRvbURvY3VtZW50LmhlYWQuaGFzQ2hpbGROb2Rlcykge1xuICAgICAgICBsZXQgY29udGFpbmVyID0gZG9jLmhlYWQucXVlcnlTZWxlY3Rvcignb3JpZ2luYWwtZWxlbWVudHMnKVxuICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgIGNvbnRhaW5lciA9IGRvYy5jcmVhdGVFbGVtZW50KCdvcmlnaW5hbC1lbGVtZW50cycpXG4gICAgICAgICAgZG9jLmhlYWQuYXBwZW5kQ2hpbGQoY29udGFpbmVyKVxuICAgICAgICB9XG4gICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xuICAgICAgICBmb3IgKGNvbnN0IGhlYWRFbGVtZW50IG9mIEFycmF5LmZyb20oZG9tRG9jdW1lbnQuaGVhZC5jaGlsZE5vZGVzKSkge1xuICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChoZWFkRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLW1hcmtkb3duJylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yIGFzIEVycm9yKVxuICAgIH1cbiAgfVxuXG4gIGdldFRpdGxlKCkge1xuICAgIGNvbnN0IHAgPSB0aGlzLmdldFBhdGgoKVxuICAgIGlmIChwICYmIHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIGAke3BhdGguYmFzZW5hbWUocCl9IFByZXZpZXdgXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgcmV0dXJuIGAke3RoaXMuZWRpdG9yLmdldFRpdGxlKCl9IFByZXZpZXdgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnTWFya2Rvd24gUHJldmlldydcbiAgICB9XG4gIH1cblxuICBnZXRJY29uTmFtZSgpIHtcbiAgICByZXR1cm4gJ21hcmtkb3duJ1xuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIGlmICh0aGlzLmZpbGUpIHtcbiAgICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vZmlsZS8ke3RoaXMuZ2V0UGF0aCgpfWBcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL2VkaXRvci8ke3RoaXMuZWRpdG9yLmlkfWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly91bmtub3duYFxuICAgIH1cbiAgfVxuXG4gIGdldFBhdGgoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRQYXRoKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0UGF0aCgpXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGdldEdyYW1tYXIoKTogR3JhbW1hciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yICYmIHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKVxuICB9XG5cbiAgc2hvd0Vycm9yKGVycm9yOiBFcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgaWYgKCF0aGlzLnByZXZpZXcpIHJldHVyblxuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IoXG4gICAgICAgICdFcnJvciByZXBvcnRlZCBvbiBhIGRlc3Ryb3llZCBNYXJrZG93biBQcmV2aWV3IFBsdXMgdmlldycsXG4gICAgICAgIHtcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICB9LFxuICAgICAgKVxuICAgIH1cbiAgICBjb25zdCBlcnJvckRpdiA9IHRoaXMuZWxlbWVudC5jb250ZW50RG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBlcnJvckRpdi5pbm5lckhUTUwgPSBgPGgyPlByZXZpZXdpbmcgTWFya2Rvd24gRmFpbGVkPC9oMj48aDM+JHtcbiAgICAgIGVycm9yLm1lc3NhZ2VcbiAgICB9PC9oMz5gXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKGVycm9yRGl2KVxuICB9XG5cbiAgc2hvd0xvYWRpbmcoKSB7XG4gICAgaWYgKCF0aGlzLnByZXZpZXcpIHJldHVyblxuICAgIHRoaXMubG9hZGluZyA9IHRydWVcbiAgICBjb25zdCBzcGlubmVyID0gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNwaW5uZXIuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tc3Bpbm5lcicpXG4gICAgc3Bpbm5lci5pbm5lclRleHQgPSAnTG9hZGluZyBNYXJrZG93blxcdTIwMjYnXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gIH1cblxuICBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZyB8fCAhdGhpcy5wcmV2aWV3KSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKVxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGlvbi5iYXNlTm9kZSBhcyBIVE1MRWxlbWVudFxuXG4gICAgLy8gVXNlIGRlZmF1bHQgY29weSBldmVudCBoYW5kbGVyIGlmIHRoZXJlIGlzIHNlbGVjdGVkIHRleHQgaW5zaWRlIHRoaXMgdmlld1xuICAgIGlmIChcbiAgICAgIHNlbGVjdGVkVGV4dCAmJlxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy9UT0RPOiBjb21wbGFpbiBvbiBUU1xuICAgICAgc2VsZWN0ZWROb2RlICE9IG51bGwgJiZcbiAgICAgICh0aGlzLnByZXZpZXcgPT09IHNlbGVjdGVkTm9kZSB8fCB0aGlzLnByZXZpZXcuY29udGFpbnMoc2VsZWN0ZWROb2RlKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGhhbmRsZVByb21pc2UoXG4gICAgICB0aGlzLmdldEhUTUwoKS50aGVuKGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoaHRtbC5ib2R5LmlubmVySFRNTClcbiAgICAgIH0pLFxuICAgIClcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBnZXRTYXZlRGlhbG9nT3B0aW9ucygpIHtcbiAgICBsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIGlmIChkZWZhdWx0UGF0aCkge1xuICAgICAgZGVmYXVsdFBhdGggKz0gJy5odG1sJ1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICBkZWZhdWx0UGF0aCA9ICd1bnRpdGxlZC5tZC5odG1sJ1xuICAgICAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgICAgIGRlZmF1bHRQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBkZWZhdWx0UGF0aClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgZGVmYXVsdFBhdGggfVxuICB9XG5cbiAgc2F2ZUFzKGh0bWxGaWxlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKGh0bWxGaWxlUGF0aCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICBpZiAodGhpcy5sb2FkaW5nKSByZXR1cm5cblxuICAgIGNvbnN0IHRpdGxlID0gcGF0aC5wYXJzZShodG1sRmlsZVBhdGgpLm5hbWVcblxuICAgIGhhbmRsZVByb21pc2UoXG4gICAgICB0aGlzLmdldEhUTUwoKS50aGVuKGFzeW5jIChodG1sKSA9PiB7XG4gICAgICAgIGNvbnN0IGZ1bGxIdG1sID0gdXRpbC5ta0h0bWwoXG4gICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgaHRtbCxcbiAgICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICAgIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyksXG4gICAgICAgIClcblxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGh0bWxGaWxlUGF0aCwgZnVsbEh0bWwpXG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGh0bWxGaWxlUGF0aClcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIC8vXG4gIC8vIFNldCB0aGUgYXNzb2NpYXRlZCBlZGl0b3JzIGN1cnNvciBidWZmZXIgcG9zaXRpb24gdG8gdGhlIGxpbmUgcmVwcmVzZW50aW5nXG4gIC8vIHRoZSBzb3VyY2UgbWFya2Rvd24gb2YgYSB0YXJnZXQgZWxlbWVudC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgZWxlbWVudCBjb250YWluZWQgd2l0aGluIHRoZSBhc3NvaWNhdGVkXG4gIC8vICAgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCBjb250YWluZXIuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvIGlkZW50aWZ5IHRoZVxuICAvLyAgIGxpbmUgb2YgYHRleHRgIHRoYXQgcmVwcmVzZW50cyBgZWxlbWVudGAgYW5kIHNldCB0aGUgY3Vyc29yIHRvIHRoYXQgbGluZS5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgLiBJZiBub1xuICAvLyAgIGxpbmUgaXMgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gIC8vXG4gIHN5bmNTb3VyY2UodGV4dDogc3RyaW5nLCBlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IHBhdGhUb0VsZW1lbnQgPSB1dGlsLmdldFBhdGhUb0VsZW1lbnQoZWxlbWVudClcbiAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KCkgLy8gcmVtb3ZlIG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3XG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBkaXYudXBkYXRlLXByZXZpZXdcbiAgICBpZiAoIXBhdGhUb0VsZW1lbnQubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGNvbnN0IHRva2VucyA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zKHRleHQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgbGV0IGZpbmFsVG9rZW4gPSBudWxsXG4gICAgbGV0IGxldmVsID0gMFxuXG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgIGlmICh0b2tlbi5sZXZlbCA8IGxldmVsKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4uaGlkZGVuKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4udGFnID09PSBwYXRoVG9FbGVtZW50WzBdLnRhZyAmJiB0b2tlbi5sZXZlbCA9PT0gbGV2ZWwpIHtcbiAgICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IDEpIHtcbiAgICAgICAgICBpZiAocGF0aFRvRWxlbWVudFswXS5pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy8gVE9ETzogY29tcGxhaW4gb24gRFRcbiAgICAgICAgICAgIGlmICh0b2tlbi5tYXAgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBmaW5hbFRva2VuID0gdG9rZW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKVxuICAgICAgICAgICAgbGV2ZWwrK1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50WzBdLmluZGV4LS1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgdG9rZW4ubmVzdGluZyA9PT0gMCAmJlxuICAgICAgICAgIFsnbWF0aCcsICdjb2RlJywgJ2hyJ10uaW5jbHVkZXModG9rZW4udGFnKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAocGF0aFRvRWxlbWVudFswXS5pbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50WzBdLmluZGV4LS1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwYXRoVG9FbGVtZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaW5hbFRva2VuICE9PSBudWxsICYmIHRoaXMuZWRpdG9yKSB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZmxvYXRpbmctcHJvbWlzZXNcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4odGhpcy5lZGl0b3IsIHtcbiAgICAgICAgaW5pdGlhbExpbmU6IGZpbmFsVG9rZW4ubWFwWzBdLFxuICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICByZXR1cm4gZmluYWxUb2tlbi5tYXBbMF1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBTY3JvbGwgdGhlIGFzc29jaWF0ZWQgcHJldmlldyB0byB0aGUgZWxlbWVudCByZXByZXNlbnRpbmcgdGhlIHRhcmdldCBsaW5lIG9mXG4gIC8vIG9mIHRoZSBzb3VyY2UgbWFya2Rvd24uXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRhcmdldCBsaW5lIG9mIGB0ZXh0YC4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG9cbiAgLy8gICBpZGVudGlmeSB0aGUgZWxtZW50IG9mIHRoZSBhc3NvY2lhdGVkIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdGhhdCByZXByZXNlbnRzXG4gIC8vICAgYGxpbmVgIGFuZCBzY3JvbGwgdGhlIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdG8gdGhhdCBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGBsaW5lYC4gSWYgbm8gZWxlbWVudCBpc1xuICAvLyAgIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jUHJldmlldyh0ZXh0OiBzdHJpbmcsIGxpbmU6IG51bWJlcikge1xuICAgIGlmICghdGhpcy5wcmV2aWV3KSByZXR1cm4gdW5kZWZpbmVkXG4gICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3QgdG9rZW5zID0gbWFya2Rvd25JdC5nZXRUb2tlbnModGV4dCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICBjb25zdCBwYXRoVG9Ub2tlbiA9IHV0aWwuZ2V0UGF0aFRvVG9rZW4odG9rZW5zLCBsaW5lKVxuXG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLnByZXZpZXdcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHBhdGhUb1Rva2VuKSB7XG4gICAgICBjb25zdCBjYW5kaWRhdGVFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSBlbGVtZW50XG4gICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKGA6c2NvcGUgPiAke3Rva2VuLnRhZ31gKVxuICAgICAgICAuaXRlbSh0b2tlbi5pbmRleCkgYXMgSFRNTEVsZW1lbnRcbiAgICAgIGlmIChjYW5kaWRhdGVFbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQgPSBjYW5kaWRhdGVFbGVtZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygndXBkYXRlLXByZXZpZXcnKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH0gLy8gRG8gbm90IGp1bXAgdG8gdGhlIHRvcCBvZiB0aGUgcHJldmlldyBmb3IgYmFkIHN5bmNzXG5cbiAgICBpZiAoIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd1cGRhdGUtcHJldmlldycpKSB7XG4gICAgICBlbGVtZW50LnNjcm9sbEludG9WaWV3KClcbiAgICB9XG4gICAgY29uc3QgbWF4U2Nyb2xsVG9wID1cbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5yb290RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICBpZiAoISh0aGlzLnJvb3RFbGVtZW50LnNjcm9sbFRvcCA+PSBtYXhTY3JvbGxUb3ApKSB7XG4gICAgICB0aGlzLnJvb3RFbGVtZW50LnNjcm9sbFRvcCAtPSB0aGlzLnJvb3RFbGVtZW50LmNsaWVudEhlaWdodCAvIDRcbiAgICB9XG5cbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ZsYXNoJylcbiAgICBzZXRUaW1lb3V0KCgpID0+IGVsZW1lbnQhLmNsYXNzTGlzdC5yZW1vdmUoJ2ZsYXNoJyksIDEwMDApXG5cbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTdHlsZXMoKSB7XG4gICAgY29uc3QgZG9jID0gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudFxuICAgIGlmICghZG9jKSByZXR1cm5cbiAgICBsZXQgZWxlbSA9IGRvYy5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ2F0b20tc3R5bGVzJylcbiAgICBpZiAoIWVsZW0pIHtcbiAgICAgIGVsZW0gPSBkb2MuY3JlYXRlRWxlbWVudCgnYXRvbS1zdHlsZXMnKVxuICAgICAgZG9jLmhlYWQuYXBwZW5kQ2hpbGQoZWxlbSlcbiAgICB9XG4gICAgZWxlbS5pbm5lckhUTUwgPSAnJ1xuICAgIGZvciAoY29uc3Qgc2Ugb2YgYXRvbS5zdHlsZXMuZ2V0U3R5bGVFbGVtZW50cygpKSB7XG4gICAgICBlbGVtLmFwcGVuZENoaWxkKHNlLmNsb25lTm9kZSh0cnVlKSlcbiAgICB9XG4gIH1cbn1cbiJdfQ==