export function handlePromise(promise: Promise<any>): void {
  if (!promise) return
  promise.catch((error: Error) => {
    atom.notifications.addFatalError(error.toString(), {
      detail: error.message,
      stack: error.stack,
      dismissable: true,
    })
  })
}
import { lstatSync, existsSync } from 'fs'
export function isFileSync(filePath: string) {
  if (!existsSync(filePath)) return false
  return lstatSync(filePath).isFile()
}
