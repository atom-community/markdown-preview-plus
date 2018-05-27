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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUEyQjtBQUMzQixtRUFBNEU7QUFFNUUsNkJBQXFDLFNBQVEsMkNBQW1CO0lBRzlELFlBQVksUUFBZ0I7UUFDMUIsS0FBSyxFQUFFLENBQUE7UUFDUCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFBO0lBQ2pFLENBQUM7SUFFTSxTQUFTO1FBQ2QsT0FBTztZQUNMLFlBQVksRUFBRSwyQ0FBMkM7WUFDekQsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1NBQzlCLENBQUE7SUFDSCxDQUFDO0lBRU0sUUFBUTtRQUNiLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUN4QixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLFVBQVUsQ0FBQTtJQUM1RCxDQUFDO0lBRU0sTUFBTTtRQUNYLE9BQU8sZ0NBQWdDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFBO0lBQ3pELENBQUM7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzVCLENBQUM7SUFFUyxVQUFVO1FBQ2xCLE9BQU07SUFDUixDQUFDO0lBRVMsS0FBSyxDQUFDLGlCQUFpQjtRQUMvQixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDbEMsSUFBSSxHQUFHLEtBQUssSUFBSTtZQUFFLE9BQU8sR0FBRyxDQUFBOztZQUN2QixPQUFPLEVBQUUsQ0FBQTtJQUNoQixDQUFDO0NBQ0Y7QUF0Q0QsMERBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmltcG9ydCB7IEZpbGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgTWFya2Rvd25QcmV2aWV3VmlldywgU2VyaWFsaXplZE1QViB9IGZyb20gJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuXG5leHBvcnQgY2xhc3MgTWFya2Rvd25QcmV2aWV3Vmlld0ZpbGUgZXh0ZW5kcyBNYXJrZG93blByZXZpZXdWaWV3IHtcbiAgcHJpdmF0ZSBmaWxlITogRmlsZVxuXG4gIGNvbnN0cnVjdG9yKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5maWxlID0gbmV3IEZpbGUoZmlsZVBhdGgpXG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5maWxlLm9uRGlkQ2hhbmdlKHRoaXMuY2hhbmdlSGFuZGxlcikpXG4gIH1cblxuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRNUFYge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMvTWFya2Rvd25QcmV2aWV3VmlldycsXG4gICAgICBmaWxlUGF0aDogdGhpcy5maWxlLmdldFBhdGgoKSxcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0VGl0bGUoKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuZ2V0UGF0aCgpXG4gICAgcmV0dXJuIGAke3AgPyBwYXRoLmJhc2VuYW1lKHApIDogJ01hcmtkb3duIEZpbGUnfSBQcmV2aWV3YFxuICB9XG5cbiAgcHVibGljIGdldFVSSSgpIHtcbiAgICByZXR1cm4gYG1hcmtkb3duLXByZXZpZXctcGx1czovL2ZpbGUvJHt0aGlzLmdldFBhdGgoKX1gXG4gIH1cblxuICBwdWJsaWMgZ2V0UGF0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5maWxlLmdldFBhdGgoKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldEdyYW1tYXIoKTogdW5kZWZpbmVkIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBnZXRNYXJrZG93blNvdXJjZSgpIHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmZpbGUucmVhZCgpXG4gICAgaWYgKHJlcyAhPT0gbnVsbCkgcmV0dXJuIHJlc1xuICAgIGVsc2UgcmV0dXJuICcnXG4gIH1cbn1cbiJdfQ==