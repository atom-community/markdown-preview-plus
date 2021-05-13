import { ConfigValues } from 'atom'

interface OldConfigValues {
  breakOnSingleNewline: boolean
  liveUpdate: boolean
  previewSplitPaneDir: 'down' | 'right' | 'none'
  previewDock: 'left' | 'right' | 'bottom' | 'center'
  closePreviewWithEditor: boolean
  activatePreviewWithEditor: boolean
  syncPreviewOnChange: boolean
  syncPreviewOnEditorScroll: boolean
  syncEditorOnPreviewScroll: boolean
  grammars: string[]
  extensions: string[]
  enableLatexRenderingByDefault: boolean
  latexRenderer: 'HTML-CSS' | 'SVG'
  numberEquations: boolean
  useLazyHeaders: boolean
  useCheckBoxes: boolean
  useEmoji: boolean
  useToc: boolean
  inlineMathSeparators: string[]
  blockMathSeparators: string[]
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

function oldConfig(): Partial<OldConfigValues> {
  return atom.config.get('markdown-preview-plus') as any
}

function unset(key: keyof OldConfigValues) {
  atom.config.unset(`markdown-preview-plus.${key}` as any)
}

function migrate<
  OK extends keyof OldConfigValues,
  NK extends keyof ConfigValues,
  OV extends Partial<OldConfigValues>[OK],
  NV extends ConfigValues[NK],
>(oc: NV extends OV ? Partial<OldConfigValues> : never, neww: NK, old: OK) {
  // tslint:disable-next-line:strict-type-predicates
  if (oc[old] != null) {
    atom.config.set(neww, oc[old]!)
    unset(old)
    return true
  }
  return false
}

export function migrateConfig() {
  const oc = oldConfig()
  const changes: boolean[] = []
  if (
    atom.config.get('markdown-preview-plus.markdownItConfig.forceFullToc') !==
    undefined
  ) {
    atom.notifications.addWarning('Markdown-preivew-plus warning', {
      description: 'forceFullToc option is removed upstream',
    })
    atom.config.unset('markdown-preview-plus.markdownItConfig.forceFullToc')
  }
  if (oc.useGitHubStyle !== undefined) {
    atom.config.set(
      'markdown-preview-plus.style',
      oc.useGitHubStyle ? 'github' : 'default',
    )
    unset('useGitHubStyle')
    changes.push(true)
  }
  if (oc.enablePandoc !== undefined) {
    atom.config.set(
      'markdown-preview-plus.renderer',
      oc.enablePandoc ? 'pandoc' : 'markdown-it',
    )
    unset('enablePandoc')
    changes.push(true)
  }
  changes.push(
    migrate(
      oc,
      'markdown-preview-plus.markdownItConfig.breakOnSingleNewline',
      'breakOnSingleNewline',
    ),
    migrate(oc, 'markdown-preview-plus.previewConfig.liveUpdate', 'liveUpdate'),
    migrate(
      oc,
      'markdown-preview-plus.previewConfig.previewSplitPaneDir',
      'previewSplitPaneDir',
    ),
    migrate(
      oc,
      'markdown-preview-plus.previewConfig.previewDock',
      'previewDock',
    ),
    migrate(
      oc,
      'markdown-preview-plus.previewConfig.closePreviewWithEditor',
      'closePreviewWithEditor',
    ),
    migrate(
      oc,
      'markdown-preview-plus.previewConfig.activatePreviewWithEditor',
      'activatePreviewWithEditor',
    ),
    migrate(
      oc,
      'markdown-preview-plus.syncConfig.syncPreviewOnChange',
      'syncPreviewOnChange',
    ),
    migrate(
      oc,
      'markdown-preview-plus.syncConfig.syncPreviewOnEditorScroll',
      'syncPreviewOnEditorScroll',
    ),
    migrate(
      oc,
      'markdown-preview-plus.syncConfig.syncEditorOnPreviewScroll',
      'syncEditorOnPreviewScroll',
    ),
    migrate(
      oc,
      'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault',
      'enableLatexRenderingByDefault',
    ),
    migrate(
      oc,
      'markdown-preview-plus.mathConfig.latexRenderer',
      'latexRenderer',
    ),
    migrate(
      oc,
      'markdown-preview-plus.mathConfig.numberEquations',
      'numberEquations',
    ),
    migrate(
      oc,
      'markdown-preview-plus.markdownItConfig.useLazyHeaders',
      'useLazyHeaders',
    ),
    migrate(
      oc,
      'markdown-preview-plus.markdownItConfig.useCheckBoxes',
      'useCheckBoxes',
    ),
    migrate(oc, 'markdown-preview-plus.markdownItConfig.useEmoji', 'useEmoji'),
    migrate(oc, 'markdown-preview-plus.markdownItConfig.useToc', 'useToc'),
    migrate(
      oc,
      'markdown-preview-plus.markdownItConfig.inlineMathSeparators',
      'inlineMathSeparators',
    ),
    migrate(
      oc,
      'markdown-preview-plus.markdownItConfig.blockMathSeparators',
      'blockMathSeparators',
    ),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.useNativePandocCodeStyles',
      'useNativePandocCodeStyles',
    ),
    migrate(oc, 'markdown-preview-plus.pandocConfig.pandocPath', 'pandocPath'),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.pandocFilters',
      'pandocFilters',
    ),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.pandocArguments',
      'pandocArguments',
    ),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.pandocMarkdownFlavor',
      'pandocMarkdownFlavor',
    ),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.pandocBibliography',
      'pandocBibliography',
    ),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.pandocRemoveReferences',
      'pandocRemoveReferences',
    ),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.pandocBIBFile',
      'pandocBIBFile',
    ),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.pandocBIBFileFallback',
      'pandocBIBFileFallback',
    ),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.pandocCSLFile',
      'pandocCSLFile',
    ),
    migrate(
      oc,
      'markdown-preview-plus.pandocConfig.pandocCSLFileFallback',
      'pandocCSLFileFallback',
    ),
  )
  return changes.some((x) => x === true)
}
