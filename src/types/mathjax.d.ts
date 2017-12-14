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
