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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXItdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wbGFjZWhvbGRlci12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQTBEO0FBQzFELG1FQUFtRTtBQUNuRSxpQ0FBc0M7QUFFdEMsTUFBYSxlQUFlO0lBRzFCLFlBQW9CLFFBQWdCO1FBQWhCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFGN0IsWUFBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7UUFtQnRDLGVBQVUsR0FBRyxHQUFHLEVBQUU7WUFDeEIsTUFBTSxNQUFNLEdBQUcsa0JBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDekMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWCxPQUFNO2FBQ1A7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLENBQUMsS0FBSyxHQUFHLGlEQUF5QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNyRCxJQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFNO1lBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3hCLG9CQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ3ZDLENBQUMsQ0FBQTtRQTFCQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUM5QyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQy9CLENBQUM7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFFTSxRQUFRO1FBQ2IsT0FBTyx3Q0FBd0MsQ0FBQTtJQUNqRCxDQUFDO0lBRU0sTUFBTTtRQUNYLE9BQU8scUNBQXFDLENBQUE7SUFDOUMsQ0FBQztDQWFGO0FBL0JELDBDQStCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVkaXRvckZvcklkIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcvdXRpbCdcclxuaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvciB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xyXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlIH0gZnJvbSAnLi91dGlsJ1xyXG5cclxuZXhwb3J0IGNsYXNzIFBsYWNlaG9sZGVyVmlldyB7XHJcbiAgcHVibGljIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gIHByaXZhdGUgX3ZpZXc/OiBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlZGl0b3JJZDogbnVtYmVyKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tc3Bpbm5lcicpXHJcbiAgICBzZXRJbW1lZGlhdGUodGhpcy5pbml0aWFsaXplKVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFZpZXcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fdmlld1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFRpdGxlKCkge1xyXG4gICAgcmV0dXJuICdQbGFjZWhvbGRlciBNYXJrZG93biBQcmV2aWV3IFBsdXMgVmlldydcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRVUkkoKSB7XHJcbiAgICByZXR1cm4gJ21hcmtkb3duLXByZXZpZXctcGx1czovL3BsYWNlaG9sZGVyJ1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZWRpdG9yID0gZWRpdG9yRm9ySWQodGhpcy5lZGl0b3JJZClcclxuICAgIGlmICghZWRpdG9yKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXHJcbiAgICB0aGlzLl92aWV3ID0gTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvci5jcmVhdGUoZWRpdG9yKVxyXG4gICAgaWYgKCFwYW5lKSByZXR1cm5cclxuICAgIHBhbmUuYWRkSXRlbSh0aGlzLl92aWV3KVxyXG4gICAgaGFuZGxlUHJvbWlzZShwYW5lLmRlc3Ryb3lJdGVtKHRoaXMpKVxyXG4gIH1cclxufVxyXG4iXX0=