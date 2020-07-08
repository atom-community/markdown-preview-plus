interface Window {
  workspaceDiv: HTMLDivElement
  MathJax: any
}
declare module 'markdown-it-testgen' {
  import { mdIt } from 'markdown-it'
  declare function generate(path: string, mdIt: mdIt): void
  export = generate
}
