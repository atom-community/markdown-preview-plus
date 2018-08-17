"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./markdown-preview-view/util");
const markdown_preview_view_1 = require("./markdown-preview-view");
const util_2 = require("./util");
class PlaceholderView {
    constructor(editorId) {
        this.editorId = editorId;
        this.element = document.createElement('div');
        this.initialize = () => {
            const editor = util_1.editorForId(this.editorId);
            if (!editor) {
                return;
            }
            const pane = atom.workspace.paneForItem(this);
            this._view = markdown_preview_view_1.MarkdownPreviewViewEditor.create(editor);
            if (!pane)
                return;
            pane.addItem(this._view);
            util_2.handlePromise(pane.destroyItem(this));
        };
        this.element.classList.add('markdown-spinner');
        setImmediate(this.initialize);
    }
    getView() {
        return this._view;
    }
    getTitle() {
        return 'Placeholder Markdown Preview Plus View';
    }
    getURI() {
        return 'markdown-preview-plus://placeholder';
    }
}
exports.PlaceholderView = PlaceholderView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXItdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wbGFjZWhvbGRlci12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQTBEO0FBQzFELG1FQUFtRTtBQUNuRSxpQ0FBc0M7QUFFdEMsTUFBYSxlQUFlO0lBRzFCLFlBQW9CLFFBQWdCO1FBQWhCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFGN0IsWUFBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7UUFtQnRDLGVBQVUsR0FBRyxHQUFHLEVBQUU7WUFDeEIsTUFBTSxNQUFNLEdBQUcsa0JBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDekMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWCxPQUFNO2FBQ1A7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLENBQUMsS0FBSyxHQUFHLGlEQUF5QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNyRCxJQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFNO1lBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3hCLG9CQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ3ZDLENBQUMsQ0FBQTtRQTFCQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUM5QyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQy9CLENBQUM7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFFTSxRQUFRO1FBQ2IsT0FBTyx3Q0FBd0MsQ0FBQTtJQUNqRCxDQUFDO0lBRU0sTUFBTTtRQUNYLE9BQU8scUNBQXFDLENBQUE7SUFDOUMsQ0FBQztDQWFGO0FBL0JELDBDQStCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVkaXRvckZvcklkIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcvdXRpbCdcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcbmltcG9ydCB7IGhhbmRsZVByb21pc2UgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjbGFzcyBQbGFjZWhvbGRlclZpZXcge1xuICBwdWJsaWMgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHByaXZhdGUgX3ZpZXc/OiBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWRpdG9ySWQ6IG51bWJlcikge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1zcGlubmVyJylcbiAgICBzZXRJbW1lZGlhdGUodGhpcy5pbml0aWFsaXplKVxuICB9XG5cbiAgcHVibGljIGdldFZpZXcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZpZXdcbiAgfVxuXG4gIHB1YmxpYyBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gJ1BsYWNlaG9sZGVyIE1hcmtkb3duIFByZXZpZXcgUGx1cyBWaWV3J1xuICB9XG5cbiAgcHVibGljIGdldFVSSSgpIHtcbiAgICByZXR1cm4gJ21hcmtkb3duLXByZXZpZXctcGx1czovL3BsYWNlaG9sZGVyJ1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplID0gKCkgPT4ge1xuICAgIGNvbnN0IGVkaXRvciA9IGVkaXRvckZvcklkKHRoaXMuZWRpdG9ySWQpXG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICB0aGlzLl92aWV3ID0gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5jcmVhdGUoZWRpdG9yKVxuICAgIGlmICghcGFuZSkgcmV0dXJuXG4gICAgcGFuZS5hZGRJdGVtKHRoaXMuX3ZpZXcpXG4gICAgaGFuZGxlUHJvbWlzZShwYW5lLmRlc3Ryb3lJdGVtKHRoaXMpKVxuICB9XG59XG4iXX0=