interface Window {
  MathJax?: typeof MathJax
}

declare namespace MathJax {
  interface Hub {
    Queue(...args: any[]): void
  }
}
