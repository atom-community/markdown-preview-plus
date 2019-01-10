interface CallableFunction {
  bind<T>(this: T, thisArg: any): T
}

interface ObjectConstructor {
  entries<T extends object>(
    x: T,
  ): Array<{ [K in keyof T]-?: [K, T[K]] }[keyof T]>
}
