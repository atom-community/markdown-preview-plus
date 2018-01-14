"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handlePromise(promise) {
    if (!promise)
        return;
    promise.catch((error) => {
        atom.notifications.addFatalError(error.toString(), {
            detail: error.message,
            stack: error.stack,
            dismissable: true,
        });
    });
}
exports.handlePromise = handlePromise;
const fs_1 = require("fs");
function isFileSync(filePath) {
    if (!fs_1.existsSync(filePath))
        return false;
    return fs_1.lstatSync(filePath).isFile();
}
exports.isFileSync = isFileSync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUJBQThCLE9BQXFCO0lBQ2pELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQUMsTUFBTSxDQUFBO0lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDakQsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQ3JCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztZQUNsQixXQUFXLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFURCxzQ0FTQztBQUNELDJCQUEwQztBQUMxQyxvQkFBMkIsUUFBZ0I7SUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFBO0lBQ3ZDLE1BQU0sQ0FBQyxjQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDckMsQ0FBQztBQUhELGdDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVByb21pc2UocHJvbWlzZTogUHJvbWlzZTxhbnk+KTogdm9pZCB7XG4gIGlmICghcHJvbWlzZSkgcmV0dXJuXG4gIHByb21pc2UuY2F0Y2goKGVycm9yOiBFcnJvcikgPT4ge1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRGYXRhbEVycm9yKGVycm9yLnRvU3RyaW5nKCksIHtcbiAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZSxcbiAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgIH0pXG4gIH0pXG59XG5pbXBvcnQgeyBsc3RhdFN5bmMsIGV4aXN0c1N5bmMgfSBmcm9tICdmcydcbmV4cG9ydCBmdW5jdGlvbiBpc0ZpbGVTeW5jKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgaWYgKCFleGlzdHNTeW5jKGZpbGVQYXRoKSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBsc3RhdFN5bmMoZmlsZVBhdGgpLmlzRmlsZSgpXG59XG4iXX0=