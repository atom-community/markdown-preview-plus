export function handlePromise(promise: Promise<any>): void {
  if (!promise) return
  promise.catch((error: Error) => {
    console.error(error)
    atom.notifications.addFatalError(error.toString(), {
      detail: error.message,
      stack: error.stack,
      dismissable: true,
    })
  })
}
import { lstatSync, existsSync } from 'fs'
export function isFileSync(filePath: string) {
  if (!existsSync(filePath)) return false
  return lstatSync(filePath).isFile()
}

import { WebviewHandler } from './markdown-preview-view/webview-handler'
import * as renderer from './renderer'
import { loadUserMacros } from './macros-util'
import * as clipboard from './clipboard'

export async function copyHtml(
  text: string,
  filePath: string | undefined,
  renderLaTeX: boolean,
  clientStyle: ClientStyle,
): Promise<void> {
  const view = new WebviewHandler(clientStyle, async () => {
    await view.init({
      userMacros: loadUserMacros(),
      mathJaxConfig: { ...atomConfig().mathConfig, latexRenderer: 'SVG' },
      context: 'copy-html',
    })
    await view.setBasePath(filePath)

    const domDocument = await renderer.render({
      text,
      filePath,
      renderLaTeX,
      renderErrors: false,
      mode: 'copy',
    })
    const res = await view.update(
      domDocument.documentElement!.outerHTML,
      renderLaTeX,
    )
    if (res) {
      const html = res.replace(/"file:\/\/[^"#]*/g, '"')
      if (atom.config.get('markdown-preview-plus.richClipboard')) {
        clipboard.write({ text: html, html })
      } else {
        clipboard.writePlain(html)
      }
    }
    view.destroy()
  })
  view.element.style.pointerEvents = 'none'
  view.element.style.position = 'absolute'
  view.element.style.width = '100vw'
  view.element.style.height = '1px'
  const ws = atom.views.getView(atom.workspace)
  ws.appendChild(view.element)
}

export function atomConfig() {
  return atom.config.get('markdown-preview-plus')
}

let memoizedPath: string | undefined
export function packagePath() {
  if (memoizedPath !== undefined) return memoizedPath
  const pkg = atom.packages.getLoadedPackage('markdown-preview-plus')
  if (!pkg) {
    throw new Error('markdown-preview-plus is not loaded but is running')
  }
  return (memoizedPath = pkg.path)
}

import { shell } from 'electron'
import fileUriToPath from 'file-uri-to-path'
import { ClientStyle } from './markdown-preview-view/util'

export function shellOpen(url: string) {
  const exts = atomConfig().previewConfig.shellOpenFileExtensions
  const forceOpenExternal = exts.some((ext) =>
    url.toLowerCase().endsWith(`.${ext.toLowerCase()}`),
  )
  if (url.startsWith('file://') && !forceOpenExternal) {
    handlePromise(atom.workspace.open(fileUriToPath(url)))
  } else {
    handlePromise(shell.openExternal(url))
  }
}
