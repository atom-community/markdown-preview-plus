import { remote } from 'electron'

export interface IPCCmd {
  scrollToBufferRange: (arg: [number, number]) => void
  destroy: (arg: void) => void
  init: (
    arg: void,
  ) => {
    text: string
    title: string
    grammar: string
    path: string | undefined
  }
  openSource: (arg?: number) => void
}

export type EventFor = {
  [K in keyof IPCCmd]: {
    editorId: number
    windowId: number
    forWindowId: number
    idx: number
    cmd: K
    args: Arg<IPCCmd[K]>
  }
}

export type Arg<T extends (arg: any) => any> = T extends (arg: infer U) => any
  ? U
  : never

export class RequestHandler {
  constructor(
    private readonly windowId: number,
    private readonly editorId: number,
    private readonly handlers: IPCCmd,
  ) {
    remote.ipcMain.on(
      'markdown-preview-plus:editor-request',
      this.handleRequest,
    )
  }

  public dispose() {
    remote.ipcMain.removeListener(
      'markdown-preview-plus:editor-request',
      this.handleRequest,
    )
  }

  public handleRequest = (e: EventFor[keyof IPCCmd]) => {
    if (e.editorId !== this.editorId || e.windowId !== this.windowId) return
    const func = this.handlers[e.cmd] as Function
    const reply = func(e.args)
    remote.ipcMain.emit('markdown-preview-plus:editor-reply', {
      editorId: e.editorId,
      windowId: e.windowId,
      forWindowId: e.forWindowId,
      idx: e.idx,
      reply,
    })
  }
}
