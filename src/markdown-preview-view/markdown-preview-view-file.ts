import * as path from 'path'
import { File } from 'atom'
import { MarkdownPreviewView, SerializedMPV } from './markdown-preview-view'
import { WebContentsHandler } from './web-contents-handler'
import * as util from './util'
import { browserWindowHandler } from './browserwindow-handler'

export class MarkdownPreviewViewFile extends MarkdownPreviewView {
  public readonly classname = 'MarkdownPreviewViewFile'
  private file: File

  constructor(
    filePath: string,
    handler?: Promise<WebContentsHandler>,
    el?: HTMLElement,
  ) {
    super(undefined, handler, el)
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

  protected async openNewWindow(): Promise<void> {
    const el = document.createElement('div')
    // tslint:disable-next-line: no-unused-expression
    new MarkdownPreviewViewFile(
      this.file.getPath(),
      browserWindowHandler(this.getPath(), this.emitter, el),
      el,
    )
    util.destroy(this)
  }

  protected async getMarkdownSource() {
    const res = await this.file.read()
    if (res !== null) return res
    else return ''
  }
}
