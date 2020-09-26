interface CallableFunction {
  bind<T>(this: T, thisArg: any): T
}

interface ObjectConstructor {
  entries<T extends object>(
    x: T,
  ): Array<{ [K in keyof T]-?: [K, T[K]] }[keyof T]>
}

interface Window {
  'markdown-preview-plus-tests'?: {
    clipboardWrite?: Function
    getStylesOverride?: (x: boolean) => string[]
  }
}

namespace NodeJS {
  interface Process {
    activateUvLoop: () => void
  }
}
