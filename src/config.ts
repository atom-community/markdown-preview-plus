export interface IConfig {
  [key: string]: {
    title: string
    order: number
    type: string
    description?: string
    properties?: IConfig
    default?: any
    enum?: any[]
    items?: {
      type: string
    }
  }
}

export const config: IConfig = {
  grammars: {
    title: 'Markdown Grammars',
    description: 'Editors using what grammars are considered Markdown',
    type: 'array',
    default: [
      'source.gfm',
      'source.litcoffee',
      'text.html.basic',
      'text.md',
      'text.plain',
      'text.plain.null-grammar',
    ],
    order: 0,
    items: {
      type: 'string',
    },
  },
  extensions: {
    type: 'array',
    title: 'Markdown file extensions',
    description: 'Which files are considered Markdown',
    default: ['markdown', 'md', 'mdown', 'mkd', 'mkdown', 'ron', 'txt'],
    order: 1,
    items: {
      type: 'string',
    },
  },
  useGitHubStyle: {
    title: 'Use GitHub.com style',
    type: 'boolean',
    default: false,
    order: 2,
  },
  previewConfig: {
    title: 'Preview Behaviour',
    order: 10,
    type: 'object',
    properties: {
      liveUpdate: {
        title: 'Live Update',
        type: 'boolean',
        default: true,
        order: 10,
      },
      relativizeMediaOnSave: {
        title: 'Relativize media paths when saved as HTML',
        type: 'boolean',
        default: true,
        order: 15,
      },
      previewSplitPaneDir: {
        title: 'Direction to load the preview in split pane',
        type: 'string',
        default: 'right' as 'right' | 'down' | 'none',
        enum: ['down', 'right', 'none'],
        order: 20,
      },
      previewDock: {
        title: 'Open preview in dock',
        type: 'string',
        default: 'center' as 'left' | 'right' | 'bottom' | 'center',
        enum: ['left', 'right', 'bottom', 'center'],
        order: 25,
      },
      closePreviewWithEditor: {
        title: 'Close preview when editor closes',
        type: 'boolean',
        default: true,
        order: 26,
      },
      activatePreviewWithEditor: {
        title: 'Bring up preview when editor activates',
        type: 'boolean',
        default: false,
        order: 27,
      },
    },
  },
  syncConfig: {
    title: 'Preview position synchronization behaviour',
    type: 'object',
    order: 20,
    properties: {
      syncPreviewOnChange: {
        title: 'Sync preview position when text in editor changes',
        type: 'boolean',
        default: false,
        order: 28,
      },
      syncPreviewOnEditorScroll: {
        title: 'Sync preview position when text editor is scrolled',
        description:
          'Note: if both scroll sync options are enabled, the editor ' +
          'has to be in active pane for this option to take effect',
        type: 'boolean',
        default: false,
        order: 28.1,
      },
      syncEditorOnPreviewScroll: {
        title: 'Sync editor position when preview is scrolled',
        description:
          'Note: if both scroll sync options are enabled, the preview ' +
          'has to be in active pane for this option to take effect',
        type: 'boolean',
        default: false,
        order: 28.2,
      },
    },
  },
  mathConfig: {
    type: 'object',
    title: 'Math Options',
    order: 30,
    properties: {
      enableLatexRenderingByDefault: {
        title: 'Enable Math Rendering By Default',
        type: 'boolean',
        default: false,
        order: 0,
      },
      latexRenderer: {
        title: 'Math Renderer',
        description:
          'SVG is noticeably faster, but might look worse on some systems',
        type: 'string',
        enum: ['HTML-CSS', 'SVG'],
        default: 'SVG' as 'HTML-CSS' | 'SVG',
        order: 5,
      },
      numberEquations: {
        title: 'Number equations',
        description:
          'Number equations that are in equation environment, etc. ' +
          'Requires preview reopen to take effect. ' +
          'Will re-render all math on each math change, which might be undesirable.',
        type: 'boolean',
        default: false,
        order: 10,
      },
    },
  },
  renderer: {
    type: 'string',
    default: 'markdown-it' as 'markdown-it' | 'pandoc',
    title: 'Renderer backend',
    enum: ['markdown-it', 'pandoc'],
    order: 35,
  },
  markdownItConfig: {
    type: 'object',
    title: 'Markdown-It Settings',
    order: 40,
    properties: {
      breakOnSingleNewline: {
        title: 'Break on single newline',
        type: 'boolean',
        default: false,
        order: 0,
      },
      useLazyHeaders: {
        title: 'Use Lazy Headers with markdown-it parser',
        description: 'Require no space after headings #',
        type: 'boolean',
        default: true,
        order: 5,
      },
      useCheckBoxes: {
        title: 'Enable CheckBox lists with markdown-it parser',
        description: 'CheckBox lists, like on GitHub',
        type: 'boolean',
        default: true,
        order: 10,
      },
      useEmoji: {
        title: 'Use Emoji with markdown-it parser',
        description: 'Emoji rendering',
        type: 'boolean',
        default: true,
        order: 15,
      },
      useToc: {
        title: 'Use table of contents with markdown-it parser',
        description: 'Replace [[toc]] with autogenerated table of contents',
        type: 'boolean',
        default: true,
        order: 20,
      },
      inlineMathSeparators: {
        title: 'Inline math separators',
        description:
          'List of inline math separators in pairs -- first opening, then closing',
        type: 'array',
        default: ['$', '$', '\\(', '\\)'],
        order: 25,
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
        order: 30,
        items: {
          type: 'string',
        },
      },
    },
  },
  pandocConfig: {
    type: 'object',
    title: 'Pandoc settings',
    order: 50,
    properties: {
      useNativePandocCodeStyles: {
        title: 'Use native Pandoc code block style',
        type: 'boolean',
        default: false,
        description: `\
    Don't convert fenced code blocks to Atom editors when using
    Pandoc parser`,
        order: 0,
      },
      pandocPath: {
        type: 'string',
        default: 'pandoc',
        title: 'Pandoc Options: Path',
        description:
          'Please specify the correct path to your pandoc executable',
        order: 5,
      },
      pandocFilters: {
        type: 'array',
        default: [] as string[],
        title: 'Pandoc Options: Filters',
        description:
          'Comma separated pandoc filters, in order of application. Will be passed via command-line arguments',
        order: 10,
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
        order: 15,
        items: {
          type: 'string',
        },
      },
      pandocMarkdownFlavor: {
        type: 'string',
        default: 'markdown-raw_tex+tex_math_single_backslash',
        title: 'Pandoc Options: Markdown Flavor',
        description: 'Enter the pandoc markdown flavor you want',
        order: 20,
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
        order: 25,
      },
      pandocRemoveReferences: {
        type: 'boolean',
        default: true,
        title: 'Pandoc Options: Remove References',
        description: 'Removes references at the end of the HTML preview',
        order: 30,
      },
      pandocBIBFile: {
        type: 'string',
        default: 'bibliography.bib',
        title: 'Pandoc Options: Bibliography (bibfile)',
        description: 'Name of bibfile to search for recursively',
        order: 35,
      },
      pandocBIBFileFallback: {
        type: 'string',
        default: '',
        title: 'Pandoc Options: Fallback Bibliography (bibfile)',
        description: 'Full path to fallback bibfile',
        order: 40,
      },
      pandocCSLFile: {
        type: 'string',
        default: 'custom.csl',
        title: 'Pandoc Options: Bibliography Style (cslfile)',
        description: 'Name of cslfile to search for recursively',
        order: 45,
      },
      pandocCSLFileFallback: {
        type: 'string',
        default: '',
        title: 'Pandoc Options: Fallback Bibliography Style (cslfile)',
        description: 'Full path to fallback cslfile',
        order: 50,
      },
    },
  },
}

// generated by typed-config.js
declare module 'atom' {
  interface ConfigValues {
    'markdown-preview-plus.grammars': string[]
    'markdown-preview-plus.extensions': string[]
    'markdown-preview-plus.useGitHubStyle': boolean
    'markdown-preview-plus.previewConfig.liveUpdate': boolean
    'markdown-preview-plus.previewConfig.relativizeMediaOnSave': boolean
    'markdown-preview-plus.previewConfig.previewSplitPaneDir':
      | 'down'
      | 'right'
      | 'none'
    'markdown-preview-plus.previewConfig.previewDock':
      | 'left'
      | 'right'
      | 'bottom'
      | 'center'
    'markdown-preview-plus.previewConfig.closePreviewWithEditor': boolean
    'markdown-preview-plus.previewConfig.activatePreviewWithEditor': boolean
    'markdown-preview-plus.previewConfig': {
      liveUpdate: boolean
      relativizeMediaOnSave: boolean
      previewSplitPaneDir: 'down' | 'right' | 'none'
      previewDock: 'left' | 'right' | 'bottom' | 'center'
      closePreviewWithEditor: boolean
      activatePreviewWithEditor: boolean
    }
    'markdown-preview-plus.syncConfig.syncPreviewOnChange': boolean
    'markdown-preview-plus.syncConfig.syncPreviewOnEditorScroll': boolean
    'markdown-preview-plus.syncConfig.syncEditorOnPreviewScroll': boolean
    'markdown-preview-plus.syncConfig': {
      syncPreviewOnChange: boolean
      syncPreviewOnEditorScroll: boolean
      syncEditorOnPreviewScroll: boolean
    }
    'markdown-preview-plus.mathConfig.enableLatexRenderingByDefault': boolean
    'markdown-preview-plus.mathConfig.latexRenderer': 'HTML-CSS' | 'SVG'
    'markdown-preview-plus.mathConfig.numberEquations': boolean
    'markdown-preview-plus.mathConfig': {
      enableLatexRenderingByDefault: boolean
      latexRenderer: 'HTML-CSS' | 'SVG'
      numberEquations: boolean
    }
    'markdown-preview-plus.renderer': 'markdown-it' | 'pandoc'
    'markdown-preview-plus.markdownItConfig.breakOnSingleNewline': boolean
    'markdown-preview-plus.markdownItConfig.useLazyHeaders': boolean
    'markdown-preview-plus.markdownItConfig.useCheckBoxes': boolean
    'markdown-preview-plus.markdownItConfig.useEmoji': boolean
    'markdown-preview-plus.markdownItConfig.useToc': boolean
    'markdown-preview-plus.markdownItConfig.inlineMathSeparators': string[]
    'markdown-preview-plus.markdownItConfig.blockMathSeparators': string[]
    'markdown-preview-plus.markdownItConfig': {
      breakOnSingleNewline: boolean
      useLazyHeaders: boolean
      useCheckBoxes: boolean
      useEmoji: boolean
      useToc: boolean
      inlineMathSeparators: string[]
      blockMathSeparators: string[]
    }
    'markdown-preview-plus.pandocConfig.useNativePandocCodeStyles': boolean
    'markdown-preview-plus.pandocConfig.pandocPath': string
    'markdown-preview-plus.pandocConfig.pandocFilters': string[]
    'markdown-preview-plus.pandocConfig.pandocArguments': string[]
    'markdown-preview-plus.pandocConfig.pandocMarkdownFlavor': string
    'markdown-preview-plus.pandocConfig.pandocBibliography': boolean
    'markdown-preview-plus.pandocConfig.pandocRemoveReferences': boolean
    'markdown-preview-plus.pandocConfig.pandocBIBFile': string
    'markdown-preview-plus.pandocConfig.pandocBIBFileFallback': string
    'markdown-preview-plus.pandocConfig.pandocCSLFile': string
    'markdown-preview-plus.pandocConfig.pandocCSLFileFallback': string
    'markdown-preview-plus.pandocConfig': {
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
    'markdown-preview-plus': {
      grammars: string[]
      extensions: string[]
      useGitHubStyle: boolean
      'previewConfig.liveUpdate': boolean
      'previewConfig.relativizeMediaOnSave': boolean
      'previewConfig.previewSplitPaneDir': 'down' | 'right' | 'none'
      'previewConfig.previewDock': 'left' | 'right' | 'bottom' | 'center'
      'previewConfig.closePreviewWithEditor': boolean
      'previewConfig.activatePreviewWithEditor': boolean
      previewConfig: {
        liveUpdate: boolean
        relativizeMediaOnSave: boolean
        previewSplitPaneDir: 'down' | 'right' | 'none'
        previewDock: 'left' | 'right' | 'bottom' | 'center'
        closePreviewWithEditor: boolean
        activatePreviewWithEditor: boolean
      }
      'syncConfig.syncPreviewOnChange': boolean
      'syncConfig.syncPreviewOnEditorScroll': boolean
      'syncConfig.syncEditorOnPreviewScroll': boolean
      syncConfig: {
        syncPreviewOnChange: boolean
        syncPreviewOnEditorScroll: boolean
        syncEditorOnPreviewScroll: boolean
      }
      'mathConfig.enableLatexRenderingByDefault': boolean
      'mathConfig.latexRenderer': 'HTML-CSS' | 'SVG'
      'mathConfig.numberEquations': boolean
      mathConfig: {
        enableLatexRenderingByDefault: boolean
        latexRenderer: 'HTML-CSS' | 'SVG'
        numberEquations: boolean
      }
      renderer: 'markdown-it' | 'pandoc'
      'markdownItConfig.breakOnSingleNewline': boolean
      'markdownItConfig.useLazyHeaders': boolean
      'markdownItConfig.useCheckBoxes': boolean
      'markdownItConfig.useEmoji': boolean
      'markdownItConfig.useToc': boolean
      'markdownItConfig.inlineMathSeparators': string[]
      'markdownItConfig.blockMathSeparators': string[]
      markdownItConfig: {
        breakOnSingleNewline: boolean
        useLazyHeaders: boolean
        useCheckBoxes: boolean
        useEmoji: boolean
        useToc: boolean
        inlineMathSeparators: string[]
        blockMathSeparators: string[]
      }
      'pandocConfig.useNativePandocCodeStyles': boolean
      'pandocConfig.pandocPath': string
      'pandocConfig.pandocFilters': string[]
      'pandocConfig.pandocArguments': string[]
      'pandocConfig.pandocMarkdownFlavor': string
      'pandocConfig.pandocBibliography': boolean
      'pandocConfig.pandocRemoveReferences': boolean
      'pandocConfig.pandocBIBFile': string
      'pandocConfig.pandocBIBFileFallback': string
      'pandocConfig.pandocCSLFile': string
      'pandocConfig.pandocCSLFileFallback': string
      pandocConfig: {
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
}
