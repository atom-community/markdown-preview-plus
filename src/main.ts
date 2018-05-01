import url = require('url')
import {
  MarkdownPreviewViewElement,
  SerializedMPV,
  MarkdownPreviewViewFile,
  MarkdownPreviewViewEditor,
  MarkdownPreviewViewString,
} from './markdown-preview-view'
import renderer = require('./renderer')
// import mathjaxHelper = require('./mathjax-helper')
import {
  TextEditor,
  WorkspaceOpenOptions,
  CommandEvent,
  CompositeDisposable,
  ContextMenuOptions,
} from 'atom'
import { handlePromise, isFileSync } from './util'
import { PlaceholderView } from './placeholder-view'

export { config } from './config'

let disposables: CompositeDisposable | undefined

export async function activate() {
  if (atom.packages.isPackageActive('markdown-preview')) {
    await atom.packages.deactivatePackage('markdown-preview')
    atom.notifications.addInfo(
      'Markdown-preview-plus has deactivated markdown-preview package.' +
        'You may want to disable it manually to avoid this message.',
    )
  }
  disposables = new CompositeDisposable()
  disposables.add(
    atom.commands.add('atom-workspace', {
      'markdown-preview-plus:toggle-break-on-single-newline': function() {
        const keyPath = 'markdown-preview-plus.breakOnSingleNewline'
        atom.config.set(keyPath, !atom.config.get(keyPath))
      },
    }),
    atom.commands.add('.markdown-preview-plus', {
      'markdown-preview-plus:toggle': close,
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
        const view = e.currentTarget.getModel()
        view.toggleRenderLatex()
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
  } else if (state.filePath && isFileSync(state.filePath)) {
    return new MarkdownPreviewViewFile(state.filePath)
  }
  return undefined
}

/// used by markdown-pdf
export function copyHtml(_callback: any, _scale: number) {
  const editor = atom.workspace.getActiveTextEditor()
  if (!editor) return
  handlePromise(copyHtmlInternal(editor))
}

/// private

async function close(
  event: CommandEvent<MarkdownPreviewViewElement>,
): Promise<void> {
  const item = event.currentTarget.getModel()
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
  handlePromise(previewPane.destroyItem(item))
  return true
}

async function addPreviewForEditor(editor: TextEditor) {
  const previousActivePane = atom.workspace.getActivePane()
  const options: WorkspaceOpenOptions = { searchAllPanes: true }
  const splitConfig = atom.config.get(
    'markdown-preview-plus.previewSplitPaneDir',
  )
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
  const renderLaTeX = atom.config.get(
    'markdown-preview-plus.enableLatexRenderingByDefault',
  )
  const text = editor.getSelectedText() || editor.getText()
  if (renderLaTeX) {
    const view = new MarkdownPreviewViewString(text)
    view.element.style.visibility = 'hidden'
    view.element.style.position = 'absolute'
    view.element.style.pointerEvents = 'none'
    const ws = atom.views.getView(atom.workspace)
    ws.appendChild(view.element)
    await view.renderPromise
    const res = await view.getHTMLSVG()
    if (res) atom.clipboard.write(res)
    view.destroy()
  } else {
    const html = await renderer.render(
      text,
      editor.getPath(),
      editor.getGrammar(),
      renderLaTeX,
      true,
    )
    atom.clipboard.write(html.body.innerHTML)
  }
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
          handlePromise(toggle(e.currentTarget.getModel()))
        },
        'markdown-preview-plus:copy-html': (e) => {
          handlePromise(copyHtmlInternal(e.currentTarget.getModel()))
        },
      }),
    )
    cm[selector] = [
      {
        label: 'Sync Preview',
        command: 'markdown-preview-plus:sync-preview',
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
  } else {
    throw new Error(
      `Tried to open markdown-preview-plus with uri ${uriToOpen}. This is not supported. Please report this error.`,
    )
  }
}
