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

export function resolveElement(
  root: Element,
  pathToToken: Array<{ tag: string; index: number }>,
): Element | undefined {
  let element = root
  for (const token of pathToToken) {
    const candidateElement: HTMLElement | null = element
      .querySelectorAll(`:scope > ${token.tag}`)
      .item(token.index) as HTMLElement
    if (candidateElement) {
      element = candidateElement
    } else {
      break
    }
  }

  if (element === root) return undefined // Do not jump to the top of the preview for bad syncs
  return element
}

export function* zip<U, V>(
  a: Iterable<U>,
  b: Iterable<V>,
): IterableIterator<[U, V]> {
  const ita = a[Symbol.iterator]()
  const itb = b[Symbol.iterator]()
  let x = ita.next()
  let y = itb.next()
  while (!x.done && !y.done) {
    yield [x.value, y.value]
    x = ita.next()
    y = itb.next()
  }
}
