import { CompositeDisposable, File } from 'atom'
import { isFileSync } from './util'

interface ImageRegisterRec {
  version: number
  watcher: CompositeDisposable
}

export class ImageWatcher {
  private registry = new Map<string, ImageRegisterRec>()
  private disposed = false
  private lastImages = new Set<string>()
  private tracked = false

  constructor(private callback: (src: string, version?: number) => void) {}

  public watch(image: string): number | undefined {
    if (this.tracked) this.lastImages.add(image)
    const i = this.registry.get(image)
    if (!i && isFileSync(image)) {
      const version = Date.now()
      const watcher = new CompositeDisposable()
      const af = new File(image)
      watcher.add(
        af.onDidChange(this.srcClosure(image, 'change')),
        af.onDidDelete(this.srcClosure(image, 'delete')),
        af.onDidRename(this.srcClosure(image, 'rename')),
      )
      this.registry.set(image, {
        version,
        watcher,
      })
      return version
    } else if (i) {
      return i.version
    } else {
      return undefined
    }
  }

  public track() {
    this.lastImages.clear()
    this.tracked = true
  }

  public untrack() {
    this.tracked = false
    const items = Array.from(this.registry.entries())
    for (const [k, v] of items) {
      if (!this.lastImages.has(k)) {
        v.watcher.dispose()
        this.registry.delete(k)
      }
    }
    this.lastImages.clear()
  }

  public dispose(): void {
    if (this.disposed) return
    this.clear()
    this.disposed = true
  }

  private clear(): void {
    for (const v of this.registry.values()) {
      v.watcher.dispose()
    }
    this.registry.clear()
  }

  private srcClosure(src: string, event: 'change' | 'delete' | 'rename') {
    return () => {
      const i = this.registry.get(src)
      if (!i) return
      if (event === 'change' && isFileSync(src)) {
        i.version = Date.now()
        this.refreshImages(src, i.version)
      } else {
        i.watcher.dispose()
        this.registry.delete(src)
        this.refreshImages(src)
      }
    }
  }

  private refreshImages(src: string, version?: number) {
    if (this.disposed) return
    this.callback(src, version)
  }
}
