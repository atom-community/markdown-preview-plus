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

1.  Search for **Markdown Preview Plus** in the menu **File &rsaquo; Settings
    &rsaquo; Packages** and click **Install**. Please allow 3-5 mins for
    installation. Alternatively if you would prefer to use the command line
    utility `apm`:

    ````bash
    $ apm install markdown-preview-plus
    ````

2.  Disable the built in Markdown Preview package. You can do this by searching
    for **Markdown Preview Plus** in the **Filter packages** input dialogue of
    the **File &rsaquo; Settings** menu and clicking **Disable**.

3.  Markdown Preview Plus requires the
    [mathjax-wrapper](https://github.com/Galadirith/mathjax-wrapper) package to
    be installed to preview LaTeX. To install mathjax-wrapper search for
    **mathjax-wrapper** in the menu **File &rsaquo; Settings &rsaquo; Packages**
    and click **Install**. Please allow 10-15 mins for installation of
    mathjax-wrapper. Alternatively if you would prefer to use the command line
    utility `apm`:

    ````bash
    $ apm install mathjax-wrapper
    ````
  4. Optionally you may use pandoc to render the Markdown preview. Please have a look at the pandoc section below troubleshooting.

## Troubleshooting

These a common problems that you may experience when installing or updating MPP
with suggested solutions. If the suggested solution doesn't fix your problem or
you have experienced a problem not listed here please open up an
[issue](https://github.com/Galadirith/markdown-preview-plus/issues/new).

- **I've installed MPP but I cannot open a preview tab**  
  After installation a complete restart (close all open Atom windows and reopen)
  of Atom may be required to enable the packages functionality.

- **I've installed MPP but I cannot toggle LaTeX in the preview**  
  Since version `1.0.0`
  [mathjax-wrapper](https://github.com/Galadirith/mathjax-wrapper) is required
  by MPP to preview LaTeX, and has to be installed separately.  The majority
  of the time spent installing MPP in versions prior to `1.0.0` was installing
  the MathJax dependency. mathjax-wrapper now handles installing MathJax which
  means installing MPP should be significantly faster, and allow for more
  frequent updates.

- **After updating installation MPP no longer renders LaTeX**  
  You have two options that should resolve this issue.

  The first is to perform a full reinstallation of MPP. You can do this by
  searching for **Markdown Preview Plus** in the **Filter packages** input
  dialogue of the **File &rsaquo; Settings** menu and clicking **Uninstall**.
  Then follow the **Installation Instructions** to reinstall MPP.

  If a full reinstallation doesn't work please follow these instructions:

  1.  Open up `~/.atom/packages/markdown-preview-plus/node_modules` in a file
      explorer and Delete the folder named **roaster**.

  2.  Open up a terminal (on windows you should use **powershell**) and run the
      following commands:

      ````bash
      $ cd ~/.atom/packages/markdown-preview-plus
      $ apm update
      ````
  3.  You should see a progress message `Installing Modules`, and will be
      complete when it displays `Installing Modules done` which may take
      1-5mins.

- **I want to use pandoc but it doesn't work**  
  For instructions have a look at the pandoc section below.

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
