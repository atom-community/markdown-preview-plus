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
function activate() {
    if (migrate_config_1.migrateConfig()) {
        atom.notifications.addInfo('Markdown-Preivew-Plus has updated your config to a new format. ' +
            'Please check if everything is in order. ' +
            'This message will not be shown again.', { dismissable: true });
    }
    if (atom.packages.isPackageActive('markdown-preview')) {
        util.handlePromise(atom.packages.deactivatePackage('markdown-preview'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUNoQywrQkFPYTtBQUNiLDZCQUE0QjtBQUM1QiwrQkFBOEI7QUFDOUIseURBQW9EO0FBQ3BELHFEQUFnRDtBQUNoRCxxSEFBNkc7QUFFN0csbUNBQWlDO0FBQXhCLDBCQUFBLE1BQU0sQ0FBQTtBQUVmLElBQUksV0FBNEMsQ0FBQTtBQUVoRCxTQUFnQixRQUFRO0lBQ3RCLElBQUksOEJBQWEsRUFBRSxFQUFFO1FBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4QixpRUFBaUU7WUFDL0QsMENBQTBDO1lBQzFDLHVDQUF1QyxFQUN6QyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FDdEIsQ0FBQTtLQUNGO0lBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQ3JELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUE7S0FDeEU7SUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQ3hELElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFDaEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQ3hCLDhEQUE4RCxFQUM5RCxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FDdEIsQ0FBQTtLQUNGO0lBQ0QsV0FBVyxHQUFHLElBQUksMEJBQW1CLEVBQUUsQ0FBQTtJQUN2QyxXQUFXLENBQUMsR0FBRyxDQUNiLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFO1FBQzFDLDhCQUE4QixFQUFFLEtBQUs7S0FD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QyxRQUFRLEtBQUssZUFBZSxFQUFFO1FBQzNDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEdBQUcsUUFBUTthQUNsQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQzthQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzlCLE9BQU8sSUFBSSxxRUFBK0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDL0Q7U0FBTTtRQUNMLE1BQU0sSUFBSSxLQUFLLENBQ2IsZ0RBQWdELFNBQVMsb0RBQW9ELENBQzlHLENBQUE7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdXJsID0gcmVxdWlyZSgndXJsJylcbmltcG9ydCB7XG4gIFNlcmlhbGl6ZWRNUFYsXG4gIE1hcmtkb3duUHJldmlld1ZpZXdGaWxlLFxuICBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLFxuICBNYXJrZG93blByZXZpZXdWaWV3LFxufSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcbmltcG9ydCB7XG4gIFRleHRFZGl0b3IsXG4gIFdvcmtzcGFjZU9wZW5PcHRpb25zLFxuICBDb21tYW5kRXZlbnQsXG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIENvbnRleHRNZW51T3B0aW9ucyxcbiAgRmlsZSxcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgUGxhY2Vob2xkZXJWaWV3IH0gZnJvbSAnLi9wbGFjZWhvbGRlci12aWV3J1xuaW1wb3J0IHsgbWlncmF0ZUNvbmZpZyB9IGZyb20gJy4vbWlncmF0ZS1jb25maWcnXG5pbXBvcnQgeyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yUmVtb3RlIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcvbWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci1yZW1vdGUnXG5cbmV4cG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vY29uZmlnJ1xuXG5sZXQgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGUgfCB1bmRlZmluZWRcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICBpZiAobWlncmF0ZUNvbmZpZygpKSB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAnTWFya2Rvd24tUHJlaXZldy1QbHVzIGhhcyB1cGRhdGVkIHlvdXIgY29uZmlnIHRvIGEgbmV3IGZvcm1hdC4gJyArXG4gICAgICAgICdQbGVhc2UgY2hlY2sgaWYgZXZlcnl0aGluZyBpcyBpbiBvcmRlci4gJyArXG4gICAgICAgICdUaGlzIG1lc3NhZ2Ugd2lsbCBub3QgYmUgc2hvd24gYWdhaW4uJyxcbiAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSxcbiAgICApXG4gIH1cbiAgaWYgKGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCdtYXJrZG93bi1wcmV2aWV3JykpIHtcbiAgICB1dGlsLmhhbmRsZVByb21pc2UoYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpKVxuICB9XG4gIGlmICghYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VEaXNhYmxlZCgnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAnTWFya2Rvd24tcHJldmlldy1wbHVzIGhhcyBkaXNhYmxlZCBtYXJrZG93bi1wcmV2aWV3IHBhY2thZ2UuJyxcbiAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSxcbiAgICApXG4gIH1cbiAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIGRpc3Bvc2FibGVzLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogY2xvc2UsXG4gICAgfSksXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzZWxlY3Qtc3ludGF4LXRoZW1lJzogYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgc2VsZWN0TGlzdFZpZXcgfSA9IGF3YWl0IGltcG9ydCgnLi9zZWxlY3QtbGlzdC12aWV3JylcbiAgICAgICAgICBjb25zdCB0aGVtZU5hbWVzID0gYXRvbS50aGVtZXMuZ2V0TG9hZGVkVGhlbWVOYW1lcygpXG4gICAgICAgICAgaWYgKHRoZW1lTmFtZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgICAgICAgY29uc3QgdGhlbWUgPSBhd2FpdCBzZWxlY3RMaXN0VmlldyhcbiAgICAgICAgICAgIHRoZW1lTmFtZXMuZmlsdGVyKCh4KSA9PiB4Lm1hdGNoKC8tc3ludGF4JC8pKSxcbiAgICAgICAgICApXG4gICAgICAgICAgaWYgKHRoZW1lID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bnRheFRoZW1lTmFtZScsIHRoZW1lKVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc3QgZXJyID0gZSBhcyBFcnJvclxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRGYXRhbEVycm9yKGVyci5uYW1lLCB7XG4gICAgICAgICAgICBkZXRhaWw6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKGUpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKClcbiAgICAgICAgY29uc3QgdmlldyA9IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3Iudmlld0ZvckVkaXRvcihlZGl0b3IpXG4gICAgICAgIGlmICh2aWV3KSB2aWV3LnRvZ2dsZVJlbmRlckxhdGV4KClcbiAgICAgIH0sXG4gICAgfSksXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJy5tYXJrZG93bi1wcmV2aWV3LXBsdXMnLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1yZW5kZXItbGF0ZXgnOiAoZSkgPT4ge1xuICAgICAgICBjb25zdCB2aWV3ID0gTWFya2Rvd25QcmV2aWV3Vmlldy52aWV3Rm9yRWxlbWVudChlLmN1cnJlbnRUYXJnZXQpXG4gICAgICAgIGlmICh2aWV3KSB2aWV3LnRvZ2dsZVJlbmRlckxhdGV4KClcbiAgICAgIH0sXG4gICAgfSksXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJy50cmVlLXZpZXcnLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZSc6IHByZXZpZXdGaWxlLFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czptYWtlLXBkZic6IG1ha2VQREYsXG4gICAgfSksXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKG9wZW5lciksXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZ3JhbW1hcnMnLFxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJHcmFtbWFycyksXG4gICAgKSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJyxcbiAgICAgIGNvbmZpZ09ic2VydmVyKHJlZ2lzdGVyRXh0ZW5zaW9ucyksXG4gICAgKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgZGlzcG9zYWJsZXMgJiYgZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYXJrZG93blByZXZpZXdWaWV3KHN0YXRlOiBTZXJpYWxpemVkTVBWKSB7XG4gIGlmIChzdGF0ZS5lZGl0b3JJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBQbGFjZWhvbGRlclZpZXcoc3RhdGUuZWRpdG9ySWQpXG4gIH0gZWxzZSBpZiAoc3RhdGUuZmlsZVBhdGggJiYgdXRpbC5pc0ZpbGVTeW5jKHN0YXRlLmZpbGVQYXRoKSkge1xuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUoc3RhdGUuZmlsZVBhdGgpXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG4vLy8gcHJpdmF0ZVxuXG5hc3luYyBmdW5jdGlvbiBjbG9zZShldmVudDogQ29tbWFuZEV2ZW50PEhUTUxFbGVtZW50Pik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBpdGVtID0gTWFya2Rvd25QcmV2aWV3Vmlldy52aWV3Rm9yRWxlbWVudChldmVudC5jdXJyZW50VGFyZ2V0KVxuICBpZiAoIWl0ZW0pIHJldHVyblxuICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcbiAgaWYgKCFwYW5lKSByZXR1cm5cbiAgYXdhaXQgcGFuZS5kZXN0cm95SXRlbShpdGVtKVxufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGUoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGlmIChyZW1vdmVQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcikpIHJldHVybiB1bmRlZmluZWRcbiAgZWxzZSByZXR1cm4gYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByZXZpZXdGb3JFZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGNvbnN0IGl0ZW0gPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLnZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICBpZiAoIWl0ZW0pIHJldHVybiBmYWxzZVxuICBjb25zdCBwcmV2aWV3UGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGl0ZW0pXG4gIGlmICghcHJldmlld1BhbmUpIHJldHVybiBmYWxzZVxuICBpZiAoaXRlbSAhPT0gcHJldmlld1BhbmUuZ2V0QWN0aXZlSXRlbSgpKSB7XG4gICAgcHJldmlld1BhbmUuYWN0aXZhdGVJdGVtKGl0ZW0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgdXRpbC5oYW5kbGVQcm9taXNlKHByZXZpZXdQYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5hc3luYyBmdW5jdGlvbiBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICBjb25zdCBwcmV2aW91c0FjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgY29uc3Qgb3B0aW9uczogV29ya3NwYWNlT3Blbk9wdGlvbnMgPSB7IHNlYXJjaEFsbFBhbmVzOiB0cnVlIH1cbiAgY29uc3Qgc3BsaXRDb25maWcgPSB1dGlsLmF0b21Db25maWcoKS5wcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXJcbiAgaWYgKHNwbGl0Q29uZmlnICE9PSAnbm9uZScpIHtcbiAgICBvcHRpb25zLnNwbGl0ID0gc3BsaXRDb25maWdcbiAgfVxuICBjb25zdCByZXMgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKFxuICAgIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IuY3JlYXRlKGVkaXRvciksXG4gICAgb3B0aW9ucyxcbiAgKVxuICBwcmV2aW91c0FjdGl2ZVBhbmUuYWN0aXZhdGUoKVxuICByZXR1cm4gcmVzXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByZXZpZXdGaWxlKGV2dDogQ29tbWFuZEV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHsgY3VycmVudFRhcmdldCB9ID0gZXZ0XG4gIGNvbnN0IGZpbGVFbnRyeSA9IChjdXJyZW50VGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5xdWVyeVNlbGVjdG9yKFxuICAgICcuZW50cnkuZmlsZS5zZWxlY3RlZCAubmFtZScsXG4gIClcbiAgY29uc3QgZmlsZVBhdGggPSAoZmlsZUVudHJ5IGFzIEhUTUxFbGVtZW50KS5kYXRhc2V0LnBhdGhcbiAgaWYgKCFmaWxlUGF0aCkge1xuICAgIGV2dC5hYm9ydEtleUJpbmRpbmcoKVxuICAgIHJldHVyblxuICB9XG4gIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkuc3Vic3RyKDEpXG4gIGNvbnN0IGV4dHMgPSB1dGlsLmF0b21Db25maWcoKS5leHRlbnNpb25zXG4gIGlmICghZXh0cy5pbmNsdWRlcyhleHQpKSB7XG4gICAgZXZ0LmFib3J0S2V5QmluZGluZygpXG4gICAgcmV0dXJuXG4gIH1cblxuICBmb3IgKGNvbnN0IGVkaXRvciBvZiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpKSB7XG4gICAgaWYgKGVkaXRvci5nZXRQYXRoKCkgPT09IGZpbGVQYXRoKSB7XG4gICAgICBhd2FpdCBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oXG4gICAgYG1hcmtkb3duLXByZXZpZXctcGx1czovL2ZpbGUvJHtlbmNvZGVVUkkoZmlsZVBhdGgpfWAsXG4gICAge1xuICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgfSxcbiAgKVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5SHRtbEludGVybmFsKGVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCByZW5kZXJMYVRlWCA9IHV0aWwuYXRvbUNvbmZpZygpLm1hdGhDb25maWcuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHRcbiAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSB8fCBlZGl0b3IuZ2V0VGV4dCgpXG4gIGF3YWl0IHV0aWwuY29weUh0bWwodGV4dCwgZWRpdG9yLmdldFBhdGgoKSwgcmVuZGVyTGFUZVgpXG59XG5cbnR5cGUgQ29udGV4dE1lbnUgPSB7IFtrZXk6IHN0cmluZ106IENvbnRleHRNZW51T3B0aW9uc1tdIH1cblxuZnVuY3Rpb24gY29uZmlnT2JzZXJ2ZXI8VD4oXG4gIGY6IChcbiAgICB2YWx1ZTogVCxcbiAgICBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgICBjb250ZXh0TWVudTogQ29udGV4dE1lbnUsXG4gICkgPT4gdm9pZCxcbikge1xuICBsZXQgY29uZmlnRGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlOiBUKSB7XG4gICAgaWYgKCFkaXNwb3NhYmxlcykgcmV0dXJuXG4gICAgaWYgKGNvbmZpZ0Rpc3Bvc2FibGVzKSB7XG4gICAgICBjb25maWdEaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICAgIGRpc3Bvc2FibGVzLnJlbW92ZShjb25maWdEaXNwb3NhYmxlcylcbiAgICB9XG4gICAgY29uZmlnRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgY29uc3QgY29udGV4dE1lbnU6IENvbnRleHRNZW51ID0ge31cbiAgICBmKHZhbHVlLCBjb25maWdEaXNwb3NhYmxlcywgY29udGV4dE1lbnUpXG4gICAgY29uZmlnRGlzcG9zYWJsZXMuYWRkKGF0b20uY29udGV4dE1lbnUuYWRkKGNvbnRleHRNZW51KSlcbiAgICBkaXNwb3NhYmxlcy5hZGQoY29uZmlnRGlzcG9zYWJsZXMpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJFeHRlbnNpb25zKGV4dGVuc2lvbnM6IHN0cmluZ1tdLCBfOiBhbnksIGNtOiBDb250ZXh0TWVudSkge1xuICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVwiLiR7ZXh0fVwiXWBcbiAgICBjbVtzZWxlY3Rvcl0gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnTWFya2Rvd24gUHJldmlldycsXG4gICAgICAgIGNvbW1hbmQ6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnTWFrZSBQREYnLFxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOm1ha2UtcGRmJyxcbiAgICAgIH0sXG4gICAgXVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyR3JhbW1hcnMoXG4gIGdyYW1tYXJzOiBzdHJpbmdbXSxcbiAgZGlzcDogQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgY206IENvbnRleHRNZW51LFxuKSB7XG4gIGZvciAoY29uc3QgZ3Igb2YgZ3JhbW1hcnMpIHtcbiAgICBjb25zdCBncnMgPSBnci5yZXBsYWNlKC9cXC4vZywgJyAnKVxuICAgIGNvbnN0IHNlbGVjdG9yID0gYGF0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyPVwiJHtncnN9XCJdYFxuICAgIGRpc3AuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoc2VsZWN0b3IgYXMgJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogKGUpID0+IHtcbiAgICAgICAgICB1dGlsLmhhbmRsZVByb21pc2UodG9nZ2xlKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpjb3B5LWh0bWwnOiAoZSkgPT4ge1xuICAgICAgICAgIHV0aWwuaGFuZGxlUHJvbWlzZShjb3B5SHRtbEludGVybmFsKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcbiAgICBjbVtzZWxlY3Rvcl0gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU3luYyBQcmV2aWV3JyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdDb3B5IE1hcmtkb3duIGFzIEhUTUwnLFxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOmNvcHktaHRtbCcsXG4gICAgICB9LFxuICAgIF1cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBtYWtlUERGKGV2dDogQ29tbWFuZEV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHsgY3VycmVudFRhcmdldCB9ID0gZXZ0XG4gIGNvbnN0IGZpbGVFbnRyaWVzID0gKGN1cnJlbnRUYXJnZXQgYXMgSFRNTEVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgJy5lbnRyeS5maWxlLnNlbGVjdGVkIC5uYW1lJyxcbiAgKVxuICBhc3luYyBmdW5jdGlvbiBnbyhmaWxlUGF0aD86IHN0cmluZykge1xuICAgIGlmIChmaWxlUGF0aCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICBjb25zdCBmID0gbmV3IEZpbGUoZmlsZVBhdGgpXG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IGYucmVhZCgpXG4gICAgaWYgKHRleHQgPT09IG51bGwpIHJldHVyblxuICAgIGNvbnN0IHNhdmVQYXRoID0gZmlsZVBhdGggKyAnLnBkZidcbiAgICBjb25zdCBzYXZlRmlsZSA9IG5ldyBGaWxlKHNhdmVQYXRoKVxuICAgIGlmIChcbiAgICAgIChhd2FpdCBzYXZlRmlsZS5leGlzdHMoKSkgJiZcbiAgICAgICF1dGlsLmF0b21Db25maWcoKS5zYXZlQ29uZmlnLm1ha2VQREZPdmVyd3JpdGVcbiAgICApIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFxuICAgICAgICBgJHtzYXZlRmlsZS5nZXRCYXNlTmFtZSgpfSBleGlzdHMsIHdpbGwgbm90IG92ZXJ3cml0ZWAsXG4gICAgICApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBwZGYgPSBhd2FpdCBpbXBvcnQoJy4vbWFya2Rvd24tcHJldmlldy12aWV3L3BkZi1leHBvcnQtdXRpbCcpXG4gICAgYXdhaXQgcGRmLnNhdmVBc1BERihcbiAgICAgIHRleHQsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHV0aWwuYXRvbUNvbmZpZygpLm1hdGhDb25maWcuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQsXG4gICAgICBzYXZlUGF0aCxcbiAgICApXG4gIH1cbiAgY29uc3QgZXh0cyA9IHV0aWwuYXRvbUNvbmZpZygpLmV4dGVuc2lvbnNcbiAgY29uc3QgcGF0aHMgPSBBcnJheS5mcm9tKGZpbGVFbnRyaWVzKVxuICAgIC5tYXAoKHgpID0+ICh4IGFzIEhUTUxFbGVtZW50KS5kYXRhc2V0LnBhdGgpXG4gICAgLmZpbHRlcigoeCkgPT4geCAhPT0gdW5kZWZpbmVkICYmIGV4dHMuaW5jbHVkZXMocGF0aC5leHRuYW1lKHgpLnN1YnN0cigxKSkpXG4gICAgLm1hcChnbylcbiAgaWYgKHBhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgIGV2dC5hYm9ydEtleUJpbmRpbmcoKVxuICAgIHJldHVyblxuICB9XG4gIGF3YWl0IFByb21pc2UuYWxsKHBhdGhzKVxufVxuXG5mdW5jdGlvbiBvcGVuZXIodXJpVG9PcGVuOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLWtleXdvcmQgcHJlZmVyLWNvbnN0XG4gICAgdmFyIHVyaSA9IHVybC5wYXJzZSh1cmlUb09wZW4pXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUsIHVyaVRvT3BlbilcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAodXJpLnByb3RvY29sICE9PSAnbWFya2Rvd24tcHJldmlldy1wbHVzOicpIHJldHVybiB1bmRlZmluZWRcbiAgaWYgKCF1cmkucGF0aG5hbWUpIHJldHVybiB1bmRlZmluZWRcblxuICB0cnkge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXIta2V5d29yZCBwcmVmZXItY29uc3RcbiAgICB2YXIgcGF0aG5hbWUgPSBkZWNvZGVVUkkodXJpLnBhdGhuYW1lKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICh1cmkuaG9zdG5hbWUgPT09ICdmaWxlJykge1xuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUocGF0aG5hbWUuc2xpY2UoMSkpXG4gIH0gZWxzZSBpZiAodXJpLmhvc3RuYW1lID09PSAnZWRpdG9yJykge1xuICAgIGNvbnN0IGVkaXRvcklkID0gcGFyc2VJbnQocGF0aG5hbWUuc2xpY2UoMSksIDEwKVxuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlXG4gICAgICAuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgLmZpbmQoKGVkKSA9PiBlZC5pZCA9PT0gZWRpdG9ySWQpXG4gICAgaWYgKGVkaXRvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgJ01hcmtkb3duLXByZXZpZXctcGx1czogVHJpZWQgdG8gb3BlbiBwcmV2aWV3ICcgK1xuICAgICAgICAgIGBmb3IgZWRpdG9yIHdpdGggaWQgJHtlZGl0b3JJZH0sIHdoaWNoIGRvZXMgbm90IGV4aXN0YCxcbiAgICAgIClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gICAgcmV0dXJuIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IuY3JlYXRlKGVkaXRvcilcbiAgfSBlbHNlIGlmICh1cmkuaG9zdG5hbWUgPT09ICdyZW1vdGUtZWRpdG9yJykge1xuICAgIGNvbnN0IFt3aW5kb3dJZCwgZWRpdG9ySWRdID0gcGF0aG5hbWVcbiAgICAgIC5zbGljZSgxKVxuICAgICAgLnNwbGl0KCcvJylcbiAgICAgIC5tYXAoKHgpID0+IHBhcnNlSW50KHgsIDEwKSlcbiAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3JSZW1vdGUod2luZG93SWQsIGVkaXRvcklkKVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBUcmllZCB0byBvcGVuIG1hcmtkb3duLXByZXZpZXctcGx1cyB3aXRoIHVyaSAke3VyaVRvT3Blbn0uIFRoaXMgaXMgbm90IHN1cHBvcnRlZC4gUGxlYXNlIHJlcG9ydCB0aGlzIGVycm9yLmAsXG4gICAgKVxuICB9XG59XG4iXX0=