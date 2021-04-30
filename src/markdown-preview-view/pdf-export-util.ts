import { WebviewHandler } from './webview-handler'
import { atomConfig } from '../util'
import { render } from '../renderer'
import { writeFile } from 'fs'
import { ConfigValues, Grammar } from 'atom'
import { loadUserMacros } from '../macros-util'

export async function saveAsPDF(
  text: string,
  filePath: string | undefined,
  grammar: Grammar | undefined,
  renderLaTeX: boolean,
  saveFilePath: string,
): Promise<void> {
  const config = atomConfig()
  return new Promise<void>((resolve) => {
    const style =
      config.saveConfig.saveToPDFOptions.styleOverride === 'none'
        ? config.style
        : config.saveConfig.saveToPDFOptions.styleOverride
    const view = new WebviewHandler(style, async () => {
      const opts = config.saveConfig.saveToPDFOptions
      const pageSize =
        opts.pageSize === 'Custom'
          ? parsePageSize(opts.customPageSize)
          : opts.pageSize
      if (pageSize === undefined) {
        throw new Error(
          `Failed to parse custom page size: ${opts.customPageSize}`,
        )
      }
      const selection = await view.getSelection()
      const printSelectionOnly = selection ? opts.printSelectionOnly : false
      const newOpts = {
        ...opts,
        pageSize,
        printSelectionOnly,
      }
      const [width, height] = getPageWidth(newOpts.pageSize)

      const mathConfig = config.mathConfig
      const pdfRenderer = config.saveConfig.saveToPDFOptions.latexRenderer
      const renderer =
        pdfRenderer === 'Same as live preview'
          ? mathConfig.latexRenderer
          : pdfRenderer

      await view.init({
        userMacros: loadUserMacros(),
        mathJaxConfig: {
          ...mathConfig,
          latexRenderer: renderer,
        },
        context: 'pdf-export',
        pdfExportOptions: { width: newOpts.landscape ? height : width },
      })
      await view.setBasePath(filePath)

      const domDocument = await render({
        text,
        filePath,
        grammar,
        renderLaTeX,
        renderErrors: false,
        mode: 'normal',
      })
      await view.update(domDocument.documentElement!.outerHTML, renderLaTeX)
      await view.fullyReady()

      try {
        const data = await view.printToPDF(newOpts)

        await new Promise<void>((resolve, reject) => {
          writeFile(saveFilePath, data, (error) => {
            if (error) {
              reject(error)
              return
            }
            resolve()
          })
        })
      } catch (e) {
        const error = e as Error
        atom.notifications.addError('Failed saving to PDF', {
          description: error.toString(),
          dismissable: true,
          stack: error.stack,
        })
      }

      view.destroy()
      resolve()
    })
    view.element.style.pointerEvents = 'none'
    view.element.style.position = 'absolute'
    view.element.style.top = '0'
    view.element.style.opacity = '0'
    view.element.style.height = '100vh'
    view.element.style.width = '100vw'
    const ws = atom.views.getView(atom.workspace)
    ws.appendChild(view.element)
    view.updatePosition()
  })
}

type Unit = 'mm' | 'cm' | 'in'

function parsePageSize(size: string) {
  if (!size) return undefined
  const rx = /^([\d.,]+)(cm|mm|in)?x([\d.,]+)(cm|mm|in)?$/i
  const res = size.replace(/\s*/g, '').match(rx)
  if (res) {
    const width = parseFloat(res[1])
    const wunit = res[2] as Unit | undefined
    const height = parseFloat(res[3])
    const hunit = res[4] as Unit | undefined
    return {
      width: convert(width, wunit),
      height: convert(height, hunit),
    }
  } else {
    return undefined
  }
}

type PageSize =
  | Exclude<
      ConfigValues['markdown-preview-plus.saveConfig.saveToPDFOptions.pageSize'],
      'Custom'
    >
  | { width: number; height: number }

function convert(val: number, unit?: Unit) {
  return val * unitInMicrons(unit)
}

function unitInMicrons(unit: Unit = 'mm') {
  switch (unit) {
    case 'mm':
      return 1000
    case 'cm':
      return 10000
    case 'in':
      return 25400
  }
}

function getPageWidth(pageSize: PageSize) {
  switch (pageSize) {
    case 'A3':
      return [297, 420]
    case 'A4':
      return [210, 297]
    case 'A5':
      return [148, 210]
    case 'Legal':
      return [216, 356]
    case 'Letter':
      return [216, 279]
    case 'Tabloid':
      return [279, 432]
    default:
      return [pageSize.width / 1000, pageSize.height / 1000]
  }
}
