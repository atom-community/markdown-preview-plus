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
    'markdown-preview-plus-view': MarkdownPreviewViewElement
  }
}
