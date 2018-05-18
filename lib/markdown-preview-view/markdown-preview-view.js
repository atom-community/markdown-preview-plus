"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const atom_1 = require("atom");
const _ = require("lodash");
const fs = require("fs");
const renderer = require("../renderer");
const markdownIt = require("../markdown-it-helper");
const imageWatcher = require("../image-watch-helper");
const util_1 = require("../util");
const util = require("./util");
class MarkdownPreviewView {
    constructor(defaultRenderMode = 'normal', renderLaTeX = util_1.atomConfig().mathConfig
        .enableLatexRenderingByDefault) {
        this.defaultRenderMode = defaultRenderMode;
        this.renderLaTeX = renderLaTeX;
        this.emitter = new atom_1.Emitter();
        this.disposables = new atom_1.CompositeDisposable();
        this.destroyed = false;
        this.loading = true;
        this.zoomLevel = 0;
        this.replyCallbacks = new Map();
        this.replyCallbackId = 0;
        this.changeHandler = () => {
            util_1.handlePromise(this.renderMarkdown());
            const pane = atom.workspace.paneForItem(this);
            if (pane !== undefined && pane !== atom.workspace.getActivePane()) {
                pane.activateItem(this);
            }
        };
        this.element = document.createElement('webview');
        this.element.getModel = () => this;
        this.element.classList.add('markdown-preview-plus', 'native-key-bindings');
        this.element.disablewebsecurity = 'true';
        this.element.nodeintegration = 'true';
        this.element.src = `file:///${__dirname}/../../client/template.html`;
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.disposables.add(atom.styles.onDidAddStyleElement(() => {
            this.updateStyles();
        }), atom.styles.onDidRemoveStyleElement(() => {
            this.updateStyles();
        }), atom.styles.onDidUpdateStyleElement(() => {
            this.updateStyles();
        }));
        this.handleEvents();
        this.element.addEventListener('ipc-message', (e) => {
            switch (e.channel) {
                case 'zoom-in':
                    atom.commands.dispatch(this.element, 'markdown-preview-plus:zoom-in');
                    break;
                case 'zoom-out':
                    atom.commands.dispatch(this.element, 'markdown-preview-plus:zoom-out');
                    break;
                case 'open-source':
                    this.openSource(e.args[0].initialLine);
                    break;
                case 'did-scroll-preview':
                    const { min, max } = e.args[0];
                    this.didScrollPreview(min, max);
                    break;
                case 'reload':
                    this.element.reload();
                    break;
                case 'request-reply': {
                    const { id, request, result } = e.args[0];
                    const cb = this.replyCallbacks.get(id);
                    if (cb && request === cb.request) {
                        const callback = cb.callback;
                        callback(result);
                    }
                    break;
                }
            }
        });
        this.element.addEventListener('will-navigate', async (e) => {
            const { shell } = await Promise.resolve().then(() => require('electron'));
            const fileUriToPath = await Promise.resolve().then(() => require('file-uri-to-path'));
            if (e.url.startsWith('file://')) {
                util_1.handlePromise(atom.workspace.open(fileUriToPath(e.url)));
            }
            else {
                shell.openExternal(e.url);
            }
        });
        this.renderPromise = new Promise((resolve) => {
            const onload = () => {
                if (this.destroyed)
                    return;
                this.element.setZoomLevel(this.zoomLevel);
                this.updateStyles();
                this.element.send('use-github-style', {
                    value: atom.config.get('markdown-preview-plus.useGitHubStyle'),
                });
                this.element.send('set-atom-home', {
                    home: atom.getConfigDirPath(),
                });
                this.element.send('set-number-eqns', {
                    numberEqns: util_1.atomConfig().mathConfig.numberEquations,
                });
                this.element.send('set-base-path', {
                    path: this.getPath(),
                });
                this.emitter.emit('did-change-title');
                resolve(this.renderMarkdown());
            };
            this.element.addEventListener('dom-ready', onload);
        });
    }
    async runJS(js) {
        return new Promise((resolve) => this.element.executeJavaScript(js, false, resolve));
    }
    async getHTMLSVG() {
        return this.runRequest('get-html-svg');
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
    toggleRenderLatex() {
        this.renderLaTeX = !this.renderLaTeX;
        this.changeHandler();
    }
    async refreshImages(oldsrc) {
        const v = await imageWatcher.getVersion(oldsrc, this.getPath());
        this.element.send('update-images', { oldsrc, v });
    }
    getDefaultLocation() {
        return util_1.atomConfig().previewConfig.previewDock;
    }
    getIconName() {
        return 'markdown';
    }
    getSaveDialogOptions() {
        let defaultPath = this.getPath();
        if (defaultPath === undefined) {
            const projectPath = atom.project.getPaths()[0];
            defaultPath = 'untitled.md';
            if (projectPath) {
                defaultPath = path.join(projectPath, defaultPath);
            }
        }
        defaultPath += '.' + util_1.atomConfig().saveConfig.defaultSaveFormat;
        return { defaultPath };
    }
    saveAs(filePath) {
        if (filePath === undefined)
            return;
        if (this.loading)
            throw new Error('Preview is still loading');
        const { name, ext } = path.parse(filePath);
        if (ext === '.pdf') {
            this.element.printToPDF({}, (error, data) => {
                if (error) {
                    atom.notifications.addError('Failed saving to PDF', {
                        description: error.toString(),
                        dismissable: true,
                        stack: error.stack,
                    });
                    return;
                }
                fs.writeFileSync(filePath, data);
            });
        }
        else {
            util_1.handlePromise(this.getHTMLToSave(filePath).then(async (html) => {
                const fullHtml = util.mkHtml(name, html, this.renderLaTeX, atom.config.get('markdown-preview-plus.useGitHubStyle'), await this.runRequest('get-tex-config'));
                fs.writeFileSync(filePath, fullHtml);
                return atom.workspace.open(filePath);
            }));
        }
    }
    didScrollPreview(_min, _max) {
    }
    openSource(initialLine) {
        const path = this.getPath();
        if (path === undefined)
            return;
        util_1.handlePromise(atom.workspace.open(path, {
            initialLine,
            searchAllPanes: true,
        }));
    }
    syncPreview(line) {
        this.element.send('sync', { line });
    }
    openNewWindow() {
        const path = this.getPath();
        if (!path) {
            atom.notifications.addWarning('Can not open this preview in new window: no file path');
            return;
        }
        atom.open({
            pathsToOpen: [`markdown-preview-plus://file/${path}`],
            newWindow: true,
        });
        util.destroy(this);
    }
    async runRequest(request) {
        const id = this.replyCallbackId++;
        return new Promise((resolve) => {
            this.replyCallbacks.set(id, {
                request: request,
                callback: (result) => {
                    this.replyCallbacks.delete(id);
                    resolve(result);
                },
            });
            this.element.send(request, { id });
        });
    }
    handleEvents() {
        this.disposables.add(atom.grammars.onDidAddGrammar(() => _.debounce(() => {
            util_1.handlePromise(this.renderMarkdown());
        }, 250)), atom.grammars.onDidUpdateGrammar(_.debounce(() => {
            util_1.handlePromise(this.renderMarkdown());
        }, 250)));
        this.disposables.add(atom.commands.add(this.element, {
            'core:move-up': () => this.element.scrollBy({ top: -10 }),
            'core:move-down': () => this.element.scrollBy({ top: 10 }),
            'core:copy': (event) => {
                if (this.copyToClipboard())
                    event.stopPropagation();
            },
            'markdown-preview-plus:open-dev-tools': () => {
                this.element.openDevTools();
            },
            'markdown-preview-plus:new-window': () => {
                this.openNewWindow();
            },
            'markdown-preview-plus:print': () => {
                this.element.print();
            },
            'markdown-preview-plus:zoom-in': () => {
                this.zoomLevel += 0.1;
                this.element.setZoomLevel(this.zoomLevel);
            },
            'markdown-preview-plus:zoom-out': () => {
                this.zoomLevel -= 0.1;
                this.element.setZoomLevel(this.zoomLevel);
            },
            'markdown-preview-plus:reset-zoom': () => {
                this.zoomLevel = 0;
                this.element.setZoomLevel(this.zoomLevel);
            },
            'markdown-preview-plus:sync-source': async (_event) => {
                this.element.send('sync-source', undefined);
            },
        }));
        this.disposables.add(atom.config.onDidChange('markdown-preview-plus.markdownItConfig', () => {
            if (util_1.atomConfig().renderer === 'markdown-it')
                this.changeHandler();
        }), atom.config.onDidChange('markdown-preview-plus.pandocConfig', () => {
            if (util_1.atomConfig().renderer === 'pandoc')
                this.changeHandler();
        }), atom.config.onDidChange('markdown-preview-plus.mathConfig.latexRenderer', this.changeHandler), atom.config.onDidChange('markdown-preview-plus.mathConfig.numberEquations', () => {
            this.element.send('reload', undefined);
        }), atom.config.onDidChange('markdown-preview-plus.renderer', this.changeHandler), atom.config.onDidChange('markdown-preview-plus.useGitHubStyle', ({ newValue }) => {
            this.element.send('use-github-style', {
                value: newValue,
            });
        }));
    }
    async renderMarkdown() {
        const source = await this.getMarkdownSource();
        await this.renderMarkdownText(source);
    }
    async getHTMLToSave(savePath) {
        const source = await this.getMarkdownSource();
        return renderer.render(source, this.getPath(), this.getGrammar(), this.renderLaTeX, 'save', savePath);
    }
    async renderMarkdownText(text) {
        try {
            const domDocument = await renderer.render(text, this.getPath(), this.getGrammar(), this.renderLaTeX, this.defaultRenderMode);
            if (this.destroyed)
                return;
            this.loading = false;
            this.element.send('update-preview', {
                html: domDocument.documentElement.outerHTML,
                renderLaTeX: this.renderLaTeX,
                mjrenderer: util_1.atomConfig().mathConfig.latexRenderer,
            });
            this.element.send('set-source-map', {
                map: util.buildLineMap(markdownIt.getTokens(text, this.renderLaTeX)),
            });
            this.emitter.emit('did-change-markdown');
        }
        catch (error) {
            this.showError(error);
        }
    }
    showError(error) {
        if (this.destroyed) {
            atom.notifications.addFatalError('Error reported on a destroyed Markdown Preview Plus view', {
                dismissable: true,
                stack: error.stack,
                detail: error.message,
            });
            return;
        }
        this.element.send('error', { msg: error.message });
    }
    copyToClipboard() {
        if (this.loading) {
            return false;
        }
        const selection = window.getSelection();
        const selectedText = selection.toString();
        const selectedNode = selection.baseNode;
        if (selectedText &&
            selectedNode != null) {
            return false;
        }
        util_1.handlePromise(this.getMarkdownSource().then(async (src) => util_1.copyHtml(src, this.getPath(), this.renderLaTeX)));
        return true;
    }
    updateStyles() {
        const styles = [];
        for (const se of atom.styles.getStyleElements()) {
            styles.push(se.innerHTML);
        }
        this.element.send('style', { styles });
    }
}
exports.MarkdownPreviewView = MarkdownPreviewView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBTWE7QUFDYiw0QkFBNEI7QUFDNUIseUJBQXlCO0FBR3pCLHdDQUF3QztBQUN4QyxvREFBb0Q7QUFDcEQsc0RBQXNEO0FBQ3RELGtDQUE2RDtBQUM3RCwrQkFBOEI7QUFhOUI7SUF1QkUsWUFDVSxvQkFBMEQsUUFBUSxFQUNsRSxjQUF1QixpQkFBVSxFQUFFLENBQUMsVUFBVTtTQUNuRCw2QkFBNkI7UUFGeEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFpRDtRQUNsRSxnQkFBVyxHQUFYLFdBQVcsQ0FDYTtRQXZCeEIsWUFBTyxHQUdaLElBQUksY0FBTyxFQUFFLENBQUE7UUFDUixnQkFBVyxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQTtRQUN2QyxjQUFTLEdBQUcsS0FBSyxDQUFBO1FBRW5CLFlBQU8sR0FBWSxJQUFJLENBQUE7UUFDdkIsY0FBUyxHQUFHLENBQUMsQ0FBQTtRQUNiLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBUTdCLENBQUE7UUFDSyxvQkFBZSxHQUFHLENBQUMsQ0FBQTtRQTZNakIsa0JBQWEsR0FBRyxHQUFHLEVBQUU7WUFDN0Isb0JBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQTtZQUVwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDeEI7UUFDSCxDQUFDLENB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LENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQzFDLGVBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FDaEQsQ0FDRixDQUFBO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRU8sWUFBWTtRQUNsQixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUE7UUFDM0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUU7WUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUE7U0FDMUI7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBVSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ2pELENBQUM7Q0FDRjtBQWxkRCxrREFrZEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuaW1wb3J0IHtcbiAgQ29tbWFuZEV2ZW50LFxuICBFbWl0dGVyLFxuICBEaXNwb3NhYmxlLFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBHcmFtbWFyLFxufSBmcm9tICdhdG9tJ1xuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKVxuaW1wb3J0IHt9IGZyb20gJ2VsZWN0cm9uJyAvLyB0aGlzIGlzIGhlcmUgc29sZXkgZm9yIHR5cGluZ3NcblxuaW1wb3J0IHJlbmRlcmVyID0gcmVxdWlyZSgnLi4vcmVuZGVyZXInKVxuaW1wb3J0IG1hcmtkb3duSXQgPSByZXF1aXJlKCcuLi9tYXJrZG93bi1pdC1oZWxwZXInKVxuaW1wb3J0IGltYWdlV2F0Y2hlciA9IHJlcXVpcmUoJy4uL2ltYWdlLXdhdGNoLWhlbHBlcicpXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlLCBjb3B5SHRtbCwgYXRvbUNvbmZpZyB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IFJlcXVlc3RSZXBseU1hcCB9IGZyb20gJy4uLy4uL3NyYy1jbGllbnQvaXBjJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6ZWRNUFYge1xuICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldydcbiAgZWRpdG9ySWQ/OiBudW1iZXJcbiAgZmlsZVBhdGg/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnQgPSBFbGVjdHJvbi5XZWJ2aWV3VGFnICYge1xuICBnZXRNb2RlbCgpOiBNYXJrZG93blByZXZpZXdWaWV3XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3IHtcbiAgcHVibGljIHJlYWRvbmx5IHJlbmRlclByb21pc2U6IFByb21pc2U8dm9pZD5cbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50XG4gIHByb3RlY3RlZCBlbWl0dGVyOiBFbWl0dGVyPHtcbiAgICAnZGlkLWNoYW5nZS10aXRsZSc6IHVuZGVmaW5lZFxuICAgICdkaWQtY2hhbmdlLW1hcmtkb3duJzogdW5kZWZpbmVkXG4gIH0+ID0gbmV3IEVtaXR0ZXIoKVxuICBwcm90ZWN0ZWQgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIHByb3RlY3RlZCBkZXN0cm95ZWQgPSBmYWxzZVxuXG4gIHByaXZhdGUgbG9hZGluZzogYm9vbGVhbiA9IHRydWVcbiAgcHJpdmF0ZSB6b29tTGV2ZWwgPSAwXG4gIHByaXZhdGUgcmVwbHlDYWxsYmFja3MgPSBuZXcgTWFwPFxuICAgIG51bWJlcixcbiAgICB7XG4gICAgICBbSyBpbiBrZXlvZiBSZXF1ZXN0UmVwbHlNYXBdOiB7XG4gICAgICAgIHJlcXVlc3Q6IEtcbiAgICAgICAgY2FsbGJhY2s6IChyZXBseTogUmVxdWVzdFJlcGx5TWFwW0tdKSA9PiB2b2lkXG4gICAgICB9XG4gICAgfVtrZXlvZiBSZXF1ZXN0UmVwbHlNYXBdXG4gID4oKVxuICBwcml2YXRlIHJlcGx5Q2FsbGJhY2tJZCA9IDBcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBkZWZhdWx0UmVuZGVyTW9kZTogRXhjbHVkZTxyZW5kZXJlci5SZW5kZXJNb2RlLCAnc2F2ZSc+ID0gJ25vcm1hbCcsXG4gICAgcHJpdmF0ZSByZW5kZXJMYVRlWDogYm9vbGVhbiA9IGF0b21Db25maWcoKS5tYXRoQ29uZmlnXG4gICAgICAuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQsXG4gICkge1xuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dlYnZpZXcnKSBhcyBhbnlcbiAgICB0aGlzLmVsZW1lbnQuZ2V0TW9kZWwgPSAoKSA9PiB0aGlzXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXByZXZpZXctcGx1cycsICduYXRpdmUta2V5LWJpbmRpbmdzJylcbiAgICB0aGlzLmVsZW1lbnQuZGlzYWJsZXdlYnNlY3VyaXR5ID0gJ3RydWUnXG4gICAgdGhpcy5lbGVtZW50Lm5vZGVpbnRlZ3JhdGlvbiA9ICd0cnVlJ1xuICAgIHRoaXMuZWxlbWVudC5zcmMgPSBgZmlsZTovLy8ke19fZGlybmFtZX0vLi4vLi4vY2xpZW50L3RlbXBsYXRlLmh0bWxgXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJzEwMCUnXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxMDAlJ1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB9KSxcbiAgICAgIGF0b20uc3R5bGVzLm9uRGlkUmVtb3ZlU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgfSksXG4gICAgICBhdG9tLnN0eWxlcy5vbkRpZFVwZGF0ZVN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgIH0pLFxuICAgIClcbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAnaXBjLW1lc3NhZ2UnLFxuICAgICAgKGU6IEVsZWN0cm9uLklwY01lc3NhZ2VFdmVudEN1c3RvbSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGUuY2hhbm5lbCkge1xuICAgICAgICAgIGNhc2UgJ3pvb20taW4nOlxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICd6b29tLW91dCc6XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdvcGVuLXNvdXJjZSc6XG4gICAgICAgICAgICB0aGlzLm9wZW5Tb3VyY2UoZS5hcmdzWzBdLmluaXRpYWxMaW5lKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdkaWQtc2Nyb2xsLXByZXZpZXcnOlxuICAgICAgICAgICAgY29uc3QgeyBtaW4sIG1heCB9ID0gZS5hcmdzWzBdXG4gICAgICAgICAgICB0aGlzLmRpZFNjcm9sbFByZXZpZXcobWluLCBtYXgpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3JlbG9hZCc6XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVsb2FkKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgLy8gcmVwbGllc1xuICAgICAgICAgIGNhc2UgJ3JlcXVlc3QtcmVwbHknOiB7XG4gICAgICAgICAgICBjb25zdCB7IGlkLCByZXF1ZXN0LCByZXN1bHQgfSA9IGUuYXJnc1swXVxuICAgICAgICAgICAgY29uc3QgY2IgPSB0aGlzLnJlcGx5Q2FsbGJhY2tzLmdldChpZClcbiAgICAgICAgICAgIGlmIChjYiAmJiByZXF1ZXN0ID09PSBjYi5yZXF1ZXN0KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrOiAocjogYW55KSA9PiB2b2lkID0gY2IuY2FsbGJhY2tcbiAgICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd3aWxsLW5hdmlnYXRlJywgYXN5bmMgKGUpID0+IHtcbiAgICAgIGNvbnN0IHsgc2hlbGwgfSA9IGF3YWl0IGltcG9ydCgnZWxlY3Ryb24nKVxuICAgICAgY29uc3QgZmlsZVVyaVRvUGF0aCA9IGF3YWl0IGltcG9ydCgnZmlsZS11cmktdG8tcGF0aCcpXG4gICAgICBpZiAoZS51cmwuc3RhcnRzV2l0aCgnZmlsZTovLycpKSB7XG4gICAgICAgIGhhbmRsZVByb21pc2UoYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlVXJpVG9QYXRoKGUudXJsKSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoZS51cmwpXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLnJlbmRlclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3Qgb25sb2FkID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0Wm9vbUxldmVsKHRoaXMuem9vbUxldmVsKVxuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCd1c2UtZ2l0aHViLXN0eWxlJz4oJ3VzZS1naXRodWItc3R5bGUnLCB7XG4gICAgICAgICAgdmFsdWU6IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyksXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzZXQtYXRvbS1ob21lJz4oJ3NldC1hdG9tLWhvbWUnLCB7XG4gICAgICAgICAgaG9tZTogYXRvbS5nZXRDb25maWdEaXJQYXRoKCksXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzZXQtbnVtYmVyLWVxbnMnPignc2V0LW51bWJlci1lcW5zJywge1xuICAgICAgICAgIG51bWJlckVxbnM6IGF0b21Db25maWcoKS5tYXRoQ29uZmlnLm51bWJlckVxdWF0aW9ucyxcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3NldC1iYXNlLXBhdGgnPignc2V0LWJhc2UtcGF0aCcsIHtcbiAgICAgICAgICBwYXRoOiB0aGlzLmdldFBhdGgoKSxcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICByZXNvbHZlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgIH1cbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkb20tcmVhZHknLCBvbmxvYWQpXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBydW5KUzxUPihqczogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlKSA9PlxuICAgICAgdGhpcy5lbGVtZW50LmV4ZWN1dGVKYXZhU2NyaXB0KGpzLCBmYWxzZSwgcmVzb2x2ZSksXG4gICAgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEhUTUxTVkcoKSB7XG4gICAgcmV0dXJuIHRoaXMucnVuUmVxdWVzdCgnZ2V0LWh0bWwtc3ZnJylcbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBzZXJpYWxpemUoKTogU2VyaWFsaXplZE1QVlxuXG4gIHB1YmxpYyBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlXG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgcGF0aCAmJiBpbWFnZVdhdGNoZXIucmVtb3ZlRmlsZShwYXRoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpXG4gIH1cblxuICBwdWJsaWMgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIHB1YmxpYyBvbkRpZENoYW5nZU1hcmtkb3duKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1tYXJrZG93bicsIGNhbGxiYWNrKVxuICB9XG5cbiAgcHVibGljIHRvZ2dsZVJlbmRlckxhdGV4KCkge1xuICAgIHRoaXMucmVuZGVyTGFUZVggPSAhdGhpcy5yZW5kZXJMYVRlWFxuICAgIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcmVmcmVzaEltYWdlcyhvbGRzcmM6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHYgPSBhd2FpdCBpbWFnZVdhdGNoZXIuZ2V0VmVyc2lvbihvbGRzcmMsIHRoaXMuZ2V0UGF0aCgpKVxuICAgIHRoaXMuZWxlbWVudC5zZW5kPCd1cGRhdGUtaW1hZ2VzJz4oJ3VwZGF0ZS1pbWFnZXMnLCB7IG9sZHNyYywgdiB9KVxuICB9XG5cbiAgcHVibGljIGFic3RyYWN0IGdldFRpdGxlKCk6IHN0cmluZ1xuXG4gIHB1YmxpYyBnZXREZWZhdWx0TG9jYXRpb24oKTogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcicge1xuICAgIHJldHVybiBhdG9tQ29uZmlnKCkucHJldmlld0NvbmZpZy5wcmV2aWV3RG9ja1xuICB9XG5cbiAgcHVibGljIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAnbWFya2Rvd24nXG4gIH1cblxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0VVJJKCk6IHN0cmluZ1xuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRQYXRoKCk6IHN0cmluZyB8IHVuZGVmaW5lZFxuXG4gIHB1YmxpYyBnZXRTYXZlRGlhbG9nT3B0aW9ucygpIHtcbiAgICBsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIGlmIChkZWZhdWx0UGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICBkZWZhdWx0UGF0aCA9ICd1bnRpdGxlZC5tZCdcbiAgICAgIGlmIChwcm9qZWN0UGF0aCkge1xuICAgICAgICBkZWZhdWx0UGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgZGVmYXVsdFBhdGgpXG4gICAgICB9XG4gICAgfVxuICAgIGRlZmF1bHRQYXRoICs9ICcuJyArIGF0b21Db25maWcoKS5zYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0XG4gICAgcmV0dXJuIHsgZGVmYXVsdFBhdGggfVxuICB9XG5cbiAgcHVibGljIHNhdmVBcyhmaWxlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKGZpbGVQYXRoID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIGlmICh0aGlzLmxvYWRpbmcpIHRocm93IG5ldyBFcnJvcignUHJldmlldyBpcyBzdGlsbCBsb2FkaW5nJylcblxuICAgIGNvbnN0IHsgbmFtZSwgZXh0IH0gPSBwYXRoLnBhcnNlKGZpbGVQYXRoKVxuXG4gICAgaWYgKGV4dCA9PT0gJy5wZGYnKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucHJpbnRUb1BERih7fSwgKGVycm9yLCBkYXRhKSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRmFpbGVkIHNhdmluZyB0byBQREYnLCB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyb3IudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZGF0YSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbmRsZVByb21pc2UoXG4gICAgICAgIHRoaXMuZ2V0SFRNTFRvU2F2ZShmaWxlUGF0aCkudGhlbihhc3luYyAoaHRtbCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGZ1bGxIdG1sID0gdXRpbC5ta0h0bWwoXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgaHRtbCxcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScpLFxuICAgICAgICAgICAgYXdhaXQgdGhpcy5ydW5SZXF1ZXN0KCdnZXQtdGV4LWNvbmZpZycpLFxuICAgICAgICAgIClcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGZ1bGxIdG1sKVxuICAgICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZGlkU2Nyb2xsUHJldmlldyhfbWluOiBudW1iZXIsIF9tYXg6IG51bWJlcikge1xuICAgIC8qIG5vb3AsIGltcGxlbWVudGF0aW9uIGluIGVkaXRvciBwcmV2aWV3ICovXG4gIH1cblxuICBwcm90ZWN0ZWQgY2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcblxuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgIGlmIChwYW5lICE9PSB1bmRlZmluZWQgJiYgcGFuZSAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKSB7XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbSh0aGlzKVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBhc3luYyBnZXRNYXJrZG93blNvdXJjZSgpOiBQcm9taXNlPHN0cmluZz5cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0R3JhbW1hcigpOiBHcmFtbWFyIHwgdW5kZWZpbmVkXG5cbiAgcHJvdGVjdGVkIG9wZW5Tb3VyY2UoaW5pdGlhbExpbmU/OiBudW1iZXIpIHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7XG4gICAgICAgIGluaXRpYWxMaW5lLFxuICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIC8vXG4gIC8vIFNjcm9sbCB0aGUgYXNzb2NpYXRlZCBwcmV2aWV3IHRvIHRoZSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IGxpbmUgb2ZcbiAgLy8gb2YgdGhlIHNvdXJjZSBtYXJrZG93bi5cbiAgLy9cbiAgLy8gQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgLy8gQHBhcmFtIHtudW1iZXJ9IGxpbmUgVGFyZ2V0IGxpbmUgb2YgYHRleHRgLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0b1xuICAvLyAgIGlkZW50aWZ5IHRoZSBlbG1lbnQgb2YgdGhlIGFzc29jaWF0ZWQgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0aGF0IHJlcHJlc2VudHNcbiAgLy8gICBgbGluZWAgYW5kIHNjcm9sbCB0aGUgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0byB0aGF0IGVsZW1lbnQuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgZWxlbWVudCB0aGF0IHJlcHJlc2VudHMgYGxpbmVgLiBJZiBubyBlbGVtZW50IGlzXG4gIC8vICAgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gIC8vXG4gIHByb3RlY3RlZCBzeW5jUHJldmlldyhsaW5lOiBudW1iZXIpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc3luYyc+KCdzeW5jJywgeyBsaW5lIH0pXG4gIH1cblxuICBwcm90ZWN0ZWQgb3Blbk5ld1dpbmRvdygpIHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAnQ2FuIG5vdCBvcGVuIHRoaXMgcHJldmlldyBpbiBuZXcgd2luZG93OiBubyBmaWxlIHBhdGgnLFxuICAgICAgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGF0b20ub3Blbih7XG4gICAgICBwYXRoc1RvT3BlbjogW2BtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9maWxlLyR7cGF0aH1gXSxcbiAgICAgIG5ld1dpbmRvdzogdHJ1ZSxcbiAgICB9KVxuICAgIHV0aWwuZGVzdHJveSh0aGlzKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBydW5SZXF1ZXN0PFQgZXh0ZW5kcyBrZXlvZiBSZXF1ZXN0UmVwbHlNYXA+KHJlcXVlc3Q6IFQpIHtcbiAgICBjb25zdCBpZCA9IHRoaXMucmVwbHlDYWxsYmFja0lkKytcbiAgICByZXR1cm4gbmV3IFByb21pc2U8UmVxdWVzdFJlcGx5TWFwW1RdPigocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5yZXBseUNhbGxiYWNrcy5zZXQoaWQsIHtcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdCBhcyBhbnksXG4gICAgICAgIGNhbGxiYWNrOiAocmVzdWx0OiBSZXF1ZXN0UmVwbHlNYXBbVF0pID0+IHtcbiAgICAgICAgICB0aGlzLnJlcGx5Q2FsbGJhY2tzLmRlbGV0ZShpZClcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICB0aGlzLmVsZW1lbnQuc2VuZDxUPihyZXF1ZXN0LCB7IGlkIH0pXG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIoKCkgPT5cbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZFVwZGF0ZUdyYW1tYXIoXG4gICAgICAgIF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgICB9LCAyNTApLFxuICAgICAgKSxcbiAgICApXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4gdGhpcy5lbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAtMTAgfSksXG4gICAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHRoaXMuZWxlbWVudC5zY3JvbGxCeSh7IHRvcDogMTAgfSksXG4gICAgICAgICdjb3JlOmNvcHknOiAoZXZlbnQ6IENvbW1hbmRFdmVudCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmNvcHlUb0NsaXBib2FyZCgpKSBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOm9wZW4tZGV2LXRvb2xzJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5vcGVuRGV2VG9vbHMoKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOm5ldy13aW5kb3cnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5vcGVuTmV3V2luZG93KClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmludCc6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQucHJpbnQoKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy56b29tTGV2ZWwgKz0gMC4xXG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNldFpvb21MZXZlbCh0aGlzLnpvb21MZXZlbClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLW91dCc6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLnpvb21MZXZlbCAtPSAwLjFcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0Wm9vbUxldmVsKHRoaXMuem9vbUxldmVsKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnJlc2V0LXpvb20nOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy56b29tTGV2ZWwgPSAwXG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNldFpvb21MZXZlbCh0aGlzLnpvb21MZXZlbClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXNvdXJjZSc6IGFzeW5jIChfZXZlbnQpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc3luYy1zb3VyY2UnPignc3luYy1zb3VyY2UnLCB1bmRlZmluZWQpXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZycsICgpID0+IHtcbiAgICAgICAgaWYgKGF0b21Db25maWcoKS5yZW5kZXJlciA9PT0gJ21hcmtkb3duLWl0JykgdGhpcy5jaGFuZ2VIYW5kbGVyKClcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGlmIChhdG9tQ29uZmlnKCkucmVuZGVyZXIgPT09ICdwYW5kb2MnKSB0aGlzLmNoYW5nZUhhbmRsZXIoKVxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLmxhdGV4UmVuZGVyZXInLFxuICAgICAgICB0aGlzLmNoYW5nZUhhbmRsZXIsXG4gICAgICApLFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3JlbG9hZCc+KCdyZWxvYWQnLCB1bmRlZmluZWQpXG4gICAgICAgIH0sXG4gICAgICApLFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucmVuZGVyZXInLFxuICAgICAgICB0aGlzLmNoYW5nZUhhbmRsZXIsXG4gICAgICApLFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnLFxuICAgICAgICAoeyBuZXdWYWx1ZSB9KSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3VzZS1naXRodWItc3R5bGUnPigndXNlLWdpdGh1Yi1zdHlsZScsIHtcbiAgICAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgKSxcbiAgICApXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlbmRlck1hcmtkb3duKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgIGF3YWl0IHRoaXMucmVuZGVyTWFya2Rvd25UZXh0KHNvdXJjZSlcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0SFRNTFRvU2F2ZShzYXZlUGF0aDogc3RyaW5nKSB7XG4gICAgY29uc3Qgc291cmNlID0gYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpXG4gICAgcmV0dXJuIHJlbmRlcmVyLnJlbmRlcihcbiAgICAgIHNvdXJjZSxcbiAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgdGhpcy5nZXRHcmFtbWFyKCksXG4gICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgJ3NhdmUnLFxuICAgICAgc2F2ZVBhdGgsXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZW5kZXJNYXJrZG93blRleHQodGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRvbURvY3VtZW50ID0gYXdhaXQgcmVuZGVyZXIucmVuZGVyKFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgICAgdGhpcy5nZXRHcmFtbWFyKCksXG4gICAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAgIHRoaXMuZGVmYXVsdFJlbmRlck1vZGUsXG4gICAgICApXG4gICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2VcbiAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCd1cGRhdGUtcHJldmlldyc+KCd1cGRhdGUtcHJldmlldycsIHtcbiAgICAgICAgaHRtbDogZG9tRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTCxcbiAgICAgICAgcmVuZGVyTGFUZVg6IHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAgIG1qcmVuZGVyZXI6IGF0b21Db25maWcoKS5tYXRoQ29uZmlnLmxhdGV4UmVuZGVyZXIsXG4gICAgICB9KVxuICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3NldC1zb3VyY2UtbWFwJz4oJ3NldC1zb3VyY2UtbWFwJywge1xuICAgICAgICBtYXA6IHV0aWwuYnVpbGRMaW5lTWFwKG1hcmtkb3duSXQuZ2V0VG9rZW5zKHRleHQsIHRoaXMucmVuZGVyTGFUZVgpKSxcbiAgICAgIH0pXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1tYXJrZG93bicpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMuc2hvd0Vycm9yKGVycm9yIGFzIEVycm9yKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2hvd0Vycm9yKGVycm9yOiBFcnJvcikge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IoXG4gICAgICAgICdFcnJvciByZXBvcnRlZCBvbiBhIGRlc3Ryb3llZCBNYXJrZG93biBQcmV2aWV3IFBsdXMgdmlldycsXG4gICAgICAgIHtcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICB9LFxuICAgICAgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuZWxlbWVudC5zZW5kPCdlcnJvcic+KCdlcnJvcicsIHsgbXNnOiBlcnJvci5tZXNzYWdlIH0pXG4gIH1cblxuICBwcml2YXRlIGNvcHlUb0NsaXBib2FyZCgpIHtcbiAgICBpZiAodGhpcy5sb2FkaW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKVxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGlvbi5iYXNlTm9kZSBhcyBIVE1MRWxlbWVudFxuXG4gICAgLy8gVXNlIGRlZmF1bHQgY29weSBldmVudCBoYW5kbGVyIGlmIHRoZXJlIGlzIHNlbGVjdGVkIHRleHQgaW5zaWRlIHRoaXMgdmlld1xuICAgIGlmIChcbiAgICAgIHNlbGVjdGVkVGV4dCAmJlxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy9UT0RPOiBjb21wbGFpbiBvbiBUU1xuICAgICAgc2VsZWN0ZWROb2RlICE9IG51bGwgLy8gJiZcbiAgICAgIC8vICh0aGlzLnByZXZpZXcgPT09IHNlbGVjdGVkTm9kZSB8fCB0aGlzLnByZXZpZXcuY29udGFpbnMoc2VsZWN0ZWROb2RlKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGhhbmRsZVByb21pc2UoXG4gICAgICB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbihhc3luYyAoc3JjKSA9PlxuICAgICAgICBjb3B5SHRtbChzcmMsIHRoaXMuZ2V0UGF0aCgpLCB0aGlzLnJlbmRlckxhVGVYKSxcbiAgICAgICksXG4gICAgKVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlU3R5bGVzKCkge1xuICAgIGNvbnN0IHN0eWxlczogc3RyaW5nW10gPSBbXVxuICAgIGZvciAoY29uc3Qgc2Ugb2YgYXRvbS5zdHlsZXMuZ2V0U3R5bGVFbGVtZW50cygpKSB7XG4gICAgICBzdHlsZXMucHVzaChzZS5pbm5lckhUTUwpXG4gICAgfVxuICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzdHlsZSc+KCdzdHlsZScsIHsgc3R5bGVzIH0pXG4gIH1cbn1cbiJdfQ==