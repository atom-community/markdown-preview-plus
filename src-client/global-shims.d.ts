type ResolvablePromise<T> = Promise<T> & {
  resolve(val?: T | PromiseLike<T>): void
}

interface Window {
  atom: {
    home: ResolvablePromise<string>
    numberEqns: ResolvablePromise<boolean>
  }
}
