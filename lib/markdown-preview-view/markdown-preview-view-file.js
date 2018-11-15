"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const atom_1 = require("atom");
const markdown_preview_view_1 = require("./markdown-preview-view");
class MarkdownPreviewViewFile extends markdown_preview_view_1.MarkdownPreviewView {
    constructor(filePath) {
        super();
        this.file = new atom_1.File(filePath);
        this.disposables.add(this.file.onDidChange(this.changeHandler));
    }
    serialize() {
        return {
            deserializer: 'markdown-preview-plus/MarkdownPreviewView',
            filePath: this.file.getPath(),
        };
    }
    getTitle() {
        const p = this.getPath();
        return `${p ? path.basename(p) : 'Markdown File'} Preview`;
    }
    getURI() {
        return `markdown-preview-plus://file/${this.getPath()}`;
    }
    getPath() {
        return this.file.getPath();
    }
    getGrammar() {
        return;
    }
    async getMarkdownSource() {
        const res = await this.file.read();
        if (res !== null)
            return res;
        else
            return '';
    }
}
exports.MarkdownPreviewViewFile = MarkdownPreviewViewFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUEyQjtBQUMzQixtRUFBNEU7QUFFNUUsTUFBYSx1QkFBd0IsU0FBUSwyQ0FBbUI7SUFHOUQsWUFBWSxRQUFnQjtRQUMxQixLQUFLLEVBQUUsQ0FBQTtRQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxXQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUE7SUFDakUsQ0FBQztJQUVNLFNBQVM7UUFDZCxPQUFPO1lBQ0wsWUFBWSxFQUFFLDJDQUEyQztZQUN6RCxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7U0FDOUIsQ0FBQTtJQUNILENBQUM7SUFFTSxRQUFRO1FBQ2IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3hCLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsVUFBVSxDQUFBO0lBQzVELENBQUM7SUFFTSxNQUFNO1FBQ1gsT0FBTyxnQ0FBZ0MsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUE7SUFDekQsQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDNUIsQ0FBQztJQUVTLFVBQVU7UUFDbEIsT0FBTTtJQUNSLENBQUM7SUFFUyxLQUFLLENBQUMsaUJBQWlCO1FBQy9CLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUNsQyxJQUFJLEdBQUcsS0FBSyxJQUFJO1lBQUUsT0FBTyxHQUFHLENBQUE7O1lBQ3ZCLE9BQU8sRUFBRSxDQUFBO0lBQ2hCLENBQUM7Q0FDRjtBQXRDRCwwREFzQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxyXG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAnYXRvbSdcclxuaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3VmlldywgU2VyaWFsaXplZE1QViB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xyXG5cclxuZXhwb3J0IGNsYXNzIE1hcmtkb3duUHJldmlld1ZpZXdGaWxlIGV4dGVuZHMgTWFya2Rvd25QcmV2aWV3VmlldyB7XHJcbiAgcHJpdmF0ZSBmaWxlITogRmlsZVxyXG5cclxuICBjb25zdHJ1Y3RvcihmaWxlUGF0aDogc3RyaW5nKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcclxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZSh0aGlzLmNoYW5nZUhhbmRsZXIpKVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkTVBWIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRlc2VyaWFsaXplcjogJ21hcmtkb3duLXByZXZpZXctcGx1cy9NYXJrZG93blByZXZpZXdWaWV3JyxcclxuICAgICAgZmlsZVBhdGg6IHRoaXMuZmlsZS5nZXRQYXRoKCksXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0VGl0bGUoKSB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5nZXRQYXRoKClcclxuICAgIHJldHVybiBgJHtwID8gcGF0aC5iYXNlbmFtZShwKSA6ICdNYXJrZG93biBGaWxlJ30gUHJldmlld2BcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRVUkkoKSB7XHJcbiAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL2ZpbGUvJHt0aGlzLmdldFBhdGgoKX1gXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0UGF0aCgpIHtcclxuICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0UGF0aCgpXHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgZ2V0R3JhbW1hcigpOiB1bmRlZmluZWQge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmZpbGUucmVhZCgpXHJcbiAgICBpZiAocmVzICE9PSBudWxsKSByZXR1cm4gcmVzXHJcbiAgICBlbHNlIHJldHVybiAnJ1xyXG4gIH1cclxufVxyXG4iXX0=