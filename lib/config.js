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
                    latexRenderer: {
                        title: 'Math Renderer',
                        description: 'LaTeX Math renderer for PDF export; HTML-CSS usually looks better',
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
                default: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWlCYSxRQUFBLE1BQU0sR0FBWTtJQUM3QixRQUFRLEVBQUU7UUFDUixLQUFLLEVBQUUsbUJBQW1CO1FBQzFCLFdBQVcsRUFBRSxxREFBcUQ7UUFDbEUsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUU7WUFDUCxZQUFZO1lBQ1osa0JBQWtCO1lBQ2xCLGlCQUFpQjtZQUNqQixTQUFTO1lBQ1QsWUFBWTtZQUNaLHlCQUF5QjtTQUMxQjtRQUNELEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ25FLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsS0FBSyxFQUFFLHNCQUFzQjtRQUM3QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELGVBQWUsRUFBRTtRQUNmLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsV0FBVyxFQUNULGlGQUFpRjtRQUNuRixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLEdBQUc7S0FDWDtJQUNELG1CQUFtQixFQUFFO1FBQ25CLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsV0FBVyxFQUNULCtFQUErRTtZQUMvRSw4RUFB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QkFDZCxPQUFPLEVBQUUsRUFBRTtnQkFDWCxLQUFLLEVBQUUsaUNBQWlDO2dCQUN4QyxXQUFXLEVBQUUsK0JBQStCO2dCQUM1QyxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0QsYUFBYSxFQUFFO2dCQUNiLElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxZQUFZO2dCQUNyQixLQUFLLEVBQUUsOEJBQThCO2dCQUNyQyxXQUFXLEVBQUUsMkNBQTJDO2dCQUN4RCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0QscUJBQXFCLEVBQUU7Z0JBQ3JCLElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxFQUFFO2dCQUNYLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLFdBQVcsRUFBRSwrQkFBK0I7Z0JBQzVDLEtBQUssRUFBRSxFQUFFO2FBQ1Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBpbnRlcmZhY2UgSUNvbmZpZyB7XG4gIFtrZXk6IHN0cmluZ106IHtcbiAgICB0aXRsZTogc3RyaW5nXG4gICAgb3JkZXI6IG51bWJlclxuICAgIHR5cGU6IHN0cmluZ1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gICAgcHJvcGVydGllcz86IElDb25maWdcbiAgICBkZWZhdWx0PzogYW55XG4gICAgbWluaW11bT86IGFueVxuICAgIG1heGltdW0/OiBhbnlcbiAgICBlbnVtPzogYW55W11cbiAgICBpdGVtcz86IHtcbiAgICAgIHR5cGU6IHN0cmluZ1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY29uZmlnOiBJQ29uZmlnID0ge1xuICBncmFtbWFyczoge1xuICAgIHRpdGxlOiAnTWFya2Rvd24gR3JhbW1hcnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRWRpdG9ycyB1c2luZyB3aGF0IGdyYW1tYXJzIGFyZSBjb25zaWRlcmVkIE1hcmtkb3duJyxcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGRlZmF1bHQ6IFtcbiAgICAgICdzb3VyY2UuZ2ZtJyxcbiAgICAgICdzb3VyY2UubGl0Y29mZmVlJyxcbiAgICAgICd0ZXh0Lmh0bWwuYmFzaWMnLFxuICAgICAgJ3RleHQubWQnLFxuICAgICAgJ3RleHQucGxhaW4nLFxuICAgICAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJyxcbiAgICBdLFxuICAgIG9yZGVyOiAwLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBleHRlbnNpb25zOiB7XG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICB0aXRsZTogJ01hcmtkb3duIGZpbGUgZXh0ZW5zaW9ucycsXG4gICAgZGVzY3JpcHRpb246ICdXaGljaCBmaWxlcyBhcmUgY29uc2lkZXJlZCBNYXJrZG93bicsXG4gICAgZGVmYXVsdDogWydtYXJrZG93bicsICdtZCcsICdtZG93bicsICdta2QnLCAnbWtkb3duJywgJ3JvbicsICd0eHQnXSxcbiAgICBvcmRlcjogMSxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgdXNlR2l0SHViU3R5bGU6IHtcbiAgICB0aXRsZTogJ1VzZSBHaXRIdWIuY29tIHN0eWxlJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDIsXG4gIH0sXG4gIHN5bnRheFRoZW1lTmFtZToge1xuICAgIHRpdGxlOiAnU3ludGF4IHRoZW1lIGZvciBjb2RlIGJsb2NrcycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnSWYgbm90IGVtcHR5LCB3aWxsIHRyeSB0byB1c2UgdGhlIGdpdmVuIHN5bnRheCB0aGVtZSBmb3IgY29kZSBibG9ja3MgaW4gcHJldmlldycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJycsXG4gICAgb3JkZXI6IDIuNSxcbiAgfSxcbiAgaW1wb3J0UGFja2FnZVN0eWxlczoge1xuICAgIHRpdGxlOiAnUGFja2FnZXMgdGhhdCBjYW4gYWZmZWN0IHByZXZpZXcgcmVuZGVyaW5nJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdBIGxpc3Qgb2YgQXRvbSBwYWNrYWdlIG5hbWVzIHRoYXQgY2FuIGFmZmVjdCBwcmV2aWV3IHN0eWxlLCBjb21tYS1zZXBhcmF0ZWQuICcgK1xuICAgICAgJ0Egc3BlY2lhbCB2YWx1ZSBvZiBgKmAgKHN0YXIpIHdpbGwgaW1wb3J0IGFsbCBBdG9tIHN0eWxlcyBpbnRvIHRoZSBwcmV2aWV3LCAnICtcbiAgICAgICd1c2Ugd2l0aCBjYXJlLiBUaGlzIGRvZXMgbm90IGFmZmVjdCBleHBvcnRlZCBIVE1MJyxcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICAgIGRlZmF1bHQ6IFsnZm9udHMnXSxcbiAgICBvcmRlcjogMi42LFxuICB9LFxuICBjb2RlVGFiV2lkdGg6IHtcbiAgICB0aXRsZTogJ1RhYiB3aWR0aCBmb3IgY29kZSBibG9ja3MnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0hvdyB0byByZW5kZXIgdGFiIGNoYXJhY3RlciBpbiBjb2RlIGJsb2NrczsnICtcbiAgICAgICcgMCBtZWFucyB1c2UgQXRvbSBnbG9iYWwgc2V0dGluZycsXG4gICAgdHlwZTogJ2ludGVnZXInLFxuICAgIGRlZmF1bHQ6IDAsXG4gICAgbWluaW11bTogMCxcbiAgICBvcmRlcjogMi43LFxuICB9LFxuICByZW5kZXJlcjoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1pdCcsXG4gICAgdGl0bGU6ICdSZW5kZXJlciBiYWNrZW5kJyxcbiAgICBlbnVtOiBbJ21hcmtkb3duLWl0JywgJ3BhbmRvYyddLFxuICAgIG9yZGVyOiAzLFxuICB9LFxuICByaWNoQ2xpcGJvYXJkOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGl0bGU6ICdVc2UgcmljaCBjbGlwYm9hcmQnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0NvcHkgcmljaCB0ZXh0IHRvIGNsaXBib2FyZCBpbiBhZGRpdGlvbiB0byByYXcgSFRNTCB3aGVuIHVzaW5nIGNvcHkgaHRtbCBjb21tYW5kcycsXG4gICAgb3JkZXI6IDQsXG4gIH0sXG4gIHByZXZpZXdDb25maWc6IHtcbiAgICB0aXRsZTogJ1ByZXZpZXcgQmVoYXZpb3VyJyxcbiAgICBvcmRlcjogMTAsXG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgbGl2ZVVwZGF0ZToge1xuICAgICAgICB0aXRsZTogJ0xpdmUgVXBkYXRlJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgcHJldmlld1NwbGl0UGFuZURpcjoge1xuICAgICAgICB0aXRsZTogJ0RpcmVjdGlvbiB0byBsb2FkIHRoZSBwcmV2aWV3IGluIHNwbGl0IHBhbmUnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3JpZ2h0JyxcbiAgICAgICAgZW51bTogWydkb3duJywgJ3JpZ2h0JywgJ25vbmUnXSxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICAgIHByZXZpZXdEb2NrOiB7XG4gICAgICAgIHRpdGxlOiAnT3BlbiBwcmV2aWV3IGluIGRvY2snLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ2NlbnRlcicsXG4gICAgICAgIGVudW06IFsnbGVmdCcsICdyaWdodCcsICdib3R0b20nLCAnY2VudGVyJ10sXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgIH0sXG4gICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiB7XG4gICAgICAgIHRpdGxlOiAnQ2xvc2UgcHJldmlldyB3aGVuIGVkaXRvciBjbG9zZXMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAyNixcbiAgICAgIH0sXG4gICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiB7XG4gICAgICAgIHRpdGxlOiAnQnJpbmcgdXAgcHJldmlldyB3aGVuIGVkaXRvciBhY3RpdmF0ZXMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMjcsXG4gICAgICB9LFxuICAgICAgc2hlbGxPcGVuRmlsZUV4dGVuc2lvbnM6IHtcbiAgICAgICAgdGl0bGU6ICdBbHdheXMgb3BlbiBsaW5rcyB0byB0aGVzZSBmaWxlIHR5cGVzIGV4dGVybmFsbHknLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnVGhpcyBpcyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGZpbGUgbmFtZSBleHRlbnNpb25zIHRoYXQgJyArXG4gICAgICAgICAgJ3Nob3VsZCBhbHdheXMgYmUgb3BlbmVkIHdpdGggYW4gZXh0ZXJuYWwgcHJvZ3JhbS4gJyArXG4gICAgICAgICAgJ0ZvciBleGFtcGxlLCBpZiB5b3Ugd2FudCB0byBhbHdheXMgb3BlbiBQREYgZmlsZXMgKHByZXN1bWFibHkgbmFtZWQgYHNvbWV0aGluZy5wZGZgKSAnICtcbiAgICAgICAgICAnaW4gc3lzdGVtIFBERiB2aWV3ZXIsIGFkZCBgcGRmYCBoZXJlLicsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFtcbiAgICAgICAgICAnb2R0JyxcbiAgICAgICAgICAnZG9jJyxcbiAgICAgICAgICAnZG9jeCcsXG4gICAgICAgICAgJ29kcycsXG4gICAgICAgICAgJ3hscycsXG4gICAgICAgICAgJ3hsc3gnLFxuICAgICAgICAgICdvZHAnLFxuICAgICAgICAgICdwcHQnLFxuICAgICAgICAgICdwcHR4JyxcbiAgICAgICAgICAnemlwJyxcbiAgICAgICAgICAncmFyJyxcbiAgICAgICAgICAnN3onLFxuICAgICAgICAgICdneicsXG4gICAgICAgICAgJ3h6JyxcbiAgICAgICAgICAnYnoyJyxcbiAgICAgICAgICAndGFyJyxcbiAgICAgICAgICAndGd6JyxcbiAgICAgICAgICAndHh6JyxcbiAgICAgICAgICAndGJ6MicsXG4gICAgICAgIF0sXG4gICAgICAgIG9yZGVyOiAyOCxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc2F2ZUNvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnRXhwb3J0IEJlaGF2aW91cicsXG4gICAgb3JkZXI6IDE1LFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiB7XG4gICAgICAgIHRpdGxlOiAnV2hlbiBzYXZpbmcgYXMgSFRNTCwgbWVkaWEgcGF0aHMgd2lsbCBiZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdNZWRpYSBpbmNsdWRlcyBpbWFnZXMsIGF1ZGlvIGFuZCB2aWRlby4gJyArXG4gICAgICAgICAgJ3JlbGF0aXZlIHNyYyBhdHRyaWJ1dGVzIG9mIGltZywgYXVkaW8sIHZpZGVvIHRhZ3MgY2FuIGVpdGhlciBiZSByZXdyaXR0ZW4gJyArXG4gICAgICAgICAgJ3RvIHVzZSBhYnNvbHV0ZSBmaWxlIHBhdGhzLCBwYXRocyByZWxhdGl2ZSB0byBzYXZlIGxvY2F0aW9uLCBvciBiZSBsZWZ0ICcgK1xuICAgICAgICAgICd1bmFsdGVyZWQnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3JlbGF0aXZpemVkJyxcbiAgICAgICAgZW51bTogWydyZWxhdGl2aXplZCcsICdhYnNvbHV0aXplZCcsICd1bnRvdWNoZWQnXSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiB7XG4gICAgICAgIHRpdGxlOiAnV2hlbiBjb3B5aW5nIGFzIEhUTUwsIG1lZGlhIHBhdGhzIHdpbGwgYmUnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTWVkaWEgaW5jbHVkZXMgaW1hZ2VzLCBhdWRpbyBhbmQgdmlkZW8uICcgK1xuICAgICAgICAgICdyZWxhdGl2ZSBzcmMgYXR0cmlidXRlcyBvZiBpbWcsIGF1ZGlvLCB2aWRlbyB0YWdzIGNhbiBlaXRoZXIgYmUgcmV3cml0dGVuICcgK1xuICAgICAgICAgICd0byB1c2UgYWJzb2x1dGUgZmlsZSBwYXRocywgcGF0aHMgcmVsYXRpdmUgdG8gc2F2ZSBsb2NhdGlvbiwgb3IgYmUgbGVmdCAnICtcbiAgICAgICAgICAndW5hbHRlcmVkJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICd1bnRvdWNoZWQnLFxuICAgICAgICBlbnVtOiBbJ3JlbGF0aXZpemVkJywgJ2Fic29sdXRpemVkJywgJ3VudG91Y2hlZCddLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICB9LFxuICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6IHtcbiAgICAgICAgdGl0bGU6ICdEZWZhdWx0IGZvcm1hdCB0byBzYXZlIGFzJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgICAgZW51bTogWydodG1sJywgJ3BkZiddLFxuICAgICAgICBkZWZhdWx0OiAnaHRtbCcsXG4gICAgICB9LFxuICAgICAgc2F2ZVRvUERGT3B0aW9uczoge1xuICAgICAgICB0aXRsZTogJ1NhdmUgdG8gUERGIG9wdGlvbnMnLFxuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgbGF0ZXhSZW5kZXJlcjoge1xuICAgICAgICAgICAgdGl0bGU6ICdNYXRoIFJlbmRlcmVyJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAnTGFUZVggTWF0aCByZW5kZXJlciBmb3IgUERGIGV4cG9ydDsgSFRNTC1DU1MgdXN1YWxseSBsb29rcyBiZXR0ZXInLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBlbnVtOiBbJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3JywgJ0hUTUwtQ1NTJywgJ1NWRyddLFxuICAgICAgICAgICAgZGVmYXVsdDogJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3JyxcbiAgICAgICAgICAgIG9yZGVyOiA1LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgbWFyZ2luc1R5cGU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnTWFyZ2lucyBUeXBlJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgIGVudW06IFtcbiAgICAgICAgICAgICAgeyB2YWx1ZTogMCwgZGVzY3JpcHRpb246ICdEZWZhdWx0IG1hcmdpbnMnIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6IDEsIGRlc2NyaXB0aW9uOiAnTm8gbWFyZ2lucycgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogMiwgZGVzY3JpcHRpb246ICdNaW5pbXVtIG1hcmdpbnMnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGVmYXVsdDogMCxcbiAgICAgICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhZ2VTaXplOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1BhZ2UgU2l6ZScsXG4gICAgICAgICAgICBlbnVtOiBbJ0EzJywgJ0E0JywgJ0E1JywgJ0xlZ2FsJywgJ0xldHRlcicsICdUYWJsb2lkJywgJ0N1c3RvbSddLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnQTQnLFxuICAgICAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgY3VzdG9tUGFnZVNpemU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIFBhZ2UgU2l6ZScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgJ1Rha2VzIGVmZmVjdCB3aGVuIFBhZ2UgU2l6ZSBpcyBzZXQgdG8gYEN1c3RvbWAuIFNwZWNpZmllZCBhcyAnICtcbiAgICAgICAgICAgICAgJ2A8d2lkdGg+eDxoZWlnaHQ+YCwgd2hlcmUgYDxoZWlnaHQ+YCBhbmQgYDx3aWR0aD5gIGFyZSAnICtcbiAgICAgICAgICAgICAgJ2Zsb2F0aW5nLXBvaW50IG51bWJlcnMgd2l0aCBgLmAgKGRvdCkgYXMgZGVjaW1hbCBzZXBhcmF0b3IsIG5vIHRob3VzYW5kcyBzZXBhcmF0b3IsICcgK1xuICAgICAgICAgICAgICAnYW5kIHdpdGggb3B0aW9uYWwgYGNtYCwgYG1tYCBvciBgaW5gIHN1ZmZpeCB0byBpbmRpY2F0ZSB1bml0cywgZGVmYXVsdCBpcyBgbW1gLiAnICtcbiAgICAgICAgICAgICAgJ0ZvciBleGFtcGxlLCBBNCBpcyBgOC4zaW4geCAxMS43aW5gIG9yIGAyMTBtbSB4IDI5N21tYCBvciBgMjEwIHggMjk3YC4gJyArXG4gICAgICAgICAgICAgICdXaGl0ZXNwYWNlIGlzIGlnbm9yZWQuJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgZGVmYXVsdDogJycsXG4gICAgICAgICAgICBvcmRlcjogMjUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBsYW5kc2NhcGU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUGFnZSBvcmllbnRhdGlvbicsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAgIHsgdmFsdWU6IGZhbHNlLCBkZXNjcmlwdGlvbjogJ1BvcnRyYWl0JyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiB0cnVlLCBkZXNjcmlwdGlvbjogJ0xhbmRzY2FwZScgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG9yZGVyOiAyNixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByaW50QmFja2dyb3VuZDoge1xuICAgICAgICAgICAgdGl0bGU6ICdSZW5kZXIgYmFja2dyb3VuZCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdG8gcmVuZGVyIENTUyBiYWNrZ3JvdW5kcyBpbiBQREYnLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBvcmRlcjogMzAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUmVuZGVyIG9ubHkgc2VsZWN0aW9uJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT25seSByZW5kZXIgc2VsZWN0ZWQgZG9jdW1lbnQgZnJhZ21lbnQuIEV4cGVyaW1lbnRhbCcsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG9yZGVyOiA0MCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBzeW5jQ29uZmlnOiB7XG4gICAgdGl0bGU6ICdQcmV2aWV3IHBvc2l0aW9uIHN5bmNocm9uaXphdGlvbiBiZWhhdmlvdXInLFxuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIG9yZGVyOiAyMCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiB7XG4gICAgICAgIHRpdGxlOiAnU3luYyBwcmV2aWV3IHBvc2l0aW9uIHdoZW4gdGV4dCBpbiBlZGl0b3IgY2hhbmdlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyOCxcbiAgICAgIH0sXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiB7XG4gICAgICAgIHRpdGxlOiAnU3luYyBwcmV2aWV3IHBvc2l0aW9uIHdoZW4gdGV4dCBlZGl0b3IgaXMgc2Nyb2xsZWQnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTm90ZTogaWYgYm90aCBzY3JvbGwgc3luYyBvcHRpb25zIGFyZSBlbmFibGVkLCB0aGUgZWRpdG9yICcgK1xuICAgICAgICAgICdoYXMgdG8gYmUgaW4gYWN0aXZlIHBhbmUgZm9yIHRoaXMgb3B0aW9uIHRvIHRha2UgZWZmZWN0JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI4LjEsXG4gICAgICB9LFxuICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDoge1xuICAgICAgICB0aXRsZTogJ1N5bmMgZWRpdG9yIHBvc2l0aW9uIHdoZW4gcHJldmlldyBpcyBzY3JvbGxlZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdOb3RlOiBpZiBib3RoIHNjcm9sbCBzeW5jIG9wdGlvbnMgYXJlIGVuYWJsZWQsIHRoZSBwcmV2aWV3ICcgK1xuICAgICAgICAgICdoYXMgdG8gYmUgaW4gYWN0aXZlIHBhbmUgZm9yIHRoaXMgb3B0aW9uIHRvIHRha2UgZWZmZWN0JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI4LjIsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG1hdGhDb25maWc6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICB0aXRsZTogJ01hdGggT3B0aW9ucycsXG4gICAgb3JkZXI6IDMwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIE1hdGggUmVuZGVyaW5nIEJ5IERlZmF1bHQnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMCxcbiAgICAgIH0sXG4gICAgICBsYXRleFJlbmRlcmVyOiB7XG4gICAgICAgIHRpdGxlOiAnTWF0aCBSZW5kZXJlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdTVkcgaXMgbm90aWNlYWJseSBmYXN0ZXIsIGJ1dCBtaWdodCBsb29rIHdvcnNlIG9uIHNvbWUgc3lzdGVtcycsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBlbnVtOiBbJ0hUTUwtQ1NTJywgJ1NWRyddLFxuICAgICAgICBkZWZhdWx0OiAnU1ZHJyxcbiAgICAgICAgb3JkZXI6IDUsXG4gICAgICB9LFxuICAgICAgbnVtYmVyRXF1YXRpb25zOiB7XG4gICAgICAgIHRpdGxlOiAnTnVtYmVyIGVxdWF0aW9ucycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdOdW1iZXIgZXF1YXRpb25zIHRoYXQgYXJlIGluIGVxdWF0aW9uIGVudmlyb25tZW50LCBldGMuICcgK1xuICAgICAgICAgICdXaWxsIHJlLXJlbmRlciBhbGwgbWF0aCBvbiBlYWNoIG1hdGggY2hhbmdlLCB3aGljaCBtaWdodCBiZSB1bmRlc2lyYWJsZS4nLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgdGV4RXh0ZW5zaW9uczoge1xuICAgICAgICB0aXRsZTogJ01hdGhKYXggVGVYIGV4dGVuc2lvbnMnLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXG4gICAgICAgICAgJ0FNU21hdGguanMnLFxuICAgICAgICAgICdBTVNzeW1ib2xzLmpzJyxcbiAgICAgICAgICAnbm9FcnJvcnMuanMnLFxuICAgICAgICAgICdub1VuZGVmaW5lZC5qcycsXG4gICAgICAgIF0sXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgICAgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSxcbiAgICAgIH0sXG4gICAgICB1bmRlZmluZWRGYW1pbHk6IHtcbiAgICAgICAgdGl0bGU6ICdNYXRoSmF4IGB1bmRlZmluZWRGYW1pbHlgIChmb250IGZhbWlseSknLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3NlcmlmJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBtYXJrZG93bkl0Q29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdNYXJrZG93bi1JdCBTZXR0aW5ncycsXG4gICAgb3JkZXI6IDQwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiB7XG4gICAgICAgIHRpdGxlOiAnQnJlYWsgb24gc2luZ2xlIG5ld2xpbmUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMCxcbiAgICAgIH0sXG4gICAgICB1c2VMYXp5SGVhZGVyczoge1xuICAgICAgICB0aXRsZTogJ1VzZSBMYXp5IEhlYWRlcnMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlcXVpcmUgbm8gc3BhY2UgYWZ0ZXIgaGVhZGluZ3MgIycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDUsXG4gICAgICB9LFxuICAgICAgdXNlQ2hlY2tCb3hlczoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBDaGVja0JveCBsaXN0cyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2tCb3ggbGlzdHMsIGxpa2Ugb24gR2l0SHViJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgdXNlRW1vamk6IHtcbiAgICAgICAgdGl0bGU6ICdVc2UgRW1vamkgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Vtb2ppIHJlbmRlcmluZycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDE1LFxuICAgICAgfSxcbiAgICAgIHVzZVRvYzoge1xuICAgICAgICB0aXRsZTogJ1VzZSB0YWJsZSBvZiBjb250ZW50cyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZSBbW3RvY11dIHdpdGggYXV0b2dlbmVyYXRlZCB0YWJsZSBvZiBjb250ZW50cycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgIH0sXG4gICAgICB1c2VJbXNpemU6IHtcbiAgICAgICAgdGl0bGU6ICdBbGxvdyBzcGVjaWZ5aW5nIGltYWdlIHNpemUgaW4gaW1hZ2UgdGl0bGUnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnQWxsb3cgbm9uLXN0YW5kYXJkIHN5bnRheCBmb3Igc3BlY2lmeWluZyBpbWFnZSBzaXplIHZpYSAnICtcbiAgICAgICAgICAnYXBwZW5kaW5nIGA9PHdpZHRoPng8aGVpZ2h0PmAgdG8gaW1hZ2Ugc3BhY2lmaWNhdGlvbiwgJyArXG4gICAgICAgICAgJ2YuZXguIGAhW3Rlc3RdKGltYWdlLnBuZyA9MTAweDIwMClgJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMjUsXG4gICAgICB9LFxuICAgICAgdXNlQ3JpdGljTWFya3VwOiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIENyaXRpY01hcmt1cCBzeW50YXggc3VwcG9ydCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU3VwcG9ydCBpcyBsaW1pdGVkIHRvIGlubGluZSBvbmx5JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDQwLFxuICAgICAgfSxcbiAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiB7XG4gICAgICAgIHRpdGxlOiAnSW5saW5lIG1hdGggc2VwYXJhdG9ycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdMaXN0IG9mIGlubGluZSBtYXRoIHNlcGFyYXRvcnMgaW4gcGFpcnMgLS0gZmlyc3Qgb3BlbmluZywgdGhlbiBjbG9zaW5nJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogWyckJywgJyQnLCAnXFxcXCgnLCAnXFxcXCknXSxcbiAgICAgICAgb3JkZXI6IDExMCxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiB7XG4gICAgICAgIHRpdGxlOiAnQmxvY2sgbWF0aCBzZXBhcmF0b3JzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0xpc3Qgb2YgYmxvY2sgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFsnJCQnLCAnJCQnLCAnXFxcXFsnLCAnXFxcXF0nXSxcbiAgICAgICAgb3JkZXI6IDEyMCxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGFuZG9jQ29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdQYW5kb2Mgc2V0dGluZ3MnLFxuICAgIG9yZGVyOiA1MCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIG5hdGl2ZSBQYW5kb2MgY29kZSBibG9jayBzdHlsZScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgIFwiRG9uJ3QgY29udmVydCBmZW5jZWQgY29kZSBibG9ja3MgdG8gQXRvbSBlZGl0b3JzIHdoZW4gdXNpbmdcIiArXG4gICAgICAgICAgJ1BhbmRvYyBwYXJzZXInLFxuICAgICAgICBvcmRlcjogMCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NQYXRoOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncGFuZG9jJyxcbiAgICAgICAgdGl0bGU6ICdQYXRoIHRvIFBhbmRvYyBleGVjdXRhYmxlJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ1BsZWFzZSBzcGVjaWZ5IHRoZSBjb3JyZWN0IHBhdGggdG8geW91ciBwYW5kb2MgZXhlY3V0YWJsZSwgJyArXG4gICAgICAgICAgJ2ZvciBleGFtcGxlLCAvdXNyL2Jpbi9wYW5kb2MsIG9yIEM6XFxcXFByb2dyYW0gRmlsZXNcXFxcUGFuZG9jXFxcXHBhbmRvYy5leGUnLFxuICAgICAgICBvcmRlcjogNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NGaWx0ZXJzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgICB0aXRsZTogJ0ZpbHRlcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBmaWx0ZXJzLCBpbiBvcmRlciBvZiBhcHBsaWNhdGlvbi4gV2lsbCBiZSBwYXNzZWQgdmlhIGNvbW1hbmQtbGluZSBhcmd1bWVudHMnLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGFuZG9jQXJndW1lbnRzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgICB0aXRsZTogJ0NvbW1hbmRsaW5lIEFyZ3VtZW50cycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGFyZ3VtZW50cyBlLmcuIGAtLXNtYXJ0LCAtLWZpbHRlcj0vYmluL2V4ZWAuIFBsZWFzZSB1c2UgbG9uZyBhcmd1bWVudCBuYW1lcy4nLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1yYXdfdGV4K3RleF9tYXRoX3NpbmdsZV9iYWNrc2xhc2gnLFxuICAgICAgICB0aXRsZTogJ01hcmtkb3duIEZsYXZvcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW50ZXIgdGhlIHBhbmRvYyBtYXJrZG93biBmbGF2b3IgeW91IHdhbnQnLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIHRpdGxlOiAnQ2l0YXRpb25zICh2aWEgcGFuZG9jLWNpdGVwcm9jKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdFbmFibGUgdGhpcyBmb3IgYmlibGlvZ3JhcGh5IHBhcnNpbmcuICcgK1xuICAgICAgICAgICdOb3RlOiBwYW5kb2MtY2l0ZXByb2MgaXMgYXBwbGllZCBhZnRlciBvdGhlciBmaWx0ZXJzIHNwZWNpZmllZCBpbiAnICtcbiAgICAgICAgICAnRmlsdGVycywgYnV0IGJlZm9yZSBvdGhlciBjb21tYW5kbGluZSBhcmd1bWVudHMgJyxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0aXRsZTogJ1JlbW92ZSBSZWZlcmVuY2VzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZW1vdmVzIHJlZmVyZW5jZXMgYXQgdGhlIGVuZCBvZiB0aGUgSFRNTCBwcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0JJQkZpbGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdiaWJsaW9ncmFwaHkuYmliJyxcbiAgICAgICAgdGl0bGU6ICdCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGJpYmZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseScsXG4gICAgICAgIG9yZGVyOiAzNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICB0aXRsZTogJ0ZhbGxiYWNrIEJpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBiaWJmaWxlJyxcbiAgICAgICAgb3JkZXI6IDQwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0NTTEZpbGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdjdXN0b20uY3NsJyxcbiAgICAgICAgdGl0bGU6ICdCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGNzbGZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseScsXG4gICAgICAgIG9yZGVyOiA0NSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICB0aXRsZTogJ0ZhbGxiYWNrIEJpYmxpb2dyYXBoeSBTdHlsZSAoY3NsZmlsZSknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBjc2xmaWxlJyxcbiAgICAgICAgb3JkZXI6IDUwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufVxuXG4vLyBnZW5lcmF0ZWQgYnkgdHlwZWQtY29uZmlnLmpzXG5kZWNsYXJlIG1vZHVsZSAnYXRvbScge1xuICBpbnRlcmZhY2UgQ29uZmlnVmFsdWVzIHtcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmdyYW1tYXJzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW50YXhUaGVtZU5hbWUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmltcG9ydFBhY2thZ2VTdHlsZXMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuY29kZVRhYldpZHRoJzogbnVtYmVyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5yZW5kZXJlcic6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucmljaENsaXBib2FyZCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcubGl2ZVVwZGF0ZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcucHJldmlld1NwbGl0UGFuZURpcic6XG4gICAgICB8ICdkb3duJ1xuICAgICAgfCAncmlnaHQnXG4gICAgICB8ICdub25lJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5wcmV2aWV3RG9jayc6XG4gICAgICB8ICdsZWZ0J1xuICAgICAgfCAncmlnaHQnXG4gICAgICB8ICdib3R0b20nXG4gICAgICB8ICdjZW50ZXInXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmNsb3NlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLnNoZWxsT3BlbkZpbGVFeHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcnOiB7XG4gICAgICBsaXZlVXBkYXRlOiBib29sZWFuXG4gICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICBwcmV2aWV3RG9jazogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcidcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgIHNoZWxsT3BlbkZpbGVFeHRlbnNpb25zOiBzdHJpbmdbXVxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcubWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXInOlxuICAgICAgfCAncmVsYXRpdml6ZWQnXG4gICAgICB8ICdhYnNvbHV0aXplZCdcbiAgICAgIHwgJ3VudG91Y2hlZCdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOlxuICAgICAgfCAncmVsYXRpdml6ZWQnXG4gICAgICB8ICdhYnNvbHV0aXplZCdcbiAgICAgIHwgJ3VudG91Y2hlZCdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuZGVmYXVsdFNhdmVGb3JtYXQnOiAnaHRtbCcgfCAncGRmJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmxhdGV4UmVuZGVyZXInOlxuICAgICAgfCAnU2FtZSBhcyBsaXZlIHByZXZpZXcnXG4gICAgICB8ICdIVE1MLUNTUydcbiAgICAgIHwgJ1NWRydcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzpcbiAgICAgIHwgJ0EzJ1xuICAgICAgfCAnQTQnXG4gICAgICB8ICdBNSdcbiAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgfCAnTGV0dGVyJ1xuICAgICAgfCAnVGFibG9pZCdcbiAgICAgIHwgJ0N1c3RvbSdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5jdXN0b21QYWdlU2l6ZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGZhbHNlIHwgdHJ1ZVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludFNlbGVjdGlvbk9ubHknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMnOiB7XG4gICAgICBsYXRleFJlbmRlcmVyOiAnU2FtZSBhcyBsaXZlIHByZXZpZXcnIHwgJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICBwYWdlU2l6ZTogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnIHwgJ0N1c3RvbSdcbiAgICAgIGN1c3RvbVBhZ2VTaXplOiBzdHJpbmdcbiAgICAgIGxhbmRzY2FwZTogZmFsc2UgfCB0cnVlXG4gICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgIHByaW50U2VsZWN0aW9uT25seTogYm9vbGVhblxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcnOiB7XG4gICAgICBtZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xuICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiAnaHRtbCcgfCAncGRmJ1xuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubGF0ZXhSZW5kZXJlcic6XG4gICAgICAgIHwgJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3J1xuICAgICAgICB8ICdIVE1MLUNTUydcbiAgICAgICAgfCAnU1ZHJ1xuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzpcbiAgICAgICAgfCAnQTMnXG4gICAgICAgIHwgJ0E0J1xuICAgICAgICB8ICdBNSdcbiAgICAgICAgfCAnTGVnYWwnXG4gICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgfCAnQ3VzdG9tJ1xuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGZhbHNlIHwgdHJ1ZVxuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRCYWNrZ3JvdW5kJzogYm9vbGVhblxuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICAgc2F2ZVRvUERGT3B0aW9uczoge1xuICAgICAgICBsYXRleFJlbmRlcmVyOiAnU2FtZSBhcyBsaXZlIHByZXZpZXcnIHwgJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgICAgcGFnZVNpemU6ICdBMycgfCAnQTQnIHwgJ0E1JyB8ICdMZWdhbCcgfCAnTGV0dGVyJyB8ICdUYWJsb2lkJyB8ICdDdXN0b20nXG4gICAgICAgIGN1c3RvbVBhZ2VTaXplOiBzdHJpbmdcbiAgICAgICAgbGFuZHNjYXBlOiBmYWxzZSB8IHRydWVcbiAgICAgICAgcHJpbnRCYWNrZ3JvdW5kOiBib29sZWFuXG4gICAgICAgIHByaW50U2VsZWN0aW9uT25seTogYm9vbGVhblxuICAgICAgfVxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcnOiB7XG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXG4gICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiBib29sZWFuXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLnRleEV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy51bmRlZmluZWRGYW1pbHknOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcnOiB7XG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxuICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICBudW1iZXJFcXVhdGlvbnM6IGJvb2xlYW5cbiAgICAgIHRleEV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB1bmRlZmluZWRGYW1pbHk6IHN0cmluZ1xuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VDaGVja0JveGVzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlVG9jJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VJbXNpemUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUNyaXRpY01hcmt1cCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy5ibG9ja01hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcnOiB7XG4gICAgICBicmVha09uU2luZ2xlTmV3bGluZTogYm9vbGVhblxuICAgICAgdXNlTGF6eUhlYWRlcnM6IGJvb2xlYW5cbiAgICAgIHVzZUNoZWNrQm94ZXM6IGJvb2xlYW5cbiAgICAgIHVzZUVtb2ppOiBib29sZWFuXG4gICAgICB1c2VUb2M6IGJvb2xlYW5cbiAgICAgIHVzZUltc2l6ZTogYm9vbGVhblxuICAgICAgdXNlQ3JpdGljTWFya3VwOiBib29sZWFuXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnJzoge1xuICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczogYm9vbGVhblxuICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXG4gICAgICBwYW5kb2NGaWx0ZXJzOiBzdHJpbmdbXVxuICAgICAgcGFuZG9jQXJndW1lbnRzOiBzdHJpbmdbXVxuICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xuICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiBib29sZWFuXG4gICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiBib29sZWFuXG4gICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcbiAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICBwYW5kb2NDU0xGaWxlOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMnOiB7XG4gICAgICBncmFtbWFyczogc3RyaW5nW11cbiAgICAgIGV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB1c2VHaXRIdWJTdHlsZTogYm9vbGVhblxuICAgICAgc3ludGF4VGhlbWVOYW1lOiBzdHJpbmdcbiAgICAgIGltcG9ydFBhY2thZ2VTdHlsZXM6IHN0cmluZ1tdXG4gICAgICBjb2RlVGFiV2lkdGg6IG51bWJlclxuICAgICAgcmVuZGVyZXI6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xuICAgICAgcmljaENsaXBib2FyZDogYm9vbGVhblxuICAgICAgJ3ByZXZpZXdDb25maWcubGl2ZVVwZGF0ZSc6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAncHJldmlld0NvbmZpZy5wcmV2aWV3RG9jayc6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICAncHJldmlld0NvbmZpZy5jbG9zZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICAgJ3ByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLnNoZWxsT3BlbkZpbGVFeHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAgIHByZXZpZXdDb25maWc6IHtcbiAgICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgICAgc2hlbGxPcGVuRmlsZUV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB9XG4gICAgICAnc2F2ZUNvbmZpZy5tZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cic6XG4gICAgICAgIHwgJ3JlbGF0aXZpemVkJ1xuICAgICAgICB8ICdhYnNvbHV0aXplZCdcbiAgICAgICAgfCAndW50b3VjaGVkJ1xuICAgICAgJ3NhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOlxuICAgICAgICB8ICdyZWxhdGl2aXplZCdcbiAgICAgICAgfCAnYWJzb2x1dGl6ZWQnXG4gICAgICAgIHwgJ3VudG91Y2hlZCdcbiAgICAgICdzYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0JzogJ2h0bWwnIHwgJ3BkZidcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubGF0ZXhSZW5kZXJlcic6XG4gICAgICAgIHwgJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3J1xuICAgICAgICB8ICdIVE1MLUNTUydcbiAgICAgICAgfCAnU1ZHJ1xuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XG4gICAgICAgIHwgJ0EzJ1xuICAgICAgICB8ICdBNCdcbiAgICAgICAgfCAnQTUnXG4gICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICB8ICdMZXR0ZXInXG4gICAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucyc6IHtcbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3JyB8ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCcgfCAnQ3VzdG9tJ1xuICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICAgIGxhbmRzY2FwZTogZmFsc2UgfCB0cnVlXG4gICAgICAgIHByaW50QmFja2dyb3VuZDogYm9vbGVhblxuICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgIH1cbiAgICAgIHNhdmVDb25maWc6IHtcbiAgICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6ICdodG1sJyB8ICdwZGYnXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLmxhdGV4UmVuZGVyZXInOlxuICAgICAgICAgIHwgJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3J1xuICAgICAgICAgIHwgJ0hUTUwtQ1NTJ1xuICAgICAgICAgIHwgJ1NWRydcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnOlxuICAgICAgICAgIHwgJ0EzJ1xuICAgICAgICAgIHwgJ0E0J1xuICAgICAgICAgIHwgJ0E1J1xuICAgICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgICB8ICdUYWJsb2lkJ1xuICAgICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICAgICBzYXZlVG9QREZPcHRpb25zOiB7XG4gICAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3JyB8ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgICAgICBwYWdlU2l6ZTpcbiAgICAgICAgICAgIHwgJ0EzJ1xuICAgICAgICAgICAgfCAnQTQnXG4gICAgICAgICAgICB8ICdBNSdcbiAgICAgICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICAgICAgfCAnTGV0dGVyJ1xuICAgICAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICAgICAgbGFuZHNjYXBlOiBmYWxzZSB8IHRydWVcbiAgICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgJ3N5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXG4gICAgICAnc3luY0NvbmZpZy5zeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsJzogYm9vbGVhblxuICAgICAgc3luY0NvbmZpZzoge1xuICAgICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXG4gICAgICAgIHN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGw6IGJvb2xlYW5cbiAgICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDogYm9vbGVhblxuICAgICAgfVxuICAgICAgJ21hdGhDb25maWcuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnOiBib29sZWFuXG4gICAgICAnbWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJzogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICAnbWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXG4gICAgICAnbWF0aENvbmZpZy50ZXhFeHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAgICdtYXRoQ29uZmlnLnVuZGVmaW5lZEZhbWlseSc6IHN0cmluZ1xuICAgICAgbWF0aENvbmZpZzoge1xuICAgICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxuICAgICAgICBsYXRleFJlbmRlcmVyOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXG4gICAgICAgIHRleEV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICAgIHVuZGVmaW5lZEZhbWlseTogc3RyaW5nXG4gICAgICB9XG4gICAgICAnbWFya2Rvd25JdENvbmZpZy5icmVha09uU2luZ2xlTmV3bGluZSc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUVtb2ppJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlVG9jJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlSW1zaXplJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlQ3JpdGljTWFya3VwJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICAgJ21hcmtkb3duSXRDb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgICBtYXJrZG93bkl0Q29uZmlnOiB7XG4gICAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiBib29sZWFuXG4gICAgICAgIHVzZUxhenlIZWFkZXJzOiBib29sZWFuXG4gICAgICAgIHVzZUNoZWNrQm94ZXM6IGJvb2xlYW5cbiAgICAgICAgdXNlRW1vamk6IGJvb2xlYW5cbiAgICAgICAgdXNlVG9jOiBib29sZWFuXG4gICAgICAgIHVzZUltc2l6ZTogYm9vbGVhblxuICAgICAgICB1c2VDcml0aWNNYXJrdXA6IGJvb2xlYW5cbiAgICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgICB9XG4gICAgICAncGFuZG9jQ29uZmlnLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY1BhdGgnOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jRmlsdGVycyc6IHN0cmluZ1tdXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY01hcmtkb3duRmxhdm9yJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeSc6IGJvb2xlYW5cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQklCRmlsZSc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NvbmZpZzoge1xuICAgICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiBib29sZWFuXG4gICAgICAgIHBhbmRvY1BhdGg6IHN0cmluZ1xuICAgICAgICBwYW5kb2NGaWx0ZXJzOiBzdHJpbmdbXVxuICAgICAgICBwYW5kb2NBcmd1bWVudHM6IHN0cmluZ1tdXG4gICAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiBib29sZWFuXG4gICAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jQklCRmlsZTogc3RyaW5nXG4gICAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICAgIHBhbmRvY0NTTEZpbGU6IHN0cmluZ1xuICAgICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19