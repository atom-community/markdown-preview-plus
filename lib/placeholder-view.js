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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXItdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wbGFjZWhvbGRlci12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQTBEO0FBQzFELG1FQUFtRTtBQUNuRSxpQ0FBc0M7QUFFdEM7SUFNRSxZQUFvQixRQUFnQjtRQUFoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBTDdCLFlBQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBU3RDLGVBQVUsR0FBRyxHQUFHLEVBQUU7WUFDeEIsTUFBTSxNQUFNLEdBQUcsa0JBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNaLE1BQU0sQ0FBQTtZQUNSLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QyxJQUFJLENBQUMsS0FBSyxHQUFHLGlEQUF5QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNyRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFBQyxNQUFNLENBQUE7WUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDeEIsb0JBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDdkMsQ0FBQyxDQUFBO1FBYkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFDOUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBTk0sT0FBTztRQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFpQk0sUUFBUTtRQUNiLE1BQU0sQ0FBQyx3Q0FBd0MsQ0FBQTtJQUNqRCxDQUFDO0lBRU0sTUFBTTtRQUNYLE1BQU0sQ0FBQyxxQ0FBcUMsQ0FBQTtJQUM5QyxDQUFDO0NBQ0Y7QUE3QkQsMENBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZWRpdG9yRm9ySWQgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldy91dGlsJ1xuaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3Vmlld0VkaXRvciB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuaW1wb3J0IHsgaGFuZGxlUHJvbWlzZSB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGNsYXNzIFBsYWNlaG9sZGVyVmlldyB7XG4gIHB1YmxpYyBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgcHJpdmF0ZSBfdmlldz86IE1hcmtkb3duUHJldmlld1ZpZXdFZGl0b3JcbiAgcHVibGljIGdldFZpZXcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZpZXdcbiAgfVxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVkaXRvcklkOiBudW1iZXIpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tc3Bpbm5lcicpXG4gICAgc2V0SW1tZWRpYXRlKHRoaXMuaW5pdGlhbGl6ZSlcbiAgfVxuICBwcml2YXRlIGluaXRpYWxpemUgPSAoKSA9PiB7XG4gICAgY29uc3QgZWRpdG9yID0gZWRpdG9yRm9ySWQodGhpcy5lZGl0b3JJZClcbiAgICBpZiAoIWVkaXRvcikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKVxuICAgIHRoaXMuX3ZpZXcgPSBNYXJrZG93blByZXZpZXdWaWV3RWRpdG9yLmNyZWF0ZShlZGl0b3IpXG4gICAgaWYgKCFwYW5lKSByZXR1cm5cbiAgICBwYW5lLmFkZEl0ZW0odGhpcy5fdmlldylcbiAgICBoYW5kbGVQcm9taXNlKHBhbmUuZGVzdHJveUl0ZW0odGhpcykpXG4gIH1cblxuICBwdWJsaWMgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuICdQbGFjZWhvbGRlciBNYXJrZG93biBQcmV2aWV3IFBsdXMgVmlldydcbiAgfVxuXG4gIHB1YmxpYyBnZXRVUkkoKSB7XG4gICAgcmV0dXJuICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9wbGFjZWhvbGRlcidcbiAgfVxufVxuIl19