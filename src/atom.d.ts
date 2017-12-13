export {}
declare module "atom" {
  interface CommandEvent {
    currentTarget: HTMLElement & { getModel(): TextEditor }
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
}
