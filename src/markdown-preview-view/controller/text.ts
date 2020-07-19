import { SerializedMPV } from './serialized'
import { MarkdownPreviewController } from './base'
import { handlePromise } from '../../util'

export class MarkdownPreviewControllerText extends MarkdownPreviewController {
  public readonly type = 'text'
  private text = ''

  constructor(private textPromise: Promise<string>) {
    super()
    handlePromise(
      textPromise.then((x) => {
        this.text = x
      }),
    )
  }

  public serialize(): SerializedMPV {
    return {
      deserializer: 'markdown-preview-plus/MarkdownPreviewView',
      text: this.text,
    }
  }

  public getTitle() {
    return `Markdown Preview`
  }

  public getURI() {
    return `markdown-preview-plus://text/`
  }

  public getPath(): string | undefined {
    return undefined
  }

  public getGrammar(): undefined {
    return
  }

  public async getMarkdownSource() {
    return this.textPromise
  }
}
