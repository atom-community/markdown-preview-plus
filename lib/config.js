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
            relativizeMediaOnSave: {
                title: 'Relativize media paths when saved as HTML',
                type: 'boolean',
                default: true,
                order: 15,
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
                description: `\
    Don't convert fenced code blocks to Atom editors when using
    Pandoc parser`,
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
                title: 'Citations',
                description: `\
    Enable this for bibliography parsing.
    Note: pandoc-citeproc is applied after other filters specified in
    Filters, but before other commandline arguments\
    `,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWVhLFFBQUEsTUFBTSxHQUFZO0lBQzdCLFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1oseUJBQXlCO1NBQzFCO1FBQ0QsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSwwQkFBMEI7UUFDakMsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkUsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsYUFBeUM7UUFDbEQsS0FBSyxFQUFFLGtCQUFrQjtRQUN6QixJQUFJLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO1FBQy9CLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRCxhQUFhLEVBQUU7UUFDYixLQUFLLEVBQUUsbUJBQW1CO1FBQzFCLEtBQUssRUFBRSxF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QkFBOEI7Z0JBQ3JDLFdBQVcsRUFBRSwyQ0FBMkM7Z0JBQ3hELEtBQUssRUFBRSxFQUFFO2FBQ1Y7WUFDRCxxQkFBcUIsRUFBRTtnQkFDckIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLHVDQUF1QztnQkFDOUMsV0FBVyxFQUFFLCtCQUErQjtnQkFDNUMsS0FBSyxFQUFFLEVBQUU7YUFDVjtTQUNGO0tBQ0Y7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBJQ29uZmlnIHtcbiAgW2tleTogc3RyaW5nXToge1xuICAgIHRpdGxlOiBzdHJpbmdcbiAgICBvcmRlcjogbnVtYmVyXG4gICAgdHlwZTogc3RyaW5nXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmdcbiAgICBwcm9wZXJ0aWVzPzogSUNvbmZpZ1xuICAgIGRlZmF1bHQ/OiBhbnlcbiAgICBlbnVtPzogYW55W11cbiAgICBpdGVtcz86IHtcbiAgICAgIHR5cGU6IHN0cmluZ1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY29uZmlnOiBJQ29uZmlnID0ge1xuICBncmFtbWFyczoge1xuICAgIHRpdGxlOiAnTWFya2Rvd24gR3JhbW1hcnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnRWRpdG9ycyB1c2luZyB3aGF0IGdyYW1tYXJzIGFyZSBjb25zaWRlcmVkIE1hcmtkb3duJyxcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGRlZmF1bHQ6IFtcbiAgICAgICdzb3VyY2UuZ2ZtJyxcbiAgICAgICdzb3VyY2UubGl0Y29mZmVlJyxcbiAgICAgICd0ZXh0Lmh0bWwuYmFzaWMnLFxuICAgICAgJ3RleHQubWQnLFxuICAgICAgJ3RleHQucGxhaW4nLFxuICAgICAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJyxcbiAgICBdLFxuICAgIG9yZGVyOiAwLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBleHRlbnNpb25zOiB7XG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICB0aXRsZTogJ01hcmtkb3duIGZpbGUgZXh0ZW5zaW9ucycsXG4gICAgZGVzY3JpcHRpb246ICdXaGljaCBmaWxlcyBhcmUgY29uc2lkZXJlZCBNYXJrZG93bicsXG4gICAgZGVmYXVsdDogWydtYXJrZG93bicsICdtZCcsICdtZG93bicsICdta2QnLCAnbWtkb3duJywgJ3JvbicsICd0eHQnXSxcbiAgICBvcmRlcjogMSxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgdXNlR2l0SHViU3R5bGU6IHtcbiAgICB0aXRsZTogJ1VzZSBHaXRIdWIuY29tIHN0eWxlJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDIsXG4gIH0sXG4gIHJlbmRlcmVyOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ21hcmtkb3duLWl0JyBhcyAnbWFya2Rvd24taXQnIHwgJ3BhbmRvYycsXG4gICAgdGl0bGU6ICdSZW5kZXJlciBiYWNrZW5kJyxcbiAgICBlbnVtOiBbJ21hcmtkb3duLWl0JywgJ3BhbmRvYyddLFxuICAgIG9yZGVyOiAzLFxuICB9LFxuICBwcmV2aWV3Q29uZmlnOiB7XG4gICAgdGl0bGU6ICdQcmV2aWV3IEJlaGF2aW91cicsXG4gICAgb3JkZXI6IDEwLFxuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGxpdmVVcGRhdGU6IHtcbiAgICAgICAgdGl0bGU6ICdMaXZlIFVwZGF0ZScsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIHJlbGF0aXZpemVNZWRpYU9uU2F2ZToge1xuICAgICAgICB0aXRsZTogJ1JlbGF0aXZpemUgbWVkaWEgcGF0aHMgd2hlbiBzYXZlZCBhcyBIVE1MJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBvcmRlcjogMTUsXG4gICAgICB9LFxuICAgICAgcHJldmlld1NwbGl0UGFuZURpcjoge1xuICAgICAgICB0aXRsZTogJ0RpcmVjdGlvbiB0byBsb2FkIHRoZSBwcmV2aWV3IGluIHNwbGl0IHBhbmUnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ3JpZ2h0JyBhcyAncmlnaHQnIHwgJ2Rvd24nIHwgJ25vbmUnLFxuICAgICAgICBlbnVtOiBbJ2Rvd24nLCAncmlnaHQnLCAnbm9uZSddLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICB9LFxuICAgICAgcHJldmlld0RvY2s6IHtcbiAgICAgICAgdGl0bGU6ICdPcGVuIHByZXZpZXcgaW4gZG9jaycsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnY2VudGVyJyBhcyAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJyxcbiAgICAgICAgZW51bTogWydsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbScsICdjZW50ZXInXSxcbiAgICAgICAgb3JkZXI6IDI1LFxuICAgICAgfSxcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdDbG9zZSBwcmV2aWV3IHdoZW4gZWRpdG9yIGNsb3NlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDI2LFxuICAgICAgfSxcbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICAgICAgdGl0bGU6ICdCcmluZyB1cCBwcmV2aWV3IHdoZW4gZWRpdG9yIGFjdGl2YXRlcycsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyNyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgc3luY0NvbmZpZzoge1xuICAgIHRpdGxlOiAnUHJldmlldyBwb3NpdGlvbiBzeW5jaHJvbml6YXRpb24gYmVoYXZpb3VyJyxcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBvcmRlcjogMjAsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZToge1xuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgaW4gZWRpdG9yIGNoYW5nZXMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBvcmRlcjogMjgsXG4gICAgICB9LFxuICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDoge1xuICAgICAgICB0aXRsZTogJ1N5bmMgcHJldmlldyBwb3NpdGlvbiB3aGVuIHRleHQgZWRpdG9yIGlzIHNjcm9sbGVkJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ05vdGU6IGlmIGJvdGggc2Nyb2xsIHN5bmMgb3B0aW9ucyBhcmUgZW5hYmxlZCwgdGhlIGVkaXRvciAnICtcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyOC4xLFxuICAgICAgfSxcbiAgICAgIHN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGw6IHtcbiAgICAgICAgdGl0bGU6ICdTeW5jIGVkaXRvciBwb3NpdGlvbiB3aGVuIHByZXZpZXcgaXMgc2Nyb2xsZWQnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTm90ZTogaWYgYm90aCBzY3JvbGwgc3luYyBvcHRpb25zIGFyZSBlbmFibGVkLCB0aGUgcHJldmlldyAnICtcbiAgICAgICAgICAnaGFzIHRvIGJlIGluIGFjdGl2ZSBwYW5lIGZvciB0aGlzIG9wdGlvbiB0byB0YWtlIGVmZmVjdCcsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyOC4yLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBtYXRoQ29uZmlnOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgdGl0bGU6ICdNYXRoIE9wdGlvbnMnLFxuICAgIG9yZGVyOiAzMCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBNYXRoIFJlbmRlcmluZyBCeSBEZWZhdWx0JyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDAsXG4gICAgICB9LFxuICAgICAgbGF0ZXhSZW5kZXJlcjoge1xuICAgICAgICB0aXRsZTogJ01hdGggUmVuZGVyZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnU1ZHIGlzIG5vdGljZWFibHkgZmFzdGVyLCBidXQgbWlnaHQgbG9vayB3b3JzZSBvbiBzb21lIHN5c3RlbXMnLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZW51bTogWydIVE1MLUNTUycsICdTVkcnXSxcbiAgICAgICAgZGVmYXVsdDogJ1NWRycgYXMgJ0hUTUwtQ1NTJyB8ICdTVkcnLFxuICAgICAgICBvcmRlcjogNSxcbiAgICAgIH0sXG4gICAgICBudW1iZXJFcXVhdGlvbnM6IHtcbiAgICAgICAgdGl0bGU6ICdOdW1iZXIgZXF1YXRpb25zJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ051bWJlciBlcXVhdGlvbnMgdGhhdCBhcmUgaW4gZXF1YXRpb24gZW52aXJvbm1lbnQsIGV0Yy4gJyArXG4gICAgICAgICAgJ1dpbGwgcmUtcmVuZGVyIGFsbCBtYXRoIG9uIGVhY2ggbWF0aCBjaGFuZ2UsIHdoaWNoIG1pZ2h0IGJlIHVuZGVzaXJhYmxlLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgbWFya2Rvd25JdENvbmZpZzoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHRpdGxlOiAnTWFya2Rvd24tSXQgU2V0dGluZ3MnLFxuICAgIG9yZGVyOiA0MCxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBicmVha09uU2luZ2xlTmV3bGluZToge1xuICAgICAgICB0aXRsZTogJ0JyZWFrIG9uIHNpbmdsZSBuZXdsaW5lJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDAsXG4gICAgICB9LFxuICAgICAgdXNlTGF6eUhlYWRlcnM6IHtcbiAgICAgICAgdGl0bGU6ICdVc2UgTGF6eSBIZWFkZXJzIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXF1aXJlIG5vIHNwYWNlIGFmdGVyIGhlYWRpbmdzICMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiA1LFxuICAgICAgfSxcbiAgICAgIHVzZUNoZWNrQm94ZXM6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgQ2hlY2tCb3ggbGlzdHMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0NoZWNrQm94IGxpc3RzLCBsaWtlIG9uIEdpdEh1YicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgfSxcbiAgICAgIHVzZUVtb2ppOiB7XG4gICAgICAgIHRpdGxlOiAnVXNlIEVtb2ppIHdpdGggbWFya2Rvd24taXQgcGFyc2VyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbW9qaSByZW5kZXJpbmcnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgIH0sXG4gICAgICB1c2VUb2M6IHtcbiAgICAgICAgdGl0bGU6ICdVc2UgdGFibGUgb2YgY29udGVudHMgd2l0aCBtYXJrZG93bi1pdCBwYXJzZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JlcGxhY2UgW1t0b2NdXSB3aXRoIGF1dG9nZW5lcmF0ZWQgdGFibGUgb2YgY29udGVudHMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczoge1xuICAgICAgICB0aXRsZTogJ0lubGluZSBtYXRoIHNlcGFyYXRvcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnTGlzdCBvZiBpbmxpbmUgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFsnJCcsICckJywgJ1xcXFwoJywgJ1xcXFwpJ10sXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBibG9ja01hdGhTZXBhcmF0b3JzOiB7XG4gICAgICAgIHRpdGxlOiAnQmxvY2sgbWF0aCBzZXBhcmF0b3JzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0xpc3Qgb2YgYmxvY2sgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGRlZmF1bHQ6IFsnJCQnLCAnJCQnLCAnXFxcXFsnLCAnXFxcXF0nXSxcbiAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwYW5kb2NDb25maWc6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICB0aXRsZTogJ1BhbmRvYyBzZXR0aW5ncycsXG4gICAgb3JkZXI6IDUwLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IHtcbiAgICAgICAgdGl0bGU6ICdVc2UgbmF0aXZlIFBhbmRvYyBjb2RlIGJsb2NrIHN0eWxlJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgZGVzY3JpcHRpb246IGBcXFxuICAgIERvbid0IGNvbnZlcnQgZmVuY2VkIGNvZGUgYmxvY2tzIHRvIEF0b20gZWRpdG9ycyB3aGVuIHVzaW5nXG4gICAgUGFuZG9jIHBhcnNlcmAsXG4gICAgICAgIG9yZGVyOiAwLFxuICAgICAgfSxcbiAgICAgIHBhbmRvY1BhdGg6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdwYW5kb2MnLFxuICAgICAgICB0aXRsZTogJ1BhdGggdG8gUGFuZG9jIGV4ZWN1dGFibGUnLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAnUGxlYXNlIHNwZWNpZnkgdGhlIGNvcnJlY3QgcGF0aCB0byB5b3VyIHBhbmRvYyBleGVjdXRhYmxlLCAnICtcbiAgICAgICAgICAnZm9yIGV4YW1wbGUsIC91c3IvYmluL3BhbmRvYywgb3IgQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxQYW5kb2NcXFxccGFuZG9jLmV4ZScsXG4gICAgICAgIG9yZGVyOiA1LFxuICAgICAgfSxcbiAgICAgIHBhbmRvY0ZpbHRlcnM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogW10gYXMgc3RyaW5nW10sXG4gICAgICAgIHRpdGxlOiAnRmlsdGVycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICdDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGZpbHRlcnMsIGluIG9yZGVyIG9mIGFwcGxpY2F0aW9uLiBXaWxsIGJlIHBhc3NlZCB2aWEgY29tbWFuZC1saW5lIGFyZ3VtZW50cycsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NBcmd1bWVudHM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZGVmYXVsdDogW10gYXMgc3RyaW5nW10sXG4gICAgICAgIHRpdGxlOiAnQ29tbWFuZGxpbmUgQXJndW1lbnRzJyxcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgYXJndW1lbnRzIGUuZy4gYC0tc21hcnQsIC0tZmlsdGVyPS9iaW4vZXhlYC4gUGxlYXNlIHVzZSBsb25nIGFyZ3VtZW50IG5hbWVzLicsXG4gICAgICAgIG9yZGVyOiAxNSxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogJ21hcmtkb3duLXJhd190ZXgrdGV4X21hdGhfc2luZ2xlX2JhY2tzbGFzaCcsXG4gICAgICAgIHRpdGxlOiAnTWFya2Rvd24gRmxhdm9yJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbnRlciB0aGUgcGFuZG9jIG1hcmtkb3duIGZsYXZvciB5b3Ugd2FudCcsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgdGl0bGU6ICdDaXRhdGlvbnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogYFxcXG4gICAgRW5hYmxlIHRoaXMgZm9yIGJpYmxpb2dyYXBoeSBwYXJzaW5nLlxuICAgIE5vdGU6IHBhbmRvYy1jaXRlcHJvYyBpcyBhcHBsaWVkIGFmdGVyIG90aGVyIGZpbHRlcnMgc3BlY2lmaWVkIGluXG4gICAgRmlsdGVycywgYnV0IGJlZm9yZSBvdGhlciBjb21tYW5kbGluZSBhcmd1bWVudHNcXFxuICAgIGAsXG4gICAgICAgIG9yZGVyOiAyNSxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6ICdSZW1vdmUgUmVmZXJlbmNlcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlldycsXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NCSUJGaWxlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnYmlibGlvZ3JhcGh5LmJpYicsXG4gICAgICAgIHRpdGxlOiAnQmlibGlvZ3JhcGh5IChiaWJmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBiaWJmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgICAgICBvcmRlcjogMzUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgYmliZmlsZScsXG4gICAgICAgIG9yZGVyOiA0MCxcbiAgICAgIH0sXG4gICAgICBwYW5kb2NDU0xGaWxlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnY3VzdG9tLmNzbCcsXG4gICAgICAgIHRpdGxlOiAnQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBjc2xmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgICAgICBvcmRlcjogNDUsXG4gICAgICB9LFxuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgdGl0bGU6ICdGYWxsYmFjayBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgY3NsZmlsZScsXG4gICAgICAgIG9yZGVyOiA1MCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn1cblxuLy8gZ2VuZXJhdGVkIGJ5IHR5cGVkLWNvbmZpZy5qc1xuZGVjbGFyZSBtb2R1bGUgJ2F0b20nIHtcbiAgaW50ZXJmYWNlIENvbmZpZ1ZhbHVlcyB7XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucmVuZGVyZXInOiAnbWFya2Rvd24taXQnIHwgJ3BhbmRvYydcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcubGl2ZVVwZGF0ZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcucmVsYXRpdml6ZU1lZGlhT25TYXZlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0NvbmZpZy5wcmV2aWV3U3BsaXRQYW5lRGlyJzpcbiAgICAgIHwgJ2Rvd24nXG4gICAgICB8ICdyaWdodCdcbiAgICAgIHwgJ25vbmUnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3Q29uZmlnLnByZXZpZXdEb2NrJzpcbiAgICAgIHwgJ2xlZnQnXG4gICAgICB8ICdyaWdodCdcbiAgICAgIHwgJ2JvdHRvbSdcbiAgICAgIHwgJ2NlbnRlcidcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcuY2xvc2VQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdDb25maWcnOiB7XG4gICAgICBsaXZlVXBkYXRlOiBib29sZWFuXG4gICAgICByZWxhdGl2aXplTWVkaWFPblNhdmU6IGJvb2xlYW5cbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6ICdkb3duJyB8ICdyaWdodCcgfCAnbm9uZSdcbiAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgICAgYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgIH1cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkNoYW5nZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcuc3luY0VkaXRvck9uUHJldmlld1Njcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNDb25maWcnOiB7XG4gICAgICBzeW5jUHJldmlld09uQ2hhbmdlOiBib29sZWFuXG4gICAgICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiBib29sZWFuXG4gICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiBib29sZWFuXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hdGhDb25maWcubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWF0aENvbmZpZy5udW1iZXJFcXVhdGlvbnMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXRoQ29uZmlnJzoge1xuICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IGJvb2xlYW5cbiAgICAgIGxhdGV4UmVuZGVyZXI6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy5icmVha09uU2luZ2xlTmV3bGluZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcudXNlTGF6eUhlYWRlcnMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUNoZWNrQm94ZXMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLnVzZUVtb2ppJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubWFya2Rvd25JdENvbmZpZy51c2VUb2MnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm1hcmtkb3duSXRDb25maWcuYmxvY2tNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5tYXJrZG93bkl0Q29uZmlnJzoge1xuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cbiAgICAgIHVzZUxhenlIZWFkZXJzOiBib29sZWFuXG4gICAgICB1c2VDaGVja0JveGVzOiBib29sZWFuXG4gICAgICB1c2VFbW9qaTogYm9vbGVhblxuICAgICAgdXNlVG9jOiBib29sZWFuXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDb25maWcucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ29uZmlnJzoge1xuICAgICAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczogYm9vbGVhblxuICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXG4gICAgICBwYW5kb2NGaWx0ZXJzOiBzdHJpbmdbXVxuICAgICAgcGFuZG9jQXJndW1lbnRzOiBzdHJpbmdbXVxuICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xuICAgICAgcGFuZG9jQmlibGlvZ3JhcGh5OiBib29sZWFuXG4gICAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiBib29sZWFuXG4gICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcbiAgICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICBwYW5kb2NDU0xGaWxlOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgfVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMnOiB7XG4gICAgICBncmFtbWFyczogc3RyaW5nW11cbiAgICAgIGV4dGVuc2lvbnM6IHN0cmluZ1tdXG4gICAgICB1c2VHaXRIdWJTdHlsZTogYm9vbGVhblxuICAgICAgcmVuZGVyZXI6ICdtYXJrZG93bi1pdCcgfCAncGFuZG9jJ1xuICAgICAgJ3ByZXZpZXdDb25maWcubGl2ZVVwZGF0ZSc6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLnJlbGF0aXZpemVNZWRpYU9uU2F2ZSc6IGJvb2xlYW5cbiAgICAgICdwcmV2aWV3Q29uZmlnLnByZXZpZXdTcGxpdFBhbmVEaXInOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICAncHJldmlld0NvbmZpZy5wcmV2aWV3RG9jayc6ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInXG4gICAgICAncHJldmlld0NvbmZpZy5jbG9zZVByZXZpZXdXaXRoRWRpdG9yJzogYm9vbGVhblxuICAgICAgJ3ByZXZpZXdDb25maWcuYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAgIHByZXZpZXdDb25maWc6IHtcbiAgICAgICAgbGl2ZVVwZGF0ZTogYm9vbGVhblxuICAgICAgICByZWxhdGl2aXplTWVkaWFPblNhdmU6IGJvb2xlYW5cbiAgICAgICAgcHJldmlld1NwbGl0UGFuZURpcjogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICAgICBwcmV2aWV3RG9jazogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcidcbiAgICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgICAgICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiBib29sZWFuXG4gICAgICB9XG4gICAgICAnc3luY0NvbmZpZy5zeW5jUHJldmlld09uQ2hhbmdlJzogYm9vbGVhblxuICAgICAgJ3N5bmNDb25maWcuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cbiAgICAgICdzeW5jQ29uZmlnLnN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGwnOiBib29sZWFuXG4gICAgICBzeW5jQ29uZmlnOiB7XG4gICAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IGJvb2xlYW5cbiAgICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDogYm9vbGVhblxuICAgICAgICBzeW5jRWRpdG9yT25QcmV2aWV3U2Nyb2xsOiBib29sZWFuXG4gICAgICB9XG4gICAgICAnbWF0aENvbmZpZy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAgICdtYXRoQ29uZmlnLmxhdGV4UmVuZGVyZXInOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAgICdtYXRoQ29uZmlnLm51bWJlckVxdWF0aW9ucyc6IGJvb2xlYW5cbiAgICAgIG1hdGhDb25maWc6IHtcbiAgICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IGJvb2xlYW5cbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogJ0hUTUwtQ1NTJyB8ICdTVkcnXG4gICAgICAgIG51bWJlckVxdWF0aW9uczogYm9vbGVhblxuICAgICAgfVxuICAgICAgJ21hcmtkb3duSXRDb25maWcuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VMYXp5SGVhZGVycyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZUNoZWNrQm94ZXMnOiBib29sZWFuXG4gICAgICAnbWFya2Rvd25JdENvbmZpZy51c2VFbW9qaSc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLnVzZVRvYyc6IGJvb2xlYW5cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmlubGluZU1hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAgICdtYXJrZG93bkl0Q29uZmlnLmJsb2NrTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICAgbWFya2Rvd25JdENvbmZpZzoge1xuICAgICAgICBicmVha09uU2luZ2xlTmV3bGluZTogYm9vbGVhblxuICAgICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxuICAgICAgICB1c2VDaGVja0JveGVzOiBib29sZWFuXG4gICAgICAgIHVzZUVtb2ppOiBib29sZWFuXG4gICAgICAgIHVzZVRvYzogYm9vbGVhblxuICAgICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIH1cbiAgICAgICdwYW5kb2NDb25maWcudXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlcyc6IGJvb2xlYW5cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jUGF0aCc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NGaWx0ZXJzJzogc3RyaW5nW11cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQXJndW1lbnRzJzogc3RyaW5nW11cbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jTWFya2Rvd25GbGF2b3InOiBzdHJpbmdcbiAgICAgICdwYW5kb2NDb25maWcucGFuZG9jQmlibGlvZ3JhcGh5JzogYm9vbGVhblxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzJzogYm9vbGVhblxuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NCSUJGaWxlJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0JJQkZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICAgJ3BhbmRvY0NvbmZpZy5wYW5kb2NDU0xGaWxlJzogc3RyaW5nXG4gICAgICAncGFuZG9jQ29uZmlnLnBhbmRvY0NTTEZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICAgcGFuZG9jQ29uZmlnOiB7XG4gICAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jUGF0aDogc3RyaW5nXG4gICAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXG4gICAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cbiAgICAgICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHN0cmluZ1xuICAgICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cbiAgICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxuICAgICAgICBwYW5kb2NCSUJGaWxlOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXG4gICAgICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazogc3RyaW5nXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=