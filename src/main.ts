import url = require('url')
import fs = require('fs-plus')

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
} from 'atom'
import { handlePromise } from './util'

export { config } from './config'

let disposables: CompositeDisposable | undefined

export function activate() {
  disposables = new CompositeDisposable()
  disposables.add(
    atom.commands.add('atom-workspace', {
      'markdown-preview-plus:toggle-break-on-single-newline'() {
        const keyPath = 'markdown-preview-plus.breakOnSingleNewline'
        atom.config.set(keyPath, !atom.config.get(keyPath))
      },
    }),

    atom.commands.add('atom-text-editor', {
      'markdown-preview-plus:toggle': (e) => {
        toggle(e.currentTarget.getModel())
      },
      'markdown-preview-plus:copy-html': (e) => {
        handlePromise(copyHtml(e.currentTarget.getModel()))
      },
    }),
    atom.commands.add('.markdown-preview', {
      'markdown-preview-plus:toggle': close,
    }),
    atom.commands.add(
      '.tree-view .file .name[data-name$=\\.markdown]',
      'markdown-preview-plus:preview-file',
      previewFile,
    ),
    atom.commands.add(
      '.tree-view .file .name[data-name$=\\.md]',
      'markdown-preview-plus:preview-file',
      previewFile,
    ),
    atom.commands.add(
      '.tree-view .file .name[data-name$=\\.mdown]',
      'markdown-preview-plus:preview-file',
      previewFile,
    ),
    atom.commands.add(
      '.tree-view .file .name[data-name$=\\.mkd]',
      'markdown-preview-plus:preview-file',
      previewFile,
    ),
    atom.commands.add(
      '.tree-view .file .name[data-name$=\\.mkdown]',
      'markdown-preview-plus:preview-file',
      previewFile,
    ),
    atom.commands.add(
      '.tree-view .file .name[data-name$=\\.ron]',
      'markdown-preview-plus:preview-file',
      previewFile,
    ),
    atom.commands.add(
      '.tree-view .file .name[data-name$=\\.txt]',
      'markdown-preview-plus:preview-file',
      previewFile,
    ),

    atom.workspace.addOpener((uriToOpen) => {
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
        return createMarkdownPreviewView({
          editorId: parseInt(pathname.substring(1), 10),
        })
      } else {
        return createMarkdownPreviewView({ filePath: pathname })
      }
    }),
  )
}

export function deactivate() {
  disposables && disposables.dispose()
}

export function createMarkdownPreviewView(state: MPVParams) {
  if (
    state.editorId !== undefined ||
    (state.filePath && fs.isFileSync(state.filePath))
  ) {
    return new MarkdownPreviewView(state)
  }
  return undefined
}

async function close(event: CommandEvent<MarkdownPreviewViewElement>) {
  const item = event.currentTarget.getModel()
  const pane = atom.workspace.paneForItem(item)
  if (!pane) return undefined
  return pane.destroyItem(item)
}

export function toggle(editor: TextEditor) {
  const grammars = atom.config.get('markdown-preview-plus.grammars') || []
  const scope = editor.getGrammar().scopeName
  if (!grammars.includes(scope)) {
    return
  }

  if (!removePreviewForEditor(editor)) {
    addPreviewForEditor(editor)
  }
}

export function uriForEditor(editor: TextEditor) {
  return `markdown-preview-plus://editor/${editor.id}`
}

export function removePreviewForEditor(editor: TextEditor) {
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

export function addPreviewForEditor(editor: TextEditor) {
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

export function previewFile({ currentTarget }: CommandEvent) {
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

const clipboardCopy = (text: string) => {
  atom.clipboard.write(text)
}

export async function copyHtml(
  editor: TextEditor,
  callback: (text: string) => any = clipboardCopy,
  scaleMath = 100,
): Promise<void> {
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
          proHTML = proHTML.replace(
            /MathJax\_SVG.*?font\-size\: 100%/g,
            (match) =>
              match.replace(/font\-size\: 100%/, `font-size: ${scaleMath}%`),
          )
          callback(proHTML)
        })
      } else {
        callback(html)
      }
    },
  )
}
