"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class RequestHandler {
    constructor(windowId, editorId, handlers) {
        this.windowId = windowId;
        this.editorId = editorId;
        this.handlers = handlers;
        this.handleRequest = (e) => {
            if (e.editorId !== this.editorId || e.windowId !== this.windowId)
                return;
            const func = this.handlers[e.cmd];
            const reply = func(e.args);
            electron_1.remote.ipcMain.emit('markdown-preview-plus:editor-reply', {
                editorId: e.editorId,
                windowId: e.windowId,
                forWindowId: e.forWindowId,
                idx: e.idx,
                reply,
            });
        };
        electron_1.remote.ipcMain.on('markdown-preview-plus:editor-request', this.handleRequest);
    }
    dispose() {
        electron_1.remote.ipcMain.removeListener('markdown-preview-plus:editor-request', this.handleRequest);
    }
}
exports.RequestHandler = RequestHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9pcGMvcmVxdWVzdC1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWlDO0FBK0JqQztJQUNFLFlBQ21CLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLFFBQWdCO1FBRmhCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFDaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUNoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBZTVCLGtCQUFhLEdBQUcsQ0FBQyxDQUF5QixFQUFFLEVBQUU7WUFDbkQsSUFBSSxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUTtnQkFBRSxPQUFNO1lBQ3hFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBYSxDQUFBO1lBQzdDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDMUIsaUJBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFO2dCQUN4RCxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7Z0JBQ3BCLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUTtnQkFDcEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO2dCQUMxQixHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7Z0JBQ1YsS0FBSzthQUNOLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQTtRQXhCQyxpQkFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQ2Ysc0NBQXNDLEVBQ3RDLElBQUksQ0FBQyxhQUFhLENBQ25CLENBQUE7SUFDSCxDQUFDO0lBRU0sT0FBTztRQUNaLGlCQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FDM0Isc0NBQXNDLEVBQ3RDLElBQUksQ0FBQyxhQUFhLENBQ25CLENBQUE7SUFDSCxDQUFDO0NBY0Y7QUEvQkQsd0NBK0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmVtb3RlIH0gZnJvbSAnZWxlY3Ryb24nXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBDQ21kIHtcbiAgc2Nyb2xsVG9CdWZmZXJSYW5nZTogKGFyZzogW251bWJlciwgbnVtYmVyXSkgPT4gdm9pZFxuICBkZXN0cm95OiAoYXJnOiB2b2lkKSA9PiB2b2lkXG4gIGluaXQ6IChcbiAgICBhcmc6IHZvaWQsXG4gICkgPT4ge1xuICAgIHRleHQ6IHN0cmluZ1xuICAgIHRpdGxlOiBzdHJpbmdcbiAgICBncmFtbWFyOiBzdHJpbmdcbiAgICBwYXRoOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgfVxuICBvcGVuU291cmNlOiAoYXJnPzogbnVtYmVyKSA9PiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIEV2ZW50Rm9yID0ge1xuICBbSyBpbiBrZXlvZiBJUENDbWRdOiB7XG4gICAgZWRpdG9ySWQ6IG51bWJlclxuICAgIHdpbmRvd0lkOiBudW1iZXJcbiAgICBmb3JXaW5kb3dJZDogbnVtYmVyXG4gICAgaWR4OiBudW1iZXJcbiAgICBjbWQ6IEtcbiAgICBhcmdzOiBBcmc8SVBDQ21kW0tdPlxuICB9XG59XG5cbmV4cG9ydCB0eXBlIEFyZzxUIGV4dGVuZHMgKGFyZzogYW55KSA9PiBhbnk+ID0gVCBleHRlbmRzIChhcmc6IGluZmVyIFUpID0+IGFueVxuICA/IFVcbiAgOiBuZXZlclxuXG5leHBvcnQgY2xhc3MgUmVxdWVzdEhhbmRsZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IHdpbmRvd0lkOiBudW1iZXIsXG4gICAgcHJpdmF0ZSByZWFkb25seSBlZGl0b3JJZDogbnVtYmVyLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgaGFuZGxlcnM6IElQQ0NtZCxcbiAgKSB7XG4gICAgcmVtb3RlLmlwY01haW4ub24oXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOmVkaXRvci1yZXF1ZXN0JyxcbiAgICAgIHRoaXMuaGFuZGxlUmVxdWVzdCxcbiAgICApXG4gIH1cblxuICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICByZW1vdGUuaXBjTWFpbi5yZW1vdmVMaXN0ZW5lcihcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6ZWRpdG9yLXJlcXVlc3QnLFxuICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0LFxuICAgIClcbiAgfVxuXG4gIHB1YmxpYyBoYW5kbGVSZXF1ZXN0ID0gKGU6IEV2ZW50Rm9yW2tleW9mIElQQ0NtZF0pID0+IHtcbiAgICBpZiAoZS5lZGl0b3JJZCAhPT0gdGhpcy5lZGl0b3JJZCB8fCBlLndpbmRvd0lkICE9PSB0aGlzLndpbmRvd0lkKSByZXR1cm5cbiAgICBjb25zdCBmdW5jID0gdGhpcy5oYW5kbGVyc1tlLmNtZF0gYXMgRnVuY3Rpb25cbiAgICBjb25zdCByZXBseSA9IGZ1bmMoZS5hcmdzKVxuICAgIHJlbW90ZS5pcGNNYWluLmVtaXQoJ21hcmtkb3duLXByZXZpZXctcGx1czplZGl0b3ItcmVwbHknLCB7XG4gICAgICBlZGl0b3JJZDogZS5lZGl0b3JJZCxcbiAgICAgIHdpbmRvd0lkOiBlLndpbmRvd0lkLFxuICAgICAgZm9yV2luZG93SWQ6IGUuZm9yV2luZG93SWQsXG4gICAgICBpZHg6IGUuaWR4LFxuICAgICAgcmVwbHksXG4gICAgfSlcbiAgfVxufVxuIl19