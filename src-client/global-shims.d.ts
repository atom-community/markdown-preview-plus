type ResolvablePromise<T> = Promise<T> & {
  resolve(val?: T | PromiseLike<T>): void
}

interface Window {
  atomVars: {
    home: ResolvablePromise<string>
    mathJaxConfig: ResolvablePromise<
      MathJaxConfig & { renderer: MathJaxRenderer }
    >
    sourceLineMap: Map<number, Element>
    revSourceMap: WeakMap<Element, number[]>
  }
}
