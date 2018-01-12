export {}
declare module 'atom' {
  interface Workspace {
    destroyActivePaneItem: () => void
  }
  interface PackageManager {
    resourcePath: string
  }
  interface TextEditor {
    cursorLineDecorations: LayerDecoration[] | null | undefined
  }
  interface AtomEnvironment {
    showSaveDialogSync(path: string): string | undefined
  }
}
