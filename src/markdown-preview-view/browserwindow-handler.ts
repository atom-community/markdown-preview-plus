import { BrowserWindow, remote } from 'electron'
import { WebContentsHandler } from './web-contents-handler'
import { MarkdownPreviewView } from './markdown-preview-view'

const menuItems = [
  {
    label: 'Sync Source',
    command: 'markdown-preview-plus:sync-source',
  },
  {
    label: 'Search Selection in Source',
    command: 'markdown-preview-plus:search-selection-in-source',
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
  private menu?: Electron.Menu
  constructor(init: () => void | Promise<void>) {
    const window = new remote.BrowserWindow({
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
      },
    })
    BrowserWindowHandler.windows.add(window)
    window.on('close', () => this.destroy())
    window.setMenuBarVisibility(false)

    super(
      Promise.resolve(window.webContents),
      () => {
        if (this.menu) this.menu.popup({ window })
      },
      init,
    )
    this.window = window
  }

  public static clean() {
    const windows = Array.from(BrowserWindowHandler.windows)
    for (const w of windows) w.close()
  }

  public registerElementEvents(element: HTMLElement) {
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
    this.menu = remote.Menu.buildFromTemplate(
      menuItems.map(({ label, command }) => ({
        label,
        click: () => atom.commands.dispatch(element, command),
      })),
    )
  }

  public destroy() {
    if (this.destroyed) return
    super.destroy()
    this.window.destroy()
    BrowserWindowHandler.windows.delete(this.window)
    this.window = null as any
  }
}
