export {}
import { MarkdownPreviewViewElement } from '../markdown-preview-view'
declare module 'atom' {
  interface Workspace {
    destroyActivePaneItem: () => void
  }
  interface PackageManager {
    resourcePath: string
  }
  interface TextEditor {
    cursorLineDecorations: LayerDecoration[] | null | undefined
  }
  interface AtomEnvironment {
    showSaveDialogSync(path: string): string | undefined
  }
  interface CommandRegistryTargetMap {
    '.markdown-preview': MarkdownPreviewViewElement
  }
  interface ContextMenuManager {
    showForEvent(e: PointerEvent): void
  }
}
