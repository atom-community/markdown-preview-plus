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
    isAlive(): boolean
    component: {
      getNextUpdatePromise(): Promise<unknown>
    }
  }
  interface TextBuffer {
    getLanguageMode(): {
      readonly fullyTokenized?: boolean
      readonly tree?: boolean
    }
  }
  interface TextEditorElement {
    setUpdatedSynchronously(val: boolean): void
  }
  interface StyleManager {
    addStyleSheet(style: string, options?: { context?: string }): void
    styleElementsBySourcePath: { [key: string]: HTMLStyleElement | undefined }
  }
  interface ThemeManager {
    loadStylesheet(path: string, importFallbackVariables?: boolean): string
  }
  interface Package {
    getStylesheetPaths(): string[]
  }
  interface ContextMenuManager {
    showForEvent: (ev: { target: HTMLElement }) => void
  }
}
