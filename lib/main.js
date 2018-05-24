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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFNYTtBQUNiLCtCQUE4QjtBQUM5Qix5REFBb0Q7QUFDcEQscURBQWdEO0FBQ2hELHFIQUE2RztBQUU3RyxtQ0FBaUM7QUFBeEIsMEJBQUEsTUFBTSxDQUFBO0FBRWYsSUFBSSxXQUE0QyxDQUFBO0FBRXpDLEtBQUs7SUFDVixJQUFJLDhCQUFhLEVBQUUsRUFBRTtRQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDeEIsaUVBQWlFO1lBQy9ELDBDQUEwQztZQUMxQyx1Q0FBdUMsRUFDekMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUNyRCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtLQUMxRDtJQUNELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLEVBQUU7UUFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDeEIsOERBQThELEVBQzlELEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUN0QixDQUFBO0tBQ0Y7SUFDRCxXQUFXLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO0lBQ3ZDLFdBQVcsQ0FBQyxHQUFHLENBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUU7UUFDMUMsOEJBQThCLEVBQUUsS0FBSztLQUN0QyxDQUFDLEVBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUU7UUFDcEMsMkNBQTJDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNqRCxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFBO1lBQ3pDLE1BQU0sSUFBSSxHQUFHLGlEQUF5QixDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUM1RCxJQUFJLElBQUk7Z0JBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7UUFDcEMsQ0FBQztLQUNGLENBQUMsRUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtRQUMxQywyQ0FBMkMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2pELE1BQU0sSUFBSSxHQUFHLDJDQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDaEUsSUFBSSxJQUFJO2dCQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQ3BDLENBQUM7S0FDRixDQUFDLEVBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUNqQixnQ0FBZ0MsRUFDaEMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQ2pDLEVBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQ2pCLGtDQUFrQyxFQUNsQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FDbkMsQ0FDRixDQUFBO0FBQ0gsQ0FBQztBQS9DRCw0QkErQ0M7QUFFRDtJQUNFLFdBQVcsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDdEMsQ0FBQztBQUZELGdDQUVDO0FBRUQsbUNBQTBDLEtBQW9CO0lBQzVELElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7UUFDaEMsT0FBTyxJQUFJLGtDQUFlLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzNDO1NBQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzVELE9BQU8sSUFBSSwrQ0FBdUIsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDbkQ7SUFDRCxPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDO0FBUEQsOERBT0M7QUFJRCxLQUFLLGdCQUFnQixLQUFnQztJQUNuRCxNQUFNLElBQUksR0FBRywyQ0FBbUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ3BFLElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTTtJQUNqQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QyxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU07SUFDakIsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzlCLENBQUM7QUFFRCxLQUFLLGlCQUFpQixNQUFrQjtJQUN0QyxJQUFJLHNCQUFzQixDQUFDLE1BQU0sQ0FBQztRQUFFLE9BQU8sU0FBUyxDQUFBOztRQUMvQyxPQUFPLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3pDLENBQUM7QUFFRCxnQ0FBZ0MsTUFBa0I7SUFDaEQsTUFBTSxJQUFJLEdBQUcsaURBQXlCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzVELElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTyxLQUFLLENBQUE7SUFDdkIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDcEQsSUFBSSxDQUFDLFdBQVc7UUFBRSxPQUFPLEtBQUssQ0FBQTtJQUM5QixJQUFJLElBQUksS0FBSyxXQUFXLENBQUMsYUFBYSxFQUFFLEVBQUU7UUFDeEMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QixPQUFPLEtBQUssQ0FBQTtLQUNiO0lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDakQsT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDO0FBRUQsS0FBSyw4QkFBOEIsTUFBa0I7SUFDbkQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFBO0lBQ3pELE1BQU0sT0FBTyxHQUF5QixFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQTtJQUM5RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFBO0lBQ3ZFLElBQUksV0FBVyxLQUFLLE1BQU0sRUFBRTtRQUMxQixPQUFPLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQTtLQUM1QjtJQUNELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQ25DLGlEQUF5QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFDeEMsT0FBTyxDQUNSLENBQUE7SUFDRCxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUM3QixPQUFPLEdBQUcsQ0FBQTtBQUNaLENBQUM7QUFFRCxLQUFLLHNCQUFzQixFQUFFLGFBQWEsRUFBZ0I7SUFDeEQsTUFBTSxRQUFRLEdBQUksYUFBNkIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFBO0lBQzVELElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDYixPQUFNO0tBQ1A7SUFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUU7UUFDcEQsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFO1lBQ2pDLE1BQU0sbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDakMsT0FBTTtTQUNQO0tBQ0Y7SUFFRCxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUN2QixnQ0FBZ0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQ3JEO1FBQ0UsY0FBYyxFQUFFLElBQUk7S0FDckIsQ0FDRixDQUFBO0FBQ0gsQ0FBQztBQUVELEtBQUssMkJBQTJCLE1BQWtCO0lBQ2hELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsNkJBQTZCLENBQUE7SUFDOUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUN6RCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQTtBQUMxRCxDQUFDO0FBSUQsd0JBQ0UsQ0FJUztJQUVULElBQUksaUJBQXNDLENBQUE7SUFDMUMsT0FBTyxVQUFTLEtBQVE7UUFDdEIsSUFBSSxDQUFDLFdBQVc7WUFBRSxPQUFNO1FBQ3hCLElBQUksaUJBQWlCLEVBQUU7WUFDckIsaUJBQWlCLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDM0IsV0FBVyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1NBQ3RDO1FBQ0QsaUJBQWlCLEdBQUcsSUFBSSwwQkFBbUIsRUFBRSxDQUFBO1FBQzdDLE1BQU0sV0FBVyxHQUFnQixFQUFFLENBQUE7UUFDbkMsQ0FBQyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxXQUFXLENBQUMsQ0FBQTtRQUN4QyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtRQUN4RCxXQUFXLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7SUFDcEMsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQUVELDRCQUNFLFVBQW9CLEVBQ3BCLElBQXlCLEVBQ3pCLEVBQWU7SUFFZixLQUFLLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRTtRQUM1QixNQUFNLFFBQVEsR0FBRyx1Q0FBdUMsR0FBRyxJQUFJLENBQUE7UUFDL0QsSUFBSSxDQUFDLEdBQUcsQ0FDTixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDZixRQUFRLEVBQ1Isb0NBQW9DLEVBQ3BDLFdBQVcsQ0FDWixDQUNGLENBQUE7UUFDRCxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUc7WUFDYjtnQkFDRSxLQUFLLEVBQUUsa0JBQWtCO2dCQUN6QixPQUFPLEVBQUUsb0NBQW9DO2FBQzlDO1NBQ0YsQ0FBQTtLQUNGO0FBQ0gsQ0FBQztBQUVELDBCQUNFLFFBQWtCLEVBQ2xCLElBQXlCLEVBQ3pCLEVBQWU7SUFFZixLQUFLLE1BQU0sRUFBRSxJQUFJLFFBQVEsRUFBRTtRQUN6QixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNsQyxNQUFNLFFBQVEsR0FBRyxrQ0FBa0MsR0FBRyxJQUFJLENBQUE7UUFDMUQsSUFBSSxDQUFDLEdBQUcsQ0FDTixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUE4QixFQUFFO1lBQ2hELDhCQUE4QixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ3hELENBQUM7WUFDRCxpQ0FBaUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ2xFLENBQUM7U0FDRixDQUFDLENBQ0gsQ0FBQTtRQUNELEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRztZQUNiO2dCQUNFLEtBQUssRUFBRSxjQUFjO2dCQUNyQixPQUFPLEVBQUUsb0NBQW9DO2FBQzlDO1NBQ0YsQ0FBQTtLQUNGO0FBQ0gsQ0FBQztBQUVELGdCQUFnQixTQUFpQjtJQUMvQixJQUFJO1FBRUYsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUMvQjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDM0IsT0FBTyxTQUFTLENBQUE7S0FDakI7SUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssd0JBQXdCO1FBQUUsT0FBTyxTQUFTLENBQUE7SUFDL0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRO1FBQUUsT0FBTyxTQUFTLENBQUE7SUFFbkMsSUFBSTtRQUVGLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdkM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEIsT0FBTyxTQUFTLENBQUE7S0FDakI7SUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFFO1FBQzNCLE9BQU8sSUFBSSwrQ0FBdUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDdEQ7U0FBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssZUFBZSxFQUFFO1FBQzNDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEdBQUcsUUFBUTthQUNsQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQzthQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzlCLE9BQU8sSUFBSSxxRUFBK0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDL0Q7U0FBTTtRQUNMLE1BQU0sSUFBSSxLQUFLLENBQ2IsZ0RBQWdELFNBQVMsb0RBQW9ELENBQzlHLENBQUE7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdXJsID0gcmVxdWlyZSgndXJsJylcbmltcG9ydCB7XG4gIFNlcmlhbGl6ZWRNUFYsXG4gIE1hcmtkb3duUHJldmlld1ZpZXdGaWxlLFxuICBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLFxuICBNYXJrZG93blByZXZpZXdWaWV3LFxufSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcbi8vIGltcG9ydCBtYXRoamF4SGVscGVyID0gcmVxdWlyZSgnLi9tYXRoamF4LWhlbHBlcicpXG5pbXBvcnQge1xuICBUZXh0RWRpdG9yLFxuICBXb3Jrc3BhY2VPcGVuT3B0aW9ucyxcbiAgQ29tbWFuZEV2ZW50LFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBDb250ZXh0TWVudU9wdGlvbnMsXG59IGZyb20gJ2F0b20nXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IFBsYWNlaG9sZGVyVmlldyB9IGZyb20gJy4vcGxhY2Vob2xkZXItdmlldydcbmltcG9ydCB7IG1pZ3JhdGVDb25maWcgfSBmcm9tICcuL21pZ3JhdGUtY29uZmlnJ1xuaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvclJlbW90ZSB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1lZGl0b3ItcmVtb3RlJ1xuXG5leHBvcnQgeyBjb25maWcgfSBmcm9tICcuL2NvbmZpZydcblxubGV0IGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgaWYgKG1pZ3JhdGVDb25maWcoKSkge1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFxuICAgICAgJ01hcmtkb3duLVByZWl2ZXctUGx1cyBoYXMgdXBkYXRlZCB5b3VyIGNvbmZpZyB0byBhIG5ldyBmb3JtYXQuICcgK1xuICAgICAgICAnUGxlYXNlIGNoZWNrIGlmIGV2ZXJ5dGhpbmcgaXMgaW4gb3JkZXIuICcgK1xuICAgICAgICAnVGhpcyBtZXNzYWdlIHdpbGwgbm90IGJlIHNob3duIGFnYWluLicsXG4gICAgICB7IGRpc21pc3NhYmxlOiB0cnVlIH0sXG4gICAgKVxuICB9XG4gIGlmIChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZSgnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgYXdhaXQgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpXG4gIH1cbiAgaWYgKCFhdG9tLnBhY2thZ2VzLmlzUGFja2FnZURpc2FibGVkKCdtYXJrZG93bi1wcmV2aWV3JykpIHtcbiAgICBhdG9tLnBhY2thZ2VzLmRpc2FibGVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3JylcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICdNYXJrZG93bi1wcmV2aWV3LXBsdXMgaGFzIGRpc2FibGVkIG1hcmtkb3duLXByZXZpZXcgcGFja2FnZS4nLFxuICAgICAgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9LFxuICAgIClcbiAgfVxuICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCcubWFya2Rvd24tcHJldmlldy1wbHVzJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnOiBjbG9zZSxcbiAgICB9KSxcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpXG4gICAgICAgIGNvbnN0IHZpZXcgPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLnZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgICBpZiAodmlldykgdmlldy50b2dnbGVSZW5kZXJMYXRleCgpXG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCcubWFya2Rvd24tcHJldmlldy1wbHVzJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKGUpID0+IHtcbiAgICAgICAgY29uc3QgdmlldyA9IE1hcmtkb3duUHJldmlld1ZpZXcudmlld0ZvckVsZW1lbnQoZS5jdXJyZW50VGFyZ2V0KVxuICAgICAgICBpZiAodmlldykgdmlldy50b2dnbGVSZW5kZXJMYXRleCgpXG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcihvcGVuZXIpLFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmdyYW1tYXJzJyxcbiAgICAgIGNvbmZpZ09ic2VydmVyKHJlZ2lzdGVyR3JhbW1hcnMpLFxuICAgICksXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZXh0ZW5zaW9ucycsXG4gICAgICBjb25maWdPYnNlcnZlcihyZWdpc3RlckV4dGVuc2lvbnMpLFxuICAgICksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGRpc3Bvc2FibGVzICYmIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWFya2Rvd25QcmV2aWV3VmlldyhzdGF0ZTogU2VyaWFsaXplZE1QVikge1xuICBpZiAoc3RhdGUuZWRpdG9ySWQgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBuZXcgUGxhY2Vob2xkZXJWaWV3KHN0YXRlLmVkaXRvcklkKVxuICB9IGVsc2UgaWYgKHN0YXRlLmZpbGVQYXRoICYmIHV0aWwuaXNGaWxlU3luYyhzdGF0ZS5maWxlUGF0aCkpIHtcbiAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdGaWxlKHN0YXRlLmZpbGVQYXRoKVxuICB9XG4gIHJldHVybiB1bmRlZmluZWRcbn1cblxuLy8vIHByaXZhdGVcblxuYXN5bmMgZnVuY3Rpb24gY2xvc2UoZXZlbnQ6IENvbW1hbmRFdmVudDxIVE1MRWxlbWVudD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgaXRlbSA9IE1hcmtkb3duUHJldmlld1ZpZXcudmlld0ZvckVsZW1lbnQoZXZlbnQuY3VycmVudFRhcmdldClcbiAgaWYgKCFpdGVtKSByZXR1cm5cbiAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGl0ZW0pXG4gIGlmICghcGFuZSkgcmV0dXJuXG4gIGF3YWl0IHBhbmUuZGVzdHJveUl0ZW0oaXRlbSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gdG9nZ2xlKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICBpZiAocmVtb3ZlUHJldmlld0ZvckVkaXRvcihlZGl0b3IpKSByZXR1cm4gdW5kZWZpbmVkXG4gIGVsc2UgcmV0dXJuIGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKVxufVxuXG5mdW5jdGlvbiByZW1vdmVQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICBjb25zdCBpdGVtID0gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci52aWV3Rm9yRWRpdG9yKGVkaXRvcilcbiAgaWYgKCFpdGVtKSByZXR1cm4gZmFsc2VcbiAgY29uc3QgcHJldmlld1BhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShpdGVtKVxuICBpZiAoIXByZXZpZXdQYW5lKSByZXR1cm4gZmFsc2VcbiAgaWYgKGl0ZW0gIT09IHByZXZpZXdQYW5lLmdldEFjdGl2ZUl0ZW0oKSkge1xuICAgIHByZXZpZXdQYW5lLmFjdGl2YXRlSXRlbShpdGVtKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHV0aWwuaGFuZGxlUHJvbWlzZShwcmV2aWV3UGFuZS5kZXN0cm95SXRlbShpdGVtKSlcbiAgcmV0dXJuIHRydWVcbn1cblxuYXN5bmMgZnVuY3Rpb24gYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgY29uc3QgcHJldmlvdXNBY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gIGNvbnN0IG9wdGlvbnM6IFdvcmtzcGFjZU9wZW5PcHRpb25zID0geyBzZWFyY2hBbGxQYW5lczogdHJ1ZSB9XG4gIGNvbnN0IHNwbGl0Q29uZmlnID0gdXRpbC5hdG9tQ29uZmlnKCkucHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyXG4gIGlmIChzcGxpdENvbmZpZyAhPT0gJ25vbmUnKSB7XG4gICAgb3B0aW9ucy5zcGxpdCA9IHNwbGl0Q29uZmlnXG4gIH1cbiAgY29uc3QgcmVzID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihcbiAgICBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLmNyZWF0ZShlZGl0b3IpLFxuICAgIG9wdGlvbnMsXG4gIClcbiAgcHJldmlvdXNBY3RpdmVQYW5lLmFjdGl2YXRlKClcbiAgcmV0dXJuIHJlc1xufVxuXG5hc3luYyBmdW5jdGlvbiBwcmV2aWV3RmlsZSh7IGN1cnJlbnRUYXJnZXQgfTogQ29tbWFuZEV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGZpbGVQYXRoID0gKGN1cnJlbnRUYXJnZXQgYXMgSFRNTEVsZW1lbnQpLmRhdGFzZXQucGF0aFxuICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBmb3IgKGNvbnN0IGVkaXRvciBvZiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpKSB7XG4gICAgaWYgKGVkaXRvci5nZXRQYXRoKCkgPT09IGZpbGVQYXRoKSB7XG4gICAgICBhd2FpdCBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oXG4gICAgYG1hcmtkb3duLXByZXZpZXctcGx1czovL2ZpbGUvJHtlbmNvZGVVUkkoZmlsZVBhdGgpfWAsXG4gICAge1xuICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgfSxcbiAgKVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5SHRtbEludGVybmFsKGVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCByZW5kZXJMYVRlWCA9IHV0aWwuYXRvbUNvbmZpZygpLm1hdGhDb25maWcuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHRcbiAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSB8fCBlZGl0b3IuZ2V0VGV4dCgpXG4gIGF3YWl0IHV0aWwuY29weUh0bWwodGV4dCwgZWRpdG9yLmdldFBhdGgoKSwgcmVuZGVyTGFUZVgpXG59XG5cbnR5cGUgQ29udGV4dE1lbnUgPSB7IFtrZXk6IHN0cmluZ106IENvbnRleHRNZW51T3B0aW9uc1tdIH1cblxuZnVuY3Rpb24gY29uZmlnT2JzZXJ2ZXI8VD4oXG4gIGY6IChcbiAgICB2YWx1ZTogVCxcbiAgICBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgICBjb250ZXh0TWVudTogQ29udGV4dE1lbnUsXG4gICkgPT4gdm9pZCxcbikge1xuICBsZXQgY29uZmlnRGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlOiBUKSB7XG4gICAgaWYgKCFkaXNwb3NhYmxlcykgcmV0dXJuXG4gICAgaWYgKGNvbmZpZ0Rpc3Bvc2FibGVzKSB7XG4gICAgICBjb25maWdEaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICAgIGRpc3Bvc2FibGVzLnJlbW92ZShjb25maWdEaXNwb3NhYmxlcylcbiAgICB9XG4gICAgY29uZmlnRGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgY29uc3QgY29udGV4dE1lbnU6IENvbnRleHRNZW51ID0ge31cbiAgICBmKHZhbHVlLCBjb25maWdEaXNwb3NhYmxlcywgY29udGV4dE1lbnUpXG4gICAgY29uZmlnRGlzcG9zYWJsZXMuYWRkKGF0b20uY29udGV4dE1lbnUuYWRkKGNvbnRleHRNZW51KSlcbiAgICBkaXNwb3NhYmxlcy5hZGQoY29uZmlnRGlzcG9zYWJsZXMpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJFeHRlbnNpb25zKFxuICBleHRlbnNpb25zOiBzdHJpbmdbXSxcbiAgZGlzcDogQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgY206IENvbnRleHRNZW51LFxuKSB7XG4gIGZvciAoY29uc3QgZXh0IG9mIGV4dGVuc2lvbnMpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IGAudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XCIuJHtleHR9XCJdYFxuICAgIGRpc3AuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgIHNlbGVjdG9yLFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsXG4gICAgICAgIHByZXZpZXdGaWxlLFxuICAgICAgKSxcbiAgICApXG4gICAgY21bc2VsZWN0b3JdID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ01hcmtkb3duIFByZXZpZXcnLFxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsXG4gICAgICB9LFxuICAgIF1cbiAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlckdyYW1tYXJzKFxuICBncmFtbWFyczogc3RyaW5nW10sXG4gIGRpc3A6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIGNtOiBDb250ZXh0TWVudSxcbikge1xuICBmb3IgKGNvbnN0IGdyIG9mIGdyYW1tYXJzKSB7XG4gICAgY29uc3QgZ3JzID0gZ3IucmVwbGFjZSgvXFwuL2csICcgJylcbiAgICBjb25zdCBzZWxlY3RvciA9IGBhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcj1cIiR7Z3JzfVwiXWBcbiAgICBkaXNwLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHNlbGVjdG9yIGFzICdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSc6IChlKSA9PiB7XG4gICAgICAgICAgdXRpbC5oYW5kbGVQcm9taXNlKHRvZ2dsZShlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKSkpXG4gICAgICAgIH0sXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Y29weS1odG1sJzogKGUpID0+IHtcbiAgICAgICAgICB1dGlsLmhhbmRsZVByb21pc2UoY29weUh0bWxJbnRlcm5hbChlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKSkpXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApXG4gICAgY21bc2VsZWN0b3JdID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ1N5bmMgUHJldmlldycsXG4gICAgICAgIGNvbW1hbmQ6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1wcmV2aWV3JyxcbiAgICAgIH0sXG4gICAgXVxuICB9XG59XG5cbmZ1bmN0aW9uIG9wZW5lcih1cmlUb09wZW46IHN0cmluZykge1xuICB0cnkge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXIta2V5d29yZCBwcmVmZXItY29uc3RcbiAgICB2YXIgdXJpID0gdXJsLnBhcnNlKHVyaVRvT3BlbilcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSwgdXJpVG9PcGVuKVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICh1cmkucHJvdG9jb2wgIT09ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6JykgcmV0dXJuIHVuZGVmaW5lZFxuICBpZiAoIXVyaS5wYXRobmFtZSkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gIHRyeSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXZhci1rZXl3b3JkIHByZWZlci1jb25zdFxuICAgIHZhciBwYXRobmFtZSA9IGRlY29kZVVSSSh1cmkucGF0aG5hbWUpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKHVyaS5ob3N0bmFtZSA9PT0gJ2ZpbGUnKSB7XG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RmlsZShwYXRobmFtZS5zbGljZSgxKSlcbiAgfSBlbHNlIGlmICh1cmkuaG9zdG5hbWUgPT09ICdyZW1vdGUtZWRpdG9yJykge1xuICAgIGNvbnN0IFt3aW5kb3dJZCwgZWRpdG9ySWRdID0gcGF0aG5hbWVcbiAgICAgIC5zbGljZSgxKVxuICAgICAgLnNwbGl0KCcvJylcbiAgICAgIC5tYXAoKHgpID0+IHBhcnNlSW50KHgsIDEwKSlcbiAgICByZXR1cm4gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3JSZW1vdGUod2luZG93SWQsIGVkaXRvcklkKVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBUcmllZCB0byBvcGVuIG1hcmtkb3duLXByZXZpZXctcGx1cyB3aXRoIHVyaSAke3VyaVRvT3Blbn0uIFRoaXMgaXMgbm90IHN1cHBvcnRlZC4gUGxlYXNlIHJlcG9ydCB0aGlzIGVycm9yLmAsXG4gICAgKVxuICB9XG59XG4iXX0=