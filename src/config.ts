export const config = {
  breakOnSingleNewline: {
    type: 'boolean',
    default: false,
    order: 0,
  },
  liveUpdate: {
    type: 'boolean',
    default: true,
    order: 10,
  },
  openPreviewInSplitPane: {
    type: 'boolean',
    default: true,
    order: 20,
  },
  previewSplitPaneDir: {
    title: 'Direction to load the preview in split pane',
    type: 'string',
    default: 'right' as 'right' | 'down',
    enum: ['down', 'right'],
    order: 25,
  },
  grammars: {
    type: 'array',
    default: [
      'source.gfm',
      'source.litcoffee',
      'text.html.basic',
      'text.md',
      'text.plain',
      'text.plain.null-grammar',
    ],
    order: 30,
    items: {
      type: 'string',
    },
  },
  extensions: {
    type: 'array',
    title: 'Markdown file extensions',
    description: 'Which files are considered Markdown',
    default: ['markdown', 'md', 'mdown', 'mkd', 'mkdown', 'ron', 'txt'],
    order: 31,
    items: {
      type: 'string',
    },
  },
  enableLatexRenderingByDefault: {
    title: 'Enable Math Rendering By Default',
    type: 'boolean',
    default: false,
    order: 40,
  },
  useLazyHeaders: {
    title: 'Use Lazy Headers',
    description: 'Require no space after headings #',
    type: 'boolean',
    default: true,
    order: 45,
  },
  useCheckBoxes: {
    title: 'Enable CheckBox lists',
    description: 'CheckBox lists, like on GitHub',
    type: 'boolean',
    default: true,
    order: 46,
  },
  useEmoji: {
    title: 'Use Emoji',
    description: 'Emoji rendering',
    type: 'boolean',
    default: true,
    order: 47,
  },
  inlineMathSeparators: {
    title: 'Inline math separators',
    description:
      'List of inline math separators in pairs -- first opening, then closing',
    type: 'array',
    default: ['$', '$', '\\(', '\\)'],
    order: 48,
    items: {
      type: 'string',
    },
  },
  blockMathSeparators: {
    title: 'Block math separators',
    description:
      'List of block math separators in pairs -- first opening, then closing',
    type: 'array',
    default: ['$$', '$$', '\\[', '\\]'],
    order: 48.1,
    items: {
      type: 'string',
    },
  },
  useGitHubStyle: {
    title: 'Use GitHub.com style',
    type: 'boolean',
    default: false,
    order: 50,
  },
  enablePandoc: {
    type: 'boolean',
    default: false,
    title: 'Enable Pandoc Parser',
    order: 100,
  },
  useNativePandocCodeStyles: {
    type: 'boolean',
    default: false,
    description: `\
Don't convert fenced code blocks to Atom editors when using
Pandoc parser`,
    order: 105,
  },
  pandocPath: {
    type: 'string',
    default: 'pandoc',
    title: 'Pandoc Options: Path',
    description: 'Please specify the correct path to your pandoc executable',
    dependencies: ['enablePandoc'],
    order: 110,
  },
  pandocFilters: {
    type: 'array',
    default: [] as string[],
    title: 'Pandoc Options: Filters',
    description:
      'Comma separated pandoc filters, in order of application. Will be passed via command-line arguments',
    dependencies: ['enablePandoc'],
    order: 115,
    items: {
      type: 'string',
    },
  },
  pandocArguments: {
    type: 'array',
    default: [] as string[],
    title: 'Pandoc Options: Commandline Arguments',
    description:
      'Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.',
    dependencies: ['enablePandoc'],
    order: 120,
    items: {
      type: 'string',
    },
  },
  pandocMarkdownFlavor: {
    type: 'string',
    default: 'markdown-raw_tex+tex_math_single_backslash',
    title: 'Pandoc Options: Markdown Flavor',
    description: 'Enter the pandoc markdown flavor you want',
    dependencies: ['enablePandoc'],
    order: 130,
  },
  pandocBibliography: {
    type: 'boolean',
    default: false,
    title: 'Pandoc Options: Citations',
    description: `\
Enable this for bibliography parsing.
Note: pandoc-citeproc is applied after other filters specified in
Filters, but before other commandline arguments\
`,
    dependencies: ['enablePandoc'],
    order: 140,
  },
  pandocRemoveReferences: {
    type: 'boolean',
    default: true,
    title: 'Pandoc Options: Remove References',
    description: 'Removes references at the end of the HTML preview',
    dependencies: ['pandocBibliography'],
    order: 150,
  },
  pandocBIBFile: {
    type: 'string',
    default: 'bibliography.bib',
    title: 'Pandoc Options: Bibliography (bibfile)',
    description: 'Name of bibfile to search for recursively',
    dependencies: ['pandocBibliography'],
    order: 160,
  },
  pandocBIBFileFallback: {
    type: 'string',
    default: '',
    title: 'Pandoc Options: Fallback Bibliography (bibfile)',
    description: 'Full path to fallback bibfile',
    dependencies: ['pandocBibliography'],
    order: 165,
  },
  pandocCSLFile: {
    type: 'string',
    default: 'custom.csl',
    title: 'Pandoc Options: Bibliography Style (cslfile)',
    description: 'Name of cslfile to search for recursively',
    dependencies: ['pandocBibliography'],
    order: 170,
  },
  pandocCSLFileFallback: {
    type: 'string',
    default: '',
    title: 'Pandoc Options: Fallback Bibliography Style (cslfile)',
    description: 'Full path to fallback cslfile',
    dependencies: ['pandocBibliography'],
    order: 175,
  },
}

// generated by typed-config.js
declare module 'atom' {
  interface ConfigValues {
    'markdown-preview-plus.breakOnSingleNewline': boolean
    'markdown-preview-plus.liveUpdate': boolean
    'markdown-preview-plus.openPreviewInSplitPane': boolean
    'markdown-preview-plus.previewSplitPaneDir': 'down' | 'right'
    'markdown-preview-plus.grammars': string[]
    'markdown-preview-plus.extensions': string[]
    'markdown-preview-plus.enableLatexRenderingByDefault': boolean
    'markdown-preview-plus.useLazyHeaders': boolean
    'markdown-preview-plus.useCheckBoxes': boolean
    'markdown-preview-plus.useEmoji': boolean
    'markdown-preview-plus.inlineMathSeparators': string[]
    'markdown-preview-plus.blockMathSeparators': string[]
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
      extensions: string[]
      enableLatexRenderingByDefault: boolean
      useLazyHeaders: boolean
      useCheckBoxes: boolean
      useEmoji: boolean
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
  }
}
