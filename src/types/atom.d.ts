export {}
declare module 'atom' {
  interface CommandRegistryTargetMap {
    '.markdown-preview-plus': HTMLElement
  }
  interface TextEditor {
    getVisibleRowRange(): [number, number]
    bufferRowForScreenRow(row: number): number
    scrollToScreenRange(range: Range, options?: { center: boolean }): void
    onDidTokenize(callback: () => void): Disposable
  }
  interface TextBuffer {
    getLanguageMode(): { readonly fullyTokenized: boolean }
  }
  interface TextEditorElement {
    setUpdatedSynchronously(val: boolean): void
  }
}
