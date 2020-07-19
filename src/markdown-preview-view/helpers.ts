import { TextEditor, WorkspaceOpenOptions, ViewModel } from 'atom'
import { MarkdownPreviewView } from './markdown-preview-view'
import {
  MarkdownPreviewControllerEditor,
  MarkdownPreviewControllerFile,
  MarkdownPreviewControllerText,
} from './controller'
import { BrowserWindowHandler } from './browserwindow-handler'
import { atomConfig } from '../util'

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

export function createTextView(text: string) {
  return new MarkdownPreviewView(
    new MarkdownPreviewControllerText(Promise.resolve(text)),
  )
}

function itemForURI(uri: string) {
  const pane = atom.workspace.paneForURI(uri)
  if (pane) {
    const item = pane.itemForURI(uri)
    if (item) return item as MarkdownPreviewView
  }
  return BrowserWindowHandler.viewForURI(uri)
}

export async function openPreviewPane(view: ViewModel) {
  const previousActivePane = atom.workspace.getActivePane()
  const options: WorkspaceOpenOptions = { searchAllPanes: true }
  const splitConfig = atomConfig().previewConfig.previewSplitPaneDir
  if (splitConfig !== 'none') {
    options.split = splitConfig
  }
  const res = await atom.workspace.open(view, options)
  if (!previousActivePane.isDestroyed()) previousActivePane.activate()
  return res
}
