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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFNYTtBQUNiLDZCQUE0QjtBQUM1QiwrQkFBOEI7QUFDOUIseURBQW9EO0FBQ3BELHFEQUFnRDtBQUNoRCxxSEFBNkc7QUFFN0csbUNBQWlDO0FBQXhCLDBCQUFBLE1BQU0sQ0FBQTtBQUVmLElBQUksV0FBNEMsQ0FBQTtBQUV6QyxLQUFLLFVBQVUsUUFBUTtJQUM1QixJQUFJLDhCQUFhLEVBQUUsRUFBRTtRQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDeEIsaUVBQWlFO1lBQy9ELDBDQUEwQztZQUMxQyx1Q0FBdUMsRUFDekMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUNyRCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtLQUMxRDtJQUNELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLEVBQUU7UUFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDeEIsOERBQThELEVBQzlELEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUN0QixDQUFBO0tBQ0Y7SUFDRCxXQUFXLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO0lBQ3ZDLFdBQVcsQ0FBQyxHQUFHLENBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUU7UUFDMUMsOEJBQThCLEVBQUUsS0FBSztLQUN0QyxDQUFDLEVBQ0YsSUFB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LFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ2hELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTO2FBQzFCLGNBQWMsRUFBRTthQUNoQixJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUMzQiwrQ0FBK0M7Z0JBQzdDLHNCQUFzQixRQUFRLHdCQUF3QixDQUN6RCxDQUFBO1lBQ0QsT0FBTyxTQUFTLENBQUE7U0FDakI7UUFDRCxPQUFPLGlEQUF5QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUNoRDtTQUFNLElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSyxlQUFlLEVBQUU7UUFDM0MsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRO2FBQ2xDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDUixLQUFLLENBQUMsR0FBRyxDQUFDO2FBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDOUIsT0FBTyxJQUFJLHFFQUErQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMvRDtTQUFNO1FBQ0wsTUFBTSxJQUFJLEtBQUssQ0FDYixnREFBZ0QsU0FBUyxvREFBb0QsQ0FDOUcsQ0FBQTtLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1cmwgPSByZXF1aXJlKCd1cmwnKVxuaW1wb3J0IHtcbiAgU2VyaWFsaXplZE1QVixcbiAgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUsXG4gIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IsXG4gIE1hcmtkb3duUHJldmlld1ZpZXcsXG59IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuLy8gaW1wb3J0IG1hdGhqYXhIZWxwZXIgPSByZXF1aXJlKCcuL21hdGhqYXgtaGVscGVyJylcbmltcG9ydCB7XG4gIFRleHRFZGl0b3IsXG4gIFdvcmtzcGFjZU9wZW5PcHRpb25zLFxuICBDb21tYW5kRXZlbnQsXG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIENvbnRleHRNZW51T3B0aW9ucyxcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgUGxhY2Vob2xkZXJWaWV3IH0gZnJvbSAnLi9wbGFjZWhvbGRlci12aWV3J1xuaW1wb3J0IHsgbWlncmF0ZUNvbmZpZyB9IGZyb20gJy4vbWlncmF0ZS1jb25maWcnXG5pbXBvcnQgeyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yUmVtb3RlIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcvbWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci1yZW1vdGUnXG5cbmV4cG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vY29uZmlnJ1xuXG5sZXQgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGUgfCB1bmRlZmluZWRcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICBpZiAobWlncmF0ZUNvbmZpZygpKSB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAnTWFya2Rvd24tUHJlaXZldy1QbHVzIGhhcyB1cGRhdGVkIHlvdXIgY29uZmlnIHRvIGEgbmV3IGZvcm1hdC4gJyArXG4gICAgICAgICdQbGVhc2UgY2hlY2sgaWYgZXZlcnl0aGluZyBpcyBpbiBvcmRlci4gJyArXG4gICAgICAgICdUaGlzIG1lc3NhZ2Ugd2lsbCBub3QgYmUgc2hvd24gYWdhaW4uJyxcbiAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSxcbiAgICApXG4gIH1cbiAgaWYgKGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKCdtYXJrZG93bi1wcmV2aWV3JykpIHtcbiAgICBhd2FpdCBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3JylcbiAgfVxuICBpZiAoIWF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQoJ21hcmtkb3duLXByZXZpZXcnKSkge1xuICAgIGF0b20ucGFja2FnZXMuZGlzYWJsZVBhY2thZ2UoJ21hcmtkb3duLXByZXZpZXcnKVxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFxuICAgICAgJ01hcmtkb3duLXByZXZpZXctcGx1cyBoYXMgZGlzYWJsZWQgbWFya2Rvd24tcHJldmlldyBwYWNrYWdlLicsXG4gICAgICB7IGRpc21pc3NhYmxlOiB0cnVlIH0sXG4gICAgKVxuICB9XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICBkaXNwb3NhYmxlcy5hZGQoXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJy5tYXJrZG93bi1wcmV2aWV3LXBsdXMnLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSc6IGNsb3NlLFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c2VsZWN0LXN5bnRheC10aGVtZSc6IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IHNlbGVjdExpc3RWaWV3IH0gPSBhd2FpdCBpbXBvcnQoJy4vc2VsZWN0LWxpc3QtdmlldycpXG4gICAgICAgICAgY29uc3QgdGhlbWVOYW1lcyA9IGF0b20udGhlbWVzLmdldExvYWRlZFRoZW1lTmFtZXMoKVxuICAgICAgICAgIGlmICh0aGVtZU5hbWVzID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgICAgICAgIGNvbnN0IHRoZW1lID0gYXdhaXQgc2VsZWN0TGlzdFZpZXcoXG4gICAgICAgICAgICB0aGVtZU5hbWVzLmZpbHRlcigoeCkgPT4geC5tYXRjaCgvLXN5bnRheCQvKSksXG4gICAgICAgICAgKVxuICAgICAgICAgIGlmICh0aGVtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW50YXhUaGVtZU5hbWUnLCB0aGVtZSlcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnN0IGVyciA9IGUgYXMgRXJyb3JcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihlcnIubmFtZSwge1xuICAgICAgICAgICAgZGV0YWlsOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KSxcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpXG4gICAgICAgIGNvbnN0IHZpZXcgPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLnZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgICBpZiAodmlldykgdmlldy50b2dnbGVSZW5kZXJMYXRleCgpXG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCcubWFya2Rvd24tcHJldmlldy1wbHVzJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKGUpID0+IHtcbiAgICAgICAgY29uc3QgdmlldyA9IE1hcmtkb3duUHJldmlld1ZpZXcudmlld0ZvckVsZW1lbnQoZS5jdXJyZW50VGFyZ2V0KVxuICAgICAgICBpZiAodmlldykgdmlldy50b2dnbGVSZW5kZXJMYXRleCgpXG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCcudHJlZS12aWV3Jywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnOiBwcmV2aWV3RmlsZSxcbiAgICB9KSxcbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIob3BlbmVyKSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycycsXG4gICAgICBjb25maWdPYnNlcnZlcihyZWdpc3RlckdyYW1tYXJzKSxcbiAgICApLFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmV4dGVuc2lvbnMnLFxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJFeHRlbnNpb25zKSxcbiAgICApLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBkaXNwb3NhYmxlcyAmJiBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hcmtkb3duUHJldmlld1ZpZXcoc3RhdGU6IFNlcmlhbGl6ZWRNUFYpIHtcbiAgaWYgKHN0YXRlLmVkaXRvcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbmV3IFBsYWNlaG9sZGVyVmlldyhzdGF0ZS5lZGl0b3JJZClcbiAgfSBlbHNlIGlmIChzdGF0ZS5maWxlUGF0aCAmJiB1dGlsLmlzRmlsZVN5bmMoc3RhdGUuZmlsZVBhdGgpKSB7XG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RmlsZShzdGF0ZS5maWxlUGF0aClcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbi8vLyBwcml2YXRlXG5cbmFzeW5jIGZ1bmN0aW9uIGNsb3NlKGV2ZW50OiBDb21tYW5kRXZlbnQ8SFRNTEVsZW1lbnQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGl0ZW0gPSBNYXJrZG93blByZXZpZXdWaWV3LnZpZXdGb3JFbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpXG4gIGlmICghaXRlbSkgcmV0dXJuXG4gIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShpdGVtKVxuICBpZiAoIXBhbmUpIHJldHVyblxuICBhd2FpdCBwYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZShlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgaWYgKHJlbW92ZVByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKSkgcmV0dXJuIHVuZGVmaW5lZFxuICBlbHNlIHJldHVybiBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcbn1cblxuZnVuY3Rpb24gcmVtb3ZlUHJldmlld0ZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgY29uc3QgaXRlbSA9IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3Iudmlld0ZvckVkaXRvcihlZGl0b3IpXG4gIGlmICghaXRlbSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHByZXZpZXdQYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcbiAgaWYgKCFwcmV2aWV3UGFuZSkgcmV0dXJuIGZhbHNlXG4gIGlmIChpdGVtICE9PSBwcmV2aWV3UGFuZS5nZXRBY3RpdmVJdGVtKCkpIHtcbiAgICBwcmV2aWV3UGFuZS5hY3RpdmF0ZUl0ZW0oaXRlbSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICB1dGlsLmhhbmRsZVByb21pc2UocHJldmlld1BhbmUuZGVzdHJveUl0ZW0oaXRlbSkpXG4gIHJldHVybiB0cnVlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGNvbnN0IHByZXZpb3VzQWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICBjb25zdCBvcHRpb25zOiBXb3Jrc3BhY2VPcGVuT3B0aW9ucyA9IHsgc2VhcmNoQWxsUGFuZXM6IHRydWUgfVxuICBjb25zdCBzcGxpdENvbmZpZyA9IHV0aWwuYXRvbUNvbmZpZygpLnByZXZpZXdDb25maWcucHJldmlld1NwbGl0UGFuZURpclxuICBpZiAoc3BsaXRDb25maWcgIT09ICdub25lJykge1xuICAgIG9wdGlvbnMuc3BsaXQgPSBzcGxpdENvbmZpZ1xuICB9XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oXG4gICAgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5jcmVhdGUoZWRpdG9yKSxcbiAgICBvcHRpb25zLFxuICApXG4gIHByZXZpb3VzQWN0aXZlUGFuZS5hY3RpdmF0ZSgpXG4gIHJldHVybiByZXNcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJldmlld0ZpbGUoZXZ0OiBDb21tYW5kRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgeyBjdXJyZW50VGFyZ2V0IH0gPSBldnRcbiAgY29uc3QgZmlsZUVudHJ5ID0gKGN1cnJlbnRUYXJnZXQgYXMgSFRNTEVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3IoXG4gICAgJy5lbnRyeS5maWxlLnNlbGVjdGVkIC5uYW1lJyxcbiAgKVxuICBjb25zdCBmaWxlUGF0aCA9IChmaWxlRW50cnkgYXMgSFRNTEVsZW1lbnQpLmRhdGFzZXQucGF0aFxuICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgZXZ0LmFib3J0S2V5QmluZGluZygpXG4gICAgcmV0dXJuXG4gIH1cbiAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS5zdWJzdHIoMSlcbiAgY29uc3QgZXh0cyA9IHV0aWwuYXRvbUNvbmZpZygpLmV4dGVuc2lvbnNcbiAgaWYgKCFleHRzLmluY2x1ZGVzKGV4dCkpIHtcbiAgICBldnQuYWJvcnRLZXlCaW5kaW5nKClcbiAgICByZXR1cm5cbiAgfVxuXG4gIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICBpZiAoZWRpdG9yLmdldFBhdGgoKSA9PT0gZmlsZVBhdGgpIHtcbiAgICAgIGF3YWl0IGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihcbiAgICBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vZmlsZS8ke2VuY29kZVVSSShmaWxlUGF0aCl9YCxcbiAgICB7XG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICB9LFxuICApXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlIdG1sSW50ZXJuYWwoZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlbmRlckxhVGVYID0gdXRpbC5hdG9tQ29uZmlnKCkubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdFxuICBjb25zdCB0ZXh0ID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpIHx8IGVkaXRvci5nZXRUZXh0KClcbiAgYXdhaXQgdXRpbC5jb3B5SHRtbCh0ZXh0LCBlZGl0b3IuZ2V0UGF0aCgpLCByZW5kZXJMYVRlWClcbn1cblxudHlwZSBDb250ZXh0TWVudSA9IHsgW2tleTogc3RyaW5nXTogQ29udGV4dE1lbnVPcHRpb25zW10gfVxuXG5mdW5jdGlvbiBjb25maWdPYnNlcnZlcjxUPihcbiAgZjogKFxuICAgIHZhbHVlOiBULFxuICAgIGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICAgIGNvbnRleHRNZW51OiBDb250ZXh0TWVudSxcbiAgKSA9PiB2b2lkLFxuKSB7XG4gIGxldCBjb25maWdEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZVxuICByZXR1cm4gZnVuY3Rpb24odmFsdWU6IFQpIHtcbiAgICBpZiAoIWRpc3Bvc2FibGVzKSByZXR1cm5cbiAgICBpZiAoY29uZmlnRGlzcG9zYWJsZXMpIHtcbiAgICAgIGNvbmZpZ0Rpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZXMucmVtb3ZlKGNvbmZpZ0Rpc3Bvc2FibGVzKVxuICAgIH1cbiAgICBjb25maWdEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBjb25zdCBjb250ZXh0TWVudTogQ29udGV4dE1lbnUgPSB7fVxuICAgIGYodmFsdWUsIGNvbmZpZ0Rpc3Bvc2FibGVzLCBjb250ZXh0TWVudSlcbiAgICBjb25maWdEaXNwb3NhYmxlcy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoY29udGV4dE1lbnUpKVxuICAgIGRpc3Bvc2FibGVzLmFkZChjb25maWdEaXNwb3NhYmxlcylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlckV4dGVuc2lvbnMoZXh0ZW5zaW9uczogc3RyaW5nW10sIF86IGFueSwgY206IENvbnRleHRNZW51KSB7XG4gIGZvciAoY29uc3QgZXh0IG9mIGV4dGVuc2lvbnMpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IGAudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XCIuJHtleHR9XCJdYFxuICAgIGNtW3NlbGVjdG9yXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdNYXJrZG93biBQcmV2aWV3JyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLFxuICAgICAgfSxcbiAgICBdXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJHcmFtbWFycyhcbiAgZ3JhbW1hcnM6IHN0cmluZ1tdLFxuICBkaXNwOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBjbTogQ29udGV4dE1lbnUsXG4pIHtcbiAgZm9yIChjb25zdCBnciBvZiBncmFtbWFycykge1xuICAgIGNvbnN0IGdycyA9IGdyLnJlcGxhY2UoL1xcLi9nLCAnICcpXG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCIke2dyc31cIl1gXG4gICAgZGlzcC5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChzZWxlY3RvciBhcyAnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnOiAoZSkgPT4ge1xuICAgICAgICAgIHV0aWwuaGFuZGxlUHJvbWlzZSh0b2dnbGUoZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOmNvcHktaHRtbCc6IChlKSA9PiB7XG4gICAgICAgICAgdXRpbC5oYW5kbGVQcm9taXNlKGNvcHlIdG1sSW50ZXJuYWwoZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuICAgIGNtW3NlbGVjdG9yXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTeW5jIFByZXZpZXcnLFxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtcHJldmlldycsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0NvcHkgTWFya2Rvd24gYXMgSFRNTCcsXG4gICAgICAgIGNvbW1hbmQ6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Y29weS1odG1sJyxcbiAgICAgIH0sXG4gICAgXVxuICB9XG59XG5cbmZ1bmN0aW9uIG9wZW5lcih1cmlUb09wZW46IHN0cmluZykge1xuICB0cnkge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXIta2V5d29yZCBwcmVmZXItY29uc3RcbiAgICB2YXIgdXJpID0gdXJsLnBhcnNlKHVyaVRvT3BlbilcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSwgdXJpVG9PcGVuKVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICh1cmkucHJvdG9jb2wgIT09ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6JykgcmV0dXJuIHVuZGVmaW5lZFxuICBpZiAoIXVyaS5wYXRobmFtZSkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gIHRyeSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXZhci1rZXl3b3JkIHByZWZlci1jb25zdFxuICAgIHZhciBwYXRobmFtZSA9IGRlY29kZVVSSSh1cmkucGF0aG5hbWUpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKHVyaS5ob3N0bmFtZSA9PT0gJ2ZpbGUnKSB7XG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RmlsZShwYXRobmFtZS5zbGljZSgxKSlcbiAgfSBlbHNlIGlmICh1cmkuaG9zdG5hbWUgPT09ICdlZGl0b3InKSB7XG4gICAgY29uc3QgZWRpdG9ySWQgPSBwYXJzZUludChwYXRobmFtZS5zbGljZSgxKSwgMTApXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2VcbiAgICAgIC5nZXRUZXh0RWRpdG9ycygpXG4gICAgICAuZmluZCgoZWQpID0+IGVkLmlkID09PSBlZGl0b3JJZClcbiAgICBpZiAoZWRpdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAnTWFya2Rvd24tcHJldmlldy1wbHVzOiBUcmllZCB0byBvcGVuIHByZXZpZXcgJyArXG4gICAgICAgICAgYGZvciBlZGl0b3Igd2l0aCBpZCAke2VkaXRvcklkfSwgd2hpY2ggZG9lcyBub3QgZXhpc3RgLFxuICAgICAgKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICByZXR1cm4gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5jcmVhdGUoZWRpdG9yKVxuICB9IGVsc2UgaWYgKHVyaS5ob3N0bmFtZSA9PT0gJ3JlbW90ZS1lZGl0b3InKSB7XG4gICAgY29uc3QgW3dpbmRvd0lkLCBlZGl0b3JJZF0gPSBwYXRobmFtZVxuICAgICAgLnNsaWNlKDEpXG4gICAgICAuc3BsaXQoJy8nKVxuICAgICAgLm1hcCgoeCkgPT4gcGFyc2VJbnQoeCwgMTApKVxuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvclJlbW90ZSh3aW5kb3dJZCwgZWRpdG9ySWQpXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFRyaWVkIHRvIG9wZW4gbWFya2Rvd24tcHJldmlldy1wbHVzIHdpdGggdXJpICR7dXJpVG9PcGVufS4gVGhpcyBpcyBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgcmVwb3J0IHRoaXMgZXJyb3IuYCxcbiAgICApXG4gIH1cbn1cbiJdfQ==