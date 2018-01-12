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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFhLFFBQUEsTUFBTSxHQUFHO0lBQ3BCLG9CQUFvQixFQUFFO1FBQ3BCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxzQkFBc0IsRUFBRTtRQUN0QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELG1CQUFtQixFQUFFO1FBQ25CLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsT0FBMkI7UUFDcEMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztRQUN2QixLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUU7WUFDUCxZQUFZO1lBQ1osa0JBQWtCO1lBQ2xCLGlCQUFpQjtZQUNqQixTQUFTO1lBQ1QsWUFBWTtZQUNaLHlCQUF5QjtTQUMxQjtRQUNELEtBQUssRUFBRSxFQUFFO1FBQ1QsS0FBSyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFFBQVE7U0FDZjtLQUNGO0lBQ0QsNkJBQTZCLEVBQUU7UUFDN0IsS0FBSyxFQUFFLGtDQUFrQztRQUN6QyxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELGNBQWMsRUFBRTtRQUNkLEtBQUssRUFBRSxrQkFBa0I7UUFDekIsV0FBVyxFQUFFLG1DQUFtQztRQUNoRCxJQUFJLEVBQUUsU0FBUztRQUNm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QUMsb0JBQW9CLENBQUM7UUFDcEMsS0FBSyxFQUFFLEdBQUc7S0FDWDtJQUNELGFBQWEsRUFBRTtRQUNiLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLFlBQVk7UUFDckIsS0FBSyxFQUFFLDhDQUE4QztRQUNyRCxXQUFXLEVBQUUsMkNBQTJDO1FBQ3hELFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDO1FBQ3BDLEtBQUssRUFBRSxHQUFHO0tBQ1g7SUFDRCxxQkFBcUIsRUFBRTtRQUNyQixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLHVEQUF1RDtRQUM5RCxXQUFXLEVBQUUsK0JBQStCO1FBQzVDLFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDO1FBQ3BDLEtBQUssRUFBRSxHQUFHO0tBQ1g7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDAsXG4gIH0sXG4gIGxpdmVVcGRhdGU6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogMTAsXG4gIH0sXG4gIG9wZW5QcmV2aWV3SW5TcGxpdFBhbmU6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogMjAsXG4gIH0sXG4gIHByZXZpZXdTcGxpdFBhbmVEaXI6IHtcbiAgICB0aXRsZTogJ0RpcmVjdGlvbiB0byBsb2FkIHRoZSBwcmV2aWV3IGluIHNwbGl0IHBhbmUnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdyaWdodCcgYXMgJ3JpZ2h0JyB8ICdkb3duJyxcbiAgICBlbnVtOiBbJ2Rvd24nLCAncmlnaHQnXSxcbiAgICBvcmRlcjogMjUsXG4gIH0sXG4gIGdyYW1tYXJzOiB7XG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBkZWZhdWx0OiBbXG4gICAgICAnc291cmNlLmdmbScsXG4gICAgICAnc291cmNlLmxpdGNvZmZlZScsXG4gICAgICAndGV4dC5odG1sLmJhc2ljJyxcbiAgICAgICd0ZXh0Lm1kJyxcbiAgICAgICd0ZXh0LnBsYWluJyxcbiAgICAgICd0ZXh0LnBsYWluLm51bGwtZ3JhbW1hcicsXG4gICAgXSxcbiAgICBvcmRlcjogMzAsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIGVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0OiB7XG4gICAgdGl0bGU6ICdFbmFibGUgTWF0aCBSZW5kZXJpbmcgQnkgRGVmYXVsdCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA0MCxcbiAgfSxcbiAgdXNlTGF6eUhlYWRlcnM6IHtcbiAgICB0aXRsZTogJ1VzZSBMYXp5IEhlYWRlcnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVxdWlyZSBubyBzcGFjZSBhZnRlciBoZWFkaW5ncyAjJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogNDUsXG4gIH0sXG4gIHVzZUNoZWNrQm94ZXM6IHtcbiAgICB0aXRsZTogJ0VuYWJsZSBDaGVja0JveCBsaXN0cycsXG4gICAgZGVzY3JpcHRpb246ICdDaGVja0JveCBsaXN0cywgbGlrZSBvbiBHaXRIdWInLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA0NixcbiAgfSxcbiAgdXNlR2l0SHViU3R5bGU6IHtcbiAgICB0aXRsZTogJ1VzZSBHaXRIdWIuY29tIHN0eWxlJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDUwLFxuICB9LFxuICBlbmFibGVQYW5kb2M6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGl0bGU6ICdFbmFibGUgUGFuZG9jIFBhcnNlcicsXG4gICAgb3JkZXI6IDEwMCxcbiAgfSxcbiAgdXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlczoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBkZXNjcmlwdGlvbjogYFxcXG5Eb24ndCBjb252ZXJ0IGZlbmNlZCBjb2RlIGJsb2NrcyB0byBBdG9tIGVkaXRvcnMgd2hlbiB1c2luZ1xuUGFuZG9jIHBhcnNlcmAsXG4gICAgb3JkZXI6IDEwNSxcbiAgfSxcbiAgcGFuZG9jUGF0aDoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdwYW5kb2MnLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IFBhdGgnLFxuICAgIGRlc2NyaXB0aW9uOiAnUGxlYXNlIHNwZWNpZnkgdGhlIGNvcnJlY3QgcGF0aCB0byB5b3VyIHBhbmRvYyBleGVjdXRhYmxlJyxcbiAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ10sXG4gICAgb3JkZXI6IDExMCxcbiAgfSxcbiAgcGFuZG9jRmlsdGVyczoge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogW10gYXMgc3RyaW5nW10sXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogRmlsdGVycycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBmaWx0ZXJzLCBpbiBvcmRlciBvZiBhcHBsaWNhdGlvbi4gV2lsbCBiZSBwYXNzZWQgdmlhIGNvbW1hbmQtbGluZSBhcmd1bWVudHMnLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTE1LFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBwYW5kb2NBcmd1bWVudHM6IHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGRlZmF1bHQ6IFtdIGFzIHN0cmluZ1tdLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IENvbW1hbmRsaW5lIEFyZ3VtZW50cycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBhcmd1bWVudHMgZS5nLiBgLS1zbWFydCwgLS1maWx0ZXI9L2Jpbi9leGVgLiBQbGVhc2UgdXNlIGxvbmcgYXJndW1lbnQgbmFtZXMuJyxcbiAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ10sXG4gICAgb3JkZXI6IDEyMCxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgcGFuZG9jTWFya2Rvd25GbGF2b3I6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnbWFya2Rvd24tcmF3X3RleCt0ZXhfbWF0aF9zaW5nbGVfYmFja3NsYXNoJyxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBNYXJrZG93biBGbGF2b3InLFxuICAgIGRlc2NyaXB0aW9uOiAnRW50ZXIgdGhlIHBhbmRvYyBtYXJrZG93biBmbGF2b3IgeW91IHdhbnQnLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTMwLFxuICB9LFxuICBwYW5kb2NCaWJsaW9ncmFwaHk6IHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogQ2l0YXRpb25zJyxcbiAgICBkZXNjcmlwdGlvbjogYFxcXG5FbmFibGUgdGhpcyBmb3IgYmlibGlvZ3JhcGh5IHBhcnNpbmcuXG5Ob3RlOiBwYW5kb2MtY2l0ZXByb2MgaXMgYXBwbGllZCBhZnRlciBvdGhlciBmaWx0ZXJzIHNwZWNpZmllZCBpblxuRmlsdGVycywgYnV0IGJlZm9yZSBvdGhlciBjb21tYW5kbGluZSBhcmd1bWVudHNcXFxuYCxcbiAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ10sXG4gICAgb3JkZXI6IDE0MCxcbiAgfSxcbiAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IFJlbW92ZSBSZWZlcmVuY2VzJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JlbW92ZXMgcmVmZXJlbmNlcyBhdCB0aGUgZW5kIG9mIHRoZSBIVE1MIHByZXZpZXcnLFxuICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXSxcbiAgICBvcmRlcjogMTUwLFxuICB9LFxuICBwYW5kb2NCSUJGaWxlOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2JpYmxpb2dyYXBoeS5iaWInLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IEJpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxuICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBiaWJmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXSxcbiAgICBvcmRlcjogMTYwLFxuICB9LFxuICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBiaWJmaWxlJyxcbiAgICBkZXBlbmRlbmNpZXM6IFsncGFuZG9jQmlibGlvZ3JhcGh5J10sXG4gICAgb3JkZXI6IDE2NSxcbiAgfSxcbiAgcGFuZG9jQ1NMRmlsZToge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdjdXN0b20uY3NsJyxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgY3NsZmlsZSB0byBzZWFyY2ggZm9yIHJlY3Vyc2l2ZWx5JyxcbiAgICBkZXBlbmRlbmNpZXM6IFsncGFuZG9jQmlibGlvZ3JhcGh5J10sXG4gICAgb3JkZXI6IDE3MCxcbiAgfSxcbiAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJycsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogRmFsbGJhY2sgQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKScsXG4gICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgY3NsZmlsZScsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddLFxuICAgIG9yZGVyOiAxNzUsXG4gIH0sXG59XG5cbmRlY2xhcmUgbW9kdWxlICdhdG9tJyB7XG4gIGludGVyZmFjZSBDb25maWdWYWx1ZXMge1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYnJlYWtPblNpbmdsZU5ld2xpbmUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMub3BlblByZXZpZXdJblNwbGl0UGFuZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnByZXZpZXdTcGxpdFBhbmVEaXInOiAnZG93bicgfCAncmlnaHQnXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUxhenlIZWFkZXJzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlQ2hlY2tCb3hlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlUGFuZG9jJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY1BhdGgnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQXJndW1lbnRzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY01hcmtkb3duRmxhdm9yJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQklCRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDU0xGaWxlJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDU0xGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzJzoge1xuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cbiAgICAgIGxpdmVVcGRhdGU6IGJvb2xlYW5cbiAgICAgIG9wZW5QcmV2aWV3SW5TcGxpdFBhbmU6IGJvb2xlYW5cbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6ICdkb3duJyB8ICdyaWdodCdcbiAgICAgIGdyYW1tYXJzOiBzdHJpbmdbXVxuICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IGJvb2xlYW5cbiAgICAgIHVzZUxhenlIZWFkZXJzOiBib29sZWFuXG4gICAgICB1c2VDaGVja0JveGVzOiBib29sZWFuXG4gICAgICB1c2VHaXRIdWJTdHlsZTogYm9vbGVhblxuICAgICAgZW5hYmxlUGFuZG9jOiBib29sZWFuXG4gICAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiBib29sZWFuXG4gICAgICBwYW5kb2NQYXRoOiBzdHJpbmdcbiAgICAgIHBhbmRvY0ZpbHRlcnM6IHN0cmluZ1tdXG4gICAgICBwYW5kb2NBcmd1bWVudHM6IHN0cmluZ1tdXG4gICAgICBwYW5kb2NNYXJrZG93bkZsYXZvcjogc3RyaW5nXG4gICAgICBwYW5kb2NCaWJsaW9ncmFwaHk6IGJvb2xlYW5cbiAgICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6IGJvb2xlYW5cbiAgICAgIHBhbmRvY0JJQkZpbGU6IHN0cmluZ1xuICAgICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICAgIHBhbmRvY0NTTEZpbGU6IHN0cmluZ1xuICAgICAgcGFuZG9jQ1NMRmlsZUZhbGxiYWNrOiBzdHJpbmdcbiAgICB9XG4gIH1cbn1cbiJdfQ==