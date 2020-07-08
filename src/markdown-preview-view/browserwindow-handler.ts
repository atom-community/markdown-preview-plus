import { BrowserWindow, remote } from 'electron'
import { WebContentsHandler } from './web-contents-handler'
import { atomConfig } from '../util'
import { loadUserMacros } from '../macros-util'
import { Emitter } from 'atom'
import { MarkdownPreviewView } from './markdown-preview-view'

const menuItems = [
  {
    label: 'Sync Source',
    command: 'markdown-preview-plus:sync-source',
  },
  { label: 'Copy As HTML', command: 'core:copy' },
  { label: 'Save As\u2026', command: 'core:save-as' },
  // { label: 'Print\u2026', command: 'markdown-preview-plus:print' },
  // {
  //   label: 'Open in new window',
  //   command: 'markdown-preview-plus:new-window',
  // },
  {
    label: 'Open Dev Tools',
    command: 'markdown-preview-plus:open-dev-tools',
  },
  {
    label: 'Toggle math rendering',
    command: 'markdown-preview-plus:toggle-render-latex',
  },
  // {
  //   label: 'Change syntax theme...',
  //   command: 'markdown-preview-plus:select-syntax-theme',
  // },
]

export class BrowserWindowHandler extends WebContentsHandler {
  private static windows = new Set<BrowserWindow>()
  private window: BrowserWindow
  private element: HTMLElement
  constructor(init: () => void | Promise<void>, element: HTMLElement) {
    const window = new remote.BrowserWindow({
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
      },
    })
    BrowserWindowHandler.windows.add(window)
    window.on('close', () => this.destroy())
    window.setMenuBarVisibility(false)

    const menu = remote.Menu.buildFromTemplate(
      menuItems.map(({ label, command }) => ({
        label,
        click: () => atom.commands.dispatch(element, command),
      })),
    )
    super(
      Promise.resolve(window.webContents),
      () => {
        menu.popup({ window })
      },
      init,
    )
    this.window = window
    this.element = element
    element.classList.add('markdown-preview-plus', 'native-key-bindings')
    this.disposables.add(
      atom.commands.add(element, {
        'core:save-as': () => {
          const view = MarkdownPreviewView.viewForElement(element)
          if (!view) return
          const path = atom.applicationDelegate.showSaveDialog(
            view.getSaveDialogOptions(),
          )
          if (!path) return
          view.saveAs(path)
        },
      }),
    )
  }

  public static clean() {
    const windows = Array.from(BrowserWindowHandler.windows)
    for (const w of windows) w.close()
  }

  public destroy() {
    if (this.destroyed) return
    super.destroy()
    this.window.destroy()
    BrowserWindowHandler.windows.delete(this.window)
    this.element.remove()
    this.window = null as any
    this.element = null as any
  }
}

export async function browserWindowHandler(
  path: string | undefined,
  emitter: Emitter,
  element: HTMLElement,
) {
  return new Promise<WebContentsHandler>(function (resolve) {
    const handler = new BrowserWindowHandler(async function () {
      const config = atomConfig()
      await handler.init({
        userMacros: loadUserMacros(),
        mathJaxConfig: config.mathConfig,
        context: 'live-preview',
      })
      await handler.setBasePath(path)
      emitter.emit('did-change-title')
      resolve(handler)
    }, element)
  })
}
