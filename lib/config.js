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
                        enum: ['A3', 'A4', 'A5', 'Legal', 'Letter', 'Tabloid'],
                        type: 'string',
                        default: 'A4',
                        order: 20,
                    },
                    customPageSize: {
                        title: 'Custom Page Size',
                        description: 'Overrides Page Size if not empty. Specified as ' +
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
            inlineMathSeparators: {
                title: 'Inline math separators',
                description: 'List of inline math separators in pairs -- first opening, then closing',
                type: 'array',
                default: ['$', '$', '\\(', '\\)'],
                order: 25,
                items: {
                    type: 'string',
                },
            },
            blockMathSeparators: {
                title: 'Block math separators',
                description: 'List of block math separators in pairs -- first opening, then closing',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVhLFFBQUEsTUFBTSxHQUFZO0lBQzdCLFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1oseUJBQXlCO1NBQzFCO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkUsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsYUFBYTtRQUN0QixLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7UUFDL0IsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELGFBQWEsRUFBRTtRQUNiLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsS0FBSyxFQUFFLEVB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Z0JBQy9CLFdBQVcsRUFBRSwyQ0FBMkM7Z0JBQ3hELEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxxQkFBcUIsRUFBRTtnQkFDckIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLGlDQUFpQztnQkFDeEMsV0FBVyxFQUFFLCtCQUErQjtnQkFDNUMsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELGFBQWEsRUFBRTtnQkFDYixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsWUFBWTtnQkFDckIsS0FBSyxFQUFFLDhCQUE4QjtnQkFDckMsV0FBVyxFQUFFLDJDQUEyQztnQkFDeEQsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELHFCQUFxQixFQUFFO2dCQUNyQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsRUFBRTtnQkFDWCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxXQUFXLEVBQUUsK0JBQStCO2dCQUM1QyxLQUFLLEVBQUUsRUFBRTthQUNWO1NBQ0Y7S0FDRjtDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIElDb25maWcge1xuICBba2V5OiBzdHJpbmddOiB7XG4gICAgdGl0bGU6IHN0cmluZ1xuICAgIG9yZGVyOiBudW1iZXJcbiAgICB0eXBlOiBzdHJpbmdcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZ1xuICAgIHByb3BlcnRpZXM/OiBJQ29uZmlnXG4gICAgZGVmYXVsdD86IGFueVxuICAgIGVudW0/OiBhbnlbXVxuICAgIGl0ZW1zPzoge1xuICAgICAgdHlwZTogc3RyaW5nXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjb25maWc6IElDb25maWcgPSB7XG4gIGdyYW1tYXJzOiB7XG4gICAgdGl0bGU6ICdNYXJrZG93biBHcmFtbWFycycsXG4gICAgZGVzY3JpcHRpb246ICdFZGl0b3JzIHVzaW5nIHdoYXQgZ3JhbW1hcnMgYXJlIGNvbnNpZGVyZWQgTWFya2Rvd24nLFxuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogW1xuICAgICAgJ3NvdXJjZS5nZm0nLFxuICAgICAgJ3NvdXJjZS5saXRjb2ZmZWUnLFxuICAgICAgJ3RleHQuaHRtbC5iYXNpYycsXG4gICAgICAndGV4dC5tZCcsXG4gICAgICAndGV4dC5wbGFpbicsXG4gICAgICAndGV4dC5wbGFpbi5udWxsLWdyYW1tYXInLFxuICAgIF0sXG4gICAgb3JkZXI6IDAsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIGV4dGVuc2lvbnM6IHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIHRpdGxlOiAnTWFya2Rvd24gZmlsZSBleHRlbnNpb25zJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doaWNoIGZpbGVzIGFyZSBjb25zaWRlcmVkIE1hcmtkb3duJyxcbiAgICBkZWZhdWx0OiBbJ21hcmtkb3duJywgJ21kJywgJ21kb3duJywgJ21rZCcsICdta2Rvd24nLCAncm9uJywgJ3R4dCddLFxuICAgIG9yZGVyOiAxLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICB1c2VHaXRIdWJTdHlsZToge1xuICAgIHRpdGxlOiAnVXNlIEdpdEh1Yi5jb20gc3R5bGUnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMixcbiAgfSxcbiAgcmVuZGVyZXI6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnbWFya2Rvd24taXQnLFxuICAgIHRpdGxlOiAnUmVuZGVyZXIgYmFja2VuZCcsXG4gICAgZW51bTogWydtYXJrZG93bi1pdCcsICdwYW5kb2MnXSxcbiAgICBvcmRlcjogMyxcbiAgfSxcbiAgcHJldmlld0NvbmZpZzoge1xuICAgIHRpdGxlOiAnUHJldmlldyBCZWhhdmlvdXInLFxuICAgIG9yZGVyOiAxMCxcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBsaXZlVXBkYXRlOiB7XG4gICAgICAgIHRpdGxlOiAnTGl2ZSBVcGRhdGUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiB7XG4gICAgICAgIHRpdGxlOiAnRGlyZWN0aW9uIHRvIGxvYWQgdGhlIHByZXZpZXcgaW4gc3BsaXQgcGFuZScsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncmlnaHQnLFxuICAgICAgICBlbnVtOiBbJ2Rvd24nLCAncmlnaHQnLCAnbm9uZSddLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgcHJldmlld0RvY2s6IHtcbiAgICAgICAgdGl0bGU6ICdPcGVuIHByZXZpZXcgaW4gZG9jaycsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnY2VudGVyJyxcbiAgICAgICAgZW51bTogWydsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbScsICdjZW50ZXInXSxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgfSxcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdDbG9zZSBwcmV2aWV3IHdoZW4gZWRpdG9yIGNsb3NlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDI2LFxuICAgICAgfSxcbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdCcmluZyB1cCBwcmV2aWV3IHdoZW4gZWRpdG9yIGFjdGl2YXRlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyNyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc2F2ZUNvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnRXhwb3J0IEJlaGF2aW91cicsXG4gICAgb3JkZXI6IDE1LFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiB7XG4gICAgICAgIHRpdGxlOiAnV2hlbiBzYXZpbmcgYXMgSFRNTCwgbWVkaWEgcGF0aHMgd2lsbCBiZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdNZWRpYSBpbmNsdWRlcyBpbWFnZXMsIGF1ZGlvIGFuZCB2aWRlby4gJyArXG4gICAgICAgICAgJ3JlbGF0aXZlIHNyYyBhdHRyaWJ1dGVzIG9mIGltZywgYXVkaW8sIHZpZGVvIHRhZ3MgY2FuIGVpdGhlciBiZSByZXdyaXR0ZW4gJyArXG4gICAgICAgICAgJ3RvIHVzZSBhYnNvbHV0ZSBmaWxlIHBhdGhzLCBwYXRocyByZWxhdGl2ZSB0byBzYXZlIGxvY2F0aW9uLCBvciBiZSBsZWZ0ICcgK1xuICAgICAgICAgICd1bmFsdGVyZWQnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3JlbGF0aXZpemVkJyxcbiAgICAgICAgZW51bTogWydyZWxhdGl2aXplZCcsICdhYnNvbHV0aXplZCcsICd1bnRvdWNoZWQnXSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiB7XG4gICAgICAgIHRpdGxlOiAnV2hlbiBjb3B5aW5nIGFzIEhUTUwsIG1lZGlhIHBhdGhzIHdpbGwgYmUnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTWVkaWEgaW5jbHVkZXMgaW1hZ2VzLCBhdWRpbyBhbmQgdmlkZW8uICcgK1xuICAgICAgICAgICdyZWxhdGl2ZSBzcmMgYXR0cmlidXRlcyBvZiBpbWcsIGF1ZGlvLCB2aWRlbyB0YWdzIGNhbiBlaXRoZXIgYmUgcmV3cml0dGVuICcgK1xuICAgICAgICAgICd0byB1c2UgYWJzb2x1dGUgZmlsZSBwYXRocywgcGF0aHMgcmVsYXRpdmUgdG8gc2F2ZSBsb2NhdGlvbiwgb3IgYmUgbGVmdCAnICtcbiAgICAgICAgICAndW5hbHRlcmVkJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICd1bnRvdWNoZWQnLFxuICAgICAgICBlbnVtOiBbJ3JlbGF0aXZpemVkJywgJ2Fic29sdXRpemVkJywgJ3VudG91Y2hlZCddLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICB9LFxuICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6IHtcbiAgICAgICAgdGl0bGU6ICdEZWZhdWx0IGZvcm1hdCB0byBzYXZlIGFzJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgICAgZW51bTogWydodG1sJywgJ3BkZiddLFxuICAgICAgICBkZWZhdWx0OiAnaHRtbCcsXG4gICAgICB9LFxuICAgICAgc2F2ZVRvUERGT3B0aW9uczoge1xuICAgICAgICB0aXRsZTogJ1NhdmUgdG8gUERGIG9wdGlvbnMnLFxuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogU3BlY2lmaWVzIHRoZSB0eXBlIG9mIG1hcmdpbnMgdG8gdXNlLiBVc2VzIDAgZm9yIGRlZmF1bHQgbWFyZ2luLCAxIGZvciBub1xuICAgICAgICAgICAqIG1hcmdpbiwgYW5kIDIgZm9yIG1pbmltdW0gbWFyZ2luLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIG1hcmdpbnNUeXBlOiB7XG4gICAgICAgICAgICB0aXRsZTogJ01hcmdpbnMgVHlwZScsXG4gICAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAgIHsgdmFsdWU6IDAsIGRlc2NyaXB0aW9uOiAnRGVmYXVsdCBtYXJnaW5zJyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAxLCBkZXNjcmlwdGlvbjogJ05vIG1hcmdpbnMnIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6IDIsIGRlc2NyaXB0aW9uOiAnTWluaW11bSBtYXJnaW5zJyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IDAsXG4gICAgICAgICAgICBvcmRlcjogMTAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYWdlU2l6ZToge1xuICAgICAgICAgICAgdGl0bGU6ICdQYWdlIFNpemUnLFxuICAgICAgICAgICAgZW51bTogWydBMycsICdBNCcsICdBNScsICdMZWdhbCcsICdMZXR0ZXInLCAnVGFibG9pZCddLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnQTQnLFxuICAgICAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgY3VzdG9tUGFnZVNpemU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIFBhZ2UgU2l6ZScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgJ092ZXJyaWRlcyBQYWdlIFNpemUgaWYgbm90IGVtcHR5LiBTcGVjaWZpZWQgYXMgJyArXG4gICAgICAgICAgICAgICdcIiZsdDt3aWR0aCZndDt4Jmx0O2hlaWdodCZndDtcIiwgd2hlcmUgJmx0O2hlaWdodCZndDsgYW5kICZsdDt3aWR0aCZndDsgYXJlICcgK1xuICAgICAgICAgICAgICAnZmxvYXRpbmctcG9pbnQgbnVtYmVycyB3aXRoIFwiLlwiIGFzIGRlY2ltYWwgc2VwYXJhdG9yLCBubyB0aG91c2FuZHMgc2VwYXJhdG9yLCAnICtcbiAgICAgICAgICAgICAgJ2FuZCB3aXRoIG9wdGlvbmFsIFwiY21cIiwgXCJtbVwiIG9yIFwiaW5cIiBzdWZmaXggdG8gaW5kaWNhdGUgdW5pdHMsIGRlZmF1bHQgaXMgXCJtbVwiLiAnICtcbiAgICAgICAgICAgICAgJ0ZvciBleGFtcGxlLCBBNCBpcyBcIjguM2luIHggMTEuN2luXCIgb3IgXCIyMTBtbSB4IDI5N21tXCIgb3IgXCIyMTAgeCAyOTdcIi4gJyArXG4gICAgICAgICAgICAgICdXaGl0ZXNwYWNlIGlzIGlnbm9yZWQuJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgZGVmYXVsdDogJycsXG4gICAgICAgICAgICBvcmRlcjogMjUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBXaGV0aGVyIHRvIHByaW50IENTUyBiYWNrZ3JvdW5kcy5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBwcmludEJhY2tncm91bmQ6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUHJpbnQgYmFja2dyb3VuZCcsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG9yZGVyOiAzMCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIFdoZXRoZXIgdG8gcHJpbnQgc2VsZWN0aW9uIG9ubHkuXG4gICAgICAgICAgICovXG4gICAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiB7XG4gICAgICAgICAgICB0aXRsZTogJ1ByaW50IG9ubHkgc2VsZWN0aW9uJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgb3JkZXI6IDQwLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogdHJ1ZSBmb3IgbGFuZHNjYXBlLCBmYWxzZSBmb3IgcG9ydHJhaXQuXG4gICAgICAgICAgICovXG4gICAgICAgICAgbGFuZHNjYXBlOiB7XG4gICAgICAgICAgICB0aXRsZTogJ0xhbmRzY2FwZSBvcmllbnRhdGlvbicsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG9yZGVyOiA1MCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBzeW5jQ29uZmlnOiB7XG4gICAgdGl0bGU6ICdQcmV2aWV3IHBvc2l0aW9uIHN5bmNocm9uaXphdGlvbiBiZWhhdmlvdXInLFxuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIG9yZGVyOiAyMCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiB7XG4gICAgICAgIHRpdGxlOiAnU3luYyBwcmV2aWV3IHBvc2l0aW9uIHdoZW4gdGV4dCBpbiBlZGl0b3IgY2hhbmdlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyOCxcbiAgICAgIH0sXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiB7XG4gICAgICAgIHRpdGxlOiAnU3luYyBwcmV2aWV3IHBvc2l0aW9uIHdoZW4gdGV4dCBlZGl0b3IgaXMgc2Nyb2xsZWQnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTm90ZTogaWYgYm90aCBzY3JvbGwgc3luYyBvcHRpb25zIGFyZSBlbmFibGVkLCB0aGUgZWRpdG9yICcgK1xuICAgICAgICAgICdoYXMgdG8gYmUgaW4gYWN0aXZlIHBhbmUgZm9yIHRoaXMgb3B0aW9uIHRvIHRha2UgZWZmZWN0JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI4LjEsXG4gICAgICB9LFxuICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDoge1xuICAgICAgICB0aXRsZTogJ1N5bmMgZWRpdG9yIHBvc2l0aW9uIHdoZW4gcHJldmlldyBpcyBzY3JvbGxlZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdOb3RlOiBpZiBib3RoIHNjcm9sbCBzeW5jIG9wdGlvbnMgYXJlIGVuYWJsZWQsIHRoZSBwcmV2aWV3ICcgK1xuICAgICAgICAgICdoYXMgdG8gYmUgaW4gYWN0aXZlIHBhbmUgZm9yIHRoaXMgb3B0aW9uIHRvIHRha2UgZWZmZWN0JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI4LjIsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG1hdGhDb25maWc6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICB0aXRsZTogJ01hdGggT3B0aW9ucycsXG4gICAgb3JkZXI6IDMwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIE1hdGggUmVuZGVyaW5nIEJ5IERlZmF1bHQnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMCxcbiAgICAgIH0sXG4gICAgICBsYXRleFJlbmRlcmVyOiB7XG4gICAgICAgIHRpdGxlOiAnTWF0aCBSZW5kZXJlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdTVkcgaXMgbm90aWNlYWJseSBmYXN0ZXIsIGJ1dCBtaWdodCBsb29rIHdvcnNlIG9uIHNvbWUgc3lzdGVtcycsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBlbnVtOiBbJ0hUTUwtQ1NTJywgJ1NWRyddLFxuICAgICAgICBkZWZhdWx0OiAnU1ZHJyxcbiAgICAgICAgb3JkZXI6IDUsXG4gICAgICB9LFxuICAgICAgbnVtYmVyRXF1YXRpb25zOiB7XG4gICAgICAgIHRpdGxlOiAnTnVtYmVyIGVxdWF0aW9ucycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdOdW1iZXIgZXF1YXRpb25zIHRoYXQgYXJlIGluIGVxdWF0aW9uIGVudmlyb25tZW50LCBldGMuICcgK1xuICAgICAgICAgICdXaWxsIHJlLXJlbmRlciBhbGwgbWF0aCBvbiBlYWNoIG1hdGggY2hhbmdlLCB3aGljaCBtaWdodCBiZSB1bmRlc2lyYWJsZS4nLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgdGV4RXh0ZW5zaW9uczoge1xuICAgICAgICB0aXRsZTogJ01hdGhKYXggVGVYIGV4dGVuc2lvbnMnLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXG4gICAgICAgICAgJ0FNU21hdGguanMnLFxuICAgICAgICAgICdBTVNzeW1ib2xzLmpzJyxcbiAgICAgICAgICAnbm9FcnJvcnMuanMnLFxuICAgICAgICAgICdub1VuZGVmaW5lZC5qcycsXG4gICAgICAgIF0sXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgICAgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSxcbiAgICAgIH0sXG4gICAgICB1bmRlZmluZWRGYW1pbHk6IHtcbiAgICAgICAgdGl0bGU6IFwiTWF0aEpheCAndW5kZWZpbmVkRmFtaWx5JyAoZm9udCBmYW1pbHkpXCIsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnc2VyaWYnLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG1hcmtkb3duSXRDb25maWc6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICB0aXRsZTogJ01hcmtkb3duLUl0IFNldHRpbmdzJyxcbiAgICBvcmRlcjogNDAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IHtcbiAgICAgICAgdGl0bGU6ICdCcmVhayBvbiBzaW5nbGUgbmV3bGluZScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAwLFxuICAgICAgfSxcbiAgICAgIHVzZUxhenlIZWFkZXJzOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIExhenkgSGVhZGVycyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVxdWlyZSBubyBzcGFjZSBhZnRlciBoZWFkaW5ncyAjJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogNSxcbiAgICAgIH0sXG4gICAgICB1c2VDaGVja0JveGVzOiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIENoZWNrQm94IGxpc3RzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDaGVja0JveCBsaXN0cywgbGlrZSBvbiBHaXRIdWInLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICB1c2VFbW9qaToge1xuICAgICAgICB0aXRsZTogJ1VzZSBFbW9qaSB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW1vamkgcmVuZGVyaW5nJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICB9LFxuICAgICAgdXNlVG9jOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIHRhYmxlIG9mIGNvbnRlbnRzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXBsYWNlIFtbdG9jXV0gd2l0aCBhdXRvZ2VuZXJhdGVkIHRhYmxlIG9mIGNvbnRlbnRzJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHtcbiAgICAgICAgdGl0bGU6ICdJbmxpbmUgbWF0aCBzZXBhcmF0b3JzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0xpc3Qgb2YgaW5saW5lIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbJyQnLCAnJCcsICdcXFxcKCcsICdcXFxcKSddLFxuICAgICAgICBvcmRlcjogMjUsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczoge1xuICAgICAgICB0aXRsZTogJ0Jsb2NrIG1hdGggc2VwYXJhdG9ycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdMaXN0IG9mIGJsb2NrIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbJyQkJywgJyQkJywgJ1xcXFxbJywgJ1xcXFxdJ10sXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGFuZG9jQ29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdQYW5kb2Mgc2V0dGluZ3MnLFxuICAgIG9yZGVyOiA1MCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIG5hdGl2ZSBQYW5kb2MgY29kZSBibG9jayBzdHlsZScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgIFwiRG9uJ3QgY29udmVydCBmZW5jZWQgY29kZSBibG9ja3MgdG8gQXRvbSBlZGl0b3JzIHdoZW4gdXNpbmdcIiArXG4gICAgICAgICAgJ1BhbmRvYyBwYXJzZXInLFxuICAgICAgICBvcmRlcjogMCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NQYXRoOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncGFuZG9jJyxcbiAgICAgICAgdGl0bGU6ICdQYXRoIHRvIFBhbmRvYyBleGVjdXRhYmxlJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ1BsZWFzZSBzcGVjaWZ5IHRoZSBjb3JyZWN0IHBhdGggdG8geW91ciBwYW5kb2MgZXhlY3V0YWJsZSwgJyArXG4gICAgICAgICAgJ2ZvciBleGFtcGxlLCAvdXNyL2Jpbi9wYW5kb2MsIG9yIEM6XFxcXFByb2dyYW0gRmlsZXNcXFxcUGFuZG9jXFxcXHBhbmRvYy5leGUnLFxuICAgICAgICBvcmRlcjogNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NGaWx0ZXJzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgICB0aXRsZTogJ0ZpbHRlcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBmaWx0ZXJzLCBpbiBvcmRlciBvZiBhcHBsaWNhdGlvbi4gV2lsbCBiZSBwYXNzZWQgdmlhIGNvbW1hbmQtbGluZSBhcmd1bWVudHMnLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGFuZG9jQXJndW1lbnRzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgICB0aXRsZTogJ0NvbW1hbmRsaW5lIEFyZ3VtZW50cycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGFyZ3VtZW50cyBlLmcuIGAtLXNtYXJ0LCAtLWZpbHRlcj0vYmluL2V4ZWAuIFBsZWFzZSB1c2UgbG9uZyBhcmd1bWVudCBuYW1lcy4nLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1yYXdfdGV4K3RleF9tYXRoX3NpbmdsZV9iYWNrc2xhc2gnLFxuICAgICAgICB0aXRsZTogJ01hcmtkb3duIEZsYXZvcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW50ZXIgdGhlIHBhbmRvYyBtYXJrZG93biBmbGF2b3IgeW91IHdhbnQnLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIHRpdGxlOiAnQ2l0YXRpb25zICh2aWEgcGFuZG9jLWNpdGVwcm9jKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdFbmFibGUgdGhpcyBmb3IgYmlibGlvZ3JhcGh5IHBhcnNpbmcuICcgK1xuICAgICAgICAgICdOb3RlOiBwYW5kb2MtY2l0ZXByb2MgaXMgYXBwbGllZCBhZnRlciBvdGhlciBmaWx0ZXJzIHNwZWNpZmllZCBpbiAnICtcbiAgICAgICAgICAnRmlsdGVycywgYnV0IGJlZm9yZSBvdGhlciBjb21tYW5kbGluZSBhcmd1bWVudHMgJyxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0aXRsZTogJ1JlbW92ZSBSZWZlcmVuY2VzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZW1vdmVzIHJlZmVyZW5jZXMgYXQgdGhlIGVuZCBvZiB0aGUgSFRNTCBwcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0JJQkZpbGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdiaWJsaW9ncmFwaHkuYmliJyxcbiAgICAgICAgdGl0bGU6ICdCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGJpYmZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseScsXG4gICAgICAgIG9yZGVyOiAzNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICB0aXRsZTogJ0ZhbGxiYWNrIEJpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBiaWJmaWxlJyxcbiAgICAgICAgb3JkZXI6IDQwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0NTTEZpbGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdjdXN0b20uY3NsJyxcbiAgICAgICAgdGl0bGU6ICdCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGNzbGZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseScsXG4gICAgICAgIG9yZGVyOiA0NSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICB0aXRsZTogJ0ZhbGxiYWNrIEJpYmxpb2dyYXBoeSBTdHlsZSAoY3NsZmlsZSknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBjc2xmaWxlJyxcbiAgICAgICAgb3JkZXI6IDUwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufVxuXG4vLyBnZW5lcmF0ZWQgYnkgdHlwZWQtY29uZmlnLmpzXG5kZWNsYXJlIG1vZHVsZSAnYXRvbScge1xuICBpbnRlcmZhY2UgQ29uZmlnVmFsdWVzIHtcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmdyYW1tYXJzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5yZW5kZXJlcic6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5saXZlVXBkYXRlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyJzogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5wcmV2aWV3RG9jayc6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmNsb3NlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnJzoge1xuICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgcHJldmlld1NwbGl0UGFuZURpcjogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICAgcHJldmlld0RvY2s6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5tZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cic6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLmRlZmF1bHRTYXZlRm9ybWF0JzogJ2h0bWwnIHwgJ3BkZidcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucyc6IHtcbiAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCdcbiAgICAgIGN1c3RvbVBhZ2VTaXplOiBzdHJpbmdcbiAgICAgIHByaW50QmFja2dyb3VuZDogYm9vbGVhblxuICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgICBsYW5kc2NhcGU6IGJvb2xlYW5cbiAgICB9XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnJzoge1xuICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgICBkZWZhdWx0U2F2ZUZvcm1hdDogJ2h0bWwnIHwgJ3BkZidcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLm1hcmdpbnNUeXBlJzogMCB8IDEgfCAyXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6ICdBMycgfCAnQTQnIHwgJ0E1JyB8ICdMZWdhbCcgfCAnTGV0dGVyJyB8ICdUYWJsb2lkJ1xuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cbiAgICAgICdzYXZlVG9QREZPcHRpb25zLmxhbmRzY2FwZSc6IGJvb2xlYW5cbiAgICAgICdzYXZlVG9QREZPcHRpb25zJzoge1xuICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCdcbiAgICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xuICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgICAgIGxhbmRzY2FwZTogYm9vbGVhblxuICAgICAgfVxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcnOiB7XG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXG4gICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiBib29sZWFuXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLnRleEV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy51bmRlZmluZWRGYW1pbHknOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcnOiB7XG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxuICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICBudW1iZXJFcXVhdGlvbnM6IGJvb2xlYW5cbiAgICAgIHRleEV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB1bmRlZmluZWRGYW1pbHk6IHN0cmluZ1xuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VDaGVja0JveGVzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlVG9jJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZyc6IHtcbiAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiBib29sZWFuXG4gICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxuICAgICAgdXNlQ2hlY2tCb3hlczogYm9vbGVhblxuICAgICAgdXNlRW1vamk6IGJvb2xlYW5cbiAgICAgIHVzZVRvYzogYm9vbGVhblxuICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy51c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY1BhdGgnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NGaWx0ZXJzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NBcmd1bWVudHMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY01hcmtkb3duRmxhdm9yJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQmlibGlvZ3JhcGh5JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY1JlbW92ZVJlZmVyZW5jZXMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQklCRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZyc6IHtcbiAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cbiAgICAgIHBhbmRvY1BhdGg6IHN0cmluZ1xuICAgICAgcGFuZG9jRmlsdGVyczogc3RyaW5nW11cbiAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cbiAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiBzdHJpbmdcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeTogYm9vbGVhblxuICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxuICAgICAgcGFuZG9jQklCRmlsZTogc3RyaW5nXG4gICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXG4gICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzJzoge1xuICAgICAgZ3JhbW1hcnM6IHN0cmluZ1tdXG4gICAgICBleHRlbnNpb25zOiBzdHJpbmdbXVxuICAgICAgdXNlR2l0SHViU3R5bGU6IGJvb2xlYW5cbiAgICAgIHJlbmRlcmVyOiAnbWFya2Rvd24taXQnIHwgJ3BhbmRvYydcbiAgICAgICdwcmV2aWV3Q29uZmlnLmxpdmVVcGRhdGUnOiBib29sZWFuXG4gICAgICAncHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyJzogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICAgJ3ByZXZpZXdDb25maWcucHJldmlld0RvY2snOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgJ3ByZXZpZXdDb25maWcuY2xvc2VQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLmFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgICAncHJldmlld0NvbmZpZyc6IHtcbiAgICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgIH1cbiAgICAgICdzYXZlQ29uZmlnLm1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyJzogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xuICAgICAgJ3NhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgICAnc2F2ZUNvbmZpZy5kZWZhdWx0U2F2ZUZvcm1hdCc6ICdodG1sJyB8ICdwZGYnXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLm1hcmdpbnNUeXBlJzogMCB8IDEgfCAyXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnBhZ2VTaXplJzogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmN1c3RvbVBhZ2VTaXplJzogc3RyaW5nXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5sYW5kc2NhcGUnOiBib29sZWFuXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zJzoge1xuICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCdcbiAgICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xuICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgICAgIGxhbmRzY2FwZTogYm9vbGVhblxuICAgICAgfVxuICAgICAgJ3NhdmVDb25maWcnOiB7XG4gICAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiAnaHRtbCcgfCAncGRmJ1xuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6ICdBMycgfCAnQTQnIHwgJ0E1JyB8ICdMZWdhbCcgfCAnTGV0dGVyJyB8ICdUYWJsb2lkJ1xuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5jdXN0b21QYWdlU2l6ZSc6IHN0cmluZ1xuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXG4gICAgICAgICdzYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogYm9vbGVhblxuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucyc6IHtcbiAgICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICAgICAgcGFnZVNpemU6ICdBMycgfCAnQTQnIHwgJ0E1JyB8ICdMZWdhbCcgfCAnTGV0dGVyJyB8ICdUYWJsb2lkJ1xuICAgICAgICAgIGN1c3RvbVBhZ2VTaXplOiBzdHJpbmdcbiAgICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IGJvb2xlYW5cbiAgICAgICAgICBsYW5kc2NhcGU6IGJvb2xlYW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgJ3N5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXG4gICAgICAnc3luY0NvbmZpZy5zeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsJzogYm9vbGVhblxuICAgICAgJ3N5bmNDb25maWcnOiB7XG4gICAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IGJvb2xlYW5cbiAgICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDogYm9vbGVhblxuICAgICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiBib29sZWFuXG4gICAgICB9XG4gICAgICAnbWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAgICdtYXRoQ29uZmlnLmxhdGV4UmVuZGVyZXInOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAgICdtYXRoQ29uZmlnLm51bWJlckVxdWF0aW9ucyc6IGJvb2xlYW5cbiAgICAgICdtYXRoQ29uZmlnLnRleEV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICAgJ21hdGhDb25maWcudW5kZWZpbmVkRmFtaWx5Jzogc3RyaW5nXG4gICAgICAnbWF0aENvbmZpZyc6IHtcbiAgICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IGJvb2xlYW5cbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICAgIG51bWJlckVxdWF0aW9uczogYm9vbGVhblxuICAgICAgICB0ZXhFeHRlbnNpb25zOiBzdHJpbmdbXVxuICAgICAgICB1bmRlZmluZWRGYW1pbHk6IHN0cmluZ1xuICAgICAgfVxuICAgICAgJ21hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VMYXp5SGVhZGVycyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUNoZWNrQm94ZXMnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZVRvYyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICAgJ21hcmtkb3duSXRDb25maWcnOiB7XG4gICAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiBib29sZWFuXG4gICAgICAgIHVzZUxhenlIZWFkZXJzOiBib29sZWFuXG4gICAgICAgIHVzZUNoZWNrQm94ZXM6IGJvb2xlYW5cbiAgICAgICAgdXNlRW1vamk6IGJvb2xlYW5cbiAgICAgICAgdXNlVG9jOiBib29sZWFuXG4gICAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgICAgfVxuICAgICAgJ3BhbmRvY0NvbmZpZy51c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzJzogYm9vbGVhblxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NQYXRoJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NBcmd1bWVudHMnOiBzdHJpbmdbXVxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NNYXJrZG93bkZsYXZvcic6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY1JlbW92ZVJlZmVyZW5jZXMnOiBib29sZWFuXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGUnOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGUnOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnJzoge1xuICAgICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiBib29sZWFuXG4gICAgICAgIHBhbmRvY1BhdGg6IHN0cmluZ1xuICAgICAgICBwYW5kb2NGaWx0ZXJzOiBzdHJpbmdbXVxuICAgICAgICBwYW5kb2NBcmd1bWVudHM6IHN0cmluZ1tdXG4gICAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiBib29sZWFuXG4gICAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jQklCRmlsZTogc3RyaW5nXG4gICAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICAgIHBhbmRvY0NTTEZpbGU6IHN0cmluZ1xuICAgICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19