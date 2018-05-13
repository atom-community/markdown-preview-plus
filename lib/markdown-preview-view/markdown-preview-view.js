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
                    const path = this.getPath();
                    if (path === undefined)
                        break;
                    util_1.handlePromise(atom.workspace.open(path, {
                        initialLine: e.args[0].initialLine,
                        searchAllPanes: true,
                    }));
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
    syncPreview(line) {
        this.element.send('sync', { line });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBTWE7QUFDYiw0QkFBNEI7QUFDNUIseUJBQXlCO0FBR3pCLHdDQUF3QztBQUN4QyxvREFBb0Q7QUFDcEQsc0RBQXNEO0FBQ3RELGtDQUE2RDtBQUM3RCwrQkFBOEI7QUFhOUI7SUF1QkUsWUFDVSxvQkFBMEQsUUFBUSxFQUNsRSxjQUF1QixpQkFBVSxFQUFFLENBQUMsVUFBVTtTQUNuRCw2QkFBNkI7UUFGeEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFpRDtRQUNsRSxnQkFBVyxHQUFYLFdBQVcsQ0FDYTtRQXZCeEIsWUFBTyxHQUdaLElBQUksY0FBTyxFQUFFLENBQUE7UUFDUixnQkFBVyxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQTtRQUN2QyxjQUFTLEdBQUcsS0FBSyxDQUFBO1FBRW5CLFlBQU8sR0FBWSxJQUFJLENBQUE7UUFDdkIsY0FBUyxHQUFHLENBQUMsQ0FBQTtRQUNiLG1CQUFjLEdBQUcsSUFBSSxHQUFHLEVBUTdCLENBQUE7UUFDSyxvQkFBZSxHQUFHLENBQUMsQ0FBQTtRQW9OakIsa0JBQWEsR0FBRyxHQUFHLEVBQUU7WUFDN0Isb0JBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQTtZQUVwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDeEI7UUFDSCxDQUFDLENB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b3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmltcG9ydCB7XG4gIENvbW1hbmRFdmVudCxcbiAgRW1pdHRlcixcbiAgRGlzcG9zYWJsZSxcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgR3JhbW1hcixcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmltcG9ydCB7fSBmcm9tICdlbGVjdHJvbicgLy8gdGhpcyBpcyBoZXJlIHNvbGV5IGZvciB0eXBpbmdzXG5cbmltcG9ydCByZW5kZXJlciA9IHJlcXVpcmUoJy4uL3JlbmRlcmVyJylcbmltcG9ydCBtYXJrZG93bkl0ID0gcmVxdWlyZSgnLi4vbWFya2Rvd24taXQtaGVscGVyJylcbmltcG9ydCBpbWFnZVdhdGNoZXIgPSByZXF1aXJlKCcuLi9pbWFnZS13YXRjaC1oZWxwZXInKVxuaW1wb3J0IHsgaGFuZGxlUHJvbWlzZSwgY29weUh0bWwsIGF0b21Db25maWcgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBSZXF1ZXN0UmVwbHlNYXAgfSBmcm9tICcuLi8uLi9zcmMtY2xpZW50L2lwYydcblxuZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemVkTVBWIHtcbiAgZGVzZXJpYWxpemVyOiAnbWFya2Rvd24tcHJldmlldy1wbHVzL01hcmtkb3duUHJldmlld1ZpZXcnXG4gIGVkaXRvcklkPzogbnVtYmVyXG4gIGZpbGVQYXRoPzogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50ID0gRWxlY3Ryb24uV2Vidmlld1RhZyAmIHtcbiAgZ2V0TW9kZWwoKTogTWFya2Rvd25QcmV2aWV3Vmlld1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHB1YmxpYyByZWFkb25seSByZW5kZXJQcm9taXNlOiBQcm9taXNlPHZvaWQ+XG4gIHB1YmxpYyByZWFkb25seSBlbGVtZW50OiBNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudFxuICBwcm90ZWN0ZWQgZW1pdHRlcjogRW1pdHRlcjx7XG4gICAgJ2RpZC1jaGFuZ2UtdGl0bGUnOiB1bmRlZmluZWRcbiAgICAnZGlkLWNoYW5nZS1tYXJrZG93bic6IHVuZGVmaW5lZFxuICB9PiA9IG5ldyBFbWl0dGVyKClcbiAgcHJvdGVjdGVkIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBwcm90ZWN0ZWQgZGVzdHJveWVkID0gZmFsc2VcblxuICBwcml2YXRlIGxvYWRpbmc6IGJvb2xlYW4gPSB0cnVlXG4gIHByaXZhdGUgem9vbUxldmVsID0gMFxuICBwcml2YXRlIHJlcGx5Q2FsbGJhY2tzID0gbmV3IE1hcDxcbiAgICBudW1iZXIsXG4gICAge1xuICAgICAgW0sgaW4ga2V5b2YgUmVxdWVzdFJlcGx5TWFwXToge1xuICAgICAgICByZXF1ZXN0OiBLXG4gICAgICAgIGNhbGxiYWNrOiAocmVwbHk6IFJlcXVlc3RSZXBseU1hcFtLXSkgPT4gdm9pZFxuICAgICAgfVxuICAgIH1ba2V5b2YgUmVxdWVzdFJlcGx5TWFwXVxuICA+KClcbiAgcHJpdmF0ZSByZXBseUNhbGxiYWNrSWQgPSAwXG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZGVmYXVsdFJlbmRlck1vZGU6IEV4Y2x1ZGU8cmVuZGVyZXIuUmVuZGVyTW9kZSwgJ3NhdmUnPiA9ICdub3JtYWwnLFxuICAgIHByaXZhdGUgcmVuZGVyTGFUZVg6IGJvb2xlYW4gPSBhdG9tQ29uZmlnKCkubWF0aENvbmZpZ1xuICAgICAgLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0LFxuICApIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd3ZWJ2aWV3JykgYXMgYW55XG4gICAgdGhpcy5lbGVtZW50LmdldE1vZGVsID0gKCkgPT4gdGhpc1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMnLCAnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgdGhpcy5lbGVtZW50LmRpc2FibGV3ZWJzZWN1cml0eSA9ICd0cnVlJ1xuICAgIHRoaXMuZWxlbWVudC5ub2RlaW50ZWdyYXRpb24gPSAndHJ1ZSdcbiAgICB0aGlzLmVsZW1lbnQuc3JjID0gYGZpbGU6Ly8vJHtfX2Rpcm5hbWV9Ly4uLy4uL2NsaWVudC90ZW1wbGF0ZS5odG1sYFxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9ICcxMDAlJ1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMTAwJSdcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uc3R5bGVzLm9uRGlkQWRkU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgfSksXG4gICAgICBhdG9tLnN0eWxlcy5vbkRpZFJlbW92ZVN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgIH0pLFxuICAgICAgYXRvbS5zdHlsZXMub25EaWRVcGRhdGVTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB9KSxcbiAgICApXG4gICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ2lwYy1tZXNzYWdlJyxcbiAgICAgIChlOiBFbGVjdHJvbi5JcGNNZXNzYWdlRXZlbnRDdXN0b20pID0+IHtcbiAgICAgICAgc3dpdGNoIChlLmNoYW5uZWwpIHtcbiAgICAgICAgICBjYXNlICd6b29tLWluJzpcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLWluJyxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnem9vbS1vdXQnOlxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0JyxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnb3Blbi1zb3VyY2UnOlxuICAgICAgICAgICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgICAgICAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSBicmVha1xuICAgICAgICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbExpbmU6IGUuYXJnc1swXS5pbml0aWFsTGluZSxcbiAgICAgICAgICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ2RpZC1zY3JvbGwtcHJldmlldyc6XG4gICAgICAgICAgICBjb25zdCB7IG1pbiwgbWF4IH0gPSBlLmFyZ3NbMF1cbiAgICAgICAgICAgIHRoaXMuZGlkU2Nyb2xsUHJldmlldyhtaW4sIG1heClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAncmVsb2FkJzpcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZWxvYWQoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAvLyByZXBsaWVzXG4gICAgICAgICAgY2FzZSAncmVxdWVzdC1yZXBseSc6IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaWQsIHJlcXVlc3QsIHJlc3VsdCB9ID0gZS5hcmdzWzBdXG4gICAgICAgICAgICBjb25zdCBjYiA9IHRoaXMucmVwbHlDYWxsYmFja3MuZ2V0KGlkKVxuICAgICAgICAgICAgaWYgKGNiICYmIHJlcXVlc3QgPT09IGNiLnJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2FsbGJhY2s6IChyOiBhbnkpID0+IHZvaWQgPSBjYi5jYWxsYmFja1xuICAgICAgICAgICAgICBjYWxsYmFjayhyZXN1bHQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3dpbGwtbmF2aWdhdGUnLCBhc3luYyAoZSkgPT4ge1xuICAgICAgY29uc3QgeyBzaGVsbCB9ID0gYXdhaXQgaW1wb3J0KCdlbGVjdHJvbicpXG4gICAgICBjb25zdCBmaWxlVXJpVG9QYXRoID0gYXdhaXQgaW1wb3J0KCdmaWxlLXVyaS10by1wYXRoJylcbiAgICAgIGlmIChlLnVybC5zdGFydHNXaXRoKCdmaWxlOi8vJykpIHtcbiAgICAgICAgaGFuZGxlUHJvbWlzZShhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVVcmlUb1BhdGgoZS51cmwpKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbChlLnVybClcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMucmVuZGVyUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBvbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3VzZS1naXRodWItc3R5bGUnPigndXNlLWdpdGh1Yi1zdHlsZScsIHtcbiAgICAgICAgICB2YWx1ZTogYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnKSxcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3NldC1hdG9tLWhvbWUnPignc2V0LWF0b20taG9tZScsIHtcbiAgICAgICAgICBob21lOiBhdG9tLmdldENvbmZpZ0RpclBhdGgoKSxcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3NldC1udW1iZXItZXFucyc+KCdzZXQtbnVtYmVyLWVxbnMnLCB7XG4gICAgICAgICAgbnVtYmVyRXFuczogYXRvbUNvbmZpZygpLm1hdGhDb25maWcubnVtYmVyRXF1YXRpb25zLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc2V0LWJhc2UtcGF0aCc+KCdzZXQtYmFzZS1wYXRoJywge1xuICAgICAgICAgIHBhdGg6IHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICAgIHJlc29sdmUodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgfVxuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RvbS1yZWFkeScsIG9ubG9hZClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJ1bkpTPFQ+KGpzOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+XG4gICAgICB0aGlzLmVsZW1lbnQuZXhlY3V0ZUphdmFTY3JpcHQoanMsIGZhbHNlLCByZXNvbHZlKSxcbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SFRNTFNWRygpIHtcbiAgICByZXR1cm4gdGhpcy5ydW5SZXF1ZXN0KCdnZXQtaHRtbC1zdmcnKVxuICB9XG5cbiAgcHVibGljIGFic3RyYWN0IHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkTVBWXG5cbiAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWVcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBwYXRoICYmIGltYWdlV2F0Y2hlci5yZW1vdmVGaWxlKHBhdGgpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKClcbiAgfVxuXG4gIHB1YmxpYyBvbkRpZENoYW5nZVRpdGxlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgcHVibGljIG9uRGlkQ2hhbmdlTWFya2Rvd24oY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLW1hcmtkb3duJywgY2FsbGJhY2spXG4gIH1cblxuICBwdWJsaWMgdG9nZ2xlUmVuZGVyTGF0ZXgoKSB7XG4gICAgdGhpcy5yZW5kZXJMYVRlWCA9ICF0aGlzLnJlbmRlckxhVGVYXG4gICAgdGhpcy5jaGFuZ2VIYW5kbGVyKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyByZWZyZXNoSW1hZ2VzKG9sZHNyYzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdiA9IGF3YWl0IGltYWdlV2F0Y2hlci5nZXRWZXJzaW9uKG9sZHNyYywgdGhpcy5nZXRQYXRoKCkpXG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J3VwZGF0ZS1pbWFnZXMnPigndXBkYXRlLWltYWdlcycsIHsgb2xkc3JjLCB2IH0pXG4gIH1cblxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0VGl0bGUoKTogc3RyaW5nXG5cbiAgcHVibGljIGdldERlZmF1bHRMb2NhdGlvbigpOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJyB7XG4gICAgcmV0dXJuIGF0b21Db25maWcoKS5wcmV2aWV3Q29uZmlnLnByZXZpZXdEb2NrXG4gIH1cblxuICBwdWJsaWMgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuICdtYXJrZG93bidcbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRVUkkoKTogc3RyaW5nXG5cbiAgcHVibGljIGFic3RyYWN0IGdldFBhdGgoKTogc3RyaW5nIHwgdW5kZWZpbmVkXG5cbiAgcHVibGljIGdldFNhdmVEaWFsb2dPcHRpb25zKCkge1xuICAgIGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgaWYgKGRlZmF1bHRQYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgIGRlZmF1bHRQYXRoID0gJ3VudGl0bGVkLm1kJ1xuICAgICAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgICAgIGRlZmF1bHRQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBkZWZhdWx0UGF0aClcbiAgICAgIH1cbiAgICB9XG4gICAgZGVmYXVsdFBhdGggKz0gJy4nICsgYXRvbUNvbmZpZygpLnNhdmVDb25maWcuZGVmYXVsdFNhdmVGb3JtYXRcbiAgICByZXR1cm4geyBkZWZhdWx0UGF0aCB9XG4gIH1cblxuICBwdWJsaWMgc2F2ZUFzKGZpbGVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoZmlsZVBhdGggPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgaWYgKHRoaXMubG9hZGluZykgdGhyb3cgbmV3IEVycm9yKCdQcmV2aWV3IGlzIHN0aWxsIGxvYWRpbmcnKVxuXG4gICAgY29uc3QgeyBuYW1lLCBleHQgfSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpXG5cbiAgICBpZiAoZXh0ID09PSAnLnBkZicpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5wcmludFRvUERGKHt9LCAoZXJyb3IsIGRhdGEpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgc2F2aW5nIHRvIFBERicsIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlcnJvci50b1N0cmluZygpLFxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBkYXRhKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgdGhpcy5nZXRIVE1MVG9TYXZlKGZpbGVQYXRoKS50aGVuKGFzeW5jIChodG1sKSA9PiB7XG4gICAgICAgICAgY29uc3QgZnVsbEh0bWwgPSB1dGlsLm1rSHRtbChcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgICAgIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyksXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJ1blJlcXVlc3QoJ2dldC10ZXgtY29uZmlnJyksXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZnVsbEh0bWwpXG4gICAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBkaWRTY3JvbGxQcmV2aWV3KF9taW46IG51bWJlciwgX21heDogbnVtYmVyKSB7XG4gICAgLyogbm9vcCwgaW1wbGVtZW50YXRpb24gaW4gZWRpdG9yIHByZXZpZXcgKi9cbiAgfVxuXG4gIHByb3RlY3RlZCBjaGFuZ2VIYW5kbGVyID0gKCkgPT4ge1xuICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuXG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgaWYgKHBhbmUgIT09IHVuZGVmaW5lZCAmJiBwYW5lICE9PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkpIHtcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGFzeW5jIGdldE1hcmtkb3duU291cmNlKCk6IFByb21pc2U8c3RyaW5nPlxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRHcmFtbWFyKCk6IEdyYW1tYXIgfCB1bmRlZmluZWRcblxuICAvL1xuICAvLyBTY3JvbGwgdGhlIGFzc29jaWF0ZWQgcHJldmlldyB0byB0aGUgZWxlbWVudCByZXByZXNlbnRpbmcgdGhlIHRhcmdldCBsaW5lIG9mXG4gIC8vIG9mIHRoZSBzb3VyY2UgbWFya2Rvd24uXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRhcmdldCBsaW5lIG9mIGB0ZXh0YC4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG9cbiAgLy8gICBpZGVudGlmeSB0aGUgZWxtZW50IG9mIHRoZSBhc3NvY2lhdGVkIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdGhhdCByZXByZXNlbnRzXG4gIC8vICAgYGxpbmVgIGFuZCBzY3JvbGwgdGhlIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdG8gdGhhdCBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGBsaW5lYC4gSWYgbm8gZWxlbWVudCBpc1xuICAvLyAgIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBwcm90ZWN0ZWQgc3luY1ByZXZpZXcobGluZTogbnVtYmVyKSB7XG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J3N5bmMnPignc3luYycsIHsgbGluZSB9KVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBydW5SZXF1ZXN0PFQgZXh0ZW5kcyBrZXlvZiBSZXF1ZXN0UmVwbHlNYXA+KHJlcXVlc3Q6IFQpIHtcbiAgICBjb25zdCBpZCA9IHRoaXMucmVwbHlDYWxsYmFja0lkKytcbiAgICByZXR1cm4gbmV3IFByb21pc2U8UmVxdWVzdFJlcGx5TWFwW1RdPigocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5yZXBseUNhbGxiYWNrcy5zZXQoaWQsIHtcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdCBhcyBhbnksXG4gICAgICAgIGNhbGxiYWNrOiAocmVzdWx0OiBSZXF1ZXN0UmVwbHlNYXBbVF0pID0+IHtcbiAgICAgICAgICB0aGlzLnJlcGx5Q2FsbGJhY2tzLmRlbGV0ZShpZClcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICB0aGlzLmVsZW1lbnQuc2VuZDxUPihyZXF1ZXN0LCB7IGlkIH0pXG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIoKCkgPT5cbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZFVwZGF0ZUdyYW1tYXIoXG4gICAgICAgIF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgICB9LCAyNTApLFxuICAgICAgKSxcbiAgICApXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4gdGhpcy5lbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAtMTAgfSksXG4gICAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHRoaXMuZWxlbWVudC5zY3JvbGxCeSh7IHRvcDogMTAgfSksXG4gICAgICAgICdjb3JlOmNvcHknOiAoZXZlbnQ6IENvbW1hbmRFdmVudCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmNvcHlUb0NsaXBib2FyZCgpKSBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOm9wZW4tZGV2LXRvb2xzJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5vcGVuRGV2VG9vbHMoKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByaW50JzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5wcmludCgpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pbic6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLnpvb21MZXZlbCArPSAwLjFcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0Wm9vbUxldmVsKHRoaXMuem9vbUxldmVsKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0JzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuem9vbUxldmVsIC09IDAuMVxuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cmVzZXQtem9vbSc6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLnpvb21MZXZlbCA9IDBcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0Wm9vbUxldmVsKHRoaXMuem9vbUxldmVsKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtc291cmNlJzogYXN5bmMgKF9ldmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzeW5jLXNvdXJjZSc+KCdzeW5jLXNvdXJjZScsIHVuZGVmaW5lZClcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpZiAoYXRvbUNvbmZpZygpLnJlbmRlcmVyID09PSAnbWFya2Rvd24taXQnKSB0aGlzLmNoYW5nZUhhbmRsZXIoKVxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZycsICgpID0+IHtcbiAgICAgICAgaWYgKGF0b21Db25maWcoKS5yZW5kZXJlciA9PT0gJ3BhbmRvYycpIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubGF0ZXhSZW5kZXJlcicsXG4gICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcixcbiAgICAgICksXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLm51bWJlckVxdWF0aW9ucycsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwncmVsb2FkJz4oJ3JlbG9hZCcsIHVuZGVmaW5lZClcbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5yZW5kZXJlcicsXG4gICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcixcbiAgICAgICksXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScsXG4gICAgICAgICh7IG5ld1ZhbHVlIH0pID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwndXNlLWdpdGh1Yi1zdHlsZSc+KCd1c2UtZ2l0aHViLXN0eWxlJywge1xuICAgICAgICAgICAgdmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICApLFxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVuZGVyTWFya2Rvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc291cmNlID0gYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJNYXJrZG93blRleHQoc291cmNlKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRIVE1MVG9TYXZlKHNhdmVQYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICByZXR1cm4gcmVuZGVyZXIucmVuZGVyKFxuICAgICAgc291cmNlLFxuICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAnc2F2ZScsXG4gICAgICBzYXZlUGF0aCxcbiAgICApXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlbmRlck1hcmtkb3duVGV4dCh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZG9tRG9jdW1lbnQgPSBhd2FpdCByZW5kZXJlci5yZW5kZXIoXG4gICAgICAgIHRleHQsXG4gICAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgdGhpcy5kZWZhdWx0UmVuZGVyTW9kZSxcbiAgICAgIClcbiAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3VwZGF0ZS1wcmV2aWV3Jz4oJ3VwZGF0ZS1wcmV2aWV3Jywge1xuICAgICAgICBodG1sOiBkb21Eb2N1bWVudC5kb2N1bWVudEVsZW1lbnQub3V0ZXJIVE1MLFxuICAgICAgICByZW5kZXJMYVRlWDogdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgbWpyZW5kZXJlcjogYXRvbUNvbmZpZygpLm1hdGhDb25maWcubGF0ZXhSZW5kZXJlcixcbiAgICAgIH0pXG4gICAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc2V0LXNvdXJjZS1tYXAnPignc2V0LXNvdXJjZS1tYXAnLCB7XG4gICAgICAgIG1hcDogdXRpbC5idWlsZExpbmVNYXAobWFya2Rvd25JdC5nZXRUb2tlbnModGV4dCwgdGhpcy5yZW5kZXJMYVRlWCkpLFxuICAgICAgfSlcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLW1hcmtkb3duJylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5zaG93RXJyb3IoZXJyb3IgYXMgRXJyb3IpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzaG93RXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihcbiAgICAgICAgJ0Vycm9yIHJlcG9ydGVkIG9uIGEgZGVzdHJveWVkIE1hcmtkb3duIFByZXZpZXcgUGx1cyB2aWV3JyxcbiAgICAgICAge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgICBkZXRhaWw6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIH0sXG4gICAgICApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J2Vycm9yJz4oJ2Vycm9yJywgeyBtc2c6IGVycm9yLm1lc3NhZ2UgfSlcbiAgfVxuXG4gIHByaXZhdGUgY29weVRvQ2xpcGJvYXJkKCkge1xuICAgIGlmICh0aGlzLmxvYWRpbmcpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKVxuICAgIGNvbnN0IHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gc2VsZWN0aW9uLmJhc2VOb2RlIGFzIEhUTUxFbGVtZW50XG5cbiAgICAvLyBVc2UgZGVmYXVsdCBjb3B5IGV2ZW50IGhhbmRsZXIgaWYgdGhlcmUgaXMgc2VsZWN0ZWQgdGV4dCBpbnNpZGUgdGhpcyB2aWV3XG4gICAgaWYgKFxuICAgICAgc2VsZWN0ZWRUZXh0ICYmXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c3RyaWN0LXR5cGUtcHJlZGljYXRlcyAvL1RPRE86IGNvbXBsYWluIG9uIFRTXG4gICAgICBzZWxlY3RlZE5vZGUgIT0gbnVsbCAvLyAmJlxuICAgICAgLy8gKHRoaXMucHJldmlldyA9PT0gc2VsZWN0ZWROb2RlIHx8IHRoaXMucHJldmlldy5jb250YWlucyhzZWxlY3RlZE5vZGUpKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaGFuZGxlUHJvbWlzZShcbiAgICAgIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKGFzeW5jIChzcmMpID0+XG4gICAgICAgIGNvcHlIdG1sKHNyYywgdGhpcy5nZXRQYXRoKCksIHRoaXMucmVuZGVyTGFUZVgpLFxuICAgICAgKSxcbiAgICApXG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTdHlsZXMoKSB7XG4gICAgY29uc3Qgc3R5bGVzOiBzdHJpbmdbXSA9IFtdXG4gICAgZm9yIChjb25zdCBzZSBvZiBhdG9tLnN0eWxlcy5nZXRTdHlsZUVsZW1lbnRzKCkpIHtcbiAgICAgIHN0eWxlcy5wdXNoKHNlLmlubmVySFRNTClcbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J3N0eWxlJz4oJ3N0eWxlJywgeyBzdHlsZXMgfSlcbiAgfVxufVxuIl19