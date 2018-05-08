"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_preview_view_1 = require("./markdown-preview-view");
class MarkdownPreviewViewString extends markdown_preview_view_1.MarkdownPreviewView {
    constructor(text, mode, renderLaTeX) {
        super(mode, renderLaTeX);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXJrZG93bi1wcmV2aWV3LXZpZXcvbWFya2Rvd24tcHJldmlldy12aWV3LXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1FQUE0RTtBQUc1RSwrQkFBdUMsU0FBUSwyQ0FBbUI7SUFHaEUsWUFDRSxJQUFZLEVBQ1osSUFBaUMsRUFDakMsV0FBb0I7UUFFcEIsS0FBSyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQTtRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtJQUNwQixDQUFDO0lBRU0sU0FBUztRQUNkLE9BQU87WUFDTCxZQUFZLEVBQUUsMkNBQTJDO1NBQzFELENBQUE7SUFDSCxDQUFDO0lBRU0sUUFBUTtRQUNiLE9BQU8sZ0JBQWdCLENBQUE7SUFDekIsQ0FBQztJQUVNLE1BQU07UUFDWCxPQUFPLGlDQUFpQyxDQUFBO0lBQzFDLENBQUM7SUFFTSxPQUFPO1FBQ1osT0FBTyxTQUFTLENBQUE7SUFDbEIsQ0FBQztJQUVTLFVBQVU7UUFDbEIsT0FBTTtJQUNSLENBQUM7SUFFUyxLQUFLLENBQUMsaUJBQWlCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUNwQixDQUFDO0NBQ0Y7QUFyQ0QsOERBcUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3VmlldywgU2VyaWFsaXplZE1QViB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuaW1wb3J0IHsgUmVuZGVyTW9kZSB9IGZyb20gJy4uL3JlbmRlcmVyJ1xuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25QcmV2aWV3Vmlld1N0cmluZyBleHRlbmRzIE1hcmtkb3duUHJldmlld1ZpZXcge1xuICBwcml2YXRlIG1kdGV4dDogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIG1vZGU6IEV4Y2x1ZGU8UmVuZGVyTW9kZSwgJ3NhdmUnPixcbiAgICByZW5kZXJMYVRlWDogYm9vbGVhbixcbiAgKSB7XG4gICAgc3VwZXIobW9kZSwgcmVuZGVyTGFUZVgpXG4gICAgdGhpcy5tZHRleHQgPSB0ZXh0XG4gIH1cblxuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRNUFYge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldycsXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldFRpdGxlKCkge1xuICAgIHJldHVybiBgU3RyaW5nIFByZXZpZXdgXG4gIH1cblxuICBwdWJsaWMgZ2V0VVJJKCkge1xuICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vc3RyaW5nL2BcbiAgfVxuXG4gIHB1YmxpYyBnZXRQYXRoKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgcHJvdGVjdGVkIGdldEdyYW1tYXIoKTogdW5kZWZpbmVkIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBnZXRNYXJrZG93blNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tZHRleHRcbiAgfVxufVxuIl19