"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./util");
const markdown_preview_view_1 = require("./markdown-preview-view");
const util_1 = require("../util");
const ipc_1 = require("./ipc");
const electron_1 = require("electron");
class MarkdownPreviewViewEditorRemote extends markdown_preview_view_1.MarkdownPreviewView {
    constructor(windowId, editorId) {
        super();
        this.windowId = windowId;
        this.editorId = editorId;
        this.text = '';
        this.title = '<Pending>';
        this.ipc = new ipc_1.IPCCaller(windowId, editorId);
        this.disposables.add(this.ipc);
        this.handleEditorEvents();
        this.ipc
            .init()
            .then((v) => {
            this.text = v.text;
            this.path = v.path;
            this.grammar = atom.grammars.grammarForScopeName(v.grammar);
            this.title = v.title;
            this.emitter.emit('did-change-title');
            this.changeHandler();
        })
            .catch((e) => {
            atom.notifications.addError('Failed to open preview', {
                dismissable: true,
                detail: e.toString(),
                stack: e.stack,
            });
        });
    }
    static open(editor) {
        const windowId = electron_1.remote.getCurrentWindow().id;
        const editorId = editor.id;
        atom.open({
            pathsToOpen: [
                `markdown-preview-plus://remote-editor/${windowId}/${editorId}`,
            ],
            newWindow: true,
        });
        ipc_1.RemoteEditorServer.create(editor);
    }
    destroy() {
        this.ipc.destroy().catch(ignore);
        super.destroy();
    }
    getTitle() {
        return `${this.title} Preview`;
    }
    getURI() {
        return `markdown-preview-plus://remote-editor/${this.windowId}/${this.editorId}`;
    }
    getPath() {
        return this.path;
    }
    serialize() {
        return undefined;
    }
    openNewWindow() {
        atom.open({
            pathsToOpen: [this.getURI()],
            newWindow: true,
        });
        util.destroy(this);
    }
    async getMarkdownSource() {
        return this.text;
    }
    getGrammar() {
        return this.grammar;
    }
    didScrollPreview(min, max) {
        if (!ipc_1.shouldScrollSync('preview'))
            return;
        this.ipc.scrollToBufferRange([min, max]).catch(ignore);
    }
    openSource(initialLine) {
        this.ipc.openSource(initialLine).catch((e) => {
            console.error(e);
            const path = this.getPath();
            if (path) {
                util_1.handlePromise(atom.workspace.open(path, {
                    initialLine,
                }));
            }
            else {
                atom.notifications.addWarning('Failed to sync source: no editor and no path');
            }
        });
    }
    handleEditorEvents() {
        this.disposables.add(new ipc_1.EventHandler(this.windowId, this.editorId, {
            changeText: (text) => {
                this.text = text;
                this.changeHandler();
            },
            syncPreview: ({ pos, flash }) => {
                this.syncPreview(pos, flash);
            },
            changePath: ({ title, path }) => {
                this.title = title;
                this.path = path;
                this.emitter.emit('did-change-title');
            },
            changeGrammar: (grammarName) => {
                this.grammar = atom.grammars.grammarForScopeName(grammarName);
                this.emitter.emit('did-change-title');
            },
            destroy: () => {
                util.destroy(this);
            },
            scrollSync: ([firstLine, lastLine]) => {
                this.handler.scrollSync(firstLine, lastLine);
            },
        }));
    }
}
exports.MarkdownPreviewViewEditorRemote = MarkdownPreviewViewEditorRemote;
function ignore() {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci1yZW1vdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1lZGl0b3ItcmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQThCO0FBQzlCLG1FQUE0RTtBQUM1RSxrQ0FBdUM7QUFDdkMsK0JBS2M7QUFDZCx1Q0FBaUM7QUFFakMsTUFBYSwrQkFBZ0MsU0FBUSwyQ0FBbUI7SUFPdEUsWUFBb0IsUUFBZ0IsRUFBVSxRQUFnQjtRQUM1RCxLQUFLLEVBQUUsQ0FBQTtRQURXLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBTnRELFNBQUksR0FBRyxFQUFFLENBQUE7UUFDVCxVQUFLLEdBQVcsV0FBVyxDQUFBO1FBT2pDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM5QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtRQUN6QixJQUFJLENBQUMsR0FBRzthQUNMLElBQUksRUFBRTthQUNOLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ1YsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFBO1lBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQTtZQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzNELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQTtZQUNwQixJQUFJLENBQUMsT0FB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Q0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDOUMsQ0FBQztTQUNGLENBQUMsQ0FDSCxDQUFBO0lBQ0gsQ0FBQztDQUNGO0FBcklELDBFQXFJQztBQUVELFNBQVMsTUFBTTtBQUVmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUZXh0RWRpdG9yLCBHcmFtbWFyIH0gZnJvbSAnYXRvbSdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3VmlldywgU2VyaWFsaXplZE1QViB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuaW1wb3J0IHsgaGFuZGxlUHJvbWlzZSB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge1xuICBFdmVudEhhbmRsZXIsXG4gIElQQ0NhbGxlcixcbiAgc2hvdWxkU2Nyb2xsU3luYyxcbiAgUmVtb3RlRWRpdG9yU2VydmVyLFxufSBmcm9tICcuL2lwYydcbmltcG9ydCB7IHJlbW90ZSB9IGZyb20gJ2VsZWN0cm9uJ1xuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvclJlbW90ZSBleHRlbmRzIE1hcmtkb3duUHJldmlld1ZpZXcge1xuICBwcml2YXRlIHRleHQgPSAnJ1xuICBwcml2YXRlIHRpdGxlOiBzdHJpbmcgPSAnPFBlbmRpbmc+J1xuICBwcml2YXRlIHBhdGg/OiBzdHJpbmdcbiAgcHJpdmF0ZSBncmFtbWFyPzogR3JhbW1hclxuICBwcml2YXRlIGlwYzogSVBDQ2FsbGVyXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB3aW5kb3dJZDogbnVtYmVyLCBwcml2YXRlIGVkaXRvcklkOiBudW1iZXIpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5pcGMgPSBuZXcgSVBDQ2FsbGVyKHdpbmRvd0lkLCBlZGl0b3JJZClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmlwYylcbiAgICB0aGlzLmhhbmRsZUVkaXRvckV2ZW50cygpXG4gICAgdGhpcy5pcGNcbiAgICAgIC5pbml0KClcbiAgICAgIC50aGVuKCh2KSA9PiB7XG4gICAgICAgIHRoaXMudGV4dCA9IHYudGV4dFxuICAgICAgICB0aGlzLnBhdGggPSB2LnBhdGhcbiAgICAgICAgdGhpcy5ncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHYuZ3JhbW1hcilcbiAgICAgICAgdGhpcy50aXRsZSA9IHYudGl0bGVcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB0aGlzLmNoYW5nZUhhbmRsZXIoKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZTogRXJyb3IpID0+IHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgdG8gb3BlbiBwcmV2aWV3Jywge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgIGRldGFpbDogZS50b1N0cmluZygpLFxuICAgICAgICAgIHN0YWNrOiBlLnN0YWNrLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgb3BlbihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgICBjb25zdCB3aW5kb3dJZCA9IHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkuaWRcbiAgICBjb25zdCBlZGl0b3JJZCA9IGVkaXRvci5pZFxuICAgIGF0b20ub3Blbih7XG4gICAgICBwYXRoc1RvT3BlbjogW1xuICAgICAgICBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vcmVtb3RlLWVkaXRvci8ke3dpbmRvd0lkfS8ke2VkaXRvcklkfWAsXG4gICAgICBdLFxuICAgICAgbmV3V2luZG93OiB0cnVlLFxuICAgIH0pXG4gICAgUmVtb3RlRWRpdG9yU2VydmVyLmNyZWF0ZShlZGl0b3IpXG4gIH1cblxuICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICB0aGlzLmlwYy5kZXN0cm95KCkuY2F0Y2goaWdub3JlKVxuICAgIHN1cGVyLmRlc3Ryb3koKVxuICB9XG5cbiAgcHVibGljIGdldFRpdGxlKCkge1xuICAgIHJldHVybiBgJHt0aGlzLnRpdGxlfSBQcmV2aWV3YFxuICB9XG5cbiAgcHVibGljIGdldFVSSSgpIHtcbiAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL3JlbW90ZS1lZGl0b3IvJHt0aGlzLndpbmRvd0lkfS8ke1xuICAgICAgdGhpcy5lZGl0b3JJZFxuICAgIH1gXG4gIH1cblxuICBwdWJsaWMgZ2V0UGF0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoXG4gIH1cblxuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRNUFYge1xuICAgIHJldHVybiB1bmRlZmluZWQgYXMgYW55XG4gIH1cblxuICBwcm90ZWN0ZWQgb3Blbk5ld1dpbmRvdygpIHtcbiAgICBhdG9tLm9wZW4oe1xuICAgICAgcGF0aHNUb09wZW46IFt0aGlzLmdldFVSSSgpXSxcbiAgICAgIG5ld1dpbmRvdzogdHJ1ZSxcbiAgICB9KVxuICAgIHV0aWwuZGVzdHJveSh0aGlzKVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGdldE1hcmtkb3duU291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLnRleHRcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRHcmFtbWFyKCk6IEdyYW1tYXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmdyYW1tYXJcbiAgfVxuXG4gIHByb3RlY3RlZCBkaWRTY3JvbGxQcmV2aWV3KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICAgIGlmICghc2hvdWxkU2Nyb2xsU3luYygncHJldmlldycpKSByZXR1cm5cbiAgICB0aGlzLmlwYy5zY3JvbGxUb0J1ZmZlclJhbmdlKFttaW4sIG1heF0pLmNhdGNoKGlnbm9yZSlcbiAgfVxuXG4gIHByb3RlY3RlZCBvcGVuU291cmNlKGluaXRpYWxMaW5lPzogbnVtYmVyKSB7XG4gICAgdGhpcy5pcGMub3BlblNvdXJjZShpbml0aWFsTGluZSkuY2F0Y2goKGUpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIHtcbiAgICAgICAgICAgIGluaXRpYWxMaW5lLFxuICAgICAgICAgIH0pLFxuICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICAnRmFpbGVkIHRvIHN5bmMgc291cmNlOiBubyBlZGl0b3IgYW5kIG5vIHBhdGgnLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRWRpdG9yRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IEV2ZW50SGFuZGxlcih0aGlzLndpbmRvd0lkLCB0aGlzLmVkaXRvcklkLCB7XG4gICAgICAgIGNoYW5nZVRleHQ6ICh0ZXh0KSA9PiB7XG4gICAgICAgICAgdGhpcy50ZXh0ID0gdGV4dFxuICAgICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHN5bmNQcmV2aWV3OiAoeyBwb3MsIGZsYXNoIH0pID0+IHtcbiAgICAgICAgICB0aGlzLnN5bmNQcmV2aWV3KHBvcywgZmxhc2gpXG4gICAgICAgIH0sXG4gICAgICAgIGNoYW5nZVBhdGg6ICh7IHRpdGxlLCBwYXRoIH0pID0+IHtcbiAgICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGVcbiAgICAgICAgICB0aGlzLnBhdGggPSBwYXRoXG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB9LFxuICAgICAgICBjaGFuZ2VHcmFtbWFyOiAoZ3JhbW1hck5hbWUpID0+IHtcbiAgICAgICAgICB0aGlzLmdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoZ3JhbW1hck5hbWUpIVxuICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogKCkgPT4ge1xuICAgICAgICAgIHV0aWwuZGVzdHJveSh0aGlzKVxuICAgICAgICB9LFxuICAgICAgICBzY3JvbGxTeW5jOiAoW2ZpcnN0TGluZSwgbGFzdExpbmVdKSA9PiB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVyLnNjcm9sbFN5bmMoZmlyc3RMaW5lLCBsYXN0TGluZSlcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcbiAgfVxufVxuXG5mdW5jdGlvbiBpZ25vcmUoKSB7XG4gIC8qIGRvIG5vdGlobmcgKi9cbn1cbiJdfQ==