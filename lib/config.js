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
            'This does not affect exported HTML',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVhLFFBQUEsTUFBTSxHQUFZO0lBQzdCLFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1oseUJBQXlCO1NBQzFCO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkUsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsS0FBSyxFQUFFLDhCQUE4QjtRQUNyQyxXQUFXLEVBQ1QsaUZBQWlGO1FBQ25GLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7UUFDWCxLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0QsbUJBQW1CLEVBQUU7UUFDbkIsS0FBSyxFQUFFLDRDQUE0QztRQUNuRCxXQUFXLEVBQ1QsK0VBQStFO1lBQy9FLG9DQUFv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QUNGO0tBQ0Y7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBJQ29uZmlnIHtcbiAgW2tleTogc3RyaW5nXToge1xuICAgIHRpdGxlOiBzdHJpbmdcbiAgICBvcmRlcjogbnVtYmVyXG4gICAgdHlwZTogc3RyaW5nXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmdcbiAgICBwcm9wZXJ0aWVzPzogSUNvbmZpZ1xuICAgIGRlZmF1bHQ/OiBhbnlcbiAgICBlbnVtPzogYW55W11cbiAgICBpdGVtcz86IHtcbiAgICAgIHR5cGU6IHN0cmluZ1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY29uZmlnOiBJQ29uZmlnID0ge1xuICBncmFtbWFyczoge1xuICAgIHRpdGxlOiAnTWFya2Rvd24gR3JhbW1hcnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRWRpdG9ycyB1c2luZyB3aGF0IGdyYW1tYXJzIGFyZSBjb25zaWRlcmVkIE1hcmtkb3duJyxcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGRlZmF1bHQ6IFtcbiAgICAgICdzb3VyY2UuZ2ZtJyxcbiAgICAgICdzb3VyY2UubGl0Y29mZmVlJyxcbiAgICAgICd0ZXh0Lmh0bWwuYmFzaWMnLFxuICAgICAgJ3RleHQubWQnLFxuICAgICAgJ3RleHQucGxhaW4nLFxuICAgICAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJyxcbiAgICBdLFxuICAgIG9yZGVyOiAwLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBleHRlbnNpb25zOiB7XG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICB0aXRsZTogJ01hcmtkb3duIGZpbGUgZXh0ZW5zaW9ucycsXG4gICAgZGVzY3JpcHRpb246ICdXaGljaCBmaWxlcyBhcmUgY29uc2lkZXJlZCBNYXJrZG93bicsXG4gICAgZGVmYXVsdDogWydtYXJrZG93bicsICdtZCcsICdtZG93bicsICdta2QnLCAnbWtkb3duJywgJ3JvbicsICd0eHQnXSxcbiAgICBvcmRlcjogMSxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgdXNlR2l0SHViU3R5bGU6IHtcbiAgICB0aXRsZTogJ1VzZSBHaXRIdWIuY29tIHN0eWxlJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDIsXG4gIH0sXG4gIHN5bnRheFRoZW1lTmFtZToge1xuICAgIHRpdGxlOiAnU3ludGF4IHRoZW1lIGZvciBjb2RlIGJsb2NrcycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnSWYgbm90IGVtcHR5LCB3aWxsIHRyeSB0byB1c2UgdGhlIGdpdmVuIHN5bnRheCB0aGVtZSBmb3IgY29kZSBibG9ja3MgaW4gcHJldmlldycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJycsXG4gICAgb3JkZXI6IDIuNSxcbiAgfSxcbiAgaW1wb3J0UGFja2FnZVN0eWxlczoge1xuICAgIHRpdGxlOiAnUGFja2FnZXMgdGhhdCBjYW4gYWZmZWN0IHByZXZpZXcgcmVuZGVyaW5nJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdBIGxpc3Qgb2YgQXRvbSBwYWNrYWdlIG5hbWVzIHRoYXQgY2FuIGFmZmVjdCBwcmV2aWV3IHN0eWxlLCBjb21tYS1zZXBhcmF0ZWQuICcgK1xuICAgICAgJ1RoaXMgZG9lcyBub3QgYWZmZWN0IGV4cG9ydGVkIEhUTUwnLFxuICAgIHR5cGU6ICdhcnJheScsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gICAgZGVmYXVsdDogWydmb250cyddLFxuICAgIG9yZGVyOiAyLjYsXG4gIH0sXG4gIHJlbmRlcmVyOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ21hcmtkb3duLWl0JyxcbiAgICB0aXRsZTogJ1JlbmRlcmVyIGJhY2tlbmQnLFxuICAgIGVudW06IFsnbWFya2Rvd24taXQnLCAncGFuZG9jJ10sXG4gICAgb3JkZXI6IDMsXG4gIH0sXG4gIHJpY2hDbGlwYm9hcmQ6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0aXRsZTogJ1VzZSByaWNoIGNsaXBib2FyZCcsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnQ29weSByaWNoIHRleHQgdG8gY2xpcGJvYXJkIGluIGFkZGl0aW9uIHRvIHJhdyBIVE1MIHdoZW4gdXNpbmcgY29weSBodG1sIGNvbW1hbmRzJyxcbiAgICBvcmRlcjogNCxcbiAgfSxcbiAgcHJldmlld0NvbmZpZzoge1xuICAgIHRpdGxlOiAnUHJldmlldyBCZWhhdmlvdXInLFxuICAgIG9yZGVyOiAxMCxcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBsaXZlVXBkYXRlOiB7XG4gICAgICAgIHRpdGxlOiAnTGl2ZSBVcGRhdGUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiB7XG4gICAgICAgIHRpdGxlOiAnRGlyZWN0aW9uIHRvIGxvYWQgdGhlIHByZXZpZXcgaW4gc3BsaXQgcGFuZScsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncmlnaHQnLFxuICAgICAgICBlbnVtOiBbJ2Rvd24nLCAncmlnaHQnLCAnbm9uZSddLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgcHJldmlld0RvY2s6IHtcbiAgICAgICAgdGl0bGU6ICdPcGVuIHByZXZpZXcgaW4gZG9jaycsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnY2VudGVyJyxcbiAgICAgICAgZW51bTogWydsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbScsICdjZW50ZXInXSxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgfSxcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdDbG9zZSBwcmV2aWV3IHdoZW4gZWRpdG9yIGNsb3NlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDI2LFxuICAgICAgfSxcbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdCcmluZyB1cCBwcmV2aWV3IHdoZW4gZWRpdG9yIGFjdGl2YXRlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyNyxcbiAgICAgIH0sXG4gICAgICBzaGVsbE9wZW5GaWxlRXh0ZW5zaW9uczoge1xuICAgICAgICB0aXRsZTogJ0Fsd2F5cyBvcGVuIGxpbmtzIHRvIHRoZXNlIGZpbGUgdHlwZXMgZXh0ZXJuYWxseScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdUaGlzIGlzIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgZmlsZSBuYW1lIGV4dGVuc2lvbnMgdGhhdCAnICtcbiAgICAgICAgICAnc2hvdWxkIGFsd2F5cyBiZSBvcGVuZWQgd2l0aCBhbiBleHRlcm5hbCBwcm9ncmFtLiAnICtcbiAgICAgICAgICAnRm9yIGV4YW1wbGUsIGlmIHlvdSB3YW50IHRvIGFsd2F5cyBvcGVuIFBERiBmaWxlcyAocHJlc3VtYWJseSBuYW1lZCBgc29tZXRoaW5nLnBkZmApICcgK1xuICAgICAgICAgICdpbiBzeXN0ZW0gUERGIHZpZXdlciwgYWRkIGBwZGZgIGhlcmUuJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogW1xuICAgICAgICAgICdvZHQnLFxuICAgICAgICAgICdkb2MnLFxuICAgICAgICAgICdkb2N4JyxcbiAgICAgICAgICAnb2RzJyxcbiAgICAgICAgICAneGxzJyxcbiAgICAgICAgICAneGxzeCcsXG4gICAgICAgICAgJ29kcCcsXG4gICAgICAgICAgJ3BwdCcsXG4gICAgICAgICAgJ3BwdHgnLFxuICAgICAgICAgICd6aXAnLFxuICAgICAgICAgICdyYXInLFxuICAgICAgICAgICc3eicsXG4gICAgICAgICAgJ2d6JyxcbiAgICAgICAgICAneHonLFxuICAgICAgICAgICdiejInLFxuICAgICAgICAgICd0YXInLFxuICAgICAgICAgICd0Z3onLFxuICAgICAgICAgICd0eHonLFxuICAgICAgICAgICd0YnoyJyxcbiAgICAgICAgXSxcbiAgICAgICAgb3JkZXI6IDI4LFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBzYXZlQ29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdFeHBvcnQgQmVoYXZpb3VyJyxcbiAgICBvcmRlcjogMTUsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6IHtcbiAgICAgICAgdGl0bGU6ICdXaGVuIHNhdmluZyBhcyBIVE1MLCBtZWRpYSBwYXRocyB3aWxsIGJlJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ01lZGlhIGluY2x1ZGVzIGltYWdlcywgYXVkaW8gYW5kIHZpZGVvLiAnICtcbiAgICAgICAgICAncmVsYXRpdmUgc3JjIGF0dHJpYnV0ZXMgb2YgaW1nLCBhdWRpbywgdmlkZW8gdGFncyBjYW4gZWl0aGVyIGJlIHJld3JpdHRlbiAnICtcbiAgICAgICAgICAndG8gdXNlIGFic29sdXRlIGZpbGUgcGF0aHMsIHBhdGhzIHJlbGF0aXZlIHRvIHNhdmUgbG9jYXRpb24sIG9yIGJlIGxlZnQgJyArXG4gICAgICAgICAgJ3VuYWx0ZXJlZCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncmVsYXRpdml6ZWQnLFxuICAgICAgICBlbnVtOiBbJ3JlbGF0aXZpemVkJywgJ2Fic29sdXRpemVkJywgJ3VudG91Y2hlZCddLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6IHtcbiAgICAgICAgdGl0bGU6ICdXaGVuIGNvcHlpbmcgYXMgSFRNTCwgbWVkaWEgcGF0aHMgd2lsbCBiZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdNZWRpYSBpbmNsdWRlcyBpbWFnZXMsIGF1ZGlvIGFuZCB2aWRlby4gJyArXG4gICAgICAgICAgJ3JlbGF0aXZlIHNyYyBhdHRyaWJ1dGVzIG9mIGltZywgYXVkaW8sIHZpZGVvIHRhZ3MgY2FuIGVpdGhlciBiZSByZXdyaXR0ZW4gJyArXG4gICAgICAgICAgJ3RvIHVzZSBhYnNvbHV0ZSBmaWxlIHBhdGhzLCBwYXRocyByZWxhdGl2ZSB0byBzYXZlIGxvY2F0aW9uLCBvciBiZSBsZWZ0ICcgK1xuICAgICAgICAgICd1bmFsdGVyZWQnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3VudG91Y2hlZCcsXG4gICAgICAgIGVudW06IFsncmVsYXRpdml6ZWQnLCAnYWJzb2x1dGl6ZWQnLCAndW50b3VjaGVkJ10sXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0U2F2ZUZvcm1hdDoge1xuICAgICAgICB0aXRsZTogJ0RlZmF1bHQgZm9ybWF0IHRvIHNhdmUgYXMnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICBlbnVtOiBbJ2h0bWwnLCAncGRmJ10sXG4gICAgICAgIGRlZmF1bHQ6ICdodG1sJyxcbiAgICAgIH0sXG4gICAgICBzYXZlVG9QREZPcHRpb25zOiB7XG4gICAgICAgIHRpdGxlOiAnU2F2ZSB0byBQREYgb3B0aW9ucycsXG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBvcmRlcjogMjUsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBtYXJnaW5zVHlwZToge1xuICAgICAgICAgICAgdGl0bGU6ICdNYXJnaW5zIFR5cGUnLFxuICAgICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgICAgZW51bTogW1xuICAgICAgICAgICAgICB7IHZhbHVlOiAwLCBkZXNjcmlwdGlvbjogJ0RlZmF1bHQgbWFyZ2lucycgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogMSwgZGVzY3JpcHRpb246ICdObyBtYXJnaW5zJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAyLCBkZXNjcmlwdGlvbjogJ01pbmltdW0gbWFyZ2lucycgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZWZhdWx0OiAwLFxuICAgICAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFnZVNpemU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUGFnZSBTaXplJyxcbiAgICAgICAgICAgIGVudW06IFsnQTMnLCAnQTQnLCAnQTUnLCAnTGVnYWwnLCAnTGV0dGVyJywgJ1RhYmxvaWQnLCAnQ3VzdG9tJ10sXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdBNCcsXG4gICAgICAgICAgICBvcmRlcjogMjAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjdXN0b21QYWdlU2l6ZToge1xuICAgICAgICAgICAgdGl0bGU6ICdDdXN0b20gUGFnZSBTaXplJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAnVGFrZXMgZWZmZWN0IHdoZW4gUGFnZSBTaXplIGlzIHNldCB0byBgQ3VzdG9tYC4gU3BlY2lmaWVkIGFzICcgK1xuICAgICAgICAgICAgICAnYDx3aWR0aD54PGhlaWdodD5gLCB3aGVyZSBgPGhlaWdodD5gIGFuZCBgPHdpZHRoPmAgYXJlICcgK1xuICAgICAgICAgICAgICAnZmxvYXRpbmctcG9pbnQgbnVtYmVycyB3aXRoIGAuYCAoZG90KSBhcyBkZWNpbWFsIHNlcGFyYXRvciwgbm8gdGhvdXNhbmRzIHNlcGFyYXRvciwgJyArXG4gICAgICAgICAgICAgICdhbmQgd2l0aCBvcHRpb25hbCBgY21gLCBgbW1gIG9yIGBpbmAgc3VmZml4IHRvIGluZGljYXRlIHVuaXRzLCBkZWZhdWx0IGlzIGBtbWAuICcgK1xuICAgICAgICAgICAgICAnRm9yIGV4YW1wbGUsIEE0IGlzIGA4LjNpbiB4IDExLjdpbmAgb3IgYDIxMG1tIHggMjk3bW1gIG9yIGAyMTAgeCAyOTdgLiAnICtcbiAgICAgICAgICAgICAgJ1doaXRlc3BhY2UgaXMgaWdub3JlZC4nLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgICAgIG9yZGVyOiAyNSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGxhbmRzY2FwZToge1xuICAgICAgICAgICAgdGl0bGU6ICdQYWdlIG9yaWVudGF0aW9uJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGVudW06IFtcbiAgICAgICAgICAgICAgeyB2YWx1ZTogZmFsc2UsIGRlc2NyaXB0aW9uOiAnUG9ydHJhaXQnIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6IHRydWUsIGRlc2NyaXB0aW9uOiAnTGFuZHNjYXBlJyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgb3JkZXI6IDI2LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJpbnRCYWNrZ3JvdW5kOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1JlbmRlciBiYWNrZ3JvdW5kJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0byByZW5kZXIgQ1NTIGJhY2tncm91bmRzIGluIFBERicsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG9yZGVyOiAzMCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByaW50U2VsZWN0aW9uT25seToge1xuICAgICAgICAgICAgdGl0bGU6ICdSZW5kZXIgb25seSBzZWxlY3Rpb24nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdPbmx5IHJlbmRlciBzZWxlY3RlZCBkb2N1bWVudCBmcmFnbWVudC4gRXhwZXJpbWVudGFsJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgb3JkZXI6IDQwLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHN5bmNDb25maWc6IHtcbiAgICB0aXRsZTogJ1ByZXZpZXcgcG9zaXRpb24gc3luY2hyb25pemF0aW9uIGJlaGF2aW91cicsXG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgb3JkZXI6IDIwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IHtcbiAgICAgICAgdGl0bGU6ICdTeW5jIHByZXZpZXcgcG9zaXRpb24gd2hlbiB0ZXh0IGluIGVkaXRvciBjaGFuZ2VzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI4LFxuICAgICAgfSxcbiAgICAgIHN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGw6IHtcbiAgICAgICAgdGl0bGU6ICdTeW5jIHByZXZpZXcgcG9zaXRpb24gd2hlbiB0ZXh0IGVkaXRvciBpcyBzY3JvbGxlZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdOb3RlOiBpZiBib3RoIHNjcm9sbCBzeW5jIG9wdGlvbnMgYXJlIGVuYWJsZWQsIHRoZSBlZGl0b3IgJyArXG4gICAgICAgICAgJ2hhcyB0byBiZSBpbiBhY3RpdmUgcGFuZSBmb3IgdGhpcyBvcHRpb24gdG8gdGFrZSBlZmZlY3QnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMjguMSxcbiAgICAgIH0sXG4gICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiB7XG4gICAgICAgIHRpdGxlOiAnU3luYyBlZGl0b3IgcG9zaXRpb24gd2hlbiBwcmV2aWV3IGlzIHNjcm9sbGVkJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ05vdGU6IGlmIGJvdGggc2Nyb2xsIHN5bmMgb3B0aW9ucyBhcmUgZW5hYmxlZCwgdGhlIHByZXZpZXcgJyArXG4gICAgICAgICAgJ2hhcyB0byBiZSBpbiBhY3RpdmUgcGFuZSBmb3IgdGhpcyBvcHRpb24gdG8gdGFrZSBlZmZlY3QnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMjguMixcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgbWF0aENvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnTWF0aCBPcHRpb25zJyxcbiAgICBvcmRlcjogMzAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgTWF0aCBSZW5kZXJpbmcgQnkgRGVmYXVsdCcsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAwLFxuICAgICAgfSxcbiAgICAgIGxhdGV4UmVuZGVyZXI6IHtcbiAgICAgICAgdGl0bGU6ICdNYXRoIFJlbmRlcmVyJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ1NWRyBpcyBub3RpY2VhYmx5IGZhc3RlciwgYnV0IG1pZ2h0IGxvb2sgd29yc2Ugb24gc29tZSBzeXN0ZW1zJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGVudW06IFsnSFRNTC1DU1MnLCAnU1ZHJ10sXG4gICAgICAgIGRlZmF1bHQ6ICdTVkcnLFxuICAgICAgICBvcmRlcjogNSxcbiAgICAgIH0sXG4gICAgICBudW1iZXJFcXVhdGlvbnM6IHtcbiAgICAgICAgdGl0bGU6ICdOdW1iZXIgZXF1YXRpb25zJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ051bWJlciBlcXVhdGlvbnMgdGhhdCBhcmUgaW4gZXF1YXRpb24gZW52aXJvbm1lbnQsIGV0Yy4gJyArXG4gICAgICAgICAgJ1dpbGwgcmUtcmVuZGVyIGFsbCBtYXRoIG9uIGVhY2ggbWF0aCBjaGFuZ2UsIHdoaWNoIG1pZ2h0IGJlIHVuZGVzaXJhYmxlLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICB0ZXhFeHRlbnNpb25zOiB7XG4gICAgICAgIHRpdGxlOiAnTWF0aEpheCBUZVggZXh0ZW5zaW9ucycsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFtcbiAgICAgICAgICAnQU1TbWF0aC5qcycsXG4gICAgICAgICAgJ0FNU3N5bWJvbHMuanMnLFxuICAgICAgICAgICdub0Vycm9ycy5qcycsXG4gICAgICAgICAgJ25vVW5kZWZpbmVkLmpzJyxcbiAgICAgICAgXSxcbiAgICAgICAgb3JkZXI6IDE1LFxuICAgICAgICBpdGVtczogeyB0eXBlOiAnc3RyaW5nJyB9LFxuICAgICAgfSxcbiAgICAgIHVuZGVmaW5lZEZhbWlseToge1xuICAgICAgICB0aXRsZTogJ01hdGhKYXggYHVuZGVmaW5lZEZhbWlseWAgKGZvbnQgZmFtaWx5KScsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnc2VyaWYnLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG1hcmtkb3duSXRDb25maWc6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICB0aXRsZTogJ01hcmtkb3duLUl0IFNldHRpbmdzJyxcbiAgICBvcmRlcjogNDAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IHtcbiAgICAgICAgdGl0bGU6ICdCcmVhayBvbiBzaW5nbGUgbmV3bGluZScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAwLFxuICAgICAgfSxcbiAgICAgIHVzZUxhenlIZWFkZXJzOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIExhenkgSGVhZGVycyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVxdWlyZSBubyBzcGFjZSBhZnRlciBoZWFkaW5ncyAjJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogNSxcbiAgICAgIH0sXG4gICAgICB1c2VDaGVja0JveGVzOiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIENoZWNrQm94IGxpc3RzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDaGVja0JveCBsaXN0cywgbGlrZSBvbiBHaXRIdWInLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICB1c2VFbW9qaToge1xuICAgICAgICB0aXRsZTogJ1VzZSBFbW9qaSB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW1vamkgcmVuZGVyaW5nJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICB9LFxuICAgICAgdXNlVG9jOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIHRhYmxlIG9mIGNvbnRlbnRzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXBsYWNlIFtbdG9jXV0gd2l0aCBhdXRvZ2VuZXJhdGVkIHRhYmxlIG9mIGNvbnRlbnRzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgdXNlSW1zaXplOiB7XG4gICAgICAgIHRpdGxlOiAnQWxsb3cgc3BlY2lmeWluZyBpbWFnZSBzaXplIGluIGltYWdlIHRpdGxlJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0FsbG93IG5vbi1zdGFuZGFyZCBzeW50YXggZm9yIHNwZWNpZnlpbmcgaW1hZ2Ugc2l6ZSB2aWEgJyArXG4gICAgICAgICAgJ2FwcGVuZGluZyBgPTx3aWR0aD54PGhlaWdodD5gIHRvIGltYWdlIHNwYWNpZmljYXRpb24sICcgK1xuICAgICAgICAgICdmLmV4LiBgIVt0ZXN0XShpbWFnZS5wbmcgPTEwMHgyMDApYCcsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgfSxcbiAgICAgIHVzZUNyaXRpY01hcmt1cDoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBDcml0aWNNYXJrdXAgc3ludGF4IHN1cHBvcnQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1N1cHBvcnQgaXMgbGltaXRlZCB0byBpbmxpbmUgb25seScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiA0MCxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczoge1xuICAgICAgICB0aXRsZTogJ0lubGluZSBtYXRoIHNlcGFyYXRvcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTGlzdCBvZiBpbmxpbmUgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFsnJCcsICckJywgJ1xcXFwoJywgJ1xcXFwpJ10sXG4gICAgICAgIG9yZGVyOiAxMTAsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczoge1xuICAgICAgICB0aXRsZTogJ0Jsb2NrIG1hdGggc2VwYXJhdG9ycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdMaXN0IG9mIGJsb2NrIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbJyQkJywgJyQkJywgJ1xcXFxbJywgJ1xcXFxdJ10sXG4gICAgICAgIG9yZGVyOiAxMjAsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBhbmRvY0NvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnUGFuZG9jIHNldHRpbmdzJyxcbiAgICBvcmRlcjogNTAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczoge1xuICAgICAgICB0aXRsZTogJ1VzZSBuYXRpdmUgUGFuZG9jIGNvZGUgYmxvY2sgc3R5bGUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICBcIkRvbid0IGNvbnZlcnQgZmVuY2VkIGNvZGUgYmxvY2tzIHRvIEF0b20gZWRpdG9ycyB3aGVuIHVzaW5nXCIgK1xuICAgICAgICAgICdQYW5kb2MgcGFyc2VyJyxcbiAgICAgICAgb3JkZXI6IDAsXG4gICAgICB9LFxuICAgICAgcGFuZG9jUGF0aDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3BhbmRvYycsXG4gICAgICAgIHRpdGxlOiAnUGF0aCB0byBQYW5kb2MgZXhlY3V0YWJsZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdQbGVhc2Ugc3BlY2lmeSB0aGUgY29ycmVjdCBwYXRoIHRvIHlvdXIgcGFuZG9jIGV4ZWN1dGFibGUsICcgK1xuICAgICAgICAgICdmb3IgZXhhbXBsZSwgL3Vzci9iaW4vcGFuZG9jLCBvciBDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFBhbmRvY1xcXFxwYW5kb2MuZXhlJyxcbiAgICAgICAgb3JkZXI6IDUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jRmlsdGVyczoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICAgICAgdGl0bGU6ICdGaWx0ZXJzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgZmlsdGVycywgaW4gb3JkZXIgb2YgYXBwbGljYXRpb24uIFdpbGwgYmUgcGFzc2VkIHZpYSBjb21tYW5kLWxpbmUgYXJndW1lbnRzJyxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0FyZ3VtZW50czoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICAgICAgdGl0bGU6ICdDb21tYW5kbGluZSBBcmd1bWVudHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBhcmd1bWVudHMgZS5nLiBgLS1zbWFydCwgLS1maWx0ZXI9L2Jpbi9leGVgLiBQbGVhc2UgdXNlIGxvbmcgYXJndW1lbnQgbmFtZXMuJyxcbiAgICAgICAgb3JkZXI6IDE1LFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnbWFya2Rvd24tcmF3X3RleCt0ZXhfbWF0aF9zaW5nbGVfYmFja3NsYXNoJyxcbiAgICAgICAgdGl0bGU6ICdNYXJrZG93biBGbGF2b3InLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VudGVyIHRoZSBwYW5kb2MgbWFya2Rvd24gZmxhdm9yIHlvdSB3YW50JyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeToge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICB0aXRsZTogJ0NpdGF0aW9ucyAodmlhIHBhbmRvYy1jaXRlcHJvYyknLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnRW5hYmxlIHRoaXMgZm9yIGJpYmxpb2dyYXBoeSBwYXJzaW5nLiAnICtcbiAgICAgICAgICAnTm90ZTogcGFuZG9jLWNpdGVwcm9jIGlzIGFwcGxpZWQgYWZ0ZXIgb3RoZXIgZmlsdGVycyBzcGVjaWZpZWQgaW4gJyArXG4gICAgICAgICAgJ0ZpbHRlcnMsIGJ1dCBiZWZvcmUgb3RoZXIgY29tbWFuZGxpbmUgYXJndW1lbnRzICcsXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6ICdSZW1vdmUgUmVmZXJlbmNlcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlldycsXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NCSUJGaWxlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnYmlibGlvZ3JhcGh5LmJpYicsXG4gICAgICAgIHRpdGxlOiAnQmlibGlvZ3JhcGh5IChiaWJmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBiaWJmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgICAgICBvcmRlcjogMzUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgYmliZmlsZScsXG4gICAgICAgIG9yZGVyOiA0MCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NDU0xGaWxlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnY3VzdG9tLmNzbCcsXG4gICAgICAgIHRpdGxlOiAnQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBjc2xmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgICAgICBvcmRlcjogNDUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgY3NsZmlsZScsXG4gICAgICAgIG9yZGVyOiA1MCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn1cblxuLy8gZ2VuZXJhdGVkIGJ5IHR5cGVkLWNvbmZpZy5qc1xuZGVjbGFyZSBtb2R1bGUgJ2F0b20nIHtcbiAgaW50ZXJmYWNlIENvbmZpZ1ZhbHVlcyB7XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3ludGF4VGhlbWVOYW1lJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5pbXBvcnRQYWNrYWdlU3R5bGVzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnJlbmRlcmVyJzogJ21hcmtkb3duLWl0JyB8ICdwYW5kb2MnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5yaWNoQ2xpcGJvYXJkJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5saXZlVXBkYXRlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyJzpcbiAgICAgIHwgJ2Rvd24nXG4gICAgICB8ICdyaWdodCdcbiAgICAgIHwgJ25vbmUnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLnByZXZpZXdEb2NrJzpcbiAgICAgIHwgJ2xlZnQnXG4gICAgICB8ICdyaWdodCdcbiAgICAgIHwgJ2JvdHRvbSdcbiAgICAgIHwgJ2NlbnRlcidcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcuY2xvc2VQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcuc2hlbGxPcGVuRmlsZUV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZyc6IHtcbiAgICAgIGxpdmVVcGRhdGU6IGJvb2xlYW5cbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6ICdkb3duJyB8ICdyaWdodCcgfCAnbm9uZSdcbiAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgICAgYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgICAgc2hlbGxPcGVuRmlsZUV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5tZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cic6XG4gICAgICB8ICdyZWxhdGl2aXplZCdcbiAgICAgIHwgJ2Fic29sdXRpemVkJ1xuICAgICAgfCAndW50b3VjaGVkJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5tZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cic6XG4gICAgICB8ICdyZWxhdGl2aXplZCdcbiAgICAgIHwgJ2Fic29sdXRpemVkJ1xuICAgICAgfCAndW50b3VjaGVkJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5kZWZhdWx0U2F2ZUZvcm1hdCc6ICdodG1sJyB8ICdwZGYnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XG4gICAgICB8ICdBMydcbiAgICAgIHwgJ0E0J1xuICAgICAgfCAnQTUnXG4gICAgICB8ICdMZWdhbCdcbiAgICAgIHwgJ0xldHRlcidcbiAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICB8ICdDdXN0b20nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5sYW5kc2NhcGUnOiBmYWxzZSB8IHRydWVcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zJzoge1xuICAgICAgbWFyZ2luc1R5cGU6IDAgfCAxIHwgMlxuICAgICAgcGFnZVNpemU6ICdBMycgfCAnQTQnIHwgJ0E1JyB8ICdMZWdhbCcgfCAnTGV0dGVyJyB8ICdUYWJsb2lkJyB8ICdDdXN0b20nXG4gICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICBsYW5kc2NhcGU6IGZhbHNlIHwgdHJ1ZVxuICAgICAgcHJpbnRCYWNrZ3JvdW5kOiBib29sZWFuXG4gICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnJzoge1xuICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgICBkZWZhdWx0U2F2ZUZvcm1hdDogJ2h0bWwnIHwgJ3BkZidcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLm1hcmdpbnNUeXBlJzogMCB8IDEgfCAyXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XG4gICAgICAgIHwgJ0EzJ1xuICAgICAgICB8ICdBNCdcbiAgICAgICAgfCAnQTUnXG4gICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICB8ICdMZXR0ZXInXG4gICAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLmN1c3RvbVBhZ2VTaXplJzogc3RyaW5nXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5sYW5kc2NhcGUnOiBmYWxzZSB8IHRydWVcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cbiAgICAgIHNhdmVUb1BERk9wdGlvbnM6IHtcbiAgICAgICAgbWFyZ2luc1R5cGU6IDAgfCAxIHwgMlxuICAgICAgICBwYWdlU2l6ZTogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnIHwgJ0N1c3RvbSdcbiAgICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xuICAgICAgICBsYW5kc2NhcGU6IGZhbHNlIHwgdHJ1ZVxuICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgICB9XG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY0NvbmZpZy5zeW5jUHJldmlld09uQ2hhbmdlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY0NvbmZpZy5zeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY0NvbmZpZy5zeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY0NvbmZpZyc6IHtcbiAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IGJvb2xlYW5cbiAgICAgIHN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGw6IGJvb2xlYW5cbiAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IGJvb2xlYW5cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJzogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLm51bWJlckVxdWF0aW9ucyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcudGV4RXh0ZW5zaW9ucyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLnVuZGVmaW5lZEZhbWlseSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZyc6IHtcbiAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiBib29sZWFuXG4gICAgICBsYXRleFJlbmRlcmVyOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAgIG51bWJlckVxdWF0aW9uczogYm9vbGVhblxuICAgICAgdGV4RXh0ZW5zaW9uczogc3RyaW5nW11cbiAgICAgIHVuZGVmaW5lZEZhbWlseTogc3RyaW5nXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy5icmVha09uU2luZ2xlTmV3bGluZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlTGF6eUhlYWRlcnMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUNoZWNrQm94ZXMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUVtb2ppJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VUb2MnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUltc2l6ZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlQ3JpdGljTWFya3VwJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZyc6IHtcbiAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiBib29sZWFuXG4gICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxuICAgICAgdXNlQ2hlY2tCb3hlczogYm9vbGVhblxuICAgICAgdXNlRW1vamk6IGJvb2xlYW5cbiAgICAgIHVzZVRvYzogYm9vbGVhblxuICAgICAgdXNlSW1zaXplOiBib29sZWFuXG4gICAgICB1c2VDcml0aWNNYXJrdXA6IGJvb2xlYW5cbiAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcudXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NQYXRoJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jRmlsdGVycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQXJndW1lbnRzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NNYXJrZG93bkZsYXZvcic6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcnOiB7XG4gICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiBib29sZWFuXG4gICAgICBwYW5kb2NQYXRoOiBzdHJpbmdcbiAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXG4gICAgICBwYW5kb2NBcmd1bWVudHM6IHN0cmluZ1tdXG4gICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjogc3RyaW5nXG4gICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cbiAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IGJvb2xlYW5cbiAgICAgIHBhbmRvY0JJQkZpbGU6IHN0cmluZ1xuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NTTEZpbGU6IHN0cmluZ1xuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cyc6IHtcbiAgICAgIGdyYW1tYXJzOiBzdHJpbmdbXVxuICAgICAgZXh0ZW5zaW9uczogc3RyaW5nW11cbiAgICAgIHVzZUdpdEh1YlN0eWxlOiBib29sZWFuXG4gICAgICBzeW50YXhUaGVtZU5hbWU6IHN0cmluZ1xuICAgICAgaW1wb3J0UGFja2FnZVN0eWxlczogc3RyaW5nW11cbiAgICAgIHJlbmRlcmVyOiAnbWFya2Rvd24taXQnIHwgJ3BhbmRvYydcbiAgICAgIHJpY2hDbGlwYm9hcmQ6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLmxpdmVVcGRhdGUnOiBib29sZWFuXG4gICAgICAncHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyJzogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICAgJ3ByZXZpZXdDb25maWcucHJldmlld0RvY2snOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgJ3ByZXZpZXdDb25maWcuY2xvc2VQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLmFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgICAncHJldmlld0NvbmZpZy5zaGVsbE9wZW5GaWxlRXh0ZW5zaW9ucyc6IHN0cmluZ1tdXG4gICAgICBwcmV2aWV3Q29uZmlnOiB7XG4gICAgICAgIGxpdmVVcGRhdGU6IGJvb2xlYW5cbiAgICAgICAgcHJldmlld1NwbGl0UGFuZURpcjogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICAgICBwcmV2aWV3RG9jazogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcidcbiAgICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICAgIHNoZWxsT3BlbkZpbGVFeHRlbnNpb25zOiBzdHJpbmdbXVxuICAgICAgfVxuICAgICAgJ3NhdmVDb25maWcubWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXInOlxuICAgICAgICB8ICdyZWxhdGl2aXplZCdcbiAgICAgICAgfCAnYWJzb2x1dGl6ZWQnXG4gICAgICAgIHwgJ3VudG91Y2hlZCdcbiAgICAgICdzYXZlQ29uZmlnLm1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyJzpcbiAgICAgICAgfCAncmVsYXRpdml6ZWQnXG4gICAgICAgIHwgJ2Fic29sdXRpemVkJ1xuICAgICAgICB8ICd1bnRvdWNoZWQnXG4gICAgICAnc2F2ZUNvbmZpZy5kZWZhdWx0U2F2ZUZvcm1hdCc6ICdodG1sJyB8ICdwZGYnXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLm1hcmdpbnNUeXBlJzogMCB8IDEgfCAyXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzpcbiAgICAgICAgfCAnQTMnXG4gICAgICAgIHwgJ0E0J1xuICAgICAgICB8ICdBNSdcbiAgICAgICAgfCAnTGVnYWwnXG4gICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgfCAnQ3VzdG9tJ1xuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5jdXN0b21QYWdlU2l6ZSc6IHN0cmluZ1xuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5sYW5kc2NhcGUnOiBmYWxzZSB8IHRydWVcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRCYWNrZ3JvdW5kJzogYm9vbGVhblxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludFNlbGVjdGlvbk9ubHknOiBib29sZWFuXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zJzoge1xuICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCcgfCAnQ3VzdG9tJ1xuICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICAgIGxhbmRzY2FwZTogZmFsc2UgfCB0cnVlXG4gICAgICAgIHByaW50QmFja2dyb3VuZDogYm9vbGVhblxuICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgIH1cbiAgICAgIHNhdmVDb25maWc6IHtcbiAgICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6ICdodG1sJyB8ICdwZGYnXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLm1hcmdpbnNUeXBlJzogMCB8IDEgfCAyXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzpcbiAgICAgICAgICB8ICdBMydcbiAgICAgICAgICB8ICdBNCdcbiAgICAgICAgICB8ICdBNSdcbiAgICAgICAgICB8ICdMZWdhbCdcbiAgICAgICAgICB8ICdMZXR0ZXInXG4gICAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgICB8ICdDdXN0b20nXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLmN1c3RvbVBhZ2VTaXplJzogc3RyaW5nXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGZhbHNlIHwgdHJ1ZVxuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cbiAgICAgICAgc2F2ZVRvUERGT3B0aW9uczoge1xuICAgICAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgICAgICBwYWdlU2l6ZTpcbiAgICAgICAgICAgIHwgJ0EzJ1xuICAgICAgICAgICAgfCAnQTQnXG4gICAgICAgICAgICB8ICdBNSdcbiAgICAgICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICAgICAgfCAnTGV0dGVyJ1xuICAgICAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICAgICAgbGFuZHNjYXBlOiBmYWxzZSB8IHRydWVcbiAgICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgJ3N5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXG4gICAgICAnc3luY0NvbmZpZy5zeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsJzogYm9vbGVhblxuICAgICAgc3luY0NvbmZpZzoge1xuICAgICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXG4gICAgICAgIHN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGw6IGJvb2xlYW5cbiAgICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDogYm9vbGVhblxuICAgICAgfVxuICAgICAgJ21hdGhDb25maWcuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnOiBib29sZWFuXG4gICAgICAnbWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJzogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICAnbWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXG4gICAgICAnbWF0aENvbmZpZy50ZXhFeHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAgICdtYXRoQ29uZmlnLnVuZGVmaW5lZEZhbWlseSc6IHN0cmluZ1xuICAgICAgbWF0aENvbmZpZzoge1xuICAgICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxuICAgICAgICBsYXRleFJlbmRlcmVyOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXG4gICAgICAgIHRleEV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICAgIHVuZGVmaW5lZEZhbWlseTogc3RyaW5nXG4gICAgICB9XG4gICAgICAnbWFya2Rvd25JdENvbmZpZy5icmVha09uU2luZ2xlTmV3bGluZSc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUVtb2ppJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlVG9jJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlSW1zaXplJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlQ3JpdGljTWFya3VwJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICAgJ21hcmtkb3duSXRDb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgICBtYXJrZG93bkl0Q29uZmlnOiB7XG4gICAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiBib29sZWFuXG4gICAgICAgIHVzZUxhenlIZWFkZXJzOiBib29sZWFuXG4gICAgICAgIHVzZUNoZWNrQm94ZXM6IGJvb2xlYW5cbiAgICAgICAgdXNlRW1vamk6IGJvb2xlYW5cbiAgICAgICAgdXNlVG9jOiBib29sZWFuXG4gICAgICAgIHVzZUltc2l6ZTogYm9vbGVhblxuICAgICAgICB1c2VDcml0aWNNYXJrdXA6IGJvb2xlYW5cbiAgICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgICB9XG4gICAgICAncGFuZG9jQ29uZmlnLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY1BhdGgnOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jRmlsdGVycyc6IHN0cmluZ1tdXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY01hcmtkb3duRmxhdm9yJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeSc6IGJvb2xlYW5cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQklCRmlsZSc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NvbmZpZzoge1xuICAgICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiBib29sZWFuXG4gICAgICAgIHBhbmRvY1BhdGg6IHN0cmluZ1xuICAgICAgICBwYW5kb2NGaWx0ZXJzOiBzdHJpbmdbXVxuICAgICAgICBwYW5kb2NBcmd1bWVudHM6IHN0cmluZ1tdXG4gICAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiBib29sZWFuXG4gICAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jQklCRmlsZTogc3RyaW5nXG4gICAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICAgIHBhbmRvY0NTTEZpbGU6IHN0cmluZ1xuICAgICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19