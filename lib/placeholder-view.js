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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXItdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wbGFjZWhvbGRlci12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQTBEO0FBQzFELHlEQUFtRTtBQUNuRSxpQ0FBc0M7QUFFdEM7SUFNRSxZQUFvQixRQUFnQjtRQUFoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBTDdCLFlBQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBUXRDLGVBQVUsR0FBRyxHQUFHLEVBQUU7WUFDeEIsTUFBTSxNQUFNLEdBQUcsa0JBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE1BQU0sQ0FBQTtZQUNSLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLENBQUMsS0FBSyxHQUFHLDJCQUFtQixDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7WUFDbkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQUMsTUFBTSxDQUFBO1lBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ3hCLG9CQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ3ZDLENBQUMsQ0FBQTtRQVpDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDL0IsQ0FBQztJQUxNLE9BQU87UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBZ0JNLFFBQVE7UUFDYixNQUFNLENBQUMsd0NBQXdDLENBQUE7SUFDakQsQ0FBQztJQUVNLE1BQU07UUFDWCxNQUFNLENBQUMscUNBQXFDLENBQUE7SUFDOUMsQ0FBQztDQUNGO0FBNUJELDBDQTRCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVkaXRvckZvcklkIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcvdXRpbCdcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXcgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldy9pbmRleCdcbmltcG9ydCB7IGhhbmRsZVByb21pc2UgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjbGFzcyBQbGFjZWhvbGRlclZpZXcge1xuICBwdWJsaWMgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHByaXZhdGUgX3ZpZXc/OiBNYXJrZG93blByZXZpZXdWaWV3XG4gIHB1YmxpYyBnZXRWaWV3KCkge1xuICAgIHJldHVybiB0aGlzLl92aWV3XG4gIH1cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlZGl0b3JJZDogbnVtYmVyKSB7XG4gICAgc2V0SW1tZWRpYXRlKHRoaXMuaW5pdGlhbGl6ZSlcbiAgfVxuICBwcml2YXRlIGluaXRpYWxpemUgPSAoKSA9PiB7XG4gICAgY29uc3QgZWRpdG9yID0gZWRpdG9yRm9ySWQodGhpcy5lZGl0b3JJZClcbiAgICBpZiAoIWVkaXRvcikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgIHRoaXMuX3ZpZXcgPSBNYXJrZG93blByZXZpZXdWaWV3LmNyZWF0ZSh7IGVkaXRvciB9KVxuICAgIGlmICghcGFuZSkgcmV0dXJuXG4gICAgcGFuZS5hZGRJdGVtKHRoaXMuX3ZpZXcpXG4gICAgaGFuZGxlUHJvbWlzZShwYW5lLmRlc3Ryb3lJdGVtKHRoaXMpKVxuICB9XG5cbiAgcHVibGljIGdldFRpdGxlKCkge1xuICAgIHJldHVybiAnUGxhY2Vob2xkZXIgTWFya2Rvd24gUHJldmlldyBQbHVzIFZpZXcnXG4gIH1cblxuICBwdWJsaWMgZ2V0VVJJKCkge1xuICAgIHJldHVybiAnbWFya2Rvd24tcHJldmlldy1wbHVzOi8vcGxhY2Vob2xkZXInXG4gIH1cbn1cbiJdfQ==