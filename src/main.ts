import url = require('url')
import {
  SerializedMPV,
  MarkdownPreviewViewFile,
  MarkdownPreviewViewEditor,
  MarkdownPreviewView,
} from './markdown-preview-view'
// import mathjaxHelper = require('./mathjax-helper')
import {
  TextEditor,
  WorkspaceOpenOptions,
  CommandEvent,
  CompositeDisposable,
  ContextMenuOptions,
} from 'atom'
import * as util from './util'
import { PlaceholderView } from './placeholder-view'
import { migrateConfig } from './migrate-config'
import { MarkdownPreviewViewEditorRemote } from './markdown-preview-view/markdown-preview-view-editor-remote'

export { config } from './config'

let disposables: CompositeDisposable | undefined

export async function activate() {
  if (migrateConfig()) {
    atom.notifications.addInfo(
      'Markdown-Preivew-Plus has updated your config to a new format. ' +
        'Please check if everything is in order. ' +
        'This message will not be shown again.',
      { dismissable: true },
    )
  }
  if (atom.packages.isPackageActive('markdown-preview')) {
    await atom.packages.deactivatePackage('markdown-preview')
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
      'markdown-preview-plus:select-syntax-theme': async () => {
        try {
          const { selectListView } = await import('./select-list-view')
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
        const view = MarkdownPreviewViewEditor.viewForEditor(editor)
        if (view) view.toggleRenderLatex()
      },
    }),
    atom.commands.add('.markdown-preview-plus', {
      'markdown-preview-plus:toggle-render-latex': (e) => {
        const view = MarkdownPreviewView.viewForElement(e.currentTarget)
        if (view) view.toggleRenderLatex()
      },
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
  )
}

export function deactivate() {
  disposables && disposables.dispose()
}

export function createMarkdownPreviewView(state: SerializedMPV) {
  if (state.editorId !== undefined) {
    return new PlaceholderView(state.editorId)
  } else if (state.filePath && util.isFileSync(state.filePath)) {
    return new MarkdownPreviewViewFile(state.filePath)
  }
  return undefined
}

/// private

async function close(event: CommandEvent<HTMLElement>): Promise<void> {
  const item = MarkdownPreviewView.viewForElement(event.currentTarget)
  if (!item) return
  const pane = atom.workspace.paneForItem(item)
  if (!pane) return
  await pane.destroyItem(item)
}

async function toggle(editor: TextEditor) {
  if (removePreviewForEditor(editor)) return undefined
  else return addPreviewForEditor(editor)
}

function removePreviewForEditor(editor: TextEditor) {
  const item = MarkdownPreviewViewEditor.viewForEditor(editor)
  if (!item) return false
  const previewPane = atom.workspace.paneForItem(item)
  if (!previewPane) return false
  if (item !== previewPane.getActiveItem()) {
    previewPane.activateItem(item)
    return false
  }
  util.handlePromise(previewPane.destroyItem(item))
  return true
}

async function addPreviewForEditor(editor: TextEditor) {
  const previousActivePane = atom.workspace.getActivePane()
  const options: WorkspaceOpenOptions = { searchAllPanes: true }
  const splitConfig = util.atomConfig().previewConfig.previewSplitPaneDir
  if (splitConfig !== 'none') {
    options.split = splitConfig
  }
  const res = await atom.workspace.open(
    MarkdownPreviewViewEditor.create(editor),
    options,
  )
  previousActivePane.activate()
  return res
}

async function previewFile({ currentTarget }: CommandEvent): Promise<void> {
  const filePath = (currentTarget as HTMLElement).dataset.path
  if (!filePath) {
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
  const renderLaTeX = util.atomConfig().mathConfig.enableLatexRenderingByDefault
  const text = editor.getSelectedText() || editor.getText()
  await util.copyHtml(text, editor.getPath(), renderLaTeX)
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
  return function(value: T) {
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

function registerExtensions(
  extensions: string[],
  disp: CompositeDisposable,
  cm: ContextMenu,
) {
  for (const ext of extensions) {
    const selector = `.tree-view .file .name[data-name$=".${ext}"]`
    disp.add(
      atom.commands.add(
        selector,
        'markdown-preview-plus:preview-file',
        previewFile,
      ),
    )
    cm[selector] = [
      {
        label: 'Markdown Preview',
        command: 'markdown-preview-plus:preview-file',
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

function opener(uriToOpen: string) {
  try {
    // tslint:disable-next-line:no-var-keyword prefer-const
    var uri = url.parse(uriToOpen)
  } catch (e) {
    console.error(e, uriToOpen)
    return undefined
  }

  if (uri.protocol !== 'markdown-preview-plus:') return undefined
  if (!uri.pathname) return undefined

  try {
    // tslint:disable-next-line:no-var-keyword prefer-const
    var pathname = decodeURI(uri.pathname)
  } catch (e) {
    console.error(e)
    return undefined
  }

  if (uri.hostname === 'file') {
    return new MarkdownPreviewViewFile(pathname.slice(1))
  } else if (uri.hostname === 'remote-editor') {
    const [windowId, editorId] = pathname
      .slice(1)
      .split('/')
      .map((x) => parseInt(x, 10))
    return new MarkdownPreviewViewEditorRemote(windowId, editorId)
  } else {
    throw new Error(
      `Tried to open markdown-preview-plus with uri ${uriToOpen}. This is not supported. Please report this error.`,
    )
  }
}
