import {
  TextEditor,
  Grammar,
  Range,
  Disposable,
  CompositeDisposable,
} from 'atom'
import * as util from './util'
import { MarkdownPreviewView, SerializedMPV } from './markdown-preview-view'
import { handlePromise, atomConfig } from '../util'
import { remote } from 'electron'

export class MarkdownPreviewViewEditorRemote extends MarkdownPreviewView {
  private ipcIdx = 0
  private myWindowId: number
  private title: string = '<Pending>'
  private path?: string
  private grammar?: Grammar

  constructor(private windowId: number, private editorId: number) {
    super()
    this.handleEditorEvents()
    this.myWindowId = remote.getCurrentWindow().id
    handlePromise(this.ipc('init', undefined))
  }

  public destroy() {
    handlePromise(this.ipc('destroy', undefined))
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
    return this.ipc('getText', undefined)
  }

  protected getGrammar(): Grammar | undefined {
    return this.grammar
  }

  protected async didScrollPreview(min: number, max: number) {
    if (!this.shouldScrollSync('preview')) return
    if (min === 0) {
      await this.ipc('scrollToBufferRow', min)
    } else if (max >= (await this.ipc('getLastBufferRow', undefined)) - 1) {
      await this.ipc('scrollToBufferRow', max)
    } else {
      await this.ipc('scrollToBufferRange', [min, max])
    }
  }

  protected openSource(initialLine?: number) {
    handlePromise(this.ipc('openSource', initialLine))
  }

  private handleEditorEvents() {
    this.disposables.add(
      this.ipcEvent('onDidStopChanging', () => {
        if (atomConfig().previewConfig.liveUpdate) {
          this.changeHandler()
        }
        if (atomConfig().syncConfig.syncPreviewOnChange) {
          handlePromise(this.syncPreviewHelper())
        }
      }),
      this.ipcEvent('onDidChangePath', ({ title, path }) => {
        this.title = title
        this.path = path
        this.emitter.emit('did-change-title')
      }),
      this.ipcEvent('onDidChangeGrammar', (grammarName) => {
        this.grammar = atom.grammars.grammarForScopeName(grammarName)!
        this.emitter.emit('did-change-title')
      }),
      this.ipcEvent('onDidDestroy', () => {
        if (atomConfig().previewConfig.closePreviewWithEditor) {
          util.destroy(this)
        }
      }),
      this.ipcEvent('onDidSave', () => {
        if (!atomConfig().previewConfig.liveUpdate) {
          this.changeHandler()
        }
      }),
      this.ipcEvent('onDidReload', () => {
        if (!atomConfig().previewConfig.liveUpdate) {
          this.changeHandler()
        }
      }),
      this.ipcEvent(
        'onDidChangeScrollTop',
        (bufferRowRange: [number, number]) => {
          if (!this.shouldScrollSync('editor')) return
          const [first, last] = bufferRowRange
          this.element.send<'scroll-sync'>('scroll-sync', {
            firstLine: first,
            lastLine: last,
          })
        },
      ),
      this.ipcEvent('syncPreview', this.syncPreviewHelper),
    )
  }

  private syncPreviewHelper = async () => {
    const pos = await this.ipc('getCursorBufferRow', undefined)
    this.syncPreview(pos)
  }

  private shouldScrollSync(whatScrolled: 'editor' | 'preview') {
    const config = atomConfig().syncConfig
    if (config.syncEditorOnPreviewScroll && config.syncPreviewOnEditorScroll) {
      return (
        (whatScrolled === 'preview') === remote.getCurrentWindow().isFocused()
      )
    } else {
      return (
        (config.syncEditorOnPreviewScroll && whatScrolled === 'preview') ||
        (config.syncPreviewOnEditorScroll && whatScrolled === 'editor')
      )
    }
  }

  private async ipc<T extends keyof IPCCmd>(
    cmd: T,
    args: Arg<IPCCmd[T]>,
  ): Promise<ReturnType<IPCCmd[T]>> {
    return new Promise<any>((resolve) => {
      const idx = this.ipcIdx++
      const handler = (e: {
        editorId: number
        windowId: number
        forWindowId: number
        idx: number
        reply: any
      }) => {
        if (
          e.forWindowId === this.myWindowId &&
          e.windowId === this.windowId &&
          e.editorId === this.editorId &&
          e.idx === idx
        ) {
          remote.ipcMain.removeListener(
            'markdown-preview-plus-editor-reply',
            handler,
          )
          resolve(e.reply)
        }
      }
      remote.ipcMain.on('markdown-preview-plus-editor-reply', handler)
      remote.ipcMain.emit('markdown-preview-plus-editor-request', {
        windowId: this.windowId,
        editorId: this.editorId,
        forWindowId: this.myWindowId,
        idx,
        cmd,
        args,
      })
    })
  }

  private ipcEvent<T extends keyof IPCEvents>(
    name: T,
    callback: (arg: IPCEvents[T]) => void,
  ): Disposable {
    const handler = (e: {
      editorId: number
      windowId: number
      event: string
      arg: IPCEvents[T]
    }) => {
      if (
        this.editorId === e.editorId &&
        this.windowId === e.windowId &&
        name === e.event
      ) {
        callback(e.arg)
      }
    }
    remote.ipcMain.on('markdown-preview-plus-editor-event', handler)
    return new Disposable(function() {
      remote.ipcMain.removeListener(
        'markdown-preview-plus-editor-event',
        handler,
      )
    })
  }

  // tslint:disable-next-line:member-ordering
  public static setupEditor(editor: TextEditor): CompositeDisposable {
    const disp = new CompositeDisposable()
    const windowId = remote.getCurrentWindow().id
    const editorId = editor.id
    function emit<T extends keyof IPCEvents>(event: T, arg: IPCEvents[T]) {
      remote.ipcMain.emit('markdown-preview-plus-editor-event', {
        editorId,
        windowId,
        event,
        arg,
      })
    }
    function requestHandler(e: EventFor[keyof IPCCmd]) {
      if (e.editorId !== editorId || e.windowId !== windowId) return
      let reply: any = undefined
      switch (e.cmd) {
        case 'getCursorBufferRow':
          reply = editor.getCursorBufferPosition().row as ReturnType<
            IPCCmd[typeof e.cmd]
          >
          break
        case 'scrollToBufferRange':
          const [min, max] = e.args
          const range = Range.fromObject([[min, 0], [max, 0]])
          editor.scrollToScreenRange(editor.screenRangeForBufferRange(range), {
            center: false,
          })
          reply = undefined as ReturnType<IPCCmd[typeof e.cmd]>
          break
        case 'scrollToBufferRow':
          editor.scrollToBufferPosition([e.args, 0])
          reply = undefined as ReturnType<IPCCmd[typeof e.cmd]>
          break
        case 'getLastBufferRow':
          reply = editor.getLastBufferRow() as ReturnType<IPCCmd[typeof e.cmd]>
          break
        case 'getText':
          reply = editor.getText() as ReturnType<IPCCmd[typeof e.cmd]>
          break
        case 'destroy':
          disp.dispose()
          reply = undefined as ReturnType<IPCCmd[typeof e.cmd]>
          break
        case 'init':
          emit('onDidChangePath', {
            path: editor.getPath(),
            title: editor.getTitle(),
          })
          emit('onDidChangeGrammar', editor.getGrammar().scopeName)
          break
        case 'openSource':
          if (e.args !== undefined) {
            editor.setCursorBufferPosition([e.args, 0])
          }
          remote.getCurrentWindow().focus()
          const pane = atom.workspace.paneForItem(editor)
          if (!pane) break
          pane.activateItem(editor)
          pane.activate()
          break
      }
      remote.ipcMain.emit('markdown-preview-plus-editor-reply', {
        editorId: e.editorId,
        windowId: e.windowId,
        forWindowId: e.forWindowId,
        idx: e.idx,
        reply,
      })
    }
    remote.ipcMain.on('markdown-preview-plus-editor-request', requestHandler)
    disp.add(
      editor.getBuffer().onDidStopChanging(() => {
        emit('onDidStopChanging', undefined)
      }),
      editor.onDidChangePath(() => {
        emit('onDidChangePath', {
          path: editor.getPath(),
          title: editor.getTitle(),
        })
      }),
      editor.onDidChangeGrammar((grammar) => {
        emit('onDidChangeGrammar', grammar.scopeName)
      }),
      editor.onDidDestroy(() => {
        emit('onDidDestroy', undefined)
      }),
      editor.getBuffer().onDidSave(() => {
        emit('onDidSave', undefined)
      }),
      editor.getBuffer().onDidReload(() => {
        emit('onDidReload', undefined)
      }),
      atom.views.getView(editor).onDidChangeScrollTop(() => {
        const [first, last] = editor.getVisibleRowRange()
        const firstLine = editor.bufferRowForScreenRow(first)
        const lastLine = editor.bufferRowForScreenRow(last)
        emit('onDidChangeScrollTop', [firstLine, lastLine])
      }),
      atom.commands.add(atom.views.getView(editor), {
        'markdown-preview-plus:sync-preview': () => {
          emit('syncPreview', undefined)
        },
      }),
      new Disposable(() => {
        remote.ipcMain.removeListener(
          'markdown-preview-plus-editor-request',
          requestHandler,
        )
      }),
    )
    return disp
  }
}

type Arg<T extends (arg: any) => any> = T extends (arg: infer U) => any
  ? U
  : never

type EventFor = {
  [K in keyof IPCCmd]: {
    editorId: number
    windowId: number
    forWindowId: number
    idx: number
    cmd: K
    args: Arg<IPCCmd[K]>
  }
}

export interface IPCCmd {
  getCursorBufferRow: (arg: void) => number
  scrollToBufferRange: (arg: [number, number]) => void
  scrollToBufferRow: (arg: number) => void
  getLastBufferRow: (arg: void) => number
  getText: (arg: void) => string
  destroy: (arg: void) => void
  init: (arg: void) => void
  openSource: (arg?: number) => void
}

export interface IPCEvents {
  syncPreview: void
  onDidChangeScrollTop: [number, number]
  onDidReload: void
  onDidSave: void
  onDidStopChanging: void
  onDidDestroy: void
  onDidChangeGrammar: string
  onDidChangePath: { title: string; path: string | undefined }
}
