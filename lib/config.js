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
            useFootnote: {
                title: 'Enable footnotes with markdown-it parser',
                description: 'Render Markdown footnotes a little prettier.',
                type: 'boolean',
                default: false,
                order: 45,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWlCYSxRQUFBLE1BQU0sR0FBWTtJQUM3QixRQUFRLEVBQUU7UUFDUixLQUFLLEVBQUUsbUJBQW1CO1FBQzFCLFdBQVcsRUFBRSxxREFBcUQ7UUFDbEUsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUU7WUFDUCxZQUFZO1lBQ1osa0JBQWtCO1lBQ2xCLGlCQUFpQjtZQUNqQixTQUFTO1lBQ1QsWUFBWTtZQUNaLHlCQUF5QjtTQUMxQjtRQUNELEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ25FLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsS0FBSyxFQUFFLHNCQUFzQjtRQUM3QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELGVBQWUsRUFBRTtRQUNmLEtBQUssRUFBRSw4QkFBOEI7UUFDckMsV0FBVyxFQUNULGlGQUFpRjtRQUNuRixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLEdBQUc7S0FDWDtJQUNELG1CQUFtQixFQUFFO1FBQ25CLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsV0FBVyxFQUNULCtFQUErRTtZQUMvRSw4RUFB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QUFPLEVBQUUsa0JBQWtCO2dCQUMzQixLQUFLLEVBQUUsd0JBQXdCO2dCQUMvQixXQUFXLEVBQUUsMkNBQTJDO2dCQUN4RCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0QscUJBQXFCLEVBQUU7Z0JBQ3JCLElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxFQUFFO2dCQUNYLEtBQUssRUFBRSxpQ0FBaUM7Z0JBQ3hDLFdBQVcsRUFBRSwrQkFBK0I7Z0JBQzVDLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxhQUFhLEVBQUU7Z0JBQ2IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLFlBQVk7Z0JBQ3JCLEtBQUssRUFBRSw4QkFBOEI7Z0JBQ3JDLFdBQVcsRUFBRSwyQ0FBMkM7Z0JBQ3hELEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxxQkFBcUIsRUFBRTtnQkFDckIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLHVDQUF1QztnQkFDOUMsV0FBVyxFQUFFLCtCQUErQjtnQkFDNUMsS0FBSyxFQUFFLEVBQUU7YUFDVjtTQUNGO0tBQ0Y7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBJQ29uZmlnIHtcbiAgW2tleTogc3RyaW5nXToge1xuICAgIHRpdGxlOiBzdHJpbmdcbiAgICBvcmRlcjogbnVtYmVyXG4gICAgdHlwZTogc3RyaW5nXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmdcbiAgICBwcm9wZXJ0aWVzPzogSUNvbmZpZ1xuICAgIGRlZmF1bHQ/OiBhbnlcbiAgICBtaW5pbXVtPzogYW55XG4gICAgbWF4aW11bT86IGFueVxuICAgIGVudW0/OiBhbnlbXVxuICAgIGl0ZW1zPzoge1xuICAgICAgdHlwZTogc3RyaW5nXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjb25maWc6IElDb25maWcgPSB7XG4gIGdyYW1tYXJzOiB7XG4gICAgdGl0bGU6ICdNYXJrZG93biBHcmFtbWFycycsXG4gICAgZGVzY3JpcHRpb246ICdFZGl0b3JzIHVzaW5nIHdoYXQgZ3JhbW1hcnMgYXJlIGNvbnNpZGVyZWQgTWFya2Rvd24nLFxuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogW1xuICAgICAgJ3NvdXJjZS5nZm0nLFxuICAgICAgJ3NvdXJjZS5saXRjb2ZmZWUnLFxuICAgICAgJ3RleHQuaHRtbC5iYXNpYycsXG4gICAgICAndGV4dC5tZCcsXG4gICAgICAndGV4dC5wbGFpbicsXG4gICAgICAndGV4dC5wbGFpbi5udWxsLWdyYW1tYXInLFxuICAgIF0sXG4gICAgb3JkZXI6IDAsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIGV4dGVuc2lvbnM6IHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIHRpdGxlOiAnTWFya2Rvd24gZmlsZSBleHRlbnNpb25zJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doaWNoIGZpbGVzIGFyZSBjb25zaWRlcmVkIE1hcmtkb3duJyxcbiAgICBkZWZhdWx0OiBbJ21hcmtkb3duJywgJ21kJywgJ21kb3duJywgJ21rZCcsICdta2Rvd24nLCAncm9uJywgJ3R4dCddLFxuICAgIG9yZGVyOiAxLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICB1c2VHaXRIdWJTdHlsZToge1xuICAgIHRpdGxlOiAnVXNlIEdpdEh1Yi5jb20gc3R5bGUnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMixcbiAgfSxcbiAgc3ludGF4VGhlbWVOYW1lOiB7XG4gICAgdGl0bGU6ICdTeW50YXggdGhlbWUgZm9yIGNvZGUgYmxvY2tzJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdJZiBub3QgZW1wdHksIHdpbGwgdHJ5IHRvIHVzZSB0aGUgZ2l2ZW4gc3ludGF4IHRoZW1lIGZvciBjb2RlIGJsb2NrcyBpbiBwcmV2aWV3JyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICBvcmRlcjogMi41LFxuICB9LFxuICBpbXBvcnRQYWNrYWdlU3R5bGVzOiB7XG4gICAgdGl0bGU6ICdQYWNrYWdlcyB0aGF0IGNhbiBhZmZlY3QgcHJldmlldyByZW5kZXJpbmcnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0EgbGlzdCBvZiBBdG9tIHBhY2thZ2UgbmFtZXMgdGhhdCBjYW4gYWZmZWN0IHByZXZpZXcgc3R5bGUsIGNvbW1hLXNlcGFyYXRlZC4gJyArXG4gICAgICAnQSBzcGVjaWFsIHZhbHVlIG9mIGAqYCAoc3Rhcikgd2lsbCBpbXBvcnQgYWxsIEF0b20gc3R5bGVzIGludG8gdGhlIHByZXZpZXcsICcgK1xuICAgICAgJ3VzZSB3aXRoIGNhcmUuIFRoaXMgZG9lcyBub3QgYWZmZWN0IGV4cG9ydGVkIEhUTUwnLFxuICAgIHR5cGU6ICdhcnJheScsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gICAgZGVmYXVsdDogWydmb250cyddLFxuICAgIG9yZGVyOiAyLjYsXG4gIH0sXG4gIGNvZGVUYWJXaWR0aDoge1xuICAgIHRpdGxlOiAnVGFiIHdpZHRoIGZvciBjb2RlIGJsb2NrcycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnSG93IHRvIHJlbmRlciB0YWIgY2hhcmFjdGVyIGluIGNvZGUgYmxvY2tzOycgK1xuICAgICAgJyAwIG1lYW5zIHVzZSBBdG9tIGdsb2JhbCBzZXR0aW5nJyxcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgZGVmYXVsdDogMCxcbiAgICBtaW5pbXVtOiAwLFxuICAgIG9yZGVyOiAyLjcsXG4gIH0sXG4gIHJlbmRlcmVyOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ21hcmtkb3duLWl0JyxcbiAgICB0aXRsZTogJ1JlbmRlcmVyIGJhY2tlbmQnLFxuICAgIGVudW06IFsnbWFya2Rvd24taXQnLCAncGFuZG9jJ10sXG4gICAgb3JkZXI6IDMsXG4gIH0sXG4gIHJpY2hDbGlwYm9hcmQ6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0aXRsZTogJ1VzZSByaWNoIGNsaXBib2FyZCcsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnQ29weSByaWNoIHRleHQgdG8gY2xpcGJvYXJkIGluIGFkZGl0aW9uIHRvIHJhdyBIVE1MIHdoZW4gdXNpbmcgY29weSBodG1sIGNvbW1hbmRzJyxcbiAgICBvcmRlcjogNCxcbiAgfSxcbiAgcHJldmlld0NvbmZpZzoge1xuICAgIHRpdGxlOiAnUHJldmlldyBCZWhhdmlvdXInLFxuICAgIG9yZGVyOiAxMCxcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBsaXZlVXBkYXRlOiB7XG4gICAgICAgIHRpdGxlOiAnTGl2ZSBVcGRhdGUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiB7XG4gICAgICAgIHRpdGxlOiAnRGlyZWN0aW9uIHRvIGxvYWQgdGhlIHByZXZpZXcgaW4gc3BsaXQgcGFuZScsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncmlnaHQnLFxuICAgICAgICBlbnVtOiBbJ2Rvd24nLCAncmlnaHQnLCAnbm9uZSddLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgcHJldmlld0RvY2s6IHtcbiAgICAgICAgdGl0bGU6ICdPcGVuIHByZXZpZXcgaW4gZG9jaycsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnY2VudGVyJyxcbiAgICAgICAgZW51bTogWydsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbScsICdjZW50ZXInXSxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgfSxcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdDbG9zZSBwcmV2aWV3IHdoZW4gZWRpdG9yIGNsb3NlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDI2LFxuICAgICAgfSxcbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdCcmluZyB1cCBwcmV2aWV3IHdoZW4gZWRpdG9yIGFjdGl2YXRlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyNyxcbiAgICAgIH0sXG4gICAgICBzaGVsbE9wZW5GaWxlRXh0ZW5zaW9uczoge1xuICAgICAgICB0aXRsZTogJ0Fsd2F5cyBvcGVuIGxpbmtzIHRvIHRoZXNlIGZpbGUgdHlwZXMgZXh0ZXJuYWxseScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdUaGlzIGlzIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgZmlsZSBuYW1lIGV4dGVuc2lvbnMgdGhhdCAnICtcbiAgICAgICAgICAnc2hvdWxkIGFsd2F5cyBiZSBvcGVuZWQgd2l0aCBhbiBleHRlcm5hbCBwcm9ncmFtLiAnICtcbiAgICAgICAgICAnRm9yIGV4YW1wbGUsIGlmIHlvdSB3YW50IHRvIGFsd2F5cyBvcGVuIFBERiBmaWxlcyAocHJlc3VtYWJseSBuYW1lZCBgc29tZXRoaW5nLnBkZmApICcgK1xuICAgICAgICAgICdpbiBzeXN0ZW0gUERGIHZpZXdlciwgYWRkIGBwZGZgIGhlcmUuJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogW1xuICAgICAgICAgICdvZHQnLFxuICAgICAgICAgICdkb2MnLFxuICAgICAgICAgICdkb2N4JyxcbiAgICAgICAgICAnb2RzJyxcbiAgICAgICAgICAneGxzJyxcbiAgICAgICAgICAneGxzeCcsXG4gICAgICAgICAgJ29kcCcsXG4gICAgICAgICAgJ3BwdCcsXG4gICAgICAgICAgJ3BwdHgnLFxuICAgICAgICAgICd6aXAnLFxuICAgICAgICAgICdyYXInLFxuICAgICAgICAgICc3eicsXG4gICAgICAgICAgJ2d6JyxcbiAgICAgICAgICAneHonLFxuICAgICAgICAgICdiejInLFxuICAgICAgICAgICd0YXInLFxuICAgICAgICAgICd0Z3onLFxuICAgICAgICAgICd0eHonLFxuICAgICAgICAgICd0YnoyJyxcbiAgICAgICAgXSxcbiAgICAgICAgb3JkZXI6IDI4LFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBzYXZlQ29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdFeHBvcnQgQmVoYXZpb3VyJyxcbiAgICBvcmRlcjogMTUsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6IHtcbiAgICAgICAgdGl0bGU6ICdXaGVuIHNhdmluZyBhcyBIVE1MLCBtZWRpYSBwYXRocyB3aWxsIGJlJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ01lZGlhIGluY2x1ZGVzIGltYWdlcywgYXVkaW8gYW5kIHZpZGVvLiAnICtcbiAgICAgICAgICAncmVsYXRpdmUgc3JjIGF0dHJpYnV0ZXMgb2YgaW1nLCBhdWRpbywgdmlkZW8gdGFncyBjYW4gZWl0aGVyIGJlIHJld3JpdHRlbiAnICtcbiAgICAgICAgICAndG8gdXNlIGFic29sdXRlIGZpbGUgcGF0aHMsIHBhdGhzIHJlbGF0aXZlIHRvIHNhdmUgbG9jYXRpb24sIG9yIGJlIGxlZnQgJyArXG4gICAgICAgICAgJ3VuYWx0ZXJlZCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncmVsYXRpdml6ZWQnLFxuICAgICAgICBlbnVtOiBbJ3JlbGF0aXZpemVkJywgJ2Fic29sdXRpemVkJywgJ3VudG91Y2hlZCddLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6IHtcbiAgICAgICAgdGl0bGU6ICdXaGVuIGNvcHlpbmcgYXMgSFRNTCwgbWVkaWEgcGF0aHMgd2lsbCBiZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdNZWRpYSBpbmNsdWRlcyBpbWFnZXMsIGF1ZGlvIGFuZCB2aWRlby4gJyArXG4gICAgICAgICAgJ3JlbGF0aXZlIHNyYyBhdHRyaWJ1dGVzIG9mIGltZywgYXVkaW8sIHZpZGVvIHRhZ3MgY2FuIGVpdGhlciBiZSByZXdyaXR0ZW4gJyArXG4gICAgICAgICAgJ3RvIHVzZSBhYnNvbHV0ZSBmaWxlIHBhdGhzLCBwYXRocyByZWxhdGl2ZSB0byBzYXZlIGxvY2F0aW9uLCBvciBiZSBsZWZ0ICcgK1xuICAgICAgICAgICd1bmFsdGVyZWQnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3VudG91Y2hlZCcsXG4gICAgICAgIGVudW06IFsncmVsYXRpdml6ZWQnLCAnYWJzb2x1dGl6ZWQnLCAndW50b3VjaGVkJ10sXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0U2F2ZUZvcm1hdDoge1xuICAgICAgICB0aXRsZTogJ0RlZmF1bHQgZm9ybWF0IHRvIHNhdmUgYXMnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICBlbnVtOiBbJ2h0bWwnLCAncGRmJ10sXG4gICAgICAgIGRlZmF1bHQ6ICdodG1sJyxcbiAgICAgIH0sXG4gICAgICBzYXZlVG9QREZPcHRpb25zOiB7XG4gICAgICAgIHRpdGxlOiAnU2F2ZSB0byBQREYgb3B0aW9ucycsXG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBvcmRlcjogMjUsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICBsYXRleFJlbmRlcmVyOiB7XG4gICAgICAgICAgICB0aXRsZTogJ01hdGggUmVuZGVyZXInLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICdMYVRlWCBNYXRoIHJlbmRlcmVyIGZvciBQREYgZXhwb3J0OyBIVE1MLUNTUyB1c3VhbGx5IGxvb2tzIGJldHRlcicsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGVudW06IFsnU2FtZSBhcyBsaXZlIHByZXZpZXcnLCAnSFRNTC1DU1MnLCAnU1ZHJ10sXG4gICAgICAgICAgICBkZWZhdWx0OiAnU2FtZSBhcyBsaXZlIHByZXZpZXcnLFxuICAgICAgICAgICAgb3JkZXI6IDUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtYXJnaW5zVHlwZToge1xuICAgICAgICAgICAgdGl0bGU6ICdNYXJnaW5zIFR5cGUnLFxuICAgICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgICAgZW51bTogW1xuICAgICAgICAgICAgICB7IHZhbHVlOiAwLCBkZXNjcmlwdGlvbjogJ0RlZmF1bHQgbWFyZ2lucycgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogMSwgZGVzY3JpcHRpb246ICdObyBtYXJnaW5zJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAyLCBkZXNjcmlwdGlvbjogJ01pbmltdW0gbWFyZ2lucycgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZWZhdWx0OiAwLFxuICAgICAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGFnZVNpemU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUGFnZSBTaXplJyxcbiAgICAgICAgICAgIGVudW06IFsnQTMnLCAnQTQnLCAnQTUnLCAnTGVnYWwnLCAnTGV0dGVyJywgJ1RhYmxvaWQnLCAnQ3VzdG9tJ10sXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdBNCcsXG4gICAgICAgICAgICBvcmRlcjogMjAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjdXN0b21QYWdlU2l6ZToge1xuICAgICAgICAgICAgdGl0bGU6ICdDdXN0b20gUGFnZSBTaXplJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAnVGFrZXMgZWZmZWN0IHdoZW4gUGFnZSBTaXplIGlzIHNldCB0byBgQ3VzdG9tYC4gU3BlY2lmaWVkIGFzICcgK1xuICAgICAgICAgICAgICAnYDx3aWR0aD54PGhlaWdodD5gLCB3aGVyZSBgPGhlaWdodD5gIGFuZCBgPHdpZHRoPmAgYXJlICcgK1xuICAgICAgICAgICAgICAnZmxvYXRpbmctcG9pbnQgbnVtYmVycyB3aXRoIGAuYCAoZG90KSBhcyBkZWNpbWFsIHNlcGFyYXRvciwgbm8gdGhvdXNhbmRzIHNlcGFyYXRvciwgJyArXG4gICAgICAgICAgICAgICdhbmQgd2l0aCBvcHRpb25hbCBgY21gLCBgbW1gIG9yIGBpbmAgc3VmZml4IHRvIGluZGljYXRlIHVuaXRzLCBkZWZhdWx0IGlzIGBtbWAuICcgK1xuICAgICAgICAgICAgICAnRm9yIGV4YW1wbGUsIEE0IGlzIGA4LjNpbiB4IDExLjdpbmAgb3IgYDIxMG1tIHggMjk3bW1gIG9yIGAyMTAgeCAyOTdgLiAnICtcbiAgICAgICAgICAgICAgJ1doaXRlc3BhY2UgaXMgaWdub3JlZC4nLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgICAgIG9yZGVyOiAyNSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGxhbmRzY2FwZToge1xuICAgICAgICAgICAgdGl0bGU6ICdQYWdlIG9yaWVudGF0aW9uJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGVudW06IFtcbiAgICAgICAgICAgICAgeyB2YWx1ZTogZmFsc2UsIGRlc2NyaXB0aW9uOiAnUG9ydHJhaXQnIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6IHRydWUsIGRlc2NyaXB0aW9uOiAnTGFuZHNjYXBlJyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgb3JkZXI6IDI2LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJpbnRCYWNrZ3JvdW5kOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1JlbmRlciBiYWNrZ3JvdW5kJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0byByZW5kZXIgQ1NTIGJhY2tncm91bmRzIGluIFBERicsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG9yZGVyOiAzMCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByaW50U2VsZWN0aW9uT25seToge1xuICAgICAgICAgICAgdGl0bGU6ICdSZW5kZXIgb25seSBzZWxlY3Rpb24nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdPbmx5IHJlbmRlciBzZWxlY3RlZCBkb2N1bWVudCBmcmFnbWVudC4gRXhwZXJpbWVudGFsJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgb3JkZXI6IDQwLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHN5bmNDb25maWc6IHtcbiAgICB0aXRsZTogJ1ByZXZpZXcgcG9zaXRpb24gc3luY2hyb25pemF0aW9uIGJlaGF2aW91cicsXG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgb3JkZXI6IDIwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IHtcbiAgICAgICAgdGl0bGU6ICdTeW5jIHByZXZpZXcgcG9zaXRpb24gd2hlbiB0ZXh0IGluIGVkaXRvciBjaGFuZ2VzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI4LFxuICAgICAgfSxcbiAgICAgIHN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGw6IHtcbiAgICAgICAgdGl0bGU6ICdTeW5jIHByZXZpZXcgcG9zaXRpb24gd2hlbiB0ZXh0IGVkaXRvciBpcyBzY3JvbGxlZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdOb3RlOiBpZiBib3RoIHNjcm9sbCBzeW5jIG9wdGlvbnMgYXJlIGVuYWJsZWQsIHRoZSBlZGl0b3IgJyArXG4gICAgICAgICAgJ2hhcyB0byBiZSBpbiBhY3RpdmUgcGFuZSBmb3IgdGhpcyBvcHRpb24gdG8gdGFrZSBlZmZlY3QnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMjguMSxcbiAgICAgIH0sXG4gICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiB7XG4gICAgICAgIHRpdGxlOiAnU3luYyBlZGl0b3IgcG9zaXRpb24gd2hlbiBwcmV2aWV3IGlzIHNjcm9sbGVkJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ05vdGU6IGlmIGJvdGggc2Nyb2xsIHN5bmMgb3B0aW9ucyBhcmUgZW5hYmxlZCwgdGhlIHByZXZpZXcgJyArXG4gICAgICAgICAgJ2hhcyB0byBiZSBpbiBhY3RpdmUgcGFuZSBmb3IgdGhpcyBvcHRpb24gdG8gdGFrZSBlZmZlY3QnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMjguMixcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgbWF0aENvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnTWF0aCBPcHRpb25zJyxcbiAgICBvcmRlcjogMzAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgTWF0aCBSZW5kZXJpbmcgQnkgRGVmYXVsdCcsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAwLFxuICAgICAgfSxcbiAgICAgIGxhdGV4UmVuZGVyZXI6IHtcbiAgICAgICAgdGl0bGU6ICdNYXRoIFJlbmRlcmVyJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ1NWRyBpcyBub3RpY2VhYmx5IGZhc3RlciwgYnV0IG1pZ2h0IGxvb2sgd29yc2Ugb24gc29tZSBzeXN0ZW1zJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGVudW06IFsnSFRNTC1DU1MnLCAnU1ZHJ10sXG4gICAgICAgIGRlZmF1bHQ6ICdTVkcnLFxuICAgICAgICBvcmRlcjogNSxcbiAgICAgIH0sXG4gICAgICBudW1iZXJFcXVhdGlvbnM6IHtcbiAgICAgICAgdGl0bGU6ICdOdW1iZXIgZXF1YXRpb25zJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ051bWJlciBlcXVhdGlvbnMgdGhhdCBhcmUgaW4gZXF1YXRpb24gZW52aXJvbm1lbnQsIGV0Yy4gJyArXG4gICAgICAgICAgJ1dpbGwgcmUtcmVuZGVyIGFsbCBtYXRoIG9uIGVhY2ggbWF0aCBjaGFuZ2UsIHdoaWNoIG1pZ2h0IGJlIHVuZGVzaXJhYmxlLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICB0ZXhFeHRlbnNpb25zOiB7XG4gICAgICAgIHRpdGxlOiAnTWF0aEpheCBUZVggZXh0ZW5zaW9ucycsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFtcbiAgICAgICAgICAnQU1TbWF0aC5qcycsXG4gICAgICAgICAgJ0FNU3N5bWJvbHMuanMnLFxuICAgICAgICAgICdub0Vycm9ycy5qcycsXG4gICAgICAgICAgJ25vVW5kZWZpbmVkLmpzJyxcbiAgICAgICAgXSxcbiAgICAgICAgb3JkZXI6IDE1LFxuICAgICAgICBpdGVtczogeyB0eXBlOiAnc3RyaW5nJyB9LFxuICAgICAgfSxcbiAgICAgIHVuZGVmaW5lZEZhbWlseToge1xuICAgICAgICB0aXRsZTogJ01hdGhKYXggYHVuZGVmaW5lZEZhbWlseWAgKGZvbnQgZmFtaWx5KScsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnc2VyaWYnLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG1hcmtkb3duSXRDb25maWc6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICB0aXRsZTogJ01hcmtkb3duLUl0IFNldHRpbmdzJyxcbiAgICBvcmRlcjogNDAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IHtcbiAgICAgICAgdGl0bGU6ICdCcmVhayBvbiBzaW5nbGUgbmV3bGluZScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAwLFxuICAgICAgfSxcbiAgICAgIHVzZUxhenlIZWFkZXJzOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIExhenkgSGVhZGVycyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVxdWlyZSBubyBzcGFjZSBhZnRlciBoZWFkaW5ncyAjJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogNSxcbiAgICAgIH0sXG4gICAgICB1c2VDaGVja0JveGVzOiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIENoZWNrQm94IGxpc3RzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDaGVja0JveCBsaXN0cywgbGlrZSBvbiBHaXRIdWInLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICB1c2VFbW9qaToge1xuICAgICAgICB0aXRsZTogJ1VzZSBFbW9qaSB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW1vamkgcmVuZGVyaW5nJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICB9LFxuICAgICAgdXNlVG9jOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIHRhYmxlIG9mIGNvbnRlbnRzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXBsYWNlIFtbdG9jXV0gd2l0aCBhdXRvZ2VuZXJhdGVkIHRhYmxlIG9mIGNvbnRlbnRzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICAgIHVzZUltc2l6ZToge1xuICAgICAgICB0aXRsZTogJ0FsbG93IHNwZWNpZnlpbmcgaW1hZ2Ugc2l6ZSBpbiBpbWFnZSB0aXRsZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdBbGxvdyBub24tc3RhbmRhcmQgc3ludGF4IGZvciBzcGVjaWZ5aW5nIGltYWdlIHNpemUgdmlhICcgK1xuICAgICAgICAgICdhcHBlbmRpbmcgYD08d2lkdGg+eDxoZWlnaHQ+YCB0byBpbWFnZSBzcGFjaWZpY2F0aW9uLCAnICtcbiAgICAgICAgICAnZi5leC4gYCFbdGVzdF0oaW1hZ2UucG5nID0xMDB4MjAwKWAnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgIH0sXG4gICAgICB1c2VDcml0aWNNYXJrdXA6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgQ3JpdGljTWFya3VwIHN5bnRheCBzdXBwb3J0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTdXBwb3J0IGlzIGxpbWl0ZWQgdG8gaW5saW5lIG9ubHknLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogNDAsXG4gICAgICB9LFxuICAgICAgdXNlRm9vdG5vdGU6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgZm9vdG5vdGVzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZW5kZXIgTWFya2Rvd24gZm9vdG5vdGVzIGEgbGl0dGxlIHByZXR0aWVyLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiA0NSxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczoge1xuICAgICAgICB0aXRsZTogJ0lubGluZSBtYXRoIHNlcGFyYXRvcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTGlzdCBvZiBpbmxpbmUgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFsnJCcsICckJywgJ1xcXFwoJywgJ1xcXFwpJ10sXG4gICAgICAgIG9yZGVyOiAxMTAsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczoge1xuICAgICAgICB0aXRsZTogJ0Jsb2NrIG1hdGggc2VwYXJhdG9ycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdMaXN0IG9mIGJsb2NrIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbJyQkJywgJyQkJywgJ1xcXFxbJywgJ1xcXFxdJ10sXG4gICAgICAgIG9yZGVyOiAxMjAsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBhbmRvY0NvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnUGFuZG9jIHNldHRpbmdzJyxcbiAgICBvcmRlcjogNTAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczoge1xuICAgICAgICB0aXRsZTogJ1VzZSBuYXRpdmUgUGFuZG9jIGNvZGUgYmxvY2sgc3R5bGUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICBcIkRvbid0IGNvbnZlcnQgZmVuY2VkIGNvZGUgYmxvY2tzIHRvIEF0b20gZWRpdG9ycyB3aGVuIHVzaW5nXCIgK1xuICAgICAgICAgICdQYW5kb2MgcGFyc2VyJyxcbiAgICAgICAgb3JkZXI6IDAsXG4gICAgICB9LFxuICAgICAgcGFuZG9jUGF0aDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3BhbmRvYycsXG4gICAgICAgIHRpdGxlOiAnUGF0aCB0byBQYW5kb2MgZXhlY3V0YWJsZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdQbGVhc2Ugc3BlY2lmeSB0aGUgY29ycmVjdCBwYXRoIHRvIHlvdXIgcGFuZG9jIGV4ZWN1dGFibGUsICcgK1xuICAgICAgICAgICdmb3IgZXhhbXBsZSwgL3Vzci9iaW4vcGFuZG9jLCBvciBDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFBhbmRvY1xcXFxwYW5kb2MuZXhlJyxcbiAgICAgICAgb3JkZXI6IDUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jRmlsdGVyczoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICAgICAgdGl0bGU6ICdGaWx0ZXJzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgZmlsdGVycywgaW4gb3JkZXIgb2YgYXBwbGljYXRpb24uIFdpbGwgYmUgcGFzc2VkIHZpYSBjb21tYW5kLWxpbmUgYXJndW1lbnRzJyxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0FyZ3VtZW50czoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICAgICAgdGl0bGU6ICdDb21tYW5kbGluZSBBcmd1bWVudHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBhcmd1bWVudHMgZS5nLiBgLS1zbWFydCwgLS1maWx0ZXI9L2Jpbi9leGVgLiBQbGVhc2UgdXNlIGxvbmcgYXJndW1lbnQgbmFtZXMuJyxcbiAgICAgICAgb3JkZXI6IDE1LFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnbWFya2Rvd24tcmF3X3RleCt0ZXhfbWF0aF9zaW5nbGVfYmFja3NsYXNoJyxcbiAgICAgICAgdGl0bGU6ICdNYXJrZG93biBGbGF2b3InLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VudGVyIHRoZSBwYW5kb2MgbWFya2Rvd24gZmxhdm9yIHlvdSB3YW50JyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeToge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICB0aXRsZTogJ0NpdGF0aW9ucyAodmlhIHBhbmRvYy1jaXRlcHJvYyknLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnRW5hYmxlIHRoaXMgZm9yIGJpYmxpb2dyYXBoeSBwYXJzaW5nLiAnICtcbiAgICAgICAgICAnTm90ZTogcGFuZG9jLWNpdGVwcm9jIGlzIGFwcGxpZWQgYWZ0ZXIgb3RoZXIgZmlsdGVycyBzcGVjaWZpZWQgaW4gJyArXG4gICAgICAgICAgJ0ZpbHRlcnMsIGJ1dCBiZWZvcmUgb3RoZXIgY29tbWFuZGxpbmUgYXJndW1lbnRzICcsXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6ICdSZW1vdmUgUmVmZXJlbmNlcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlldycsXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NCSUJGaWxlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnYmlibGlvZ3JhcGh5LmJpYicsXG4gICAgICAgIHRpdGxlOiAnQmlibGlvZ3JhcGh5IChiaWJmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBiaWJmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgICAgICBvcmRlcjogMzUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgYmliZmlsZScsXG4gICAgICAgIG9yZGVyOiA0MCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NDU0xGaWxlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnY3VzdG9tLmNzbCcsXG4gICAgICAgIHRpdGxlOiAnQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBjc2xmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgICAgICBvcmRlcjogNDUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgY3NsZmlsZScsXG4gICAgICAgIG9yZGVyOiA1MCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn1cblxuLy8gZ2VuZXJhdGVkIGJ5IHR5cGVkLWNvbmZpZy5qc1xuZGVjbGFyZSBtb2R1bGUgJ2F0b20nIHtcbiAgaW50ZXJmYWNlIENvbmZpZ1ZhbHVlcyB7XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3ludGF4VGhlbWVOYW1lJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5pbXBvcnRQYWNrYWdlU3R5bGVzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmNvZGVUYWJXaWR0aCc6IG51bWJlclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucmVuZGVyZXInOiAnbWFya2Rvd24taXQnIHwgJ3BhbmRvYydcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnJpY2hDbGlwYm9hcmQnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmxpdmVVcGRhdGUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOlxuICAgICAgfCAnZG93bidcbiAgICAgIHwgJ3JpZ2h0J1xuICAgICAgfCAnbm9uZSdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcucHJldmlld0RvY2snOlxuICAgICAgfCAnbGVmdCdcbiAgICAgIHwgJ3JpZ2h0J1xuICAgICAgfCAnYm90dG9tJ1xuICAgICAgfCAnY2VudGVyJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5jbG9zZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5hY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5zaGVsbE9wZW5GaWxlRXh0ZW5zaW9ucyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnJzoge1xuICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgcHJldmlld1NwbGl0UGFuZURpcjogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICAgcHJldmlld0RvY2s6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICBzaGVsbE9wZW5GaWxlRXh0ZW5zaW9uczogc3RyaW5nW11cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLm1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyJzpcbiAgICAgIHwgJ3JlbGF0aXZpemVkJ1xuICAgICAgfCAnYWJzb2x1dGl6ZWQnXG4gICAgICB8ICd1bnRvdWNoZWQnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLm1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyJzpcbiAgICAgIHwgJ3JlbGF0aXZpemVkJ1xuICAgICAgfCAnYWJzb2x1dGl6ZWQnXG4gICAgICB8ICd1bnRvdWNoZWQnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0JzogJ2h0bWwnIHwgJ3BkZidcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5sYXRleFJlbmRlcmVyJzpcbiAgICAgIHwgJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3J1xuICAgICAgfCAnSFRNTC1DU1MnXG4gICAgICB8ICdTVkcnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XG4gICAgICB8ICdBMydcbiAgICAgIHwgJ0E0J1xuICAgICAgfCAnQTUnXG4gICAgICB8ICdMZWdhbCdcbiAgICAgIHwgJ0xldHRlcidcbiAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICB8ICdDdXN0b20nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5sYW5kc2NhcGUnOiBmYWxzZSB8IHRydWVcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zJzoge1xuICAgICAgbGF0ZXhSZW5kZXJlcjogJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3JyB8ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgbWFyZ2luc1R5cGU6IDAgfCAxIHwgMlxuICAgICAgcGFnZVNpemU6ICdBMycgfCAnQTQnIHwgJ0E1JyB8ICdMZWdhbCcgfCAnTGV0dGVyJyB8ICdUYWJsb2lkJyB8ICdDdXN0b20nXG4gICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICBsYW5kc2NhcGU6IGZhbHNlIHwgdHJ1ZVxuICAgICAgcHJpbnRCYWNrZ3JvdW5kOiBib29sZWFuXG4gICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnJzoge1xuICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgICBkZWZhdWx0U2F2ZUZvcm1hdDogJ2h0bWwnIHwgJ3BkZidcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLmxhdGV4UmVuZGVyZXInOlxuICAgICAgICB8ICdTYW1lIGFzIGxpdmUgcHJldmlldydcbiAgICAgICAgfCAnSFRNTC1DU1MnXG4gICAgICAgIHwgJ1NWRydcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLm1hcmdpbnNUeXBlJzogMCB8IDEgfCAyXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XG4gICAgICAgIHwgJ0EzJ1xuICAgICAgICB8ICdBNCdcbiAgICAgICAgfCAnQTUnXG4gICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICB8ICdMZXR0ZXInXG4gICAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLmN1c3RvbVBhZ2VTaXplJzogc3RyaW5nXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5sYW5kc2NhcGUnOiBmYWxzZSB8IHRydWVcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cbiAgICAgIHNhdmVUb1BERk9wdGlvbnM6IHtcbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3JyB8ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCcgfCAnQ3VzdG9tJ1xuICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICAgIGxhbmRzY2FwZTogZmFsc2UgfCB0cnVlXG4gICAgICAgIHByaW50QmFja2dyb3VuZDogYm9vbGVhblxuICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgIH1cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25DaGFuZ2UnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnLnN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGwnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnJzoge1xuICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZTogYm9vbGVhblxuICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDogYm9vbGVhblxuICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDogYm9vbGVhblxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLmxhdGV4UmVuZGVyZXInOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubnVtYmVyRXF1YXRpb25zJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy50ZXhFeHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcudW5kZWZpbmVkRmFtaWx5Jzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnJzoge1xuICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IGJvb2xlYW5cbiAgICAgIGxhdGV4UmVuZGVyZXI6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXG4gICAgICB0ZXhFeHRlbnNpb25zOiBzdHJpbmdbXVxuICAgICAgdW5kZWZpbmVkRmFtaWx5OiBzdHJpbmdcbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VMYXp5SGVhZGVycyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlRW1vamknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZVRvYyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlSW1zaXplJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VDcml0aWNNYXJrdXAnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUZvb3Rub3RlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZyc6IHtcbiAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiBib29sZWFuXG4gICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxuICAgICAgdXNlQ2hlY2tCb3hlczogYm9vbGVhblxuICAgICAgdXNlRW1vamk6IGJvb2xlYW5cbiAgICAgIHVzZVRvYzogYm9vbGVhblxuICAgICAgdXNlSW1zaXplOiBib29sZWFuXG4gICAgICB1c2VDcml0aWNNYXJrdXA6IGJvb2xlYW5cbiAgICAgIHVzZUZvb3Rub3RlOiBib29sZWFuXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnJzoge1xuICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczogYm9vbGVhblxuICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXG4gICAgICBwYW5kb2NGaWx0ZXJzOiBzdHJpbmdbXVxuICAgICAgcGFuZG9jQXJndW1lbnRzOiBzdHJpbmdbXVxuICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xuICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiBib29sZWFuXG4gICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiBib29sZWFuXG4gICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcbiAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICBwYW5kb2NDU0xGaWxlOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMnOiB7XG4gICAgICBncmFtbWFyczogc3RyaW5nW11cbiAgICAgIGV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB1c2VHaXRIdWJTdHlsZTogYm9vbGVhblxuICAgICAgc3ludGF4VGhlbWVOYW1lOiBzdHJpbmdcbiAgICAgIGltcG9ydFBhY2thZ2VTdHlsZXM6IHN0cmluZ1tdXG4gICAgICBjb2RlVGFiV2lkdGg6IG51bWJlclxuICAgICAgcmVuZGVyZXI6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xuICAgICAgcmljaENsaXBib2FyZDogYm9vbGVhblxuICAgICAgJ3ByZXZpZXdDb25maWcubGl2ZVVwZGF0ZSc6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAncHJldmlld0NvbmZpZy5wcmV2aWV3RG9jayc6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICAncHJldmlld0NvbmZpZy5jbG9zZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICAgJ3ByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLnNoZWxsT3BlbkZpbGVFeHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAgIHByZXZpZXdDb25maWc6IHtcbiAgICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgICAgc2hlbGxPcGVuRmlsZUV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB9XG4gICAgICAnc2F2ZUNvbmZpZy5tZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cic6XG4gICAgICAgIHwgJ3JlbGF0aXZpemVkJ1xuICAgICAgICB8ICdhYnNvbHV0aXplZCdcbiAgICAgICAgfCAndW50b3VjaGVkJ1xuICAgICAgJ3NhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOlxuICAgICAgICB8ICdyZWxhdGl2aXplZCdcbiAgICAgICAgfCAnYWJzb2x1dGl6ZWQnXG4gICAgICAgIHwgJ3VudG91Y2hlZCdcbiAgICAgICdzYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0JzogJ2h0bWwnIHwgJ3BkZidcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubGF0ZXhSZW5kZXJlcic6XG4gICAgICAgIHwgJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3J1xuICAgICAgICB8ICdIVE1MLUNTUydcbiAgICAgICAgfCAnU1ZHJ1xuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XG4gICAgICAgIHwgJ0EzJ1xuICAgICAgICB8ICdBNCdcbiAgICAgICAgfCAnQTUnXG4gICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICB8ICdMZXR0ZXInXG4gICAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucyc6IHtcbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3JyB8ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCcgfCAnQ3VzdG9tJ1xuICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICAgIGxhbmRzY2FwZTogZmFsc2UgfCB0cnVlXG4gICAgICAgIHByaW50QmFja2dyb3VuZDogYm9vbGVhblxuICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgIH1cbiAgICAgIHNhdmVDb25maWc6IHtcbiAgICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6ICdodG1sJyB8ICdwZGYnXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLmxhdGV4UmVuZGVyZXInOlxuICAgICAgICAgIHwgJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3J1xuICAgICAgICAgIHwgJ0hUTUwtQ1NTJ1xuICAgICAgICAgIHwgJ1NWRydcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnOlxuICAgICAgICAgIHwgJ0EzJ1xuICAgICAgICAgIHwgJ0E0J1xuICAgICAgICAgIHwgJ0E1J1xuICAgICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgICB8ICdUYWJsb2lkJ1xuICAgICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICAgICBzYXZlVG9QREZPcHRpb25zOiB7XG4gICAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3JyB8ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgICAgICBwYWdlU2l6ZTpcbiAgICAgICAgICAgIHwgJ0EzJ1xuICAgICAgICAgICAgfCAnQTQnXG4gICAgICAgICAgICB8ICdBNSdcbiAgICAgICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICAgICAgfCAnTGV0dGVyJ1xuICAgICAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICAgICAgbGFuZHNjYXBlOiBmYWxzZSB8IHRydWVcbiAgICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgJ3N5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXG4gICAgICAnc3luY0NvbmZpZy5zeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsJzogYm9vbGVhblxuICAgICAgc3luY0NvbmZpZzoge1xuICAgICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXG4gICAgICAgIHN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGw6IGJvb2xlYW5cbiAgICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDogYm9vbGVhblxuICAgICAgfVxuICAgICAgJ21hdGhDb25maWcuZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQnOiBib29sZWFuXG4gICAgICAnbWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJzogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICAnbWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXG4gICAgICAnbWF0aENvbmZpZy50ZXhFeHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAgICdtYXRoQ29uZmlnLnVuZGVmaW5lZEZhbWlseSc6IHN0cmluZ1xuICAgICAgbWF0aENvbmZpZzoge1xuICAgICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxuICAgICAgICBsYXRleFJlbmRlcmVyOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXG4gICAgICAgIHRleEV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICAgIHVuZGVmaW5lZEZhbWlseTogc3RyaW5nXG4gICAgICB9XG4gICAgICAnbWFya2Rvd25JdENvbmZpZy5icmVha09uU2luZ2xlTmV3bGluZSc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUVtb2ppJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlVG9jJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlSW1zaXplJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlQ3JpdGljTWFya3VwJzogYm9vbGVhblxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlRm9vdG5vdGUnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy5ibG9ja01hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAgIG1hcmtkb3duSXRDb25maWc6IHtcbiAgICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cbiAgICAgICAgdXNlTGF6eUhlYWRlcnM6IGJvb2xlYW5cbiAgICAgICAgdXNlQ2hlY2tCb3hlczogYm9vbGVhblxuICAgICAgICB1c2VFbW9qaTogYm9vbGVhblxuICAgICAgICB1c2VUb2M6IGJvb2xlYW5cbiAgICAgICAgdXNlSW1zaXplOiBib29sZWFuXG4gICAgICAgIHVzZUNyaXRpY01hcmt1cDogYm9vbGVhblxuICAgICAgICB1c2VGb290bm90ZTogYm9vbGVhblxuICAgICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIH1cbiAgICAgICdwYW5kb2NDb25maWcudXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlcyc6IGJvb2xlYW5cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NGaWx0ZXJzJzogc3RyaW5nW11cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQXJndW1lbnRzJzogc3RyaW5nW11cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQmlibGlvZ3JhcGh5JzogYm9vbGVhblxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzJzogYm9vbGVhblxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICAgcGFuZG9jQ29uZmlnOiB7XG4gICAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXG4gICAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXG4gICAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cbiAgICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xuICAgICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxuICAgICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXG4gICAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=