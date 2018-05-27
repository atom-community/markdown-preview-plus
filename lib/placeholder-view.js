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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXItdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wbGFjZWhvbGRlci12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQTBEO0FBQzFELG1FQUFtRTtBQUNuRSxpQ0FBc0M7QUFFdEM7SUFHRSxZQUFvQixRQUFnQjtRQUFoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBRjdCLFlBQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBbUJ0QyxlQUFVLEdBQUcsR0FBRyxFQUFFO1lBQ3hCLE1BQU0sTUFBTSxHQUFHLGtCQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ3pDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsT0FBTTthQUNQO1lBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDN0MsSUFBSSxDQUFDLEtBQUssR0FBRyxpREFBeUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDckQsSUFBSSxDQUFDLElBQUk7Z0JBQUUsT0FBTTtZQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN4QixvQkFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtRQUN2QyxDQUFDLENBQUE7UUExQkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFDOUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBRU0sUUFBUTtRQUNiLE9BQU8sd0NBQXdDLENBQUE7SUFDakQsQ0FBQztJQUVNLE1BQU07UUFDWCxPQUFPLHFDQUFxQyxDQUFBO0lBQzlDLENBQUM7Q0FhRjtBQS9CRCwwQ0ErQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlZGl0b3JGb3JJZCB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3L3V0aWwnXHJcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcclxuaW1wb3J0IHsgaGFuZGxlUHJvbWlzZSB9IGZyb20gJy4vdXRpbCdcclxuXHJcbmV4cG9ydCBjbGFzcyBQbGFjZWhvbGRlclZpZXcge1xyXG4gIHB1YmxpYyBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICBwcml2YXRlIF92aWV3PzogTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvclxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWRpdG9ySWQ6IG51bWJlcikge1xyXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLXNwaW5uZXInKVxyXG4gICAgc2V0SW1tZWRpYXRlKHRoaXMuaW5pdGlhbGl6ZSlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRWaWV3KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3ZpZXdcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRUaXRsZSgpIHtcclxuICAgIHJldHVybiAnUGxhY2Vob2xkZXIgTWFya2Rvd24gUHJldmlldyBQbHVzIFZpZXcnXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0VVJJKCkge1xyXG4gICAgcmV0dXJuICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9wbGFjZWhvbGRlcidcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW5pdGlhbGl6ZSA9ICgpID0+IHtcclxuICAgIGNvbnN0IGVkaXRvciA9IGVkaXRvckZvcklkKHRoaXMuZWRpdG9ySWQpXHJcbiAgICBpZiAoIWVkaXRvcikge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxyXG4gICAgdGhpcy5fdmlldyA9IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3IuY3JlYXRlKGVkaXRvcilcclxuICAgIGlmICghcGFuZSkgcmV0dXJuXHJcbiAgICBwYW5lLmFkZEl0ZW0odGhpcy5fdmlldylcclxuICAgIGhhbmRsZVByb21pc2UocGFuZS5kZXN0cm95SXRlbSh0aGlzKSlcclxuICB9XHJcbn1cclxuIl19