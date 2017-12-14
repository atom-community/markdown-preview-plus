interface Function {
  bind<T>(this: T, thisArg: any): T
}

interface ObjectConstructor {
  keys<K extends string>(o: { [Key in K]: any }): K[]
  entries<K extends string, T>(o: { [Key in K]: T }): [K, T][]
}

interface String {
  trimRight(): string
}

type Maybe<T> = T | null | undefined

interface NodeListOf<TNode extends Node> extends NodeList {
  forEach(func: (elem: TNode, idx: number) => void): void
}

interface StyleSheet {
  rules?: CSSRuleList
}

interface CSSRule {
  selectorText?: string
}

type MathJaxQueueElement =
  | ['Typeset', MathJaxHub, Node | Node[]]
  | ['setRenderer', MathJaxHub, 'SVG' | 'HTML-CSS']
  | [() => void]

interface MathJaxHub {
  Queue(...args: MathJaxQueueElement[]): void
  Configured(): void
  Config(cfg: {}): void
}

interface MathJaxInterface {
  Hub: MathJaxHub
}

interface Window {
  MathJax?: MathJaxInterface
}

declare const MathJax: MathJaxInterface | undefined
