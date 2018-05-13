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
        });
        ipc_1.setupEditor(editor);
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
            console.log(e);
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
            syncPreview: (pos) => {
                this.syncPreview(pos);
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
                this.element.send('scroll-sync', {
                    firstLine,
                    lastLine,
                });
            },
        }));
    }
}
exports.MarkdownPreviewViewEditorRemote = MarkdownPreviewViewEditorRemote;
function ignore() {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci1yZW1vdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1lZGl0b3ItcmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQThCO0FBQzlCLG1FQUE0RTtBQUM1RSxrQ0FBdUM7QUFDdkMsK0JBQThFO0FBQzlFLHVDQUFpQztBQUVqQyxxQ0FBNkMsU0FBUSwyQ0FBbUI7SUFPdEUsWUFBb0IsUUFBZ0IsRUFBVSxRQUFnQjtRQUM1RCxLQUFLLEVBQUUsQ0FBQTtRQURXLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBTnRELFNBQUksR0FBRyxFQUFFLENBQUE7UUFDVCxVQUFLLEdBQVcsV0FBVyxDQUFBO1FBT2pDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM5QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtRQUN6QixJQUFJLENBQUMsR0FBRzthQUNMLElBQUksRUFBRTthQUNOLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ1YsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFBO1lBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQTtZQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxDQUFBO1lBQzVELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQTtZQUNwQixJQUFJLENBQUMsT0FBTyxD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QTtnQkFDaEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1lBQ3RCLENBQUM7WUFDRCxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUN2QixDQUFDO1lBQ0QsVUFBVSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7Z0JBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO2dCQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1lBQ3ZDLENBQUM7WUFDRCxhQUFhLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBRSxDQUFBO2dCQUM5RCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1lBQ3ZDLENBQUM7WUFDRCxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDcEIsQ0FBQztZQUNELFVBQVUsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFnQixhQUFhLEVBQUU7b0JBQzlDLFNBQVM7b0JBQ1QsUUFBUTtpQkFDVCxDQUFDLENBQUE7WUFDSixDQUFDO1NBQ0YsQ0FBQyxDQUNILENBQUE7SUFDSCxDQUFDO0NBQ0Y7QUEvSEQsMEVBK0hDO0FBRUQ7QUFFQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGV4dEVkaXRvciwgR3JhbW1hciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXcsIFNlcmlhbGl6ZWRNUFYgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcbmltcG9ydCB7IGhhbmRsZVByb21pc2UgfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHsgRXZlbnRIYW5kbGVyLCBJUENDYWxsZXIsIHNob3VsZFNjcm9sbFN5bmMsIHNldHVwRWRpdG9yIH0gZnJvbSAnLi9pcGMnXG5pbXBvcnQgeyByZW1vdGUgfSBmcm9tICdlbGVjdHJvbidcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3JSZW1vdGUgZXh0ZW5kcyBNYXJrZG93blByZXZpZXdWaWV3IHtcbiAgcHJpdmF0ZSB0ZXh0ID0gJydcbiAgcHJpdmF0ZSB0aXRsZTogc3RyaW5nID0gJzxQZW5kaW5nPidcbiAgcHJpdmF0ZSBwYXRoPzogc3RyaW5nXG4gIHByaXZhdGUgZ3JhbW1hcj86IEdyYW1tYXJcbiAgcHJpdmF0ZSBpcGM6IElQQ0NhbGxlclxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgd2luZG93SWQ6IG51bWJlciwgcHJpdmF0ZSBlZGl0b3JJZDogbnVtYmVyKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaXBjID0gbmV3IElQQ0NhbGxlcih3aW5kb3dJZCwgZWRpdG9ySWQpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5pcGMpXG4gICAgdGhpcy5oYW5kbGVFZGl0b3JFdmVudHMoKVxuICAgIHRoaXMuaXBjXG4gICAgICAuaW5pdCgpXG4gICAgICAudGhlbigodikgPT4ge1xuICAgICAgICB0aGlzLnRleHQgPSB2LnRleHRcbiAgICAgICAgdGhpcy5wYXRoID0gdi5wYXRoXG4gICAgICAgIHRoaXMuZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSh2LmdyYW1tYXIpIVxuICAgICAgICB0aGlzLnRpdGxlID0gdi50aXRsZVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlOiBFcnJvcikgPT4ge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCB0byBvcGVuIHByZXZpZXcnLCB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgZGV0YWlsOiBlLnRvU3RyaW5nKCksXG4gICAgICAgICAgc3RhY2s6IGUuc3RhY2ssXG4gICAgICAgIH0pXG4gICAgICB9KVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBvcGVuKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICAgIGNvbnN0IHdpbmRvd0lkID0gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5pZFxuICAgIGNvbnN0IGVkaXRvcklkID0gZWRpdG9yLmlkXG4gICAgYXRvbS5vcGVuKHtcbiAgICAgIHBhdGhzVG9PcGVuOiBbXG4gICAgICAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9yZW1vdGUtZWRpdG9yLyR7d2luZG93SWR9LyR7ZWRpdG9ySWR9YCxcbiAgICAgIF0sXG4gICAgfSlcbiAgICBzZXR1cEVkaXRvcihlZGl0b3IpXG4gIH1cblxuICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICB0aGlzLmlwYy5kZXN0cm95KCkuY2F0Y2goaWdub3JlKVxuICAgIHN1cGVyLmRlc3Ryb3koKVxuICB9XG5cbiAgcHVibGljIGdldFRpdGxlKCkge1xuICAgIHJldHVybiBgJHt0aGlzLnRpdGxlfSBQcmV2aWV3YFxuICB9XG5cbiAgcHVibGljIGdldFVSSSgpIHtcbiAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL3JlbW90ZS1lZGl0b3IvJHt0aGlzLndpbmRvd0lkfS8ke1xuICAgICAgdGhpcy5lZGl0b3JJZFxuICAgIH1gXG4gIH1cblxuICBwdWJsaWMgZ2V0UGF0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoXG4gIH1cblxuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRNUFYge1xuICAgIHJldHVybiB1bmRlZmluZWQgYXMgYW55XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dFxuICB9XG5cbiAgcHJvdGVjdGVkIGdldEdyYW1tYXIoKTogR3JhbW1hciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZ3JhbW1hclxuICB9XG5cbiAgcHJvdGVjdGVkIGRpZFNjcm9sbFByZXZpZXcobWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgaWYgKCFzaG91bGRTY3JvbGxTeW5jKCdwcmV2aWV3JykpIHJldHVyblxuICAgIHRoaXMuaXBjLnNjcm9sbFRvQnVmZmVyUmFuZ2UoW21pbiwgbWF4XSkuY2F0Y2goaWdub3JlKVxuICB9XG5cbiAgcHJvdGVjdGVkIG9wZW5Tb3VyY2UoaW5pdGlhbExpbmU/OiBudW1iZXIpIHtcbiAgICB0aGlzLmlwYy5vcGVuU291cmNlKGluaXRpYWxMaW5lKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxuICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgaGFuZGxlUHJvbWlzZShcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIHtcbiAgICAgICAgICAgIGluaXRpYWxMaW5lLFxuICAgICAgICAgIH0pLFxuICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICAnRmFpbGVkIHRvIHN5bmMgc291cmNlOiBubyBlZGl0b3IgYW5kIG5vIHBhdGgnLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRWRpdG9yRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IEV2ZW50SGFuZGxlcih0aGlzLndpbmRvd0lkLCB0aGlzLmVkaXRvcklkLCB7XG4gICAgICAgIGNoYW5nZVRleHQ6ICh0ZXh0KSA9PiB7XG4gICAgICAgICAgdGhpcy50ZXh0ID0gdGV4dFxuICAgICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICAgIH0sXG4gICAgICAgIHN5bmNQcmV2aWV3OiAocG9zKSA9PiB7XG4gICAgICAgICAgdGhpcy5zeW5jUHJldmlldyhwb3MpXG4gICAgICAgIH0sXG4gICAgICAgIGNoYW5nZVBhdGg6ICh7IHRpdGxlLCBwYXRoIH0pID0+IHtcbiAgICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGVcbiAgICAgICAgICB0aGlzLnBhdGggPSBwYXRoXG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB9LFxuICAgICAgICBjaGFuZ2VHcmFtbWFyOiAoZ3JhbW1hck5hbWUpID0+IHtcbiAgICAgICAgICB0aGlzLmdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoZ3JhbW1hck5hbWUpIVxuICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogKCkgPT4ge1xuICAgICAgICAgIHV0aWwuZGVzdHJveSh0aGlzKVxuICAgICAgICB9LFxuICAgICAgICBzY3JvbGxTeW5jOiAoW2ZpcnN0TGluZSwgbGFzdExpbmVdKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnNlbmQ8J3Njcm9sbC1zeW5jJz4oJ3Njcm9sbC1zeW5jJywge1xuICAgICAgICAgICAgZmlyc3RMaW5lLFxuICAgICAgICAgICAgbGFzdExpbmUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIClcbiAgfVxufVxuXG5mdW5jdGlvbiBpZ25vcmUoKSB7XG4gIC8qIGRvIG5vdGlobmcgKi9cbn1cbiJdfQ==