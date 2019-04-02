import { TextEditor, CompositeDisposable, Range } from 'atom'
import { remote } from 'electron'
import { RequestHandler } from './request-handler'
import { atomConfig } from '../../util'
import { shouldScrollSync } from './should-scroll-sync'
import { IPCEvents } from './event-handler'

/* NOTE: Weird reference counting and WeakMap are here because
 * there can be in theory multiple windows with
 * MarkdownPreviewViewEditorRemote referencing the same
 * editor by windowId/editorId, which would lead to
 * multiple triggers if new "server" would be created for every new
 * preview instance;
 * Weird deferred disposal is here because new-window executed on
 * MarkdownPreviewViewEditorRemote will first destroy the current
 * instance, and only then, after a new Atom window initializes,
 * will create a new one. Which might easily take tens of seconds.
 * What makes this even more complicated, there is no sane way to
 * create a new instance of RemoteEditorServer remotely; hence,
 * it waits just in case new clients appear before disposing of itself.
 */

export class RemoteEditorServer {
  private static editorMap = new WeakMap<TextEditor, RemoteEditorServer>()
  private readonly disposables = new CompositeDisposable()
  private readonly windowId = remote.getCurrentWindow().id
  private readonly destroyTimeoutLength = 60000
  private usageCounter = 0
  private destroyTimeout: number | undefined
  private eventHandlers = {
    scrollToBufferRange: ([min, max]: [number, number]) => {
      if (min === 0) {
        this.editor.scrollToBufferPosition([min, 0])
      } else if (max >= this.editor.getLastBufferRow() - 1) {
        this.editor.scrollToBufferPosition([max, 0])
      } else {
        const range = Range.fromObject([[min, 0], [max, 0]])
        this.editor.scrollToScreenRange(
          this.editor.screenRangeForBufferRange(range),
          {
            center: false,
          },
        )
      }
    },
    destroy: () => {
      this.usageCounter -= 1
      if (this.usageCounter <= 0) {
        this.resetTimeout()
        this.destroyTimeout = window.setTimeout(() => {
          this.destroy()
        }, this.destroyTimeoutLength)
      }
    },
    init: () => {
      this.usageCounter += 1
      this.resetTimeout()
      return {
        path: this.editor.getPath(),
        title: this.editor.getTitle(),
        grammar: this.editor.getGrammar().scopeName,
        text: this.editor.getText(),
      }
    },
    openSource: (row?: number) => {
      if (row !== undefined) {
        this.editor.setCursorBufferPosition([row, 0])
      }
      remote.getCurrentWindow().focus()
      const pane = atom.workspace.paneForItem(this.editor)
      if (!pane) return
      pane.activateItem(this.editor)
      pane.activate()
    },
  }

  private constructor(private readonly editor: TextEditor) {
    this.disposables.add(
      new RequestHandler(this.windowId, editor.id, this.eventHandlers),
    )
    this.handleEditorEvents()
  }

  public static create(editor: TextEditor) {
    const res = RemoteEditorServer.editorMap.get(editor)
    if (res) return res
    const newRes = new RemoteEditorServer(editor)
    RemoteEditorServer.editorMap.set(editor, newRes)
    return newRes
  }

  private destroy() {
    RemoteEditorServer.editorMap.delete(this.editor)
    this.disposables.dispose()
  }

  private resetTimeout() {
    if (this.destroyTimeout !== undefined) {
      window.clearTimeout(this.destroyTimeout)
      this.destroyTimeout = undefined
    }
  }

  private handleEditorEvents() {
    this.disposables.add(
      this.editor.getBuffer().onDidStopChanging(() => {
        if (atomConfig().previewConfig.liveUpdate) {
          this.emit('changeText', this.editor.getText())
        }
        if (atomConfig().syncConfig.syncPreviewOnChange) {
          this.emit('syncPreview', {
            pos: this.editor.getCursorBufferPosition().row,
            flash: false,
          })
        }
      }),
      this.editor.onDidChangePath(() => {
        this.emit('changePath', {
          path: this.editor.getPath(),
          title: this.editor.getTitle(),
        })
      }),
      this.editor.onDidChangeGrammar((grammar) => {
        this.emit('changeGrammar', grammar.scopeName)
      }),
      this.editor.onDidDestroy(() => {
        this.destroy()
        if (atomConfig().previewConfig.closePreviewWithEditor) {
          this.emit('destroy', undefined)
        }
      }),
      this.editor.getBuffer().onDidSave(() => {
        if (!atomConfig().previewConfig.liveUpdate) {
          this.emit('changeText', this.editor.getText())
        }
      }),
      this.editor.getBuffer().onDidReload(() => {
        if (!atomConfig().previewConfig.liveUpdate) {
          this.emit('changeText', this.editor.getText())
        }
      }),
      atom.views.getView(this.editor).onDidChangeScrollTop(() => {
        if (!shouldScrollSync('editor')) return
        const [first, last] = this.editor.getVisibleRowRange()
        const firstLine = this.editor.bufferRowForScreenRow(first)
        const lastLine = this.editor.bufferRowForScreenRow(last)
        this.emit('scrollSync', [firstLine, lastLine])
      }),
      atom.commands.add(atom.views.getView(this.editor), {
        'markdown-preview-plus:sync-preview': () => {
          this.emit('syncPreview', {
            pos: this.editor.getCursorBufferPosition().row,
            flash: true,
          })
        },
      }),
    )
  }

  private emit<T extends keyof IPCEvents>(event: T, arg: IPCEvents[T]) {
    remote.ipcMain.emit('markdown-preview-plus:editor-event', {
      editorId: this.editor.id,
      windowId: this.windowId,
      event,
      arg,
    })
  }
}
