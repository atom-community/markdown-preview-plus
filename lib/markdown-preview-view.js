"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const { Emitter, Disposable, CompositeDisposable } = require("atom");
const { $, $$$, ScrollView } = require("atom-space-pen-views");
const Grim = require("grim");
const _ = require("lodash");
const fs = require("fs-plus");
const { File } = require("atom");
const renderer = require("./renderer");
const update_preview_1 = require("./update-preview");
const markdownIt = require("./markdown-it-helper");
const imageWatcher = require("./image-watch-helper");
class MarkdownPreviewView extends ScrollView {
    static content() {
        return this.div({ class: "markdown-preview native-key-bindings", tabindex: -1 }, () => {
            return this.div({ class: "update-preview" });
        });
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
        this.renderLaTeX = atom.config.get("markdown-preview-plus.enableLatexRenderingByDefault");
        this.emitter = new Emitter();
        this.disposables = new CompositeDisposable();
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
                return this.disposables.add(atom.packages.onDidActivateInitialPackages(() => {
                    return this.subscribeToFilePath(this.filePath);
                }));
            }
        }
    }
    serialize() {
        let left;
        return {
            deserializer: "MarkdownPreviewView",
            filePath: (left = this.getPath()) != null ? left : this.filePath,
            editorId: this.editorId
        };
    }
    destroy() {
        if (imageWatcher == null) {
            imageWatcher = require("./image-watch-helper");
        }
        imageWatcher.removeFile(this.getPath());
        return this.disposables.dispose();
    }
    onDidChangeTitle(callback) {
        return this.emitter.on("did-change-title", callback);
    }
    onDidChangeModified(callback) {
        return new Disposable();
    }
    onDidChangeMarkdown(callback) {
        return this.emitter.on("did-change-markdown", callback);
    }
    subscribeToFilePath(filePath) {
        this.file = new File(filePath);
        this.emitter.emit("did-change-title");
        this.handleEvents();
        return this.renderMarkdown();
    }
    resolveEditor(editorId) {
        const resolve = () => {
            this.editor = this.editorForId(editorId);
            if (this.editor != null) {
                if (this.editor != null) {
                    this.emitter.emit("did-change-title");
                }
                this.handleEvents();
                return this.renderMarkdown();
            }
            else {
                return __guard__(atom.workspace != null ? atom.workspace.paneForItem(this) : undefined, x => x.destroyItem(this));
            }
        };
        if (atom.workspace != null) {
            return resolve();
        }
        else {
            return this.disposables.add(atom.packages.onDidActivateInitialPackages(resolve));
        }
    }
    editorForId(editorId) {
        for (let editor of Array.from(atom.workspace.getTextEditors())) {
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
            "core:move-up": () => {
                return this.scrollUp();
            },
            "core:move-down": () => {
                return this.scrollDown();
            },
            "core:save-as": event => {
                event.stopPropagation();
                return this.saveAs();
            },
            "core:copy": (event) => {
                if (this.copyToClipboard())
                    event.stopPropagation();
            },
            "markdown-preview-plus:zoom-in": () => {
                const zoomLevel = parseFloat(this.css("zoom")) || 1;
                return this.css("zoom", zoomLevel + 0.1);
            },
            "markdown-preview-plus:zoom-out": () => {
                const zoomLevel = parseFloat(this.css("zoom")) || 1;
                return this.css("zoom", zoomLevel - 0.1);
            },
            "markdown-preview-plus:reset-zoom": () => {
                return this.css("zoom", 1);
            },
            "markdown-preview-plus:sync-source": event => {
                return this.getMarkdownSource().then((source) => {
                    if (source == null) {
                        return;
                    }
                    return this.syncSource(source, event.target);
                });
            }
        });
        const changeHandler = () => {
            let left;
            this.renderMarkdown();
            const pane = (left =
                typeof atom.workspace.paneForItem === "function"
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
                if (atom.config.get("markdown-preview-plus.liveUpdate")) {
                    return changeHandler();
                }
            }));
            this.disposables.add(this.editor.onDidChangePath(() => this.emitter.emit("did-change-title")));
            this.disposables.add(this.editor.getBuffer().onDidSave(function () {
                if (!atom.config.get("markdown-preview-plus.liveUpdate")) {
                    return changeHandler();
                }
            }));
            this.disposables.add(this.editor.getBuffer().onDidReload(function () {
                if (!atom.config.get("markdown-preview-plus.liveUpdate")) {
                    return changeHandler();
                }
            }));
            this.disposables.add(atom.commands.add(atom.views.getView(this.editor), {
                "markdown-preview-plus:sync-preview": _event => {
                    return this.getMarkdownSource().then((source) => {
                        if (source == null) {
                            return;
                        }
                        return this.syncPreview(source, this.editor.getCursorBufferPosition().row);
                    });
                }
            }));
        }
        this.disposables.add(atom.config.onDidChange("markdown-preview-plus.breakOnSingleNewline", changeHandler));
        this.disposables.add(atom.commands.add("atom-workspace", {
            "markdown-preview-plus:toggle-render-latex": () => {
                if (atom.workspace.getActivePaneItem() === this ||
                    atom.workspace.getActiveTextEditor() === this.editor) {
                    this.renderLaTeX = !this.renderLaTeX;
                    changeHandler();
                }
            }
        }));
        return this.disposables.add(atom.config.observe("markdown-preview-plus.useGitHubStyle", useGitHubStyle => {
            if (useGitHubStyle) {
                return this.element.setAttribute("data-use-github-style", "");
            }
            else {
                return this.element.removeAttribute("data-use-github-style");
            }
        }));
    }
    renderMarkdown() {
        if (!this.loaded) {
            this.showLoading();
        }
        return this.getMarkdownSource().then(source => {
            if (source != null) {
                return this.renderMarkdownText(source);
            }
        });
    }
    refreshImages(oldsrc) {
        const imgs = this.element.querySelectorAll("img[src]");
        return (() => {
            const result = [];
            for (let img of Array.from(imgs)) {
                var left, ov;
                let src = img.getAttribute("src");
                const match = src.match(/^(.*)\?v=(\d+)$/);
                [src, ov] = Array.from((left = __guardMethod__(match, "slice", o => o.slice(1))) != null
                    ? left
                    : [src]);
                if (src === oldsrc) {
                    if (ov != null) {
                        ov = parseInt(ov);
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
        return this.getMarkdownSource().then(source => {
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
                if (!this.updatePreview) {
                    this.updatePreview = new update_preview_1.UpdatePreview(this.find("div.update-preview")[0]);
                }
                this.updatePreview.update(domFragment, this.renderLaTeX);
                this.emitter.emit("did-change-markdown");
                return this.originalTrigger("markdown-preview-plus:markdown-changed");
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
            return "Markdown Preview";
        }
    }
    getIconName() {
        return "markdown";
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
        const textEditorStyles = document.createElement("atom-styles");
        textEditorStyles.initialize(atom.styles);
        textEditorStyles.setAttribute("context", "atom-text-editor");
        document.body.appendChild(textEditorStyles);
        return Array.prototype.slice
            .apply(textEditorStyles.childNodes)
            .map(styleElement => styleElement.innerText);
    }
    getMarkdownPreviewCSS() {
        const markdowPreviewRules = [];
        const ruleRegExp = /\.markdown-preview/;
        const cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/;
        for (let stylesheet of Array.from(this.getDocumentStyleSheets())) {
            if (stylesheet.rules != null) {
                for (let rule of Array.from(stylesheet.rules)) {
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
            .join("\n")
            .replace(/atom-text-editor/g, "pre.editor-colors")
            .replace(/:host/g, ".host")
            .replace(cssUrlRefExp, function (match, assetsName, offset, string) {
            const assetPath = path.join(__dirname, "../assets", assetsName);
            const originalData = fs.readFileSync(assetPath, "binary");
            const base64Data = new Buffer(originalData, "binary").toString("base64");
            return `url('data:image/jpeg;base64,${base64Data}')`;
        });
    }
    showError(result) {
        const failureMessage = result != null ? result.message : undefined;
        return this.html($$$(function () {
            this.h2("Previewing Markdown Failed");
            if (failureMessage != null) {
                return this.h3(failureMessage);
            }
        }));
    }
    showLoading() {
        this.loading = true;
        return this.html($$$(function () {
            return this.div({ class: "markdown-spinner" }, "Loading Markdown\u2026");
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
                return console.warn("Copying Markdown as HTML failed", error);
            }
            else {
                return atom.clipboard.write(html);
            }
        });
        return true;
    }
    saveAs() {
        let htmlFilePath;
        if (this.loading) {
            return;
        }
        let filePath = this.getPath();
        let title = "Markdown to HTML";
        if (filePath) {
            title = path.parse(filePath).name;
            filePath += ".html";
        }
        else {
            let projectPath;
            filePath = "untitled.md.html";
            if ((projectPath = atom.project.getPaths()[0])) {
                filePath = path.join(projectPath, filePath);
            }
        }
        if ((htmlFilePath = atom.showSaveDialogSync(filePath))) {
            return this.getHTML((error, htmlBody) => {
                if (error != null) {
                    return console.warn("Saving Markdown as HTML failed", error);
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
                        mathjaxScript = "";
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
</html>` + "\n";
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
            if (parent.classList.contains("MathJax_Display")) {
                return parent.parentElement;
            }
            if (parent.classList.contains("atom-text-editor")) {
                return parent;
            }
            testElement = parent;
        }
        return element;
    }
    bubbleToContainerToken(pathToToken) {
        for (let i = 0, end = pathToToken.length - 1; i <= end; i++) {
            if (pathToToken[i].tag === "table") {
                return pathToToken.slice(0, i + 1);
            }
        }
        return pathToToken;
    }
    encodeTag(element) {
        if (element.classList.contains("math")) {
            return "math";
        }
        if (element.classList.contains("atom-text-editor")) {
            return "code";
        }
        return element.tagName.toLowerCase();
    }
    decodeTag(token) {
        if (token.tag === "math") {
            return "span";
        }
        if (token.tag === "code") {
            return "span";
        }
        if (token.tag === "") {
            return null;
        }
        return token.tag;
    }
    getPathToElement(element) {
        if (element.classList.contains("markdown-preview")) {
            return [
                {
                    tag: "div",
                    index: 0
                }
            ];
        }
        element = this.bubbleToContainerElement(element);
        const tag = this.encodeTag(element);
        const siblings = element.parentElement.children;
        let siblingsCount = 0;
        for (let sibling of Array.from(siblings)) {
            const siblingTag = sibling.nodeType === 1 ? this.encodeTag(sibling) : null;
            if (sibling === element) {
                const pathToElement = this.getPathToElement(element.parentElement);
                pathToElement.push({
                    tag,
                    index: siblingsCount
                });
                return pathToElement;
            }
            else if (siblingTag === tag) {
                siblingsCount++;
            }
        }
        throw new Error("failure in getPathToElement");
    }
    syncSource(text, element) {
        const pathToElement = this.getPathToElement(element);
        pathToElement.shift();
        pathToElement.shift();
        if (!pathToElement.length) {
            return;
        }
        if (markdownIt == null) {
            markdownIt = require("./markdown-it-helper");
        }
        const tokens = markdownIt.getTokens(text, this.renderLaTeX);
        let finalToken = null;
        let level = 0;
        for (let token of Array.from(tokens)) {
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
                    ["math", "code", "hr"].includes(token.tag)) {
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
        for (let token of tokens) {
            if (token.level < level) {
                break;
            }
            if (token.hidden) {
                continue;
            }
            if (token.nesting === -1) {
                continue;
            }
            token.tag = this.decodeTag(token);
            if (token.tag == null) {
                continue;
            }
            if (token.map != null &&
                line >= token.map[0] &&
                line <= token.map[1] - 1) {
                if (token.nesting === 1) {
                    pathToToken.push({
                        tag: token.tag,
                        index: tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0
                    });
                    tokenTagCount = [];
                    level++;
                }
                else if (token.nesting === 0) {
                    pathToToken.push({
                        tag: token.tag,
                        index: tokenTagCount[token.tag] != null ? tokenTagCount[token.tag] : 0
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
        if (markdownIt == null) {
            markdownIt = require("./markdown-it-helper");
        }
        const tokens = markdownIt.getTokens(text, this.renderLaTeX);
        const pathToToken = this.getPathToToken(tokens, line);
        let element = this.find(".update-preview").eq(0);
        for (let token of Array.from(pathToToken)) {
            const candidateElement = element.children(token.tag).eq(token.index);
            if (candidateElement.length !== 0) {
                element = candidateElement;
            }
            else {
                break;
            }
        }
        if (element[0].classList.contains("update-preview")) {
            return null;
        }
        if (!element[0].classList.contains("update-preview")) {
            element[0].scrollIntoView();
        }
        const maxScrollTop = this.element.scrollHeight - this.innerHeight();
        if (!(this.scrollTop() >= maxScrollTop)) {
            this.element.scrollTop -= this.innerHeight() / 4;
        }
        element.addClass("flash");
        setTimeout(() => element.removeClass("flash"), 1000);
        return element[0];
    }
}
exports.MarkdownPreviewView = MarkdownPreviewView;
function __guard__(value, transform) {
    return typeof value !== "undefined" && value !== null
        ? transform(value)
        : undefined;
}
function __guardMethod__(obj, methodName, transform) {
    if (typeof obj !== "undefined" &&
        obj !== null &&
        typeof obj[methodName] === "function") {
        return transform(obj, methodName);
    }
    else {
        return undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUU1QixNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNwRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM5RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDNUIsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzNCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUM3QixNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBRWhDLHVDQUF1QztBQUN2QyxxREFBZ0Q7QUFDaEQsbURBQW1EO0FBQ25ELHFEQUFxRDtBQWNyRCx5QkFBaUMsU0FBUSxVQUFVO0lBRWpELE1BQU0sQ0FBQyxPQUFPO1FBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ2IsRUFBRSxLQUFLLEVBQUUsc0NBQXNDLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQy9ELEdBQUcsRUFBRTtZQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQTtRQUM5QyxDQUFDLENBQ0YsQ0FBQTtJQUNILENBQUM7SUFFRCxZQUFZLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBYTtRQUMzQyxLQUFLLEVBQUUsQ0FBQTtRQUNQLElBQUksQ0FB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SyxXQUFXO1FBQzFCLEdBQUcsS0FBSyxJQUFJO1FBQ1osT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssVUFDN0IsQ0FBQyxDQUFDLENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUNuQyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixNQUFNLENBQUMsU0FBUyxDQUFBO0lBQ2xCLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbWFuZEV2ZW50IH0gZnJvbSBcImF0b21cIlxuaW1wb3J0IHsgVG9rZW4gfSBmcm9tIFwibWFya2Rvd24taXRcIlxuXG4vKlxuICogZGVjYWZmZWluYXRlIHN1Z2dlc3Rpb25zOlxuICogRFMxMDE6IFJlbW92ZSB1bm5lY2Vzc2FyeSB1c2Ugb2YgQXJyYXkuZnJvbVxuICogRFMxMDI6IFJlbW92ZSB1bm5lY2Vzc2FyeSBjb2RlIGNyZWF0ZWQgYmVjYXVzZSBvZiBpbXBsaWNpdCByZXR1cm5zXG4gKiBEUzEwMzogUmV3cml0ZSBjb2RlIHRvIG5vIGxvbmdlciB1c2UgX19ndWFyZF9fXG4gKiBEUzEwNDogQXZvaWQgaW5saW5lIGFzc2lnbm1lbnRzXG4gKiBEUzIwNTogQ29uc2lkZXIgcmV3b3JraW5nIGNvZGUgdG8gYXZvaWQgdXNlIG9mIElJRkVzXG4gKiBEUzIwNzogQ29uc2lkZXIgc2hvcnRlciB2YXJpYXRpb25zIG9mIG51bGwgY2hlY2tzXG4gKiBGdWxsIGRvY3M6IGh0dHBzOi8vZ2l0aHViLmNvbS9kZWNhZmZlaW5hdGUvZGVjYWZmZWluYXRlL2Jsb2IvbWFzdGVyL2RvY3Mvc3VnZ2VzdGlvbnMubWRcbiAqL1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cbmNvbnN0IHsgRW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSB9ID0gcmVxdWlyZShcImF0b21cIilcbmNvbnN0IHsgJCwgJCQkLCBTY3JvbGxWaWV3IH0gPSByZXF1aXJlKFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIilcbmNvbnN0IEdyaW0gPSByZXF1aXJlKFwiZ3JpbVwiKVxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIilcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzLXBsdXNcIilcbmNvbnN0IHsgRmlsZSB9ID0gcmVxdWlyZShcImF0b21cIilcblxuaW1wb3J0IHJlbmRlcmVyID0gcmVxdWlyZShcIi4vcmVuZGVyZXJcIilcbmltcG9ydCB7IFVwZGF0ZVByZXZpZXcgfSBmcm9tIFwiLi91cGRhdGUtcHJldmlld1wiXG5pbXBvcnQgbWFya2Rvd25JdCA9IHJlcXVpcmUoXCIuL21hcmtkb3duLWl0LWhlbHBlclwiKVxuaW1wb3J0IGltYWdlV2F0Y2hlciA9IHJlcXVpcmUoXCIuL2ltYWdlLXdhdGNoLWhlbHBlclwiKVxuXG5leHBvcnQgaW50ZXJmYWNlIE1QVlBhcmFtc0VkaXRvciB7XG4gIGVkaXRvcklkOiBudW1iZXJcbiAgZmlsZVBhdGg/OiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNUFZQYXJhbXNQYXRoIHtcbiAgZWRpdG9ySWQ/OiB1bmRlZmluZWRcbiAgZmlsZVBhdGg6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBNUFZQYXJhbXMgPSBNUFZQYXJhbXNFZGl0b3IgfCBNUFZQYXJhbXNQYXRoXG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3IGV4dGVuZHMgU2Nyb2xsVmlldyB7XG4gIHByaXZhdGUgZWxlbWVudDogSFRNTEVsZW1lbnRcbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2KFxuICAgICAgeyBjbGFzczogXCJtYXJrZG93bi1wcmV2aWV3IG5hdGl2ZS1rZXktYmluZGluZ3NcIiwgdGFiaW5kZXg6IC0xIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIC8vIElmIHlvdSBkb250IGV4cGxpY2l0bHkgZGVjbGFyZSBhIGNsYXNzIHRoZW4gdGhlIGVsZW1lbnRzIHdvbnQgYmUgY3JlYXRlZFxuICAgICAgICByZXR1cm4gdGhpcy5kaXYoeyBjbGFzczogXCJ1cGRhdGUtcHJldmlld1wiIH0pXG4gICAgICB9XG4gICAgKVxuICB9XG5cbiAgY29uc3RydWN0b3IoeyBlZGl0b3JJZCwgZmlsZVBhdGggfTogTVBWUGFyYW1zKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuZ2V0UGF0aFRvRWxlbWVudCA9IHRoaXMuZ2V0UGF0aFRvRWxlbWVudC5iaW5kKHRoaXMpXG4gICAgdGhpcy5zeW5jU291cmNlID0gdGhpcy5zeW5jU291cmNlLmJpbmQodGhpcylcbiAgICB0aGlzLmdldFBhdGhUb1Rva2VuID0gdGhpcy5nZXRQYXRoVG9Ub2tlbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5zeW5jUHJldmlldyA9IHRoaXMuc3luY1ByZXZpZXcuYmluZCh0aGlzKVxuICAgIHRoaXMuZWRpdG9ySWQgPSBlZGl0b3JJZFxuICAgIHRoaXMuZmlsZVBhdGggPSBmaWxlUGF0aFxuICAgIHRoaXMudXBkYXRlUHJldmlldyA9IG51bGxcbiAgICB0aGlzLnJlbmRlckxhVGVYID0gYXRvbS5jb25maWcuZ2V0KFxuICAgICAgXCJtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHRcIlxuICAgIClcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmxvYWRlZCA9IHRydWUgLy8gRG8gbm90IHNob3cgdGhlIGxvYWRpbmcgc3Bpbm5vciBvbiBpbml0aWFsIGxvYWRcbiAgfVxuXG4gIGF0dGFjaGVkKCkge1xuICAgIGlmICh0aGlzLmlzQXR0YWNoZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmlzQXR0YWNoZWQgPSB0cnVlXG5cbiAgICBpZiAodGhpcy5lZGl0b3JJZCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXNvbHZlRWRpdG9yKHRoaXMuZWRpdG9ySWQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChhdG9tLndvcmtzcGFjZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZVRvRmlsZVBhdGgodGhpcy5maWxlUGF0aClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVJbml0aWFsUGFja2FnZXMoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlVG9GaWxlUGF0aCh0aGlzLmZpbGVQYXRoKVxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXJpYWxpemUoKSB7XG4gICAgbGV0IGxlZnRcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiBcIk1hcmtkb3duUHJldmlld1ZpZXdcIixcbiAgICAgIGZpbGVQYXRoOiAobGVmdCA9IHRoaXMuZ2V0UGF0aCgpKSAhPSBudWxsID8gbGVmdCA6IHRoaXMuZmlsZVBhdGgsXG4gICAgICBlZGl0b3JJZDogdGhpcy5lZGl0b3JJZFxuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKGltYWdlV2F0Y2hlciA9PSBudWxsKSB7XG4gICAgICBpbWFnZVdhdGNoZXIgPSByZXF1aXJlKFwiLi9pbWFnZS13YXRjaC1oZWxwZXJcIilcbiAgICB9XG4gICAgaW1hZ2VXYXRjaGVyLnJlbW92ZUZpbGUodGhpcy5nZXRQYXRoKCkpXG4gICAgcmV0dXJuIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gIH1cblxuICBvbkRpZENoYW5nZVRpdGxlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbihcImRpZC1jaGFuZ2UtdGl0bGVcIiwgY2FsbGJhY2spXG4gIH1cblxuICBvbkRpZENoYW5nZU1vZGlmaWVkKGNhbGxiYWNrKSB7XG4gICAgLy8gTm8gb3AgdG8gc3VwcHJlc3MgZGVwcmVjYXRpb24gd2FybmluZ1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgpXG4gIH1cblxuICBvbkRpZENoYW5nZU1hcmtkb3duKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbihcImRpZC1jaGFuZ2UtbWFya2Rvd25cIiwgY2FsbGJhY2spXG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdChcImRpZC1jaGFuZ2UtdGl0bGVcIilcbiAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgcmV0dXJuIHRoaXMucmVuZGVyTWFya2Rvd24oKVxuICB9XG5cbiAgcmVzb2x2ZUVkaXRvcihlZGl0b3JJZDogbnVtYmVyKSB7XG4gICAgY29uc3QgcmVzb2x2ZSA9ICgpID0+IHtcbiAgICAgIHRoaXMuZWRpdG9yID0gdGhpcy5lZGl0b3JGb3JJZChlZGl0b3JJZClcblxuICAgICAgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdChcImRpZC1jaGFuZ2UtdGl0bGVcIilcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhbmRsZUV2ZW50cygpXG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlck1hcmtkb3duKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBlZGl0b3IgdGhpcyBwcmV2aWV3IHdhcyBjcmVhdGVkIGZvciBoYXMgYmVlbiBjbG9zZWQgc28gY2xvc2VcbiAgICAgICAgLy8gdGhpcyBwcmV2aWV3IHNpbmNlIGEgcHJldmlldyBjYW5ub3QgYmUgcmVuZGVyZWQgd2l0aG91dCBhbiBlZGl0b3JcbiAgICAgICAgcmV0dXJuIF9fZ3VhcmRfXyhcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZSAhPSBudWxsID8gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcykgOiB1bmRlZmluZWQsXG4gICAgICAgICAgeCA9PiB4LmRlc3Ryb3lJdGVtKHRoaXMpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYXRvbS53b3Jrc3BhY2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcyhyZXNvbHZlKVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGVkaXRvckZvcklkKGVkaXRvcklkOiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgQXJyYXkuZnJvbShhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpKSkge1xuICAgICAgaWYgKGVkaXRvci5pZCA9PT0gZWRpdG9ySWQpIHtcbiAgICAgICAgcmV0dXJuIGVkaXRvclxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaGFuZGxlRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIoKCkgPT5cbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB0aGlzLnJlbmRlck1hcmtkb3duKCksIDI1MClcbiAgICAgIClcbiAgICApXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmdyYW1tYXJzLm9uRGlkVXBkYXRlR3JhbW1hcihcbiAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB0aGlzLnJlbmRlck1hcmtkb3duKCksIDI1MClcbiAgICAgIClcbiAgICApXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgIFwiY29yZTptb3ZlLXVwXCI6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsVXAoKVxuICAgICAgfSxcbiAgICAgIFwiY29yZTptb3ZlLWRvd25cIjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zY3JvbGxEb3duKClcbiAgICAgIH0sXG4gICAgICBcImNvcmU6c2F2ZS1hc1wiOiBldmVudCA9PiB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIHJldHVybiB0aGlzLnNhdmVBcygpXG4gICAgICB9LFxuICAgICAgXCJjb3JlOmNvcHlcIjogKGV2ZW50OiBDb21tYW5kRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY29weVRvQ2xpcGJvYXJkKCkpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB9LFxuICAgICAgXCJtYXJrZG93bi1wcmV2aWV3LXBsdXM6em9vbS1pblwiOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHpvb21MZXZlbCA9IHBhcnNlRmxvYXQodGhpcy5jc3MoXCJ6b29tXCIpKSB8fCAxXG4gICAgICAgIHJldHVybiB0aGlzLmNzcyhcInpvb21cIiwgem9vbUxldmVsICsgMC4xKVxuICAgICAgfSxcbiAgICAgIFwibWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0XCI6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgem9vbUxldmVsID0gcGFyc2VGbG9hdCh0aGlzLmNzcyhcInpvb21cIikpIHx8IDFcbiAgICAgICAgcmV0dXJuIHRoaXMuY3NzKFwiem9vbVwiLCB6b29tTGV2ZWwgLSAwLjEpXG4gICAgICB9LFxuICAgICAgXCJtYXJrZG93bi1wcmV2aWV3LXBsdXM6cmVzZXQtem9vbVwiOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNzcyhcInpvb21cIiwgMSlcbiAgICAgIH0sXG4gICAgICBcIm1hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXNvdXJjZVwiOiBldmVudCA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKHNvdXJjZSA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc3luY1NvdXJjZShzb3VyY2UsIGV2ZW50LnRhcmdldClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29uc3QgY2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICAgIGxldCBsZWZ0XG4gICAgICB0aGlzLnJlbmRlck1hcmtkb3duKClcblxuICAgICAgLy8gVE9ETzogUmVtb3ZlIHBhbmVGb3JVUkkgY2FsbCB3aGVuIDo6cGFuZUZvckl0ZW0gaXMgcmVsZWFzZWRcbiAgICAgIGNvbnN0IHBhbmUgPVxuICAgICAgICAobGVmdCA9XG4gICAgICAgICAgdHlwZW9mIGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgID8gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgICAgICAgIDogdW5kZWZpbmVkKSAhPSBudWxsXG4gICAgICAgICAgPyBsZWZ0XG4gICAgICAgICAgOiBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKHRoaXMuZ2V0VVJJKCkpXG4gICAgICBpZiAocGFuZSAhPSBudWxsICYmIHBhbmUgIT09IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKSkge1xuICAgICAgICByZXR1cm4gcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maWxlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZShjaGFuZ2VIYW5kbGVyKSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyhmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KFwibWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGVcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgICAgdGhpcy5lZGl0b3Iub25EaWRDaGFuZ2VQYXRoKCgpID0+IHRoaXMuZW1pdHRlci5lbWl0KFwiZGlkLWNoYW5nZS10aXRsZVwiKSlcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoXCJtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZUhhbmRsZXIoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFJlbG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoIWF0b20uY29uZmlnLmdldChcIm1hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hhbmdlSGFuZGxlcigpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAgIGF0b20uY29tbWFuZHMuYWRkKGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLmVkaXRvciksIHtcbiAgICAgICAgICBcIm1hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXdcIjogX2V2ZW50ID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbigoc291cmNlPzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChzb3VyY2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnN5bmNQcmV2aWV3KFxuICAgICAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICBcIm1hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZVwiLFxuICAgICAgICBjaGFuZ2VIYW5kbGVyXG4gICAgICApXG4gICAgKVxuXG4gICAgLy8gVG9nZ2xlIExhVGVYIHJlbmRlcmluZyBpZiBmb2N1cyBpcyBvbiBwcmV2aWV3IHBhbmUgb3IgYXNzb2NpYXRlZCBlZGl0b3IuXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICAgICAgXCJtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleFwiOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSA9PT0gdGhpcyB8fFxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpID09PSB0aGlzLmVkaXRvclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCA9ICF0aGlzLnJlbmRlckxhVGVYXG4gICAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKVxuXG4gICAgcmV0dXJuIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICAgXCJtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGVcIixcbiAgICAgICAgdXNlR2l0SHViU3R5bGUgPT4ge1xuICAgICAgICAgIGlmICh1c2VHaXRIdWJTdHlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXVzZS1naXRodWItc3R5bGVcIiwgXCJcIilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLXVzZS1naXRodWItc3R5bGVcIilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApXG4gIH1cblxuICByZW5kZXJNYXJrZG93bigpIHtcbiAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICB0aGlzLnNob3dMb2FkaW5nKClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuKHNvdXJjZSA9PiB7XG4gICAgICBpZiAoc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTWFya2Rvd25UZXh0KHNvdXJjZSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmVmcmVzaEltYWdlcyhvbGRzcmM6IHN0cmluZykge1xuICAgIGNvbnN0IGltZ3MgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcImltZ1tzcmNdXCIpIGFzIE5vZGVMaXN0T2Y8XG4gICAgICBIVE1MSW1hZ2VFbGVtZW50XG4gICAgPlxuICAgIHJldHVybiAoKCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICAgIGZvciAobGV0IGltZyBvZiBBcnJheS5mcm9tKGltZ3MpKSB7XG4gICAgICAgIHZhciBsZWZ0LCBvdlxuICAgICAgICBsZXQgc3JjID0gaW1nLmdldEF0dHJpYnV0ZShcInNyY1wiKSFcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzcmMubWF0Y2goL14oLiopXFw/dj0oXFxkKykkLylcbiAgICAgICAgO1tzcmMsIG92XSA9IEFycmF5LmZyb20oXG4gICAgICAgICAgKGxlZnQgPSBfX2d1YXJkTWV0aG9kX18obWF0Y2gsIFwic2xpY2VcIiwgbyA9PiBvLnNsaWNlKDEpKSkgIT0gbnVsbFxuICAgICAgICAgICAgPyBsZWZ0XG4gICAgICAgICAgICA6IFtzcmNdXG4gICAgICAgIClcbiAgICAgICAgaWYgKHNyYyA9PT0gb2xkc3JjKSB7XG4gICAgICAgICAgaWYgKG92ICE9IG51bGwpIHtcbiAgICAgICAgICAgIG92ID0gcGFyc2VJbnQob3YpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHYgPSBpbWFnZVdhdGNoZXIuZ2V0VmVyc2lvbihzcmMsIHRoaXMuZ2V0UGF0aCgpKVxuICAgICAgICAgIGlmICh2ICE9PSBvdikge1xuICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goKGltZy5zcmMgPSBgJHtzcmN9P3Y9JHt2fWApKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goKGltZy5zcmMgPSBgJHtzcmN9YCkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHVuZGVmaW5lZClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godW5kZWZpbmVkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSkoKVxuICB9XG5cbiAgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAhPSBudWxsID8gdGhpcy5maWxlLmdldFBhdGgoKSA6IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5yZWFkKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5lZGl0b3IuZ2V0VGV4dCgpKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG4gICAgfVxuICB9XG5cbiAgZ2V0SFRNTChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmdldE1hcmtkb3duU291cmNlKCkudGhlbihzb3VyY2UgPT4ge1xuICAgICAgaWYgKHNvdXJjZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVuZGVyZXIudG9IVE1MKFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIHRoaXMuZ2V0UGF0aCgpLFxuICAgICAgICB0aGlzLmdldEdyYW1tYXIoKSxcbiAgICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGNhbGxiYWNrXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIHJlbmRlck1hcmtkb3duVGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gcmVuZGVyZXIudG9ET01GcmFnbWVudChcbiAgICAgIHRleHQsXG4gICAgICB0aGlzLmdldFBhdGgoKSxcbiAgICAgIHRoaXMuZ2V0R3JhbW1hcigpLFxuICAgICAgdGhpcy5yZW5kZXJMYVRlWCxcbiAgICAgIChlcnJvciwgZG9tRnJhZ21lbnQpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2hvd0Vycm9yKGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgLy8gZGl2LnVwZGF0ZS1wcmV2aWV3IGNyZWF0ZWQgYWZ0ZXIgY29uc3RydWN0b3Igc3QgVXBkYXRlUHJldmlldyBjYW5ub3RcbiAgICAgICAgICAvLyBiZSBpbnN0YW5jZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgICAgaWYgKCF0aGlzLnVwZGF0ZVByZXZpZXcpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyA9IG5ldyBVcGRhdGVQcmV2aWV3KFxuICAgICAgICAgICAgICB0aGlzLmZpbmQoXCJkaXYudXBkYXRlLXByZXZpZXdcIilbMF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3LnVwZGF0ZShkb21GcmFnbWVudCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdChcImRpZC1jaGFuZ2UtbWFya2Rvd25cIilcbiAgICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW5hbFRyaWdnZXIoXCJtYXJrZG93bi1wcmV2aWV3LXBsdXM6bWFya2Rvd24tY2hhbmdlZFwiKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKVxuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgaWYgKHRoaXMuZmlsZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gYCR7cGF0aC5iYXNlbmFtZSh0aGlzLmdldFBhdGgoKSl9IFByZXZpZXdgXG4gICAgfSBlbHNlIGlmICh0aGlzLmVkaXRvciAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5lZGl0b3IuZ2V0VGl0bGUoKX0gUHJldmlld2BcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiTWFya2Rvd24gUHJldmlld1wiXG4gICAgfVxuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuIFwibWFya2Rvd25cIlxuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIGlmICh0aGlzLmZpbGUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly8ke3RoaXMuZ2V0UGF0aCgpfWBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9lZGl0b3IvJHt0aGlzLmVkaXRvcklkfWBcbiAgICB9XG4gIH1cblxuICBnZXRQYXRoKCkge1xuICAgIGlmICh0aGlzLmZpbGUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRQYXRoKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRQYXRoKClcbiAgICB9XG4gIH1cblxuICBnZXRHcmFtbWFyKCkge1xuICAgIHJldHVybiB0aGlzLmVkaXRvciAhPSBudWxsID8gdGhpcy5lZGl0b3IuZ2V0R3JhbW1hcigpIDogdW5kZWZpbmVkXG4gIH1cblxuICBnZXREb2N1bWVudFN0eWxlU2hlZXRzKCkge1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gZXhpc3RzIHNvIHdlIGNhbiBzdHViIGl0XG4gICAgcmV0dXJuIGRvY3VtZW50LnN0eWxlU2hlZXRzXG4gIH1cblxuICBnZXRUZXh0RWRpdG9yU3R5bGVzKCkge1xuICAgIGNvbnN0IHRleHRFZGl0b3JTdHlsZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXRvbS1zdHlsZXNcIilcbiAgICB0ZXh0RWRpdG9yU3R5bGVzLmluaXRpYWxpemUoYXRvbS5zdHlsZXMpXG4gICAgdGV4dEVkaXRvclN0eWxlcy5zZXRBdHRyaWJ1dGUoXCJjb250ZXh0XCIsIFwiYXRvbS10ZXh0LWVkaXRvclwiKVxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGV4dEVkaXRvclN0eWxlcylcblxuICAgIC8vIEV4dHJhY3Qgc3R5bGUgZWxlbWVudHMgY29udGVudFxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2VcbiAgICAgIC5hcHBseSh0ZXh0RWRpdG9yU3R5bGVzLmNoaWxkTm9kZXMpXG4gICAgICAubWFwKHN0eWxlRWxlbWVudCA9PiBzdHlsZUVsZW1lbnQuaW5uZXJUZXh0KVxuICB9XG5cbiAgZ2V0TWFya2Rvd25QcmV2aWV3Q1NTKCkge1xuICAgIGNvbnN0IG1hcmtkb3dQcmV2aWV3UnVsZXMgPSBbXVxuICAgIGNvbnN0IHJ1bGVSZWdFeHAgPSAvXFwubWFya2Rvd24tcHJldmlldy9cbiAgICBjb25zdCBjc3NVcmxSZWZFeHAgPSAvdXJsXFwoYXRvbTpcXC9cXC9tYXJrZG93bi1wcmV2aWV3LXBsdXNcXC9hc3NldHNcXC8oLiopXFwpL1xuXG4gICAgZm9yIChsZXQgc3R5bGVzaGVldCBvZiBBcnJheS5mcm9tKHRoaXMuZ2V0RG9jdW1lbnRTdHlsZVNoZWV0cygpKSkge1xuICAgICAgaWYgKHN0eWxlc2hlZXQucnVsZXMgIT0gbnVsbCkge1xuICAgICAgICBmb3IgKGxldCBydWxlIG9mIEFycmF5LmZyb20oc3R5bGVzaGVldC5ydWxlcykpIHtcbiAgICAgICAgICAvLyBXZSBvbmx5IG5lZWQgYC5tYXJrZG93bi1yZXZpZXdgIGNzc1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIChydWxlLnNlbGVjdG9yVGV4dCAhPSBudWxsXG4gICAgICAgICAgICAgID8gcnVsZS5zZWxlY3RvclRleHQubWF0Y2gocnVsZVJlZ0V4cClcbiAgICAgICAgICAgICAgOiB1bmRlZmluZWQpICE9IG51bGxcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIG1hcmtkb3dQcmV2aWV3UnVsZXMucHVzaChydWxlLmNzc1RleHQpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmtkb3dQcmV2aWV3UnVsZXNcbiAgICAgIC5jb25jYXQodGhpcy5nZXRUZXh0RWRpdG9yU3R5bGVzKCkpXG4gICAgICAuam9pbihcIlxcblwiKVxuICAgICAgLnJlcGxhY2UoL2F0b20tdGV4dC1lZGl0b3IvZywgXCJwcmUuZWRpdG9yLWNvbG9yc1wiKVxuICAgICAgLnJlcGxhY2UoLzpob3N0L2csIFwiLmhvc3RcIikgLy8gUmVtb3ZlIHNoYWRvdy1kb20gOmhvc3Qgc2VsZWN0b3IgY2F1c2luZyBwcm9ibGVtIG9uIEZGXG4gICAgICAucmVwbGFjZShjc3NVcmxSZWZFeHAsIGZ1bmN0aW9uKG1hdGNoLCBhc3NldHNOYW1lLCBvZmZzZXQsIHN0cmluZykge1xuICAgICAgICAvLyBiYXNlNjQgZW5jb2RlIGFzc2V0c1xuICAgICAgICBjb25zdCBhc3NldFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uL2Fzc2V0c1wiLCBhc3NldHNOYW1lKVxuICAgICAgICBjb25zdCBvcmlnaW5hbERhdGEgPSBmcy5yZWFkRmlsZVN5bmMoYXNzZXRQYXRoLCBcImJpbmFyeVwiKVxuICAgICAgICBjb25zdCBiYXNlNjREYXRhID0gbmV3IEJ1ZmZlcihvcmlnaW5hbERhdGEsIFwiYmluYXJ5XCIpLnRvU3RyaW5nKFwiYmFzZTY0XCIpXG4gICAgICAgIHJldHVybiBgdXJsKCdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCR7YmFzZTY0RGF0YX0nKWBcbiAgICAgIH0pXG4gIH1cblxuICBzaG93RXJyb3IocmVzdWx0KSB7XG4gICAgY29uc3QgZmFpbHVyZU1lc3NhZ2UgPSByZXN1bHQgIT0gbnVsbCA/IHJlc3VsdC5tZXNzYWdlIDogdW5kZWZpbmVkXG5cbiAgICByZXR1cm4gdGhpcy5odG1sKFxuICAgICAgJCQkKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmgyKFwiUHJldmlld2luZyBNYXJrZG93biBGYWlsZWRcIilcbiAgICAgICAgaWYgKGZhaWx1cmVNZXNzYWdlICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5oMyhmYWlsdXJlTWVzc2FnZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApXG4gIH1cblxuICBzaG93TG9hZGluZygpIHtcbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlXG4gICAgcmV0dXJuIHRoaXMuaHRtbChcbiAgICAgICQkJChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGl2KHsgY2xhc3M6IFwibWFya2Rvd24tc3Bpbm5lclwiIH0sIFwiTG9hZGluZyBNYXJrZG93blxcdTIwMjZcIilcbiAgICAgIH0pXG4gICAgKVxuICB9XG5cbiAgY29weVRvQ2xpcGJvYXJkKCkge1xuICAgIGlmICh0aGlzLmxvYWRpbmcpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKVxuICAgIGNvbnN0IHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gc2VsZWN0aW9uLmJhc2VOb2RlXG5cbiAgICAvLyBVc2UgZGVmYXVsdCBjb3B5IGV2ZW50IGhhbmRsZXIgaWYgdGhlcmUgaXMgc2VsZWN0ZWQgdGV4dCBpbnNpZGUgdGhpcyB2aWV3XG4gICAgaWYgKFxuICAgICAgc2VsZWN0ZWRUZXh0ICYmXG4gICAgICBzZWxlY3RlZE5vZGUgIT0gbnVsbCAmJlxuICAgICAgKHRoaXNbMF0gPT09IHNlbGVjdGVkTm9kZSB8fCAkLmNvbnRhaW5zKHRoaXNbMF0sIHNlbGVjdGVkTm9kZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLmdldEhUTUwoZnVuY3Rpb24oZXJyb3IsIGh0bWwpIHtcbiAgICAgIGlmIChlcnJvciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oXCJDb3B5aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkXCIsIGVycm9yKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGF0b20uY2xpcGJvYXJkLndyaXRlKGh0bWwpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBzYXZlQXMoKSB7XG4gICAgbGV0IGh0bWxGaWxlUGF0aFxuICAgIGlmICh0aGlzLmxvYWRpbmcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCBmaWxlUGF0aCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgbGV0IHRpdGxlID0gXCJNYXJrZG93biB0byBIVE1MXCJcbiAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgIHRpdGxlID0gcGF0aC5wYXJzZShmaWxlUGF0aCkubmFtZVxuICAgICAgZmlsZVBhdGggKz0gXCIuaHRtbFwiXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwcm9qZWN0UGF0aFxuICAgICAgZmlsZVBhdGggPSBcInVudGl0bGVkLm1kLmh0bWxcIlxuICAgICAgaWYgKChwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdKSkge1xuICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgZmlsZVBhdGgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKChodG1sRmlsZVBhdGggPSBhdG9tLnNob3dTYXZlRGlhbG9nU3luYyhmaWxlUGF0aCkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRIVE1MKChlcnJvciwgaHRtbEJvZHkpID0+IHtcbiAgICAgICAgaWYgKGVycm9yICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS53YXJuKFwiU2F2aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkXCIsIGVycm9yKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBtYXRoamF4U2NyaXB0XG4gICAgICAgICAgaWYgKHRoaXMucmVuZGVyTGFUZVgpIHtcbiAgICAgICAgICAgIG1hdGhqYXhTY3JpcHQgPSBgXFxcblxuPHNjcmlwdCB0eXBlPVwidGV4dC94LW1hdGhqYXgtY29uZmlnXCI+XG4gIE1hdGhKYXguSHViLkNvbmZpZyh7XG4gICAgamF4OiBbXCJpbnB1dC9UZVhcIixcIm91dHB1dC9IVE1MLUNTU1wiXSxcbiAgICBleHRlbnNpb25zOiBbXSxcbiAgICBUZVg6IHtcbiAgICAgIGV4dGVuc2lvbnM6IFtcIkFNU21hdGguanNcIixcIkFNU3N5bWJvbHMuanNcIixcIm5vRXJyb3JzLmpzXCIsXCJub1VuZGVmaW5lZC5qc1wiXVxuICAgIH0sXG4gICAgc2hvd01hdGhNZW51OiBmYWxzZVxuICB9KTtcbjwvc2NyaXB0PlxuPHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCIgc3JjPVwiaHR0cHM6Ly9jZG4ubWF0aGpheC5vcmcvbWF0aGpheC9sYXRlc3QvTWF0aEpheC5qc1wiPlxuPC9zY3JpcHQ+XFxcbmBcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWF0aGpheFNjcmlwdCA9IFwiXCJcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaHRtbCA9XG4gICAgICAgICAgICBgXFxcbjwhRE9DVFlQRSBodG1sPlxuPGh0bWw+XG4gIDxoZWFkPlxuICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCIgLz5cbiAgICAgIDx0aXRsZT4ke3RpdGxlfTwvdGl0bGU+JHttYXRoamF4U2NyaXB0fVxuICAgICAgPHN0eWxlPiR7dGhpcy5nZXRNYXJrZG93blByZXZpZXdDU1MoKX08L3N0eWxlPlxuICA8L2hlYWQ+XG4gIDxib2R5IGNsYXNzPSdtYXJrZG93bi1wcmV2aWV3Jz4ke2h0bWxCb2R5fTwvYm9keT5cbjwvaHRtbD5gICsgXCJcXG5cIiAvLyBFbnN1cmUgdHJhaWxpbmcgbmV3bGluZVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhodG1sRmlsZVBhdGgsIGh0bWwpXG4gICAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oaHRtbEZpbGVQYXRoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlzRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpc1swXSA9PT0gKG90aGVyICE9IG51bGwgPyBvdGhlclswXSA6IHVuZGVmaW5lZCkgLy8gQ29tcGFyZSBET00gZWxlbWVudHNcbiAgfVxuXG4gIC8vXG4gIC8vIEZpbmQgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igb2YgYW4gZWxlbWVudCB0aGF0IGlzIG5vdCBhIGRlY2VuZGFudCBvZiBlaXRoZXJcbiAgLy8gYHNwYW4ubWF0aGAgb3IgYHNwYW4uYXRvbS10ZXh0LWVkaXRvcmAuXG4gIC8vXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgZnJvbSB3aGljaCB0aGUgc2VhcmNoIGZvciBhXG4gIC8vICAgY2xvc2VzdCBhbmNlc3RvciBiZWdpbnMuXG4gIC8vIEByZXR1cm4ge0hUTUxFbGVtZW50fSBUaGUgY2xvc2VzdCBhbmNlc3RvciB0byBgZWxlbWVudGAgdGhhdCBkb2VzIG5vdFxuICAvLyAgIGNvbnRhaW4gZWl0aGVyIGBzcGFuLm1hdGhgIG9yIGBzcGFuLmF0b20tdGV4dC1lZGl0b3JgLlxuICAvL1xuICBidWJibGVUb0NvbnRhaW5lckVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBIVE1MRWxlbWVudCB7XG4gICAgbGV0IHRlc3RFbGVtZW50ID0gZWxlbWVudFxuICAgIHdoaWxlICh0ZXN0RWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgY29uc3QgcGFyZW50ID0gdGVzdEVsZW1lbnQucGFyZW50RWxlbWVudCFcbiAgICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiTWF0aEpheF9EaXNwbGF5XCIpKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQucGFyZW50RWxlbWVudCFcbiAgICAgIH1cbiAgICAgIGlmIChwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYXRvbS10ZXh0LWVkaXRvclwiKSkge1xuICAgICAgICByZXR1cm4gcGFyZW50XG4gICAgICB9XG4gICAgICB0ZXN0RWxlbWVudCA9IHBhcmVudFxuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgLy9cbiAgLy8gRGV0ZXJtaW5lIGEgc3Vic2VxdWVuY2Ugb2YgYSBzZXF1ZW5jZSBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGEgcGF0aCB0aHJvdWdoXG4gIC8vIEhUTUxFbGVtZW50cyB0aGF0IGRvZXMgbm90IGNvbnRpbnVlIGRlZXBlciB0aGFuIGEgdGFibGUgZWxlbWVudC5cbiAgLy9cbiAgLy8gQHBhcmFtIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IHBhdGhUb1Rva2VuIEFycmF5IG9mIHRva2Vuc1xuICAvLyAgIHJlcHJlc2VudGluZyBhIHBhdGggdG8gYSBIVE1MRWxlbWVudCB3aXRoIHRoZSByb290IGVsZW1lbnQgYXRcbiAgLy8gICBwYXRoVG9Ub2tlblswXSBhbmQgdGhlIHRhcmdldCBlbGVtZW50IGF0IHRoZSBoaWdoZXN0IGluZGV4LiBFYWNoIGVsZW1lbnRcbiAgLy8gICBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHNcbiAgLy8gICBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lIGB0YWdgLlxuICAvLyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IFRoZSBzdWJzZXF1ZW5jZSBvZiBwYXRoVG9Ub2tlbiB0aGF0XG4gIC8vICAgbWFpbnRhaW5zIHRoZSBzYW1lIHJvb3QgYnV0IHRlcm1pbmF0ZXMgYXQgYSB0YWJsZSBlbGVtZW50IG9yIHRoZSB0YXJnZXRcbiAgLy8gICBlbGVtZW50LCB3aGljaGV2ZXIgY29tZXMgZmlyc3QuXG4gIC8vXG4gIGJ1YmJsZVRvQ29udGFpbmVyVG9rZW4ocGF0aFRvVG9rZW46IEFycmF5PHsgdGFnOiBzdHJpbmc7IGluZGV4OiBudW1iZXIgfT4pIHtcbiAgICBmb3IgKGxldCBpID0gMCwgZW5kID0gcGF0aFRvVG9rZW4ubGVuZ3RoIC0gMTsgaSA8PSBlbmQ7IGkrKykge1xuICAgICAgaWYgKHBhdGhUb1Rva2VuW2ldLnRhZyA9PT0gXCJ0YWJsZVwiKSB7XG4gICAgICAgIHJldHVybiBwYXRoVG9Ub2tlbi5zbGljZSgwLCBpICsgMSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG4gIH1cblxuICAvL1xuICAvLyBFbmNvZGUgdGFncyBmb3IgbWFya2Rvd24taXQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgRW5jb2RlIHRoZSB0YWcgb2YgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7c3RyaW5nfSBFbmNvZGVkIHRhZy5cbiAgLy9cbiAgZW5jb2RlVGFnKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtYXRoXCIpKSB7XG4gICAgICByZXR1cm4gXCJtYXRoXCJcbiAgICB9XG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYXRvbS10ZXh0LWVkaXRvclwiKSkge1xuICAgICAgcmV0dXJuIFwiY29kZVwiXG4gICAgfSAvLyBvbmx5IHRva2VuLnR5cGUgaXMgYGZlbmNlYCBjb2RlIGJsb2NrcyBzaG91bGQgZXZlciBiZSBmb3VuZCBpbiB0aGUgZmlyc3QgbGV2ZWwgb2YgdGhlIHRva2VucyBhcnJheVxuICAgIHJldHVybiBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgLy9cbiAgLy8gRGVjb2RlIHRhZ3MgdXNlZCBieSBtYXJrZG93bi1pdFxuICAvL1xuICAvLyBAcGFyYW0ge21hcmtkb3duLWl0LlRva2VufSB0b2tlbiBEZWNvZGUgdGhlIHRhZyBvZiB0b2tlbi5cbiAgLy8gQHJldHVybiB7c3RyaW5nfG51bGx9IERlY29kZWQgdGFnIG9yIGBudWxsYCBpZiB0aGUgdG9rZW4gaGFzIG5vIHRhZy5cbiAgLy9cbiAgZGVjb2RlVGFnKHRva2VuOiBUb2tlbik6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICh0b2tlbi50YWcgPT09IFwibWF0aFwiKSB7XG4gICAgICByZXR1cm4gXCJzcGFuXCJcbiAgICB9XG4gICAgaWYgKHRva2VuLnRhZyA9PT0gXCJjb2RlXCIpIHtcbiAgICAgIHJldHVybiBcInNwYW5cIlxuICAgIH1cbiAgICBpZiAodG9rZW4udGFnID09PSBcIlwiKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICByZXR1cm4gdG9rZW4udGFnXG4gIH1cblxuICAvL1xuICAvLyBEZXRlcm1pbmUgcGF0aCB0byBhIHRhcmdldCBlbGVtZW50IGZyb20gYSBjb250YWluZXIgYC5tYXJrZG93bi1wcmV2aWV3YC5cbiAgLy9cbiAgLy8gQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgSFRNTEVsZW1lbnQuXG4gIC8vIEByZXR1cm4geyh0YWc6IDx0YWc+LCBpbmRleDogPGluZGV4PilbXX0gQXJyYXkgb2YgdG9rZW5zIHJlcHJlc2VudGluZyBhIHBhdGhcbiAgLy8gICB0byBgZWxlbWVudGAgZnJvbSBgLm1hcmtkb3duLXByZXZpZXdgLiBUaGUgcm9vdCBgLm1hcmtkb3duLXByZXZpZXdgXG4gIC8vICAgZWxlbWVudCBpcyB0aGUgZmlyc3QgZWxlbWVudHMgaW4gdGhlIGFycmF5IGFuZCB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgLy8gICBgZWxlbWVudGAgYXQgdGhlIGhpZ2hlc3QgaW5kZXguIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZFxuICAvLyAgIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lXG4gIC8vICAgYHRhZ2AuXG4gIC8vXG4gIGdldFBhdGhUb0VsZW1lbnQoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnRcbiAgKTogQXJyYXk8eyB0YWc6IHN0cmluZzsgaW5kZXg6IG51bWJlciB9PiB7XG4gICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWFya2Rvd24tcHJldmlld1wiKSkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgIHRhZzogXCJkaXZcIixcbiAgICAgICAgICBpbmRleDogMFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuXG4gICAgZWxlbWVudCA9IHRoaXMuYnViYmxlVG9Db250YWluZXJFbGVtZW50KGVsZW1lbnQpXG4gICAgY29uc3QgdGFnID0gdGhpcy5lbmNvZGVUYWcoZWxlbWVudClcbiAgICBjb25zdCBzaWJsaW5ncyA9IGVsZW1lbnQucGFyZW50RWxlbWVudCEuY2hpbGRyZW5cbiAgICBsZXQgc2libGluZ3NDb3VudCA9IDBcblxuICAgIGZvciAobGV0IHNpYmxpbmcgb2YgQXJyYXkuZnJvbShzaWJsaW5ncykpIHtcbiAgICAgIGNvbnN0IHNpYmxpbmdUYWcgPVxuICAgICAgICBzaWJsaW5nLm5vZGVUeXBlID09PSAxID8gdGhpcy5lbmNvZGVUYWcoc2libGluZyBhcyBIVE1MRWxlbWVudCkgOiBudWxsXG4gICAgICBpZiAoc2libGluZyA9PT0gZWxlbWVudCkge1xuICAgICAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQucGFyZW50RWxlbWVudCEpXG4gICAgICAgIHBhdGhUb0VsZW1lbnQucHVzaCh7XG4gICAgICAgICAgdGFnLFxuICAgICAgICAgIGluZGV4OiBzaWJsaW5nc0NvdW50XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBwYXRoVG9FbGVtZW50XG4gICAgICB9IGVsc2UgaWYgKHNpYmxpbmdUYWcgPT09IHRhZykge1xuICAgICAgICBzaWJsaW5nc0NvdW50KytcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiZmFpbHVyZSBpbiBnZXRQYXRoVG9FbGVtZW50XCIpXG4gIH1cblxuICAvL1xuICAvLyBTZXQgdGhlIGFzc29jaWF0ZWQgZWRpdG9ycyBjdXJzb3IgYnVmZmVyIHBvc2l0aW9uIHRvIHRoZSBsaW5lIHJlcHJlc2VudGluZ1xuICAvLyB0aGUgc291cmNlIG1hcmtkb3duIG9mIGEgdGFyZ2V0IGVsZW1lbnQuXG4gIC8vXG4gIC8vIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFNvdXJjZSBtYXJrZG93biBvZiB0aGUgYXNzb2NpYXRlZCBlZGl0b3IuXG4gIC8vIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGFyZ2V0IGVsZW1lbnQgY29udGFpbmVkIHdpdGhpbiB0aGUgYXNzb2ljYXRlZFxuICAvLyAgIGAubWFya2Rvd24tcHJldmlld2AgY29udGFpbmVyLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0byBpZGVudGlmeSB0aGVcbiAgLy8gICBsaW5lIG9mIGB0ZXh0YCB0aGF0IHJlcHJlc2VudHMgYGVsZW1lbnRgIGFuZCBzZXQgdGhlIGN1cnNvciB0byB0aGF0IGxpbmUuXG4gIC8vIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YC4gSWYgbm9cbiAgLy8gICBsaW5lIGlzIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAvL1xuICBzeW5jU291cmNlKHRleHQsIGVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXRoVG9FbGVtZW50ID0gdGhpcy5nZXRQYXRoVG9FbGVtZW50KGVsZW1lbnQpXG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpIC8vIHJlbW92ZSBkaXYubWFya2Rvd24tcHJldmlld1xuICAgIHBhdGhUb0VsZW1lbnQuc2hpZnQoKSAvLyByZW1vdmUgZGl2LnVwZGF0ZS1wcmV2aWV3XG4gICAgaWYgKCFwYXRoVG9FbGVtZW50Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKG1hcmtkb3duSXQgPT0gbnVsbCkge1xuICAgICAgbWFya2Rvd25JdCA9IHJlcXVpcmUoXCIuL21hcmtkb3duLWl0LWhlbHBlclwiKVxuICAgIH1cbiAgICBjb25zdCB0b2tlbnMgPSBtYXJrZG93bkl0LmdldFRva2Vucyh0ZXh0LCB0aGlzLnJlbmRlckxhVGVYKVxuICAgIGxldCBmaW5hbFRva2VuID0gbnVsbFxuICAgIGxldCBsZXZlbCA9IDBcblxuICAgIGZvciAobGV0IHRva2VuIG9mIEFycmF5LmZyb20odG9rZW5zKSkge1xuICAgICAgaWYgKHRva2VuLmxldmVsIDwgbGV2ZWwpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi5oaWRkZW4pIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbi50YWcgPT09IHBhdGhUb0VsZW1lbnRbMF0udGFnICYmIHRva2VuLmxldmVsID09PSBsZXZlbCkge1xuICAgICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gMSkge1xuICAgICAgICAgIGlmIChwYXRoVG9FbGVtZW50WzBdLmluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICBpZiAodG9rZW4ubWFwICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KClcbiAgICAgICAgICAgIGxldmVsKytcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIHRva2VuLm5lc3RpbmcgPT09IDAgJiZcbiAgICAgICAgICBbXCJtYXRoXCIsIFwiY29kZVwiLCBcImhyXCJdLmluY2x1ZGVzKHRva2VuLnRhZylcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIGZpbmFsVG9rZW4gPSB0b2tlblxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGF0aFRvRWxlbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmluYWxUb2tlbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbZmluYWxUb2tlbi5tYXBbMF0sIDBdKVxuICAgICAgcmV0dXJuIGZpbmFsVG9rZW4ubWFwWzBdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gRGV0ZXJtaW5lIHBhdGggdG8gYSB0YXJnZXQgdG9rZW4uXG4gIC8vXG4gIC8vIEBwYXJhbSB7KG1hcmtkb3duLWl0LlRva2VuKVtdfSB0b2tlbnMgQXJyYXkgb2YgdG9rZW5zIGFzIHJldHVybmVkIGJ5XG4gIC8vICAgYG1hcmtkb3duLWl0LnBhcnNlKClgLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBMaW5lIHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IHRva2VuLlxuICAvLyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IEFycmF5IHJlcHJlc2VudGluZyBhIHBhdGggdG8gdGhlXG4gIC8vICAgdGFyZ2V0IHRva2VuLiBUaGUgcm9vdCB0b2tlbiBpcyByZXByZXNlbnRlZCBieSB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGVcbiAgLy8gICBhcnJheSBhbmQgdGhlIHRhcmdldCB0b2tlbiBieSB0aGUgbGFzdCBlbG1lbnQuIEVhY2ggZWxlbWVudCBjb25zaXN0cyBvZiBhXG4gIC8vICAgYHRhZ2AgYW5kIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIHRva2VucyBpblxuICAvLyAgIGB0b2tlbnNgIG9mIHRoZSBzYW1lIGB0YWdgLiBgbGluZWAgd2lsbCBsaWUgYmV0d2VlbiB0aGUgcHJvcGVydGllc1xuICAvLyAgIGBtYXBbMF1gIGFuZCBgbWFwWzFdYCBvZiB0aGUgdGFyZ2V0IHRva2VuLlxuICAvL1xuICBnZXRQYXRoVG9Ub2tlbih0b2tlbnM6IFRva2VuW10sIGxpbmU6IG51bWJlcikge1xuICAgIGxldCBwYXRoVG9Ub2tlbjogQXJyYXk8eyB0YWc6IHN0cmluZzsgaW5kZXg6IG51bWJlciB9PiA9IFtdXG4gICAgbGV0IHRva2VuVGFnQ291bnQ6IG51bWJlcltdID0gW11cbiAgICBsZXQgbGV2ZWwgPSAwXG5cbiAgICBmb3IgKGxldCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgIGlmICh0b2tlbi5sZXZlbCA8IGxldmVsKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4uaGlkZGVuKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gLTEpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgdG9rZW4udGFnID0gdGhpcy5kZWNvZGVUYWcodG9rZW4pXG4gICAgICBpZiAodG9rZW4udGFnID09IG51bGwpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICB0b2tlbi5tYXAgIT0gbnVsbCAmJlxuICAgICAgICBsaW5lID49IHRva2VuLm1hcFswXSAmJlxuICAgICAgICBsaW5lIDw9IHRva2VuLm1hcFsxXSAtIDFcbiAgICAgICkge1xuICAgICAgICBpZiAodG9rZW4ubmVzdGluZyA9PT0gMSkge1xuICAgICAgICAgIHBhdGhUb1Rva2VuLnB1c2goe1xuICAgICAgICAgICAgdGFnOiB0b2tlbi50YWcsXG4gICAgICAgICAgICBpbmRleDpcbiAgICAgICAgICAgICAgdG9rZW5UYWdDb3VudFt0b2tlbi50YWddICE9IG51bGwgPyB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gOiAwXG4gICAgICAgICAgfSlcbiAgICAgICAgICB0b2tlblRhZ0NvdW50ID0gW11cbiAgICAgICAgICBsZXZlbCsrXG4gICAgICAgIH0gZWxzZSBpZiAodG9rZW4ubmVzdGluZyA9PT0gMCkge1xuICAgICAgICAgIHBhdGhUb1Rva2VuLnB1c2goe1xuICAgICAgICAgICAgdGFnOiB0b2tlbi50YWcsXG4gICAgICAgICAgICBpbmRleDpcbiAgICAgICAgICAgICAgdG9rZW5UYWdDb3VudFt0b2tlbi50YWddICE9IG51bGwgPyB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gOiAwXG4gICAgICAgICAgfSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRva2VuLmxldmVsID09PSBsZXZlbCkge1xuICAgICAgICBpZiAodG9rZW5UYWdDb3VudFt0b2tlbi50YWddICE9IG51bGwpIHtcbiAgICAgICAgICB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10rK1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSA9IDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHBhdGhUb1Rva2VuID0gdGhpcy5idWJibGVUb0NvbnRhaW5lclRva2VuKHBhdGhUb1Rva2VuKVxuICAgIHJldHVybiBwYXRoVG9Ub2tlblxuICB9XG5cbiAgLy9cbiAgLy8gU2Nyb2xsIHRoZSBhc3NvY2lhdGVkIHByZXZpZXcgdG8gdGhlIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSB0YXJnZXQgbGluZSBvZlxuICAvLyBvZiB0aGUgc291cmNlIG1hcmtkb3duLlxuICAvL1xuICAvLyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAvLyBAcGFyYW0ge251bWJlcn0gbGluZSBUYXJnZXQgbGluZSBvZiBgdGV4dGAuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvXG4gIC8vICAgaWRlbnRpZnkgdGhlIGVsbWVudCBvZiB0aGUgYXNzb2NpYXRlZCBgLm1hcmtkb3duLXByZXZpZXdgIHRoYXQgcmVwcmVzZW50c1xuICAvLyAgIGBsaW5lYCBhbmQgc2Nyb2xsIHRoZSBgLm1hcmtkb3duLXByZXZpZXdgIHRvIHRoYXQgZWxlbWVudC5cbiAgLy8gQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBlbGVtZW50IHRoYXQgcmVwcmVzZW50cyBgbGluZWAuIElmIG5vIGVsZW1lbnQgaXNcbiAgLy8gICBpZGVudGlmaWVkIGBudWxsYCBpcyByZXR1cm5lZC5cbiAgLy9cbiAgc3luY1ByZXZpZXcodGV4dCwgbGluZSkge1xuICAgIGlmIChtYXJrZG93bkl0ID09IG51bGwpIHtcbiAgICAgIG1hcmtkb3duSXQgPSByZXF1aXJlKFwiLi9tYXJrZG93bi1pdC1oZWxwZXJcIilcbiAgICB9XG4gICAgY29uc3QgdG9rZW5zID0gbWFya2Rvd25JdC5nZXRUb2tlbnModGV4dCwgdGhpcy5yZW5kZXJMYVRlWClcbiAgICBjb25zdCBwYXRoVG9Ub2tlbiA9IHRoaXMuZ2V0UGF0aFRvVG9rZW4odG9rZW5zLCBsaW5lKVxuXG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmZpbmQoXCIudXBkYXRlLXByZXZpZXdcIikuZXEoMClcbiAgICBmb3IgKGxldCB0b2tlbiBvZiBBcnJheS5mcm9tKHBhdGhUb1Rva2VuKSkge1xuICAgICAgY29uc3QgY2FuZGlkYXRlRWxlbWVudCA9IGVsZW1lbnQuY2hpbGRyZW4odG9rZW4udGFnKS5lcSh0b2tlbi5pbmRleClcbiAgICAgIGlmIChjYW5kaWRhdGVFbGVtZW50Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBlbGVtZW50ID0gY2FuZGlkYXRlRWxlbWVudFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudFswXS5jbGFzc0xpc3QuY29udGFpbnMoXCJ1cGRhdGUtcHJldmlld1wiKSkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9IC8vIERvIG5vdCBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIHByZXZpZXcgZm9yIGJhZCBzeW5jc1xuXG4gICAgaWYgKCFlbGVtZW50WzBdLmNsYXNzTGlzdC5jb250YWlucyhcInVwZGF0ZS1wcmV2aWV3XCIpKSB7XG4gICAgICBlbGVtZW50WzBdLnNjcm9sbEludG9WaWV3KClcbiAgICB9XG4gICAgY29uc3QgbWF4U2Nyb2xsVG9wID0gdGhpcy5lbGVtZW50LnNjcm9sbEhlaWdodCAtIHRoaXMuaW5uZXJIZWlnaHQoKVxuICAgIGlmICghKHRoaXMuc2Nyb2xsVG9wKCkgPj0gbWF4U2Nyb2xsVG9wKSkge1xuICAgICAgdGhpcy5lbGVtZW50LnNjcm9sbFRvcCAtPSB0aGlzLmlubmVySGVpZ2h0KCkgLyA0XG4gICAgfVxuXG4gICAgZWxlbWVudC5hZGRDbGFzcyhcImZsYXNoXCIpXG4gICAgc2V0VGltZW91dCgoKSA9PiBlbGVtZW50LnJlbW92ZUNsYXNzKFwiZmxhc2hcIiksIDEwMDApXG5cbiAgICByZXR1cm4gZWxlbWVudFswXVxuICB9XG59XG5cbmZ1bmN0aW9uIF9fZ3VhcmRfXyh2YWx1ZSwgdHJhbnNmb3JtKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IG51bGxcbiAgICA/IHRyYW5zZm9ybSh2YWx1ZSlcbiAgICA6IHVuZGVmaW5lZFxufVxuZnVuY3Rpb24gX19ndWFyZE1ldGhvZF9fKG9iaiwgbWV0aG9kTmFtZSwgdHJhbnNmb3JtKSB7XG4gIGlmIChcbiAgICB0eXBlb2Ygb2JqICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgb2JqICE9PSBudWxsICYmXG4gICAgdHlwZW9mIG9ialttZXRob2ROYW1lXSA9PT0gXCJmdW5jdGlvblwiXG4gICkge1xuICAgIHJldHVybiB0cmFuc2Zvcm0ob2JqLCBtZXRob2ROYW1lKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxufVxuIl19