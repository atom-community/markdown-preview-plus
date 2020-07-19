import * as path from 'path'
import { File } from 'atom'
import { SerializedMPV } from './serialized'
import { MarkdownPreviewController } from './base'

export class MarkdownPreviewControllerFile extends MarkdownPreviewController {
  public readonly type = 'file'
  private file: File

  constructor(filePath: string) {
    super()
    this.file = new File(filePath)
    this.disposables.add(
      this.file.onDidChange(() => {
        this.emitter.emit('did-change')
      }),
    )
  }

  public serialize(): SerializedMPV {
    return {
      deserializer: 'markdown-preview-plus/MarkdownPreviewView',
      filePath: this.file.getPath(),
    }
  }

  public getTitle() {
    const p = this.getPath()
    return `${p ? path.basename(p) : 'Markdown File'} Preview`
  }

  public getURI() {
    return `markdown-preview-plus://file/${this.getPath()}`
  }

  public getPath() {
    return this.file.getPath()
  }

  public getGrammar(): undefined {
    return
  }

  public async getMarkdownSource() {
    const res = await this.file.read()
    if (res !== null) return res
    else return ''
  }
}
