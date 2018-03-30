import { MarkdownPreviewView, SerializedMPV } from './markdown-preview-view'

export class MarkdownPreviewViewString extends MarkdownPreviewView {
  private mdtext: string

  constructor(text: string) {
    super()
    this.mdtext = text
  }

  public serialize(): SerializedMPV {
    return {
      deserializer: 'markdown-preview-plus/MarkdownPreviewView',
    }
  }

  public getTitle() {
    return `String Preview`
  }

  public getURI() {
    return `markdown-preview-plus://string/`
  }

  public getPath() {
    return undefined
  }

  protected getGrammar(): undefined {
    return
  }

  protected async getMarkdownSource() {
    return this.mdtext
  }
}
