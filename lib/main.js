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
    await util.copyHtml(text, renderLaTeX);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJCO0FBQzNCLG1FQUtnQztBQUVoQywrQkFNYTtBQUNiLCtCQUE4QjtBQUM5Qix5REFBb0Q7QUFDcEQscURBQWdEO0FBRWhELG1DQUFpQztBQUF4QiwwQkFBQSxNQUFNLENBQUE7QUFFZixJQUFJLFdBQTRDLENBQUE7QUFFekMsS0FBSztJQUNWLElBQUksOEJBQWEsRUFBRSxFQUFFO1FBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4QixpRUFBaUU7WUFDL0QsMENBQTBDO1lBQzFDLHVDQUF1QyxFQUN6QyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FDdEIsQ0FBQTtLQUNGO0lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1FBQ2hELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUN4Qiw4REFBOEQsRUFDOUQsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQ3RCLENBQUE7S0FDRjtJQUNELFdBQVcsR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7SUFDdkMsV0FBVyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtRQUMxQyw4QkFBOEIsRUFBRSxLQUFLO0tBQ3RDLENBQUMsRUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRTtRQUNwQywyQ0FBMkMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2pELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDekMsTUFBTSxJQUFJLEdBQUcsaURBQXlC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UyxDQUFBO0lBRW5DLElBQUk7UUFFRixJQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hCLE9BQU8sU0FBUyxDQUFBO0tBQ2pCO0lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRTtRQUMzQixPQUFPLElBQUksK0NBQXVCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3REO1NBQU07UUFDTCxNQUFNLElBQUksS0FBSyxDQUNiLGdEQUFnRCxTQUFTLG9EQUFvRCxDQUM5RyxDQUFBO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHVybCA9IHJlcXVpcmUoJ3VybCcpXG5pbXBvcnQge1xuICBNYXJrZG93blByZXZpZXdWaWV3RWxlbWVudCxcbiAgU2VyaWFsaXplZE1QVixcbiAgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUsXG4gIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IsXG59IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuLy8gaW1wb3J0IG1hdGhqYXhIZWxwZXIgPSByZXF1aXJlKCcuL21hdGhqYXgtaGVscGVyJylcbmltcG9ydCB7XG4gIFRleHRFZGl0b3IsXG4gIFdvcmtzcGFjZU9wZW5PcHRpb25zLFxuICBDb21tYW5kRXZlbnQsXG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIENvbnRleHRNZW51T3B0aW9ucyxcbn0gZnJvbSAnYXRvbSdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgUGxhY2Vob2xkZXJWaWV3IH0gZnJvbSAnLi9wbGFjZWhvbGRlci12aWV3J1xuaW1wb3J0IHsgbWlncmF0ZUNvbmZpZyB9IGZyb20gJy4vbWlncmF0ZS1jb25maWcnXG5cbmV4cG9ydCB7IGNvbmZpZyB9IGZyb20gJy4vY29uZmlnJ1xuXG5sZXQgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGUgfCB1bmRlZmluZWRcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICBpZiAobWlncmF0ZUNvbmZpZygpKSB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAnTWFya2Rvd24tUHJlaXZldy1QbHVzIGhhcyB1cGRhdGVkIHlvdXIgY29uZmlnIHRvIGEgbmV3IGZvcm1hdC4gJyArXG4gICAgICAgICdQbGVhc2UgY2hlY2sgaWYgZXZlcnl0aGluZyBpcyBpbiBvcmRlci4gJyArXG4gICAgICAgICdUaGlzIG1lc3NhZ2Ugd2lsbCBub3QgYmUgc2hvd24gYWdhaW4uJyxcbiAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSxcbiAgICApXG4gIH1cbiAgaWYgKCFhdG9tLnBhY2thZ2VzLmlzUGFja2FnZURpc2FibGVkKCdtYXJrZG93bi1wcmV2aWV3JykpIHtcbiAgICBhdG9tLnBhY2thZ2VzLmRpc2FibGVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3JylcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICdNYXJrZG93bi1wcmV2aWV3LXBsdXMgaGFzIGRpc2FibGVkIG1hcmtkb3duLXByZXZpZXcgcGFja2FnZS4nLFxuICAgICAgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9LFxuICAgIClcbiAgfVxuICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCcubWFya2Rvd24tcHJldmlldy1wbHVzJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnOiBjbG9zZSxcbiAgICB9KSxcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpXG4gICAgICAgIGNvbnN0IHZpZXcgPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLnZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgICBpZiAodmlldykgdmlldy50b2dnbGVSZW5kZXJMYXRleCgpXG4gICAgICB9LFxuICAgIH0pLFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCcubWFya2Rvd24tcHJldmlldy1wbHVzJywge1xuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogKGUpID0+IHtcbiAgICAgICAgY29uc3QgdmlldyA9IGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpXG4gICAgICAgIHZpZXcudG9nZ2xlUmVuZGVyTGF0ZXgoKVxuICAgICAgfSxcbiAgICB9KSxcbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIob3BlbmVyKSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycycsXG4gICAgICBjb25maWdPYnNlcnZlcihyZWdpc3RlckdyYW1tYXJzKSxcbiAgICApLFxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmV4dGVuc2lvbnMnLFxuICAgICAgY29uZmlnT2JzZXJ2ZXIocmVnaXN0ZXJFeHRlbnNpb25zKSxcbiAgICApLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBkaXNwb3NhYmxlcyAmJiBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1hcmtkb3duUHJldmlld1ZpZXcoc3RhdGU6IFNlcmlhbGl6ZWRNUFYpIHtcbiAgaWYgKHN0YXRlLmVkaXRvcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbmV3IFBsYWNlaG9sZGVyVmlldyhzdGF0ZS5lZGl0b3JJZClcbiAgfSBlbHNlIGlmIChzdGF0ZS5maWxlUGF0aCAmJiB1dGlsLmlzRmlsZVN5bmMoc3RhdGUuZmlsZVBhdGgpKSB7XG4gICAgcmV0dXJuIG5ldyBNYXJrZG93blByZXZpZXdWaWV3RmlsZShzdGF0ZS5maWxlUGF0aClcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbi8vLyBwcml2YXRlXG5cbmFzeW5jIGZ1bmN0aW9uIGNsb3NlKFxuICBldmVudDogQ29tbWFuZEV2ZW50PE1hcmtkb3duUHJldmlld1ZpZXdFbGVtZW50Pixcbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBpdGVtID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpXG4gIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShpdGVtKVxuICBpZiAoIXBhbmUpIHJldHVyblxuICBhd2FpdCBwYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZShlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgaWYgKHJlbW92ZVByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKSkgcmV0dXJuIHVuZGVmaW5lZFxuICBlbHNlIHJldHVybiBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcbn1cblxuZnVuY3Rpb24gcmVtb3ZlUHJldmlld0ZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgY29uc3QgaXRlbSA9IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3Iudmlld0ZvckVkaXRvcihlZGl0b3IpXG4gIGlmICghaXRlbSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHByZXZpZXdQYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oaXRlbSlcbiAgaWYgKCFwcmV2aWV3UGFuZSkgcmV0dXJuIGZhbHNlXG4gIGlmIChpdGVtICE9PSBwcmV2aWV3UGFuZS5nZXRBY3RpdmVJdGVtKCkpIHtcbiAgICBwcmV2aWV3UGFuZS5hY3RpdmF0ZUl0ZW0oaXRlbSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICB1dGlsLmhhbmRsZVByb21pc2UocHJldmlld1BhbmUuZGVzdHJveUl0ZW0oaXRlbSkpXG4gIHJldHVybiB0cnVlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gIGNvbnN0IHByZXZpb3VzQWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICBjb25zdCBvcHRpb25zOiBXb3Jrc3BhY2VPcGVuT3B0aW9ucyA9IHsgc2VhcmNoQWxsUGFuZXM6IHRydWUgfVxuICBjb25zdCBzcGxpdENvbmZpZyA9IHV0aWwuYXRvbUNvbmZpZygpLnByZXZpZXdDb25maWcucHJldmlld1NwbGl0UGFuZURpclxuICBpZiAoc3BsaXRDb25maWcgIT09ICdub25lJykge1xuICAgIG9wdGlvbnMuc3BsaXQgPSBzcGxpdENvbmZpZ1xuICB9XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oXG4gICAgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5jcmVhdGUoZWRpdG9yKSxcbiAgICBvcHRpb25zLFxuICApXG4gIHByZXZpb3VzQWN0aXZlUGFuZS5hY3RpdmF0ZSgpXG4gIHJldHVybiByZXNcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJldmlld0ZpbGUoeyBjdXJyZW50VGFyZ2V0IH06IENvbW1hbmRFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBmaWxlUGF0aCA9IChjdXJyZW50VGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5kYXRhc2V0LnBhdGhcbiAgaWYgKCFmaWxlUGF0aCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZm9yIChjb25zdCBlZGl0b3Igb2YgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSkge1xuICAgIGlmIChlZGl0b3IuZ2V0UGF0aCgpID09PSBmaWxlUGF0aCkge1xuICAgICAgYXdhaXQgYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKFxuICAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9maWxlLyR7ZW5jb2RlVVJJKGZpbGVQYXRoKX1gLFxuICAgIHtcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgIH0sXG4gIClcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weUh0bWxJbnRlcm5hbChlZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcmVuZGVyTGFUZVggPSB1dGlsLmF0b21Db25maWcoKS5tYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0XG4gIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkgfHwgZWRpdG9yLmdldFRleHQoKVxuICBhd2FpdCB1dGlsLmNvcHlIdG1sKHRleHQsIHJlbmRlckxhVGVYKVxufVxuXG50eXBlIENvbnRleHRNZW51ID0geyBba2V5OiBzdHJpbmddOiBDb250ZXh0TWVudU9wdGlvbnNbXSB9XG5cbmZ1bmN0aW9uIGNvbmZpZ09ic2VydmVyPFQ+KFxuICBmOiAoXG4gICAgdmFsdWU6IFQsXG4gICAgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gICAgY29udGV4dE1lbnU6IENvbnRleHRNZW51LFxuICApID0+IHZvaWQsXG4pIHtcbiAgbGV0IGNvbmZpZ0Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZTogVCkge1xuICAgIGlmICghZGlzcG9zYWJsZXMpIHJldHVyblxuICAgIGlmIChjb25maWdEaXNwb3NhYmxlcykge1xuICAgICAgY29uZmlnRGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgICBkaXNwb3NhYmxlcy5yZW1vdmUoY29uZmlnRGlzcG9zYWJsZXMpXG4gICAgfVxuICAgIGNvbmZpZ0Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGNvbnN0IGNvbnRleHRNZW51OiBDb250ZXh0TWVudSA9IHt9XG4gICAgZih2YWx1ZSwgY29uZmlnRGlzcG9zYWJsZXMsIGNvbnRleHRNZW51KVxuICAgIGNvbmZpZ0Rpc3Bvc2FibGVzLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZChjb250ZXh0TWVudSkpXG4gICAgZGlzcG9zYWJsZXMuYWRkKGNvbmZpZ0Rpc3Bvc2FibGVzKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyRXh0ZW5zaW9ucyhcbiAgZXh0ZW5zaW9uczogc3RyaW5nW10sXG4gIGRpc3A6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIGNtOiBDb250ZXh0TWVudSxcbikge1xuICBmb3IgKGNvbnN0IGV4dCBvZiBleHRlbnNpb25zKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVwiLiR7ZXh0fVwiXWBcbiAgICBkaXNwLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLFxuICAgICAgICBwcmV2aWV3RmlsZSxcbiAgICAgICksXG4gICAgKVxuICAgIGNtW3NlbGVjdG9yXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdNYXJrZG93biBQcmV2aWV3JyxcbiAgICAgICAgY29tbWFuZDogJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLFxuICAgICAgfSxcbiAgICBdXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJHcmFtbWFycyhcbiAgZ3JhbW1hcnM6IHN0cmluZ1tdLFxuICBkaXNwOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBjbTogQ29udGV4dE1lbnUsXG4pIHtcbiAgZm9yIChjb25zdCBnciBvZiBncmFtbWFycykge1xuICAgIGNvbnN0IGdycyA9IGdyLnJlcGxhY2UoL1xcLi9nLCAnICcpXG4gICAgY29uc3Qgc2VsZWN0b3IgPSBgYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCIke2dyc31cIl1gXG4gICAgZGlzcC5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChzZWxlY3RvciBhcyAnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnOiAoZSkgPT4ge1xuICAgICAgICAgIHV0aWwuaGFuZGxlUHJvbWlzZSh0b2dnbGUoZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpKVxuICAgICAgICB9LFxuICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOmNvcHktaHRtbCc6IChlKSA9PiB7XG4gICAgICAgICAgdXRpbC5oYW5kbGVQcm9taXNlKGNvcHlIdG1sSW50ZXJuYWwoZS5jdXJyZW50VGFyZ2V0LmdldE1vZGVsKCkpKVxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKVxuICAgIGNtW3NlbGVjdG9yXSA9IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTeW5jIFByZXZpZXcnLFxuICAgICAgICBjb21tYW5kOiAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtcHJldmlldycsXG4gICAgICB9LFxuICAgIF1cbiAgfVxufVxuXG5mdW5jdGlvbiBvcGVuZXIodXJpVG9PcGVuOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdmFyLWtleXdvcmQgcHJlZmVyLWNvbnN0XG4gICAgdmFyIHVyaSA9IHVybC5wYXJzZSh1cmlUb09wZW4pXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUsIHVyaVRvT3BlbilcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBpZiAodXJpLnByb3RvY29sICE9PSAnbWFya2Rvd24tcHJldmlldy1wbHVzOicpIHJldHVybiB1bmRlZmluZWRcbiAgaWYgKCF1cmkucGF0aG5hbWUpIHJldHVybiB1bmRlZmluZWRcblxuICB0cnkge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby12YXIta2V5d29yZCBwcmVmZXItY29uc3RcbiAgICB2YXIgcGF0aG5hbWUgPSBkZWNvZGVVUkkodXJpLnBhdGhuYW1lKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICh1cmkuaG9zdG5hbWUgPT09ICdmaWxlJykge1xuICAgIHJldHVybiBuZXcgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUocGF0aG5hbWUuc2xpY2UoMSkpXG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFRyaWVkIHRvIG9wZW4gbWFya2Rvd24tcHJldmlldy1wbHVzIHdpdGggdXJpICR7dXJpVG9PcGVufS4gVGhpcyBpcyBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgcmVwb3J0IHRoaXMgZXJyb3IuYCxcbiAgICApXG4gIH1cbn1cbiJdfQ==