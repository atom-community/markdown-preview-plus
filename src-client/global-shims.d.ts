type ResolvablePromise<T> = Promise<T> & {
  resolve(val?: T | PromiseLike<T>): void
}

interface Window {
  atomVars: {
    home: ResolvablePromise<string>
    numberEqns: ResolvablePromise<boolean>
  }
}
