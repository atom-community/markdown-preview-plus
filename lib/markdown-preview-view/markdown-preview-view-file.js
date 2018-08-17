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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUEyQjtBQUMzQixtRUFBNEU7QUFFNUUsTUFBYSx1QkFBd0IsU0FBUSwyQ0FBbUI7SUFHOUQsWUFBWSxRQUFnQjtRQUMxQixLQUFLLEVBQUUsQ0FBQTtRQUNQLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxXQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUE7SUFDakUsQ0FBQztJQUVNLFNBQVM7UUFDZCxPQUFPO1lBQ0wsWUFBWSxFQUFFLDJDQUEyQztZQUN6RCxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7U0FDOUIsQ0FBQTtJQUNILENBQUM7SUFFTSxRQUFRO1FBQ2IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3hCLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsVUFBVSxDQUFBO0lBQzVELENBQUM7SUFFTSxNQUFNO1FBQ1gsT0FBTyxnQ0FBZ0MsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUE7SUFDekQsQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDNUIsQ0FBQztJQUVTLFVBQVU7UUFDbEIsT0FBTTtJQUNSLENBQUM7SUFFUyxLQUFLLENBQUMsaUJBQWlCO1FBQy9CLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUNsQyxJQUFJLEdBQUcsS0FBSyxJQUFJO1lBQUUsT0FBTyxHQUFHLENBQUE7O1lBQ3ZCLE9BQU8sRUFBRSxDQUFBO0lBQ2hCLENBQUM7Q0FDRjtBQXRDRCwwREFzQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBNYXJrZG93blByZXZpZXdWaWV3LCBTZXJpYWxpemVkTVBWIH0gZnJvbSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG5cbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3RmlsZSBleHRlbmRzIE1hcmtkb3duUHJldmlld1ZpZXcge1xuICBwcml2YXRlIGZpbGUhOiBGaWxlXG5cbiAgY29uc3RydWN0b3IoZmlsZVBhdGg6IHN0cmluZykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmZpbGUub25EaWRDaGFuZ2UodGhpcy5jaGFuZ2VIYW5kbGVyKSlcbiAgfVxuXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXplZE1QViB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ21hcmtkb3duLXByZXZpZXctcGx1cy9NYXJrZG93blByZXZpZXdWaWV3JyxcbiAgICAgIGZpbGVQYXRoOiB0aGlzLmZpbGUuZ2V0UGF0aCgpLFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXRUaXRsZSgpIHtcbiAgICBjb25zdCBwID0gdGhpcy5nZXRQYXRoKClcbiAgICByZXR1cm4gYCR7cCA/IHBhdGguYmFzZW5hbWUocCkgOiAnTWFya2Rvd24gRmlsZSd9IFByZXZpZXdgXG4gIH1cblxuICBwdWJsaWMgZ2V0VVJJKCkge1xuICAgIHJldHVybiBgbWFya2Rvd24tcHJldmlldy1wbHVzOi8vZmlsZS8ke3RoaXMuZ2V0UGF0aCgpfWBcbiAgfVxuXG4gIHB1YmxpYyBnZXRQYXRoKCkge1xuICAgIHJldHVybiB0aGlzLmZpbGUuZ2V0UGF0aCgpXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0R3JhbW1hcigpOiB1bmRlZmluZWQge1xuICAgIHJldHVyblxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGdldE1hcmtkb3duU291cmNlKCkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuZmlsZS5yZWFkKClcbiAgICBpZiAocmVzICE9PSBudWxsKSByZXR1cm4gcmVzXG4gICAgZWxzZSByZXR1cm4gJydcbiAgfVxufVxuIl19