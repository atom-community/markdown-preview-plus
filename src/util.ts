export function handlePromise(promise: Promise<any>): void {
  if (!promise) return
  promise.catch((error: Error) => {
    console.error(error)
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

export function pairUp<T>(arr: T[], option?: string): Array<[T, T]> {
  if (arr.length % 2 !== 0) {
    atom.notifications.addWarning(
      `Invalid math delimiter configuration${option ? `in ${option}` : ''}`,
      {
        detail: `Expected even number of elements, but got "${arr.join(', ')}"`,
        dismissable: true,
      },
    )
  }
  return arr.reduce<Array<[T, T]>>(function(result, _value, index, array) {
    if (index % 2 === 0) result.push([array[index], array[index + 1]])
    return result
  }, [])
}

export function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}
