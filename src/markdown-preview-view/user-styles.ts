import { Directory, CompositeDisposable, Disposable } from 'atom'
import * as path from 'path'
import * as fs from 'fs'

export class UserStylesManager {
  private static _instance?: UserStylesManager

  private configDir: Directory
  private numUsers = 0
  private disposables = new CompositeDisposable()
  private fileDisposables = new CompositeDisposable()
  private subscribers = new Set<() => void>()
  private files: string[] = []

  private constructor() {
    this.configDir = new Directory(
      path.join(atom.getConfigDirPath(), 'markdown-preview-plus'),
    )
    if (!this.configDir.existsSync()) {
      fs.mkdirSync(this.configDir.getPath())
    }
    this.disposables.add(
      this.fileDisposables,
      this.configDir.onDidChange(() => {
        this.didChangeDirContents()
      }),
    )
    this.files = this.getDirContents()
  }

  public static subscribe(callback: () => void) {
    const inst = UserStylesManager.instance()
    const disp = new CompositeDisposable()
    disp.add(inst, inst.subscribe(callback))
    return disp
  }

  public static getStyleFiles(context: 'pdf' | 'copy' | 'html' | 'live') {
    const inst = UserStylesManager._instance
    if (inst) {
      return inst.files.filter((file) => {
        const fileInfo = path.parse(file)
        const fileName = fileInfo.name.toLowerCase()
        const fileHasContext = fileName.match(/--[a-z]+$/) !== null
        const fileContextMatches =
          fileHasContext && fileName.endsWith(`--${context}`)
        return !fileHasContext || fileContextMatches
      })
    } else return []
  }

  private static instance() {
    if (UserStylesManager._instance === undefined) {
      UserStylesManager._instance = new UserStylesManager()
    }
    UserStylesManager._instance.numUsers += 1
    return UserStylesManager._instance
  }

  public dispose() {
    this.numUsers -= 1
    if (this.numUsers === 0) {
      this.disposables.dispose()
      UserStylesManager._instance = undefined
    }
  }

  private subscribe(callback: () => void) {
    this.subscribers.add(callback)
    return new Disposable(() => {
      this.subscribers.delete(callback)
    })
  }

  private didChangeDirContents() {
    this.files = this.getDirContents()
    this.notifySubscribers()
  }

  private getDirContents() {
    const entries = this.configDir.getEntriesSync()
    return entries
      .filter((entry) => {
        if (entry.isDirectory()) return false
        const filePath = entry.getPath().toLowerCase()
        return filePath.endsWith('.less') || filePath.endsWith('.css')
      })
      .map((file) => file.getPath())
  }

  private notifySubscribers() {
    for (const cb of this.subscribers.values()) {
      cb()
    }
  }
}
