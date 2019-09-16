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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFNYTtBQUNiLCtCQUE4QjtBQUM5Qix5REFBb0Q7QUFDcEQscURBQWdEO0FBQ2hELHFIQUE2RztBQUU3RyxtQ0FBaUM7QUFBeEIsMEJBQUEsTUFBTSxDQUFBO0FBRWYsSUFBSSxXQUE0QyxDQUFBO0FBRXpDLEtBQUssVUFBVSxRQUFRO0lBQzVCLElBQUksOEJBQWEsRUFBRSxFQUFFO1FBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4QixpRUFBaUU7WUFDL0QsMENBQTBDO1lBQzFDLHVDQUF1QyxFQUN6QyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FDdEIsQ0FBQTtLQUNGO0lBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQ3JELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0tBQzFEO0lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1FBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4Qiw4REFBOEQsRUFDOUQsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELFdBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFDdkMsV0FBVyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtRQUMxQyw4QkFBOEIsRUFBRSxLQUFLO0tBQ3RDLENBQUMsRUFDRixJQUFJLENBQUMsUUFBUSxD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QyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDaEQ7U0FBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssZUFBZSxFQUFFO1FBQzNDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEdBQUcsUUFBUTthQUNsQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQzthQUNWLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzlCLE9BQU8sSUFBSSxxRUFBK0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDL0Q7U0FBTTtRQUNMLE1BQU0sSUFBSSxLQUFLLENBQ2IsZ0RBQWdELFNBQVMsb0RBQW9ELENBQzlHLENBQUE7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdXJsID0gcmVxdWlyZSgndXJsJylcbmltcG9ydCB7XG4gIFNlcmlhbGl6ZWRNUFYsXG4gIE1hcmtkb3duUHJldmlld1ZpZXdGaWxlLFxuICBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLFxuICBNYXJrZG93blByZXZpZXdWaWV3LFxufSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcbi8vIGltcG9ydCBtYXRoamF4SGVscGVyID0gcmVxdWlyZSgnLi9tYXRoamF4LWhlbHBlcicpXG5pbXBvcnQge1xuICBUZXh0RWRpdG9yLFxuICBXb3Jrc3BhY2VPcGVuT3B0aW9ucyxcbiAgQ29tbWFuZEV2ZW50LFxuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBDb250ZXh0TWVudU9wdGlvbnMsXG59IGZyb20gJ2F0b20nXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IFBsYWNlaG9sZGVyVmlldyB9IGZyb20gJy4vcGxhY2Vob2xkZXItdmlldydcbmltcG9ydCB7IG1pZ3JhdGVDb25maWcgfSBmcm9tICcuL21pZ3JhdGUtY29uZmlnJ1xuaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvclJlbW90ZSB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1lZGl0b3ItcmVtb3RlJ1xuXG5leHBvcnQgeyBjb25maWcgfSBmcm9tICcuL2NvbmZpZydcblxubGV0IGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgaWYgKG1pZ3JhdGVDb25maWcoKSkge1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFxuICAgICAgJ01hcmtkb3duLVByZWl2ZXctUGx1cyBoYXMgdXBkYXRlZCB5b3VyIGNvbmZpZyB0byBhIG5ldyBmb3JtYXQuICcgK1xuICAgICAgICAnUGxlYXNlIGNoZWNrIGlmIGV2ZXJ5dGhpbmcgaXMgaW4gb3JkZXIuICcgK1xuICAgICAgICAnVGhpcyBtZXNzYWdlIHdpbGwgbm90IGJlIHNob3duIGFnYWluLicsXG4gICAgICB7IGRpc21pc3NhYmxlOiB0cnVlIH0sXG4gICAgKVxuICB9XG4gIGlmIChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZSgnbWFya2Rvd24tcHJldmlldycpKSB7XG4gICAgYXdhaXQgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpXG4gIH1cbiAgaWYgKCFhdG9tLnBhY2thZ2VzLmlzUGFja2FnZURpc2FibGVkKCdtYXJrZG93bi1wcmV2aWV3JykpIHtcbiAgICBhdG9tLnBhY2thZ2VzLmRpc2FibGVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3JylcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICdNYXJrZG93bi1wcmV2aWV3LXBsdXMgaGFzIGRpc2FibGVkIG1hcmtkb3duLXByZXZpZXcgcGFja2FnZS4nLFxuICAgICAgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9LFxuICAgIClcbiAgfVxuICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCcubWFya2Rvd24tcHJldmlldy1wbHVzJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnOiBjbG9zZSxcbiAgICB9KSxcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnNlbGVjdC1zeW50YXgtdGhlbWUnOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBzZWxlY3RMaXN0VmlldyB9ID0gYXdhaXQgaW1wb3J0KCcuL3NlbGVjdC1saXN0LXZpZXcnKVxuICAgICAgICAgIGNvbnN0IHRoZW1lTmFtZXMgPSBhdG9tLnRoZW1lcy5nZXRMb2FkZWRUaGVtZU5hbWVzKClcbiAgICAgICAgICBpZiAodGhlbWVOYW1lcyA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICAgICAgICBjb25zdCB0aGVtZSA9IGF3YWl0IHNlbGVjdExpc3RWaWV3KFxuICAgICAgICAgICAgdGhlbWVOYW1lcy5maWx0ZXIoKHgpID0+IHgubWF0Y2goLy1zeW50YXgkLykpLFxuICAgICAgICAgIClcbiAgICAgICAgICBpZiAodGhlbWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3ludGF4VGhlbWVOYW1lJywgdGhlbWUpXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zdCBlcnIgPSBlIGFzIEVycm9yXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IoZXJyLm5hbWUsIHtcbiAgICAgICAgICAgIGRldGFpbDogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSksXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1yZW5kZXItbGF0ZXgnOiAoZSkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0TW9kZWwoKVxuICAgICAgICBjb25zdCB2aWV3ID0gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci52aWV3Rm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgaWYgKHZpZXcpIHZpZXcudG9nZ2xlUmVuZGVyTGF0ZXgoKVxuICAgICAgfSxcbiAgICB9KSxcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLm1hcmtkb3duLXByZXZpZXctcGx1cycsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSBNYXJrZG93blByZXZpZXdWaWV3LnZpZXdGb3JFbGVtZW50KGUuY3VycmVudFRhcmdldClcbiAgICAgICAgaWYgKHZpZXcpIHZpZXcudG9nZ2xlUmVuZGVyTGF0ZXgoKVxuICAgICAgfSxcbiAgICB9KSxcbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIob3BlbmVyKSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycycsXG4gICAgICBjb25maWdPYnNlcnZlcihyZWdpc3RlckdyYW1tYXJzKSxcbiAgICApLFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmV4dGVuc2lvbnMnLFxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJFeHRlbnNpb25zKSxcbiAgICApLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBkaXNwb3NhYmxlcyAmJiBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hcmtkb3duUHJldmlld1ZpZXcoc3RhdGU6IFNlcmlhbGl6ZWRNUFYpIHtcbiAgaWYgKHN0YXRlLmVkaXRvcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbmV3IFBsYWNlaG9sZGVyVmlldyhzdGF0ZS5lZGl0b3JJZClcbiAgfSBlbHNlIGlmIChzdGF0ZS5maWxlUGF0aCAmJiB1dGlsLmlzRmlsZVN5bmMoc3RhdGUuZmlsZVBhdGgpKSB7XG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RmlsZShzdGF0ZS5maWxlUGF0aClcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbi8vLyBwcml2YXRlXG5cbmFzeW5jIGZ1bmN0aW9uIGNsb3NlKGV2ZW50OiBDb21tYW5kRXZlbnQ8SFRNTEVsZW1lbnQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGl0ZW0gPSBNYXJrZG93blByZXZpZXdWaWV3LnZpZXdGb3JFbGVtZW50KGV2ZW50LmN1cnJlbnRUYXJnZXQpXG4gIGlmICghaXRlbSkgcmV0dXJuXG4gIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShpdGVtKVxuICBpZiAoIXBhbmUpIHJldHVyblxuICBhd2FpdCBwYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZShlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgaWYgKHJlbW92ZVByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKSkgcmV0dXJuIHVuZGVmaW5lZFxuICBlbHNlIHJldHVybiBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcbn1cblxuZnVuY3Rpb24gcmVtb3ZlUHJldmlld0ZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgY29uc3QgaXRlbSA9IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3Iudmlld0ZvckVkaXRvcihlZGl0b3IpXG4gIGlmICghaXRlbSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHByZXZpZXdQYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcbiAgaWYgKCFwcmV2aWV3UGFuZSkgcmV0dXJuIGZhbHNlXG4gIGlmIChpdGVtICE9PSBwcmV2aWV3UGFuZS5nZXRBY3RpdmVJdGVtKCkpIHtcbiAgICBwcmV2aWV3UGFuZS5hY3RpdmF0ZUl0ZW0oaXRlbSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICB1dGlsLmhhbmRsZVByb21pc2UocHJldmlld1BhbmUuZGVzdHJveUl0ZW0oaXRlbSkpXG4gIHJldHVybiB0cnVlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGNvbnN0IHByZXZpb3VzQWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICBjb25zdCBvcHRpb25zOiBXb3Jrc3BhY2VPcGVuT3B0aW9ucyA9IHsgc2VhcmNoQWxsUGFuZXM6IHRydWUgfVxuICBjb25zdCBzcGxpdENvbmZpZyA9IHV0aWwuYXRvbUNvbmZpZygpLnByZXZpZXdDb25maWcucHJldmlld1NwbGl0UGFuZURpclxuICBpZiAoc3BsaXRDb25maWcgIT09ICdub25lJykge1xuICAgIG9wdGlvbnMuc3BsaXQgPSBzcGxpdENvbmZpZ1xuICB9XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oXG4gICAgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5jcmVhdGUoZWRpdG9yKSxcbiAgICBvcHRpb25zLFxuICApXG4gIHByZXZpb3VzQWN0aXZlUGFuZS5hY3RpdmF0ZSgpXG4gIHJldHVybiByZXNcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJldmlld0ZpbGUoeyBjdXJyZW50VGFyZ2V0IH06IENvbW1hbmRFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBmaWxlUGF0aCA9IChjdXJyZW50VGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5kYXRhc2V0LnBhdGhcbiAgaWYgKCFmaWxlUGF0aCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZm9yIChjb25zdCBlZGl0b3Igb2YgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSkge1xuICAgIGlmIChlZGl0b3IuZ2V0UGF0aCgpID09PSBmaWxlUGF0aCkge1xuICAgICAgYXdhaXQgYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKFxuICAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9maWxlLyR7ZW5jb2RlVVJJKGZpbGVQYXRoKX1gLFxuICAgIHtcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgIH0sXG4gIClcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weUh0bWxJbnRlcm5hbChlZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcmVuZGVyTGFUZVggPSB1dGlsLmF0b21Db25maWcoKS5tYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0XG4gIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkgfHwgZWRpdG9yLmdldFRleHQoKVxuICBhd2FpdCB1dGlsLmNvcHlIdG1sKHRleHQsIGVkaXRvci5nZXRQYXRoKCksIHJlbmRlckxhVGVYKVxufVxuXG50eXBlIENvbnRleHRNZW51ID0geyBba2V5OiBzdHJpbmddOiBDb250ZXh0TWVudU9wdGlvbnNbXSB9XG5cbmZ1bmN0aW9uIGNvbmZpZ09ic2VydmVyPFQ+KFxuICBmOiAoXG4gICAgdmFsdWU6IFQsXG4gICAgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gICAgY29udGV4dE1lbnU6IENvbnRleHRNZW51LFxuICApID0+IHZvaWQsXG4pIHtcbiAgbGV0IGNvbmZpZ0Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZTogVCkge1xuICAgIGlmICghZGlzcG9zYWJsZXMpIHJldHVyblxuICAgIGlmIChjb25maWdEaXNwb3NhYmxlcykge1xuICAgICAgY29uZmlnRGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgICBkaXNwb3NhYmxlcy5yZW1vdmUoY29uZmlnRGlzcG9zYWJsZXMpXG4gICAgfVxuICAgIGNvbmZpZ0Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGNvbnN0IGNvbnRleHRNZW51OiBDb250ZXh0TWVudSA9IHt9XG4gICAgZih2YWx1ZSwgY29uZmlnRGlzcG9zYWJsZXMsIGNvbnRleHRNZW51KVxuICAgIGNvbmZpZ0Rpc3Bvc2FibGVzLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZChjb250ZXh0TWVudSkpXG4gICAgZGlzcG9zYWJsZXMuYWRkKGNvbmZpZ0Rpc3Bvc2FibGVzKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyRXh0ZW5zaW9ucyhcbiAgZXh0ZW5zaW9uczogc3RyaW5nW10sXG4gIGRpc3A6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIGNtOiBDb250ZXh0TWVudSxcbikge1xuICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVwiLiR7ZXh0fVwiXWBcbiAgICBkaXNwLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLFxuICAgICAgICBwcmV2aWV3RmlsZSxcbiAgICAgICksXG4gICAgKVxuICAgIGNtW3NlbGVjdG9yXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdNYXJrZG93biBQcmV2aWV3JyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLFxuICAgICAgfSxcbiAgICBdXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJHcmFtbWFycyhcbiAgZ3JhbW1hcnM6IHN0cmluZ1tdLFxuICBkaXNwOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBjbTogQ29udGV4dE1lbnUsXG4pIHtcbiAgZm9yIChjb25zdCBnciBvZiBncmFtbWFycykge1xuICAgIGNvbnN0IGdycyA9IGdyLnJlcGxhY2UoL1xcLi9nLCAnICcpXG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCIke2dyc31cIl1gXG4gICAgZGlzcC5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChzZWxlY3RvciBhcyAnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnOiAoZSkgPT4ge1xuICAgICAgICAgIHV0aWwuaGFuZGxlUHJvbWlzZSh0b2dnbGUoZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOmNvcHktaHRtbCc6IChlKSA9PiB7XG4gICAgICAgICAgdXRpbC5oYW5kbGVQcm9taXNlKGNvcHlIdG1sSW50ZXJuYWwoZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuICAgIGNtW3NlbGVjdG9yXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTeW5jIFByZXZpZXcnLFxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtcHJldmlldycsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0NvcHkgTWFya2Rvd24gYXMgSFRNTCcsXG4gICAgICAgIGNvbW1hbmQ6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Y29weS1odG1sJyxcbiAgICAgIH0sXG4gICAgXVxuICB9XG59XG5cbmZ1bmN0aW9uIG9wZW5lcih1cmlUb09wZW46IHN0cmluZykge1xuICB0cnkge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXIta2V5d29yZCBwcmVmZXItY29uc3RcbiAgICB2YXIgdXJpID0gdXJsLnBhcnNlKHVyaVRvT3BlbilcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSwgdXJpVG9PcGVuKVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICh1cmkucHJvdG9jb2wgIT09ICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6JykgcmV0dXJuIHVuZGVmaW5lZFxuICBpZiAoIXVyaS5wYXRobmFtZSkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gIHRyeSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXZhci1rZXl3b3JkIHByZWZlci1jb25zdFxuICAgIHZhciBwYXRobmFtZSA9IGRlY29kZVVSSSh1cmkucGF0aG5hbWUpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKHVyaS5ob3N0bmFtZSA9PT0gJ2ZpbGUnKSB7XG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RmlsZShwYXRobmFtZS5zbGljZSgxKSlcbiAgfSBlbHNlIGlmICh1cmkuaG9zdG5hbWUgPT09ICdlZGl0b3InKSB7XG4gICAgY29uc3QgZWRpdG9ySWQgPSBwYXJzZUludChwYXRobmFtZS5zbGljZSgxKSwgMTApXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2VcbiAgICAgIC5nZXRUZXh0RWRpdG9ycygpXG4gICAgICAuZmluZCgoZWQpID0+IGVkLmlkID09PSBlZGl0b3JJZClcbiAgICBpZiAoZWRpdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAnTWFya2Rvd24tcHJldmlldy1wbHVzOiBUcmllZCB0byBvcGVuIHByZXZpZXcgJyArXG4gICAgICAgICAgYGZvciBlZGl0b3Igd2l0aCBpZCAke2VkaXRvcklkfSwgd2hpY2ggZG9lcyBub3QgZXhpc3RgLFxuICAgICAgKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICByZXR1cm4gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5jcmVhdGUoZWRpdG9yKVxuICB9IGVsc2UgaWYgKHVyaS5ob3N0bmFtZSA9PT0gJ3JlbW90ZS1lZGl0b3InKSB7XG4gICAgY29uc3QgW3dpbmRvd0lkLCBlZGl0b3JJZF0gPSBwYXRobmFtZVxuICAgICAgLnNsaWNlKDEpXG4gICAgICAuc3BsaXQoJy8nKVxuICAgICAgLm1hcCgoeCkgPT4gcGFyc2VJbnQoeCwgMTApKVxuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvclJlbW90ZSh3aW5kb3dJZCwgZWRpdG9ySWQpXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFRyaWVkIHRvIG9wZW4gbWFya2Rvd24tcHJldmlldy1wbHVzIHdpdGggdXJpICR7dXJpVG9PcGVufS4gVGhpcyBpcyBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgcmVwb3J0IHRoaXMgZXJyb3IuYCxcbiAgICApXG4gIH1cbn1cbiJdfQ==