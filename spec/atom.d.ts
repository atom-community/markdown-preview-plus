export {}
declare module 'atom' {
  interface PackageManager {
    deactivatePackage(packageName: string): void
  }
  interface StyleManager {
    addStyleSheet(style: string, options?: { context?: string }): void
  }
}
