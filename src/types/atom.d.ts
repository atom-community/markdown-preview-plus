import { Range } from 'atom'
import { LanguageMode } from './atom-extra'
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
  interface TextEditorElement {
    setUpdatedSynchronously(val: boolean): void
  }
  interface ThemeManager {
    loadStylesheet(path: string, importFallbackVariables?: boolean): string
  }
  interface ContextMenuManager {
    showForEvent: (ev: { target: HTMLElement }) => void
  }
}

declare module 'atom/src/style-manager' {
  interface StyleManager {
    styleElementsBySourcePath: { [key: string]: HTMLStyleElement | undefined }
  }
}

declare module 'atom/src/package' {
  interface Package {
    getStylesheetPaths(): string[]
  }
}
