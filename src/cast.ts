import { MarkdownPreviewView } from './markdown-preview-view'

export function isMarkdownPreviewView(
  object: object,
): object is MarkdownPreviewView {
  return object instanceof MarkdownPreviewView
}
