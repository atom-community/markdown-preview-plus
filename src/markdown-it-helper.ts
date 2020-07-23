import { atomConfig, packagePath } from './util'
import path from 'path'
import { ConfigValues, CompositeDisposable } from 'atom'

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

export class MarkdownItWorker {
  private static _instance: MarkdownItWorker | undefined
  private worker = new Worker(path.join(packagePath(), 'dist', 'worker.js'))
  private requestId = 0
  private readonly replyCallbacks = new Map<number, any>()
  private disposables = new CompositeDisposable()
  private constructor() {
    this.worker.onmessage = (evt) => {
      // tslint:disable:no-unsafe-any
      if ('id' in evt.data) {
        const cb = this.replyCallbacks.get(evt.data.id)
        if (cb) cb(evt.data.result)
      }
      // tslint:enable:no-unsafe-any
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
  public static instance() {
    if (!MarkdownItWorker._instance) {
      MarkdownItWorker._instance = new MarkdownItWorker()
    }
    return MarkdownItWorker._instance
  }
  public static destroy() {
    if (MarkdownItWorker._instance) {
      MarkdownItWorker._instance.worker.terminate()
      MarkdownItWorker._instance.disposables.dispose()
      MarkdownItWorker._instance = undefined
    }
  }
  public configure(
    config: ConfigValues['markdown-preview-plus.markdownItConfig'],
  ) {
    this.worker.postMessage({ cmd: 'config', arg: config })
  }
  public async render(text: string, rL: boolean): Promise<string> {
    return this.request({ cmd: 'render', text, rL })
  }
  public async getTokens(text: string, rL: boolean): Promise<string> {
    return this.request({ cmd: 'getTokens', text, rL })
  }
  private async request(cmd: any) {
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
