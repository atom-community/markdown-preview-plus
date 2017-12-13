"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
    breakOnSingleNewline: {
        type: "boolean",
        default: false,
        order: 0
    },
    liveUpdate: {
        type: "boolean",
        default: true,
        order: 10
    },
    openPreviewInSplitPane: {
        type: "boolean",
        default: true,
        order: 20
    },
    previewSplitPaneDir: {
        title: "Direction to load the preview in split pane",
        type: "string",
        default: "right",
        enum: ["down", "right"],
        order: 25
    },
    grammars: {
        type: "array",
        default: [
            "source.gfm",
            "source.litcoffee",
            "text.html.basic",
            "text.md",
            "text.plain",
            "text.plain.null-grammar"
        ],
        order: 30
    },
    enableLatexRenderingByDefault: {
        title: "Enable Math Rendering By Default",
        type: "boolean",
        default: false,
        order: 40
    },
    useLazyHeaders: {
        title: "Use Lazy Headers",
        description: "Require no space after headings #",
        type: "boolean",
        default: true,
        order: 45
    },
    useGitHubStyle: {
        title: "Use GitHub.com style",
        type: "boolean",
        default: false,
        order: 50
    },
    enablePandoc: {
        type: "boolean",
        default: false,
        title: "Enable Pandoc Parser",
        order: 100
    },
    useNativePandocCodeStyles: {
        type: "boolean",
        default: false,
        description: `\
Don't convert fenced code blocks to Atom editors when using
Pandoc parser`,
        order: 105
    },
    pandocPath: {
        type: "string",
        default: "pandoc",
        title: "Pandoc Options: Path",
        description: "Please specify the correct path to your pandoc executable",
        dependencies: ["enablePandoc"],
        order: 110
    },
    pandocFilters: {
        type: "array",
        default: [],
        title: "Pandoc Options: Filters",
        description: "Comma separated pandoc filters, in order of application. Will be passed via command-line arguments",
        dependencies: ["enablePandoc"],
        order: 115
    },
    pandocArguments: {
        type: "array",
        default: [],
        title: "Pandoc Options: Commandline Arguments",
        description: "Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.",
        dependencies: ["enablePandoc"],
        order: 120
    },
    pandocMarkdownFlavor: {
        type: "string",
        default: "markdown-raw_tex+tex_math_single_backslash",
        title: "Pandoc Options: Markdown Flavor",
        description: "Enter the pandoc markdown flavor you want",
        dependencies: ["enablePandoc"],
        order: 130
    },
    pandocBibliography: {
        type: "boolean",
        default: false,
        title: "Pandoc Options: Citations",
        description: `\
Enable this for bibliography parsing.
Note: pandoc-citeproc is applied after other filters specified in
Filters, but before other commandline arguments\
`,
        dependencies: ["enablePandoc"],
        order: 140
    },
    pandocRemoveReferences: {
        type: "boolean",
        default: true,
        title: "Pandoc Options: Remove References",
        description: "Removes references at the end of the HTML preview",
        dependencies: ["pandocBibliography"],
        order: 150
    },
    pandocBIBFile: {
        type: "string",
        default: "bibliography.bib",
        title: "Pandoc Options: Bibliography (bibfile)",
        description: "Name of bibfile to search for recursively",
        dependencies: ["pandocBibliography"],
        order: 160
    },
    pandocBIBFileFallback: {
        type: "string",
        default: "",
        title: "Pandoc Options: Fallback Bibliography (bibfile)",
        description: "Full path to fallback bibfile",
        dependencies: ["pandocBibliography"],
        order: 165
    },
    pandocCSLFile: {
        type: "string",
        default: "custom.csl",
        title: "Pandoc Options: Bibliography Style (cslfile)",
        description: "Name of cslfile to search for recursively",
        dependencies: ["pandocBibliography"],
        order: 170
    },
    pandocCSLFileFallback: {
        type: "string",
        default: "",
        title: "Pandoc Options: Fallback Bibliography Style (cslfile)",
        description: "Full path to fallback cslfile",
        dependencies: ["pandocBibliography"],
        order: 175
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFhLFFBQUEsTUFBTSxHQUFHO0lBQ3BCLG9CQUFvQixFQUFFO1FBQ3BCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxzQkFBc0IsRUFBRTtRQUN0QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELG1CQUFtQixFQUFFO1FBQ25CLEtBQUssRUFBRSw2Q0FBNkM7UUFDcEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsT0FBTztRQUNoQixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO1FBQ3ZCLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxRQUFRLEVBQUU7UUFDUixJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRTtZQUNQLFlBQVk7WUFDWixrQkFBa0I7WUFDbEIsaUJBQWlCO1lBQ2pCLFNBQVM7WUFDVCxZQUFZO1lBQ1oseUJBQXlCO1NBQzFCO1FBQ0QsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELDZCQUE2QixFQUFFO1FBQzdCLEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLFdBQVcsRUFBRSxtQ0FBbUM7UUFDaEQsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFO0tBQ1Y7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RUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLHVEQUF1RDtRQUM5RCxXQUFXLEVBQUUsK0JBQStCO1FBQzVDLFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDO1FBQ3BDLEtBQUssRUFBRSxHQUFHO0tBQ1g7Q0FDRixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IHtcbiAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMFxuICB9LFxuICBsaXZlVXBkYXRlOiB7XG4gICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogMTBcbiAgfSxcbiAgb3BlblByZXZpZXdJblNwbGl0UGFuZToge1xuICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDIwXG4gIH0sXG4gIHByZXZpZXdTcGxpdFBhbmVEaXI6IHtcbiAgICB0aXRsZTogXCJEaXJlY3Rpb24gdG8gbG9hZCB0aGUgcHJldmlldyBpbiBzcGxpdCBwYW5lXCIsXG4gICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICBkZWZhdWx0OiBcInJpZ2h0XCIsXG4gICAgZW51bTogW1wiZG93blwiLCBcInJpZ2h0XCJdLFxuICAgIG9yZGVyOiAyNVxuICB9LFxuICBncmFtbWFyczoge1xuICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICBkZWZhdWx0OiBbXG4gICAgICBcInNvdXJjZS5nZm1cIixcbiAgICAgIFwic291cmNlLmxpdGNvZmZlZVwiLFxuICAgICAgXCJ0ZXh0Lmh0bWwuYmFzaWNcIixcbiAgICAgIFwidGV4dC5tZFwiLFxuICAgICAgXCJ0ZXh0LnBsYWluXCIsXG4gICAgICBcInRleHQucGxhaW4ubnVsbC1ncmFtbWFyXCJcbiAgICBdLFxuICAgIG9yZGVyOiAzMFxuICB9LFxuICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDoge1xuICAgIHRpdGxlOiBcIkVuYWJsZSBNYXRoIFJlbmRlcmluZyBCeSBEZWZhdWx0XCIsXG4gICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDQwXG4gIH0sXG4gIHVzZUxhenlIZWFkZXJzOiB7XG4gICAgdGl0bGU6IFwiVXNlIExhenkgSGVhZGVyc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlcXVpcmUgbm8gc3BhY2UgYWZ0ZXIgaGVhZGluZ3MgI1wiLFxuICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDQ1XG4gIH0sXG4gIHVzZUdpdEh1YlN0eWxlOiB7XG4gICAgdGl0bGU6IFwiVXNlIEdpdEh1Yi5jb20gc3R5bGVcIixcbiAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNTBcbiAgfSxcbiAgZW5hYmxlUGFuZG9jOiB7XG4gICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGl0bGU6IFwiRW5hYmxlIFBhbmRvYyBQYXJzZXJcIixcbiAgICBvcmRlcjogMTAwXG4gIH0sXG4gIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IHtcbiAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBkZXNjcmlwdGlvbjogYFxcXG5Eb24ndCBjb252ZXJ0IGZlbmNlZCBjb2RlIGJsb2NrcyB0byBBdG9tIGVkaXRvcnMgd2hlbiB1c2luZ1xuUGFuZG9jIHBhcnNlcmAsXG4gICAgb3JkZXI6IDEwNVxuICB9LFxuICBwYW5kb2NQYXRoOiB7XG4gICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICBkZWZhdWx0OiBcInBhbmRvY1wiLFxuICAgIHRpdGxlOiBcIlBhbmRvYyBPcHRpb25zOiBQYXRoXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUGxlYXNlIHNwZWNpZnkgdGhlIGNvcnJlY3QgcGF0aCB0byB5b3VyIHBhbmRvYyBleGVjdXRhYmxlXCIsXG4gICAgZGVwZW5kZW5jaWVzOiBbXCJlbmFibGVQYW5kb2NcIl0sXG4gICAgb3JkZXI6IDExMFxuICB9LFxuICBwYW5kb2NGaWx0ZXJzOiB7XG4gICAgdHlwZTogXCJhcnJheVwiLFxuICAgIGRlZmF1bHQ6IFtdLFxuICAgIHRpdGxlOiBcIlBhbmRvYyBPcHRpb25zOiBGaWx0ZXJzXCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICBcIkNvbW1hIHNlcGFyYXRlZCBwYW5kb2MgZmlsdGVycywgaW4gb3JkZXIgb2YgYXBwbGljYXRpb24uIFdpbGwgYmUgcGFzc2VkIHZpYSBjb21tYW5kLWxpbmUgYXJndW1lbnRzXCIsXG4gICAgZGVwZW5kZW5jaWVzOiBbXCJlbmFibGVQYW5kb2NcIl0sXG4gICAgb3JkZXI6IDExNVxuICB9LFxuICBwYW5kb2NBcmd1bWVudHM6IHtcbiAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgZGVmYXVsdDogW10sXG4gICAgdGl0bGU6IFwiUGFuZG9jIE9wdGlvbnM6IENvbW1hbmRsaW5lIEFyZ3VtZW50c1wiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgXCJDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGFyZ3VtZW50cyBlLmcuIGAtLXNtYXJ0LCAtLWZpbHRlcj0vYmluL2V4ZWAuIFBsZWFzZSB1c2UgbG9uZyBhcmd1bWVudCBuYW1lcy5cIixcbiAgICBkZXBlbmRlbmNpZXM6IFtcImVuYWJsZVBhbmRvY1wiXSxcbiAgICBvcmRlcjogMTIwXG4gIH0sXG4gIHBhbmRvY01hcmtkb3duRmxhdm9yOiB7XG4gICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICBkZWZhdWx0OiBcIm1hcmtkb3duLXJhd190ZXgrdGV4X21hdGhfc2luZ2xlX2JhY2tzbGFzaFwiLFxuICAgIHRpdGxlOiBcIlBhbmRvYyBPcHRpb25zOiBNYXJrZG93biBGbGF2b3JcIixcbiAgICBkZXNjcmlwdGlvbjogXCJFbnRlciB0aGUgcGFuZG9jIG1hcmtkb3duIGZsYXZvciB5b3Ugd2FudFwiLFxuICAgIGRlcGVuZGVuY2llczogW1wiZW5hYmxlUGFuZG9jXCJdLFxuICAgIG9yZGVyOiAxMzBcbiAgfSxcbiAgcGFuZG9jQmlibGlvZ3JhcGh5OiB7XG4gICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGl0bGU6IFwiUGFuZG9jIE9wdGlvbnM6IENpdGF0aW9uc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBgXFxcbkVuYWJsZSB0aGlzIGZvciBiaWJsaW9ncmFwaHkgcGFyc2luZy5cbk5vdGU6IHBhbmRvYy1jaXRlcHJvYyBpcyBhcHBsaWVkIGFmdGVyIG90aGVyIGZpbHRlcnMgc3BlY2lmaWVkIGluXG5GaWx0ZXJzLCBidXQgYmVmb3JlIG90aGVyIGNvbW1hbmRsaW5lIGFyZ3VtZW50c1xcXG5gLFxuICAgIGRlcGVuZGVuY2llczogW1wiZW5hYmxlUGFuZG9jXCJdLFxuICAgIG9yZGVyOiAxNDBcbiAgfSxcbiAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczoge1xuICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGl0bGU6IFwiUGFuZG9jIE9wdGlvbnM6IFJlbW92ZSBSZWZlcmVuY2VzXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlld1wiLFxuICAgIGRlcGVuZGVuY2llczogW1wicGFuZG9jQmlibGlvZ3JhcGh5XCJdLFxuICAgIG9yZGVyOiAxNTBcbiAgfSxcbiAgcGFuZG9jQklCRmlsZToge1xuICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgZGVmYXVsdDogXCJiaWJsaW9ncmFwaHkuYmliXCIsXG4gICAgdGl0bGU6IFwiUGFuZG9jIE9wdGlvbnM6IEJpYmxpb2dyYXBoeSAoYmliZmlsZSlcIixcbiAgICBkZXNjcmlwdGlvbjogXCJOYW1lIG9mIGJpYmZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseVwiLFxuICAgIGRlcGVuZGVuY2llczogW1wicGFuZG9jQmlibGlvZ3JhcGh5XCJdLFxuICAgIG9yZGVyOiAxNjBcbiAgfSxcbiAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOiB7XG4gICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICBkZWZhdWx0OiBcIlwiLFxuICAgIHRpdGxlOiBcIlBhbmRvYyBPcHRpb25zOiBGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpXCIsXG4gICAgZGVzY3JpcHRpb246IFwiRnVsbCBwYXRoIHRvIGZhbGxiYWNrIGJpYmZpbGVcIixcbiAgICBkZXBlbmRlbmNpZXM6IFtcInBhbmRvY0JpYmxpb2dyYXBoeVwiXSxcbiAgICBvcmRlcjogMTY1XG4gIH0sXG4gIHBhbmRvY0NTTEZpbGU6IHtcbiAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgIGRlZmF1bHQ6IFwiY3VzdG9tLmNzbFwiLFxuICAgIHRpdGxlOiBcIlBhbmRvYyBPcHRpb25zOiBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpXCIsXG4gICAgZGVzY3JpcHRpb246IFwiTmFtZSBvZiBjc2xmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHlcIixcbiAgICBkZXBlbmRlbmNpZXM6IFtcInBhbmRvY0JpYmxpb2dyYXBoeVwiXSxcbiAgICBvcmRlcjogMTcwXG4gIH0sXG4gIHBhbmRvY0NTTEZpbGVGYWxsYmFjazoge1xuICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgZGVmYXVsdDogXCJcIixcbiAgICB0aXRsZTogXCJQYW5kb2MgT3B0aW9uczogRmFsbGJhY2sgQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkZ1bGwgcGF0aCB0byBmYWxsYmFjayBjc2xmaWxlXCIsXG4gICAgZGVwZW5kZW5jaWVzOiBbXCJwYW5kb2NCaWJsaW9ncmFwaHlcIl0sXG4gICAgb3JkZXI6IDE3NVxuICB9XG59XG4iXX0=