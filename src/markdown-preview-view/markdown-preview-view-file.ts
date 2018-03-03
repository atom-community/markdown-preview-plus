import path = require('path')
import { File } from 'atom'
import { MarkdownPreviewView, SerializedMPV } from './markdown-preview-view'

export class MarkdownPreviewViewFile extends MarkdownPreviewView {
  private file!: File

  constructor(filePath: string) {
    super()
    this.file = new File(filePath)
    this.disposables.add(this.file.onDidChange(this.changeHandler))
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

  protected getGrammar(): undefined {
    return
  }

  protected async getMarkdownSource() {
    const res = await this.file.read()
    if (res !== null) return res
    else return ''
  }
}
