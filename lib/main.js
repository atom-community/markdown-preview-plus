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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFNYTtBQUNiLCtCQUE4QjtBQUM5Qix5REFBb0Q7QUFDcEQscURBQWdEO0FBQ2hELHFIQUE2RztBQUU3RyxtQ0FBaUM7QUFBeEIsMEJBQUEsTUFBTSxDQUFBO0FBRWYsSUFBSSxXQUE0QyxDQUFBO0FBRXpDLEtBQUs7SUFDVixJQUFJLDhCQUFhLEVBQUUsRUFBRTtRQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDeEIsaUVBQWlFO1lBQy9ELDBDQUEwQztZQUMxQyx1Q0FBdUMsRUFDekMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUNyRCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtLQUMxRDtJQUNELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLEVBQUU7UUFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDeEIsOERBQThELEVBQzlELEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUN0QixDQUFBO0tBQ0Y7SUFDRCxXQUFXLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO0lBQ3ZDLFdBQVcsQ0FBQyxHQUFHLENBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUU7UUFDMUMsOEJBQThCLEVBQUUsS0FBSztLQUN0QyxDQUFDLEVBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENB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QUssQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDM0IsT0FBTyxTQUFTLENBQUE7S0FDakI7SUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssd0JBQXdCO1FBQUUsT0FBTyxTQUFTLENBQUE7SUFDL0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRO1FBQUUsT0FBTyxTQUFTLENBQUE7SUFFbkMsSUFBSTtRQUVGLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdkM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEIsT0FBTyxTQUFTLENBQUE7S0FDakI7SUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFFO1FBQzNCLE9BQU8sSUFBSSwrQ0FBdUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDdEQ7U0FBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssZUFBZSxFQUFFO1FBQzNDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEdBQUcsUUFBUTthQUNsQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQzthQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzlCLE9BQU8sSUFBSSxxRUFBK0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDL0Q7U0FBTTtRQUNMLE1BQU0sSUFBSSxLQUFLLENBQ2IsZ0RBQWdELFNBQVMsb0RBQW9ELENBQzlHLENBQUE7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdXJsID0gcmVxdWlyZSgndXJsJylcbmltcG9ydCB7XG4gIE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50LFxuICBTZXJpYWxpemVkTVBWLFxuICBNYXJrZG93blByZXZpZXdWaWV3RmlsZSxcbiAgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvcixcbn0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG4vLyBpbXBvcnQgbWF0aGpheEhlbHBlciA9IHJlcXVpcmUoJy4vbWF0aGpheC1oZWxwZXInKVxuaW1wb3J0IHtcbiAgVGV4dEVkaXRvcixcbiAgV29ya3NwYWNlT3Blbk9wdGlvbnMsXG4gIENvbW1hbmRFdmVudCxcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgQ29udGV4dE1lbnVPcHRpb25zLFxufSBmcm9tICdhdG9tJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBQbGFjZWhvbGRlclZpZXcgfSBmcm9tICcuL3BsYWNlaG9sZGVyLXZpZXcnXG5pbXBvcnQgeyBtaWdyYXRlQ29uZmlnIH0gZnJvbSAnLi9taWdyYXRlLWNvbmZpZydcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3JSZW1vdGUgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXctZWRpdG9yLXJlbW90ZSdcblxuZXhwb3J0IHsgY29uZmlnIH0gZnJvbSAnLi9jb25maWcnXG5cbmxldCBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZSB8IHVuZGVmaW5lZFxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGlmIChtaWdyYXRlQ29uZmlnKCkpIHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICdNYXJrZG93bi1QcmVpdmV3LVBsdXMgaGFzIHVwZGF0ZWQgeW91ciBjb25maWcgdG8gYSBuZXcgZm9ybWF0LiAnICtcbiAgICAgICAgJ1BsZWFzZSBjaGVjayBpZiBldmVyeXRoaW5nIGlzIGluIG9yZGVyLiAnICtcbiAgICAgICAgJ1RoaXMgbWVzc2FnZSB3aWxsIG5vdCBiZSBzaG93biBhZ2Fpbi4nLFxuICAgICAgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9LFxuICAgIClcbiAgfVxuICBpZiAoYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoJ21hcmtkb3duLXByZXZpZXcnKSkge1xuICAgIGF3YWl0IGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ21hcmtkb3duLXByZXZpZXcnKVxuICB9XG4gIGlmICghYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VEaXNhYmxlZCgnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAnTWFya2Rvd24tcHJldmlldy1wbHVzIGhhcyBkaXNhYmxlZCBtYXJrZG93bi1wcmV2aWV3IHBhY2thZ2UuJyxcbiAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSxcbiAgICApXG4gIH1cbiAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIGRpc3Bvc2FibGVzLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogY2xvc2UsXG4gICAgfSksXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1yZW5kZXItbGF0ZXgnOiAoZSkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICAgICAgICBjb25zdCB2aWV3ID0gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci52aWV3Rm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgaWYgKHZpZXcpIHZpZXcudG9nZ2xlUmVuZGVyTGF0ZXgoKVxuICAgICAgfSxcbiAgICB9KSxcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICAgICAgICB2aWV3LnRvZ2dsZVJlbmRlckxhdGV4KClcbiAgICAgIH0sXG4gICAgfSksXG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKG9wZW5lciksXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZ3JhbW1hcnMnLFxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJHcmFtbWFycyksXG4gICAgKSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJyxcbiAgICAgIGNvbmZpZ09ic2VydmVyKHJlZ2lzdGVyRXh0ZW5zaW9ucyksXG4gICAgKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgZGlzcG9zYWJsZXMgJiYgZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYXJrZG93blByZXZpZXdWaWV3KHN0YXRlOiBTZXJpYWxpemVkTVBWKSB7XG4gIGlmIChzdGF0ZS5lZGl0b3JJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBQbGFjZWhvbGRlclZpZXcoc3RhdGUuZWRpdG9ySWQpXG4gIH0gZWxzZSBpZiAoc3RhdGUuZmlsZVBhdGggJiYgdXRpbC5pc0ZpbGVTeW5jKHN0YXRlLmZpbGVQYXRoKSkge1xuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUoc3RhdGUuZmlsZVBhdGgpXG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG4vLy8gcHJpdmF0ZVxuXG5hc3luYyBmdW5jdGlvbiBjbG9zZShcbiAgZXZlbnQ6IENvbW1hbmRFdmVudDxNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudD4sXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgaXRlbSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcbiAgaWYgKCFwYW5lKSByZXR1cm5cbiAgYXdhaXQgcGFuZS5kZXN0cm95SXRlbShpdGVtKVxufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGUoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGlmIChyZW1vdmVQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcikpIHJldHVybiB1bmRlZmluZWRcbiAgZWxzZSByZXR1cm4gYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByZXZpZXdGb3JFZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGNvbnN0IGl0ZW0gPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLnZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICBpZiAoIWl0ZW0pIHJldHVybiBmYWxzZVxuICBjb25zdCBwcmV2aWV3UGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGl0ZW0pXG4gIGlmICghcHJldmlld1BhbmUpIHJldHVybiBmYWxzZVxuICBpZiAoaXRlbSAhPT0gcHJldmlld1BhbmUuZ2V0QWN0aXZlSXRlbSgpKSB7XG4gICAgcHJldmlld1BhbmUuYWN0aXZhdGVJdGVtKGl0ZW0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgdXRpbC5oYW5kbGVQcm9taXNlKHByZXZpZXdQYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5hc3luYyBmdW5jdGlvbiBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICBjb25zdCBwcmV2aW91c0FjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgY29uc3Qgb3B0aW9uczogV29ya3NwYWNlT3Blbk9wdGlvbnMgPSB7IHNlYXJjaEFsbFBhbmVzOiB0cnVlIH1cbiAgY29uc3Qgc3BsaXRDb25maWcgPSB1dGlsLmF0b21Db25maWcoKS5wcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXJcbiAgaWYgKHNwbGl0Q29uZmlnICE9PSAnbm9uZScpIHtcbiAgICBvcHRpb25zLnNwbGl0ID0gc3BsaXRDb25maWdcbiAgfVxuICBjb25zdCByZXMgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKFxuICAgIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IuY3JlYXRlKGVkaXRvciksXG4gICAgb3B0aW9ucyxcbiAgKVxuICBwcmV2aW91c0FjdGl2ZVBhbmUuYWN0aXZhdGUoKVxuICByZXR1cm4gcmVzXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByZXZpZXdGaWxlKHsgY3VycmVudFRhcmdldCB9OiBDb21tYW5kRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgZmlsZVBhdGggPSAoY3VycmVudFRhcmdldCBhcyBIVE1MRWxlbWVudCkuZGF0YXNldC5wYXRoXG4gIGlmICghZmlsZVBhdGgpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICBpZiAoZWRpdG9yLmdldFBhdGgoKSA9PT0gZmlsZVBhdGgpIHtcbiAgICAgIGF3YWl0IGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihcbiAgICBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vZmlsZS8ke2VuY29kZVVSSShmaWxlUGF0aCl9YCxcbiAgICB7XG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICB9LFxuICApXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlIdG1sSW50ZXJuYWwoZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlbmRlckxhVGVYID0gdXRpbC5hdG9tQ29uZmlnKCkubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdFxuICBjb25zdCB0ZXh0ID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpIHx8IGVkaXRvci5nZXRUZXh0KClcbiAgYXdhaXQgdXRpbC5jb3B5SHRtbCh0ZXh0LCBlZGl0b3IuZ2V0UGF0aCgpLCByZW5kZXJMYVRlWClcbn1cblxudHlwZSBDb250ZXh0TWVudSA9IHsgW2tleTogc3RyaW5nXTogQ29udGV4dE1lbnVPcHRpb25zW10gfVxuXG5mdW5jdGlvbiBjb25maWdPYnNlcnZlcjxUPihcbiAgZjogKFxuICAgIHZhbHVlOiBULFxuICAgIGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICAgIGNvbnRleHRNZW51OiBDb250ZXh0TWVudSxcbiAgKSA9PiB2b2lkLFxuKSB7XG4gIGxldCBjb25maWdEaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZVxuICByZXR1cm4gZnVuY3Rpb24odmFsdWU6IFQpIHtcbiAgICBpZiAoIWRpc3Bvc2FibGVzKSByZXR1cm5cbiAgICBpZiAoY29uZmlnRGlzcG9zYWJsZXMpIHtcbiAgICAgIGNvbmZpZ0Rpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgICAgZGlzcG9zYWJsZXMucmVtb3ZlKGNvbmZpZ0Rpc3Bvc2FibGVzKVxuICAgIH1cbiAgICBjb25maWdEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBjb25zdCBjb250ZXh0TWVudTogQ29udGV4dE1lbnUgPSB7fVxuICAgIGYodmFsdWUsIGNvbmZpZ0Rpc3Bvc2FibGVzLCBjb250ZXh0TWVudSlcbiAgICBjb25maWdEaXNwb3NhYmxlcy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoY29udGV4dE1lbnUpKVxuICAgIGRpc3Bvc2FibGVzLmFkZChjb25maWdEaXNwb3NhYmxlcylcbiAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlckV4dGVuc2lvbnMoXG4gIGV4dGVuc2lvbnM6IHN0cmluZ1tdLFxuICBkaXNwOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBjbTogQ29udGV4dE1lbnUsXG4pIHtcbiAgZm9yIChjb25zdCBleHQgb2YgZXh0ZW5zaW9ucykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gYC50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cIi4ke2V4dH1cIl1gXG4gICAgZGlzcC5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgc2VsZWN0b3IsXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJyxcbiAgICAgICAgcHJldmlld0ZpbGUsXG4gICAgICApLFxuICAgIClcbiAgICBjbVtzZWxlY3Rvcl0gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnTWFya2Rvd24gUHJldmlldycsXG4gICAgICAgIGNvbW1hbmQ6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJyxcbiAgICAgIH0sXG4gICAgXVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyR3JhbW1hcnMoXG4gIGdyYW1tYXJzOiBzdHJpbmdbXSxcbiAgZGlzcDogQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgY206IENvbnRleHRNZW51LFxuKSB7XG4gIGZvciAoY29uc3QgZ3Igb2YgZ3JhbW1hcnMpIHtcbiAgICBjb25zdCBncnMgPSBnci5yZXBsYWNlKC9cXC4vZywgJyAnKVxuICAgIGNvbnN0IHNlbGVjdG9yID0gYGF0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyPVwiJHtncnN9XCJdYFxuICAgIGRpc3AuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoc2VsZWN0b3IgYXMgJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogKGUpID0+IHtcbiAgICAgICAgICB1dGlsLmhhbmRsZVByb21pc2UodG9nZ2xlKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcbiAgICAgICAgfSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpjb3B5LWh0bWwnOiAoZSkgPT4ge1xuICAgICAgICAgIHV0aWwuaGFuZGxlUHJvbWlzZShjb3B5SHRtbEludGVybmFsKGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpKSlcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcbiAgICBjbVtzZWxlY3Rvcl0gPSBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU3luYyBQcmV2aWV3JyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnLFxuICAgICAgfSxcbiAgICBdXG4gIH1cbn1cblxuZnVuY3Rpb24gb3BlbmVyKHVyaVRvT3Blbjogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXZhci1rZXl3b3JkIHByZWZlci1jb25zdFxuICAgIHZhciB1cmkgPSB1cmwucGFyc2UodXJpVG9PcGVuKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLCB1cmlUb09wZW4pXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKHVyaS5wcm90b2NvbCAhPT0gJ21hcmtkb3duLXByZXZpZXctcGx1czonKSByZXR1cm4gdW5kZWZpbmVkXG4gIGlmICghdXJpLnBhdGhuYW1lKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgdHJ5IHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLWtleXdvcmQgcHJlZmVyLWNvbnN0XG4gICAgdmFyIHBhdGhuYW1lID0gZGVjb2RlVVJJKHVyaS5wYXRobmFtZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAodXJpLmhvc3RuYW1lID09PSAnZmlsZScpIHtcbiAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdGaWxlKHBhdGhuYW1lLnNsaWNlKDEpKVxuICB9IGVsc2UgaWYgKHVyaS5ob3N0bmFtZSA9PT0gJ3JlbW90ZS1lZGl0b3InKSB7XG4gICAgY29uc3QgW3dpbmRvd0lkLCBlZGl0b3JJZF0gPSBwYXRobmFtZVxuICAgICAgLnNsaWNlKDEpXG4gICAgICAuc3BsaXQoJy8nKVxuICAgICAgLm1hcCgoeCkgPT4gcGFyc2VJbnQoeCwgMTApKVxuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvclJlbW90ZSh3aW5kb3dJZCwgZWRpdG9ySWQpXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFRyaWVkIHRvIG9wZW4gbWFya2Rvd24tcHJldmlldy1wbHVzIHdpdGggdXJpICR7dXJpVG9PcGVufS4gVGhpcyBpcyBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgcmVwb3J0IHRoaXMgZXJyb3IuYCxcbiAgICApXG4gIH1cbn1cbiJdfQ==