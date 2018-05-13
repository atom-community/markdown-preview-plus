import * as MarkdownIt from 'markdown-it'

declare interface ChannelMap {
  style: { styles: string[] }
  'update-images': { oldsrc: string; v: number | false }
  sync: { line: number }
  'use-github-style': { value: boolean }
  'update-preview': {
    html: string
    renderLaTeX: boolean
    mjrenderer: MathJaxRenderer
  }
  error: { msg: string }
  'set-atom-home': { home: string }
  'set-number-eqns': { numberEqns: boolean }
  'set-base-path': { path?: string }
  'set-source-map': {
    map: { [line: number]: Array<{ tag: string; index: number }> }
  }
  'get-text': void
  'get-html': void
  'get-uses-github-style': void
  'sync-source': void
  'scroll-sync': { firstLine: number; lastLine: number }
  reload: void
  // actual requests
  'get-html-svg': { id: number }
  'get-tex-config': { id: number }
}
declare interface ReplyMap {
  'zoom-in': void
  'zoom-out': void
  'open-source': { initialLine?: number }
  'did-scroll-preview': { max: number; min: number }
  reload: void
  // actual replies
  'request-reply': RequestReplyType[keyof RequestReplyMap]
}
declare interface RequestReplyMap {
  'get-html-svg': string | undefined
  'get-tex-config': MathJax.TeXInputProcessor
}
declare type RequestReplyType = {
  [K in keyof RequestReplyMap]: {
    id: number
    request: K
    result: RequestReplyMap[K]
  }
}
declare type ReplyMapEvents = {
  [K in keyof ReplyMap]: Electron.IpcMessageEventCustomFixed<K>
}
declare global {
  namespace Electron {
    interface IpcRenderer {
      on<T extends keyof ChannelMap>(
        channel: T,
        cb: (evt: Event, value: ChannelMap[T]) => void,
      ): IpcRenderer
      sendToHost<T extends keyof ReplyMap>(ch: T, arg: ReplyMap[T]): void
    }
    interface WebviewTag {
      send<T extends keyof ChannelMap>(channel: T, value: ChannelMap[T]): void
      addEventListener(
        s: 'ipc-message',
        h: (e: IpcMessageEventCustom) => void,
      ): void
    }
    type IpcMessageEventCustom = ReplyMapEvents[keyof ReplyMapEvents]
    type IpcMessageEventCustomFixed<T extends keyof ReplyMap> = {
      channel: T
      args: [ReplyMap[T]]
    }
  }

  type MathJaxRenderer = 'SVG' | 'HTML-CSS'
}
