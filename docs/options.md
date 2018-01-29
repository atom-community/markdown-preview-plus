# Options

The following settings are considered self-explainatory:

-   *Break On Single Newline*
-   *Live Update*
-   *Open Preview In Split Pane*
-   *Enable Math Rendering By Default*
-   *Use GitHub.com style*
-   *Enable Pandoc Parser*

### A note on Pandoc and *Break On Single Newline*

This option does not affect Pandoc parser.

You should be able to coerce Pandoc into breaking lines on single newline by setting the appropriate `hard_line_breaks` flag (See the [Formats](http://pandoc.org/MANUAL.html#general-options) and [Non-pandoc extensions](http://pandoc.org/MANUAL.html#non-pandoc-extensions) of the Pandoc manual)

TL;DR: `hard_line_breaks` extension should do it.

![Example of 'Pandoc Options: Markdown Flavor' option value: markdown+hard_line_breaks ](https://cloud.githubusercontent.com/assets/1201875/22458834/2c4f8764-e796-11e6-9411-140ce4b57438.png)

## Pandoc Options

If *Enable Pandoc Parser* is enabled, you need to specify:

-   *Path*: Full path to pandoc executable, `which pandoc` on unix

-   *Commandline Arguments*:
    The commandline arguments for pandoc need to be comma separated.
    Please note that arguments which take an argument like `--filter`
    should be defined as `--filter=/path/to/exe` instead of
    `--filter /path/to/exe`

-   *Markdown Flavor*:
    Here you can define your Markdown flavor, as defined [here](http://pandoc.org/README.html#pandocs-markdown)
    Please note, that raw tex does not work when rendering markdown to html
    (see [issue #46][issue-46]).

-   *Citations*:
    Whether to use pandoc [citation][pandoc-cit] functionality.

### Pandoc citations

If you have enabled Pandoc to render the markdown preview then you can enable
citation replacement by enabling **Pandoc Options: Citations** on the MPP
settings page.

MPP will now search for any file named *bibliography.bib* and *custom.csl*
from the markdown's directory up. The first files that are matching will be
used for Pandocs citations. You can change the filenames it is searching for
by changing the options **Bibliography (bibfile)** and **Bibliography Style
(cslfile)** on the settings page.

You can set a fallback bibfile and cslfile if the current repository
has none of it's own.

Here is a small example how it works:

```` text
./
├── bibliography.bib     <-- will be used by README.md
├── custom.csl           <-- will be used by README.md & RANDOM.md
├── src
│   ├── bibliography.bib <-- will be used by RANDOM.md
│   ├── otherbib.bib     <-- will not be used as filename does not match
│   └── md
│       └── RANDOM.md
└── README.md
````

Effectively the arguments `--csl=./custom.csl --bibliography=./bibliography.bib`
are used for `./README.md` and `--csl=./custom.csl
--bibliography=./src/bibliography.bib` for `./src/md/RANDOM.md`

[issue-46]: https://github.com/Galadirith/markdown-preview-plus/issues/46#issuecomment-124324926
[pandoc-cit]: http://pandoc.org/README.html#citations
