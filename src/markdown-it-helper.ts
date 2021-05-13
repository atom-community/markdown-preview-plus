import { atomConfig, packagePath } from './util'
import path from 'path'
import { ConfigValues, CompositeDisposable, File } from 'atom'
import { MessageFromWorker, MessageToWorker } from '../src-worker/ipc'

const pandocConfig = {
  useLazyHeaders: true,
  useCheckBoxes: true,
  useToc: false,
  useEmoji: false,
  breakOnSingleNewline: false,
  typographicReplacements: true,
  useCriticMarkup: false,
  useFootnote: true,
  useImsize: false,
  inlineMathSeparators: ['$', '$'],
  blockMathSeparators: ['$$', '$$'],
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
} as ConfigValues['markdown-preview-plus.markdownItConfig']

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
  private readonly workerPath: string
  private worker: MyWorker
  private requestId = 0
  private readonly replyCallbacks = new Map<
    number,
    {
      resolve: (
        result: Extract<MessageFromWorker, { result: any }>['result'],
      ) => void
      reject: (e: Error) => void
    }
  >()
  private disposables = new CompositeDisposable()
  private constructor() {
    this.workerPath = path.join(packagePath(), 'dist', 'worker', 'main.js')
    this.worker = this.initWorker()
    if (atom.inDevMode()) {
      const fileWatcher = new File(this.workerPath)
      this.disposables.add(
        fileWatcher.onDidChange(() => {
          this.teardownWorker()
          this.worker = this.initWorker()
          this.configure(
            atom.config.get('markdown-preview-plus.markdownItConfig'),
          )
        }),
      )
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
      MarkdownItWorker._instance.teardownWorker()
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

  private initWorker() {
    const worker = new Worker(this.workerPath)
    worker.onmessage = (evt: MyMessageEvent) => {
      if ('id' in evt.data) {
        const cb = this.replyCallbacks.get(evt.data.id)
        if (cb) cb.resolve(evt.data.result)
      } else if ('evt' in evt.data) {
        switch (evt.data.evt) {
          case 'odd-separators':
            warnOddSeparators(evt.data.arr, evt.data.option)
        }
      }
    }
    return worker
  }
  private teardownWorker() {
    this.worker.onmessage = null
    this.worker.terminate()
    for (const { reject } of Array.from(this.replyCallbacks.values())) {
      reject(new Error('Worker terminated'))
    }
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
    const result = new Promise<any>((resolve, reject) => {
      this.replyCallbacks.set(id, {
        resolve: (result: any) => {
          this.replyCallbacks.delete(id)
          resolve(result)
        },
        reject: (e: Error) => {
          this.replyCallbacks.delete(id)
          reject(e)
        },
      })
    })
    const newargs = Object.assign({ id }, cmd)
    this.worker.postMessage(newargs)
    return result
  }
}
