"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handlePromise(promise) {
    promise.catch((error) => {
        atom.notifications.addFatalError(error.toString(), {
            detail: error.message,
            stack: error.stack,
            dismissable: true,
        });
    });
}
exports.handlePromise = handlePromise;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUJBQWlDLE9BQW1CO0lBQ2xELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDakQsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQ3JCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztZQUNsQixXQUFXLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFSRCxzQ0FRQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBoYW5kbGVQcm9taXNlPFQ+KHByb21pc2U6IFByb21pc2U8VD4pOiB2b2lkIHtcbiAgcHJvbWlzZS5jYXRjaCgoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEZhdGFsRXJyb3IoZXJyb3IudG9TdHJpbmcoKSwge1xuICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlLFxuICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgfSlcbiAgfSlcbn1cbiJdfQ==