export function handlePromise(promise: Promise<any>): void {
  if (!promise) return
  promise.catch((error: Error) => {
    console.error(error)
  })
}
import { lstatSync, existsSync } from 'fs'
export function isFileSync(filePath: string) {
  if (!existsSync(filePath)) return false
  return lstatSync(filePath).isFile()
}

export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}
