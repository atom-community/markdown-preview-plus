import { Panel, CompositeDisposable, TextEditor } from 'atom'

export async function modalTextEditorView(
  title: string = '',
): Promise<string | undefined> {
  let panel: Panel<TextEditor> | undefined
  const currentFocus = document.activeElement as HTMLElement | void
  const disp = new CompositeDisposable()
  try {
    return await new Promise<string | undefined>((resolve) => {
      const ed = atom.workspace.buildTextEditor({
        mini: true,
        placeholderText: title,
      })
      const edv = atom.views.getView(ed)
      let grace = true
      setTimeout(() => {
        grace = false
      }, 100)
      edv.onblur = () => {
        if (!grace) atom.commands.dispatch(edv, 'core:cancel')
        else edv.focus()
      }
      disp.add(
        atom.commands.add(edv, {
          'core:confirm': () => {
            resolve(ed.getText())
          },
          'core:cancel': () => {
            edv.onblur = null
            resolve(undefined)
          },
        }),
      )
      panel = atom.workspace.addModalPanel({
        item: ed,
        visible: true,
      })
      edv.focus()
    })
  } finally {
    disp.dispose()
    if (panel) panel.destroy()
    if (currentFocus) currentFocus.focus()
  }
}
