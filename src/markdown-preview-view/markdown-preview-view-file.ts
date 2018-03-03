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

  serialize(): SerializedMPV {
    return {
      deserializer: 'markdown-preview-plus/MarkdownPreviewView',
      filePath: this.file.getPath(),
    }
  }

  async getMarkdownSource() {
    return this.file.read()
  }

  getTitle() {
    const p = this.getPath()
    return `${p ? path.basename(p) : 'Markdown File'} Preview`
  }

  getURI() {
    return `markdown-preview-plus://file/${this.getPath()}`
  }

  getPath() {
    return this.file.getPath()
  }

  getGrammar(): undefined {
    return
  }
}
