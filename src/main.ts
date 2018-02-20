import url = require('url')
import {
  MarkdownPreviewView,
  MPVParams,
  MarkdownPreviewViewElement,
} from './markdown-preview-view'
import renderer = require('./renderer')
import mathjaxHelper = require('./mathjax-helper')
import { isMarkdownPreviewView } from './cast'
import {
  TextEditor,
  WorkspaceOpenOptions,
  CommandEvent,
  CompositeDisposable,
  ContextMenuOptions,
} from 'atom'
import { handlePromise, isFileSync } from './util'

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
    atom.commands.add('markdown-preview-plus-view', {
      'markdown-preview-plus:toggle': close,
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

export function createMarkdownPreviewView(state: MPVParams) {
  if (
    state.editorId !== undefined ||
    (state.filePath && isFileSync(state.filePath))
  ) {
    return new MarkdownPreviewView(state, true)
  }
  return undefined
}

/// used by markdown-pdf
export async function copyHtml(_callback: any, _scale: number) {
  const editor = atom.workspace.getActiveTextEditor()
  if (!editor) return
  await copyHtmlInternal(editor)
}

/// private

function close(event: CommandEvent<MarkdownPreviewViewElement>) {
  const item = event.currentTarget.getModel()
  const pane = atom.workspace.paneForItem(item)
  if (!pane) return undefined
  return pane.destroyItem(item)
}

function toggle(editor: TextEditor) {
  if (!removePreviewForEditor(editor)) {
    addPreviewForEditor(editor)
  }
}

function uriForEditor(editor: TextEditor) {
  return `markdown-preview-plus://editor/${editor.id}`
}

function removePreviewForEditor(editor: TextEditor) {
  const uri = uriForEditor(editor)
  const previewPane = atom.workspace.paneForURI(uri)
  if (previewPane !== undefined) {
    const preview = previewPane.itemForURI(uri)
    if (preview === undefined) return false
    if (preview !== previewPane.getActiveItem()) {
      previewPane.activateItem(preview)
      return false
    }
    handlePromise(previewPane.destroyItem(preview))
    return true
  } else {
    return false
  }
}

function addPreviewForEditor(editor: TextEditor) {
  const uri = uriForEditor(editor)
  const previousActivePane = atom.workspace.getActivePane()
  const options: WorkspaceOpenOptions = { searchAllPanes: true }
  if (atom.config.get('markdown-preview-plus.openPreviewInSplitPane')) {
    options.split = atom.config.get(
      'markdown-preview-plus.previewSplitPaneDir',
    )!
  }
  handlePromise(
    atom.workspace.open(uri, options).then(function(markdownPreviewView) {
      if (isMarkdownPreviewView(markdownPreviewView)) {
        previousActivePane.activate()
      }
    }),
  )
}

function previewFile({ currentTarget }: CommandEvent) {
  const filePath = (currentTarget as HTMLElement).dataset.path
  if (!filePath) {
    return
  }

  for (const editor of atom.workspace.getTextEditors()) {
    if (editor.getPath() === filePath) {
      addPreviewForEditor(editor)
      return
    }
  }

  handlePromise(
    atom.workspace.open(`markdown-preview-plus://${encodeURI(filePath)}`, {
      searchAllPanes: true,
    }),
  )
}

async function copyHtmlInternal(editor: TextEditor): Promise<void> {
  const text = editor.getSelectedText() || editor.getText()
  const renderLaTeX = atom.config.get(
    'markdown-preview-plus.enableLatexRenderingByDefault',
  )
  return renderer.toHTML(
    text,
    editor.getPath(),
    editor.getGrammar(),
    !!renderLaTeX,
    true,
    function(error: Error | null, html: string) {
      if (error) {
        console.warn('Copying Markdown as HTML failed', error)
      } else if (renderLaTeX) {
        mathjaxHelper.processHTMLString(html, function(proHTML: string) {
          atom.clipboard.write(proHTML)
        })
      } else {
        atom.clipboard.write(html)
      }
    },
  )
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
          toggle(e.currentTarget.getModel())
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
    var { protocol, host, pathname } = url.parse(uriToOpen)
  } catch (e) {
    console.error(e)
    return undefined
  }

  if (protocol !== 'markdown-preview-plus:') return undefined
  if (pathname === undefined) return undefined

  try {
    pathname = decodeURI(pathname)
  } catch (e) {
    console.error(e)
    return undefined
  }

  if (host === 'editor') {
    return new MarkdownPreviewView({
      editorId: parseInt(pathname.substring(1), 10),
    })
  } else {
    return new MarkdownPreviewView({ filePath: pathname })
  }
}
