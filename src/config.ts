export interface IConfig {
  [key: string]: {
    title: string
    order: number
    type: string
    description?: string
    properties?: IConfig
    default?: any
    minimum?: any
    maximum?: any
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
  syntaxThemeName: {
    title: 'Syntax theme for code blocks',
    description:
      'If not empty, will try to use the given syntax theme for code blocks in preview',
    type: 'string',
    default: '',
    order: 2.5,
  },
  importPackageStyles: {
    title: 'Packages that can affect preview rendering',
    description:
      'A list of Atom package names that can affect preview style, comma-separated. ' +
      'A special value of `*` (star) will import all Atom styles into the preview, ' +
      'use with care. This does not affect exported HTML',
    type: 'array',
    items: {
      type: 'string',
    },
    default: ['fonts'],
    order: 2.6,
  },
  codeTabWidth: {
    title: 'Tab width for code blocks',
    description:
      'How to render tab character in code blocks;' +
      ' 0 means use Atom global setting',
    type: 'integer',
    default: 0,
    minimum: 0,
    order: 2.7,
  },
  renderer: {
    type: 'string',
    default: 'markdown-it',
    title: 'Renderer backend',
    enum: ['markdown-it', 'pandoc'],
    order: 3,
  },
  richClipboard: {
    type: 'boolean',
    default: true,
    title: 'Use rich clipboard',
    description:
      'Copy rich text to clipboard in addition to raw HTML when using copy html commands',
    order: 4,
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
      previewSplitPaneDir: {
        title: 'Direction to load the preview in split pane',
        type: 'string',
        default: 'right',
        enum: ['down', 'right', 'none'],
        order: 20,
      },
      previewDock: {
        title: 'Open preview in dock',
        type: 'string',
        default: 'center',
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
      shellOpenFileExtensions: {
        title: 'Always open links to these file types externally',
        description:
          'This is a comma-separated list of file name extensions that ' +
          'should always be opened with an external program. ' +
          'For example, if you want to always open PDF files (presumably named `something.pdf`) ' +
          'in system PDF viewer, add `pdf` here.',
        type: 'array',
        default: [
          'odt',
          'doc',
          'docx',
          'ods',
          'xls',
          'xlsx',
          'odp',
          'ppt',
          'pptx',
          'zip',
          'rar',
          '7z',
          'gz',
          'xz',
          'bz2',
          'tar',
          'tgz',
          'txz',
          'tbz2',
        ],
        order: 28,
        items: {
          type: 'string',
        },
      },
    },
  },
  saveConfig: {
    type: 'object',
    title: 'Export Behaviour',
    order: 15,
    properties: {
      mediaOnSaveAsHTMLBehaviour: {
        title: 'When saving as HTML, media paths will be',
        description:
          'Media includes images, audio and video. ' +
          'relative src attributes of img, audio, video tags can either be rewritten ' +
          'to use absolute file paths, paths relative to save location, or be left ' +
          'unaltered',
        type: 'string',
        default: 'relativized',
        enum: ['relativized', 'absolutized', 'untouched'],
        order: 10,
      },
      mediaOnCopyAsHTMLBehaviour: {
        title: 'When copying as HTML, media paths will be',
        description:
          'Media includes images, audio and video. ' +
          'relative src attributes of img, audio, video tags can either be rewritten ' +
          'to use absolute file paths, paths relative to save location, or be left ' +
          'unaltered',
        type: 'string',
        default: 'untouched',
        enum: ['relativized', 'absolutized', 'untouched'],
        order: 15,
      },
      defaultSaveFormat: {
        title: 'Default format to save as',
        type: 'string',
        order: 20,
        enum: ['html', 'pdf'],
        default: 'html',
      },
      saveToPDFOptions: {
        title: 'Save to PDF options',
        type: 'object',
        order: 25,
        properties: {
          latexRenderer: {
            title: 'Math Renderer',
            description:
              'LaTeX Math renderer for PDF export; HTML-CSS usually looks better',
            type: 'string',
            enum: ['Same as live preview', 'HTML-CSS', 'SVG'],
            default: 'Same as live preview',
            order: 5,
          },
          marginsType: {
            title: 'Margins Type',
            type: 'integer',
            enum: [
              { value: 0, description: 'Default margins' },
              { value: 1, description: 'No margins' },
              { value: 2, description: 'Minimum margins' },
            ],
            default: 0,
            order: 10,
          },
          pageSize: {
            title: 'Page Size',
            enum: ['A3', 'A4', 'A5', 'Legal', 'Letter', 'Tabloid', 'Custom'],
            type: 'string',
            default: 'A4',
            order: 20,
          },
          customPageSize: {
            title: 'Custom Page Size',
            description:
              'Takes effect when Page Size is set to `Custom`. Specified as ' +
              '`<width>x<height>`, where `<height>` and `<width>` are ' +
              'floating-point numbers with `.` (dot) as decimal separator, no thousands separator, ' +
              'and with optional `cm`, `mm` or `in` suffix to indicate units, default is `mm`. ' +
              'For example, A4 is `8.3in x 11.7in` or `210mm x 297mm` or `210 x 297`. ' +
              'Whitespace is ignored.',
            type: 'string',
            default: '',
            order: 25,
          },
          landscape: {
            title: 'Page orientation',
            type: 'boolean',
            enum: [
              { value: false, description: 'Portrait' },
              { value: true, description: 'Landscape' },
            ],
            default: false,
            order: 26,
          },
          printBackground: {
            title: 'Render background',
            description: 'Whether to render CSS backgrounds in PDF',
            type: 'boolean',
            default: false,
            order: 30,
          },
          printSelectionOnly: {
            title: 'Render only selection',
            description: 'Only render selected document fragment. Experimental',
            type: 'boolean',
            default: false,
            order: 40,
          },
        },
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
        default: 'SVG',
        order: 5,
      },
      numberEquations: {
        title: 'Number equations',
        description:
          'Number equations that are in equation environment, etc. ' +
          'Will re-render all math on each math change, which might be undesirable.',
        type: 'boolean',
        default: false,
        order: 10,
      },
      texExtensions: {
        title: 'MathJax TeX extensions',
        type: 'array',
        default: [
          'AMSmath.js',
          'AMSsymbols.js',
          'noErrors.js',
          'noUndefined.js',
        ],
        order: 15,
        items: { type: 'string' },
      },
      undefinedFamily: {
        title: 'MathJax `undefinedFamily` (font family)',
        type: 'string',
        default: 'serif',
        order: 20,
      },
    },
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
        default: false,
        order: 20,
      },
      useImsize: {
        title: 'Allow specifying image size in image title',
        description:
          'Allow non-standard syntax for specifying image size via ' +
          'appending `=<width>x<height>` to image spacification, ' +
          'f.ex. `![test](image.png =100x200)`',
        type: 'boolean',
        default: true,
        order: 25,
      },
      useCriticMarkup: {
        title: 'Enable CriticMarkup syntax support',
        description: 'Support is limited to inline only',
        type: 'boolean',
        default: false,
        order: 40,
      },
      useFootnote: {
        title: 'Enable footnotes with markdown-it parser',
        description: 'Render Markdown footnotes a little prettier.',
        type: 'boolean',
        default: false,
        order: 45,
      },
      inlineMathSeparators: {
        title: 'Inline math separators',
        description:
          'List of inline math separators in pairs -- first opening, then closing',
        type: 'array',
        default: ['$', '$', '\\(', '\\)'],
        order: 110,
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
        order: 120,
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
        description:
          "Don't convert fenced code blocks to Atom editors when using" +
          'Pandoc parser',
        order: 0,
      },
      pandocPath: {
        type: 'string',
        default: 'pandoc',
        title: 'Path to Pandoc executable',
        description:
          'Please specify the correct path to your pandoc executable, ' +
          'for example, /usr/bin/pandoc, or C:\\Program Files\\Pandoc\\pandoc.exe',
        order: 5,
      },
      pandocFilters: {
        type: 'array',
        default: [],
        title: 'Filters',
        description:
          'Comma separated pandoc filters, in order of application. Will be passed via command-line arguments',
        order: 10,
        items: {
          type: 'string',
        },
      },
      pandocArguments: {
        type: 'array',
        default: [],
        title: 'Commandline Arguments',
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
        title: 'Markdown Flavor',
        description: 'Enter the pandoc markdown flavor you want',
        order: 20,
      },
      pandocBibliography: {
        type: 'boolean',
        default: false,
        title: 'Citations (via pandoc-citeproc)',
        description:
          'Enable this for bibliography parsing. ' +
          'Note: pandoc-citeproc is applied after other filters specified in ' +
          'Filters, but before other commandline arguments ',
        order: 25,
      },
      pandocRemoveReferences: {
        type: 'boolean',
        default: true,
        title: 'Remove References',
        description: 'Removes references at the end of the HTML preview',
        order: 30,
      },
      pandocBIBFile: {
        type: 'string',
        default: 'bibliography.bib',
        title: 'Bibliography (bibfile)',
        description: 'Name of bibfile to search for recursively',
        order: 35,
      },
      pandocBIBFileFallback: {
        type: 'string',
        default: '',
        title: 'Fallback Bibliography (bibfile)',
        description: 'Full path to fallback bibfile',
        order: 40,
      },
      pandocCSLFile: {
        type: 'string',
        default: 'custom.csl',
        title: 'Bibliography Style (cslfile)',
        description: 'Name of cslfile to search for recursively',
        order: 45,
      },
      pandocCSLFileFallback: {
        type: 'string',
        default: '',
        title: 'Fallback Bibliography Style (cslfile)',
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
    'markdown-preview-plus.syntaxThemeName': string
    'markdown-preview-plus.importPackageStyles': string[]
    'markdown-preview-plus.codeTabWidth': number
    'markdown-preview-plus.renderer': 'markdown-it' | 'pandoc'
    'markdown-preview-plus.richClipboard': boolean
    'markdown-preview-plus.previewConfig.liveUpdate': boolean
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
    'markdown-preview-plus.previewConfig.shellOpenFileExtensions': string[]
    'markdown-preview-plus.previewConfig': {
      liveUpdate: boolean
      previewSplitPaneDir: 'down' | 'right' | 'none'
      previewDock: 'left' | 'right' | 'bottom' | 'center'
      closePreviewWithEditor: boolean
      activatePreviewWithEditor: boolean
      shellOpenFileExtensions: string[]
    }
    'markdown-preview-plus.saveConfig.mediaOnSaveAsHTMLBehaviour':
      | 'relativized'
      | 'absolutized'
      | 'untouched'
    'markdown-preview-plus.saveConfig.mediaOnCopyAsHTMLBehaviour':
      | 'relativized'
      | 'absolutized'
      | 'untouched'
    'markdown-preview-plus.saveConfig.defaultSaveFormat': 'html' | 'pdf'
    'markdown-preview-plus.saveConfig.saveToPDFOptions.latexRenderer':
      | 'Same as live preview'
      | 'HTML-CSS'
      | 'SVG'
    'markdown-preview-plus.saveConfig.saveToPDFOptions.marginsType': 0 | 1 | 2
    'markdown-preview-plus.saveConfig.saveToPDFOptions.pageSize':
      | 'A3'
      | 'A4'
      | 'A5'
      | 'Legal'
      | 'Letter'
      | 'Tabloid'
      | 'Custom'
    'markdown-preview-plus.saveConfig.saveToPDFOptions.customPageSize': string
    'markdown-preview-plus.saveConfig.saveToPDFOptions.landscape': false | true
    'markdown-preview-plus.saveConfig.saveToPDFOptions.printBackground': boolean
    'markdown-preview-plus.saveConfig.saveToPDFOptions.printSelectionOnly': boolean
    'markdown-preview-plus.saveConfig.saveToPDFOptions': {
      latexRenderer: 'Same as live preview' | 'HTML-CSS' | 'SVG'
      marginsType: 0 | 1 | 2
      pageSize: 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter' | 'Tabloid' | 'Custom'
      customPageSize: string
      landscape: false | true
      printBackground: boolean
      printSelectionOnly: boolean
    }
    'markdown-preview-plus.saveConfig': {
      mediaOnSaveAsHTMLBehaviour: 'relativized' | 'absolutized' | 'untouched'
      mediaOnCopyAsHTMLBehaviour: 'relativized' | 'absolutized' | 'untouched'
      defaultSaveFormat: 'html' | 'pdf'
      'saveToPDFOptions.latexRenderer':
        | 'Same as live preview'
        | 'HTML-CSS'
        | 'SVG'
      'saveToPDFOptions.marginsType': 0 | 1 | 2
      'saveToPDFOptions.pageSize':
        | 'A3'
        | 'A4'
        | 'A5'
        | 'Legal'
        | 'Letter'
        | 'Tabloid'
        | 'Custom'
      'saveToPDFOptions.customPageSize': string
      'saveToPDFOptions.landscape': false | true
      'saveToPDFOptions.printBackground': boolean
      'saveToPDFOptions.printSelectionOnly': boolean
      saveToPDFOptions: {
        latexRenderer: 'Same as live preview' | 'HTML-CSS' | 'SVG'
        marginsType: 0 | 1 | 2
        pageSize: 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter' | 'Tabloid' | 'Custom'
        customPageSize: string
        landscape: false | true
        printBackground: boolean
        printSelectionOnly: boolean
      }
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
    'markdown-preview-plus.mathConfig.texExtensions': string[]
    'markdown-preview-plus.mathConfig.undefinedFamily': string
    'markdown-preview-plus.mathConfig': {
      enableLatexRenderingByDefault: boolean
      latexRenderer: 'HTML-CSS' | 'SVG'
      numberEquations: boolean
      texExtensions: string[]
      undefinedFamily: string
    }
    'markdown-preview-plus.markdownItConfig.breakOnSingleNewline': boolean
    'markdown-preview-plus.markdownItConfig.useLazyHeaders': boolean
    'markdown-preview-plus.markdownItConfig.useCheckBoxes': boolean
    'markdown-preview-plus.markdownItConfig.useEmoji': boolean
    'markdown-preview-plus.markdownItConfig.useToc': boolean
    'markdown-preview-plus.markdownItConfig.useImsize': boolean
    'markdown-preview-plus.markdownItConfig.useCriticMarkup': boolean
    'markdown-preview-plus.markdownItConfig.useFootnote': boolean
    'markdown-preview-plus.markdownItConfig.inlineMathSeparators': string[]
    'markdown-preview-plus.markdownItConfig.blockMathSeparators': string[]
    'markdown-preview-plus.markdownItConfig': {
      breakOnSingleNewline: boolean
      useLazyHeaders: boolean
      useCheckBoxes: boolean
      useEmoji: boolean
      useToc: boolean
      useImsize: boolean
      useCriticMarkup: boolean
      useFootnote: boolean
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
      syntaxThemeName: string
      importPackageStyles: string[]
      codeTabWidth: number
      renderer: 'markdown-it' | 'pandoc'
      richClipboard: boolean
      'previewConfig.liveUpdate': boolean
      'previewConfig.previewSplitPaneDir': 'down' | 'right' | 'none'
      'previewConfig.previewDock': 'left' | 'right' | 'bottom' | 'center'
      'previewConfig.closePreviewWithEditor': boolean
      'previewConfig.activatePreviewWithEditor': boolean
      'previewConfig.shellOpenFileExtensions': string[]
      previewConfig: {
        liveUpdate: boolean
        previewSplitPaneDir: 'down' | 'right' | 'none'
        previewDock: 'left' | 'right' | 'bottom' | 'center'
        closePreviewWithEditor: boolean
        activatePreviewWithEditor: boolean
        shellOpenFileExtensions: string[]
      }
      'saveConfig.mediaOnSaveAsHTMLBehaviour':
        | 'relativized'
        | 'absolutized'
        | 'untouched'
      'saveConfig.mediaOnCopyAsHTMLBehaviour':
        | 'relativized'
        | 'absolutized'
        | 'untouched'
      'saveConfig.defaultSaveFormat': 'html' | 'pdf'
      'saveConfig.saveToPDFOptions.latexRenderer':
        | 'Same as live preview'
        | 'HTML-CSS'
        | 'SVG'
      'saveConfig.saveToPDFOptions.marginsType': 0 | 1 | 2
      'saveConfig.saveToPDFOptions.pageSize':
        | 'A3'
        | 'A4'
        | 'A5'
        | 'Legal'
        | 'Letter'
        | 'Tabloid'
        | 'Custom'
      'saveConfig.saveToPDFOptions.customPageSize': string
      'saveConfig.saveToPDFOptions.landscape': false | true
      'saveConfig.saveToPDFOptions.printBackground': boolean
      'saveConfig.saveToPDFOptions.printSelectionOnly': boolean
      'saveConfig.saveToPDFOptions': {
        latexRenderer: 'Same as live preview' | 'HTML-CSS' | 'SVG'
        marginsType: 0 | 1 | 2
        pageSize: 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter' | 'Tabloid' | 'Custom'
        customPageSize: string
        landscape: false | true
        printBackground: boolean
        printSelectionOnly: boolean
      }
      saveConfig: {
        mediaOnSaveAsHTMLBehaviour: 'relativized' | 'absolutized' | 'untouched'
        mediaOnCopyAsHTMLBehaviour: 'relativized' | 'absolutized' | 'untouched'
        defaultSaveFormat: 'html' | 'pdf'
        'saveToPDFOptions.latexRenderer':
          | 'Same as live preview'
          | 'HTML-CSS'
          | 'SVG'
        'saveToPDFOptions.marginsType': 0 | 1 | 2
        'saveToPDFOptions.pageSize':
          | 'A3'
          | 'A4'
          | 'A5'
          | 'Legal'
          | 'Letter'
          | 'Tabloid'
          | 'Custom'
        'saveToPDFOptions.customPageSize': string
        'saveToPDFOptions.landscape': false | true
        'saveToPDFOptions.printBackground': boolean
        'saveToPDFOptions.printSelectionOnly': boolean
        saveToPDFOptions: {
          latexRenderer: 'Same as live preview' | 'HTML-CSS' | 'SVG'
          marginsType: 0 | 1 | 2
          pageSize:
            | 'A3'
            | 'A4'
            | 'A5'
            | 'Legal'
            | 'Letter'
            | 'Tabloid'
            | 'Custom'
          customPageSize: string
          landscape: false | true
          printBackground: boolean
          printSelectionOnly: boolean
        }
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
      'mathConfig.texExtensions': string[]
      'mathConfig.undefinedFamily': string
      mathConfig: {
        enableLatexRenderingByDefault: boolean
        latexRenderer: 'HTML-CSS' | 'SVG'
        numberEquations: boolean
        texExtensions: string[]
        undefinedFamily: string
      }
      'markdownItConfig.breakOnSingleNewline': boolean
      'markdownItConfig.useLazyHeaders': boolean
      'markdownItConfig.useCheckBoxes': boolean
      'markdownItConfig.useEmoji': boolean
      'markdownItConfig.useToc': boolean
      'markdownItConfig.useImsize': boolean
      'markdownItConfig.useCriticMarkup': boolean
      'markdownItConfig.useFootnote': boolean
      'markdownItConfig.inlineMathSeparators': string[]
      'markdownItConfig.blockMathSeparators': string[]
      markdownItConfig: {
        breakOnSingleNewline: boolean
        useLazyHeaders: boolean
        useCheckBoxes: boolean
        useEmoji: boolean
        useToc: boolean
        useImsize: boolean
        useCriticMarkup: boolean
        useFootnote: boolean
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
