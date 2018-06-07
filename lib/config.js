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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVhLFFBQUEsTUFBTSxHQUFZO0lBQzdCLFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1oseUJBQXlCO1NBQzFCO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkUsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsYUFBYTtRQUN0QixLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7UUFDL0IsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELGFBQWEsRUFBRTtRQUNiLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsS0FBSyxFQUFFLEVBQUU7UUFDVCxJQUFJLEVBQUUsUUFBUTtRQUNkLFVBQVUsRUFBRTtZQUNWLFVBQVUsRUFBRTtnQkFDVixLQUFLLEVBQUUsYUFBYTtnQkFDcEIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELG1CQUFtQixFQUFFO2dCQUNuQixLQUFLLEVBQUUsNkNBQTZDO2dCQUNwRCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsT0FBTztnQkFDaEIsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUM7Z0JBQy9CLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxXQUFXLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLHNCQUFzQjtnQkFDN0IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQztnQkFDM0MsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELHNCQUFzQixFQUFFO2dCQUN0QixLQUFLLEVBQUUsa0NBQWtDO2dCQUN6QyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsSUFBSTtnQkFDYixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0QseUJBQXlCLEVBQUU7Z0JBQ3pCLEtBQUssRUFBRSx3Q0FBd0M7Z0JBQy9DLElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSxFQUFFO2FBQ1Y7U0FDRjtLQUNGO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLEtBQUssRUFBRSxFQUFFO1FBQ1QsVUFBVSxFQUFFO1lBQ1YsMEJBQTBCLEVBQUU7Z0JBQzFCLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELFdBQVcsRUFDVCwwQ0FBMEM7b0JBQzFDLDRFQUE0RTtvQkFDNUUsMEVBQTBFO29CQUMxRSxXQUFXO2dCQUNiLElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxhQUFhO2dCQUN0QixJQUFJLEVBQUUsQ0FBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBQztnQkFDakQsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELDBCQUEwQixFQUFFO2dCQUMxQixLQUFLLEVBQUUsMkNBQTJDO2dCQUNsRCxXQUFXLEVBQ1QsMENBQTBDO29CQUMxQyw0RUFBNEU7b0JBQzVFLDBFQUEwRTtvQkFDMUUsV0FBVztnQkFDYixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsV0FBVztnQkFDcEIsSUFBSSxFQUFFLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUM7Z0JBQ2pELEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxpQkFBaUIsRUFBRTtnQkFDakIsS0FBSyxFQUFFLDJCQUEyQjtnQkFDbEMsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztnQkFDckIsT0FBTyxFQUFFLE1BQU07YUFDaEI7WUFDRCxnQkFBZ0IsRUFBRTtnQkFDaEIsS0FBSyxFQUFFLHFCQUFxQjtnQkFDNUIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsVUFBVSxFQUFFO29CQUNWLFdBQVcsRUFBRTt3QkFDWCxLQUFLLEVBQUUsY0FBYzt3QkFDckIsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsSUFBSSxFQUFFOzRCQUNKLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUU7NEJBQzVDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFOzRCQUN2QyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFO3lCQUM3Qzt3QkFDRCxPQUFPLEVBQUUsQ0FBQzt3QkFDVixLQUFLLEVBQUUsRUFBRTtxQkFDVjtvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsS0FBSyxFQUFFLFdBQVc7d0JBQ2xCLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQzt3QkFDaEUsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsT0FBTyxFQUFFLElBQUk7d0JBQ2IsS0FBSyxFQUFFLEVBQUU7cUJBQ1Y7b0JBQ0QsY0FBYyxFQUFFO3dCQUNkLEtBQUssRUFBRSxrQkFBa0I7d0JBQ3pCLFdBQVcsRUFDVCwrREFBK0Q7NEJBQy9ELHlEQUF5RDs0QkFDekQsc0ZBQXNGOzRCQUN0RixrRkFBa0Y7NEJBQ2xGLHlFQUF5RTs0QkFDekUsd0JBQXdCO3dCQUMxQixJQUFJLEVBQUUsUUFBUTt3QkFDZCxPQUFPLEVBQUUsRUFBRTt3QkFDWCxLQUFLLEVBQUUsRUFBRTtxQkFDVjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1QsS0FBSyxFQUFFLGtCQUFrQjt3QkFDekIsSUFBSSxFQUFFLFNBQVM7d0JBQ2YsSUFBSSxFQUFFOzRCQUNKLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFOzRCQUN6QyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRTt5QkFDMUM7d0JBQ0QsT0FBTyxFQUFFLEtBQUs7d0JBQ2QsS0FBSyxFQUFFLEVBQUU7cUJBQ1Y7b0JBQ0QsZUFBZSxFQUFFO3dCQUNmLEtBQUssRUFBRSxtQkFBbUI7d0JBQzFCLFdBQVcsRUFBRSwwQ0FBMEM7d0JBQ3ZELElBQUksRUFBRSxTQUFTO3dCQUNmLE9BQU8sRUFBRSxLQUFLO3dCQUNkLEtBQUssRUFBRSxFQUFFO3FCQUNWO29CQUNELGtCQUFrQixFQUFFO3dCQUNsQixLQUFLLEVBQUUsdUJBQXVCO3dCQUM5QixXQUFXLEVBQUUsc0RBQXNEO3dCQUNuRSxJQUFJLEVBQUUsU0FBUzt3QkFDZixPQUFPLEVBQUUsS0FBSzt3QkFDZCxLQUFLLEVBQUUsRUFBRTtxQkFDVjtpQkFDRjthQUNGO1NBQ0Y7S0FDRjtJQUNELFVBQVUsRUFBRTtRQUNWLEtBQUssRUFBRSw0Q0FBNEM7UUFDbkQsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsRUFBRTtRQUNULFVBQVUsRUFBRTtZQUNWLG1CQUFtQixFQUFFO2dCQUNuQixLQUFLLEVBQUUsbURBQW1EO2dCQUMxRCxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0QseUJBQXlCLEVBQUU7Z0JBQ3pCLEtBQUssRUFBRSxvREFBb0Q7Z0JBQzNELFdBQVcsRUFDVCw0REFBNEQ7b0JBQzVELHlEQUF5RDtnQkFDM0QsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsS0FBSyxFQUFFLElBQUk7YUFDWjtZQUNELHlCQUF5QixFQUFFO2dCQUN6QixLQUFLLEVBQUUsK0NBQStDO2dCQUN0RCxXQUFXLEVBQ1QsNkRBQTZEO29CQUM3RCx5REFBeUQ7Z0JBQzNELElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxLQUFLO2dCQUNkLEtBQUssRUFBRSxJQUFJO2FBQ1o7U0FDRjtLQUNGO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsY0FBYztRQUNyQixLQUFLLEVBQUUsRUFBRTtRQUNULFVBQVUsRUFBRTtZQUNWLDZCQUE2QixFQUFFO2dCQUM3QixLQUFLLEVBQUUsa0NBQWtDO2dCQUN6QyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0QsYUFBYSxFQUFFO2dCQUNiLEtBQUssRUFBRSxlQUFlO2dCQUN0QixXQUFXLEVBQ1QsZ0VBQWdFO2dCQUNsRSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO2dCQUN6QixPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0QsZUFBZSxFQUFFO2dCQUNmLEtBQUssRUFBRSxrQkFBa0I7Z0JBQ3pCLFdBQVcsRUFDVCwwREFBMEQ7b0JBQzFELDBFQUEwRTtnQkFDNUUsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELGFBQWEsRUFBRTtnQkFDYixLQUFLLEVBQUUsd0JBQXdCO2dCQUMvQixJQUFJLEVBQUUsT0FBTztnQkFDYixPQUFPLEVBQUU7b0JBQ1AsWUFBWTtvQkFDWixlQUFlO29CQUNmLGFBQWE7b0JBQ2IsZ0JBQWdCO2lCQUNqQjtnQkFDRCxLQUFLLEVBQUUsRUFBRTtnQkFDVCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO2FBQzFCO1lBQ0QsZUFBZSxFQUFFO2dCQUNmLEtBQUssRUFBRSx5Q0FBeUM7Z0JBQ2hELElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixLQUFLLEVBQUUsRUFBRTthQUNWO1NBQ0Y7S0FDRjtJQUNELGdCQUFnQixFQUFFO1FBQ2hCLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLHNCQUFzQjtRQUM3QixLQUFLLEVBQUUsRUFBRTtRQUNULFVBQVUsRUFBRTtZQUNWLG9CQUFvQixFQUFFO2dCQUNwQixLQUFLLEVBQUUseUJBQXlCO2dCQUNoQyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsQ0FBQzthQUNUO1lBQ0QsY0FBYyxFQUFFO2dCQUNkLEtBQUssRUFBRSwwQ0FBMEM7Z0JBQ2pELFdBQVcsRUFBRSxtQ0FBbUM7Z0JBQ2hELElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxJQUFJO2dCQUNiLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRCxhQUFhLEVBQUU7Z0JBQ2IsS0FBSyxFQUFFLCtDQUErQztnQkFDdEQsV0FBVyxFQUFFLGdDQUFnQztnQkFDN0MsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELFFBQVEsRUFBRTtnQkFDUixLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxXQUFXLEVBQUUsaUJBQWlCO2dCQUM5QixJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsSUFBSTtnQkFDYixLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELFdBQVcsRUFBRSxzREFBc0Q7Z0JBQ25FLElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxJQUFJO2dCQUNiLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxTQUFTLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFLDRDQUE0QztnQkFDbkQsV0FBVyxFQUNULDBEQUEwRDtvQkFDMUQsd0RBQXdEO29CQUN4RCxxQ0FBcUM7Z0JBQ3ZDLElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxJQUFJO2dCQUNiLEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxlQUFlLEVBQUU7Z0JBQ2YsS0FBSyxFQUFFLG9DQUFvQztnQkFDM0MsV0FBVyxFQUFFLG1DQUFtQztnQkFDaEQsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELG9CQUFvQixFQUFFO2dCQUNwQixLQUFLLEVBQUUsd0JBQXdCO2dCQUMvQixXQUFXLEVBQ1Qsd0VBQXdFO2dCQUMxRSxJQUFJLEVBQUUsT0FBTztnQkFDYixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7Z0JBQ2pDLEtBQUssRUFBRSxHQUFHO2dCQUNWLEtBQUssRUFBRTtvQkFDTCxJQUFJLEVBQUUsUUFBUTtpQkFDZjthQUNGO1lBQ0QsbUJBQW1CLEVBQUU7Z0JBQ25CLEtBQUssRUFBRSx1QkFBdUI7Z0JBQzlCLFdBQVcsRUFDVCx1RUFBdUU7Z0JBQ3pFLElBQUksRUFBRSxPQUFPO2dCQUNiLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztnQkFDbkMsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsS0FBSyxFQUFFO29CQUNMLElBQUksRUFBRSxRQUFRO2lCQUNmO2FBQ0Y7U0FDRjtLQUNGO0lBQ0QsWUFBWSxFQUFFO1FBQ1osSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsaUJBQWlCO1FBQ3hCLEtBQUssRUFBRSxFQUFFO1FBQ1QsVUFBVSxFQUFFO1lBQ1YseUJBQXlCLEVBQUU7Z0JBQ3pCLEtBQUssRUFBRSxvQ0FBb0M7Z0JBQzNDLElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxLQUFLO2dCQUNkLFdBQVcsRUFDVCw2REFBNkQ7b0JBQzdELGVBQWU7Z0JBQ2pCLEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRCxVQUFVLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLEtBQUssRUFBRSwyQkFBMkI7Z0JBQ2xDLFdBQVcsRUFDVCw2REFBNkQ7b0JBQzdELHdFQUF3RTtnQkFDMUUsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUNELGFBQWEsRUFBRTtnQkFDYixJQUFJLEVBQUUsT0FBTztnQkFDYixPQUFPLEVBQUUsRUFBRTtnQkFDWCxLQUFLLEVBQUUsU0FBUztnQkFDaEIsV0FBVyxFQUNULG9HQUFvRztnQkFDdEcsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFO29CQUNMLElBQUksRUFBRSxRQUFRO2lCQUNmO2FBQ0Y7WUFDRCxlQUFlLEVBQUU7Z0JBQ2YsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLHVCQUF1QjtnQkFDOUIsV0FBVyxFQUNULHFHQUFxRztnQkFDdkcsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsS0FBSyxFQUFFO29CQUNMLElBQUksRUFBRSxRQUFRO2lCQUNmO2FBQ0Y7WUFDRCxvQkFBb0IsRUFBRTtnQkFDcEIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLDRDQUE0QztnQkFDckQsS0FBSyxFQUFFLGlCQUFpQjtnQkFDeEIsV0FBVyxFQUFFLDJDQUEyQztnQkFDeEQsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELGtCQUFrQixFQUFFO2dCQUNsQixJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsaUNBQWlDO2dCQUN4QyxXQUFXLEVBQ1Qsd0NBQXdDO29CQUN4QyxvRUFBb0U7b0JBQ3BFLGtEQUFrRDtnQkFDcEQsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELHNCQUFzQixFQUFFO2dCQUN0QixJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsSUFBSTtnQkFDYixLQUFLLEVBQUUsbUJBQW1CO2dCQUMxQixXQUFXLEVBQUUsbURBQW1EO2dCQUNoRSxLQUFLLEVBQUUsRUFBRTthQUNWO1lBQ0QsYUFBYSxFQUFFO2dCQUNiLElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxrQkFBa0I7Z0JBQzNCLEtBQUssRUFBRSx3QkFBd0I7Z0JBQy9CLFdBQVcsRUFBRSwyQ0FBMkM7Z0JBQ3hELEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxxQkFBcUIsRUFBRTtnQkFDckIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLGlDQUFpQztnQkFDeEMsV0FBVyxFQUFFLCtCQUErQjtnQkFDNUMsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELGFBQWEsRUFBRTtnQkFDYixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsWUFBWTtnQkFDckIsS0FBSyxFQUFFLDhCQUE4QjtnQkFDckMsV0FBVyxFQUFFLDJDQUEyQztnQkFDeEQsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELHFCQUFxQixFQUFFO2dCQUNyQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsRUFBRTtnQkFDWCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxXQUFXLEVBQUUsK0JBQStCO2dCQUM1QyxLQUFLLEVBQUUsRUFBRTthQUNWO1NBQ0Y7S0FDRjtDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIElDb25maWcge1xuICBba2V5OiBzdHJpbmddOiB7XG4gICAgdGl0bGU6IHN0cmluZ1xuICAgIG9yZGVyOiBudW1iZXJcbiAgICB0eXBlOiBzdHJpbmdcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZ1xuICAgIHByb3BlcnRpZXM/OiBJQ29uZmlnXG4gICAgZGVmYXVsdD86IGFueVxuICAgIGVudW0/OiBhbnlbXVxuICAgIGl0ZW1zPzoge1xuICAgICAgdHlwZTogc3RyaW5nXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjb25maWc6IElDb25maWcgPSB7XG4gIGdyYW1tYXJzOiB7XG4gICAgdGl0bGU6ICdNYXJrZG93biBHcmFtbWFycycsXG4gICAgZGVzY3JpcHRpb246ICdFZGl0b3JzIHVzaW5nIHdoYXQgZ3JhbW1hcnMgYXJlIGNvbnNpZGVyZWQgTWFya2Rvd24nLFxuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogW1xuICAgICAgJ3NvdXJjZS5nZm0nLFxuICAgICAgJ3NvdXJjZS5saXRjb2ZmZWUnLFxuICAgICAgJ3RleHQuaHRtbC5iYXNpYycsXG4gICAgICAndGV4dC5tZCcsXG4gICAgICAndGV4dC5wbGFpbicsXG4gICAgICAndGV4dC5wbGFpbi5udWxsLWdyYW1tYXInLFxuICAgIF0sXG4gICAgb3JkZXI6IDAsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIGV4dGVuc2lvbnM6IHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIHRpdGxlOiAnTWFya2Rvd24gZmlsZSBleHRlbnNpb25zJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doaWNoIGZpbGVzIGFyZSBjb25zaWRlcmVkIE1hcmtkb3duJyxcbiAgICBkZWZhdWx0OiBbJ21hcmtkb3duJywgJ21kJywgJ21kb3duJywgJ21rZCcsICdta2Rvd24nLCAncm9uJywgJ3R4dCddLFxuICAgIG9yZGVyOiAxLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICB1c2VHaXRIdWJTdHlsZToge1xuICAgIHRpdGxlOiAnVXNlIEdpdEh1Yi5jb20gc3R5bGUnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMixcbiAgfSxcbiAgcmVuZGVyZXI6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnbWFya2Rvd24taXQnLFxuICAgIHRpdGxlOiAnUmVuZGVyZXIgYmFja2VuZCcsXG4gICAgZW51bTogWydtYXJrZG93bi1pdCcsICdwYW5kb2MnXSxcbiAgICBvcmRlcjogMyxcbiAgfSxcbiAgcHJldmlld0NvbmZpZzoge1xuICAgIHRpdGxlOiAnUHJldmlldyBCZWhhdmlvdXInLFxuICAgIG9yZGVyOiAxMCxcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBsaXZlVXBkYXRlOiB7XG4gICAgICAgIHRpdGxlOiAnTGl2ZSBVcGRhdGUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiB7XG4gICAgICAgIHRpdGxlOiAnRGlyZWN0aW9uIHRvIGxvYWQgdGhlIHByZXZpZXcgaW4gc3BsaXQgcGFuZScsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAncmlnaHQnLFxuICAgICAgICBlbnVtOiBbJ2Rvd24nLCAncmlnaHQnLCAnbm9uZSddLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgcHJldmlld0RvY2s6IHtcbiAgICAgICAgdGl0bGU6ICdPcGVuIHByZXZpZXcgaW4gZG9jaycsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnY2VudGVyJyxcbiAgICAgICAgZW51bTogWydsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbScsICdjZW50ZXInXSxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgfSxcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdDbG9zZSBwcmV2aWV3IHdoZW4gZWRpdG9yIGNsb3NlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDI2LFxuICAgICAgfSxcbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdCcmluZyB1cCBwcmV2aWV3IHdoZW4gZWRpdG9yIGFjdGl2YXRlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyNyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc2F2ZUNvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnRXhwb3J0IEJlaGF2aW91cicsXG4gICAgb3JkZXI6IDE1LFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiB7XG4gICAgICAgIHRpdGxlOiAnV2hlbiBzYXZpbmcgYXMgSFRNTCwgbWVkaWEgcGF0aHMgd2lsbCBiZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdNZWRpYSBpbmNsdWRlcyBpbWFnZXMsIGF1ZGlvIGFuZCB2aWRlby4gJyArXG4gICAgICAgICAgJ3JlbGF0aXZlIHNyYyBhdHRyaWJ1dGVzIG9mIGltZywgYXVkaW8sIHZpZGVvIHRhZ3MgY2FuIGVpdGhlciBiZSByZXdyaXR0ZW4gJyArXG4gICAgICAgICAgJ3RvIHVzZSBhYnNvbHV0ZSBmaWxlIHBhdGhzLCBwYXRocyByZWxhdGl2ZSB0byBzYXZlIGxvY2F0aW9uLCBvciBiZSBsZWZ0ICcgK1xuICAgICAgICAgICd1bmFsdGVyZWQnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3JlbGF0aXZpemVkJyxcbiAgICAgICAgZW51bTogWydyZWxhdGl2aXplZCcsICdhYnNvbHV0aXplZCcsICd1bnRvdWNoZWQnXSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiB7XG4gICAgICAgIHRpdGxlOiAnV2hlbiBjb3B5aW5nIGFzIEhUTUwsIG1lZGlhIHBhdGhzIHdpbGwgYmUnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTWVkaWEgaW5jbHVkZXMgaW1hZ2VzLCBhdWRpbyBhbmQgdmlkZW8uICcgK1xuICAgICAgICAgICdyZWxhdGl2ZSBzcmMgYXR0cmlidXRlcyBvZiBpbWcsIGF1ZGlvLCB2aWRlbyB0YWdzIGNhbiBlaXRoZXIgYmUgcmV3cml0dGVuICcgK1xuICAgICAgICAgICd0byB1c2UgYWJzb2x1dGUgZmlsZSBwYXRocywgcGF0aHMgcmVsYXRpdmUgdG8gc2F2ZSBsb2NhdGlvbiwgb3IgYmUgbGVmdCAnICtcbiAgICAgICAgICAndW5hbHRlcmVkJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICd1bnRvdWNoZWQnLFxuICAgICAgICBlbnVtOiBbJ3JlbGF0aXZpemVkJywgJ2Fic29sdXRpemVkJywgJ3VudG91Y2hlZCddLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICB9LFxuICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6IHtcbiAgICAgICAgdGl0bGU6ICdEZWZhdWx0IGZvcm1hdCB0byBzYXZlIGFzJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgICAgZW51bTogWydodG1sJywgJ3BkZiddLFxuICAgICAgICBkZWZhdWx0OiAnaHRtbCcsXG4gICAgICB9LFxuICAgICAgc2F2ZVRvUERGT3B0aW9uczoge1xuICAgICAgICB0aXRsZTogJ1NhdmUgdG8gUERGIG9wdGlvbnMnLFxuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgbWFyZ2luc1R5cGU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnTWFyZ2lucyBUeXBlJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgIGVudW06IFtcbiAgICAgICAgICAgICAgeyB2YWx1ZTogMCwgZGVzY3JpcHRpb246ICdEZWZhdWx0IG1hcmdpbnMnIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6IDEsIGRlc2NyaXB0aW9uOiAnTm8gbWFyZ2lucycgfSxcbiAgICAgICAgICAgICAgeyB2YWx1ZTogMiwgZGVzY3JpcHRpb246ICdNaW5pbXVtIG1hcmdpbnMnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZGVmYXVsdDogMCxcbiAgICAgICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBhZ2VTaXplOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1BhZ2UgU2l6ZScsXG4gICAgICAgICAgICBlbnVtOiBbJ0EzJywgJ0E0JywgJ0E1JywgJ0xlZ2FsJywgJ0xldHRlcicsICdUYWJsb2lkJywgJ0N1c3RvbSddLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnQTQnLFxuICAgICAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgY3VzdG9tUGFnZVNpemU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIFBhZ2UgU2l6ZScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgJ1Rha2VzIGVmZmVjdCB3aGVuIFBhZ2UgU2l6ZSBpcyBzZXQgdG8gYEN1c3RvbWAuIFNwZWNpZmllZCBhcyAnICtcbiAgICAgICAgICAgICAgJ2A8d2lkdGg+eDxoZWlnaHQ+YCwgd2hlcmUgYDxoZWlnaHQ+YCBhbmQgYDx3aWR0aD5gIGFyZSAnICtcbiAgICAgICAgICAgICAgJ2Zsb2F0aW5nLXBvaW50IG51bWJlcnMgd2l0aCBgLmAgKGRvdCkgYXMgZGVjaW1hbCBzZXBhcmF0b3IsIG5vIHRob3VzYW5kcyBzZXBhcmF0b3IsICcgK1xuICAgICAgICAgICAgICAnYW5kIHdpdGggb3B0aW9uYWwgYGNtYCwgYG1tYCBvciBgaW5gIHN1ZmZpeCB0byBpbmRpY2F0ZSB1bml0cywgZGVmYXVsdCBpcyBgbW1gLiAnICtcbiAgICAgICAgICAgICAgJ0ZvciBleGFtcGxlLCBBNCBpcyBgOC4zaW4geCAxMS43aW5gIG9yIGAyMTBtbSB4IDI5N21tYCBvciBgMjEwIHggMjk3YC4gJyArXG4gICAgICAgICAgICAgICdXaGl0ZXNwYWNlIGlzIGlnbm9yZWQuJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgZGVmYXVsdDogJycsXG4gICAgICAgICAgICBvcmRlcjogMjUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBsYW5kc2NhcGU6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUGFnZSBvcmllbnRhdGlvbicsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAgIHsgdmFsdWU6IGZhbHNlLCBkZXNjcmlwdGlvbjogJ1BvcnRyYWl0JyB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiB0cnVlLCBkZXNjcmlwdGlvbjogJ0xhbmRzY2FwZScgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG9yZGVyOiAyNixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHByaW50QmFja2dyb3VuZDoge1xuICAgICAgICAgICAgdGl0bGU6ICdSZW5kZXIgYmFja2dyb3VuZCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdG8gcmVuZGVyIENTUyBiYWNrZ3JvdW5kcyBpbiBQREYnLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBvcmRlcjogMzAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwcmludFNlbGVjdGlvbk9ubHk6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUmVuZGVyIG9ubHkgc2VsZWN0aW9uJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT25seSByZW5kZXIgc2VsZWN0ZWQgZG9jdW1lbnQgZnJhZ21lbnQuIEV4cGVyaW1lbnRhbCcsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIG9yZGVyOiA0MCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBzeW5jQ29uZmlnOiB7XG4gICAgdGl0bGU6ICdQcmV2aWV3IHBvc2l0aW9uIHN5bmNocm9uaXphdGlvbiBiZWhhdmlvdXInLFxuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIG9yZGVyOiAyMCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiB7XG4gICAgICAgIHRpdGxlOiAnU3luYyBwcmV2aWV3IHBvc2l0aW9uIHdoZW4gdGV4dCBpbiBlZGl0b3IgY2hhbmdlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyOCxcbiAgICAgIH0sXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiB7XG4gICAgICAgIHRpdGxlOiAnU3luYyBwcmV2aWV3IHBvc2l0aW9uIHdoZW4gdGV4dCBlZGl0b3IgaXMgc2Nyb2xsZWQnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTm90ZTogaWYgYm90aCBzY3JvbGwgc3luYyBvcHRpb25zIGFyZSBlbmFibGVkLCB0aGUgZWRpdG9yICcgK1xuICAgICAgICAgICdoYXMgdG8gYmUgaW4gYWN0aXZlIHBhbmUgZm9yIHRoaXMgb3B0aW9uIHRvIHRha2UgZWZmZWN0JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI4LjEsXG4gICAgICB9LFxuICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDoge1xuICAgICAgICB0aXRsZTogJ1N5bmMgZWRpdG9yIHBvc2l0aW9uIHdoZW4gcHJldmlldyBpcyBzY3JvbGxlZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdOb3RlOiBpZiBib3RoIHNjcm9sbCBzeW5jIG9wdGlvbnMgYXJlIGVuYWJsZWQsIHRoZSBwcmV2aWV3ICcgK1xuICAgICAgICAgICdoYXMgdG8gYmUgaW4gYWN0aXZlIHBhbmUgZm9yIHRoaXMgb3B0aW9uIHRvIHRha2UgZWZmZWN0JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDI4LjIsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG1hdGhDb25maWc6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICB0aXRsZTogJ01hdGggT3B0aW9ucycsXG4gICAgb3JkZXI6IDMwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiB7XG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIE1hdGggUmVuZGVyaW5nIEJ5IERlZmF1bHQnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMCxcbiAgICAgIH0sXG4gICAgICBsYXRleFJlbmRlcmVyOiB7XG4gICAgICAgIHRpdGxlOiAnTWF0aCBSZW5kZXJlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdTVkcgaXMgbm90aWNlYWJseSBmYXN0ZXIsIGJ1dCBtaWdodCBsb29rIHdvcnNlIG9uIHNvbWUgc3lzdGVtcycsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBlbnVtOiBbJ0hUTUwtQ1NTJywgJ1NWRyddLFxuICAgICAgICBkZWZhdWx0OiAnU1ZHJyxcbiAgICAgICAgb3JkZXI6IDUsXG4gICAgICB9LFxuICAgICAgbnVtYmVyRXF1YXRpb25zOiB7XG4gICAgICAgIHRpdGxlOiAnTnVtYmVyIGVxdWF0aW9ucycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdOdW1iZXIgZXF1YXRpb25zIHRoYXQgYXJlIGluIGVxdWF0aW9uIGVudmlyb25tZW50LCBldGMuICcgK1xuICAgICAgICAgICdXaWxsIHJlLXJlbmRlciBhbGwgbWF0aCBvbiBlYWNoIG1hdGggY2hhbmdlLCB3aGljaCBtaWdodCBiZSB1bmRlc2lyYWJsZS4nLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgdGV4RXh0ZW5zaW9uczoge1xuICAgICAgICB0aXRsZTogJ01hdGhKYXggVGVYIGV4dGVuc2lvbnMnLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbXG4gICAgICAgICAgJ0FNU21hdGguanMnLFxuICAgICAgICAgICdBTVNzeW1ib2xzLmpzJyxcbiAgICAgICAgICAnbm9FcnJvcnMuanMnLFxuICAgICAgICAgICdub1VuZGVmaW5lZC5qcycsXG4gICAgICAgIF0sXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgICAgaXRlbXM6IHsgdHlwZTogJ3N0cmluZycgfSxcbiAgICAgIH0sXG4gICAgICB1bmRlZmluZWRGYW1pbHk6IHtcbiAgICAgICAgdGl0bGU6ICdNYXRoSmF4IGB1bmRlZmluZWRGYW1pbHlgIChmb250IGZhbWlseSknLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3NlcmlmJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBtYXJrZG93bkl0Q29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdNYXJrZG93bi1JdCBTZXR0aW5ncycsXG4gICAgb3JkZXI6IDQwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiB7XG4gICAgICAgIHRpdGxlOiAnQnJlYWsgb24gc2luZ2xlIG5ld2xpbmUnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMCxcbiAgICAgIH0sXG4gICAgICB1c2VMYXp5SGVhZGVyczoge1xuICAgICAgICB0aXRsZTogJ1VzZSBMYXp5IEhlYWRlcnMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlcXVpcmUgbm8gc3BhY2UgYWZ0ZXIgaGVhZGluZ3MgIycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDUsXG4gICAgICB9LFxuICAgICAgdXNlQ2hlY2tCb3hlczoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBDaGVja0JveCBsaXN0cyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ2hlY2tCb3ggbGlzdHMsIGxpa2Ugb24gR2l0SHViJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMTAsXG4gICAgICB9LFxuICAgICAgdXNlRW1vamk6IHtcbiAgICAgICAgdGl0bGU6ICdVc2UgRW1vamkgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Vtb2ppIHJlbmRlcmluZycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDE1LFxuICAgICAgfSxcbiAgICAgIHVzZVRvYzoge1xuICAgICAgICB0aXRsZTogJ1VzZSB0YWJsZSBvZiBjb250ZW50cyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZSBbW3RvY11dIHdpdGggYXV0b2dlbmVyYXRlZCB0YWJsZSBvZiBjb250ZW50cycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgfSxcbiAgICAgIHVzZUltc2l6ZToge1xuICAgICAgICB0aXRsZTogJ0FsbG93IHNwZWNpZnlpbmcgaW1hZ2Ugc2l6ZSBpbiBpbWFnZSB0aXRsZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdBbGxvdyBub24tc3RhbmRhcmQgc3ludGF4IGZvciBzcGVjaWZ5aW5nIGltYWdlIHNpemUgdmlhICcgK1xuICAgICAgICAgICdhcHBlbmRpbmcgYD08d2lkdGg+eDxoZWlnaHQ+YCB0byBpbWFnZSBzcGFjaWZpY2F0aW9uLCAnICtcbiAgICAgICAgICAnZi5leC4gYCFbdGVzdF0oaW1hZ2UucG5nID0xMDB4MjAwKWAnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgIH0sXG4gICAgICB1c2VDcml0aWNNYXJrdXA6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgQ3JpdGljTWFya3VwIHN5bnRheCBzdXBwb3J0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTdXBwb3J0IGlzIGxpbWl0ZWQgdG8gaW5saW5lIG9ubHknLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogNDAsXG4gICAgICB9LFxuICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHtcbiAgICAgICAgdGl0bGU6ICdJbmxpbmUgbWF0aCBzZXBhcmF0b3JzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0xpc3Qgb2YgaW5saW5lIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbJyQnLCAnJCcsICdcXFxcKCcsICdcXFxcKSddLFxuICAgICAgICBvcmRlcjogMTEwLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHtcbiAgICAgICAgdGl0bGU6ICdCbG9jayBtYXRoIHNlcGFyYXRvcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTGlzdCBvZiBibG9jayBtYXRoIHNlcGFyYXRvcnMgaW4gcGFpcnMgLS0gZmlyc3Qgb3BlbmluZywgdGhlbiBjbG9zaW5nJyxcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogWyckJCcsICckJCcsICdcXFxcWycsICdcXFxcXSddLFxuICAgICAgICBvcmRlcjogMTIwLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwYW5kb2NDb25maWc6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICB0aXRsZTogJ1BhbmRvYyBzZXR0aW5ncycsXG4gICAgb3JkZXI6IDUwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IHtcbiAgICAgICAgdGl0bGU6ICdVc2UgbmF0aXZlIFBhbmRvYyBjb2RlIGJsb2NrIHN0eWxlJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgXCJEb24ndCBjb252ZXJ0IGZlbmNlZCBjb2RlIGJsb2NrcyB0byBBdG9tIGVkaXRvcnMgd2hlbiB1c2luZ1wiICtcbiAgICAgICAgICAnUGFuZG9jIHBhcnNlcicsXG4gICAgICAgIG9yZGVyOiAwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY1BhdGg6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdwYW5kb2MnLFxuICAgICAgICB0aXRsZTogJ1BhdGggdG8gUGFuZG9jIGV4ZWN1dGFibGUnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnUGxlYXNlIHNwZWNpZnkgdGhlIGNvcnJlY3QgcGF0aCB0byB5b3VyIHBhbmRvYyBleGVjdXRhYmxlLCAnICtcbiAgICAgICAgICAnZm9yIGV4YW1wbGUsIC91c3IvYmluL3BhbmRvYywgb3IgQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxQYW5kb2NcXFxccGFuZG9jLmV4ZScsXG4gICAgICAgIG9yZGVyOiA1LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0ZpbHRlcnM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgICAgIHRpdGxlOiAnRmlsdGVycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGZpbHRlcnMsIGluIG9yZGVyIG9mIGFwcGxpY2F0aW9uLiBXaWxsIGJlIHBhc3NlZCB2aWEgY29tbWFuZC1saW5lIGFyZ3VtZW50cycsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NBcmd1bWVudHM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogW10sXG4gICAgICAgIHRpdGxlOiAnQ29tbWFuZGxpbmUgQXJndW1lbnRzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgYXJndW1lbnRzIGUuZy4gYC0tc21hcnQsIC0tZmlsdGVyPS9iaW4vZXhlYC4gUGxlYXNlIHVzZSBsb25nIGFyZ3VtZW50IG5hbWVzLicsXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ21hcmtkb3duLXJhd190ZXgrdGV4X21hdGhfc2luZ2xlX2JhY2tzbGFzaCcsXG4gICAgICAgIHRpdGxlOiAnTWFya2Rvd24gRmxhdm9yJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbnRlciB0aGUgcGFuZG9jIG1hcmtkb3duIGZsYXZvciB5b3Ugd2FudCcsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgdGl0bGU6ICdDaXRhdGlvbnMgKHZpYSBwYW5kb2MtY2l0ZXByb2MpJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0VuYWJsZSB0aGlzIGZvciBiaWJsaW9ncmFwaHkgcGFyc2luZy4gJyArXG4gICAgICAgICAgJ05vdGU6IHBhbmRvYy1jaXRlcHJvYyBpcyBhcHBsaWVkIGFmdGVyIG90aGVyIGZpbHRlcnMgc3BlY2lmaWVkIGluICcgK1xuICAgICAgICAgICdGaWx0ZXJzLCBidXQgYmVmb3JlIG90aGVyIGNvbW1hbmRsaW5lIGFyZ3VtZW50cyAnLFxuICAgICAgICBvcmRlcjogMjUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRpdGxlOiAnUmVtb3ZlIFJlZmVyZW5jZXMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlbW92ZXMgcmVmZXJlbmNlcyBhdCB0aGUgZW5kIG9mIHRoZSBIVE1MIHByZXZpZXcnLFxuICAgICAgICBvcmRlcjogMzAsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQklCRmlsZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ2JpYmxpb2dyYXBoeS5iaWInLFxuICAgICAgICB0aXRsZTogJ0JpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgYmliZmlsZSB0byBzZWFyY2ggZm9yIHJlY3Vyc2l2ZWx5JyxcbiAgICAgICAgb3JkZXI6IDM1LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJycsXG4gICAgICAgIHRpdGxlOiAnRmFsbGJhY2sgQmlibGlvZ3JhcGh5IChiaWJmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRnVsbCBwYXRoIHRvIGZhbGxiYWNrIGJpYmZpbGUnLFxuICAgICAgICBvcmRlcjogNDAsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQ1NMRmlsZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ2N1c3RvbS5jc2wnLFxuICAgICAgICB0aXRsZTogJ0JpYmxpb2dyYXBoeSBTdHlsZSAoY3NsZmlsZSknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgY3NsZmlsZSB0byBzZWFyY2ggZm9yIHJlY3Vyc2l2ZWx5JyxcbiAgICAgICAgb3JkZXI6IDQ1LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJycsXG4gICAgICAgIHRpdGxlOiAnRmFsbGJhY2sgQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRnVsbCBwYXRoIHRvIGZhbGxiYWNrIGNzbGZpbGUnLFxuICAgICAgICBvcmRlcjogNTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59XG5cbi8vIGdlbmVyYXRlZCBieSB0eXBlZC1jb25maWcuanNcbmRlY2xhcmUgbW9kdWxlICdhdG9tJyB7XG4gIGludGVyZmFjZSBDb25maWdWYWx1ZXMge1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZ3JhbW1hcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZXh0ZW5zaW9ucyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnJlbmRlcmVyJzogJ21hcmtkb3duLWl0JyB8ICdwYW5kb2MnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmxpdmVVcGRhdGUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOlxuICAgICAgfCAnZG93bidcbiAgICAgIHwgJ3JpZ2h0J1xuICAgICAgfCAnbm9uZSdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcucHJldmlld0RvY2snOlxuICAgICAgfCAnbGVmdCdcbiAgICAgIHwgJ3JpZ2h0J1xuICAgICAgfCAnYm90dG9tJ1xuICAgICAgfCAnY2VudGVyJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5jbG9zZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5hY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZyc6IHtcbiAgICAgIGxpdmVVcGRhdGU6IGJvb2xlYW5cbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6ICdkb3duJyB8ICdyaWdodCcgfCAnbm9uZSdcbiAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgICAgYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcubWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXInOlxuICAgICAgfCAncmVsYXRpdml6ZWQnXG4gICAgICB8ICdhYnNvbHV0aXplZCdcbiAgICAgIHwgJ3VudG91Y2hlZCdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOlxuICAgICAgfCAncmVsYXRpdml6ZWQnXG4gICAgICB8ICdhYnNvbHV0aXplZCdcbiAgICAgIHwgJ3VudG91Y2hlZCdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuZGVmYXVsdFNhdmVGb3JtYXQnOiAnaHRtbCcgfCAncGRmJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLm1hcmdpbnNUeXBlJzogMCB8IDEgfCAyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnOlxuICAgICAgfCAnQTMnXG4gICAgICB8ICdBNCdcbiAgICAgIHwgJ0E1J1xuICAgICAgfCAnTGVnYWwnXG4gICAgICB8ICdMZXR0ZXInXG4gICAgICB8ICdUYWJsb2lkJ1xuICAgICAgfCAnQ3VzdG9tJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmN1c3RvbVBhZ2VTaXplJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRCYWNrZ3JvdW5kJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnByaW50U2VsZWN0aW9uT25seSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucyc6IHtcbiAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgIHBhZ2VTaXplOiAnQTMnIHwgJ0E0JyB8ICdBNScgfCAnTGVnYWwnIHwgJ0xldHRlcicgfCAnVGFibG9pZCcgfCAnQ3VzdG9tJ1xuICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xuICAgICAgbGFuZHNjYXBlOiBmYWxzZSB8IHRydWVcbiAgICAgIHByaW50QmFja2dyb3VuZDogYm9vbGVhblxuICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZyc6IHtcbiAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgICBtZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xuICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6ICdodG1sJyB8ICdwZGYnXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnOlxuICAgICAgICB8ICdBMydcbiAgICAgICAgfCAnQTQnXG4gICAgICAgIHwgJ0E1J1xuICAgICAgICB8ICdMZWdhbCdcbiAgICAgICAgfCAnTGV0dGVyJ1xuICAgICAgICB8ICdUYWJsb2lkJ1xuICAgICAgICB8ICdDdXN0b20nXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5jdXN0b21QYWdlU2l6ZSc6IHN0cmluZ1xuICAgICAgJ3NhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wcmludEJhY2tncm91bmQnOiBib29sZWFuXG4gICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wcmludFNlbGVjdGlvbk9ubHknOiBib29sZWFuXG4gICAgICBzYXZlVG9QREZPcHRpb25zOiB7XG4gICAgICAgIG1hcmdpbnNUeXBlOiAwIHwgMSB8IDJcbiAgICAgICAgcGFnZVNpemU6ICdBMycgfCAnQTQnIHwgJ0E1JyB8ICdMZWdhbCcgfCAnTGV0dGVyJyB8ICdUYWJsb2lkJyB8ICdDdXN0b20nXG4gICAgICAgIGN1c3RvbVBhZ2VTaXplOiBzdHJpbmdcbiAgICAgICAgbGFuZHNjYXBlOiBmYWxzZSB8IHRydWVcbiAgICAgICAgcHJpbnRCYWNrZ3JvdW5kOiBib29sZWFuXG4gICAgICAgIHByaW50U2VsZWN0aW9uT25seTogYm9vbGVhblxuICAgICAgfVxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcnOiB7XG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXG4gICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiBib29sZWFuXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLnRleEV4dGVuc2lvbnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy51bmRlZmluZWRGYW1pbHknOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcnOiB7XG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxuICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICBudW1iZXJFcXVhdGlvbnM6IGJvb2xlYW5cbiAgICAgIHRleEV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB1bmRlZmluZWRGYW1pbHk6IHN0cmluZ1xuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VDaGVja0JveGVzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlVG9jJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VJbXNpemUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUNyaXRpY01hcmt1cCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy5ibG9ja01hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcnOiB7XG4gICAgICBicmVha09uU2luZ2xlTmV3bGluZTogYm9vbGVhblxuICAgICAgdXNlTGF6eUhlYWRlcnM6IGJvb2xlYW5cbiAgICAgIHVzZUNoZWNrQm94ZXM6IGJvb2xlYW5cbiAgICAgIHVzZUVtb2ppOiBib29sZWFuXG4gICAgICB1c2VUb2M6IGJvb2xlYW5cbiAgICAgIHVzZUltc2l6ZTogYm9vbGVhblxuICAgICAgdXNlQ3JpdGljTWFya3VwOiBib29sZWFuXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnJzoge1xuICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczogYm9vbGVhblxuICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXG4gICAgICBwYW5kb2NGaWx0ZXJzOiBzdHJpbmdbXVxuICAgICAgcGFuZG9jQXJndW1lbnRzOiBzdHJpbmdbXVxuICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xuICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiBib29sZWFuXG4gICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiBib29sZWFuXG4gICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcbiAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICBwYW5kb2NDU0xGaWxlOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMnOiB7XG4gICAgICBncmFtbWFyczogc3RyaW5nW11cbiAgICAgIGV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB1c2VHaXRIdWJTdHlsZTogYm9vbGVhblxuICAgICAgcmVuZGVyZXI6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xuICAgICAgJ3ByZXZpZXdDb25maWcubGl2ZVVwZGF0ZSc6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAncHJldmlld0NvbmZpZy5wcmV2aWV3RG9jayc6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICAncHJldmlld0NvbmZpZy5jbG9zZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICAgJ3ByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAgIHByZXZpZXdDb25maWc6IHtcbiAgICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgIH1cbiAgICAgICdzYXZlQ29uZmlnLm1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyJzpcbiAgICAgICAgfCAncmVsYXRpdml6ZWQnXG4gICAgICAgIHwgJ2Fic29sdXRpemVkJ1xuICAgICAgICB8ICd1bnRvdWNoZWQnXG4gICAgICAnc2F2ZUNvbmZpZy5tZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cic6XG4gICAgICAgIHwgJ3JlbGF0aXZpemVkJ1xuICAgICAgICB8ICdhYnNvbHV0aXplZCdcbiAgICAgICAgfCAndW50b3VjaGVkJ1xuICAgICAgJ3NhdmVDb25maWcuZGVmYXVsdFNhdmVGb3JtYXQnOiAnaHRtbCcgfCAncGRmJ1xuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XG4gICAgICAgIHwgJ0EzJ1xuICAgICAgICB8ICdBNCdcbiAgICAgICAgfCAnQTUnXG4gICAgICAgIHwgJ0xlZ2FsJ1xuICAgICAgICB8ICdMZXR0ZXInXG4gICAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICAgIHwgJ0N1c3RvbSdcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMuY3VzdG9tUGFnZVNpemUnOiBzdHJpbmdcbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMubGFuZHNjYXBlJzogZmFsc2UgfCB0cnVlXG4gICAgICAnc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLnByaW50QmFja2dyb3VuZCc6IGJvb2xlYW5cbiAgICAgICdzYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucHJpbnRTZWxlY3Rpb25Pbmx5JzogYm9vbGVhblxuICAgICAgJ3NhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucyc6IHtcbiAgICAgICAgbWFyZ2luc1R5cGU6IDAgfCAxIHwgMlxuICAgICAgICBwYWdlU2l6ZTogJ0EzJyB8ICdBNCcgfCAnQTUnIHwgJ0xlZ2FsJyB8ICdMZXR0ZXInIHwgJ1RhYmxvaWQnIHwgJ0N1c3RvbSdcbiAgICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xuICAgICAgICBsYW5kc2NhcGU6IGZhbHNlIHwgdHJ1ZVxuICAgICAgICBwcmludEJhY2tncm91bmQ6IGJvb2xlYW5cbiAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgICB9XG4gICAgICBzYXZlQ29uZmlnOiB7XG4gICAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXG4gICAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiAnaHRtbCcgfCAncGRmJ1xuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5tYXJnaW5zVHlwZSc6IDAgfCAxIHwgMlxuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSc6XG4gICAgICAgICAgfCAnQTMnXG4gICAgICAgICAgfCAnQTQnXG4gICAgICAgICAgfCAnQTUnXG4gICAgICAgICAgfCAnTGVnYWwnXG4gICAgICAgICAgfCAnTGV0dGVyJ1xuICAgICAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICAgICAgfCAnQ3VzdG9tJ1xuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5jdXN0b21QYWdlU2l6ZSc6IHN0cmluZ1xuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5sYW5kc2NhcGUnOiBmYWxzZSB8IHRydWVcbiAgICAgICAgJ3NhdmVUb1BERk9wdGlvbnMucHJpbnRCYWNrZ3JvdW5kJzogYm9vbGVhblxuICAgICAgICAnc2F2ZVRvUERGT3B0aW9ucy5wcmludFNlbGVjdGlvbk9ubHknOiBib29sZWFuXG4gICAgICAgIHNhdmVUb1BERk9wdGlvbnM6IHtcbiAgICAgICAgICBtYXJnaW5zVHlwZTogMCB8IDEgfCAyXG4gICAgICAgICAgcGFnZVNpemU6XG4gICAgICAgICAgICB8ICdBMydcbiAgICAgICAgICAgIHwgJ0E0J1xuICAgICAgICAgICAgfCAnQTUnXG4gICAgICAgICAgICB8ICdMZWdhbCdcbiAgICAgICAgICAgIHwgJ0xldHRlcidcbiAgICAgICAgICAgIHwgJ1RhYmxvaWQnXG4gICAgICAgICAgICB8ICdDdXN0b20nXG4gICAgICAgICAgY3VzdG9tUGFnZVNpemU6IHN0cmluZ1xuICAgICAgICAgIGxhbmRzY2FwZTogZmFsc2UgfCB0cnVlXG4gICAgICAgICAgcHJpbnRCYWNrZ3JvdW5kOiBib29sZWFuXG4gICAgICAgICAgcHJpbnRTZWxlY3Rpb25Pbmx5OiBib29sZWFuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25DaGFuZ2UnOiBib29sZWFuXG4gICAgICAnc3luY0NvbmZpZy5zeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsJzogYm9vbGVhblxuICAgICAgJ3N5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cbiAgICAgIHN5bmNDb25maWc6IHtcbiAgICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZTogYm9vbGVhblxuICAgICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXG4gICAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IGJvb2xlYW5cbiAgICAgIH1cbiAgICAgICdtYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JzogYm9vbGVhblxuICAgICAgJ21hdGhDb25maWcubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgJ21hdGhDb25maWcubnVtYmVyRXF1YXRpb25zJzogYm9vbGVhblxuICAgICAgJ21hdGhDb25maWcudGV4RXh0ZW5zaW9ucyc6IHN0cmluZ1tdXG4gICAgICAnbWF0aENvbmZpZy51bmRlZmluZWRGYW1pbHknOiBzdHJpbmdcbiAgICAgIG1hdGhDb25maWc6IHtcbiAgICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IGJvb2xlYW5cbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICAgIG51bWJlckVxdWF0aW9uczogYm9vbGVhblxuICAgICAgICB0ZXhFeHRlbnNpb25zOiBzdHJpbmdbXVxuICAgICAgICB1bmRlZmluZWRGYW1pbHk6IHN0cmluZ1xuICAgICAgfVxuICAgICAgJ21hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VMYXp5SGVhZGVycyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUNoZWNrQm94ZXMnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZVRvYyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUltc2l6ZSc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUNyaXRpY01hcmt1cCc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICAgbWFya2Rvd25JdENvbmZpZzoge1xuICAgICAgICBicmVha09uU2luZ2xlTmV3bGluZTogYm9vbGVhblxuICAgICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxuICAgICAgICB1c2VDaGVja0JveGVzOiBib29sZWFuXG4gICAgICAgIHVzZUVtb2ppOiBib29sZWFuXG4gICAgICAgIHVzZVRvYzogYm9vbGVhblxuICAgICAgICB1c2VJbXNpemU6IGJvb2xlYW5cbiAgICAgICAgdXNlQ3JpdGljTWFya3VwOiBib29sZWFuXG4gICAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgICAgfVxuICAgICAgJ3BhbmRvY0NvbmZpZy51c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzJzogYm9vbGVhblxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NQYXRoJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NBcmd1bWVudHMnOiBzdHJpbmdbXVxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NNYXJrZG93bkZsYXZvcic6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY1JlbW92ZVJlZmVyZW5jZXMnOiBib29sZWFuXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGUnOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGUnOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgICBwYW5kb2NDb25maWc6IHtcbiAgICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczogYm9vbGVhblxuICAgICAgICBwYW5kb2NQYXRoOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jRmlsdGVyczogc3RyaW5nW11cbiAgICAgICAgcGFuZG9jQXJndW1lbnRzOiBzdHJpbmdbXVxuICAgICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjogc3RyaW5nXG4gICAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeTogYm9vbGVhblxuICAgICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiBib29sZWFuXG4gICAgICAgIHBhbmRvY0JJQkZpbGU6IHN0cmluZ1xuICAgICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgICAgICBwYW5kb2NDU0xGaWxlOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==