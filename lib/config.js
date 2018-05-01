"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
    breakOnSingleNewline: {
        type: 'boolean',
        default: false,
        order: 0,
    },
    liveUpdate: {
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
    syncPreviewOnChange: {
        title: 'Sync preview position when text in editor changes',
        type: 'boolean',
        default: false,
        order: 28,
    },
    grammars: {
        type: 'array',
        default: [
            'source.gfm',
            'source.litcoffee',
            'text.html.basic',
            'text.md',
            'text.plain',
            'text.plain.null-grammar',
        ],
        order: 30,
        items: {
            type: 'string',
        },
    },
    extensions: {
        type: 'array',
        title: 'Markdown file extensions',
        description: 'Which files are considered Markdown',
        default: ['markdown', 'md', 'mdown', 'mkd', 'mkdown', 'ron', 'txt'],
        order: 31,
        items: {
            type: 'string',
        },
    },
    enableLatexRenderingByDefault: {
        title: 'Enable Math Rendering By Default',
        type: 'boolean',
        default: false,
        order: 40,
    },
    latexRenderer: {
        title: 'Math Renderer',
        description: 'SVG is noticeably faster, but might look worse on some systems',
        type: 'string',
        enum: ['HTML-CSS', 'SVG'],
        default: 'SVG',
        order: 41,
    },
    numberEquations: {
        title: 'Number equations',
        description: 'Number equations that are in equation environment, etc. ' +
            'Requires preview reopen to take effect. ' +
            'Will re-render all math on each math change, which might be undesirable.',
        type: 'boolean',
        default: false,
        order: 42,
    },
    useLazyHeaders: {
        title: 'Use Lazy Headers',
        description: 'Require no space after headings #',
        type: 'boolean',
        default: true,
        order: 45,
    },
    useCheckBoxes: {
        title: 'Enable CheckBox lists',
        description: 'CheckBox lists, like on GitHub',
        type: 'boolean',
        default: true,
        order: 46,
    },
    useEmoji: {
        title: 'Use Emoji',
        description: 'Emoji rendering',
        type: 'boolean',
        default: true,
        order: 47,
    },
    inlineMathSeparators: {
        title: 'Inline math separators',
        description: 'List of inline math separators in pairs -- first opening, then closing',
        type: 'array',
        default: ['$', '$', '\\(', '\\)'],
        order: 48,
        items: {
            type: 'string',
        },
    },
    blockMathSeparators: {
        title: 'Block math separators',
        description: 'List of block math separators in pairs -- first opening, then closing',
        type: 'array',
        default: ['$$', '$$', '\\[', '\\]'],
        order: 48.1,
        items: {
            type: 'string',
        },
    },
    useGitHubStyle: {
        title: 'Use GitHub.com style',
        type: 'boolean',
        default: false,
        order: 50,
    },
    enablePandoc: {
        type: 'boolean',
        default: false,
        title: 'Enable Pandoc Parser',
        order: 100,
    },
    useNativePandocCodeStyles: {
        type: 'boolean',
        default: false,
        description: `\
Don't convert fenced code blocks to Atom editors when using
Pandoc parser`,
        order: 105,
    },
    pandocPath: {
        type: 'string',
        default: 'pandoc',
        title: 'Pandoc Options: Path',
        description: 'Please specify the correct path to your pandoc executable',
        dependencies: ['enablePandoc'],
        order: 110,
    },
    pandocFilters: {
        type: 'array',
        default: [],
        title: 'Pandoc Options: Filters',
        description: 'Comma separated pandoc filters, in order of application. Will be passed via command-line arguments',
        dependencies: ['enablePandoc'],
        order: 115,
        items: {
            type: 'string',
        },
    },
    pandocArguments: {
        type: 'array',
        default: [],
        title: 'Pandoc Options: Commandline Arguments',
        description: 'Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.',
        dependencies: ['enablePandoc'],
        order: 120,
        items: {
            type: 'string',
        },
    },
    pandocMarkdownFlavor: {
        type: 'string',
        default: 'markdown-raw_tex+tex_math_single_backslash',
        title: 'Pandoc Options: Markdown Flavor',
        description: 'Enter the pandoc markdown flavor you want',
        dependencies: ['enablePandoc'],
        order: 130,
    },
    pandocBibliography: {
        type: 'boolean',
        default: false,
        title: 'Pandoc Options: Citations',
        description: `\
Enable this for bibliography parsing.
Note: pandoc-citeproc is applied after other filters specified in
Filters, but before other commandline arguments\
`,
        dependencies: ['enablePandoc'],
        order: 140,
    },
    pandocRemoveReferences: {
        type: 'boolean',
        default: true,
        title: 'Pandoc Options: Remove References',
        description: 'Removes references at the end of the HTML preview',
        dependencies: ['pandocBibliography'],
        order: 150,
    },
    pandocBIBFile: {
        type: 'string',
        default: 'bibliography.bib',
        title: 'Pandoc Options: Bibliography (bibfile)',
        description: 'Name of bibfile to search for recursively',
        dependencies: ['pandocBibliography'],
        order: 160,
    },
    pandocBIBFileFallback: {
        type: 'string',
        default: '',
        title: 'Pandoc Options: Fallback Bibliography (bibfile)',
        description: 'Full path to fallback bibfile',
        dependencies: ['pandocBibliography'],
        order: 165,
    },
    pandocCSLFile: {
        type: 'string',
        default: 'custom.csl',
        title: 'Pandoc Options: Bibliography Style (cslfile)',
        description: 'Name of cslfile to search for recursively',
        dependencies: ['pandocBibliography'],
        order: 170,
    },
    pandocCSLFileFallback: {
        type: 'string',
        default: '',
        title: 'Pandoc Options: Fallback Bibliography Style (cslfile)',
        description: 'Full path to fallback cslfile',
        dependencies: ['pandocBibliography'],
        order: 175,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFhLFFBQUEsTUFBTSxHQUFHO0lBQ3BCLG9CQUFvQixFQUFFO1FBQ3BCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxtQkFBbUIsRUFBRTtRQUNuQixLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLE9BQW9DO1FBQzdDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO1FBQy9CLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxXQUFXLEVBQUU7UUFDWCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLFFBQWtEO1FBQzNELElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQztRQUMzQyxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Qsc0JBQXNCLEVBQUU7UUFDdEIsS0FBSyxFQUFFLGtDQUFrQztRQUN6QyxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELHlCQUF5QixFQUFFO1FBQ3pCLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxtQkFBbUIsRUFBRTtRQUNuQixLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUU7WUFDUCxZQUFZO1lBQ1osa0JBQWtCO1lBQ2xCLGlCQUFpQjtZQUNqQixTQUFTO1lBQ1QsWUFBWTtZQUNaLHlCQUF5QjtTQUMxQjtRQUNELEtBQUssRUFBRSxFQUFFO1FBQ1QsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ25FLEtBQUssRUFBRSxFQUFFO1FBQ1QsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsNkJBQTZCLEVBQUU7UUFDN0IsS0FBSyxFQUFFLGtDQUFrQztRQUN6QyxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELGFBQWEsRUFBRTtRQUNiLEtBQUssRUFBRSxlQUFlO1FBQ3RCLFdBQVcsRUFDVCxnRUFBZ0U7UUFDbEUsSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO1FBQ3pCLE9BQU8sRUFBRSxLQUEyQjtRQUNwQyxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsS0FBSyxFQUFFLGtCQUFrQjtRQUN6QixXQUFXLEVBQ1QsMERBQTBEO1lBQzFELDBDQUEwQztZQUMxQywwRUFBMEU7UUFDNUUsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLFdBQVcsRUFBRSxtQ0FBbUM7UUFDaEQsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxhQUFhLEVBQUU7UUFDYixLQUFLLEVBQUUsdUJBQXVCO1FBQzlCLFdBQVcsRUFBRSxnQ0FBZ0M7UUFDN0MsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxRQUFRLEVBQUU7UUFDUixLQUFLLEVBQUUsV0FBVztRQUNsQixXQUFXLEVBQUUsaUJBQWlCO1FBQzlCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Qsb0JBQW9CLEVBQUU7UUFDcEIsS0FBSyxFQUFFLHdCQUF3QjtRQUMvQixXQUFXLEVBQ1Qsd0VBQXdFO1FBQzFFLElBQUksRUFBRSxPQUFPO1FBQ2IsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2pDLEtBQUssRUFBRSxFQUFFO1FBQ1QsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsbUJBQW1CLEVBQUU7UUFDbkIsS0FBSyxFQUFFLHVCQUF1QjtRQUM5QixXQUFXLEVBQ1QsdUVBQXVFO1FBQ3pFLElBQUksRUFBRSxPQUFPO1FBQ2IsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ25DLEtBQUssRUFBRSxJQUFJO1FBQ1gsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsS0FBSyxFQUFFLHNCQUFzQjtRQUM3QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELFlBQVksRUFBRTtRQUNaLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLEtBQUssRUFBRSxHQUFHO0tBQ1g7SUFDRCx5QkFBeUIsRUFBRTtRQUN6QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsV0FBVyxFQUFFOztjQUVIO1FBQ1YsS0FBSyxFQUFFLEdBQUc7S0FDWDtJQUNELFVBQVUsRUFBRTtRQUNWLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLFFBQVE7UUFDakIsS0FBSyxFQUFFLHNCQUFzQjtRQUM3QixXQUFXLEVBQUUsMkRBQTJEO1FBQ3hFLFlBQVksRUFBRSxDQUFDLGNBQWMsQ0FBQztRQUM5QixLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUUsRUFBYztRQUN2QixLQUFLLEVBQUUseUJBQXlCO1FBQ2hDLFdBQVcsRUFDVCxvR0FBb0c7UUFDdEcsWUFBWSxFQUFFLENBQUMsY0FBYyxDQUFDO1FBQzlCLEtBQUssRUFBRSxHQUFHO1FBQ1YsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUUsRUFBYztRQUN2QixLQUFLLEVBQUUsdUNBQXVDO1FBQzlDLFdBQVcsRUFDVCxxR0FBcUc7UUFDdkcsWUFBWSxFQUFFLENBQUMsY0FBYyxDQUFDO1FBQzlCLEtBQUssRUFBRSxHQUFHO1FBQ1YsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0Qsb0JBQW9CLEVBQUU7UUFDcEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsNENBQTRDO1FBQ3JELEtBQUssRUFBRSxpQ0FBaUM7UUFDeEMsV0FBVyxFQUFFLDJDQUEyQztRQUN4RCxZQUFZLEVBQUUsQ0FBQyxjQUFjLENBQUM7UUFDOUIsS0FBSyxFQUFFLEdBQUc7S0FDWDtJQUNELGtCQUFrQixFQUFFO1FBQ2xCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsMkJBQTJCO1FBQ2xDLFdBQVcsRUFBRTs7OztDQUloQjtRQUNHLFlBQVksRUFBRSxDQUFDLGNBQWMsQ0FBQztRQUM5QixLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0Qsc0JBQXNCLEVBQUU7UUFDdEIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxtQ0FBbUM7UUFDMUMsV0FBVyxFQUFFLG1EQUFtRDtRQUNoRSxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNwQyxLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsa0JBQWtCO1FBQzNCLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsV0FBVyxFQUFFLDJDQUEyQztRQUN4RCxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNwQyxLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0QscUJBQXFCLEVBQUU7UUFDckIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsRUFBRTtRQUNYLEtBQUssRUFBRSxpREFBaUQ7UUFDeEQsV0FBVyxFQUFFLCtCQUErQjtRQUM1QyxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNwQyxLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsWUFBWTtRQUNyQixLQUFLLEVBQUUsOENBQThDO1FBQ3JELFdBQVcsRUFBRSwyQ0FBMkM7UUFDeEQsWUFBWSxFQUFFLENBQUMsb0JBQW9CLENBQUM7UUFDcEMsS0FBSyxFQUFFLEdBQUc7S0FDWDtJQUNELHFCQUFxQixFQUFFO1FBQ3JCLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7UUFDWCxLQUFLLEVBQUUsdURBQXVEO1FBQzlELFdBQVcsRUFBRSwrQkFBK0I7UUFDNUMsWUFBWSxFQUFFLENBQUMsb0JBQW9CLENBQUM7UUFDcEMsS0FBSyxFQUFFLEdBQUc7S0FDWDtDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBicmVha09uU2luZ2xlTmV3bGluZToge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMCxcbiAgfSxcbiAgbGl2ZVVwZGF0ZToge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiAxMCxcbiAgfSxcbiAgcHJldmlld1NwbGl0UGFuZURpcjoge1xuICAgIHRpdGxlOiAnRGlyZWN0aW9uIHRvIGxvYWQgdGhlIHByZXZpZXcgaW4gc3BsaXQgcGFuZScsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ3JpZ2h0JyBhcyAncmlnaHQnIHwgJ2Rvd24nIHwgJ25vbmUnLFxuICAgIGVudW06IFsnZG93bicsICdyaWdodCcsICdub25lJ10sXG4gICAgb3JkZXI6IDIwLFxuICB9LFxuICBwcmV2aWV3RG9jazoge1xuICAgIHRpdGxlOiAnT3BlbiBwcmV2aWV3IGluIGRvY2snLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdjZW50ZXInIGFzICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdjZW50ZXInLFxuICAgIGVudW06IFsnbGVmdCcsICdyaWdodCcsICdib3R0b20nLCAnY2VudGVyJ10sXG4gICAgb3JkZXI6IDI1LFxuICB9LFxuICBjbG9zZVByZXZpZXdXaXRoRWRpdG9yOiB7XG4gICAgdGl0bGU6ICdDbG9zZSBwcmV2aWV3IHdoZW4gZWRpdG9yIGNsb3NlcycsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDI2LFxuICB9LFxuICBhY3RpdmF0ZVByZXZpZXdXaXRoRWRpdG9yOiB7XG4gICAgdGl0bGU6ICdCcmluZyB1cCBwcmV2aWV3IHdoZW4gZWRpdG9yIGFjdGl2YXRlcycsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAyNyxcbiAgfSxcbiAgc3luY1ByZXZpZXdPbkNoYW5nZToge1xuICAgIHRpdGxlOiAnU3luYyBwcmV2aWV3IHBvc2l0aW9uIHdoZW4gdGV4dCBpbiBlZGl0b3IgY2hhbmdlcycsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAyOCxcbiAgfSxcbiAgZ3JhbW1hcnM6IHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGRlZmF1bHQ6IFtcbiAgICAgICdzb3VyY2UuZ2ZtJyxcbiAgICAgICdzb3VyY2UubGl0Y29mZmVlJyxcbiAgICAgICd0ZXh0Lmh0bWwuYmFzaWMnLFxuICAgICAgJ3RleHQubWQnLFxuICAgICAgJ3RleHQucGxhaW4nLFxuICAgICAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJyxcbiAgICBdLFxuICAgIG9yZGVyOiAzMCxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgZXh0ZW5zaW9uczoge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgdGl0bGU6ICdNYXJrZG93biBmaWxlIGV4dGVuc2lvbnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hpY2ggZmlsZXMgYXJlIGNvbnNpZGVyZWQgTWFya2Rvd24nLFxuICAgIGRlZmF1bHQ6IFsnbWFya2Rvd24nLCAnbWQnLCAnbWRvd24nLCAnbWtkJywgJ21rZG93bicsICdyb24nLCAndHh0J10sXG4gICAgb3JkZXI6IDMxLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDoge1xuICAgIHRpdGxlOiAnRW5hYmxlIE1hdGggUmVuZGVyaW5nIEJ5IERlZmF1bHQnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNDAsXG4gIH0sXG4gIGxhdGV4UmVuZGVyZXI6IHtcbiAgICB0aXRsZTogJ01hdGggUmVuZGVyZXInLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1NWRyBpcyBub3RpY2VhYmx5IGZhc3RlciwgYnV0IG1pZ2h0IGxvb2sgd29yc2Ugb24gc29tZSBzeXN0ZW1zJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBlbnVtOiBbJ0hUTUwtQ1NTJywgJ1NWRyddLFxuICAgIGRlZmF1bHQ6ICdTVkcnIGFzICdIVE1MLUNTUycgfCAnU1ZHJyxcbiAgICBvcmRlcjogNDEsXG4gIH0sXG4gIG51bWJlckVxdWF0aW9uczoge1xuICAgIHRpdGxlOiAnTnVtYmVyIGVxdWF0aW9ucycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnTnVtYmVyIGVxdWF0aW9ucyB0aGF0IGFyZSBpbiBlcXVhdGlvbiBlbnZpcm9ubWVudCwgZXRjLiAnICtcbiAgICAgICdSZXF1aXJlcyBwcmV2aWV3IHJlb3BlbiB0byB0YWtlIGVmZmVjdC4gJyArXG4gICAgICAnV2lsbCByZS1yZW5kZXIgYWxsIG1hdGggb24gZWFjaCBtYXRoIGNoYW5nZSwgd2hpY2ggbWlnaHQgYmUgdW5kZXNpcmFibGUuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDQyLFxuICB9LFxuICB1c2VMYXp5SGVhZGVyczoge1xuICAgIHRpdGxlOiAnVXNlIExhenkgSGVhZGVycycsXG4gICAgZGVzY3JpcHRpb246ICdSZXF1aXJlIG5vIHNwYWNlIGFmdGVyIGhlYWRpbmdzICMnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA0NSxcbiAgfSxcbiAgdXNlQ2hlY2tCb3hlczoge1xuICAgIHRpdGxlOiAnRW5hYmxlIENoZWNrQm94IGxpc3RzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoZWNrQm94IGxpc3RzLCBsaWtlIG9uIEdpdEh1YicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDQ2LFxuICB9LFxuICB1c2VFbW9qaToge1xuICAgIHRpdGxlOiAnVXNlIEVtb2ppJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Vtb2ppIHJlbmRlcmluZycsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDQ3LFxuICB9LFxuICBpbmxpbmVNYXRoU2VwYXJhdG9yczoge1xuICAgIHRpdGxlOiAnSW5saW5lIG1hdGggc2VwYXJhdG9ycycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnTGlzdCBvZiBpbmxpbmUgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBkZWZhdWx0OiBbJyQnLCAnJCcsICdcXFxcKCcsICdcXFxcKSddLFxuICAgIG9yZGVyOiA0OCxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgYmxvY2tNYXRoU2VwYXJhdG9yczoge1xuICAgIHRpdGxlOiAnQmxvY2sgbWF0aCBzZXBhcmF0b3JzJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdMaXN0IG9mIGJsb2NrIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogWyckJCcsICckJCcsICdcXFxcWycsICdcXFxcXSddLFxuICAgIG9yZGVyOiA0OC4xLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICB1c2VHaXRIdWJTdHlsZToge1xuICAgIHRpdGxlOiAnVXNlIEdpdEh1Yi5jb20gc3R5bGUnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNTAsXG4gIH0sXG4gIGVuYWJsZVBhbmRvYzoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0aXRsZTogJ0VuYWJsZSBQYW5kb2MgUGFyc2VyJyxcbiAgICBvcmRlcjogMTAwLFxuICB9LFxuICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIGRlc2NyaXB0aW9uOiBgXFxcbkRvbid0IGNvbnZlcnQgZmVuY2VkIGNvZGUgYmxvY2tzIHRvIEF0b20gZWRpdG9ycyB3aGVuIHVzaW5nXG5QYW5kb2MgcGFyc2VyYCxcbiAgICBvcmRlcjogMTA1LFxuICB9LFxuICBwYW5kb2NQYXRoOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ3BhbmRvYycsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogUGF0aCcsXG4gICAgZGVzY3JpcHRpb246ICdQbGVhc2Ugc3BlY2lmeSB0aGUgY29ycmVjdCBwYXRoIHRvIHlvdXIgcGFuZG9jIGV4ZWN1dGFibGUnLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTEwLFxuICB9LFxuICBwYW5kb2NGaWx0ZXJzOiB7XG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBkZWZhdWx0OiBbXSBhcyBzdHJpbmdbXSxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBGaWx0ZXJzJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGZpbHRlcnMsIGluIG9yZGVyIG9mIGFwcGxpY2F0aW9uLiBXaWxsIGJlIHBhc3NlZCB2aWEgY29tbWFuZC1saW5lIGFyZ3VtZW50cycsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ2VuYWJsZVBhbmRvYyddLFxuICAgIG9yZGVyOiAxMTUsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIHBhbmRvY0FyZ3VtZW50czoge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogW10gYXMgc3RyaW5nW10sXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogQ29tbWFuZGxpbmUgQXJndW1lbnRzJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGFyZ3VtZW50cyBlLmcuIGAtLXNtYXJ0LCAtLWZpbHRlcj0vYmluL2V4ZWAuIFBsZWFzZSB1c2UgbG9uZyBhcmd1bWVudCBuYW1lcy4nLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTIwLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBwYW5kb2NNYXJrZG93bkZsYXZvcjoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1yYXdfdGV4K3RleF9tYXRoX3NpbmdsZV9iYWNrc2xhc2gnLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IE1hcmtkb3duIEZsYXZvcicsXG4gICAgZGVzY3JpcHRpb246ICdFbnRlciB0aGUgcGFuZG9jIG1hcmtkb3duIGZsYXZvciB5b3Ugd2FudCcsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ2VuYWJsZVBhbmRvYyddLFxuICAgIG9yZGVyOiAxMzAsXG4gIH0sXG4gIHBhbmRvY0JpYmxpb2dyYXBoeToge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBDaXRhdGlvbnMnLFxuICAgIGRlc2NyaXB0aW9uOiBgXFxcbkVuYWJsZSB0aGlzIGZvciBiaWJsaW9ncmFwaHkgcGFyc2luZy5cbk5vdGU6IHBhbmRvYy1jaXRlcHJvYyBpcyBhcHBsaWVkIGFmdGVyIG90aGVyIGZpbHRlcnMgc3BlY2lmaWVkIGluXG5GaWx0ZXJzLCBidXQgYmVmb3JlIG90aGVyIGNvbW1hbmRsaW5lIGFyZ3VtZW50c1xcXG5gLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTQwLFxuICB9LFxuICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogUmVtb3ZlIFJlZmVyZW5jZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlldycsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddLFxuICAgIG9yZGVyOiAxNTAsXG4gIH0sXG4gIHBhbmRvY0JJQkZpbGU6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnYmlibGlvZ3JhcGh5LmJpYicsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogQmlibGlvZ3JhcGh5IChiaWJmaWxlKScsXG4gICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGJpYmZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseScsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddLFxuICAgIG9yZGVyOiAxNjAsXG4gIH0sXG4gIHBhbmRvY0JJQkZpbGVGYWxsYmFjazoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IEZhbGxiYWNrIEJpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxuICAgIGRlc2NyaXB0aW9uOiAnRnVsbCBwYXRoIHRvIGZhbGxiYWNrIGJpYmZpbGUnLFxuICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXSxcbiAgICBvcmRlcjogMTY1LFxuICB9LFxuICBwYW5kb2NDU0xGaWxlOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2N1c3RvbS5jc2wnLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IEJpYmxpb2dyYXBoeSBTdHlsZSAoY3NsZmlsZSknLFxuICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBjc2xmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXSxcbiAgICBvcmRlcjogMTcwLFxuICB9LFxuICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBGYWxsYmFjayBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBjc2xmaWxlJyxcbiAgICBkZXBlbmRlbmNpZXM6IFsncGFuZG9jQmlibGlvZ3JhcGh5J10sXG4gICAgb3JkZXI6IDE3NSxcbiAgfSxcbn1cblxuLy8gZ2VuZXJhdGVkIGJ5IHR5cGVkLWNvbmZpZy5qc1xuZGVjbGFyZSBtb2R1bGUgJ2F0b20nIHtcbiAgaW50ZXJmYWNlIENvbmZpZ1ZhbHVlcyB7XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3U3BsaXRQYW5lRGlyJzogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0RvY2snOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuY2xvc2VQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jUHJldmlld09uQ2hhbmdlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZ3JhbW1hcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZXh0ZW5zaW9ucyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmxhdGV4UmVuZGVyZXInOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLm51bWJlckVxdWF0aW9ucyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUVtb2ppJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuaW5saW5lTWF0aFNlcGFyYXRvcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYmxvY2tNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZVBhbmRvYyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NQYXRoJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NGaWx0ZXJzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0FyZ3VtZW50cyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NNYXJrZG93bkZsYXZvcic6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQmlibGlvZ3JhcGh5JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jUmVtb3ZlUmVmZXJlbmNlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0JJQkZpbGUnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0JJQkZpbGVGYWxsYmFjayc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ1NMRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ1NMRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cyc6IHtcbiAgICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOiBib29sZWFuXG4gICAgICBsaXZlVXBkYXRlOiBib29sZWFuXG4gICAgICBwcmV2aWV3U3BsaXRQYW5lRGlyOiAnZG93bicgfCAncmlnaHQnIHwgJ25vbmUnXG4gICAgICBwcmV2aWV3RG9jazogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcidcbiAgICAgIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IGJvb2xlYW5cbiAgICAgIHN5bmNQcmV2aWV3T25DaGFuZ2U6IGJvb2xlYW5cbiAgICAgIGdyYW1tYXJzOiBzdHJpbmdbXVxuICAgICAgZXh0ZW5zaW9uczogc3RyaW5nW11cbiAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiBib29sZWFuXG4gICAgICBsYXRleFJlbmRlcmVyOiAnSFRNTC1DU1MnIHwgJ1NWRydcbiAgICAgIG51bWJlckVxdWF0aW9uczogYm9vbGVhblxuICAgICAgdXNlTGF6eUhlYWRlcnM6IGJvb2xlYW5cbiAgICAgIHVzZUNoZWNrQm94ZXM6IGJvb2xlYW5cbiAgICAgIHVzZUVtb2ppOiBib29sZWFuXG4gICAgICBpbmxpbmVNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHN0cmluZ1tdXG4gICAgICB1c2VHaXRIdWJTdHlsZTogYm9vbGVhblxuICAgICAgZW5hYmxlUGFuZG9jOiBib29sZWFuXG4gICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiBib29sZWFuXG4gICAgICBwYW5kb2NQYXRoOiBzdHJpbmdcbiAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXG4gICAgICBwYW5kb2NBcmd1bWVudHM6IHN0cmluZ1tdXG4gICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjogc3RyaW5nXG4gICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cbiAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IGJvb2xlYW5cbiAgICAgIHBhbmRvY0JJQkZpbGU6IHN0cmluZ1xuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NTTEZpbGU6IHN0cmluZ1xuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICB9XG4gIH1cbn1cbiJdfQ==