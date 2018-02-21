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
        const onload = () => {
            const doc = this.element.contentDocument;
            if (this.updatePreview)
                this.updatePreview = undefined;
            if (this.destroyed)
                return;
            this.disposables.add(atom.styles.observeStyleElements((se) => {
                doc.head.appendChild(se.cloneNode(true));
            }));
            this.rootElement = doc.createElement('markdown-preview-plus-view');
            this.rootElement.classList.add('native-key-bindings');
            this.rootElement.tabIndex = -1;
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
                if (this.editorId !== undefined) {
                    this.resolveEditor(this.editorId);
                }
                else if (this.filePath !== undefined) {
                    this.subscribeToFilePath(this.filePath);
                }
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
        util_1.handlePromise(this.renderMarkdown());
    }
    resolveEditor(editorId) {
        this.editor = util.editorForId(editorId);
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
        this.disposables.add(atom.config.observe('markdown-preview-plus.useGitHubStyle', (useGitHubStyle) => {
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
    async getHTML() {
        const source = await this.getMarkdownSource();
        if (source === undefined)
            throw new Error("Couldn't get Markdown source");
        return renderer.toHTML(source, this.getPath(), this.getGrammar(), this.renderLaTeX, false);
    }
    async renderMarkdownText(text) {
        try {
            const domFragment = await renderer.toDOMFragment(text, this.getPath(), this.getGrammar(), this.renderLaTeX);
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
    showError(result) {
        if (!this.preview)
            return;
        const error = this.element.contentDocument.createElement('div');
        error.innerHTML = `<h2>Previewing Markdown Failed</h2><h3>${result.message}</h3>`;
        this.preview.appendChild(error);
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
        util_1.handlePromise(this.getHTML()
            .then(function (html) {
            atom.clipboard.write(html);
        })
            .catch(function (error) {
            console.warn('Copying Markdown as HTML failed', error);
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
    async saveAs(htmlFilePath) {
        if (htmlFilePath === undefined)
            return;
        if (this.loading)
            return;
        const title = path.parse(htmlFilePath).name;
        try {
            const htmlBody = await this.getHTML();
            const html = util.mkHtml(title, htmlBody, this.renderLaTeX, atom.config.get('markdown-preview-plus.useGitHubStyle'));
            fs.writeFileSync(htmlFilePath, html);
            util_1.handlePromise(atom.workspace.open(htmlFilePath));
        }
        catch (error) {
            console.warn('Saving Markdown as HTML failed', error);
        }
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
}
exports.MarkdownPreviewView = MarkdownPreviewView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQVFhO0FBQ2IsNEJBQTRCO0FBQzVCLHlCQUF5QjtBQUV6Qix3Q0FBd0M7QUFDeEMsc0RBQWlEO0FBQ2pELG9EQUFvRDtBQUNwRCxzREFBc0Q7QUFDdEQsa0NBQXVDO0FBQ3ZDLCtCQUE4QjtBQWtCOUI7SUEyQkUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWEsRUFBRSxlQUFlLEdBQUcsS0FBSztRQTFCOUQsWUFBTyxHQUFZLElBQUksQ0FBQTtRQUdmLGtCQUFhLEdBQWtCLElBQUksT0FBTyxDQUN4RCxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUN0QyxDQUFBO1FBSU8sWUFBTyxHQUdWLElBQUksY0FBTyxFQUFFLENBQUE7UUFFVixnQkFBVyxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUM1QyxxREFBcUQsQ0FDdEQsQ0FBQTtRQUNPLGdCQUFXLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO1FBQ3ZDLFdBQU0sR0FBRyxJQUFJLENBQUE7UUFNYixjQUFTLEdBQUcsS0FBSyxDQUFBO1FBR3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQVEsQ0FBQTtRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUE7UUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLHFCQUFxQixDQUFD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bW1hbmRFdmVudCxcbiAgRW1pdHRlcixcbiAgRGlzcG9zYWJsZSxcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgRmlsZSxcbiAgVGV4dEVkaXRvcixcbiAgR3JhbW1hcixcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuaW1wb3J0IHJlbmRlcmVyID0gcmVxdWlyZSgnLi4vcmVuZGVyZXInKVxuaW1wb3J0IHsgVXBkYXRlUHJldmlldyB9IGZyb20gJy4uL3VwZGF0ZS1wcmV2aWV3J1xuaW1wb3J0IG1hcmtkb3duSXQgPSByZXF1aXJlKCcuLi9tYXJrZG93bi1pdC1oZWxwZXInKVxuaW1wb3J0IGltYWdlV2F0Y2hlciA9IHJlcXVpcmUoJy4uL2ltYWdlLXdhdGNoLWhlbHBlcicpXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlIH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc0VkaXRvciB7XG4gIGVkaXRvcklkOiBudW1iZXJcbiAgZmlsZVBhdGg/OiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNUFZQYXJhbXNQYXRoIHtcbiAgZWRpdG9ySWQ/OiB1bmRlZmluZWRcbiAgZmlsZVBhdGg6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBNUFZQYXJhbXMgPSBNUFZQYXJhbXNFZGl0b3IgfCBNUFZQYXJhbXNQYXRoXG5cbmV4cG9ydCB0eXBlIE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50ID0gSFRNTElGcmFtZUVsZW1lbnQgJiB7XG4gIGdldE1vZGVsKCk6IE1hcmtkb3duUHJldmlld1ZpZXdcbn1cblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duUHJldmlld1ZpZXcge1xuICBwcml2YXRlIGxvYWRpbmc6IGJvb2xlYW4gPSB0cnVlXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby11bmluaXRpYWxpemVkXG4gIHByaXZhdGUgcmVzb2x2ZTogKCkgPT4gdm9pZFxuICBwdWJsaWMgcmVhZG9ubHkgcmVuZGVyUHJvbWlzZTogUHJvbWlzZTx2b2lkPiA9IG5ldyBQcm9taXNlPHZvaWQ+KFxuICAgIChyZXNvbHZlKSA9PiAodGhpcy5yZXNvbHZlID0gcmVzb2x2ZSksXG4gIClcbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50XG4gIHByaXZhdGUgcm9vdEVsZW1lbnQ/OiBIVE1MRWxlbWVudFxuICBwcml2YXRlIHByZXZpZXc/OiBIVE1MRWxlbWVudFxuICBwcml2YXRlIGVtaXR0ZXI6IEVtaXR0ZXI8e1xuICAgICdkaWQtY2hhbmdlLXRpdGxlJzogdW5kZWZpbmVkXG4gICAgJ2RpZC1jaGFuZ2UtbWFya2Rvd24nOiB1bmRlZmluZWRcbiAgfT4gPSBuZXcgRW1pdHRlcigpXG4gIHByaXZhdGUgdXBkYXRlUHJldmlldz86IFVwZGF0ZVByZXZpZXdcbiAgcHJpdmF0ZSByZW5kZXJMYVRlWDogYm9vbGVhbiA9IGF0b20uY29uZmlnLmdldChcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JyxcbiAgKVxuICBwcml2YXRlIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBwcml2YXRlIGxvYWRlZCA9IHRydWUgLy8gRG8gbm90IHNob3cgdGhlIGxvYWRpbmcgc3Bpbm5vciBvbiBpbml0aWFsIGxvYWRcbiAgcHJpdmF0ZSBlZGl0b3JJZD86IG51bWJlclxuICBwcml2YXRlIGZpbGVQYXRoPzogc3RyaW5nXG4gIHByaXZhdGUgZmlsZT86IEZpbGVcbiAgcHJpdmF0ZSBlZGl0b3I/OiBUZXh0RWRpdG9yXG4gIHByaXZhdGUgbGFzdFRhcmdldD86IEhUTUxFbGVtZW50XG4gIHByaXZhdGUgZGVzdHJveWVkID0gZmFsc2VcblxuICBjb25zdHJ1Y3Rvcih7IGVkaXRvcklkLCBmaWxlUGF0aCB9OiBNUFZQYXJhbXMsIGRlc2VyaWFsaXphdGlvbiA9IGZhbHNlKSB7XG4gICAgdGhpcy5lZGl0b3JJZCA9IGVkaXRvcklkXG4gICAgdGhpcy5maWxlUGF0aCA9IGZpbGVQYXRoXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJykgYXMgYW55XG4gICAgdGhpcy5lbGVtZW50LmdldE1vZGVsID0gKCkgPT4gdGhpc1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMnLCAnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgdGhpcy5lbGVtZW50LnNyYyA9ICdhYm91dDpibGFuaydcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSAnMTAwJSdcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnXG4gICAgY29uc3Qgb25sb2FkID0gKCkgPT4ge1xuICAgICAgY29uc3QgZG9jID0gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudFxuICAgICAgaWYgKHRoaXMudXBkYXRlUHJldmlldykgdGhpcy51cGRhdGVQcmV2aWV3ID0gdW5kZWZpbmVkXG4gICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIGF0b20uc3R5bGVzLm9ic2VydmVTdHlsZUVsZW1lbnRzKChzZSkgPT4ge1xuICAgICAgICAgIGRvYy5oZWFkLmFwcGVuZENoaWxkKHNlLmNsb25lTm9kZSh0cnVlKSlcbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLnJvb3RFbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ21hcmtkb3duLXByZXZpZXctcGx1cy12aWV3JylcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgICB0aGlzLnJvb3RFbGVtZW50LnRhYkluZGV4ID0gLTFcbiAgICAgIHRoaXMucHJldmlldyA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgdGhpcy5wcmV2aWV3LmNsYXNzTGlzdC5hZGQoJ3VwZGF0ZS1wcmV2aWV3JylcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5wcmV2aWV3KVxuICAgICAgZG9jLmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5yb290RWxlbWVudClcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQub25jb250ZXh0bWVudSA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMubGFzdFRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50XG4gICAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgICBpZiAocGFuZSkgcGFuZS5hY3RpdmF0ZSgpXG4gICAgICAgIGF0b20uY29udGV4dE1lbnUuc2hvd0ZvckV2ZW50KFxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oe30sIGUsIHsgdGFyZ2V0OiB0aGlzLmVsZW1lbnQgfSksXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpZEF0dGFjaCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICAgICAgaWYgKHRoaXMuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMucmVzb2x2ZUVkaXRvcih0aGlzLmVkaXRvcklkKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZmlsZVBhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuc3Vic2NyaWJlVG9GaWxlUGF0aCh0aGlzLmZpbGVQYXRoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGVzZXJpYWxpemF0aW9uICYmIHRoaXMuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBuZWVkIHRvIGRlZmVyIG9uIGRlc2VyaWFsaXphdGlvbiBzaW5jZVxuICAgICAgICAvLyBlZGl0b3IgbWlnaHQgbm90IGJlIGRlc2VyaWFsaXplZCBhdCB0aGlzIHBvaW50XG4gICAgICAgIHNldEltbWVkaWF0ZShkaWRBdHRhY2gpXG4gICAgICAgIGRlc2VyaWFsaXphdGlvbiA9IGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaWRBdHRhY2goKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9ubG9hZClcbiAgfVxuXG4gIHRleHQoKSB7XG4gICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm4gJydcbiAgICByZXR1cm4gdGhpcy5yb290RWxlbWVudC50ZXh0Q29udGVudCB8fCAnJ1xuICB9XG5cbiAgZmluZCh3aGF0OiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVybiBudWxsXG4gICAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnQucXVlcnlTZWxlY3Rvcih3aGF0KVxuICB9XG5cbiAgZmluZEFsbCh3aGF0OiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVybiBbXVxuICAgIHJldHVybiB0aGlzLnJvb3RFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwod2hhdClcbiAgfVxuXG4gIGdldFJvb3QoKSB7XG4gICAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnRcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnbWFya2Rvd24tcHJldmlldy1wbHVzL01hcmtkb3duUHJldmlld1ZpZXcnLFxuICAgICAgZmlsZVBhdGg6IHRoaXMuZ2V0UGF0aCgpIHx8IHRoaXMuZmlsZVBhdGgsXG4gICAgICBlZGl0b3JJZDogdGhpcy5lZGl0b3JJZCxcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlXG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgcGF0aCAmJiBpbWFnZVdhdGNoZXIucmVtb3ZlRmlsZShwYXRoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpXG4gIH1cblxuICBvbkRpZENoYW5nZVRpdGxlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VNYXJrZG93bihjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtbWFya2Rvd24nLCBjYWxsYmFjaylcbiAgfVxuXG4gIHN1YnNjcmliZVRvRmlsZVBhdGgoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuZmlsZSA9IG5ldyBGaWxlKGZpbGVQYXRoKVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gIH1cblxuICByZXNvbHZlRWRpdG9yKGVkaXRvcklkOiBudW1iZXIpIHtcbiAgICB0aGlzLmVkaXRvciA9IHV0aWwuZWRpdG9yRm9ySWQoZWRpdG9ySWQpXG5cbiAgICBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgIHRoaXMuaGFuZGxlRXZlbnRzKClcbiAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgZWRpdG9yIHRoaXMgcHJldmlldyB3YXMgY3JlYXRlZCBmb3IgaGFzIGJlZW4gY2xvc2VkIHNvIGNsb3NlXG4gICAgICAvLyB0aGlzIHByZXZpZXcgc2luY2UgYSBwcmV2aWV3IGNhbm5vdCBiZSByZW5kZXJlZCB3aXRob3V0IGFuIGVkaXRvclxuICAgICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgICBwYW5lICYmIHBhbmUuZGVzdHJveUl0ZW0odGhpcylcbiAgICB9XG4gIH1cblxuICBoYW5kbGVFdmVudHMoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkQWRkR3JhbW1hcigoKSA9PlxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkVXBkYXRlR3JhbW1hcihcbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PlxuICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQgJiYgdGhpcy5yb290RWxlbWVudC5zY3JvbGxCeSh7IHRvcDogLTEwIH0pLFxuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PlxuICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQgJiYgdGhpcy5yb290RWxlbWVudC5zY3JvbGxCeSh7IHRvcDogMTAgfSksXG4gICAgICAgICdjb3JlOmNvcHknOiAoZXZlbnQ6IENvbW1hbmRFdmVudCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmNvcHlUb0NsaXBib2FyZCgpKSBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm5cbiAgICAgICAgICBjb25zdCB6b29tTGV2ZWwgPSBwYXJzZUZsb2F0KHRoaXMucm9vdEVsZW1lbnQuc3R5bGUuem9vbSB8fCAnMScpXG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudC5zdHlsZS56b29tID0gKHpvb21MZXZlbCArIDAuMSkudG9TdHJpbmcoKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0JzogKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuXG4gICAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLnJvb3RFbGVtZW50LnN0eWxlLnpvb20gfHwgJzEnKVxuICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQuc3R5bGUuem9vbSA9ICh6b29tTGV2ZWwgLSAwLjEpLnRvU3RyaW5nKClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpyZXNldC16b29tJzogKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuXG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudC5zdHlsZS56b29tID0gJzEnXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1zb3VyY2UnOiAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgbGFzdFRhcmdldCA9IHRoaXMubGFzdFRhcmdldFxuICAgICAgICAgIGlmICghbGFzdFRhcmdldCkgcmV0dXJuXG4gICAgICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgICAgIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKChzb3VyY2U/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGhpcy5zeW5jU291cmNlKHNvdXJjZSwgbGFzdFRhcmdldClcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIClcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcblxuICAgIGNvbnN0IGNoYW5nZUhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcblxuICAgICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgICBpZiAocGFuZSAhPT0gdW5kZWZpbmVkICYmIHBhbmUgIT09IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSkge1xuICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbSh0aGlzKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZpbGUpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZShjaGFuZ2VIYW5kbGVyKSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRTdG9wQ2hhbmdpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5lZGl0b3Iub25EaWRDaGFuZ2VQYXRoKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICAgIH0pLFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkUmVsb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5lZGl0b3IpLCB7XG4gICAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnOiBhc3luYyAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICAgICAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5lZGl0b3IpIHJldHVyblxuICAgICAgICAgICAgdGhpcy5zeW5jUHJldmlldyhzb3VyY2UsIHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93KVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgIH1cblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYnJlYWtPblNpbmdsZU5ld2xpbmUnLFxuICAgICAgICBjaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICApXG5cbiAgICAvLyBUb2dnbGUgTGFUZVggcmVuZGVyaW5nIGlmIGZvY3VzIGlzIG9uIHByZXZpZXcgcGFuZSBvciBhc3NvY2lhdGVkIGVkaXRvci5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKCkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgPT09IHRoaXMgfHxcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSA9PT0gdGhpcy5lZGl0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTGFUZVggPSAhdGhpcy5yZW5kZXJMYVRlWFxuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyxcbiAgICAgICAgKHVzZUdpdEh1YlN0eWxlKSA9PiB7XG4gICAgICAgICAgaWYgKHVzZUdpdEh1YlN0eWxlKSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50ICYmXG4gICAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnLCAnJylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yb290RWxlbWVudCAmJlxuICAgICAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJylcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApLFxuICAgIClcbiAgfVxuXG4gIGFzeW5jIHJlbmRlck1hcmtkb3duKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgIHRoaXMuc2hvd0xvYWRpbmcoKVxuICAgIH1cbiAgICBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbihhc3luYyAoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlck1hcmtkb3duVGV4dChzb3VyY2UpXG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICB9KVxuICAgIHRoaXMucmVzb2x2ZSgpXG4gIH1cblxuICBhc3luYyByZWZyZXNoSW1hZ2VzKG9sZHNyYzogc3RyaW5nKSB7XG4gICAgY29uc3QgaW1ncyA9IHRoaXMuZmluZEFsbCgnaW1nW3NyY10nKSBhcyBOb2RlTGlzdE9mPEhUTUxJbWFnZUVsZW1lbnQ+XG4gICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICBmb3IgKGNvbnN0IGltZyBvZiBBcnJheS5mcm9tKGltZ3MpKSB7XG4gICAgICBsZXQgb3ZzOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgICAgIGxldCBvdjogbnVtYmVyIHwgdW5kZWZpbmVkXG4gICAgICBsZXQgc3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJykhXG4gICAgICBjb25zdCBtYXRjaCA9IHNyYy5tYXRjaCgvXiguKilcXD92PShcXGQrKSQvKVxuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIDtbLCBzcmMsIG92c10gPSBtYXRjaFxuICAgICAgfVxuICAgICAgaWYgKHNyYyA9PT0gb2xkc3JjKSB7XG4gICAgICAgIGlmIChvdnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG92ID0gcGFyc2VJbnQob3ZzLCAxMClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2ID0gYXdhaXQgaW1hZ2VXYXRjaGVyLmdldFZlcnNpb24oc3JjLCB0aGlzLmdldFBhdGgoKSlcbiAgICAgICAgaWYgKHYgIT09IG92KSB7XG4gICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKChpbWcuc3JjID0gYCR7c3JjfT92PSR7dn1gKSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKGltZy5zcmMgPSBgJHtzcmN9YCkpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBhc3luYyBnZXRNYXJrZG93blNvdXJjZSgpIHtcbiAgICBpZiAodGhpcy5maWxlICYmIHRoaXMuZmlsZS5nZXRQYXRoKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGUucmVhZCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFRleHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0SFRNTCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZ2V0IE1hcmtkb3duIHNvdXJjZVwiKVxuICAgIHJldHVybiByZW5kZXJlci50b0hUTUwoXG4gICAgICBzb3VyY2UsXG4gICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgIGZhbHNlLFxuICAgIClcbiAgfVxuXG4gIGFzeW5jIHJlbmRlck1hcmtkb3duVGV4dCh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZG9tRnJhZ21lbnQgPSBhd2FpdCByZW5kZXJlci50b0RPTUZyYWdtZW50KFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgICAgdGhpcy5nZXRHcmFtbWFyKCksXG4gICAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICApXG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlXG4gICAgICAvLyBkaXYudXBkYXRlLXByZXZpZXcgY3JlYXRlZCBhZnRlciBjb25zdHJ1Y3RvciBzdCBVcGRhdGVQcmV2aWV3IGNhbm5vdFxuICAgICAgLy8gYmUgaW5zdGFuY2VkIGluIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgaWYgKCF0aGlzLnVwZGF0ZVByZXZpZXcgJiYgdGhpcy5wcmV2aWV3KSB7XG4gICAgICAgIHRoaXMudXBkYXRlUHJldmlldyA9IG5ldyBVcGRhdGVQcmV2aWV3KHRoaXMucHJldmlldylcbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlUHJldmlldyAmJlxuICAgICAgICBkb21GcmFnbWVudCAmJlxuICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcudXBkYXRlKFxuICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICBkb21GcmFnbWVudCBhcyBFbGVtZW50LFxuICAgICAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAgIClcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLW1hcmtkb3duJylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5zaG93RXJyb3IoZXJyb3IgYXMgRXJyb3IpXG4gICAgfVxuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgaWYgKHAgJiYgdGhpcy5maWxlKSB7XG4gICAgICByZXR1cm4gYCR7cGF0aC5iYXNlbmFtZShwKX0gUHJldmlld2BcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5lZGl0b3IuZ2V0VGl0bGUoKX0gUHJldmlld2BcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdNYXJrZG93biBQcmV2aWV3J1xuICAgIH1cbiAgfVxuXG4gIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAnbWFya2Rvd24nXG4gIH1cblxuICBnZXRVUkkoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly8ke3RoaXMuZ2V0UGF0aCgpfWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9lZGl0b3IvJHt0aGlzLmVkaXRvcklkfWBcbiAgICB9XG4gIH1cblxuICBnZXRQYXRoKCkge1xuICAgIGlmICh0aGlzLmZpbGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0UGF0aCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFBhdGgoKVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBnZXRHcmFtbWFyKCk6IEdyYW1tYXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmVkaXRvciAmJiB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgfVxuXG4gIHNob3dFcnJvcihyZXN1bHQ6IEVycm9yKSB7XG4gICAgaWYgKCF0aGlzLnByZXZpZXcpIHJldHVyblxuICAgIGNvbnN0IGVycm9yID0gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGVycm9yLmlubmVySFRNTCA9IGA8aDI+UHJldmlld2luZyBNYXJrZG93biBGYWlsZWQ8L2gyPjxoMz4ke1xuICAgICAgcmVzdWx0Lm1lc3NhZ2VcbiAgICB9PC9oMz5gXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKGVycm9yKVxuICB9XG5cbiAgc2hvd0xvYWRpbmcoKSB7XG4gICAgaWYgKCF0aGlzLnByZXZpZXcpIHJldHVyblxuICAgIHRoaXMubG9hZGluZyA9IHRydWVcbiAgICBjb25zdCBzcGlubmVyID0gdGhpcy5lbGVtZW50LmNvbnRlbnREb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHNwaW5uZXIuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tc3Bpbm5lcicpXG4gICAgc3Bpbm5lci5pbm5lclRleHQgPSAnTG9hZGluZyBNYXJrZG93blxcdTIwMjYnXG4gICAgdGhpcy5wcmV2aWV3LmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gIH1cblxuICBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZyB8fCAhdGhpcy5wcmV2aWV3KSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKVxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGlvbi5iYXNlTm9kZSBhcyBIVE1MRWxlbWVudFxuXG4gICAgLy8gVXNlIGRlZmF1bHQgY29weSBldmVudCBoYW5kbGVyIGlmIHRoZXJlIGlzIHNlbGVjdGVkIHRleHQgaW5zaWRlIHRoaXMgdmlld1xuICAgIGlmIChcbiAgICAgIHNlbGVjdGVkVGV4dCAmJlxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy9UT0RPOiBjb21wbGFpbiBvbiBUU1xuICAgICAgc2VsZWN0ZWROb2RlICE9IG51bGwgJiZcbiAgICAgICh0aGlzLnByZXZpZXcgPT09IHNlbGVjdGVkTm9kZSB8fCB0aGlzLnByZXZpZXcuY29udGFpbnMoc2VsZWN0ZWROb2RlKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGhhbmRsZVByb21pc2UoXG4gICAgICB0aGlzLmdldEhUTUwoKVxuICAgICAgICAudGhlbihmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoaHRtbClcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdDb3B5aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpXG4gICAgICAgIH0pLFxuICAgIClcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBnZXRTYXZlRGlhbG9nT3B0aW9ucygpIHtcbiAgICBsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIGlmIChkZWZhdWx0UGF0aCkge1xuICAgICAgZGVmYXVsdFBhdGggKz0gJy5odG1sJ1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICBkZWZhdWx0UGF0aCA9ICd1bnRpdGxlZC5tZC5odG1sJ1xuICAgICAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgICAgIGRlZmF1bHRQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBkZWZhdWx0UGF0aClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgZGVmYXVsdFBhdGggfVxuICB9XG5cbiAgYXN5bmMgc2F2ZUFzKGh0bWxGaWxlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKGh0bWxGaWxlUGF0aCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICBpZiAodGhpcy5sb2FkaW5nKSByZXR1cm5cblxuICAgIGNvbnN0IHRpdGxlID0gcGF0aC5wYXJzZShodG1sRmlsZVBhdGgpLm5hbWVcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBodG1sQm9keSA9IGF3YWl0IHRoaXMuZ2V0SFRNTCgpXG4gICAgICBjb25zdCBodG1sID0gdXRpbC5ta0h0bWwoXG4gICAgICAgIHRpdGxlLFxuICAgICAgICBodG1sQm9keSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnKSxcbiAgICAgIClcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhodG1sRmlsZVBhdGgsIGh0bWwpXG4gICAgICBoYW5kbGVQcm9taXNlKGF0b20ud29ya3NwYWNlLm9wZW4oaHRtbEZpbGVQYXRoKSlcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS53YXJuKCdTYXZpbmcgTWFya2Rvd24gYXMgSFRNTCBmYWlsZWQnLCBlcnJvcilcbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBTZXQgdGhlIGFzc29jaWF0ZWQgZWRpdG9ycyBjdXJzb3IgYnVmZmVyIHBvc2l0aW9uIHRvIHRoZSBsaW5lIHJlcHJlc2VudGluZ1xuICAvLyB0aGUgc291cmNlIG1hcmtkb3duIG9mIGEgdGFyZ2V0IGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGFyZ2V0IGVsZW1lbnQgY29udGFpbmVkIHdpdGhpbiB0aGUgYXNzb2ljYXRlZFxuICAvLyAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgY29udGFpbmVyLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0byBpZGVudGlmeSB0aGVcbiAgLy8gICBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgIGFuZCBzZXQgdGhlIGN1cnNvciB0byB0aGF0IGxpbmUuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YC4gSWYgbm9cbiAgLy8gICBsaW5lIGlzIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jU291cmNlKHRleHQ6IHN0cmluZywgZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdXRpbC5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQpXG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld1xuICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKSAvLyByZW1vdmUgZGl2LnVwZGF0ZS1wcmV2aWV3XG4gICAgaWYgKCFwYXRoVG9FbGVtZW50Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGxldCBmaW5hbFRva2VuID0gbnVsbFxuICAgIGxldCBsZXZlbCA9IDBcblxuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICBpZiAodG9rZW4ubGV2ZWwgPCBsZXZlbCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuLmhpZGRlbikge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKHRva2VuLnRhZyA9PT0gcGF0aFRvRWxlbWVudFswXS50YWcgJiYgdG9rZW4ubGV2ZWwgPT09IGxldmVsKSB7XG4gICAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAxKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vIFRPRE86IGNvbXBsYWluIG9uIERUXG4gICAgICAgICAgICBpZiAodG9rZW4ubWFwICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KClcbiAgICAgICAgICAgIGxldmVsKytcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHRva2VuLm5lc3RpbmcgPT09IDAgJiZcbiAgICAgICAgICBbJ21hdGgnLCAnY29kZScsICdociddLmluY2x1ZGVzKHRva2VuLnRhZylcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGZpbmFsVG9rZW4gPSB0b2tlblxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGF0aFRvRWxlbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmluYWxUb2tlbiAhPT0gbnVsbCAmJiB0aGlzLmVkaXRvcikge1xuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWZsb2F0aW5nLXByb21pc2VzXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMuZWRpdG9yLCB7XG4gICAgICAgIGluaXRpYWxMaW5lOiBmaW5hbFRva2VuLm1hcFswXSxcbiAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICB9KVxuICAgICAgcmV0dXJuIGZpbmFsVG9rZW4ubWFwWzBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gU2Nyb2xsIHRoZSBhc3NvY2lhdGVkIHByZXZpZXcgdG8gdGhlIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSB0YXJnZXQgbGluZSBvZlxuICAvLyBvZiB0aGUgc291cmNlIG1hcmtkb3duLlxuICAvL1xuICAvLyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBUYXJnZXQgbGluZSBvZiBgdGV4dGAuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvXG4gIC8vICAgaWRlbnRpZnkgdGhlIGVsbWVudCBvZiB0aGUgYXNzb2NpYXRlZCBgbWFya2Rvd24tcHJldmlldy1wbHVzLXZpZXdgIHRoYXQgcmVwcmVzZW50c1xuICAvLyAgIGBsaW5lYCBhbmQgc2Nyb2xsIHRoZSBgbWFya2Rvd24tcHJldmlldy1wbHVzLXZpZXdgIHRvIHRoYXQgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBlbGVtZW50IHRoYXQgcmVwcmVzZW50cyBgbGluZWAuIElmIG5vIGVsZW1lbnQgaXNcbiAgLy8gICBpZGVudGlmaWVkIGBudWxsYCBpcyByZXR1cm5lZC5cbiAgLy9cbiAgc3luY1ByZXZpZXcodGV4dDogc3RyaW5nLCBsaW5lOiBudW1iZXIpIHtcbiAgICBpZiAoIXRoaXMucHJldmlldykgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IHRva2VucyA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zKHRleHQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgY29uc3QgcGF0aFRvVG9rZW4gPSB1dGlsLmdldFBhdGhUb1Rva2VuKHRva2VucywgbGluZSlcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5wcmV2aWV3XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiBwYXRoVG9Ub2tlbikge1xuICAgICAgY29uc3QgY2FuZGlkYXRlRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gZWxlbWVudFxuICAgICAgICAucXVlcnlTZWxlY3RvckFsbChgOnNjb3BlID4gJHt0b2tlbi50YWd9YClcbiAgICAgICAgLml0ZW0odG9rZW4uaW5kZXgpIGFzIEhUTUxFbGVtZW50XG4gICAgICBpZiAoY2FuZGlkYXRlRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50ID0gY2FuZGlkYXRlRWxlbWVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JykpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9IC8vIERvIG5vdCBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIHByZXZpZXcgZm9yIGJhZCBzeW5jc1xuXG4gICAgaWYgKCFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygndXBkYXRlLXByZXZpZXcnKSkge1xuICAgICAgZWxlbWVudC5zY3JvbGxJbnRvVmlldygpXG4gICAgfVxuICAgIGNvbnN0IG1heFNjcm9sbFRvcCA9XG4gICAgICB0aGlzLnJvb3RFbGVtZW50LnNjcm9sbEhlaWdodCAtIHRoaXMucm9vdEVsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgaWYgKCEodGhpcy5yb290RWxlbWVudC5zY3JvbGxUb3AgPj0gbWF4U2Nyb2xsVG9wKSkge1xuICAgICAgdGhpcy5yb290RWxlbWVudC5zY3JvbGxUb3AgLT0gdGhpcy5yb290RWxlbWVudC5jbGllbnRIZWlnaHQgLyA0XG4gICAgfVxuXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmbGFzaCcpXG4gICAgc2V0VGltZW91dCgoKSA9PiBlbGVtZW50IS5jbGFzc0xpc3QucmVtb3ZlKCdmbGFzaCcpLCAxMDAwKVxuXG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxufVxuIl19