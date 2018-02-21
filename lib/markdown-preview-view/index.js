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
}
exports.MarkdownPreviewView = MarkdownPreviewView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQVFhO0FBQ2IsNEJBQTRCO0FBQzVCLHlCQUF5QjtBQUV6Qix3Q0FBd0M7QUFDeEMsc0RBQWlEO0FBQ2pELG9EQUFvRDtBQUNwRCxzREFBc0Q7QUFDdEQsa0NBQXVDO0FBQ3ZDLCtCQUE4QjtBQWtCOUI7SUEyQkUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWEsRUFBRSxlQUFlLEdBQUcsS0FBSztRQTFCOUQsWUFBTyxHQUFZLElBQUksQ0FBQTtRQUdmLGtCQUFhLEdBQWtCLElBQUksT0FBTyxDQUN4RCxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUN0QyxDQUFBO1FBSU8sWUFBTyxHQUdWLElBQUksY0FBTyxFQUFFLENBQUE7UUFFVixnQkFBVyxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUM1QyxxREFBcUQsQ0FDdEQsQ0FBQTtRQUNPLGdCQUFXLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO1FBQ3ZDLFdBQU0sR0FBRyxJQUFJLENBQUE7UUFNYixjQUFTLEdBQUcsS0FBSyxDQUFBO1FBR3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQVEsQ0FBQTtRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUE7UUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLHFCQUFxQixDQUFD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QVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRCxNQUFNLENBQUMsU0FBUyxDQUFBO1FBQ2xCLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xELE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUMxQixDQUFDO1FBQ0QsTUFBTSxZQUFZLEdBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFBO1FBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFBO1FBQ2pFLENBQUM7UUFFRCxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUM5QixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFFMUQsTUFBTSxDQUFDLE9BQU8sQ0FBQTtJQUNoQixDQUFDO0NBQ0Y7QUFsbUJELGtEQWttQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuaW1wb3J0IHtcbiAgQ29tbWFuZEV2ZW50LFxuICBFbWl0dGVyLFxuICBEaXNwb3NhYmxlLFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBGaWxlLFxuICBUZXh0RWRpdG9yLFxuICBHcmFtbWFyLFxufSBmcm9tICdhdG9tJ1xuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKVxuXG5pbXBvcnQgcmVuZGVyZXIgPSByZXF1aXJlKCcuLi9yZW5kZXJlcicpXG5pbXBvcnQgeyBVcGRhdGVQcmV2aWV3IH0gZnJvbSAnLi4vdXBkYXRlLXByZXZpZXcnXG5pbXBvcnQgbWFya2Rvd25JdCA9IHJlcXVpcmUoJy4uL21hcmtkb3duLWl0LWhlbHBlcicpXG5pbXBvcnQgaW1hZ2VXYXRjaGVyID0gcmVxdWlyZSgnLi4vaW1hZ2Utd2F0Y2gtaGVscGVyJylcbmltcG9ydCB7IGhhbmRsZVByb21pc2UgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBpbnRlcmZhY2UgTVBWUGFyYW1zRWRpdG9yIHtcbiAgZWRpdG9ySWQ6IG51bWJlclxuICBmaWxlUGF0aD86IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc1BhdGgge1xuICBlZGl0b3JJZD86IHVuZGVmaW5lZFxuICBmaWxlUGF0aDogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIE1QVlBhcmFtcyA9IE1QVlBhcmFtc0VkaXRvciB8IE1QVlBhcmFtc1BhdGhcblxuZXhwb3J0IHR5cGUgTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnQgPSBIVE1MSUZyYW1lRWxlbWVudCAmIHtcbiAgZ2V0TW9kZWwoKTogTWFya2Rvd25QcmV2aWV3Vmlld1xufVxuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHByaXZhdGUgbG9hZGluZzogYm9vbGVhbiA9IHRydWVcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuaW5pdGlhbGl6ZWRcbiAgcHJpdmF0ZSByZXNvbHZlOiAoKSA9PiB2b2lkXG4gIHB1YmxpYyByZWFkb25seSByZW5kZXJQcm9taXNlOiBQcm9taXNlPHZvaWQ+ID0gbmV3IFByb21pc2U8dm9pZD4oXG4gICAgKHJlc29sdmUpID0+ICh0aGlzLnJlc29sdmUgPSByZXNvbHZlKSxcbiAgKVxuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnRcbiAgcHJpdmF0ZSByb290RWxlbWVudD86IEhUTUxFbGVtZW50XG4gIHByaXZhdGUgcHJldmlldz86IEhUTUxFbGVtZW50XG4gIHByaXZhdGUgZW1pdHRlcjogRW1pdHRlcjx7XG4gICAgJ2RpZC1jaGFuZ2UtdGl0bGUnOiB1bmRlZmluZWRcbiAgICAnZGlkLWNoYW5nZS1tYXJrZG93bic6IHVuZGVmaW5lZFxuICB9PiA9IG5ldyBFbWl0dGVyKClcbiAgcHJpdmF0ZSB1cGRhdGVQcmV2aWV3PzogVXBkYXRlUHJldmlld1xuICBwcml2YXRlIHJlbmRlckxhVGVYOiBib29sZWFuID0gYXRvbS5jb25maWcuZ2V0KFxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnLFxuICApXG4gIHByaXZhdGUgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIHByaXZhdGUgbG9hZGVkID0gdHJ1ZSAvLyBEbyBub3Qgc2hvdyB0aGUgbG9hZGluZyBzcGlubm9yIG9uIGluaXRpYWwgbG9hZFxuICBwcml2YXRlIGVkaXRvcklkPzogbnVtYmVyXG4gIHByaXZhdGUgZmlsZVBhdGg/OiBzdHJpbmdcbiAgcHJpdmF0ZSBmaWxlPzogRmlsZVxuICBwcml2YXRlIGVkaXRvcj86IFRleHRFZGl0b3JcbiAgcHJpdmF0ZSBsYXN0VGFyZ2V0PzogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSBkZXN0cm95ZWQgPSBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yKHsgZWRpdG9ySWQsIGZpbGVQYXRoIH06IE1QVlBhcmFtcywgZGVzZXJpYWxpemF0aW9uID0gZmFsc2UpIHtcbiAgICB0aGlzLmVkaXRvcklkID0gZWRpdG9ySWRcbiAgICB0aGlzLmZpbGVQYXRoID0gZmlsZVBhdGhcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKSBhcyBhbnlcbiAgICB0aGlzLmVsZW1lbnQuZ2V0TW9kZWwgPSAoKSA9PiB0aGlzXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXByZXZpZXctcGx1cycsICduYXRpdmUta2V5LWJpbmRpbmdzJylcbiAgICB0aGlzLmVsZW1lbnQuc3JjID0gJ2Fib3V0OmJsYW5rJ1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9ICcxMDAlJ1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMTAwJSdcbiAgICBjb25zdCBvbmxvYWQgPSAoKSA9PiB7XG4gICAgICBjb25zdCBkb2MgPSB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50XG4gICAgICBpZiAodGhpcy51cGRhdGVQcmV2aWV3KSB0aGlzLnVwZGF0ZVByZXZpZXcgPSB1bmRlZmluZWRcbiAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgYXRvbS5zdHlsZXMub2JzZXJ2ZVN0eWxlRWxlbWVudHMoKHNlKSA9PiB7XG4gICAgICAgICAgZG9jLmhlYWQuYXBwZW5kQ2hpbGQoc2UuY2xvbmVOb2RlKHRydWUpKVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQgPSBkb2MuY3JlYXRlRWxlbWVudCgnbWFya2Rvd24tcHJldmlldy1wbHVzLXZpZXcnKVxuICAgICAgdGhpcy5yb290RWxlbWVudC5jbGFzc0xpc3QuYWRkKCduYXRpdmUta2V5LWJpbmRpbmdzJylcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQudGFiSW5kZXggPSAtMVxuICAgICAgdGhpcy5wcmV2aWV3ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICB0aGlzLnByZXZpZXcuY2xhc3NMaXN0LmFkZCgndXBkYXRlLXByZXZpZXcnKVxuICAgICAgdGhpcy5yb290RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnByZXZpZXcpXG4gICAgICBkb2MuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnJvb3RFbGVtZW50KVxuICAgICAgdGhpcy5yb290RWxlbWVudC5vbmNvbnRleHRtZW51ID0gKGUpID0+IHtcbiAgICAgICAgdGhpcy5sYXN0VGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnRcbiAgICAgICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgICAgIGlmIChwYW5lKSBwYW5lLmFjdGl2YXRlKClcbiAgICAgICAgYXRvbS5jb250ZXh0TWVudS5zaG93Rm9yRXZlbnQoXG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgZSwgeyB0YXJnZXQ6IHRoaXMuZWxlbWVudCB9KSxcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgY29uc3QgZGlkQXR0YWNoID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgICBpZiAodGhpcy5lZGl0b3JJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5yZXNvbHZlRWRpdG9yKHRoaXMuZWRpdG9ySWQpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5maWxlUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5zdWJzY3JpYmVUb0ZpbGVQYXRoKHRoaXMuZmlsZVBhdGgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChkZXNlcmlhbGl6YXRpb24gJiYgdGhpcy5lZGl0b3JJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIG5lZWQgdG8gZGVmZXIgb24gZGVzZXJpYWxpemF0aW9uIHNpbmNlXG4gICAgICAgIC8vIGVkaXRvciBtaWdodCBub3QgYmUgZGVzZXJpYWxpemVkIGF0IHRoaXMgcG9pbnRcbiAgICAgICAgc2V0SW1tZWRpYXRlKGRpZEF0dGFjaClcbiAgICAgICAgZGVzZXJpYWxpemF0aW9uID0gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpZEF0dGFjaCgpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25sb2FkKVxuICB9XG5cbiAgdGV4dCgpIHtcbiAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVybiAnJ1xuICAgIHJldHVybiB0aGlzLnJvb3RFbGVtZW50LnRleHRDb250ZW50IHx8ICcnXG4gIH1cblxuICBmaW5kKHdoYXQ6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gdGhpcy5yb290RWxlbWVudC5xdWVyeVNlbGVjdG9yKHdoYXQpXG4gIH1cblxuICBmaW5kQWxsKHdoYXQ6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuIFtdXG4gICAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCh3aGF0KVxuICB9XG5cbiAgZ2V0Um9vdCgpIHtcbiAgICByZXR1cm4gdGhpcy5yb290RWxlbWVudFxuICB9XG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldycsXG4gICAgICBmaWxlUGF0aDogdGhpcy5nZXRQYXRoKCkgfHwgdGhpcy5maWxlUGF0aCxcbiAgICAgIGVkaXRvcklkOiB0aGlzLmVkaXRvcklkLFxuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWVcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBwYXRoICYmIGltYWdlV2F0Y2hlci5yZW1vdmVGaWxlKHBhdGgpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKClcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlVGl0bGUoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2spXG4gIH1cblxuICBvbkRpZENoYW5nZU1hcmtkb3duKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1tYXJrZG93bicsIGNhbGxiYWNrKVxuICB9XG5cbiAgc3Vic2NyaWJlVG9GaWxlUGF0aChmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5maWxlID0gbmV3IEZpbGUoZmlsZVBhdGgpXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgIHRoaXMuaGFuZGxlRXZlbnRzKClcbiAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgfVxuXG4gIHJlc29sdmVFZGl0b3IoZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIHRoaXMuZWRpdG9yID0gdXRpbC5lZGl0b3JGb3JJZChlZGl0b3JJZClcblxuICAgIGlmICh0aGlzLmVkaXRvcikge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBlZGl0b3IgdGhpcyBwcmV2aWV3IHdhcyBjcmVhdGVkIGZvciBoYXMgYmVlbiBjbG9zZWQgc28gY2xvc2VcbiAgICAgIC8vIHRoaXMgcHJldmlldyBzaW5jZSBhIHByZXZpZXcgY2Fubm90IGJlIHJlbmRlcmVkIHdpdGhvdXQgYW4gZWRpdG9yXG4gICAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgIHBhbmUgJiYgcGFuZS5kZXN0cm95SXRlbSh0aGlzKVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUV2ZW50cygpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRBZGRHcmFtbWFyKCgpID0+XG4gICAgICAgIF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgICB9LCAyNTApLFxuICAgICAgKSxcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRVcGRhdGVHcmFtbWFyKFxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgJ2NvcmU6bW92ZS11cCc6ICgpID0+XG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudCAmJiB0aGlzLnJvb3RFbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAtMTAgfSksXG4gICAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+XG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudCAmJiB0aGlzLnJvb3RFbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAxMCB9KSxcbiAgICAgICAgJ2NvcmU6Y29weSc6IChldmVudDogQ29tbWFuZEV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuY29weVRvQ2xpcGJvYXJkKCkpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pbic6ICgpID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVyblxuICAgICAgICAgIGNvbnN0IHpvb21MZXZlbCA9IHBhcnNlRmxvYXQodGhpcy5yb290RWxlbWVudC5zdHlsZS56b29tIHx8ICcxJylcbiAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnN0eWxlLnpvb20gPSAoem9vbUxldmVsICsgMC4xKS50b1N0cmluZygpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm5cbiAgICAgICAgICBjb25zdCB6b29tTGV2ZWwgPSBwYXJzZUZsb2F0KHRoaXMucm9vdEVsZW1lbnQuc3R5bGUuem9vbSB8fCAnMScpXG4gICAgICAgICAgdGhpcy5yb290RWxlbWVudC5zdHlsZS56b29tID0gKHpvb21MZXZlbCAtIDAuMSkudG9TdHJpbmcoKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnJlc2V0LXpvb20nOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm5cbiAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50LnN0eWxlLnpvb20gPSAnMSdcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXNvdXJjZSc6IChfZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBsYXN0VGFyZ2V0ID0gdGhpcy5sYXN0VGFyZ2V0XG4gICAgICAgICAgaWYgKCFsYXN0VGFyZ2V0KSByZXR1cm5cbiAgICAgICAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgICAgICAgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aGlzLnN5bmNTb3VyY2Uoc291cmNlLCBsYXN0VGFyZ2V0KVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgY29uc3QgY2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuXG4gICAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgIGlmIChwYW5lICE9PSB1bmRlZmluZWQgJiYgcGFuZSAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKSB7XG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5maWxlLm9uRGlkQ2hhbmdlKGNoYW5nZUhhbmRsZXIpKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyhmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICB0aGlzLmVkaXRvci5vbkRpZENoYW5nZVBhdGgoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgICAgfSksXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU2F2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICAgIGF0b20uY29tbWFuZHMuYWRkKGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmVkaXRvciksIHtcbiAgICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtcHJldmlldyc6IGFzeW5jIChfZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLmVkaXRvcikgcmV0dXJuXG4gICAgICAgICAgICB0aGlzLnN5bmNQcmV2aWV3KHNvdXJjZSwgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cpXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICApXG4gICAgfVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZScsXG4gICAgICAgIGNoYW5nZUhhbmRsZXIsXG4gICAgICApLFxuICAgIClcblxuICAgIC8vIFRvZ2dsZSBMYVRlWCByZW5kZXJpbmcgaWYgZm9jdXMgaXMgb24gcHJldmlldyBwYW5lIG9yIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1yZW5kZXItbGF0ZXgnOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSA9PT0gdGhpcyB8fFxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpID09PSB0aGlzLmVkaXRvclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCA9ICF0aGlzLnJlbmRlckxhVGVYXG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnLFxuICAgICAgICAodXNlR2l0SHViU3R5bGUpID0+IHtcbiAgICAgICAgICBpZiAodXNlR2l0SHViU3R5bGUpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQgJiZcbiAgICAgICAgICAgICAgdGhpcy5yb290RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScsICcnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RFbGVtZW50ICYmXG4gICAgICAgICAgICAgIHRoaXMucm9vdEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgKVxuICB9XG5cbiAgYXN5bmMgcmVuZGVyTWFya2Rvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgdGhpcy5zaG93TG9hZGluZygpXG4gICAgfVxuICAgIGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKGFzeW5jIChzb3VyY2U/OiBzdHJpbmcpID0+IHtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTWFya2Rvd25UZXh0KHNvdXJjZSlcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH0pXG4gICAgdGhpcy5yZXNvbHZlKClcbiAgfVxuXG4gIGFzeW5jIHJlZnJlc2hJbWFnZXMob2xkc3JjOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpbWdzID0gdGhpcy5maW5kQWxsKCdpbWdbc3JjXScpIGFzIE5vZGVMaXN0T2Y8SFRNTEltYWdlRWxlbWVudD5cbiAgICBjb25zdCByZXN1bHQgPSBbXVxuICAgIGZvciAoY29uc3QgaW1nIG9mIEFycmF5LmZyb20oaW1ncykpIHtcbiAgICAgIGxldCBvdnM6IHN0cmluZyB8IHVuZGVmaW5lZFxuICAgICAgbGV0IG92OiBudW1iZXIgfCB1bmRlZmluZWRcbiAgICAgIGxldCBzcmMgPSBpbWcuZ2V0QXR0cmlidXRlKCdzcmMnKSFcbiAgICAgIGNvbnN0IG1hdGNoID0gc3JjLm1hdGNoKC9eKC4qKVxcP3Y9KFxcZCspJC8pXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgO1ssIHNyYywgb3ZzXSA9IG1hdGNoXG4gICAgICB9XG4gICAgICBpZiAoc3JjID09PSBvbGRzcmMpIHtcbiAgICAgICAgaWYgKG92cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgb3YgPSBwYXJzZUludChvdnMsIDEwKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHYgPSBhd2FpdCBpbWFnZVdhdGNoZXIuZ2V0VmVyc2lvbihzcmMsIHRoaXMuZ2V0UGF0aCgpKVxuICAgICAgICBpZiAodiAhPT0gb3YpIHtcbiAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKGltZy5zcmMgPSBgJHtzcmN9P3Y9JHt2fWApKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoaW1nLnNyYyA9IGAke3NyY31gKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIGFzeW5jIGdldE1hcmtkb3duU291cmNlKCkge1xuICAgIGlmICh0aGlzLmZpbGUgJiYgdGhpcy5maWxlLmdldFBhdGgoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZWFkKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0VGV4dCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRIVE1MKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qgc291cmNlID0gYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpXG4gICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBnZXQgTWFya2Rvd24gc291cmNlXCIpXG4gICAgcmV0dXJuIHJlbmRlcmVyLnRvSFRNTChcbiAgICAgIHNvdXJjZSxcbiAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgdGhpcy5nZXRHcmFtbWFyKCksXG4gICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgZmFsc2UsXG4gICAgKVxuICB9XG5cbiAgYXN5bmMgcmVuZGVyTWFya2Rvd25UZXh0KHRleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkb21GcmFnbWVudCA9IGF3YWl0IHJlbmRlcmVyLnRvRE9NRnJhZ21lbnQoXG4gICAgICAgIHRleHQsXG4gICAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgIClcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlXG4gICAgICB0aGlzLmxvYWRlZCA9IHRydWVcbiAgICAgIC8vIGRpdi51cGRhdGUtcHJldmlldyBjcmVhdGVkIGFmdGVyIGNvbnN0cnVjdG9yIHN0IFVwZGF0ZVByZXZpZXcgY2Fubm90XG4gICAgICAvLyBiZSBpbnN0YW5jZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICBpZiAoIXRoaXMudXBkYXRlUHJldmlldyAmJiB0aGlzLnByZXZpZXcpIHtcbiAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3ID0gbmV3IFVwZGF0ZVByZXZpZXcodGhpcy5wcmV2aWV3KVxuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVQcmV2aWV3ICYmXG4gICAgICAgIGRvbUZyYWdtZW50ICYmXG4gICAgICAgIHRoaXMudXBkYXRlUHJldmlldy51cGRhdGUoXG4gICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgIGRvbUZyYWdtZW50IGFzIEVsZW1lbnQsXG4gICAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtbWFya2Rvd24nKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBhcyBFcnJvcilcbiAgICB9XG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICBjb25zdCBwID0gdGhpcy5nZXRQYXRoKClcbiAgICBpZiAocCAmJiB0aGlzLmZpbGUpIHtcbiAgICAgIHJldHVybiBgJHtwYXRoLmJhc2VuYW1lKHApfSBQcmV2aWV3YFxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmVkaXRvci5nZXRUaXRsZSgpfSBQcmV2aWV3YFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ01hcmtkb3duIFByZXZpZXcnXG4gICAgfVxuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuICdtYXJrZG93bidcbiAgfVxuXG4gIGdldFVSSSgpIHtcbiAgICBpZiAodGhpcy5maWxlKSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovLyR7dGhpcy5nZXRQYXRoKCl9YFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL2VkaXRvci8ke3RoaXMuZWRpdG9ySWR9YFxuICAgIH1cbiAgfVxuXG4gIGdldFBhdGgoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRQYXRoKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0UGF0aCgpXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGdldEdyYW1tYXIoKTogR3JhbW1hciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yICYmIHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKVxuICB9XG5cbiAgc2hvd0Vycm9yKHJlc3VsdDogRXJyb3IpIHtcbiAgICBpZiAoIXRoaXMucHJldmlldykgcmV0dXJuXG4gICAgY29uc3QgZXJyb3IgPSB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZXJyb3IuaW5uZXJIVE1MID0gYDxoMj5QcmV2aWV3aW5nIE1hcmtkb3duIEZhaWxlZDwvaDI+PGgzPiR7XG4gICAgICByZXN1bHQubWVzc2FnZVxuICAgIH08L2gzPmBcbiAgICB0aGlzLnByZXZpZXcuYXBwZW5kQ2hpbGQoZXJyb3IpXG4gIH1cblxuICBzaG93TG9hZGluZygpIHtcbiAgICBpZiAoIXRoaXMucHJldmlldykgcmV0dXJuXG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZVxuICAgIGNvbnN0IHNwaW5uZXIgPSB0aGlzLmVsZW1lbnQuY29udGVudERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgc3Bpbm5lci5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1zcGlubmVyJylcbiAgICBzcGlubmVyLmlubmVyVGV4dCA9ICdMb2FkaW5nIE1hcmtkb3duXFx1MjAyNidcbiAgICB0aGlzLnByZXZpZXcuYXBwZW5kQ2hpbGQoc3Bpbm5lcilcbiAgfVxuXG4gIGNvcHlUb0NsaXBib2FyZCgpIHtcbiAgICBpZiAodGhpcy5sb2FkaW5nIHx8ICF0aGlzLnByZXZpZXcpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKVxuICAgIGNvbnN0IHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gc2VsZWN0aW9uLmJhc2VOb2RlIGFzIEhUTUxFbGVtZW50XG5cbiAgICAvLyBVc2UgZGVmYXVsdCBjb3B5IGV2ZW50IGhhbmRsZXIgaWYgdGhlcmUgaXMgc2VsZWN0ZWQgdGV4dCBpbnNpZGUgdGhpcyB2aWV3XG4gICAgaWYgKFxuICAgICAgc2VsZWN0ZWRUZXh0ICYmXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c3RyaWN0LXR5cGUtcHJlZGljYXRlcyAvL1RPRE86IGNvbXBsYWluIG9uIFRTXG4gICAgICBzZWxlY3RlZE5vZGUgIT0gbnVsbCAmJlxuICAgICAgKHRoaXMucHJldmlldyA9PT0gc2VsZWN0ZWROb2RlIHx8IHRoaXMucHJldmlldy5jb250YWlucyhzZWxlY3RlZE5vZGUpKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaGFuZGxlUHJvbWlzZShcbiAgICAgIHRoaXMuZ2V0SFRNTCgpLnRoZW4oZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShodG1sKVxuICAgICAgfSksXG4gICAgKVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGdldFNhdmVEaWFsb2dPcHRpb25zKCkge1xuICAgIGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgaWYgKGRlZmF1bHRQYXRoKSB7XG4gICAgICBkZWZhdWx0UGF0aCArPSAnLmh0bWwnXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgIGRlZmF1bHRQYXRoID0gJ3VudGl0bGVkLm1kLmh0bWwnXG4gICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgZGVmYXVsdFBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIGRlZmF1bHRQYXRoKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBkZWZhdWx0UGF0aCB9XG4gIH1cblxuICBzYXZlQXMoaHRtbEZpbGVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoaHRtbEZpbGVQYXRoID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIGlmICh0aGlzLmxvYWRpbmcpIHJldHVyblxuXG4gICAgY29uc3QgdGl0bGUgPSBwYXRoLnBhcnNlKGh0bWxGaWxlUGF0aCkubmFtZVxuXG4gICAgaGFuZGxlUHJvbWlzZShcbiAgICAgIHRoaXMuZ2V0SFRNTCgpLnRoZW4oYXN5bmMgKGh0bWxCb2R5KSA9PiB7XG4gICAgICAgIGNvbnN0IGh0bWwgPSB1dGlsLm1rSHRtbChcbiAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICBodG1sQm9keSxcbiAgICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICAgIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyksXG4gICAgICAgIClcblxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGh0bWxGaWxlUGF0aCwgaHRtbClcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oaHRtbEZpbGVQYXRoKVxuICAgICAgfSksXG4gICAgKVxuICB9XG5cbiAgLy9cbiAgLy8gU2V0IHRoZSBhc3NvY2lhdGVkIGVkaXRvcnMgY3Vyc29yIGJ1ZmZlciBwb3NpdGlvbiB0byB0aGUgbGluZSByZXByZXNlbnRpbmdcbiAgLy8gdGhlIHNvdXJjZSBtYXJrZG93biBvZiBhIHRhcmdldCBlbGVtZW50LlxuICAvL1xuICAvLyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAvLyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRhcmdldCBlbGVtZW50IGNvbnRhaW5lZCB3aXRoaW4gdGhlIGFzc29pY2F0ZWRcbiAgLy8gICBgbWFya2Rvd24tcHJldmlldy1wbHVzLXZpZXdgIGNvbnRhaW5lci4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG8gaWRlbnRpZnkgdGhlXG4gIC8vICAgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YCBhbmQgc2V0IHRoZSBjdXJzb3IgdG8gdGhhdCBsaW5lLlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGxpbmUgb2YgYHRleHRgIHRoYXQgcmVwcmVzZW50cyBgZWxlbWVudGAuIElmIG5vXG4gIC8vICAgbGluZSBpcyBpZGVudGlmaWVkIGBudWxsYCBpcyByZXR1cm5lZC5cbiAgLy9cbiAgc3luY1NvdXJjZSh0ZXh0OiBzdHJpbmcsIGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgcGF0aFRvRWxlbWVudCA9IHV0aWwuZ2V0UGF0aFRvRWxlbWVudChlbGVtZW50KVxuICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKSAvLyByZW1vdmUgbWFya2Rvd24tcHJldmlldy1wbHVzLXZpZXdcbiAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KCkgLy8gcmVtb3ZlIGRpdi51cGRhdGUtcHJldmlld1xuICAgIGlmICghcGF0aFRvRWxlbWVudC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgY29uc3QgdG9rZW5zID0gbWFya2Rvd25JdC5nZXRUb2tlbnModGV4dCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICBsZXQgZmluYWxUb2tlbiA9IG51bGxcbiAgICBsZXQgbGV2ZWwgPSAwXG5cbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgaWYgKHRva2VuLmxldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5oaWRkZW4pIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi50YWcgPT09IHBhdGhUb0VsZW1lbnRbMF0udGFnICYmIHRva2VuLmxldmVsID09PSBsZXZlbCkge1xuICAgICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gMSkge1xuICAgICAgICAgIGlmIChwYXRoVG9FbGVtZW50WzBdLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c3RyaWN0LXR5cGUtcHJlZGljYXRlcyAvLyBUT0RPOiBjb21wbGFpbiBvbiBEVFxuICAgICAgICAgICAgaWYgKHRva2VuLm1hcCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGZpbmFsVG9rZW4gPSB0b2tlblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpXG4gICAgICAgICAgICBsZXZlbCsrXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnRbMF0uaW5kZXgtLVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0b2tlbi5uZXN0aW5nID09PSAwICYmXG4gICAgICAgICAgWydtYXRoJywgJ2NvZGUnLCAnaHInXS5pbmNsdWRlcyh0b2tlbi50YWcpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChwYXRoVG9FbGVtZW50WzBdLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICBmaW5hbFRva2VuID0gdG9rZW5cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnRbMF0uaW5kZXgtLVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHBhdGhUb0VsZW1lbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpbmFsVG9rZW4gIT09IG51bGwgJiYgdGhpcy5lZGl0b3IpIHtcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih0aGlzLmVkaXRvciwge1xuICAgICAgICBpbml0aWFsTGluZTogZmluYWxUb2tlbi5tYXBbMF0sXG4gICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgICAgfSlcbiAgICAgIHJldHVybiBmaW5hbFRva2VuLm1hcFswXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFNjcm9sbCB0aGUgYXNzb2NpYXRlZCBwcmV2aWV3IHRvIHRoZSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IGxpbmUgb2ZcbiAgLy8gb2YgdGhlIHNvdXJjZSBtYXJrZG93bi5cbiAgLy9cbiAgLy8gQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgLy8gQHBhcmFtIHtudW1iZXJ9IGxpbmUgVGFyZ2V0IGxpbmUgb2YgYHRleHRgLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0b1xuICAvLyAgIGlkZW50aWZ5IHRoZSBlbG1lbnQgb2YgdGhlIGFzc29jaWF0ZWQgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0aGF0IHJlcHJlc2VudHNcbiAgLy8gICBgbGluZWAgYW5kIHNjcm9sbCB0aGUgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0byB0aGF0IGVsZW1lbnQuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgZWxlbWVudCB0aGF0IHJlcHJlc2VudHMgYGxpbmVgLiBJZiBubyBlbGVtZW50IGlzXG4gIC8vICAgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gIC8vXG4gIHN5bmNQcmV2aWV3KHRleHQ6IHN0cmluZywgbGluZTogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLnByZXZpZXcpIHJldHVybiB1bmRlZmluZWRcbiAgICBpZiAoIXRoaXMucm9vdEVsZW1lbnQpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGNvbnN0IHBhdGhUb1Rva2VuID0gdXRpbC5nZXRQYXRoVG9Ub2tlbih0b2tlbnMsIGxpbmUpXG5cbiAgICBsZXQgZWxlbWVudCA9IHRoaXMucHJldmlld1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgcGF0aFRvVG9rZW4pIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZUVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGVsZW1lbnRcbiAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoYDpzY29wZSA+ICR7dG9rZW4udGFnfWApXG4gICAgICAgIC5pdGVtKHRva2VuLmluZGV4KSBhcyBIVE1MRWxlbWVudFxuICAgICAgaWYgKGNhbmRpZGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudCA9IGNhbmRpZGF0ZUVsZW1lbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd1cGRhdGUtcHJldmlldycpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfSAvLyBEbyBub3QganVtcCB0byB0aGUgdG9wIG9mIHRoZSBwcmV2aWV3IGZvciBiYWQgc3luY3NcblxuICAgIGlmICghZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JykpIHtcbiAgICAgIGVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcoKVxuICAgIH1cbiAgICBjb25zdCBtYXhTY3JvbGxUb3AgPVxuICAgICAgdGhpcy5yb290RWxlbWVudC5zY3JvbGxIZWlnaHQgLSB0aGlzLnJvb3RFbGVtZW50LmNsaWVudEhlaWdodFxuICAgIGlmICghKHRoaXMucm9vdEVsZW1lbnQuc2Nyb2xsVG9wID49IG1heFNjcm9sbFRvcCkpIHtcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuc2Nyb2xsVG9wIC09IHRoaXMucm9vdEVsZW1lbnQuY2xpZW50SGVpZ2h0IC8gNFxuICAgIH1cblxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZmxhc2gnKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gZWxlbWVudCEuY2xhc3NMaXN0LnJlbW92ZSgnZmxhc2gnKSwgMTAwMClcblxuICAgIHJldHVybiBlbGVtZW50XG4gIH1cbn1cbiJdfQ==