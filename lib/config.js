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
                type: 'array',
                default: ['serif'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVhLFFBQUEsTUFBTSxHQUFZO0lBQzdCLFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1oseUJBQXlCO1NBQzFCO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkUsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsYUFBYTtRQUN0QixLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLElBQUksRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7UUFDL0IsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELGFBQWEsRUFBRTtRQUNiLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsS0FBSyxFQUFFLEVB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T0FBTyxFQUFFLFlBQVk7Z0JBQ3JCLEtBQUssRUFBRSw4QkFBOEI7Z0JBQ3JDLFdBQVcsRUFBRSwyQ0FBMkM7Z0JBQ3hELEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxxQkFBcUIsRUFBRTtnQkFDckIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLHVDQUF1QztnQkFDOUMsV0FBVyxFQUFFLCtCQUErQjtnQkFDNUMsS0FBSyxFQUFFLEVBQUU7YUFDVjtTQUNGO0tBQ0Y7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBJQ29uZmlnIHtcclxuICBba2V5OiBzdHJpbmddOiB7XHJcbiAgICB0aXRsZTogc3RyaW5nXHJcbiAgICBvcmRlcjogbnVtYmVyXHJcbiAgICB0eXBlOiBzdHJpbmdcclxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nXHJcbiAgICBwcm9wZXJ0aWVzPzogSUNvbmZpZ1xyXG4gICAgZGVmYXVsdD86IGFueVxyXG4gICAgZW51bT86IGFueVtdXHJcbiAgICBpdGVtcz86IHtcclxuICAgICAgdHlwZTogc3RyaW5nXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29uZmlnOiBJQ29uZmlnID0ge1xyXG4gIGdyYW1tYXJzOiB7XHJcbiAgICB0aXRsZTogJ01hcmtkb3duIEdyYW1tYXJzJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnRWRpdG9ycyB1c2luZyB3aGF0IGdyYW1tYXJzIGFyZSBjb25zaWRlcmVkIE1hcmtkb3duJyxcclxuICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICBkZWZhdWx0OiBbXHJcbiAgICAgICdzb3VyY2UuZ2ZtJyxcclxuICAgICAgJ3NvdXJjZS5saXRjb2ZmZWUnLFxyXG4gICAgICAndGV4dC5odG1sLmJhc2ljJyxcclxuICAgICAgJ3RleHQubWQnLFxyXG4gICAgICAndGV4dC5wbGFpbicsXHJcbiAgICAgICd0ZXh0LnBsYWluLm51bGwtZ3JhbW1hcicsXHJcbiAgICBdLFxyXG4gICAgb3JkZXI6IDAsXHJcbiAgICBpdGVtczoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBleHRlbnNpb25zOiB7XHJcbiAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgdGl0bGU6ICdNYXJrZG93biBmaWxlIGV4dGVuc2lvbnMnLFxyXG4gICAgZGVzY3JpcHRpb246ICdXaGljaCBmaWxlcyBhcmUgY29uc2lkZXJlZCBNYXJrZG93bicsXHJcbiAgICBkZWZhdWx0OiBbJ21hcmtkb3duJywgJ21kJywgJ21kb3duJywgJ21rZCcsICdta2Rvd24nLCAncm9uJywgJ3R4dCddLFxyXG4gICAgb3JkZXI6IDEsXHJcbiAgICBpdGVtczoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICB1c2VHaXRIdWJTdHlsZToge1xyXG4gICAgdGl0bGU6ICdVc2UgR2l0SHViLmNvbSBzdHlsZScsXHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgIG9yZGVyOiAyLFxyXG4gIH0sXHJcbiAgcmVuZGVyZXI6IHtcclxuICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgZGVmYXVsdDogJ21hcmtkb3duLWl0JyxcclxuICAgIHRpdGxlOiAnUmVuZGVyZXIgYmFja2VuZCcsXHJcbiAgICBlbnVtOiBbJ21hcmtkb3duLWl0JywgJ3BhbmRvYyddLFxyXG4gICAgb3JkZXI6IDMsXHJcbiAgfSxcclxuICBwcmV2aWV3Q29uZmlnOiB7XHJcbiAgICB0aXRsZTogJ1ByZXZpZXcgQmVoYXZpb3VyJyxcclxuICAgIG9yZGVyOiAxMCxcclxuICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICBsaXZlVXBkYXRlOiB7XHJcbiAgICAgICAgdGl0bGU6ICdMaXZlIFVwZGF0ZScsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgb3JkZXI6IDEwLFxyXG4gICAgICB9LFxyXG4gICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiB7XHJcbiAgICAgICAgdGl0bGU6ICdEaXJlY3Rpb24gdG8gbG9hZCB0aGUgcHJldmlldyBpbiBzcGxpdCBwYW5lJyxcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICBkZWZhdWx0OiAncmlnaHQnLFxyXG4gICAgICAgIGVudW06IFsnZG93bicsICdyaWdodCcsICdub25lJ10sXHJcbiAgICAgICAgb3JkZXI6IDIwLFxyXG4gICAgICB9LFxyXG4gICAgICBwcmV2aWV3RG9jazoge1xyXG4gICAgICAgIHRpdGxlOiAnT3BlbiBwcmV2aWV3IGluIGRvY2snLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdjZW50ZXInLFxyXG4gICAgICAgIGVudW06IFsnbGVmdCcsICdyaWdodCcsICdib3R0b20nLCAnY2VudGVyJ10sXHJcbiAgICAgICAgb3JkZXI6IDI1LFxyXG4gICAgICB9LFxyXG4gICAgICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiB7XHJcbiAgICAgICAgdGl0bGU6ICdDbG9zZSBwcmV2aWV3IHdoZW4gZWRpdG9yIGNsb3NlcycsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgb3JkZXI6IDI2LFxyXG4gICAgICB9LFxyXG4gICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiB7XHJcbiAgICAgICAgdGl0bGU6ICdCcmluZyB1cCBwcmV2aWV3IHdoZW4gZWRpdG9yIGFjdGl2YXRlcycsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgIG9yZGVyOiAyNyxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBzYXZlQ29uZmlnOiB7XHJcbiAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgIHRpdGxlOiAnRXhwb3J0IEJlaGF2aW91cicsXHJcbiAgICBvcmRlcjogMTUsXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiB7XHJcbiAgICAgICAgdGl0bGU6ICdXaGVuIHNhdmluZyBhcyBIVE1MLCBtZWRpYSBwYXRocyB3aWxsIGJlJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdNZWRpYSBpbmNsdWRlcyBpbWFnZXMsIGF1ZGlvIGFuZCB2aWRlby4gJyArXHJcbiAgICAgICAgICAncmVsYXRpdmUgc3JjIGF0dHJpYnV0ZXMgb2YgaW1nLCBhdWRpbywgdmlkZW8gdGFncyBjYW4gZWl0aGVyIGJlIHJld3JpdHRlbiAnICtcclxuICAgICAgICAgICd0byB1c2UgYWJzb2x1dGUgZmlsZSBwYXRocywgcGF0aHMgcmVsYXRpdmUgdG8gc2F2ZSBsb2NhdGlvbiwgb3IgYmUgbGVmdCAnICtcclxuICAgICAgICAgICd1bmFsdGVyZWQnLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdyZWxhdGl2aXplZCcsXHJcbiAgICAgICAgZW51bTogWydyZWxhdGl2aXplZCcsICdhYnNvbHV0aXplZCcsICd1bnRvdWNoZWQnXSxcclxuICAgICAgICBvcmRlcjogMTAsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiB7XHJcbiAgICAgICAgdGl0bGU6ICdXaGVuIGNvcHlpbmcgYXMgSFRNTCwgbWVkaWEgcGF0aHMgd2lsbCBiZScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnTWVkaWEgaW5jbHVkZXMgaW1hZ2VzLCBhdWRpbyBhbmQgdmlkZW8uICcgK1xyXG4gICAgICAgICAgJ3JlbGF0aXZlIHNyYyBhdHRyaWJ1dGVzIG9mIGltZywgYXVkaW8sIHZpZGVvIHRhZ3MgY2FuIGVpdGhlciBiZSByZXdyaXR0ZW4gJyArXHJcbiAgICAgICAgICAndG8gdXNlIGFic29sdXRlIGZpbGUgcGF0aHMsIHBhdGhzIHJlbGF0aXZlIHRvIHNhdmUgbG9jYXRpb24sIG9yIGJlIGxlZnQgJyArXHJcbiAgICAgICAgICAndW5hbHRlcmVkJyxcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICBkZWZhdWx0OiAndW50b3VjaGVkJyxcclxuICAgICAgICBlbnVtOiBbJ3JlbGF0aXZpemVkJywgJ2Fic29sdXRpemVkJywgJ3VudG91Y2hlZCddLFxyXG4gICAgICAgIG9yZGVyOiAxNSxcclxuICAgICAgfSxcclxuICAgICAgZGVmYXVsdFNhdmVGb3JtYXQ6IHtcclxuICAgICAgICB0aXRsZTogJ0RlZmF1bHQgZm9ybWF0IHRvIHNhdmUgYXMnLFxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIG9yZGVyOiAyMCxcclxuICAgICAgICBlbnVtOiBbJ2h0bWwnLCAncGRmJ10sXHJcbiAgICAgICAgZGVmYXVsdDogJ2h0bWwnLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHN5bmNDb25maWc6IHtcclxuICAgIHRpdGxlOiAnUHJldmlldyBwb3NpdGlvbiBzeW5jaHJvbml6YXRpb24gYmVoYXZpb3VyJyxcclxuICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgb3JkZXI6IDIwLFxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiB7XHJcbiAgICAgICAgdGl0bGU6ICdTeW5jIHByZXZpZXcgcG9zaXRpb24gd2hlbiB0ZXh0IGluIGVkaXRvciBjaGFuZ2VzJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgb3JkZXI6IDI4LFxyXG4gICAgICB9LFxyXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiB7XHJcbiAgICAgICAgdGl0bGU6ICdTeW5jIHByZXZpZXcgcG9zaXRpb24gd2hlbiB0ZXh0IGVkaXRvciBpcyBzY3JvbGxlZCcsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnTm90ZTogaWYgYm90aCBzY3JvbGwgc3luYyBvcHRpb25zIGFyZSBlbmFibGVkLCB0aGUgZWRpdG9yICcgK1xyXG4gICAgICAgICAgJ2hhcyB0byBiZSBpbiBhY3RpdmUgcGFuZSBmb3IgdGhpcyBvcHRpb24gdG8gdGFrZSBlZmZlY3QnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBvcmRlcjogMjguMSxcclxuICAgICAgfSxcclxuICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDoge1xyXG4gICAgICAgIHRpdGxlOiAnU3luYyBlZGl0b3IgcG9zaXRpb24gd2hlbiBwcmV2aWV3IGlzIHNjcm9sbGVkJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdOb3RlOiBpZiBib3RoIHNjcm9sbCBzeW5jIG9wdGlvbnMgYXJlIGVuYWJsZWQsIHRoZSBwcmV2aWV3ICcgK1xyXG4gICAgICAgICAgJ2hhcyB0byBiZSBpbiBhY3RpdmUgcGFuZSBmb3IgdGhpcyBvcHRpb24gdG8gdGFrZSBlZmZlY3QnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBvcmRlcjogMjguMixcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBtYXRoQ29uZmlnOiB7XHJcbiAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgIHRpdGxlOiAnTWF0aCBPcHRpb25zJyxcclxuICAgIG9yZGVyOiAzMCxcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IHtcclxuICAgICAgICB0aXRsZTogJ0VuYWJsZSBNYXRoIFJlbmRlcmluZyBCeSBEZWZhdWx0JyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgb3JkZXI6IDAsXHJcbiAgICAgIH0sXHJcbiAgICAgIGxhdGV4UmVuZGVyZXI6IHtcclxuICAgICAgICB0aXRsZTogJ01hdGggUmVuZGVyZXInLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ1NWRyBpcyBub3RpY2VhYmx5IGZhc3RlciwgYnV0IG1pZ2h0IGxvb2sgd29yc2Ugb24gc29tZSBzeXN0ZW1zJyxcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICBlbnVtOiBbJ0hUTUwtQ1NTJywgJ1NWRyddLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdTVkcnLFxyXG4gICAgICAgIG9yZGVyOiA1LFxyXG4gICAgICB9LFxyXG4gICAgICBudW1iZXJFcXVhdGlvbnM6IHtcclxuICAgICAgICB0aXRsZTogJ051bWJlciBlcXVhdGlvbnMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ051bWJlciBlcXVhdGlvbnMgdGhhdCBhcmUgaW4gZXF1YXRpb24gZW52aXJvbm1lbnQsIGV0Yy4gJyArXHJcbiAgICAgICAgICAnV2lsbCByZS1yZW5kZXIgYWxsIG1hdGggb24gZWFjaCBtYXRoIGNoYW5nZSwgd2hpY2ggbWlnaHQgYmUgdW5kZXNpcmFibGUuJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgb3JkZXI6IDEwLFxyXG4gICAgICB9LFxyXG4gICAgICBtanhFeHRlbnNpb25zOiB7XHJcbiAgICAgICAgdGl0bGU6ICdNYXRoSmF4IGV4dGVuc2lvbnMnLFxyXG4gICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgZGVmYXVsdDogW1xyXG4gICAgICAgICAgICAnQU1TbWF0aC5qcycsXHJcbiAgICAgICAgICAgICdBTVNzeW1ib2xzLmpzJyxcclxuICAgICAgICAgICAgJ25vRXJyb3JzLmpzJyxcclxuICAgICAgICAgICAgJ25vVW5kZWZpbmVkLmpzJ1xyXG4gICAgICAgIF0sXHJcbiAgICAgICAgb3JkZXI6IDE1LFxyXG4gICAgICB9LFxyXG4gICAgICBtanhVbmRlZmluZWRGYW1pbHk6IHtcclxuICAgICAgICB0aXRsZTogJ01hdGhKYXggdW5kZWZpbmVkIGZvbnQgZmFtaWx5JyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdTZXRzIE1hdGhKYXggdW5kZWZpbmVkRmFtaWx5IG9wdGlvbi4nLFxyXG4gICAgICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICAgICAgZGVmYXVsdDogWydzZXJpZiddLFxyXG4gICAgICAgIG9yZGVyOiAyMCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBtYXJrZG93bkl0Q29uZmlnOiB7XHJcbiAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgIHRpdGxlOiAnTWFya2Rvd24tSXQgU2V0dGluZ3MnLFxyXG4gICAgb3JkZXI6IDQwLFxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICBicmVha09uU2luZ2xlTmV3bGluZToge1xyXG4gICAgICAgIHRpdGxlOiAnQnJlYWsgb24gc2luZ2xlIG5ld2xpbmUnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBvcmRlcjogMCxcclxuICAgICAgfSxcclxuICAgICAgdXNlTGF6eUhlYWRlcnM6IHtcclxuICAgICAgICB0aXRsZTogJ1VzZSBMYXp5IEhlYWRlcnMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVxdWlyZSBubyBzcGFjZSBhZnRlciBoZWFkaW5ncyAjJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICBvcmRlcjogNSxcclxuICAgICAgfSxcclxuICAgICAgdXNlQ2hlY2tCb3hlczoge1xyXG4gICAgICAgIHRpdGxlOiAnRW5hYmxlIENoZWNrQm94IGxpc3RzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ0NoZWNrQm94IGxpc3RzLCBsaWtlIG9uIEdpdEh1YicsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgb3JkZXI6IDEwLFxyXG4gICAgICB9LFxyXG4gICAgICB1c2VFbW9qaToge1xyXG4gICAgICAgIHRpdGxlOiAnVXNlIEVtb2ppIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Vtb2ppIHJlbmRlcmluZycsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgb3JkZXI6IDE1LFxyXG4gICAgICB9LFxyXG4gICAgICB1c2VUb2M6IHtcclxuICAgICAgICB0aXRsZTogJ1VzZSB0YWJsZSBvZiBjb250ZW50cyB3aXRoIG1hcmtkb3duLWl0IHBhcnNlcicsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXBsYWNlIFtbdG9jXV0gd2l0aCBhdXRvZ2VuZXJhdGVkIHRhYmxlIG9mIGNvbnRlbnRzJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICBvcmRlcjogMjAsXHJcbiAgICAgIH0sXHJcbiAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiB7XHJcbiAgICAgICAgdGl0bGU6ICdJbmxpbmUgbWF0aCBzZXBhcmF0b3JzJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgICdMaXN0IG9mIGlubGluZSBtYXRoIHNlcGFyYXRvcnMgaW4gcGFpcnMgLS0gZmlyc3Qgb3BlbmluZywgdGhlbiBjbG9zaW5nJyxcclxuICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgIGRlZmF1bHQ6IFsnJCcsICckJywgJ1xcXFwoJywgJ1xcXFwpJ10sXHJcbiAgICAgICAgb3JkZXI6IDI1LFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiB7XHJcbiAgICAgICAgdGl0bGU6ICdCbG9jayBtYXRoIHNlcGFyYXRvcnMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ0xpc3Qgb2YgYmxvY2sgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXHJcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICBkZWZhdWx0OiBbJyQkJywgJyQkJywgJ1xcXFxbJywgJ1xcXFxdJ10sXHJcbiAgICAgICAgb3JkZXI6IDMwLFxyXG4gICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBhbmRvY0NvbmZpZzoge1xyXG4gICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICB0aXRsZTogJ1BhbmRvYyBzZXR0aW5ncycsXHJcbiAgICBvcmRlcjogNTAsXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IHtcclxuICAgICAgICB0aXRsZTogJ1VzZSBuYXRpdmUgUGFuZG9jIGNvZGUgYmxvY2sgc3R5bGUnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICBkZXNjcmlwdGlvbjpcclxuICAgICAgICAgIFwiRG9uJ3QgY29udmVydCBmZW5jZWQgY29kZSBibG9ja3MgdG8gQXRvbSBlZGl0b3JzIHdoZW4gdXNpbmdcIiArXHJcbiAgICAgICAgICAnUGFuZG9jIHBhcnNlcicsXHJcbiAgICAgICAgb3JkZXI6IDAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY1BhdGg6IHtcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICBkZWZhdWx0OiAncGFuZG9jJyxcclxuICAgICAgICB0aXRsZTogJ1BhdGggdG8gUGFuZG9jIGV4ZWN1dGFibGUnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgJ1BsZWFzZSBzcGVjaWZ5IHRoZSBjb3JyZWN0IHBhdGggdG8geW91ciBwYW5kb2MgZXhlY3V0YWJsZSwgJyArXHJcbiAgICAgICAgICAnZm9yIGV4YW1wbGUsIC91c3IvYmluL3BhbmRvYywgb3IgQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxQYW5kb2NcXFxccGFuZG9jLmV4ZScsXHJcbiAgICAgICAgb3JkZXI6IDUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY0ZpbHRlcnM6IHtcclxuICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgIGRlZmF1bHQ6IFtdLFxyXG4gICAgICAgIHRpdGxlOiAnRmlsdGVycycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBmaWx0ZXJzLCBpbiBvcmRlciBvZiBhcHBsaWNhdGlvbi4gV2lsbCBiZSBwYXNzZWQgdmlhIGNvbW1hbmQtbGluZSBhcmd1bWVudHMnLFxyXG4gICAgICAgIG9yZGVyOiAxMCxcclxuICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgcGFuZG9jQXJndW1lbnRzOiB7XHJcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICBkZWZhdWx0OiBbXSxcclxuICAgICAgICB0aXRsZTogJ0NvbW1hbmRsaW5lIEFyZ3VtZW50cycsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBhcmd1bWVudHMgZS5nLiBgLS1zbWFydCwgLS1maWx0ZXI9L2Jpbi9leGVgLiBQbGVhc2UgdXNlIGxvbmcgYXJndW1lbnQgbmFtZXMuJyxcclxuICAgICAgICBvcmRlcjogMTUsXHJcbiAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJ21hcmtkb3duLXJhd190ZXgrdGV4X21hdGhfc2luZ2xlX2JhY2tzbGFzaCcsXHJcbiAgICAgICAgdGl0bGU6ICdNYXJrZG93biBGbGF2b3InLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW50ZXIgdGhlIHBhbmRvYyBtYXJrZG93biBmbGF2b3IgeW91IHdhbnQnLFxyXG4gICAgICAgIG9yZGVyOiAyMCxcclxuICAgICAgfSxcclxuICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiB7XHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgIHRpdGxlOiAnQ2l0YXRpb25zICh2aWEgcGFuZG9jLWNpdGVwcm9jKScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246XHJcbiAgICAgICAgICAnRW5hYmxlIHRoaXMgZm9yIGJpYmxpb2dyYXBoeSBwYXJzaW5nLiAnICtcclxuICAgICAgICAgICdOb3RlOiBwYW5kb2MtY2l0ZXByb2MgaXMgYXBwbGllZCBhZnRlciBvdGhlciBmaWx0ZXJzIHNwZWNpZmllZCBpbiAnICtcclxuICAgICAgICAgICdGaWx0ZXJzLCBidXQgYmVmb3JlIG90aGVyIGNvbW1hbmRsaW5lIGFyZ3VtZW50cyAnLFxyXG4gICAgICAgIG9yZGVyOiAyNSxcclxuICAgICAgfSxcclxuICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczoge1xyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxyXG4gICAgICAgIHRpdGxlOiAnUmVtb3ZlIFJlZmVyZW5jZXMnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlldycsXHJcbiAgICAgICAgb3JkZXI6IDMwLFxyXG4gICAgICB9LFxyXG4gICAgICBwYW5kb2NCSUJGaWxlOiB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJ2JpYmxpb2dyYXBoeS5iaWInLFxyXG4gICAgICAgIHRpdGxlOiAnQmlibGlvZ3JhcGh5IChiaWJmaWxlKScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGJpYmZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseScsXHJcbiAgICAgICAgb3JkZXI6IDM1LFxyXG4gICAgICB9LFxyXG4gICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHtcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICB0aXRsZTogJ0ZhbGxiYWNrIEJpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRnVsbCBwYXRoIHRvIGZhbGxiYWNrIGJpYmZpbGUnLFxyXG4gICAgICAgIG9yZGVyOiA0MCxcclxuICAgICAgfSxcclxuICAgICAgcGFuZG9jQ1NMRmlsZToge1xyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgIGRlZmF1bHQ6ICdjdXN0b20uY3NsJyxcclxuICAgICAgICB0aXRsZTogJ0JpYmxpb2dyYXBoeSBTdHlsZSAoY3NsZmlsZSknLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBjc2xmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxyXG4gICAgICAgIG9yZGVyOiA0NSxcclxuICAgICAgfSxcclxuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiB7XHJcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgZGVmYXVsdDogJycsXHJcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBjc2xmaWxlJyxcclxuICAgICAgICBvcmRlcjogNTAsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn1cclxuXHJcbi8vIGdlbmVyYXRlZCBieSB0eXBlZC1jb25maWcuanNcclxuZGVjbGFyZSBtb2R1bGUgJ2F0b20nIHtcclxuICBpbnRlcmZhY2UgQ29uZmlnVmFsdWVzIHtcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZ3JhbW1hcnMnOiBzdHJpbmdbXVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJzogc3RyaW5nW11cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnJlbmRlcmVyJzogJ21hcmtkb3duLWl0JyB8ICdwYW5kb2MnXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcubGl2ZVVwZGF0ZSc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyJzpcclxuICAgICAgfCAnZG93bidcclxuICAgICAgfCAncmlnaHQnXHJcbiAgICAgIHwgJ25vbmUnXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcucHJldmlld0RvY2snOlxyXG4gICAgICB8ICdsZWZ0J1xyXG4gICAgICB8ICdyaWdodCdcclxuICAgICAgfCAnYm90dG9tJ1xyXG4gICAgICB8ICdjZW50ZXInXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcuY2xvc2VQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5hY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnJzoge1xyXG4gICAgICBsaXZlVXBkYXRlOiBib29sZWFuXHJcbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6ICdkb3duJyB8ICdyaWdodCcgfCAnbm9uZSdcclxuICAgICAgcHJldmlld0RvY2s6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXHJcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cclxuICAgICAgYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxyXG4gICAgfVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLm1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyJzpcclxuICAgICAgfCAncmVsYXRpdml6ZWQnXHJcbiAgICAgIHwgJ2Fic29sdXRpemVkJ1xyXG4gICAgICB8ICd1bnRvdWNoZWQnXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOlxyXG4gICAgICB8ICdyZWxhdGl2aXplZCdcclxuICAgICAgfCAnYWJzb2x1dGl6ZWQnXHJcbiAgICAgIHwgJ3VudG91Y2hlZCdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc2F2ZUNvbmZpZy5kZWZhdWx0U2F2ZUZvcm1hdCc6ICdodG1sJyB8ICdwZGYnXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcnOiB7XHJcbiAgICAgIG1lZGlhT25TYXZlQXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXHJcbiAgICAgIG1lZGlhT25Db3B5QXNIVE1MQmVoYXZpb3VyOiAncmVsYXRpdml6ZWQnIHwgJ2Fic29sdXRpemVkJyB8ICd1bnRvdWNoZWQnXHJcbiAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiAnaHRtbCcgfCAncGRmJ1xyXG4gICAgfVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25DaGFuZ2UnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY0NvbmZpZy5zeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jQ29uZmlnJzoge1xyXG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXHJcbiAgICAgIHN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGw6IGJvb2xlYW5cclxuICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDogYm9vbGVhblxyXG4gICAgfVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnLmxhdGV4UmVuZGVyZXInOiAnSFRNTC1DU1MnIHwgJ1NWRydcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcnOiB7XHJcbiAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiBib29sZWFuXHJcbiAgICAgIGxhdGV4UmVuZGVyZXI6ICdIVE1MLUNTUycgfCAnU1ZHJ1xyXG4gICAgICBudW1iZXJFcXVhdGlvbnM6IGJvb2xlYW5cclxuICAgICAgbWp4RXh0ZW5zaW9uczogc3RyaW5nW11cclxuICAgICAgbWp4VW5kZWZpbmVkRmFtaWx5OiBzdHJpbmdbXVxyXG4gICAgfVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUNoZWNrQm94ZXMnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlRW1vamknOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlVG9jJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy5ibG9ja01hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZyc6IHtcclxuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cclxuICAgICAgdXNlTGF6eUhlYWRlcnM6IGJvb2xlYW5cclxuICAgICAgdXNlQ2hlY2tCb3hlczogYm9vbGVhblxyXG4gICAgICB1c2VFbW9qaTogYm9vbGVhblxyXG4gICAgICB1c2VUb2M6IGJvb2xlYW5cclxuICAgICAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXHJcbiAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXHJcbiAgICB9XHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy51c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzJzogYm9vbGVhblxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jRmlsdGVycyc6IHN0cmluZ1tdXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NBcmd1bWVudHMnOiBzdHJpbmdbXVxyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeSc6IGJvb2xlYW5cclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY1JlbW92ZVJlZmVyZW5jZXMnOiBib29sZWFuXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlRmFsbGJhY2snOiBzdHJpbmdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGUnOiBzdHJpbmdcclxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xyXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcnOiB7XHJcbiAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cclxuICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXHJcbiAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXHJcbiAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cclxuICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xyXG4gICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cclxuICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxyXG4gICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcclxuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcclxuICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXHJcbiAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXHJcbiAgICB9XHJcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzJzoge1xyXG4gICAgICBncmFtbWFyczogc3RyaW5nW11cclxuICAgICAgZXh0ZW5zaW9uczogc3RyaW5nW11cclxuICAgICAgdXNlR2l0SHViU3R5bGU6IGJvb2xlYW5cclxuICAgICAgcmVuZGVyZXI6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xyXG4gICAgICAncHJldmlld0NvbmZpZy5saXZlVXBkYXRlJzogYm9vbGVhblxyXG4gICAgICAncHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyJzogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xyXG4gICAgICAncHJldmlld0NvbmZpZy5wcmV2aWV3RG9jayc6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXHJcbiAgICAgICdwcmV2aWV3Q29uZmlnLmNsb3NlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXHJcbiAgICAgICdwcmV2aWV3Q29uZmlnLmFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXHJcbiAgICAgIHByZXZpZXdDb25maWc6IHtcclxuICAgICAgICBsaXZlVXBkYXRlOiBib29sZWFuXHJcbiAgICAgICAgcHJldmlld1NwbGl0UGFuZURpcjogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xyXG4gICAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xyXG4gICAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cclxuICAgICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXHJcbiAgICAgIH1cclxuICAgICAgJ3NhdmVDb25maWcubWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXInOlxyXG4gICAgICAgIHwgJ3JlbGF0aXZpemVkJ1xyXG4gICAgICAgIHwgJ2Fic29sdXRpemVkJ1xyXG4gICAgICAgIHwgJ3VudG91Y2hlZCdcclxuICAgICAgJ3NhdmVDb25maWcubWVkaWFPbkNvcHlBc0hUTUxCZWhhdmlvdXInOlxyXG4gICAgICAgIHwgJ3JlbGF0aXZpemVkJ1xyXG4gICAgICAgIHwgJ2Fic29sdXRpemVkJ1xyXG4gICAgICAgIHwgJ3VudG91Y2hlZCdcclxuICAgICAgJ3NhdmVDb25maWcuZGVmYXVsdFNhdmVGb3JtYXQnOiAnaHRtbCcgfCAncGRmJ1xyXG4gICAgICBzYXZlQ29uZmlnOiB7XHJcbiAgICAgICAgbWVkaWFPblNhdmVBc0hUTUxCZWhhdmlvdXI6ICdyZWxhdGl2aXplZCcgfCAnYWJzb2x1dGl6ZWQnIHwgJ3VudG91Y2hlZCdcclxuICAgICAgICBtZWRpYU9uQ29weUFzSFRNTEJlaGF2aW91cjogJ3JlbGF0aXZpemVkJyB8ICdhYnNvbHV0aXplZCcgfCAndW50b3VjaGVkJ1xyXG4gICAgICAgIGRlZmF1bHRTYXZlRm9ybWF0OiAnaHRtbCcgfCAncGRmJ1xyXG4gICAgICB9XHJcbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25DaGFuZ2UnOiBib29sZWFuXHJcbiAgICAgICdzeW5jQ29uZmlnLnN5bmNQcmV2aWV3T25FZGl0b3JTY3JvbGwnOiBib29sZWFuXHJcbiAgICAgICdzeW5jQ29uZmlnLnN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGwnOiBib29sZWFuXHJcbiAgICAgIHN5bmNDb25maWc6IHtcclxuICAgICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXHJcbiAgICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDogYm9vbGVhblxyXG4gICAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IGJvb2xlYW5cclxuICAgICAgfVxyXG4gICAgICAnbWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cclxuICAgICAgJ21hdGhDb25maWcubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xyXG4gICAgICAnbWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXHJcbiAgICAgIG1hdGhDb25maWc6IHtcclxuICAgICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDogYm9vbGVhblxyXG4gICAgICAgIGxhdGV4UmVuZGVyZXI6ICdIVE1MLUNTUycgfCAnU1ZHJ1xyXG4gICAgICAgIG51bWJlckVxdWF0aW9uczogYm9vbGVhblxyXG4gICAgICAgIG1qeEV4dGVuc2lvbnM6IHN0cmluZ1tdXHJcbiAgICAgICAgbWp4VW5kZWZpbmVkRmFtaWx5OiBzdHJpbmdbXVxyXG4gICAgICB9XHJcbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmJyZWFrT25TaW5nbGVOZXdsaW5lJzogYm9vbGVhblxyXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VMYXp5SGVhZGVycyc6IGJvb2xlYW5cclxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cclxuICAgICAgJ21hcmtkb3duSXRDb25maWcudXNlRW1vamknOiBib29sZWFuXHJcbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZVRvYyc6IGJvb2xlYW5cclxuICAgICAgJ21hcmtkb3duSXRDb25maWcuaW5saW5lTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxyXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy5ibG9ja01hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cclxuICAgICAgbWFya2Rvd25JdENvbmZpZzoge1xyXG4gICAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiBib29sZWFuXHJcbiAgICAgICAgdXNlTGF6eUhlYWRlcnM6IGJvb2xlYW5cclxuICAgICAgICB1c2VDaGVja0JveGVzOiBib29sZWFuXHJcbiAgICAgICAgdXNlRW1vamk6IGJvb2xlYW5cclxuICAgICAgICB1c2VUb2M6IGJvb2xlYW5cclxuICAgICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cclxuICAgICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxyXG4gICAgICB9XHJcbiAgICAgICdwYW5kb2NDb25maWcudXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlcyc6IGJvb2xlYW5cclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NQYXRoJzogc3RyaW5nXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jRmlsdGVycyc6IHN0cmluZ1tdXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQXJndW1lbnRzJzogc3RyaW5nW11cclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NNYXJrZG93bkZsYXZvcic6IHN0cmluZ1xyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeSc6IGJvb2xlYW5cclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzJzogYm9vbGVhblxyXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGUnOiBzdHJpbmdcclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlRmFsbGJhY2snOiBzdHJpbmdcclxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlJzogc3RyaW5nXHJcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZUZhbGxiYWNrJzogc3RyaW5nXHJcbiAgICAgIHBhbmRvY0NvbmZpZzoge1xyXG4gICAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cclxuICAgICAgICBwYW5kb2NQYXRoOiBzdHJpbmdcclxuICAgICAgICBwYW5kb2NGaWx0ZXJzOiBzdHJpbmdbXVxyXG4gICAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cclxuICAgICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjogc3RyaW5nXHJcbiAgICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiBib29sZWFuXHJcbiAgICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxyXG4gICAgICAgIHBhbmRvY0JJQkZpbGU6IHN0cmluZ1xyXG4gICAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazogc3RyaW5nXHJcbiAgICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXHJcbiAgICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiBzdHJpbmdcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=