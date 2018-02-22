"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./markdown-preview-view/util");
const index_1 = require("./markdown-preview-view/index");
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
            this._view = index_1.MarkdownPreviewView.create({ editor });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXItdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wbGFjZWhvbGRlci12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQTBEO0FBQzFELHlEQUFtRTtBQUNuRSxpQ0FBc0M7QUFFdEM7SUFNRSxZQUFvQixRQUFnQjtRQUFoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBTDdCLFlBQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBU3RDLGVBQVUsR0FBRyxHQUFHLEVBQUU7WUFDeEIsTUFBTSxNQUFNLEdBQUcsa0JBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE1BQU0sQ0FBQTtZQUNSLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLENBQUMsS0FBSyxHQUFHLDJCQUFtQixDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7WUFDbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQUMsTUFBTSxDQUFBO1lBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3hCLG9CQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ3ZDLENBQUMsQ0FBQTtRQWJDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1FBQzlDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDL0IsQ0FBQztJQU5NLE9BQU87UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBaUJNLFFBQVE7UUFDYixNQUFNLENBQUMsd0NBQXdDLENBQUE7SUFDakQsQ0FBQztJQUVNLE1BQU07UUFDWCxNQUFNLENBQUMscUNBQXFDLENBQUE7SUFDOUMsQ0FBQztDQUNGO0FBN0JELDBDQTZCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVkaXRvckZvcklkIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcvdXRpbCdcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXcgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldy9pbmRleCdcbmltcG9ydCB7IGhhbmRsZVByb21pc2UgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjbGFzcyBQbGFjZWhvbGRlclZpZXcge1xuICBwdWJsaWMgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHByaXZhdGUgX3ZpZXc/OiBNYXJrZG93blByZXZpZXdWaWV3XG4gIHB1YmxpYyBnZXRWaWV3KCkge1xuICAgIHJldHVybiB0aGlzLl92aWV3XG4gIH1cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlZGl0b3JJZDogbnVtYmVyKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXNwaW5uZXInKVxuICAgIHNldEltbWVkaWF0ZSh0aGlzLmluaXRpYWxpemUpXG4gIH1cbiAgcHJpdmF0ZSBpbml0aWFsaXplID0gKCkgPT4ge1xuICAgIGNvbnN0IGVkaXRvciA9IGVkaXRvckZvcklkKHRoaXMuZWRpdG9ySWQpXG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICB0aGlzLl92aWV3ID0gTWFya2Rvd25QcmV2aWV3Vmlldy5jcmVhdGUoeyBlZGl0b3IgfSlcbiAgICBpZiAoIXBhbmUpIHJldHVyblxuICAgIHBhbmUuYWRkSXRlbSh0aGlzLl92aWV3KVxuICAgIGhhbmRsZVByb21pc2UocGFuZS5kZXN0cm95SXRlbSh0aGlzKSlcbiAgfVxuXG4gIHB1YmxpYyBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gJ1BsYWNlaG9sZGVyIE1hcmtkb3duIFByZXZpZXcgUGx1cyBWaWV3J1xuICB9XG5cbiAgcHVibGljIGdldFVSSSgpIHtcbiAgICByZXR1cm4gJ21hcmtkb3duLXByZXZpZXctcGx1czovL3BsYWNlaG9sZGVyJ1xuICB9XG59XG4iXX0=