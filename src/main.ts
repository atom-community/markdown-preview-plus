/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const url = require('url')
const fs = require('fs-plus')

import { MarkdownPreviewView, MPVParams } from './markdown-preview-view'
import renderer = require('./renderer')
import mathjaxHelper = require('./mathjax-helper')
import { isMarkdownPreviewView } from './cast'
import { TextEditor } from 'atom'
import { WorkspaceOpenOptions } from 'atom'
import { CommandEvent } from 'atom'

export { config } from './config'

export function activate() {
  atom.commands.add('atom-workspace', {
    'markdown-preview-plus:toggle': toggle,
    'markdown-preview-plus:copy-html': () => copyHtml(),
    'markdown-preview-plus:toggle-break-on-single-newline'() {
      const keyPath = 'markdown-preview-plus.breakOnSingleNewline'
      return atom.config.set(keyPath, !atom.config.get(keyPath))
    },
  })

  atom.commands.add(
    '.tree-view .file .name[data-name$=\\.markdown]',
    'markdown-preview-plus:preview-file',
    previewFile,
  )
  atom.commands.add(
    '.tree-view .file .name[data-name$=\\.md]',
    'markdown-preview-plus:preview-file',
    previewFile,
  )
  atom.commands.add(
    '.tree-view .file .name[data-name$=\\.mdown]',
    'markdown-preview-plus:preview-file',
    previewFile,
  )
  atom.commands.add(
    '.tree-view .file .name[data-name$=\\.mkd]',
    'markdown-preview-plus:preview-file',
    previewFile,
  )
  atom.commands.add(
    '.tree-view .file .name[data-name$=\\.mkdown]',
    'markdown-preview-plus:preview-file',
    previewFile,
  )
  atom.commands.add(
    '.tree-view .file .name[data-name$=\\.ron]',
    'markdown-preview-plus:preview-file',
    previewFile,
  )
  atom.commands.add(
    '.tree-view .file .name[data-name$=\\.txt]',
    'markdown-preview-plus:preview-file',
    previewFile,
  )

  return atom.workspace.addOpener((uriToOpen) => {
    let host, pathname, protocol
    try {
      ;({ protocol, host, pathname } = url.parse(uriToOpen))
    } catch (e) {
      console.error(e)
      return
    }

    if (protocol !== 'markdown-preview-plus:') {
      return
    }

    try {
      if (pathname) {
        pathname = decodeURI(pathname)
      }
    } catch (e) {
      console.error(e)
      return
    }

    if (host === 'editor') {
      return createMarkdownPreviewView({
        editorId: parseInt(pathname.substring(1), 10),
      })
    } else {
      return createMarkdownPreviewView({ filePath: pathname })
    }
  })
}

export function createMarkdownPreviewView(state: MPVParams) {
  if (state.editorId || fs.isFileSync(state.filePath)) {
    return new MarkdownPreviewView(state)
  }
  return undefined
}

export function toggle() {
  let needle
  if (isMarkdownPreviewView(atom.workspace.getActivePaneItem())) {
    atom.workspace.destroyActivePaneItem()
    return
  }

  const editor = atom.workspace.getActiveTextEditor()
  if (editor == null) {
    return
  }

  const grammars = atom.config.get('markdown-preview-plus.grammars') || []
  if (((needle = editor.getGrammar().scopeName), !grammars.includes(needle))) {
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
  if (previewPane != null) {
    const preview = previewPane.itemForURI(uri)
    if (preview === undefined) return false
    if (preview !== previewPane.getActiveItem()) {
      previewPane.activateItem(preview)
      return false
    }
    previewPane.destroyItem(preview)
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
    options.split = atom.config.get('markdown-preview-plus.previewSplitPaneDir')
  }
  return atom.workspace.open(uri, options).then(function(markdownPreviewView) {
    if (isMarkdownPreviewView(markdownPreviewView)) {
      return previousActivePane.activate()
    }
  })
}

export function previewFile({ currentTarget }: CommandEvent) {
  const filePath = currentTarget.dataset.path
  if (!filePath) {
    return
  }

  for (let editor of atom.workspace.getTextEditors()) {
    if (editor.getPath() === filePath) {
      addPreviewForEditor(editor)
      return
    }
  }

  return atom.workspace.open(`markdown-preview-plus://${encodeURI(filePath)}`, {
    searchAllPanes: true,
  })
}

const clipboardCopy = (text: string) => atom.clipboard.write(text)

export function copyHtml(callback?: undefined, scaleMath?: number): void
export function copyHtml<T>(
  callback?: (text: string) => T,
  scaleMath?: number,
): T
export function copyHtml(
  callback: (text: string) => any = clipboardCopy,
  scaleMath = 100,
): any {
  const editor = atom.workspace.getActiveTextEditor()
  if (editor == null) {
    return
  }

  const text = editor.getSelectedText() || editor.getText()
  const renderLaTeX = atom.config.get(
    'markdown-preview-plus.enableLatexRenderingByDefault',
  )
  return renderer.toHTML(
    text,
    editor.getPath(),
    editor.getGrammar(),
    renderLaTeX,
    true,
    function(error: Error | null, html: string) {
      if (error) {
        return console.warn('Copying Markdown as HTML failed', error)
      } else if (renderLaTeX) {
        return mathjaxHelper.processHTMLString(html, function(proHTML: string) {
          proHTML = proHTML.replace(
            /MathJax\_SVG.*?font\-size\: 100%/g,
            (match) =>
              match.replace(/font\-size\: 100%/, `font-size: ${scaleMath}%`),
          )
          return callback(proHTML)
        })
      } else {
        return callback(html)
      }
    },
  )
}
