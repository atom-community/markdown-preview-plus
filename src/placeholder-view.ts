import { editorForId } from './markdown-preview-view/util'
import { MarkdownPreviewViewEditor } from './markdown-preview-view'
import { handlePromise } from './util'

export class PlaceholderView {
  public element = document.createElement('div')
  private _view?: MarkdownPreviewViewEditor
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
    this._view = MarkdownPreviewViewEditor.create(editor)
    if (!pane) return
    pane.addItem(this._view)
    handlePromise(pane.destroyItem(this))
  }
}
