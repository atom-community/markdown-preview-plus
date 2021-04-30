import { BrowserWindow, remote } from 'electron'
import { WebContentsHandler } from './web-contents-handler'
import { MarkdownPreviewView } from './markdown-preview-view'
import { ClientStyle } from './util'

const menuItems = [
  {
    label: 'Sync Source',
    command: 'markdown-preview-plus:sync-source',
  },
  {
    label: 'Search Selection in Source',
    command: 'markdown-preview-plus:search-selection-in-source',
  },
  {
    label: 'Find in Preview...',
    command: 'markdown-preview-plus:find-in-preview',
  },
  { label: 'Find Next', command: 'markdown-preview-plus:find-next' },
  { label: 'Copy As HTML', command: 'core:copy' },
  { label: 'Save As\u2026', command: 'core:save-as' },
  // { label: 'Print\u2026', command: 'markdown-preview-plus:print' },
  {
    label: 'Open in main window',
    command: 'markdown-preview-plus:main-window',
  },
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
  private static views = new Map<MarkdownPreviewView, BrowserWindow>()
  private menu?: Electron.Menu
  private readonly window: BrowserWindow
  private readonly _element: HTMLElement
  constructor(clientStyle: ClientStyle, init: () => void | Promise<void>) {
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
      clientStyle,
      init,
    )
    this.window = window
    this._element = document.createElement('div')
  }

  public get element() {
    return this._element
  }

  public static clean() {
    const windows = Array.from(BrowserWindowHandler.windows)
    for (const w of windows) w.close()
    const views = Array.from(BrowserWindowHandler.views.keys())
    for (const v of views) v.destroy()
  }

  public static viewForURI(uri: string) {
    return Array.from(BrowserWindowHandler.views.keys()).find(
      (v) => v.getURI() === uri,
    )
  }

  public static windowForView(view: MarkdownPreviewView) {
    return BrowserWindowHandler.views.get(view)
  }

  public registerViewEvents(view: MarkdownPreviewView) {
    BrowserWindowHandler.views.set(view, this.window)
    const disp = view.onDidDestroy(() => {
      BrowserWindowHandler.views.delete(view)
      disp.dispose()
    })
    const element = atom.views.getView(view)
    this.disposables.add(
      atom.commands.add(element, {
        'core:save-as': () => {
          const path = atom.applicationDelegate.showSaveDialog(
            view.getSaveDialogOptions(),
          )
          if (!path) return
          view.saveAs(path)
        },
        'markdown-preview-plus:main-window': () => {
          view.openMainWindow()
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
  }
}
