"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_preview_view_1 = require("./markdown-preview-view");
class MarkdownPreviewViewString extends markdown_preview_view_1.MarkdownPreviewView {
    constructor(text, mode, renderLaTeX, filePath) {
        super(mode, renderLaTeX);
        this.filePath = filePath;
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
        return this.filePath;
    }
    getGrammar() {
        return;
    }
    async getMarkdownSource() {
        return this.mdtext;
    }
}
exports.MarkdownPreviewViewString = MarkdownPreviewViewString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXJrZG93bi1wcmV2aWV3LXZpZXcvbWFya2Rvd24tcHJldmlldy12aWV3LXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1FQUE0RTtBQUc1RSwrQkFBdUMsU0FBUSwyQ0FBbUI7SUFHaEUsWUFDRSxJQUFZLEVBQ1osSUFBaUMsRUFDakMsV0FBb0IsRUFDSCxRQUE0QjtRQUU3QyxLQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBRlAsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7UUFHN0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7SUFDcEIsQ0FBQztJQUVNLFNBQVM7UUFDZCxPQUFPO1lBQ0wsWUFBWSxFQUFFLDJDQUEyQztTQUMxRCxDQUFBO0lBQ0gsQ0FBQztJQUVNLFFBQVE7UUFDYixPQUFPLGdCQUFnQixDQUFBO0lBQ3pCLENBQUM7SUFFTSxNQUFNO1FBQ1gsT0FBTyxpQ0FBaUMsQ0FBQTtJQUMxQyxDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtJQUN0QixDQUFDO0lBRVMsVUFBVTtRQUNsQixPQUFNO0lBQ1IsQ0FBQztJQUVTLEtBQUssQ0FBQyxpQkFBaUI7UUFDL0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBQ3BCLENBQUM7Q0FDRjtBQXRDRCw4REFzQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXJrZG93blByZXZpZXdWaWV3LCBTZXJpYWxpemVkTVBWIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG5pbXBvcnQgeyBSZW5kZXJNb2RlIH0gZnJvbSAnLi4vcmVuZGVyZXInXG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3U3RyaW5nIGV4dGVuZHMgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHByaXZhdGUgbWR0ZXh0OiBzdHJpbmdcblxuICBjb25zdHJ1Y3RvcihcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgbW9kZTogRXhjbHVkZTxSZW5kZXJNb2RlLCAnc2F2ZSc+LFxuICAgIHJlbmRlckxhVGVYOiBib29sZWFuLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZmlsZVBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgKSB7XG4gICAgc3VwZXIobW9kZSwgcmVuZGVyTGFUZVgpXG4gICAgdGhpcy5tZHRleHQgPSB0ZXh0XG4gIH1cblxuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRNUFYge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldycsXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldFRpdGxlKCkge1xuICAgIHJldHVybiBgU3RyaW5nIFByZXZpZXdgXG4gIH1cblxuICBwdWJsaWMgZ2V0VVJJKCkge1xuICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vc3RyaW5nL2BcbiAgfVxuXG4gIHB1YmxpYyBnZXRQYXRoKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZVBhdGhcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRHcmFtbWFyKCk6IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMubWR0ZXh0XG4gIH1cbn1cbiJdfQ==