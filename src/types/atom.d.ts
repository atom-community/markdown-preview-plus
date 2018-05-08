export {}
import { MarkdownPreviewViewElement } from '../markdown-preview-view'
declare module 'atom' {
  interface CommandRegistryTargetMap {
    '.markdown-preview-plus': MarkdownPreviewViewElement
  }
  interface TextEditor {
    getVisibleRowRange(): [number, number]
    bufferRowForScreenRow(row: number): number
    scrollToScreenRange(range: Range, options?: { center: boolean }): void
  }
}
