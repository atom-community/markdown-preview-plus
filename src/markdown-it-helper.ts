import { atomConfig, packagePath } from './util'
import path from 'path'
import { ConfigValues, CompositeDisposable } from 'atom'
import { MessageFromWorker, MessageToWorker } from '../src-worker/ipc'

const pandocConfig = {
  useLazyHeaders: true,
  useCheckBoxes: true,
  useToc: false,
  useEmoji: false,
  breakOnSingleNewline: false,
  useCriticMarkup: false,
  useFootnote: true,
  useImsize: false,
  inlineMathSeparators: ['$', '$'],
  blockMathSeparators: ['$$', '$$'],
  forceFullToc: false,
  tocDepth: 0,
  useAttributes: true,
  useSpans: true,
  useDivs: true,
  useDeflist: true,
  useFontmatter: true,
  useImplicitFigures: true,
  useSubscript: true,
  useSuperscript: true,
  parseDisplayMathInline: true,
  tableCaptions: true,
}

function warnOddSeparators(arr: unknown[], option: string): void {
  atom.notifications.addWarning(
    `Invalid math delimiter configuration${option ? `in ${option}` : ''}`,
    {
      detail: `Expected even number of elements, but got "${arr.join(', ')}"`,
      dismissable: true,
    },
  )
}

type MyMessageEvent = Omit<MessageEvent, 'data'> & { data: MessageFromWorker }
type PostMessageT = Worker['postMessage']
type Params = PostMessageT extends (a: any, ...args: infer P) => any ? P : never
type MyPostMessageT = (
  message: MessageToWorker,
  ...args: Params
) => ReturnType<PostMessageT>
type MyWorker = Omit<Worker, 'postMessage'> & { postMessage: MyPostMessageT }

export class MarkdownItWorker {
  private static _instance: MarkdownItWorker | undefined
  private worker: MyWorker = new Worker(
    path.join(packagePath(), 'dist', 'worker.js'),
  )
  private requestId = 0
  private readonly replyCallbacks = new Map<
    number,
    (result: Extract<MessageFromWorker, { result: any }>['result']) => void
  >()
  private disposables = new CompositeDisposable()
  private constructor() {
    this.worker.onmessage = (evt: MyMessageEvent) => {
      if ('id' in evt.data) {
        const cb = this.replyCallbacks.get(evt.data.id)
        if (cb) cb(evt.data.result)
      } else if ('evt' in evt.data) {
        switch (evt.data.evt) {
          case 'odd-separators':
            warnOddSeparators(evt.data.arr, evt.data.option)
        }
      }
    }

    this.disposables.add(
      atom.config.onDidChange(
        'markdown-preview-plus.renderer',
        ({ newValue }) => {
          if (newValue === 'pandoc') this.configure(pandocConfig)
          else this.configure(atomConfig().markdownItConfig)
        },
      ),
      atom.config.observe('markdown-preview-plus.markdownItConfig', (value) => {
        if (atomConfig().renderer === 'markdown-it') {
          this.configure(value)
        }
      }),
    )
  }
  public static destroy() {
    if (MarkdownItWorker._instance) {
      MarkdownItWorker._instance.worker.terminate()
      MarkdownItWorker._instance.disposables.dispose()
      MarkdownItWorker._instance = undefined
    }
  }
  public static async render(text: string, rL: boolean): Promise<string> {
    return MarkdownItWorker.instance().request({ cmd: 'render', text, rL })
  }
  public static async getTokens(text: string, rL: boolean): Promise<string> {
    return MarkdownItWorker.instance().request({ cmd: 'getTokens', text, rL })
  }

  private static instance() {
    if (!MarkdownItWorker._instance) {
      MarkdownItWorker._instance = new MarkdownItWorker()
    }
    return MarkdownItWorker._instance
  }

  private configure(
    config: ConfigValues['markdown-preview-plus.markdownItConfig'],
  ) {
    this.worker.postMessage({ cmd: 'config', arg: config })
  }
  private async request(
    cmd: Omit<Extract<MessageToWorker, { id: number }>, 'id'>,
  ) {
    const id = this.requestId++
    const result = new Promise<any>((resolve) => {
      this.replyCallbacks.set(id, (result: any) => {
        this.replyCallbacks.delete(id)
        resolve(result)
      })
    })
    const newargs = Object.assign({ id }, cmd)
    this.worker.postMessage(newargs)
    return result
  }
}
