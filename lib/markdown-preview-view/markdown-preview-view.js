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
                    this.openSource(e.args[0].initialLine);
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
        });
        util.destroy(this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBTWE7QUFDYiw0QkFBNEI7QUFDNUIseUJBQXlCO0FBR3pCLHdDQUF3QztBQUN4QyxvREFBb0Q7QUFDcEQsc0RBQXNEO0FBQ3RELGtDQUE2RDtBQUM3RCwrQkFBOEI7QUFZOUI7SUFjRSxZQUNVLG9CQUEwRCxRQUFRLEVBQ2xFLGNBQXVCLGlCQUFVLEVBQUUsQ0FBQyxVQUFVO1NBQ25ELDZCQUE2QjtRQUZ4QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWlEO1FBQ2xFLGdCQUFXLEdBQVgsV0FBVyxDQUNhO1FBZHhCLFlBQU8sR0FHWixJQUFJLGNBQU8sRUFBRSxDQUFBO1FBQ1IsZ0JBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDdkMsY0FBUyxHQUFHLEtBQUssQ0FBQTtRQUVuQixZQUFPLEdBQVksSUFBSSxDQUFBO1FBQ3ZCLGNBQVMsR0FBRyxDQUFDLENBQUE7UUFpTlgsa0JBQWEsR0FBRyxHQUFHLEVBQUU7WUFDN0Isb0JBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQTtZQUVwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDeEI7UUFDSCxDQUFDLENBQUE7UUFoTkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBUSxDQUFBO1FB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QUE7SUFDakQsQ0FBQztDQUNGO0FBN2JELGtEQTZiQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5pbXBvcnQge1xuICBDb21tYW5kRXZlbnQsXG4gIEVtaXR0ZXIsXG4gIERpc3Bvc2FibGUsXG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIEdyYW1tYXIsXG59IGZyb20gJ2F0b20nXG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcycpXG5pbXBvcnQge30gZnJvbSAnZWxlY3Ryb24nIC8vIHRoaXMgaXMgaGVyZSBzb2xleSBmb3IgdHlwaW5nc1xuXG5pbXBvcnQgcmVuZGVyZXIgPSByZXF1aXJlKCcuLi9yZW5kZXJlcicpXG5pbXBvcnQgbWFya2Rvd25JdCA9IHJlcXVpcmUoJy4uL21hcmtkb3duLWl0LWhlbHBlcicpXG5pbXBvcnQgaW1hZ2VXYXRjaGVyID0gcmVxdWlyZSgnLi4vaW1hZ2Utd2F0Y2gtaGVscGVyJylcbmltcG9ydCB7IGhhbmRsZVByb21pc2UsIGNvcHlIdG1sLCBhdG9tQ29uZmlnIH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6ZWRNUFYge1xuICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldydcbiAgZWRpdG9ySWQ/OiBudW1iZXJcbiAgZmlsZVBhdGg/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnQgPSBFbGVjdHJvbi5XZWJ2aWV3VGFnICYge1xuICBnZXRNb2RlbCgpOiBNYXJrZG93blByZXZpZXdWaWV3XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3IHtcbiAgcHVibGljIHJlYWRvbmx5IHJlbmRlclByb21pc2U6IFByb21pc2U8dm9pZD5cbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50XG4gIHByb3RlY3RlZCBlbWl0dGVyOiBFbWl0dGVyPHtcbiAgICAnZGlkLWNoYW5nZS10aXRsZSc6IHVuZGVmaW5lZFxuICAgICdkaWQtY2hhbmdlLW1hcmtkb3duJzogdW5kZWZpbmVkXG4gIH0+ID0gbmV3IEVtaXR0ZXIoKVxuICBwcm90ZWN0ZWQgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIHByb3RlY3RlZCBkZXN0cm95ZWQgPSBmYWxzZVxuXG4gIHByaXZhdGUgbG9hZGluZzogYm9vbGVhbiA9IHRydWVcbiAgcHJpdmF0ZSB6b29tTGV2ZWwgPSAwXG4gIHByaXZhdGUgZ2V0SFRNTFNWR1Byb21pc2U/OiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD5cblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBkZWZhdWx0UmVuZGVyTW9kZTogRXhjbHVkZTxyZW5kZXJlci5SZW5kZXJNb2RlLCAnc2F2ZSc+ID0gJ25vcm1hbCcsXG4gICAgcHJpdmF0ZSByZW5kZXJMYVRlWDogYm9vbGVhbiA9IGF0b21Db25maWcoKS5tYXRoQ29uZmlnXG4gICAgICAuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQsXG4gICkge1xuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dlYnZpZXcnKSBhcyBhbnlcbiAgICB0aGlzLmVsZW1lbnQuZ2V0TW9kZWwgPSAoKSA9PiB0aGlzXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXByZXZpZXctcGx1cycsICduYXRpdmUta2V5LWJpbmRpbmdzJylcbiAgICB0aGlzLmVsZW1lbnQuZGlzYWJsZXdlYnNlY3VyaXR5ID0gJ3RydWUnXG4gICAgdGhpcy5lbGVtZW50Lm5vZGVpbnRlZ3JhdGlvbiA9ICd0cnVlJ1xuICAgIHRoaXMuZWxlbWVudC5zcmMgPSBgZmlsZTovLy8ke19fZGlybmFtZX0vLi4vLi4vY2xpZW50L3RlbXBsYXRlLmh0bWxgXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJzEwMCUnXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxMDAlJ1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB9KSxcbiAgICAgIGF0b20uc3R5bGVzLm9uRGlkUmVtb3ZlU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgfSksXG4gICAgICBhdG9tLnN0eWxlcy5vbkRpZFVwZGF0ZVN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgIH0pLFxuICAgIClcbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAnaXBjLW1lc3NhZ2UnLFxuICAgICAgKGU6IEVsZWN0cm9uLklwY01lc3NhZ2VFdmVudEN1c3RvbSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGUuY2hhbm5lbCkge1xuICAgICAgICAgIGNhc2UgJ3pvb20taW4nOlxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICd6b29tLW91dCc6XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdvcGVuLXNvdXJjZSc6XG4gICAgICAgICAgICB0aGlzLm9wZW5Tb3VyY2UoZS5hcmdzWzBdLmluaXRpYWxMaW5lKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdkaWQtc2Nyb2xsLXByZXZpZXcnOlxuICAgICAgICAgICAgY29uc3QgeyBtaW4sIG1heCB9ID0gZS5hcmdzWzBdXG4gICAgICAgICAgICB0aGlzLmRpZFNjcm9sbFByZXZpZXcobWluLCBtYXgpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3JlbG9hZCc6XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVsb2FkKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYFVua25vd24gbWVzc2FnZSByZWNpZXZlZCAke2UuY2hhbm5lbH1gKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIClcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2lsbC1uYXZpZ2F0ZScsIGFzeW5jIChlKSA9PiB7XG4gICAgICBjb25zdCB7IHNoZWxsIH0gPSBhd2FpdCBpbXBvcnQoJ2VsZWN0cm9uJylcbiAgICAgIGNvbnN0IGZpbGVVcmlUb1BhdGggPSBhd2FpdCBpbXBvcnQoJ2ZpbGUtdXJpLXRvLXBhdGgnKVxuICAgICAgaWYgKGUudXJsLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8nKSkge1xuICAgICAgICBoYW5kbGVQcm9taXNlKGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVVyaVRvUGF0aChlLnVybCkpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hlbGwub3BlbkV4dGVybmFsKGUudXJsKVxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5yZW5kZXJQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IG9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICAgICAgdGhpcy5lbGVtZW50LnNldFpvb21MZXZlbCh0aGlzLnpvb21MZXZlbClcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwndXNlLWdpdGh1Yi1zdHlsZSc+KCd1c2UtZ2l0aHViLXN0eWxlJywge1xuICAgICAgICAgIHZhbHVlOiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScpLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc2V0LWF0b20taG9tZSc+KCdzZXQtYXRvbS1ob21lJywge1xuICAgICAgICAgIGhvbWU6IGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc2V0LW51bWJlci1lcW5zJz4oJ3NldC1udW1iZXItZXFucycsIHtcbiAgICAgICAgICBudW1iZXJFcW5zOiBhdG9tQ29uZmlnKCkubWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMsXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzZXQtYmFzZS1wYXRoJz4oJ3NldC1iYXNlLXBhdGgnLCB7XG4gICAgICAgICAgcGF0aDogdGhpcy5nZXRQYXRoKCksXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgICAgcmVzb2x2ZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICB9XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZG9tLXJlYWR5Jywgb25sb2FkKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcnVuSlM8VD4oanM6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSkgPT5cbiAgICAgIHRoaXMuZWxlbWVudC5leGVjdXRlSmF2YVNjcmlwdChqcywgZmFsc2UsIHJlc29sdmUpLFxuICAgIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRIVE1MU1ZHKCkge1xuICAgIGF3YWl0IHRoaXMuZ2V0SFRNTFNWR1Byb21pc2VcbiAgICB0aGlzLmdldEhUTUxTVkdQcm9taXNlID0gbmV3IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgaGFuZGxlciA9IChlOiBFbGVjdHJvbi5JcGNNZXNzYWdlRXZlbnRDdXN0b20pID0+IHtcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiB0b3RhbGl0eS1jaGVja1xuICAgICAgICBpZiAoZS5jaGFubmVsID09PSAnaHRtbC1zdmctcmVzdWx0Jykge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdpcGMtbWVzc2FnZScsIGhhbmRsZXIgYXMgYW55KVxuICAgICAgICAgIHJlc29sdmUoZS5hcmdzWzBdKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCBoYW5kbGVyKVxuICAgIH0pXG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J2dldC1odG1sLXN2Zyc+KCdnZXQtaHRtbC1zdmcnLCB1bmRlZmluZWQpXG4gICAgcmV0dXJuIHRoaXMuZ2V0SFRNTFNWR1Byb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBzZXJpYWxpemUoKTogU2VyaWFsaXplZE1QVlxuXG4gIHB1YmxpYyBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgdGhpcy5kZXN0cm95ZWQgPSB0cnVlXG4gICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgcGF0aCAmJiBpbWFnZVdhdGNoZXIucmVtb3ZlRmlsZShwYXRoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpXG4gIH1cblxuICBwdWJsaWMgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIHB1YmxpYyBvbkRpZENoYW5nZU1hcmtkb3duKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1tYXJrZG93bicsIGNhbGxiYWNrKVxuICB9XG5cbiAgcHVibGljIHRvZ2dsZVJlbmRlckxhdGV4KCkge1xuICAgIHRoaXMucmVuZGVyTGFUZVggPSAhdGhpcy5yZW5kZXJMYVRlWFxuICAgIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcmVmcmVzaEltYWdlcyhvbGRzcmM6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHYgPSBhd2FpdCBpbWFnZVdhdGNoZXIuZ2V0VmVyc2lvbihvbGRzcmMsIHRoaXMuZ2V0UGF0aCgpKVxuICAgIHRoaXMuZWxlbWVudC5zZW5kPCd1cGRhdGUtaW1hZ2VzJz4oJ3VwZGF0ZS1pbWFnZXMnLCB7IG9sZHNyYywgdiB9KVxuICB9XG5cbiAgcHVibGljIGFic3RyYWN0IGdldFRpdGxlKCk6IHN0cmluZ1xuXG4gIHB1YmxpYyBnZXREZWZhdWx0TG9jYXRpb24oKTogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcicge1xuICAgIHJldHVybiBhdG9tQ29uZmlnKCkucHJldmlld0NvbmZpZy5wcmV2aWV3RG9ja1xuICB9XG5cbiAgcHVibGljIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAnbWFya2Rvd24nXG4gIH1cblxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0VVJJKCk6IHN0cmluZ1xuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRQYXRoKCk6IHN0cmluZyB8IHVuZGVmaW5lZFxuXG4gIHB1YmxpYyBnZXRTYXZlRGlhbG9nT3B0aW9ucygpIHtcbiAgICBsZXQgZGVmYXVsdFBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIGlmIChkZWZhdWx0UGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICBkZWZhdWx0UGF0aCA9ICd1bnRpdGxlZC5tZCdcbiAgICAgIGlmIChwcm9qZWN0UGF0aCkge1xuICAgICAgICBkZWZhdWx0UGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgZGVmYXVsdFBhdGgpXG4gICAgICB9XG4gICAgfVxuICAgIGRlZmF1bHRQYXRoICs9ICcuJyArIGF0b21Db25maWcoKS5zYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0XG4gICAgcmV0dXJuIHsgZGVmYXVsdFBhdGggfVxuICB9XG5cbiAgcHVibGljIHNhdmVBcyhmaWxlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKGZpbGVQYXRoID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIGlmICh0aGlzLmxvYWRpbmcpIHRocm93IG5ldyBFcnJvcignUHJldmlldyBpcyBzdGlsbCBsb2FkaW5nJylcblxuICAgIGNvbnN0IHsgbmFtZSwgZXh0IH0gPSBwYXRoLnBhcnNlKGZpbGVQYXRoKVxuXG4gICAgaWYgKGV4dCA9PT0gJy5wZGYnKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucHJpbnRUb1BERih7fSwgKGVycm9yLCBkYXRhKSA9PiB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRmFpbGVkIHNhdmluZyB0byBQREYnLCB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyb3IudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZGF0YSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbmRsZVByb21pc2UoXG4gICAgICAgIHRoaXMuZ2V0SFRNTFRvU2F2ZShmaWxlUGF0aCkudGhlbihhc3luYyAoaHRtbCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGZ1bGxIdG1sID0gdXRpbC5ta0h0bWwoXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgaHRtbCxcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScpLFxuICAgICAgICAgIClcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGZ1bGxIdG1sKVxuICAgICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZGlkU2Nyb2xsUHJldmlldyhfbWluOiBudW1iZXIsIF9tYXg6IG51bWJlcikge1xuICAgIC8qIG5vb3AsIGltcGxlbWVudGF0aW9uIGluIGVkaXRvciBwcmV2aWV3ICovXG4gIH1cblxuICBwcm90ZWN0ZWQgY2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcblxuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgIGlmIChwYW5lICE9PSB1bmRlZmluZWQgJiYgcGFuZSAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKSB7XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbSh0aGlzKVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBhc3luYyBnZXRNYXJrZG93blNvdXJjZSgpOiBQcm9taXNlPHN0cmluZz5cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0R3JhbW1hcigpOiBHcmFtbWFyIHwgdW5kZWZpbmVkXG5cbiAgcHJvdGVjdGVkIG9wZW5Tb3VyY2UoaW5pdGlhbExpbmU/OiBudW1iZXIpIHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7XG4gICAgICAgIGluaXRpYWxMaW5lLFxuICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIC8vXG4gIC8vIFNjcm9sbCB0aGUgYXNzb2NpYXRlZCBwcmV2aWV3IHRvIHRoZSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IGxpbmUgb2ZcbiAgLy8gb2YgdGhlIHNvdXJjZSBtYXJrZG93bi5cbiAgLy9cbiAgLy8gQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgLy8gQHBhcmFtIHtudW1iZXJ9IGxpbmUgVGFyZ2V0IGxpbmUgb2YgYHRleHRgLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0b1xuICAvLyAgIGlkZW50aWZ5IHRoZSBlbG1lbnQgb2YgdGhlIGFzc29jaWF0ZWQgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0aGF0IHJlcHJlc2VudHNcbiAgLy8gICBgbGluZWAgYW5kIHNjcm9sbCB0aGUgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0byB0aGF0IGVsZW1lbnQuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgZWxlbWVudCB0aGF0IHJlcHJlc2VudHMgYGxpbmVgLiBJZiBubyBlbGVtZW50IGlzXG4gIC8vICAgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gIC8vXG4gIHByb3RlY3RlZCBzeW5jUHJldmlldyhsaW5lOiBudW1iZXIpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc3luYyc+KCdzeW5jJywgeyBsaW5lIH0pXG4gIH1cblxuICBwcm90ZWN0ZWQgb3Blbk5ld1dpbmRvdygpIHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAnQ2FuIG5vdCBvcGVuIHRoaXMgcHJldmlldyBpbiBuZXcgd2luZG93OiBubyBmaWxlIHBhdGgnLFxuICAgICAgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGF0b20ub3Blbih7XG4gICAgICBwYXRoc1RvT3BlbjogW2BtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9maWxlLyR7cGF0aH1gXSxcbiAgICB9KVxuICAgIHV0aWwuZGVzdHJveSh0aGlzKVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVFdmVudHMoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkQWRkR3JhbW1hcigoKSA9PlxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkVXBkYXRlR3JhbW1hcihcbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG4gICAgICAgIH0sIDI1MCksXG4gICAgICApLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PiB0aGlzLmVsZW1lbnQuc2Nyb2xsQnkoeyB0b3A6IC0xMCB9KSxcbiAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT4gdGhpcy5lbGVtZW50LnNjcm9sbEJ5KHsgdG9wOiAxMCB9KSxcbiAgICAgICAgJ2NvcmU6Y29weSc6IChldmVudDogQ29tbWFuZEV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuY29weVRvQ2xpcGJvYXJkKCkpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6b3Blbi1kZXYtdG9vbHMnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50Lm9wZW5EZXZUb29scygpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6bmV3LXdpbmRvdyc6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLm9wZW5OZXdXaW5kb3coKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByaW50JzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5wcmludCgpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pbic6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLnpvb21MZXZlbCArPSAwLjFcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0Wm9vbUxldmVsKHRoaXMuem9vbUxldmVsKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0JzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuem9vbUxldmVsIC09IDAuMVxuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cmVzZXQtem9vbSc6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLnpvb21MZXZlbCA9IDBcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0Wm9vbUxldmVsKHRoaXMuem9vbUxldmVsKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtc291cmNlJzogYXN5bmMgKF9ldmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzeW5jLXNvdXJjZSc+KCdzeW5jLXNvdXJjZScsIHVuZGVmaW5lZClcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpZiAoYXRvbUNvbmZpZygpLnJlbmRlcmVyID09PSAnbWFya2Rvd24taXQnKSB0aGlzLmNoYW5nZUhhbmRsZXIoKVxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZycsICgpID0+IHtcbiAgICAgICAgaWYgKGF0b21Db25maWcoKS5yZW5kZXJlciA9PT0gJ3BhbmRvYycpIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubGF0ZXhSZW5kZXJlcicsXG4gICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcixcbiAgICAgICksXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLm51bWJlckVxdWF0aW9ucycsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwncmVsb2FkJz4oJ3JlbG9hZCcsIHVuZGVmaW5lZClcbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5yZW5kZXJlcicsXG4gICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcixcbiAgICAgICksXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScsXG4gICAgICAgICh7IG5ld1ZhbHVlIH0pID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwndXNlLWdpdGh1Yi1zdHlsZSc+KCd1c2UtZ2l0aHViLXN0eWxlJywge1xuICAgICAgICAgICAgdmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICApLFxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVuZGVyTWFya2Rvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc291cmNlID0gYXdhaXQgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpXG4gICAgYXdhaXQgdGhpcy5yZW5kZXJNYXJrZG93blRleHQoc291cmNlKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRIVE1MVG9TYXZlKHNhdmVQYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICByZXR1cm4gcmVuZGVyZXIucmVuZGVyKFxuICAgICAgc291cmNlLFxuICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgIHRoaXMucmVuZGVyTGFUZVgsXG4gICAgICAnc2F2ZScsXG4gICAgICBzYXZlUGF0aCxcbiAgICApXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlbmRlck1hcmtkb3duVGV4dCh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZG9tRG9jdW1lbnQgPSBhd2FpdCByZW5kZXJlci5yZW5kZXIoXG4gICAgICAgIHRleHQsXG4gICAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgdGhpcy5kZWZhdWx0UmVuZGVyTW9kZSxcbiAgICAgIClcbiAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZVxuICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3VwZGF0ZS1wcmV2aWV3Jz4oJ3VwZGF0ZS1wcmV2aWV3Jywge1xuICAgICAgICBodG1sOiBkb21Eb2N1bWVudC5kb2N1bWVudEVsZW1lbnQub3V0ZXJIVE1MLFxuICAgICAgICByZW5kZXJMYVRlWDogdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgbWpyZW5kZXJlcjogYXRvbUNvbmZpZygpLm1hdGhDb25maWcubGF0ZXhSZW5kZXJlcixcbiAgICAgIH0pXG4gICAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc2V0LXNvdXJjZS1tYXAnPignc2V0LXNvdXJjZS1tYXAnLCB7XG4gICAgICAgIG1hcDogdXRpbC5idWlsZExpbmVNYXAobWFya2Rvd25JdC5nZXRUb2tlbnModGV4dCwgdGhpcy5yZW5kZXJMYVRlWCkpLFxuICAgICAgfSlcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLW1hcmtkb3duJylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5zaG93RXJyb3IoZXJyb3IgYXMgRXJyb3IpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzaG93RXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihcbiAgICAgICAgJ0Vycm9yIHJlcG9ydGVkIG9uIGEgZGVzdHJveWVkIE1hcmtkb3duIFByZXZpZXcgUGx1cyB2aWV3JyxcbiAgICAgICAge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgICBkZXRhaWw6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgIH0sXG4gICAgICApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J2Vycm9yJz4oJ2Vycm9yJywgeyBtc2c6IGVycm9yLm1lc3NhZ2UgfSlcbiAgfVxuXG4gIHByaXZhdGUgY29weVRvQ2xpcGJvYXJkKCkge1xuICAgIGlmICh0aGlzLmxvYWRpbmcpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKVxuICAgIGNvbnN0IHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gc2VsZWN0aW9uLmJhc2VOb2RlIGFzIEhUTUxFbGVtZW50XG5cbiAgICAvLyBVc2UgZGVmYXVsdCBjb3B5IGV2ZW50IGhhbmRsZXIgaWYgdGhlcmUgaXMgc2VsZWN0ZWQgdGV4dCBpbnNpZGUgdGhpcyB2aWV3XG4gICAgaWYgKFxuICAgICAgc2VsZWN0ZWRUZXh0ICYmXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c3RyaWN0LXR5cGUtcHJlZGljYXRlcyAvL1RPRE86IGNvbXBsYWluIG9uIFRTXG4gICAgICBzZWxlY3RlZE5vZGUgIT0gbnVsbCAvLyAmJlxuICAgICAgLy8gKHRoaXMucHJldmlldyA9PT0gc2VsZWN0ZWROb2RlIHx8IHRoaXMucHJldmlldy5jb250YWlucyhzZWxlY3RlZE5vZGUpKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaGFuZGxlUHJvbWlzZShcbiAgICAgIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKGFzeW5jIChzcmMpID0+XG4gICAgICAgIGNvcHlIdG1sKHNyYywgdGhpcy5nZXRQYXRoKCksIHRoaXMucmVuZGVyTGFUZVgpLFxuICAgICAgKSxcbiAgICApXG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTdHlsZXMoKSB7XG4gICAgY29uc3Qgc3R5bGVzOiBzdHJpbmdbXSA9IFtdXG4gICAgZm9yIChjb25zdCBzZSBvZiBhdG9tLnN0eWxlcy5nZXRTdHlsZUVsZW1lbnRzKCkpIHtcbiAgICAgIHN0eWxlcy5wdXNoKHNlLmlubmVySFRNTClcbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LnNlbmQ8J3N0eWxlJz4oJ3N0eWxlJywgeyBzdHlsZXMgfSlcbiAgfVxufVxuIl19