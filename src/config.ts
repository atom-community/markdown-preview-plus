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
    default: 'right',
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
    default: [],
    title: 'Pandoc Options: Filters',
    description:
      'Comma separated pandoc filters, in order of application. Will be passed via command-line arguments',
    dependencies: ['enablePandoc'],
    order: 115,
  },
  pandocArguments: {
    type: 'array',
    default: [],
    title: 'Pandoc Options: Commandline Arguments',
    description:
      'Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.',
    dependencies: ['enablePandoc'],
    order: 120,
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
