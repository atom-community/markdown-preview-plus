interface Function {
  bind<T>(this: T, thisArg: any): T
}

interface ObjectConstructor {
  keys<K extends string>(o: { [Key in K]: any }): K[]
  entries<K extends string, T>(o: { [Key in K]: T }): [K, T][]
  entries<O extends object>(
    o: { [K in keyof O]: O[K] },
  ): [keyof O, O[keyof O]][]
}

interface String {
  trimRight(): string
}

type Maybe<T> = T | null | undefined

interface NodeListOf<TNode extends Node> extends NodeList {
  forEach(func: (elem: TNode, idx: number) => void): void
}

interface StyleSheet {
  rules?: CSSRuleList | null
}

interface CSSRule {
  selectorText?: string | null
}
