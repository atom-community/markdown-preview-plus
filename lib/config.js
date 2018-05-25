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
            mjxExtensions: {
                title: 'MathJax extensions',
                type: 'array',
                default: [
                    'AMSmath.js',
                    'AMSsymbols.js',
                    'noErrors.js',
                    'noUndefined.js'
                ],
                order: 15,
            },
            mjxUndefinedFamily: {
                title: 'MathJax undefined font family',
                description: 'Sets MathJax undefinedFamily option.',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVhLFFBQUEsTUFBTSxHQUFZO0lBQzdCLFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1oseUJBQXlCO1NBQzFCO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkUsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsYUFBYTtRQUN0QixLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7UUFDL0IsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELGFBQWEsRUFBRTtRQUNiLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsS0FBSyxFQUFFLEVB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WUFBWTtnQkFDckIsS0FBSyxFQUFFLDhCQUE4QjtnQkFDckMsV0FBVyxFQUFFLDJDQUEyQztnQkFDeEQsS0FBSyxFQUFFLEVBQUU7YUFDVjtZQUNELHFCQUFxQixFQUFFO2dCQUNyQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsRUFBRTtnQkFDWCxLQUFLLEVBQUUsdUNBQXVDO2dCQUM5QyxXQUFXLEVBQUUsK0JBQStCO2dCQUM1QyxLQUFLLEVBQUUsRUFBRTthQUNWO1NBQ0Y7S0FDRjtDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIElDb25maWcge1xyXG4gIFtrZXk6IHN0cmluZ106IHtcclxuICAgIHRpdGxlOiBzdHJpbmdcclxuICAgIG9yZGVyOiBudW1iZXJcclxuICAgIHR5cGU6IHN0cmluZ1xyXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmdcclxuICAgIHByb3BlcnRpZXM/OiBJQ29uZmlnXHJcbiAgICBkZWZhdWx0PzogYW55XHJcbiAgICBlbnVtPzogYW55W11cclxuICAgIGl0ZW1zPzoge1xyXG4gICAgICB0eXBlOiBzdHJpbmdcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWc6IElDb25maWcgPSB7XHJcbiAgZ3JhbW1hcnM6IHtcclxuICAgIHRpdGxlOiAnTWFya2Rvd24gR3JhbW1hcnMnLFxyXG4gICAgZGVzY3JpcHRpb246ICdFZGl0b3JzIHVzaW5nIHdoYXQgZ3JhbW1hcnMgYXJlIGNvbnNpZGVyZWQgTWFya2Rvd24nLFxyXG4gICAgdHlwZTogJ2FycmF5JyxcclxuICAgIGRlZmF1bHQ6IFtcclxuICAgICAgJ3NvdXJjZS5nZm0nLFxyXG4gICAgICAnc291cmNlLmxpdGNvZmZlZScsXHJcbiAgICAgICd0ZXh0Lmh0bWwuYmFzaWMnLFxyXG4gICAgICAndGV4dC5tZCcsXHJcbiAgICAgICd0ZXh0LnBsYWluJyxcclxuICAgICAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJyxcclxuICAgIF0sXHJcbiAgICBvcmRlcjogMCxcclxuICAgIGl0ZW1zOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGV4dGVuc2lvbnM6IHtcclxuICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICB0aXRsZTogJ01hcmtkb3duIGZpbGUgZXh0ZW5zaW9ucycsXHJcbiAgICBkZXNjcmlwdGlvbjogJ1doaWNoIGZpbGVzIGFyZSBjb25zaWRlcmVkIE1hcmtkb3duJyxcclxuICAgIGRlZmF1bHQ6IFsnbWFya2Rvd24nLCAnbWQnLCAnbWRvd24nLCAnbWtkJywgJ21rZG93bicsICdyb24nLCAndHh0J10sXHJcbiAgICBvcmRlcjogMSxcclxuICAgIGl0ZW1zOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHVzZUdpdEh1YlN0eWxlOiB7XHJcbiAgICB0aXRsZTogJ1VzZSBHaXRIdWIuY29tIHN0eWxlJyxcclxuICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgb3JkZXI6IDIsXHJcbiAgfSxcclxuICByZW5kZXJlcjoge1xyXG4gICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICBkZWZhdWx0OiAnbWFya2Rvd24taXQnLFxyXG4gICAgdGl0bGU6ICdSZW5kZXJlciBiYWNrZW5kJyxcclxuICAgIGVudW06IFsnbWFya2Rvd24taXQnLCAncGFuZG9jJ10sXHJcbiAgICBvcmRlcjogMyxcclxuICB9LFxyXG4gIHByZXZpZXdDb25maWc6IHtcclxuICAgIHRpdGxlOiAnUHJldmlldyBCZWhhdmlvdXInLFxyXG4gICAgb3JkZXI6IDEwLFxyXG4gICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgIGxpdmVVcGRhdGU6IHtcclxuICAgICAgICB0aXRsZTogJ0xpdmUgVXBkYXRlJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICBvcmRlcjogMTAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6IHtcclxuICAgICAgICB0aXRsZTogJ0RpcmVjdGlvbiB0byBsb2FkIHRoZSBwcmV2aWV3IGluIHNwbGl0IHBhbmUnLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdyaWdodCcsXHJcbiAgICAgICAgZW51bTogWydkb3duJywgJ3JpZ2h0JywgJ25vbmUnXSxcclxuICAgICAgICBvcmRlcjogMjAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHByZXZpZXdEb2NrOiB7XHJcbiAgICAgICAgdGl0bGU6ICdPcGVuIHByZXZpZXcgaW4gZG9jaycsXHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJ2NlbnRlcicsXHJcbiAgICAgICAgZW51bTogWydsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbScsICdjZW50ZXInXSxcclxuICAgICAgICBvcmRlcjogMjUsXHJcbiAgICAgIH0sXHJcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IHtcclxuICAgICAgICB0aXRsZTogJ0Nsb3NlIHByZXZpZXcgd2hlbiBlZGl0b3IgY2xvc2VzJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICBvcmRlcjogMjYsXHJcbiAgICAgIH0sXHJcbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IHtcclxuICAgICAgICB0aXRsZTogJ0JyaW5nIHVwIHByZXZpZXcgd2hlbiBlZGl0b3IgYWN0aXZhdGVzJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgb3JkZXI6IDI3LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHNhdmVDb25maWc6IHtcclxuICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgdGl0bGU6ICdFeHBvcnQgQmVoYXZpb3VyJyxcclxuICAgIG9yZGVyOiAxNSxcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6IHtcclxuICAgICAgICB0aXRsZTogJ1doZW4gc2F2aW5nIGFzIEhUTUwsIG1lZGlhIHBhdGhzIHdpbGwgYmUnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ01lZGlhIGluY2x1ZGVzIGltYWdlcywgYXVkaW8gYW5kIHZpZGVvLiAnICtcclxuICAgICAgICAgICdyZWxhdGl2ZSBzcmMgYXR0cmlidXRlcyBvZiBpbWcsIGF1ZGlvLCB2aWRlbyB0YWdzIGNhbiBlaXRoZXIgYmUgcmV3cml0dGVuICcgK1xyXG4gICAgICAgICAgJ3RvIHVzZSBhYnNvbHV0ZSBmaWxlIHBhdGhzLCBwYXRocyByZWxhdGl2ZSB0byBzYXZlIGxvY2F0aW9uLCBvciBiZSBsZWZ0ICcgK1xyXG4gICAgICAgICAgJ3VuYWx0ZXJlZCcsXHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJ3JlbGF0aXZpemVkJyxcclxuICAgICAgICBlbnVtOiBbJ3JlbGF0aXZpemVkJywgJ2Fic29sdXRpemVkJywgJ3VudG91Y2hlZCddLFxyXG4gICAgICAgIG9yZGVyOiAxMCxcclxuICAgICAgfSxcclxuICAgICAgbWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXI6IHtcclxuICAgICAgICB0aXRsZTogJ1doZW4gY29weWluZyBhcyBIVE1MLCBtZWRpYSBwYXRocyB3aWxsIGJlJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdNZWRpYSBpbmNsdWRlcyBpbWFnZXMsIGF1ZGlvIGFuZCB2aWRlby4gJyArXHJcbiAgICAgICAgICAncmVsYXRpdmUgc3JjIGF0dHJpYnV0ZXMgb2YgaW1nLCBhdWRpbywgdmlkZW8gdGFncyBjYW4gZWl0aGVyIGJlIHJld3JpdHRlbiAnICtcclxuICAgICAgICAgICd0byB1c2UgYWJzb2x1dGUgZmlsZSBwYXRocywgcGF0aHMgcmVsYXRpdmUgdG8gc2F2ZSBsb2NhdGlvbiwgb3IgYmUgbGVmdCAnICtcclxuICAgICAgICAgICd1bmFsdGVyZWQnLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICd1bnRvdWNoZWQnLFxyXG4gICAgICAgIGVudW06IFsncmVsYXRpdml6ZWQnLCAnYWJzb2x1dGl6ZWQnLCAndW50b3VjaGVkJ10sXHJcbiAgICAgICAgb3JkZXI6IDE1LFxyXG4gICAgICB9LFxyXG4gICAgICBkZWZhdWx0U2F2ZUZvcm1hdDoge1xyXG4gICAgICAgIHRpdGxlOiAnRGVmYXVsdCBmb3JtYXQgdG8gc2F2ZSBhcycsXHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgb3JkZXI6IDIwLFxyXG4gICAgICAgIGVudW06IFsnaHRtbCcsICdwZGYnXSxcclxuICAgICAgICBkZWZhdWx0OiAnaHRtbCcsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgc3luY0NvbmZpZzoge1xyXG4gICAgdGl0bGU6ICdQcmV2aWV3IHBvc2l0aW9uIHN5bmNocm9uaXphdGlvbiBiZWhhdmlvdXInLFxyXG4gICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICBvcmRlcjogMjAsXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IHtcclxuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgaW4gZWRpdG9yIGNoYW5nZXMnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBvcmRlcjogMjgsXHJcbiAgICAgIH0sXHJcbiAgICAgIHN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGw6IHtcclxuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgZWRpdG9yIGlzIHNjcm9sbGVkJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdOb3RlOiBpZiBib3RoIHNjcm9sbCBzeW5jIG9wdGlvbnMgYXJlIGVuYWJsZWQsIHRoZSBlZGl0b3IgJyArXHJcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgIG9yZGVyOiAyOC4xLFxyXG4gICAgICB9LFxyXG4gICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiB7XHJcbiAgICAgICAgdGl0bGU6ICdTeW5jIGVkaXRvciBwb3NpdGlvbiB3aGVuIHByZXZpZXcgaXMgc2Nyb2xsZWQnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ05vdGU6IGlmIGJvdGggc2Nyb2xsIHN5bmMgb3B0aW9ucyBhcmUgZW5hYmxlZCwgdGhlIHByZXZpZXcgJyArXHJcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgIG9yZGVyOiAyOC4yLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG1hdGhDb25maWc6IHtcclxuICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgdGl0bGU6ICdNYXRoIE9wdGlvbnMnLFxyXG4gICAgb3JkZXI6IDMwLFxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDoge1xyXG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIE1hdGggUmVuZGVyaW5nIEJ5IERlZmF1bHQnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBvcmRlcjogMCxcclxuICAgICAgfSxcclxuICAgICAgbGF0ZXhSZW5kZXJlcjoge1xyXG4gICAgICAgIHRpdGxlOiAnTWF0aCBSZW5kZXJlcicsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnU1ZHIGlzIG5vdGljZWFibHkgZmFzdGVyLCBidXQgbWlnaHQgbG9vayB3b3JzZSBvbiBzb21lIHN5c3RlbXMnLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGVudW06IFsnSFRNTC1DU1MnLCAnU1ZHJ10sXHJcbiAgICAgICAgZGVmYXVsdDogJ1NWRycsXHJcbiAgICAgICAgb3JkZXI6IDUsXHJcbiAgICAgIH0sXHJcbiAgICAgIG51bWJlckVxdWF0aW9uczoge1xyXG4gICAgICAgIHRpdGxlOiAnTnVtYmVyIGVxdWF0aW9ucycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnTnVtYmVyIGVxdWF0aW9ucyB0aGF0IGFyZSBpbiBlcXVhdGlvbiBlbnZpcm9ubWVudCwgZXRjLiAnICtcclxuICAgICAgICAgICdXaWxsIHJlLXJlbmRlciBhbGwgbWF0aCBvbiBlYWNoIG1hdGggY2hhbmdlLCB3aGljaCBtaWdodCBiZSB1bmRlc2lyYWJsZS4nLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBvcmRlcjogMTAsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1qeEV4dGVuc2lvbnM6IHtcclxuICAgICAgICB0aXRsZTogJ01hdGhKYXggZXh0ZW5zaW9ucycsXHJcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICBkZWZhdWx0OiBbXHJcbiAgICAgICAgICAgICdBTVNtYXRoLmpzJyxcclxuICAgICAgICAgICAgJ0FNU3N5bWJvbHMuanMnLFxyXG4gICAgICAgICAgICAnbm9FcnJvcnMuanMnLFxyXG4gICAgICAgICAgICAnbm9VbmRlZmluZWQuanMnXHJcbiAgICAgICAgXSxcclxuICAgICAgICBvcmRlcjogMTUsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1qeFVuZGVmaW5lZEZhbWlseToge1xyXG4gICAgICAgIHRpdGxlOiAnTWF0aEpheCB1bmRlZmluZWQgZm9udCBmYW1pbHknLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ1NldHMgTWF0aEpheCB1bmRlZmluZWRGYW1pbHkgb3B0aW9uLicsXHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJ3NlcmlmJyxcclxuICAgICAgICBvcmRlcjogMjAsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgbWFya2Rvd25JdENvbmZpZzoge1xyXG4gICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICB0aXRsZTogJ01hcmtkb3duLUl0IFNldHRpbmdzJyxcclxuICAgIG9yZGVyOiA0MCxcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IHtcclxuICAgICAgICB0aXRsZTogJ0JyZWFrIG9uIHNpbmdsZSBuZXdsaW5lJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgb3JkZXI6IDAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHVzZUxhenlIZWFkZXJzOiB7XHJcbiAgICAgICAgdGl0bGU6ICdVc2UgTGF6eSBIZWFkZXJzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlcXVpcmUgbm8gc3BhY2UgYWZ0ZXIgaGVhZGluZ3MgIycsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgb3JkZXI6IDUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHVzZUNoZWNrQm94ZXM6IHtcclxuICAgICAgICB0aXRsZTogJ0VuYWJsZSBDaGVja0JveCBsaXN0cyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdDaGVja0JveCBsaXN0cywgbGlrZSBvbiBHaXRIdWInLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxyXG4gICAgICAgIG9yZGVyOiAxMCxcclxuICAgICAgfSxcclxuICAgICAgdXNlRW1vamk6IHtcclxuICAgICAgICB0aXRsZTogJ1VzZSBFbW9qaSB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbW9qaSByZW5kZXJpbmcnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxyXG4gICAgICAgIG9yZGVyOiAxNSxcclxuICAgICAgfSxcclxuICAgICAgdXNlVG9jOiB7XHJcbiAgICAgICAgdGl0bGU6ICdVc2UgdGFibGUgb2YgY29udGVudHMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZSBbW3RvY11dIHdpdGggYXV0b2dlbmVyYXRlZCB0YWJsZSBvZiBjb250ZW50cycsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgb3JkZXI6IDIwLFxyXG4gICAgICB9LFxyXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczoge1xyXG4gICAgICAgIHRpdGxlOiAnSW5saW5lIG1hdGggc2VwYXJhdG9ycycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnTGlzdCBvZiBpbmxpbmUgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXHJcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICBkZWZhdWx0OiBbJyQnLCAnJCcsICdcXFxcKCcsICdcXFxcKSddLFxyXG4gICAgICAgIG9yZGVyOiAyNSxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczoge1xyXG4gICAgICAgIHRpdGxlOiAnQmxvY2sgbWF0aCBzZXBhcmF0b3JzJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdMaXN0IG9mIGJsb2NrIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxyXG4gICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgZGVmYXVsdDogWyckJCcsICckJCcsICdcXFxcWycsICdcXFxcXSddLFxyXG4gICAgICAgIG9yZGVyOiAzMCxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwYW5kb2NDb25maWc6IHtcclxuICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgdGl0bGU6ICdQYW5kb2Mgc2V0dGluZ3MnLFxyXG4gICAgb3JkZXI6IDUwLFxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiB7XHJcbiAgICAgICAgdGl0bGU6ICdVc2UgbmF0aXZlIFBhbmRvYyBjb2RlIGJsb2NrIHN0eWxlJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICBcIkRvbid0IGNvbnZlcnQgZmVuY2VkIGNvZGUgYmxvY2tzIHRvIEF0b20gZWRpdG9ycyB3aGVuIHVzaW5nXCIgK1xyXG4gICAgICAgICAgJ1BhbmRvYyBwYXJzZXInLFxyXG4gICAgICAgIG9yZGVyOiAwLFxyXG4gICAgICB9LFxyXG4gICAgICBwYW5kb2NQYXRoOiB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJ3BhbmRvYycsXHJcbiAgICAgICAgdGl0bGU6ICdQYXRoIHRvIFBhbmRvYyBleGVjdXRhYmxlJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdQbGVhc2Ugc3BlY2lmeSB0aGUgY29ycmVjdCBwYXRoIHRvIHlvdXIgcGFuZG9jIGV4ZWN1dGFibGUsICcgK1xyXG4gICAgICAgICAgJ2ZvciBleGFtcGxlLCAvdXNyL2Jpbi9wYW5kb2MsIG9yIEM6XFxcXFByb2dyYW0gRmlsZXNcXFxcUGFuZG9jXFxcXHBhbmRvYy5leGUnLFxyXG4gICAgICAgIG9yZGVyOiA1LFxyXG4gICAgICB9LFxyXG4gICAgICBwYW5kb2NGaWx0ZXJzOiB7XHJcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICBkZWZhdWx0OiBbXSxcclxuICAgICAgICB0aXRsZTogJ0ZpbHRlcnMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgZmlsdGVycywgaW4gb3JkZXIgb2YgYXBwbGljYXRpb24uIFdpbGwgYmUgcGFzc2VkIHZpYSBjb21tYW5kLWxpbmUgYXJndW1lbnRzJyxcclxuICAgICAgICBvcmRlcjogMTAsXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY0FyZ3VtZW50czoge1xyXG4gICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgZGVmYXVsdDogW10sXHJcbiAgICAgICAgdGl0bGU6ICdDb21tYW5kbGluZSBBcmd1bWVudHMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgYXJndW1lbnRzIGUuZy4gYC0tc21hcnQsIC0tZmlsdGVyPS9iaW4vZXhlYC4gUGxlYXNlIHVzZSBsb25nIGFyZ3VtZW50IG5hbWVzLicsXHJcbiAgICAgICAgb3JkZXI6IDE1LFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjoge1xyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1yYXdfdGV4K3RleF9tYXRoX3NpbmdsZV9iYWNrc2xhc2gnLFxyXG4gICAgICAgIHRpdGxlOiAnTWFya2Rvd24gRmxhdm9yJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VudGVyIHRoZSBwYW5kb2MgbWFya2Rvd24gZmxhdm9yIHlvdSB3YW50JyxcclxuICAgICAgICBvcmRlcjogMjAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeToge1xyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICB0aXRsZTogJ0NpdGF0aW9ucyAodmlhIHBhbmRvYy1jaXRlcHJvYyknLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0VuYWJsZSB0aGlzIGZvciBiaWJsaW9ncmFwaHkgcGFyc2luZy4gJyArXHJcbiAgICAgICAgICAnTm90ZTogcGFuZG9jLWNpdGVwcm9jIGlzIGFwcGxpZWQgYWZ0ZXIgb3RoZXIgZmlsdGVycyBzcGVjaWZpZWQgaW4gJyArXHJcbiAgICAgICAgICAnRmlsdGVycywgYnV0IGJlZm9yZSBvdGhlciBjb21tYW5kbGluZSBhcmd1bWVudHMgJyxcclxuICAgICAgICBvcmRlcjogMjUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IHtcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICB0aXRsZTogJ1JlbW92ZSBSZWZlcmVuY2VzJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlbW92ZXMgcmVmZXJlbmNlcyBhdCB0aGUgZW5kIG9mIHRoZSBIVE1MIHByZXZpZXcnLFxyXG4gICAgICAgIG9yZGVyOiAzMCxcclxuICAgICAgfSxcclxuICAgICAgcGFuZG9jQklCRmlsZToge1xyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdiaWJsaW9ncmFwaHkuYmliJyxcclxuICAgICAgICB0aXRsZTogJ0JpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBiaWJmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxyXG4gICAgICAgIG9yZGVyOiAzNSxcclxuICAgICAgfSxcclxuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJycsXHJcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBiaWJmaWxlJyxcclxuICAgICAgICBvcmRlcjogNDAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY0NTTEZpbGU6IHtcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICBkZWZhdWx0OiAnY3VzdG9tLmNzbCcsXHJcbiAgICAgICAgdGl0bGU6ICdCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgY3NsZmlsZSB0byBzZWFyY2ggZm9yIHJlY3Vyc2l2ZWx5JyxcclxuICAgICAgICBvcmRlcjogNDUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazoge1xyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICcnLFxyXG4gICAgICAgIHRpdGxlOiAnRmFsbGJhY2sgQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgY3NsZmlsZScsXHJcbiAgICAgICAgb3JkZXI6IDUwLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59XHJcblxyXG4vLyBnZW5lcmF0ZWQgYnkgdHlwZWQtY29uZmlnLmpzXHJcbmRlY2xhcmUgbW9kdWxlICdhdG9tJyB7XHJcbiAgaW50ZXJmYWNlIENvbmZpZ1ZhbHVlcyB7XHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmdyYW1tYXJzJzogc3RyaW5nW11cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZXh0ZW5zaW9ucyc6IHN0cmluZ1tdXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5yZW5kZXJlcic6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmxpdmVVcGRhdGUnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcucHJldmlld1NwbGl0UGFuZURpcic6XHJcbiAgICAgIHwgJ2Rvd24nXHJcbiAgICAgIHwgJ3JpZ2h0J1xyXG4gICAgICB8ICdub25lJ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLnByZXZpZXdEb2NrJzpcclxuICAgICAgfCAnbGVmdCdcclxuICAgICAgfCAncmlnaHQnXHJcbiAgICAgIHwgJ2JvdHRvbSdcclxuICAgICAgfCAnY2VudGVyJ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLmNsb3NlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZyc6IHtcclxuICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxyXG4gICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXHJcbiAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xyXG4gICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXHJcbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cclxuICAgIH1cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5tZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cic6XHJcbiAgICAgIHwgJ3JlbGF0aXZpemVkJ1xyXG4gICAgICB8ICdhYnNvbHV0aXplZCdcclxuICAgICAgfCAndW50b3VjaGVkJ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLm1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyJzpcclxuICAgICAgfCAncmVsYXRpdml6ZWQnXHJcbiAgICAgIHwgJ2Fic29sdXRpemVkJ1xyXG4gICAgICB8ICd1bnRvdWNoZWQnXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuZGVmYXVsdFNhdmVGb3JtYXQnOiAnaHRtbCcgfCAncGRmJ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnJzoge1xyXG4gICAgICBtZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xyXG4gICAgICBtZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xyXG4gICAgICBkZWZhdWx0U2F2ZUZvcm1hdDogJ2h0bWwnIHwgJ3BkZidcclxuICAgIH1cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY0NvbmZpZy5zeW5jUHJldmlld09uQ2hhbmdlJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY0NvbmZpZyc6IHtcclxuICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZTogYm9vbGVhblxyXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXHJcbiAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IGJvb2xlYW5cclxuICAgIH1cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJzogJ0hUTUwtQ1NTJyB8ICdTVkcnXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubnVtYmVyRXF1YXRpb25zJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnJzoge1xyXG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxyXG4gICAgICBsYXRleFJlbmRlcmVyOiAnSFRNTC1DU1MnIHwgJ1NWRydcclxuICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXHJcbiAgICB9XHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlTGF6eUhlYWRlcnMnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VUb2MnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnJzoge1xyXG4gICAgICBicmVha09uU2luZ2xlTmV3bGluZTogYm9vbGVhblxyXG4gICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxyXG4gICAgICB1c2VDaGVja0JveGVzOiBib29sZWFuXHJcbiAgICAgIHVzZUVtb2ppOiBib29sZWFuXHJcbiAgICAgIHVzZVRvYzogYm9vbGVhblxyXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cclxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cclxuICAgIH1cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NQYXRoJzogc3RyaW5nXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NGaWx0ZXJzJzogc3RyaW5nW11cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NNYXJrZG93bkZsYXZvcic6IHN0cmluZ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQmlibGlvZ3JhcGh5JzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGUnOiBzdHJpbmdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGVGYWxsYmFjayc6IHN0cmluZ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZUZhbGxiYWNrJzogc3RyaW5nXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZyc6IHtcclxuICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczogYm9vbGVhblxyXG4gICAgICBwYW5kb2NQYXRoOiBzdHJpbmdcclxuICAgICAgcGFuZG9jRmlsdGVyczogc3RyaW5nW11cclxuICAgICAgcGFuZG9jQXJndW1lbnRzOiBzdHJpbmdbXVxyXG4gICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjogc3RyaW5nXHJcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeTogYm9vbGVhblxyXG4gICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiBib29sZWFuXHJcbiAgICAgIHBhbmRvY0JJQkZpbGU6IHN0cmluZ1xyXG4gICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHN0cmluZ1xyXG4gICAgICBwYW5kb2NDU0xGaWxlOiBzdHJpbmdcclxuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiBzdHJpbmdcclxuICAgIH1cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMnOiB7XHJcbiAgICAgIGdyYW1tYXJzOiBzdHJpbmdbXVxyXG4gICAgICBleHRlbnNpb25zOiBzdHJpbmdbXVxyXG4gICAgICB1c2VHaXRIdWJTdHlsZTogYm9vbGVhblxyXG4gICAgICByZW5kZXJlcjogJ21hcmtkb3duLWl0JyB8ICdwYW5kb2MnXHJcbiAgICAgICdwcmV2aWV3Q29uZmlnLmxpdmVVcGRhdGUnOiBib29sZWFuXHJcbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXHJcbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdEb2NrJzogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcidcclxuICAgICAgJ3ByZXZpZXdDb25maWcuY2xvc2VQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cclxuICAgICAgJ3ByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cclxuICAgICAgcHJldmlld0NvbmZpZzoge1xyXG4gICAgICAgIGxpdmVVcGRhdGU6IGJvb2xlYW5cclxuICAgICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXHJcbiAgICAgICAgcHJldmlld0RvY2s6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXHJcbiAgICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxyXG4gICAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cclxuICAgICAgfVxyXG4gICAgICAnc2F2ZUNvbmZpZy5tZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cic6XHJcbiAgICAgICAgfCAncmVsYXRpdml6ZWQnXHJcbiAgICAgICAgfCAnYWJzb2x1dGl6ZWQnXHJcbiAgICAgICAgfCAndW50b3VjaGVkJ1xyXG4gICAgICAnc2F2ZUNvbmZpZy5tZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cic6XHJcbiAgICAgICAgfCAncmVsYXRpdml6ZWQnXHJcbiAgICAgICAgfCAnYWJzb2x1dGl6ZWQnXHJcbiAgICAgICAgfCAndW50b3VjaGVkJ1xyXG4gICAgICAnc2F2ZUNvbmZpZy5kZWZhdWx0U2F2ZUZvcm1hdCc6ICdodG1sJyB8ICdwZGYnXHJcbiAgICAgIHNhdmVDb25maWc6IHtcclxuICAgICAgICBtZWRpYU9uU2F2ZUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xyXG4gICAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXHJcbiAgICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6ICdodG1sJyB8ICdwZGYnXHJcbiAgICAgIH1cclxuICAgICAgJ3N5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cclxuICAgICAgJ3N5bmNDb25maWcuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cclxuICAgICAgJ3N5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cclxuICAgICAgc3luY0NvbmZpZzoge1xyXG4gICAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IGJvb2xlYW5cclxuICAgICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXHJcbiAgICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDogYm9vbGVhblxyXG4gICAgICB9XHJcbiAgICAgICdtYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JzogYm9vbGVhblxyXG4gICAgICAnbWF0aENvbmZpZy5sYXRleFJlbmRlcmVyJzogJ0hUTUwtQ1NTJyB8ICdTVkcnXHJcbiAgICAgICdtYXRoQ29uZmlnLm51bWJlckVxdWF0aW9ucyc6IGJvb2xlYW5cclxuICAgICAgbWF0aENvbmZpZzoge1xyXG4gICAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiBib29sZWFuXHJcbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXHJcbiAgICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXHJcbiAgICAgIH1cclxuICAgICAgJ21hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXHJcbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxyXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VDaGVja0JveGVzJzogYm9vbGVhblxyXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cclxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlVG9jJzogYm9vbGVhblxyXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy5pbmxpbmVNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXHJcbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxyXG4gICAgICBtYXJrZG93bkl0Q29uZmlnOiB7XHJcbiAgICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cclxuICAgICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxyXG4gICAgICAgIHVzZUNoZWNrQm94ZXM6IGJvb2xlYW5cclxuICAgICAgICB1c2VFbW9qaTogYm9vbGVhblxyXG4gICAgICAgIHVzZVRvYzogYm9vbGVhblxyXG4gICAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxyXG4gICAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXHJcbiAgICAgIH1cclxuICAgICAgJ3BhbmRvY0NvbmZpZy51c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzJzogYm9vbGVhblxyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY1BhdGgnOiBzdHJpbmdcclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NGaWx0ZXJzJzogc3RyaW5nW11cclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NBcmd1bWVudHMnOiBzdHJpbmdbXVxyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY01hcmtkb3duRmxhdm9yJzogc3RyaW5nXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQmlibGlvZ3JhcGh5JzogYm9vbGVhblxyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY1JlbW92ZVJlZmVyZW5jZXMnOiBib29sZWFuXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQklCRmlsZSc6IHN0cmluZ1xyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGVGYWxsYmFjayc6IHN0cmluZ1xyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGUnOiBzdHJpbmdcclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlRmFsbGJhY2snOiBzdHJpbmdcclxuICAgICAgcGFuZG9jQ29uZmlnOiB7XHJcbiAgICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczogYm9vbGVhblxyXG4gICAgICAgIHBhbmRvY1BhdGg6IHN0cmluZ1xyXG4gICAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXHJcbiAgICAgICAgcGFuZG9jQXJndW1lbnRzOiBzdHJpbmdbXVxyXG4gICAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiBzdHJpbmdcclxuICAgICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cclxuICAgICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiBib29sZWFuXHJcbiAgICAgICAgcGFuZG9jQklCRmlsZTogc3RyaW5nXHJcbiAgICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcclxuICAgICAgICBwYW5kb2NDU0xGaWxlOiBzdHJpbmdcclxuICAgICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHN0cmluZ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==