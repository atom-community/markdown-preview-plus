"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("./util");
const markdown_preview_view_1 = require("./markdown-preview-view");
const util_1 = require("../util");
class MarkdownPreviewViewEditor extends markdown_preview_view_1.MarkdownPreviewView {
    constructor(editor) {
        super();
        this.editor = editor;
        this.syncPreviewHelper = async () => {
            const pos = this.editor.getCursorBufferPosition().row;
            const source = await this.getMarkdownSource();
            this.syncPreview(source, pos);
        };
        this.handleEditorEvents();
    }
    static create(editor) {
        let mppv = MarkdownPreviewViewEditor.editorMap.get(editor);
        if (!mppv) {
            mppv = new MarkdownPreviewViewEditor(editor);
            MarkdownPreviewViewEditor.editorMap.set(editor, mppv);
        }
        return mppv;
    }
    static viewForEditor(editor) {
        return MarkdownPreviewViewEditor.editorMap.get(editor);
    }
    destroy() {
        super.destroy();
        MarkdownPreviewViewEditor.editorMap.delete(this.editor);
    }
    serialize() {
        return {
            deserializer: 'markdown-preview-plus/MarkdownPreviewView',
            editorId: this.editor && this.editor.id,
        };
    }
    getTitle() {
        return `${this.editor.getTitle()} Preview`;
    }
    getURI() {
        return `markdown-preview-plus://editor/${this.editor.id}`;
    }
    getPath() {
        return this.editor.getPath();
    }
    async getMarkdownSource() {
        return this.editor.getText();
    }
    getGrammar() {
        return this.editor.getGrammar();
    }
    handleEditorEvents() {
        this.disposables.add(atom.workspace.onDidChangeActiveTextEditor((ed) => {
            if (atom.config.get('markdown-preview-plus.activatePreviewWithEditor')) {
                if (ed === this.editor) {
                    const pane = atom.workspace.paneForItem(this);
                    if (!pane)
                        return;
                    pane.activateItem(this);
                }
            }
        }), this.editor.getBuffer().onDidStopChanging(() => {
            if (atom.config.get('markdown-preview-plus.liveUpdate')) {
                this.changeHandler();
            }
            if (atom.config.get('markdown-preview-plus.syncPreviewOnChange')) {
                util_1.handlePromise(this.syncPreviewHelper());
            }
        }), this.editor.onDidChangePath(() => {
            this.emitter.emit('did-change-title');
        }), this.editor.onDidDestroy(() => {
            if (atom.config.get('markdown-preview-plus.closePreviewWithEditor')) {
                util.destroy(this);
            }
        }), this.editor.getBuffer().onDidSave(() => {
            if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                this.changeHandler();
            }
        }), this.editor.getBuffer().onDidReload(() => {
            if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
                this.changeHandler();
            }
        }), atom.commands.add(atom.views.getView(this.editor), {
            'markdown-preview-plus:sync-preview': this.syncPreviewHelper,
        }));
    }
}
MarkdownPreviewViewEditor.editorMap = new WeakMap();
exports.MarkdownPreviewViewEditor = MarkdownPreviewViewEditor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXJrZG93bi1wcmV2aWV3LXZpZXcvbWFya2Rvd24tcHJldmlldy12aWV3LWVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtCQUE4QjtBQUM5QixtRUFBNEU7QUFDNUUsa0NBQXVDO0FBRXZDLCtCQUF1QyxTQUFRLDJDQUFtQjtJQU1oRSxZQUE0QixNQUFrQjtRQUM1QyxLQUFLLEVBQUUsQ0FBQTtRQURtQixXQUFNLEdBQU4sTUFBTSxDQUFZO1FBK0Z0QyxzQkFBaUIsR0FBRyxLQUFLLElBQUksRUFBRTtZQUNyQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsR0FBRyxDQUFBO1lBQ3JELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7WUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDL0IsQ0FBQyxDQUFBO1FBakdDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO0lBQzNCLENBQUM7SUFFTSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQWtCO1FBQ3JDLElBQUksSUFBSSxHQUFHLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDMUQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULElBQUksR0FBRyxJQUFJLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzVDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQ3REO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFrQjtRQUM1QyxPQUFPLHlCQUF5QixDQUFDLFNBQVMsQ0FB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QUcsRUFBRTtZQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsRUFBRTtnQkFDeEQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO2FBQ3JCO1FBQ0gsQ0FBQyxDQUFDLEVBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2pELG9DQUFvQyxFQUFFLElBQUksQ0FBQyxpQkFBaUI7U0FDN0QsQ0FBQyxDQUNILENBQUE7SUFDSCxDQUFDOztBQWxHYyxtQ0FBUyxHQUFHLElBQUksT0FBTyxFQUduQyxDQUFBO0FBSkwsOERBMEdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGV4dEVkaXRvciwgR3JhbW1hciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXcsIFNlcmlhbGl6ZWRNUFYgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcbmltcG9ydCB7IGhhbmRsZVByb21pc2UgfSBmcm9tICcuLi91dGlsJ1xuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvciBleHRlbmRzIE1hcmtkb3duUHJldmlld1ZpZXcge1xuICBwcml2YXRlIHN0YXRpYyBlZGl0b3JNYXAgPSBuZXcgV2Vha01hcDxcbiAgICBUZXh0RWRpdG9yLFxuICAgIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3JcbiAgPigpXG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcihwcml2YXRlIGVkaXRvcjogVGV4dEVkaXRvcikge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmhhbmRsZUVkaXRvckV2ZW50cygpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZShlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgICBsZXQgbXBwdiA9IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IuZWRpdG9yTWFwLmdldChlZGl0b3IpXG4gICAgaWYgKCFtcHB2KSB7XG4gICAgICBtcHB2ID0gbmV3IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IoZWRpdG9yKVxuICAgICAgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5lZGl0b3JNYXAuc2V0KGVkaXRvciwgbXBwdilcbiAgICB9XG4gICAgcmV0dXJuIG1wcHZcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgdmlld0ZvckVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgICByZXR1cm4gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5lZGl0b3JNYXAuZ2V0KGVkaXRvcilcbiAgfVxuXG4gIHB1YmxpYyBkZXN0cm95KCkge1xuICAgIHN1cGVyLmRlc3Ryb3koKVxuICAgIE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IuZWRpdG9yTWFwLmRlbGV0ZSh0aGlzLmVkaXRvcilcbiAgfVxuXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXplZE1QViB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ21hcmtkb3duLXByZXZpZXctcGx1cy9NYXJrZG93blByZXZpZXdWaWV3JyxcbiAgICAgIGVkaXRvcklkOiB0aGlzLmVkaXRvciAmJiB0aGlzLmVkaXRvci5pZCxcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuZWRpdG9yLmdldFRpdGxlKCl9IFByZXZpZXdgXG4gIH1cblxuICBwdWJsaWMgZ2V0VVJJKCkge1xuICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vZWRpdG9yLyR7dGhpcy5lZGl0b3IuaWR9YFxuICB9XG5cbiAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmdldFBhdGgoKVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGdldE1hcmtkb3duU291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRUZXh0KClcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRHcmFtbWFyKCk6IEdyYW1tYXIge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRWRpdG9yRXZlbnRzKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVUZXh0RWRpdG9yKChlZCkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcicpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChlZCA9PT0gdGhpcy5lZGl0b3IpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgICAgICAgICAgaWYgKCFwYW5lKSByZXR1cm5cbiAgICAgICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU3RvcENoYW5naW5nKCgpID0+IHtcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnKSkge1xuICAgICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlcigpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNQcmV2aWV3T25DaGFuZ2UnKSkge1xuICAgICAgICAgIGhhbmRsZVByb21pc2UodGhpcy5zeW5jUHJldmlld0hlbHBlcigpKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHRoaXMuZWRpdG9yLm9uRGlkQ2hhbmdlUGF0aCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXRpdGxlJylcbiAgICAgIH0pLFxuICAgICAgdGhpcy5lZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmNsb3NlUHJldmlld1dpdGhFZGl0b3InKSkge1xuICAgICAgICAgIHV0aWwuZGVzdHJveSh0aGlzKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkU2F2ZSgoKSA9PiB7XG4gICAgICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFJlbG9hZCgoKSA9PiB7XG4gICAgICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZScpKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5lZGl0b3IpLCB7XG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1wcmV2aWV3JzogdGhpcy5zeW5jUHJldmlld0hlbHBlcixcbiAgICAgIH0pLFxuICAgIClcbiAgfVxuXG4gIHByaXZhdGUgc3luY1ByZXZpZXdIZWxwZXIgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCB0aGlzLmdldE1hcmtkb3duU291cmNlKClcbiAgICB0aGlzLnN5bmNQcmV2aWV3KHNvdXJjZSwgcG9zKVxuICB9XG59XG4iXX0=