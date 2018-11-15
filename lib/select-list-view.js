"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SelectListView = require("atom-select-list");
async function selectListView(items) {
    let panel;
    const currentFocus = document.activeElement;
    try {
        return await new Promise((resolve) => {
            const select = new SelectListView({
                items,
                elementForItem: (item) => {
                    const li = document.createElement('li');
                    li.innerText = item;
                    return li;
                },
                didCancelSelection: () => {
                    resolve();
                },
                didConfirmSelection: (item) => {
                    resolve(item);
                },
                itemsClassList: ['atom-typescript'],
            });
            panel = atom.workspace.addModalPanel({
                item: select,
                visible: true,
            });
            select.focus();
        });
    }
    finally {
        if (panel)
            panel.destroy();
        if (currentFocus)
            currentFocus.focus();
    }
}
exports.selectListView = selectListView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWxpc3Qtdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZWxlY3QtbGlzdC12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbURBQW1EO0FBRzVDLEtBQUssVUFBVSxjQUFjLENBQ2xDLEtBQWU7SUFFZixJQUFJLEtBQWdELENBQUE7SUFDcEQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQW1DLENBQUE7SUFDakUsSUFBSTtRQUNGLE9BQU8sTUFBTSxJQUFJLE9BQU8sQ0FBcUIsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN2RCxNQUFNLE1BQU0sR0FBMkIsSUFBSSxjQUFjLENBQUM7Z0JBQ3hELEtBQUs7Z0JBQ0wsY0FBYyxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7b0JBQy9CLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQ3ZDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO29CQUNuQixPQUFPLEVBQUUsQ0FBQTtnQkFDWCxDQUFDO2dCQUNELGtCQUFrQixFQUFFLEdBQUcsRUFBRTtvQkFDdkIsT0FBTyxFQUFFLENBQUE7Z0JBQ1gsQ0FBQztnQkFDRCxtQkFBbUIsRUFBRSxDQUFDLElBQVksRUFBRSxFQUFFO29CQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ2YsQ0FBQztnQkFDRCxjQUFjLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQzthQUNwQyxDQUFDLENBQUE7WUFDRixLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0JBQ25DLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2FBQ2QsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ2hCLENBQUMsQ0FBQyxDQUFBO0tBQ0g7WUFBUztRQUNSLElBQUksS0FBSztZQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUMxQixJQUFJLFlBQVk7WUFBRSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUE7S0FDdkM7QUFDSCxDQUFDO0FBaENELHdDQWdDQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRzbGludDpkaXNhYmxlOiBuby1mbG9hdGluZy1wcm9taXNlc1xyXG5pbXBvcnQgU2VsZWN0TGlzdFZpZXcgPSByZXF1aXJlKCdhdG9tLXNlbGVjdC1saXN0JylcclxuaW1wb3J0IHsgUGFuZWwgfSBmcm9tICdhdG9tJ1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbGVjdExpc3RWaWV3KFxyXG4gIGl0ZW1zOiBzdHJpbmdbXSxcclxuKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHtcclxuICBsZXQgcGFuZWw6IFBhbmVsPFNlbGVjdExpc3RWaWV3PHN0cmluZz4+IHwgdW5kZWZpbmVkXHJcbiAgY29uc3QgY3VycmVudEZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCB8IHZvaWRcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4oKHJlc29sdmUpID0+IHtcclxuICAgICAgY29uc3Qgc2VsZWN0OiBTZWxlY3RMaXN0VmlldzxzdHJpbmc+ID0gbmV3IFNlbGVjdExpc3RWaWV3KHtcclxuICAgICAgICBpdGVtcyxcclxuICAgICAgICBlbGVtZW50Rm9ySXRlbTogKGl0ZW06IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXHJcbiAgICAgICAgICBsaS5pbm5lclRleHQgPSBpdGVtXHJcbiAgICAgICAgICByZXR1cm4gbGlcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgcmVzb2x2ZSgpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiAoaXRlbTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICByZXNvbHZlKGl0ZW0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpdGVtc0NsYXNzTGlzdDogWydhdG9tLXR5cGVzY3JpcHQnXSxcclxuICAgICAgfSlcclxuICAgICAgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtcclxuICAgICAgICBpdGVtOiBzZWxlY3QsXHJcbiAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgfSlcclxuICAgICAgc2VsZWN0LmZvY3VzKClcclxuICAgIH0pXHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGlmIChwYW5lbCkgcGFuZWwuZGVzdHJveSgpXHJcbiAgICBpZiAoY3VycmVudEZvY3VzKSBjdXJyZW50Rm9jdXMuZm9jdXMoKVxyXG4gIH1cclxufVxyXG4iXX0=