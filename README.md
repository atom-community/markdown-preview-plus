# Markdown Preview Plus (MPP)

![MPP](https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/imgs/mpp-full-res-invert.png)

All the yummy goodness of
[Markdown Preview](https://github.com/atom/markdown-preview) with sprinklings of
delicious new features. Show the rendered HTML markdown to the right of the
current editor using the keymap `ctrl-shift-m`.

## New Features

- **LaTeX equation rendering**  
  LaTeX equations in the source markdown are rendered in the preview pane.
  Rendering of LaTeX equations in the preview pane can be toggled with
  `ctrl-shift-x`. Please see [LaTeX](LATEX.md) for more details.

## Installation Instructions

1.  The installation process uses
    [node-gyp](https://github.com/TooTallNate/node-gyp) which is installed when
    you installed atom. Please check the
    [installation](https://github.com/TooTallNate/node-gyp#installation) section
    of node-gyp to ensure you have all the programs installed that it requires
    to run.

2.  Search for **Markdown Preview Plus** in the menu **File &rsaquo; Settings
    &rsaquo; Install** and click **Install**. Please allow 3-5 mins for
    installation. Alternatively if you would prefer to use the command line
    utility `apm`:

    ````bash
    $ apm install markdown-preview-plus
    ````

3.  Search for **mathjax-wrapper** in the menu **File &rsaquo; Settings &rsaquo;
    Install** and click **Install**. Please allow 10-15 mins for installation
    of mathjax-wrapper. Alternatively if you would prefer to use the command
    line utility `apm`:

    ````bash
    $ apm install mathjax-wrapper
    ````

    * Optionally you may use pandoc to render the Markdown preview. Please have a look at the pandoc section below for instructions.

4.  Disable the built in Markdown Preview package. You can do this by searching
    for **Markdown Preview** in the menu **File &rsaquo; Settings &rsaquo;
    Packages** and clicking **Disable**.

Should you have any problems while installing or using MPP please open up a
[new issue](https://github.com/Galadirith/markdown-preview-plus/issues/new).


## Pandoc

Below you will find an installation guide for pandoc and an explanation of all settings

1. [Install pandoc](http://pandoc.org/installing.html)
2. Run `which pandoc` and note the full path to the pandoc executable
3. On the Markdown-Preview-Plus Settings Page
    - enable **Enable Pandoc Parser**
    - paste the result of 2. into **Pandoc Options: Path**
4. voilà - pandoc should work

The Pandoc options give you furthermore the possibility to

* define custom [pandoc arguments](http://pandoc.org/README.html#options)
* adjust the [markdown flavor](http://pandoc.org/README.html#pandocs-markdown)
* enable [citation replacement](http://pandoc.org/README.html#citations) for references like &#x5B;&#x40;smith04&#x5D;
    - Therefore enable **Pandoc Options: Citations**
    - MPP will now search for any file named *bibliography.bib* and *custom.csl* from the markdown's directory up. The first files that are matching will be used for pandocs citations. You can change the filenames it is searching for with the option **Bibliography (bibfile)** and **Bibliography Style (cslfile)**. Here is a small example how it works:
    ````
    /
    |-- bibliography.bib     <-- will be used by README.md
    |-- custom.csl           <-- will be used by README.md & RANDOM.md
    |-- src
    |   |-- bibliography.bib <-- will be used by RANDOM.md
    |   |-- otherbib.bib     <-- will not be used as filename does not match
    |   `-- md
    |       `-- RANDOM.md
    `-- README.md
    ````
    Effictively the arguments `--csl=/custom.csl --bibliography=/bibliography.bib` are used for `/README.md` and `--csl=/custom.csl --bibliography=/src/bibliography.bib` for `/src/md/RANDOM.md`

## License

Markdown Preview Plus (MPP) is released under the [MIT license](LICENSE.md).
