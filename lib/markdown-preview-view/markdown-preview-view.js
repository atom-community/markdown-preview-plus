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
            'markdown-preview-plus:new-window': () => {
                const path = this.getPath();
                if (!path) {
                    atom.notifications.addWarning('Can not open this preview in new window: no file path');
                    return;
                }
                atom.open({
                    pathsToOpen: [`markdown-preview-plus://file/${path}`],
                });
                util.destroy(this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBTWE7QUFDYiw0QkFBNEI7QUFDNUIseUJBQXlCO0FBR3pCLHdDQUF3QztBQUN4QyxvREFBb0Q7QUFDcEQsc0RBQXNEO0FBQ3RELGtDQUE2RDtBQUM3RCwrQkFBOEI7QUFZOUI7SUFjRSxZQUNVLG9CQUEwRCxRQUFRLEVBQ2xFLGNBQXVCLGlCQUFVLEVBQUUsQ0FBQyxVQUFVO1NBQ25ELDZCQUE2QjtRQUZ4QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWlEO1FBQ2xFLGdCQUFXLEdBQVgsV0FBVyxDQUNhO1FBZHhCLFlBQU8sR0FHWixJQUFJLGNBQU8sRUFBRSxDQUFBO1FBQ1IsZ0JBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDdkMsY0FBUyxHQUFHLEtBQUssQ0FBQTtRQUVuQixZQUFPLEdBQVksSUFBSSxDQUFBO1FBQ3ZCLGNBQVMsR0FBRyxDQUFDLENBQUE7UUF3Tlgsa0JBQWEsR0FBRyxHQUFHLEVBQUU7WUFDN0Isb0JBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQTtZQUVwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDeEI7UUFDSCxDQUFDLENBQUE7UUF2TkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBUSxDQUFBO1FBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQTtRQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUscUJBQXFCLENBQUMsQ0FBQTtRQUMxRSxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQTtRQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUE7UUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsV0FBVyxTQUFTLDZCQUE2QixDQUFBO1FBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUE7UUFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUU7WUFDcEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ3JCLENBQUMsQ0FBQyxFQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtRQUNyQixDQUFDLENBQUMsRUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRTtZQUN2QyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDckIsQ0FBQyxDQUFDLENBQ0gsQ0FBQTtRQUNELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtRQUNuQixJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUMzQixhQUFhLEVBQ2IsQ0FBQyxDQUFpQyxFQUFFLEVBQUU7WUFDcEMsUUFBUSxDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxPQUFPLEVBQ1osK0JBQStCLENBQ2hDLENBQUE7b0JBQ0QsTUFBSztnQkFDUCxLQUFLLFVBQVU7b0JBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxPQUFPLEVBQ1osZ0NBQWdDLENBQ2pDLENBQUE7b0JBQ0QsTUFBSztnQkFDUCxLQUFLLGFBQWE7b0JBQ2hCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtvQkFDM0IsSUFBSSxJQUFJLEtBQUssU0FBUzt3QkFBRSxNQUFLO29CQUM3QixvQkFBYSxDQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDeEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVzt3QkFDbEMsY0FBYyxFQUFFLElBQUk7cUJBQ3JCLENBQUMsQ0FDSCxDQUFBO29CQUNELE1BQUs7Z0JBQ1AsS0FBSyxvQkFBb0I7b0JBQ3ZCLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtvQkFDOUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtvQkFDL0IsTUFBSztnQkFDUCxLQUFLLFFBQVE7b0JBQ1gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtvQkFDckIsTUFBSztnQkFDUDtvQkFDRSxPQUFPLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTthQUN6RDtRQUNILENBQUMsQ0FDRixDQUFBO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pELE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRywyQ0FBYSxVQUFVLEVBQUMsQ0FBQTtZQUMxQyxNQUFNLGFBQWEsR0FBRywyQ0FBYSxrQkFBa0IsRUFBQyxDQUFBO1lBQ3RELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQy9CLG9CQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7YUFDekQ7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDMUI7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQyxNQUFNLE1BQU0sR0FBRyxHQUFHLEVBQUU7Z0JBQ2xCLElBQUksSUFBSSxDQUFDLFNBQVM7b0JBQUUsT0FBTTtnQkFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO2dCQUN6QyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFxQixrQkFBa0IsRUFBRTtvQkFDeEQsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxDQUFDO2lCQUMvRCxDQUFDLENBQUE7Z0JBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQWtCLGVBQWUsRUFBRTtvQkFDbEQsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtpQkFDOUIsQ0FBQyxDQUFBO2dCQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFvQixpQkFBaUIsRUFBRTtvQkFDdEQsVUFBVSxFQUFFLGlCQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsZUFBZTtpQkFDcEQsQ0FBQyxDQUFBO2dCQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFrQixlQUFlLEVBQUU7b0JBQ2xELElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFO2lCQUNyQixDQUFDLENBQUE7Z0JBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtnQkFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFBO1lBQ2hDLENBQUMsQ0FBQTtZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3BELENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFLLENBQUksRUFBVTtRQUM5QixPQUFPLElBQUksT0FBTyxDQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUNuRCxDQUFBO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVO1FBQ3JCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFBO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLE9BQU8sQ0FBcUIsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNuRSxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQWlDLEVBQUUsRUFBRTtnQkFFcEQsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLGlCQUFpQixFQUFFO29CQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxPQUFjLENBQUMsQ0FBQTtvQkFDL0QsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtpQkFDbkI7WUFDSCxDQUFDLENBQUE7WUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUN2RCxDQUFDLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFpQixjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDNUQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUE7SUFDL0IsQ0FBQztJQUlNLE9BQU87UUFDWixJQUFJLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTTtRQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtRQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDM0IsSUFBSSxJQUFJLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ3ZCLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxRQUFvQjtRQUMxQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3RELENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxRQUFvQjtRQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3pELENBQUM7SUFFTSxpQkFBaUI7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUE7UUFDcEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO0lBQ3RCLENBQUM7SUFFTSxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQWM7UUFDdkMsTUFBTSxDQUFDLEdBQUcsTUFBTSxZQUFZLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtRQUMvRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBa0IsZUFBZSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDcEUsQ0FBQztJQUlNLGtCQUFrQjtRQUN2QixPQUFPLGlCQUFVLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFBO0lBQy9DLENBQUM7SUFFTSxXQUFXO1FBQ2hCLE9BQU8sVUFBVSxDQUFBO0lBQ25CLENBQUM7SUFNTSxvQkFBb0I7UUFDekIsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2hDLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtZQUM3QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzlDLFdBQVcsR0FBRyxhQUFhLENBQUE7WUFDM0IsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFBO2FBQ2xEO1NBQ0Y7UUFDRCxXQUFXLElBQUksR0FBRyxHQUFHLGlCQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUE7UUFDOUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFBO0lBQ3hCLENBQUM7SUFFTSxNQUFNLENBQUMsUUFBNEI7UUFDeEMsSUFBSSxRQUFRLEtBQUssU0FBUztZQUFFLE9BQU07UUFDbEMsSUFBSSxJQUFJLENBQUMsT0FBTztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtRQUU3RCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7UUFFMUMsSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDMUMsSUFBSSxLQUFLLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUU7d0JBQ2xELFdBQVcsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFO3dCQUM3QixXQUFXLEVBQUUsSUFBSTt3QkFDakIsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO3FCQUNuQixDQUFDLENBQUE7b0JBQ0YsT0FBTTtpQkFDUDtnQkFDRCxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUNsQyxDQUFDLENBQUMsQ0FBQTtTQUNIO2FBQU07WUFDTCxvQkFBYSxDQUNYLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDL0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FDMUIsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLENBQUMsV0FBVyxFQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUN4RCxDQUFBO2dCQUVELEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO2dCQUNwQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ3RDLENBQUMsQ0FBQyxDQUNILENBQUE7U0FDRjtJQUNILENBQUM7SUFFUyxnQkFBZ0IsQ0FBQyxJQUFZLEVBQUUsSUFBWTtJQUVyRCxDQUFDO0lBMEJTLFdBQVcsQ0FBQyxJQUFZO1FBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFTLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7SUFDN0MsQ0FBQztJQUVPLFlBQVk7UUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUNqQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNkLG9CQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUE7UUFDdEMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUNSLEVBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FDOUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDZCxvQkFBYSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFBO1FBQ3RDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FDUixDQUNGLENBQUE7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUM5QixjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6RCxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUMxRCxXQUFXLEVBQUUsQ0FBQyxLQUFtQixFQUFFLEVBQUU7Z0JBQ25DLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFBRSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUE7WUFDckQsQ0FBQztZQUNELHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQTtZQUM3QixDQUFDO1lBQ0Qsa0NBQWtDLEVBQUUsR0FBRyxFQUFFO2dCQUN2QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7Z0JBQzNCLElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQzNCLHVEQUF1RCxDQUN4RCxDQUFBO29CQUNELE9BQU07aUJBQ1A7Z0JBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDUixXQUFXLEVBQUUsQ0FBQyxnQ0FBZ0MsSUFBSSxFQUFFLENBQUM7aUJBQ3RELENBQUMsQ0FBQTtnQkFDRixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3BCLENBQUM7WUFDRCw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUE7WUFDdEIsQ0FBQztZQUNELCtCQUErQixFQUFFLEdBQUcsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUE7Z0JBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUMzQyxDQUFDO1lBQ0QsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO2dCQUNyQyxJQUFJLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQTtnQkFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQzNDLENBQUM7WUFDRCxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFBO2dCQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDM0MsQ0FBQztZQUNELG1DQUFtQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQWdCLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQTtZQUM1RCxDQUFDO1NBQ0YsQ0FBQyxDQUNILENBQUE7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO1lBQ3JFLElBQUksaUJBQVUsRUFBRSxDQUFDLFFBQVEsS0FBSyxhQUFhO2dCQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUNuRSxDQUFDLENBQUMsRUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLEVBQUU7WUFDakUsSUFBSSxpQkFBVSxFQUFFLENBQUMsUUFBUSxLQUFLLFFBQVE7Z0JBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQzlELENBQUMsQ0FBQyxFQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUNyQixnREFBZ0QsRUFDaEQsSUFBSSxDQUFDLGFBQWEsQ0FDbkIsRUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FDckIsa0RBQWtELEVBQ2xELEdBQUcsRUFBRTtZQUNILElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFXLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUNsRCxDQUFDLENBQ0YsRUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FDckIsZ0NBQWdDLEVBQ2hDLElBQUksQ0FBQyxhQUFhLENBQ25CLEVBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQ3JCLHNDQUFzQyxFQUN0QyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRTtZQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFxQixrQkFBa0IsRUFBRTtnQkFDeEQsS0FBSyxFQUFFLFFBQVE7YUFDaEIsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUNGLENBQ0YsQ0FBQTtJQUNILENBQUM7SUFFTyxLQUFLLENBQUMsY0FBYztRQUMxQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQzdDLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3ZDLENBQUM7SUFFTyxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQWdCO1FBQzFDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7UUFDN0MsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUNwQixNQUFNLEVBQ04sSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUNkLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFDakIsSUFBSSxDQUFDLFdBQVcsRUFDaEIsTUFBTSxFQUNOLFFBQVEsQ0FDVCxDQUFBO0lBQ0gsQ0FBQztJQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFZO1FBQzNDLElBQUk7WUFDRixNQUFNLFdBQVcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQ3ZDLElBQUksRUFDSixJQUFJLENBQUMsT0FBTyxFQUFFLEVBQ2QsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUNqQixJQUFJLENBQUMsV0FBVyxFQUNoQixJQUFJLENBQUMsaUJBQWlCLENBQ3ZCLENBQUE7WUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU07WUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7WUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQW1CLGdCQUFnQixFQUFFO2dCQUNwRCxJQUFJLEVBQUUsV0FBVyxDQUFDLGVBQWUsQ0FBQyxTQUFTO2dCQUMzQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzdCLFVBQVUsRUFBRSxpQkFBVSxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWE7YUFDbEQsQ0FBQyxDQUFBO1lBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQW1CLGdCQUFnQixFQUFFO2dCQUNwRCxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDckUsQ0FBQyxDQUFBO1lBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQTtTQUN6QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFjLENBQUMsQ0FBQTtTQUMvQjtJQUNILENBQUM7SUFFTyxTQUFTLENBQUMsS0FBWTtRQUM1QixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQzlCLDBEQUEwRCxFQUMxRDtnQkFDRSxXQUFXLEVBQUUsSUFBSTtnQkFDakIsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO2dCQUNsQixNQUFNLEVBQUUsS0FBSyxDQUFDLE9BQU87YUFDdEIsQ0FDRixDQUFBO1lBQ0QsT0FBTTtTQUNQO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQVUsT0FBTyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzdELENBQUM7SUFFTyxlQUFlO1FBQ3JCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixPQUFPLEtBQUssQ0FBQTtTQUNiO1FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ3ZDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUN6QyxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsUUFBdUIsQ0FBQTtRQUd0RCxJQUNFLFlBQVk7WUFFWixZQUFZLElBQUksSUFBSSxFQUVwQjtZQUNBLE9BQU8sS0FBSyxDQUFBO1NBQ2I7UUFFRCxvQkFBYSxDQUNYLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FDMUMsZUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUNoRCxDQUNGLENBQUE7UUFFRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFFTyxZQUFZO1FBQ2xCLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQTtRQUMzQixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBRTtZQUMvQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUMxQjtRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFVLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFDakQsQ0FBQztDQUNGO0FBcmJELGtEQXFiQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5pbXBvcnQge1xuICBDb21tYW5kRXZlbnQsXG4gIEVtaXR0ZXIsXG4gIERpc3Bvc2FibGUsXG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIEdyYW1tYXIsXG59IGZyb20gJ2F0b20nXG5pbXBvcnQgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcycpXG5pbXBvcnQge30gZnJvbSAnZWxlY3Ryb24nIC8vIHRoaXMgaXMgaGVyZSBzb2xleSBmb3IgdHlwaW5nc1xuXG5pbXBvcnQgcmVuZGVyZXIgPSByZXF1aXJlKCcuLi9yZW5kZXJlcicpXG5pbXBvcnQgbWFya2Rvd25JdCA9IHJlcXVpcmUoJy4uL21hcmtkb3duLWl0LWhlbHBlcicpXG5pbXBvcnQgaW1hZ2VXYXRjaGVyID0gcmVxdWlyZSgnLi4vaW1hZ2Utd2F0Y2gtaGVscGVyJylcbmltcG9ydCB7IGhhbmRsZVByb21pc2UsIGNvcHlIdG1sLCBhdG9tQ29uZmlnIH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6ZWRNUFYge1xuICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldydcbiAgZWRpdG9ySWQ/OiBudW1iZXJcbiAgZmlsZVBhdGg/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnQgPSBFbGVjdHJvbi5XZWJ2aWV3VGFnICYge1xuICBnZXRNb2RlbCgpOiBNYXJrZG93blByZXZpZXdWaWV3XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3IHtcbiAgcHVibGljIHJlYWRvbmx5IHJlbmRlclByb21pc2U6IFByb21pc2U8dm9pZD5cbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50XG4gIHByb3RlY3RlZCBlbWl0dGVyOiBFbWl0dGVyPHtcbiAgICAnZGlkLWNoYW5nZS10aXRsZSc6IHVuZGVmaW5lZFxuICAgICdkaWQtY2hhbmdlLW1hcmtkb3duJzogdW5kZWZpbmVkXG4gIH0+ID0gbmV3IEVtaXR0ZXIoKVxuICBwcm90ZWN0ZWQgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIHByb3RlY3RlZCBkZXN0cm95ZWQgPSBmYWxzZVxuXG4gIHByaXZhdGUgbG9hZGluZzogYm9vbGVhbiA9IHRydWVcbiAgcHJpdmF0ZSB6b29tTGV2ZWwgPSAwXG4gIHByaXZhdGUgZ2V0SFRNTFNWR1Byb21pc2U/OiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD5cblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBkZWZhdWx0UmVuZGVyTW9kZTogRXhjbHVkZTxyZW5kZXJlci5SZW5kZXJNb2RlLCAnc2F2ZSc+ID0gJ25vcm1hbCcsXG4gICAgcHJpdmF0ZSByZW5kZXJMYVRlWDogYm9vbGVhbiA9IGF0b21Db25maWcoKS5tYXRoQ29uZmlnXG4gICAgICAuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQsXG4gICkge1xuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3dlYnZpZXcnKSBhcyBhbnlcbiAgICB0aGlzLmVsZW1lbnQuZ2V0TW9kZWwgPSAoKSA9PiB0aGlzXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXByZXZpZXctcGx1cycsICduYXRpdmUta2V5LWJpbmRpbmdzJylcbiAgICB0aGlzLmVsZW1lbnQuZGlzYWJsZXdlYnNlY3VyaXR5ID0gJ3RydWUnXG4gICAgdGhpcy5lbGVtZW50Lm5vZGVpbnRlZ3JhdGlvbiA9ICd0cnVlJ1xuICAgIHRoaXMuZWxlbWVudC5zcmMgPSBgZmlsZTovLy8ke19fZGlybmFtZX0vLi4vLi4vY2xpZW50L3RlbXBsYXRlLmh0bWxgXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLndpZHRoID0gJzEwMCUnXG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxMDAlJ1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlcygpXG4gICAgICB9KSxcbiAgICAgIGF0b20uc3R5bGVzLm9uRGlkUmVtb3ZlU3R5bGVFbGVtZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGVTdHlsZXMoKVxuICAgICAgfSksXG4gICAgICBhdG9tLnN0eWxlcy5vbkRpZFVwZGF0ZVN0eWxlRWxlbWVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgIH0pLFxuICAgIClcbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAnaXBjLW1lc3NhZ2UnLFxuICAgICAgKGU6IEVsZWN0cm9uLklwY01lc3NhZ2VFdmVudEN1c3RvbSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGUuY2hhbm5lbCkge1xuICAgICAgICAgIGNhc2UgJ3pvb20taW4nOlxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICd6b29tLW91dCc6XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdvcGVuLXNvdXJjZSc6XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICAgICAgICAgIGlmIChwYXRoID09PSB1bmRlZmluZWQpIGJyZWFrXG4gICAgICAgICAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIHtcbiAgICAgICAgICAgICAgICBpbml0aWFsTGluZTogZS5hcmdzWzBdLmluaXRpYWxMaW5lLFxuICAgICAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnZGlkLXNjcm9sbC1wcmV2aWV3JzpcbiAgICAgICAgICAgIGNvbnN0IHsgbWluLCBtYXggfSA9IGUuYXJnc1swXVxuICAgICAgICAgICAgdGhpcy5kaWRTY3JvbGxQcmV2aWV3KG1pbiwgbWF4KVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdyZWxvYWQnOlxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbG9hZCgpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBVbmtub3duIG1lc3NhZ2UgcmVjaWV2ZWQgJHtlLmNoYW5uZWx9YClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3dpbGwtbmF2aWdhdGUnLCBhc3luYyAoZSkgPT4ge1xuICAgICAgY29uc3QgeyBzaGVsbCB9ID0gYXdhaXQgaW1wb3J0KCdlbGVjdHJvbicpXG4gICAgICBjb25zdCBmaWxlVXJpVG9QYXRoID0gYXdhaXQgaW1wb3J0KCdmaWxlLXVyaS10by1wYXRoJylcbiAgICAgIGlmIChlLnVybC5zdGFydHNXaXRoKCdmaWxlOi8vJykpIHtcbiAgICAgICAgaGFuZGxlUHJvbWlzZShhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVVcmlUb1BhdGgoZS51cmwpKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbChlLnVybClcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMucmVuZGVyUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBvbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3llZCkgcmV0dXJuXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKClcbiAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3VzZS1naXRodWItc3R5bGUnPigndXNlLWdpdGh1Yi1zdHlsZScsIHtcbiAgICAgICAgICB2YWx1ZTogYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnKSxcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3NldC1hdG9tLWhvbWUnPignc2V0LWF0b20taG9tZScsIHtcbiAgICAgICAgICBob21lOiBhdG9tLmdldENvbmZpZ0RpclBhdGgoKSxcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3NldC1udW1iZXItZXFucyc+KCdzZXQtbnVtYmVyLWVxbnMnLCB7XG4gICAgICAgICAgbnVtYmVyRXFuczogYXRvbUNvbmZpZygpLm1hdGhDb25maWcubnVtYmVyRXF1YXRpb25zLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc2V0LWJhc2UtcGF0aCc+KCdzZXQtYmFzZS1wYXRoJywge1xuICAgICAgICAgIHBhdGg6IHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICAgIHJlc29sdmUodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgfVxuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RvbS1yZWFkeScsIG9ubG9hZClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJ1bkpTPFQ+KGpzOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+XG4gICAgICB0aGlzLmVsZW1lbnQuZXhlY3V0ZUphdmFTY3JpcHQoanMsIGZhbHNlLCByZXNvbHZlKSxcbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SFRNTFNWRygpIHtcbiAgICBhd2FpdCB0aGlzLmdldEhUTUxTVkdQcm9taXNlXG4gICAgdGhpcy5nZXRIVE1MU1ZHUHJvbWlzZSA9IG5ldyBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSAoZTogRWxlY3Ryb24uSXBjTWVzc2FnZUV2ZW50Q3VzdG9tKSA9PiB7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogdG90YWxpdHktY2hlY2tcbiAgICAgICAgaWYgKGUuY2hhbm5lbCA9PT0gJ2h0bWwtc3ZnLXJlc3VsdCcpIHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaXBjLW1lc3NhZ2UnLCBoYW5kbGVyIGFzIGFueSlcbiAgICAgICAgICByZXNvbHZlKGUuYXJnc1swXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2lwYy1tZXNzYWdlJywgaGFuZGxlcilcbiAgICB9KVxuICAgIHRoaXMuZWxlbWVudC5zZW5kPCdnZXQtaHRtbC1zdmcnPignZ2V0LWh0bWwtc3ZnJywgdW5kZWZpbmVkKVxuICAgIHJldHVybiB0aGlzLmdldEhUTUxTVkdQcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYWJzdHJhY3Qgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRNUFZcblxuICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgIHRoaXMuZGVzdHJveWVkID0gdHJ1ZVxuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIHBhdGggJiYgaW1hZ2VXYXRjaGVyLnJlbW92ZUZpbGUocGF0aClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuICB9XG5cbiAgcHVibGljIG9uRGlkQ2hhbmdlVGl0bGUoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2spXG4gIH1cblxuICBwdWJsaWMgb25EaWRDaGFuZ2VNYXJrZG93bihjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtbWFya2Rvd24nLCBjYWxsYmFjaylcbiAgfVxuXG4gIHB1YmxpYyB0b2dnbGVSZW5kZXJMYXRleCgpIHtcbiAgICB0aGlzLnJlbmRlckxhVGVYID0gIXRoaXMucmVuZGVyTGFUZVhcbiAgICB0aGlzLmNoYW5nZUhhbmRsZXIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJlZnJlc2hJbWFnZXMob2xkc3JjOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB2ID0gYXdhaXQgaW1hZ2VXYXRjaGVyLmdldFZlcnNpb24ob2xkc3JjLCB0aGlzLmdldFBhdGgoKSlcbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwndXBkYXRlLWltYWdlcyc+KCd1cGRhdGUtaW1hZ2VzJywgeyBvbGRzcmMsIHYgfSlcbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRUaXRsZSgpOiBzdHJpbmdcblxuICBwdWJsaWMgZ2V0RGVmYXVsdExvY2F0aW9uKCk6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInIHtcbiAgICByZXR1cm4gYXRvbUNvbmZpZygpLnByZXZpZXdDb25maWcucHJldmlld0RvY2tcbiAgfVxuXG4gIHB1YmxpYyBnZXRJY29uTmFtZSgpIHtcbiAgICByZXR1cm4gJ21hcmtkb3duJ1xuICB9XG5cbiAgcHVibGljIGFic3RyYWN0IGdldFVSSSgpOiBzdHJpbmdcblxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0UGF0aCgpOiBzdHJpbmcgfCB1bmRlZmluZWRcblxuICBwdWJsaWMgZ2V0U2F2ZURpYWxvZ09wdGlvbnMoKSB7XG4gICAgbGV0IGRlZmF1bHRQYXRoID0gdGhpcy5nZXRQYXRoKClcbiAgICBpZiAoZGVmYXVsdFBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgICAgZGVmYXVsdFBhdGggPSAndW50aXRsZWQubWQnXG4gICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgZGVmYXVsdFBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIGRlZmF1bHRQYXRoKVxuICAgICAgfVxuICAgIH1cbiAgICBkZWZhdWx0UGF0aCArPSAnLicgKyBhdG9tQ29uZmlnKCkuc2F2ZUNvbmZpZy5kZWZhdWx0U2F2ZUZvcm1hdFxuICAgIHJldHVybiB7IGRlZmF1bHRQYXRoIH1cbiAgfVxuXG4gIHB1YmxpYyBzYXZlQXMoZmlsZVBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICAgIGlmIChmaWxlUGF0aCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICBpZiAodGhpcy5sb2FkaW5nKSB0aHJvdyBuZXcgRXJyb3IoJ1ByZXZpZXcgaXMgc3RpbGwgbG9hZGluZycpXG5cbiAgICBjb25zdCB7IG5hbWUsIGV4dCB9ID0gcGF0aC5wYXJzZShmaWxlUGF0aClcblxuICAgIGlmIChleHQgPT09ICcucGRmJykge1xuICAgICAgdGhpcy5lbGVtZW50LnByaW50VG9QREYoe30sIChlcnJvciwgZGF0YSkgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCBzYXZpbmcgdG8gUERGJywge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IGVycm9yLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGRhdGEpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgICB0aGlzLmdldEhUTUxUb1NhdmUoZmlsZVBhdGgpLnRoZW4oYXN5bmMgKGh0bWwpID0+IHtcbiAgICAgICAgICBjb25zdCBmdWxsSHRtbCA9IHV0aWwubWtIdG1sKFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnKSxcbiAgICAgICAgICApXG5cbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBmdWxsSHRtbClcbiAgICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aClcbiAgICAgICAgfSksXG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGRpZFNjcm9sbFByZXZpZXcoX21pbjogbnVtYmVyLCBfbWF4OiBudW1iZXIpIHtcbiAgICAvKiBub29wLCBpbXBsZW1lbnRhdGlvbiBpbiBlZGl0b3IgcHJldmlldyAqL1xuICB9XG5cbiAgcHJvdGVjdGVkIGNoYW5nZUhhbmRsZXIgPSAoKSA9PiB7XG4gICAgaGFuZGxlUHJvbWlzZSh0aGlzLnJlbmRlck1hcmtkb3duKCkpXG5cbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICBpZiAocGFuZSAhPT0gdW5kZWZpbmVkICYmIHBhbmUgIT09IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSkge1xuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgYXN5bmMgZ2V0TWFya2Rvd25Tb3VyY2UoKTogUHJvbWlzZTxzdHJpbmc+XG5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldEdyYW1tYXIoKTogR3JhbW1hciB8IHVuZGVmaW5lZFxuXG4gIC8vXG4gIC8vIFNjcm9sbCB0aGUgYXNzb2NpYXRlZCBwcmV2aWV3IHRvIHRoZSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IGxpbmUgb2ZcbiAgLy8gb2YgdGhlIHNvdXJjZSBtYXJrZG93bi5cbiAgLy9cbiAgLy8gQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgLy8gQHBhcmFtIHtudW1iZXJ9IGxpbmUgVGFyZ2V0IGxpbmUgb2YgYHRleHRgLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0b1xuICAvLyAgIGlkZW50aWZ5IHRoZSBlbG1lbnQgb2YgdGhlIGFzc29jaWF0ZWQgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0aGF0IHJlcHJlc2VudHNcbiAgLy8gICBgbGluZWAgYW5kIHNjcm9sbCB0aGUgYG1hcmtkb3duLXByZXZpZXctcGx1cy12aWV3YCB0byB0aGF0IGVsZW1lbnQuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgZWxlbWVudCB0aGF0IHJlcHJlc2VudHMgYGxpbmVgLiBJZiBubyBlbGVtZW50IGlzXG4gIC8vICAgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gIC8vXG4gIHByb3RlY3RlZCBzeW5jUHJldmlldyhsaW5lOiBudW1iZXIpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc3luYyc+KCdzeW5jJywgeyBsaW5lIH0pXG4gIH1cblxuICBwcml2YXRlIGhhbmRsZUV2ZW50cygpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRBZGRHcmFtbWFyKCgpID0+XG4gICAgICAgIF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgIGhhbmRsZVByb21pc2UodGhpcy5yZW5kZXJNYXJrZG93bigpKVxuICAgICAgICB9LCAyNTApLFxuICAgICAgKSxcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRVcGRhdGVHcmFtbWFyKFxuICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBoYW5kbGVQcm9taXNlKHRoaXMucmVuZGVyTWFya2Rvd24oKSlcbiAgICAgICAgfSwgMjUwKSxcbiAgICAgICksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgJ2NvcmU6bW92ZS11cCc6ICgpID0+IHRoaXMuZWxlbWVudC5zY3JvbGxCeSh7IHRvcDogLTEwIH0pLFxuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PiB0aGlzLmVsZW1lbnQuc2Nyb2xsQnkoeyB0b3A6IDEwIH0pLFxuICAgICAgICAnY29yZTpjb3B5JzogKGV2ZW50OiBDb21tYW5kRXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5jb3B5VG9DbGlwYm9hcmQoKSkgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpvcGVuLWRldi10b29scyc6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQub3BlbkRldlRvb2xzKClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpuZXctd2luZG93JzogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICAgICAgICdDYW4gbm90IG9wZW4gdGhpcyBwcmV2aWV3IGluIG5ldyB3aW5kb3c6IG5vIGZpbGUgcGF0aCcsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgYXRvbS5vcGVuKHtcbiAgICAgICAgICAgIHBhdGhzVG9PcGVuOiBbYG1hcmtkb3duLXByZXZpZXctcGx1czovL2ZpbGUvJHtwYXRofWBdLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgdXRpbC5kZXN0cm95KHRoaXMpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJpbnQnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnByaW50KClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLWluJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuem9vbUxldmVsICs9IDAuMVxuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1vdXQnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy56b29tTGV2ZWwgLT0gMC4xXG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNldFpvb21MZXZlbCh0aGlzLnpvb21MZXZlbClcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpyZXNldC16b29tJzogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuem9vbUxldmVsID0gMFxuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRab29tTGV2ZWwodGhpcy56b29tTGV2ZWwpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1zb3VyY2UnOiBhc3luYyAoX2V2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3N5bmMtc291cmNlJz4oJ3N5bmMtc291cmNlJywgdW5kZWZpbmVkKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcnLCAoKSA9PiB7XG4gICAgICAgIGlmIChhdG9tQ29uZmlnKCkucmVuZGVyZXIgPT09ICdtYXJrZG93bi1pdCcpIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnJywgKCkgPT4ge1xuICAgICAgICBpZiAoYXRvbUNvbmZpZygpLnJlbmRlcmVyID09PSAncGFuZG9jJykgdGhpcy5jaGFuZ2VIYW5kbGVyKClcbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJyxcbiAgICAgICAgdGhpcy5jaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubnVtYmVyRXF1YXRpb25zJyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdyZWxvYWQnPigncmVsb2FkJywgdW5kZWZpbmVkKVxuICAgICAgICB9LFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnJlbmRlcmVyJyxcbiAgICAgICAgdGhpcy5jaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJyxcbiAgICAgICAgKHsgbmV3VmFsdWUgfSkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCd1c2UtZ2l0aHViLXN0eWxlJz4oJ3VzZS1naXRodWItc3R5bGUnLCB7XG4gICAgICAgICAgICB2YWx1ZTogbmV3VmFsdWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZW5kZXJNYXJrZG93bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICBhd2FpdCB0aGlzLnJlbmRlck1hcmtkb3duVGV4dChzb3VyY2UpXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldEhUTUxUb1NhdmUoc2F2ZVBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IHNvdXJjZSA9IGF3YWl0IHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKVxuICAgIHJldHVybiByZW5kZXJlci5yZW5kZXIoXG4gICAgICBzb3VyY2UsXG4gICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICdzYXZlJyxcbiAgICAgIHNhdmVQYXRoLFxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcmVuZGVyTWFya2Rvd25UZXh0KHRleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkb21Eb2N1bWVudCA9IGF3YWl0IHJlbmRlcmVyLnJlbmRlcihcbiAgICAgICAgdGV4dCxcbiAgICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICB0aGlzLmRlZmF1bHRSZW5kZXJNb2RlLFxuICAgICAgKVxuICAgICAgaWYgKHRoaXMuZGVzdHJveWVkKSByZXR1cm5cbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlXG4gICAgICB0aGlzLmVsZW1lbnQuc2VuZDwndXBkYXRlLXByZXZpZXcnPigndXBkYXRlLXByZXZpZXcnLCB7XG4gICAgICAgIGh0bWw6IGRvbURvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUwsXG4gICAgICAgIHJlbmRlckxhVGVYOiB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICBtanJlbmRlcmVyOiBhdG9tQ29uZmlnKCkubWF0aENvbmZpZy5sYXRleFJlbmRlcmVyLFxuICAgICAgfSlcbiAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzZXQtc291cmNlLW1hcCc+KCdzZXQtc291cmNlLW1hcCcsIHtcbiAgICAgICAgbWFwOiB1dGlsLmJ1aWxkTGluZU1hcChtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKSksXG4gICAgICB9KVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtbWFya2Rvd24nKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnNob3dFcnJvcihlcnJvciBhcyBFcnJvcilcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNob3dFcnJvcihlcnJvcjogRXJyb3IpIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRGYXRhbEVycm9yKFxuICAgICAgICAnRXJyb3IgcmVwb3J0ZWQgb24gYSBkZXN0cm95ZWQgTWFya2Rvd24gUHJldmlldyBQbHVzIHZpZXcnLFxuICAgICAgICB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgfSxcbiAgICAgIClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnZXJyb3InPignZXJyb3InLCB7IG1zZzogZXJyb3IubWVzc2FnZSB9KVxuICB9XG5cbiAgcHJpdmF0ZSBjb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpXG4gICAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKClcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzZWxlY3Rpb24uYmFzZU5vZGUgYXMgSFRNTEVsZW1lbnRcblxuICAgIC8vIFVzZSBkZWZhdWx0IGNvcHkgZXZlbnQgaGFuZGxlciBpZiB0aGVyZSBpcyBzZWxlY3RlZCB0ZXh0IGluc2lkZSB0aGlzIHZpZXdcbiAgICBpZiAoXG4gICAgICBzZWxlY3RlZFRleHQgJiZcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzIC8vVE9ETzogY29tcGxhaW4gb24gVFNcbiAgICAgIHNlbGVjdGVkTm9kZSAhPSBudWxsIC8vICYmXG4gICAgICAvLyAodGhpcy5wcmV2aWV3ID09PSBzZWxlY3RlZE5vZGUgfHwgdGhpcy5wcmV2aWV3LmNvbnRhaW5zKHNlbGVjdGVkTm9kZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oYXN5bmMgKHNyYykgPT5cbiAgICAgICAgY29weUh0bWwoc3JjLCB0aGlzLmdldFBhdGgoKSwgdGhpcy5yZW5kZXJMYVRlWCksXG4gICAgICApLFxuICAgIClcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVN0eWxlcygpIHtcbiAgICBjb25zdCBzdHlsZXM6IHN0cmluZ1tdID0gW11cbiAgICBmb3IgKGNvbnN0IHNlIG9mIGF0b20uc3R5bGVzLmdldFN0eWxlRWxlbWVudHMoKSkge1xuICAgICAgc3R5bGVzLnB1c2goc2UuaW5uZXJIVE1MKVxuICAgIH1cbiAgICB0aGlzLmVsZW1lbnQuc2VuZDwnc3R5bGUnPignc3R5bGUnLCB7IHN0eWxlcyB9KVxuICB9XG59XG4iXX0=