import { ConfigValues } from 'atom'

export type MessageToWorker =
  | {
      cmd: 'config'
      arg: ConfigValues['markdown-preview-plus.markdownItConfig']
    }
  | { cmd: 'render'; text: string; rL: boolean; id: number }
  | { cmd: 'getTokens'; text: string; rL: boolean; id: number }

export type MessageFromWorker =
  | { evt: 'odd-separators'; arr: unknown[]; option: string }
  | { cmd: 'getTokens'; id: number; result: string }
  | { cmd: 'render'; id: number; result: string }
