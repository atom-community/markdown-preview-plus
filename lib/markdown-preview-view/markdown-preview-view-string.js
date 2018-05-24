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
    async getHTMLSVG() {
        return this.runRequest('get-html-svg');
    }
    latexRenderer() {
        return 'SVG';
    }
    getGrammar() {
        return;
    }
    async getMarkdownSource() {
        return this.mdtext;
    }
}
exports.MarkdownPreviewViewString = MarkdownPreviewViewString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LXN0cmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXJrZG93bi1wcmV2aWV3LXZpZXcvbWFya2Rvd24tcHJldmlldy12aWV3LXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1FQUE0RTtBQUc1RSwrQkFBdUMsU0FBUSwyQ0FBbUI7SUFHaEUsWUFDRSxJQUFZLEVBQ1osSUFBaUMsRUFDakMsV0FBb0IsRUFDSCxRQUE0QjtRQUU3QyxLQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBRlAsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7UUFHN0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7SUFDcEIsQ0FBQztJQUVNLFNBQVM7UUFDZCxPQUFPO1lBQ0wsWUFBWSxFQUFFLDJDQUEyQztTQUMxRCxDQUFBO0lBQ0gsQ0FBQztJQUVNLFFBQVE7UUFDYixPQUFPLGdCQUFnQixDQUFBO0lBQ3pCLENBQUM7SUFFTSxNQUFNO1FBQ1gsT0FBTyxpQ0FBaUMsQ0FBQTtJQUMxQyxDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtJQUN0QixDQUFDO0lBRU0sS0FBSyxDQUFDLFVBQVU7UUFDckIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQ3hDLENBQUM7SUFFUyxhQUFhO1FBQ3JCLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVTLFVBQVU7UUFDbEIsT0FBTTtJQUNSLENBQUM7SUFFUyxLQUFLLENBQUMsaUJBQWlCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUNwQixDQUFDO0NBQ0Y7QUE5Q0QsOERBOENDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3VmlldywgU2VyaWFsaXplZE1QViB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuaW1wb3J0IHsgUmVuZGVyTW9kZSB9IGZyb20gJy4uL3JlbmRlcmVyJ1xuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25QcmV2aWV3Vmlld1N0cmluZyBleHRlbmRzIE1hcmtkb3duUHJldmlld1ZpZXcge1xuICBwcml2YXRlIG1kdGV4dDogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIG1vZGU6IEV4Y2x1ZGU8UmVuZGVyTW9kZSwgJ3NhdmUnPixcbiAgICByZW5kZXJMYVRlWDogYm9vbGVhbixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZpbGVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICkge1xuICAgIHN1cGVyKG1vZGUsIHJlbmRlckxhVGVYKVxuICAgIHRoaXMubWR0ZXh0ID0gdGV4dFxuICB9XG5cbiAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkTVBWIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnbWFya2Rvd24tcHJldmlldy1wbHVzL01hcmtkb3duUHJldmlld1ZpZXcnLFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gYFN0cmluZyBQcmV2aWV3YFxuICB9XG5cbiAgcHVibGljIGdldFVSSSgpIHtcbiAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL3N0cmluZy9gXG4gIH1cblxuICBwdWJsaWMgZ2V0UGF0aCgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmZpbGVQYXRoXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SFRNTFNWRygpIHtcbiAgICByZXR1cm4gdGhpcy5ydW5SZXF1ZXN0KCdnZXQtaHRtbC1zdmcnKVxuICB9XG5cbiAgcHJvdGVjdGVkIGxhdGV4UmVuZGVyZXIoKTogJ1NWRycge1xuICAgIHJldHVybiAnU1ZHJ1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldEdyYW1tYXIoKTogdW5kZWZpbmVkIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBnZXRNYXJrZG93blNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tZHRleHRcbiAgfVxufVxuIl19