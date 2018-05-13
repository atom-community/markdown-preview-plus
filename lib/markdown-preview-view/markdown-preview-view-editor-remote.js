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
        this.handleEditorEvents();
        util_1.handlePromise(this.ipc.init().then((v) => {
            this.text = v.text;
            this.path = v.path;
            this.grammar = atom.grammars.grammarForScopeName(v.grammar);
            this.title = v.title;
            this.emitter.emit('did-change-title');
            this.changeHandler();
        }));
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
        util_1.handlePromise(this.ipc.destroy());
        this.ipc.dispose();
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
    async didScrollPreview(min, max) {
        if (!ipc_1.shouldScrollSync('preview'))
            return;
        await this.ipc.scrollToBufferRange([min, max]);
    }
    openSource(initialLine) {
        util_1.handlePromise(this.ipc.openSource(initialLine));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci1yZW1vdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1lZGl0b3ItcmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQThCO0FBQzlCLG1FQUE0RTtBQUM1RSxrQ0FBdUM7QUFDdkMsK0JBQThFO0FBQzlFLHVDQUFpQztBQUVqQyxxQ0FBNkMsU0FBUSwyQ0FBbUI7SUFPdEUsWUFBb0IsUUFBZ0IsRUFBVSxRQUFnQjtRQUM1RCxLQUFLLEVBQUUsQ0FBQTtRQURXLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBTnRELFNBQUksR0FBRyxFQUFFLENBQUE7UUFDVCxVQUFLLEdBQVcsV0FBVyxDQUFBO1FBT2pDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxlQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQ3pCLG9CQUFhLENBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUE7WUFDbEIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFBO1lBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFFLENBQUE7WUFDNUQsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFBO1lBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7WUFDckMsSUFBSSxDQUFDLGFB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QkFDWixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3BCLENBQUM7WUFDRCxVQUFVLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBZ0IsYUFBYSxFQUFFO29CQUM5QyxTQUFTO29CQUNULFFBQVE7aUJBQ1QsQ0FBQyxDQUFBO1lBQ0osQ0FBQztTQUNGLENBQUMsQ0FDSCxDQUFBO0lBQ0gsQ0FBQztDQUNGO0FBMUdELDBFQTBHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRleHRFZGl0b3IsIEdyYW1tYXIgfSBmcm9tICdhdG9tJ1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBNYXJrZG93blByZXZpZXdWaWV3LCBTZXJpYWxpemVkTVBWIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlIH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7IEV2ZW50SGFuZGxlciwgSVBDQ2FsbGVyLCBzaG91bGRTY3JvbGxTeW5jLCBzZXR1cEVkaXRvciB9IGZyb20gJy4vaXBjJ1xuaW1wb3J0IHsgcmVtb3RlIH0gZnJvbSAnZWxlY3Ryb24nXG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yUmVtb3RlIGV4dGVuZHMgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHByaXZhdGUgdGV4dCA9ICcnXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZyA9ICc8UGVuZGluZz4nXG4gIHByaXZhdGUgcGF0aD86IHN0cmluZ1xuICBwcml2YXRlIGdyYW1tYXI/OiBHcmFtbWFyXG4gIHByaXZhdGUgaXBjOiBJUENDYWxsZXJcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHdpbmRvd0lkOiBudW1iZXIsIHByaXZhdGUgZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmlwYyA9IG5ldyBJUENDYWxsZXIod2luZG93SWQsIGVkaXRvcklkKVxuICAgIHRoaXMuaGFuZGxlRWRpdG9yRXZlbnRzKClcbiAgICBoYW5kbGVQcm9taXNlKFxuICAgICAgdGhpcy5pcGMuaW5pdCgpLnRoZW4oKHYpID0+IHtcbiAgICAgICAgdGhpcy50ZXh0ID0gdi50ZXh0XG4gICAgICAgIHRoaXMucGF0aCA9IHYucGF0aFxuICAgICAgICB0aGlzLmdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUodi5ncmFtbWFyKSFcbiAgICAgICAgdGhpcy50aXRsZSA9IHYudGl0bGVcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtdGl0bGUnKVxuICAgICAgICB0aGlzLmNoYW5nZUhhbmRsZXIoKVxuICAgICAgfSksXG4gICAgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBvcGVuKGVkaXRvcjogVGV4dEVkaXRvcikge1xuICAgIGNvbnN0IHdpbmRvd0lkID0gcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS5pZFxuICAgIGNvbnN0IGVkaXRvcklkID0gZWRpdG9yLmlkXG4gICAgYXRvbS5vcGVuKHtcbiAgICAgIHBhdGhzVG9PcGVuOiBbXG4gICAgICAgIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9yZW1vdGUtZWRpdG9yLyR7d2luZG93SWR9LyR7ZWRpdG9ySWR9YCxcbiAgICAgIF0sXG4gICAgfSlcbiAgICBzZXR1cEVkaXRvcihlZGl0b3IpXG4gIH1cblxuICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICBoYW5kbGVQcm9taXNlKHRoaXMuaXBjLmRlc3Ryb3koKSlcbiAgICB0aGlzLmlwYy5kaXNwb3NlKClcbiAgICBzdXBlci5kZXN0cm95KClcbiAgfVxuXG4gIHB1YmxpYyBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gYCR7dGhpcy50aXRsZX0gUHJldmlld2BcbiAgfVxuXG4gIHB1YmxpYyBnZXRVUkkoKSB7XG4gICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9yZW1vdGUtZWRpdG9yLyR7dGhpcy53aW5kb3dJZH0vJHtcbiAgICAgIHRoaXMuZWRpdG9ySWRcbiAgICB9YFxuICB9XG5cbiAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aFxuICB9XG5cbiAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkTVBWIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkIGFzIGFueVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGdldE1hcmtkb3duU291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLnRleHRcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRHcmFtbWFyKCk6IEdyYW1tYXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmdyYW1tYXJcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBkaWRTY3JvbGxQcmV2aWV3KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICAgIGlmICghc2hvdWxkU2Nyb2xsU3luYygncHJldmlldycpKSByZXR1cm5cbiAgICBhd2FpdCB0aGlzLmlwYy5zY3JvbGxUb0J1ZmZlclJhbmdlKFttaW4sIG1heF0pXG4gIH1cblxuICBwcm90ZWN0ZWQgb3BlblNvdXJjZShpbml0aWFsTGluZT86IG51bWJlcikge1xuICAgIGhhbmRsZVByb21pc2UodGhpcy5pcGMub3BlblNvdXJjZShpbml0aWFsTGluZSkpXG4gIH1cblxuICBwcml2YXRlIGhhbmRsZUVkaXRvckV2ZW50cygpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBFdmVudEhhbmRsZXIodGhpcy53aW5kb3dJZCwgdGhpcy5lZGl0b3JJZCwge1xuICAgICAgICBjaGFuZ2VUZXh0OiAodGV4dCkgPT4ge1xuICAgICAgICAgIHRoaXMudGV4dCA9IHRleHRcbiAgICAgICAgICB0aGlzLmNoYW5nZUhhbmRsZXIoKVxuICAgICAgICB9LFxuICAgICAgICBzeW5jUHJldmlldzogKHBvcykgPT4ge1xuICAgICAgICAgIHRoaXMuc3luY1ByZXZpZXcocG9zKVxuICAgICAgICB9LFxuICAgICAgICBjaGFuZ2VQYXRoOiAoeyB0aXRsZSwgcGF0aCB9KSA9PiB7XG4gICAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlXG4gICAgICAgICAgdGhpcy5wYXRoID0gcGF0aFxuICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgICAgfSxcbiAgICAgICAgY2hhbmdlR3JhbW1hcjogKGdyYW1tYXJOYW1lKSA9PiB7XG4gICAgICAgICAgdGhpcy5ncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKGdyYW1tYXJOYW1lKSFcbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS10aXRsZScpXG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6ICgpID0+IHtcbiAgICAgICAgICB1dGlsLmRlc3Ryb3kodGhpcylcbiAgICAgICAgfSxcbiAgICAgICAgc2Nyb2xsU3luYzogKFtmaXJzdExpbmUsIGxhc3RMaW5lXSkgPT4ge1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5zZW5kPCdzY3JvbGwtc3luYyc+KCdzY3JvbGwtc3luYycsIHtcbiAgICAgICAgICAgIGZpcnN0TGluZSxcbiAgICAgICAgICAgIGxhc3RMaW5lLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApXG4gIH1cbn1cbiJdfQ==