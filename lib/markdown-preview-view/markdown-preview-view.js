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
                default:
                    console.debug(`Unknown message recieved ${e.channel}`);
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
        await this.getHTMLSVGPromise;
        this.getHTMLSVGPromise = new Promise((resolve) => {
            const handler = (e) => {
                if (e.channel === 'html-svg-result') {
                    this.element.removeEventListener('ipc-message', handler);
                    resolve(e.args[0]);
                }
            };
            this.element.addEventListener('ipc-message', handler);
        });
        this.element.send('get-html-svg', undefined);
        return this.getHTMLSVGPromise;
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
                const fullHtml = util.mkHtml(name, html, this.renderLaTeX, atom.config.get('markdown-preview-plus.useGitHubStyle'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBTWE7QUFDYiw0QkFBNEI7QUFDNUIseUJBQXlCO0FBR3pCLHdDQUF3QztBQUN4QyxvREFBb0Q7QUFDcEQsc0RBQXNEO0FBQ3RELGtDQUE2RDtBQUM3RCwrQkFBOEI7QUFZOUI7SUFjRSxZQUNVLG9CQUEwRCxRQUFRLEVBQ2xFLGNBQXVCLGlCQUFVLEVBQUUsQ0FBQyxVQUFVO1NBQ25ELDZCQUE2QjtRQUZ4QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWlEO1FBQ2xFLGdCQUFXLEdBQVgsV0FBVyxDQUNhO1FBZHhCLFlBQU8sR0FHWixJQUFJLGNBQU8sRUFBRSxDQUFBO1FBQ1IsZ0JBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDdkMsY0FBUyxHQUFHLEtBQUssQ0FBQTtRQUVuQixZQUFPLEdBQVksSUFBSSxDQUFBO1FBQ3ZCLGNBQVMsR0FBRyxDQUFDLENBQUE7UUF3Tlgsa0JBQWEsR0FBRyxHQUFHLEVBQUU7WUFDN0Isb0JBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQTtZQUVwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDeEI7UUFDSCxDQUFDLENBQUE7UUF2TkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBUSxDQUFBO1FB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UUFHdEQsSUFDRSxZQUFZO1lBRVosWUFBWSxJQUFJLElBQUksRUFFcEI7WUFDQSxPQUFPLEtBQUssQ0FBQTtTQUNiO1FBRUQsb0JBQWEsQ0FDWCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQzFDLGVBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FDaEQsQ0FDRixDQUFBO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRU8sWUFBWTtRQUNsQixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUE7UUFDM0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUU7WUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUE7U0FDMUI7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBVSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ2pELENBQUM7Q0FDRjtBQXhhRCxrREF3YUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuaW1wb3J0IHtcbiAgQ29tbWFuZEV2ZW50LFxuICBFbWl0dGVyLFxuICBEaXNwb3NhYmxlLFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBHcmFtbWFyLFxufSBmcm9tICdhdG9tJ1xuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKVxuaW1wb3J0IHt9IGZyb20gJ2VsZWN0cm9uJyAvLyB0aGlzIGlzIGhlcmUgc29sZXkgZm9yIHR5cGluZ3NcblxuaW1wb3J0IHJlbmRlcmVyID0gcmVxdWlyZSgnLi4vcmVuZGVyZXInKVxuaW1wb3J0IG1hcmtkb3duSXQgPSByZXF1aXJlKCcuLi9tYXJrZG93bi1pdC1oZWxwZXInKVxuaW1wb3J0IGltYWdlV2F0Y2hlciA9IHJlcXVpcmUoJy4uL2ltYWdlLXdhdGNoLWhlbHBlcicpXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlLCBjb3B5SHRtbCwgYXRvbUNvbmZpZyB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemVkTVBWIHtcbiAgZGVzZXJpYWxpemVyOiAnbWFya2Rvd24tcHJldmlldy1wbHVzL01hcmtkb3duUHJldmlld1ZpZXcnXG4gIGVkaXRvcklkPzogbnVtYmVyXG4gIGZpbGVQYXRoPzogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50ID0gRWxlY3Ryb24uV2Vidmlld1RhZyAmIHtcbiAgZ2V0TW9kZWwoKTogTWFya2Rvd25QcmV2aWV3Vmlld1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHB1YmxpYyByZWFkb25seSByZW5kZXJQcm9taXNlOiBQcm9taXNlPHZvaWQ+XG4gIHB1YmxpYyByZWFkb25seSBlbGVtZW50OiBNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudFxuICBwcm90ZWN0ZWQgZW1pdHRlcjogRW1pdHRlcjx7XG4gICAgJ2RpZC1jaGFuZ2UtdGl0bGUnOiB1bmRlZmluZWRcbiAgICAnZGlkLWNoYW5nZS1tYXJrZG93bic6IHVuZGVmaW5lZFxuICB9PiA9IG5ldyBFbWl0dGVyKClcbiAgcHJvdGVjdGVkIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBwcm90ZWN0ZWQgZGVzdHJveWVkID0gZmFsc2VcblxuICBwcml2YXRlIGxvYWRpbmc6IGJvb2xlYW4gPSB0cnVlXG4gIHByaXZhdGUgem9vbUxldmVsID0gMFxuICBwcml2YXRlIGdldEhUTUxTVkdQcm9taXNlPzogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZGVmYXVsdFJlbmRlck1vZGU6IEV4Y2x1ZGU8cmVuZGVyZXIuUmVuZGVyTW9kZSwgJ3NhdmUnPiA9ICdub3JtYWwnLFxuICAgIHByaXZhdGUgcmVuZGVyTGFUZVg6IGJvb2xlYW4gPSBhdG9tQ29uZmlnKCkubWF0aENvbmZpZ1xuICAgICAgLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0LFxuICApIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd3ZWJ2aWV3JykgYXMgYW55XG4gICAgdGhpcy5lbGVtZW50LmdldE1vZGVsID0gKCkgPT4gdGhpc1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMnLCAnbmF0aXZlLWtleS1iaW5kaW5ncycpXG4gICAgdGhpcy5lbGVtZW50LmRpc2FibGV3ZWJzZWN1cml0eSA9ICd0cnVlJ1xuICAgIHRoaXMuZWxlbWVudC5ub2RlaW50ZWdyYXRpb24gPSAndHJ1ZSdcbiAgICB0aGlzLmVsZW1lbnQuc3JjID0gYGZpbGU6Ly8vJHtfX2Rpcm5hbWV9Ly4uLy4uL2NsaWVudC90ZW1wbGF0ZS5odG1sYFxuICAgIHRoaXMuZWxlbWVudC5zdHlsZS53aWR0aCA9ICcxMDAlJ1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMTAwJSdcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uc3R5bGVzLm9uRGlkQWRkU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgfSksXG4gICAgICBhdG9tLnN0eWxlcy5vbkRpZFJlbW92ZVN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgIH0pLFxuICAgICAgYXRvbS5zdHlsZXMub25EaWRVcGRhdGVTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB9KSxcbiAgICApXG4gICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ2lwYy1tZXNzYWdlJyxcbiAgICAgIChlOiBFbGVjdHJvbi5JcGNNZXNzYWdlRXZlbnRDdXN0b20pID0+IHtcbiAgICAgICAgc3dpdGNoIChlLmNoYW5uZWwpIHtcbiAgICAgICAgICBjYXNlICd6b29tLWluJzpcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLWluJyxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnem9vbS1vdXQnOlxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0JyxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnb3Blbi1zb3VyY2UnOlxuICAgICAgICAgICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgICAgICAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSBicmVha1xuICAgICAgICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbExpbmU6IGUuYXJnc1swXS5pbml0aWFsTGluZSxcbiAgICAgICAgICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ2RpZC1zY3JvbGwtcHJldmlldyc6XG4gICAgICAgICAgICBjb25zdCB7IG1pbiwgbWF4IH0gPSBlLmFyZ3NbMF1cbiAgICAgICAgICAgIHRoaXMuZGlkU2Nyb2xsUHJldmlldyhtaW4sIG1heClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAncmVsb2FkJzpcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZWxvYWQoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgVW5rbm93biBtZXNzYWdlIHJlY2lldmVkICR7ZS5jaGFubmVsfWApXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKVxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd3aWxsLW5hdmlnYXRlJywgYXN5bmMgKGUpID0+IHtcbiAgICAgIGNvbnN0IHsgc2hlbGwgfSA9IGF3YWl0IGltcG9ydCgnZWxlY3Ryb24nKVxuICAgICAgY29uc3QgZmlsZVVyaVRvUGF0aCA9IGF3YWl0IGltcG9ydCgnZmlsZS11cmktdG8tcGF0aCcpXG4gICAgICBpZiAoZS51cmwuc3RhcnRzV2l0aCgnZmlsZTovLycpKSB7XG4gICAgICAgIGhhbmRsZVByb21pc2UoYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlVXJpVG9QYXRoKGUudXJsKSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoZS51cmwpXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLnJlbmRlclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3Qgb25sb2FkID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgICAgICB0aGlzLmVsZW1lbnQuc2V0Wm9vbUxldmVsKHRoaXMuem9vbUxldmVsKVxuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCd1c2UtZ2l0aHViLXN0eWxlJz4oJ3VzZS1naXRodWItc3R5bGUnLCB7XG4gICAgICAgICAgdmFsdWU6IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyksXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzZXQtYXRvbS1ob21lJz4oJ3NldC1hdG9tLWhvbWUnLCB7XG4gICAgICAgICAgaG9tZTogYXRvbS5nZXRDb25maWdEaXJQYXRoKCksXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzZXQtbnVtYmVyLWVxbnMnPignc2V0LW51bWJlci1lcW5zJywge1xuICAgICAgICAgIG51bWJlckVxbnM6IGF0b21Db25maWcoKS5tYXRoQ29uZmlnLm51bWJlckVxdWF0aW9ucyxcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3NldC1iYXNlLXBhdGgnPignc2V0LWJhc2UtcGF0aCcsIHtcbiAgICAgICAgICBwYXRoOiB0aGlzLmdldFBhdGgoKSxcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICByZXNvbHZlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgIH1cbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkb20tcmVhZHknLCBvbmxvYWQpXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBydW5KUzxUPihqczogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlKSA9PlxuICAgICAgdGhpcy5lbGVtZW50LmV4ZWN1dGVKYXZhU2NyaXB0KGpzLCBmYWxzZSwgcmVzb2x2ZSksXG4gICAgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEhUTUxTVkcoKSB7XG4gICAgYXdhaXQgdGhpcy5nZXRIVE1MU1ZHUHJvbWlzZVxuICAgIHRoaXMuZ2V0SFRNTFNWR1Byb21pc2UgPSBuZXcgUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gKGU6IEVsZWN0cm9uLklwY01lc3NhZ2VFdmVudEN1c3RvbSkgPT4ge1xuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IHRvdGFsaXR5LWNoZWNrXG4gICAgICAgIGlmIChlLmNoYW5uZWwgPT09ICdodG1sLXN2Zy1yZXN1bHQnKSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgaGFuZGxlciBhcyBhbnkpXG4gICAgICAgICAgcmVzb2x2ZShlLmFyZ3NbMF0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIGhhbmRsZXIpXG4gICAgfSlcbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnZ2V0LWh0bWwtc3ZnJz4oJ2dldC1odG1sLXN2ZycsIHVuZGVmaW5lZClcbiAgICByZXR1cm4gdGhpcy5nZXRIVE1MU1ZHUHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFic3RyYWN0IHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkTVBWXG5cbiAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWVcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBwYXRoICYmIGltYWdlV2F0Y2hlci5yZW1vdmVGaWxlKHBhdGgpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKClcbiAgfVxuXG4gIHB1YmxpYyBvbkRpZENoYW5nZVRpdGxlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgcHVibGljIG9uRGlkQ2hhbmdlTWFya2Rvd24oY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLW1hcmtkb3duJywgY2FsbGJhY2spXG4gIH1cblxuICBwdWJsaWMgdG9nZ2xlUmVuZGVyTGF0ZXgoKSB7XG4gICAgdGhpcy5yZW5kZXJMYVRlWCA9ICF0aGlzLnJlbmRlckxhVGVYXG4gICAgdGhpcy5jaGFuZ2VIYW5kbGVyKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyByZWZyZXNoSW1hZ2VzKG9sZHNyYzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdiA9IGF3YWl0IGltYWdlV2F0Y2hlci5nZXRWZXJzaW9uKG9sZHNyYywgdGhpcy5nZXRQYXRoKCkpXG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J3VwZGF0ZS1pbWFnZXMnPigndXBkYXRlLWltYWdlcycsIHsgb2xkc3JjLCB2IH0pXG4gIH1cblxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0VGl0bGUoKTogc3RyaW5nXG5cbiAgcHVibGljIGdldERlZmF1bHRMb2NhdGlvbigpOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJyB7XG4gICAgcmV0dXJuIGF0b21Db25maWcoKS5wcmV2aWV3Q29uZmlnLnByZXZpZXdEb2NrXG4gIH1cblxuICBwdWJsaWMgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuICdtYXJrZG93bidcbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRVUkkoKTogc3RyaW5nXG5cbiAgcHVibGljIGFic3RyYWN0IGdldFBhdGgoKTogc3RyaW5nIHwgdW5kZWZpbmVkXG5cbiAgcHVibGljIGdldFNhdmVEaWFsb2dPcHRpb25zKCkge1xuICAgIGxldCBkZWZhdWx0UGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgaWYgKGRlZmF1bHRQYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgIGRlZmF1bHRQYXRoID0gJ3VudGl0bGVkLm1kJ1xuICAgICAgaWYgKHByb2plY3RQYXRoKSB7XG4gICAgICAgIGRlZmF1bHRQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBkZWZhdWx0UGF0aClcbiAgICAgIH1cbiAgICB9XG4gICAgZGVmYXVsdFBhdGggKz0gJy4nICsgYXRvbUNvbmZpZygpLnNhdmVDb25maWcuZGVmYXVsdFNhdmVGb3JtYXRcbiAgICByZXR1cm4geyBkZWZhdWx0UGF0aCB9XG4gIH1cblxuICBwdWJsaWMgc2F2ZUFzKGZpbGVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoZmlsZVBhdGggPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgaWYgKHRoaXMubG9hZGluZykgdGhyb3cgbmV3IEVycm9yKCdQcmV2aWV3IGlzIHN0aWxsIGxvYWRpbmcnKVxuXG4gICAgY29uc3QgeyBuYW1lLCBleHQgfSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpXG5cbiAgICBpZiAoZXh0ID09PSAnLnBkZicpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5wcmludFRvUERGKHt9LCAoZXJyb3IsIGRhdGEpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgc2F2aW5nIHRvIFBERicsIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlcnJvci50b1N0cmluZygpLFxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBkYXRhKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgdGhpcy5nZXRIVE1MVG9TYXZlKGZpbGVQYXRoKS50aGVuKGFzeW5jIChodG1sKSA9PiB7XG4gICAgICAgICAgY29uc3QgZnVsbEh0bWwgPSB1dGlsLm1rSHRtbChcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgICAgIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyksXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZnVsbEh0bWwpXG4gICAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBkaWRTY3JvbGxQcmV2aWV3KF9taW46IG51bWJlciwgX21heDogbnVtYmVyKSB7XG4gICAgLyogbm9vcCwgaW1wbGVtZW50YXRpb24gaW4gZWRpdG9yIHByZXZpZXcgKi9cbiAgfVxuXG4gIHByb3RlY3RlZCBjaGFuZ2VIYW5kbGVyID0gKCkgPT4ge1xuICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuXG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgaWYgKHBhbmUgIT09IHVuZGVmaW5lZCAmJiBwYW5lICE9PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkpIHtcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGFzeW5jIGdldE1hcmtkb3duU291cmNlKCk6IFByb21pc2U8c3RyaW5nPlxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRHcmFtbWFyKCk6IEdyYW1tYXIgfCB1bmRlZmluZWRcblxuICAvL1xuICAvLyBTY3JvbGwgdGhlIGFzc29jaWF0ZWQgcHJldmlldyB0byB0aGUgZWxlbWVudCByZXByZXNlbnRpbmcgdGhlIHRhcmdldCBsaW5lIG9mXG4gIC8vIG9mIHRoZSBzb3VyY2UgbWFya2Rvd24uXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRhcmdldCBsaW5lIG9mIGB0ZXh0YC4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG9cbiAgLy8gICBpZGVudGlmeSB0aGUgZWxtZW50IG9mIHRoZSBhc3NvY2lhdGVkIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdGhhdCByZXByZXNlbnRzXG4gIC8vICAgYGxpbmVgIGFuZCBzY3JvbGwgdGhlIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdG8gdGhhdCBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGBsaW5lYC4gSWYgbm8gZWxlbWVudCBpc1xuICAvLyAgIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBwcm90ZWN0ZWQgc3luY1ByZXZpZXcobGluZTogbnVtYmVyKSB7XG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J3N5bmMnPignc3luYycsIHsgbGluZSB9KVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVFdmVudHMoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkQWRkR3JhbW1hcigoKSA9PlxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkVXBkYXRlR3JhbW1hcihcbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PiB0aGlzLmVsZW1lbnQuc2Nyb2xsQnkoeyB0b3A6IC0xMCB9KSxcbiAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT4gdGhpcy5lbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAxMCB9KSxcbiAgICAgICAgJ2NvcmU6Y29weSc6IChldmVudDogQ29tbWFuZEV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuY29weVRvQ2xpcGJvYXJkKCkpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6b3Blbi1kZXYtdG9vbHMnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50Lm9wZW5EZXZUb29scygpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJpbnQnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnByaW50KClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLWluJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuem9vbUxldmVsICs9IDAuMVxuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy56b29tTGV2ZWwgLT0gMC4xXG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNldFpvb21MZXZlbCh0aGlzLnpvb21MZXZlbClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpyZXNldC16b29tJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuem9vbUxldmVsID0gMFxuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1zb3VyY2UnOiBhc3luYyAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3N5bmMtc291cmNlJz4oJ3N5bmMtc291cmNlJywgdW5kZWZpbmVkKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGlmIChhdG9tQ29uZmlnKCkucmVuZGVyZXIgPT09ICdtYXJrZG93bi1pdCcpIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpZiAoYXRvbUNvbmZpZygpLnJlbmRlcmVyID09PSAncGFuZG9jJykgdGhpcy5jaGFuZ2VIYW5kbGVyKClcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJyxcbiAgICAgICAgdGhpcy5jaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubnVtYmVyRXF1YXRpb25zJyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdyZWxvYWQnPigncmVsb2FkJywgdW5kZWZpbmVkKVxuICAgICAgICB9LFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnJlbmRlcmVyJyxcbiAgICAgICAgdGhpcy5jaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyxcbiAgICAgICAgKHsgbmV3VmFsdWUgfSkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCd1c2UtZ2l0aHViLXN0eWxlJz4oJ3VzZS1naXRodWItc3R5bGUnLCB7XG4gICAgICAgICAgICB2YWx1ZTogbmV3VmFsdWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZW5kZXJNYXJrZG93bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICBhd2FpdCB0aGlzLnJlbmRlck1hcmtkb3duVGV4dChzb3VyY2UpXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldEhUTUxUb1NhdmUoc2F2ZVBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgIHJldHVybiByZW5kZXJlci5yZW5kZXIoXG4gICAgICBzb3VyY2UsXG4gICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICdzYXZlJyxcbiAgICAgIHNhdmVQYXRoLFxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVuZGVyTWFya2Rvd25UZXh0KHRleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkb21Eb2N1bWVudCA9IGF3YWl0IHJlbmRlcmVyLnJlbmRlcihcbiAgICAgICAgdGV4dCxcbiAgICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICB0aGlzLmRlZmF1bHRSZW5kZXJNb2RlLFxuICAgICAgKVxuICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlXG4gICAgICB0aGlzLmVsZW1lbnQuc2VuZDwndXBkYXRlLXByZXZpZXcnPigndXBkYXRlLXByZXZpZXcnLCB7XG4gICAgICAgIGh0bWw6IGRvbURvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUwsXG4gICAgICAgIHJlbmRlckxhVGVYOiB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICBtanJlbmRlcmVyOiBhdG9tQ29uZmlnKCkubWF0aENvbmZpZy5sYXRleFJlbmRlcmVyLFxuICAgICAgfSlcbiAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzZXQtc291cmNlLW1hcCc+KCdzZXQtc291cmNlLW1hcCcsIHtcbiAgICAgICAgbWFwOiB1dGlsLmJ1aWxkTGluZU1hcChtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKSksXG4gICAgICB9KVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtbWFya2Rvd24nKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBhcyBFcnJvcilcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNob3dFcnJvcihlcnJvcjogRXJyb3IpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRGYXRhbEVycm9yKFxuICAgICAgICAnRXJyb3IgcmVwb3J0ZWQgb24gYSBkZXN0cm95ZWQgTWFya2Rvd24gUHJldmlldyBQbHVzIHZpZXcnLFxuICAgICAgICB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgfSxcbiAgICAgIClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnZXJyb3InPignZXJyb3InLCB7IG1zZzogZXJyb3IubWVzc2FnZSB9KVxuICB9XG5cbiAgcHJpdmF0ZSBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKClcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzZWxlY3Rpb24uYmFzZU5vZGUgYXMgSFRNTEVsZW1lbnRcblxuICAgIC8vIFVzZSBkZWZhdWx0IGNvcHkgZXZlbnQgaGFuZGxlciBpZiB0aGVyZSBpcyBzZWxlY3RlZCB0ZXh0IGluc2lkZSB0aGlzIHZpZXdcbiAgICBpZiAoXG4gICAgICBzZWxlY3RlZFRleHQgJiZcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vVE9ETzogY29tcGxhaW4gb24gVFNcbiAgICAgIHNlbGVjdGVkTm9kZSAhPSBudWxsIC8vICYmXG4gICAgICAvLyAodGhpcy5wcmV2aWV3ID09PSBzZWxlY3RlZE5vZGUgfHwgdGhpcy5wcmV2aWV3LmNvbnRhaW5zKHNlbGVjdGVkTm9kZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oYXN5bmMgKHNyYykgPT5cbiAgICAgICAgY29weUh0bWwoc3JjLCB0aGlzLmdldFBhdGgoKSwgdGhpcy5yZW5kZXJMYVRlWCksXG4gICAgICApLFxuICAgIClcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVN0eWxlcygpIHtcbiAgICBjb25zdCBzdHlsZXM6IHN0cmluZ1tdID0gW11cbiAgICBmb3IgKGNvbnN0IHNlIG9mIGF0b20uc3R5bGVzLmdldFN0eWxlRWxlbWVudHMoKSkge1xuICAgICAgc3R5bGVzLnB1c2goc2UuaW5uZXJIVE1MKVxuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc3R5bGUnPignc3R5bGUnLCB7IHN0eWxlcyB9KVxuICB9XG59XG4iXX0=