import { Grammar, CompositeDisposable, Emitter, Pane } from 'atom'
import { SerializedMPV } from './serialized'

export abstract class MarkdownPreviewController {
  public abstract readonly type: 'editor' | 'file' | 'text'
  protected disposables = new CompositeDisposable()
  protected emitter = new Emitter<
    {
      'did-change': void
      'did-destroy': void
    },
    {
      activate: Pane | undefined
      'did-change-path': string | undefined
      'scroll-sync': [number, number]
      sync: [number, boolean]
      search: string
    }
  >()

  constructor() {
    this.disposables.add(this.emitter)
  }

  public destroy() {
    this.emitter.emit('did-destroy')
    this.disposables.dispose()
  }

  public abstract serialize(): SerializedMPV

  public abstract getTitle(): string

  public abstract getURI(): string

  public abstract getPath(): string | undefined

  public abstract getMarkdownSource(): Promise<string>

  public abstract getGrammar(): Grammar | undefined

  public onDidChange(callback: () => void) {
    return this.emitter.on('did-change', callback)
  }

  public onDidChangePath(callback: (path: string | undefined) => void) {
    return this.emitter.on('did-change-path', callback)
  }

  public onDidDestroy(callback: () => void) {
    return this.emitter.on('did-destroy', callback)
  }

  public onScrollSync(callback: (arg: [number, number]) => void) {
    return this.emitter.on('scroll-sync', callback)
  }

  public onSearch(callback: (arg: string) => void) {
    return this.emitter.on('search', callback)
  }

  public onSync(callback: (arg: [number, boolean]) => void) {
    return this.emitter.on('sync', callback)
  }

  public onActivate(callback: (arg: Pane | undefined) => void) {
    return this.emitter.on('activate', callback)
  }
}
