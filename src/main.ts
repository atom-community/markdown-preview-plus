import {
  SerializedMPV,
  MarkdownPreviewView,
  createEditorView,
  createFileView,
  viewForEditor,
  openPreviewPane,
  createTextView,
} from './markdown-preview-view'
import {
  TextEditor,
  CommandEvent,
  CompositeDisposable,
  ContextMenuOptions,
  File,
  Disposable,
} from 'atom'
import type { getToolBarManager, ToolBarManager } from 'atom/tool-bar'
import * as path from 'path'
import * as util from './util'
import { PlaceholderView } from './placeholder-view'
import { migrateConfig } from './migrate-config'
import { selectListView } from './select-list-view'
import * as pdf from './markdown-preview-view/pdf-export-util'
import { getUserMacrosPath } from './macros-util'
import { BrowserWindowHandler } from './markdown-preview-view/browserwindow-handler'
import { MarkdownItWorker } from './markdown-it-helper'

export { config } from './config'

let disposables: CompositeDisposable | undefined
let toolbar: ToolBarManager | undefined

export function activate() {
  if (migrateConfig()) {
    atom.notifications.addInfo(
      'Markdown-Preivew-Plus has updated your config to a new format. ' +
        'Please check if everything is in order. ' +
        'This message will not be shown again.',
      { dismissable: true },
    )
  }
  if (atom.packages.isPackageActive('markdown-preview')) {
    util.handlePromise(atom.packages.deactivatePackage('markdown-preview'))
  }
  if (!atom.packages.isPackageDisabled('markdown-preview')) {
    atom.packages.disablePackage('markdown-preview')
    atom.notifications.addInfo(
      'Markdown-preview-plus has disabled markdown-preview package.',
      { dismissable: true },
    )
  }
  disposables = new CompositeDisposable()
  disposables.add(
    atom.commands.add('.markdown-preview-plus', {
      'markdown-preview-plus:toggle': close,
    }),
    atom.commands.add('atom-workspace', {
      'markdown-preview-plus:open-configuration': () => {
        util.handlePromise(
          atom.workspace.open('atom://config/packages/markdown-preview-plus'),
        )
      },
      'markdown-preview-plus:edit-macros': () => {
        util.handlePromise(
          atom.workspace.open(getUserMacrosPath(atom.getConfigDirPath())),
        )
      },
      'markdown-preview-plus:select-syntax-theme': async () => {
        try {
          const themeNames = atom.themes.getLoadedThemeNames()
          if (themeNames === undefined) return
          const theme = await selectListView(
            themeNames.filter((x) => x.match(/-syntax$/)),
          )
          if (theme === undefined) return
          atom.config.set('markdown-preview-plus.syntaxThemeName', theme)
        } catch (e) {
          const err = e as Error
          atom.notifications.addFatalError(err.name, {
            detail: err.message,
            stack: err.stack,
          })
        }
      },
    }),
    atom.commands.add('atom-text-editor', {
      'markdown-preview-plus:toggle-render-latex': (e) => {
        const editor = e.currentTarget.getModel()
        const view = viewForEditor(editor)
        if (view) view.toggleRenderLatex()
      },
    }),
    atom.commands.add('.markdown-preview-plus', {
      'markdown-preview-plus:toggle-render-latex': (e) => {
        const view = MarkdownPreviewView.viewForElement(e.currentTarget)
        if (view) view.toggleRenderLatex()
      },
    }),
    atom.commands.add('.tree-view', {
      'markdown-preview-plus:preview-file': previewFile,
      'markdown-preview-plus:make-pdf': makePDF,
    }),
    atom.workspace.addOpener(opener),
    atom.config.observe(
      'markdown-preview-plus.grammars',
      configObserver(registerGrammars),
    ),
    atom.config.observe(
      'markdown-preview-plus.extensions',
      configObserver(registerExtensions),
    ),
    atom.config.observe(
      'markdown-preview-plus.disableToolBarIntegration',
      configObserver(observeToolbarButton),
    ),
    new Disposable(function () {
      toolbar?.removeItems()
    }),
  )
}

export function deactivate() {
  MarkdownItWorker.destroy()
  disposables && disposables.dispose()
  disposables = undefined
  toolbar = undefined
  BrowserWindowHandler.clean()
}

export function createMarkdownPreviewView(state: SerializedMPV) {
  if (state.editorId !== undefined) {
    return new PlaceholderView(state.editorId)
  } else if (state.filePath && util.isFileSync(state.filePath)) {
    return createFileView(state.filePath)
  } else if (state.text) {
    return createTextView(state.text)
  }
  return undefined
}

/// private

async function close(event: CommandEvent<HTMLElement>): Promise<void> {
  const item = MarkdownPreviewView.viewForElement(event.currentTarget)
  if (!item) return
  const pane = atom.workspace.paneForItem(item)
  if (!pane) item.destroy()
  else await pane.destroyItem(item)
}

async function toggle(editor: TextEditor) {
  if (removePreviewForEditor(editor)) return undefined
  else return addPreviewForEditor(editor)
}

function removePreviewForEditor(editor: TextEditor) {
  const item = viewForEditor(editor)
  if (!item) return false
  const previewPane = atom.workspace.paneForItem(item)
  if (previewPane) {
    if (item !== previewPane.getActiveItem()) {
      previewPane.activateItem(item)
      return true
    }
    util.handlePromise(previewPane.destroyItem(item))
  } else {
    const win = BrowserWindowHandler.windowForView(item)
    if (win && !win.isFocused()) {
      win.focus()
      return true
    }
    item.destroy()
  }
  return true
}

async function addPreviewForEditor(editor: TextEditor) {
  return openPreviewPane(createEditorView(editor))
}

async function previewFile(evt: CommandEvent): Promise<void> {
  const { currentTarget } = evt
  const fileEntry = (currentTarget as HTMLElement).querySelector(
    '.entry.file.selected .name',
  )
  const filePath = (fileEntry as HTMLElement).dataset.path
  if (!filePath) {
    evt.abortKeyBinding()
    return
  }
  const ext = path.extname(filePath).substr(1)
  const exts = util.atomConfig().extensions
  if (!exts.includes(ext)) {
    evt.abortKeyBinding()
    return
  }

  for (const editor of atom.workspace.getTextEditors()) {
    if (editor.getPath() === filePath) {
      await addPreviewForEditor(editor)
      return
    }
  }

  await atom.workspace.open(
    `markdown-preview-plus://file/${encodeURI(filePath)}`,
    {
      searchAllPanes: true,
    },
  )
}

async function copyHtmlInternal(editor: TextEditor): Promise<void> {
  const config = util.atomConfig()
  const renderLaTeX = config.mathConfig.enableLatexRenderingByDefault
  const style = config.style
  const text = editor.getSelectedText() || editor.getText()
  await util.copyHtml(text, editor.getPath(), renderLaTeX, style)
}

type ContextMenu = { [key: string]: ContextMenuOptions[] }

function configObserver<T>(
  f: (
    value: T,
    disposables: CompositeDisposable,
    contextMenu: ContextMenu,
  ) => void,
) {
  let configDisposables: CompositeDisposable
  return function (value: T) {
    if (!disposables) return
    if (configDisposables) {
      configDisposables.dispose()
      disposables.remove(configDisposables)
    }
    configDisposables = new CompositeDisposable()
    const contextMenu: ContextMenu = {}
    f(value, configDisposables, contextMenu)
    configDisposables.add(atom.contextMenu.add(contextMenu))
    disposables.add(configDisposables)
  }
}

function registerExtensions(extensions: string[], _: any, cm: ContextMenu) {
  for (const ext of extensions) {
    const selector = `.tree-view .file .name[data-name$=".${ext}"]`
    cm[selector] = [
      {
        label: 'Markdown Preview',
        command: 'markdown-preview-plus:preview-file',
      },
      {
        label: 'Make PDF',
        command: 'markdown-preview-plus:make-pdf',
      },
    ]
  }
}

function registerGrammars(
  grammars: string[],
  disp: CompositeDisposable,
  cm: ContextMenu,
) {
  for (const gr of grammars) {
    const grs = gr.replace(/\./g, ' ')
    const selector = `atom-text-editor[data-grammar="${grs}"]`
    disp.add(
      atom.commands.add(selector as 'atom-text-editor', {
        'markdown-preview-plus:toggle': (e) => {
          util.handlePromise(toggle(e.currentTarget.getModel()))
        },
        'markdown-preview-plus:copy-html': (e) => {
          util.handlePromise(copyHtmlInternal(e.currentTarget.getModel()))
        },
      }),
    )
    cm[selector] = [
      {
        label: 'Sync Preview',
        command: 'markdown-preview-plus:sync-preview',
      },
      {
        label: 'Copy Markdown as HTML',
        command: 'markdown-preview-plus:copy-html',
      },
    ]
  }
}

async function makePDF(evt: CommandEvent): Promise<void> {
  const { currentTarget } = evt
  const fileEntries = (currentTarget as HTMLElement).querySelectorAll(
    '.entry.file.selected .name',
  )
  async function go(filePath?: string) {
    if (filePath === undefined) return
    const f = new File(filePath)
    const text = await f.read()
    if (text === null) return
    const savePath = filePath + '.pdf'
    const saveFile = new File(savePath)
    if (
      (await saveFile.exists()) &&
      !util.atomConfig().saveConfig.makePDFOverwrite
    ) {
      atom.notifications.addInfo(
        `${saveFile.getBaseName()} exists, will not overwrite`,
      )
      return
    }

    await pdf.saveAsPDF(
      text,
      filePath,
      undefined,
      util.atomConfig().mathConfig.enableLatexRenderingByDefault,
      savePath,
    )
  }
  const exts = util.atomConfig().extensions
  const paths = Array.from(fileEntries)
    .map((x) => (x as HTMLElement).dataset.path)
    .filter((x) => x !== undefined && exts.includes(path.extname(x).substr(1)))
    .map(go)
  if (paths.length === 0) {
    evt.abortKeyBinding()
    return
  }
  await Promise.all(paths)
}

function opener(uriToOpen: string) {
  if (!uriToOpen.startsWith('markdown-preview-plus://')) return undefined
  try {
    // tslint:disable-next-line:no-var-keyword prefer-const
    var uri = new URL(uriToOpen)
  } catch (e) {
    console.error(e, uriToOpen)
    return undefined
  }

  if (uri.protocol !== 'markdown-preview-plus:') return undefined
  if (!uri.pathname) return undefined

  let typ: 'file' | 'editor'
  let pathname: string
  try {
    if (uri.pathname.startsWith('//file/')) {
      typ = 'file'
      pathname = decodeURI(uri.pathname.slice(7))
    } else if (uri.pathname.startsWith('//editor/')) {
      typ = 'editor'
      pathname = decodeURI(uri.pathname.slice(9))
    } else {
      throw new Error(
        `Tried to open markdown-preview-plus with uri ${uriToOpen}. This is not supported. Please report this error.`,
      )
    }
  } catch (e) {
    console.error(e)
    return undefined
  }

  if (typ === 'file') {
    return createFileView(pathname)
  } else if (typ === 'editor') {
    const editorId = parseInt(pathname, 10)
    const editor = atom.workspace
      .getTextEditors()
      .find((ed) => ed.id === editorId)
    if (editor === undefined) {
      atom.notifications.addWarning(
        'Markdown-preview-plus: Tried to open preview ' +
          `for editor with id ${editorId}, which does not exist`,
      )
      return undefined
    }
    return createEditorView(editor)
  }
  throw new Error(
    `Reached "impossible" state in opener while handling ${uriToOpen}. Please report this error.`,
  )
}

function observeToolbarButton(disableToolBarIntegration: boolean) {
  if (disableToolBarIntegration) {
    toolbar?.removeItems()
  } else {
    toolbar?.addButton({
      icon: 'markdown',
      callback: 'markdown-preview-plus:toggle',
      tooltip: 'Markdown Preview',
    })
  }
}

export function consumeToolBar(getToolBar: getToolBarManager) {
  toolbar = getToolBar('markdown-preview-plus')
  return new Disposable(() => {
    toolbar = undefined
  })
}
