import { TextEditor, Grammar } from 'atom'
import * as util from './util'
import { MarkdownPreviewView, SerializedMPV } from './markdown-preview-view'
import { handlePromise } from '../util'
import { EventHandler, IPCCaller, shouldScrollSync, setupEditor } from './ipc'
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
    this.handleEditorEvents()
    handlePromise(
      this.ipc.init().then((v) => {
        this.text = v.text
        this.path = v.path
        this.grammar = atom.grammars.grammarForScopeName(v.grammar)!
        this.title = v.title
        this.emitter.emit('did-change-title')
        this.changeHandler()
      }),
    )
  }

  public static open(editor: TextEditor) {
    const windowId = remote.getCurrentWindow().id
    const editorId = editor.id
    atom.open({
      pathsToOpen: [
        `markdown-preview-plus://remote-editor/${windowId}/${editorId}`,
      ],
    })
    setupEditor(editor)
  }

  public destroy() {
    handlePromise(this.ipc.destroy())
    this.ipc.dispose()
    super.destroy()
  }

  public getTitle() {
    return `${this.title} Preview`
  }

  public getURI() {
    return `markdown-preview-plus://remote-editor/${this.windowId}/${
      this.editorId
    }`
  }

  public getPath() {
    return this.path
  }

  public serialize(): SerializedMPV {
    return undefined as any
  }

  protected async getMarkdownSource() {
    return this.text
  }

  protected getGrammar(): Grammar | undefined {
    return this.grammar
  }

  protected async didScrollPreview(min: number, max: number) {
    if (!shouldScrollSync('preview')) return
    await this.ipc.scrollToBufferRange([min, max])
  }

  protected openSource(initialLine?: number) {
    handlePromise(this.ipc.openSource(initialLine))
  }

  private handleEditorEvents() {
    this.disposables.add(
      new EventHandler(this.windowId, this.editorId, {
        changeText: (text) => {
          this.text = text
          this.changeHandler()
        },
        syncPreview: (pos) => {
          this.syncPreview(pos)
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
          this.element.send<'scroll-sync'>('scroll-sync', {
            firstLine,
            lastLine,
          })
        },
      }),
    )
  }
}
