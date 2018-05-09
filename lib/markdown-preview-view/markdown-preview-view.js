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
            return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBTWE7QUFDYiw0QkFBNEI7QUFDNUIseUJBQXlCO0FBR3pCLHdDQUF3QztBQUN4QyxvREFBb0Q7QUFDcEQsc0RBQXNEO0FBQ3RELGtDQUE2RDtBQUM3RCwrQkFBOEI7QUFZOUI7SUFjRSxZQUNVLG9CQUEwRCxRQUFRLEVBQ2xFLGNBQXVCLGlCQUFVLEVBQUUsQ0FBQyxVQUFVO1NBQ25ELDZCQUE2QjtRQUZ4QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWlEO1FBQ2xFLGdCQUFXLEdBQVgsV0FBVyxDQUNhO1FBZHhCLFlBQU8sR0FHWixJQUFJLGNBQU8sRUFBRSxDQUFBO1FBQ1IsZ0JBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDdkMsY0FBUyxHQUFHLEtBQUssQ0FBQTtRQUVuQixZQUFPLEdBQVksSUFBSSxDQUFBO1FBQ3ZCLGNBQVMsR0FBRyxDQUFDLENBQUE7UUF3Tlgsa0JBQWEsR0FBRyxHQUFHLEVBQUU7WUFDN0Isb0JBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQTtZQUVwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDeEI7UUFDSCxDQUFDLENBQUE7UUF2TkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBUSxDQUFBO1FB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QUFJLEVBRXBCO1lBQ0EsT0FBTyxLQUFLLENBQUE7U0FDYjtRQUVELG9CQUFhLENBQ1gsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUMxQyxlQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQ2hELENBQ0YsQ0FBQTtRQUVELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVPLFlBQVk7UUFDbEIsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFBO1FBQzNCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO1lBQy9DLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1NBQzFCO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQVUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUNqRCxDQUFDO0NBQ0Y7QUF4YUQsa0RBd2FDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmltcG9ydCB7XG4gIENvbW1hbmRFdmVudCxcbiAgRW1pdHRlcixcbiAgRGlzcG9zYWJsZSxcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgR3JhbW1hcixcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCBfID0gcmVxdWlyZSgnbG9kYXNoJylcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmltcG9ydCB7fSBmcm9tICdlbGVjdHJvbicgLy8gdGhpcyBpcyBoZXJlIHNvbGV5IGZvciB0eXBpbmdzXG5cbmltcG9ydCByZW5kZXJlciA9IHJlcXVpcmUoJy4uL3JlbmRlcmVyJylcbmltcG9ydCBtYXJrZG93bkl0ID0gcmVxdWlyZSgnLi4vbWFya2Rvd24taXQtaGVscGVyJylcbmltcG9ydCBpbWFnZVdhdGNoZXIgPSByZXF1aXJlKCcuLi9pbWFnZS13YXRjaC1oZWxwZXInKVxuaW1wb3J0IHsgaGFuZGxlUHJvbWlzZSwgY29weUh0bWwsIGF0b21Db25maWcgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXplZE1QViB7XG4gIGRlc2VyaWFsaXplcjogJ21hcmtkb3duLXByZXZpZXctcGx1cy9NYXJrZG93blByZXZpZXdWaWV3J1xuICBlZGl0b3JJZD86IG51bWJlclxuICBmaWxlUGF0aD86IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudCA9IEVsZWN0cm9uLldlYnZpZXdUYWcgJiB7XG4gIGdldE1vZGVsKCk6IE1hcmtkb3duUHJldmlld1ZpZXdcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1hcmtkb3duUHJldmlld1ZpZXcge1xuICBwdWJsaWMgcmVhZG9ubHkgcmVuZGVyUHJvbWlzZTogUHJvbWlzZTx2b2lkPlxuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnRcbiAgcHJvdGVjdGVkIGVtaXR0ZXI6IEVtaXR0ZXI8e1xuICAgICdkaWQtY2hhbmdlLXRpdGxlJzogdW5kZWZpbmVkXG4gICAgJ2RpZC1jaGFuZ2UtbWFya2Rvd24nOiB1bmRlZmluZWRcbiAgfT4gPSBuZXcgRW1pdHRlcigpXG4gIHByb3RlY3RlZCBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgcHJvdGVjdGVkIGRlc3Ryb3llZCA9IGZhbHNlXG5cbiAgcHJpdmF0ZSBsb2FkaW5nOiBib29sZWFuID0gdHJ1ZVxuICBwcml2YXRlIHpvb21MZXZlbCA9IDBcbiAgcHJpdmF0ZSBnZXRIVE1MU1ZHUHJvbWlzZT86IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPlxuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGRlZmF1bHRSZW5kZXJNb2RlOiBFeGNsdWRlPHJlbmRlcmVyLlJlbmRlck1vZGUsICdzYXZlJz4gPSAnbm9ybWFsJyxcbiAgICBwcml2YXRlIHJlbmRlckxhVGVYOiBib29sZWFuID0gYXRvbUNvbmZpZygpLm1hdGhDb25maWdcbiAgICAgIC5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCxcbiAgKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnd2VidmlldycpIGFzIGFueVxuICAgIHRoaXMuZWxlbWVudC5nZXRNb2RlbCA9ICgpID0+IHRoaXNcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tcHJldmlldy1wbHVzJywgJ25hdGl2ZS1rZXktYmluZGluZ3MnKVxuICAgIHRoaXMuZWxlbWVudC5kaXNhYmxld2Vic2VjdXJpdHkgPSAndHJ1ZSdcbiAgICB0aGlzLmVsZW1lbnQubm9kZWludGVncmF0aW9uID0gJ3RydWUnXG4gICAgdGhpcy5lbGVtZW50LnNyYyA9IGBmaWxlOi8vLyR7X19kaXJuYW1lfS8uLi8uLi9jbGllbnQvdGVtcGxhdGUuaHRtbGBcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUud2lkdGggPSAnMTAwJSdcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLnN0eWxlcy5vbkRpZEFkZFN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgIH0pLFxuICAgICAgYXRvbS5zdHlsZXMub25EaWRSZW1vdmVTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB9KSxcbiAgICAgIGF0b20uc3R5bGVzLm9uRGlkVXBkYXRlU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgfSksXG4gICAgKVxuICAgIHRoaXMuaGFuZGxlRXZlbnRzKClcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdpcGMtbWVzc2FnZScsXG4gICAgICAoZTogRWxlY3Ryb24uSXBjTWVzc2FnZUV2ZW50Q3VzdG9tKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZS5jaGFubmVsKSB7XG4gICAgICAgICAgY2FzZSAnem9vbS1pbic6XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pbicsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3pvb20tb3V0JzpcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLW91dCcsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ29wZW4tc291cmNlJzpcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgICAgICAgICAgaWYgKHBhdGggPT09IHVuZGVmaW5lZCkgYnJlYWtcbiAgICAgICAgICAgIGhhbmRsZVByb21pc2UoXG4gICAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge1xuICAgICAgICAgICAgICAgIGluaXRpYWxMaW5lOiBlLmFyZ3NbMF0uaW5pdGlhbExpbmUsXG4gICAgICAgICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdkaWQtc2Nyb2xsLXByZXZpZXcnOlxuICAgICAgICAgICAgY29uc3QgeyBtaW4sIG1heCB9ID0gZS5hcmdzWzBdXG4gICAgICAgICAgICB0aGlzLmRpZFNjcm9sbFByZXZpZXcobWluLCBtYXgpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3JlbG9hZCc6XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVsb2FkKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYFVua25vd24gbWVzc2FnZSByZWNpZXZlZCAke2UuY2hhbm5lbH1gKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIClcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2lsbC1uYXZpZ2F0ZScsIGFzeW5jIChlKSA9PiB7XG4gICAgICBjb25zdCB7IHNoZWxsIH0gPSBhd2FpdCBpbXBvcnQoJ2VsZWN0cm9uJylcbiAgICAgIGNvbnN0IGZpbGVVcmlUb1BhdGggPSBhd2FpdCBpbXBvcnQoJ2ZpbGUtdXJpLXRvLXBhdGgnKVxuICAgICAgaWYgKGUudXJsLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8nKSkge1xuICAgICAgICBoYW5kbGVQcm9taXNlKGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVVyaVRvUGF0aChlLnVybCkpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hlbGwub3BlbkV4dGVybmFsKGUudXJsKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5yZW5kZXJQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IG9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICAgICAgdGhpcy5lbGVtZW50LnNldFpvb21MZXZlbCh0aGlzLnpvb21MZXZlbClcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwndXNlLWdpdGh1Yi1zdHlsZSc+KCd1c2UtZ2l0aHViLXN0eWxlJywge1xuICAgICAgICAgIHZhbHVlOiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScpLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc2V0LWF0b20taG9tZSc+KCdzZXQtYXRvbS1ob21lJywge1xuICAgICAgICAgIGhvbWU6IGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc2V0LW51bWJlci1lcW5zJz4oJ3NldC1udW1iZXItZXFucycsIHtcbiAgICAgICAgICBudW1iZXJFcW5zOiBhdG9tQ29uZmlnKCkubWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMsXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzZXQtYmFzZS1wYXRoJz4oJ3NldC1iYXNlLXBhdGgnLCB7XG4gICAgICAgICAgcGF0aDogdGhpcy5nZXRQYXRoKCksXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgICAgcmVzb2x2ZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICB9XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZG9tLXJlYWR5Jywgb25sb2FkKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcnVuSlM8VD4oanM6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSkgPT5cbiAgICAgIHRoaXMuZWxlbWVudC5leGVjdXRlSmF2YVNjcmlwdChqcywgZmFsc2UsIHJlc29sdmUpLFxuICAgIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRIVE1MU1ZHKCkge1xuICAgIGF3YWl0IHRoaXMuZ2V0SFRNTFNWR1Byb21pc2VcbiAgICB0aGlzLmdldEhUTUxTVkdQcm9taXNlID0gbmV3IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IChlOiBFbGVjdHJvbi5JcGNNZXNzYWdlRXZlbnRDdXN0b20pID0+IHtcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiB0b3RhbGl0eS1jaGVja1xuICAgICAgICBpZiAoZS5jaGFubmVsID09PSAnaHRtbC1zdmctcmVzdWx0Jykge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIGhhbmRsZXIgYXMgYW55KVxuICAgICAgICAgIHJlc29sdmUoZS5hcmdzWzBdKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCBoYW5kbGVyKVxuICAgIH0pXG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J2dldC1odG1sLXN2Zyc+KCdnZXQtaHRtbC1zdmcnLCB1bmRlZmluZWQpXG4gICAgcmV0dXJuIHRoaXMuZ2V0SFRNTFNWR1Byb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBzZXJpYWxpemUoKTogU2VyaWFsaXplZE1QVlxuXG4gIHB1YmxpYyBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlXG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgcGF0aCAmJiBpbWFnZVdhdGNoZXIucmVtb3ZlRmlsZShwYXRoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpXG4gIH1cblxuICBwdWJsaWMgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIHB1YmxpYyBvbkRpZENoYW5nZU1hcmtkb3duKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1tYXJrZG93bicsIGNhbGxiYWNrKVxuICB9XG5cbiAgcHVibGljIHRvZ2dsZVJlbmRlckxhdGV4KCkge1xuICAgIHRoaXMucmVuZGVyTGFUZVggPSAhdGhpcy5yZW5kZXJMYVRlWFxuICAgIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcmVmcmVzaEltYWdlcyhvbGRzcmM6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHYgPSBhd2FpdCBpbWFnZVdhdGNoZXIuZ2V0VmVyc2lvbihvbGRzcmMsIHRoaXMuZ2V0UGF0aCgpKVxuICAgIHRoaXMuZWxlbWVudC5zZW5kPCd1cGRhdGUtaW1hZ2VzJz4oJ3VwZGF0ZS1pbWFnZXMnLCB7IG9sZHNyYywgdiB9KVxuICB9XG5cbiAgcHVibGljIGFic3RyYWN0IGdldFRpdGxlKCk6IHN0cmluZ1xuXG4gIHB1YmxpYyBnZXREZWZhdWx0TG9jYXRpb24oKTogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcicge1xuICAgIHJldHVybiBhdG9tQ29uZmlnKCkucHJldmlld0NvbmZpZy5wcmV2aWV3RG9ja1xuICB9XG5cbiAgcHVibGljIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAnbWFya2Rvd24nXG4gIH1cblxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0VVJJKCk6IHN0cmluZ1xuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRQYXRoKCk6IHN0cmluZyB8IHVuZGVmaW5lZFxuXG4gIHB1YmxpYyBnZXRTYXZlRGlhbG9nT3B0aW9ucygpIHtcbiAgICBsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIGlmIChkZWZhdWx0UGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICBkZWZhdWx0UGF0aCA9ICd1bnRpdGxlZC5tZCdcbiAgICAgIGlmIChwcm9qZWN0UGF0aCkge1xuICAgICAgICBkZWZhdWx0UGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgZGVmYXVsdFBhdGgpXG4gICAgICB9XG4gICAgfVxuICAgIGRlZmF1bHRQYXRoICs9ICcuJyArIGF0b21Db25maWcoKS5zYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0XG4gICAgcmV0dXJuIHsgZGVmYXVsdFBhdGggfVxuICB9XG5cbiAgcHVibGljIHNhdmVBcyhmaWxlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKGZpbGVQYXRoID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIGlmICh0aGlzLmxvYWRpbmcpIHJldHVyblxuXG4gICAgY29uc3QgeyBuYW1lLCBleHQgfSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpXG5cbiAgICBpZiAoZXh0ID09PSAnLnBkZicpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5wcmludFRvUERGKHt9LCAoZXJyb3IsIGRhdGEpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgc2F2aW5nIHRvIFBERicsIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlcnJvci50b1N0cmluZygpLFxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBkYXRhKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgdGhpcy5nZXRIVE1MVG9TYXZlKGZpbGVQYXRoKS50aGVuKGFzeW5jIChodG1sKSA9PiB7XG4gICAgICAgICAgY29uc3QgZnVsbEh0bWwgPSB1dGlsLm1rSHRtbChcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgICAgIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyksXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZnVsbEh0bWwpXG4gICAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBkaWRTY3JvbGxQcmV2aWV3KF9taW46IG51bWJlciwgX21heDogbnVtYmVyKSB7XG4gICAgLyogbm9vcCwgaW1wbGVtZW50YXRpb24gaW4gZWRpdG9yIHByZXZpZXcgKi9cbiAgfVxuXG4gIHByb3RlY3RlZCBjaGFuZ2VIYW5kbGVyID0gKCkgPT4ge1xuICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuXG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgaWYgKHBhbmUgIT09IHVuZGVmaW5lZCAmJiBwYW5lICE9PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkpIHtcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGFzeW5jIGdldE1hcmtkb3duU291cmNlKCk6IFByb21pc2U8c3RyaW5nPlxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXRHcmFtbWFyKCk6IEdyYW1tYXIgfCB1bmRlZmluZWRcblxuICAvL1xuICAvLyBTY3JvbGwgdGhlIGFzc29jaWF0ZWQgcHJldmlldyB0byB0aGUgZWxlbWVudCByZXByZXNlbnRpbmcgdGhlIHRhcmdldCBsaW5lIG9mXG4gIC8vIG9mIHRoZSBzb3VyY2UgbWFya2Rvd24uXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRhcmdldCBsaW5lIG9mIGB0ZXh0YC4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG9cbiAgLy8gICBpZGVudGlmeSB0aGUgZWxtZW50IG9mIHRoZSBhc3NvY2lhdGVkIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdGhhdCByZXByZXNlbnRzXG4gIC8vICAgYGxpbmVgIGFuZCBzY3JvbGwgdGhlIGBtYXJrZG93bi1wcmV2aWV3LXBsdXMtdmlld2AgdG8gdGhhdCBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGBsaW5lYC4gSWYgbm8gZWxlbWVudCBpc1xuICAvLyAgIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBwcm90ZWN0ZWQgc3luY1ByZXZpZXcobGluZTogbnVtYmVyKSB7XG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J3N5bmMnPignc3luYycsIHsgbGluZSB9KVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVFdmVudHMoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkQWRkR3JhbW1hcigoKSA9PlxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkVXBkYXRlR3JhbW1hcihcbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PiB0aGlzLmVsZW1lbnQuc2Nyb2xsQnkoeyB0b3A6IC0xMCB9KSxcbiAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT4gdGhpcy5lbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAxMCB9KSxcbiAgICAgICAgJ2NvcmU6Y29weSc6IChldmVudDogQ29tbWFuZEV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuY29weVRvQ2xpcGJvYXJkKCkpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6b3Blbi1kZXYtdG9vbHMnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50Lm9wZW5EZXZUb29scygpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJpbnQnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnByaW50KClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLWluJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuem9vbUxldmVsICs9IDAuMVxuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy56b29tTGV2ZWwgLT0gMC4xXG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNldFpvb21MZXZlbCh0aGlzLnpvb21MZXZlbClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpyZXNldC16b29tJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuem9vbUxldmVsID0gMFxuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1zb3VyY2UnOiBhc3luYyAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3N5bmMtc291cmNlJz4oJ3N5bmMtc291cmNlJywgdW5kZWZpbmVkKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGlmIChhdG9tQ29uZmlnKCkucmVuZGVyZXIgPT09ICdtYXJrZG93bi1pdCcpIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpZiAoYXRvbUNvbmZpZygpLnJlbmRlcmVyID09PSAncGFuZG9jJykgdGhpcy5jaGFuZ2VIYW5kbGVyKClcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJyxcbiAgICAgICAgdGhpcy5jaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubnVtYmVyRXF1YXRpb25zJyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdyZWxvYWQnPigncmVsb2FkJywgdW5kZWZpbmVkKVxuICAgICAgICB9LFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnJlbmRlcmVyJyxcbiAgICAgICAgdGhpcy5jaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyxcbiAgICAgICAgKHsgbmV3VmFsdWUgfSkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCd1c2UtZ2l0aHViLXN0eWxlJz4oJ3VzZS1naXRodWItc3R5bGUnLCB7XG4gICAgICAgICAgICB2YWx1ZTogbmV3VmFsdWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZW5kZXJNYXJrZG93bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICBhd2FpdCB0aGlzLnJlbmRlck1hcmtkb3duVGV4dChzb3VyY2UpXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldEhUTUxUb1NhdmUoc2F2ZVBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgIHJldHVybiByZW5kZXJlci5yZW5kZXIoXG4gICAgICBzb3VyY2UsXG4gICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICdzYXZlJyxcbiAgICAgIHNhdmVQYXRoLFxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVuZGVyTWFya2Rvd25UZXh0KHRleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkb21Eb2N1bWVudCA9IGF3YWl0IHJlbmRlcmVyLnJlbmRlcihcbiAgICAgICAgdGV4dCxcbiAgICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICB0aGlzLmRlZmF1bHRSZW5kZXJNb2RlLFxuICAgICAgKVxuICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlXG4gICAgICB0aGlzLmVsZW1lbnQuc2VuZDwndXBkYXRlLXByZXZpZXcnPigndXBkYXRlLXByZXZpZXcnLCB7XG4gICAgICAgIGh0bWw6IGRvbURvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUwsXG4gICAgICAgIHJlbmRlckxhVGVYOiB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICBtanJlbmRlcmVyOiBhdG9tQ29uZmlnKCkubWF0aENvbmZpZy5sYXRleFJlbmRlcmVyLFxuICAgICAgfSlcbiAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzZXQtc291cmNlLW1hcCc+KCdzZXQtc291cmNlLW1hcCcsIHtcbiAgICAgICAgbWFwOiB1dGlsLmJ1aWxkTGluZU1hcChtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKSksXG4gICAgICB9KVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtbWFya2Rvd24nKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBhcyBFcnJvcilcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNob3dFcnJvcihlcnJvcjogRXJyb3IpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRGYXRhbEVycm9yKFxuICAgICAgICAnRXJyb3IgcmVwb3J0ZWQgb24gYSBkZXN0cm95ZWQgTWFya2Rvd24gUHJldmlldyBQbHVzIHZpZXcnLFxuICAgICAgICB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgfSxcbiAgICAgIClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnZXJyb3InPignZXJyb3InLCB7IG1zZzogZXJyb3IubWVzc2FnZSB9KVxuICB9XG5cbiAgcHJpdmF0ZSBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKClcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzZWxlY3Rpb24uYmFzZU5vZGUgYXMgSFRNTEVsZW1lbnRcblxuICAgIC8vIFVzZSBkZWZhdWx0IGNvcHkgZXZlbnQgaGFuZGxlciBpZiB0aGVyZSBpcyBzZWxlY3RlZCB0ZXh0IGluc2lkZSB0aGlzIHZpZXdcbiAgICBpZiAoXG4gICAgICBzZWxlY3RlZFRleHQgJiZcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vVE9ETzogY29tcGxhaW4gb24gVFNcbiAgICAgIHNlbGVjdGVkTm9kZSAhPSBudWxsIC8vICYmXG4gICAgICAvLyAodGhpcy5wcmV2aWV3ID09PSBzZWxlY3RlZE5vZGUgfHwgdGhpcy5wcmV2aWV3LmNvbnRhaW5zKHNlbGVjdGVkTm9kZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oYXN5bmMgKHNyYykgPT5cbiAgICAgICAgY29weUh0bWwoc3JjLCB0aGlzLmdldFBhdGgoKSwgdGhpcy5yZW5kZXJMYVRlWCksXG4gICAgICApLFxuICAgIClcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVN0eWxlcygpIHtcbiAgICBjb25zdCBzdHlsZXM6IHN0cmluZ1tdID0gW11cbiAgICBmb3IgKGNvbnN0IHNlIG9mIGF0b20uc3R5bGVzLmdldFN0eWxlRWxlbWVudHMoKSkge1xuICAgICAgc3R5bGVzLnB1c2goc2UuaW5uZXJIVE1MKVxuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc3R5bGUnPignc3R5bGUnLCB7IHN0eWxlcyB9KVxuICB9XG59XG4iXX0=