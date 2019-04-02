import { TextEditor, Grammar, Range } from 'atom'
import * as util from './util'
import { MarkdownPreviewView, SerializedMPV } from './markdown-preview-view'
import { atomConfig } from '../util'
import { MarkdownPreviewViewEditorRemote } from './markdown-preview-view-editor-remote'

export class MarkdownPreviewViewEditor extends MarkdownPreviewView {
  private static editorMap = new WeakMap<
    TextEditor,
    MarkdownPreviewViewEditor
  >()

  private constructor(private editor: TextEditor) {
    super()
    this.handleEditorEvents()
  }

  public static create(editor: TextEditor) {
    let mppv = MarkdownPreviewViewEditor.editorMap.get(editor)
    if (!mppv) {
      mppv = new MarkdownPreviewViewEditor(editor)
      MarkdownPreviewViewEditor.editorMap.set(editor, mppv)
    }
    return mppv
  }

  public static viewForEditor(editor: TextEditor) {
    return MarkdownPreviewViewEditor.editorMap.get(editor)
  }

  public destroy() {
    super.destroy()
    MarkdownPreviewViewEditor.editorMap.delete(this.editor)
  }

  public serialize(): SerializedMPV {
    return {
      deserializer: 'markdown-preview-plus/MarkdownPreviewView',
      editorId: this.editor && this.editor.id,
    }
  }

  public getTitle() {
    return `${this.editor.getTitle()} Preview`
  }

  public getURI() {
    return `markdown-preview-plus://editor/${this.editor.id}`
  }

  public getPath() {
    return this.editor.getPath()
  }

  protected async getMarkdownSource() {
    return this.editor.getText()
  }

  protected getGrammar(): Grammar {
    return this.editor.getGrammar()
  }

  protected didScrollPreview(min: number, max: number) {
    if (!this.shouldScrollSync('preview')) return
    if (min === 0) {
      this.editor.scrollToBufferPosition([min, 0])
    } else if (max >= this.editor.getLastBufferRow() - 1) {
      this.editor.scrollToBufferPosition([max, 0])
    } else {
      // const mid = Math.floor(0.5 * (min + max))
      // this.editor.scrollToBufferPosition([mid, 0], { center: true })
      const range = Range.fromObject([[min, 0], [max, 0]])
      this.editor.scrollToScreenRange(
        this.editor.screenRangeForBufferRange(range),
        { center: false },
      )
    }
  }

  protected openNewWindow() {
    MarkdownPreviewViewEditorRemote.open(this.editor)
    util.destroy(this)
  }

  protected openSource(initialLine?: number) {
    if (initialLine !== undefined) {
      this.editor.setCursorBufferPosition([initialLine, 0])
    }
    const pane = atom.workspace.paneForItem(this.editor)
    if (!pane) return
    pane.activateItem(this.editor)
    pane.activate()
  }

  private handleEditorEvents() {
    this.disposables.add(
      atom.workspace.onDidChangeActiveTextEditor((ed) => {
        if (atomConfig().previewConfig.activatePreviewWithEditor) {
          if (ed === this.editor) {
            const pane = atom.workspace.paneForItem(this)
            if (!pane) return
            const edPane = atom.workspace.paneForItem(ed)
            if (pane === edPane) return
            pane.activateItem(this)
          }
        }
      }),
      this.editor.getBuffer().onDidStopChanging(() => {
        if (atomConfig().previewConfig.liveUpdate) {
          this.changeHandler()
        }
        if (atomConfig().syncConfig.syncPreviewOnChange) {
          this.syncPreviewHelper(false)
        }
      }),
      this.editor.onDidChangePath(() => {
        this.handler.setBasePath(this.getPath())
        this.emitter.emit('did-change-title')
      }),
      this.editor.onDidDestroy(() => {
        if (atomConfig().previewConfig.closePreviewWithEditor) {
          util.destroy(this)
        }
      }),
      this.editor.getBuffer().onDidSave(() => {
        if (!atomConfig().previewConfig.liveUpdate) {
          this.changeHandler()
        }
      }),
      this.editor.getBuffer().onDidReload(() => {
        if (!atomConfig().previewConfig.liveUpdate) {
          this.changeHandler()
        }
      }),
      atom.views.getView(this.editor).onDidChangeScrollTop(() => {
        if (!this.shouldScrollSync('editor')) return
        const [first, last] = this.editor.getVisibleRowRange()
        this.handler.scrollSync(
          this.editor.bufferRowForScreenRow(first),
          this.editor.bufferRowForScreenRow(last),
        )
      }),
      atom.commands.add(atom.views.getView(this.editor), {
        'markdown-preview-plus:sync-preview': () => {
          this.syncPreviewHelper(true)
        },
      }),
    )
  }

  private syncPreviewHelper(flash: boolean) {
    const pos = this.editor.getCursorBufferPosition().row
    this.syncPreview(pos, flash)
  }

  private shouldScrollSync(whatScrolled: 'editor' | 'preview') {
    const config = atomConfig().syncConfig
    if (config.syncEditorOnPreviewScroll && config.syncPreviewOnEditorScroll) {
      const item = whatScrolled === 'editor' ? this.editor : this
      const pane = atom.workspace.paneForItem(item)
      return pane && pane.isActive()
    } else {
      return (
        (config.syncEditorOnPreviewScroll && whatScrolled === 'preview') ||
        (config.syncPreviewOnEditorScroll && whatScrolled === 'editor')
      )
    }
  }
}
