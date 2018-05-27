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
                this.handler.scrollSync(firstLine, lastLine);
            },
        }));
    }
}
exports.MarkdownPreviewViewEditorRemote = MarkdownPreviewViewEditorRemote;
function ignore() {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci1yZW1vdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1lZGl0b3ItcmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQThCO0FBQzlCLG1FQUE0RTtBQUM1RSxrQ0FBdUM7QUFDdkMsK0JBS2M7QUFDZCx1Q0FBaUM7QUFFakMscUNBQTZDLFNBQVEsMkNBQW1CO0lBT3RFLFlBQW9CLFFBQWdCLEVBQVUsUUFBZ0I7UUFDNUQsS0FBSyxFQUFFLENBQUE7UUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQU50RCxTQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ1QsVUFBSyxHQUFXLFdBQVcsQ0FBQTtRQU9qQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksZUFBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDOUIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7UUFDekIsSUFBSSxDQUFDLEdBQUc7YUFDTCxJQUFJLEVBQUU7YUFDTixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNWLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQTtZQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUE7WUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUMzRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUE7WUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FB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Q0FBQztTQUNGLENBQUMsQ0FDSCxDQUFBO0lBQ0gsQ0FBQztDQUNGO0FBcklELDBFQXFJQztBQUVEO0FBRUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRleHRFZGl0b3IsIEdyYW1tYXIgfSBmcm9tICdhdG9tJ1xyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcclxuaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3VmlldywgU2VyaWFsaXplZE1QViB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xyXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlIH0gZnJvbSAnLi4vdXRpbCdcclxuaW1wb3J0IHtcclxuICBFdmVudEhhbmRsZXIsXHJcbiAgSVBDQ2FsbGVyLFxyXG4gIHNob3VsZFNjcm9sbFN5bmMsXHJcbiAgUmVtb3RlRWRpdG9yU2VydmVyLFxyXG59IGZyb20gJy4vaXBjJ1xyXG5pbXBvcnQgeyByZW1vdGUgfSBmcm9tICdlbGVjdHJvbidcclxuXHJcbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yUmVtb3RlIGV4dGVuZHMgTWFya2Rvd25QcmV2aWV3VmlldyB7XHJcbiAgcHJpdmF0ZSB0ZXh0ID0gJydcclxuICBwcml2YXRlIHRpdGxlOiBzdHJpbmcgPSAnPFBlbmRpbmc+J1xyXG4gIHByaXZhdGUgcGF0aD86IHN0cmluZ1xyXG4gIHByaXZhdGUgZ3JhbW1hcj86IEdyYW1tYXJcclxuICBwcml2YXRlIGlwYzogSVBDQ2FsbGVyXHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgd2luZG93SWQ6IG51bWJlciwgcHJpdmF0ZSBlZGl0b3JJZDogbnVtYmVyKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmlwYyA9IG5ldyBJUENDYWxsZXIod2luZG93SWQsIGVkaXRvcklkKVxyXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5pcGMpXHJcbiAgICB0aGlzLmhhbmRsZUVkaXRvckV2ZW50cygpXHJcbiAgICB0aGlzLmlwY1xyXG4gICAgICAuaW5pdCgpXHJcbiAgICAgIC50aGVuKCh2KSA9PiB7XHJcbiAgICAgICAgdGhpcy50ZXh0ID0gdi50ZXh0XHJcbiAgICAgICAgdGhpcy5wYXRoID0gdi5wYXRoXHJcbiAgICAgICAgdGhpcy5ncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHYuZ3JhbW1hcilcclxuICAgICAgICB0aGlzLnRpdGxlID0gdi50aXRsZVxyXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcclxuICAgICAgICB0aGlzLmNoYW5nZUhhbmRsZXIoKVxyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goKGU6IEVycm9yKSA9PiB7XHJcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgdG8gb3BlbiBwcmV2aWV3Jywge1xyXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXHJcbiAgICAgICAgICBkZXRhaWw6IGUudG9TdHJpbmcoKSxcclxuICAgICAgICAgIHN0YWNrOiBlLnN0YWNrLFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIG9wZW4oZWRpdG9yOiBUZXh0RWRpdG9yKSB7XHJcbiAgICBjb25zdCB3aW5kb3dJZCA9IHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkuaWRcclxuICAgIGNvbnN0IGVkaXRvcklkID0gZWRpdG9yLmlkXHJcbiAgICBhdG9tLm9wZW4oe1xyXG4gICAgICBwYXRoc1RvT3BlbjogW1xyXG4gICAgICAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9yZW1vdGUtZWRpdG9yLyR7d2luZG93SWR9LyR7ZWRpdG9ySWR9YCxcclxuICAgICAgXSxcclxuICAgICAgbmV3V2luZG93OiB0cnVlLFxyXG4gICAgfSlcclxuICAgIFJlbW90ZUVkaXRvclNlcnZlci5jcmVhdGUoZWRpdG9yKVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLmlwYy5kZXN0cm95KCkuY2F0Y2goaWdub3JlKVxyXG4gICAgc3VwZXIuZGVzdHJveSgpXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0VGl0bGUoKSB7XHJcbiAgICByZXR1cm4gYCR7dGhpcy50aXRsZX0gUHJldmlld2BcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRVUkkoKSB7XHJcbiAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL3JlbW90ZS1lZGl0b3IvJHt0aGlzLndpbmRvd0lkfS8ke1xyXG4gICAgICB0aGlzLmVkaXRvcklkXHJcbiAgICB9YFxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFBhdGgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wYXRoXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRNUFYge1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZCBhcyBhbnlcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBvcGVuTmV3V2luZG93KCkge1xyXG4gICAgYXRvbS5vcGVuKHtcclxuICAgICAgcGF0aHNUb09wZW46IFt0aGlzLmdldFVSSSgpXSxcclxuICAgICAgbmV3V2luZG93OiB0cnVlLFxyXG4gICAgfSlcclxuICAgIHV0aWwuZGVzdHJveSh0aGlzKVxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGFzeW5jIGdldE1hcmtkb3duU291cmNlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudGV4dFxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGdldEdyYW1tYXIoKTogR3JhbW1hciB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmFtbWFyXHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgZGlkU2Nyb2xsUHJldmlldyhtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcclxuICAgIGlmICghc2hvdWxkU2Nyb2xsU3luYygncHJldmlldycpKSByZXR1cm5cclxuICAgIHRoaXMuaXBjLnNjcm9sbFRvQnVmZmVyUmFuZ2UoW21pbiwgbWF4XSkuY2F0Y2goaWdub3JlKVxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIG9wZW5Tb3VyY2UoaW5pdGlhbExpbmU/OiBudW1iZXIpIHtcclxuICAgIHRoaXMuaXBjLm9wZW5Tb3VyY2UoaW5pdGlhbExpbmUpLmNhdGNoKChlKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGUpXHJcbiAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKVxyXG4gICAgICBpZiAocGF0aCkge1xyXG4gICAgICAgIGhhbmRsZVByb21pc2UoXHJcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIHtcclxuICAgICAgICAgICAgaW5pdGlhbExpbmUsXHJcbiAgICAgICAgICB9KSxcclxuICAgICAgICApXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXHJcbiAgICAgICAgICAnRmFpbGVkIHRvIHN5bmMgc291cmNlOiBubyBlZGl0b3IgYW5kIG5vIHBhdGgnLFxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRWRpdG9yRXZlbnRzKCkge1xyXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXHJcbiAgICAgIG5ldyBFdmVudEhhbmRsZXIodGhpcy53aW5kb3dJZCwgdGhpcy5lZGl0b3JJZCwge1xyXG4gICAgICAgIGNoYW5nZVRleHQ6ICh0ZXh0KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnRleHQgPSB0ZXh0XHJcbiAgICAgICAgICB0aGlzLmNoYW5nZUhhbmRsZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3luY1ByZXZpZXc6IChwb3MpID0+IHtcclxuICAgICAgICAgIHRoaXMuc3luY1ByZXZpZXcocG9zKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2hhbmdlUGF0aDogKHsgdGl0bGUsIHBhdGggfSkgPT4ge1xyXG4gICAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlXHJcbiAgICAgICAgICB0aGlzLnBhdGggPSBwYXRoXHJcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaGFuZ2VHcmFtbWFyOiAoZ3JhbW1hck5hbWUpID0+IHtcclxuICAgICAgICAgIHRoaXMuZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShncmFtbWFyTmFtZSkhXHJcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXN0cm95OiAoKSA9PiB7XHJcbiAgICAgICAgICB1dGlsLmRlc3Ryb3kodGhpcylcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjcm9sbFN5bmM6IChbZmlyc3RMaW5lLCBsYXN0TGluZV0pID0+IHtcclxuICAgICAgICAgIHRoaXMuaGFuZGxlci5zY3JvbGxTeW5jKGZpcnN0TGluZSwgbGFzdExpbmUpXHJcbiAgICAgICAgfSxcclxuICAgICAgfSksXHJcbiAgICApXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpZ25vcmUoKSB7XHJcbiAgLyogZG8gbm90aWhuZyAqL1xyXG59XHJcbiJdfQ==