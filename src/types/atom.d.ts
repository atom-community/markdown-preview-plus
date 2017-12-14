export {}
declare module 'atom' {
  interface CommandEvent {
    currentTarget: TextEditorElement
  }
  interface Grammar {
    scopeName: string
  }
  interface Workspace {
    destroyActivePaneItem: () => void
  }
  interface PackageManager {
    resourcePath: string
  }
  interface TextEditorElement extends HTMLElement {
    getModel(): TextEditor
  }
  interface TextEditor {
    cursorLineDecorations: LayerDecoration[] | null | undefined
  }
  interface AtomEnvironment {
    getConfigDirPath(): string
    showSaveDialogSync(path: string): string | undefined
  }
}
