export {}
declare module 'atom' {
  interface ConfigValues {
    'markdown-preview-plus.breakOnSingleNewline': boolean
    'markdown-preview-plus.liveUpdate': boolean
    'markdown-preview-plus.openPreviewInSplitPane': boolean
    'markdown-preview-plus.previewSplitPaneDir': 'down' | 'right'
    'markdown-preview-plus.grammars': string[]
    'markdown-preview-plus.enableLatexRenderingByDefault': boolean
    'markdown-preview-plus.useLazyHeaders': boolean
    'markdown-preview-plus.useGitHubStyle': boolean
    'markdown-preview-plus.enablePandoc': boolean
    'markdown-preview-plus.useNativePandocCodeStyles': boolean
    'markdown-preview-plus.pandocPath': string
    'markdown-preview-plus.pandocFilters': string[]
    'markdown-preview-plus.pandocArguments': string[]
    'markdown-preview-plus.pandocMarkdownFlavor': string
    'markdown-preview-plus.pandocBibliography': boolean
    'markdown-preview-plus.pandocRemoveReferences': boolean
    'markdown-preview-plus.pandocBIBFile': string
    'markdown-preview-plus.pandocBIBFileFallback': string
    'markdown-preview-plus.pandocCSLFile': string
    'markdown-preview-plus.pandocCSLFileFallback': string
    'markdown-preview-plus': {
      breakOnSingleNewline: boolean
      liveUpdate: boolean
      openPreviewInSplitPane: boolean
      previewSplitPaneDir: 'down' | 'right'
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
}
