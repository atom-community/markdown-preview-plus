import { TextEditor, Grammar } from 'atom'
import * as util from './util'
import { MarkdownPreviewView, SerializedMPV } from './markdown-preview-view'
import { handlePromise } from '../util'
import {
  EventHandler,
  IPCCaller,
  shouldScrollSync,
  RemoteEditorServer,
} from './ipc'
import { remote } from 'electron'

export class MarkdownPreviewViewEditorRemote extends MarkdownPreviewView {
  private text = ''
  private title: string = '<Pending>'
  private path?: string
  private grammar?: Grammar
  private ipc: IPCCaller

  constructor(private windowId: number, private editorId: number) {
    super()
    this.ipc = new IPCCaller(windowId, editorId)
    this.disposables.add(this.ipc)
    this.handleEditorEvents()
    this.ipc
      .init()
      .then((v) => {
        this.text = v.text
        this.path = v.path
        this.grammar = atom.grammars.grammarForScopeName(v.grammar)
        this.title = v.title
        this.emitter.emit('did-change-title')
        this.changeHandler()
      })
      .catch((e: Error) => {
        atom.notifications.addError('Failed to open preview', {
          dismissable: true,
          detail: e.toString(),
          stack: e.stack,
        })
      })
  }

  public static open(editor: TextEditor) {
    const windowId = remote.getCurrentWindow().id
    const editorId = editor.id
    atom.open({
      pathsToOpen: [
        `markdown-preview-plus://remote-editor/${windowId}/${editorId}`,
      ],
      newWindow: true,
    })
    RemoteEditorServer.create(editor)
  }

  public destroy() {
    this.ipc.destroy().catch(ignore)
    super.destroy()
  }

  public getTitle() {
    return `${this.title} Preview`
  }

  public getURI() {
    return `markdown-preview-plus://remote-editor/${this.windowId}/${this.editorId}`
  }

  public getPath() {
    return this.path
  }

  public serialize(): SerializedMPV {
    return undefined as any
  }

  protected openNewWindow() {
    atom.open({
      pathsToOpen: [this.getURI()],
      newWindow: true,
    })
    util.destroy(this)
  }

  protected async getMarkdownSource() {
    return this.text
  }

  protected getGrammar(): Grammar | undefined {
    return this.grammar
  }

  protected didScrollPreview(min: number, max: number) {
    if (!shouldScrollSync('preview')) return
    this.ipc.scrollToBufferRange([min, max]).catch(ignore)
  }

  protected openSource(initialLine?: number) {
    this.ipc.openSource(initialLine).catch((e) => {
      console.error(e)
      const path = this.getPath()
      if (path) {
        handlePromise(
          atom.workspace.open(path, {
            initialLine,
          }),
        )
      } else {
        atom.notifications.addWarning(
          'Failed to sync source: no editor and no path',
        )
      }
    })
  }

  private handleEditorEvents() {
    this.disposables.add(
      new EventHandler(this.windowId, this.editorId, {
        changeText: (text) => {
          this.text = text
          this.changeHandler()
        },
        syncPreview: ({ pos, flash }) => {
          this.syncPreview(pos, flash)
        },
        changePath: ({ title, path }) => {
          this.title = title
          this.path = path
          this.emitter.emit('did-change-title')
        },
        changeGrammar: (grammarName) => {
          this.grammar = atom.grammars.grammarForScopeName(grammarName)!
          this.emitter.emit('did-change-title')
        },
        destroy: () => {
          util.destroy(this)
        },
        scrollSync: ([firstLine, lastLine]) => {
          this.handler.scrollSync(firstLine, lastLine)
        },
      }),
    )
  }
}

function ignore() {
  /* do notihng */
}
