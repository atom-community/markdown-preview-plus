import { TextEditor, Grammar, Range } from 'atom'
import { atomConfig, handlePromise } from '../../util'
import { MarkdownPreviewController } from './base'
import { SerializedMPV } from './serialized'

export class MarkdownPreviewControllerEditor extends MarkdownPreviewController {
  public readonly type = 'editor'

  constructor(private editor: TextEditor) {
    super()
    this.editor = editor
    handlePromise(this.handleEditorEvents())
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

  public async getMarkdownSource() {
    return this.editor.getText()
  }

  public getGrammar(): Grammar {
    return this.editor.getGrammar()
  }

  public onDidChange(callback: () => void) {
    return this.emitter.on('did-change', callback)
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
      const range = Range.fromObject([
        [min, 0],
        [max, 0],
      ])
      this.editor.scrollToScreenRange(
        this.editor.screenRangeForBufferRange(range),
        { center: false },
      )
    }
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

  private async handleEditorEvents() {
    this.disposables.add(
      atom.workspace.onDidChangeActiveTextEditor((ed) => {
        if (atomConfig().previewConfig.activatePreviewWithEditor) {
          if (ed === this.editor) {
            this.emitter.emit('activate', atom.workspace.paneForItem(ed))
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
        this.emitter.emit('did-change-path', this.getPath())
      }),
      this.editor.onDidDestroy(() => {
        this.destroy()
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
        this.emitter.emit('scroll-sync', [
          this.editor.bufferRowForScreenRow(first),
          this.editor.bufferRowForScreenRow(last),
        ])
      }),
      atom.commands.add(atom.views.getView(this.editor), {
        'markdown-preview-plus:sync-preview': () => {
          this.syncPreviewHelper(true)
        },
        'markdown-preview-plus:search-selection-in-preview': () => {
          const text = this.editor.getSelectedText()
          this.emitter.emit('search', text)
        },
      }),
    )
  }

  private changeHandler() {
    this.emitter.emit('did-change')
  }

  private syncPreviewHelper(flash: boolean) {
    const pos = this.editor.getCursorBufferPosition().row
    this.emitter.emit('sync', [pos, flash])
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
