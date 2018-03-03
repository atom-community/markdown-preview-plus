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
        return this.file.read();
    }
}
exports.MarkdownPreviewViewFile = MarkdownPreviewViewFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd24tcHJldmlldy12aWV3LWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFya2Rvd24tcHJldmlldy12aWV3L21hcmtkb3duLXByZXZpZXctdmlldy1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUEyQjtBQUMzQixtRUFBNEU7QUFFNUUsNkJBQXFDLFNBQVEsMkNBQW1CO0lBRzlELFlBQVksUUFBZ0I7UUFDMUIsS0FBSyxFQUFFLENBQUE7UUFDUCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzlCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFBO0lBQ2pFLENBQUM7SUFFTSxTQUFTO1FBQ2QsTUFBTSxDQUFDO1lBQ0wsWUFBWSxFQUFFLDJDQUEyQztZQUN6RCxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7U0FDOUIsQ0FBQTtJQUNILENBQUM7SUFFTSxRQUFRO1FBQ2IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3hCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxVQUFVLENBQUE7SUFDNUQsQ0FBQztJQUVNLE1BQU07UUFDWCxNQUFNLENBQUMsZ0NBQWdDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFBO0lBQ3pELENBQUM7SUFFUyxPQUFPO1FBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDNUIsQ0FBQztJQUVTLFVBQVU7UUFDbEIsTUFBTSxDQUFBO0lBQ1IsQ0FBQztJQUVTLEtBQUssQ0FBQyxpQkFBaUI7UUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDekIsQ0FBQztDQUNGO0FBcENELDBEQW9DQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IE1hcmtkb3duUHJldmlld1ZpZXcsIFNlcmlhbGl6ZWRNUFYgfSBmcm9tICcuL21hcmtkb3duLXByZXZpZXctdmlldydcblxuZXhwb3J0IGNsYXNzIE1hcmtkb3duUHJldmlld1ZpZXdGaWxlIGV4dGVuZHMgTWFya2Rvd25QcmV2aWV3VmlldyB7XG4gIHByaXZhdGUgZmlsZSE6IEZpbGVcblxuICBjb25zdHJ1Y3RvcihmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuZmlsZSA9IG5ldyBGaWxlKGZpbGVQYXRoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZSh0aGlzLmNoYW5nZUhhbmRsZXIpKVxuICB9XG5cbiAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkTVBWIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnbWFya2Rvd24tcHJldmlldy1wbHVzL01hcmtkb3duUHJldmlld1ZpZXcnLFxuICAgICAgZmlsZVBhdGg6IHRoaXMuZmlsZS5nZXRQYXRoKCksXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldFRpdGxlKCkge1xuICAgIGNvbnN0IHAgPSB0aGlzLmdldFBhdGgoKVxuICAgIHJldHVybiBgJHtwID8gcGF0aC5iYXNlbmFtZShwKSA6ICdNYXJrZG93biBGaWxlJ30gUHJldmlld2BcbiAgfVxuXG4gIHB1YmxpYyBnZXRVUkkoKSB7XG4gICAgcmV0dXJuIGBtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9maWxlLyR7dGhpcy5nZXRQYXRoKCl9YFxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFBhdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZS5nZXRQYXRoKClcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRHcmFtbWFyKCk6IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0TWFya2Rvd25Tb3VyY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZS5yZWFkKClcbiAgfVxufVxuIl19