import { IPCCmd, Arg } from './request-handler'
import { remote } from 'electron'

export type IPCCmdPromise = {
  [K in keyof IPCCmd]: IPCCmd[K] extends (arg: infer A) => infer R
    ? (arg: A) => Promise<R>
    : never
}

export class IPCCaller implements IPCCmdPromise {
  private ipcIdx = 0
  private myWindowId = remote.getCurrentWindow().id
  constructor(private windowId: number, private editorId: number) {}
  public async scrollToBufferRange(arg: [number, number]) {
    return this.ipc('scrollToBufferRange', arg)
  }
  public async destroy() {
    return this.ipc('destroy', undefined)
  }
  public async init() {
    return this.ipc('init', undefined)
  }
  public async openSource(arg?: number) {
    return this.ipc('openSource', arg)
  }
  public dispose() {
    // TODO
  }
  private async ipc<T extends keyof IPCCmd>(
    cmd: T,
    args: Arg<IPCCmd[T]>,
  ): Promise<ReturnType<IPCCmd[T]>> {
    return new Promise<any>((resolve, reject) => {
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
            'markdown-preview-plus:editor-reply',
            handler,
          )
          resolve(e.reply)
        }
      }
      const res = remote.ipcMain.emit('markdown-preview-plus:editor-request', {
        windowId: this.windowId,
        editorId: this.editorId,
        forWindowId: this.myWindowId,
        idx,
        cmd,
        args,
      })
      if (!res) {
        reject(new Error('Nobody is listening for editor requests'))
        return
      } // otherwise,
      remote.ipcMain.on('markdown-preview-plus:editor-reply', handler)
    })
  }
}
