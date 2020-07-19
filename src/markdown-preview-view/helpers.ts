import { TextEditor } from 'atom'
import { MarkdownPreviewView } from './markdown-preview-view'
import {
  MarkdownPreviewControllerEditor,
  MarkdownPreviewControllerFile,
} from './controller'
import { BrowserWindowHandler } from './browserwindow-handler'

export function createEditorView(editor: TextEditor) {
  const mppv = viewForEditor(editor)
  if (mppv) return mppv
  return new MarkdownPreviewView(new MarkdownPreviewControllerEditor(editor))
}

export function viewForEditor(editor: TextEditor) {
  return itemForURI(`markdown-preview-plus://editor/${editor.id}`)
}

export function viewForFile(filePath: string) {
  return itemForURI(`markdown-preview-plus://file/${filePath}`)
}

export function createFileView(filePath: string) {
  const mppv = viewForFile(filePath)
  if (mppv) return mppv
  return new MarkdownPreviewView(new MarkdownPreviewControllerFile(filePath))
}

function itemForURI(uri: string) {
  const pane = atom.workspace.paneForURI(uri)
  if (pane) {
    const item = pane.itemForURI(uri)
    if (item) return item as MarkdownPreviewView
  }
  return BrowserWindowHandler.viewForURI(uri)
}
