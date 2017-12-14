export {}
declare module 'atom' {
  interface ConfigValues {
    breakOnSingleNewline: boolean
    liveUpdate: boolean
    openPreviewInSplitPane: boolean
    previewSplitPaneDir: string
    grammars: string[]
    enableLatexRenderingByDefault: boolean
    useLazyHeaders: boolean
    useGitHubStyle: boolean
    enablePandoc: boolean
    useNativePandocCodeStyles: boolean
    pandocPath: string
    pandocFilters: string[]
    pandocArguments: string[]
    pandocMarkdownFlavor: string
    pandocBibliography: boolean
    pandocRemoveReferences: boolean
    pandocBIBFile: string
    pandocBIBFileFallback: string
    pandocCSLFile: string
    pandocCSLFileFallback: string
  }
}
