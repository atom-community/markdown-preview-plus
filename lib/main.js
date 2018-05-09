"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const markdown_preview_view_1 = require("./markdown-preview-view");
const atom_1 = require("atom");
const util = require("./util");
const placeholder_view_1 = require("./placeholder-view");
const migrate_config_1 = require("./migrate-config");
var config_1 = require("./config");
exports.config = config_1.config;
let disposables;
async function activate() {
    if (migrate_config_1.migrateConfig()) {
        atom.notifications.addInfo('Markdown-Preivew-Plus has updated your config to a new format. ' +
            'Please check if everything is in order. ' +
            'This message will not be shown again.', { dismissable: true });
    }
    if (!atom.packages.isPackageDisabled('markdown-preview')) {
        atom.packages.disablePackage('markdown-preview');
        atom.notifications.addInfo('Markdown-preview-plus has disabled markdown-preview package.', { dismissable: true });
    }
    disposables = new atom_1.CompositeDisposable();
    disposables.add(atom.commands.add('.markdown-preview-plus', {
        'markdown-preview-plus:toggle': close,
    }), atom.commands.add('atom-text-editor', {
        'markdown-preview-plus:toggle-render-latex': (e) => {
            const editor = e.currentTarget.getModel();
            const view = markdown_preview_view_1.MarkdownPreviewViewEditor.viewForEditor(editor);
            if (view)
                view.toggleRenderLatex();
        },
    }), atom.commands.add('.markdown-preview-plus', {
        'markdown-preview-plus:toggle-render-latex': (e) => {
            const view = e.currentTarget.getModel();
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
    const item = event.currentTarget.getModel();
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
    else {
        throw new Error(`Tried to open markdown-preview-plus with uri ${uriToOpen}. This is not supported. Please report this error.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFNYTtBQUNiLCtCQUE4QjtBQUM5Qix5REFBb0Q7QUFDcEQscURBQWdEO0FBRWhELG1DQUFpQztBQUF4QiwwQkFBQSxNQUFNLENBQUE7QUFFZixJQUFJLFdBQTRDLENBQUE7QUFFekMsS0FBSztJQUNWLElBQUksOEJBQWEsRUFBRSxFQUFFO1FBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4QixpRUFBaUU7WUFDL0QsMENBQTBDO1lBQzFDLHVDQUF1QyxFQUN6QyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FDdEIsQ0FBQTtLQUNGO0lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1FBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4Qiw4REFBOEQsRUFDOUQsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELFdBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFDdkMsV0FBVyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtRQUMxQyw4QkFBOEIsRUFBRSxLQUFLO0tBQ3RDLENBQUMsRUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRTtRQUNwQywyQ0FBMkMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2pELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDekMsTUFBTSxJQUFJLEdBQUcsaURBQXlC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RyxDQUFDLFFBQVE7UUFBRSxPQUFPLFNBQVMsQ0FBQTtJQUVuQyxJQUFJO1FBRUYsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUN2QztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQixPQUFPLFNBQVMsQ0FBQTtLQUNqQjtJQUVELElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSyxNQUFNLEVBQUU7UUFDM0IsT0FBTyxJQUFJLCtDQUF1QixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUN0RDtTQUFNO1FBQ0wsTUFBTSxJQUFJLEtBQUssQ0FDYixnREFBZ0QsU0FBUyxvREFBb0QsQ0FDOUcsQ0FBQTtLQUNGO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1cmwgPSByZXF1aXJlKCd1cmwnKVxuaW1wb3J0IHtcbiAgTWFya2Rvd25QcmV2aWV3Vmlld0VsZW1lbnQsXG4gIFNlcmlhbGl6ZWRNUFYsXG4gIE1hcmtkb3duUHJldmlld1ZpZXdGaWxlLFxuICBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLFxufSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcbi8vIGltcG9ydCBtYXRoamF4SGVscGVyID0gcmVxdWlyZSgnLi9tYXRoamF4LWhlbHBlcicpXG5pbXBvcnQge1xuICBUZXh0RWRpdG9yLFxuICBXb3Jrc3BhY2VPcGVuT3B0aW9ucyxcbiAgQ29tbWFuZEV2ZW50LFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBDb250ZXh0TWVudU9wdGlvbnMsXG59IGZyb20gJ2F0b20nXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IFBsYWNlaG9sZGVyVmlldyB9IGZyb20gJy4vcGxhY2Vob2xkZXItdmlldydcbmltcG9ydCB7IG1pZ3JhdGVDb25maWcgfSBmcm9tICcuL21pZ3JhdGUtY29uZmlnJ1xuXG5leHBvcnQgeyBjb25maWcgfSBmcm9tICcuL2NvbmZpZydcblxubGV0IGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgaWYgKG1pZ3JhdGVDb25maWcoKSkge1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFxuICAgICAgJ01hcmtkb3duLVByZWl2ZXctUGx1cyBoYXMgdXBkYXRlZCB5b3VyIGNvbmZpZyB0byBhIG5ldyBmb3JtYXQuICcgK1xuICAgICAgICAnUGxlYXNlIGNoZWNrIGlmIGV2ZXJ5dGhpbmcgaXMgaW4gb3JkZXIuICcgK1xuICAgICAgICAnVGhpcyBtZXNzYWdlIHdpbGwgbm90IGJlIHNob3duIGFnYWluLicsXG4gICAgICB7IGRpc21pc3NhYmxlOiB0cnVlIH0sXG4gICAgKVxuICB9XG4gIGlmICghYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VEaXNhYmxlZCgnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAnTWFya2Rvd24tcHJldmlldy1wbHVzIGhhcyBkaXNhYmxlZCBtYXJrZG93bi1wcmV2aWV3IHBhY2thZ2UuJyxcbiAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSxcbiAgICApXG4gIH1cbiAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIGRpc3Bvc2FibGVzLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogY2xvc2UsXG4gICAgfSksXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1yZW5kZXItbGF0ZXgnOiAoZSkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICAgICAgICBjb25zdCB2aWV3ID0gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci52aWV3Rm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgaWYgKHZpZXcpIHZpZXcudG9nZ2xlUmVuZGVyTGF0ZXgoKVxuICAgICAgfSxcbiAgICB9KSxcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICAgICAgICB2aWV3LnRvZ2dsZVJlbmRlckxhdGV4KClcbiAgICAgIH0sXG4gICAgfSksXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKG9wZW5lciksXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZ3JhbW1hcnMnLFxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJHcmFtbWFycyksXG4gICAgKSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJyxcbiAgICAgIGNvbmZpZ09ic2VydmVyKHJlZ2lzdGVyRXh0ZW5zaW9ucyksXG4gICAgKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgZGlzcG9zYWJsZXMgJiYgZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYXJrZG93blByZXZpZXdWaWV3KHN0YXRlOiBTZXJpYWxpemVkTVBWKSB7XG4gIGlmIChzdGF0ZS5lZGl0b3JJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBQbGFjZWhvbGRlclZpZXcoc3RhdGUuZWRpdG9ySWQpXG4gIH0gZWxzZSBpZiAoc3RhdGUuZmlsZVBhdGggJiYgdXRpbC5pc0ZpbGVTeW5jKHN0YXRlLmZpbGVQYXRoKSkge1xuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUoc3RhdGUuZmlsZVBhdGgpXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG4vLy8gcHJpdmF0ZVxuXG5hc3luYyBmdW5jdGlvbiBjbG9zZShcbiAgZXZlbnQ6IENvbW1hbmRFdmVudDxNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudD4sXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgaXRlbSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcbiAgaWYgKCFwYW5lKSByZXR1cm5cbiAgYXdhaXQgcGFuZS5kZXN0cm95SXRlbShpdGVtKVxufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGUoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGlmIChyZW1vdmVQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcikpIHJldHVybiB1bmRlZmluZWRcbiAgZWxzZSByZXR1cm4gYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByZXZpZXdGb3JFZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGNvbnN0IGl0ZW0gPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLnZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICBpZiAoIWl0ZW0pIHJldHVybiBmYWxzZVxuICBjb25zdCBwcmV2aWV3UGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGl0ZW0pXG4gIGlmICghcHJldmlld1BhbmUpIHJldHVybiBmYWxzZVxuICBpZiAoaXRlbSAhPT0gcHJldmlld1BhbmUuZ2V0QWN0aXZlSXRlbSgpKSB7XG4gICAgcHJldmlld1BhbmUuYWN0aXZhdGVJdGVtKGl0ZW0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgdXRpbC5oYW5kbGVQcm9taXNlKHByZXZpZXdQYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5hc3luYyBmdW5jdGlvbiBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICBjb25zdCBwcmV2aW91c0FjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgY29uc3Qgb3B0aW9uczogV29ya3NwYWNlT3Blbk9wdGlvbnMgPSB7IHNlYXJjaEFsbFBhbmVzOiB0cnVlIH1cbiAgY29uc3Qgc3BsaXRDb25maWcgPSB1dGlsLmF0b21Db25maWcoKS5wcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXJcbiAgaWYgKHNwbGl0Q29uZmlnICE9PSAnbm9uZScpIHtcbiAgICBvcHRpb25zLnNwbGl0ID0gc3BsaXRDb25maWdcbiAgfVxuICBjb25zdCByZXMgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKFxuICAgIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IuY3JlYXRlKGVkaXRvciksXG4gICAgb3B0aW9ucyxcbiAgKVxuICBwcmV2aW91c0FjdGl2ZVBhbmUuYWN0aXZhdGUoKVxuICByZXR1cm4gcmVzXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByZXZpZXdGaWxlKHsgY3VycmVudFRhcmdldCB9OiBDb21tYW5kRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgZmlsZVBhdGggPSAoY3VycmVudFRhcmdldCBhcyBIVE1MRWxlbWVudCkuZGF0YXNldC5wYXRoXG4gIGlmICghZmlsZVBhdGgpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICBpZiAoZWRpdG9yLmdldFBhdGgoKSA9PT0gZmlsZVBhdGgpIHtcbiAgICAgIGF3YWl0IGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihcbiAgICBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vZmlsZS8ke2VuY29kZVVSSShmaWxlUGF0aCl9YCxcbiAgICB7XG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICB9LFxuICApXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlIdG1sSW50ZXJuYWwoZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlbmRlckxhVGVYID0gdXRpbC5hdG9tQ29uZmlnKCkubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdFxuICBjb25zdCB0ZXh0ID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpIHx8IGVkaXRvci5nZXRUZXh0KClcbiAgYXdhaXQgdXRpbC5jb3B5SHRtbCh0ZXh0LCBlZGl0b3IuZ2V0UGF0aCgpLCByZW5kZXJMYVRlWClcbn1cblxudHlwZSBDb250ZXh0TWVudSA9IHsgW2tleTogc3RyaW5nXTogQ29udGV4dE1lbnVPcHRpb25zW10gfVxuXG5mdW5jdGlvbiBjb25maWdPYnNlcnZlcjxUPihcbiAgZjogKFxuICAgIHZhbHVlOiBULFxuICAgIGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICAgIGNvbnRleHRNZW51OiBDb250ZXh0TWVudSxcbiAgKSA9PiB2b2lkLFxuKSB7XG4gIGxldCBjb25maWdEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZVxuICByZXR1cm4gZnVuY3Rpb24odmFsdWU6IFQpIHtcbiAgICBpZiAoIWRpc3Bvc2FibGVzKSByZXR1cm5cbiAgICBpZiAoY29uZmlnRGlzcG9zYWJsZXMpIHtcbiAgICAgIGNvbmZpZ0Rpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZXMucmVtb3ZlKGNvbmZpZ0Rpc3Bvc2FibGVzKVxuICAgIH1cbiAgICBjb25maWdEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBjb25zdCBjb250ZXh0TWVudTogQ29udGV4dE1lbnUgPSB7fVxuICAgIGYodmFsdWUsIGNvbmZpZ0Rpc3Bvc2FibGVzLCBjb250ZXh0TWVudSlcbiAgICBjb25maWdEaXNwb3NhYmxlcy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoY29udGV4dE1lbnUpKVxuICAgIGRpc3Bvc2FibGVzLmFkZChjb25maWdEaXNwb3NhYmxlcylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlckV4dGVuc2lvbnMoXG4gIGV4dGVuc2lvbnM6IHN0cmluZ1tdLFxuICBkaXNwOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBjbTogQ29udGV4dE1lbnUsXG4pIHtcbiAgZm9yIChjb25zdCBleHQgb2YgZXh0ZW5zaW9ucykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gYC50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cIi4ke2V4dH1cIl1gXG4gICAgZGlzcC5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJyxcbiAgICAgICAgcHJldmlld0ZpbGUsXG4gICAgICApLFxuICAgIClcbiAgICBjbVtzZWxlY3Rvcl0gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnTWFya2Rvd24gUHJldmlldycsXG4gICAgICAgIGNvbW1hbmQ6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJyxcbiAgICAgIH0sXG4gICAgXVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyR3JhbW1hcnMoXG4gIGdyYW1tYXJzOiBzdHJpbmdbXSxcbiAgZGlzcDogQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgY206IENvbnRleHRNZW51LFxuKSB7XG4gIGZvciAoY29uc3QgZ3Igb2YgZ3JhbW1hcnMpIHtcbiAgICBjb25zdCBncnMgPSBnci5yZXBsYWNlKC9cXC4vZywgJyAnKVxuICAgIGNvbnN0IHNlbGVjdG9yID0gYGF0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyPVwiJHtncnN9XCJdYFxuICAgIGRpc3AuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoc2VsZWN0b3IgYXMgJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogKGUpID0+IHtcbiAgICAgICAgICB1dGlsLmhhbmRsZVByb21pc2UodG9nZ2xlKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpjb3B5LWh0bWwnOiAoZSkgPT4ge1xuICAgICAgICAgIHV0aWwuaGFuZGxlUHJvbWlzZShjb3B5SHRtbEludGVybmFsKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcbiAgICBjbVtzZWxlY3Rvcl0gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU3luYyBQcmV2aWV3JyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnLFxuICAgICAgfSxcbiAgICBdXG4gIH1cbn1cblxuZnVuY3Rpb24gb3BlbmVyKHVyaVRvT3Blbjogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXZhci1rZXl3b3JkIHByZWZlci1jb25zdFxuICAgIHZhciB1cmkgPSB1cmwucGFyc2UodXJpVG9PcGVuKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLCB1cmlUb09wZW4pXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKHVyaS5wcm90b2NvbCAhPT0gJ21hcmtkb3duLXByZXZpZXctcGx1czonKSByZXR1cm4gdW5kZWZpbmVkXG4gIGlmICghdXJpLnBhdGhuYW1lKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgdHJ5IHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLWtleXdvcmQgcHJlZmVyLWNvbnN0XG4gICAgdmFyIHBhdGhuYW1lID0gZGVjb2RlVVJJKHVyaS5wYXRobmFtZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAodXJpLmhvc3RuYW1lID09PSAnZmlsZScpIHtcbiAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdGaWxlKHBhdGhuYW1lLnNsaWNlKDEpKVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBUcmllZCB0byBvcGVuIG1hcmtkb3duLXByZXZpZXctcGx1cyB3aXRoIHVyaSAke3VyaVRvT3Blbn0uIFRoaXMgaXMgbm90IHN1cHBvcnRlZC4gUGxlYXNlIHJlcG9ydCB0aGlzIGVycm9yLmAsXG4gICAgKVxuICB9XG59XG4iXX0=