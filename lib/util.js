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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUJBQThCLE9BQXFCO0lBQ2pELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQUMsTUFBTSxDQUFBO0lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDakQsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQ3JCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztZQUNsQixXQUFXLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFURCxzQ0FTQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBoYW5kbGVQcm9taXNlKHByb21pc2U6IFByb21pc2U8YW55Pik6IHZvaWQge1xuICBpZiAoIXByb21pc2UpIHJldHVyblxuICBwcm9taXNlLmNhdGNoKChlcnJvcjogRXJyb3IpID0+IHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihlcnJvci50b1N0cmluZygpLCB7XG4gICAgICBkZXRhaWw6IGVycm9yLm1lc3NhZ2UsXG4gICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICB9KVxuICB9KVxufVxuIl19