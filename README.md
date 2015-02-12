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

- **LaTeX Macros**
  You can add your own macros to a config file named `markdown-preview-plus.cson`
  which is in the `~/.atom` directory. To learn more about LaTeX macros see
  [LaTeX](LATEX.md) for more details.

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

## License

Markdown Preview Plus (MPP) is released under the [MIT license](LICENSE.md).
