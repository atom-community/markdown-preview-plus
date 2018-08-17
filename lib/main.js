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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFNYTtBQUNiLCtCQUE4QjtBQUM5Qix5REFBb0Q7QUFDcEQscURBQWdEO0FBQ2hELHFIQUE2RztBQUU3RyxtQ0FBaUM7QUFBeEIsMEJBQUEsTUFBTSxDQUFBO0FBRWYsSUFBSSxXQUE0QyxDQUFBO0FBRXpDLEtBQUssVUFBVSxRQUFRO0lBQzVCLElBQUksOEJBQWEsRUFBRSxFQUFFO1FBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4QixpRUFBaUU7WUFDL0QsMENBQTBDO1lBQzFDLHVDQUF1QyxFQUN6QyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FDdEIsQ0FBQTtLQUNGO0lBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQ3JELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0tBQzFEO0lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1FBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4Qiw4REFBOEQsRUFDOUQsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELFdBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFDdkMsV0FBVyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtRQUMxQyw4QkFBOEIsRUFBRSxLQUFLO0tBQ3RDLENBQUMsRUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRTtRQUNwQywyQ0FBMkMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2pELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDekMsTUFBTSxJQUFJLEdBQUcsaURBQXlCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzVELElBQUksSUFBSTtnQkFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtRQUNwQyxDQUFDO0tBQ0YsQ0FBQyxFQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFO1FBQzFDLDJDQUEyQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDakQsTUFBTSxJQUFJLEdBQUcsMkNBQW1CLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQTtZQUNoRSxJQUFJLElBQUk7Z0JBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7UUFDcEMsQ0FBQztLQUNGLENBQUMsRUFDRixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQ2pCLGdDQUFnQyxFQUNoQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FDakMsRUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FDakIsa0NBQWtDLEVBQ2xDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUNuQyxDQUNGLENBQUE7QUFDSCxDQUFDO0FBL0NELDRCQStDQztBQUVELFNBQWdCLFVBQVU7SUFDeEIsV0FBVyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN0QyxDQUFDO0FBRkQsZ0NBRUM7QUFFRCxTQUFnQix5QkFBeUIsQ0FBQyxLQUFvQjtJQUM1RCxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1FBQ2hDLE9BQU8sSUFBSSxrQ0FBZSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMzQztTQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUM1RCxPQUFPLElBQUksK0NBQXVCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ25EO0lBQ0QsT0FBTyxTQUFTLENBQUE7QUFDbEIsQ0FBQztBQVBELDhEQU9DO0FBSUQsS0FBSyxVQUFVLEtBQUssQ0FBQyxLQUFnQztJQUNuRCxNQUFNLElBQUksR0FBRywyQ0FBbUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ3BFLElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTTtJQUNqQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU07SUFDakIsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzlCLENBQUM7QUFFRCxLQUFLLFVBQVUsTUFBTSxDQUFDLE1BQWtCO0lBQ3RDLElBQUksc0JBQXNCLENBQUMsTUFBTSxDQUFDO1FBQUUsT0FBTyxTQUFTLENBQUE7O1FBQy9DLE9BQU8sbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDekMsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQUMsTUFBa0I7SUFDaEQsTUFBTSxJQUFJLEdBQUcsaURBQXlCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzVELElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTyxLQUFLLENBQUE7SUFDdkIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDcEQsSUFBSSxDQUFDLFdBQVc7UUFBRSxPQUFPLEtBQUssQ0FBQTtJQUM5QixJQUFJLElBQUksS0FBSyxXQUFXLENBQUMsYUFBYSxFQUFFLEVBQUU7UUFDeEMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QixPQUFPLEtBQUssQ0FBQTtLQUNiO0lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDakQsT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDO0FBRUQsS0FBSyxVQUFVLG1CQUFtQixDQUFDLE1BQWtCO0lBQ25ELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtJQUN6RCxNQUFNLE9BQU8sR0FBeUIsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFDOUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQTtJQUN2RSxJQUFJLFdBQVcsS0FBSyxNQUFNLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUE7S0FDNUI7SUFDRCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUNuQyxpREFBeUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQ3hDLE9BQU8sQ0FDUixDQUFBO0lBQ0Qsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDN0IsT0FBTyxHQUFHLENBQUE7QUFDWixDQUFDO0FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxFQUFFLGFBQWEsRUFBZ0I7SUFDeEQsTUFBTSxRQUFRLEdBQUksYUFBNkIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFBO0lBQzVELElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDYixPQUFNO0tBQ1A7SUFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUU7UUFDcEQsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFO1lBQ2pDLE1BQU0sbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDakMsT0FBTTtTQUNQO0tBQ0Y7SUFFRCxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUN2QixnQ0FBZ0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQ3JEO1FBQ0UsY0FBYyxFQUFFLElBQUk7S0FDckIsQ0FDRixDQUFBO0FBQ0gsQ0FBQztBQUVELEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxNQUFrQjtJQUNoRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsVUFBVSxDQUFDLDZCQUE2QixDQUFBO0lBQzlFLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDekQsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDMUQsQ0FBQztBQUlELFNBQVMsY0FBYyxDQUNyQixDQUlTO0lBRVQsSUFBSSxpQkFBc0MsQ0FBQTtJQUMxQyxPQUFPLFVBQVMsS0FBUTtRQUN0QixJQUFJLENBQUMsV0FBVztZQUFFLE9BQU07UUFDeEIsSUFBSSxpQkFBaUIsRUFBRTtZQUNyQixpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtZQUMzQixXQUFXLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUE7U0FDdEM7UUFDRCxpQkFBaUIsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7UUFDN0MsTUFBTSxXQUFXLEdBQWdCLEVBQUUsQ0FBQTtRQUNuQyxDQUFDLENBQUMsS0FBSyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBQ3hDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFBO1FBQ3hELFdBQVcsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtJQUNwQyxDQUFDLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FDekIsVUFBb0IsRUFDcEIsSUFBeUIsRUFDekIsRUFBZTtJQUVmLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFO1FBQzVCLE1BQU0sUUFBUSxHQUFHLHVDQUF1QyxHQUFHLElBQUksQ0FBQTtRQUMvRCxJQUFJLENBQUMsR0FBRyxDQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNmLFFBQVEsRUFDUixvQ0FBb0MsRUFDcEMsV0FBVyxDQUNaLENBQ0YsQ0FBQTtRQUNELEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRztZQUNiO2dCQUNFLEtBQUssRUFBRSxrQkFBa0I7Z0JBQ3pCLE9BQU8sRUFBRSxvQ0FBb0M7YUFDOUM7U0FDRixDQUFBO0tBQ0Y7QUFDSCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FDdkIsUUFBa0IsRUFDbEIsSUFBeUIsRUFDekIsRUFBZTtJQUVmLEtBQUssTUFBTSxFQUFFLElBQUksUUFBUSxFQUFFO1FBQ3pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLGtDQUFrQyxHQUFHLElBQUksQ0FBQTtRQUMxRCxJQUFJLENBQUMsR0FBRyxDQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQThCLEVBQUU7WUFDaEQsOEJBQThCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDeEQsQ0FBQztZQUNELGlDQUFpQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDbEUsQ0FBQztTQUNGLENBQUMsQ0FDSCxDQUFBO1FBQ0QsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHO1lBQ2I7Z0JBQ0UsS0FBSyxFQUFFLGNBQWM7Z0JBQ3JCLE9BQU8sRUFBRSxvQ0FBb0M7YUFDOUM7U0FDRixDQUFBO0tBQ0Y7QUFDSCxDQUFDO0FBRUQsU0FBUyxNQUFNLENBQUMsU0FBaUI7SUFDL0IsSUFBSTtRQUVGLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDL0I7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQzNCLE9BQU8sU0FBUyxDQUFBO0tBQ2pCO0lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLHdCQUF3QjtRQUFFLE9BQU8sU0FBUyxDQUFBO0lBQy9ELElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUTtRQUFFLE9BQU8sU0FBUyxDQUFBO0lBRW5DLElBQUk7UUFFRixJQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hCLE9BQU8sU0FBUyxDQUFBO0tBQ2pCO0lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRTtRQUMzQixPQUFPLElBQUksK0NBQXVCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3REO1NBQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLGVBQWUsRUFBRTtRQUMzQyxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxHQUFHLFFBQVE7YUFDbEMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNSLEtBQUssQ0FBQyxHQUFHLENBQUM7YUFDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM5QixPQUFPLElBQUkscUVBQStCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQy9EO1NBQU07UUFDTCxNQUFNLElBQUksS0FBSyxDQUNiLGdEQUFnRCxTQUFTLG9EQUFvRCxDQUM5RyxDQUFBO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHVybCA9IHJlcXVpcmUoJ3VybCcpXG5pbXBvcnQge1xuICBTZXJpYWxpemVkTVBWLFxuICBNYXJrZG93blByZXZpZXdWaWV3RmlsZSxcbiAgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvcixcbiAgTWFya2Rvd25QcmV2aWV3Vmlldyxcbn0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG4vLyBpbXBvcnQgbWF0aGpheEhlbHBlciA9IHJlcXVpcmUoJy4vbWF0aGpheC1oZWxwZXInKVxuaW1wb3J0IHtcbiAgVGV4dEVkaXRvcixcbiAgV29ya3NwYWNlT3Blbk9wdGlvbnMsXG4gIENvbW1hbmRFdmVudCxcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgQ29udGV4dE1lbnVPcHRpb25zLFxufSBmcm9tICdhdG9tJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBQbGFjZWhvbGRlclZpZXcgfSBmcm9tICcuL3BsYWNlaG9sZGVyLXZpZXcnXG5pbXBvcnQgeyBtaWdyYXRlQ29uZmlnIH0gZnJvbSAnLi9taWdyYXRlLWNvbmZpZydcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3JSZW1vdGUgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldy9tYXJrZG93bi1wcmV2aWV3LXZpZXctZWRpdG9yLXJlbW90ZSdcblxuZXhwb3J0IHsgY29uZmlnIH0gZnJvbSAnLi9jb25maWcnXG5cbmxldCBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZSB8IHVuZGVmaW5lZFxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIGlmIChtaWdyYXRlQ29uZmlnKCkpIHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICdNYXJrZG93bi1QcmVpdmV3LVBsdXMgaGFzIHVwZGF0ZWQgeW91ciBjb25maWcgdG8gYSBuZXcgZm9ybWF0LiAnICtcbiAgICAgICAgJ1BsZWFzZSBjaGVjayBpZiBldmVyeXRoaW5nIGlzIGluIG9yZGVyLiAnICtcbiAgICAgICAgJ1RoaXMgbWVzc2FnZSB3aWxsIG5vdCBiZSBzaG93biBhZ2Fpbi4nLFxuICAgICAgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9LFxuICAgIClcbiAgfVxuICBpZiAoYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUoJ21hcmtkb3duLXByZXZpZXcnKSkge1xuICAgIGF3YWl0IGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UoJ21hcmtkb3duLXByZXZpZXcnKVxuICB9XG4gIGlmICghYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VEaXNhYmxlZCgnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAnTWFya2Rvd24tcHJldmlldy1wbHVzIGhhcyBkaXNhYmxlZCBtYXJrZG93bi1wcmV2aWV3IHBhY2thZ2UuJyxcbiAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSxcbiAgICApXG4gIH1cbiAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gIGRpc3Bvc2FibGVzLmFkZChcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogY2xvc2UsXG4gICAgfSksXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1yZW5kZXItbGF0ZXgnOiAoZSkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICAgICAgICBjb25zdCB2aWV3ID0gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci52aWV3Rm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgaWYgKHZpZXcpIHZpZXcudG9nZ2xlUmVuZGVyTGF0ZXgoKVxuICAgICAgfSxcbiAgICB9KSxcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSBNYXJrZG93blByZXZpZXdWaWV3LnZpZXdGb3JFbGVtZW50KGUuY3VycmVudFRhcmdldClcbiAgICAgICAgaWYgKHZpZXcpIHZpZXcudG9nZ2xlUmVuZGVyTGF0ZXgoKVxuICAgICAgfSxcbiAgICB9KSxcbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIob3BlbmVyKSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycycsXG4gICAgICBjb25maWdPYnNlcnZlcihyZWdpc3RlckdyYW1tYXJzKSxcbiAgICApLFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmV4dGVuc2lvbnMnLFxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJFeHRlbnNpb25zKSxcbiAgICApLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBkaXNwb3NhYmxlcyAmJiBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hcmtkb3duUHJldmlld1ZpZXcoc3RhdGU6IFNlcmlhbGl6ZWRNUFYpIHtcbiAgaWYgKHN0YXRlLmVkaXRvcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbmV3IFBsYWNlaG9sZGVyVmlldyhzdGF0ZS5lZGl0b3JJZClcbiAgfSBlbHNlIGlmIChzdGF0ZS5maWxlUGF0aCAmJiB1dGlsLmlzRmlsZVN5bmMoc3RhdGUuZmlsZVBhdGgpKSB7XG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RmlsZShzdGF0ZS5maWxlUGF0aClcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbi8vLyBwcml2YXRlXG5cbmFzeW5jIGZ1bmN0aW9uIGNsb3NlKGV2ZW50OiBDb21tYW5kRXZlbnQ8SFRNTEVsZW1lbnQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGl0ZW0gPSBNYXJrZG93blByZXZpZXdWaWV3LnZpZXdGb3JFbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpXG4gIGlmICghaXRlbSkgcmV0dXJuXG4gIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShpdGVtKVxuICBpZiAoIXBhbmUpIHJldHVyblxuICBhd2FpdCBwYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZShlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgaWYgKHJlbW92ZVByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKSkgcmV0dXJuIHVuZGVmaW5lZFxuICBlbHNlIHJldHVybiBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcbn1cblxuZnVuY3Rpb24gcmVtb3ZlUHJldmlld0ZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgY29uc3QgaXRlbSA9IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3Iudmlld0ZvckVkaXRvcihlZGl0b3IpXG4gIGlmICghaXRlbSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHByZXZpZXdQYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcbiAgaWYgKCFwcmV2aWV3UGFuZSkgcmV0dXJuIGZhbHNlXG4gIGlmIChpdGVtICE9PSBwcmV2aWV3UGFuZS5nZXRBY3RpdmVJdGVtKCkpIHtcbiAgICBwcmV2aWV3UGFuZS5hY3RpdmF0ZUl0ZW0oaXRlbSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICB1dGlsLmhhbmRsZVByb21pc2UocHJldmlld1BhbmUuZGVzdHJveUl0ZW0oaXRlbSkpXG4gIHJldHVybiB0cnVlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGNvbnN0IHByZXZpb3VzQWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICBjb25zdCBvcHRpb25zOiBXb3Jrc3BhY2VPcGVuT3B0aW9ucyA9IHsgc2VhcmNoQWxsUGFuZXM6IHRydWUgfVxuICBjb25zdCBzcGxpdENvbmZpZyA9IHV0aWwuYXRvbUNvbmZpZygpLnByZXZpZXdDb25maWcucHJldmlld1NwbGl0UGFuZURpclxuICBpZiAoc3BsaXRDb25maWcgIT09ICdub25lJykge1xuICAgIG9wdGlvbnMuc3BsaXQgPSBzcGxpdENvbmZpZ1xuICB9XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oXG4gICAgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5jcmVhdGUoZWRpdG9yKSxcbiAgICBvcHRpb25zLFxuICApXG4gIHByZXZpb3VzQWN0aXZlUGFuZS5hY3RpdmF0ZSgpXG4gIHJldHVybiByZXNcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJldmlld0ZpbGUoeyBjdXJyZW50VGFyZ2V0IH06IENvbW1hbmRFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBmaWxlUGF0aCA9IChjdXJyZW50VGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5kYXRhc2V0LnBhdGhcbiAgaWYgKCFmaWxlUGF0aCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZm9yIChjb25zdCBlZGl0b3Igb2YgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSkge1xuICAgIGlmIChlZGl0b3IuZ2V0UGF0aCgpID09PSBmaWxlUGF0aCkge1xuICAgICAgYXdhaXQgYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKFxuICAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9maWxlLyR7ZW5jb2RlVVJJKGZpbGVQYXRoKX1gLFxuICAgIHtcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgIH0sXG4gIClcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weUh0bWxJbnRlcm5hbChlZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcmVuZGVyTGFUZVggPSB1dGlsLmF0b21Db25maWcoKS5tYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0XG4gIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkgfHwgZWRpdG9yLmdldFRleHQoKVxuICBhd2FpdCB1dGlsLmNvcHlIdG1sKHRleHQsIGVkaXRvci5nZXRQYXRoKCksIHJlbmRlckxhVGVYKVxufVxuXG50eXBlIENvbnRleHRNZW51ID0geyBba2V5OiBzdHJpbmddOiBDb250ZXh0TWVudU9wdGlvbnNbXSB9XG5cbmZ1bmN0aW9uIGNvbmZpZ09ic2VydmVyPFQ+KFxuICBmOiAoXG4gICAgdmFsdWU6IFQsXG4gICAgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gICAgY29udGV4dE1lbnU6IENvbnRleHRNZW51LFxuICApID0+IHZvaWQsXG4pIHtcbiAgbGV0IGNvbmZpZ0Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZTogVCkge1xuICAgIGlmICghZGlzcG9zYWJsZXMpIHJldHVyblxuICAgIGlmIChjb25maWdEaXNwb3NhYmxlcykge1xuICAgICAgY29uZmlnRGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgICBkaXNwb3NhYmxlcy5yZW1vdmUoY29uZmlnRGlzcG9zYWJsZXMpXG4gICAgfVxuICAgIGNvbmZpZ0Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGNvbnN0IGNvbnRleHRNZW51OiBDb250ZXh0TWVudSA9IHt9XG4gICAgZih2YWx1ZSwgY29uZmlnRGlzcG9zYWJsZXMsIGNvbnRleHRNZW51KVxuICAgIGNvbmZpZ0Rpc3Bvc2FibGVzLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZChjb250ZXh0TWVudSkpXG4gICAgZGlzcG9zYWJsZXMuYWRkKGNvbmZpZ0Rpc3Bvc2FibGVzKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyRXh0ZW5zaW9ucyhcbiAgZXh0ZW5zaW9uczogc3RyaW5nW10sXG4gIGRpc3A6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIGNtOiBDb250ZXh0TWVudSxcbikge1xuICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVwiLiR7ZXh0fVwiXWBcbiAgICBkaXNwLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLFxuICAgICAgICBwcmV2aWV3RmlsZSxcbiAgICAgICksXG4gICAgKVxuICAgIGNtW3NlbGVjdG9yXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdNYXJrZG93biBQcmV2aWV3JyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLFxuICAgICAgfSxcbiAgICBdXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJHcmFtbWFycyhcbiAgZ3JhbW1hcnM6IHN0cmluZ1tdLFxuICBkaXNwOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBjbTogQ29udGV4dE1lbnUsXG4pIHtcbiAgZm9yIChjb25zdCBnciBvZiBncmFtbWFycykge1xuICAgIGNvbnN0IGdycyA9IGdyLnJlcGxhY2UoL1xcLi9nLCAnICcpXG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCIke2dyc31cIl1gXG4gICAgZGlzcC5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChzZWxlY3RvciBhcyAnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnOiAoZSkgPT4ge1xuICAgICAgICAgIHV0aWwuaGFuZGxlUHJvbWlzZSh0b2dnbGUoZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOmNvcHktaHRtbCc6IChlKSA9PiB7XG4gICAgICAgICAgdXRpbC5oYW5kbGVQcm9taXNlKGNvcHlIdG1sSW50ZXJuYWwoZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuICAgIGNtW3NlbGVjdG9yXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTeW5jIFByZXZpZXcnLFxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtcHJldmlldycsXG4gICAgICB9LFxuICAgIF1cbiAgfVxufVxuXG5mdW5jdGlvbiBvcGVuZXIodXJpVG9PcGVuOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLWtleXdvcmQgcHJlZmVyLWNvbnN0XG4gICAgdmFyIHVyaSA9IHVybC5wYXJzZSh1cmlUb09wZW4pXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUsIHVyaVRvT3BlbilcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAodXJpLnByb3RvY29sICE9PSAnbWFya2Rvd24tcHJldmlldy1wbHVzOicpIHJldHVybiB1bmRlZmluZWRcbiAgaWYgKCF1cmkucGF0aG5hbWUpIHJldHVybiB1bmRlZmluZWRcblxuICB0cnkge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXIta2V5d29yZCBwcmVmZXItY29uc3RcbiAgICB2YXIgcGF0aG5hbWUgPSBkZWNvZGVVUkkodXJpLnBhdGhuYW1lKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICh1cmkuaG9zdG5hbWUgPT09ICdmaWxlJykge1xuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUocGF0aG5hbWUuc2xpY2UoMSkpXG4gIH0gZWxzZSBpZiAodXJpLmhvc3RuYW1lID09PSAncmVtb3RlLWVkaXRvcicpIHtcbiAgICBjb25zdCBbd2luZG93SWQsIGVkaXRvcklkXSA9IHBhdGhuYW1lXG4gICAgICAuc2xpY2UoMSlcbiAgICAgIC5zcGxpdCgnLycpXG4gICAgICAubWFwKCh4KSA9PiBwYXJzZUludCh4LCAxMCkpXG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yUmVtb3RlKHdpbmRvd0lkLCBlZGl0b3JJZClcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVHJpZWQgdG8gb3BlbiBtYXJrZG93bi1wcmV2aWV3LXBsdXMgd2l0aCB1cmkgJHt1cmlUb09wZW59LiBUaGlzIGlzIG5vdCBzdXBwb3J0ZWQuIFBsZWFzZSByZXBvcnQgdGhpcyBlcnJvci5gLFxuICAgIClcbiAgfVxufVxuIl19