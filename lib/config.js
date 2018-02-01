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
    openPreviewInSplitPane: {
        type: 'boolean',
        default: true,
        order: 20,
    },
    previewSplitPaneDir: {
        title: 'Direction to load the preview in split pane',
        type: 'string',
        default: 'right',
        enum: ['down', 'right'],
        order: 25,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFhLFFBQUEsTUFBTSxHQUFHO0lBQ3BCLG9CQUFvQixFQUFFO1FBQ3BCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxzQkFBc0IsRUFBRTtRQUN0QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELG1CQUFtQixFQUFFO1FBQ25CLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsT0FBMkI7UUFDcEMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztRQUN2QixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUU7WUFDUCxZQUFZO1lBQ1osa0JBQWtCO1lBQ2xCLGlCQUFpQjtZQUNqQixTQUFTO1lBQ1QsWUFBWTtZQUNaLHlCQUF5QjtTQUMxQjtRQUNELEtBQUssRUFBRSxFQUFFO1FBQ1QsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ25FLEtBQUssRUFBRSxFQUFFO1FBQ1QsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsNkJBQTZCLEVBQUU7UUFDN0IsS0FBSyxFQUFFLGtDQUFrQztRQUN6QyxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELGNBQWMsRUFBRTtRQUNkLEtBQUssRUFBRSxrQkFBa0I7UUFDekIsV0FBVyxFQUFFLG1DQUFtQztRQUNoRCxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELGFBQWEsRUFBRTtRQUNiLEtBQUssRUFBRSx1QkFBdUI7UUFDOUIsV0FBVyxFQUFFLGdDQUFnQztRQUM3QyxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELFFBQVEsRUFBRTtRQUNSLEtBQUssRUFBRSxXQUFXO1FBQ2xCLFdBQVcsRUFBRSxpQkFBaUI7UUFDOUIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxvQkFBb0IsRUFBRTtRQUNwQixLQUFLLEVBQUUsd0JBQXdCO1FBQy9CLFdBQVcsRUFDVCx3RUFBd0U7UUFDMUUsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDakMsS0FBSyxFQUFFLEVBQUU7UUFDVCxLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxtQkFBbUIsRUFBRTtRQUNuQixLQUFLLEVBQUUsdUJBQXVCO1FBQzlCLFdBQVcsRUFDVCx1RUFBdUU7UUFDekUsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkMsS0FBSyxFQUFFLElBQUk7UUFDWCxLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0QsWUFBWSxFQUFFO1FBQ1osSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxzQkFBc0I7UUFDN0IsS0FBSyxFQUFFLEdBQUc7S0FDWDtJQUNELHlCQUF5QixFQUFFO1FBQ3pCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxXQUFXLEVBQUU7O2NBRUg7UUFDVixLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsUUFBUTtRQUNqQixLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLFdBQVcsRUFBRSwyREFBMkQ7UUFDeEUsWUFBWSxFQUFFLENBQUMsY0FBYyxDQUFDO1FBQzlCLEtBQUssRUFBRSxHQUFHO0tBQ1g7SUFDRCxhQUFhLEVBQUU7UUFDYixJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRSxFQUFjO1FBQ3ZCLEtBQUssRUFBRSx5QkFBeUI7UUFDaEMsV0FBVyxFQUNULG9HQUFvRztRQUN0RyxZQUFZLEVBQUUsQ0FBQyxjQUFjLENBQUM7UUFDOUIsS0FBSyxFQUFFLEdBQUc7UUFDVixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxlQUFlLEVBQUU7UUFDZixJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRSxFQUFjO1FBQ3ZCLEtBQUssRUFBRSx1Q0FBdUM7UUFDOUMsV0FBVyxFQUNULHFHQUFxRztRQUN2RyxZQUFZLEVBQUUsQ0FBQyxjQUFjLENBQUM7UUFDOUIsS0FBSyxFQUFFLEdBQUc7UUFDVixLQUFLLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtTQUNmO0tBQ0Y7SUFDRCxvQkFBb0IsRUFBRTtRQUNwQixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSw0Q0FBNEM7UUFDckQsS0FBSyxFQUFFLGlDQUFpQztRQUN4QyxXQUFXLEVBQUUsMkNBQTJDO1FBQ3hELFlBQVksRUFBRSxDQUFDLGNBQWMsQ0FBQztRQUM5QixLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0Qsa0JBQWtCLEVBQUU7UUFDbEIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSwyQkFBMkI7UUFDbEMsV0FBVyxFQUFFOzs7O0NBSWhCO1FBQ0csWUFBWSxFQUFFLENBQUMsY0FBYyxDQUFDO1FBQzlCLEtBQUssRUFBRSxHQUFHO0tBQ1g7SUFDRCxzQkFBc0IsRUFBRTtRQUN0QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLG1DQUFtQztRQUMxQyxXQUFXLEVBQUUsbURBQW1EO1FBQ2hFLFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDO1FBQ3BDLEtBQUssRUFBRSxHQUFHO0tBQ1g7SUFDRCxhQUFhLEVBQUU7UUFDYixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxrQkFBa0I7UUFDM0IsS0FBSyxFQUFFLHdDQUF3QztRQUMvQyxXQUFXLEVBQUUsMkNBQTJDO1FBQ3hELFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDO1FBQ3BDLEtBQUssRUFBRSxHQUFHO0tBQ1g7SUFDRCxxQkFBcUIsRUFBRTtRQUNyQixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLGlEQUFpRDtRQUN4RCxXQUFXLEVBQUUsK0JBQStCO1FBQzVDLFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDO1FBQ3BDLEtBQUssRUFBRSxHQUFHO0tBQ1g7SUFDRCxhQUFhLEVBQUU7UUFDYixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsV0FBVyxFQUFFLDJDQUEyQztRQUN4RCxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNwQyxLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0QscUJBQXFCLEVBQUU7UUFDckIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsRUFBRTtRQUNYLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsV0FBVyxFQUFFLCtCQUErQjtRQUM1QyxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNwQyxLQUFLLEVBQUUsR0FBRztLQUNYO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIGJyZWFrT25TaW5nbGVOZXdsaW5lOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAwLFxuICB9LFxuICBsaXZlVXBkYXRlOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDEwLFxuICB9LFxuICBvcGVuUHJldmlld0luU3BsaXRQYW5lOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDIwLFxuICB9LFxuICBwcmV2aWV3U3BsaXRQYW5lRGlyOiB7XG4gICAgdGl0bGU6ICdEaXJlY3Rpb24gdG8gbG9hZCB0aGUgcHJldmlldyBpbiBzcGxpdCBwYW5lJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAncmlnaHQnIGFzICdyaWdodCcgfCAnZG93bicsXG4gICAgZW51bTogWydkb3duJywgJ3JpZ2h0J10sXG4gICAgb3JkZXI6IDI1LFxuICB9LFxuICBncmFtbWFyczoge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogW1xuICAgICAgJ3NvdXJjZS5nZm0nLFxuICAgICAgJ3NvdXJjZS5saXRjb2ZmZWUnLFxuICAgICAgJ3RleHQuaHRtbC5iYXNpYycsXG4gICAgICAndGV4dC5tZCcsXG4gICAgICAndGV4dC5wbGFpbicsXG4gICAgICAndGV4dC5wbGFpbi5udWxsLWdyYW1tYXInLFxuICAgIF0sXG4gICAgb3JkZXI6IDMwLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBleHRlbnNpb25zOiB7XG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICB0aXRsZTogJ01hcmtkb3duIGZpbGUgZXh0ZW5zaW9ucycsXG4gICAgZGVzY3JpcHRpb246ICdXaGljaCBmaWxlcyBhcmUgY29uc2lkZXJlZCBNYXJrZG93bicsXG4gICAgZGVmYXVsdDogWydtYXJrZG93bicsICdtZCcsICdtZG93bicsICdta2QnLCAnbWtkb3duJywgJ3JvbicsICd0eHQnXSxcbiAgICBvcmRlcjogMzEsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiB7XG4gICAgdGl0bGU6ICdFbmFibGUgTWF0aCBSZW5kZXJpbmcgQnkgRGVmYXVsdCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA0MCxcbiAgfSxcbiAgdXNlTGF6eUhlYWRlcnM6IHtcbiAgICB0aXRsZTogJ1VzZSBMYXp5IEhlYWRlcnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVxdWlyZSBubyBzcGFjZSBhZnRlciBoZWFkaW5ncyAjJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogNDUsXG4gIH0sXG4gIHVzZUNoZWNrQm94ZXM6IHtcbiAgICB0aXRsZTogJ0VuYWJsZSBDaGVja0JveCBsaXN0cycsXG4gICAgZGVzY3JpcHRpb246ICdDaGVja0JveCBsaXN0cywgbGlrZSBvbiBHaXRIdWInLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA0NixcbiAgfSxcbiAgdXNlRW1vamk6IHtcbiAgICB0aXRsZTogJ1VzZSBFbW9qaScsXG4gICAgZGVzY3JpcHRpb246ICdFbW9qaSByZW5kZXJpbmcnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA0NyxcbiAgfSxcbiAgaW5saW5lTWF0aFNlcGFyYXRvcnM6IHtcbiAgICB0aXRsZTogJ0lubGluZSBtYXRoIHNlcGFyYXRvcnMnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0xpc3Qgb2YgaW5saW5lIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogWyckJywgJyQnLCAnXFxcXCgnLCAnXFxcXCknXSxcbiAgICBvcmRlcjogNDgsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIGJsb2NrTWF0aFNlcGFyYXRvcnM6IHtcbiAgICB0aXRsZTogJ0Jsb2NrIG1hdGggc2VwYXJhdG9ycycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnTGlzdCBvZiBibG9jayBtYXRoIHNlcGFyYXRvcnMgaW4gcGFpcnMgLS0gZmlyc3Qgb3BlbmluZywgdGhlbiBjbG9zaW5nJyxcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGRlZmF1bHQ6IFsnJCQnLCAnJCQnLCAnXFxcXFsnLCAnXFxcXF0nXSxcbiAgICBvcmRlcjogNDguMSxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgdXNlR2l0SHViU3R5bGU6IHtcbiAgICB0aXRsZTogJ1VzZSBHaXRIdWIuY29tIHN0eWxlJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDUwLFxuICB9LFxuICBlbmFibGVQYW5kb2M6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGl0bGU6ICdFbmFibGUgUGFuZG9jIFBhcnNlcicsXG4gICAgb3JkZXI6IDEwMCxcbiAgfSxcbiAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBkZXNjcmlwdGlvbjogYFxcXG5Eb24ndCBjb252ZXJ0IGZlbmNlZCBjb2RlIGJsb2NrcyB0byBBdG9tIGVkaXRvcnMgd2hlbiB1c2luZ1xuUGFuZG9jIHBhcnNlcmAsXG4gICAgb3JkZXI6IDEwNSxcbiAgfSxcbiAgcGFuZG9jUGF0aDoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdwYW5kb2MnLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IFBhdGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnUGxlYXNlIHNwZWNpZnkgdGhlIGNvcnJlY3QgcGF0aCB0byB5b3VyIHBhbmRvYyBleGVjdXRhYmxlJyxcbiAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ10sXG4gICAgb3JkZXI6IDExMCxcbiAgfSxcbiAgcGFuZG9jRmlsdGVyczoge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogW10gYXMgc3RyaW5nW10sXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogRmlsdGVycycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBmaWx0ZXJzLCBpbiBvcmRlciBvZiBhcHBsaWNhdGlvbi4gV2lsbCBiZSBwYXNzZWQgdmlhIGNvbW1hbmQtbGluZSBhcmd1bWVudHMnLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTE1LFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBwYW5kb2NBcmd1bWVudHM6IHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGRlZmF1bHQ6IFtdIGFzIHN0cmluZ1tdLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IENvbW1hbmRsaW5lIEFyZ3VtZW50cycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBhcmd1bWVudHMgZS5nLiBgLS1zbWFydCwgLS1maWx0ZXI9L2Jpbi9leGVgLiBQbGVhc2UgdXNlIGxvbmcgYXJndW1lbnQgbmFtZXMuJyxcbiAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ10sXG4gICAgb3JkZXI6IDEyMCxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnbWFya2Rvd24tcmF3X3RleCt0ZXhfbWF0aF9zaW5nbGVfYmFja3NsYXNoJyxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBNYXJrZG93biBGbGF2b3InLFxuICAgIGRlc2NyaXB0aW9uOiAnRW50ZXIgdGhlIHBhbmRvYyBtYXJrZG93biBmbGF2b3IgeW91IHdhbnQnLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTMwLFxuICB9LFxuICBwYW5kb2NCaWJsaW9ncmFwaHk6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogQ2l0YXRpb25zJyxcbiAgICBkZXNjcmlwdGlvbjogYFxcXG5FbmFibGUgdGhpcyBmb3IgYmlibGlvZ3JhcGh5IHBhcnNpbmcuXG5Ob3RlOiBwYW5kb2MtY2l0ZXByb2MgaXMgYXBwbGllZCBhZnRlciBvdGhlciBmaWx0ZXJzIHNwZWNpZmllZCBpblxuRmlsdGVycywgYnV0IGJlZm9yZSBvdGhlciBjb21tYW5kbGluZSBhcmd1bWVudHNcXFxuYCxcbiAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ10sXG4gICAgb3JkZXI6IDE0MCxcbiAgfSxcbiAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IFJlbW92ZSBSZWZlcmVuY2VzJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlbW92ZXMgcmVmZXJlbmNlcyBhdCB0aGUgZW5kIG9mIHRoZSBIVE1MIHByZXZpZXcnLFxuICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXSxcbiAgICBvcmRlcjogMTUwLFxuICB9LFxuICBwYW5kb2NCSUJGaWxlOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2JpYmxpb2dyYXBoeS5iaWInLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IEJpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxuICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBiaWJmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXSxcbiAgICBvcmRlcjogMTYwLFxuICB9LFxuICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBiaWJmaWxlJyxcbiAgICBkZXBlbmRlbmNpZXM6IFsncGFuZG9jQmlibGlvZ3JhcGh5J10sXG4gICAgb3JkZXI6IDE2NSxcbiAgfSxcbiAgcGFuZG9jQ1NMRmlsZToge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdjdXN0b20uY3NsJyxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgY3NsZmlsZSB0byBzZWFyY2ggZm9yIHJlY3Vyc2l2ZWx5JyxcbiAgICBkZXBlbmRlbmNpZXM6IFsncGFuZG9jQmlibGlvZ3JhcGh5J10sXG4gICAgb3JkZXI6IDE3MCxcbiAgfSxcbiAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogRmFsbGJhY2sgQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKScsXG4gICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgY3NsZmlsZScsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddLFxuICAgIG9yZGVyOiAxNzUsXG4gIH0sXG59XG5cbi8vIGdlbmVyYXRlZCBieSB0eXBlZC1jb25maWcuanNcbmRlY2xhcmUgbW9kdWxlICdhdG9tJyB7XG4gIGludGVyZmFjZSBDb25maWdWYWx1ZXMge1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMub3BlblByZXZpZXdJblNwbGl0UGFuZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdTcGxpdFBhbmVEaXInOiAnZG93bicgfCAncmlnaHQnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlTGF6eUhlYWRlcnMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VDaGVja0JveGVzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlRW1vamknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5pbmxpbmVNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ibG9ja01hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlUGFuZG9jJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY1BhdGgnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQXJndW1lbnRzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY01hcmtkb3duRmxhdm9yJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQklCRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDU0xGaWxlJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDU0xGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzJzoge1xuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cbiAgICAgIGxpdmVVcGRhdGU6IGJvb2xlYW5cbiAgICAgIG9wZW5QcmV2aWV3SW5TcGxpdFBhbmU6IGJvb2xlYW5cbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6ICdkb3duJyB8ICdyaWdodCdcbiAgICAgIGdyYW1tYXJzOiBzdHJpbmdbXVxuICAgICAgZXh0ZW5zaW9uczogc3RyaW5nW11cbiAgICAgIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiBib29sZWFuXG4gICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxuICAgICAgdXNlQ2hlY2tCb3hlczogYm9vbGVhblxuICAgICAgdXNlRW1vamk6IGJvb2xlYW5cbiAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIHVzZUdpdEh1YlN0eWxlOiBib29sZWFuXG4gICAgICBlbmFibGVQYW5kb2M6IGJvb2xlYW5cbiAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cbiAgICAgIHBhbmRvY1BhdGg6IHN0cmluZ1xuICAgICAgcGFuZG9jRmlsdGVyczogc3RyaW5nW11cbiAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cbiAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiBzdHJpbmdcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeTogYm9vbGVhblxuICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxuICAgICAgcGFuZG9jQklCRmlsZTogc3RyaW5nXG4gICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXG4gICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgIH1cbiAgfVxufVxuIl19