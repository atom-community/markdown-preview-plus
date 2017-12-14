"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const atom_1 = require("atom");
const { $, $$$, ScrollView } = require('atom-space-pen-views');
const _ = require("lodash");
const fs = require("fs-plus");
const renderer = require("./renderer");
const update_preview_1 = require("./update-preview");
const markdownIt = require("./markdown-it-helper");
const imageWatcher = require("./image-watch-helper");
class MarkdownPreviewView extends ScrollView {
    constructor({ editorId, filePath }) {
        super();
        this.emitter = new atom_1.Emitter();
        this.renderLaTeX = !!atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
        this.disposables = new atom_1.CompositeDisposable();
        this.loaded = true;
        this.getPathToElement = this.getPathToElement.bind(this);
        this.syncSource = this.syncSource.bind(this);
        this.getPathToToken = this.getPathToToken.bind(this);
        this.syncPreview = this.syncPreview.bind(this);
        this.editorId = editorId;
        this.filePath = filePath;
    }
    static content() {
        return this.div({ class: 'markdown-preview native-key-bindings', tabindex: -1 }, () => this.div({ class: 'update-preview' }));
    }
    attached() {
        if (this.isAttached) {
            return;
        }
        this.isAttached = true;
        if (this.editorId !== undefined) {
            return this.resolveEditor(this.editorId);
        }
        else if (this.filePath !== undefined) {
            return this.subscribeToFilePath(this.filePath);
        }
    }
    serialize() {
        return {
            deserializer: 'MarkdownPreviewView',
            filePath: this.getPath() || this.filePath,
            editorId: this.editorId,
        };
    }
    destroy() {
        imageWatcher.removeFile(this.getPath());
        this.disposables.dispose();
    }
    onDidChangeTitle(callback) {
        return this.emitter.on('did-change-title', callback);
    }
    onDidChangeModified(_callback) {
        return new atom_1.Disposable();
    }
    onDidChangeMarkdown(callback) {
        return this.emitter.on('did-change-markdown', callback);
    }
    subscribeToFilePath(filePath) {
        this.file = new atom_1.File(filePath);
        this.emitter.emit('did-change-title');
        this.handleEvents();
        return this.renderMarkdown();
    }
    resolveEditor(editorId) {
        const resolve = () => {
            this.editor = this.editorForId(editorId);
            if (this.editor != null) {
                if (this.editor != null) {
                    this.emitter.emit('did-change-title');
                }
                this.handleEvents();
                return this.renderMarkdown();
            }
            else {
                const pane = atom.workspace.paneForItem(this);
                pane && pane.destroyItem(this);
            }
        };
        return resolve();
    }
    editorForId(editorId) {
        for (const editor of atom.workspace.getTextEditors()) {
            if (editor.id === editorId) {
                return editor;
            }
        }
        return null;
    }
    handleEvents() {
        this.disposables.add(atom.grammars.onDidAddGrammar(() => _.debounce(() => this.renderMarkdown(), 250)));
        this.disposables.add(atom.grammars.onDidUpdateGrammar(_.debounce(() => this.renderMarkdown(), 250)));
        atom.commands.add(this.element, {
            'core:move-up': () => this.scrollUp(),
            'core:move-down': () => this.scrollDown(),
            'core:save-as': (event) => {
                event.stopPropagation();
                return this.saveAs();
            },
            'core:copy': (event) => {
                if (this.copyToClipboard())
                    event.stopPropagation();
            },
            'markdown-preview-plus:zoom-in': () => {
                const zoomLevel = parseFloat(this.css('zoom')) || 1;
                return this.css('zoom', zoomLevel + 0.1);
            },
            'markdown-preview-plus:zoom-out': () => {
                const zoomLevel = parseFloat(this.css('zoom')) || 1;
                return this.css('zoom', zoomLevel - 0.1);
            },
            'markdown-preview-plus:reset-zoom': () => this.css('zoom', 1),
            'markdown-preview-plus:sync-source': (event) => this.getMarkdownSource().then((source) => {
                if (source == null) {
                    return;
                }
                return this.syncSource(source, event.target);
            }),
        });
        const changeHandler = () => {
            this.renderMarkdown();
            const pane = atom.workspace.paneForItem(this);
            if (pane !== undefined && pane !== atom.workspace.getActivePane()) {
                pane.activateItem(this);
            }
        };
        if (this.file != null) {
            this.disposables.add(this.file.onDidChange(changeHandler));
        }
        else if (this.editor != null) {
            this.disposables.add(this.editor.getBuffer().onDidStopChanging(function () {
                if (atom.config.get('markdown-preview-plus.liveUpdate')) {
                    changeHandler();
                }
            }));
            this.disposables.add(this.editor.onDidChangePath(() => {
                this.emitter.emit('did-change-title');
            }));
            this.disposables.add(this.editor.getBuffer().onDidSave(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    changeHandler();
                }
            }));
            this.disposables.add(this.editor.getBuffer().onDidReload(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    changeHandler();
                }
            }));
            this.disposables.add(atom.commands.add(atom.views.getView(this.editor), {
                'markdown-preview-plus:sync-preview': (_event) => this.getMarkdownSource().then((source) => {
                    if (source === undefined) {
                        return;
                    }
                    return this.syncPreview(source, this.editor.getCursorBufferPosition().row);
                }),
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
                this.element.setAttribute('data-use-github-style', '');
            }
            else {
                this.element.removeAttribute('data-use-github-style');
            }
        }));
    }
    renderMarkdown() {
        if (!this.loaded) {
            this.showLoading();
        }
        return this.getMarkdownSource().then((source) => {
            if (source !== undefined) {
                this.renderMarkdownText(source);
            }
        });
    }
    refreshImages(oldsrc) {
        const imgs = this.element.querySelectorAll('img[src]');
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
                const v = imageWatcher.getVersion(src, this.getPath());
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
    getMarkdownSource() {
        if (this.file != null ? this.file.getPath() : undefined) {
            return this.file.read();
        }
        else if (this.editor != null) {
            return Promise.resolve(this.editor.getText());
        }
        else {
            return Promise.resolve(null);
        }
    }
    getHTML(callback) {
        return this.getMarkdownSource().then((source) => {
            if (source === undefined) {
                return;
            }
            renderer.toHTML(source, this.getPath(), this.getGrammar(), this.renderLaTeX, false, callback);
        });
    }
    renderMarkdownText(text) {
        renderer.toDOMFragment(text, this.getPath(), this.getGrammar(), this.renderLaTeX, (error, domFragment) => {
            if (error) {
                return this.showError(error);
            }
            else {
                this.loading = false;
                this.loaded = true;
                if (!this.updatePreview && this.find('div.update-preview')[0]) {
                    this.updatePreview = new update_preview_1.UpdatePreview(this.find('div.update-preview')[0]);
                }
                this.updatePreview &&
                    domFragment &&
                    this.updatePreview.update(domFragment, this.renderLaTeX);
                this.emitter.emit('did-change-markdown');
                return this.originalTrigger('markdown-preview-plus:markdown-changed');
            }
        });
    }
    getTitle() {
        if (this.file != null) {
            return `${path.basename(this.getPath())} Preview`;
        }
        else if (this.editor != null) {
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
        if (this.file != null) {
            return `markdown-preview-plus://${this.getPath()}`;
        }
        else {
            return `markdown-preview-plus://editor/${this.editorId}`;
        }
    }
    getPath() {
        if (this.file != null) {
            return this.file.getPath();
        }
        else if (this.editor != null) {
            return this.editor.getPath();
        }
    }
    getGrammar() {
        return this.editor != null ? this.editor.getGrammar() : undefined;
    }
    getDocumentStyleSheets() {
        return document.styleSheets;
    }
    getTextEditorStyles() {
        const textEditorStyles = document.createElement('atom-styles');
        textEditorStyles.initialize(atom.styles);
        textEditorStyles.setAttribute('context', 'atom-text-editor');
        document.body.appendChild(textEditorStyles);
        return Array.from(textEditorStyles.childNodes).map((styleElement) => styleElement.innerText);
    }
    getMarkdownPreviewCSS() {
        const markdowPreviewRules = [];
        const ruleRegExp = /\.markdown-preview/;
        const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/;
        for (const stylesheet of Array.from(this.getDocumentStyleSheets())) {
            if (stylesheet.rules != null) {
                for (const rule of Array.from(stylesheet.rules)) {
                    if ((rule.selectorText != null
                        ? rule.selectorText.match(ruleRegExp)
                        : undefined) != null) {
                        markdowPreviewRules.push(rule.cssText);
                    }
                }
            }
        }
        return markdowPreviewRules
            .concat(this.getTextEditorStyles())
            .join('\n')
            .replace(/atom-text-editor/g, 'pre.editor-colors')
            .replace(/:host/g, '.host')
            .replace(cssUrlRefExp, function (_match, assetsName, _offset, _string) {
            const assetPath = path.join(__dirname, '../assets', assetsName);
            const originalData = fs.readFileSync(assetPath, 'binary');
            const base64Data = new Buffer(originalData, 'binary').toString('base64');
            return `url('data:image/jpeg;base64,${base64Data}')`;
        });
    }
    showError(result) {
        return this.html($$$(function () {
            this.h2('Previewing Markdown Failed');
            return this.h3(result.message);
        }));
    }
    showLoading() {
        this.loading = true;
        return this.html($$$(function () {
            return this.div({ class: 'markdown-spinner' }, 'Loading Markdown\u2026');
        }));
    }
    copyToClipboard() {
        if (this.loading) {
            return false;
        }
        const selection = window.getSelection();
        const selectedText = selection.toString();
        const selectedNode = selection.baseNode;
        if (selectedText &&
            selectedNode != null &&
            (this[0] === selectedNode || $.contains(this[0], selectedNode))) {
            return false;
        }
        this.getHTML(function (error, html) {
            if (error !== null) {
                console.warn('Copying Markdown as HTML failed', error);
            }
            else {
                atom.clipboard.write(html);
            }
        });
        return true;
    }
    saveAs() {
        if (this.loading) {
            return;
        }
        let filePath = this.getPath();
        let title = 'Markdown to HTML';
        if (filePath) {
            title = path.parse(filePath).name;
            filePath += '.html';
        }
        else {
            const projectPath = atom.project.getPaths()[0];
            filePath = 'untitled.md.html';
            if (projectPath) {
                filePath = path.join(projectPath, filePath);
            }
        }
        const htmlFilePath = atom.showSaveDialogSync(filePath);
        if (htmlFilePath) {
            return this.getHTML((error, htmlBody) => {
                if (error !== null) {
                    console.warn('Saving Markdown as HTML failed', error);
                }
                else {
                    let mathjaxScript;
                    if (this.renderLaTeX) {
                        mathjaxScript = `\

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    jax: ["input/TeX","output/HTML-CSS"],
    extensions: [],
    TeX: {
      extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
    },
    showMathMenu: false
  });
</script>
<script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js">
</script>\
`;
                    }
                    else {
                        mathjaxScript = '';
                    }
                    const html = `\
<!DOCTYPE html>
<html>
  <head>
      <meta charset="utf-8" />
      <title>${title}</title>${mathjaxScript}
      <style>${this.getMarkdownPreviewCSS()}</style>
  </head>
  <body class='markdown-preview'>${htmlBody}</body>
</html>` + '\n';
                    fs.writeFileSync(htmlFilePath, html);
                    atom.workspace.open(htmlFilePath);
                }
            });
        }
    }
    isEqual(other) {
        return this[0] === (other !== null ? other[0] : undefined);
    }
    bubbleToContainerElement(element) {
        let testElement = element;
        while (testElement !== document.body) {
            const parent = testElement.parentElement;
            if (parent.classList.contains('MathJax_Display')) {
                return parent.parentElement;
            }
            if (parent.classList.contains('atom-text-editor')) {
                return parent;
            }
            testElement = parent;
        }
        return element;
    }
    bubbleToContainerToken(pathToToken) {
        const end = pathToToken.length - 1;
        for (let i = 0; i <= end; i++) {
            if (pathToToken[i].tag === 'table') {
                return pathToToken.slice(0, i + 1);
            }
        }
        return pathToToken;
    }
    encodeTag(element) {
        if (element.classList.contains('math')) {
            return 'math';
        }
        if (element.classList.contains('atom-text-editor')) {
            return 'code';
        }
        return element.tagName.toLowerCase();
    }
    decodeTag(token) {
        if (token.tag === 'math') {
            return 'span';
        }
        if (token.tag === 'code') {
            return 'span';
        }
        if (token.tag === '') {
            return null;
        }
        return token.tag;
    }
    getPathToElement(element) {
        if (element.classList.contains('markdown-preview')) {
            return [
                {
                    tag: 'div',
                    index: 0,
                },
            ];
        }
        element = this.bubbleToContainerElement(element);
        const tag = this.encodeTag(element);
        const siblings = element.parentElement.children;
        let siblingsCount = 0;
        for (const sibling of Array.from(siblings)) {
            const siblingTag = sibling.nodeType === 1 ? this.encodeTag(sibling) : null;
            if (sibling === element) {
                const pathToElement = this.getPathToElement(element.parentElement);
                pathToElement.push({
                    tag,
                    index: siblingsCount,
                });
                return pathToElement;
            }
            else if (siblingTag === tag) {
                siblingsCount++;
            }
        }
        throw new Error('failure in getPathToElement');
    }
    syncSource(text, element) {
        const pathToElement = this.getPathToElement(element);
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
        if (finalToken !== null) {
            this.editor.setCursorBufferPosition([finalToken.map[0], 0]);
            return finalToken.map[0];
        }
        else {
            return null;
        }
    }
    getPathToToken(tokens, line) {
        let pathToToken = [];
        let tokenTagCount = [];
        let level = 0;
        for (const token of tokens) {
            if (token.level < level) {
                break;
            }
            if (token.hidden) {
                continue;
            }
            if (token.nesting === -1) {
                continue;
            }
            const tag = this.decodeTag(token);
            if (tag === null) {
                continue;
            }
            token.tag = tag;
            if (token.map != null &&
                line >= token.map[0] &&
                line <= token.map[1] - 1) {
                if (token.nesting === 1) {
                    pathToToken.push({
                        tag: token.tag,
                        index: tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0,
                    });
                    tokenTagCount = [];
                    level++;
                }
                else if (token.nesting === 0) {
                    pathToToken.push({
                        tag: token.tag,
                        index: tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0,
                    });
                    break;
                }
            }
            else if (token.level === level) {
                if (tokenTagCount[token.tag] != null) {
                    tokenTagCount[token.tag]++;
                }
                else {
                    tokenTagCount[token.tag] = 1;
                }
            }
        }
        pathToToken = this.bubbleToContainerToken(pathToToken);
        return pathToToken;
    }
    syncPreview(text, line) {
        const tokens = markdownIt.getTokens(text, this.renderLaTeX);
        const pathToToken = this.getPathToToken(tokens, line);
        let element = this.find('.update-preview').eq(0);
        for (const token of pathToToken) {
            const candidateElement = element.children(token.tag).eq(token.index);
            if (candidateElement.length !== 0) {
                element = candidateElement;
            }
            else {
                break;
            }
        }
        if (element[0].classList.contains('update-preview')) {
            return null;
        }
        if (!element[0].classList.contains('update-preview')) {
            element[0].scrollIntoView();
        }
        const maxScrollTop = this.element.scrollHeight - this.innerHeight();
        if (!(this.scrollTop() >= maxScrollTop)) {
            this.element.scrollTop -= this.innerHeight() / 4;
        }
        element.addClass('flash');
        setTimeout(() => element.removeClass('flash'), 1000);
        return element[0];
    }
}
exports.MarkdownPreviewView = MarkdownPreviewView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLDZCQUE2QjtBQUU3QiwrQkFPYTtBQUViLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQzlELDRCQUE0QjtBQUM1Qiw4QkFBOEI7QUFFOUIsdUNBQXVDO0FBQ3ZDLHFEQUFnRDtBQUNoRCxtREFBbUQ7QUFDbkQscURBQXFEO0FBY3JELHlCQUFpQyxTQUFRLFVBQVU7SUF1QmpELFlBQVksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFhO1FBRTNDLEtBQUssRUFBRSxDQUFBO1FBdEJELFlBQU8sR0FHVixJQUFJLGNBQU8sRUFBRSxDQUFBO1FBRVYsZ0JBQVcsR0FBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQzlDLHFEQUFxRCxDQUN0RCxDQUFBO1FBQ08sZ0JBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDdkMsV0FBTSxHQUFHLElBQUksQ0FBQTtRQWNuQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtJQUMxQixDQUFDO0lBakJELE1BQU0sQ0FBQyxPQUFPO1FBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ2IsRUFBRSxLQUFLLEVBQUUsc0NBQXNDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBRS9ELEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUM1QyxDQUFBO0lBQ0gsQ0FBQztJQWFELFFBQVE7UUFDTixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUE7UUFDUixDQUFDO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUE7UUFFdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUMxQyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNoRCxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVM7UUFDUCxNQUFNLENBQUM7WUFDTCxZQUFZLEVBQUUscUJBQXFCO1lBQ25DLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVE7WUFDekMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3hCLENBQUE7SUFDSCxDQUFDO0lBRUQsT0FBTztRQUNMLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM1QixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsUUFBb0I7UUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3RELENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxTQUFjO1FBRWhDLE1BQU0sQ0FBQyxJQUFJLGlCQUFVLEVBQUUsQ0FBQTtJQUN6QixDQUFDO0lBRUQsbUJBQW1CLENBQUMsUUFBb0I7UUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3pELENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxRQUFnQjtRQUNsQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFDckMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7SUFDOUIsQ0FBQztJQUVELGFBQWEsQ0FBQyxRQUFnQjtRQUM1QixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7WUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBRXhDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO2dCQUN2QyxDQUFDO2dCQUNELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtnQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUM5QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBR04sTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQzdDLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ2hDLENBQUM7UUFDSCxDQUFDLENBQUE7UUFFRCxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDbEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUFnQjtRQUMxQixHQUFHLENBQUMsQ0FBQyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sQ0FBQyxNQUFNLENBQUE7WUFDZixDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsWUFBWTtRQUNWLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FDakMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQzdDLENBQ0YsQ0FBQTtRQUNELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUM5QixDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FDN0MsQ0FDRixDQUFBO1FBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUM5QixjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNyQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3pDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN4QixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUE7Z0JBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7WUFDdEIsQ0FBQztZQUNELFdBQVcsRUFBRSxDQUFDLEtBQW1CLEVBQUUsRUFBRTtnQkFDbkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQTtZQUNyRCxDQUFDO1lBQ0QsK0JBQStCLEVBQUUsR0FBRyxFQUFFO2dCQUNwQyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQTtZQUMxQyxDQUFDO1lBQ0QsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO2dCQUNyQyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQTtZQUMxQyxDQUFDO1lBQ0Qsa0NBQWtDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzdELG1DQUFtQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDN0MsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBZSxFQUFFLEVBQUU7Z0JBQ2hELEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNuQixNQUFNLENBQUE7Z0JBQ1IsQ0FBQztnQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQXFCLENBQUMsQ0FBQTtZQUM3RCxDQUFDLENBQUM7U0FDTCxDQUFDLENBQUE7UUFFRixNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUU7WUFDekIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1lBRXJCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQzdDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3pCLENBQUM7UUFDSCxDQUFDLENBQUE7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQTtRQUM1RCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDeEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hELGFBQWEsRUFBRSxDQUFBO2dCQUNqQixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQ0gsQ0FBQTtZQUNELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7WUFDdkMsQ0FBQyxDQUFDLENBQ0gsQ0FBQTtZQUNELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQztnQkFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekQsYUFBYSxFQUFFLENBQUE7Z0JBQ2pCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFBO1lBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsV0FBVyxDQUFDO2dCQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6RCxhQUFhLEVBQUUsQ0FBQTtnQkFDakIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUNILENBQUE7WUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNqRCxvQ0FBb0MsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQy9DLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQWUsRUFBRSxFQUFFO29CQUNoRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQzt3QkFDekIsTUFBTSxDQUFBO29CQUNSLENBQUM7b0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQ3JCLE1BQU0sRUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsR0FBRyxDQUMxQyxDQUFBO2dCQUNILENBQUMsQ0FBQzthQUNMLENBQUMsQ0FDSCxDQUFBO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FDckIsNENBQTRDLEVBQzVDLGFBQWEsQ0FDZCxDQUNGLENBQUE7UUFHRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7WUFDbEMsMkNBQTJDLEVBQUUsR0FBRyxFQUFFO2dCQUNoRCxFQUFFLENBQUMsQ0FDRCxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLEtBQUssSUFBSTtvQkFDM0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLElBQUksQ0FBQyxNQUNoRCxDQUFDLENBQUMsQ0FBQztvQkFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQTtvQkFDcEMsYUFBYSxFQUFFLENBQUE7Z0JBQ2pCLENBQUM7WUFDSCxDQUFDO1NBQ0YsQ0FBQyxDQUNILENBQUE7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQ2pCLHNDQUFzQyxFQUN0QyxDQUFDLGNBQWMsRUFBRSxFQUFFO1lBQ2pCLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQ3hELENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO1lBQ3ZELENBQUM7UUFDSCxDQUFDLENBQ0YsQ0FDRixDQUFBO0lBQ0gsQ0FBQztJQUVELGNBQWM7UUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUNwQixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQWUsRUFBRSxFQUFFO1lBQ3ZELEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDakMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELGFBQWEsQ0FBQyxNQUFjO1FBQzFCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUVwRCxDQUFBO1FBQ0QsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO1FBQ2pCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksR0FBdUIsQ0FBQTtZQUMzQixJQUFJLEVBQXNCLENBQUE7WUFDMUIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUUsQ0FBQTtZQUNsQyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUE7WUFDMUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVixDQUFDO2dCQUFBLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFBO1lBQ3ZCLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RCLEVBQUUsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO2dCQUN4QixDQUFDO2dCQUNELE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO2dCQUN0RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDYixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtvQkFDMUMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQTtvQkFDbkMsQ0FBQztnQkFDSCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ3hCLENBQUM7WUFDSCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUN4QixDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUE7SUFDZixDQUFDO0lBRUQsaUJBQWlCO1FBQ2YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDekIsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQy9DLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzlCLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLFFBQXlEO1FBQy9ELE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFlLEVBQUUsRUFBRTtZQUN2RCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFBO1lBQ1IsQ0FBQztZQUVELFFBQVEsQ0FBQyxNQUFNLENBQ2IsTUFBTSxFQUNOLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFDZCxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQ2pCLElBQUksQ0FBQyxXQUFXLEVBQ2hCLEtBQUssRUFDTCxRQUFRLENBQ1QsQ0FBQTtRQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELGtCQUFrQixDQUFDLElBQVk7UUFDN0IsUUFBUSxDQUFDLGFBQWEsQ0FDcEIsSUFBSSxFQUNKLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFDZCxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQ2pCLElBQUksQ0FBQyxXQUFXLEVBQ2hCLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxFQUFFO1lBQ3JCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDOUIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO2dCQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtnQkFHbEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSw4QkFBYSxDQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ25DLENBQUE7Z0JBQ0gsQ0FBQztnQkFDRCxJQUFJLENBQUMsYUFBYTtvQkFDaEIsV0FBVztvQkFDWCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxXQUFzQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtnQkFDckUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQTtnQkFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsd0NBQXdDLENBQUMsQ0FBQTtZQUN2RSxDQUFDO1FBQ0gsQ0FBQyxDQUNGLENBQUE7SUFDSCxDQUFDO0lBRUQsUUFBUTtRQUNOLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN0QixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUE7UUFDbkQsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFBO1FBQzVDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQTtRQUMzQixDQUFDO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxNQUFNLENBQUMsVUFBVSxDQUFBO0lBQ25CLENBQUM7SUFFRCxNQUFNO1FBQ0osRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUE7UUFDcEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLGtDQUFrQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDMUQsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPO1FBQ0wsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQzVCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQzlCLENBQUM7SUFDSCxDQUFDO0lBRUQsVUFBVTtRQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO0lBQ25FLENBQUM7SUFFRCxzQkFBc0I7UUFFcEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUE7SUFDN0IsQ0FBQztJQUVELG1CQUFtQjtRQUNqQixNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQzdDLGFBQWEsQ0FDOEMsQ0FBQTtRQUM3RCxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3hDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtRQUM1RCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBRzNDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FDaEQsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFFLFlBQTRCLENBQUMsU0FBUyxDQUMxRCxDQUFBO0lBQ0gsQ0FBQztJQUVELHFCQUFxQjtRQUNuQixNQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQTtRQUM5QixNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQTtRQUN2QyxNQUFNLFlBQVksR0FBRyxxREFBcUQsQ0FBQTtRQUUxRSxHQUFHLENBQUMsQ0FBQyxNQUFNLFVBQVUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25FLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDN0IsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVoRCxFQUFFLENBQUMsQ0FDRCxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSTt3QkFDeEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQzt3QkFDckMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQ3BCLENBQUMsQ0FBQyxDQUFDO3dCQUNELG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7b0JBQ3hDLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxDQUFDLG1CQUFtQjthQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7YUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNWLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQzthQUNqRCxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQzthQUMxQixPQUFPLENBQUMsWUFBWSxFQUFFLFVBQVMsTUFBTSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTztZQUVsRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDL0QsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDekQsTUFBTSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUN4RSxNQUFNLENBQUMsK0JBQStCLFVBQVUsSUFBSSxDQUFBO1FBQ3RELENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVELFNBQVMsQ0FBQyxNQUFhO1FBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNkLEdBQUcsQ0FBQztZQUVGLElBQUksQ0FBQyxFQUFFLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtZQUVyQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDaEMsQ0FBQyxDQUFDLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ2QsR0FBRyxDQUFDO1lBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSx3QkFBd0IsQ0FBQyxDQUFBO1FBQzFFLENBQUMsQ0FBQyxDQUNILENBQUE7SUFDSCxDQUFDO0lBRUQsZUFBZTtRQUNiLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxLQUFLLENBQUE7UUFDZCxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ3ZDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUN6QyxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFBO1FBR3ZDLEVBQUUsQ0FBQyxDQUNELFlBQVk7WUFFWixZQUFZLElBQUksSUFBSTtZQUNwQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxZQUFZLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQ2hFLENBQUMsQ0FBQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQTtRQUNkLENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVMsS0FBSyxFQUFFLElBQUk7WUFDL0IsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUNBQWlDLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDeEQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQzVCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUVGLE1BQU0sQ0FBQyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsTUFBTTtRQUNKLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQTtRQUNSLENBQUM7UUFFRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDN0IsSUFBSSxLQUFLLEdBQUcsa0JBQWtCLENBQUE7UUFDOUIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNiLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQTtZQUNqQyxRQUFRLElBQUksT0FBTyxDQUFBO1FBQ3JCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDOUMsUUFBUSxHQUFHLGtCQUFrQixDQUFBO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTtZQUM3QyxDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN0RCxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBbUIsRUFBRSxRQUFnQixFQUFFLEVBQUU7Z0JBQzVELEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLEtBQUssQ0FBQyxDQUFBO2dCQUN2RCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLElBQUksYUFBYSxDQUFBO29CQUNqQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDckIsYUFBYSxHQUFHOzs7Ozs7Ozs7Ozs7OztDQWMzQixDQUFBO29CQUNTLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ04sYUFBYSxHQUFHLEVBQUUsQ0FBQTtvQkFDcEIsQ0FBQztvQkFDRCxNQUFNLElBQUksR0FDUjs7Ozs7ZUFLRyxLQUFLLFdBQVcsYUFBYTtlQUM3QixJQUFJLENBQUMscUJBQXFCLEVBQUU7O21DQUVSLFFBQVE7UUFDbkMsR0FBRyxJQUFJLENBQUE7b0JBRUwsRUFBRSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7b0JBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO2dCQUNuQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FBQyxLQUFvQjtRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUM1RCxDQUFDO0lBV0Qsd0JBQXdCLENBQUMsT0FBb0I7UUFDM0MsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFBO1FBQ3pCLE9BQU8sV0FBVyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsYUFBYyxDQUFBO1lBQ3pDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWMsQ0FBQTtZQUM5QixDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUE7WUFDZixDQUFDO1lBQ0QsV0FBVyxHQUFHLE1BQU0sQ0FBQTtRQUN0QixDQUFDO1FBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQTtJQUNoQixDQUFDO0lBZUQsc0JBQXNCLENBQUMsV0FBa0Q7UUFDdkUsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7UUFDbEMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM5QixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDcEMsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsV0FBVyxDQUFBO0lBQ3BCLENBQUM7SUFRRCxTQUFTLENBQUMsT0FBb0I7UUFDNUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUE7UUFDZixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQTtRQUNmLENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUN0QyxDQUFDO0lBUUQsU0FBUyxDQUFDLEtBQVk7UUFDcEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxNQUFNLENBQUE7UUFDZixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sQ0FBQyxNQUFNLENBQUE7UUFDZixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDYixDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUE7SUFDbEIsQ0FBQztJQWFELGdCQUFnQixDQUNkLE9BQW9CO1FBRXBCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQztnQkFDTDtvQkFDRSxHQUFHLEVBQUUsS0FBSztvQkFDVixLQUFLLEVBQUUsQ0FBQztpQkFDVDthQUNGLENBQUE7UUFDSCxDQUFDO1FBRUQsT0FBTyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNoRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ25DLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFjLENBQUMsUUFBUSxDQUFBO1FBQ2hELElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQTtRQUVyQixHQUFHLENBQUMsQ0FBQyxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLFVBQVUsR0FDZCxPQUFPLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtZQUN4RSxFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxhQUFjLENBQUMsQ0FBQTtnQkFDbkUsYUFBYSxDQUFDLElBQUksQ0FBQztvQkFDakIsR0FBRztvQkFDSCxLQUFLLEVBQUUsYUFBYTtpQkFDckIsQ0FBQyxDQUFBO2dCQUNGLE1BQU0sQ0FBQyxhQUFhLENBQUE7WUFDdEIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsYUFBYSxFQUFFLENBQUE7WUFDakIsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUE7SUFDaEQsQ0FBQztJQWFELFVBQVUsQ0FBQyxJQUFZLEVBQUUsT0FBb0I7UUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3BELGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUNyQixhQUFhLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDckIsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ2IsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUMzRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUE7UUFDckIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFBO1FBRWIsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLEtBQUssQ0FBQTtZQUNQLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDakIsUUFBUSxDQUFBO1lBQ1YsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEIsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUVqQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ3RCLFVBQVUsR0FBRyxLQUFLLENBQUE7d0JBQ3BCLENBQUM7d0JBQ0QsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFBO3dCQUNyQixLQUFLLEVBQUUsQ0FBQTtvQkFDVCxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtvQkFDMUIsQ0FBQztnQkFDSCxDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FDUixLQUFLLENBQUMsT0FBTyxLQUFLLENBQUM7b0JBQ25CLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FDM0MsQ0FBQyxDQUFDLENBQUM7b0JBQ0QsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxVQUFVLEdBQUcsS0FBSyxDQUFBO3dCQUNsQixLQUFLLENBQUE7b0JBQ1AsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUE7b0JBQzFCLENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLEtBQUssQ0FBQTtZQUNQLENBQUM7UUFDSCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUMzRCxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMxQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ2IsQ0FBQztJQUNILENBQUM7SUFlRCxjQUFjLENBQUMsTUFBZSxFQUFFLElBQVk7UUFDMUMsSUFBSSxXQUFXLEdBQTBDLEVBQUUsQ0FBQTtRQUMzRCxJQUFJLGFBQWEsR0FBYSxFQUFFLENBQUE7UUFDaEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFBO1FBRWIsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLEtBQUssQ0FBQTtZQUNQLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDakIsUUFBUSxDQUFBO1lBQ1YsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixRQUFRLENBQUE7WUFDVixDQUFDO1lBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNqQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDakIsUUFBUSxDQUFBO1lBQ1YsQ0FBQztZQUNELEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1lBRWYsRUFBRSxDQUFDLENBRUQsS0FBSyxDQUFDLEdBQUcsSUFBSSxJQUFJO2dCQUNqQixJQUFJLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQ3pCLENBQUMsQ0FBQyxDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEIsV0FBVyxDQUFDLElBQUksQ0FBQzt3QkFDZixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7d0JBQ2QsS0FBSyxFQUNILGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNsRSxDQUFDLENBQUE7b0JBQ0YsYUFBYSxHQUFHLEVBQUUsQ0FBQTtvQkFDbEIsS0FBSyxFQUFFLENBQUE7Z0JBQ1QsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvQixXQUFXLENBQUMsSUFBSSxDQUFDO3dCQUNmLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRzt3QkFDZCxLQUFLLEVBQ0gsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2xFLENBQUMsQ0FBQTtvQkFDRixLQUFLLENBQUE7Z0JBQ1AsQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQTtnQkFDNUIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDOUIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsV0FBVyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN0RCxNQUFNLENBQUMsV0FBVyxDQUFBO0lBQ3BCLENBQUM7SUFhRCxXQUFXLENBQUMsSUFBWSxFQUFFLElBQVk7UUFDcEMsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQzNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBRXJELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEQsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNoQyxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDcEUsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQTtZQUM1QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sS0FBSyxDQUFBO1lBQ1AsQ0FBQztRQUNILENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ2IsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQzdCLENBQUM7UUFDRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDbkUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNsRCxDQUFDO1FBRUQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUVwRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25CLENBQUM7Q0FDRjtBQXAxQkQsa0RBbzFCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBkZWNhZmZlaW5hdGUgc3VnZ2VzdGlvbnM6XG4gKiBEUzEwMjogUmVtb3ZlIHVubmVjZXNzYXJ5IGNvZGUgY3JlYXRlZCBiZWNhdXNlIG9mIGltcGxpY2l0IHJldHVybnNcbiAqIEZ1bGwgZG9jczogaHR0cHM6Ly9naXRodWIuY29tL2RlY2FmZmVpbmF0ZS9kZWNhZmZlaW5hdGUvYmxvYi9tYXN0ZXIvZG9jcy9zdWdnZXN0aW9ucy5tZFxuICovXG5pbXBvcnQgeyBUb2tlbiB9IGZyb20gJ21hcmtkb3duLWl0J1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcblxuaW1wb3J0IHtcbiAgQ29tbWFuZEV2ZW50LFxuICBFbWl0dGVyLFxuICBEaXNwb3NhYmxlLFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBGaWxlLFxuICBTdHlsZU1hbmFnZXIsXG59IGZyb20gJ2F0b20nXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLXJlcXVpcmVzXG5jb25zdCB7ICQsICQkJCwgU2Nyb2xsVmlldyB9ID0gcmVxdWlyZSgnYXRvbS1zcGFjZS1wZW4tdmlld3MnKVxuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtcGx1cycpXG5cbmltcG9ydCByZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKVxuaW1wb3J0IHsgVXBkYXRlUHJldmlldyB9IGZyb20gJy4vdXBkYXRlLXByZXZpZXcnXG5pbXBvcnQgbWFya2Rvd25JdCA9IHJlcXVpcmUoJy4vbWFya2Rvd24taXQtaGVscGVyJylcbmltcG9ydCBpbWFnZVdhdGNoZXIgPSByZXF1aXJlKCcuL2ltYWdlLXdhdGNoLWhlbHBlcicpXG5cbmV4cG9ydCBpbnRlcmZhY2UgTVBWUGFyYW1zRWRpdG9yIHtcbiAgZWRpdG9ySWQ6IG51bWJlclxuICBmaWxlUGF0aD86IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc1BhdGgge1xuICBlZGl0b3JJZD86IHVuZGVmaW5lZFxuICBmaWxlUGF0aDogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIE1QVlBhcmFtcyA9IE1QVlBhcmFtc0VkaXRvciB8IE1QVlBhcmFtc1BhdGhcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duUHJldmlld1ZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3IHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVuaW5pdGlhbGl6ZWRcbiAgcHJpdmF0ZSBlbGVtZW50OiBIVE1MRWxlbWVudFxuICBwcml2YXRlIGVtaXR0ZXI6IEVtaXR0ZXI8e1xuICAgICdkaWQtY2hhbmdlLXRpdGxlJzogdW5kZWZpbmVkXG4gICAgJ2RpZC1jaGFuZ2UtbWFya2Rvd24nOiB1bmRlZmluZWRcbiAgfT4gPSBuZXcgRW1pdHRlcigpXG4gIHByaXZhdGUgdXBkYXRlUHJldmlldz86IFVwZGF0ZVByZXZpZXdcbiAgcHJpdmF0ZSByZW5kZXJMYVRlWDogYm9vbGVhbiA9ICEhYXRvbS5jb25maWcuZ2V0KFxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnLFxuICApXG4gIHByaXZhdGUgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIHByaXZhdGUgbG9hZGVkID0gdHJ1ZSAvLyBEbyBub3Qgc2hvdyB0aGUgbG9hZGluZyBzcGlubm9yIG9uIGluaXRpYWwgbG9hZFxuICBwcml2YXRlIGVkaXRvcklkPzogbnVtYmVyXG4gIHByaXZhdGUgZmlsZVBhdGg/OiBzdHJpbmdcbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2KFxuICAgICAgeyBjbGFzczogJ21hcmtkb3duLXByZXZpZXcgbmF0aXZlLWtleS1iaW5kaW5ncycsIHRhYmluZGV4OiAtMSB9LFxuICAgICAgLy8gSWYgeW91IGRvbnQgZXhwbGljaXRseSBkZWNsYXJlIGEgY2xhc3MgdGhlbiB0aGUgZWxlbWVudHMgd29udCBiZSBjcmVhdGVkXG4gICAgICAoKSA9PiB0aGlzLmRpdih7IGNsYXNzOiAndXBkYXRlLXByZXZpZXcnIH0pLFxuICAgIClcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHsgZWRpdG9ySWQsIGZpbGVQYXRoIH06IE1QVlBhcmFtcykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBzdXBlcigpXG4gICAgdGhpcy5nZXRQYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50LmJpbmQodGhpcylcbiAgICB0aGlzLnN5bmNTb3VyY2UgPSB0aGlzLnN5bmNTb3VyY2UuYmluZCh0aGlzKVxuICAgIHRoaXMuZ2V0UGF0aFRvVG9rZW4gPSB0aGlzLmdldFBhdGhUb1Rva2VuLmJpbmQodGhpcylcbiAgICB0aGlzLnN5bmNQcmV2aWV3ID0gdGhpcy5zeW5jUHJldmlldy5iaW5kKHRoaXMpXG4gICAgdGhpcy5lZGl0b3JJZCA9IGVkaXRvcklkXG4gICAgdGhpcy5maWxlUGF0aCA9IGZpbGVQYXRoXG4gIH1cblxuICBhdHRhY2hlZCgpIHtcbiAgICBpZiAodGhpcy5pc0F0dGFjaGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5pc0F0dGFjaGVkID0gdHJ1ZVxuXG4gICAgaWYgKHRoaXMuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVzb2x2ZUVkaXRvcih0aGlzLmVkaXRvcklkKVxuICAgIH0gZWxzZSBpZiAodGhpcy5maWxlUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmVUb0ZpbGVQYXRoKHRoaXMuZmlsZVBhdGgpXG4gICAgfVxuICB9XG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdNYXJrZG93blByZXZpZXdWaWV3JyxcbiAgICAgIGZpbGVQYXRoOiB0aGlzLmdldFBhdGgoKSB8fCB0aGlzLmZpbGVQYXRoLFxuICAgICAgZWRpdG9ySWQ6IHRoaXMuZWRpdG9ySWQsXG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpbWFnZVdhdGNoZXIucmVtb3ZlRmlsZSh0aGlzLmdldFBhdGgoKSlcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQoX2NhbGxiYWNrOiBhbnkpIHtcbiAgICAvLyBObyBvcCB0byBzdXBwcmVzcyBkZXByZWNhdGlvbiB3YXJuaW5nXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKClcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTWFya2Rvd24oY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLW1hcmtkb3duJywgY2FsbGJhY2spXG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICAgIHJldHVybiB0aGlzLnJlbmRlck1hcmtkb3duKClcbiAgfVxuXG4gIHJlc29sdmVFZGl0b3IoZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIGNvbnN0IHJlc29sdmUgPSAoKSA9PiB7XG4gICAgICB0aGlzLmVkaXRvciA9IHRoaXMuZWRpdG9yRm9ySWQoZWRpdG9ySWQpXG5cbiAgICAgIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGFuZGxlRXZlbnRzKClcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTWFya2Rvd24oKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIGVkaXRvciB0aGlzIHByZXZpZXcgd2FzIGNyZWF0ZWQgZm9yIGhhcyBiZWVuIGNsb3NlZCBzbyBjbG9zZVxuICAgICAgICAvLyB0aGlzIHByZXZpZXcgc2luY2UgYSBwcmV2aWV3IGNhbm5vdCBiZSByZW5kZXJlZCB3aXRob3V0IGFuIGVkaXRvclxuICAgICAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgICAgcGFuZSAmJiBwYW5lLmRlc3Ryb3lJdGVtKHRoaXMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc29sdmUoKVxuICB9XG5cbiAgZWRpdG9yRm9ySWQoZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICAgIGlmIChlZGl0b3IuaWQgPT09IGVkaXRvcklkKSB7XG4gICAgICAgIHJldHVybiBlZGl0b3JcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGhhbmRsZUV2ZW50cygpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRBZGRHcmFtbWFyKCgpID0+XG4gICAgICAgIF8uZGVib3VuY2UoKCkgPT4gdGhpcy5yZW5kZXJNYXJrZG93bigpLCAyNTApLFxuICAgICAgKSxcbiAgICApXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkVXBkYXRlR3JhbW1hcihcbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB0aGlzLnJlbmRlck1hcmtkb3duKCksIDI1MCksXG4gICAgICApLFxuICAgIClcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgJ2NvcmU6bW92ZS11cCc6ICgpID0+IHRoaXMuc2Nyb2xsVXAoKSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHRoaXMuc2Nyb2xsRG93bigpLFxuICAgICAgJ2NvcmU6c2F2ZS1hcyc6IChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICByZXR1cm4gdGhpcy5zYXZlQXMoKVxuICAgICAgfSxcbiAgICAgICdjb3JlOmNvcHknOiAoZXZlbnQ6IENvbW1hbmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb3B5VG9DbGlwYm9hcmQoKSkgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHpvb21MZXZlbCA9IHBhcnNlRmxvYXQodGhpcy5jc3MoJ3pvb20nKSkgfHwgMVxuICAgICAgICByZXR1cm4gdGhpcy5jc3MoJ3pvb20nLCB6b29tTGV2ZWwgKyAwLjEpXG4gICAgICB9LFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLW91dCc6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLmNzcygnem9vbScpKSB8fCAxXG4gICAgICAgIHJldHVybiB0aGlzLmNzcygnem9vbScsIHpvb21MZXZlbCAtIDAuMSlcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnJlc2V0LXpvb20nOiAoKSA9PiB0aGlzLmNzcygnem9vbScsIDEpLFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXNvdXJjZSc6IChldmVudCkgPT5cbiAgICAgICAgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgICAgIGlmIChzb3VyY2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLnN5bmNTb3VyY2Uoc291cmNlLCBldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpXG4gICAgICAgIH0pLFxuICAgIH0pXG5cbiAgICBjb25zdCBjaGFuZ2VIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgdGhpcy5yZW5kZXJNYXJrZG93bigpXG5cbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgaWYgKHBhbmUgIT09IHVuZGVmaW5lZCAmJiBwYW5lICE9PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkpIHtcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maWxlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZShjaGFuZ2VIYW5kbGVyKSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyhmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uRGlkQ2hhbmdlUGF0aCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQoYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuZWRpdG9yKSwge1xuICAgICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1wcmV2aWV3JzogKF9ldmVudCkgPT5cbiAgICAgICAgICAgIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKChzb3VyY2U/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3luY1ByZXZpZXcoXG4gICAgICAgICAgICAgICAgc291cmNlLFxuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93LFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICApXG4gICAgfVxuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZScsXG4gICAgICAgIGNoYW5nZUhhbmRsZXIsXG4gICAgICApLFxuICAgIClcblxuICAgIC8vIFRvZ2dsZSBMYVRlWCByZW5kZXJpbmcgaWYgZm9jdXMgaXMgb24gcHJldmlldyBwYW5lIG9yIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1yZW5kZXItbGF0ZXgnOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSA9PT0gdGhpcyB8fFxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpID09PSB0aGlzLmVkaXRvclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCA9ICF0aGlzLnJlbmRlckxhVGVYXG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnLFxuICAgICAgICAodXNlR2l0SHViU3R5bGUpID0+IHtcbiAgICAgICAgICBpZiAodXNlR2l0SHViU3R5bGUpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScsICcnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICksXG4gICAgKVxuICB9XG5cbiAgcmVuZGVyTWFya2Rvd24oKSB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgdGhpcy5zaG93TG9hZGluZygpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoc291cmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJNYXJrZG93blRleHQoc291cmNlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICByZWZyZXNoSW1hZ2VzKG9sZHNyYzogc3RyaW5nKSB7XG4gICAgY29uc3QgaW1ncyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbWdbc3JjXScpIGFzIE5vZGVMaXN0T2Y8XG4gICAgICBIVE1MSW1hZ2VFbGVtZW50XG4gICAgPlxuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG4gICAgZm9yIChjb25zdCBpbWcgb2YgQXJyYXkuZnJvbShpbWdzKSkge1xuICAgICAgbGV0IG92czogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAgICBsZXQgb3Y6IG51bWJlciB8IHVuZGVmaW5lZFxuICAgICAgbGV0IHNyYyA9IGltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpIVxuICAgICAgY29uc3QgbWF0Y2ggPSBzcmMubWF0Y2goL14oLiopXFw/dj0oXFxkKykkLylcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICA7Wywgc3JjLCBvdnNdID0gbWF0Y2hcbiAgICAgIH1cbiAgICAgIGlmIChzcmMgPT09IG9sZHNyYykge1xuICAgICAgICBpZiAob3ZzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBvdiA9IHBhcnNlSW50KG92cywgMTApXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdiA9IGltYWdlV2F0Y2hlci5nZXRWZXJzaW9uKHNyYywgdGhpcy5nZXRQYXRoKCkpXG4gICAgICAgIGlmICh2ICE9PSBvdikge1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgoaW1nLnNyYyA9IGAke3NyY30/dj0ke3Z9YCkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKChpbWcuc3JjID0gYCR7c3JjfWApKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAhPSBudWxsID8gdGhpcy5maWxlLmdldFBhdGgoKSA6IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZWFkKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5lZGl0b3IuZ2V0VGV4dCgpKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG4gICAgfVxuICB9XG5cbiAgZ2V0SFRNTChjYWxsYmFjazogKGVycm9yOiBFcnJvciB8IG51bGwsIGh0bWxCb2R5OiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICByZW5kZXJlci50b0hUTUwoXG4gICAgICAgIHNvdXJjZSxcbiAgICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIHJlbmRlck1hcmtkb3duVGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgICByZW5kZXJlci50b0RPTUZyYWdtZW50KFxuICAgICAgdGV4dCxcbiAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgdGhpcy5nZXRHcmFtbWFyKCksXG4gICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgKGVycm9yLCBkb21GcmFnbWVudCkgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zaG93RXJyb3IoZXJyb3IpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2VcbiAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWVcbiAgICAgICAgICAvLyBkaXYudXBkYXRlLXByZXZpZXcgY3JlYXRlZCBhZnRlciBjb25zdHJ1Y3RvciBzdCBVcGRhdGVQcmV2aWV3IGNhbm5vdFxuICAgICAgICAgIC8vIGJlIGluc3RhbmNlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICAgICAgICBpZiAoIXRoaXMudXBkYXRlUHJldmlldyAmJiB0aGlzLmZpbmQoJ2Rpdi51cGRhdGUtcHJldmlldycpWzBdKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcgPSBuZXcgVXBkYXRlUHJldmlldyhcbiAgICAgICAgICAgICAgdGhpcy5maW5kKCdkaXYudXBkYXRlLXByZXZpZXcnKVswXSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3ICYmXG4gICAgICAgICAgICBkb21GcmFnbWVudCAmJlxuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3LnVwZGF0ZShkb21GcmFnbWVudCBhcyBFbGVtZW50LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLW1hcmtkb3duJylcbiAgICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW5hbFRyaWdnZXIoJ21hcmtkb3duLXByZXZpZXctcGx1czptYXJrZG93bi1jaGFuZ2VkJylcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApXG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICBpZiAodGhpcy5maWxlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBgJHtwYXRoLmJhc2VuYW1lKHRoaXMuZ2V0UGF0aCgpKX0gUHJldmlld2BcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLmVkaXRvci5nZXRUaXRsZSgpfSBQcmV2aWV3YFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ01hcmtkb3duIFByZXZpZXcnXG4gICAgfVxuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuICdtYXJrZG93bidcbiAgfVxuXG4gIGdldFVSSSgpIHtcbiAgICBpZiAodGhpcy5maWxlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vJHt0aGlzLmdldFBhdGgoKX1gXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vZWRpdG9yLyR7dGhpcy5lZGl0b3JJZH1gXG4gICAgfVxuICB9XG5cbiAgZ2V0UGF0aCgpIHtcbiAgICBpZiAodGhpcy5maWxlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0UGF0aCgpXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0UGF0aCgpXG4gICAgfVxuICB9XG5cbiAgZ2V0R3JhbW1hcigpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IgIT0gbnVsbCA/IHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgZ2V0RG9jdW1lbnRTdHlsZVNoZWV0cygpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGV4aXN0cyBzbyB3ZSBjYW4gc3R1YiBpdFxuICAgIHJldHVybiBkb2N1bWVudC5zdHlsZVNoZWV0c1xuICB9XG5cbiAgZ2V0VGV4dEVkaXRvclN0eWxlcygpIHtcbiAgICBjb25zdCB0ZXh0RWRpdG9yU3R5bGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcbiAgICAgICdhdG9tLXN0eWxlcycsXG4gICAgKSBhcyBIVE1MRWxlbWVudCAmIHsgaW5pdGlhbGl6ZShzdHlsZXM6IFN0eWxlTWFuYWdlcik6IHZvaWQgfVxuICAgIHRleHRFZGl0b3JTdHlsZXMuaW5pdGlhbGl6ZShhdG9tLnN0eWxlcylcbiAgICB0ZXh0RWRpdG9yU3R5bGVzLnNldEF0dHJpYnV0ZSgnY29udGV4dCcsICdhdG9tLXRleHQtZWRpdG9yJylcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRleHRFZGl0b3JTdHlsZXMpXG5cbiAgICAvLyBFeHRyYWN0IHN0eWxlIGVsZW1lbnRzIGNvbnRlbnRcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0ZXh0RWRpdG9yU3R5bGVzLmNoaWxkTm9kZXMpLm1hcChcbiAgICAgIChzdHlsZUVsZW1lbnQpID0+IChzdHlsZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dCxcbiAgICApXG4gIH1cblxuICBnZXRNYXJrZG93blByZXZpZXdDU1MoKSB7XG4gICAgY29uc3QgbWFya2Rvd1ByZXZpZXdSdWxlcyA9IFtdXG4gICAgY29uc3QgcnVsZVJlZ0V4cCA9IC9cXC5tYXJrZG93bi1wcmV2aWV3L1xuICAgIGNvbnN0IGNzc1VybFJlZkV4cCA9IC91cmxcXChhdG9tOlxcL1xcL21hcmtkb3duLXByZXZpZXctcGx1c1xcL2Fzc2V0c1xcLyguKilcXCkvXG5cbiAgICBmb3IgKGNvbnN0IHN0eWxlc2hlZXQgb2YgQXJyYXkuZnJvbSh0aGlzLmdldERvY3VtZW50U3R5bGVTaGVldHMoKSkpIHtcbiAgICAgIGlmIChzdHlsZXNoZWV0LnJ1bGVzICE9IG51bGwpIHtcbiAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIEFycmF5LmZyb20oc3R5bGVzaGVldC5ydWxlcykpIHtcbiAgICAgICAgICAvLyBXZSBvbmx5IG5lZWQgYC5tYXJrZG93bi1yZXZpZXdgIGNzc1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIChydWxlLnNlbGVjdG9yVGV4dCAhPSBudWxsXG4gICAgICAgICAgICAgID8gcnVsZS5zZWxlY3RvclRleHQubWF0Y2gocnVsZVJlZ0V4cClcbiAgICAgICAgICAgICAgOiB1bmRlZmluZWQpICE9IG51bGxcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIG1hcmtkb3dQcmV2aWV3UnVsZXMucHVzaChydWxlLmNzc1RleHQpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtkb3dQcmV2aWV3UnVsZXNcbiAgICAgIC5jb25jYXQodGhpcy5nZXRUZXh0RWRpdG9yU3R5bGVzKCkpXG4gICAgICAuam9pbignXFxuJylcbiAgICAgIC5yZXBsYWNlKC9hdG9tLXRleHQtZWRpdG9yL2csICdwcmUuZWRpdG9yLWNvbG9ycycpXG4gICAgICAucmVwbGFjZSgvOmhvc3QvZywgJy5ob3N0JykgLy8gUmVtb3ZlIHNoYWRvdy1kb20gOmhvc3Qgc2VsZWN0b3IgY2F1c2luZyBwcm9ibGVtIG9uIEZGXG4gICAgICAucmVwbGFjZShjc3NVcmxSZWZFeHAsIGZ1bmN0aW9uKF9tYXRjaCwgYXNzZXRzTmFtZSwgX29mZnNldCwgX3N0cmluZykge1xuICAgICAgICAvLyBiYXNlNjQgZW5jb2RlIGFzc2V0c1xuICAgICAgICBjb25zdCBhc3NldFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vYXNzZXRzJywgYXNzZXRzTmFtZSlcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxEYXRhID0gZnMucmVhZEZpbGVTeW5jKGFzc2V0UGF0aCwgJ2JpbmFyeScpXG4gICAgICAgIGNvbnN0IGJhc2U2NERhdGEgPSBuZXcgQnVmZmVyKG9yaWdpbmFsRGF0YSwgJ2JpbmFyeScpLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICByZXR1cm4gYHVybCgnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwke2Jhc2U2NERhdGF9JylgXG4gICAgICB9KVxuICB9XG5cbiAgc2hvd0Vycm9yKHJlc3VsdDogRXJyb3IpIHtcbiAgICByZXR1cm4gdGhpcy5odG1sKFxuICAgICAgJCQkKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuaDIoJ1ByZXZpZXdpbmcgTWFya2Rvd24gRmFpbGVkJylcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gdGhpcy5oMyhyZXN1bHQubWVzc2FnZSlcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIHNob3dMb2FkaW5nKCkge1xuICAgIHRoaXMubG9hZGluZyA9IHRydWVcbiAgICByZXR1cm4gdGhpcy5odG1sKFxuICAgICAgJCQkKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiB0aGlzLmRpdih7IGNsYXNzOiAnbWFya2Rvd24tc3Bpbm5lcicgfSwgJ0xvYWRpbmcgTWFya2Rvd25cXHUyMDI2JylcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIGNvcHlUb0NsaXBib2FyZCgpIHtcbiAgICBpZiAodGhpcy5sb2FkaW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKVxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGlvbi5iYXNlTm9kZVxuXG4gICAgLy8gVXNlIGRlZmF1bHQgY29weSBldmVudCBoYW5kbGVyIGlmIHRoZXJlIGlzIHNlbGVjdGVkIHRleHQgaW5zaWRlIHRoaXMgdmlld1xuICAgIGlmIChcbiAgICAgIHNlbGVjdGVkVGV4dCAmJlxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnN0cmljdC10eXBlLXByZWRpY2F0ZXMgLy9UT0RPOiBjb21wbGFpbiBvbiBUU1xuICAgICAgc2VsZWN0ZWROb2RlICE9IG51bGwgJiZcbiAgICAgICh0aGlzWzBdID09PSBzZWxlY3RlZE5vZGUgfHwgJC5jb250YWlucyh0aGlzWzBdLCBzZWxlY3RlZE5vZGUpKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5nZXRIVE1MKGZ1bmN0aW9uKGVycm9yLCBodG1sKSB7XG4gICAgICBpZiAoZXJyb3IgIT09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdDb3B5aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShodG1sKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgc2F2ZUFzKCkge1xuICAgIGlmICh0aGlzLmxvYWRpbmcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCBmaWxlUGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgbGV0IHRpdGxlID0gJ01hcmtkb3duIHRvIEhUTUwnXG4gICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICB0aXRsZSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpLm5hbWVcbiAgICAgIGZpbGVQYXRoICs9ICcuaHRtbCdcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgICAgZmlsZVBhdGggPSAndW50aXRsZWQubWQuaHRtbCdcbiAgICAgIGlmIChwcm9qZWN0UGF0aCkge1xuICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgZmlsZVBhdGgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaHRtbEZpbGVQYXRoID0gYXRvbS5zaG93U2F2ZURpYWxvZ1N5bmMoZmlsZVBhdGgpXG4gICAgaWYgKGh0bWxGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0SFRNTCgoZXJyb3I6IEVycm9yIHwgbnVsbCwgaHRtbEJvZHk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoZXJyb3IgIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1NhdmluZyBNYXJrZG93biBhcyBIVE1MIGZhaWxlZCcsIGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBtYXRoamF4U2NyaXB0XG4gICAgICAgICAgaWYgKHRoaXMucmVuZGVyTGFUZVgpIHtcbiAgICAgICAgICAgIG1hdGhqYXhTY3JpcHQgPSBgXFxcblxuPHNjcmlwdCB0eXBlPVwidGV4dC94LW1hdGhqYXgtY29uZmlnXCI+XG4gIE1hdGhKYXguSHViLkNvbmZpZyh7XG4gICAgamF4OiBbXCJpbnB1dC9UZVhcIixcIm91dHB1dC9IVE1MLUNTU1wiXSxcbiAgICBleHRlbnNpb25zOiBbXSxcbiAgICBUZVg6IHtcbiAgICAgIGV4dGVuc2lvbnM6IFtcIkFNU21hdGguanNcIixcIkFNU3N5bWJvbHMuanNcIixcIm5vRXJyb3JzLmpzXCIsXCJub1VuZGVmaW5lZC5qc1wiXVxuICAgIH0sXG4gICAgc2hvd01hdGhNZW51OiBmYWxzZVxuICB9KTtcbjwvc2NyaXB0PlxuPHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCIgc3JjPVwiaHR0cHM6Ly9jZG4ubWF0aGpheC5vcmcvbWF0aGpheC9sYXRlc3QvTWF0aEpheC5qc1wiPlxuPC9zY3JpcHQ+XFxcbmBcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWF0aGpheFNjcmlwdCA9ICcnXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGh0bWwgPVxuICAgICAgICAgICAgYFxcXG48IURPQ1RZUEUgaHRtbD5cbjxodG1sPlxuICA8aGVhZD5cbiAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICA8dGl0bGU+JHt0aXRsZX08L3RpdGxlPiR7bWF0aGpheFNjcmlwdH1cbiAgICAgIDxzdHlsZT4ke3RoaXMuZ2V0TWFya2Rvd25QcmV2aWV3Q1NTKCl9PC9zdHlsZT5cbiAgPC9oZWFkPlxuICA8Ym9keSBjbGFzcz0nbWFya2Rvd24tcHJldmlldyc+JHtodG1sQm9keX08L2JvZHk+XG48L2h0bWw+YCArICdcXG4nIC8vIEVuc3VyZSB0cmFpbGluZyBuZXdsaW5lXG5cbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGh0bWxGaWxlUGF0aCwgaHRtbClcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGh0bWxGaWxlUGF0aClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBpc0VxdWFsKG90aGVyOiBudWxsIHwgW05vZGVdKSB7XG4gICAgcmV0dXJuIHRoaXNbMF0gPT09IChvdGhlciAhPT0gbnVsbCA/IG90aGVyWzBdIDogdW5kZWZpbmVkKSAvLyBDb21wYXJlIERPTSBlbGVtZW50c1xuICB9XG5cbiAgLy9cbiAgLy8gRmluZCB0aGUgY2xvc2VzdCBhbmNlc3RvciBvZiBhbiBlbGVtZW50IHRoYXQgaXMgbm90IGEgZGVjZW5kYW50IG9mIGVpdGhlclxuICAvLyBgc3Bhbi5tYXRoYCBvciBgc3Bhbi5hdG9tLXRleHQtZWRpdG9yYC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCBmcm9tIHdoaWNoIHRoZSBzZWFyY2ggZm9yIGFcbiAgLy8gICBjbG9zZXN0IGFuY2VzdG9yIGJlZ2lucy5cbiAgLy8gQHJldHVybiB7SFRNTEVsZW1lbnR9IFRoZSBjbG9zZXN0IGFuY2VzdG9yIHRvIGBlbGVtZW50YCB0aGF0IGRvZXMgbm90XG4gIC8vICAgY29udGFpbiBlaXRoZXIgYHNwYW4ubWF0aGAgb3IgYHNwYW4uYXRvbS10ZXh0LWVkaXRvcmAuXG4gIC8vXG4gIGJ1YmJsZVRvQ29udGFpbmVyRWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHtcbiAgICBsZXQgdGVzdEVsZW1lbnQgPSBlbGVtZW50XG4gICAgd2hpbGUgKHRlc3RFbGVtZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSB0ZXN0RWxlbWVudC5wYXJlbnRFbGVtZW50IVxuICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3QuY29udGFpbnMoJ01hdGhKYXhfRGlzcGxheScpKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQucGFyZW50RWxlbWVudCFcbiAgICAgIH1cbiAgICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhdG9tLXRleHQtZWRpdG9yJykpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudFxuICAgICAgfVxuICAgICAgdGVzdEVsZW1lbnQgPSBwYXJlbnRcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBhIHN1YnNlcXVlbmNlIG9mIGEgc2VxdWVuY2Ugb2YgdG9rZW5zIHJlcHJlc2VudGluZyBhIHBhdGggdGhyb3VnaFxuICAvLyBIVE1MRWxlbWVudHMgdGhhdCBkb2VzIG5vdCBjb250aW51ZSBkZWVwZXIgdGhhbiBhIHRhYmxlIGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBwYXRoVG9Ub2tlbiBBcnJheSBvZiB0b2tlbnNcbiAgLy8gICByZXByZXNlbnRpbmcgYSBwYXRoIHRvIGEgSFRNTEVsZW1lbnQgd2l0aCB0aGUgcm9vdCBlbGVtZW50IGF0XG4gIC8vICAgcGF0aFRvVG9rZW5bMF0gYW5kIHRoZSB0YXJnZXQgZWxlbWVudCBhdCB0aGUgaGlnaGVzdCBpbmRleC4gRWFjaCBlbGVtZW50XG4gIC8vICAgY29uc2lzdHMgb2YgYSBgdGFnYCBhbmQgYGluZGV4YCByZXByZXNlbnRpbmcgaXRzIGluZGV4IGFtb25nc3QgaXRzXG4gIC8vICAgc2libGluZyBlbGVtZW50cyBvZiB0aGUgc2FtZSBgdGFnYC5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBUaGUgc3Vic2VxdWVuY2Ugb2YgcGF0aFRvVG9rZW4gdGhhdFxuICAvLyAgIG1haW50YWlucyB0aGUgc2FtZSByb290IGJ1dCB0ZXJtaW5hdGVzIGF0IGEgdGFibGUgZWxlbWVudCBvciB0aGUgdGFyZ2V0XG4gIC8vICAgZWxlbWVudCwgd2hpY2hldmVyIGNvbWVzIGZpcnN0LlxuICAvL1xuICBidWJibGVUb0NvbnRhaW5lclRva2VuKHBhdGhUb1Rva2VuOiBBcnJheTx7IHRhZzogc3RyaW5nOyBpbmRleDogbnVtYmVyIH0+KSB7XG4gICAgY29uc3QgZW5kID0gcGF0aFRvVG9rZW4ubGVuZ3RoIC0gMVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICBpZiAocGF0aFRvVG9rZW5baV0udGFnID09PSAndGFibGUnKSB7XG4gICAgICAgIHJldHVybiBwYXRoVG9Ub2tlbi5zbGljZSgwLCBpICsgMSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG4gIH1cblxuICAvL1xuICAvLyBFbmNvZGUgdGFncyBmb3IgbWFya2Rvd24taXQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgRW5jb2RlIHRoZSB0YWcgb2YgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7c3RyaW5nfSBFbmNvZGVkIHRhZy5cbiAgLy9cbiAgZW5jb2RlVGFnKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hdGgnKSkge1xuICAgICAgcmV0dXJuICdtYXRoJ1xuICAgIH1cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F0b20tdGV4dC1lZGl0b3InKSkge1xuICAgICAgcmV0dXJuICdjb2RlJ1xuICAgIH0gLy8gb25seSB0b2tlbi50eXBlIGlzIGBmZW5jZWAgY29kZSBibG9ja3Mgc2hvdWxkIGV2ZXIgYmUgZm91bmQgaW4gdGhlIGZpcnN0IGxldmVsIG9mIHRoZSB0b2tlbnMgYXJyYXlcbiAgICByZXR1cm4gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIC8vXG4gIC8vIERlY29kZSB0YWdzIHVzZWQgYnkgbWFya2Rvd24taXRcbiAgLy9cbiAgLy8gQHBhcmFtIHttYXJrZG93bi1pdC5Ub2tlbn0gdG9rZW4gRGVjb2RlIHRoZSB0YWcgb2YgdG9rZW4uXG4gIC8vIEByZXR1cm4ge3N0cmluZ3xudWxsfSBEZWNvZGVkIHRhZyBvciBgbnVsbGAgaWYgdGhlIHRva2VuIGhhcyBubyB0YWcuXG4gIC8vXG4gIGRlY29kZVRhZyh0b2tlbjogVG9rZW4pOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAodG9rZW4udGFnID09PSAnbWF0aCcpIHtcbiAgICAgIHJldHVybiAnc3BhbidcbiAgICB9XG4gICAgaWYgKHRva2VuLnRhZyA9PT0gJ2NvZGUnKSB7XG4gICAgICByZXR1cm4gJ3NwYW4nXG4gICAgfVxuICAgIGlmICh0b2tlbi50YWcgPT09ICcnKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICByZXR1cm4gdG9rZW4udGFnXG4gIH1cblxuICAvL1xuICAvLyBEZXRlcm1pbmUgcGF0aCB0byBhIHRhcmdldCBlbGVtZW50IGZyb20gYSBjb250YWluZXIgYC5tYXJrZG93bi1wcmV2aWV3YC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgSFRNTEVsZW1lbnQuXG4gIC8vIEByZXR1cm4geyh0YWc6IDx0YWc+LCBpbmRleDogPGluZGV4PilbXX0gQXJyYXkgb2YgdG9rZW5zIHJlcHJlc2VudGluZyBhIHBhdGhcbiAgLy8gICB0byBgZWxlbWVudGAgZnJvbSBgLm1hcmtkb3duLXByZXZpZXdgLiBUaGUgcm9vdCBgLm1hcmtkb3duLXByZXZpZXdgXG4gIC8vICAgZWxlbWVudCBpcyB0aGUgZmlyc3QgZWxlbWVudHMgaW4gdGhlIGFycmF5IGFuZCB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgLy8gICBgZWxlbWVudGAgYXQgdGhlIGhpZ2hlc3QgaW5kZXguIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZFxuICAvLyAgIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lXG4gIC8vICAgYHRhZ2AuXG4gIC8vXG4gIGdldFBhdGhUb0VsZW1lbnQoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICk6IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4ge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgfSxcbiAgICAgIF1cbiAgICB9XG5cbiAgICBlbGVtZW50ID0gdGhpcy5idWJibGVUb0NvbnRhaW5lckVsZW1lbnQoZWxlbWVudClcbiAgICBjb25zdCB0YWcgPSB0aGlzLmVuY29kZVRhZyhlbGVtZW50KVxuICAgIGNvbnN0IHNpYmxpbmdzID0gZWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblxuICAgIGxldCBzaWJsaW5nc0NvdW50ID0gMFxuXG4gICAgZm9yIChjb25zdCBzaWJsaW5nIG9mIEFycmF5LmZyb20oc2libGluZ3MpKSB7XG4gICAgICBjb25zdCBzaWJsaW5nVGFnID1cbiAgICAgICAgc2libGluZy5ub2RlVHlwZSA9PT0gMSA/IHRoaXMuZW5jb2RlVGFnKHNpYmxpbmcgYXMgSFRNTEVsZW1lbnQpIDogbnVsbFxuICAgICAgaWYgKHNpYmxpbmcgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGF0aFRvRWxlbWVudCA9IHRoaXMuZ2V0UGF0aFRvRWxlbWVudChlbGVtZW50LnBhcmVudEVsZW1lbnQhKVxuICAgICAgICBwYXRoVG9FbGVtZW50LnB1c2goe1xuICAgICAgICAgIHRhZyxcbiAgICAgICAgICBpbmRleDogc2libGluZ3NDb3VudCxcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHBhdGhUb0VsZW1lbnRcbiAgICAgIH0gZWxzZSBpZiAoc2libGluZ1RhZyA9PT0gdGFnKSB7XG4gICAgICAgIHNpYmxpbmdzQ291bnQrK1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWx1cmUgaW4gZ2V0UGF0aFRvRWxlbWVudCcpXG4gIH1cblxuICAvL1xuICAvLyBTZXQgdGhlIGFzc29jaWF0ZWQgZWRpdG9ycyBjdXJzb3IgYnVmZmVyIHBvc2l0aW9uIHRvIHRoZSBsaW5lIHJlcHJlc2VudGluZ1xuICAvLyB0aGUgc291cmNlIG1hcmtkb3duIG9mIGEgdGFyZ2V0IGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGFyZ2V0IGVsZW1lbnQgY29udGFpbmVkIHdpdGhpbiB0aGUgYXNzb2ljYXRlZFxuICAvLyAgIGAubWFya2Rvd24tcHJldmlld2AgY29udGFpbmVyLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0byBpZGVudGlmeSB0aGVcbiAgLy8gICBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgIGFuZCBzZXQgdGhlIGN1cnNvciB0byB0aGF0IGxpbmUuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YC4gSWYgbm9cbiAgLy8gICBsaW5lIGlzIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jU291cmNlKHRleHQ6IHN0cmluZywgZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQpXG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBkaXYubWFya2Rvd24tcHJldmlld1xuICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKSAvLyByZW1vdmUgZGl2LnVwZGF0ZS1wcmV2aWV3XG4gICAgaWYgKCFwYXRoVG9FbGVtZW50Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGxldCBmaW5hbFRva2VuID0gbnVsbFxuICAgIGxldCBsZXZlbCA9IDBcblxuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICBpZiAodG9rZW4ubGV2ZWwgPCBsZXZlbCkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuLmhpZGRlbikge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKHRva2VuLnRhZyA9PT0gcGF0aFRvRWxlbWVudFswXS50YWcgJiYgdG9rZW4ubGV2ZWwgPT09IGxldmVsKSB7XG4gICAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAxKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpzdHJpY3QtdHlwZS1wcmVkaWNhdGVzXG4gICAgICAgICAgICBpZiAodG9rZW4ubWFwICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KClcbiAgICAgICAgICAgIGxldmVsKytcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHRva2VuLm5lc3RpbmcgPT09IDAgJiZcbiAgICAgICAgICBbJ21hdGgnLCAnY29kZScsICdociddLmluY2x1ZGVzKHRva2VuLnRhZylcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGZpbmFsVG9rZW4gPSB0b2tlblxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGF0aFRvRWxlbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmluYWxUb2tlbiAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2ZpbmFsVG9rZW4ubWFwWzBdLCAwXSlcbiAgICAgIHJldHVybiBmaW5hbFRva2VuLm1hcFswXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIERldGVybWluZSBwYXRoIHRvIGEgdGFyZ2V0IHRva2VuLlxuICAvL1xuICAvLyBAcGFyYW0geyhtYXJrZG93bi1pdC5Ub2tlbilbXX0gdG9rZW5zIEFycmF5IG9mIHRva2VucyBhcyByZXR1cm5lZCBieVxuICAvLyAgIGBtYXJrZG93bi1pdC5wYXJzZSgpYC5cbiAgLy8gQHBhcmFtIHtudW1iZXJ9IGxpbmUgTGluZSByZXByZXNlbnRpbmcgdGhlIHRhcmdldCB0b2tlbi5cbiAgLy8gQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBBcnJheSByZXByZXNlbnRpbmcgYSBwYXRoIHRvIHRoZVxuICAvLyAgIHRhcmdldCB0b2tlbi4gVGhlIHJvb3QgdG9rZW4gaXMgcmVwcmVzZW50ZWQgYnkgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlXG4gIC8vICAgYXJyYXkgYW5kIHRoZSB0YXJnZXQgdG9rZW4gYnkgdGhlIGxhc3QgZWxtZW50LiBFYWNoIGVsZW1lbnQgY29uc2lzdHMgb2YgYVxuICAvLyAgIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHMgc2libGluZyB0b2tlbnMgaW5cbiAgLy8gICBgdG9rZW5zYCBvZiB0aGUgc2FtZSBgdGFnYC4gYGxpbmVgIHdpbGwgbGllIGJldHdlZW4gdGhlIHByb3BlcnRpZXNcbiAgLy8gICBgbWFwWzBdYCBhbmQgYG1hcFsxXWAgb2YgdGhlIHRhcmdldCB0b2tlbi5cbiAgLy9cbiAgZ2V0UGF0aFRvVG9rZW4odG9rZW5zOiBUb2tlbltdLCBsaW5lOiBudW1iZXIpIHtcbiAgICBsZXQgcGF0aFRvVG9rZW46IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4gPSBbXVxuICAgIGxldCB0b2tlblRhZ0NvdW50OiBudW1iZXJbXSA9IFtdXG4gICAgbGV0IGxldmVsID0gMFxuXG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgIGlmICh0b2tlbi5sZXZlbCA8IGxldmVsKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4uaGlkZGVuKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gLTEpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGFnID0gdGhpcy5kZWNvZGVUYWcodG9rZW4pXG4gICAgICBpZiAodGFnID09PSBudWxsKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICB0b2tlbi50YWcgPSB0YWdcblxuICAgICAgaWYgKFxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6c3RyaWN0LXR5cGUtcHJlZGljYXRlc1xuICAgICAgICB0b2tlbi5tYXAgIT0gbnVsbCAmJiAvLyB0b2tlbi5tYXAgKmNhbiogYmUgbnVsbCAvLyBUT0RPOiBjb21wbGFpbiBvbiBEVFxuICAgICAgICBsaW5lID49IHRva2VuLm1hcFswXSAmJlxuICAgICAgICBsaW5lIDw9IHRva2VuLm1hcFsxXSAtIDFcbiAgICAgICkge1xuICAgICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gMSkge1xuICAgICAgICAgIHBhdGhUb1Rva2VuLnB1c2goe1xuICAgICAgICAgICAgdGFnOiB0b2tlbi50YWcsXG4gICAgICAgICAgICBpbmRleDpcbiAgICAgICAgICAgICAgdG9rZW5UYWdDb3VudFt0b2tlbi50YWddICE9IG51bGwgPyB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gOiAwLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgdG9rZW5UYWdDb3VudCA9IFtdXG4gICAgICAgICAgbGV2ZWwrK1xuICAgICAgICB9IGVsc2UgaWYgKHRva2VuLm5lc3RpbmcgPT09IDApIHtcbiAgICAgICAgICBwYXRoVG9Ub2tlbi5wdXNoKHtcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnLFxuICAgICAgICAgICAgaW5kZXg6XG4gICAgICAgICAgICAgIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSAhPSBudWxsID8gdG9rZW5UYWdDb3VudFt0b2tlbi50YWddIDogMCxcbiAgICAgICAgICB9KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodG9rZW4ubGV2ZWwgPT09IGxldmVsKSB7XG4gICAgICAgIGlmICh0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gIT0gbnVsbCkge1xuICAgICAgICAgIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSsrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5UYWdDb3VudFt0b2tlbi50YWddID0gMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGF0aFRvVG9rZW4gPSB0aGlzLmJ1YmJsZVRvQ29udGFpbmVyVG9rZW4ocGF0aFRvVG9rZW4pXG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG4gIH1cblxuICAvL1xuICAvLyBTY3JvbGwgdGhlIGFzc29jaWF0ZWQgcHJldmlldyB0byB0aGUgZWxlbWVudCByZXByZXNlbnRpbmcgdGhlIHRhcmdldCBsaW5lIG9mXG4gIC8vIG9mIHRoZSBzb3VyY2UgbWFya2Rvd24uXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRhcmdldCBsaW5lIG9mIGB0ZXh0YC4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG9cbiAgLy8gICBpZGVudGlmeSB0aGUgZWxtZW50IG9mIHRoZSBhc3NvY2lhdGVkIGAubWFya2Rvd24tcHJldmlld2AgdGhhdCByZXByZXNlbnRzXG4gIC8vICAgYGxpbmVgIGFuZCBzY3JvbGwgdGhlIGAubWFya2Rvd24tcHJldmlld2AgdG8gdGhhdCBlbGVtZW50LlxuICAvLyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGBsaW5lYC4gSWYgbm8gZWxlbWVudCBpc1xuICAvLyAgIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jUHJldmlldyh0ZXh0OiBzdHJpbmcsIGxpbmU6IG51bWJlcikge1xuICAgIGNvbnN0IHRva2VucyA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zKHRleHQsIHRoaXMucmVuZGVyTGFUZVgpXG4gICAgY29uc3QgcGF0aFRvVG9rZW4gPSB0aGlzLmdldFBhdGhUb1Rva2VuKHRva2VucywgbGluZSlcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5maW5kKCcudXBkYXRlLXByZXZpZXcnKS5lcSgwKVxuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgcGF0aFRvVG9rZW4pIHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZUVsZW1lbnQgPSBlbGVtZW50LmNoaWxkcmVuKHRva2VuLnRhZykuZXEodG9rZW4uaW5kZXgpXG4gICAgICBpZiAoY2FuZGlkYXRlRWxlbWVudC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgZWxlbWVudCA9IGNhbmRpZGF0ZUVsZW1lbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnRbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKCd1cGRhdGUtcHJldmlldycpKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0gLy8gRG8gbm90IGp1bXAgdG8gdGhlIHRvcCBvZiB0aGUgcHJldmlldyBmb3IgYmFkIHN5bmNzXG5cbiAgICBpZiAoIWVsZW1lbnRbMF0uY2xhc3NMaXN0LmNvbnRhaW5zKCd1cGRhdGUtcHJldmlldycpKSB7XG4gICAgICBlbGVtZW50WzBdLnNjcm9sbEludG9WaWV3KClcbiAgICB9XG4gICAgY29uc3QgbWF4U2Nyb2xsVG9wID0gdGhpcy5lbGVtZW50LnNjcm9sbEhlaWdodCAtIHRoaXMuaW5uZXJIZWlnaHQoKVxuICAgIGlmICghKHRoaXMuc2Nyb2xsVG9wKCkgPj0gbWF4U2Nyb2xsVG9wKSkge1xuICAgICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCAtPSB0aGlzLmlubmVySGVpZ2h0KCkgLyA0XG4gICAgfVxuXG4gICAgZWxlbWVudC5hZGRDbGFzcygnZmxhc2gnKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gZWxlbWVudC5yZW1vdmVDbGFzcygnZmxhc2gnKSwgMTAwMClcblxuICAgIHJldHVybiBlbGVtZW50WzBdXG4gIH1cbn1cbiJdfQ==