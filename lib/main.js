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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFNYTtBQUNiLCtCQUE4QjtBQUM5Qix5REFBb0Q7QUFDcEQscURBQWdEO0FBQ2hELHFIQUE2RztBQUU3RyxtQ0FBaUM7QUFBeEIsMEJBQUEsTUFBTSxDQUFBO0FBRWYsSUFBSSxXQUE0QyxDQUFBO0FBRXpDLEtBQUssVUFBVSxRQUFRO0lBQzVCLElBQUksOEJBQWEsRUFBRSxFQUFFO1FBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4QixpRUFBaUU7WUFDL0QsMENBQTBDO1lBQzFDLHVDQUF1QyxFQUN6QyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FDdEIsQ0FBQTtLQUNGO0lBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQ3JELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0tBQzFEO0lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1FBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4Qiw4REFBOEQsRUFDOUQsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELFdBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFDdkMsV0FBVyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtRQUMxQyw4QkFBOEIsRUFBRSxLQUFLO0tBQ3RDLENBQUMsRUFDRixJQUFJLENBQUMsUUFBUSxD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dCB7XHJcbiAgU2VyaWFsaXplZE1QVixcclxuICBNYXJrZG93blByZXZpZXdWaWV3RmlsZSxcclxuICBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLFxyXG4gIE1hcmtkb3duUHJldmlld1ZpZXcsXHJcbn0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXHJcbi8vIGltcG9ydCBtYXRoamF4SGVscGVyID0gcmVxdWlyZSgnLi9tYXRoamF4LWhlbHBlcicpXHJcbmltcG9ydCB7XHJcbiAgVGV4dEVkaXRvcixcclxuICBXb3Jrc3BhY2VPcGVuT3B0aW9ucyxcclxuICBDb21tYW5kRXZlbnQsXHJcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcclxuICBDb250ZXh0TWVudU9wdGlvbnMsXHJcbn0gZnJvbSAnYXRvbSdcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXHJcbmltcG9ydCB7IFBsYWNlaG9sZGVyVmlldyB9IGZyb20gJy4vcGxhY2Vob2xkZXItdmlldydcclxuaW1wb3J0IHsgbWlncmF0ZUNvbmZpZyB9IGZyb20gJy4vbWlncmF0ZS1jb25maWcnXHJcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3JSZW1vdGUgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXctZWRpdG9yLXJlbW90ZSdcclxuXHJcbmV4cG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vY29uZmlnJ1xyXG5cclxubGV0IGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlIHwgdW5kZWZpbmVkXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgaWYgKG1pZ3JhdGVDb25maWcoKSkge1xyXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXHJcbiAgICAgICdNYXJrZG93bi1QcmVpdmV3LVBsdXMgaGFzIHVwZGF0ZWQgeW91ciBjb25maWcgdG8gYSBuZXcgZm9ybWF0LiAnICtcclxuICAgICAgICAnUGxlYXNlIGNoZWNrIGlmIGV2ZXJ5dGhpbmcgaXMgaW4gb3JkZXIuICcgK1xyXG4gICAgICAgICdUaGlzIG1lc3NhZ2Ugd2lsbCBub3QgYmUgc2hvd24gYWdhaW4uJyxcclxuICAgICAgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9LFxyXG4gICAgKVxyXG4gIH1cclxuICBpZiAoYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoJ21hcmtkb3duLXByZXZpZXcnKSkge1xyXG4gICAgYXdhaXQgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpXHJcbiAgfVxyXG4gIGlmICghYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VEaXNhYmxlZCgnbWFya2Rvd24tcHJldmlldycpKSB7XHJcbiAgICBhdG9tLnBhY2thZ2VzLmRpc2FibGVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3JylcclxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFxyXG4gICAgICAnTWFya2Rvd24tcHJldmlldy1wbHVzIGhhcyBkaXNhYmxlZCBtYXJrZG93bi1wcmV2aWV3IHBhY2thZ2UuJyxcclxuICAgICAgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9LFxyXG4gICAgKVxyXG4gIH1cclxuICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcclxuICBkaXNwb3NhYmxlcy5hZGQoXHJcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcclxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnOiBjbG9zZSxcclxuICAgIH0pLFxyXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xyXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnNlbGVjdC1zeW50YXgtdGhlbWUnOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHsgc2VsZWN0TGlzdFZpZXcgfSA9IGF3YWl0IGltcG9ydCgnLi9zZWxlY3QtbGlzdC12aWV3JylcclxuICAgICAgICAgIGNvbnN0IHRoZW1lTmFtZXMgPSBhdG9tLnRoZW1lcy5nZXRMb2FkZWRUaGVtZU5hbWVzKClcclxuICAgICAgICAgIGlmICh0aGVtZU5hbWVzID09PSB1bmRlZmluZWQpIHJldHVyblxyXG4gICAgICAgICAgY29uc3QgdGhlbWUgPSBhd2FpdCBzZWxlY3RMaXN0VmlldyhcclxuICAgICAgICAgICAgdGhlbWVOYW1lcy5maWx0ZXIoKHgpID0+IHgubWF0Y2goLy1zeW50YXgkLykpLFxyXG4gICAgICAgICAgKVxyXG4gICAgICAgICAgaWYgKHRoZW1lID09PSB1bmRlZmluZWQpIHJldHVyblxyXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3ludGF4VGhlbWVOYW1lJywgdGhlbWUpXHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgY29uc3QgZXJyID0gZSBhcyBFcnJvclxyXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IoZXJyLm5hbWUsIHtcclxuICAgICAgICAgICAgZGV0YWlsOiBlcnIubWVzc2FnZSxcclxuICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcclxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKGUpID0+IHtcclxuICAgICAgICBjb25zdCBlZGl0b3IgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxyXG4gICAgICAgIGNvbnN0IHZpZXcgPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLnZpZXdGb3JFZGl0b3IoZWRpdG9yKVxyXG4gICAgICAgIGlmICh2aWV3KSB2aWV3LnRvZ2dsZVJlbmRlckxhdGV4KClcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJy5tYXJrZG93bi1wcmV2aWV3LXBsdXMnLCB7XHJcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6IChlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmlldyA9IE1hcmtkb3duUHJldmlld1ZpZXcudmlld0ZvckVsZW1lbnQoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgIGlmICh2aWV3KSB2aWV3LnRvZ2dsZVJlbmRlckxhdGV4KClcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKG9wZW5lciksXHJcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxyXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmdyYW1tYXJzJyxcclxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJHcmFtbWFycyksXHJcbiAgICApLFxyXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcclxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJyxcclxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJFeHRlbnNpb25zKSxcclxuICAgICksXHJcbiAgKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcclxuICBkaXNwb3NhYmxlcyAmJiBkaXNwb3NhYmxlcy5kaXNwb3NlKClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hcmtkb3duUHJldmlld1ZpZXcoc3RhdGU6IFNlcmlhbGl6ZWRNUFYpIHtcclxuICBpZiAoc3RhdGUuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgcmV0dXJuIG5ldyBQbGFjZWhvbGRlclZpZXcoc3RhdGUuZWRpdG9ySWQpXHJcbiAgfSBlbHNlIGlmIChzdGF0ZS5maWxlUGF0aCAmJiB1dGlsLmlzRmlsZVN5bmMoc3RhdGUuZmlsZVBhdGgpKSB7XHJcbiAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdGaWxlKHN0YXRlLmZpbGVQYXRoKVxyXG4gIH1cclxuICByZXR1cm4gdW5kZWZpbmVkXHJcbn1cclxuXHJcbi8vLyBwcml2YXRlXHJcblxyXG5hc3luYyBmdW5jdGlvbiBjbG9zZShldmVudDogQ29tbWFuZEV2ZW50PEhUTUxFbGVtZW50Pik6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IGl0ZW0gPSBNYXJrZG93blByZXZpZXdWaWV3LnZpZXdGb3JFbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpXHJcbiAgaWYgKCFpdGVtKSByZXR1cm5cclxuICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcclxuICBpZiAoIXBhbmUpIHJldHVyblxyXG4gIGF3YWl0IHBhbmUuZGVzdHJveUl0ZW0oaXRlbSlcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gdG9nZ2xlKGVkaXRvcjogVGV4dEVkaXRvcikge1xyXG4gIGlmIChyZW1vdmVQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcikpIHJldHVybiB1bmRlZmluZWRcclxuICBlbHNlIHJldHVybiBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlUHJldmlld0ZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcclxuICBjb25zdCBpdGVtID0gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci52aWV3Rm9yRWRpdG9yKGVkaXRvcilcclxuICBpZiAoIWl0ZW0pIHJldHVybiBmYWxzZVxyXG4gIGNvbnN0IHByZXZpZXdQYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcclxuICBpZiAoIXByZXZpZXdQYW5lKSByZXR1cm4gZmFsc2VcclxuICBpZiAoaXRlbSAhPT0gcHJldmlld1BhbmUuZ2V0QWN0aXZlSXRlbSgpKSB7XHJcbiAgICBwcmV2aWV3UGFuZS5hY3RpdmF0ZUl0ZW0oaXRlbSlcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuICB1dGlsLmhhbmRsZVByb21pc2UocHJldmlld1BhbmUuZGVzdHJveUl0ZW0oaXRlbSkpXHJcbiAgcmV0dXJuIHRydWVcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcclxuICBjb25zdCBwcmV2aW91c0FjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcclxuICBjb25zdCBvcHRpb25zOiBXb3Jrc3BhY2VPcGVuT3B0aW9ucyA9IHsgc2VhcmNoQWxsUGFuZXM6IHRydWUgfVxyXG4gIGNvbnN0IHNwbGl0Q29uZmlnID0gdXRpbC5hdG9tQ29uZmlnKCkucHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyXHJcbiAgaWYgKHNwbGl0Q29uZmlnICE9PSAnbm9uZScpIHtcclxuICAgIG9wdGlvbnMuc3BsaXQgPSBzcGxpdENvbmZpZ1xyXG4gIH1cclxuICBjb25zdCByZXMgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKFxyXG4gICAgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5jcmVhdGUoZWRpdG9yKSxcclxuICAgIG9wdGlvbnMsXHJcbiAgKVxyXG4gIHByZXZpb3VzQWN0aXZlUGFuZS5hY3RpdmF0ZSgpXHJcbiAgcmV0dXJuIHJlc1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwcmV2aWV3RmlsZSh7IGN1cnJlbnRUYXJnZXQgfTogQ29tbWFuZEV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3QgZmlsZVBhdGggPSAoY3VycmVudFRhcmdldCBhcyBIVE1MRWxlbWVudCkuZGF0YXNldC5wYXRoXHJcbiAgaWYgKCFmaWxlUGF0aCkge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG5cclxuICBmb3IgKGNvbnN0IGVkaXRvciBvZiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpKSB7XHJcbiAgICBpZiAoZWRpdG9yLmdldFBhdGgoKSA9PT0gZmlsZVBhdGgpIHtcclxuICAgICAgYXdhaXQgYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihcclxuICAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9maWxlLyR7ZW5jb2RlVVJJKGZpbGVQYXRoKX1gLFxyXG4gICAge1xyXG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcclxuICAgIH0sXHJcbiAgKVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBjb3B5SHRtbEludGVybmFsKGVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHJlbmRlckxhVGVYID0gdXRpbC5hdG9tQ29uZmlnKCkubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdFxyXG4gIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkgfHwgZWRpdG9yLmdldFRleHQoKVxyXG4gIGF3YWl0IHV0aWwuY29weUh0bWwodGV4dCwgZWRpdG9yLmdldFBhdGgoKSwgcmVuZGVyTGFUZVgpXHJcbn1cclxuXHJcbnR5cGUgQ29udGV4dE1lbnUgPSB7IFtrZXk6IHN0cmluZ106IENvbnRleHRNZW51T3B0aW9uc1tdIH1cclxuXHJcbmZ1bmN0aW9uIGNvbmZpZ09ic2VydmVyPFQ+KFxyXG4gIGY6IChcclxuICAgIHZhbHVlOiBULFxyXG4gICAgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGUsXHJcbiAgICBjb250ZXh0TWVudTogQ29udGV4dE1lbnUsXHJcbiAgKSA9PiB2b2lkLFxyXG4pIHtcclxuICBsZXQgY29uZmlnRGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGVcclxuICByZXR1cm4gZnVuY3Rpb24odmFsdWU6IFQpIHtcclxuICAgIGlmICghZGlzcG9zYWJsZXMpIHJldHVyblxyXG4gICAgaWYgKGNvbmZpZ0Rpc3Bvc2FibGVzKSB7XHJcbiAgICAgIGNvbmZpZ0Rpc3Bvc2FibGVzLmRpc3Bvc2UoKVxyXG4gICAgICBkaXNwb3NhYmxlcy5yZW1vdmUoY29uZmlnRGlzcG9zYWJsZXMpXHJcbiAgICB9XHJcbiAgICBjb25maWdEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcclxuICAgIGNvbnN0IGNvbnRleHRNZW51OiBDb250ZXh0TWVudSA9IHt9XHJcbiAgICBmKHZhbHVlLCBjb25maWdEaXNwb3NhYmxlcywgY29udGV4dE1lbnUpXHJcbiAgICBjb25maWdEaXNwb3NhYmxlcy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoY29udGV4dE1lbnUpKVxyXG4gICAgZGlzcG9zYWJsZXMuYWRkKGNvbmZpZ0Rpc3Bvc2FibGVzKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVnaXN0ZXJFeHRlbnNpb25zKFxyXG4gIGV4dGVuc2lvbnM6IHN0cmluZ1tdLFxyXG4gIGRpc3A6IENvbXBvc2l0ZURpc3Bvc2FibGUsXHJcbiAgY206IENvbnRleHRNZW51LFxyXG4pIHtcclxuICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XHJcbiAgICBjb25zdCBzZWxlY3RvciA9IGAudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XCIuJHtleHR9XCJdYFxyXG4gICAgZGlzcC5hZGQoXHJcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxyXG4gICAgICAgIHNlbGVjdG9yLFxyXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJyxcclxuICAgICAgICBwcmV2aWV3RmlsZSxcclxuICAgICAgKSxcclxuICAgIClcclxuICAgIGNtW3NlbGVjdG9yXSA9IFtcclxuICAgICAge1xyXG4gICAgICAgIGxhYmVsOiAnTWFya2Rvd24gUHJldmlldycsXHJcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLFxyXG4gICAgICB9LFxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVnaXN0ZXJHcmFtbWFycyhcclxuICBncmFtbWFyczogc3RyaW5nW10sXHJcbiAgZGlzcDogQ29tcG9zaXRlRGlzcG9zYWJsZSxcclxuICBjbTogQ29udGV4dE1lbnUsXHJcbikge1xyXG4gIGZvciAoY29uc3QgZ3Igb2YgZ3JhbW1hcnMpIHtcclxuICAgIGNvbnN0IGdycyA9IGdyLnJlcGxhY2UoL1xcLi9nLCAnICcpXHJcbiAgICBjb25zdCBzZWxlY3RvciA9IGBhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcj1cIiR7Z3JzfVwiXWBcclxuICAgIGRpc3AuYWRkKFxyXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChzZWxlY3RvciBhcyAnYXRvbS10ZXh0LWVkaXRvcicsIHtcclxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSc6IChlKSA9PiB7XHJcbiAgICAgICAgICB1dGlsLmhhbmRsZVByb21pc2UodG9nZ2xlKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcclxuICAgICAgICB9LFxyXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Y29weS1odG1sJzogKGUpID0+IHtcclxuICAgICAgICAgIHV0aWwuaGFuZGxlUHJvbWlzZShjb3B5SHRtbEludGVybmFsKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcclxuICAgICAgICB9LFxyXG4gICAgICB9KSxcclxuICAgIClcclxuICAgIGNtW3NlbGVjdG9yXSA9IFtcclxuICAgICAge1xyXG4gICAgICAgIGxhYmVsOiAnU3luYyBQcmV2aWV3JyxcclxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtcHJldmlldycsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogJ0NvcHkgTWFya2Rvd24gYXMgSFRNTCcsXHJcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpjb3B5LWh0bWwnLFxyXG4gICAgICB9LFxyXG4gICAgXVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gb3BlbmVyKHVyaVRvT3Blbjogc3RyaW5nKSB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXIta2V5d29yZCBwcmVmZXItY29uc3RcclxuICAgIHZhciB1cmkgPSB1cmwucGFyc2UodXJpVG9PcGVuKVxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoZSwgdXJpVG9PcGVuKVxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgaWYgKHVyaS5wcm90b2NvbCAhPT0gJ21hcmtkb3duLXByZXZpZXctcGx1czonKSByZXR1cm4gdW5kZWZpbmVkXHJcbiAgaWYgKCF1cmkucGF0aG5hbWUpIHJldHVybiB1bmRlZmluZWRcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXIta2V5d29yZCBwcmVmZXItY29uc3RcclxuICAgIHZhciBwYXRobmFtZSA9IGRlY29kZVVSSSh1cmkucGF0aG5hbWUpXHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihlKVxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgaWYgKHVyaS5ob3N0bmFtZSA9PT0gJ2ZpbGUnKSB7XHJcbiAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdGaWxlKHBhdGhuYW1lLnNsaWNlKDEpKVxyXG4gIH0gZWxzZSBpZiAodXJpLmhvc3RuYW1lID09PSAncmVtb3RlLWVkaXRvcicpIHtcclxuICAgIGNvbnN0IFt3aW5kb3dJZCwgZWRpdG9ySWRdID0gcGF0aG5hbWVcclxuICAgICAgLnNsaWNlKDEpXHJcbiAgICAgIC5zcGxpdCgnLycpXHJcbiAgICAgIC5tYXAoKHgpID0+IHBhcnNlSW50KHgsIDEwKSlcclxuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvclJlbW90ZSh3aW5kb3dJZCwgZWRpdG9ySWQpXHJcbiAgfSBlbHNlIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgYFRyaWVkIHRvIG9wZW4gbWFya2Rvd24tcHJldmlldy1wbHVzIHdpdGggdXJpICR7dXJpVG9PcGVufS4gVGhpcyBpcyBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgcmVwb3J0IHRoaXMgZXJyb3IuYCxcclxuICAgIClcclxuICB9XHJcbn1cclxuIl19