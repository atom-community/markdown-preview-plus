"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const markdown_preview_view_1 = require("./markdown-preview-view");
const atom_1 = require("atom");
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
async function previewFile({ currentTarget }) {
    const filePath = currentTarget.dataset.path;
    if (!filePath) {
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
function registerExtensions(extensions, disp, cm) {
    for (const ext of extensions) {
        const selector = `.tree-view .file .name[data-name$=".${ext}"]`;
        disp.add(atom.commands.add(selector, 'markdown-preview-plus:preview-file', previewFile));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFNYTtBQUNiLCtCQUE4QjtBQUM5Qix5REFBb0Q7QUFDcEQscURBQWdEO0FBQ2hELHFIQUE2RztBQUU3RyxtQ0FBaUM7QUFBeEIsMEJBQUEsTUFBTSxDQUFBO0FBRWYsSUFBSSxXQUE0QyxDQUFBO0FBRXpDLEtBQUssVUFBVSxRQUFRO0lBQzVCLElBQUksOEJBQWEsRUFBRSxFQUFFO1FBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4QixpRUFBaUU7WUFDL0QsMENBQTBDO1lBQzFDLHVDQUF1QyxFQUN6QyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FDdEIsQ0FBQTtLQUNGO0lBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQ3JELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0tBQzFEO0lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1FBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4Qiw4REFBOEQsRUFDOUQsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELFdBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFDdkMsV0FBVyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtRQUMxQyw4QkFBOEIsRUFBRSxLQUFLO0tBQ3RDLENBQUMsRUFDRixJQUFJLENBQUMsUUFBUSxD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e1xuICBTZXJpYWxpemVkTVBWLFxuICBNYXJrZG93blByZXZpZXdWaWV3RmlsZSxcbiAgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvcixcbiAgTWFya2Rvd25QcmV2aWV3Vmlldyxcbn0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG4vLyBpbXBvcnQgbWF0aGpheEhlbHBlciA9IHJlcXVpcmUoJy4vbWF0aGpheC1oZWxwZXInKVxuaW1wb3J0IHtcbiAgVGV4dEVkaXRvcixcbiAgV29ya3NwYWNlT3Blbk9wdGlvbnMsXG4gIENvbW1hbmRFdmVudCxcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgQ29udGV4dE1lbnVPcHRpb25zLFxufSBmcm9tICdhdG9tJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBQbGFjZWhvbGRlclZpZXcgfSBmcm9tICcuL3BsYWNlaG9sZGVyLXZpZXcnXG5pbXBvcnQgeyBtaWdyYXRlQ29uZmlnIH0gZnJvbSAnLi9taWdyYXRlLWNvbmZpZydcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3JSZW1vdGUgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXctZWRpdG9yLXJlbW90ZSdcblxuZXhwb3J0IHsgY29uZmlnIH0gZnJvbSAnLi9jb25maWcnXG5cbmxldCBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZSB8IHVuZGVmaW5lZFxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGlmIChtaWdyYXRlQ29uZmlnKCkpIHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICdNYXJrZG93bi1QcmVpdmV3LVBsdXMgaGFzIHVwZGF0ZWQgeW91ciBjb25maWcgdG8gYSBuZXcgZm9ybWF0LiAnICtcbiAgICAgICAgJ1BsZWFzZSBjaGVjayBpZiBldmVyeXRoaW5nIGlzIGluIG9yZGVyLiAnICtcbiAgICAgICAgJ1RoaXMgbWVzc2FnZSB3aWxsIG5vdCBiZSBzaG93biBhZ2Fpbi4nLFxuICAgICAgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9LFxuICAgIClcbiAgfVxuICBpZiAoYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoJ21hcmtkb3duLXByZXZpZXcnKSkge1xuICAgIGF3YWl0IGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ21hcmtkb3duLXByZXZpZXcnKVxuICB9XG4gIGlmICghYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VEaXNhYmxlZCgnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAnTWFya2Rvd24tcHJldmlldy1wbHVzIGhhcyBkaXNhYmxlZCBtYXJrZG93bi1wcmV2aWV3IHBhY2thZ2UuJyxcbiAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSxcbiAgICApXG4gIH1cbiAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIGRpc3Bvc2FibGVzLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogY2xvc2UsXG4gICAgfSksXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzZWxlY3Qtc3ludGF4LXRoZW1lJzogYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgc2VsZWN0TGlzdFZpZXcgfSA9IGF3YWl0IGltcG9ydCgnLi9zZWxlY3QtbGlzdC12aWV3JylcbiAgICAgICAgICBjb25zdCB0aGVtZU5hbWVzID0gYXRvbS50aGVtZXMuZ2V0TG9hZGVkVGhlbWVOYW1lcygpXG4gICAgICAgICAgaWYgKHRoZW1lTmFtZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgICAgICAgY29uc3QgdGhlbWUgPSBhd2FpdCBzZWxlY3RMaXN0VmlldyhcbiAgICAgICAgICAgIHRoZW1lTmFtZXMuZmlsdGVyKCh4KSA9PiB4Lm1hdGNoKC8tc3ludGF4JC8pKSxcbiAgICAgICAgICApXG4gICAgICAgICAgaWYgKHRoZW1lID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bnRheFRoZW1lTmFtZScsIHRoZW1lKVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc3QgZXJyID0gZSBhcyBFcnJvclxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRGYXRhbEVycm9yKGVyci5uYW1lLCB7XG4gICAgICAgICAgICBkZXRhaWw6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKGUpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKClcbiAgICAgICAgY29uc3QgdmlldyA9IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3Iudmlld0ZvckVkaXRvcihlZGl0b3IpXG4gICAgICAgIGlmICh2aWV3KSB2aWV3LnRvZ2dsZVJlbmRlckxhdGV4KClcbiAgICAgIH0sXG4gICAgfSksXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJy5tYXJrZG93bi1wcmV2aWV3LXBsdXMnLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1yZW5kZXItbGF0ZXgnOiAoZSkgPT4ge1xuICAgICAgICBjb25zdCB2aWV3ID0gTWFya2Rvd25QcmV2aWV3Vmlldy52aWV3Rm9yRWxlbWVudChlLmN1cnJlbnRUYXJnZXQpXG4gICAgICAgIGlmICh2aWV3KSB2aWV3LnRvZ2dsZVJlbmRlckxhdGV4KClcbiAgICAgIH0sXG4gICAgfSksXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKG9wZW5lciksXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZ3JhbW1hcnMnLFxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJHcmFtbWFycyksXG4gICAgKSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJyxcbiAgICAgIGNvbmZpZ09ic2VydmVyKHJlZ2lzdGVyRXh0ZW5zaW9ucyksXG4gICAgKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgZGlzcG9zYWJsZXMgJiYgZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYXJrZG93blByZXZpZXdWaWV3KHN0YXRlOiBTZXJpYWxpemVkTVBWKSB7XG4gIGlmIChzdGF0ZS5lZGl0b3JJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBQbGFjZWhvbGRlclZpZXcoc3RhdGUuZWRpdG9ySWQpXG4gIH0gZWxzZSBpZiAoc3RhdGUuZmlsZVBhdGggJiYgdXRpbC5pc0ZpbGVTeW5jKHN0YXRlLmZpbGVQYXRoKSkge1xuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUoc3RhdGUuZmlsZVBhdGgpXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG4vLy8gcHJpdmF0ZVxuXG5hc3luYyBmdW5jdGlvbiBjbG9zZShldmVudDogQ29tbWFuZEV2ZW50PEhUTUxFbGVtZW50Pik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBpdGVtID0gTWFya2Rvd25QcmV2aWV3Vmlldy52aWV3Rm9yRWxlbWVudChldmVudC5jdXJyZW50VGFyZ2V0KVxuICBpZiAoIWl0ZW0pIHJldHVyblxuICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcbiAgaWYgKCFwYW5lKSByZXR1cm5cbiAgYXdhaXQgcGFuZS5kZXN0cm95SXRlbShpdGVtKVxufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGUoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGlmIChyZW1vdmVQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcikpIHJldHVybiB1bmRlZmluZWRcbiAgZWxzZSByZXR1cm4gYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByZXZpZXdGb3JFZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGNvbnN0IGl0ZW0gPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLnZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICBpZiAoIWl0ZW0pIHJldHVybiBmYWxzZVxuICBjb25zdCBwcmV2aWV3UGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGl0ZW0pXG4gIGlmICghcHJldmlld1BhbmUpIHJldHVybiBmYWxzZVxuICBpZiAoaXRlbSAhPT0gcHJldmlld1BhbmUuZ2V0QWN0aXZlSXRlbSgpKSB7XG4gICAgcHJldmlld1BhbmUuYWN0aXZhdGVJdGVtKGl0ZW0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgdXRpbC5oYW5kbGVQcm9taXNlKHByZXZpZXdQYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5hc3luYyBmdW5jdGlvbiBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICBjb25zdCBwcmV2aW91c0FjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgY29uc3Qgb3B0aW9uczogV29ya3NwYWNlT3Blbk9wdGlvbnMgPSB7IHNlYXJjaEFsbFBhbmVzOiB0cnVlIH1cbiAgY29uc3Qgc3BsaXRDb25maWcgPSB1dGlsLmF0b21Db25maWcoKS5wcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXJcbiAgaWYgKHNwbGl0Q29uZmlnICE9PSAnbm9uZScpIHtcbiAgICBvcHRpb25zLnNwbGl0ID0gc3BsaXRDb25maWdcbiAgfVxuICBjb25zdCByZXMgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKFxuICAgIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IuY3JlYXRlKGVkaXRvciksXG4gICAgb3B0aW9ucyxcbiAgKVxuICBwcmV2aW91c0FjdGl2ZVBhbmUuYWN0aXZhdGUoKVxuICByZXR1cm4gcmVzXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByZXZpZXdGaWxlKHsgY3VycmVudFRhcmdldCB9OiBDb21tYW5kRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgZmlsZVBhdGggPSAoY3VycmVudFRhcmdldCBhcyBIVE1MRWxlbWVudCkuZGF0YXNldC5wYXRoXG4gIGlmICghZmlsZVBhdGgpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICBpZiAoZWRpdG9yLmdldFBhdGgoKSA9PT0gZmlsZVBhdGgpIHtcbiAgICAgIGF3YWl0IGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihcbiAgICBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vZmlsZS8ke2VuY29kZVVSSShmaWxlUGF0aCl9YCxcbiAgICB7XG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICB9LFxuICApXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlIdG1sSW50ZXJuYWwoZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlbmRlckxhVGVYID0gdXRpbC5hdG9tQ29uZmlnKCkubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdFxuICBjb25zdCB0ZXh0ID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpIHx8IGVkaXRvci5nZXRUZXh0KClcbiAgYXdhaXQgdXRpbC5jb3B5SHRtbCh0ZXh0LCBlZGl0b3IuZ2V0UGF0aCgpLCByZW5kZXJMYVRlWClcbn1cblxudHlwZSBDb250ZXh0TWVudSA9IHsgW2tleTogc3RyaW5nXTogQ29udGV4dE1lbnVPcHRpb25zW10gfVxuXG5mdW5jdGlvbiBjb25maWdPYnNlcnZlcjxUPihcbiAgZjogKFxuICAgIHZhbHVlOiBULFxuICAgIGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICAgIGNvbnRleHRNZW51OiBDb250ZXh0TWVudSxcbiAgKSA9PiB2b2lkLFxuKSB7XG4gIGxldCBjb25maWdEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZVxuICByZXR1cm4gZnVuY3Rpb24odmFsdWU6IFQpIHtcbiAgICBpZiAoIWRpc3Bvc2FibGVzKSByZXR1cm5cbiAgICBpZiAoY29uZmlnRGlzcG9zYWJsZXMpIHtcbiAgICAgIGNvbmZpZ0Rpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZXMucmVtb3ZlKGNvbmZpZ0Rpc3Bvc2FibGVzKVxuICAgIH1cbiAgICBjb25maWdEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBjb25zdCBjb250ZXh0TWVudTogQ29udGV4dE1lbnUgPSB7fVxuICAgIGYodmFsdWUsIGNvbmZpZ0Rpc3Bvc2FibGVzLCBjb250ZXh0TWVudSlcbiAgICBjb25maWdEaXNwb3NhYmxlcy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoY29udGV4dE1lbnUpKVxuICAgIGRpc3Bvc2FibGVzLmFkZChjb25maWdEaXNwb3NhYmxlcylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlckV4dGVuc2lvbnMoXG4gIGV4dGVuc2lvbnM6IHN0cmluZ1tdLFxuICBkaXNwOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBjbTogQ29udGV4dE1lbnUsXG4pIHtcbiAgZm9yIChjb25zdCBleHQgb2YgZXh0ZW5zaW9ucykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gYC50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cIi4ke2V4dH1cIl1gXG4gICAgZGlzcC5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJyxcbiAgICAgICAgcHJldmlld0ZpbGUsXG4gICAgICApLFxuICAgIClcbiAgICBjbVtzZWxlY3Rvcl0gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnTWFya2Rvd24gUHJldmlldycsXG4gICAgICAgIGNvbW1hbmQ6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJyxcbiAgICAgIH0sXG4gICAgXVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyR3JhbW1hcnMoXG4gIGdyYW1tYXJzOiBzdHJpbmdbXSxcbiAgZGlzcDogQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgY206IENvbnRleHRNZW51LFxuKSB7XG4gIGZvciAoY29uc3QgZ3Igb2YgZ3JhbW1hcnMpIHtcbiAgICBjb25zdCBncnMgPSBnci5yZXBsYWNlKC9cXC4vZywgJyAnKVxuICAgIGNvbnN0IHNlbGVjdG9yID0gYGF0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyPVwiJHtncnN9XCJdYFxuICAgIGRpc3AuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoc2VsZWN0b3IgYXMgJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogKGUpID0+IHtcbiAgICAgICAgICB1dGlsLmhhbmRsZVByb21pc2UodG9nZ2xlKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpjb3B5LWh0bWwnOiAoZSkgPT4ge1xuICAgICAgICAgIHV0aWwuaGFuZGxlUHJvbWlzZShjb3B5SHRtbEludGVybmFsKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcbiAgICBjbVtzZWxlY3Rvcl0gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU3luYyBQcmV2aWV3JyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdDb3B5IE1hcmtkb3duIGFzIEhUTUwnLFxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOmNvcHktaHRtbCcsXG4gICAgICB9LFxuICAgIF1cbiAgfVxufVxuXG5mdW5jdGlvbiBvcGVuZXIodXJpVG9PcGVuOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLWtleXdvcmQgcHJlZmVyLWNvbnN0XG4gICAgdmFyIHVyaSA9IHVybC5wYXJzZSh1cmlUb09wZW4pXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUsIHVyaVRvT3BlbilcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAodXJpLnByb3RvY29sICE9PSAnbWFya2Rvd24tcHJldmlldy1wbHVzOicpIHJldHVybiB1bmRlZmluZWRcbiAgaWYgKCF1cmkucGF0aG5hbWUpIHJldHVybiB1bmRlZmluZWRcblxuICB0cnkge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXIta2V5d29yZCBwcmVmZXItY29uc3RcbiAgICB2YXIgcGF0aG5hbWUgPSBkZWNvZGVVUkkodXJpLnBhdGhuYW1lKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICh1cmkuaG9zdG5hbWUgPT09ICdmaWxlJykge1xuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUocGF0aG5hbWUuc2xpY2UoMSkpXG4gIH0gZWxzZSBpZiAodXJpLmhvc3RuYW1lID09PSAncmVtb3RlLWVkaXRvcicpIHtcbiAgICBjb25zdCBbd2luZG93SWQsIGVkaXRvcklkXSA9IHBhdGhuYW1lXG4gICAgICAuc2xpY2UoMSlcbiAgICAgIC5zcGxpdCgnLycpXG4gICAgICAubWFwKCh4KSA9PiBwYXJzZUludCh4LCAxMCkpXG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yUmVtb3RlKHdpbmRvd0lkLCBlZGl0b3JJZClcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVHJpZWQgdG8gb3BlbiBtYXJrZG93bi1wcmV2aWV3LXBsdXMgd2l0aCB1cmkgJHt1cmlUb09wZW59LiBUaGlzIGlzIG5vdCBzdXBwb3J0ZWQuIFBsZWFzZSByZXBvcnQgdGhpcyBlcnJvci5gLFxuICAgIClcbiAgfVxufVxuIl19