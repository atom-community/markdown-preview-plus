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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Utd2F0Y2gtaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ltYWdlLXdhdGNoLWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFnRDtBQUNoRCxpQ0FBbUM7QUFPbkMsTUFBYSxZQUFZO0lBSXZCLFlBQW9CLFFBQWlEO1FBQWpELGFBQVEsR0FBUixRQUFRLENBQXlDO1FBSDdELGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQTtRQUM5QyxhQUFRLEdBQUcsS0FBSyxDQUFBO0lBRWdELENBQUM7SUFFbEUsS0FBSyxDQUFDLEtBQWE7UUFDeEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbEMsSUFBSSxDQUFDLENBQUMsSUFBSSxpQkFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzNCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtZQUMxQixNQUFNLE9BQU8sR0FBRyxJQUFJLDBCQUFtQixFQUFFLENBQUE7WUFDekMsTUFBTSxFQUFFLEdBQUcsSUFBSSxXQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FDVCxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQ2hELEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFDaEQsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUNqRCxDQUFBO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFO2dCQUN2QixPQUFPO2dCQUNQLE9BQU87YUFDUixDQUFDLENBQUE7WUFDRixPQUFPLE9BQU8sQ0FBQTtTQUNmO2FBQU0sSUFBSSxDQUFDLEVBQUU7WUFDWixPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUE7U0FDakI7YUFBTTtZQUNMLE9BQU8sU0FBUyxDQUFBO1NBQ2pCO0lBQ0gsQ0FBQztJQUVNLE9BQU87UUFDWixJQUFJLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTTtRQUN6QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDWixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUN0QixDQUFDO0lBRU0sS0FBSztRQUNWLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN0QyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO1NBQ3BCO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUN2QixDQUFDO0lBRU8sVUFBVSxDQUFDLEdBQVcsRUFBRSxLQUFxQztRQUNuRSxPQUFPLEdBQUcsRUFBRTtZQUNWLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2hDLElBQUksQ0FBQyxDQUFDO2dCQUFFLE9BQU07WUFDZCxJQUFJLEtBQUssS0FBSyxRQUFRLElBQUksaUJBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDekMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7Z0JBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTthQUNuQztpQkFBTTtnQkFDTCxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO2dCQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUN4QjtRQUNILENBQUMsQ0FBQTtJQUNILENBQUM7SUFFTyxhQUFhLENBQUMsR0FBVyxFQUFFLE9BQWdCO1FBQ2pELElBQUksSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFNO1FBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQzdCLENBQUM7Q0FDRjtBQTdERCxvQ0E2REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBGaWxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IGlzRmlsZVN5bmMgfSBmcm9tICcuL3V0aWwnXG5cbmludGVyZmFjZSBJbWFnZVJlZ2lzdGVyUmVjIHtcbiAgdmVyc2lvbjogbnVtYmVyXG4gIHdhdGNoZXI6IENvbXBvc2l0ZURpc3Bvc2FibGVcbn1cblxuZXhwb3J0IGNsYXNzIEltYWdlV2F0Y2hlciB7XG4gIHByaXZhdGUgcmVnaXN0cnkgPSBuZXcgTWFwPHN0cmluZywgSW1hZ2VSZWdpc3RlclJlYz4oKVxuICBwcml2YXRlIGRpc3Bvc2VkID0gZmFsc2VcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhbGxiYWNrOiAoc3JjOiBzdHJpbmcsIHZlcnNpb24/OiBudW1iZXIpID0+IHZvaWQpIHt9XG5cbiAgcHVibGljIHdhdGNoKGltYWdlOiBzdHJpbmcpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGkgPSB0aGlzLnJlZ2lzdHJ5LmdldChpbWFnZSlcbiAgICBpZiAoIWkgJiYgaXNGaWxlU3luYyhpbWFnZSkpIHtcbiAgICAgIGNvbnN0IHZlcnNpb24gPSBEYXRlLm5vdygpXG4gICAgICBjb25zdCB3YXRjaGVyID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgICAgY29uc3QgYWYgPSBuZXcgRmlsZShpbWFnZSlcbiAgICAgIHdhdGNoZXIuYWRkKFxuICAgICAgICBhZi5vbkRpZENoYW5nZSh0aGlzLnNyY0Nsb3N1cmUoaW1hZ2UsICdjaGFuZ2UnKSksXG4gICAgICAgIGFmLm9uRGlkRGVsZXRlKHRoaXMuc3JjQ2xvc3VyZShpbWFnZSwgJ2RlbGV0ZScpKSxcbiAgICAgICAgYWYub25EaWRSZW5hbWUodGhpcy5zcmNDbG9zdXJlKGltYWdlLCAncmVuYW1lJykpLFxuICAgICAgKVxuICAgICAgdGhpcy5yZWdpc3RyeS5zZXQoaW1hZ2UsIHtcbiAgICAgICAgdmVyc2lvbixcbiAgICAgICAgd2F0Y2hlcixcbiAgICAgIH0pXG4gICAgICByZXR1cm4gdmVyc2lvblxuICAgIH0gZWxzZSBpZiAoaSkge1xuICAgICAgcmV0dXJuIGkudmVyc2lvblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGlzcG9zZWQpIHJldHVyblxuICAgIHRoaXMuY2xlYXIoKVxuICAgIHRoaXMuZGlzcG9zZWQgPSB0cnVlXG4gIH1cblxuICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCB2IG9mIHRoaXMucmVnaXN0cnkudmFsdWVzKCkpIHtcbiAgICAgIHYud2F0Y2hlci5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyeS5jbGVhcigpXG4gIH1cblxuICBwcml2YXRlIHNyY0Nsb3N1cmUoc3JjOiBzdHJpbmcsIGV2ZW50OiAnY2hhbmdlJyB8ICdkZWxldGUnIHwgJ3JlbmFtZScpIHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29uc3QgaSA9IHRoaXMucmVnaXN0cnkuZ2V0KHNyYylcbiAgICAgIGlmICghaSkgcmV0dXJuXG4gICAgICBpZiAoZXZlbnQgPT09ICdjaGFuZ2UnICYmIGlzRmlsZVN5bmMoc3JjKSkge1xuICAgICAgICBpLnZlcnNpb24gPSBEYXRlLm5vdygpXG4gICAgICAgIHRoaXMucmVmcmVzaEltYWdlcyhzcmMsIGkudmVyc2lvbilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGkud2F0Y2hlci5kaXNwb3NlKClcbiAgICAgICAgdGhpcy5yZWdpc3RyeS5kZWxldGUoc3JjKVxuICAgICAgICB0aGlzLnJlZnJlc2hJbWFnZXMoc3JjKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVmcmVzaEltYWdlcyhzcmM6IHN0cmluZywgdmVyc2lvbj86IG51bWJlcikge1xuICAgIGlmICh0aGlzLmRpc3Bvc2VkKSByZXR1cm5cbiAgICB0aGlzLmNhbGxiYWNrKHNyYywgdmVyc2lvbilcbiAgfVxufVxuIl19