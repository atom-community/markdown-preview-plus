export function handlePromise<T>(promise: Promise<T>): void {
  promise.catch((error: Error) => {
    atom.notifications.addFatalError(error.toString(), {
      detail: error.message,
      stack: error.stack,
      dismissable: true,
    })
  })
}
