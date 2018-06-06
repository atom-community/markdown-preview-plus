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
    renderer: {
        type: 'string',
        default: 'markdown-it',
        title: 'Renderer backend',
        enum: ['markdown-it', 'pandoc'],
        order: 3,
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
                        description: 'Takes effect when Page Size is set to "Custom". Specified as ' +
                            '"&lt;width&gt;x&lt;height&gt;", where &lt;height&gt; and &lt;width&gt; are ' +
                            'floating-point numbers with "." as decimal separator, no thousands separator, ' +
                            'and with optional "cm", "mm" or "in" suffix to indicate units, default is "mm". ' +
                            'For example, A4 is "8.3in x 11.7in" or "210mm x 297mm" or "210 x 297". ' +
                            'Whitespace is ignored.',
                        type: 'string',
                        default: '',
                        order: 25,
                    },
                    printBackground: {
                        title: 'Print background',
                        type: 'boolean',
                        default: false,
                        order: 30,
                    },
                    printSelectionOnly: {
                        title: 'Print only selection',
                        type: 'boolean',
                        default: false,
                        order: 40,
                    },
                    landscape: {
                        title: 'Landscape orientation',
                        type: 'boolean',
                        default: false,
                        order: 50,
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
                title: "MathJax 'undefinedFamily' (font family)",
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
                    'abusing image title, f.ex. <pre>![test](image.png =100x200)</pre>',
                type: 'boolean',
                default: false,
                order: 25,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVhLFFBQUEsTUFBTSxHQUFZO0lBQzdCLFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1oseUJBQXlCO1NBQzFCO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkUsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsYUFBYTtRQUN0QixLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7UUFDL0IsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELGFBQWEsRUFBRTtRQUNiLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsS0FBSyxFQUFFLEVB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QUNiLEtBQUssRUFBRSxtQkFBbUI7Z0JBQzFCLFdBQVcsRUFBRSxtREFBbUQ7Z0JBQ2hFLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxhQUFhLEVBQUU7Z0JBQ2IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLGtCQUFrQjtnQkFDM0IsS0FBSyxFQUFFLHdCQUF3QjtnQkFDL0IsV0FBVyxFQUFFLDJDQUEyQztnQkFDeEQsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELHFCQUFxQixFQUFFO2dCQUNyQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsRUFBRTtnQkFDWCxLQUFLLEVBQUUsaUNBQWlDO2dCQUN4QyxXQUFXLEVBQUUsK0JBQStCO2dCQUM1QyxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0QsYUFBYSxFQUFFO2dCQUNiLElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxZQUFZO2dCQUNyQixLQUFLLEVBQUUsOEJBQThCO2dCQUNyQyxXQUFXLEVBQUUsMkNBQTJDO2dCQUN4RCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0QscUJBQXFCLEVBQUU7Z0JBQ3JCLElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxFQUFFO2dCQUNYLEtBQUssRUFBRSx1Q0FBdUM7Z0JBQzlDLFdBQVcsRUFBRSwrQkFBK0I7Z0JBQzVDLEtBQUssRUFBRSxFQUFFO2FBQ1Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBpbnRlcmZhY2UgSUNvbmZpZyB7XG4gIFtrZXk6IHN0cmluZ106IHtcbiAgICB0aXRsZTogc3RyaW5nXG4gICAgb3JkZXI6IG51bWJlclxuICAgIHR5cGU6IHN0cmluZ1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gICAgcHJvcGVydGllcz86IElDb25maWdcbiAgICBkZWZhdWx0PzogYW55XG4gICAgZW51bT86IGFueVtdXG4gICAgaXRlbXM/OiB7XG4gICAgICB0eXBlOiBzdHJpbmdcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpZzogSUNvbmZpZyA9IHtcbiAgZ3JhbW1hcnM6IHtcbiAgICB0aXRsZTogJ01hcmtkb3duIEdyYW1tYXJzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0VkaXRvcnMgdXNpbmcgd2hhdCBncmFtbWFycyBhcmUgY29uc2lkZXJlZCBNYXJrZG93bicsXG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBkZWZhdWx0OiBbXG4gICAgICAnc291cmNlLmdmbScsXG4gICAgICAnc291cmNlLmxpdGNvZmZlZScsXG4gICAgICAndGV4dC5odG1sLmJhc2ljJyxcbiAgICAgICd0ZXh0Lm1kJyxcbiAgICAgICd0ZXh0LnBsYWluJyxcbiAgICAgICd0ZXh0LnBsYWluLm51bGwtZ3JhbW1hcicsXG4gICAgXSxcbiAgICBvcmRlcjogMCxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgZXh0ZW5zaW9uczoge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgdGl0bGU6ICdNYXJrZG93biBmaWxlIGV4dGVuc2lvbnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hpY2ggZmlsZXMgYXJlIGNvbnNpZGVyZWQgTWFya2Rvd24nLFxuICAgIGRlZmF1bHQ6IFsnbWFya2Rvd24nLCAnbWQnLCAnbWRvd24nLCAnbWtkJywgJ21rZG93bicsICdyb24nLCAndHh0J10sXG4gICAgb3JkZXI6IDEsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIHVzZUdpdEh1YlN0eWxlOiB7XG4gICAgdGl0bGU6ICdVc2UgR2l0SHViLmNvbSBzdHlsZScsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAyLFxuICB9LFxuICByZW5kZXJlcjoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1pdCcsXG4gICAgdGl0bGU6ICdSZW5kZXJlciBiYWNrZW5kJyxcbiAgICBlbnVtOiBbJ21hcmtkb3duLWl0JywgJ3BhbmRvYyddLFxuICAgIG9yZGVyOiAzLFxuICB9LFxuICBwcmV2aWV3Q29uZmlnOiB7XG4gICAgdGl0bGU6ICdQcmV2aWV3IEJlaGF2aW91cicsXG4gICAgb3JkZXI6IDEwLFxuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGxpdmVVcGRhdGU6IHtcbiAgICAgICAgdGl0bGU6ICdMaXZlIFVwZGF0ZScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6IHtcbiAgICAgICAgdGl0bGU6ICdEaXJlY3Rpb24gdG8gbG9hZCB0aGUgcHJldmlldyBpbiBzcGxpdCBwYW5lJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdyaWdodCcsXG4gICAgICAgIGVudW06IFsnZG93bicsICdyaWdodCcsICdub25lJ10sXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgIH0sXG4gICAgICBwcmV2aWV3RG9jazoge1xuICAgICAgICB0aXRsZTogJ09wZW4gcHJldmlldyBpbiBkb2NrJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdjZW50ZXInLFxuICAgICAgICBlbnVtOiBbJ2xlZnQnLCAncmlnaHQnLCAnYm90dG9tJywgJ2NlbnRlciddLFxuICAgICAgICBvcmRlcjogMjUsXG4gICAgICB9LFxuICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjoge1xuICAgICAgICB0aXRsZTogJ0Nsb3NlIHByZXZpZXcgd2hlbiBlZGl0b3IgY2xvc2VzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMjYsXG4gICAgICB9LFxuICAgICAgYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcjoge1xuICAgICAgICB0aXRsZTogJ0JyaW5nIHVwIHByZXZpZXcgd2hlbiBlZGl0b3IgYWN0aXZhdGVzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI3LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBzYXZlQ29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdFeHBvcnQgQmVoYXZpb3VyJyxcbiAgICBvcmRlcjogMTUsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6IHtcbiAgICAgICAgdGl0bGU6ICdXaGVuIHNhdmluZyBhcyBIVE1MLCBtZWRpYSBwYXRocyB3aWxsIGJlJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ01lZGlhIGluY2x1ZGVzIGltYWdlcywgYXVkaW8gYW5kIHZpZGVvLiAnICtcbiAgICAgICAgICAncmVsYXRpdmUgc3JjIGF0dHJpYnV0ZXMgb2YgaW1nLCBhdWRpbywgdmlkZW8gdGFncyBjYW4gZWl0aGVyIGJlIHJld3JpdHRlbiAnICtcbiAgICAgICAgICAndG8gdXNlIGFic29sdXRlIGZpbGUgcGF0aHMsIHBhdGhzIHJlbGF0aXZlIHRvIHNhdmUgbG9jYXRpb24sIG9yIGJlIGxlZnQgJyArXG4gICAgICAgICAgJ3VuYWx0ZXJlZCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncmVsYXRpdml6ZWQnLFxuICAgICAgICBlbnVtOiBbJ3JlbGF0aXZpemVkJywgJ2Fic29sdXRpemVkJywgJ3VudG91Y2hlZCddLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6IHtcbiAgICAgICAgdGl0bGU6ICdXaGVuIGNvcHlpbmcgYXMgSFRNTCwgbWVkaWEgcGF0aHMgd2lsbCBiZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdNZWRpYSBpbmNsdWRlcyBpbWFnZXMsIGF1ZGlvIGFuZCB2aWRlby4gJyArXG4gICAgICAgICAgJ3JlbGF0aXZlIHNyYyBhdHRyaWJ1dGVzIG9mIGltZywgYXVkaW8sIHZpZGVvIHRhZ3MgY2FuIGVpdGhlciBiZSByZXdyaXR0ZW4gJyArXG4gICAgICAgICAgJ3RvIHVzZSBhYnNvbHV0ZSBmaWxlIHBhdGhzLCBwYXRocyByZWxhdGl2ZSB0byBzYXZlIGxvY2F0aW9uLCBvciBiZSBsZWZ0ICcgK1xuICAgICAgICAgICd1bmFsdGVyZWQnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3VudG91Y2hlZCcsXG4gICAgICAgIGVudW06IFsncmVsYXRpdml6ZWQnLCAnYWJzb2x1dGl6ZWQnLCAndW50b3VjaGVkJ10sXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0U2F2ZUZvcm1hdDoge1xuICAgICAgICB0aXRsZTogJ0RlZmF1bHQgZm9ybWF0IHRvIHNhdmUgYXMnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICBlbnVtOiBbJ2h0bWwnLCAncGRmJ10sXG4gICAgICAgIGRlZmF1bHQ6ICdodG1sJyxcbiAgICAgIH0sXG4gICAgICBzYXZlVG9QREZPcHRpb25zOiB7XG4gICAgICAgIHRpdGxlOiAnU2F2ZSB0byBQREYgb3B0aW9ucycsXG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBvcmRlcjogMjUsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBTcGVjaWZpZXMgdGhlIHR5cGUgb2YgbWFyZ2lucyB0byB1c2UuIFVzZXMgMCBmb3IgZGVmYXVsdCBtYXJnaW4sIDEgZm9yIG5vXG4gICAgICAgICAgICogbWFyZ2luLCBhbmQgMiBmb3IgbWluaW11bSBtYXJnaW4uXG4gICAgICAgICAgICovXG4gICAgICAgICAgbWFyZ2luc1R5cGU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnTWFyZ2lucyBUeXBlJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgIGVudW06IFtcbiAgICAgICAgICAgICAgeyB2YWx1ZTogMCwgZGVzY3JpcHRpb246ICdEZWZhdWx0IG1hcmdpbnMnIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6IDEsIGRlc2NyaXB0aW9uOiAnTm8gbWFyZ2lucycgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogMiwgZGVzY3JpcHRpb246ICdNaW5pbXVtIG1hcmdpbnMnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGVmYXVsdDogMCxcbiAgICAgICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhZ2VTaXplOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1BhZ2UgU2l6ZScsXG4gICAgICAgICAgICBlbnVtOiBbJ0EzJywgJ0E0JywgJ0E1JywgJ0xlZ2FsJywgJ0xldHRlcicsICdUYWJsb2lkJywgJ0N1c3RvbSddLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnQTQnLFxuICAgICAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgY3VzdG9tUGFnZVNpemU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIFBhZ2UgU2l6ZScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgJ1Rha2VzIGVmZmVjdCB3aGVuIFBhZ2UgU2l6ZSBpcyBzZXQgdG8gXCJDdXN0b21cIi4gU3BlY2lmaWVkIGFzICcgK1xuICAgICAgICAgICAgICAnXCImbHQ7d2lkdGgmZ3Q7eCZsdDtoZWlnaHQmZ3Q7XCIsIHdoZXJlICZsdDtoZWlnaHQmZ3Q7IGFuZCAmbHQ7d2lkdGgmZ3Q7IGFyZSAnICtcbiAgICAgICAgICAgICAgJ2Zsb2F0aW5nLXBvaW50IG51bWJlcnMgd2l0aCBcIi5cIiBhcyBkZWNpbWFsIHNlcGFyYXRvciwgbm8gdGhvdXNhbmRzIHNlcGFyYXRvciwgJyArXG4gICAgICAgICAgICAgICdhbmQgd2l0aCBvcHRpb25hbCBcImNtXCIsIFwibW1cIiBvciBcImluXCIgc3VmZml4IHRvIGluZGljYXRlIHVuaXRzLCBkZWZhdWx0IGlzIFwibW1cIi4gJyArXG4gICAgICAgICAgICAgICdGb3IgZXhhbXBsZSwgQTQgaXMgXCI4LjNpbiB4IDExLjdpblwiIG9yIFwiMjEwbW0geCAyOTdtbVwiIG9yIFwiMjEwIHggMjk3XCIuICcgK1xuICAgICAgICAgICAgICAnV2hpdGVzcGFjZSBpcyBpZ25vcmVkLicsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogV2hldGhlciB0byBwcmludCBDU1MgYmFja2dyb3VuZHMuXG4gICAgICAgICAgICovXG4gICAgICAgICAgcHJpbnRCYWNrZ3JvdW5kOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1ByaW50IGJhY2tncm91bmQnLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBvcmRlcjogMzAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBXaGV0aGVyIHRvIHByaW50IHNlbGVjdGlvbiBvbmx5LlxuICAgICAgICAgICAqL1xuICAgICAgICAgIHByaW50U2VsZWN0aW9uT25seToge1xuICAgICAgICAgICAgdGl0bGU6ICdQcmludCBvbmx5IHNlbGVjdGlvbicsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG9yZGVyOiA0MCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIHRydWUgZm9yIGxhbmRzY2FwZSwgZmFsc2UgZm9yIHBvcnRyYWl0LlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGxhbmRzY2FwZToge1xuICAgICAgICAgICAgdGl0bGU6ICdMYW5kc2NhcGUgb3JpZW50YXRpb24nLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBvcmRlcjogNTAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc3luY0NvbmZpZzoge1xuICAgIHRpdGxlOiAnUHJldmlldyBwb3NpdGlvbiBzeW5jaHJvbml6YXRpb24gYmVoYXZpb3VyJyxcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBvcmRlcjogMjAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZToge1xuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgaW4gZWRpdG9yIGNoYW5nZXMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMjgsXG4gICAgICB9LFxuICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDoge1xuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgZWRpdG9yIGlzIHNjcm9sbGVkJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ05vdGU6IGlmIGJvdGggc2Nyb2xsIHN5bmMgb3B0aW9ucyBhcmUgZW5hYmxlZCwgdGhlIGVkaXRvciAnICtcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyOC4xLFxuICAgICAgfSxcbiAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IHtcbiAgICAgICAgdGl0bGU6ICdTeW5jIGVkaXRvciBwb3NpdGlvbiB3aGVuIHByZXZpZXcgaXMgc2Nyb2xsZWQnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTm90ZTogaWYgYm90aCBzY3JvbGwgc3luYyBvcHRpb25zIGFyZSBlbmFibGVkLCB0aGUgcHJldmlldyAnICtcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyOC4yLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBtYXRoQ29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdNYXRoIE9wdGlvbnMnLFxuICAgIG9yZGVyOiAzMCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBNYXRoIFJlbmRlcmluZyBCeSBEZWZhdWx0JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDAsXG4gICAgICB9LFxuICAgICAgbGF0ZXhSZW5kZXJlcjoge1xuICAgICAgICB0aXRsZTogJ01hdGggUmVuZGVyZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnU1ZHIGlzIG5vdGljZWFibHkgZmFzdGVyLCBidXQgbWlnaHQgbG9vayB3b3JzZSBvbiBzb21lIHN5c3RlbXMnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZW51bTogWydIVE1MLUNTUycsICdTVkcnXSxcbiAgICAgICAgZGVmYXVsdDogJ1NWRycsXG4gICAgICAgIG9yZGVyOiA1LFxuICAgICAgfSxcbiAgICAgIG51bWJlckVxdWF0aW9uczoge1xuICAgICAgICB0aXRsZTogJ051bWJlciBlcXVhdGlvbnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTnVtYmVyIGVxdWF0aW9ucyB0aGF0IGFyZSBpbiBlcXVhdGlvbiBlbnZpcm9ubWVudCwgZXRjLiAnICtcbiAgICAgICAgICAnV2lsbCByZS1yZW5kZXIgYWxsIG1hdGggb24gZWFjaCBtYXRoIGNoYW5nZSwgd2hpY2ggbWlnaHQgYmUgdW5kZXNpcmFibGUuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIHRleEV4dGVuc2lvbnM6IHtcbiAgICAgICAgdGl0bGU6ICdNYXRoSmF4IFRlWCBleHRlbnNpb25zJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogW1xuICAgICAgICAgICdBTVNtYXRoLmpzJyxcbiAgICAgICAgICAnQU1Tc3ltYm9scy5qcycsXG4gICAgICAgICAgJ25vRXJyb3JzLmpzJyxcbiAgICAgICAgICAnbm9VbmRlZmluZWQuanMnLFxuICAgICAgICBdLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICAgIGl0ZW1zOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG4gICAgICB9LFxuICAgICAgdW5kZWZpbmVkRmFtaWx5OiB7XG4gICAgICAgIHRpdGxlOiBcIk1hdGhKYXggJ3VuZGVmaW5lZEZhbWlseScgKGZvbnQgZmFtaWx5KVwiLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3NlcmlmJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBtYXJrZG93bkl0Q29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdNYXJrZG93bi1JdCBTZXR0aW5ncycsXG4gICAgb3JkZXI6IDQwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiB7XG4gICAgICAgIHRpdGxlOiAnQnJlYWsgb24gc2luZ2xlIG5ld2xpbmUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMCxcbiAgICAgIH0sXG4gICAgICB1c2VMYXp5SGVhZGVyczoge1xuICAgICAgICB0aXRsZTogJ1VzZSBMYXp5IEhlYWRlcnMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlcXVpcmUgbm8gc3BhY2UgYWZ0ZXIgaGVhZGluZ3MgIycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDUsXG4gICAgICB9LFxuICAgICAgdXNlQ2hlY2tCb3hlczoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBDaGVja0JveCBsaXN0cyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2tCb3ggbGlzdHMsIGxpa2Ugb24gR2l0SHViJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgdXNlRW1vamk6IHtcbiAgICAgICAgdGl0bGU6ICdVc2UgRW1vamkgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Vtb2ppIHJlbmRlcmluZycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDE1LFxuICAgICAgfSxcbiAgICAgIHVzZVRvYzoge1xuICAgICAgICB0aXRsZTogJ1VzZSB0YWJsZSBvZiBjb250ZW50cyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZSBbW3RvY11dIHdpdGggYXV0b2dlbmVyYXRlZCB0YWJsZSBvZiBjb250ZW50cycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICAgIHVzZUltc2l6ZToge1xuICAgICAgICB0aXRsZTogJ0FsbG93IHNwZWNpZnlpbmcgaW1hZ2Ugc2l6ZSBpbiBpbWFnZSB0aXRsZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdBbGxvdyBub24tc3RhbmRhcmQgc3ludGF4IGZvciBzcGVjaWZ5aW5nIGltYWdlIHNpemUgdmlhICcgK1xuICAgICAgICAgICdhYnVzaW5nIGltYWdlIHRpdGxlLCBmLmV4LiA8cHJlPiFbdGVzdF0oaW1hZ2UucG5nID0xMDB4MjAwKTwvcHJlPicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczoge1xuICAgICAgICB0aXRsZTogJ0lubGluZSBtYXRoIHNlcGFyYXRvcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTGlzdCBvZiBpbmxpbmUgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFsnJCcsICckJywgJ1xcXFwoJywgJ1xcXFwpJ10sXG4gICAgICAgIG9yZGVyOiAxMTAsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczoge1xuICAgICAgICB0aXRsZTogJ0Jsb2NrIG1hdGggc2VwYXJhdG9ycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdMaXN0IG9mIGJsb2NrIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbJyQkJywgJyQkJywgJ1xcXFxbJywgJ1xcXFxdJ10sXG4gICAgICAgIG9yZGVyOiAxMjAsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBhbmRvY0NvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnUGFuZG9jIHNldHRpbmdzJyxcbiAgICBvcmRlcjogNTAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczoge1xuICAgICAgICB0aXRsZTogJ1VzZSBuYXRpdmUgUGFuZG9jIGNvZGUgYmxvY2sgc3R5bGUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICBcIkRvbid0IGNvbnZlcnQgZmVuY2VkIGNvZGUgYmxvY2tzIHRvIEF0b20gZWRpdG9ycyB3aGVuIHVzaW5nXCIgK1xuICAgICAgICAgICdQYW5kb2MgcGFyc2VyJyxcbiAgICAgICAgb3JkZXI6IDAsXG4gICAgICB9LFxuICAgICAgcGFuZG9jUGF0aDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3BhbmRvYycsXG4gICAgICAgIHRpdGxlOiAnUGF0aCB0byBQYW5kb2MgZXhlY3V0YWJsZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdQbGVhc2Ugc3BlY2lmeSB0aGUgY29ycmVjdCBwYXRoIHRvIHlvdXIgcGFuZG9jIGV4ZWN1dGFibGUsICcgK1xuICAgICAgICAgICdmb3IgZXhhbXBsZSwgL3Vzci9iaW4vcGFuZG9jLCBvciBDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFBhbmRvY1xcXFxwYW5kb2MuZXhlJyxcbiAgICAgICAgb3JkZXI6IDUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jRmlsdGVyczoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICAgICAgdGl0bGU6ICdGaWx0ZXJzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgZmlsdGVycywgaW4gb3JkZXIgb2YgYXBwbGljYXRpb24uIFdpbGwgYmUgcGFzc2VkIHZpYSBjb21tYW5kLWxpbmUgYXJndW1lbnRzJyxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0FyZ3VtZW50czoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXSxcbiAgICAgICAgdGl0bGU6ICdDb21tYW5kbGluZSBBcmd1bWVudHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBhcmd1bWVudHMgZS5nLiBgLS1zbWFydCwgLS1maWx0ZXI9L2Jpbi9leGVgLiBQbGVhc2UgdXNlIGxvbmcgYXJndW1lbnQgbmFtZXMuJyxcbiAgICAgICAgb3JkZXI6IDE1LFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnbWFya2Rvd24tcmF3X3RleCt0ZXhfbWF0aF9zaW5nbGVfYmFja3NsYXNoJyxcbiAgICAgICAgdGl0bGU6ICdNYXJrZG93biBGbGF2b3InLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VudGVyIHRoZSBwYW5kb2MgbWFya2Rvd24gZmxhdm9yIHlvdSB3YW50JyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeToge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICB0aXRsZTogJ0NpdGF0aW9ucyAodmlhIHBhbmRvYy1jaXRlcHJvYyknLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnRW5hYmxlIHRoaXMgZm9yIGJpYmxpb2dyYXBoeSBwYXJzaW5nLiAnICtcbiAgICAgICAgICAnTm90ZTogcGFuZG9jLWNpdGVwcm9jIGlzIGFwcGxpZWQgYWZ0ZXIgb3RoZXIgZmlsdGVycyBzcGVjaWZpZWQgaW4gJyArXG4gICAgICAgICAgJ0ZpbHRlcnMsIGJ1dCBiZWZvcmUgb3RoZXIgY29tbWFuZGxpbmUgYXJndW1lbnRzICcsXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6ICdSZW1vdmUgUmVmZXJlbmNlcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlldycsXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NCSUJGaWxlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnYmlibGlvZ3JhcGh5LmJpYicsXG4gICAgICAgIHRpdGxlOiAnQmlibGlvZ3JhcGh5IChiaWJmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBiaWJmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgICAgICBvcmRlcjogMzUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgYmliZmlsZScsXG4gICAgICAgIG9yZGVyOiA0MCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NDU0xGaWxlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnY3VzdG9tLmNzbCcsXG4gICAgICAgIHRpdGxlOiAnQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBjc2xmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgICAgICBvcmRlcjogNDUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgY3NsZmlsZScsXG4gICAgICAgIG9yZGVyOiA1MCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn1cblxuLy8gZ2VuZXJhdGVkIGJ5IHR5cGVkLWNvbmZpZy5qc1xuZGVjbGFyZSBtb2R1bGUgJ2F0b20nIHtcbiAgaW50ZXJmYWNlIENvbmZpZ1ZhbHVlcyB7XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucmVuZGVyZXInOiAnbWFya2Rvd24taXQnIHwgJ3BhbmRvYydcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcubGl2ZVVwZGF0ZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcucHJldmlld1NwbGl0UGFuZURpcic6XG4gICAgICB8ICdkb3duJ1xuICAgICAgfCAncmlnaHQnXG4gICAgICB8ICdub25lJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5wcmV2aWV3RG9jayc6XG4gICAgICB8ICdsZWZ0J1xuICAgICAgfCAncmlnaHQnXG4gICAgICB8ICdib3R0b20nXG4gICAgICB8ICdjZW50ZXInXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmNsb3NlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnJzoge1xuICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgcHJldmlld1NwbGl0UGFuZURpcjogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICAgcHJldmlld0RvY2s6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5tZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cic6XG4gICAgICB8ICdyZWxhdGl2aXplZCdcbiAgICAgIHwgJ2Fic29sdXRpemVkJ1xuICAgICAgfCAndW50b3VjaGVkJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5tZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cic6XG4gICAgICB8ICdyZWxhdGl2aXplZCdcbiAgICAgIHwgJ2Fic29sdXRpemVkJ1xuICAgICAgfCAndW50b3VjaGVkJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5kZWZhdWx0U2F2ZUZvcm1hdCc6ICdodG1sJyB8ICdwZGYnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XG4gICAgICB8ICdBMydcbiAgICAgIHwgJ0E0J1xuICAgICAgfCAnQTUnXG4gICAgICB8ICdMZWdhbCdcbiAgICAgIHwgJ0xldHRlcidcbiAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICB8ICdDdXN0b20nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucyc6IHtcbiAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCcgfCAnQ3VzdG9tJ1xuICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xuICAgICAgcHJpbnRCYWNrZ3JvdW5kOiBib29sZWFuXG4gICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgIGxhbmRzY2FwZTogYm9vbGVhblxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcnOiB7XG4gICAgICBtZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xuICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiAnaHRtbCcgfCAncGRmJ1xuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzpcbiAgICAgICAgfCAnQTMnXG4gICAgICAgIHwgJ0E0J1xuICAgICAgICB8ICdBNSdcbiAgICAgICAgfCAnTGVnYWwnXG4gICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgfCAnQ3VzdG9tJ1xuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cbiAgICAgICdzYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGJvb2xlYW5cbiAgICAgIHNhdmVUb1BERk9wdGlvbnM6IHtcbiAgICAgICAgbWFyZ2luc1R5cGU6IDAgfCAxIHwgMlxuICAgICAgICBwYWdlU2l6ZTogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnIHwgJ0N1c3RvbSdcbiAgICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xuICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgICAgIGxhbmRzY2FwZTogYm9vbGVhblxuICAgICAgfVxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcnOiB7XG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXG4gICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiBib29sZWFuXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLnRleEV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy51bmRlZmluZWRGYW1pbHknOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcnOiB7XG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxuICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICBudW1iZXJFcXVhdGlvbnM6IGJvb2xlYW5cbiAgICAgIHRleEV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB1bmRlZmluZWRGYW1pbHk6IHN0cmluZ1xuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VDaGVja0JveGVzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlVG9jJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VJbXNpemUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnJzoge1xuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cbiAgICAgIHVzZUxhenlIZWFkZXJzOiBib29sZWFuXG4gICAgICB1c2VDaGVja0JveGVzOiBib29sZWFuXG4gICAgICB1c2VFbW9qaTogYm9vbGVhblxuICAgICAgdXNlVG9jOiBib29sZWFuXG4gICAgICB1c2VJbXNpemU6IGJvb2xlYW5cbiAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcudXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NQYXRoJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jRmlsdGVycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQXJndW1lbnRzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NNYXJrZG93bkZsYXZvcic6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcnOiB7XG4gICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiBib29sZWFuXG4gICAgICBwYW5kb2NQYXRoOiBzdHJpbmdcbiAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXG4gICAgICBwYW5kb2NBcmd1bWVudHM6IHN0cmluZ1tdXG4gICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjogc3RyaW5nXG4gICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cbiAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IGJvb2xlYW5cbiAgICAgIHBhbmRvY0JJQkZpbGU6IHN0cmluZ1xuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NTTEZpbGU6IHN0cmluZ1xuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cyc6IHtcbiAgICAgIGdyYW1tYXJzOiBzdHJpbmdbXVxuICAgICAgZXh0ZW5zaW9uczogc3RyaW5nW11cbiAgICAgIHVzZUdpdEh1YlN0eWxlOiBib29sZWFuXG4gICAgICByZW5kZXJlcjogJ21hcmtkb3duLWl0JyB8ICdwYW5kb2MnXG4gICAgICAncHJldmlld0NvbmZpZy5saXZlVXBkYXRlJzogYm9vbGVhblxuICAgICAgJ3ByZXZpZXdDb25maWcucHJldmlld1NwbGl0UGFuZURpcic6ICdkb3duJyB8ICdyaWdodCcgfCAnbm9uZSdcbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdEb2NrJzogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcidcbiAgICAgICdwcmV2aWV3Q29uZmlnLmNsb3NlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgICAncHJldmlld0NvbmZpZy5hY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICAgcHJldmlld0NvbmZpZzoge1xuICAgICAgICBsaXZlVXBkYXRlOiBib29sZWFuXG4gICAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6ICdkb3duJyB8ICdyaWdodCcgfCAnbm9uZSdcbiAgICAgICAgcHJldmlld0RvY2s6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgICAgYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgICAgfVxuICAgICAgJ3NhdmVDb25maWcubWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXInOlxuICAgICAgICB8ICdyZWxhdGl2aXplZCdcbiAgICAgICAgfCAnYWJzb2x1dGl6ZWQnXG4gICAgICAgIHwgJ3VudG91Y2hlZCdcbiAgICAgICdzYXZlQ29uZmlnLm1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyJzpcbiAgICAgICAgfCAncmVsYXRpdml6ZWQnXG4gICAgICAgIHwgJ2Fic29sdXRpemVkJ1xuICAgICAgICB8ICd1bnRvdWNoZWQnXG4gICAgICAnc2F2ZUNvbmZpZy5kZWZhdWx0U2F2ZUZvcm1hdCc6ICdodG1sJyB8ICdwZGYnXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLm1hcmdpbnNUeXBlJzogMCB8IDEgfCAyXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzpcbiAgICAgICAgfCAnQTMnXG4gICAgICAgIHwgJ0E0J1xuICAgICAgICB8ICdBNSdcbiAgICAgICAgfCAnTGVnYWwnXG4gICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgfCAnQ3VzdG9tJ1xuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5jdXN0b21QYWdlU2l6ZSc6IHN0cmluZ1xuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogYm9vbGVhblxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucyc6IHtcbiAgICAgICAgbWFyZ2luc1R5cGU6IDAgfCAxIHwgMlxuICAgICAgICBwYWdlU2l6ZTogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnIHwgJ0N1c3RvbSdcbiAgICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xuICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgICAgIGxhbmRzY2FwZTogYm9vbGVhblxuICAgICAgfVxuICAgICAgc2F2ZUNvbmZpZzoge1xuICAgICAgICBtZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xuICAgICAgICBtZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xuICAgICAgICBkZWZhdWx0U2F2ZUZvcm1hdDogJ2h0bWwnIHwgJ3BkZidcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubWFyZ2luc1R5cGUnOiAwIHwgMSB8IDJcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnOlxuICAgICAgICAgIHwgJ0EzJ1xuICAgICAgICAgIHwgJ0E0J1xuICAgICAgICAgIHwgJ0E1J1xuICAgICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgICB8ICdUYWJsb2lkJ1xuICAgICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRCYWNrZ3JvdW5kJzogYm9vbGVhblxuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wcmludFNlbGVjdGlvbk9ubHknOiBib29sZWFuXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGJvb2xlYW5cbiAgICAgICAgc2F2ZVRvUERGT3B0aW9uczoge1xuICAgICAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgICAgICBwYWdlU2l6ZTpcbiAgICAgICAgICAgIHwgJ0EzJ1xuICAgICAgICAgICAgfCAnQTQnXG4gICAgICAgICAgICB8ICdBNSdcbiAgICAgICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICAgICAgfCAnTGV0dGVyJ1xuICAgICAgICAgICAgfCAnVGFibG9pZCdcbiAgICAgICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICAgICBjdXN0b21QYWdlU2l6ZTogc3RyaW5nXG4gICAgICAgICAgcHJpbnRCYWNrZ3JvdW5kOiBib29sZWFuXG4gICAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgICAgICAgbGFuZHNjYXBlOiBib29sZWFuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25DaGFuZ2UnOiBib29sZWFuXG4gICAgICAnc3luY0NvbmZpZy5zeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsJzogYm9vbGVhblxuICAgICAgJ3N5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cbiAgICAgIHN5bmNDb25maWc6IHtcbiAgICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZTogYm9vbGVhblxuICAgICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXG4gICAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IGJvb2xlYW5cbiAgICAgIH1cbiAgICAgICdtYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JzogYm9vbGVhblxuICAgICAgJ21hdGhDb25maWcubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgJ21hdGhDb25maWcubnVtYmVyRXF1YXRpb25zJzogYm9vbGVhblxuICAgICAgJ21hdGhDb25maWcudGV4RXh0ZW5zaW9ucyc6IHN0cmluZ1tdXG4gICAgICAnbWF0aENvbmZpZy51bmRlZmluZWRGYW1pbHknOiBzdHJpbmdcbiAgICAgIG1hdGhDb25maWc6IHtcbiAgICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IGJvb2xlYW5cbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICAgIG51bWJlckVxdWF0aW9uczogYm9vbGVhblxuICAgICAgICB0ZXhFeHRlbnNpb25zOiBzdHJpbmdbXVxuICAgICAgICB1bmRlZmluZWRGYW1pbHk6IHN0cmluZ1xuICAgICAgfVxuICAgICAgJ21hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VMYXp5SGVhZGVycyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUNoZWNrQm94ZXMnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZVRvYyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUltc2l6ZSc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICAgbWFya2Rvd25JdENvbmZpZzoge1xuICAgICAgICBicmVha09uU2luZ2xlTmV3bGluZTogYm9vbGVhblxuICAgICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxuICAgICAgICB1c2VDaGVja0JveGVzOiBib29sZWFuXG4gICAgICAgIHVzZUVtb2ppOiBib29sZWFuXG4gICAgICAgIHVzZVRvYzogYm9vbGVhblxuICAgICAgICB1c2VJbXNpemU6IGJvb2xlYW5cbiAgICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgICB9XG4gICAgICAncGFuZG9jQ29uZmlnLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY1BhdGgnOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jRmlsdGVycyc6IHN0cmluZ1tdXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY01hcmtkb3duRmxhdm9yJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeSc6IGJvb2xlYW5cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQklCRmlsZSc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NvbmZpZzoge1xuICAgICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiBib29sZWFuXG4gICAgICAgIHBhbmRvY1BhdGg6IHN0cmluZ1xuICAgICAgICBwYW5kb2NGaWx0ZXJzOiBzdHJpbmdbXVxuICAgICAgICBwYW5kb2NBcmd1bWVudHM6IHN0cmluZ1tdXG4gICAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiBib29sZWFuXG4gICAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jQklCRmlsZTogc3RyaW5nXG4gICAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICAgIHBhbmRvY0NTTEZpbGU6IHN0cmluZ1xuICAgICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19