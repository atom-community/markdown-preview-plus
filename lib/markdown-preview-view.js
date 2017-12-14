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
    static content() {
        return this.div({ class: 'markdown-preview native-key-bindings', tabindex: -1 }, () => this.div({ class: 'update-preview' }));
    }
    constructor({ editorId, filePath }) {
        super();
        this.getPathToElement = this.getPathToElement.bind(this);
        this.syncSource = this.syncSource.bind(this);
        this.getPathToToken = this.getPathToToken.bind(this);
        this.syncPreview = this.syncPreview.bind(this);
        this.editorId = editorId;
        this.filePath = filePath;
        this.updatePreview = null;
        this.renderLaTeX = atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
        this.emitter = new atom_1.Emitter();
        this.disposables = new atom_1.CompositeDisposable();
        this.loaded = true;
    }
    attached() {
        if (this.isAttached) {
            return;
        }
        this.isAttached = true;
        if (this.editorId != null) {
            return this.resolveEditor(this.editorId);
        }
        else {
            if (atom.workspace != null) {
                return this.subscribeToFilePath(this.filePath);
            }
            else {
                return this.disposables.add(atom.packages.onDidActivateInitialPackages(() => this.subscribeToFilePath(this.filePath)));
            }
        }
    }
    serialize() {
        let left;
        return {
            deserializer: 'MarkdownPreviewView',
            filePath: (left = this.getPath()) != null ? left : this.filePath,
            editorId: this.editorId,
        };
    }
    destroy() {
        imageWatcher.removeFile(this.getPath());
        return this.disposables.dispose();
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
        for (const editor of Array.from(atom.workspace.getTextEditors())) {
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
            let left;
            this.renderMarkdown();
            const pane = (left =
                typeof atom.workspace.paneForItem === 'function'
                    ? atom.workspace.paneForItem(this)
                    : undefined) != null
                ? left
                : atom.workspace.paneForURI(this.getURI());
            if (pane != null && pane !== atom.workspace.getActivePane()) {
                return pane.activateItem(this);
            }
        };
        if (this.file != null) {
            this.disposables.add(this.file.onDidChange(changeHandler));
        }
        else if (this.editor != null) {
            this.disposables.add(this.editor.getBuffer().onDidStopChanging(function () {
                if (atom.config.get('markdown-preview-plus.liveUpdate')) {
                    return changeHandler();
                }
            }));
            this.disposables.add(this.editor.onDidChangePath(() => this.emitter.emit('did-change-title')));
            this.disposables.add(this.editor.getBuffer().onDidSave(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    return changeHandler();
                }
            }));
            this.disposables.add(this.editor.getBuffer().onDidReload(function () {
                if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                    return changeHandler();
                }
            }));
            this.disposables.add(atom.commands.add(atom.views.getView(this.editor), {
                'markdown-preview-plus:sync-preview': (_event) => this.getMarkdownSource().then((source) => {
                    if (source == null) {
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
        return this.disposables.add(atom.config.observe('markdown-preview-plus.useGitHubStyle', (useGitHubStyle) => {
            if (useGitHubStyle) {
                return this.element.setAttribute('data-use-github-style', '');
            }
            else {
                return this.element.removeAttribute('data-use-github-style');
            }
        }));
    }
    renderMarkdown() {
        if (!this.loaded) {
            this.showLoading();
        }
        return this.getMarkdownSource().then((source) => {
            if (source != null) {
                return this.renderMarkdownText(source);
            }
        });
    }
    refreshImages(oldsrc) {
        const imgs = this.element.querySelectorAll('img[src]');
        return (() => {
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
        })();
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
            if (source == null) {
                return;
            }
            return renderer.toHTML(source, this.getPath(), this.getGrammar(), this.renderLaTeX, false, callback);
        });
    }
    renderMarkdownText(text) {
        return renderer.toDOMFragment(text, this.getPath(), this.getGrammar(), this.renderLaTeX, (error, domFragment) => {
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
        const failureMessage = result != null ? result.message : undefined;
        return this.html($$$(function () {
            this.h2('Previewing Markdown Failed');
            if (failureMessage != null) {
                return this.h3(failureMessage);
            }
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
            if (error != null) {
                return console.warn('Copying Markdown as HTML failed', error);
            }
            else {
                return atom.clipboard.write(html);
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
            let projectPath;
            filePath = 'untitled.md.html';
            if ((projectPath = atom.project.getPaths()[0])) {
                filePath = path.join(projectPath, filePath);
            }
        }
        const htmlFilePath = atom.showSaveDialogSync(filePath);
        if (htmlFilePath) {
            return this.getHTML((error, htmlBody) => {
                if (error != null) {
                    return console.warn('Saving Markdown as HTML failed', error);
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
                    return atom.workspace.open(htmlFilePath);
                }
            });
        }
    }
    isEqual(other) {
        return this[0] === (other != null ? other[0] : undefined);
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
        for (let i = 0, end = pathToToken.length - 1; i <= end; i++) {
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
            return;
        }
        const tokens = markdownIt.getTokens(text, this.renderLaTeX);
        let finalToken = null;
        let level = 0;
        for (const token of Array.from(tokens)) {
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
        if (finalToken != null) {
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
            if (tag == null) {
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
        for (const token of Array.from(pathToToken)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVdBLDZCQUE2QjtBQUU3QiwrQkFPYTtBQUViLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQzlELDRCQUE0QjtBQUM1Qiw4QkFBOEI7QUFFOUIsdUNBQXVDO0FBQ3ZDLHFEQUFnRDtBQUNoRCxtREFBbUQ7QUFDbkQscURBQXFEO0FBY3JELHlCQUFpQyxTQUFRLFVBQVU7SUFNakQsTUFBTSxDQUFDLE9BQU87UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDYixFQUFFLEtBQUssRUFBRSxzQ0FBc0MsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFFL0QsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQzVDLENBQUE7SUFDSCxDQUFDO0lBRUQsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWE7UUFFM0MsS0FBSyxFQUFFLENBQUE7UUFDUCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxJQUFJLENBQUMsUUFB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QUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQzdCLENBQUM7UUFDRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDbkUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNsRCxDQUFDO1FBRUQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUVwRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25CLENBQUM7Q0FDRjtBQXAyQkQsa0RBbzJCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBkZWNhZmZlaW5hdGUgc3VnZ2VzdGlvbnM6XG4gKiBEUzEwMTogUmVtb3ZlIHVubmVjZXNzYXJ5IHVzZSBvZiBBcnJheS5mcm9tXG4gKiBEUzEwMjogUmVtb3ZlIHVubmVjZXNzYXJ5IGNvZGUgY3JlYXRlZCBiZWNhdXNlIG9mIGltcGxpY2l0IHJldHVybnNcbiAqIERTMTAzOiBSZXdyaXRlIGNvZGUgdG8gbm8gbG9uZ2VyIHVzZSBfX2d1YXJkX19cbiAqIERTMTA0OiBBdm9pZCBpbmxpbmUgYXNzaWdubWVudHNcbiAqIERTMjA1OiBDb25zaWRlciByZXdvcmtpbmcgY29kZSB0byBhdm9pZCB1c2Ugb2YgSUlGRXNcbiAqIERTMjA3OiBDb25zaWRlciBzaG9ydGVyIHZhcmlhdGlvbnMgb2YgbnVsbCBjaGVja3NcbiAqIEZ1bGwgZG9jczogaHR0cHM6Ly9naXRodWIuY29tL2RlY2FmZmVpbmF0ZS9kZWNhZmZlaW5hdGUvYmxvYi9tYXN0ZXIvZG9jcy9zdWdnZXN0aW9ucy5tZFxuICovXG5pbXBvcnQgeyBUb2tlbiB9IGZyb20gJ21hcmtkb3duLWl0J1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcblxuaW1wb3J0IHtcbiAgQ29tbWFuZEV2ZW50LFxuICBFbWl0dGVyLFxuICBEaXNwb3NhYmxlLFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBGaWxlLFxuICBTdHlsZU1hbmFnZXIsXG59IGZyb20gJ2F0b20nXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLXJlcXVpcmVzXG5jb25zdCB7ICQsICQkJCwgU2Nyb2xsVmlldyB9ID0gcmVxdWlyZSgnYXRvbS1zcGFjZS1wZW4tdmlld3MnKVxuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtcGx1cycpXG5cbmltcG9ydCByZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKVxuaW1wb3J0IHsgVXBkYXRlUHJldmlldyB9IGZyb20gJy4vdXBkYXRlLXByZXZpZXcnXG5pbXBvcnQgbWFya2Rvd25JdCA9IHJlcXVpcmUoJy4vbWFya2Rvd24taXQtaGVscGVyJylcbmltcG9ydCBpbWFnZVdhdGNoZXIgPSByZXF1aXJlKCcuL2ltYWdlLXdhdGNoLWhlbHBlcicpXG5cbmV4cG9ydCBpbnRlcmZhY2UgTVBWUGFyYW1zRWRpdG9yIHtcbiAgZWRpdG9ySWQ6IG51bWJlclxuICBmaWxlUGF0aD86IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc1BhdGgge1xuICBlZGl0b3JJZD86IHVuZGVmaW5lZFxuICBmaWxlUGF0aDogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIE1QVlBhcmFtcyA9IE1QVlBhcmFtc0VkaXRvciB8IE1QVlBhcmFtc1BhdGhcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duUHJldmlld1ZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3IHtcbiAgcHJpdmF0ZSBlbGVtZW50OiBIVE1MRWxlbWVudFxuICBwcml2YXRlIGVtaXR0ZXI6IEVtaXR0ZXI8e1xuICAgICdkaWQtY2hhbmdlLXRpdGxlJzogdW5kZWZpbmVkXG4gICAgJ2RpZC1jaGFuZ2UtbWFya2Rvd24nOiB1bmRlZmluZWRcbiAgfT5cbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2KFxuICAgICAgeyBjbGFzczogJ21hcmtkb3duLXByZXZpZXcgbmF0aXZlLWtleS1iaW5kaW5ncycsIHRhYmluZGV4OiAtMSB9LFxuICAgICAgLy8gSWYgeW91IGRvbnQgZXhwbGljaXRseSBkZWNsYXJlIGEgY2xhc3MgdGhlbiB0aGUgZWxlbWVudHMgd29udCBiZSBjcmVhdGVkXG4gICAgICAoKSA9PiB0aGlzLmRpdih7IGNsYXNzOiAndXBkYXRlLXByZXZpZXcnIH0pLFxuICAgIClcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHsgZWRpdG9ySWQsIGZpbGVQYXRoIH06IE1QVlBhcmFtcykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBzdXBlcigpXG4gICAgdGhpcy5nZXRQYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50LmJpbmQodGhpcylcbiAgICB0aGlzLnN5bmNTb3VyY2UgPSB0aGlzLnN5bmNTb3VyY2UuYmluZCh0aGlzKVxuICAgIHRoaXMuZ2V0UGF0aFRvVG9rZW4gPSB0aGlzLmdldFBhdGhUb1Rva2VuLmJpbmQodGhpcylcbiAgICB0aGlzLnN5bmNQcmV2aWV3ID0gdGhpcy5zeW5jUHJldmlldy5iaW5kKHRoaXMpXG4gICAgdGhpcy5lZGl0b3JJZCA9IGVkaXRvcklkXG4gICAgdGhpcy5maWxlUGF0aCA9IGZpbGVQYXRoXG4gICAgdGhpcy51cGRhdGVQcmV2aWV3ID0gbnVsbFxuICAgIHRoaXMucmVuZGVyTGFUZVggPSBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JyxcbiAgICApXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5sb2FkZWQgPSB0cnVlIC8vIERvIG5vdCBzaG93IHRoZSBsb2FkaW5nIHNwaW5ub3Igb24gaW5pdGlhbCBsb2FkXG4gIH1cblxuICBhdHRhY2hlZCgpIHtcbiAgICBpZiAodGhpcy5pc0F0dGFjaGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5pc0F0dGFjaGVkID0gdHJ1ZVxuXG4gICAgaWYgKHRoaXMuZWRpdG9ySWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVzb2x2ZUVkaXRvcih0aGlzLmVkaXRvcklkKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYXRvbS53b3Jrc3BhY2UgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmVUb0ZpbGVQYXRoKHRoaXMuZmlsZVBhdGgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzKCgpID0+XG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZVRvRmlsZVBhdGgodGhpcy5maWxlUGF0aCksXG4gICAgICAgICAgKSxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICBsZXQgbGVmdFxuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdNYXJrZG93blByZXZpZXdWaWV3JyxcbiAgICAgIGZpbGVQYXRoOiAobGVmdCA9IHRoaXMuZ2V0UGF0aCgpKSAhPSBudWxsID8gbGVmdCA6IHRoaXMuZmlsZVBhdGgsXG4gICAgICBlZGl0b3JJZDogdGhpcy5lZGl0b3JJZCxcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGltYWdlV2F0Y2hlci5yZW1vdmVGaWxlKHRoaXMuZ2V0UGF0aCgpKVxuICAgIHJldHVybiB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICB9XG5cbiAgb25EaWRDaGFuZ2VUaXRsZShjYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQoX2NhbGxiYWNrOiBhbnkpIHtcbiAgICAvLyBObyBvcCB0byBzdXBwcmVzcyBkZXByZWNhdGlvbiB3YXJuaW5nXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKClcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTWFya2Rvd24oY2FsbGJhY2s6ICgpID0+IHZvaWQpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLW1hcmtkb3duJywgY2FsbGJhY2spXG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgdGhpcy5oYW5kbGVFdmVudHMoKVxuICAgIHJldHVybiB0aGlzLnJlbmRlck1hcmtkb3duKClcbiAgfVxuXG4gIHJlc29sdmVFZGl0b3IoZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIGNvbnN0IHJlc29sdmUgPSAoKSA9PiB7XG4gICAgICB0aGlzLmVkaXRvciA9IHRoaXMuZWRpdG9yRm9ySWQoZWRpdG9ySWQpXG5cbiAgICAgIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGFuZGxlRXZlbnRzKClcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTWFya2Rvd24oKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIGVkaXRvciB0aGlzIHByZXZpZXcgd2FzIGNyZWF0ZWQgZm9yIGhhcyBiZWVuIGNsb3NlZCBzbyBjbG9zZVxuICAgICAgICAvLyB0aGlzIHByZXZpZXcgc2luY2UgYSBwcmV2aWV3IGNhbm5vdCBiZSByZW5kZXJlZCB3aXRob3V0IGFuIGVkaXRvclxuICAgICAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgICAgcGFuZSAmJiBwYW5lLmRlc3Ryb3lJdGVtKHRoaXMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc29sdmUoKVxuICB9XG5cbiAgZWRpdG9yRm9ySWQoZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIGZvciAoY29uc3QgZWRpdG9yIG9mIEFycmF5LmZyb20oYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSkpIHtcbiAgICAgIGlmIChlZGl0b3IuaWQgPT09IGVkaXRvcklkKSB7XG4gICAgICAgIHJldHVybiBlZGl0b3JcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGhhbmRsZUV2ZW50cygpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uZ3JhbW1hcnMub25EaWRBZGRHcmFtbWFyKCgpID0+XG4gICAgICAgIF8uZGVib3VuY2UoKCkgPT4gdGhpcy5yZW5kZXJNYXJrZG93bigpLCAyNTApLFxuICAgICAgKSxcbiAgICApXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkVXBkYXRlR3JhbW1hcihcbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB0aGlzLnJlbmRlck1hcmtkb3duKCksIDI1MCksXG4gICAgICApLFxuICAgIClcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgJ2NvcmU6bW92ZS11cCc6ICgpID0+IHRoaXMuc2Nyb2xsVXAoKSxcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ICgpID0+IHRoaXMuc2Nyb2xsRG93bigpLFxuICAgICAgJ2NvcmU6c2F2ZS1hcyc6IChldmVudCkgPT4ge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICByZXR1cm4gdGhpcy5zYXZlQXMoKVxuICAgICAgfSxcbiAgICAgICdjb3JlOmNvcHknOiAoZXZlbnQ6IENvbW1hbmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb3B5VG9DbGlwYm9hcmQoKSkgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHpvb21MZXZlbCA9IHBhcnNlRmxvYXQodGhpcy5jc3MoJ3pvb20nKSkgfHwgMVxuICAgICAgICByZXR1cm4gdGhpcy5jc3MoJ3pvb20nLCB6b29tTGV2ZWwgKyAwLjEpXG4gICAgICB9LFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLW91dCc6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLmNzcygnem9vbScpKSB8fCAxXG4gICAgICAgIHJldHVybiB0aGlzLmNzcygnem9vbScsIHpvb21MZXZlbCAtIDAuMSlcbiAgICAgIH0sXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnJlc2V0LXpvb20nOiAoKSA9PiB0aGlzLmNzcygnem9vbScsIDEpLFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXNvdXJjZSc6IChldmVudCkgPT5cbiAgICAgICAgdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgICAgIGlmIChzb3VyY2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLnN5bmNTb3VyY2Uoc291cmNlLCBldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpXG4gICAgICAgIH0pLFxuICAgIH0pXG5cbiAgICBjb25zdCBjaGFuZ2VIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgbGV0IGxlZnRcbiAgICAgIHRoaXMucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICAvLyBUT0RPOiBSZW1vdmUgcGFuZUZvclVSSSBjYWxsIHdoZW4gOjpwYW5lRm9ySXRlbSBpcyByZWxlYXNlZFxuICAgICAgY29uc3QgcGFuZSA9XG4gICAgICAgIChsZWZ0ID1cbiAgICAgICAgICB0eXBlb2YgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgICAgICAgIDogdW5kZWZpbmVkKSAhPSBudWxsXG4gICAgICAgICAgPyBsZWZ0XG4gICAgICAgICAgOiBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKHRoaXMuZ2V0VVJJKCkpXG4gICAgICBpZiAocGFuZSAhPSBudWxsICYmIHBhbmUgIT09IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSkge1xuICAgICAgICByZXR1cm4gcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maWxlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZShjaGFuZ2VIYW5kbGVyKSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyhmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5vbkRpZENoYW5nZVBhdGgoKCkgPT5cbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpLFxuICAgICAgICApLFxuICAgICAgKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU2F2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJykpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIGF0b20uY29tbWFuZHMuYWRkKGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmVkaXRvciksIHtcbiAgICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtcHJldmlldyc6IChfZXZlbnQpID0+XG4gICAgICAgICAgICB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChzb3VyY2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnN5bmNQcmV2aWV3KFxuICAgICAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdyxcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgIH1cblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYnJlYWtPblNpbmdsZU5ld2xpbmUnLFxuICAgICAgICBjaGFuZ2VIYW5kbGVyLFxuICAgICAgKSxcbiAgICApXG5cbiAgICAvLyBUb2dnbGUgTGFUZVggcmVuZGVyaW5nIGlmIGZvY3VzIGlzIG9uIHByZXZpZXcgcGFuZSBvciBhc3NvY2lhdGVkIGVkaXRvci5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKCkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgPT09IHRoaXMgfHxcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSA9PT0gdGhpcy5lZGl0b3JcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyTGFUZVggPSAhdGhpcy5yZW5kZXJMYVRlWFxuICAgICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuXG4gICAgcmV0dXJuIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScsXG4gICAgICAgICh1c2VHaXRIdWJTdHlsZSkgPT4ge1xuICAgICAgICAgIGlmICh1c2VHaXRIdWJTdHlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScsICcnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJylcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApLFxuICAgIClcbiAgfVxuXG4gIHJlbmRlck1hcmtkb3duKCkge1xuICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgIHRoaXMuc2hvd0xvYWRpbmcoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRNYXJrZG93blNvdXJjZSgpLnRoZW4oKHNvdXJjZT86IHN0cmluZykgPT4ge1xuICAgICAgaWYgKHNvdXJjZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlck1hcmtkb3duVGV4dChzb3VyY2UpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJlZnJlc2hJbWFnZXMob2xkc3JjOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpbWdzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZ1tzcmNdJykgYXMgTm9kZUxpc3RPZjxcbiAgICAgIEhUTUxJbWFnZUVsZW1lbnRcbiAgICA+XG4gICAgcmV0dXJuICgoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBbXVxuICAgICAgZm9yIChjb25zdCBpbWcgb2YgQXJyYXkuZnJvbShpbWdzKSkge1xuICAgICAgICBsZXQgb3ZzOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgICAgICAgbGV0IG92OiBudW1iZXIgfCB1bmRlZmluZWRcbiAgICAgICAgbGV0IHNyYyA9IGltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpIVxuICAgICAgICBjb25zdCBtYXRjaCA9IHNyYy5tYXRjaCgvXiguKilcXD92PShcXGQrKSQvKVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICA7Wywgc3JjLCBvdnNdID0gbWF0Y2hcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3JjID09PSBvbGRzcmMpIHtcbiAgICAgICAgICBpZiAob3ZzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG92ID0gcGFyc2VJbnQob3ZzLCAxMClcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdiA9IGltYWdlV2F0Y2hlci5nZXRWZXJzaW9uKHNyYywgdGhpcy5nZXRQYXRoKCkpXG4gICAgICAgICAgaWYgKHYgIT09IG92KSB7XG4gICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaCgoaW1nLnNyYyA9IGAke3NyY30/dj0ke3Z9YCkpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaCgoaW1nLnNyYyA9IGAke3NyY31gKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh1bmRlZmluZWQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9KSgpXG4gIH1cblxuICBnZXRNYXJrZG93blNvdXJjZSgpIHtcbiAgICBpZiAodGhpcy5maWxlICE9IG51bGwgPyB0aGlzLmZpbGUuZ2V0UGF0aCgpIDogdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWxlLnJlYWQoKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmVkaXRvci5nZXRUZXh0KCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbClcbiAgICB9XG4gIH1cblxuICBnZXRIVE1MKGNhbGxiYWNrOiAoZXJyb3I6IEVycm9yIHwgbnVsbCwgaHRtbEJvZHk6IHN0cmluZykgPT4gdm9pZCkge1xuICAgIHJldHVybiB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoc291cmNlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZW5kZXJlci50b0hUTUwoXG4gICAgICAgIHNvdXJjZSxcbiAgICAgICAgdGhpcy5nZXRQYXRoKCksXG4gICAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgICB0aGlzLnJlbmRlckxhVGVYLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIHJlbmRlck1hcmtkb3duVGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gcmVuZGVyZXIudG9ET01GcmFnbWVudChcbiAgICAgIHRleHQsXG4gICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgIChlcnJvciwgZG9tRnJhZ21lbnQpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2hvd0Vycm9yKGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgLy8gZGl2LnVwZGF0ZS1wcmV2aWV3IGNyZWF0ZWQgYWZ0ZXIgY29uc3RydWN0b3Igc3QgVXBkYXRlUHJldmlldyBjYW5ub3RcbiAgICAgICAgICAvLyBiZSBpbnN0YW5jZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgaWYgKCF0aGlzLnVwZGF0ZVByZXZpZXcgJiYgdGhpcy5maW5kKCdkaXYudXBkYXRlLXByZXZpZXcnKVswXSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3ID0gbmV3IFVwZGF0ZVByZXZpZXcoXG4gICAgICAgICAgICAgIHRoaXMuZmluZCgnZGl2LnVwZGF0ZS1wcmV2aWV3JylbMF0sXG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyAmJlxuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3LnVwZGF0ZShkb21GcmFnbWVudCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1tYXJrZG93bicpXG4gICAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luYWxUcmlnZ2VyKCdtYXJrZG93bi1wcmV2aWV3LXBsdXM6bWFya2Rvd24tY2hhbmdlZCcpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKVxuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gYCR7cGF0aC5iYXNlbmFtZSh0aGlzLmdldFBhdGgoKSl9IFByZXZpZXdgXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5lZGl0b3IuZ2V0VGl0bGUoKX0gUHJldmlld2BcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdNYXJrZG93biBQcmV2aWV3J1xuICAgIH1cbiAgfVxuXG4gIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAnbWFya2Rvd24nXG4gIH1cblxuICBnZXRVUkkoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovLyR7dGhpcy5nZXRQYXRoKCl9YFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL2VkaXRvci8ke3RoaXMuZWRpdG9ySWR9YFxuICAgIH1cbiAgfVxuXG4gIGdldFBhdGgoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWxlLmdldFBhdGgoKVxuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFBhdGgoKVxuICAgIH1cbiAgfVxuXG4gIGdldEdyYW1tYXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yICE9IG51bGwgPyB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKCkgOiB1bmRlZmluZWRcbiAgfVxuXG4gIGdldERvY3VtZW50U3R5bGVTaGVldHMoKSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBleGlzdHMgc28gd2UgY2FuIHN0dWIgaXRcbiAgICByZXR1cm4gZG9jdW1lbnQuc3R5bGVTaGVldHNcbiAgfVxuXG4gIGdldFRleHRFZGl0b3JTdHlsZXMoKSB7XG4gICAgY29uc3QgdGV4dEVkaXRvclN0eWxlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAnYXRvbS1zdHlsZXMnLFxuICAgICkgYXMgSFRNTEVsZW1lbnQgJiB7IGluaXRpYWxpemUoc3R5bGVzOiBTdHlsZU1hbmFnZXIpOiB2b2lkIH1cbiAgICB0ZXh0RWRpdG9yU3R5bGVzLmluaXRpYWxpemUoYXRvbS5zdHlsZXMpXG4gICAgdGV4dEVkaXRvclN0eWxlcy5zZXRBdHRyaWJ1dGUoJ2NvbnRleHQnLCAnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXh0RWRpdG9yU3R5bGVzKVxuXG4gICAgLy8gRXh0cmFjdCBzdHlsZSBlbGVtZW50cyBjb250ZW50XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGV4dEVkaXRvclN0eWxlcy5jaGlsZE5vZGVzKS5tYXAoXG4gICAgICAoc3R5bGVFbGVtZW50KSA9PiAoc3R5bGVFbGVtZW50IGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHQsXG4gICAgKVxuICB9XG5cbiAgZ2V0TWFya2Rvd25QcmV2aWV3Q1NTKCkge1xuICAgIGNvbnN0IG1hcmtkb3dQcmV2aWV3UnVsZXMgPSBbXVxuICAgIGNvbnN0IHJ1bGVSZWdFeHAgPSAvXFwubWFya2Rvd24tcHJldmlldy9cbiAgICBjb25zdCBjc3NVcmxSZWZFeHAgPSAvdXJsXFwoYXRvbTpcXC9cXC9tYXJrZG93bi1wcmV2aWV3LXBsdXNcXC9hc3NldHNcXC8oLiopXFwpL1xuXG4gICAgZm9yIChjb25zdCBzdHlsZXNoZWV0IG9mIEFycmF5LmZyb20odGhpcy5nZXREb2N1bWVudFN0eWxlU2hlZXRzKCkpKSB7XG4gICAgICBpZiAoc3R5bGVzaGVldC5ydWxlcyAhPSBudWxsKSB7XG4gICAgICAgIGZvciAoY29uc3QgcnVsZSBvZiBBcnJheS5mcm9tKHN0eWxlc2hlZXQucnVsZXMpKSB7XG4gICAgICAgICAgLy8gV2Ugb25seSBuZWVkIGAubWFya2Rvd24tcmV2aWV3YCBjc3NcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAocnVsZS5zZWxlY3RvclRleHQgIT0gbnVsbFxuICAgICAgICAgICAgICA/IHJ1bGUuc2VsZWN0b3JUZXh0Lm1hdGNoKHJ1bGVSZWdFeHApXG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkKSAhPSBudWxsXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBtYXJrZG93UHJldmlld1J1bGVzLnB1c2gocnVsZS5jc3NUZXh0KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrZG93UHJldmlld1J1bGVzXG4gICAgICAuY29uY2F0KHRoaXMuZ2V0VGV4dEVkaXRvclN0eWxlcygpKVxuICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAucmVwbGFjZSgvYXRvbS10ZXh0LWVkaXRvci9nLCAncHJlLmVkaXRvci1jb2xvcnMnKVxuICAgICAgLnJlcGxhY2UoLzpob3N0L2csICcuaG9zdCcpIC8vIFJlbW92ZSBzaGFkb3ctZG9tIDpob3N0IHNlbGVjdG9yIGNhdXNpbmcgcHJvYmxlbSBvbiBGRlxuICAgICAgLnJlcGxhY2UoY3NzVXJsUmVmRXhwLCBmdW5jdGlvbihfbWF0Y2gsIGFzc2V0c05hbWUsIF9vZmZzZXQsIF9zdHJpbmcpIHtcbiAgICAgICAgLy8gYmFzZTY0IGVuY29kZSBhc3NldHNcbiAgICAgICAgY29uc3QgYXNzZXRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2Fzc2V0cycsIGFzc2V0c05hbWUpXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsRGF0YSA9IGZzLnJlYWRGaWxlU3luYyhhc3NldFBhdGgsICdiaW5hcnknKVxuICAgICAgICBjb25zdCBiYXNlNjREYXRhID0gbmV3IEJ1ZmZlcihvcmlnaW5hbERhdGEsICdiaW5hcnknKS50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgcmV0dXJuIGB1cmwoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJHtiYXNlNjREYXRhfScpYFxuICAgICAgfSlcbiAgfVxuXG4gIHNob3dFcnJvcihyZXN1bHQ6IEVycm9yKSB7XG4gICAgY29uc3QgZmFpbHVyZU1lc3NhZ2UgPSByZXN1bHQgIT0gbnVsbCA/IHJlc3VsdC5tZXNzYWdlIDogdW5kZWZpbmVkXG5cbiAgICByZXR1cm4gdGhpcy5odG1sKFxuICAgICAgJCQkKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuaDIoJ1ByZXZpZXdpbmcgTWFya2Rvd24gRmFpbGVkJylcbiAgICAgICAgaWYgKGZhaWx1cmVNZXNzYWdlICE9IG51bGwpIHtcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgcmV0dXJuIHRoaXMuaDMoZmFpbHVyZU1lc3NhZ2UpXG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIHNob3dMb2FkaW5nKCkge1xuICAgIHRoaXMubG9hZGluZyA9IHRydWVcbiAgICByZXR1cm4gdGhpcy5odG1sKFxuICAgICAgJCQkKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiB0aGlzLmRpdih7IGNsYXNzOiAnbWFya2Rvd24tc3Bpbm5lcicgfSwgJ0xvYWRpbmcgTWFya2Rvd25cXHUyMDI2JylcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIGNvcHlUb0NsaXBib2FyZCgpIHtcbiAgICBpZiAodGhpcy5sb2FkaW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBjb25zdCBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKVxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZSA9IHNlbGVjdGlvbi5iYXNlTm9kZVxuXG4gICAgLy8gVXNlIGRlZmF1bHQgY29weSBldmVudCBoYW5kbGVyIGlmIHRoZXJlIGlzIHNlbGVjdGVkIHRleHQgaW5zaWRlIHRoaXMgdmlld1xuICAgIGlmIChcbiAgICAgIHNlbGVjdGVkVGV4dCAmJlxuICAgICAgc2VsZWN0ZWROb2RlICE9IG51bGwgJiZcbiAgICAgICh0aGlzWzBdID09PSBzZWxlY3RlZE5vZGUgfHwgJC5jb250YWlucyh0aGlzWzBdLCBzZWxlY3RlZE5vZGUpKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpcy5nZXRIVE1MKGZ1bmN0aW9uKGVycm9yLCBodG1sKSB7XG4gICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdDb3B5aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYXRvbS5jbGlwYm9hcmQud3JpdGUoaHRtbClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHNhdmVBcygpIHtcbiAgICBpZiAodGhpcy5sb2FkaW5nKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgZmlsZVBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgIGxldCB0aXRsZSA9ICdNYXJrZG93biB0byBIVE1MJ1xuICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgdGl0bGUgPSBwYXRoLnBhcnNlKGZpbGVQYXRoKS5uYW1lXG4gICAgICBmaWxlUGF0aCArPSAnLmh0bWwnXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwcm9qZWN0UGF0aFxuICAgICAgZmlsZVBhdGggPSAndW50aXRsZWQubWQuaHRtbCdcbiAgICAgIGlmICgocHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSkpIHtcbiAgICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIGZpbGVQYXRoKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGh0bWxGaWxlUGF0aCA9IGF0b20uc2hvd1NhdmVEaWFsb2dTeW5jKGZpbGVQYXRoKVxuICAgIGlmIChodG1sRmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEhUTUwoKGVycm9yOiBFcnJvciB8IG51bGwsIGh0bWxCb2R5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGVycm9yICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKCdTYXZpbmcgTWFya2Rvd24gYXMgSFRNTCBmYWlsZWQnLCBlcnJvcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgbWF0aGpheFNjcmlwdFxuICAgICAgICAgIGlmICh0aGlzLnJlbmRlckxhVGVYKSB7XG4gICAgICAgICAgICBtYXRoamF4U2NyaXB0ID0gYFxcXG5cbjxzY3JpcHQgdHlwZT1cInRleHQveC1tYXRoamF4LWNvbmZpZ1wiPlxuICBNYXRoSmF4Lkh1Yi5Db25maWcoe1xuICAgIGpheDogW1wiaW5wdXQvVGVYXCIsXCJvdXRwdXQvSFRNTC1DU1NcIl0sXG4gICAgZXh0ZW5zaW9uczogW10sXG4gICAgVGVYOiB7XG4gICAgICBleHRlbnNpb25zOiBbXCJBTVNtYXRoLmpzXCIsXCJBTVNzeW1ib2xzLmpzXCIsXCJub0Vycm9ycy5qc1wiLFwibm9VbmRlZmluZWQuanNcIl1cbiAgICB9LFxuICAgIHNob3dNYXRoTWVudTogZmFsc2VcbiAgfSk7XG48L3NjcmlwdD5cbjxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cImh0dHBzOi8vY2RuLm1hdGhqYXgub3JnL21hdGhqYXgvbGF0ZXN0L01hdGhKYXguanNcIj5cbjwvc2NyaXB0PlxcXG5gXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hdGhqYXhTY3JpcHQgPSAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBodG1sID1cbiAgICAgICAgICAgIGBcXFxuPCFET0NUWVBFIGh0bWw+XG48aHRtbD5cbiAgPGhlYWQ+XG4gICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIiAvPlxuICAgICAgPHRpdGxlPiR7dGl0bGV9PC90aXRsZT4ke21hdGhqYXhTY3JpcHR9XG4gICAgICA8c3R5bGU+JHt0aGlzLmdldE1hcmtkb3duUHJldmlld0NTUygpfTwvc3R5bGU+XG4gIDwvaGVhZD5cbiAgPGJvZHkgY2xhc3M9J21hcmtkb3duLXByZXZpZXcnPiR7aHRtbEJvZHl9PC9ib2R5PlxuPC9odG1sPmAgKyAnXFxuJyAvLyBFbnN1cmUgdHJhaWxpbmcgbmV3bGluZVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhodG1sRmlsZVBhdGgsIGh0bWwpXG4gICAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oaHRtbEZpbGVQYXRoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlzRXF1YWwob3RoZXI6IG51bGwgfCBbTm9kZV0pIHtcbiAgICByZXR1cm4gdGhpc1swXSA9PT0gKG90aGVyICE9IG51bGwgPyBvdGhlclswXSA6IHVuZGVmaW5lZCkgLy8gQ29tcGFyZSBET00gZWxlbWVudHNcbiAgfVxuXG4gIC8vXG4gIC8vIEZpbmQgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igb2YgYW4gZWxlbWVudCB0aGF0IGlzIG5vdCBhIGRlY2VuZGFudCBvZiBlaXRoZXJcbiAgLy8gYHNwYW4ubWF0aGAgb3IgYHNwYW4uYXRvbS10ZXh0LWVkaXRvcmAuXG4gIC8vXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgZnJvbSB3aGljaCB0aGUgc2VhcmNoIGZvciBhXG4gIC8vICAgY2xvc2VzdCBhbmNlc3RvciBiZWdpbnMuXG4gIC8vIEByZXR1cm4ge0hUTUxFbGVtZW50fSBUaGUgY2xvc2VzdCBhbmNlc3RvciB0byBgZWxlbWVudGAgdGhhdCBkb2VzIG5vdFxuICAvLyAgIGNvbnRhaW4gZWl0aGVyIGBzcGFuLm1hdGhgIG9yIGBzcGFuLmF0b20tdGV4dC1lZGl0b3JgLlxuICAvL1xuICBidWJibGVUb0NvbnRhaW5lckVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBIVE1MRWxlbWVudCB7XG4gICAgbGV0IHRlc3RFbGVtZW50ID0gZWxlbWVudFxuICAgIHdoaWxlICh0ZXN0RWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgY29uc3QgcGFyZW50ID0gdGVzdEVsZW1lbnQucGFyZW50RWxlbWVudCFcbiAgICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdNYXRoSmF4X0Rpc3BsYXknKSkge1xuICAgICAgICByZXR1cm4gcGFyZW50LnBhcmVudEVsZW1lbnQhXG4gICAgICB9XG4gICAgICBpZiAocGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnYXRvbS10ZXh0LWVkaXRvcicpKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnRcbiAgICAgIH1cbiAgICAgIHRlc3RFbGVtZW50ID0gcGFyZW50XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50XG4gIH1cblxuICAvL1xuICAvLyBEZXRlcm1pbmUgYSBzdWJzZXF1ZW5jZSBvZiBhIHNlcXVlbmNlIG9mIHRva2VucyByZXByZXNlbnRpbmcgYSBwYXRoIHRocm91Z2hcbiAgLy8gSFRNTEVsZW1lbnRzIHRoYXQgZG9lcyBub3QgY29udGludWUgZGVlcGVyIHRoYW4gYSB0YWJsZSBlbGVtZW50LlxuICAvL1xuICAvLyBAcGFyYW0geyh0YWc6IDx0YWc+LCBpbmRleDogPGluZGV4PilbXX0gcGF0aFRvVG9rZW4gQXJyYXkgb2YgdG9rZW5zXG4gIC8vICAgcmVwcmVzZW50aW5nIGEgcGF0aCB0byBhIEhUTUxFbGVtZW50IHdpdGggdGhlIHJvb3QgZWxlbWVudCBhdFxuICAvLyAgIHBhdGhUb1Rva2VuWzBdIGFuZCB0aGUgdGFyZ2V0IGVsZW1lbnQgYXQgdGhlIGhpZ2hlc3QgaW5kZXguIEVhY2ggZWxlbWVudFxuICAvLyAgIGNvbnNpc3RzIG9mIGEgYHRhZ2AgYW5kIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0c1xuICAvLyAgIHNpYmxpbmcgZWxlbWVudHMgb2YgdGhlIHNhbWUgYHRhZ2AuXG4gIC8vIEByZXR1cm4geyh0YWc6IDx0YWc+LCBpbmRleDogPGluZGV4PilbXX0gVGhlIHN1YnNlcXVlbmNlIG9mIHBhdGhUb1Rva2VuIHRoYXRcbiAgLy8gICBtYWludGFpbnMgdGhlIHNhbWUgcm9vdCBidXQgdGVybWluYXRlcyBhdCBhIHRhYmxlIGVsZW1lbnQgb3IgdGhlIHRhcmdldFxuICAvLyAgIGVsZW1lbnQsIHdoaWNoZXZlciBjb21lcyBmaXJzdC5cbiAgLy9cbiAgYnViYmxlVG9Db250YWluZXJUb2tlbihwYXRoVG9Ub2tlbjogQXJyYXk8eyB0YWc6IHN0cmluZzsgaW5kZXg6IG51bWJlciB9Pikge1xuICAgIGZvciAobGV0IGkgPSAwLCBlbmQgPSBwYXRoVG9Ub2tlbi5sZW5ndGggLSAxOyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICBpZiAocGF0aFRvVG9rZW5baV0udGFnID09PSAndGFibGUnKSB7XG4gICAgICAgIHJldHVybiBwYXRoVG9Ub2tlbi5zbGljZSgwLCBpICsgMSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG4gIH1cblxuICAvL1xuICAvLyBFbmNvZGUgdGFncyBmb3IgbWFya2Rvd24taXQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgRW5jb2RlIHRoZSB0YWcgb2YgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7c3RyaW5nfSBFbmNvZGVkIHRhZy5cbiAgLy9cbiAgZW5jb2RlVGFnKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hdGgnKSkge1xuICAgICAgcmV0dXJuICdtYXRoJ1xuICAgIH1cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F0b20tdGV4dC1lZGl0b3InKSkge1xuICAgICAgcmV0dXJuICdjb2RlJ1xuICAgIH0gLy8gb25seSB0b2tlbi50eXBlIGlzIGBmZW5jZWAgY29kZSBibG9ja3Mgc2hvdWxkIGV2ZXIgYmUgZm91bmQgaW4gdGhlIGZpcnN0IGxldmVsIG9mIHRoZSB0b2tlbnMgYXJyYXlcbiAgICByZXR1cm4gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIC8vXG4gIC8vIERlY29kZSB0YWdzIHVzZWQgYnkgbWFya2Rvd24taXRcbiAgLy9cbiAgLy8gQHBhcmFtIHttYXJrZG93bi1pdC5Ub2tlbn0gdG9rZW4gRGVjb2RlIHRoZSB0YWcgb2YgdG9rZW4uXG4gIC8vIEByZXR1cm4ge3N0cmluZ3xudWxsfSBEZWNvZGVkIHRhZyBvciBgbnVsbGAgaWYgdGhlIHRva2VuIGhhcyBubyB0YWcuXG4gIC8vXG4gIGRlY29kZVRhZyh0b2tlbjogVG9rZW4pOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAodG9rZW4udGFnID09PSAnbWF0aCcpIHtcbiAgICAgIHJldHVybiAnc3BhbidcbiAgICB9XG4gICAgaWYgKHRva2VuLnRhZyA9PT0gJ2NvZGUnKSB7XG4gICAgICByZXR1cm4gJ3NwYW4nXG4gICAgfVxuICAgIGlmICh0b2tlbi50YWcgPT09ICcnKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICByZXR1cm4gdG9rZW4udGFnXG4gIH1cblxuICAvL1xuICAvLyBEZXRlcm1pbmUgcGF0aCB0byBhIHRhcmdldCBlbGVtZW50IGZyb20gYSBjb250YWluZXIgYC5tYXJrZG93bi1wcmV2aWV3YC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgSFRNTEVsZW1lbnQuXG4gIC8vIEByZXR1cm4geyh0YWc6IDx0YWc+LCBpbmRleDogPGluZGV4PilbXX0gQXJyYXkgb2YgdG9rZW5zIHJlcHJlc2VudGluZyBhIHBhdGhcbiAgLy8gICB0byBgZWxlbWVudGAgZnJvbSBgLm1hcmtkb3duLXByZXZpZXdgLiBUaGUgcm9vdCBgLm1hcmtkb3duLXByZXZpZXdgXG4gIC8vICAgZWxlbWVudCBpcyB0aGUgZmlyc3QgZWxlbWVudHMgaW4gdGhlIGFycmF5IGFuZCB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgLy8gICBgZWxlbWVudGAgYXQgdGhlIGhpZ2hlc3QgaW5kZXguIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZFxuICAvLyAgIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lXG4gIC8vICAgYHRhZ2AuXG4gIC8vXG4gIGdldFBhdGhUb0VsZW1lbnQoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICk6IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4ge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgdGFnOiAnZGl2JyxcbiAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgfSxcbiAgICAgIF1cbiAgICB9XG5cbiAgICBlbGVtZW50ID0gdGhpcy5idWJibGVUb0NvbnRhaW5lckVsZW1lbnQoZWxlbWVudClcbiAgICBjb25zdCB0YWcgPSB0aGlzLmVuY29kZVRhZyhlbGVtZW50KVxuICAgIGNvbnN0IHNpYmxpbmdzID0gZWxlbWVudC5wYXJlbnRFbGVtZW50IS5jaGlsZHJlblxuICAgIGxldCBzaWJsaW5nc0NvdW50ID0gMFxuXG4gICAgZm9yIChjb25zdCBzaWJsaW5nIG9mIEFycmF5LmZyb20oc2libGluZ3MpKSB7XG4gICAgICBjb25zdCBzaWJsaW5nVGFnID1cbiAgICAgICAgc2libGluZy5ub2RlVHlwZSA9PT0gMSA/IHRoaXMuZW5jb2RlVGFnKHNpYmxpbmcgYXMgSFRNTEVsZW1lbnQpIDogbnVsbFxuICAgICAgaWYgKHNpYmxpbmcgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGF0aFRvRWxlbWVudCA9IHRoaXMuZ2V0UGF0aFRvRWxlbWVudChlbGVtZW50LnBhcmVudEVsZW1lbnQhKVxuICAgICAgICBwYXRoVG9FbGVtZW50LnB1c2goe1xuICAgICAgICAgIHRhZyxcbiAgICAgICAgICBpbmRleDogc2libGluZ3NDb3VudCxcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHBhdGhUb0VsZW1lbnRcbiAgICAgIH0gZWxzZSBpZiAoc2libGluZ1RhZyA9PT0gdGFnKSB7XG4gICAgICAgIHNpYmxpbmdzQ291bnQrK1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWx1cmUgaW4gZ2V0UGF0aFRvRWxlbWVudCcpXG4gIH1cblxuICAvL1xuICAvLyBTZXQgdGhlIGFzc29jaWF0ZWQgZWRpdG9ycyBjdXJzb3IgYnVmZmVyIHBvc2l0aW9uIHRvIHRoZSBsaW5lIHJlcHJlc2VudGluZ1xuICAvLyB0aGUgc291cmNlIG1hcmtkb3duIG9mIGEgdGFyZ2V0IGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGFyZ2V0IGVsZW1lbnQgY29udGFpbmVkIHdpdGhpbiB0aGUgYXNzb2ljYXRlZFxuICAvLyAgIGAubWFya2Rvd24tcHJldmlld2AgY29udGFpbmVyLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0byBpZGVudGlmeSB0aGVcbiAgLy8gICBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgIGFuZCBzZXQgdGhlIGN1cnNvciB0byB0aGF0IGxpbmUuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YC4gSWYgbm9cbiAgLy8gICBsaW5lIGlzIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jU291cmNlKHRleHQ6IHN0cmluZywgZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQpXG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBkaXYubWFya2Rvd24tcHJldmlld1xuICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKSAvLyByZW1vdmUgZGl2LnVwZGF0ZS1wcmV2aWV3XG4gICAgaWYgKCFwYXRoVG9FbGVtZW50Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgdG9rZW5zID0gbWFya2Rvd25JdC5nZXRUb2tlbnModGV4dCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICBsZXQgZmluYWxUb2tlbiA9IG51bGxcbiAgICBsZXQgbGV2ZWwgPSAwXG5cbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIEFycmF5LmZyb20odG9rZW5zKSkge1xuICAgICAgaWYgKHRva2VuLmxldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5oaWRkZW4pIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi50YWcgPT09IHBhdGhUb0VsZW1lbnRbMF0udGFnICYmIHRva2VuLmxldmVsID09PSBsZXZlbCkge1xuICAgICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gMSkge1xuICAgICAgICAgIGlmIChwYXRoVG9FbGVtZW50WzBdLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICBpZiAodG9rZW4ubWFwICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KClcbiAgICAgICAgICAgIGxldmVsKytcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHRva2VuLm5lc3RpbmcgPT09IDAgJiZcbiAgICAgICAgICBbJ21hdGgnLCAnY29kZScsICdociddLmluY2x1ZGVzKHRva2VuLnRhZylcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGZpbmFsVG9rZW4gPSB0b2tlblxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGF0aFRvRWxlbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmluYWxUb2tlbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbZmluYWxUb2tlbi5tYXBbMF0sIDBdKVxuICAgICAgcmV0dXJuIGZpbmFsVG9rZW4ubWFwWzBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gRGV0ZXJtaW5lIHBhdGggdG8gYSB0YXJnZXQgdG9rZW4uXG4gIC8vXG4gIC8vIEBwYXJhbSB7KG1hcmtkb3duLWl0LlRva2VuKVtdfSB0b2tlbnMgQXJyYXkgb2YgdG9rZW5zIGFzIHJldHVybmVkIGJ5XG4gIC8vICAgYG1hcmtkb3duLWl0LnBhcnNlKClgLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBMaW5lIHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IHRva2VuLlxuICAvLyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IEFycmF5IHJlcHJlc2VudGluZyBhIHBhdGggdG8gdGhlXG4gIC8vICAgdGFyZ2V0IHRva2VuLiBUaGUgcm9vdCB0b2tlbiBpcyByZXByZXNlbnRlZCBieSB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGVcbiAgLy8gICBhcnJheSBhbmQgdGhlIHRhcmdldCB0b2tlbiBieSB0aGUgbGFzdCBlbG1lbnQuIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhXG4gIC8vICAgYHRhZ2AgYW5kIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIHRva2VucyBpblxuICAvLyAgIGB0b2tlbnNgIG9mIHRoZSBzYW1lIGB0YWdgLiBgbGluZWAgd2lsbCBsaWUgYmV0d2VlbiB0aGUgcHJvcGVydGllc1xuICAvLyAgIGBtYXBbMF1gIGFuZCBgbWFwWzFdYCBvZiB0aGUgdGFyZ2V0IHRva2VuLlxuICAvL1xuICBnZXRQYXRoVG9Ub2tlbih0b2tlbnM6IFRva2VuW10sIGxpbmU6IG51bWJlcikge1xuICAgIGxldCBwYXRoVG9Ub2tlbjogQXJyYXk8eyB0YWc6IHN0cmluZzsgaW5kZXg6IG51bWJlciB9PiA9IFtdXG4gICAgbGV0IHRva2VuVGFnQ291bnQ6IG51bWJlcltdID0gW11cbiAgICBsZXQgbGV2ZWwgPSAwXG5cbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgaWYgKHRva2VuLmxldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5oaWRkZW4pIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5uZXN0aW5nID09PSAtMSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCB0YWcgPSB0aGlzLmRlY29kZVRhZyh0b2tlbilcbiAgICAgIGlmICh0YWcgPT0gbnVsbCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgdG9rZW4udGFnID0gdGFnXG5cbiAgICAgIGlmIChcbiAgICAgICAgdG9rZW4ubWFwICE9IG51bGwgJiZcbiAgICAgICAgbGluZSA+PSB0b2tlbi5tYXBbMF0gJiZcbiAgICAgICAgbGluZSA8PSB0b2tlbi5tYXBbMV0gLSAxXG4gICAgICApIHtcbiAgICAgICAgaWYgKHRva2VuLm5lc3RpbmcgPT09IDEpIHtcbiAgICAgICAgICBwYXRoVG9Ub2tlbi5wdXNoKHtcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnLFxuICAgICAgICAgICAgaW5kZXg6XG4gICAgICAgICAgICAgIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSAhPSBudWxsID8gdG9rZW5UYWdDb3VudFt0b2tlbi50YWddIDogMCxcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRva2VuVGFnQ291bnQgPSBbXVxuICAgICAgICAgIGxldmVsKytcbiAgICAgICAgfSBlbHNlIGlmICh0b2tlbi5uZXN0aW5nID09PSAwKSB7XG4gICAgICAgICAgcGF0aFRvVG9rZW4ucHVzaCh7XG4gICAgICAgICAgICB0YWc6IHRva2VuLnRhZyxcbiAgICAgICAgICAgIGluZGV4OlxuICAgICAgICAgICAgICB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gIT0gbnVsbCA/IHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSA6IDAsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRva2VuLmxldmVsID09PSBsZXZlbCkge1xuICAgICAgICBpZiAodG9rZW5UYWdDb3VudFt0b2tlbi50YWddICE9IG51bGwpIHtcbiAgICAgICAgICB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10rK1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSA9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHBhdGhUb1Rva2VuID0gdGhpcy5idWJibGVUb0NvbnRhaW5lclRva2VuKHBhdGhUb1Rva2VuKVxuICAgIHJldHVybiBwYXRoVG9Ub2tlblxuICB9XG5cbiAgLy9cbiAgLy8gU2Nyb2xsIHRoZSBhc3NvY2lhdGVkIHByZXZpZXcgdG8gdGhlIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSB0YXJnZXQgbGluZSBvZlxuICAvLyBvZiB0aGUgc291cmNlIG1hcmtkb3duLlxuICAvL1xuICAvLyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBUYXJnZXQgbGluZSBvZiBgdGV4dGAuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvXG4gIC8vICAgaWRlbnRpZnkgdGhlIGVsbWVudCBvZiB0aGUgYXNzb2NpYXRlZCBgLm1hcmtkb3duLXByZXZpZXdgIHRoYXQgcmVwcmVzZW50c1xuICAvLyAgIGBsaW5lYCBhbmQgc2Nyb2xsIHRoZSBgLm1hcmtkb3duLXByZXZpZXdgIHRvIHRoYXQgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBlbGVtZW50IHRoYXQgcmVwcmVzZW50cyBgbGluZWAuIElmIG5vIGVsZW1lbnQgaXNcbiAgLy8gICBpZGVudGlmaWVkIGBudWxsYCBpcyByZXR1cm5lZC5cbiAgLy9cbiAgc3luY1ByZXZpZXcodGV4dDogc3RyaW5nLCBsaW5lOiBudW1iZXIpIHtcbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGNvbnN0IHBhdGhUb1Rva2VuID0gdGhpcy5nZXRQYXRoVG9Ub2tlbih0b2tlbnMsIGxpbmUpXG5cbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZmluZCgnLnVwZGF0ZS1wcmV2aWV3JykuZXEoMClcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIEFycmF5LmZyb20ocGF0aFRvVG9rZW4pKSB7XG4gICAgICBjb25zdCBjYW5kaWRhdGVFbGVtZW50ID0gZWxlbWVudC5jaGlsZHJlbih0b2tlbi50YWcpLmVxKHRva2VuLmluZGV4KVxuICAgICAgaWYgKGNhbmRpZGF0ZUVsZW1lbnQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIGVsZW1lbnQgPSBjYW5kaWRhdGVFbGVtZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbGVtZW50WzBdLmNsYXNzTGlzdC5jb250YWlucygndXBkYXRlLXByZXZpZXcnKSkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9IC8vIERvIG5vdCBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIHByZXZpZXcgZm9yIGJhZCBzeW5jc1xuXG4gICAgaWYgKCFlbGVtZW50WzBdLmNsYXNzTGlzdC5jb250YWlucygndXBkYXRlLXByZXZpZXcnKSkge1xuICAgICAgZWxlbWVudFswXS5zY3JvbGxJbnRvVmlldygpXG4gICAgfVxuICAgIGNvbnN0IG1heFNjcm9sbFRvcCA9IHRoaXMuZWxlbWVudC5zY3JvbGxIZWlnaHQgLSB0aGlzLmlubmVySGVpZ2h0KClcbiAgICBpZiAoISh0aGlzLnNjcm9sbFRvcCgpID49IG1heFNjcm9sbFRvcCkpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgLT0gdGhpcy5pbm5lckhlaWdodCgpIC8gNFxuICAgIH1cblxuICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2ZsYXNoJylcbiAgICBzZXRUaW1lb3V0KCgpID0+IGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ZsYXNoJyksIDEwMDApXG5cbiAgICByZXR1cm4gZWxlbWVudFswXVxuICB9XG59XG4iXX0=