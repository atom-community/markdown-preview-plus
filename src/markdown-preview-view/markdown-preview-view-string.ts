import { MarkdownPreviewView, SerializedMPV } from './markdown-preview-view'
import { RenderMode } from '../renderer'

export class MarkdownPreviewViewString extends MarkdownPreviewView {
  private mdtext: string

  constructor(
    text: string,
    mode: Exclude<RenderMode, 'save'>,
    renderLaTeX: boolean,
  ) {
    super(mode, renderLaTeX)
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

  public getPath(): string | undefined {
    return undefined
  }

  protected getGrammar(): undefined {
    return
  }

  protected async getMarkdownSource() {
    return this.mdtext
  }
}
