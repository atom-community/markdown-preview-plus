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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFhLFFBQUEsTUFBTSxHQUFHO0lBQ3BCLG9CQUFvQixFQUFFO1FBQ3BCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxtQkFBbUIsRUFBRTtRQUNuQixLQUFLLEVBQUUsNkNBQTZDO1FBQ3BELElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLE9BQW9DO1FBQzdDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDO1FBQy9CLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxXQUFXLEVBQUU7UUFDWCxLQUFLLEVBQUUsc0JBQXNCO1FBQzdCLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLFFBQWtEO1FBQzNELElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQztRQUMzQyxLQUFLLEVBQUUsRUFBRTtLQUNWO0lBQ0Qsc0JBQXNCLEVBQUU7UUFDdEIsS0FBSyxFQUFFLGtDQUFrQztRQUN6QyxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLEVBQUU7S0FDVjtJQUNELHlCQUF5QixFQUFFO1FBQ3pCLEtBQUssRUFBRSx3Q0FBd0M7UUFDL0MsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxFQUFFO0tBQ1Y7SUFDRCxtQkFBbUIsRUFBRTtRQUNuQixLQUFLLEVBQUUsbURBQW1EO1FBQzFELElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFF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QUFvQixDQUFDO1FBQ3BDLEtBQUssRUFBRSxHQUFHO0tBQ1g7SUFDRCxhQUFhLEVBQUU7UUFDYixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLEtBQUssRUFBRSw4Q0FBOEM7UUFDckQsV0FBVyxFQUFFLDJDQUEyQztRQUN4RCxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNwQyxLQUFLLEVBQUUsR0FBRztLQUNYO0lBQ0QscUJBQXFCLEVBQUU7UUFDckIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsRUFBRTtRQUNYLEtBQUssRUFBRSx1REFBdUQ7UUFDOUQsV0FBVyxFQUFFLCtCQUErQjtRQUM1QyxZQUFZLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztRQUNwQyxLQUFLLEVBQUUsR0FBRztLQUNYO0NBQ0YsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIGJyZWFrT25TaW5nbGVOZXdsaW5lOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAwLFxuICB9LFxuICBsaXZlVXBkYXRlOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDEwLFxuICB9LFxuICBwcmV2aWV3U3BsaXRQYW5lRGlyOiB7XG4gICAgdGl0bGU6ICdEaXJlY3Rpb24gdG8gbG9hZCB0aGUgcHJldmlldyBpbiBzcGxpdCBwYW5lJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAncmlnaHQnIGFzICdyaWdodCcgfCAnZG93bicgfCAnbm9uZScsXG4gICAgZW51bTogWydkb3duJywgJ3JpZ2h0JywgJ25vbmUnXSxcbiAgICBvcmRlcjogMjAsXG4gIH0sXG4gIHByZXZpZXdEb2NrOiB7XG4gICAgdGl0bGU6ICdPcGVuIHByZXZpZXcgaW4gZG9jaycsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2NlbnRlcicgYXMgJ2xlZnQnIHwgJ3JpZ2h0JyB8ICdib3R0b20nIHwgJ2NlbnRlcicsXG4gICAgZW51bTogWydsZWZ0JywgJ3JpZ2h0JywgJ2JvdHRvbScsICdjZW50ZXInXSxcbiAgICBvcmRlcjogMjUsXG4gIH0sXG4gIGNsb3NlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICB0aXRsZTogJ0Nsb3NlIHByZXZpZXcgd2hlbiBlZGl0b3IgY2xvc2VzJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogMjYsXG4gIH0sXG4gIGFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3I6IHtcbiAgICB0aXRsZTogJ0JyaW5nIHVwIHByZXZpZXcgd2hlbiBlZGl0b3IgYWN0aXZhdGVzJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDI3LFxuICB9LFxuICBzeW5jUHJldmlld09uQ2hhbmdlOiB7XG4gICAgdGl0bGU6ICdTeW5jIHByZXZpZXcgcG9zaXRpb24gd2hlbiB0ZXh0IGluIGVkaXRvciBjaGFuZ2VzJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDI4LFxuICB9LFxuICBzeW5jUHJldmlld09uRWRpdG9yU2Nyb2xsOiB7XG4gICAgdGl0bGU6ICdTeW5jIHByZXZpZXcgcG9zaXRpb24gd2hlbiB0ZXh0IGVkaXRvciBpcyBzY3JvbGxlZCcsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnTm90ZTogaWYgYm90aCBzY3JvbGwgc3luYyBvcHRpb25zIGFyZSBlbmFibGVkLCB0aGUgZWRpdG9yICcgK1xuICAgICAgJ2hhcyB0byBiZSBpbiBhY3RpdmUgcGFuZSBmb3IgdGhpcyBvcHRpb24gdG8gdGFrZSBlZmZlY3QnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMjguMSxcbiAgfSxcbiAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDoge1xuICAgIHRpdGxlOiAnU3luYyBlZGl0b3IgcG9zaXRpb24gd2hlbiBwcmV2aWV3IGlzIHNjcm9sbGVkJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdOb3RlOiBpZiBib3RoIHNjcm9sbCBzeW5jIG9wdGlvbnMgYXJlIGVuYWJsZWQsIHRoZSBwcmV2aWV3ICcgK1xuICAgICAgJ2hhcyB0byBiZSBpbiBhY3RpdmUgcGFuZSBmb3IgdGhpcyBvcHRpb24gdG8gdGFrZSBlZmZlY3QnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMjguMixcbiAgfSxcbiAgZ3JhbW1hcnM6IHtcbiAgICB0eXBlOiAnYXJyYXknLFxuICAgIGRlZmF1bHQ6IFtcbiAgICAgICdzb3VyY2UuZ2ZtJyxcbiAgICAgICdzb3VyY2UubGl0Y29mZmVlJyxcbiAgICAgICd0ZXh0Lmh0bWwuYmFzaWMnLFxuICAgICAgJ3RleHQubWQnLFxuICAgICAgJ3RleHQucGxhaW4nLFxuICAgICAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJyxcbiAgICBdLFxuICAgIG9yZGVyOiAzMCxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgZXh0ZW5zaW9uczoge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgdGl0bGU6ICdNYXJrZG93biBmaWxlIGV4dGVuc2lvbnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hpY2ggZmlsZXMgYXJlIGNvbnNpZGVyZWQgTWFya2Rvd24nLFxuICAgIGRlZmF1bHQ6IFsnbWFya2Rvd24nLCAnbWQnLCAnbWRvd24nLCAnbWtkJywgJ21rZG93bicsICdyb24nLCAndHh0J10sXG4gICAgb3JkZXI6IDMxLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDoge1xuICAgIHRpdGxlOiAnRW5hYmxlIE1hdGggUmVuZGVyaW5nIEJ5IERlZmF1bHQnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNDAsXG4gIH0sXG4gIGxhdGV4UmVuZGVyZXI6IHtcbiAgICB0aXRsZTogJ01hdGggUmVuZGVyZXInLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1NWRyBpcyBub3RpY2VhYmx5IGZhc3RlciwgYnV0IG1pZ2h0IGxvb2sgd29yc2Ugb24gc29tZSBzeXN0ZW1zJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBlbnVtOiBbJ0hUTUwtQ1NTJywgJ1NWRyddLFxuICAgIGRlZmF1bHQ6ICdTVkcnIGFzICdIVE1MLUNTUycgfCAnU1ZHJyxcbiAgICBvcmRlcjogNDEsXG4gIH0sXG4gIG51bWJlckVxdWF0aW9uczoge1xuICAgIHRpdGxlOiAnTnVtYmVyIGVxdWF0aW9ucycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnTnVtYmVyIGVxdWF0aW9ucyB0aGF0IGFyZSBpbiBlcXVhdGlvbiBlbnZpcm9ubWVudCwgZXRjLiAnICtcbiAgICAgICdSZXF1aXJlcyBwcmV2aWV3IHJlb3BlbiB0byB0YWtlIGVmZmVjdC4gJyArXG4gICAgICAnV2lsbCByZS1yZW5kZXIgYWxsIG1hdGggb24gZWFjaCBtYXRoIGNoYW5nZSwgd2hpY2ggbWlnaHQgYmUgdW5kZXNpcmFibGUuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDQyLFxuICB9LFxuICB1c2VMYXp5SGVhZGVyczoge1xuICAgIHRpdGxlOiAnVXNlIExhenkgSGVhZGVycycsXG4gICAgZGVzY3JpcHRpb246ICdSZXF1aXJlIG5vIHNwYWNlIGFmdGVyIGhlYWRpbmdzICMnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA0NSxcbiAgfSxcbiAgdXNlQ2hlY2tCb3hlczoge1xuICAgIHRpdGxlOiAnRW5hYmxlIENoZWNrQm94IGxpc3RzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NoZWNrQm94IGxpc3RzLCBsaWtlIG9uIEdpdEh1YicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDQ2LFxuICB9LFxuICB1c2VFbW9qaToge1xuICAgIHRpdGxlOiAnVXNlIEVtb2ppJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Vtb2ppIHJlbmRlcmluZycsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDQ3LFxuICB9LFxuICBpbmxpbmVNYXRoU2VwYXJhdG9yczoge1xuICAgIHRpdGxlOiAnSW5saW5lIG1hdGggc2VwYXJhdG9ycycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnTGlzdCBvZiBpbmxpbmUgbWF0aCBzZXBhcmF0b3JzIGluIHBhaXJzIC0tIGZpcnN0IG9wZW5pbmcsIHRoZW4gY2xvc2luZycsXG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBkZWZhdWx0OiBbJyQnLCAnJCcsICdcXFxcKCcsICdcXFxcKSddLFxuICAgIG9yZGVyOiA0OCxcbiAgICBpdGVtczoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgfSxcbiAgfSxcbiAgYmxvY2tNYXRoU2VwYXJhdG9yczoge1xuICAgIHRpdGxlOiAnQmxvY2sgbWF0aCBzZXBhcmF0b3JzJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdMaXN0IG9mIGJsb2NrIG1hdGggc2VwYXJhdG9ycyBpbiBwYWlycyAtLSBmaXJzdCBvcGVuaW5nLCB0aGVuIGNsb3NpbmcnLFxuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogWyckJCcsICckJCcsICdcXFxcWycsICdcXFxcXSddLFxuICAgIG9yZGVyOiA0OC4xLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICB1c2VHaXRIdWJTdHlsZToge1xuICAgIHRpdGxlOiAnVXNlIEdpdEh1Yi5jb20gc3R5bGUnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNTAsXG4gIH0sXG4gIGVuYWJsZVBhbmRvYzoge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0aXRsZTogJ0VuYWJsZSBQYW5kb2MgUGFyc2VyJyxcbiAgICBvcmRlcjogMTAwLFxuICB9LFxuICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIGRlc2NyaXB0aW9uOiBgXFxcbkRvbid0IGNvbnZlcnQgZmVuY2VkIGNvZGUgYmxvY2tzIHRvIEF0b20gZWRpdG9ycyB3aGVuIHVzaW5nXG5QYW5kb2MgcGFyc2VyYCxcbiAgICBvcmRlcjogMTA1LFxuICB9LFxuICBwYW5kb2NQYXRoOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ3BhbmRvYycsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogUGF0aCcsXG4gICAgZGVzY3JpcHRpb246ICdQbGVhc2Ugc3BlY2lmeSB0aGUgY29ycmVjdCBwYXRoIHRvIHlvdXIgcGFuZG9jIGV4ZWN1dGFibGUnLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTEwLFxuICB9LFxuICBwYW5kb2NGaWx0ZXJzOiB7XG4gICAgdHlwZTogJ2FycmF5JyxcbiAgICBkZWZhdWx0OiBbXSBhcyBzdHJpbmdbXSxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBGaWx0ZXJzJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGZpbHRlcnMsIGluIG9yZGVyIG9mIGFwcGxpY2F0aW9uLiBXaWxsIGJlIHBhc3NlZCB2aWEgY29tbWFuZC1saW5lIGFyZ3VtZW50cycsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ2VuYWJsZVBhbmRvYyddLFxuICAgIG9yZGVyOiAxMTUsXG4gICAgaXRlbXM6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIH0sXG4gIH0sXG4gIHBhbmRvY0FyZ3VtZW50czoge1xuICAgIHR5cGU6ICdhcnJheScsXG4gICAgZGVmYXVsdDogW10gYXMgc3RyaW5nW10sXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogQ29tbWFuZGxpbmUgQXJndW1lbnRzJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGFyZ3VtZW50cyBlLmcuIGAtLXNtYXJ0LCAtLWZpbHRlcj0vYmluL2V4ZWAuIFBsZWFzZSB1c2UgbG9uZyBhcmd1bWVudCBuYW1lcy4nLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTIwLFxuICAgIGl0ZW1zOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9LFxuICB9LFxuICBwYW5kb2NNYXJrZG93bkZsYXZvcjoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdtYXJrZG93bi1yYXdfdGV4K3RleF9tYXRoX3NpbmdsZV9iYWNrc2xhc2gnLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IE1hcmtkb3duIEZsYXZvcicsXG4gICAgZGVzY3JpcHRpb246ICdFbnRlciB0aGUgcGFuZG9jIG1hcmtkb3duIGZsYXZvciB5b3Ugd2FudCcsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ2VuYWJsZVBhbmRvYyddLFxuICAgIG9yZGVyOiAxMzAsXG4gIH0sXG4gIHBhbmRvY0JpYmxpb2dyYXBoeToge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBDaXRhdGlvbnMnLFxuICAgIGRlc2NyaXB0aW9uOiBgXFxcbkVuYWJsZSB0aGlzIGZvciBiaWJsaW9ncmFwaHkgcGFyc2luZy5cbk5vdGU6IHBhbmRvYy1jaXRlcHJvYyBpcyBhcHBsaWVkIGFmdGVyIG90aGVyIGZpbHRlcnMgc3BlY2lmaWVkIGluXG5GaWx0ZXJzLCBidXQgYmVmb3JlIG90aGVyIGNvbW1hbmRsaW5lIGFyZ3VtZW50c1xcXG5gLFxuICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXSxcbiAgICBvcmRlcjogMTQwLFxuICB9LFxuICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOiB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogUmVtb3ZlIFJlZmVyZW5jZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlldycsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddLFxuICAgIG9yZGVyOiAxNTAsXG4gIH0sXG4gIHBhbmRvY0JJQkZpbGU6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnYmlibGlvZ3JhcGh5LmJpYicsXG4gICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogQmlibGlvZ3JhcGh5IChiaWJmaWxlKScsXG4gICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGJpYmZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseScsXG4gICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddLFxuICAgIG9yZGVyOiAxNjAsXG4gIH0sXG4gIHBhbmRvY0JJQkZpbGVGYWxsYmFjazoge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICcnLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IEZhbGxiYWNrIEJpYmxpb2dyYXBoeSAoYmliZmlsZSknLFxuICAgIGRlc2NyaXB0aW9uOiAnRnVsbCBwYXRoIHRvIGZhbGxiYWNrIGJpYmZpbGUnLFxuICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXSxcbiAgICBvcmRlcjogMTY1LFxuICB9LFxuICBwYW5kb2NDU0xGaWxlOiB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2N1c3RvbS5jc2wnLFxuICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IEJpYmxpb2dyYXBoeSBTdHlsZSAoY3NsZmlsZSknLFxuICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBjc2xmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknLFxuICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXSxcbiAgICBvcmRlcjogMTcwLFxuICB9LFxuICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnJyxcbiAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBGYWxsYmFjayBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBjc2xmaWxlJyxcbiAgICBkZXBlbmRlbmNpZXM6IFsncGFuZG9jQmlibGlvZ3JhcGh5J10sXG4gICAgb3JkZXI6IDE3NSxcbiAgfSxcbn1cblxuLy8gZ2VuZXJhdGVkIGJ5IHR5cGVkLWNvbmZpZy5qc1xuZGVjbGFyZSBtb2R1bGUgJ2F0b20nIHtcbiAgaW50ZXJmYWNlIENvbmZpZ1ZhbHVlcyB7XG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZSc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3U3BsaXRQYW5lRGlyJzogJ2Rvd24nIHwgJ3JpZ2h0JyB8ICdub25lJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld0RvY2snOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuY2xvc2VQcmV2aWV3V2l0aEVkaXRvcic6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmFjdGl2YXRlUHJldmlld1dpdGhFZGl0b3InOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5zeW5jUHJldmlld09uQ2hhbmdlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbCc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnN5bmNFZGl0b3JPblByZXZpZXdTY3JvbGwnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5leHRlbnNpb25zJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGF0ZXhSZW5kZXJlcic6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubnVtYmVyRXF1YXRpb25zJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlTGF6eUhlYWRlcnMnOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VDaGVja0JveGVzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlRW1vamknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5pbmxpbmVNYXRoU2VwYXJhdG9ycyc6IHN0cmluZ1tdXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5ibG9ja01hdGhTZXBhcmF0b3JzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZUdpdEh1YlN0eWxlJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlUGFuZG9jJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlTmF0aXZlUGFuZG9jQ29kZVN0eWxlcyc6IGJvb2xlYW5cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY1BhdGgnOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0ZpbHRlcnMnOiBzdHJpbmdbXVxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQXJndW1lbnRzJzogc3RyaW5nW11cbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY01hcmtkb3duRmxhdm9yJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NCaWJsaW9ncmFwaHknOiBib29sZWFuXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzJzogYm9vbGVhblxuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQklCRmlsZSc6IHN0cmluZ1xuICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQklCRmlsZUZhbGxiYWNrJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDU0xGaWxlJzogc3RyaW5nXG4gICAgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NDU0xGaWxlRmFsbGJhY2snOiBzdHJpbmdcbiAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzJzoge1xuICAgICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6IGJvb2xlYW5cbiAgICAgIGxpdmVVcGRhdGU6IGJvb2xlYW5cbiAgICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6ICdkb3duJyB8ICdyaWdodCcgfCAnbm9uZSdcbiAgICAgIHByZXZpZXdEb2NrOiAnbGVmdCcgfCAncmlnaHQnIHwgJ2JvdHRvbScgfCAnY2VudGVyJ1xuICAgICAgY2xvc2VQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgICAgYWN0aXZhdGVQcmV2aWV3V2l0aEVkaXRvcjogYm9vbGVhblxuICAgICAgc3luY1ByZXZpZXdPbkNoYW5nZTogYm9vbGVhblxuICAgICAgc3luY1ByZXZpZXdPbkVkaXRvclNjcm9sbDogYm9vbGVhblxuICAgICAgc3luY0VkaXRvck9uUHJldmlld1Njcm9sbDogYm9vbGVhblxuICAgICAgZ3JhbW1hcnM6IHN0cmluZ1tdXG4gICAgICBleHRlbnNpb25zOiBzdHJpbmdbXVxuICAgICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6IGJvb2xlYW5cbiAgICAgIGxhdGV4UmVuZGVyZXI6ICdIVE1MLUNTUycgfCAnU1ZHJ1xuICAgICAgbnVtYmVyRXF1YXRpb25zOiBib29sZWFuXG4gICAgICB1c2VMYXp5SGVhZGVyczogYm9vbGVhblxuICAgICAgdXNlQ2hlY2tCb3hlczogYm9vbGVhblxuICAgICAgdXNlRW1vamk6IGJvb2xlYW5cbiAgICAgIGlubGluZU1hdGhTZXBhcmF0b3JzOiBzdHJpbmdbXVxuICAgICAgYmxvY2tNYXRoU2VwYXJhdG9yczogc3RyaW5nW11cbiAgICAgIHVzZUdpdEh1YlN0eWxlOiBib29sZWFuXG4gICAgICBlbmFibGVQYW5kb2M6IGJvb2xlYW5cbiAgICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6IGJvb2xlYW5cbiAgICAgIHBhbmRvY1BhdGg6IHN0cmluZ1xuICAgICAgcGFuZG9jRmlsdGVyczogc3RyaW5nW11cbiAgICAgIHBhbmRvY0FyZ3VtZW50czogc3RyaW5nW11cbiAgICAgIHBhbmRvY01hcmtkb3duRmxhdm9yOiBzdHJpbmdcbiAgICAgIHBhbmRvY0JpYmxpb2dyYXBoeTogYm9vbGVhblxuICAgICAgcGFuZG9jUmVtb3ZlUmVmZXJlbmNlczogYm9vbGVhblxuICAgICAgcGFuZG9jQklCRmlsZTogc3RyaW5nXG4gICAgICBwYW5kb2NCSUJGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgICAgcGFuZG9jQ1NMRmlsZTogc3RyaW5nXG4gICAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6IHN0cmluZ1xuICAgIH1cbiAgfVxufVxuIl19