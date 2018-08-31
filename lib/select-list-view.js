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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWxpc3Qtdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZWxlY3QtbGlzdC12aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbURBQW1EO0FBRzVDLEtBQUssVUFBVSxjQUFjLENBQ2xDLEtBQWU7SUFFZixJQUFJLEtBQWdELENBQUE7SUFDcEQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQW1DLENBQUE7SUFDakUsSUFBSTtRQUNGLE9BQU8sTUFBTSxJQUFJLE9BQU8sQ0FBcUIsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN2RCxNQUFNLE1BQU0sR0FBMkIsSUFBSSxjQUFjLENBQUM7Z0JBQ3hELEtBQUs7Z0JBQ0wsY0FBYyxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7b0JBQy9CLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQ3ZDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO29CQUNuQixPQUFPLEVBQUUsQ0FBQTtnQkFDWCxDQUFDO2dCQUNELGtCQUFrQixFQUFFLEdBQUcsRUFBRTtvQkFDdkIsT0FBTyxFQUFFLENBQUE7Z0JBQ1gsQ0FBQztnQkFDRCxtQkFBbUIsRUFBRSxDQUFDLElBQVksRUFBRSxFQUFFO29CQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ2YsQ0FBQztnQkFDRCxjQUFjLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQzthQUNwQyxDQUFDLENBQUE7WUFDRixLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0JBQ25DLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxJQUFJO2FBQ2QsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQ2hCLENBQUMsQ0FBQyxDQUFBO0tBQ0g7WUFBUztRQUNSLElBQUksS0FBSztZQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUMxQixJQUFJLFlBQVk7WUFBRSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUE7S0FDdkM7QUFDSCxDQUFDO0FBaENELHdDQWdDQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHRzbGludDpkaXNhYmxlOiBuby1mbG9hdGluZy1wcm9taXNlc1xuaW1wb3J0IFNlbGVjdExpc3RWaWV3ID0gcmVxdWlyZSgnYXRvbS1zZWxlY3QtbGlzdCcpXG5pbXBvcnQgeyBQYW5lbCB9IGZyb20gJ2F0b20nXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxlY3RMaXN0VmlldyhcbiAgaXRlbXM6IHN0cmluZ1tdLFxuKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHtcbiAgbGV0IHBhbmVsOiBQYW5lbDxTZWxlY3RMaXN0VmlldzxzdHJpbmc+PiB8IHVuZGVmaW5lZFxuICBjb25zdCBjdXJyZW50Rm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50IHwgdm9pZFxuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3Q6IFNlbGVjdExpc3RWaWV3PHN0cmluZz4gPSBuZXcgU2VsZWN0TGlzdFZpZXcoe1xuICAgICAgICBpdGVtcyxcbiAgICAgICAgZWxlbWVudEZvckl0ZW06IChpdGVtOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgICAgICBsaS5pbm5lclRleHQgPSBpdGVtXG4gICAgICAgICAgcmV0dXJuIGxpXG4gICAgICAgIH0sXG4gICAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9LFxuICAgICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiAoaXRlbTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShpdGVtKVxuICAgICAgICB9LFxuICAgICAgICBpdGVtc0NsYXNzTGlzdDogWydhdG9tLXR5cGVzY3JpcHQnXSxcbiAgICAgIH0pXG4gICAgICBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe1xuICAgICAgICBpdGVtOiBzZWxlY3QsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICB9KVxuICAgICAgc2VsZWN0LmZvY3VzKClcbiAgICB9KVxuICB9IGZpbmFsbHkge1xuICAgIGlmIChwYW5lbCkgcGFuZWwuZGVzdHJveSgpXG4gICAgaWYgKGN1cnJlbnRGb2N1cykgY3VycmVudEZvY3VzLmZvY3VzKClcbiAgfVxufVxuIl19