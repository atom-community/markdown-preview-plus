import { TextEditor } from 'atom'
import { MarkdownPreviewView } from './markdown-preview-view'
import {
  MarkdownPreviewControllerEditor,
  MarkdownPreviewControllerFile,
} from './controller'

const editorMap = new WeakMap<TextEditor, MarkdownPreviewView>()

export function createEditorView(editor: TextEditor) {
  let mppv = editorMap.get(editor)
  if (!mppv) {
    mppv = new MarkdownPreviewView(new MarkdownPreviewControllerEditor(editor))
    editorMap.set(editor, mppv)
    const disp = mppv.onDidDestroy(() => {
      disp.dispose()
      if (editorMap.get(editor) === mppv) editorMap.delete(editor)
    })
  }
  return mppv
}

export function viewForEditor(editor: TextEditor) {
  return editorMap.get(editor)
}

export function createFileView(filePath: string) {
  return new MarkdownPreviewView(new MarkdownPreviewControllerFile(filePath))
}
