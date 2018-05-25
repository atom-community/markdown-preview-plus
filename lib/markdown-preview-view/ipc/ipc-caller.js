"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class IPCCaller {
    constructor(windowId, editorId) {
        this.windowId = windowId;
        this.editorId = editorId;
        this.ipcIdx = 0;
        this.myWindowId = electron_1.remote.getCurrentWindow().id;
    }
    async scrollToBufferRange(arg) {
        return this.ipc('scrollToBufferRange', arg);
    }
    async destroy() {
        return this.ipc('destroy', undefined);
    }
    async init() {
        return this.ipc('init', undefined);
    }
    async openSource(arg) {
        return this.ipc('openSource', arg);
    }
    dispose() {
    }
    async ipc(cmd, args) {
        return new Promise((resolve, reject) => {
            const idx = this.ipcIdx++;
            const handler = (e) => {
                if (e.forWindowId === this.myWindowId &&
                    e.windowId === this.windowId &&
                    e.editorId === this.editorId &&
                    e.idx === idx) {
                    electron_1.remote.ipcMain.removeListener('markdown-preview-plus:editor-reply', handler);
                    resolve(e.reply);
                }
            };
            const res = electron_1.remote.ipcMain.emit('markdown-preview-plus:editor-request', {
                windowId: this.windowId,
                editorId: this.editorId,
                forWindowId: this.myWindowId,
                idx,
                cmd,
                args,
            });
            if (!res) {
                reject(new Error('Nobody is listening for editor requests'));
                return;
            }
            electron_1.remote.ipcMain.on('markdown-preview-plus:editor-reply', handler);
        });
    }
}
exports.IPCCaller = IPCCaller;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLWNhbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tYXJrZG93bi1wcmV2aWV3LXZpZXcvaXBjL2lwYy1jYWxsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBaUM7QUFRakM7SUFHRSxZQUFvQixRQUFnQixFQUFVLFFBQWdCO1FBQTFDLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBRnRELFdBQU0sR0FBRyxDQUFDLENBQUE7UUFDVixlQUFVLEdBQUcsaUJBQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQTtJQUNnQixDQUFDO0lBQzNELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFxQjtRQUNwRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDN0MsQ0FBQztJQUNNLEtBQUssQ0FBQyxPQUFPO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDdkMsQ0FBQztJQUNNLEtBQUssQ0FBQyxJQUFJO1FBQ2YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBQ00sS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFZO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDcEMsQ0FBQztJQUNNLE9BQU87SUFFZCxDQUFDO0lBQ08sS0FBSyxDQUFDLEdBQUcsQ0FDZixHQUFNLEVBQ04sSUFBb0I7UUFFcEIsT0FBTyxJQUFJLE9BQU8sQ0FBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUMxQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7WUFDekIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQU1oQixFQUFFLEVBQUU7Z0JBQ0gsSUFDRSxDQUFDLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxVQUFVO29CQUNqQyxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRO29CQUM1QixDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRO29CQUM1QixDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFDYjtvQkFDQSxpQkFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQzNCLG9DQUFvQyxFQUNwQyxPQUFPLENBQ1IsQ0FBQTtvQkFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO2lCQUNqQjtZQUNILENBQUMsQ0FBQTtZQUNELE1BQU0sR0FBRyxHQUFHLGlCQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsRUFBRTtnQkFDdEUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDNUIsR0FBRztnQkFDSCxHQUFHO2dCQUNILElBQUk7YUFDTCxDQUFDLENBQUE7WUFDRixJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNSLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDLENBQUE7Z0JBQzVELE9BQU07YUFDUDtZQUNELGlCQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNsRSxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRjtBQTVERCw4QkE0REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJUENDbWQsIEFyZyB9IGZyb20gJy4vcmVxdWVzdC1oYW5kbGVyJ1xyXG5pbXBvcnQgeyByZW1vdGUgfSBmcm9tICdlbGVjdHJvbidcclxuXHJcbmV4cG9ydCB0eXBlIElQQ0NtZFByb21pc2UgPSB7XHJcbiAgW0sgaW4ga2V5b2YgSVBDQ21kXTogSVBDQ21kW0tdIGV4dGVuZHMgKGFyZzogaW5mZXIgQSkgPT4gaW5mZXIgUlxyXG4gICAgPyAoYXJnOiBBKSA9PiBQcm9taXNlPFI+XHJcbiAgICA6IG5ldmVyXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJUENDYWxsZXIgaW1wbGVtZW50cyBJUENDbWRQcm9taXNlIHtcclxuICBwcml2YXRlIGlwY0lkeCA9IDBcclxuICBwcml2YXRlIG15V2luZG93SWQgPSByZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLmlkXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB3aW5kb3dJZDogbnVtYmVyLCBwcml2YXRlIGVkaXRvcklkOiBudW1iZXIpIHt9XHJcbiAgcHVibGljIGFzeW5jIHNjcm9sbFRvQnVmZmVyUmFuZ2UoYXJnOiBbbnVtYmVyLCBudW1iZXJdKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pcGMoJ3Njcm9sbFRvQnVmZmVyUmFuZ2UnLCBhcmcpXHJcbiAgfVxyXG4gIHB1YmxpYyBhc3luYyBkZXN0cm95KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXBjKCdkZXN0cm95JywgdW5kZWZpbmVkKVxyXG4gIH1cclxuICBwdWJsaWMgYXN5bmMgaW5pdCgpIHtcclxuICAgIHJldHVybiB0aGlzLmlwYygnaW5pdCcsIHVuZGVmaW5lZClcclxuICB9XHJcbiAgcHVibGljIGFzeW5jIG9wZW5Tb3VyY2UoYXJnPzogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pcGMoJ29wZW5Tb3VyY2UnLCBhcmcpXHJcbiAgfVxyXG4gIHB1YmxpYyBkaXNwb3NlKCkge1xyXG4gICAgLy8gVE9ET1xyXG4gIH1cclxuICBwcml2YXRlIGFzeW5jIGlwYzxUIGV4dGVuZHMga2V5b2YgSVBDQ21kPihcclxuICAgIGNtZDogVCxcclxuICAgIGFyZ3M6IEFyZzxJUENDbWRbVF0+LFxyXG4gICk6IFByb21pc2U8UmV0dXJuVHlwZTxJUENDbWRbVF0+PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGNvbnN0IGlkeCA9IHRoaXMuaXBjSWR4KytcclxuICAgICAgY29uc3QgaGFuZGxlciA9IChlOiB7XHJcbiAgICAgICAgZWRpdG9ySWQ6IG51bWJlclxyXG4gICAgICAgIHdpbmRvd0lkOiBudW1iZXJcclxuICAgICAgICBmb3JXaW5kb3dJZDogbnVtYmVyXHJcbiAgICAgICAgaWR4OiBudW1iZXJcclxuICAgICAgICByZXBseTogYW55XHJcbiAgICAgIH0pID0+IHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICBlLmZvcldpbmRvd0lkID09PSB0aGlzLm15V2luZG93SWQgJiZcclxuICAgICAgICAgIGUud2luZG93SWQgPT09IHRoaXMud2luZG93SWQgJiZcclxuICAgICAgICAgIGUuZWRpdG9ySWQgPT09IHRoaXMuZWRpdG9ySWQgJiZcclxuICAgICAgICAgIGUuaWR4ID09PSBpZHhcclxuICAgICAgICApIHtcclxuICAgICAgICAgIHJlbW90ZS5pcGNNYWluLnJlbW92ZUxpc3RlbmVyKFxyXG4gICAgICAgICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOmVkaXRvci1yZXBseScsXHJcbiAgICAgICAgICAgIGhhbmRsZXIsXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgICByZXNvbHZlKGUucmVwbHkpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHJlcyA9IHJlbW90ZS5pcGNNYWluLmVtaXQoJ21hcmtkb3duLXByZXZpZXctcGx1czplZGl0b3ItcmVxdWVzdCcsIHtcclxuICAgICAgICB3aW5kb3dJZDogdGhpcy53aW5kb3dJZCxcclxuICAgICAgICBlZGl0b3JJZDogdGhpcy5lZGl0b3JJZCxcclxuICAgICAgICBmb3JXaW5kb3dJZDogdGhpcy5teVdpbmRvd0lkLFxyXG4gICAgICAgIGlkeCxcclxuICAgICAgICBjbWQsXHJcbiAgICAgICAgYXJncyxcclxuICAgICAgfSlcclxuICAgICAgaWYgKCFyZXMpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdOb2JvZHkgaXMgbGlzdGVuaW5nIGZvciBlZGl0b3IgcmVxdWVzdHMnKSlcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfSAvLyBvdGhlcndpc2UsXHJcbiAgICAgIHJlbW90ZS5pcGNNYWluLm9uKCdtYXJrZG93bi1wcmV2aWV3LXBsdXM6ZWRpdG9yLXJlcGx5JywgaGFuZGxlcilcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcbiJdfQ==