import { TextEditor, CompositeDisposable, Range } from 'atom'
import { remote } from 'electron'
import { RequestHandler } from './request-handler'
import { atomConfig } from '../../util'
import { shouldScrollSync } from './should-scroll-sync'
import { constructEmitter } from './event-handler'

export function setupEditor(editor: TextEditor) {
  const disp = new CompositeDisposable()
  const windowId = remote.getCurrentWindow().id
  const editorId = editor.id
  const emit = constructEmitter(windowId, editorId)
  const requestHandler = new RequestHandler(windowId, editorId, {
    scrollToBufferRange([min, max]: [number, number]) {
      if (min === 0) {
        editor.scrollToBufferPosition([min, 0])
      } else if (max >= editor.getLastBufferRow() - 1) {
        editor.scrollToBufferPosition([max, 0])
      } else {
        const range = Range.fromObject([[min, 0], [max, 0]])
        editor.scrollToScreenRange(editor.screenRangeForBufferRange(range), {
          center: false,
        })
      }
    },
    destroy() {
      disp.dispose()
    },
    init() {
      return {
        path: editor.getPath(),
        title: editor.getTitle(),
        grammar: editor.getGrammar().scopeName,
        text: editor.getText(),
      }
    },
    openSource(row?: number) {
      if (row !== undefined) {
        editor.setCursorBufferPosition([row, 0])
      }
      remote.getCurrentWindow().focus()
      const pane = atom.workspace.paneForItem(editor)
      if (!pane) return
      pane.activateItem(editor)
      pane.activate()
    },
  })
  disp.add(
    editor.getBuffer().onDidStopChanging(() => {
      if (atomConfig().previewConfig.liveUpdate) {
        emit('changeText', editor.getText())
      }
      if (atomConfig().syncConfig.syncPreviewOnChange) {
        emit('syncPreview', editor.getCursorBufferPosition().row)
      }
    }),
    editor.onDidChangePath(() => {
      emit('changePath', {
        path: editor.getPath(),
        title: editor.getTitle(),
      })
    }),
    editor.onDidChangeGrammar((grammar) => {
      emit('changeGrammar', grammar.scopeName)
    }),
    editor.onDidDestroy(() => {
      disp.dispose()
      if (atomConfig().previewConfig.closePreviewWithEditor) {
        emit('destroy', undefined)
      }
    }),
    editor.getBuffer().onDidSave(() => {
      if (!atomConfig().previewConfig.liveUpdate) {
        emit('changeText', editor.getText())
      }
    }),
    editor.getBuffer().onDidReload(() => {
      if (!atomConfig().previewConfig.liveUpdate) {
        emit('changeText', editor.getText())
      }
    }),
    atom.views.getView(editor).onDidChangeScrollTop(() => {
      if (!shouldScrollSync('editor')) return
      const [first, last] = editor.getVisibleRowRange()
      const firstLine = editor.bufferRowForScreenRow(first)
      const lastLine = editor.bufferRowForScreenRow(last)
      emit('scrollSync', [firstLine, lastLine])
    }),
    atom.commands.add(atom.views.getView(editor), {
      'markdown-preview-plus:sync-preview': () => {
        emit('syncPreview', editor.getCursorBufferPosition().row)
      },
    }),
    requestHandler,
  )
}
