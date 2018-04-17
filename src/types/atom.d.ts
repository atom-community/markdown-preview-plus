export {}
import { MarkdownPreviewViewElement } from '../markdown-preview-view'
declare module 'atom' {
  interface CommandRegistryTargetMap {
    '.markdown-preview-plus': MarkdownPreviewViewElement
  }
}
