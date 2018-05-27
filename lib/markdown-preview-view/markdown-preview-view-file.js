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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUEyQjtBQUMzQixtRUFBNEU7QUFFNUUsNkJBQXFDLFNBQVEsMkNBQW1CO0lBRzlELFlBQVksUUFBZ0I7UUFDMUIsS0FBSyxFQUFFLENBQUE7UUFDUCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFBO0lBQ2pFLENBQUM7SUFFTSxTQUFTO1FBQ2QsT0FBTztZQUNMLFlBQVksRUFBRSwyQ0FBMkM7WUFDekQsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1NBQzlCLENBQUE7SUFDSCxDQUFDO0lBRU0sUUFBUTtRQUNiLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUN4QixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLFVBQVUsQ0FBQTtJQUM1RCxDQUFDO0lBRU0sTUFBTTtRQUNYLE9BQU8sZ0NBQWdDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFBO0lBQ3pELENBQUM7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzVCLENBQUM7SUFFUyxVQUFVO1FBQ2xCLE9BQU07SUFDUixDQUFDO0lBRVMsS0FBSyxDQUFDLGlCQUFpQjtRQUMvQixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDbEMsSUFBSSxHQUFHLEtBQUssSUFBSTtZQUFFLE9BQU8sR0FBRyxDQUFBOztZQUN2QixPQUFPLEVBQUUsQ0FBQTtJQUNoQixDQUFDO0NBQ0Y7QUF0Q0QsMERBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcclxuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ2F0b20nXHJcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXcsIFNlcmlhbGl6ZWRNUFYgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcclxuXHJcbmV4cG9ydCBjbGFzcyBNYXJrZG93blByZXZpZXdWaWV3RmlsZSBleHRlbmRzIE1hcmtkb3duUHJldmlld1ZpZXcge1xyXG4gIHByaXZhdGUgZmlsZSE6IEZpbGVcclxuXHJcbiAgY29uc3RydWN0b3IoZmlsZVBhdGg6IHN0cmluZykge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5maWxlID0gbmV3IEZpbGUoZmlsZVBhdGgpXHJcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZCh0aGlzLmZpbGUub25EaWRDaGFuZ2UodGhpcy5jaGFuZ2VIYW5kbGVyKSlcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXplZE1QViB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldycsXHJcbiAgICAgIGZpbGVQYXRoOiB0aGlzLmZpbGUuZ2V0UGF0aCgpLFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFRpdGxlKCkge1xyXG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0UGF0aCgpXHJcbiAgICByZXR1cm4gYCR7cCA/IHBhdGguYmFzZW5hbWUocCkgOiAnTWFya2Rvd24gRmlsZSd9IFByZXZpZXdgXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0VVJJKCkge1xyXG4gICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9maWxlLyR7dGhpcy5nZXRQYXRoKCl9YFxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFBhdGgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5maWxlLmdldFBhdGgoKVxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGdldEdyYW1tYXIoKTogdW5kZWZpbmVkIHtcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGFzeW5jIGdldE1hcmtkb3duU291cmNlKCkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5maWxlLnJlYWQoKVxyXG4gICAgaWYgKHJlcyAhPT0gbnVsbCkgcmV0dXJuIHJlc1xyXG4gICAgZWxzZSByZXR1cm4gJydcclxuICB9XHJcbn1cclxuIl19