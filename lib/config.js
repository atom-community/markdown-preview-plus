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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVhLFFBQUEsTUFBTSxHQUFZO0lBQzdCLFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1oseUJBQXlCO1NBQzFCO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkUsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsS0FBSyxFQUFFLDhCQUE4QjtRQUNyQyxXQUFXLEVBQ1QsaUZBQWlGO1FBQ25GLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7UUFDWCxLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0QsbUJBQW1CLEVBQUU7UUFDbkIsS0FBSyxFQUFFLDRDQUE0QztRQUNuRCxXQUFXLEVBQ1QsK0VBQStFO1lBQy9FLDhFQUE4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RSxFQUFFO2FBQ1Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBpbnRlcmZhY2UgSUNvbmZpZyB7XG4gIFtrZXk6IHN0cmluZ106IHtcbiAgICB0aXRsZTogc3RyaW5nXG4gICAgb3JkZXI6IG51bWJlclxuICAgIHR5cGU6IHN0cmluZ1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gICAgcHJvcGVydGllcz86IElDb25maWdcbiAgICBkZWZhdWx0PzogYW55XG4gICAgZW51bT86IGFueVtdXG4gICAgaXRlbXM/OiB7XG4gICAgICB0eXBlOiBzdHJpbmdcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpZzogSUNvbmZpZyA9IHtcbiAgZ3JhbW1hcnM6IHtcbiAgICB0aXRsZTogJ01hcmtkb3duIEdyYW1tYXJzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0VkaXRvcnMgdXNpbmcgd2hhdCBncmFtbWFycyBhcmUgY29uc2lkZXJlZCBNYXJrZG93bicsXG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBkZWZhdWx0OiBbXG4gICAgICAnc291cmNlLmdmbScsXG4gICAgICAnc291cmNlLmxpdGNvZmZlZScsXG4gICAgICAndGV4dC5odG1sLmJhc2ljJyxcbiAgICAgICd0ZXh0Lm1kJyxcbiAgICAgICd0ZXh0LnBsYWluJyxcbiAgICAgICd0ZXh0LnBsYWluLm51bGwtZ3JhbW1hcicsXG4gICAgXSxcbiAgICBvcmRlcjogMCxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgZXh0ZW5zaW9uczoge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgdGl0bGU6ICdNYXJrZG93biBmaWxlIGV4dGVuc2lvbnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hpY2ggZmlsZXMgYXJlIGNvbnNpZGVyZWQgTWFya2Rvd24nLFxuICAgIGRlZmF1bHQ6IFsnbWFya2Rvd24nLCAnbWQnLCAnbWRvd24nLCAnbWtkJywgJ21rZG93bicsICdyb24nLCAndHh0J10sXG4gICAgb3JkZXI6IDEsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIHVzZUdpdEh1YlN0eWxlOiB7XG4gICAgdGl0bGU6ICdVc2UgR2l0SHViLmNvbSBzdHlsZScsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAyLFxuICB9LFxuICBzeW50YXhUaGVtZU5hbWU6IHtcbiAgICB0aXRsZTogJ1N5bnRheCB0aGVtZSBmb3IgY29kZSBibG9ja3MnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0lmIG5vdCBlbXB0eSwgd2lsbCB0cnkgdG8gdXNlIHRoZSBnaXZlbiBzeW50YXggdGhlbWUgZm9yIGNvZGUgYmxvY2tzIGluIHByZXZpZXcnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIG9yZGVyOiAyLjUsXG4gIH0sXG4gIGltcG9ydFBhY2thZ2VTdHlsZXM6IHtcbiAgICB0aXRsZTogJ1BhY2thZ2VzIHRoYXQgY2FuIGFmZmVjdCBwcmV2aWV3IHJlbmRlcmluZycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnQSBsaXN0IG9mIEF0b20gcGFja2FnZSBuYW1lcyB0aGF0IGNhbiBhZmZlY3QgcHJldmlldyBzdHlsZSwgY29tbWEtc2VwYXJhdGVkLiAnICtcbiAgICAgICdBIHNwZWNpYWwgdmFsdWUgb2YgYCpgIChzdGFyKSB3aWxsIGltcG9ydCBhbGwgQXRvbSBzdHlsZXMgaW50byB0aGUgcHJldmlldywgJyArXG4gICAgICAndXNlIHdpdGggY2FyZS4gVGhpcyBkb2VzIG5vdCBhZmZlY3QgZXhwb3J0ZWQgSFRNTCcsXG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgICBkZWZhdWx0OiBbJ2ZvbnRzJ10sXG4gICAgb3JkZXI6IDIuNixcbiAgfSxcbiAgcmVuZGVyZXI6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnbWFya2Rvd24taXQnLFxuICAgIHRpdGxlOiAnUmVuZGVyZXIgYmFja2VuZCcsXG4gICAgZW51bTogWydtYXJrZG93bi1pdCcsICdwYW5kb2MnXSxcbiAgICBvcmRlcjogMyxcbiAgfSxcbiAgcmljaENsaXBib2FyZDoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRpdGxlOiAnVXNlIHJpY2ggY2xpcGJvYXJkJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdDb3B5IHJpY2ggdGV4dCB0byBjbGlwYm9hcmQgaW4gYWRkaXRpb24gdG8gcmF3IEhUTUwgd2hlbiB1c2luZyBjb3B5IGh0bWwgY29tbWFuZHMnLFxuICAgIG9yZGVyOiA0LFxuICB9LFxuICBwcmV2aWV3Q29uZmlnOiB7XG4gICAgdGl0bGU6ICdQcmV2aWV3IEJlaGF2aW91cicsXG4gICAgb3JkZXI6IDEwLFxuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGxpdmVVcGRhdGU6IHtcbiAgICAgICAgdGl0bGU6ICdMaXZlIFVwZGF0ZScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6IHtcbiAgICAgICAgdGl0bGU6ICdEaXJlY3Rpb24gdG8gbG9hZCB0aGUgcHJldmlldyBpbiBzcGxpdCBwYW5lJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdyaWdodCcsXG4gICAgICAgIGVudW06IFsnZG93bicsICdyaWdodCcsICdub25lJ10sXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgIH0sXG4gICAgICBwcmV2aWV3RG9jazoge1xuICAgICAgICB0aXRsZTogJ09wZW4gcHJldmlldyBpbiBkb2NrJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdjZW50ZXInLFxuICAgICAgICBlbnVtOiBbJ2xlZnQnLCAncmlnaHQnLCAnYm90dG9tJywgJ2NlbnRlciddLFxuICAgICAgICBvcmRlcjogMjUsXG4gICAgICB9LFxuICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjoge1xuICAgICAgICB0aXRsZTogJ0Nsb3NlIHByZXZpZXcgd2hlbiBlZGl0b3IgY2xvc2VzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMjYsXG4gICAgICB9LFxuICAgICAgYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcjoge1xuICAgICAgICB0aXRsZTogJ0JyaW5nIHVwIHByZXZpZXcgd2hlbiBlZGl0b3IgYWN0aXZhdGVzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI3LFxuICAgICAgfSxcbiAgICAgIHNoZWxsT3BlbkZpbGVFeHRlbnNpb25zOiB7XG4gICAgICAgIHRpdGxlOiAnQWx3YXlzIG9wZW4gbGlua3MgdG8gdGhlc2UgZmlsZSB0eXBlcyBleHRlcm5hbGx5JyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ1RoaXMgaXMgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBmaWxlIG5hbWUgZXh0ZW5zaW9ucyB0aGF0ICcgK1xuICAgICAgICAgICdzaG91bGQgYWx3YXlzIGJlIG9wZW5lZCB3aXRoIGFuIGV4dGVybmFsIHByb2dyYW0uICcgK1xuICAgICAgICAgICdGb3IgZXhhbXBsZSwgaWYgeW91IHdhbnQgdG8gYWx3YXlzIG9wZW4gUERGIGZpbGVzIChwcmVzdW1hYmx5IG5hbWVkIGBzb21ldGhpbmcucGRmYCkgJyArXG4gICAgICAgICAgJ2luIHN5c3RlbSBQREYgdmlld2VyLCBhZGQgYHBkZmAgaGVyZS4nLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXG4gICAgICAgICAgJ29kdCcsXG4gICAgICAgICAgJ2RvYycsXG4gICAgICAgICAgJ2RvY3gnLFxuICAgICAgICAgICdvZHMnLFxuICAgICAgICAgICd4bHMnLFxuICAgICAgICAgICd4bHN4JyxcbiAgICAgICAgICAnb2RwJyxcbiAgICAgICAgICAncHB0JyxcbiAgICAgICAgICAncHB0eCcsXG4gICAgICAgICAgJ3ppcCcsXG4gICAgICAgICAgJ3JhcicsXG4gICAgICAgICAgJzd6JyxcbiAgICAgICAgICAnZ3onLFxuICAgICAgICAgICd4eicsXG4gICAgICAgICAgJ2J6MicsXG4gICAgICAgICAgJ3RhcicsXG4gICAgICAgICAgJ3RneicsXG4gICAgICAgICAgJ3R4eicsXG4gICAgICAgICAgJ3RiejInLFxuICAgICAgICBdLFxuICAgICAgICBvcmRlcjogMjgsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHNhdmVDb25maWc6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICB0aXRsZTogJ0V4cG9ydCBCZWhhdmlvdXInLFxuICAgIG9yZGVyOiAxNSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBtZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cjoge1xuICAgICAgICB0aXRsZTogJ1doZW4gc2F2aW5nIGFzIEhUTUwsIG1lZGlhIHBhdGhzIHdpbGwgYmUnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTWVkaWEgaW5jbHVkZXMgaW1hZ2VzLCBhdWRpbyBhbmQgdmlkZW8uICcgK1xuICAgICAgICAgICdyZWxhdGl2ZSBzcmMgYXR0cmlidXRlcyBvZiBpbWcsIGF1ZGlvLCB2aWRlbyB0YWdzIGNhbiBlaXRoZXIgYmUgcmV3cml0dGVuICcgK1xuICAgICAgICAgICd0byB1c2UgYWJzb2x1dGUgZmlsZSBwYXRocywgcGF0aHMgcmVsYXRpdmUgdG8gc2F2ZSBsb2NhdGlvbiwgb3IgYmUgbGVmdCAnICtcbiAgICAgICAgICAndW5hbHRlcmVkJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdyZWxhdGl2aXplZCcsXG4gICAgICAgIGVudW06IFsncmVsYXRpdml6ZWQnLCAnYWJzb2x1dGl6ZWQnLCAndW50b3VjaGVkJ10sXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICBtZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cjoge1xuICAgICAgICB0aXRsZTogJ1doZW4gY29weWluZyBhcyBIVE1MLCBtZWRpYSBwYXRocyB3aWxsIGJlJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ01lZGlhIGluY2x1ZGVzIGltYWdlcywgYXVkaW8gYW5kIHZpZGVvLiAnICtcbiAgICAgICAgICAncmVsYXRpdmUgc3JjIGF0dHJpYnV0ZXMgb2YgaW1nLCBhdWRpbywgdmlkZW8gdGFncyBjYW4gZWl0aGVyIGJlIHJld3JpdHRlbiAnICtcbiAgICAgICAgICAndG8gdXNlIGFic29sdXRlIGZpbGUgcGF0aHMsIHBhdGhzIHJlbGF0aXZlIHRvIHNhdmUgbG9jYXRpb24sIG9yIGJlIGxlZnQgJyArXG4gICAgICAgICAgJ3VuYWx0ZXJlZCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAndW50b3VjaGVkJyxcbiAgICAgICAgZW51bTogWydyZWxhdGl2aXplZCcsICdhYnNvbHV0aXplZCcsICd1bnRvdWNoZWQnXSxcbiAgICAgICAgb3JkZXI6IDE1LFxuICAgICAgfSxcbiAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiB7XG4gICAgICAgIHRpdGxlOiAnRGVmYXVsdCBmb3JtYXQgdG8gc2F2ZSBhcycsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICAgIGVudW06IFsnaHRtbCcsICdwZGYnXSxcbiAgICAgICAgZGVmYXVsdDogJ2h0bWwnLFxuICAgICAgfSxcbiAgICAgIHNhdmVUb1BERk9wdGlvbnM6IHtcbiAgICAgICAgdGl0bGU6ICdTYXZlIHRvIFBERiBvcHRpb25zJyxcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIG1hcmdpbnNUeXBlOiB7XG4gICAgICAgICAgICB0aXRsZTogJ01hcmdpbnMgVHlwZScsXG4gICAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAgIHsgdmFsdWU6IDAsIGRlc2NyaXB0aW9uOiAnRGVmYXVsdCBtYXJnaW5zJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAxLCBkZXNjcmlwdGlvbjogJ05vIG1hcmdpbnMnIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6IDIsIGRlc2NyaXB0aW9uOiAnTWluaW11bSBtYXJnaW5zJyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IDAsXG4gICAgICAgICAgICBvcmRlcjogMTAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYWdlU2l6ZToge1xuICAgICAgICAgICAgdGl0bGU6ICdQYWdlIFNpemUnLFxuICAgICAgICAgICAgZW51bTogWydBMycsICdBNCcsICdBNScsICdMZWdhbCcsICdMZXR0ZXInLCAnVGFibG9pZCcsICdDdXN0b20nXSxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgZGVmYXVsdDogJ0E0JyxcbiAgICAgICAgICAgIG9yZGVyOiAyMCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGN1c3RvbVBhZ2VTaXplOiB7XG4gICAgICAgICAgICB0aXRsZTogJ0N1c3RvbSBQYWdlIFNpemUnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICdUYWtlcyBlZmZlY3Qgd2hlbiBQYWdlIFNpemUgaXMgc2V0IHRvIGBDdXN0b21gLiBTcGVjaWZpZWQgYXMgJyArXG4gICAgICAgICAgICAgICdgPHdpZHRoPng8aGVpZ2h0PmAsIHdoZXJlIGA8aGVpZ2h0PmAgYW5kIGA8d2lkdGg+YCBhcmUgJyArXG4gICAgICAgICAgICAgICdmbG9hdGluZy1wb2ludCBudW1iZXJzIHdpdGggYC5gIChkb3QpIGFzIGRlY2ltYWwgc2VwYXJhdG9yLCBubyB0aG91c2FuZHMgc2VwYXJhdG9yLCAnICtcbiAgICAgICAgICAgICAgJ2FuZCB3aXRoIG9wdGlvbmFsIGBjbWAsIGBtbWAgb3IgYGluYCBzdWZmaXggdG8gaW5kaWNhdGUgdW5pdHMsIGRlZmF1bHQgaXMgYG1tYC4gJyArXG4gICAgICAgICAgICAgICdGb3IgZXhhbXBsZSwgQTQgaXMgYDguM2luIHggMTEuN2luYCBvciBgMjEwbW0geCAyOTdtbWAgb3IgYDIxMCB4IDI5N2AuICcgK1xuICAgICAgICAgICAgICAnV2hpdGVzcGFjZSBpcyBpZ25vcmVkLicsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbGFuZHNjYXBlOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1BhZ2Ugb3JpZW50YXRpb24nLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZW51bTogW1xuICAgICAgICAgICAgICB7IHZhbHVlOiBmYWxzZSwgZGVzY3JpcHRpb246ICdQb3J0cmFpdCcgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogdHJ1ZSwgZGVzY3JpcHRpb246ICdMYW5kc2NhcGUnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBvcmRlcjogMjYsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcmludEJhY2tncm91bmQ6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUmVuZGVyIGJhY2tncm91bmQnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRvIHJlbmRlciBDU1MgYmFja2dyb3VuZHMgaW4gUERGJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiB7XG4gICAgICAgICAgICB0aXRsZTogJ1JlbmRlciBvbmx5IHNlbGVjdGlvbicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ09ubHkgcmVuZGVyIHNlbGVjdGVkIGRvY3VtZW50IGZyYWdtZW50LiBFeHBlcmltZW50YWwnLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBvcmRlcjogNDAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc3luY0NvbmZpZzoge1xuICAgIHRpdGxlOiAnUHJldmlldyBwb3NpdGlvbiBzeW5jaHJvbml6YXRpb24gYmVoYXZpb3VyJyxcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBvcmRlcjogMjAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZToge1xuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgaW4gZWRpdG9yIGNoYW5nZXMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMjgsXG4gICAgICB9LFxuICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDoge1xuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgZWRpdG9yIGlzIHNjcm9sbGVkJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ05vdGU6IGlmIGJvdGggc2Nyb2xsIHN5bmMgb3B0aW9ucyBhcmUgZW5hYmxlZCwgdGhlIGVkaXRvciAnICtcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyOC4xLFxuICAgICAgfSxcbiAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IHtcbiAgICAgICAgdGl0bGU6ICdTeW5jIGVkaXRvciBwb3NpdGlvbiB3aGVuIHByZXZpZXcgaXMgc2Nyb2xsZWQnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTm90ZTogaWYgYm90aCBzY3JvbGwgc3luYyBvcHRpb25zIGFyZSBlbmFibGVkLCB0aGUgcHJldmlldyAnICtcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyOC4yLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBtYXRoQ29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdNYXRoIE9wdGlvbnMnLFxuICAgIG9yZGVyOiAzMCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBNYXRoIFJlbmRlcmluZyBCeSBEZWZhdWx0JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDAsXG4gICAgICB9LFxuICAgICAgbGF0ZXhSZW5kZXJlcjoge1xuICAgICAgICB0aXRsZTogJ01hdGggUmVuZGVyZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnU1ZHIGlzIG5vdGljZWFibHkgZmFzdGVyLCBidXQgbWlnaHQgbG9vayB3b3JzZSBvbiBzb21lIHN5c3RlbXMnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZW51bTogWydIVE1MLUNTUycsICdTVkcnXSxcbiAgICAgICAgZGVmYXVsdDogJ1NWRycsXG4gICAgICAgIG9yZGVyOiA1LFxuICAgICAgfSxcbiAgICAgIG51bWJlckVxdWF0aW9uczoge1xuICAgICAgICB0aXRsZTogJ051bWJlciBlcXVhdGlvbnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTnVtYmVyIGVxdWF0aW9ucyB0aGF0IGFyZSBpbiBlcXVhdGlvbiBlbnZpcm9ubWVudCwgZXRjLiAnICtcbiAgICAgICAgICAnV2lsbCByZS1yZW5kZXIgYWxsIG1hdGggb24gZWFjaCBtYXRoIGNoYW5nZSwgd2hpY2ggbWlnaHQgYmUgdW5kZXNpcmFibGUuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIHRleEV4dGVuc2lvbnM6IHtcbiAgICAgICAgdGl0bGU6ICdNYXRoSmF4IFRlWCBleHRlbnNpb25zJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogW1xuICAgICAgICAgICdBTVNtYXRoLmpzJyxcbiAgICAgICAgICAnQU1Tc3ltYm9scy5qcycsXG4gICAgICAgICAgJ25vRXJyb3JzLmpzJyxcbiAgICAgICAgICAnbm9VbmRlZmluZWQuanMnLFxuICAgICAgICBdLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICAgIGl0ZW1zOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG4gICAgICB9LFxuICAgICAgdW5kZWZpbmVkRmFtaWx5OiB7XG4gICAgICAgIHRpdGxlOiAnTWF0aEpheCBgdW5kZWZpbmVkRmFtaWx5YCAoZm9udCBmYW1pbHkpJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdzZXJpZicsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgbWFya2Rvd25JdENvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnTWFya2Rvd24tSXQgU2V0dGluZ3MnLFxuICAgIG9yZGVyOiA0MCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBicmVha09uU2luZ2xlTmV3bGluZToge1xuICAgICAgICB0aXRsZTogJ0JyZWFrIG9uIHNpbmdsZSBuZXdsaW5lJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDAsXG4gICAgICB9LFxuICAgICAgdXNlTGF6eUhlYWRlcnM6IHtcbiAgICAgICAgdGl0bGU6ICdVc2UgTGF6eSBIZWFkZXJzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXF1aXJlIG5vIHNwYWNlIGFmdGVyIGhlYWRpbmdzICMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiA1LFxuICAgICAgfSxcbiAgICAgIHVzZUNoZWNrQm94ZXM6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgQ2hlY2tCb3ggbGlzdHMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0NoZWNrQm94IGxpc3RzLCBsaWtlIG9uIEdpdEh1YicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIHVzZUVtb2ppOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIEVtb2ppIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbW9qaSByZW5kZXJpbmcnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgIH0sXG4gICAgICB1c2VUb2M6IHtcbiAgICAgICAgdGl0bGU6ICdVc2UgdGFibGUgb2YgY29udGVudHMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlcGxhY2UgW1t0b2NdXSB3aXRoIGF1dG9nZW5lcmF0ZWQgdGFibGUgb2YgY29udGVudHMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgIH0sXG4gICAgICB1c2VJbXNpemU6IHtcbiAgICAgICAgdGl0bGU6ICdBbGxvdyBzcGVjaWZ5aW5nIGltYWdlIHNpemUgaW4gaW1hZ2UgdGl0bGUnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnQWxsb3cgbm9uLXN0YW5kYXJkIHN5bnRheCBmb3Igc3BlY2lmeWluZyBpbWFnZSBzaXplIHZpYSAnICtcbiAgICAgICAgICAnYXBwZW5kaW5nIGA9PHdpZHRoPng8aGVpZ2h0PmAgdG8gaW1hZ2Ugc3BhY2lmaWNhdGlvbiwgJyArXG4gICAgICAgICAgJ2YuZXguIGAhW3Rlc3RdKGltYWdlLnBuZyA9MTAweDIwMClgJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMjUsXG4gICAgICB9LFxuICAgICAgdXNlQ3JpdGljTWFya3VwOiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIENyaXRpY01hcmt1cCBzeW50YXggc3VwcG9ydCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU3VwcG9ydCBpcyBsaW1pdGVkIHRvIGlubGluZSBvbmx5JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDQwLFxuICAgICAgfSxcbiAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiB7XG4gICAgICAgIHRpdGxlOiAnSW5saW5lIG1hdGggc2VwYXJhdG9ycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdMaXN0IG9mIGlubGluZSBtYXRoIHNlcGFyYXRvcnMgaW4gcGFpcnMgLS0gZmlyc3Qgb3BlbmluZywgdGhlbiBjbG9zaW5nJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogWyckJywgJyQnLCAnXFxcXCgnLCAnXFxcXCknXSxcbiAgICAgICAgb3JkZXI6IDExMCxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiB7XG4gICAgICAgIHRpdGxlOiAnQmxvY2sgbWF0aCBzZXBhcmF0b3JzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0xpc3Qgb2YgYmxvY2sgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFsnJCQnLCAnJCQnLCAnXFxcXFsnLCAnXFxcXF0nXSxcbiAgICAgICAgb3JkZXI6IDEyMCxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGFuZG9jQ29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdQYW5kb2Mgc2V0dGluZ3MnLFxuICAgIG9yZGVyOiA1MCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIG5hdGl2ZSBQYW5kb2MgY29kZSBibG9jayBzdHlsZScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgIFwiRG9uJ3QgY29udmVydCBmZW5jZWQgY29kZSBibG9ja3MgdG8gQXRvbSBlZGl0b3JzIHdoZW4gdXNpbmdcIiArXG4gICAgICAgICAgJ1BhbmRvYyBwYXJzZXInLFxuICAgICAgICBvcmRlcjogMCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NQYXRoOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncGFuZG9jJyxcbiAgICAgICAgdGl0bGU6ICdQYXRoIHRvIFBhbmRvYyBleGVjdXRhYmxlJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ1BsZWFzZSBzcGVjaWZ5IHRoZSBjb3JyZWN0IHBhdGggdG8geW91ciBwYW5kb2MgZXhlY3V0YWJsZSwgJyArXG4gICAgICAgICAgJ2ZvciBleGFtcGxlLCAvdXNyL2Jpbi9wYW5kb2MsIG9yIEM6XFxcXFByb2dyYW0gRmlsZXNcXFxcUGFuZG9jXFxcXHBhbmRvYy5leGUnLFxuICAgICAgICBvcmRlcjogNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NGaWx0ZXJzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgICB0aXRsZTogJ0ZpbHRlcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBmaWx0ZXJzLCBpbiBvcmRlciBvZiBhcHBsaWNhdGlvbi4gV2lsbCBiZSBwYXNzZWQgdmlhIGNvbW1hbmQtbGluZSBhcmd1bWVudHMnLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGFuZG9jQXJndW1lbnRzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgICB0aXRsZTogJ0NvbW1hbmRsaW5lIEFyZ3VtZW50cycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGFyZ3VtZW50cyBlLmcuIGAtLXNtYXJ0LCAtLWZpbHRlcj0vYmluL2V4ZWAuIFBsZWFzZSB1c2UgbG9uZyBhcmd1bWVudCBuYW1lcy4nLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1yYXdfdGV4K3RleF9tYXRoX3NpbmdsZV9iYWNrc2xhc2gnLFxuICAgICAgICB0aXRsZTogJ01hcmtkb3duIEZsYXZvcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW50ZXIgdGhlIHBhbmRvYyBtYXJrZG93biBmbGF2b3IgeW91IHdhbnQnLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIHRpdGxlOiAnQ2l0YXRpb25zICh2aWEgcGFuZG9jLWNpdGVwcm9jKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdFbmFibGUgdGhpcyBmb3IgYmlibGlvZ3JhcGh5IHBhcnNpbmcuICcgK1xuICAgICAgICAgICdOb3RlOiBwYW5kb2MtY2l0ZXByb2MgaXMgYXBwbGllZCBhZnRlciBvdGhlciBmaWx0ZXJzIHNwZWNpZmllZCBpbiAnICtcbiAgICAgICAgICAnRmlsdGVycywgYnV0IGJlZm9yZSBvdGhlciBjb21tYW5kbGluZSBhcmd1bWVudHMgJyxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0aXRsZTogJ1JlbW92ZSBSZWZlcmVuY2VzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZW1vdmVzIHJlZmVyZW5jZXMgYXQgdGhlIGVuZCBvZiB0aGUgSFRNTCBwcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0JJQkZpbGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdiaWJsaW9ncmFwaHkuYmliJyxcbiAgICAgICAgdGl0bGU6ICdCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGJpYmZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseScsXG4gICAgICAgIG9yZGVyOiAzNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICB0aXRsZTogJ0ZhbGxiYWNrIEJpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBiaWJmaWxlJyxcbiAgICAgICAgb3JkZXI6IDQwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0NTTEZpbGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdjdXN0b20uY3NsJyxcbiAgICAgICAgdGl0bGU6ICdCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGNzbGZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseScsXG4gICAgICAgIG9yZGVyOiA0NSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICB0aXRsZTogJ0ZhbGxiYWNrIEJpYmxpb2dyYXBoeSBTdHlsZSAoY3NsZmlsZSknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBjc2xmaWxlJyxcbiAgICAgICAgb3JkZXI6IDUwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufVxuXG4vLyBnZW5lcmF0ZWQgYnkgdHlwZWQtY29uZmlnLmpzXG5kZWNsYXJlIG1vZHVsZSAnYXRvbScge1xuICBpbnRlcmZhY2UgQ29uZmlnVmFsdWVzIHtcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmdyYW1tYXJzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW50YXhUaGVtZU5hbWUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmltcG9ydFBhY2thZ2VTdHlsZXMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucmVuZGVyZXInOiAnbWFya2Rvd24taXQnIHwgJ3BhbmRvYydcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnJpY2hDbGlwYm9hcmQnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmxpdmVVcGRhdGUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOlxuICAgICAgfCAnZG93bidcbiAgICAgIHwgJ3JpZ2h0J1xuICAgICAgfCAnbm9uZSdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcucHJldmlld0RvY2snOlxuICAgICAgfCAnbGVmdCdcbiAgICAgIHwgJ3JpZ2h0J1xuICAgICAgfCAnYm90dG9tJ1xuICAgICAgfCAnY2VudGVyJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5jbG9zZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5hY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5zaGVsbE9wZW5GaWxlRXh0ZW5zaW9ucyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnJzoge1xuICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgcHJldmlld1NwbGl0UGFuZURpcjogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICAgcHJldmlld0RvY2s6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICBzaGVsbE9wZW5GaWxlRXh0ZW5zaW9uczogc3RyaW5nW11cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLm1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyJzpcbiAgICAgIHwgJ3JlbGF0aXZpemVkJ1xuICAgICAgfCAnYWJzb2x1dGl6ZWQnXG4gICAgICB8ICd1bnRvdWNoZWQnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLm1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyJzpcbiAgICAgIHwgJ3JlbGF0aXZpemVkJ1xuICAgICAgfCAnYWJzb2x1dGl6ZWQnXG4gICAgICB8ICd1bnRvdWNoZWQnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0JzogJ2h0bWwnIHwgJ3BkZidcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzpcbiAgICAgIHwgJ0EzJ1xuICAgICAgfCAnQTQnXG4gICAgICB8ICdBNSdcbiAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgfCAnTGV0dGVyJ1xuICAgICAgfCAnVGFibG9pZCdcbiAgICAgIHwgJ0N1c3RvbSdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5jdXN0b21QYWdlU2l6ZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGZhbHNlIHwgdHJ1ZVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludFNlbGVjdGlvbk9ubHknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMnOiB7XG4gICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICBwYWdlU2l6ZTogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnIHwgJ0N1c3RvbSdcbiAgICAgIGN1c3RvbVBhZ2VTaXplOiBzdHJpbmdcbiAgICAgIGxhbmRzY2FwZTogZmFsc2UgfCB0cnVlXG4gICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgIHByaW50U2VsZWN0aW9uT25seTogYm9vbGVhblxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcnOiB7XG4gICAgICBtZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xuICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiAnaHRtbCcgfCAncGRmJ1xuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzpcbiAgICAgICAgfCAnQTMnXG4gICAgICAgIHwgJ0E0J1xuICAgICAgICB8ICdBNSdcbiAgICAgICAgfCAnTGVnYWwnXG4gICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgfCAnQ3VzdG9tJ1xuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGZhbHNlIHwgdHJ1ZVxuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRCYWNrZ3JvdW5kJzogYm9vbGVhblxuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICAgc2F2ZVRvUERGT3B0aW9uczoge1xuICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCcgfCAnQ3VzdG9tJ1xuICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICAgIGxhbmRzY2FwZTogZmFsc2UgfCB0cnVlXG4gICAgICAgIHByaW50QmFja2dyb3VuZDogYm9vbGVhblxuICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgIH1cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25DaGFuZ2UnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnLnN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGwnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnJzoge1xuICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZTogYm9vbGVhblxuICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDogYm9vbGVhblxuICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDogYm9vbGVhblxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLmxhdGV4UmVuZGVyZXInOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubnVtYmVyRXF1YXRpb25zJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy50ZXhFeHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcudW5kZWZpbmVkRmFtaWx5Jzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnJzoge1xuICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IGJvb2xlYW5cbiAgICAgIGxhdGV4UmVuZGVyZXI6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXG4gICAgICB0ZXhFeHRlbnNpb25zOiBzdHJpbmdbXVxuICAgICAgdW5kZWZpbmVkRmFtaWx5OiBzdHJpbmdcbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VMYXp5SGVhZGVycyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlRW1vamknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZVRvYyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlSW1zaXplJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VDcml0aWNNYXJrdXAnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnJzoge1xuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cbiAgICAgIHVzZUxhenlIZWFkZXJzOiBib29sZWFuXG4gICAgICB1c2VDaGVja0JveGVzOiBib29sZWFuXG4gICAgICB1c2VFbW9qaTogYm9vbGVhblxuICAgICAgdXNlVG9jOiBib29sZWFuXG4gICAgICB1c2VJbXNpemU6IGJvb2xlYW5cbiAgICAgIHVzZUNyaXRpY01hcmt1cDogYm9vbGVhblxuICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy51c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY1BhdGgnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NGaWx0ZXJzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NBcmd1bWVudHMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY01hcmtkb3duRmxhdm9yJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQmlibGlvZ3JhcGh5JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY1JlbW92ZVJlZmVyZW5jZXMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQklCRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZyc6IHtcbiAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cbiAgICAgIHBhbmRvY1BhdGg6IHN0cmluZ1xuICAgICAgcGFuZG9jRmlsdGVyczogc3RyaW5nW11cbiAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cbiAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiBzdHJpbmdcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeTogYm9vbGVhblxuICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxuICAgICAgcGFuZG9jQklCRmlsZTogc3RyaW5nXG4gICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXG4gICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzJzoge1xuICAgICAgZ3JhbW1hcnM6IHN0cmluZ1tdXG4gICAgICBleHRlbnNpb25zOiBzdHJpbmdbXVxuICAgICAgdXNlR2l0SHViU3R5bGU6IGJvb2xlYW5cbiAgICAgIHN5bnRheFRoZW1lTmFtZTogc3RyaW5nXG4gICAgICBpbXBvcnRQYWNrYWdlU3R5bGVzOiBzdHJpbmdbXVxuICAgICAgcmVuZGVyZXI6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xuICAgICAgcmljaENsaXBib2FyZDogYm9vbGVhblxuICAgICAgJ3ByZXZpZXdDb25maWcubGl2ZVVwZGF0ZSc6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAncHJldmlld0NvbmZpZy5wcmV2aWV3RG9jayc6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICAncHJldmlld0NvbmZpZy5jbG9zZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICAgJ3ByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLnNoZWxsT3BlbkZpbGVFeHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAgIHByZXZpZXdDb25maWc6IHtcbiAgICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgICAgc2hlbGxPcGVuRmlsZUV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB9XG4gICAgICAnc2F2ZUNvbmZpZy5tZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cic6XG4gICAgICAgIHwgJ3JlbGF0aXZpemVkJ1xuICAgICAgICB8ICdhYnNvbHV0aXplZCdcbiAgICAgICAgfCAndW50b3VjaGVkJ1xuICAgICAgJ3NhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOlxuICAgICAgICB8ICdyZWxhdGl2aXplZCdcbiAgICAgICAgfCAnYWJzb2x1dGl6ZWQnXG4gICAgICAgIHwgJ3VudG91Y2hlZCdcbiAgICAgICdzYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0JzogJ2h0bWwnIHwgJ3BkZidcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnOlxuICAgICAgICB8ICdBMydcbiAgICAgICAgfCAnQTQnXG4gICAgICAgIHwgJ0E1J1xuICAgICAgICB8ICdMZWdhbCdcbiAgICAgICAgfCAnTGV0dGVyJ1xuICAgICAgICB8ICdUYWJsb2lkJ1xuICAgICAgICB8ICdDdXN0b20nXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmN1c3RvbVBhZ2VTaXplJzogc3RyaW5nXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGZhbHNlIHwgdHJ1ZVxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMnOiB7XG4gICAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgICAgcGFnZVNpemU6ICdBMycgfCAnQTQnIHwgJ0E1JyB8ICdMZWdhbCcgfCAnTGV0dGVyJyB8ICdUYWJsb2lkJyB8ICdDdXN0b20nXG4gICAgICAgIGN1c3RvbVBhZ2VTaXplOiBzdHJpbmdcbiAgICAgICAgbGFuZHNjYXBlOiBmYWxzZSB8IHRydWVcbiAgICAgICAgcHJpbnRCYWNrZ3JvdW5kOiBib29sZWFuXG4gICAgICAgIHByaW50U2VsZWN0aW9uT25seTogYm9vbGVhblxuICAgICAgfVxuICAgICAgc2F2ZUNvbmZpZzoge1xuICAgICAgICBtZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xuICAgICAgICBtZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xuICAgICAgICBkZWZhdWx0U2F2ZUZvcm1hdDogJ2h0bWwnIHwgJ3BkZidcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnOlxuICAgICAgICAgIHwgJ0EzJ1xuICAgICAgICAgIHwgJ0E0J1xuICAgICAgICAgIHwgJ0E1J1xuICAgICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgICB8ICdUYWJsb2lkJ1xuICAgICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICAgICBzYXZlVG9QREZPcHRpb25zOiB7XG4gICAgICAgICAgbWFyZ2luc1R5cGU6IDAgfCAxIHwgMlxuICAgICAgICAgIHBhZ2VTaXplOlxuICAgICAgICAgICAgfCAnQTMnXG4gICAgICAgICAgICB8ICdBNCdcbiAgICAgICAgICAgIHwgJ0E1J1xuICAgICAgICAgICAgfCAnTGVnYWwnXG4gICAgICAgICAgICB8ICdMZXR0ZXInXG4gICAgICAgICAgICB8ICdUYWJsb2lkJ1xuICAgICAgICAgICAgfCAnQ3VzdG9tJ1xuICAgICAgICAgIGN1c3RvbVBhZ2VTaXplOiBzdHJpbmdcbiAgICAgICAgICBsYW5kc2NhcGU6IGZhbHNlIHwgdHJ1ZVxuICAgICAgICAgIHByaW50QmFja2dyb3VuZDogYm9vbGVhblxuICAgICAgICAgIHByaW50U2VsZWN0aW9uT25seTogYm9vbGVhblxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAnc3luY0NvbmZpZy5zeW5jUHJldmlld09uQ2hhbmdlJzogYm9vbGVhblxuICAgICAgJ3N5bmNDb25maWcuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cbiAgICAgICdzeW5jQ29uZmlnLnN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGwnOiBib29sZWFuXG4gICAgICBzeW5jQ29uZmlnOiB7XG4gICAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IGJvb2xlYW5cbiAgICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDogYm9vbGVhblxuICAgICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiBib29sZWFuXG4gICAgICB9XG4gICAgICAnbWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAgICdtYXRoQ29uZmlnLmxhdGV4UmVuZGVyZXInOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAgICdtYXRoQ29uZmlnLm51bWJlckVxdWF0aW9ucyc6IGJvb2xlYW5cbiAgICAgICdtYXRoQ29uZmlnLnRleEV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICAgJ21hdGhDb25maWcudW5kZWZpbmVkRmFtaWx5Jzogc3RyaW5nXG4gICAgICBtYXRoQ29uZmlnOiB7XG4gICAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiBib29sZWFuXG4gICAgICAgIGxhdGV4UmVuZGVyZXI6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgICBudW1iZXJFcXVhdGlvbnM6IGJvb2xlYW5cbiAgICAgICAgdGV4RXh0ZW5zaW9uczogc3RyaW5nW11cbiAgICAgICAgdW5kZWZpbmVkRmFtaWx5OiBzdHJpbmdcbiAgICAgIH1cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlTGF6eUhlYWRlcnMnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VDaGVja0JveGVzJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlRW1vamknOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VUb2MnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VJbXNpemUnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VDcml0aWNNYXJrdXAnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy5ibG9ja01hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAgIG1hcmtkb3duSXRDb25maWc6IHtcbiAgICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cbiAgICAgICAgdXNlTGF6eUhlYWRlcnM6IGJvb2xlYW5cbiAgICAgICAgdXNlQ2hlY2tCb3hlczogYm9vbGVhblxuICAgICAgICB1c2VFbW9qaTogYm9vbGVhblxuICAgICAgICB1c2VUb2M6IGJvb2xlYW5cbiAgICAgICAgdXNlSW1zaXplOiBib29sZWFuXG4gICAgICAgIHVzZUNyaXRpY01hcmt1cDogYm9vbGVhblxuICAgICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIH1cbiAgICAgICdwYW5kb2NDb25maWcudXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlcyc6IGJvb2xlYW5cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NGaWx0ZXJzJzogc3RyaW5nW11cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQXJndW1lbnRzJzogc3RyaW5nW11cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQmlibGlvZ3JhcGh5JzogYm9vbGVhblxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzJzogYm9vbGVhblxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICAgcGFuZG9jQ29uZmlnOiB7XG4gICAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXG4gICAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXG4gICAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cbiAgICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xuICAgICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxuICAgICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXG4gICAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=