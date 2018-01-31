export {}
declare module 'atom' {
  interface StyleManager {
    addStyleSheet(style: string, options?: { context?: string }): void
  }
}
