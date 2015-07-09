# Markdown Preview Plus (MPP)

![MPP](https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/imgs/mpp-full-res-invert.png)

Markdown Preview Plus (MPP) is a fork of
[Markdown Preview](https://github.com/atom/markdown-preview) that provides a
real-time preview of markdown documents. Should you have any problems while
installing or using MPP, or if you would like to see a new feature added please
open up a
[new issue](https://github.com/Galadirith/markdown-preview-plus/issues/new).

## Features

- **LaTeX equation rendering**  
  LaTeX equations in the source markdown are rendered in the preview pane.
  Rendering of LaTeX equations in the preview pane can be toggled with
  `ctrl-shift-x`. Please see [LaTeX](LATEX.md) for more details.

- **Pandoc support**  
  You can use [Pandoc](https://github.com/jgm/pandoc) to render the
  markdown preview which provides a richer functionality including support to
  define custom [pandoc arguments](http://pandoc.org/README.html#options),
  adjust the [markdown flavor](http://pandoc.org/README.html#pandocs-markdown)
  and enable [citation replacement](http://pandoc.org/README.html#citations).

## Installation

1.  **Check installation dependencies**  
    The installation process uses
    [node-gyp](https://github.com/TooTallNate/node-gyp) which is installed when
    you installed atom. Please check the
    [installation](https://github.com/TooTallNate/node-gyp#installation) section
    of node-gyp to ensure you have all the programs installed that it requires
    to run.

2.  **Install MPP**  
    Search for **Markdown Preview Plus** in the menu **File &rsaquo; Settings
    &rsaquo; Install** and click **Install**. Please allow 3-5 mins for
    installation. Alternatively if you would prefer to use the command line
    utility `apm`:

    ````bash
    $ apm install markdown-preview-plus
    ````

3.  **Install mathjax-wrapper**  
    Search for **mathjax-wrapper** in the menu **File &rsaquo; Settings &rsaquo;
    Install** and click **Install**. Please allow 10-15 mins for installation
    of mathjax-wrapper. Alternatively if you would prefer to use the command
    line utility `apm`:

    ````bash
    $ apm install mathjax-wrapper
    ````

4.  **Disable Markdown Preview**  
    Disable the built in Markdown Preview package. You can do this by searching
    for **Markdown Preview** in the menu **File &rsaquo; Settings &rsaquo;
    Packages** and clicking **Disable**.

5.  **(Optional) Enable Pandoc**  
    Optionally you may use Pandoc to render the Markdown preview. To enable
    Pandoc within MPP:

    1.  [Install pandoc](http://pandoc.org/installing.html)
    2.  Run `which pandoc` and note the full path to the Pandoc executable.
    3.  On the MPP settings page enable **Enable Pandoc Parser**
    4.  Enter the path from step 2 into **Pandoc Options: Path**

## Usage

### Opening a preview

If you are editing a markdown document in atom you can open a preview with
`ctrl-shift-m` that will update in real-time as you edit the document. You can
also right click on a markdown document in the tree-view and select **Markdown
Preview** to open a standalone preview.

### LaTeX equation rendering

MPP extends the syntax of
[GitHub flavored markdown](https://help.github.com/articles/github-flavored-markdown/)
with equation blocks. An equation block is indicated by enclosing it in double
dollar signs `$$...$$`. You can use any LaTeX macros that are valid in a maths
environment of a LaTeX document inside an equation block. Rendering of LaTeX
equations in the document preview can be toggled with `ctrl-shift-x`.

For more details on using equations in MPP please see [LaTeX](LATEX.md).

### Pandoc citation replacement

If you have enabled Pandoc to render the markdown preview then you can enable
citation replacement by enabling **Pandoc Options: Citations** on the MPP
settings page.

MPP will now search for any file named *bibliography.bib* and *custom.csl*
from the markdown's directory up. The first files that are matching will be
used for Pandocs citations. You can change the filenames it is searching for
by changing the options **Bibliography (bibfile)** and **Bibliography Style
(cslfile)** on the settings page.

Here is a small example how it works:
````
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
Effictively the arguments `--csl=/custom.csl --bibliography=/bibliography.bib`
are used for `/README.md` and `--csl=/custom.csl
--bibliography=/src/bibliography.bib` for `/src/md/RANDOM.md`

## License

Markdown Preview Plus (MPP) is released under the [MIT license](LICENSE.md).
