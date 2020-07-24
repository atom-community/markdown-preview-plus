export {}
declare module 'atom' {
  interface CommandRegistryTargetMap {
    '.markdown-preview-plus': HTMLElement
  }
  interface AtomEnvironment {
    applicationDelegate: {
      showSaveDialog: {
        (options: SaveDialogOptions): string | undefined
        (options: SaveDialogOptions, callback: Function): void
      }
    }
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
    getLanguageMode(): LanguageMode
    setLanguageMode(m: LanguageMode): void
  }
  interface GrammarRegistry {
    grammarForId(id: string): Grammar
    languageModeForGrammarAndBuffer(g: Grammar, b: TextBuffer): LanguageMode
  }
  interface LanguageMode {
    readonly fullyTokenized?: boolean
    readonly tree?: boolean
    onDidTokenize(cb: () => void): Disposable
    buildHighlightIterator(): HighlightIterator
    classNameForScopeId(id: ScopeId): string
    startTokenizing?(): void
  }
  interface HighlightIterator {
    seek(pos: { row: number; column: number }): void
    getPosition(): { row: number; column: number }
    getOpenScopeIds?(): ScopeId[]
    getCloseScopeIds?(): ScopeId[]
    moveToSuccessor(): void
  }
  interface ScopeId {}
  interface TextEditorElement {
    setUpdatedSynchronously(val: boolean): void
  }
  interface StyleManager {
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
