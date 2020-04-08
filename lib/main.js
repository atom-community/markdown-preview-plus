"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const markdown_preview_view_1 = require("./markdown-preview-view");
const atom_1 = require("atom");
const path = require("path");
const util = require("./util");
const placeholder_view_1 = require("./placeholder-view");
const migrate_config_1 = require("./migrate-config");
const markdown_preview_view_editor_remote_1 = require("./markdown-preview-view/markdown-preview-view-editor-remote");
var config_1 = require("./config");
exports.config = config_1.config;
let disposables;
async function activate() {
    if (migrate_config_1.migrateConfig()) {
        atom.notifications.addInfo('Markdown-Preivew-Plus has updated your config to a new format. ' +
            'Please check if everything is in order. ' +
            'This message will not be shown again.', { dismissable: true });
    }
    if (atom.packages.isPackageActive('markdown-preview')) {
        await atom.packages.deactivatePackage('markdown-preview');
    }
    if (!atom.packages.isPackageDisabled('markdown-preview')) {
        atom.packages.disablePackage('markdown-preview');
        atom.notifications.addInfo('Markdown-preview-plus has disabled markdown-preview package.', { dismissable: true });
    }
    disposables = new atom_1.CompositeDisposable();
    disposables.add(atom.commands.add('.markdown-preview-plus', {
        'markdown-preview-plus:toggle': close,
    }), atom.commands.add('atom-workspace', {
        'markdown-preview-plus:select-syntax-theme': async () => {
            try {
                const { selectListView } = await Promise.resolve().then(() => require('./select-list-view'));
                const themeNames = atom.themes.getLoadedThemeNames();
                if (themeNames === undefined)
                    return;
                const theme = await selectListView(themeNames.filter((x) => x.match(/-syntax$/)));
                if (theme === undefined)
                    return;
                atom.config.set('markdown-preview-plus.syntaxThemeName', theme);
            }
            catch (e) {
                const err = e;
                atom.notifications.addFatalError(err.name, {
                    detail: err.message,
                    stack: err.stack,
                });
            }
        },
    }), atom.commands.add('atom-text-editor', {
        'markdown-preview-plus:toggle-render-latex': (e) => {
            const editor = e.currentTarget.getModel();
            const view = markdown_preview_view_1.MarkdownPreviewViewEditor.viewForEditor(editor);
            if (view)
                view.toggleRenderLatex();
        },
    }), atom.commands.add('.markdown-preview-plus', {
        'markdown-preview-plus:toggle-render-latex': (e) => {
            const view = markdown_preview_view_1.MarkdownPreviewView.viewForElement(e.currentTarget);
            if (view)
                view.toggleRenderLatex();
        },
    }), atom.commands.add('.tree-view', {
        'markdown-preview-plus:preview-file': previewFile,
        'markdown-preview-plus:make-pdf': makePDF,
    }), atom.workspace.addOpener(opener), atom.config.observe('markdown-preview-plus.grammars', configObserver(registerGrammars)), atom.config.observe('markdown-preview-plus.extensions', configObserver(registerExtensions)));
}
exports.activate = activate;
function deactivate() {
    disposables && disposables.dispose();
}
exports.deactivate = deactivate;
function createMarkdownPreviewView(state) {
    if (state.editorId !== undefined) {
        return new placeholder_view_1.PlaceholderView(state.editorId);
    }
    else if (state.filePath && util.isFileSync(state.filePath)) {
        return new markdown_preview_view_1.MarkdownPreviewViewFile(state.filePath);
    }
    return undefined;
}
exports.createMarkdownPreviewView = createMarkdownPreviewView;
async function close(event) {
    const item = markdown_preview_view_1.MarkdownPreviewView.viewForElement(event.currentTarget);
    if (!item)
        return;
    const pane = atom.workspace.paneForItem(item);
    if (!pane)
        return;
    await pane.destroyItem(item);
}
async function toggle(editor) {
    if (removePreviewForEditor(editor))
        return undefined;
    else
        return addPreviewForEditor(editor);
}
function removePreviewForEditor(editor) {
    const item = markdown_preview_view_1.MarkdownPreviewViewEditor.viewForEditor(editor);
    if (!item)
        return false;
    const previewPane = atom.workspace.paneForItem(item);
    if (!previewPane)
        return false;
    if (item !== previewPane.getActiveItem()) {
        previewPane.activateItem(item);
        return false;
    }
    util.handlePromise(previewPane.destroyItem(item));
    return true;
}
async function addPreviewForEditor(editor) {
    const previousActivePane = atom.workspace.getActivePane();
    const options = { searchAllPanes: true };
    const splitConfig = util.atomConfig().previewConfig.previewSplitPaneDir;
    if (splitConfig !== 'none') {
        options.split = splitConfig;
    }
    const res = await atom.workspace.open(markdown_preview_view_1.MarkdownPreviewViewEditor.create(editor), options);
    previousActivePane.activate();
    return res;
}
async function previewFile(evt) {
    const { currentTarget } = evt;
    const fileEntry = currentTarget.querySelector('.entry.file.selected .name');
    const filePath = fileEntry.dataset.path;
    if (!filePath) {
        evt.abortKeyBinding();
        return;
    }
    const ext = path.extname(filePath).substr(1);
    const exts = util.atomConfig().extensions;
    if (!exts.includes(ext)) {
        evt.abortKeyBinding();
        return;
    }
    for (const editor of atom.workspace.getTextEditors()) {
        if (editor.getPath() === filePath) {
            await addPreviewForEditor(editor);
            return;
        }
    }
    await atom.workspace.open(`markdown-preview-plus://file/${encodeURI(filePath)}`, {
        searchAllPanes: true,
    });
}
async function copyHtmlInternal(editor) {
    const renderLaTeX = util.atomConfig().mathConfig.enableLatexRenderingByDefault;
    const text = editor.getSelectedText() || editor.getText();
    await util.copyHtml(text, editor.getPath(), renderLaTeX);
}
function configObserver(f) {
    let configDisposables;
    return function (value) {
        if (!disposables)
            return;
        if (configDisposables) {
            configDisposables.dispose();
            disposables.remove(configDisposables);
        }
        configDisposables = new atom_1.CompositeDisposable();
        const contextMenu = {};
        f(value, configDisposables, contextMenu);
        configDisposables.add(atom.contextMenu.add(contextMenu));
        disposables.add(configDisposables);
    };
}
function registerExtensions(extensions, _, cm) {
    for (const ext of extensions) {
        const selector = `.tree-view .file .name[data-name$=".${ext}"]`;
        cm[selector] = [
            {
                label: 'Markdown Preview',
                command: 'markdown-preview-plus:preview-file',
            },
            {
                label: 'Make PDF',
                command: 'markdown-preview-plus:make-pdf',
            },
        ];
    }
}
function registerGrammars(grammars, disp, cm) {
    for (const gr of grammars) {
        const grs = gr.replace(/\./g, ' ');
        const selector = `atom-text-editor[data-grammar="${grs}"]`;
        disp.add(atom.commands.add(selector, {
            'markdown-preview-plus:toggle': (e) => {
                util.handlePromise(toggle(e.currentTarget.getModel()));
            },
            'markdown-preview-plus:copy-html': (e) => {
                util.handlePromise(copyHtmlInternal(e.currentTarget.getModel()));
            },
        }));
        cm[selector] = [
            {
                label: 'Sync Preview',
                command: 'markdown-preview-plus:sync-preview',
            },
            {
                label: 'Copy Markdown as HTML',
                command: 'markdown-preview-plus:copy-html',
            },
        ];
    }
}
async function makePDF(evt) {
    const { currentTarget } = evt;
    const fileEntries = currentTarget.querySelectorAll('.entry.file.selected .name');
    async function go(filePath) {
        if (filePath === undefined)
            return;
        const f = new atom_1.File(filePath);
        const text = await f.read();
        if (text === null)
            return;
        const savePath = filePath + '.pdf';
        const saveFile = new atom_1.File(savePath);
        if ((await saveFile.exists()) &&
            !util.atomConfig().saveConfig.makePDFOverwrite) {
            atom.notifications.addInfo(`${saveFile.getBaseName()} exists, will not overwrite`);
            return;
        }
        const pdf = await Promise.resolve().then(() => require('./markdown-preview-view/pdf-export-util'));
        await pdf.saveAsPDF(text, filePath, undefined, util.atomConfig().mathConfig.enableLatexRenderingByDefault, savePath);
    }
    const exts = util.atomConfig().extensions;
    const paths = Array.from(fileEntries)
        .map((x) => x.dataset.path)
        .filter((x) => x !== undefined && exts.includes(path.extname(x).substr(1)))
        .map(go);
    if (paths.length === 0) {
        evt.abortKeyBinding();
        return;
    }
    await Promise.all(paths);
}
function opener(uriToOpen) {
    try {
        var uri = url.parse(uriToOpen);
    }
    catch (e) {
        console.error(e, uriToOpen);
        return undefined;
    }
    if (uri.protocol !== 'markdown-preview-plus:')
        return undefined;
    if (!uri.pathname)
        return undefined;
    try {
        var pathname = decodeURI(uri.pathname);
    }
    catch (e) {
        console.error(e);
        return undefined;
    }
    if (uri.hostname === 'file') {
        return new markdown_preview_view_1.MarkdownPreviewViewFile(pathname.slice(1));
    }
    else if (uri.hostname === 'editor') {
        const editorId = parseInt(pathname.slice(1), 10);
        const editor = atom.workspace
            .getTextEditors()
            .find((ed) => ed.id === editorId);
        if (editor === undefined) {
            atom.notifications.addWarning('Markdown-preview-plus: Tried to open preview ' +
                `for editor with id ${editorId}, which does not exist`);
            return undefined;
        }
        return markdown_preview_view_1.MarkdownPreviewViewEditor.create(editor);
    }
    else if (uri.hostname === 'remote-editor') {
        const [windowId, editorId] = pathname
            .slice(1)
            .split('/')
            .map((x) => parseInt(x, 10));
        return new markdown_preview_view_editor_remote_1.MarkdownPreviewViewEditorRemote(windowId, editorId);
    }
    else {
        throw new Error(`Tried to open markdown-preview-plus with uri ${uriToOpen}. This is not supported. Please report this error.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFPYTtBQUNiLDZCQUE0QjtBQUM1QiwrQkFBOEI7QUFDOUIseURBQW9EO0FBQ3BELHFEQUFnRDtBQUNoRCxxSEFBNkc7QUFFN0csbUNBQWlDO0FBQXhCLDBCQUFBLE1BQU0sQ0FBQTtBQUVmLElBQUksV0FBNEMsQ0FBQTtBQUV6QyxLQUFLLFVBQVUsUUFBUTtJQUM1QixJQUFJLDhCQUFhLEVBQUUsRUFBRTtRQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDeEIsaUVBQWlFO1lBQy9ELDBDQUEwQztZQUMxQyx1Q0FBdUMsRUFDekMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUNyRCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtLQUMxRDtJQUNELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLEVBQUU7UUFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDeEIsOERBQThELEVBQzlELEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUN0QixDQUFBO0tBQ0Y7SUFDRCxXQUFXLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO0lBQ3ZDLFdBQVcsQ0FBQyxHQUFHLENBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUU7UUFDMUMsOEJBQThCLEVBQUUsS0FBSztLQUN0QyxDQUFDLEVBQ0YsSUFB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LEVBQUU7UUFDM0MsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRO2FBQ2xDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDUixLQUFLLENBQUMsR0FBRyxDQUFDO2FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDOUIsT0FBTyxJQUFJLHFFQUErQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMvRDtTQUFNO1FBQ0wsTUFBTSxJQUFJLEtBQUssQ0FDYixnREFBZ0QsU0FBUyxvREFBb0QsQ0FDOUcsQ0FBQTtLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1cmwgPSByZXF1aXJlKCd1cmwnKVxuaW1wb3J0IHtcbiAgU2VyaWFsaXplZE1QVixcbiAgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUsXG4gIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IsXG4gIE1hcmtkb3duUHJldmlld1ZpZXcsXG59IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuLy8gaW1wb3J0IG1hdGhqYXhIZWxwZXIgPSByZXF1aXJlKCcuL21hdGhqYXgtaGVscGVyJylcbmltcG9ydCB7XG4gIFRleHRFZGl0b3IsXG4gIFdvcmtzcGFjZU9wZW5PcHRpb25zLFxuICBDb21tYW5kRXZlbnQsXG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIENvbnRleHRNZW51T3B0aW9ucyxcbiAgRmlsZSxcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgUGxhY2Vob2xkZXJWaWV3IH0gZnJvbSAnLi9wbGFjZWhvbGRlci12aWV3J1xuaW1wb3J0IHsgbWlncmF0ZUNvbmZpZyB9IGZyb20gJy4vbWlncmF0ZS1jb25maWcnXG5pbXBvcnQgeyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yUmVtb3RlIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcvbWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci1yZW1vdGUnXG5cbmV4cG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vY29uZmlnJ1xuXG5sZXQgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGUgfCB1bmRlZmluZWRcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICBpZiAobWlncmF0ZUNvbmZpZygpKSB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAnTWFya2Rvd24tUHJlaXZldy1QbHVzIGhhcyB1cGRhdGVkIHlvdXIgY29uZmlnIHRvIGEgbmV3IGZvcm1hdC4gJyArXG4gICAgICAgICdQbGVhc2UgY2hlY2sgaWYgZXZlcnl0aGluZyBpcyBpbiBvcmRlci4gJyArXG4gICAgICAgICdUaGlzIG1lc3NhZ2Ugd2lsbCBub3QgYmUgc2hvd24gYWdhaW4uJyxcbiAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSxcbiAgICApXG4gIH1cbiAgaWYgKGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCdtYXJrZG93bi1wcmV2aWV3JykpIHtcbiAgICBhd2FpdCBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3JylcbiAgfVxuICBpZiAoIWF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQoJ21hcmtkb3duLXByZXZpZXcnKSkge1xuICAgIGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UoJ21hcmtkb3duLXByZXZpZXcnKVxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFxuICAgICAgJ01hcmtkb3duLXByZXZpZXctcGx1cyBoYXMgZGlzYWJsZWQgbWFya2Rvd24tcHJldmlldyBwYWNrYWdlLicsXG4gICAgICB7IGRpc21pc3NhYmxlOiB0cnVlIH0sXG4gICAgKVxuICB9XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBkaXNwb3NhYmxlcy5hZGQoXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJy5tYXJrZG93bi1wcmV2aWV3LXBsdXMnLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSc6IGNsb3NlLFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c2VsZWN0LXN5bnRheC10aGVtZSc6IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IHNlbGVjdExpc3RWaWV3IH0gPSBhd2FpdCBpbXBvcnQoJy4vc2VsZWN0LWxpc3QtdmlldycpXG4gICAgICAgICAgY29uc3QgdGhlbWVOYW1lcyA9IGF0b20udGhlbWVzLmdldExvYWRlZFRoZW1lTmFtZXMoKVxuICAgICAgICAgIGlmICh0aGVtZU5hbWVzID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgICAgICAgIGNvbnN0IHRoZW1lID0gYXdhaXQgc2VsZWN0TGlzdFZpZXcoXG4gICAgICAgICAgICB0aGVtZU5hbWVzLmZpbHRlcigoeCkgPT4geC5tYXRjaCgvLXN5bnRheCQvKSksXG4gICAgICAgICAgKVxuICAgICAgICAgIGlmICh0aGVtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW50YXhUaGVtZU5hbWUnLCB0aGVtZSlcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3JcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihlcnIubmFtZSwge1xuICAgICAgICAgICAgZGV0YWlsOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KSxcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpXG4gICAgICAgIGNvbnN0IHZpZXcgPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLnZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgICBpZiAodmlldykgdmlldy50b2dnbGVSZW5kZXJMYXRleCgpXG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCcubWFya2Rvd24tcHJldmlldy1wbHVzJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKGUpID0+IHtcbiAgICAgICAgY29uc3QgdmlldyA9IE1hcmtkb3duUHJldmlld1ZpZXcudmlld0ZvckVsZW1lbnQoZS5jdXJyZW50VGFyZ2V0KVxuICAgICAgICBpZiAodmlldykgdmlldy50b2dnbGVSZW5kZXJMYXRleCgpXG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCcudHJlZS12aWV3Jywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnOiBwcmV2aWV3RmlsZSxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6bWFrZS1wZGYnOiBtYWtlUERGLFxuICAgIH0pLFxuICAgIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcihvcGVuZXIpLFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmdyYW1tYXJzJyxcbiAgICAgIGNvbmZpZ09ic2VydmVyKHJlZ2lzdGVyR3JhbW1hcnMpLFxuICAgICksXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZXh0ZW5zaW9ucycsXG4gICAgICBjb25maWdPYnNlcnZlcihyZWdpc3RlckV4dGVuc2lvbnMpLFxuICAgICksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGVzICYmIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWFya2Rvd25QcmV2aWV3VmlldyhzdGF0ZTogU2VyaWFsaXplZE1QVikge1xuICBpZiAoc3RhdGUuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBuZXcgUGxhY2Vob2xkZXJWaWV3KHN0YXRlLmVkaXRvcklkKVxuICB9IGVsc2UgaWYgKHN0YXRlLmZpbGVQYXRoICYmIHV0aWwuaXNGaWxlU3luYyhzdGF0ZS5maWxlUGF0aCkpIHtcbiAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdGaWxlKHN0YXRlLmZpbGVQYXRoKVxuICB9XG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuLy8vIHByaXZhdGVcblxuYXN5bmMgZnVuY3Rpb24gY2xvc2UoZXZlbnQ6IENvbW1hbmRFdmVudDxIVE1MRWxlbWVudD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgaXRlbSA9IE1hcmtkb3duUHJldmlld1ZpZXcudmlld0ZvckVsZW1lbnQoZXZlbnQuY3VycmVudFRhcmdldClcbiAgaWYgKCFpdGVtKSByZXR1cm5cbiAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGl0ZW0pXG4gIGlmICghcGFuZSkgcmV0dXJuXG4gIGF3YWl0IHBhbmUuZGVzdHJveUl0ZW0oaXRlbSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gdG9nZ2xlKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICBpZiAocmVtb3ZlUHJldmlld0ZvckVkaXRvcihlZGl0b3IpKSByZXR1cm4gdW5kZWZpbmVkXG4gIGVsc2UgcmV0dXJuIGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKVxufVxuXG5mdW5jdGlvbiByZW1vdmVQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICBjb25zdCBpdGVtID0gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci52aWV3Rm9yRWRpdG9yKGVkaXRvcilcbiAgaWYgKCFpdGVtKSByZXR1cm4gZmFsc2VcbiAgY29uc3QgcHJldmlld1BhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShpdGVtKVxuICBpZiAoIXByZXZpZXdQYW5lKSByZXR1cm4gZmFsc2VcbiAgaWYgKGl0ZW0gIT09IHByZXZpZXdQYW5lLmdldEFjdGl2ZUl0ZW0oKSkge1xuICAgIHByZXZpZXdQYW5lLmFjdGl2YXRlSXRlbShpdGVtKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHV0aWwuaGFuZGxlUHJvbWlzZShwcmV2aWV3UGFuZS5kZXN0cm95SXRlbShpdGVtKSlcbiAgcmV0dXJuIHRydWVcbn1cblxuYXN5bmMgZnVuY3Rpb24gYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgY29uc3QgcHJldmlvdXNBY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gIGNvbnN0IG9wdGlvbnM6IFdvcmtzcGFjZU9wZW5PcHRpb25zID0geyBzZWFyY2hBbGxQYW5lczogdHJ1ZSB9XG4gIGNvbnN0IHNwbGl0Q29uZmlnID0gdXRpbC5hdG9tQ29uZmlnKCkucHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyXG4gIGlmIChzcGxpdENvbmZpZyAhPT0gJ25vbmUnKSB7XG4gICAgb3B0aW9ucy5zcGxpdCA9IHNwbGl0Q29uZmlnXG4gIH1cbiAgY29uc3QgcmVzID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihcbiAgICBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLmNyZWF0ZShlZGl0b3IpLFxuICAgIG9wdGlvbnMsXG4gIClcbiAgcHJldmlvdXNBY3RpdmVQYW5lLmFjdGl2YXRlKClcbiAgcmV0dXJuIHJlc1xufVxuXG5hc3luYyBmdW5jdGlvbiBwcmV2aWV3RmlsZShldnQ6IENvbW1hbmRFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IGN1cnJlbnRUYXJnZXQgfSA9IGV2dFxuICBjb25zdCBmaWxlRW50cnkgPSAoY3VycmVudFRhcmdldCBhcyBIVE1MRWxlbWVudCkucXVlcnlTZWxlY3RvcihcbiAgICAnLmVudHJ5LmZpbGUuc2VsZWN0ZWQgLm5hbWUnLFxuICApXG4gIGNvbnN0IGZpbGVQYXRoID0gKGZpbGVFbnRyeSBhcyBIVE1MRWxlbWVudCkuZGF0YXNldC5wYXRoXG4gIGlmICghZmlsZVBhdGgpIHtcbiAgICBldnQuYWJvcnRLZXlCaW5kaW5nKClcbiAgICByZXR1cm5cbiAgfVxuICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnN1YnN0cigxKVxuICBjb25zdCBleHRzID0gdXRpbC5hdG9tQ29uZmlnKCkuZXh0ZW5zaW9uc1xuICBpZiAoIWV4dHMuaW5jbHVkZXMoZXh0KSkge1xuICAgIGV2dC5hYm9ydEtleUJpbmRpbmcoKVxuICAgIHJldHVyblxuICB9XG5cbiAgZm9yIChjb25zdCBlZGl0b3Igb2YgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSkge1xuICAgIGlmIChlZGl0b3IuZ2V0UGF0aCgpID09PSBmaWxlUGF0aCkge1xuICAgICAgYXdhaXQgYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKFxuICAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9maWxlLyR7ZW5jb2RlVVJJKGZpbGVQYXRoKX1gLFxuICAgIHtcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgIH0sXG4gIClcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weUh0bWxJbnRlcm5hbChlZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcmVuZGVyTGFUZVggPSB1dGlsLmF0b21Db25maWcoKS5tYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0XG4gIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkgfHwgZWRpdG9yLmdldFRleHQoKVxuICBhd2FpdCB1dGlsLmNvcHlIdG1sKHRleHQsIGVkaXRvci5nZXRQYXRoKCksIHJlbmRlckxhVGVYKVxufVxuXG50eXBlIENvbnRleHRNZW51ID0geyBba2V5OiBzdHJpbmddOiBDb250ZXh0TWVudU9wdGlvbnNbXSB9XG5cbmZ1bmN0aW9uIGNvbmZpZ09ic2VydmVyPFQ+KFxuICBmOiAoXG4gICAgdmFsdWU6IFQsXG4gICAgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gICAgY29udGV4dE1lbnU6IENvbnRleHRNZW51LFxuICApID0+IHZvaWQsXG4pIHtcbiAgbGV0IGNvbmZpZ0Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZTogVCkge1xuICAgIGlmICghZGlzcG9zYWJsZXMpIHJldHVyblxuICAgIGlmIChjb25maWdEaXNwb3NhYmxlcykge1xuICAgICAgY29uZmlnRGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgICBkaXNwb3NhYmxlcy5yZW1vdmUoY29uZmlnRGlzcG9zYWJsZXMpXG4gICAgfVxuICAgIGNvbmZpZ0Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGNvbnN0IGNvbnRleHRNZW51OiBDb250ZXh0TWVudSA9IHt9XG4gICAgZih2YWx1ZSwgY29uZmlnRGlzcG9zYWJsZXMsIGNvbnRleHRNZW51KVxuICAgIGNvbmZpZ0Rpc3Bvc2FibGVzLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZChjb250ZXh0TWVudSkpXG4gICAgZGlzcG9zYWJsZXMuYWRkKGNvbmZpZ0Rpc3Bvc2FibGVzKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyRXh0ZW5zaW9ucyhleHRlbnNpb25zOiBzdHJpbmdbXSwgXzogYW55LCBjbTogQ29udGV4dE1lbnUpIHtcbiAgZm9yIChjb25zdCBleHQgb2YgZXh0ZW5zaW9ucykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gYC50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cIi4ke2V4dH1cIl1gXG4gICAgY21bc2VsZWN0b3JdID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ01hcmtkb3duIFByZXZpZXcnLFxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ01ha2UgUERGJyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czptYWtlLXBkZicsXG4gICAgICB9LFxuICAgIF1cbiAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlckdyYW1tYXJzKFxuICBncmFtbWFyczogc3RyaW5nW10sXG4gIGRpc3A6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIGNtOiBDb250ZXh0TWVudSxcbikge1xuICBmb3IgKGNvbnN0IGdyIG9mIGdyYW1tYXJzKSB7XG4gICAgY29uc3QgZ3JzID0gZ3IucmVwbGFjZSgvXFwuL2csICcgJylcbiAgICBjb25zdCBzZWxlY3RvciA9IGBhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcj1cIiR7Z3JzfVwiXWBcbiAgICBkaXNwLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHNlbGVjdG9yIGFzICdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSc6IChlKSA9PiB7XG4gICAgICAgICAgdXRpbC5oYW5kbGVQcm9taXNlKHRvZ2dsZShlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKSkpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Y29weS1odG1sJzogKGUpID0+IHtcbiAgICAgICAgICB1dGlsLmhhbmRsZVByb21pc2UoY29weUh0bWxJbnRlcm5hbChlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKSkpXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApXG4gICAgY21bc2VsZWN0b3JdID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ1N5bmMgUHJldmlldycsXG4gICAgICAgIGNvbW1hbmQ6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1wcmV2aWV3JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQ29weSBNYXJrZG93biBhcyBIVE1MJyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpjb3B5LWh0bWwnLFxuICAgICAgfSxcbiAgICBdXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWFrZVBERihldnQ6IENvbW1hbmRFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7IGN1cnJlbnRUYXJnZXQgfSA9IGV2dFxuICBjb25zdCBmaWxlRW50cmllcyA9IChjdXJyZW50VGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICcuZW50cnkuZmlsZS5zZWxlY3RlZCAubmFtZScsXG4gIClcbiAgYXN5bmMgZnVuY3Rpb24gZ28oZmlsZVBhdGg/OiBzdHJpbmcpIHtcbiAgICBpZiAoZmlsZVBhdGggPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgY29uc3QgZiA9IG5ldyBGaWxlKGZpbGVQYXRoKVxuICAgIGNvbnN0IHRleHQgPSBhd2FpdCBmLnJlYWQoKVxuICAgIGlmICh0ZXh0ID09PSBudWxsKSByZXR1cm5cbiAgICBjb25zdCBzYXZlUGF0aCA9IGZpbGVQYXRoICsgJy5wZGYnXG4gICAgY29uc3Qgc2F2ZUZpbGUgPSBuZXcgRmlsZShzYXZlUGF0aClcbiAgICBpZiAoXG4gICAgICAoYXdhaXQgc2F2ZUZpbGUuZXhpc3RzKCkpICYmXG4gICAgICAhdXRpbC5hdG9tQ29uZmlnKCkuc2F2ZUNvbmZpZy5tYWtlUERGT3ZlcndyaXRlXG4gICAgKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICAgYCR7c2F2ZUZpbGUuZ2V0QmFzZU5hbWUoKX0gZXhpc3RzLCB3aWxsIG5vdCBvdmVyd3JpdGVgLFxuICAgICAgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgcGRmID0gYXdhaXQgaW1wb3J0KCcuL21hcmtkb3duLXByZXZpZXctdmlldy9wZGYtZXhwb3J0LXV0aWwnKVxuICAgIGF3YWl0IHBkZi5zYXZlQXNQREYoXG4gICAgICB0ZXh0LFxuICAgICAgZmlsZVBhdGgsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB1dGlsLmF0b21Db25maWcoKS5tYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0LFxuICAgICAgc2F2ZVBhdGgsXG4gICAgKVxuICB9XG4gIGNvbnN0IGV4dHMgPSB1dGlsLmF0b21Db25maWcoKS5leHRlbnNpb25zXG4gIGNvbnN0IHBhdGhzID0gQXJyYXkuZnJvbShmaWxlRW50cmllcylcbiAgICAubWFwKCh4KSA9PiAoeCBhcyBIVE1MRWxlbWVudCkuZGF0YXNldC5wYXRoKVxuICAgIC5maWx0ZXIoKHgpID0+IHggIT09IHVuZGVmaW5lZCAmJiBleHRzLmluY2x1ZGVzKHBhdGguZXh0bmFtZSh4KS5zdWJzdHIoMSkpKVxuICAgIC5tYXAoZ28pXG4gIGlmIChwYXRocy5sZW5ndGggPT09IDApIHtcbiAgICBldnQuYWJvcnRLZXlCaW5kaW5nKClcbiAgICByZXR1cm5cbiAgfVxuICBhd2FpdCBQcm9taXNlLmFsbChwYXRocylcbn1cblxuZnVuY3Rpb24gb3BlbmVyKHVyaVRvT3Blbjogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXZhci1rZXl3b3JkIHByZWZlci1jb25zdFxuICAgIHZhciB1cmkgPSB1cmwucGFyc2UodXJpVG9PcGVuKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLCB1cmlUb09wZW4pXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKHVyaS5wcm90b2NvbCAhPT0gJ21hcmtkb3duLXByZXZpZXctcGx1czonKSByZXR1cm4gdW5kZWZpbmVkXG4gIGlmICghdXJpLnBhdGhuYW1lKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgdHJ5IHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLWtleXdvcmQgcHJlZmVyLWNvbnN0XG4gICAgdmFyIHBhdGhuYW1lID0gZGVjb2RlVVJJKHVyaS5wYXRobmFtZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAodXJpLmhvc3RuYW1lID09PSAnZmlsZScpIHtcbiAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdGaWxlKHBhdGhuYW1lLnNsaWNlKDEpKVxuICB9IGVsc2UgaWYgKHVyaS5ob3N0bmFtZSA9PT0gJ2VkaXRvcicpIHtcbiAgICBjb25zdCBlZGl0b3JJZCA9IHBhcnNlSW50KHBhdGhuYW1lLnNsaWNlKDEpLCAxMClcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZVxuICAgICAgLmdldFRleHRFZGl0b3JzKClcbiAgICAgIC5maW5kKChlZCkgPT4gZWQuaWQgPT09IGVkaXRvcklkKVxuICAgIGlmIChlZGl0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICdNYXJrZG93bi1wcmV2aWV3LXBsdXM6IFRyaWVkIHRvIG9wZW4gcHJldmlldyAnICtcbiAgICAgICAgICBgZm9yIGVkaXRvciB3aXRoIGlkICR7ZWRpdG9ySWR9LCB3aGljaCBkb2VzIG5vdCBleGlzdGAsXG4gICAgICApXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICAgIHJldHVybiBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLmNyZWF0ZShlZGl0b3IpXG4gIH0gZWxzZSBpZiAodXJpLmhvc3RuYW1lID09PSAncmVtb3RlLWVkaXRvcicpIHtcbiAgICBjb25zdCBbd2luZG93SWQsIGVkaXRvcklkXSA9IHBhdGhuYW1lXG4gICAgICAuc2xpY2UoMSlcbiAgICAgIC5zcGxpdCgnLycpXG4gICAgICAubWFwKCh4KSA9PiBwYXJzZUludCh4LCAxMCkpXG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yUmVtb3RlKHdpbmRvd0lkLCBlZGl0b3JJZClcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVHJpZWQgdG8gb3BlbiBtYXJrZG93bi1wcmV2aWV3LXBsdXMgd2l0aCB1cmkgJHt1cmlUb09wZW59LiBUaGlzIGlzIG5vdCBzdXBwb3J0ZWQuIFBsZWFzZSByZXBvcnQgdGhpcyBlcnJvci5gLFxuICAgIClcbiAgfVxufVxuIl19