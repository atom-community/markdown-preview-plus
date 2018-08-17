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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9pcGMvcmVxdWVzdC1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWlDO0FBK0JqQyxNQUFhLGNBQWM7SUFDekIsWUFDbUIsUUFBZ0IsRUFDaEIsUUFBZ0IsRUFDaEIsUUFBZ0I7UUFGaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUNoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQ2hCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFlNUIsa0JBQWEsR0FBRyxDQUFDLENBQXlCLEVBQUUsRUFBRTtZQUNuRCxJQUFJLENBQUMsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU07WUFDeEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFhLENBQUE7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUMxQixpQkFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUU7Z0JBQ3hELFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUTtnQkFDcEIsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO2dCQUNwQixXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVc7Z0JBQzFCLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztnQkFDVixLQUFLO2FBQ04sQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBO1FBeEJDLGlCQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FDZixzQ0FBc0MsRUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FDbkIsQ0FBQTtJQUNILENBQUM7SUFFTSxPQUFPO1FBQ1osaUJBQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUMzQixzQ0FBc0MsRUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FDbkIsQ0FBQTtJQUNILENBQUM7Q0FjRjtBQS9CRCx3Q0ErQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZW1vdGUgfSBmcm9tICdlbGVjdHJvbidcblxuZXhwb3J0IGludGVyZmFjZSBJUENDbWQge1xuICBzY3JvbGxUb0J1ZmZlclJhbmdlOiAoYXJnOiBbbnVtYmVyLCBudW1iZXJdKSA9PiB2b2lkXG4gIGRlc3Ryb3k6IChhcmc6IHZvaWQpID0+IHZvaWRcbiAgaW5pdDogKFxuICAgIGFyZzogdm9pZCxcbiAgKSA9PiB7XG4gICAgdGV4dDogc3RyaW5nXG4gICAgdGl0bGU6IHN0cmluZ1xuICAgIGdyYW1tYXI6IHN0cmluZ1xuICAgIHBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZFxuICB9XG4gIG9wZW5Tb3VyY2U6IChhcmc/OiBudW1iZXIpID0+IHZvaWRcbn1cblxuZXhwb3J0IHR5cGUgRXZlbnRGb3IgPSB7XG4gIFtLIGluIGtleW9mIElQQ0NtZF06IHtcbiAgICBlZGl0b3JJZDogbnVtYmVyXG4gICAgd2luZG93SWQ6IG51bWJlclxuICAgIGZvcldpbmRvd0lkOiBudW1iZXJcbiAgICBpZHg6IG51bWJlclxuICAgIGNtZDogS1xuICAgIGFyZ3M6IEFyZzxJUENDbWRbS10+XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQXJnPFQgZXh0ZW5kcyAoYXJnOiBhbnkpID0+IGFueT4gPSBUIGV4dGVuZHMgKGFyZzogaW5mZXIgVSkgPT4gYW55XG4gID8gVVxuICA6IG5ldmVyXG5cbmV4cG9ydCBjbGFzcyBSZXF1ZXN0SGFuZGxlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgd2luZG93SWQ6IG51bWJlcixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGVkaXRvcklkOiBudW1iZXIsXG4gICAgcHJpdmF0ZSByZWFkb25seSBoYW5kbGVyczogSVBDQ21kLFxuICApIHtcbiAgICByZW1vdGUuaXBjTWFpbi5vbihcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6ZWRpdG9yLXJlcXVlc3QnLFxuICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0LFxuICAgIClcbiAgfVxuXG4gIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgIHJlbW90ZS5pcGNNYWluLnJlbW92ZUxpc3RlbmVyKFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czplZGl0b3ItcmVxdWVzdCcsXG4gICAgICB0aGlzLmhhbmRsZVJlcXVlc3QsXG4gICAgKVxuICB9XG5cbiAgcHVibGljIGhhbmRsZVJlcXVlc3QgPSAoZTogRXZlbnRGb3Jba2V5b2YgSVBDQ21kXSkgPT4ge1xuICAgIGlmIChlLmVkaXRvcklkICE9PSB0aGlzLmVkaXRvcklkIHx8IGUud2luZG93SWQgIT09IHRoaXMud2luZG93SWQpIHJldHVyblxuICAgIGNvbnN0IGZ1bmMgPSB0aGlzLmhhbmRsZXJzW2UuY21kXSBhcyBGdW5jdGlvblxuICAgIGNvbnN0IHJlcGx5ID0gZnVuYyhlLmFyZ3MpXG4gICAgcmVtb3RlLmlwY01haW4uZW1pdCgnbWFya2Rvd24tcHJldmlldy1wbHVzOmVkaXRvci1yZXBseScsIHtcbiAgICAgIGVkaXRvcklkOiBlLmVkaXRvcklkLFxuICAgICAgd2luZG93SWQ6IGUud2luZG93SWQsXG4gICAgICBmb3JXaW5kb3dJZDogZS5mb3JXaW5kb3dJZCxcbiAgICAgIGlkeDogZS5pZHgsXG4gICAgICByZXBseSxcbiAgICB9KVxuICB9XG59XG4iXX0=