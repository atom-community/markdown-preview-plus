## 2.5.7

-   Do not show list bullets for checkbox lists

## 2.5.6

-   Add overflow:auto to saved html code blocks style
-   Updated spec to not break horribly on new Atom versions

## 2.5.5

-   Make duplicate attachMathJax calls safe

## 2.5.4

-   Remove extraneous wrapper in exported HTML
-   Fix spec on Atom 1.24.0

## 2.5.3

-   [Workaround] Work around for Atom bug #16801

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
-   CheckBox lists (\#186)
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
-   Use travis trusty env
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
-   Set pandoc run path to file dir

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
-   Set pandoc run path to file dir

## 2.4.2

-   Prepare 2.4.2 release
-   Update CHANGELOG
-   Merge pull request \#265 from
    Galadirith/lierdakil/fix-citeproc-error-display
-   Merge branch 'html-highlights'
-   Fix 'pandoc: \[object Object\]: does not exist'
-   Support pandoc's native code style in html export
-   pandoc native code style option
-   Fix code highlighting with saveAs
-   Fix pandoc source code higlighting
-   SaveAs: MathJax should use request's schema
-   No mathjax success notifications if not in devMode
-   Merge pull request \#258 from Galadirith/lierdakil/update-specs
-   \[Spec\] OSX path strangeness
-   \[Spec\] Attempt at fixing osx spec failure
-   \[Spec\] More informative waits in core:save-as spec
-   Fix specs

## 2.4.1

-   Prepare 2.4.1 release
-   Update CHANGELOG
-   Merge branch 'faku99-master'
-   Set engines to \>=1.13.0
-   Fix for issue \#242 (Lucas Elisei)

## 2.4.0

-   Prepare 2.4.0 release (Edward Fauchon-Jones)
-   Merge pull request \#196 from Galadirith/trim-trail-nl-only (Edward
    Fauchon-Jones)
-   Fix linting error in lib/renderer (Edward Fauchon-Jones)
-   Add new spec for triming trailing newline only (Edward
    Fauchon-Jones)
-   Trim only trailing newline fixes \#165 (Edward Fauchon-Jones)
-   Change repo and version for markdown-it-math (Edward Fauchon-Jones)
-   Bump markdown-it@5.1.0 (Edward Fauchon-Jones)
-   Merge pull request \#193 from Galadirith/jl-uncaught-string (Edward
    Fauchon-Jones)
-   Fix failing spec due to leaking watched paths (Edward Fauchon-Jones)
-   Move backwards-compatible deserializers.add call back into activate
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

-   Prepare 2.3.0 release (Edward Fauchon-Jones)
-   Update package description (toned down) (Edward Fauchon-Jones)
-   Update README for move to maintenance mode (Edward Fauchon-Jones)
-   Merge pull request \#192 from Galadirith/themed-preview (Edward
    Fauchon-Jones)
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
-   Merge pull request \#171 from alerque/patch-1 (Edward Fauchon-Jones)
-   Add text.md as a default grammar fixes \#168 (Edward Fauchon-Jones)
-   Merge pull request \#191 from fix-style-init (Edward Fauchon-Jones)
-   Merge pull request \#184 from laokaplow/patch-1 (Edward
    Fauchon-Jones)
-   Revert refactor of grammer assignment spec (Edward Fauchon-Jones)
-   Correct bad refactor of grammer assignment spec (Edward
    Fauchon-Jones)
-   Split js grammer assignment into own spec (Edward Fauchon-Jones)
-   Remove redundant CI configurations (Edward Fauchon-Jones)
-   Use ES6 .then instead of depreciated .done (Edward Fauchon-Jones)
-   Update travis to use atom/ci configuration (Edward Fauchon-Jones)
-   Update appveyor to use atom/ci configuration (Edward Fauchon-Jones)
-   Update appveryor to use latest stable Atom release (Edward
    Fauchon-Jones)
-   Update to fix coffeelint errors (Edward Fauchon-Jones)
-   Update spec for failing toggle preview activation (Edward
    Fauchon-Jones)
-   Update failing save and copy specs (Edward Fauchon-Jones)
-   Move deserializer to package activation method (Edward
    Fauchon-Jones)
-   Update `<atom-styles>` initialization (Edward Fauchon-Jones)
-   Use new promise api (laokaplow)
-   Fix MD syntax glitch for Atom's internal parser (Caleb Maclennan)
-   Updated Changelog (Lukas Eipert)

## 2.2.2

-   Prepare 2.2.2 release (Lukas Eipert)
-   Merge pull request \#138 from Galadirith/hotfix/2.2.2 (Lukas Eipert)
-   Force MathJax to use its local fonts (Edward Fauchon-Jones)
-   Configure MathJax to always use the TeX web font (Edward
    Fauchon-Jones)
-   Updated changeling (Lukas Eipert)

## 2.2.1

-   Prepare 2.2.1 release (Lukas Eipert)
-   Fixed list-style-types for pandoc fancy lists. Closes \#135 (Lukas
    Eipert)

## 2.2.0

-   Prepare 2.2.0 release (Edward Fauchon-Jones)
-   Merge pull request \#126 from branch update-preview-specs (Edward
    Fauchon-Jones)
-   Add notification indicating MathJax has loaded (Edward
    Fauchon-Jones)
-   Add spec to describe code block updating (Edward Fauchon-Jones)
-   Add specs to describe math block updating (Edward Fauchon-Jones)
-   Refactor preview creation in update preview specs (Edward
    Fauchon-Jones)
-   Merge pull request \#122 from branch feature/copy-svg-equations
    (Edward Fauchon-Jones)
-   Add specs to cover copying maths blocks as svg's (Edward
    Fauchon-Jones)
-   Allow `main::copyHtml` to copy maths as svg (Edward Fauchon-Jones)
-   Redefine loadMathJax() to accept a listener method (Edward
    Fauchon-Jones)
-   Merge pull request \#120 from Galadirith/fix-appveyor (Lukas Eipert)
-   Adjusted appveyor to work correctly (+4 squashed commits) (Lukas
    Eipert)
-   Merge branch '2.1.x' (Lukas Eipert)
-   Hopefully fixed windows Errors. (Lukas Eipert)
-   Merge pull request \#119 from Galadirith/hotfix/2.1.1 (Lukas Eipert)

## 2.1.1

-   Prepare 2.1.1 release (Lukas Eipert)
-   Implemented Quickfix for Issue \#118 (Lukas Eipert)
-   Merge pull request \#113 from branch mathjax-dependency (Edward
    Fauchon-Jones)
-   Remove mathjax-wrapper installation step from docs (Edward
    Fauchon-Jones)
-   Update CI config's for MathJax dependency (Edward Fauchon-Jones)
-   Add MathJax as explicit dependency (Edward Fauchon-Jones)
-   Add pandoc-citeproc option, even no file exists. Fixes \#111 (Lukas
    Eipert)
-   Updated Changelog \[ci skip\] (Lukas Eipert)

## 2.1.0

-   Prepare 2.1.0 release (Lukas Eipert)
-   Merge pull request \#109 from branch fix/ordered-list-start (Edward
    Fauchon-Jones)
-   Add specs for updating ordered list start number (Edward
    Fauchon-Jones)
-   Update ordered list start number when changed (Edward Fauchon-Jones)
-   appveyor quick fix (Lukas Eipert)
-   Added atom version output to travis and appveyor CI. (Lukas Eipert)
-   Merge pull request \#108 from Galadirith/update-installation-docs
    (Lukas Eipert)
-   Remove native build instructions from docs (Edward Fauchon-Jones)
-   Merge pull request \#107 from fix/deserialization (Edward
    Fauchon-Jones)
-   Merge pull request \#94 from feature/drop-pathwatcher (Edward
    Fauchon-Jones)
-   Fixed watcher path bug (Lukas Eipert)
-   Check if we build faster again on windows (Lukas Eipert)
-   Correct garbage collection at the end of specs (Lukas Eipert)
-   requiring path watcher with path.join (Lukas Eipert)
-   Moved away from highlights to highlights-native (Lukas Eipert)
-   forgot to commit image watcher :D (Lukas Eipert)
-   Moved image watching to separate module with garbage collection -
    yay! (Lukas Eipert)
-   Add spec for math enabled preview without mathjax (Edward
    Fauchon-Jones)
-   Change notification from error to info (Edward Fauchon-Jones)
-   Fix deserialization due to not passing domFragment (Edward
    Fauchon-Jones)
-   Merge commit '2c37fae5893be17238d24671b3682e3dd83a046d' into
    feature/drop-pathwatcher (Lukas Eipert)

## 2.0.2

-   Prepare 2.0.2 release (Edward Fauchon-Jones)
-   Merge pull request \#101 from
    Galadirith/fix/cannot-read-property-decode (Lukas Eipert)
-   Add specs for Pandoc image resolving (Edward Fauchon-Jones)
-   Remove unused modules in `lib/renderer` (Edward Fauchon-Jones)
-   Only call `.decode()` when Pandoc is disabled (Edward Fauchon-Jones)
-   Bumped Changelog (Lukas Eipert)

## 2.0.1

-   Prepare 2.0.1 release (Edward Fauchon-Jones)
-   Pass empty `env` param to `markdownIt.parse()` (Edward
    Fauchon-Jones)
-   Update `docs/math.md` to describe new maths syntax (Edward
    Fauchon-Jones)
-   Merge pull request \#96 from Galadirith/feature/lazy-atx-headers
    (Lukas Eipert)
-   Enabled some disabled specs (Lukas Eipert)
-   Added own option and spec (Lukas Eipert)
-   Added lazy headers (Lukas Eipert)
-   Merge pull request \#95 from
    Galadirith/feature/bump-markdown-it-math (Lukas Eipert)
-   Bumped markdown-it-math version (Lukas Eipert)
-   We only need one appveyor run, as we use the main pathwatcher (Lukas
    Eipert)
-   Merge pull request \#92 from
    Galadirith/fix/markdown-it-instantiation (Edward Fauchon-Jones)
-   Remove pathwatcher dependency. Use internal pathwatcher. (Lukas
    Eipert)
-   Correct instantiation conditions for markdown-it (Edward
    Fauchon-Jones)
-   Fixed Changelog down to Version 2.0.0 (Lukas Eipert)

## 2.0.0

-   Prepare 2.0.0 release (Edward Fauchon-Jones)
-   Add on demand sync feature to docs (Edward Fauchon-Jones)
-   Fixed Travis CI test (Lukas Eipert)
-   Updated Changelog (Lukas Eipert)
-   Merge pull request \#83 from
    Galadirith/feature/activate-open-preview (Edward Fauchon-Jones)
-   Add spec for feature/activate-open-preview (Edward Fauchon-Jones)
-   Activate non-active open preview and don't destory (Edward
    Fauchon-Jones)
-   Merge pull request \#80 from Galadirith/feature/source-preview-sync
    (Edward Fauchon-Jones)
-   Add specs for source-preview-sync feature (Edward Fauchon-Jones)
-   Prepared README for CHANGELOG (Lukas Eipert)
-   Add inline documentation for sync methods (Edward Fauchon-Jones)
-   Do not display list items as blocks (Edward Fauchon-Jones)
-   Fix syncing source lists with preview (Edward Fauchon-Jones)
-   Revert "Add alt-click keymap to sync source with preview" (Edward
    Fauchon-Jones)
-   Add alt-click keymap to sync source with preview (Edward
    Fauchon-Jones)
-   Add methods and menu items to sync source/preview (Edward
    Fauchon-Jones)
-   Added CI badges and examples to our macro cson (Lukas Eipert)
-   Removed minor mistakes ;) \[ci skip\] (Lukas Eipert)
-   Merge pull request \#70 from Galadirith/feature/markdown-it (Lukas
    Eipert)
-   Disabled tests for known issues with markdown-it-math (Lukas Eipert)
-   Fixed minor bugs \[ci skip\] (Lukas Eipert)
-   Added specs for math rendering (Lukas Eipert)
-   Fix spec errors on windows (Edward Fauchon-Jones)
-   Merge branch 'master' into feature/markdown-it (Lukas Eipert)
-   Merge pull request \#78 from
    Galadirith/feature/appveyor-improvements (Lukas Eipert)
-   This will be the last of the tries :) (Lukas Eipert)
-   last try before i cancel travis :-1: (Lukas Eipert)
-   Fixed exit code :) (Lukas Eipert)
-   Testing apm package maximum of three times (Lukas Eipert)
-   Fixed check whether mathjax is already installed (Lukas Eipert)
-   Added more debugging to mathjax installation (Lukas Eipert)
-   Improved CI testing (appveyor builds and travis.ci false failures)
    (Lukas Eipert)
-   Merge pull request \#14 (through \#75) KCErb/add\_macros (Edward
    Fauchon-Jones)
-   Add mathjax-wrapper dependency to CI configs (Edward Fauchon-Jones)
-   Fix coffeelint errors (Edward Fauchon-Jones)
-   Merge branch 'master' into prepare-add-macros-merge (Edward
    Fauchon-Jones)
-   Add specs for MathJax macro loading (Edward Fauchon-Jones)
-   Merge pull request \#69 from Galadirith/pathwatcher-without-runas
    (Lukas Eipert)
-   Added images to fixtures to prevent a lot of errors. (Lukas Eipert)
-   \[feat\] markdown-it options get reloaded if needed \[fix\] adjusted
    specs to fit markdown-it (Lukas Eipert)
-   Add span\#math wrappers to trigger MathJax on diff (Edward
    Fauchon-Jones)
-   Forgot to add markdown-it and markdown-it-math to our package.json
    (Lukas Eipert)
-   no message (Lukas Eipert)
-   appveyor log reduced \[ci skip\] (Lukas Eipert)
-   Adjusted require to pathwatcher-without-runas (Lukas Eipert)
-   Migrated to pathwatcher without runas (Lukas Eipert)
-   Merge pull request \#68 from Galadirith/fix-wercker (Lukas Eipert)
-   \[feat\] deactivated failing tests on wercker (and only on wercker)
    (Lukas Eipert)

## 1.7.0

-   Prepare 1.7.0 release (Edward Fauchon-Jones)
-   Merge pull request \#63 fixes \#60 (Edward Fauchon-Jones)
-   Preview isnt required to update for restored imgs (Edward
    Fauchon-Jones)
-   Second fix, after that enough for today (Lukas Eipert)
-   \[feat\] Try to fix wercker (Lukas Eipert)
-   Revert "\[fix\] Fixed problems by switching to watchr and watching
    the directory instead of the file." (Edward Fauchon-Jones)
-   Merge pull request \#64 from Galadirith/fix-bib-support (Lukas
    Eipert)
-   \[fix\] Fixed problems by switching to watchr and watching the
    directory instead of the file. (Lukas Eipert)
-   \[feat\] Added specs for most of the pandoc-helper. (Lukas Eipert)
-   \[fix\] Fixes \#50. If no bibfile is found, we will default to
    fallback (Lukas Eipert)
-   Make image version query a timestamp fixes \#60 (Edward
    Fauchon-Jones)
-   Merge pull request \#59 from Galadirith/feature/CI (Lukas Eipert)
-   Added wercker.yml (Lukas Eipert)
-   improved appveyor 3 (Lukas Eipert)
-   improved appveyor 2 (Lukas Eipert)
-   improved appveyor (Lukas Eipert)
-   Add appveyor (Lukas Eipert)
-   Fixed problems with image caching algorithm (Lukas Eipert)
-   Fixed coffeescript listing errors (Lukas Eipert)
-   Merge PR \#53 fixes \#49 (Edward Fauchon-Jones)
-   Add specs to test modified images preview update (Edward
    Fauchon-Jones)
-   Replace img version fragment with version query (Edward
    Fauchon-Jones)
-   Preview most recent version of images (Edward Fauchon-Jones)
-   Add link to supported LaTeX macros further fix \#46 (Edward
    Fauchon-Jones)
-   Minor bug in 'features.md' (Lukas Eipert)
-   Improved documentation, fixes \#46 \#48, also condensed read (Lukas
    Eipert)
-   Convert pre elements to atom-text-editor elements (Edward
    Fauchon-Jones)
-   Remove redundent div wrapper in renderer (Edward Fauchon-Jones)
-   updated dependecies list and latex.md (KC Erb)
-   merge from master (KC Erb)
-   Merge pull request \#28 from leipert/fix-strike-style (Lukas Eipert)

## 1.6.0

-   Prepare 1.6.0 release (Edward Fauchon-Jones)
-   Add MathJax CDN script to saved HTML (Edward Fauchon-Jones)
-   Improve explanations and descriptions in README (Edward
    Fauchon-Jones)
-   Refactor Pandoc additions to README (Edward Fauchon-Jones)
-   Merge pull request \#41 from leipert/pr-master (Edward
    Fauchon-Jones)
-   Fix specs for markdown-preview-plus (Edward Fauchon-Jones)
-   Fix preview copy HTML and save HTML (Edward Fauchon-Jones)
-   Merge upstream changes from atom/markdown-preview (Edward
    Fauchon-Jones)
-   Updated README according to comments (Lukas Eipert)
-   Implemented usage of pandoc renderer. Squashed commits: \[4b1762a\]
    Fixed another bug \[4771f78\] Fixed bug \[af3d248\] Moved pandoc
    functionality to separate module. Commented everything \[af41da5\]
    Improved the stressful Example.md \[62122d3\] Implemented rendering
    \[edb1093\] Changed default options. \[aa9aa77\] First shot at
    pandoc. (Edward Fauchon-Jones)

## 1.5.0

-   Prepare 1.5.0 release (Edward Fauchon-Jones)
-   Destroy preview pane through underlying model (Edward Fauchon-Jones)
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

-   Prepare 1.4.0 release (Edward Fauchon-Jones)
-   Add missing comma in package.json (Edward Fauchon-Jones)
-   Simplify README (Edward Fauchon-Jones)
-   Merge remote-tracking branch 'upstream/master' into 'master' (Edward
    Fauchon-Jones)
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
-   Style <code> blocks consistently with GitHub.com Remove nowrap from
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
    `~~Math in strikethrough $E=mc^2$ fixed~~` (Lukas Eipert)
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

-   Prepare 1.3.0 release (Edward Fauchon-Jones)
-   Merge remote-tracking branch 'upstream/master' (Edward
    Fauchon-Jones)
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

-   Prepare 1.2.0 release (Edward Fauchon-Jones)
-   Merge remote-tracking branch 'upstream/master' (Edward
    Fauchon-Jones)
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

-   Prepare 1.1.0 release (Edward Fauchon-Jones)
-   Reintroduce `pre` selectors (Edward Fauchon-Jones)
-   Merge remote-tracking branch 'upstream/master' (Edward
    Fauchon-Jones)
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

-   Prepare 1.0.1 release (Edward Fauchon-Jones)
-   Update README's Troubleshooting (Edward Fauchon-Jones)
-   Update roaster to depend on my fork (Edward Fauchon-Jones)

## 1.0.0

-   Prepare 1.0.0 release (Edward Fauchon-Jones)
-   Update README for new major release (Edward Fauchon-Jones)
-   Refactor LaTeX toggle event subscription (Edward Fauchon-Jones)
-   Set preview to active in tab group on LaTeX toggle (Edward
    Fauchon-Jones)
-   Migrate to mathjax-wrapper dependency (Edward Fauchon-Jones)
-   Update LICENSE to my name (Edward Fauchon-Jones)
-   Fix deprecated calls (Nathan Sobo)
-   Update shrinkwrap (Edward Fauchon-Jones)
-   Merge remote-tracking branch 'upstream/master' (Edward
    Fauchon-Jones)
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

-   Prepare 0.3.0 release (Edward Fauchon-Jones)
-   Add troubleshoot for forked marked dependency (Edward Fauchon-Jones)
-   Update merged upstream changes mp -\> mpp (Edward Fauchon-Jones)
-   Merge remote-tracking branch 'upstream/markdown-preview-plus'
    (Edward Fauchon-Jones)
-   Add instructions enable LaTeX rendering by default (Edward
    Fauchon-Jones)
-   Add option to enable LaTeX rendering by default (Edward
    Fauchon-Jones)
-   Remove redundant methods in mathjax-helper (Edward Fauchon-Jones)
-   Update LATEX.md with relaxed delimiter syntax (Edward Fauchon-Jones)
-   Shrinkwrap marked dep. Galaldirith/marked\#mathjax (Edward
    Fauchon-Jones)
-   Prepare 0.111.0 release (Kevin Sawicki)
-   Use raw src if it exists on disk (Kevin Sawicki)

## 0.2.0

-   Prepare 0.2.0 release (Edward Fauchon-Jones)
-   Simplify License, Trouble, Install README sections (Edward
    Fauchon-Jones)
-   Update install instructions and troubleshooting (Edward
    Fauchon-Jones)
-   Merge remote-tracking branch 'upstream/markdown-preview-plus'
    (Edward Fauchon-Jones)
-   Replace MathJax install script with node package (Edward
    Fauchon-Jones)
-   Update README with new non-pre-scaled image (Edward Fauchon-Jones)

## 0.1.2

-   Prepare 0.1.2 release (Edward Fauchon-Jones)
-   Change relative img link to absolute img link (Edward Fauchon-Jones)

## 0.1.1

-   Prepare 0.1.1 release (Edward Fauchon-Jones)
-   Update README with img and install troubleshooting (Edward
    Fauchon-Jones)
-   Update package description to highlight LaTeX (Edward Fauchon-Jones)

## 0.1.0

-   Prepare 0.1.0 release (Edward Fauchon-Jones)
-   Remove html table and LaTeX.svg from README (Edward Fauchon-Jones)
-   Update README installation instructions (Edward Fauchon-Jones)
-   Merge remote-tracking branch 'upstream/markdown-preview-plus'
    (Edward Fauchon-Jones)
-   Prevent overwrite of MathJax folder if exists (Edward Fauchon-Jones)
-   Update menu and keymaps for MPP (Edward Fauchon-Jones)
-   Migrate config keypaths and commandpaths to MPP (Edward
    Fauchon-Jones)
-   Prepare package.json for MPP publishing (Edward Fauchon-Jones)
-   Merge remote-tracking branch 'upstream/markdown-preview-plus'
    (Edward Fauchon-Jones)
-   Fix path resolution to MathJax (Edward Fauchon-Jones)
-   Update README (Edward Fauchon-Jones)
-   Update LICENCE (Edward Fauchon-Jones)
-   Add instructions for LaTeX syntax and rendering (Edward
    Fauchon-Jones)
-   Add support to render LaTeX equations (Edward Fauchon-Jones)
-   Download and decompress MathJax tarball on install (Edward
    Fauchon-Jones)
