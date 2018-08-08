import { remote } from 'electron'

export interface IPCEvents {
  syncPreview: { pos: number; flash: boolean }
  scrollSync: [number, number]
  destroy: void
  changeGrammar: string
  changePath: { title: string; path: string | undefined }
  changeText: string
}

export type IPCEventHandler = {
  [K in keyof IPCEvents]: (arg: IPCEvents[K]) => void
}

export type EditorEvent<T extends keyof IPCEvents> = {
  editorId: number
  windowId: number
  event: T
  arg: IPCEvents[T]
}

export class EventHandler {
  constructor(
    private readonly windowId: number,
    private readonly editorId: number,
    private readonly handlers: Readonly<IPCEventHandler>,
  ) {
    remote.ipcMain.on('markdown-preview-plus:editor-event', this.handler)
  }

  public dispose() {
    remote.ipcMain.removeListener(
      'markdown-preview-plus:editor-event',
      this.handler,
    )
  }

  private handler = (e: EditorEvent<keyof IPCEvents>) => {
    if (this.editorId !== e.editorId || this.windowId !== e.windowId) return
    const handler = this.handlers[e.event] as Function
    handler(e.arg)
  }
}
