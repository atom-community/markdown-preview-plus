import { editorForId } from './markdown-preview-view/util'
import { handlePromise } from './util'
import { MarkdownPreviewView, createEditorView } from './markdown-preview-view'

export class PlaceholderView {
  public element = document.createElement('div')
  private _view?: MarkdownPreviewView
  constructor(private editorId: number) {
    this.element.classList.add('markdown-spinner')
    setImmediate(this.initialize)
  }

  public getView() {
    return this._view
  }

  public getTitle() {
    return 'Placeholder Markdown Preview Plus View'
  }

  public getURI() {
    return 'markdown-preview-plus://placeholder'
  }

  private initialize = () => {
    const editor = editorForId(this.editorId)
    if (!editor) {
      return
    }
    const pane = atom.workspace.paneForItem(this)
    this._view = createEditorView(editor)
    if (!pane) return
    pane.addItem(this._view)
    handlePromise(pane.destroyItem(this))
  }
}
