export type TDiffMethod = 'none' | 'heuristic' | 'myers'
export interface ChannelMap {
  style: { styles: string[] }
  'update-images': { oldsrc: string; v: number | undefined }
  sync: { line: number; flash: boolean }
  'update-preview': {
    id: number
    html: string
    renderLaTeX: boolean
    map?: { [line: number]: Array<{ tag: string; index: number }> }
    diffMethod: TDiffMethod
    scrollSyncParams?: ChannelMap['scroll-sync']
  }
  error: { msg: string }
  init: {
    userMacros: object
    mathJaxConfig: MathJaxConfig
  } & (
    | { context: 'live-preview' | 'copy-html' }
    | { context: 'pdf-export'; pdfExportOptions: { width: number } }
  )
  'set-native-keys': boolean
  'set-base-path': { path?: string }
  'scroll-sync': { firstLine: number; lastLine: number }
  'set-id': number
  // actual requests
  'get-tex-config': { id: number }
  'sync-source': { id: number }
  reload: { id: number }
  'get-selection': { id: number }
  'await-fully-ready': { id: number }
}
export interface ReplyMap {
  'atom-markdown-preview-plus-ipc-zoom-in': []
  'atom-markdown-preview-plus-ipc-zoom-out': []
  'atom-markdown-preview-plus-ipc-key': [
    KeyboardEventInit & { type: 'keydown' | 'keyup' },
  ]
  'atom-markdown-preview-plus-ipc-uncaught-error': [
    { message: string; name: string; stack?: string },
  ]
  'atom-markdown-preview-plus-ipc-did-scroll-preview': [
    { max: number; min: number },
  ]
  'atom-markdown-preview-plus-ipc-show-context-menu': []
  // actual replies
  'atom-markdown-preview-plus-ipc-request-reply': [
    RequestReplyType[keyof RequestReplyMap],
  ]
}
export interface RequestReplyMap {
  'update-preview': string
  'get-tex-config': MathJax.TeXInputProcessor
  reload: void
  'await-fully-ready': void
  'sync-source': number | undefined
  'get-selection': string | undefined
}
export type RequestReplyType = {
  [K in keyof RequestReplyMap]: {
    id: number
    request: K
    result: RequestReplyMap[K]
  }
}
export type ReplyMapEvents = {
  [K in keyof ReplyMap]: Electron.IpcMessageEventCustomFixed<K>
}
declare global {
  namespace Electron {
    interface IpcRenderer {
      on<T extends keyof ChannelMap>(
        channel: T,
        cb: (evt: Event, value: ChannelMap[T]) => void,
      ): IpcRenderer
      send<T extends keyof ReplyMap>(
        ch: T,
        id: number,
        ...args: ReplyMap[T]
      ): void
    }
    interface WebContents {
      send<T extends keyof ChannelMap>(channel: T, value: ChannelMap[T]): void
    }
  }

  type MathJaxRenderer = 'SVG' | 'HTML-CSS'

  interface MathJaxConfig {
    numberEquations: boolean
    texExtensions: string[]
    undefinedFamily: string
    latexRenderer: MathJaxRenderer
  }
}
