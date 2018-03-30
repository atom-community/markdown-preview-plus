"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_preview_view_1 = require("./markdown-preview-view");
class MarkdownPreviewViewString extends markdown_preview_view_1.MarkdownPreviewView {
    constructor(text) {
        super();
        this.mdtext = text;
    }
    serialize() {
        return {
            deserializer: 'markdown-preview-plus/MarkdownPreviewView',
        };
    }
    getTitle() {
        return `String Preview`;
    }
    getURI() {
        return `markdown-preview-plus://string/`;
    }
    getPath() {
        return undefined;
    }
    getGrammar() {
        return;
    }
    async getMarkdownSource() {
        return this.mdtext;
    }
}
exports.MarkdownPreviewViewString = MarkdownPreviewViewString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXJrZG93bi1wcmV2aWV3LXZpZXcvbWFya2Rvd24tcHJldmlldy12aWV3LXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1FQUE0RTtBQUU1RSwrQkFBdUMsU0FBUSwyQ0FBbUI7SUFHaEUsWUFBWSxJQUFZO1FBQ3RCLEtBQUssRUFBRSxDQUFBO1FBQ1AsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7SUFDcEIsQ0FBQztJQUVNLFNBQVM7UUFDZCxNQUFNLENBQUM7WUFDTCxZQUFZLEVBQUUsMkNBQTJDO1NBQzFELENBQUE7SUFDSCxDQUFDO0lBRU0sUUFBUTtRQUNiLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQTtJQUN6QixDQUFDO0lBRU0sTUFBTTtRQUNYLE1BQU0sQ0FBQyxpQ0FBaUMsQ0FBQTtJQUMxQyxDQUFDO0lBRU0sT0FBTztRQUNaLE1BQU0sQ0FBQyxTQUFTLENBQUE7SUFDbEIsQ0FBQztJQUVTLFVBQVU7UUFDbEIsTUFBTSxDQUFBO0lBQ1IsQ0FBQztJQUVTLEtBQUssQ0FBQyxpQkFBaUI7UUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7SUFDcEIsQ0FBQztDQUNGO0FBakNELDhEQWlDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXcsIFNlcmlhbGl6ZWRNUFYgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duUHJldmlld1ZpZXdTdHJpbmcgZXh0ZW5kcyBNYXJrZG93blByZXZpZXdWaWV3IHtcbiAgcHJpdmF0ZSBtZHRleHQ6IHN0cmluZ1xuXG4gIGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLm1kdGV4dCA9IHRleHRcbiAgfVxuXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXplZE1QViB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ21hcmtkb3duLXByZXZpZXctcGx1cy9NYXJrZG93blByZXZpZXdWaWV3JyxcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuIGBTdHJpbmcgUHJldmlld2BcbiAgfVxuXG4gIHB1YmxpYyBnZXRVUkkoKSB7XG4gICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9zdHJpbmcvYFxuICB9XG5cbiAgcHVibGljIGdldFBhdGgoKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgcHJvdGVjdGVkIGdldEdyYW1tYXIoKTogdW5kZWZpbmVkIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBnZXRNYXJrZG93blNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tZHRleHRcbiAgfVxufVxuIl19