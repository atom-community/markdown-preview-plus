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

4.  Disable the built in Markdown Preview package. You can do this by searching
    for **Markdown Preview** in the menu **File &rsaquo; Settings &rsaquo;
    Packages** and clicking **Disable**.

Should you have any problems while installing or using MPP please open up a
[new issue](https://github.com/Galadirith/markdown-preview-plus/issues/new).

## License

Markdown Preview Plus (MPP) is released under the [MIT license](LICENSE.md).
