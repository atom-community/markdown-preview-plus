export {}
import { MarkdownPreviewViewElement } from '../markdown-preview-view'
declare module 'atom' {
  interface TextEditor {
    cursorLineDecorations: LayerDecoration[] | null | undefined
  }
  interface AtomEnvironment {
    showSaveDialogSync(path: string): string | undefined
  }
  interface CommandRegistryTargetMap {
    '.markdown-preview-plus': MarkdownPreviewViewElement
  }
  interface ContextMenuManager {
    showForEvent(e: PointerEvent): void
  }
  interface File {
    read(flushCache?: boolean): Promise<string | null>
  }
}
declare global {
  namespace NodeJS {
    interface Process {
      resourcesPath: string
    }
  }
}
