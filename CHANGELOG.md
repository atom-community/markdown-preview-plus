## 4.11.1

-   Mitigate #527

## 4.11.0

-   fix: fix dev mode (Tony Brix)
-   Remove unused test dependency
-   Update dependencies; NB: forceFullToc option is removed upstream

## 4.10.0

This release adds an additional pdf export option, `markdown-preview-plus.saveConfig.saveToPDFOptions.styleOverride`, which can be one of `none`, `github` or `default`. The default value is `github`, which corresponds to black text on white background and other CSS similar to GitHub.com's readme style in the light theme.

`markdown-preview-plus.saveConfig.saveToPDFOptions.printBackground` ('Render background' in settings UI) is set to `true` by default (previously `false`) mostly for consistency with the github light theme.

Finally, instead of the less intuitive `useGitHubStyle` option, a replacement option `style` is introduced that makes selecting the style explicit. It can have value `github` or `default`, which have more descriptive captions in the settings UI.

All this should resolve issue <https://github.com/atom-community/markdown-preview-plus/issues/512>

## 4.9.5

-   Wait for animation frame on pdf render to ensure CSS is rendered
-   Respect shellOpenFileExtensions with openOnSave.pdf

## 4.9.4

-   \[Fix\] rebuild assets

## 4.9.3

Updates related to electron 9:

-   Fix copy-html
-   Fix default highlighter class name
-   Fix save PDF

Also fixed some specs.

## 4.9.2

-   Fix highlighter for multiclass fences

## 4.9.1

-   Use electron 9-compatible API
-   fix: observe disableToolBarIntegration config (#518) (Tony Brix)

## 4.9.0

### New features

-   Initial support for Pandoc's sourcepos extension

    New in Pandoc 2.11.3. You need to set Markdown Flavor in MPP's Pandoc settings to `commonmark+sourcepos` (possibly with other extensions) or `commonmark_x+sourcepos` (which has many extensions automatically enabled). Bear in mind this is pretty new, so expect issues.

### Fixes

-   Rework bidirectional scroll sync condition for docks

## 4.8.4

-   [Fix] Let atom's styles override pandoc's, not vice versa

## 4.8.3

### Fixes

-   Fix highlighter syntax detection for newer pandoc versions

    Fixes highlighting for some pandoc code blocks (known to be an issue with pandoc 2.11)

-   Tree-sitter: first close old scopes then open new ones

    Fixes broken highlighting on some grammars

-   Tweak pdf export webview (inside viewport with opacity 0)

    Fixes intermittent hangs during pdf export on newer Atom versions

### Maintenance

-   Move highlighters to separate functions
-   Move highlighter to separate file
-   Bump dependencies

## 4.8.2

-   [Fix] Fix html special characters w\/ tree-sitter-compatible highlighter

## 4.8.1

-   [Fix] Build the bundle
-   [Fix] Dispose of toolbar on deactivation

## 4.8.0

-   [Feat] Option to disable tool-bar integration

## 4.7.1

-   Catch and suppress errors in getScrollSyncParams
-   Use non-deprecated Buffer interface

## 4.7.0

### New features

-   Add support for tool-bar package (by @aminya)

### Fixes

-   Work around MathJax crash

    This crash usually manifested when math was changed from inline to display. The workaround incurs some slight overhead potentially, but it's certainly better than math engine crashing entirely.

### Maintenance

-   Bump dependencies
-   Documentation updates

## 4.6.1

-   Improve child\_process latency by manually activating Node's event loop

## 4.6.0

### New features

-   Add `typographicReplacements` option for markdown-it writer

    Enables/disables replacement of `(r), (c), (tm), --, ---` etc with "®, ©, ™, –, —", etc. Enabled by default (backwards compatible).

    Corresponds to Markdown-It `typographer` option. See https://markdown-it.github.io/markdown-it/#MarkdownIt.new for more information (more specifically, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js)

### Maintenance

-   \[Bundler\] Use tsc transformer for now
-   Minor dependency updates
-   Minor README update (by Robert Kieffer)

## 4.5.0

### Changes

-   Move markdown-it to webworker

    Previously, rendering Markdown was done in the main UI thread, which on larger documents could result in intermittent freezes and overall latency issues. It has now been moved into a separate WebWorker thread.

    This complicates hacking on markdown-it a little bit, see the contribution guide for more information.

-   Rewrite tree-sitter compatible highlighter

    For a while now, highlighter was creating a TextEditor for each code block and then ripping the highlighted HTML from it. This didn't work well enough in some corner cases, and creating TextEditors is rather slow due to required DOM manipulation.

    That code has been rewritten to use low-level internal Atom API, which makes it quite a bit faster and generally more robust. That said, future Atom versions might break something.

-   Show preview error at the top of preview

    It wasn't always evident that a preview error happened due to error message being added at the bottom of preview content. It is now added at the top.

### New features

-   Re-introduce legacy highlighter

    Legacy highlighter only supports older TextMate-style grammars, but it is very well-tested. If the new highlighter algorithm breaks at some point, legacy highlighter offers a fallback option.

    The active highlighter is controlled by the `markdown-preview-plus.previewConfig.highlighter` option.

### Fixes

-   Yield event loop periodically while highlighting to avoid UI freezes

    This ensures UI doesn't freeze up completely if highlighting takes longer than expected. It also adds an upper limit on the time highlighter can work (currently hard-coded at 5 seconds).

-   Skip over code block children when computing difference

    Code blocks contain a lot of small stateless elements, and in general, we don't care how those are updated, so it makes sense to skip over those to speed up the diffing algorithm.

### Maintenance

-   Use babel to transpile TypeScript for faster builds
-   Re-add static checks to CI
-   Avoid error when searching for unprocesed math; report other errors

## 4.4.1

-   Fix MathJax update crash when diff algorithm is 'none'
-   Remove old template.html

## 4.4.0

### New features

-   More involved diffing algorithms

    Added more involved diffing algorithms, and a new setting `markdown-preview-plus.previewConfig.diffMethod`, which can take values of `'none'`, `'heuristic'`, or `'myers'`. It is found in the settings UI as 'Diff Method' under 'Preview Behaviour'.

    - `'none'` is the old method. Very fast, but doesn't handle insertions anywhere but the end of the document particularly gracefully.
    - `'heuristic'` is a linear-complexity method that should produce slightly better results for common cases of insertion and deletion. It doesn't handle complete replacements particularly well though.
    - `'myers'` uses Myers' longest common subsequence algorithm, which is very good at finding minimal sets of insertions and deletions, but in the worst case has near-quadratic complexity, so it can be very slow on large documents.

    `'heuristic'` is the default.

-   Command to move windowed preview back to Atom workspace

    Windowed preview can be moved back inside the main Atom window using the context menu.

-   Preview dynamic type change (file\/editor)

    When the editor for the preview closes, and `markdown-preview-plus.previewConfig.closePreviewWithEditor` setting is disabled, preview will switch to monitoring the file automatically. If there is no file to monitor, it will instead "freeze" its state. This fixes issues with preview losing state over Atom restarts.

### Changes

-   Align preview post-update by the bottom of bottom visible element

    Preview scroll position is now aligned with the bottom of the bottom-most visible element. This reduce the preview "jumping around" when the document is changed in the more common cases. Please open new issues if you observe undesirable behaviour wrt scroll position.

    This is only done if `syncPreviewOnEditorScroll` (aka 'Sync preview position when text editor is scrolled') is disabled.

-   Sync preview to scroll position on update if enabled

    If `syncPreviewOnEditorScroll` (aka 'Sync preview position when text editor is scrolled') is enabled, sync preview to editor scroll position after update.

-   Smoother scroll sync

    Scroll synchronization is now using a weighted average position to determine the preview scroll position. It should generally result in smoother scrolling.

### Fixes

-   Avoid interleaving updates
-   Optimize MathJax updates: reduce flicker
-   Fix image flickering
-   Cache editor text
-   Fix scroll sync in windowed preview
-   Various minor windowed preview fixes
-   Don't show preview until the root element is drawn

### Maintenance

-   Update readme badges
-   Fix specs
-   Remove travis and appveyor CI
-   Use static atom:\/\/ path for twemoji assets
-   Simplify client IPC: Removed separate set-map command
-   State deserialization for text-only previews
-   Work around "loop limit exceeded" error
-   Rename and move around some files

## 4.3.0

### New features

-   New markdown-it plug-ins

    Plug-ins that approximate features of Pandoc Markdown:

    - attrs -- braced attributes
    - bracketed-spans -- bracketed spans (with attributes)
    - container -- fenced divs (with attributes)
    - deflist -- definition lists
    - front-matter -- YAML front-matter
    - implicit-figures -- implicit figures with captions
    - sub -- subscripts `~sub~`
    - sup -- superscripts `^sup^`

    Front-matter is enabled by default, others are disabled.

-   Option to parse display math inline with markdown-it

    Again, approximating Pandoc Markdown. Disabled by default.

-   Add table captions parser

    Approximating Pandoc Markdown. Can be enabled with markdown-it. Disabled by default.

-   Set pandoc-like combination of markdown-it extensions when using pandoc

    This will help with source/preview synchronization. Still by far not ideal, but hopefully at least a little better.

### Fixes

-   Careful-er inline math parsing
-   Catch morphdom errors
-   Don't let markdown-it re-parse LaTeX code inside math
-   Fix #482 (very rare "Pane has been destroyed" error)
-   Fix keybindings display in settings

### Maintenance

-   Bump dependencies
-   Update table parser with latest changes from upstream
-   Move custom markdown-it table parser to separate module

## 4.2.0

This is mostly a correcting release, but it has a couple new features,
hence the minor version bump.

### New features

-   Convenience command\/menu item to open package settings page

    Easier access to settings page.
    `markdown-preview-plus:open-configuration` command or
    Packages → Markdown Preview Plus → Open Package Configuration menu item.

-   Add option to use native keyboard scroll in preview

    The option is called `markdown-preview-plus.previewConfig.nativePageScrollKeys`, termed 'Use native scroll keys in preview' in UI in the 'Preview Behaviour' settings block.

    This option is enabled by default to align better with how earlier versions behaved.

    If the option is enabled, preview will use arrow keys, page up, page down, home, end and space for native navigation. The upside is smoother scroll behaviour. The downside is that these keys will be invisible to Atom when preview is focused, and hence can not be used in keymap with preview-focused commands. Also, unlike non-native commands, these are non-rebindable.

### Fixes and Tweaks

-   Never reparent webview

    This fixes a few issues with preview flickering, reloading or becoming
    empty after moving the pane around. However, this is achieved by drawing
    preview over the top of the pane (as opposed to drawing it as a part of
    the pane). Please report any visual glitches related to that.

-   Make PgUp\/PgDn scroll by 90% of page height instead of 100%

-   Fix findNext flicker

-   Refactor preview search view

-   Scroll webview on space

    Makes space key behave as page down on preview.

-   Disable webview pointer events on drag

    Simplifies moving preview around

-   Proxy webview keypresses instead of stealing focus

    More intuitive preview focus behaviour

-   Bridge the gap in functionality and behaviour between windowed and paned preview

## 4.1.1

-   Fuzzy whitespace search in search-selection-in-source

## 4.1.0

### New features

-   Search selection in preview and source

    Commands `markdown-preview-plus:search-selection-in-source` on Markdown Preview and `markdown-preview-plus:search-selection-in-preview` on Markdown Text Editor. Not bound to hotkeys by default. The former is available via the context menu.

-   Find in preview

    Commands `markdown-preview-plus:find-in-preview` and `markdown-preview-plus:find-next`, by default bound to `ctrl-f` (`cmd-f` on macOS) and `f3` respectively. Also available via context menu. Only activate when Markdown Preview is focused.

-   Rich clipboard support when copying selection from preview

    When copying selection from preview, some formatting will be kept via rich clipboard functionality. Bear in mind this is not as powerful as `markdown-preview-plus:copy-html` command.

### Fixes

-   Fixed some reloading issues; particularly when settings are changed with preview open or preview is moved to another pane.
-   Fixed keybindings on preview

## 4.0.1

-   Fix require.resolve bundle issue

    Path to twemoji-assets was not resolving correctly

## 4.0.0

**WARNING**: Potentially breaking changes.

### Removed features

-   Old "open in new window" has been removed. Due to a long-standing bug in Atom it wasn't working for a while, and it doesn't look like upstream is interested in fixing said bug.

### New features

-   BrowserWindow-based open in new window

    BrowserWindow is relatively stable API on Electron 5, to which Atom updated in v1.48.0. Which makes it possible to re-introduce "open in new window" based on that.

-   Add makePDF tree view command/menu item

    A small convenience to create PDF from Markdown files straight from tree-view. Makes it possible to create PDFs "in bulk".

    Added a context menu in tree-view called "Make PDF" and Atom command `markdown-preview-plus:make-pdf` bound to `.tree-view` selector. You can bind a key to this command with
    ```cson
    ".tree-view":
      "<some-key>": "markdown-preview-plus:make-pdf"
    ```
    bear in mind this keybinding will only work when tree-view is focused and at least Markdown file is selected.

-   Add menu item/command to edit LaTeX macros definitions

    Added a small convenience command `markdown-preview-plus:edit-macros` and a main menu item Packages → Markdown Preview Plus → Edit LaTeX Macros, which open `.atom/markdown-preview-plus.yaml` in Atom.

### Changes

-   `markdown-preview-plus.cson` is now `markdown-preview-plus.yaml`. The conversion should in most cases happen automatically, but in rare cases you might need to do the conversion manually. Syntax is largely very similar if not outright the same.

    This is not done lightly. However, CSON parsing requires a transient dependency on coffeescript, which bloats the size of dependencies and makes it unnecessarily hard to bundle the package.

-   Markdown-preview-plus is now distributed in bundled form. This means installation and load times should be generally smaller. On the flip side, hacking on MPP is slightly more complicated. Check the [contribution guide](./CONTRIBUTING.md).

-   MPP will use the TypeScript sources directly if Atom is started in dev-mode and some devDependencies are installed. This is relatively slow, so bear this in mind if using Atom's dev-mode.

### Fixes

-   Wait until pdf is actually created before continuing
-   Make activation non-async
-   Wait for load event on pdf save
-   Make open-on-save configurable
-   Do not render pandoc errors in saved\/copied documents

### Maintenance

-   Slightly rework how tree-view interaction is handled
-   Bunlde simplified version of markdown-it-imsize in repo (issues with parcel in code that isn't even used)
-   Dependencies updated

## 3.11.5

-   Rework source map builder, update spec
-   Tweak highlighter editor initialization

## 3.11.4

-   Attempt at fixing #474

## 3.11.3

-   Fix save to PDF
-   Force LF newlines in tsc output

## 3.11.2

-   Second attempt at fixing #472

## 3.11.1

-   First attempt at fixing #472
-   Ignore `id` attribute on nodes in inline `svg` during differential updates

    Oftentimes, nodes are moved around in inline SVG, especially if it's
    generated by Pandoc filters, which leads to extremely messy results. So as
    a band-aid measure, when updating nodes in inline SVG, node `id` is now
    ignored.

-   Removed old workaround for #386 and #406 due to being fixed in Atom
-   Removed obsolete markmon copyright notice in update-preview
-   Tweaks to morphdom update logic

## 3.11.0

-   Bump dependencies
-   Present certain TOC rendering options to the user through Atom config ([#469](https://github.com/atom-community/markdown-preview-plus/pull/469)) ([@tanhevg](https://github.com/tanhevg))

## 3.10.0

-   Add a way to open preview for editor externally.
-   Fix spec

## 3.9.5

-   Add twemoji assets as extra package

    This should be a little more robust than bundling those in the repo.

## 3.9.4

-   Bundle twemoji svgs

## 3.9.3

-   Build
-   Bump electron definitions
-   Fix spec
-   Remove extraneous console.logs
-   Bump minimal Atom version to 1.39
-   Changes to support Electron 3.1

## 3.9.2

-   Revert "Changes to support Electron 3.1"

## 3.9.1

-   Changes to support Electron 3.1

## 3.9.0

### New features

-   Added markdown-it-footnote support. (Joris van Zundert)

### Maintenance

-   Update dependencies

## 3.8.1

-   Fix #452

## 3.8.0

### New features

-   Added "preview context"

    This basically adds `data-markdown-preview-plus-context` attribute to the root element of the preview and/or exported/copied html/pdf. The value of this attribute depends on what action is being performed; "live-preview" is the default preview status; "pdf-export" in case of PDF export, "html-export" in case of HTML export (this will be saved in exported HTML); "copy-html" when copying HTML (this won't be copied to clipboard, but may affect rendering). See [docs/styling-preview.md](https://github.com/atom-community/markdown-preview-plus/blob/master/docs/styling-preview.md) for more information.

-   Added `display-math` and `inline-math` CSS classes to display and inline math containers respectively to simplify CSS selectors

-   Added `saveConfig.saveToPDFOptions.latexRenderer` option ('Export Behaviour → Save to PDF options → Math Renderer' in the settings GUI) which allows setting LaTeX math renderer for PDF export independently of the live preview. By default, PDF export will use the same LaTeX math renderer as live preview.

-   Anchor points will be automatically created for headers in markdown-it renderer, if table of contents plug-in is enabled (this was mostly an oversight); the table of contents plugin is now turned off by default to keep the output HTML consistent between versions;

### Changes

-   Save-to-PDF now runs in a separate webview context. This shouldn't affect the observable behaviour though.

-   Table of contents markdown-it plugin is turned off by default to keep output HTML consistent between versions, since it now adds anchor points to headers.

### Fixes

-   Fixed math display in copied HTML
-   Caught a few leaked disposables
-   Update preview base path when editor path changes
-   Fixed relative hash-links in preview (e.g. `[Link to some section inside the document](#section-slug)`)

### Maintenance

-   Got rid of `window.atomVars` global in the preview
-   Added typescript-tslint-plugin to dev environment
-   Updated dependencies
-   Shuffled TS/TSLint configs around
-   Added tslint rule to help catch leaked disposables
-   Rework mathjax-helper to simplify state tracking
-   Move macros-reading code out of webview client
-   General code clean-up

## 3.7.1

-   Watch media in link tags
-   Tweak spec for Atom 1.32

## 3.7.0

-   Specs for tab width option
-   Add tab width option for code blocks; use Atom setting by default
-   Added "toggle math rendering" to context menu

## 3.6.3

-   Fix table cell spacing
-   Report uncaught errors in client code

## 3.6.2

-   Fix PDF export when math rendering is disabled

## 3.6.1

-   Respect core editor-font setting in preview code blocks

    v3.6.0 came with an unfortunate side effect of ignoring
    `editor.fontFamily` global config parameter. This patch amends
    that. Bear in mind it does not affect exported HTML (because
    actually supporting arbitrary fonts is very tricky).

    Also note that user stylesheet *is* included with exported
    HTML, so if you really want to force a font (or other style),
    you can do so by specifying it in the user stylesheet directly
    via

    ```less
    atom-text-editor {
      font-family: "My Awesome Font Name, Fallback Font Name";
    }
    ```

    or, if you want to target Markdown Preview Plus code blocks
    specifically, you can use `pre.editor-colors` selector.

-   Fix Pandoc code block non-standard syntax detection

    At some point, Pandoc changed how it assigns class to code
    blocks having syntax class Pandoc doesn't recognize. This
    change updates MPP's highlighting code to respect that.

## 3.6.0

See also: Pull request [\#426](https://github.com/atom-community/markdown-preview-plus/pull/426)

### Changes

-   Preview and HTML export layouts and styles are unified as much as
    possible. Exported HTML should look and feel exactly as the preview
    does (within reason, also see below under Caveats)
-   Got rid of `.markdown-preview-plus` class on `body` in exported HTML
-   Got rid of `data-use-github-style` attribute, now style switching is
    done via loading different stylesheets
-   Styles that are only relevant for the preview are now only imported
    in the preview sandbox, not auto-loaded by Atom
-   Only a limited subset of all styles loaded in Atom is passed through
    to the preview sandbox. See below (under Caveats) for details.

### Fixes

-   Code blocks in PDF now break words if necessary for line wrapping
-   Code block style is the same in preview and exported HTML

### New features

-   New config option `markdown-preview-plus.syntaxThemeName` (called
    'Syntax theme for code blocks' in settings GUI), which allows
    specifying a highlighting theme different from the currently active
    Atom syntax theme
-   `markdown-preview-plus:select-syntax-theme` command which presents a
    menu for setting said config option on the fly
-   New config option `markdown-preview-plus.importPackageStyles`
    (called 'Packages that can affect preview rendering' in settings
    GUI), which allows to explicitly override preview style isolation on
    a per-package basis. See below.

### Caveats

-   Styles not in `atom-text-editor` context and not in user stylesheet
    are not passed through to preview by default. This might lead to
    unexpected interactions (or, more likely, lack thereof) with other
    packages. It's possible to explicitly whitelist a package in
    settings. Examples of packages that might affect preview style
    include: `fonts` package, `language-babel` package,
    `atom-typescript` package, etc. The `fonts` package is whitelisted
    by default. A special value of `*` will pass all
    Atom workspace styles through to the preview and apply some tweaks
    to keep it presentable -- use this at your own risk, however, it's
    impossible to offer any guarantees. Note that HTML export is never
    affected by third-party packages.


## 3.5.0

### Compatibility considerations

-   Tokenization for code blocks has changed slightly due to changes to
    highlighting code. This is a side effect of ensuring compatibility
    with the new Atom grammar parser subsystem.

### Fixes

-   Compatibility with Tree Sitter parsers

    The old way of reusing Atom grammars to highlight code blocks doesn't
    work with the new Tree Sitter parsers (experimental Atom feature).

    This version updates the highlighting code to be compatible with
    Tree Sitter.

    Now the highlighting algorithm will always use the same tokenizer
    as an editor.

### New features

-   New editor context menu item for copying selected Markdown as HTML (Jeremy John)

    This is a simple menu item binding to `markdown-preview-plus:copy-html`
    command. The menu item is called 'Copy Markdown as HTML'

-   Option to enforce using external program to open certain file types

    Until now, all links to local files would be opened in Atom. This
    is obviously not a good idea for binary files. A setting
    was added (`previewConfig.shellOpenFileExtensions`)
    that will force OS default handler for certain files (based on
    file name extension). The setting in question is under 'Preview Behaviour'.

    Default value defines some common binary document types and archives.

    Setting description:
    > **Always open links to these file types externally**
    >
    > This is a comma-separated list of file name extensions that
    > should always be opened with an external program.
    > For example, if you want to always open PDF files (presumably named > `something.pdf`)
    > in system PDF viewer, add `pdf` here

## 3.4.0

### New features

-   'Copy HTML' commands now copy rich text in addition to raw HTML
    source. This can be disabled in settings by unticking 'Use rich
    clipboard' or setting `markdown-preview-plus.richClipboard` to
    `false`.

    With rich clipboard enabled, targets that support rich text (
    word processors, web browsers, etc) will properly format clipboard
    contents on paste instead of pasting raw HTML verbatim.

    Targets supporting only plain text (e.g. Atom) will still get raw
    HTML source.

    See [this comment](https://github.com/atom-community/markdown-preview-plus/pull/419#issuecomment-413947040) for a visual example.

### Maintenance

-   Update to TypeScript 3.0
-   Bump dependencies
-   Bump Atom version (minimal supported is 1.28)

## 3.3.4

-   Do not flash synced element when syncing on change
-   Update generated sources
-   Rework image watcher
-   Reduce dependency on lodash
-   Use native Array.includes instead of lodash.includes

## 3.3.3

-   Display atom-text-editors in preview via flexbox

    Fixes extraneous empty lines in code blocks with long lines

## 3.3.2

-   Do not include display-only CSS into exported HTML

    Fixes indentation display in
    code blocks in exported HTML

## 3.3.1

-   A very specific fix for extra empty line in list items
-   Set charset in preview HTML
-   Bump dependencies

## 3.3.0

### Fixes

-   Fixed disappearing empty lines in code blocks

    Empty lines in code blocks were not rendered in preview  in some
    cases due to somewhat broken CSS styles. This was fixed.

-   Re-render `li` elements completely

    This is a tweak to rendering fix implemented in v3.2.0. Re-rendering
    could sometimes confuse MathJax into inserting rendered math into the
    page several times. Re-rendering `li` elements completely from the ground
    up fixes this problem at the cost of degraded performance for long list
    items.

-   Re-render when math changes from display to inline and vice versa

    Since 3.0.1 and up until this release, math wouldn't be re-rendered when
    changed from inline to display or vice versa.

-   Resize page to paper width when saving to PDF

    When saving to PDF via 'Save As...' menu item or `core:save` command,
    page will be resized to paper size and math will be re-rendered before
    saving. This should make PDF export more robust.

-   Fix copy-html when selection is not empty

    Restored the old behaviour where `core:copy` command on the preview
    copied full preview HTML only if there was no selection inside the preview.

### New features

-   Added basic support for Critic Markup in markdown-it renderer. Disabled by
    default.

-   Added support for specifying image size in markdown-it renderer via
    non-standard syntax `![alt](src "optional title" =<width>x<height>)`, e.g.
    `![A nice picture](image.png =800x600)`.

-   'Save to PDF' feature can be configured in package settings. In particular:

    -   Margins size (default, minimal, or none)
    -   Page size (the usual international and American sizes, or custom size)
    -   Whether to honor or ignore CSS backgrounds
    -   Landscape or portrait orientation
    -   Option to only save selected document fragment to PDF (experimental)

-   Adding two new MathJax options to Atom GUI (#391) (kiwi0fruit)

    Adds options controlling MathJax extensions and `undefinedFamily` parameter
    for HTML-CSS renderer. The latter one controls which CSS font MathJax
    will use for characters that don't have glyphs in MathJax's math fonts.

### Maintenance

-   Only set latex renderer on initialization
-   Clean-up client html
-   Wrap preview in atom-workspace to ensure CSS variable inheritance
-   Update config descriptions
-   Check if package is not active before tests in activation spec
-   Add hack to force spec package activation on OSX
-   Bump twemoji dependency

## 3.2.2

### Fixes

-   Add native PgUP\/PgDN keybindings to webview

    Atom doesn't bind Page Up and Page Down keys to native handler
    by default, consequently those keys didn't scroll the preview.
    The bindings were added, so Page Up and Page Down now should
    scroll the preview as you would expect.

-   Fixup keybindings

    Not all default keybindings were bound to correct scopes, and hence
    some of those didn't work. This was fixed.

-   Fix long copy rendering on atom-beta

    Atom 1.28 updated to Electron 2.0 which changed some rules, and some
    tricks used in offscreen MathJax rendering stopped working. This was
    fixed.

### Maintenance

-   Fix flaky test
-   Clean-up webview-handler
-   Stronger typing in `WebviewHandler.runRequest`
-   Refactor

## 3.2.1

-   Wrap code block lines in print media

    Previously, code blocks with overlong lines would be printed to pdf/paper
    with scroll-bars (which obviously can't be scrolled) and cut-off lines.
    This has been fixed.

## 3.2.0

### Changes

-   Updated MathJax CDN URL in saved HTML

-   Enabled MathJax menu in saved HTML

-   Added accessability extensions to MathJax config in saved HTML

-   Saved HTML will use math config from package settings

    This is mostly related to equation numbering

### New features

-   Context menu item to reopen preview in a new window. Caveats apply

    It's now possible to move a given preview to a new Atom window. For
    file-based previews, this could be done prior by simple tab drag-n-drop.
    For editor-based previews, drag-n-drop doesn't work.

    A new preview context menu option 'Open in new window' and command
    `markdown-preview-plus:new-window` can be used on any preview to
    move it to a new Atom window.

    This can be useful in multi-monitor setups.

### Fixes

-   Force re-render of `li` elements on changes

    In some cases, `li` elements wouldn't be updated properly due to
    weirdness in Chromium. To avoid that, those have to be forcibly re-rendered.
    See [#386](https://github.com/atom-community/markdown-preview-plus/issues/386)
    for details.

-   Disable image fonts in MathJax config

    Reportedly, in some rare cases, MathJax would try to load image fonts, but
    our MathJax for Electron lacks those. The config was amended to tell
    MathJax that it shouldn't look for math fonts.

-   Fix preview reload on settings change

    Preview could fail to reload when some settings were changed (in particular,
    equation numbering)

### Maintenance

-   Reduce copying in UpdatePreview
-   Better request-reply for webview
-   Get saved HTML TeX config from preview

## 3.1.1

-   Fix preview navigating to external URLs
-   When activatePreviewWithEditor enabled, don't activate preview if editor is
    in the same pane as preview

## 3.1.0

### Changes

-   Settings cleanup

    Settings have been reworked to provide better categorization.
    Old package config should be migrated automatically after upgrade,
    but be sure to check just in case.

-   MPP will now disable bundled `markdown-preview` on first activation to avoid
    conflicts.

-   Most package config changes related to rendering will now be automatically
    applied to all open previews instantly.

-   Removed makrdown-pdf compatibility. Since we provide our own PDF export,
    and markdown-pdf not supporting compatibility with MPP by default, and that
    whole code branch being deprecated, this shouldn't affect many users.

### New features

-   Options to relativize media paths on save/copy

    This behaviour is controlled by `saveConfig.mediaOnSaveAsHTMLBehaviour` and
    `saveConfig.mediaOnCopyAsHTMLBehaviour`. Both can have value of:
    -   `untouched` -- media paths will be left as they are in source Markdown
    -   `relativized` -- media paths will be relativized wrt save path (on save)
        or Markdown file path (on copy)
    -   `absolutized` -- media paths will be absolutized. This is the behaviour
        of all previous versions, and bundled markdown-preview.

-   In addition to images, `audio` and `video` tags sources are also resolved
    in the filesystem and are auto-updated on source file changes.

-   Optional support for `markdown-it-table-of-contents` plugin.

    When enabled in package config, `[[toc]]` will be replaced with table of
    contents when using markdown-it parser/renderer.

-   Added 'Print' menu item to preview context menu and
    `markdown-preview-plus:print` command. This will display system
    printing dialog, which will also offer saving to PDF.

-   Continuous scroll synchronization.

    There are two possible synchronization directions:

    -   Autoscroll preview when editor is scrolled

        This is controlled by `syncConfig.syncEditorOnPreviewScroll` setting

    -   Autoscroll editor when preview is scrolled

        This is controlled by `syncConfig.syncEditorOnPreviewScroll` setting

    When both are enabled, preview/editor is autoscrolled only when
    editor/preview respectively is in the active pane. In practice this can
    mean an additional click to engage scroll synchronization.

-   Support for auto-numbered math.

    Note that to support this, all math has to be re-rendered if even one
    equation changes. This can be slow, especially with documents containing
    a lot of math, and re-rendering flicker can be distracting.

### Fixes

-   Fix github-style saved HTML scrollability

    Due to botched CSS style, HTML saved with github style was not scrollable.

-   Fix unneeded reinitializations in markdown-it parser/renderer

    Due to botched check for changed settings, markdown-it was reinitialized
    on every render. Now that this has been fixed, rendering with
    markdown-it backend should be a little bit faster.

-   Labelled MathJax math doesn't break on re-renders anymore. See
    [#180](https://github.com/atom-community/markdown-preview-plus/issues/180)
    for more details

-   Math will only be typeset if there's any unprocessed math. This should
    speed up rendering a tiny bit and it will avoid unnecessary re-renders
    when math numbering is on.

### Maintenance

-   Don't use deprecated sinon.reset()
-   Throw error when trying to saveAs a loading preview
-   Spec for saveConfig configuration
-   Add spec: disable bundled markdown-preview on activation
-   Clean-up pandoc-helper exports
-   Rewrite highlighting spec to be less hacky
-   Avoid global state and more clean-up in markdown-it-helper
-   Clean-up markdown-it-helper
-   Fix mathjax-helper spec
-   Add equation numbering spec

## 3.0.1

### Changes

-   Preview is rendered inside a WebView now

    This provides better isolation.
    As a bonus, `pandoc --standalone`, `pandoc --toc` and `pandoc --css` should
    now "just work", and PDF export is handled by the WebView
    semi-automatically (see below).

-   `openPreviewInSplitPane` option removed. Set `previewSplitPaneDir` to `none
    if you want to disable pane splitting.

-   Math is rendered using SVG renderer by default (due to it being faster).
    You can change to HTML-CSS renderer using package settings.

### New features

-   Save to PDF

    To use this feature, right-click on preview, choose 'Save As...' and use
    a filename with '.pdf' extension.

-   Configurable math renderer (HTML-CSS or SVG)
-   Zoom on ctrl-scroll
-   Open links in preview

    Links to local files will be opened either in Atom, or via system
    opener. URLs will be open with the default browser.

### GUI options

-   Add option to open preview in dock
-   Sync on change
-   Close preview with editor
-   Activate preview when editor activates

### Fixes

-   Skip text{} in inline math
-   Fix outdated JSDoc
-   Fix task list CSS (remove extraneous bullet point)

### Maintenance

-   Clean-up code
-   Bump dependencies (most notably, MathJax updated to 2.7.4)
-   Switch to using morphdom library for diff-updates instead of using "home-grown" solution
-   Stop ignoring package-lock
-   Use atom-ts-spec-runner
-   Disable persistence in spec runner (can lose config on Atom >= 1.25)
-   Fix grammar in README (#356) (Steve Moser)
-   Update styles during differential update
-   Nested math example
-   Member-access, member-ordering
-   Factor MarkdownPreviewView into two subclasses
-   Use old URL parser (less noise)
-   Fix file URL parsing
-   Fix latex macro name guide link
-   Simplify MathJax rendering a bit
-   Add spinner to placeholder view
-   Bind preview to editor directly instead of via editorId
-   Destroy preview on editor close
-   Report copy\/save HTML errors more explicitly
-   Use Atom's new save-as approach

## 2.5.7

-   Do not show list bullets for checkbox lists

## 2.5.6

-   Add overflow:auto to saved HTML code blocks style
-   Updated spec to not break horribly on new Atom versions

## 2.5.5

-   Make duplicate `attachMathJax` calls safe

## 2.5.4

-   Remove extraneous wrapper in exported HTML
-   Fix spec on Atom 1.24.0

## 2.5.3

-   \[Workaround\] Work around for Atom bug \#16801

## 2.5.2

-   Return support for markdown-pdf... kinda

    You need to enable "Force Fallback Mode" in markdown-pdf settings
    and you might have to run convert command twice. This is deprecated,
    and hardly used by anyone, but until there's a native PDF
    conversion, this should work.

-   Merge pull request \#344 from
    atom-community/fix-html-export-and-no-markdown-preview-class
-   Fix HTML export, avoid markdown-preview class
-   Pin typescript version for now
-   Fix README links

## 2.5.1

-   Deactivate `markdown-preview` package on our activation
-   Disambiguate serializer name from `markdown-preview` package
-   Use custom view tag to differentiate ourselves from
    `markdown-preview`

## 2.5.0

-   Bundle our fork of markdown-it-math
-   Configurable math delimiters (\#327)
-   Ignore fence name case (\#338)
-   Make file extensions that are considered Markdown configurable
    (\#335)
-   Get rid of fs-plus
-   Emoji support (\#244, \#332)
-   Fix deserialization
-   Make styles a bit more specific
-   Bind editor-related commands on text editor instead of workspace
-   Checkbox lists (\#186)
-   Rewrite in TypeScript (\#323)

## 2.4.16

-   Tentative fix for \#316

## 2.4.15

-   Remove dependency on cheerio
-   Revert "Properly handle link/image urlencoding" (problems on Win32)
-   Revert "Undefined/null-aware en-/decodeURI" (problems on Win32)

## 2.4.14

-   Add dedicated 'Pandoc Options: Filters' option

## 2.4.13

-   Undefined/null-aware en-/decodeURI
-   Properly handle link/image urlencoding

## 2.4.12

-   Do not break image data URIs

## 2.4.11

-   \[Pandoc\] Remove dependency on pdc; saner Pandoc error handling

## 2.4.10

-   Fix image update bug
-   Atom 1.19 compatibility
-   Use Travis trusty env
-   Specs fix for newer Atom
-   Update README.md (\#297) (Alan Yee)
-   Typo fix (\#281) (Kevin Murray)

## 2.4.9

-   Atom community move (\#276)
-   Fix image-update fail on win32

## 2.4.8

-   Do not re-render preview on image change

## 2.4.7

-   Fix \#273

## 2.4.6

-   Fix resource leak in image-watcher
-   \[CHANGELOG\] Markdown formatting fixes

## 2.4.5

-   Update CHANGELOG
-   Update CHANGELOG
-   Merge branch '2.4-branch'
-   Merge branch 'lierdakil/pandoc-run-path' into 2.4-branch
-   Set Pandoc run path to file dir

## 2.4.4

-   Prepare 2.4.4 release
-   Update CHANGELOG
-   Merge branch 'lierdakil/pandoc-run-path' into 2.4-branch
-   Merge branch '2.4-branch'

## 2.4.3

-   Prepare 2.4.3 release
-   Change MathJax cdn to https
-   Merge pull request \#264 from
    Galadirith/lierdakil/pandoc-native-code-style
-   Merge branch 'rkichenama-master'
-   update menu for split direction, closes
    Galadirith/markdown-preview-plus\#248 (Richard Kichenama)
-   Set Pandoc run path to file dir

## 2.4.2

-   Prepare 2.4.2 release
-   Update CHANGELOG
-   Merge pull request \#265 from
    Galadirith/lierdakil/fix-citeproc-error-display
-   Merge branch 'html-highlights'
-   Fix 'pandoc: \[object Object\]: does not exist'
-   Support Pandoc's native code style in HTML export
-   Pandoc native code style option
-   Fix code highlighting with saveAs
-   Fix Pandoc source code highlighting
-   SaveAs: MathJax should use request's schema
-   No MathJax success notifications if not in devMode
-   Merge pull request \#258 from Galadirith/lierdakil/update-specs
-   \[Spec\] OSX path strangeness
-   \[Spec\] Attempt at fixing OSX spec failure
-   \[Spec\] More informative waits in core:save-as spec
-   Fix specs

## 2.4.1

-   Prepare 2.4.1 release
-   Update CHANGELOG
-   Merge branch 'faku99-master'
-   Set engines to \>=1.13.0
-   Fix for issue \#242 (Lucas Elisei)

## 2.4.0

-   Prepare 2.4.0 release
-   Merge pull request \#196 from Galadirith/trim-trail-nl-only
-   Fix linting error in lib/renderer
-   Add new spec for trimming trailing newline only
-   Trim only trailing newline fixes \#165
-   Change repo and version for markdown-it-math
-   Bump markdown-it@5.1.0
-   Merge pull request \#193 from Galadirith/jl-uncaught-string
-   Fix failing spec due to leaking watched paths
-   Move backwards-compatible `deserializers.add` call back into activate
    (Max Brunsfeld)
-   Use new package.json fields to allow deferred loading (Max
    Brunsfeld)
-   Add spec for not deserializing preview for deleted file (Kevin
    Sawicki)
-   Require fs (Jessica Lord)
-   Simplify checks per comments (Jessica Lord)
-   Default to filePath (Jessica Lord)
-   No previews unless id or path (Jessica Lord)
-   Verify path is string before reading (Jessica Lord)

## 2.3.0

-   Prepare 2.3.0 release
-   Update package description (toned down)
-   Update README for move to maintenance mode
-   Merge pull request \#192 from Galadirith/themed-preview
-   Add list bottom margin (simurai)
-   Adjust header size/weight (simurai)
-   Use variables (simurai)
-   Override link color (simurai)
-   Prevent code color from getting overriden (simurai)
-   Change padding (simurai)
-   Simplify default styles (simurai)
-   Split github and default styles into separate files (simurai)
-   Show code scrollbars on hover (simurai)
-   Remove scrollbar on code blocks (simurai)
-   Merge pull request \#171 from alerque/patch-1
-   Add text.md as a default grammar fixes \#168
-   Merge pull request \#191 from fix-style-init
-   Merge pull request \#184 from laokaplow/patch-1
-   Revert refactor of grammer assignment spec
-   Correct bad refactor of grammer assignment spec
-   Split js grammer assignment into own spec
-   Remove redundant CI configurations
-   Use ES6 .then instead of depreciated .done
-   Update travis to use atom/ci configuration
-   Update appveyor to use atom/ci configuration
-   Update appveryor to use latest stable Atom release
-   Update to fix coffeelint errors
-   Update spec for failing toggle preview activation
-   Update failing save and copy specs
-   Move deserializer to package activation method
-   Update `<atom-styles>` initialization
-   Use new promise api (laokaplow)
-   Fix MD syntax glitch for Atom's internal parser (Caleb Maclennan)
-   Updated Changelog

## 2.2.2

-   Prepare 2.2.2 release
-   Merge pull request \#138 from Galadirith/hotfix/2.2.2
-   Force MathJax to use its local fonts
-   Configure MathJax to always use the TeX web font
-   Updated changeling

## 2.2.1

-   Prepare 2.2.1 release
-   Fixed list-style-types for pandoc fancy lists. Closes \#135 (Lukas
    Eipert)

## 2.2.0

-   Prepare 2.2.0 release
-   Merge pull request \#126 from branch update-preview-specs
-   Add notification indicating MathJax has loaded
-   Add spec to describe code block updating
-   Add specs to describe math block updating
-   Refactor preview creation in update preview specs
-   Merge pull request \#122 from branch feature/copy-svg-equations
-   Add specs to cover copying maths blocks as svg's
-   Allow `main::copyHtml` to copy maths as svg
-   Redefine loadMathJax() to accept a listener method
-   Merge pull request \#120 from Galadirith/fix-appveyor
-   Adjusted appveyor to work correctly (+4 squashed commits) (Lukas
    Eipert)
-   Merge branch '2.1.x'
-   Hopefully fixed windows Errors.
-   Merge pull request \#119 from Galadirith/hotfix/2.1.1

## 2.1.1

-   Prepare 2.1.1 release
-   Implemented Quickfix for Issue \#118
-   Merge pull request \#113 from branch mathjax-dependency
-   Remove mathjax-wrapper installation step from docs
-   Update CI config's for MathJax dependency
-   Add MathJax as explicit dependency
-   Add pandoc-citeproc option, even no file exists. Fixes \#111 (Lukas
    Eipert)
-   Updated Changelog \[ci skip\]

## 2.1.0

-   Prepare 2.1.0 release
-   Merge pull request \#109 from branch fix/ordered-list-start
-   Add specs for updating ordered list start number
-   Update ordered list start number when changed
-   appveyor quick fix
-   Added atom version output to travis and appveyor CI.
-   Merge pull request \#108 from Galadirith/update-installation-docs
-   Remove native build instructions from docs
-   Merge pull request \#107 from fix/deserialization
-   Merge pull request \#94 from feature/drop-pathwatcher
-   Fixed watcher path bug
-   Check if we build faster again on windows
-   Correct garbage collection at the end of specs
-   requiring path watcher with path.join
-   Moved away from highlights to highlights-native
-   forgot to commit image watcher :D
-   Moved image watching to separate module with garbage collection -
    yay!
-   Add spec for math enabled preview without mathjax
-   Change notification from error to info
-   Fix deserialization due to not passing domFragment
-   Merge commit '2c37fae5893be17238d24671b3682e3dd83a046d' into
    feature/drop-pathwatcher

## 2.0.2

-   Prepare 2.0.2 release
-   Merge pull request \#101 from
    Galadirith/fix/cannot-read-property-decode
-   Add specs for Pandoc image resolving
-   Remove unused modules in `lib/renderer`
-   Only call `.decode()` when Pandoc is disabled
-   Bumped Changelog

## 2.0.1

-   Prepare 2.0.1 release
-   Pass empty `env` param to `markdownIt.parse()`
-   Update `docs/math.md` to describe new maths syntax
-   Merge pull request \#96 from Galadirith/feature/lazy-atx-headers
-   Enabled some disabled specs
-   Added own option and spec
-   Added lazy headers
-   Merge pull request \#95 from
    Galadirith/feature/bump-markdown-it-math
-   Bumped markdown-it-math version
-   We only need one appveyor run, as we use the main pathwatcher (Lukas
    Eipert)
-   Merge pull request \#92 from
    Galadirith/fix/markdown-it-instantiation
-   Remove pathwatcher dependency. Use internal pathwatcher. (Lukas
    Eipert)
-   Correct instantiation conditions for markdown-it
-   Fixed Changelog down to Version 2.0.0

## 2.0.0

-   Prepare 2.0.0 release
-   Add on demand sync feature to docs
-   Fixed Travis CI test
-   Updated Changelog
-   Merge pull request \#83 from
    Galadirith/feature/activate-open-preview
-   Add spec for feature/activate-open-preview
-   Activate non-active open preview and don't destory
-   Merge pull request \#80 from Galadirith/feature/source-preview-sync
-   Add specs for source-preview-sync feature
-   Prepared README for CHANGELOG
-   Add inline documentation for sync methods
-   Do not display list items as blocks
-   Fix syncing source lists with preview
-   Revert "Add alt-click keymap to sync source with preview"
-   Add alt-click keymap to sync source with preview
-   Add methods and menu items to sync source/preview
-   Added CI badges and examples to our macro cson
-   Removed minor mistakes ;) \[ci skip\]
-   Merge pull request \#70 from Galadirith/feature/markdown-it (Lukas
    Eipert)
-   Disabled tests for known issues with markdown-it-math
-   Fixed minor bugs \[ci skip\]
-   Added specs for math rendering
-   Fix spec errors on windows
-   Merge branch 'master' into feature/markdown-it
-   Merge pull request \#78 from
    Galadirith/feature/appveyor-improvements
-   This will be the last of the tries :)
-   last try before i cancel travis :-1:
-   Fixed exit code :)
-   Testing apm package maximum of three times
-   Fixed check whether mathjax is already installed
-   Added more debugging to mathjax installation
-   Improved CI testing (appveyor builds and travis.ci false failures)
-   Merge pull request \#14 (through \#75) KCErb/add\_macros
-   Add mathjax-wrapper dependency to CI configs
-   Fix coffeelint errors
-   Merge branch 'master' into prepare-add-macros-merge
-   Add specs for MathJax macro loading
-   Merge pull request \#69 from Galadirith/pathwatcher-without-runas
-   Added images to fixtures to prevent a lot of errors.
-   \[feat\] markdown-it options get reloaded if needed \[fix\] adjusted
    specs to fit markdown-it
-   Add span\#math wrappers to trigger MathJax on diff
-   Forgot to add markdown-it and markdown-it-math to our package.json
-   no message
-   appveyor log reduced \[ci skip\]
-   Adjusted require to pathwatcher-without-runas
-   Migrated to pathwatcher without runas
-   Merge pull request \#68 from Galadirith/fix-wercker
-   \[feat\] deactivated failing tests on wercker (and only on wercker)

## 1.7.0

-   Prepare 1.7.0 release
-   Merge pull request \#63 fixes \#60
-   Preview isnt required to update for restored imgs
-   Second fix, after that enough for today
-   \[feat\] Try to fix wercker
-   Revert "\[fix\] Fixed problems by switching to watchr and watching
    the directory instead of the file."
-   Merge pull request \#64 from Galadirith/fix-bib-support (Lukas
    Eipert)
-   \[fix\] Fixed problems by switching to watchr and watching the
    directory instead of the file.
-   \[feat\] Added specs for most of the pandoc-helper.
-   \[fix\] Fixes \#50. If no bibfile is found, we will default to
    fallback
-   Make image version query a timestamp fixes \#60
-   Merge pull request \#59 from Galadirith/feature/CI
-   Added wercker.yml
-   improved appveyor 3
-   improved appveyor 2
-   improved appveyor
-   Add appveyor
-   Fixed problems with image caching algorithm
-   Fixed coffeescript listing errors
-   Merge PR \#53 fixes \#49
-   Add specs to test modified images preview update
-   Replace img version fragment with version query
-   Preview most recent version of images
-   Add link to supported LaTeX macros further fix \#46
-   Minor bug in 'features.md'
-   Improved documentation, fixes \#46 \#48, also condensed read (Lukas
    Eipert)
-   Convert pre elements to atom-text-editor elements
-   Remove redundent div wrapper in renderer
-   updated dependecies list and latex.md (KC Erb)
-   merge from master (KC Erb)
-   Merge pull request \#28 from leipert/fix-strike-style

## 1.6.0

-   Prepare 1.6.0 release
-   Add MathJax CDN script to saved HTML
-   Improve explanations and descriptions in README
-   Refactor Pandoc additions to README
-   Merge pull request \#41 from leipert/pr-master
-   Fix specs for markdown-preview-plus
-   Fix preview copy HTML and save HTML
-   Merge upstream changes from atom/markdown-preview
-   Updated README according to comments
-   Implemented usage of pandoc renderer. Squashed commits: \[4b1762a\]
    Fixed another bug \[4771f78\] Fixed bug \[af3d248\] Moved pandoc
    functionality to separate module. Commented everything \[af41da5\]
    Improved the stressful Example.md \[62122d3\] Implemented rendering
    \[edb1093\] Changed default options. \[aa9aa77\] First shot at
    pandoc.

## 1.5.0

-   Prepare 1.5.0 release
-   Destroy preview pane through underlying model
-   Prepare 0.150.0 release (Kevin Sawicki)
-   Destroy item via model (Kevin Sawicki)
-   Merge pull request \#256 from atom/mq-coffeelint-plus (Machisté N.
    Quintana)
-   :shirt: Fix linter errors (Machiste Quintana)
-   Add coffeelint support (Machiste Quintana)
-   Prepare 0.149.0 release (Thomas Johansen)
-   Merge pull request \#240 from atom/tj-github-style (Thomas Johansen)
-   :art: Make spec more consistent (Thomas Johansen)
-   :white\_check\_mark: Add specs (Thomas Johansen)

## 1.4.0

-   Prepare 1.4.0 release
-   Add missing comma in package.json
-   Simplify README
-   Merge remote-tracking branch 'upstream/master' into 'master'
-   Yank Primer styles into separate file (Thomas Johansen)
-   Silence .markdown-body mixin output (Thomas Johansen)
-   :fire: Remove commented out selector (Thomas Johansen)
-   Revert parent selector adjustment (Thomas Johansen)
-   :art: Reorder selectors (Thomas Johansen)
-   :fire: Remove seemingly unnecessary style (Thomas Johansen)
-   Use .markdown-body as a mixin (Thomas Johansen)
-   Fix margin issue related to atom-text-editor (Thomas Johansen)
-   Try to use pure .markdown-body styles from Primer (Thomas Johansen)
-   Tweak styles to better align with github.com (Thomas Johansen)
-   Raise specificity of styles instead of duplicating (Thomas Johansen)
-   Implement basic GitHub style functionality (Thomas Johansen)
-   Prepare 0.148.0 release (Kevin Sawicki)
-   Merge pull request \#231 from
    howitzer-industries/hw-render-code-blocks-consistently (Kevin
    Sawicki)
-   Prepare 0.147.0 release (Kevin Sawicki)
-   Conditionally include deprecated APIs (Kevin Sawicki)
-   Style `<code>` blocks consistently with GitHub.com Remove nowrap from
    the styling (Adam Montgomery)
-   Prepare 0.146.0 release (Kevin Sawicki)
-   Merge pull request \#227 from m4b/patch-1 (Kevin Sawicki)
-   update saved-html.html to match markdown-preview output (m4b)
-   :bug: fix for utf8 mangling in markdown preview html (m4b)
-   Prepare 0.145.0 release (Jessica Lord)
-   Merge pull request \#222 from atom/jl-stop-scrolling-md-preview
    (Jessica Lord)
-   Only show spinner initially (Jessica Lord)
-   stop scroll to top on md preview (Jessica Lord)
-   Prepare 0.144.0 release (Jessica Lord)
-   Merge pull request \#220 from atom/jl-destory-cursor (Jessica Lord)
-   gah, remove the focus (Jessica Lord)
-   whoops update var here, too (Jessica Lord)
-   reorg spec (Jessica Lord)
-   Spec for having no line-cursor decoration (Jessica Lord)
-   remove cursor-line previous commit actually removed all cursors, no
    bueno. (Jessica Lord)
-   destory cursor/line decoration (Jessica Lord)
-   Prepare 0.143.0 release (Kevin Sawicki)
-   :arrow\_up: markdown-preview@4.3 (Kevin Sawicki)
-   Prepare 0.142.0 release (Nathan Sobo)
-   Merge pull request \#213 from
    ArnaudRinquin/fix\_missing\_editor\_style (Nathan Sobo)
-   :lipstick: Remove some more useless code (Arnaud Rinquin)
-   :lipstick: Code cleaning (Arnaud Rinquin)
-   Prepare 0.141.0 release (Nathan Sobo)
-   Merge pull request \#216 from atom/revert-215-bf-pathwatcher-4
    (Nathan Sobo)
-   Revert ":arrow\_up: pathwatcher \^4." (Nathan Sobo)
-   Prepare 0.140.0 release (Nathan Sobo)
-   Merge pull request \#215 from atom/bf-pathwatcher-4 (Nathan Sobo)
-   :arrow\_up: pathwatcher \^4. (Michael Bolin)
-   Add text-editor style extraction tests (Arnaud Rinquin)
-   Remove the need for promise. (Arnaud Rinquin)
-   Start style extraction after initialize() (Arnaud Rinquin)
-   Style extraction is now Asyncrhonous (Arnaud Rinquin)
-   Fixed strikethrough layout
    `~~Math in strikethrough $E=mc^2$ fixed~~`
-   Prepare 0.139.0 release (Max Brunsfeld)
-   Merge pull request \#210 from atom/mb-multiple-root-folders (Max
    Brunsfeld)
-   Resolve image paths using the right root directory (Max Brunsfeld)
-   Prepare 0.138.0 release (Daniel Hengeveld)
-   Merge pull request \#205 from ArnaudRinquin/fix\_70 (Daniel
    Hengeveld)
-   Use file name as HTML document title (Arnaud Rinquin)
-   Get text editor style from a created atom-style (Arnaud Rinquin)
-   Encode base64 encode assets (Arnaud Rinquin)
-   Get `atom-text-editor` style from shadow-dom (Arnaud Rinquin)

## 1.3.0

-   Prepare 1.3.0 release
-   Merge remote-tracking branch 'upstream/master'
-   Generated HTML contains necessary CSS (Arnaud Rinquin)
-   Render code blocks as pre tags when markdown is saved to file
    (Arnaud Rinquin)
-   updated syntax checker and examples since brackets are optional (KC
    Erb)
-   changed name of cson, created template, added macros checking (KC
    Erb)
-   Prepare 0.137.0 release (Nathan Sobo)
-   Use a simpler markdown file for copying HTML to clipboard spec
    (Nathan Sobo)
-   Prepare 0.136.0 release (Nathan Sobo)
-   Render code blocks as pre tags when markdown is copied via
    'core:copy' (Nathan Sobo)
-   Prepare 0.135.0 release (Kevin Sawicki)
-   :arrow\_up: temp@0.8.1 (Kevin Sawicki)
-   Merge branch 'master' of markdown-preview-plus into add\_macros (KC
    Erb)
-   Merge pull request \#191 from jbrains/remove-obsolete-code (Kevin
    Sawicki)
-   Removes an apparently unused parameter. (J. B. Rainsberger)
-   Merge pull request \#190 from jbrains/bad-error-callback (Kevin
    Sawicki)
-   Fixes an apparent mistake in checking object existence. (J. B.
    Rainsberger)
-   Prepare 0.134.0 release (Kevin Sawicki)
-   Remove unused requires (Kevin Sawicki)

## 1.2.0

-   Prepare 1.2.0 release
-   Merge remote-tracking branch 'upstream/master'
-   Prepare 0.133.0 release (Kevin Sawicki)
-   Merge pull request \#185 from abejfehr/master (Kevin Sawicki)
-   Merge pull request \#188 from jbrains/fix-readme (Kevin Sawicki)
-   Fixes the README to match the currently-supported file extensions.
    (J. B. Rainsberger)
-   Prepare 0.132.0 release (Kevin Sawicki)
-   Restore old .txt extension command (Kevin Sawicki)
-   Merge pull request \#184 from
    jbrains/preview-fails-for-markdown-extension (Kevin Sawicki)
-   Merge pull request \#182 from jbrains/ignore-debug-log (Kevin
    Sawicki)
-   Add option not to open preview in split pane for \#134 (abejfehr)
-   Bind preview command for \*.markdown files. (J. B. Rainsberger)
-   Ignore npm debug log. (J. B. Rainsberger)
-   Prepare 0.131.0 release (Cheng Zhao)
-   :arrow\_up: hightlights@1.0.0 (Cheng Zhao)
-   Prepare 0.130.0 release (Cheng Zhao)
-   :arrow\_up: pathwatcher@3.0 (Cheng Zhao)
-   Prepare 0.129.0 release (Cheng Zhao)
-   :arrow\_down: pathwatcher@2.0 (Cheng Zhao)
-   Prepare 0.128.0 release (Max Brunsfeld)
-   Avoid spying on prototype methods in spec (Max Brunsfeld)
-   Prepare 0.127.0 release (Cheng Zhao)
-   :arrow\_up: pathwatcher@2.7.0 (Cheng Zhao)

## 1.1.0

-   Prepare 1.1.0 release
-   Reintroduce `pre` selectors
-   Merge remote-tracking branch 'upstream/master'
-   Prepare 0.126.0 release (Max Brunsfeld)
-   Unmock \_.now in spec (Max Brunsfeld)
-   changed macros to load from local cson (KC Erb)
-   Prepare 0.125.0 release (Kevin Sawicki)
-   Handle pre elements with no inner code elements (Kevin Sawicki)
-   Prepare 0.124.0 release (Nathan Sobo)
-   More debug output for flaky spec :hurtrealbad: (Nathan Sobo)
-   Prepare 0.123.0 release (Nathan Sobo)
-   See if renderMarkdown is *ever* called in flaky specs (Nathan Sobo)
-   Prepare 0.122.0 release (Nathan Sobo)
-   Merge pull request \#171 from atom/fix-deprecations (Nathan Sobo)
-   Prepare 0.121.0 release (Nathan Sobo)
-   Add debug output to troubleshoot flaky spec (Nathan Sobo)
-   first go at adding macro support (KC Erb)
-   Prepare 0.120.0 release (Nathan Sobo)
-   Add assertion to debug flaky spec on CI (Nathan Sobo)
-   Prepare 0.119.0 release (Nathan Sobo)
-   Add descriptions to waitsFor blocks to debug CI issue (Nathan Sobo)
-   Prepare 0.118.0 release (Nathan Sobo)
-   Fix capitalization of URI (Nathan Sobo)
-   Remove calls to atom.project.resolve (Nathan Sobo)
-   Rename stylesheets/ -\> styles/ (Nathan Sobo)
-   Merge pull request \#173 from
    atom/ns-use-text-editors-for-code-blocks (Nathan Sobo)
-   Prepare 0.117.0 release (Kevin Sawicki)
-   :arrow\_up: highlights@0.15 (Kevin Sawicki)
-   Get tests passing (Nathan Sobo)
-   Rename toHtml to toDOMFragment (Nathan Sobo)
-   Render code blocks with the atom-text-editor element (Nathan Sobo)

## 1.0.1

-   Prepare 1.0.1 release
-   Update README's Troubleshooting
-   Update roaster to depend on my fork

## 1.0.0

-   Prepare 1.0.0 release
-   Update README for new major release
-   Refactor LaTeX toggle event subscription
-   Set preview to active in tab group on LaTeX toggle
-   Migrate to mathjax-wrapper dependency
-   Update LICENSE to my name
-   Fix deprecated calls (Nathan Sobo)
-   Update shrinkwrap
-   Merge remote-tracking branch 'upstream/master'
-   Prepare 0.116.0 release (Nathan Sobo)
-   Update deprecated selector in keymap (Nathan Sobo)
-   Prepare 0.115.0 release (Nathan Sobo)
-   :arrow\_up: atom-space-pen-views (Nathan Sobo)
-   Prepare 0.114.0 release (Nathan Sobo)
-   :arrow\_up: grim to 1.0 (Nathan Sobo)
-   Prepare 0.113.0 release (Nathan Sobo)
-   :arrow\_up: atom-space-pen-views to 1.0 (Nathan Sobo)
-   Use \^ notation for dependencies (Nathan Sobo)
-   Prepare 0.112.0 release (Nathan Sobo)
-   Merge pull request \#161 from atom/ns-modernize (Nathan Sobo)
-   Remove use of deprecated Config::toggle (Nathan Sobo)
-   Avoid deprecation warnings for custom event (Nathan Sobo)
-   Deprecate markdown-preview:markdown-changed jQuery event (Nathan
    Sobo)
-   Eliminate pane item event deprecation warnings (Nathan Sobo)
-   Use atom.grammars instead of atom.syntax (Nathan Sobo)
-   Use atom-space-pen-views instead of deprecated exports from atom
    module (Nathan Sobo)
-   Remove WorkspaceView references (Nathan Sobo)
-   Use CompositeDisposable instead of Subscriber mixin (Nathan Sobo)
-   Use File::onDidChange (Nathan Sobo)
-   Fix context menu format (Nathan Sobo)
-   Use Config::onDidChange (Nathan Sobo)
-   Fix deprecated method calls and event subscriptions (Nathan Sobo)
-   Use atom.commands to subscribe to view-local commands (Nathan Sobo)
-   Use onDidActivateAll (Nathan Sobo)
-   Use Workspace::addOpener (Nathan Sobo)
-   :lipstick: (Nathan Sobo)
-   Use config schema (Nathan Sobo)
-   Handle preview:file command with atom.commands (Nathan Sobo)
-   Use atom.commands for commands (Nathan Sobo)

## 0.3.0

-   Prepare 0.3.0 release
-   Add troubleshoot for forked marked dependency
-   Update merged upstream changes mp -\> mpp
-   Merge remote-tracking branch 'upstream/markdown-preview-plus'
-   Add instructions enable LaTeX rendering by default
-   Add option to enable LaTeX rendering by default
-   Remove redundant methods in mathjax-helper
-   Update LATEX.md with relaxed delimiter syntax
-   Shrinkwrap marked dep. Galaldirith/marked\#mathjax
-   Prepare 0.111.0 release (Kevin Sawicki)
-   Use raw src if it exists on disk (Kevin Sawicki)

## 0.2.0

-   Prepare 0.2.0 release
-   Simplify License, Trouble, Install README sections
-   Update install instructions and troubleshooting
-   Merge remote-tracking branch 'upstream/markdown-preview-plus'
-   Replace MathJax install script with node package
-   Update README with new non-pre-scaled image

## 0.1.2

-   Prepare 0.1.2 release
-   Change relative img link to absolute img link

## 0.1.1

-   Prepare 0.1.1 release
-   Update README with img and install troubleshooting
-   Update package description to highlight LaTeX

## 0.1.0

-   Prepare 0.1.0 release
-   Remove html table and LaTeX.svg from README
-   Update README installation instructions
-   Merge remote-tracking branch 'upstream/markdown-preview-plus'
-   Prevent overwrite of MathJax folder if exists
-   Update menu and keymaps for MPP
-   Migrate config keypaths and commandpaths to MPP
-   Prepare package.json for MPP publishing
-   Merge remote-tracking branch 'upstream/markdown-preview-plus'
-   Fix path resolution to MathJax
-   Update README
-   Update LICENCE
-   Add instructions for LaTeX syntax and rendering
-   Add support to render LaTeX equations
-   Download and decompress MathJax tarball on install
