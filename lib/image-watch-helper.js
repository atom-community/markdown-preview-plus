"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const util_1 = require("./util");
class ImageWatcher {
    constructor(callback) {
        this.callback = callback;
        this.registry = new Map();
        this.disposed = false;
    }
    watch(image) {
        const i = this.registry.get(image);
        if (!i && util_1.isFileSync(image)) {
            const version = Date.now();
            const watcher = new atom_1.CompositeDisposable();
            const af = new atom_1.File(image);
            watcher.add(af.onDidChange(this.srcClosure(image, 'change')), af.onDidDelete(this.srcClosure(image, 'delete')), af.onDidRename(this.srcClosure(image, 'rename')));
            this.registry.set(image, {
                version,
                watcher,
            });
            return version;
        }
        else if (i) {
            return i.version;
        }
        else {
            return undefined;
        }
    }
    dispose() {
        if (this.disposed)
            return;
        this.clear();
        this.disposed = true;
    }
    clear() {
        for (const v of this.registry.values()) {
            v.watcher.dispose();
        }
        this.registry.clear();
    }
    srcClosure(src, event) {
        return () => {
            const i = this.registry.get(src);
            if (!i)
                return;
            if (event === 'change' && util_1.isFileSync(src)) {
                i.version = Date.now();
                this.refreshImages(src, i.version);
            }
            else {
                i.watcher.dispose();
                this.registry.delete(src);
                this.refreshImages(src);
            }
        };
    }
    refreshImages(src, version) {
        if (this.disposed)
            return;
        this.callback(src, version);
    }
}
exports.ImageWatcher = ImageWatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Utd2F0Y2gtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ltYWdlLXdhdGNoLWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFnRDtBQUNoRCxpQ0FBbUM7QUFPbkMsTUFBYSxZQUFZO0lBSXZCLFlBQW9CLFFBQWlEO1FBQWpELGFBQVEsR0FBUixRQUFRLENBQXlDO1FBSDdELGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQTtRQUM5QyxhQUFRLEdBQUcsS0FBSyxDQUFBO0lBRWdELENBQUM7SUFFbEUsS0FBSyxDQUFDLEtBQWE7UUFDeEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbEMsSUFBSSxDQUFDLENBQUMsSUFBSSxpQkFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzNCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtZQUMxQixNQUFNLE9BQU8sR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7WUFDekMsTUFBTSxFQUFFLEdBQUcsSUFBSSxXQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FDVCxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQ2hELEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFDaEQsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUNqRCxDQUFBO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFO2dCQUN2QixPQUFPO2dCQUNQLE9BQU87YUFDUixDQUFDLENBQUE7WUFDRixPQUFPLE9BQU8sQ0FBQTtTQUNmO2FBQU0sSUFBSSxDQUFDLEVBQUU7WUFDWixPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUE7U0FDakI7YUFBTTtZQUNMLE9BQU8sU0FBUyxDQUFBO1NBQ2pCO0lBQ0gsQ0FBQztJQUVNLE9BQU87UUFDWixJQUFJLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTTtRQUN6QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDWixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixDQUFDO0lBRU0sS0FBSztRQUNWLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN0QyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO1NBQ3BCO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUN2QixDQUFDO0lBRU8sVUFBVSxDQUFDLEdBQVcsRUFBRSxLQUFxQztRQUNuRSxPQUFPLEdBQUcsRUFBRTtZQUNWLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2hDLElBQUksQ0FBQyxDQUFDO2dCQUFFLE9BQU07WUFDZCxJQUFJLEtBQUssS0FBSyxRQUFRLElBQUksaUJBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDekMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7Z0JBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTthQUNuQztpQkFBTTtnQkFDTCxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO2dCQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUN4QjtRQUNILENBQUMsQ0FBQTtJQUNILENBQUM7SUFFTyxhQUFhLENBQUMsR0FBVyxFQUFFLE9BQWdCO1FBQ2pELElBQUksSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFNO1FBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQzdCLENBQUM7Q0FDRjtBQTdERCxvQ0E2REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBGaWxlIH0gZnJvbSAnYXRvbSdcclxuaW1wb3J0IHsgaXNGaWxlU3luYyB9IGZyb20gJy4vdXRpbCdcclxuXHJcbmludGVyZmFjZSBJbWFnZVJlZ2lzdGVyUmVjIHtcclxuICB2ZXJzaW9uOiBudW1iZXJcclxuICB3YXRjaGVyOiBDb21wb3NpdGVEaXNwb3NhYmxlXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBJbWFnZVdhdGNoZXIge1xyXG4gIHByaXZhdGUgcmVnaXN0cnkgPSBuZXcgTWFwPHN0cmluZywgSW1hZ2VSZWdpc3RlclJlYz4oKVxyXG4gIHByaXZhdGUgZGlzcG9zZWQgPSBmYWxzZVxyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhbGxiYWNrOiAoc3JjOiBzdHJpbmcsIHZlcnNpb24/OiBudW1iZXIpID0+IHZvaWQpIHt9XHJcblxyXG4gIHB1YmxpYyB3YXRjaChpbWFnZTogc3RyaW5nKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICAgIGNvbnN0IGkgPSB0aGlzLnJlZ2lzdHJ5LmdldChpbWFnZSlcclxuICAgIGlmICghaSAmJiBpc0ZpbGVTeW5jKGltYWdlKSkge1xyXG4gICAgICBjb25zdCB2ZXJzaW9uID0gRGF0ZS5ub3coKVxyXG4gICAgICBjb25zdCB3YXRjaGVyID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxyXG4gICAgICBjb25zdCBhZiA9IG5ldyBGaWxlKGltYWdlKVxyXG4gICAgICB3YXRjaGVyLmFkZChcclxuICAgICAgICBhZi5vbkRpZENoYW5nZSh0aGlzLnNyY0Nsb3N1cmUoaW1hZ2UsICdjaGFuZ2UnKSksXHJcbiAgICAgICAgYWYub25EaWREZWxldGUodGhpcy5zcmNDbG9zdXJlKGltYWdlLCAnZGVsZXRlJykpLFxyXG4gICAgICAgIGFmLm9uRGlkUmVuYW1lKHRoaXMuc3JjQ2xvc3VyZShpbWFnZSwgJ3JlbmFtZScpKSxcclxuICAgICAgKVxyXG4gICAgICB0aGlzLnJlZ2lzdHJ5LnNldChpbWFnZSwge1xyXG4gICAgICAgIHZlcnNpb24sXHJcbiAgICAgICAgd2F0Y2hlcixcclxuICAgICAgfSlcclxuICAgICAgcmV0dXJuIHZlcnNpb25cclxuICAgIH0gZWxzZSBpZiAoaSkge1xyXG4gICAgICByZXR1cm4gaS52ZXJzaW9uXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmRpc3Bvc2VkKSByZXR1cm5cclxuICAgIHRoaXMuY2xlYXIoKVxyXG4gICAgdGhpcy5kaXNwb3NlZCA9IHRydWVcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgIGZvciAoY29uc3QgdiBvZiB0aGlzLnJlZ2lzdHJ5LnZhbHVlcygpKSB7XHJcbiAgICAgIHYud2F0Y2hlci5kaXNwb3NlKClcclxuICAgIH1cclxuICAgIHRoaXMucmVnaXN0cnkuY2xlYXIoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzcmNDbG9zdXJlKHNyYzogc3RyaW5nLCBldmVudDogJ2NoYW5nZScgfCAnZGVsZXRlJyB8ICdyZW5hbWUnKSB7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBjb25zdCBpID0gdGhpcy5yZWdpc3RyeS5nZXQoc3JjKVxyXG4gICAgICBpZiAoIWkpIHJldHVyblxyXG4gICAgICBpZiAoZXZlbnQgPT09ICdjaGFuZ2UnICYmIGlzRmlsZVN5bmMoc3JjKSkge1xyXG4gICAgICAgIGkudmVyc2lvbiA9IERhdGUubm93KClcclxuICAgICAgICB0aGlzLnJlZnJlc2hJbWFnZXMoc3JjLCBpLnZlcnNpb24pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaS53YXRjaGVyLmRpc3Bvc2UoKVxyXG4gICAgICAgIHRoaXMucmVnaXN0cnkuZGVsZXRlKHNyYylcclxuICAgICAgICB0aGlzLnJlZnJlc2hJbWFnZXMoc3JjKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlZnJlc2hJbWFnZXMoc3JjOiBzdHJpbmcsIHZlcnNpb24/OiBudW1iZXIpIHtcclxuICAgIGlmICh0aGlzLmRpc3Bvc2VkKSByZXR1cm5cclxuICAgIHRoaXMuY2FsbGJhY2soc3JjLCB2ZXJzaW9uKVxyXG4gIH1cclxufVxyXG4iXX0=