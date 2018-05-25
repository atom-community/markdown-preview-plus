type ResolvablePromise<T> = Promise<T> & {
  resolve(val?: T | PromiseLike<T>): void
}

interface Window {
  atomVars: {
    home: ResolvablePromise<string>
    numberEqns: ResolvablePromise<boolean>
    mjxTeXExtensions: ResolvablePromise<string[]>
    mjxUndefinedFamily: ResolvablePromise<string[]>
    sourceLineMap: Map<number, Element>
    revSourceMap: WeakMap<Element, number[]>
  }
}
