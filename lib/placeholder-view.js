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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXItdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wbGFjZWhvbGRlci12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQTBEO0FBQzFELG1FQUFtRTtBQUNuRSxpQ0FBc0M7QUFFdEM7SUFHRSxZQUFvQixRQUFnQjtRQUFoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBRjdCLFlBQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBbUJ0QyxlQUFVLEdBQUcsR0FBRyxFQUFFO1lBQ3hCLE1BQU0sTUFBTSxHQUFHLGtCQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ3pDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsT0FBTTthQUNQO1lBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDN0MsSUFBSSxDQUFDLEtBQUssR0FBRyxpREFBeUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDckQsSUFBSSxDQUFDLElBQUk7Z0JBQUUsT0FBTTtZQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN4QixvQkFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtRQUN2QyxDQUFDLENBQUE7UUExQkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFDOUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBRU0sUUFBUTtRQUNiLE9BQU8sd0NBQXdDLENBQUE7SUFDakQsQ0FBQztJQUVNLE1BQU07UUFDWCxPQUFPLHFDQUFxQyxDQUFBO0lBQzlDLENBQUM7Q0FhRjtBQS9CRCwwQ0ErQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlZGl0b3JGb3JJZCB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3L3V0aWwnXG5pbXBvcnQgeyBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG5pbXBvcnQgeyBoYW5kbGVQcm9taXNlIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgY2xhc3MgUGxhY2Vob2xkZXJWaWV3IHtcbiAgcHVibGljIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBwcml2YXRlIF92aWV3PzogTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVkaXRvcklkOiBudW1iZXIpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tc3Bpbm5lcicpXG4gICAgc2V0SW1tZWRpYXRlKHRoaXMuaW5pdGlhbGl6ZSlcbiAgfVxuXG4gIHB1YmxpYyBnZXRWaWV3KCkge1xuICAgIHJldHVybiB0aGlzLl92aWV3XG4gIH1cblxuICBwdWJsaWMgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuICdQbGFjZWhvbGRlciBNYXJrZG93biBQcmV2aWV3IFBsdXMgVmlldydcbiAgfVxuXG4gIHB1YmxpYyBnZXRVUkkoKSB7XG4gICAgcmV0dXJuICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9wbGFjZWhvbGRlcidcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZSA9ICgpID0+IHtcbiAgICBjb25zdCBlZGl0b3IgPSBlZGl0b3JGb3JJZCh0aGlzLmVkaXRvcklkKVxuICAgIGlmICghZWRpdG9yKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgdGhpcy5fdmlldyA9IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IuY3JlYXRlKGVkaXRvcilcbiAgICBpZiAoIXBhbmUpIHJldHVyblxuICAgIHBhbmUuYWRkSXRlbSh0aGlzLl92aWV3KVxuICAgIGhhbmRsZVByb21pc2UocGFuZS5kZXN0cm95SXRlbSh0aGlzKSlcbiAgfVxufVxuIl19