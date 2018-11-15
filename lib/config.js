"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
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
        description: 'If not empty, will try to use the given syntax theme for code blocks in preview',
        type: 'string',
        default: '',
        order: 2.5,
    },
    importPackageStyles: {
        title: 'Packages that can affect preview rendering',
        description: 'A list of Atom package names that can affect preview style, comma-separated. ' +
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
        description: 'How to render tab character in code blocks;' +
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
        description: 'Copy rich text to clipboard in addition to raw HTML when using copy html commands',
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
                description: 'This is a comma-separated list of file name extensions that ' +
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
                description: 'Media includes images, audio and video. ' +
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
                description: 'Media includes images, audio and video. ' +
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
                        description: 'Takes effect when Page Size is set to `Custom`. Specified as ' +
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
                description: 'Note: if both scroll sync options are enabled, the editor ' +
                    'has to be in active pane for this option to take effect',
                type: 'boolean',
                default: false,
                order: 28.1,
            },
            syncEditorOnPreviewScroll: {
                title: 'Sync editor position when preview is scrolled',
                description: 'Note: if both scroll sync options are enabled, the preview ' +
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
                description: 'SVG is noticeably faster, but might look worse on some systems',
                type: 'string',
                enum: ['HTML-CSS', 'SVG'],
                default: 'SVG',
                order: 5,
            },
            numberEquations: {
                title: 'Number equations',
                description: 'Number equations that are in equation environment, etc. ' +
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
                default: true,
                order: 20,
            },
            useImsize: {
                title: 'Allow specifying image size in image title',
                description: 'Allow non-standard syntax for specifying image size via ' +
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
            inlineMathSeparators: {
                title: 'Inline math separators',
                description: 'List of inline math separators in pairs -- first opening, then closing',
                type: 'array',
                default: ['$', '$', '\\(', '\\)'],
                order: 110,
                items: {
                    type: 'string',
                },
            },
            blockMathSeparators: {
                title: 'Block math separators',
                description: 'List of block math separators in pairs -- first opening, then closing',
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
                description: "Don't convert fenced code blocks to Atom editors when using" +
                    'Pandoc parser',
                order: 0,
            },
            pandocPath: {
                type: 'string',
                default: 'pandoc',
                title: 'Path to Pandoc executable',
                description: 'Please specify the correct path to your pandoc executable, ' +
                    'for example, /usr/bin/pandoc, or C:\\Program Files\\Pandoc\\pandoc.exe',
                order: 5,
            },
            pandocFilters: {
                type: 'array',
                default: [],
                title: 'Filters',
                description: 'Comma separated pandoc filters, in order of application. Will be passed via command-line arguments',
                order: 10,
                items: {
                    type: 'string',
                },
            },
            pandocArguments: {
                type: 'array',
                default: [],
                title: 'Commandline Arguments',
                description: 'Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.',
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
                description: 'Enable this for bibliography parsing. ' +
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWlCYSxRQUFBLE1BQU0sR0FBWTtJQUM3QixRQUFRLEVBQUU7UUFDUixLQUFLLEVBQUUsbUJBQW1CO1FBQzFCLFdBQVcsRUFBRSxxREFBcUQ7UUFDbEUsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUU7WUFDUCxZQUFZO1lBQ1osa0JBQWtCO1lBQ2xCLGlCQUFpQjtZQUNqQixTQUFTO1lBQ1QsWUFBWTtZQUNaLHlCQUF5QjtTQUMxQjtRQUNELEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ25FLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsS0FBSyxFQUFFLHNCQUFzQjtRQUM3QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELGVBQWUsRUFBRTtRQUNmLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsV0FBVyxFQUNULGlGQUFpRjtRQUNuRixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLEdBQUc7S0FDWDtJQUNELG1CQUFtQixFQUFFO1FBQ25CLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsV0FBVyxFQUNULCtFQUErRTtZQUMvRSw4RUFB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QUFFLDJDQUEyQztnQkFDeEQsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELHFCQUFxQixFQUFFO2dCQUNyQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsRUFBRTtnQkFDWCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxXQUFXLEVBQUUsK0JBQStCO2dCQUM1QyxLQUFLLEVBQUUsRUFBRTthQUNWO1NBQ0Y7S0FDRjtDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIElDb25maWcge1xyXG4gIFtrZXk6IHN0cmluZ106IHtcclxuICAgIHRpdGxlOiBzdHJpbmdcclxuICAgIG9yZGVyOiBudW1iZXJcclxuICAgIHR5cGU6IHN0cmluZ1xyXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmdcclxuICAgIHByb3BlcnRpZXM/OiBJQ29uZmlnXHJcbiAgICBkZWZhdWx0PzogYW55XHJcbiAgICBtaW5pbXVtPzogYW55XHJcbiAgICBtYXhpbXVtPzogYW55XHJcbiAgICBlbnVtPzogYW55W11cclxuICAgIGl0ZW1zPzoge1xyXG4gICAgICB0eXBlOiBzdHJpbmdcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWc6IElDb25maWcgPSB7XHJcbiAgZ3JhbW1hcnM6IHtcclxuICAgIHRpdGxlOiAnTWFya2Rvd24gR3JhbW1hcnMnLFxyXG4gICAgZGVzY3JpcHRpb246ICdFZGl0b3JzIHVzaW5nIHdoYXQgZ3JhbW1hcnMgYXJlIGNvbnNpZGVyZWQgTWFya2Rvd24nLFxyXG4gICAgdHlwZTogJ2FycmF5JyxcclxuICAgIGRlZmF1bHQ6IFtcclxuICAgICAgJ3NvdXJjZS5nZm0nLFxyXG4gICAgICAnc291cmNlLmxpdGNvZmZlZScsXHJcbiAgICAgICd0ZXh0Lmh0bWwuYmFzaWMnLFxyXG4gICAgICAndGV4dC5tZCcsXHJcbiAgICAgICd0ZXh0LnBsYWluJyxcclxuICAgICAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJyxcclxuICAgIF0sXHJcbiAgICBvcmRlcjogMCxcclxuICAgIGl0ZW1zOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGV4dGVuc2lvbnM6IHtcclxuICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICB0aXRsZTogJ01hcmtkb3duIGZpbGUgZXh0ZW5zaW9ucycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1doaWNoIGZpbGVzIGFyZSBjb25zaWRlcmVkIE1hcmtkb3duJyxcclxuICAgIGRlZmF1bHQ6IFsnbWFya2Rvd24nLCAnbWQnLCAnbWRvd24nLCAnbWtkJywgJ21rZG93bicsICdyb24nLCAndHh0J10sXHJcbiAgICBvcmRlcjogMSxcclxuICAgIGl0ZW1zOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHVzZUdpdEh1YlN0eWxlOiB7XHJcbiAgICB0aXRsZTogJ1VzZSBHaXRIdWIuY29tIHN0eWxlJyxcclxuICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgb3JkZXI6IDIsXHJcbiAgfSxcclxuICBzeW50YXhUaGVtZU5hbWU6IHtcclxuICAgIHRpdGxlOiAnU3ludGF4IHRoZW1lIGZvciBjb2RlIGJsb2NrcycsXHJcbiAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgJ0lmIG5vdCBlbXB0eSwgd2lsbCB0cnkgdG8gdXNlIHRoZSBnaXZlbiBzeW50YXggdGhlbWUgZm9yIGNvZGUgYmxvY2tzIGluIHByZXZpZXcnLFxyXG4gICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICBkZWZhdWx0OiAnJyxcclxuICAgIG9yZGVyOiAyLjUsXHJcbiAgfSxcclxuICBpbXBvcnRQYWNrYWdlU3R5bGVzOiB7XHJcbiAgICB0aXRsZTogJ1BhY2thZ2VzIHRoYXQgY2FuIGFmZmVjdCBwcmV2aWV3IHJlbmRlcmluZycsXHJcbiAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgJ0EgbGlzdCBvZiBBdG9tIHBhY2thZ2UgbmFtZXMgdGhhdCBjYW4gYWZmZWN0IHByZXZpZXcgc3R5bGUsIGNvbW1hLXNlcGFyYXRlZC4gJyArXHJcbiAgICAgICdBIHNwZWNpYWwgdmFsdWUgb2YgYCpgIChzdGFyKSB3aWxsIGltcG9ydCBhbGwgQXRvbSBzdHlsZXMgaW50byB0aGUgcHJldmlldywgJyArXHJcbiAgICAgICd1c2Ugd2l0aCBjYXJlLiBUaGlzIGRvZXMgbm90IGFmZmVjdCBleHBvcnRlZCBIVE1MJyxcclxuICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICBpdGVtczoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIH0sXHJcbiAgICBkZWZhdWx0OiBbJ2ZvbnRzJ10sXHJcbiAgICBvcmRlcjogMi42LFxyXG4gIH0sXHJcbiAgY29kZVRhYldpZHRoOiB7XHJcbiAgICB0aXRsZTogJ1RhYiB3aWR0aCBmb3IgY29kZSBibG9ja3MnLFxyXG4gICAgZGVzY3JpcHRpb246XHJcbiAgICAgICdIb3cgdG8gcmVuZGVyIHRhYiBjaGFyYWN0ZXIgaW4gY29kZSBibG9ja3M7JyArXHJcbiAgICAgICcgMCBtZWFucyB1c2UgQXRvbSBnbG9iYWwgc2V0dGluZycsXHJcbiAgICB0eXBlOiAnaW50ZWdlcicsXHJcbiAgICBkZWZhdWx0OiAwLFxyXG4gICAgbWluaW11bTogMCxcclxuICAgIG9yZGVyOiAyLjcsXHJcbiAgfSxcclxuICByZW5kZXJlcjoge1xyXG4gICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICBkZWZhdWx0OiAnbWFya2Rvd24taXQnLFxyXG4gICAgdGl0bGU6ICdSZW5kZXJlciBiYWNrZW5kJyxcclxuICAgIGVudW06IFsnbWFya2Rvd24taXQnLCAncGFuZG9jJ10sXHJcbiAgICBvcmRlcjogMyxcclxuICB9LFxyXG4gIHJpY2hDbGlwYm9hcmQ6IHtcclxuICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICB0aXRsZTogJ1VzZSByaWNoIGNsaXBib2FyZCcsXHJcbiAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgJ0NvcHkgcmljaCB0ZXh0IHRvIGNsaXBib2FyZCBpbiBhZGRpdGlvbiB0byByYXcgSFRNTCB3aGVuIHVzaW5nIGNvcHkgaHRtbCBjb21tYW5kcycsXHJcbiAgICBvcmRlcjogNCxcclxuICB9LFxyXG4gIHByZXZpZXdDb25maWc6IHtcclxuICAgIHRpdGxlOiAnUHJldmlldyBCZWhhdmlvdXInLFxyXG4gICAgb3JkZXI6IDEwLFxyXG4gICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgIGxpdmVVcGRhdGU6IHtcclxuICAgICAgICB0aXRsZTogJ0xpdmUgVXBkYXRlJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICBvcmRlcjogMTAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6IHtcclxuICAgICAgICB0aXRsZTogJ0RpcmVjdGlvbiB0byBsb2FkIHRoZSBwcmV2aWV3IGluIHNwbGl0IHBhbmUnLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdyaWdodCcsXHJcbiAgICAgICAgZW51bTogWydkb3duJywgJ3JpZ2h0JywgJ25vbmUnXSxcclxuICAgICAgICBvcmRlcjogMjAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHByZXZpZXdEb2NrOiB7XHJcbiAgICAgICAgdGl0bGU6ICdPcGVuIHByZXZpZXcgaW4gZG9jaycsXHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJ2NlbnRlcicsXHJcbiAgICAgICAgZW51bTogWydsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbScsICdjZW50ZXInXSxcclxuICAgICAgICBvcmRlcjogMjUsXHJcbiAgICAgIH0sXHJcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IHtcclxuICAgICAgICB0aXRsZTogJ0Nsb3NlIHByZXZpZXcgd2hlbiBlZGl0b3IgY2xvc2VzJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICBvcmRlcjogMjYsXHJcbiAgICAgIH0sXHJcbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IHtcclxuICAgICAgICB0aXRsZTogJ0JyaW5nIHVwIHByZXZpZXcgd2hlbiBlZGl0b3IgYWN0aXZhdGVzJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgb3JkZXI6IDI3LFxyXG4gICAgICB9LFxyXG4gICAgICBzaGVsbE9wZW5GaWxlRXh0ZW5zaW9uczoge1xyXG4gICAgICAgIHRpdGxlOiAnQWx3YXlzIG9wZW4gbGlua3MgdG8gdGhlc2UgZmlsZSB0eXBlcyBleHRlcm5hbGx5JyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdUaGlzIGlzIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgZmlsZSBuYW1lIGV4dGVuc2lvbnMgdGhhdCAnICtcclxuICAgICAgICAgICdzaG91bGQgYWx3YXlzIGJlIG9wZW5lZCB3aXRoIGFuIGV4dGVybmFsIHByb2dyYW0uICcgK1xyXG4gICAgICAgICAgJ0ZvciBleGFtcGxlLCBpZiB5b3Ugd2FudCB0byBhbHdheXMgb3BlbiBQREYgZmlsZXMgKHByZXN1bWFibHkgbmFtZWQgYHNvbWV0aGluZy5wZGZgKSAnICtcclxuICAgICAgICAgICdpbiBzeXN0ZW0gUERGIHZpZXdlciwgYWRkIGBwZGZgIGhlcmUuJyxcclxuICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgIGRlZmF1bHQ6IFtcclxuICAgICAgICAgICdvZHQnLFxyXG4gICAgICAgICAgJ2RvYycsXHJcbiAgICAgICAgICAnZG9jeCcsXHJcbiAgICAgICAgICAnb2RzJyxcclxuICAgICAgICAgICd4bHMnLFxyXG4gICAgICAgICAgJ3hsc3gnLFxyXG4gICAgICAgICAgJ29kcCcsXHJcbiAgICAgICAgICAncHB0JyxcclxuICAgICAgICAgICdwcHR4JyxcclxuICAgICAgICAgICd6aXAnLFxyXG4gICAgICAgICAgJ3JhcicsXHJcbiAgICAgICAgICAnN3onLFxyXG4gICAgICAgICAgJ2d6JyxcclxuICAgICAgICAgICd4eicsXHJcbiAgICAgICAgICAnYnoyJyxcclxuICAgICAgICAgICd0YXInLFxyXG4gICAgICAgICAgJ3RneicsXHJcbiAgICAgICAgICAndHh6JyxcclxuICAgICAgICAgICd0YnoyJyxcclxuICAgICAgICBdLFxyXG4gICAgICAgIG9yZGVyOiAyOCxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBzYXZlQ29uZmlnOiB7XHJcbiAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgIHRpdGxlOiAnRXhwb3J0IEJlaGF2aW91cicsXHJcbiAgICBvcmRlcjogMTUsXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiB7XHJcbiAgICAgICAgdGl0bGU6ICdXaGVuIHNhdmluZyBhcyBIVE1MLCBtZWRpYSBwYXRocyB3aWxsIGJlJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdNZWRpYSBpbmNsdWRlcyBpbWFnZXMsIGF1ZGlvIGFuZCB2aWRlby4gJyArXHJcbiAgICAgICAgICAncmVsYXRpdmUgc3JjIGF0dHJpYnV0ZXMgb2YgaW1nLCBhdWRpbywgdmlkZW8gdGFncyBjYW4gZWl0aGVyIGJlIHJld3JpdHRlbiAnICtcclxuICAgICAgICAgICd0byB1c2UgYWJzb2x1dGUgZmlsZSBwYXRocywgcGF0aHMgcmVsYXRpdmUgdG8gc2F2ZSBsb2NhdGlvbiwgb3IgYmUgbGVmdCAnICtcclxuICAgICAgICAgICd1bmFsdGVyZWQnLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdyZWxhdGl2aXplZCcsXHJcbiAgICAgICAgZW51bTogWydyZWxhdGl2aXplZCcsICdhYnNvbHV0aXplZCcsICd1bnRvdWNoZWQnXSxcclxuICAgICAgICBvcmRlcjogMTAsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiB7XHJcbiAgICAgICAgdGl0bGU6ICdXaGVuIGNvcHlpbmcgYXMgSFRNTCwgbWVkaWEgcGF0aHMgd2lsbCBiZScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnTWVkaWEgaW5jbHVkZXMgaW1hZ2VzLCBhdWRpbyBhbmQgdmlkZW8uICcgK1xyXG4gICAgICAgICAgJ3JlbGF0aXZlIHNyYyBhdHRyaWJ1dGVzIG9mIGltZywgYXVkaW8sIHZpZGVvIHRhZ3MgY2FuIGVpdGhlciBiZSByZXdyaXR0ZW4gJyArXHJcbiAgICAgICAgICAndG8gdXNlIGFic29sdXRlIGZpbGUgcGF0aHMsIHBhdGhzIHJlbGF0aXZlIHRvIHNhdmUgbG9jYXRpb24sIG9yIGJlIGxlZnQgJyArXHJcbiAgICAgICAgICAndW5hbHRlcmVkJyxcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICBkZWZhdWx0OiAndW50b3VjaGVkJyxcclxuICAgICAgICBlbnVtOiBbJ3JlbGF0aXZpemVkJywgJ2Fic29sdXRpemVkJywgJ3VudG91Y2hlZCddLFxyXG4gICAgICAgIG9yZGVyOiAxNSxcclxuICAgICAgfSxcclxuICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6IHtcclxuICAgICAgICB0aXRsZTogJ0RlZmF1bHQgZm9ybWF0IHRvIHNhdmUgYXMnLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIG9yZGVyOiAyMCxcclxuICAgICAgICBlbnVtOiBbJ2h0bWwnLCAncGRmJ10sXHJcbiAgICAgICAgZGVmYXVsdDogJ2h0bWwnLFxyXG4gICAgICB9LFxyXG4gICAgICBzYXZlVG9QREZPcHRpb25zOiB7XHJcbiAgICAgICAgdGl0bGU6ICdTYXZlIHRvIFBERiBvcHRpb25zJyxcclxuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICBvcmRlcjogMjUsXHJcbiAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgbWFyZ2luc1R5cGU6IHtcclxuICAgICAgICAgICAgdGl0bGU6ICdNYXJnaW5zIFR5cGUnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXHJcbiAgICAgICAgICAgIGVudW06IFtcclxuICAgICAgICAgICAgICB7IHZhbHVlOiAwLCBkZXNjcmlwdGlvbjogJ0RlZmF1bHQgbWFyZ2lucycgfSxcclxuICAgICAgICAgICAgICB7IHZhbHVlOiAxLCBkZXNjcmlwdGlvbjogJ05vIG1hcmdpbnMnIH0sXHJcbiAgICAgICAgICAgICAgeyB2YWx1ZTogMiwgZGVzY3JpcHRpb246ICdNaW5pbXVtIG1hcmdpbnMnIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IDAsXHJcbiAgICAgICAgICAgIG9yZGVyOiAxMCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBwYWdlU2l6ZToge1xyXG4gICAgICAgICAgICB0aXRsZTogJ1BhZ2UgU2l6ZScsXHJcbiAgICAgICAgICAgIGVudW06IFsnQTMnLCAnQTQnLCAnQTUnLCAnTGVnYWwnLCAnTGV0dGVyJywgJ1RhYmxvaWQnLCAnQ3VzdG9tJ10sXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnQTQnLFxyXG4gICAgICAgICAgICBvcmRlcjogMjAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgY3VzdG9tUGFnZVNpemU6IHtcclxuICAgICAgICAgICAgdGl0bGU6ICdDdXN0b20gUGFnZSBTaXplJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAgICAgJ1Rha2VzIGVmZmVjdCB3aGVuIFBhZ2UgU2l6ZSBpcyBzZXQgdG8gYEN1c3RvbWAuIFNwZWNpZmllZCBhcyAnICtcclxuICAgICAgICAgICAgICAnYDx3aWR0aD54PGhlaWdodD5gLCB3aGVyZSBgPGhlaWdodD5gIGFuZCBgPHdpZHRoPmAgYXJlICcgK1xyXG4gICAgICAgICAgICAgICdmbG9hdGluZy1wb2ludCBudW1iZXJzIHdpdGggYC5gIChkb3QpIGFzIGRlY2ltYWwgc2VwYXJhdG9yLCBubyB0aG91c2FuZHMgc2VwYXJhdG9yLCAnICtcclxuICAgICAgICAgICAgICAnYW5kIHdpdGggb3B0aW9uYWwgYGNtYCwgYG1tYCBvciBgaW5gIHN1ZmZpeCB0byBpbmRpY2F0ZSB1bml0cywgZGVmYXVsdCBpcyBgbW1gLiAnICtcclxuICAgICAgICAgICAgICAnRm9yIGV4YW1wbGUsIEE0IGlzIGA4LjNpbiB4IDExLjdpbmAgb3IgYDIxMG1tIHggMjk3bW1gIG9yIGAyMTAgeCAyOTdgLiAnICtcclxuICAgICAgICAgICAgICAnV2hpdGVzcGFjZSBpcyBpZ25vcmVkLicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICAgICAgb3JkZXI6IDI1LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGxhbmRzY2FwZToge1xyXG4gICAgICAgICAgICB0aXRsZTogJ1BhZ2Ugb3JpZW50YXRpb24nLFxyXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgIGVudW06IFtcclxuICAgICAgICAgICAgICB7IHZhbHVlOiBmYWxzZSwgZGVzY3JpcHRpb246ICdQb3J0cmFpdCcgfSxcclxuICAgICAgICAgICAgICB7IHZhbHVlOiB0cnVlLCBkZXNjcmlwdGlvbjogJ0xhbmRzY2FwZScgfSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIG9yZGVyOiAyNixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBwcmludEJhY2tncm91bmQ6IHtcclxuICAgICAgICAgICAgdGl0bGU6ICdSZW5kZXIgYmFja2dyb3VuZCcsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0byByZW5kZXIgQ1NTIGJhY2tncm91bmRzIGluIFBERicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIG9yZGVyOiAzMCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IHtcclxuICAgICAgICAgICAgdGl0bGU6ICdSZW5kZXIgb25seSBzZWxlY3Rpb24nLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ09ubHkgcmVuZGVyIHNlbGVjdGVkIGRvY3VtZW50IGZyYWdtZW50LiBFeHBlcmltZW50YWwnLFxyXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBvcmRlcjogNDAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgc3luY0NvbmZpZzoge1xyXG4gICAgdGl0bGU6ICdQcmV2aWV3IHBvc2l0aW9uIHN5bmNocm9uaXphdGlvbiBiZWhhdmlvdXInLFxyXG4gICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICBvcmRlcjogMjAsXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IHtcclxuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgaW4gZWRpdG9yIGNoYW5nZXMnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBvcmRlcjogMjgsXHJcbiAgICAgIH0sXHJcbiAgICAgIHN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGw6IHtcclxuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgZWRpdG9yIGlzIHNjcm9sbGVkJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdOb3RlOiBpZiBib3RoIHNjcm9sbCBzeW5jIG9wdGlvbnMgYXJlIGVuYWJsZWQsIHRoZSBlZGl0b3IgJyArXHJcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgIG9yZGVyOiAyOC4xLFxyXG4gICAgICB9LFxyXG4gICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiB7XHJcbiAgICAgICAgdGl0bGU6ICdTeW5jIGVkaXRvciBwb3NpdGlvbiB3aGVuIHByZXZpZXcgaXMgc2Nyb2xsZWQnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ05vdGU6IGlmIGJvdGggc2Nyb2xsIHN5bmMgb3B0aW9ucyBhcmUgZW5hYmxlZCwgdGhlIHByZXZpZXcgJyArXHJcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgIG9yZGVyOiAyOC4yLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG1hdGhDb25maWc6IHtcclxuICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgdGl0bGU6ICdNYXRoIE9wdGlvbnMnLFxyXG4gICAgb3JkZXI6IDMwLFxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDoge1xyXG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIE1hdGggUmVuZGVyaW5nIEJ5IERlZmF1bHQnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBvcmRlcjogMCxcclxuICAgICAgfSxcclxuICAgICAgbGF0ZXhSZW5kZXJlcjoge1xyXG4gICAgICAgIHRpdGxlOiAnTWF0aCBSZW5kZXJlcicsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnU1ZHIGlzIG5vdGljZWFibHkgZmFzdGVyLCBidXQgbWlnaHQgbG9vayB3b3JzZSBvbiBzb21lIHN5c3RlbXMnLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGVudW06IFsnSFRNTC1DU1MnLCAnU1ZHJ10sXHJcbiAgICAgICAgZGVmYXVsdDogJ1NWRycsXHJcbiAgICAgICAgb3JkZXI6IDUsXHJcbiAgICAgIH0sXHJcbiAgICAgIG51bWJlckVxdWF0aW9uczoge1xyXG4gICAgICAgIHRpdGxlOiAnTnVtYmVyIGVxdWF0aW9ucycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnTnVtYmVyIGVxdWF0aW9ucyB0aGF0IGFyZSBpbiBlcXVhdGlvbiBlbnZpcm9ubWVudCwgZXRjLiAnICtcclxuICAgICAgICAgICdXaWxsIHJlLXJlbmRlciBhbGwgbWF0aCBvbiBlYWNoIG1hdGggY2hhbmdlLCB3aGljaCBtaWdodCBiZSB1bmRlc2lyYWJsZS4nLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBvcmRlcjogMTAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHRleEV4dGVuc2lvbnM6IHtcclxuICAgICAgICB0aXRsZTogJ01hdGhKYXggVGVYIGV4dGVuc2lvbnMnLFxyXG4gICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgZGVmYXVsdDogW1xyXG4gICAgICAgICAgJ0FNU21hdGguanMnLFxyXG4gICAgICAgICAgJ0FNU3N5bWJvbHMuanMnLFxyXG4gICAgICAgICAgJ25vRXJyb3JzLmpzJyxcclxuICAgICAgICAgICdub1VuZGVmaW5lZC5qcycsXHJcbiAgICAgICAgXSxcclxuICAgICAgICBvcmRlcjogMTUsXHJcbiAgICAgICAgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSxcclxuICAgICAgfSxcclxuICAgICAgdW5kZWZpbmVkRmFtaWx5OiB7XHJcbiAgICAgICAgdGl0bGU6ICdNYXRoSmF4IGB1bmRlZmluZWRGYW1pbHlgIChmb250IGZhbWlseSknLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdzZXJpZicsXHJcbiAgICAgICAgb3JkZXI6IDIwLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG1hcmtkb3duSXRDb25maWc6IHtcclxuICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgdGl0bGU6ICdNYXJrZG93bi1JdCBTZXR0aW5ncycsXHJcbiAgICBvcmRlcjogNDAsXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiB7XHJcbiAgICAgICAgdGl0bGU6ICdCcmVhayBvbiBzaW5nbGUgbmV3bGluZScsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgIG9yZGVyOiAwLFxyXG4gICAgICB9LFxyXG4gICAgICB1c2VMYXp5SGVhZGVyczoge1xyXG4gICAgICAgIHRpdGxlOiAnVXNlIExhenkgSGVhZGVycyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXF1aXJlIG5vIHNwYWNlIGFmdGVyIGhlYWRpbmdzICMnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxyXG4gICAgICAgIG9yZGVyOiA1LFxyXG4gICAgICB9LFxyXG4gICAgICB1c2VDaGVja0JveGVzOiB7XHJcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgQ2hlY2tCb3ggbGlzdHMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2tCb3ggbGlzdHMsIGxpa2Ugb24gR2l0SHViJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICBvcmRlcjogMTAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHVzZUVtb2ppOiB7XHJcbiAgICAgICAgdGl0bGU6ICdVc2UgRW1vamkgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW1vamkgcmVuZGVyaW5nJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICBvcmRlcjogMTUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHVzZVRvYzoge1xyXG4gICAgICAgIHRpdGxlOiAnVXNlIHRhYmxlIG9mIGNvbnRlbnRzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlcGxhY2UgW1t0b2NdXSB3aXRoIGF1dG9nZW5lcmF0ZWQgdGFibGUgb2YgY29udGVudHMnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxyXG4gICAgICAgIG9yZGVyOiAyMCxcclxuICAgICAgfSxcclxuICAgICAgdXNlSW1zaXplOiB7XHJcbiAgICAgICAgdGl0bGU6ICdBbGxvdyBzcGVjaWZ5aW5nIGltYWdlIHNpemUgaW4gaW1hZ2UgdGl0bGUnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0FsbG93IG5vbi1zdGFuZGFyZCBzeW50YXggZm9yIHNwZWNpZnlpbmcgaW1hZ2Ugc2l6ZSB2aWEgJyArXHJcbiAgICAgICAgICAnYXBwZW5kaW5nIGA9PHdpZHRoPng8aGVpZ2h0PmAgdG8gaW1hZ2Ugc3BhY2lmaWNhdGlvbiwgJyArXHJcbiAgICAgICAgICAnZi5leC4gYCFbdGVzdF0oaW1hZ2UucG5nID0xMDB4MjAwKWAnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxyXG4gICAgICAgIG9yZGVyOiAyNSxcclxuICAgICAgfSxcclxuICAgICAgdXNlQ3JpdGljTWFya3VwOiB7XHJcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgQ3JpdGljTWFya3VwIHN5bnRheCBzdXBwb3J0JyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1N1cHBvcnQgaXMgbGltaXRlZCB0byBpbmxpbmUgb25seScsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgIG9yZGVyOiA0MCxcclxuICAgICAgfSxcclxuICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHtcclxuICAgICAgICB0aXRsZTogJ0lubGluZSBtYXRoIHNlcGFyYXRvcnMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0xpc3Qgb2YgaW5saW5lIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxyXG4gICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgZGVmYXVsdDogWyckJywgJyQnLCAnXFxcXCgnLCAnXFxcXCknXSxcclxuICAgICAgICBvcmRlcjogMTEwLFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiB7XHJcbiAgICAgICAgdGl0bGU6ICdCbG9jayBtYXRoIHNlcGFyYXRvcnMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0xpc3Qgb2YgYmxvY2sgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXHJcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICBkZWZhdWx0OiBbJyQkJywgJyQkJywgJ1xcXFxbJywgJ1xcXFxdJ10sXHJcbiAgICAgICAgb3JkZXI6IDEyMCxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwYW5kb2NDb25maWc6IHtcclxuICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgdGl0bGU6ICdQYW5kb2Mgc2V0dGluZ3MnLFxyXG4gICAgb3JkZXI6IDUwLFxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiB7XHJcbiAgICAgICAgdGl0bGU6ICdVc2UgbmF0aXZlIFBhbmRvYyBjb2RlIGJsb2NrIHN0eWxlJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICBcIkRvbid0IGNvbnZlcnQgZmVuY2VkIGNvZGUgYmxvY2tzIHRvIEF0b20gZWRpdG9ycyB3aGVuIHVzaW5nXCIgK1xyXG4gICAgICAgICAgJ1BhbmRvYyBwYXJzZXInLFxyXG4gICAgICAgIG9yZGVyOiAwLFxyXG4gICAgICB9LFxyXG4gICAgICBwYW5kb2NQYXRoOiB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJ3BhbmRvYycsXHJcbiAgICAgICAgdGl0bGU6ICdQYXRoIHRvIFBhbmRvYyBleGVjdXRhYmxlJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdQbGVhc2Ugc3BlY2lmeSB0aGUgY29ycmVjdCBwYXRoIHRvIHlvdXIgcGFuZG9jIGV4ZWN1dGFibGUsICcgK1xyXG4gICAgICAgICAgJ2ZvciBleGFtcGxlLCAvdXNyL2Jpbi9wYW5kb2MsIG9yIEM6XFxcXFByb2dyYW0gRmlsZXNcXFxcUGFuZG9jXFxcXHBhbmRvYy5leGUnLFxyXG4gICAgICAgIG9yZGVyOiA1LFxyXG4gICAgICB9LFxyXG4gICAgICBwYW5kb2NGaWx0ZXJzOiB7XHJcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICBkZWZhdWx0OiBbXSxcclxuICAgICAgICB0aXRsZTogJ0ZpbHRlcnMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgZmlsdGVycywgaW4gb3JkZXIgb2YgYXBwbGljYXRpb24uIFdpbGwgYmUgcGFzc2VkIHZpYSBjb21tYW5kLWxpbmUgYXJndW1lbnRzJyxcclxuICAgICAgICBvcmRlcjogMTAsXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY0FyZ3VtZW50czoge1xyXG4gICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgZGVmYXVsdDogW10sXHJcbiAgICAgICAgdGl0bGU6ICdDb21tYW5kbGluZSBBcmd1bWVudHMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgYXJndW1lbnRzIGUuZy4gYC0tc21hcnQsIC0tZmlsdGVyPS9iaW4vZXhlYC4gUGxlYXNlIHVzZSBsb25nIGFyZ3VtZW50IG5hbWVzLicsXHJcbiAgICAgICAgb3JkZXI6IDE1LFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjoge1xyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1yYXdfdGV4K3RleF9tYXRoX3NpbmdsZV9iYWNrc2xhc2gnLFxyXG4gICAgICAgIHRpdGxlOiAnTWFya2Rvd24gRmxhdm9yJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VudGVyIHRoZSBwYW5kb2MgbWFya2Rvd24gZmxhdm9yIHlvdSB3YW50JyxcclxuICAgICAgICBvcmRlcjogMjAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeToge1xyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICB0aXRsZTogJ0NpdGF0aW9ucyAodmlhIHBhbmRvYy1jaXRlcHJvYyknLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0VuYWJsZSB0aGlzIGZvciBiaWJsaW9ncmFwaHkgcGFyc2luZy4gJyArXHJcbiAgICAgICAgICAnTm90ZTogcGFuZG9jLWNpdGVwcm9jIGlzIGFwcGxpZWQgYWZ0ZXIgb3RoZXIgZmlsdGVycyBzcGVjaWZpZWQgaW4gJyArXHJcbiAgICAgICAgICAnRmlsdGVycywgYnV0IGJlZm9yZSBvdGhlciBjb21tYW5kbGluZSBhcmd1bWVudHMgJyxcclxuICAgICAgICBvcmRlcjogMjUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IHtcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICB0aXRsZTogJ1JlbW92ZSBSZWZlcmVuY2VzJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlbW92ZXMgcmVmZXJlbmNlcyBhdCB0aGUgZW5kIG9mIHRoZSBIVE1MIHByZXZpZXcnLFxyXG4gICAgICAgIG9yZGVyOiAzMCxcclxuICAgICAgfSxcclxuICAgICAgcGFuZG9jQklCRmlsZToge1xyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdiaWJsaW9ncmFwaHkuYmliJyxcclxuICAgICAgICB0aXRsZTogJ0JpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBiaWJmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxyXG4gICAgICAgIG9yZGVyOiAzNSxcclxuICAgICAgfSxcclxuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJycsXHJcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBiaWJmaWxlJyxcclxuICAgICAgICBvcmRlcjogNDAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY0NTTEZpbGU6IHtcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICBkZWZhdWx0OiAnY3VzdG9tLmNzbCcsXHJcbiAgICAgICAgdGl0bGU6ICdCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgY3NsZmlsZSB0byBzZWFyY2ggZm9yIHJlY3Vyc2l2ZWx5JyxcclxuICAgICAgICBvcmRlcjogNDUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazoge1xyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICcnLFxyXG4gICAgICAgIHRpdGxlOiAnRmFsbGJhY2sgQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgY3NsZmlsZScsXHJcbiAgICAgICAgb3JkZXI6IDUwLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59XHJcblxyXG4vLyBnZW5lcmF0ZWQgYnkgdHlwZWQtY29uZmlnLmpzXHJcbmRlY2xhcmUgbW9kdWxlICdhdG9tJyB7XHJcbiAgaW50ZXJmYWNlIENvbmZpZ1ZhbHVlcyB7XHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmdyYW1tYXJzJzogc3RyaW5nW11cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZXh0ZW5zaW9ucyc6IHN0cmluZ1tdXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW50YXhUaGVtZU5hbWUnOiBzdHJpbmdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuaW1wb3J0UGFja2FnZVN0eWxlcyc6IHN0cmluZ1tdXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmNvZGVUYWJXaWR0aCc6IG51bWJlclxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5yZW5kZXJlcic6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5yaWNoQ2xpcGJvYXJkJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmxpdmVVcGRhdGUnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcucHJldmlld1NwbGl0UGFuZURpcic6XHJcbiAgICAgIHwgJ2Rvd24nXHJcbiAgICAgIHwgJ3JpZ2h0J1xyXG4gICAgICB8ICdub25lJ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLnByZXZpZXdEb2NrJzpcclxuICAgICAgfCAnbGVmdCdcclxuICAgICAgfCAncmlnaHQnXHJcbiAgICAgIHwgJ2JvdHRvbSdcclxuICAgICAgfCAnY2VudGVyJ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmNsb3NlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5zaGVsbE9wZW5GaWxlRXh0ZW5zaW9ucyc6IHN0cmluZ1tdXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcnOiB7XHJcbiAgICAgIGxpdmVVcGRhdGU6IGJvb2xlYW5cclxuICAgICAgcHJldmlld1NwbGl0UGFuZURpcjogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xyXG4gICAgICBwcmV2aWV3RG9jazogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcidcclxuICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxyXG4gICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXHJcbiAgICAgIHNoZWxsT3BlbkZpbGVFeHRlbnNpb25zOiBzdHJpbmdbXVxyXG4gICAgfVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLm1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyJzpcclxuICAgICAgfCAncmVsYXRpdml6ZWQnXHJcbiAgICAgIHwgJ2Fic29sdXRpemVkJ1xyXG4gICAgICB8ICd1bnRvdWNoZWQnXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOlxyXG4gICAgICB8ICdyZWxhdGl2aXplZCdcclxuICAgICAgfCAnYWJzb2x1dGl6ZWQnXHJcbiAgICAgIHwgJ3VudG91Y2hlZCdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5kZWZhdWx0U2F2ZUZvcm1hdCc6ICdodG1sJyB8ICdwZGYnXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnOlxyXG4gICAgICB8ICdBMydcclxuICAgICAgfCAnQTQnXHJcbiAgICAgIHwgJ0E1J1xyXG4gICAgICB8ICdMZWdhbCdcclxuICAgICAgfCAnTGV0dGVyJ1xyXG4gICAgICB8ICdUYWJsb2lkJ1xyXG4gICAgICB8ICdDdXN0b20nXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5jdXN0b21QYWdlU2l6ZSc6IHN0cmluZ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludFNlbGVjdGlvbk9ubHknOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucyc6IHtcclxuICAgICAgbWFyZ2luc1R5cGU6IDAgfCAxIHwgMlxyXG4gICAgICBwYWdlU2l6ZTogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnIHwgJ0N1c3RvbSdcclxuICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xyXG4gICAgICBsYW5kc2NhcGU6IGZhbHNlIHwgdHJ1ZVxyXG4gICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cclxuICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXHJcbiAgICB9XHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcnOiB7XHJcbiAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXHJcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXHJcbiAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiAnaHRtbCcgfCAncGRmJ1xyXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxyXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XHJcbiAgICAgICAgfCAnQTMnXHJcbiAgICAgICAgfCAnQTQnXHJcbiAgICAgICAgfCAnQTUnXHJcbiAgICAgICAgfCAnTGVnYWwnXHJcbiAgICAgICAgfCAnTGV0dGVyJ1xyXG4gICAgICAgIHwgJ1RhYmxvaWQnXHJcbiAgICAgICAgfCAnQ3VzdG9tJ1xyXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5jdXN0b21QYWdlU2l6ZSc6IHN0cmluZ1xyXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5sYW5kc2NhcGUnOiBmYWxzZSB8IHRydWVcclxuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRCYWNrZ3JvdW5kJzogYm9vbGVhblxyXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wcmludFNlbGVjdGlvbk9ubHknOiBib29sZWFuXHJcbiAgICAgIHNhdmVUb1BERk9wdGlvbnM6IHtcclxuICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXHJcbiAgICAgICAgcGFnZVNpemU6ICdBMycgfCAnQTQnIHwgJ0E1JyB8ICdMZWdhbCcgfCAnTGV0dGVyJyB8ICdUYWJsb2lkJyB8ICdDdXN0b20nXHJcbiAgICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xyXG4gICAgICAgIGxhbmRzY2FwZTogZmFsc2UgfCB0cnVlXHJcbiAgICAgICAgcHJpbnRCYWNrZ3JvdW5kOiBib29sZWFuXHJcbiAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY0NvbmZpZy5zeW5jUHJldmlld09uQ2hhbmdlJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY0NvbmZpZyc6IHtcclxuICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZTogYm9vbGVhblxyXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXHJcbiAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IGJvb2xlYW5cclxuICAgIH1cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJzogJ0hUTUwtQ1NTJyB8ICdTVkcnXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubnVtYmVyRXF1YXRpb25zJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLnRleEV4dGVuc2lvbnMnOiBzdHJpbmdbXVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLnVuZGVmaW5lZEZhbWlseSc6IHN0cmluZ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnJzoge1xyXG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxyXG4gICAgICBsYXRleFJlbmRlcmVyOiAnSFRNTC1DU1MnIHwgJ1NWRydcclxuICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXHJcbiAgICAgIHRleEV4dGVuc2lvbnM6IHN0cmluZ1tdXHJcbiAgICAgIHVuZGVmaW5lZEZhbWlseTogc3RyaW5nXHJcbiAgICB9XHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlTGF6eUhlYWRlcnMnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VUb2MnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlSW1zaXplJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUNyaXRpY01hcmt1cCc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcnOiB7XHJcbiAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiBib29sZWFuXHJcbiAgICAgIHVzZUxhenlIZWFkZXJzOiBib29sZWFuXHJcbiAgICAgIHVzZUNoZWNrQm94ZXM6IGJvb2xlYW5cclxuICAgICAgdXNlRW1vamk6IGJvb2xlYW5cclxuICAgICAgdXNlVG9jOiBib29sZWFuXHJcbiAgICAgIHVzZUltc2l6ZTogYm9vbGVhblxyXG4gICAgICB1c2VDcml0aWNNYXJrdXA6IGJvb2xlYW5cclxuICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXHJcbiAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXHJcbiAgICB9XHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy51c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jRmlsdGVycyc6IHN0cmluZ1tdXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NBcmd1bWVudHMnOiBzdHJpbmdbXVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeSc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY1JlbW92ZVJlZmVyZW5jZXMnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlRmFsbGJhY2snOiBzdHJpbmdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGUnOiBzdHJpbmdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcnOiB7XHJcbiAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cclxuICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXHJcbiAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXHJcbiAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cclxuICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xyXG4gICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cclxuICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxyXG4gICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcclxuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcclxuICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXHJcbiAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXHJcbiAgICB9XHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzJzoge1xyXG4gICAgICBncmFtbWFyczogc3RyaW5nW11cclxuICAgICAgZXh0ZW5zaW9uczogc3RyaW5nW11cclxuICAgICAgdXNlR2l0SHViU3R5bGU6IGJvb2xlYW5cclxuICAgICAgc3ludGF4VGhlbWVOYW1lOiBzdHJpbmdcclxuICAgICAgaW1wb3J0UGFja2FnZVN0eWxlczogc3RyaW5nW11cclxuICAgICAgY29kZVRhYldpZHRoOiBudW1iZXJcclxuICAgICAgcmVuZGVyZXI6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xyXG4gICAgICByaWNoQ2xpcGJvYXJkOiBib29sZWFuXHJcbiAgICAgICdwcmV2aWV3Q29uZmlnLmxpdmVVcGRhdGUnOiBib29sZWFuXHJcbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXHJcbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdEb2NrJzogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcidcclxuICAgICAgJ3ByZXZpZXdDb25maWcuY2xvc2VQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cclxuICAgICAgJ3ByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cclxuICAgICAgJ3ByZXZpZXdDb25maWcuc2hlbGxPcGVuRmlsZUV4dGVuc2lvbnMnOiBzdHJpbmdbXVxyXG4gICAgICBwcmV2aWV3Q29uZmlnOiB7XHJcbiAgICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxyXG4gICAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6ICdkb3duJyB8ICdyaWdodCcgfCAnbm9uZSdcclxuICAgICAgICBwcmV2aWV3RG9jazogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcidcclxuICAgICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXHJcbiAgICAgICAgYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxyXG4gICAgICAgIHNoZWxsT3BlbkZpbGVFeHRlbnNpb25zOiBzdHJpbmdbXVxyXG4gICAgICB9XHJcbiAgICAgICdzYXZlQ29uZmlnLm1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyJzpcclxuICAgICAgICB8ICdyZWxhdGl2aXplZCdcclxuICAgICAgICB8ICdhYnNvbHV0aXplZCdcclxuICAgICAgICB8ICd1bnRvdWNoZWQnXHJcbiAgICAgICdzYXZlQ29uZmlnLm1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyJzpcclxuICAgICAgICB8ICdyZWxhdGl2aXplZCdcclxuICAgICAgICB8ICdhYnNvbHV0aXplZCdcclxuICAgICAgICB8ICd1bnRvdWNoZWQnXHJcbiAgICAgICdzYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0JzogJ2h0bWwnIHwgJ3BkZidcclxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxyXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzpcclxuICAgICAgICB8ICdBMydcclxuICAgICAgICB8ICdBNCdcclxuICAgICAgICB8ICdBNSdcclxuICAgICAgICB8ICdMZWdhbCdcclxuICAgICAgICB8ICdMZXR0ZXInXHJcbiAgICAgICAgfCAnVGFibG9pZCdcclxuICAgICAgICB8ICdDdXN0b20nXHJcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcclxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5sYW5kc2NhcGUnOiBmYWxzZSB8IHRydWVcclxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXHJcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxyXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zJzoge1xyXG4gICAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcclxuICAgICAgICBwYWdlU2l6ZTogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnIHwgJ0N1c3RvbSdcclxuICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXHJcbiAgICAgICAgbGFuZHNjYXBlOiBmYWxzZSB8IHRydWVcclxuICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cclxuICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cclxuICAgICAgfVxyXG4gICAgICBzYXZlQ29uZmlnOiB7XHJcbiAgICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcclxuICAgICAgICBtZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xyXG4gICAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiAnaHRtbCcgfCAncGRmJ1xyXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLm1hcmdpbnNUeXBlJzogMCB8IDEgfCAyXHJcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnOlxyXG4gICAgICAgICAgfCAnQTMnXHJcbiAgICAgICAgICB8ICdBNCdcclxuICAgICAgICAgIHwgJ0E1J1xyXG4gICAgICAgICAgfCAnTGVnYWwnXHJcbiAgICAgICAgICB8ICdMZXR0ZXInXHJcbiAgICAgICAgICB8ICdUYWJsb2lkJ1xyXG4gICAgICAgICAgfCAnQ3VzdG9tJ1xyXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLmN1c3RvbVBhZ2VTaXplJzogc3RyaW5nXHJcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXHJcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRCYWNrZ3JvdW5kJzogYm9vbGVhblxyXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cclxuICAgICAgICBzYXZlVG9QREZPcHRpb25zOiB7XHJcbiAgICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXHJcbiAgICAgICAgICBwYWdlU2l6ZTpcclxuICAgICAgICAgICAgfCAnQTMnXHJcbiAgICAgICAgICAgIHwgJ0E0J1xyXG4gICAgICAgICAgICB8ICdBNSdcclxuICAgICAgICAgICAgfCAnTGVnYWwnXHJcbiAgICAgICAgICAgIHwgJ0xldHRlcidcclxuICAgICAgICAgICAgfCAnVGFibG9pZCdcclxuICAgICAgICAgICAgfCAnQ3VzdG9tJ1xyXG4gICAgICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xyXG4gICAgICAgICAgbGFuZHNjYXBlOiBmYWxzZSB8IHRydWVcclxuICAgICAgICAgIHByaW50QmFja2dyb3VuZDogYm9vbGVhblxyXG4gICAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25DaGFuZ2UnOiBib29sZWFuXHJcbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXHJcbiAgICAgICdzeW5jQ29uZmlnLnN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGwnOiBib29sZWFuXHJcbiAgICAgIHN5bmNDb25maWc6IHtcclxuICAgICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXHJcbiAgICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDogYm9vbGVhblxyXG4gICAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IGJvb2xlYW5cclxuICAgICAgfVxyXG4gICAgICAnbWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cclxuICAgICAgJ21hdGhDb25maWcubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xyXG4gICAgICAnbWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXHJcbiAgICAgICdtYXRoQ29uZmlnLnRleEV4dGVuc2lvbnMnOiBzdHJpbmdbXVxyXG4gICAgICAnbWF0aENvbmZpZy51bmRlZmluZWRGYW1pbHknOiBzdHJpbmdcclxuICAgICAgbWF0aENvbmZpZzoge1xyXG4gICAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiBib29sZWFuXHJcbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXHJcbiAgICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXHJcbiAgICAgICAgdGV4RXh0ZW5zaW9uczogc3RyaW5nW11cclxuICAgICAgICB1bmRlZmluZWRGYW1pbHk6IHN0cmluZ1xyXG4gICAgICB9XHJcbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lJzogYm9vbGVhblxyXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VMYXp5SGVhZGVycyc6IGJvb2xlYW5cclxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cclxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlRW1vamknOiBib29sZWFuXHJcbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZVRvYyc6IGJvb2xlYW5cclxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlSW1zaXplJzogYm9vbGVhblxyXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VDcml0aWNNYXJrdXAnOiBib29sZWFuXHJcbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cclxuICAgICAgJ21hcmtkb3duSXRDb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXHJcbiAgICAgIG1hcmtkb3duSXRDb25maWc6IHtcclxuICAgICAgICBicmVha09uU2luZ2xlTmV3bGluZTogYm9vbGVhblxyXG4gICAgICAgIHVzZUxhenlIZWFkZXJzOiBib29sZWFuXHJcbiAgICAgICAgdXNlQ2hlY2tCb3hlczogYm9vbGVhblxyXG4gICAgICAgIHVzZUVtb2ppOiBib29sZWFuXHJcbiAgICAgICAgdXNlVG9jOiBib29sZWFuXHJcbiAgICAgICAgdXNlSW1zaXplOiBib29sZWFuXHJcbiAgICAgICAgdXNlQ3JpdGljTWFya3VwOiBib29sZWFuXHJcbiAgICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXHJcbiAgICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cclxuICAgICAgfVxyXG4gICAgICAncGFuZG9jQ29uZmlnLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xyXG4gICAgICBwYW5kb2NDb25maWc6IHtcclxuICAgICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiBib29sZWFuXHJcbiAgICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXHJcbiAgICAgICAgcGFuZG9jRmlsdGVyczogc3RyaW5nW11cclxuICAgICAgICBwYW5kb2NBcmd1bWVudHM6IHN0cmluZ1tdXHJcbiAgICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xyXG4gICAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeTogYm9vbGVhblxyXG4gICAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IGJvb2xlYW5cclxuICAgICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcclxuICAgICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHN0cmluZ1xyXG4gICAgICAgIHBhbmRvY0NTTEZpbGU6IHN0cmluZ1xyXG4gICAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19