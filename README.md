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
    &rsaquo; Packages** and click **Install**. Alternatively if you would prefer
    to use the command line utility `apm`:

    ````bash
    $ apm install markdown-preview-plus
    ````

2.  Disable the built in Markdown Preview package. You can do this by searching
    for **Markdown Preview Plus** in the **Filter packages** input dialogue of
    the **File &rsaquo; Settings** menu and clicking **Disable**.

## Troubleshooting

- **Installation is taking a long time**  
  The dependencies are ~90MB in size and contain ~35000 files, so it takes a
  little while for Atom to install MPP. As Atom provides no feedback as to the
  progress of the installation, the installation could be perceived to have
  stalled, but this is unlikely. Please allow plenty of time (10-15mins) for
  installation.

- **Updating is taking a long time**  
  If you are updating MPP from any version prior to `0.2.0` updates may take
  10-15mins. If you are updating MPP from version `0.2.0` or later updates to an
  installation of MPP should not require the same length of time.

- **I've installed MPP but I cannot open a preview tab / render LaTeX**  
  After installation a complete restart (close all open Atom windows and reopen)
  of Atom may be required to enable the packages functionality.

- **After updating installation MPP no longer renders LaTeX**  
  You have two options that should resolve this issue.

  The first is to perform a full reinstallation of MPP. You can do this by
  searching for **Markdown Preview Plus** in the **Filter packages** input
  dialogue of the **File &rsaquo; Settings** menu and clicking **Uninstall**.
  Then follow the **Installation Instructions** to reinstall MPP.

  Alternatively follow these instructions:

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
