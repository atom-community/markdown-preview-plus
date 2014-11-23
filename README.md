# Markdown Preview Plus (MPP)

<img align="center" src="https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/imgs/mpp-full-res-invert.png">

All the yummy goodness of
[Markdown Preview](https://github.com/atom/markdown-preview) with sprinklings of
delicious new features. Show the rendered HTML markdown to the right of the
current editor using the keymap `ctrl-shift-m`.

## Installation

Simply search for *Markdown Preview Plus* in the `Packages` tab of the
settings menu in Atom and click `install`. In order to start using MPP you need
to disable the built in Markdown Preview package. You can do this by searching
for *Markdown Preview* in the `Filter packages` input dialogue and clicking
`Disable`.

### Troubleshooting

- **Installation is taking a long time**  
  The dependencies are ~90MB in size. As Atom provides no feedback as to the
  progress of the installation, the installation could be perceived to have
  stalled, but this is unlikely. Please allow plenty of time (5-10mins) for
  installation.

- **I've installed MPP but I cannot open a preview tab/ render LaTeX**  
  After installation a complete restart (close all open Atom windows and reopen)
  of Atom may be required to enable the packages functionality.

## New Features

### LaTeX Equations

LaTeX equations in the source markdown are rendered in the preview pane.
Rendering of LaTeX equations in the preview pane can be toggled with
`ctrl-shift-x`. Please see [LaTeX](LATEX.md) for more details.

## Whats wrong with Markdown Preview?

Absolutely nothing, in fact its the best thing since sliced bread. Markdown
Preview is an incredibly important core package of [Atom](https://atom.io/) and
stability is absolutely crucial. MPP adds new features at the expense of some
potential stability issues, however you shouldn't meet gremlins too often.

## License

Markdown Preview Plus (MPP) is released under the MIT licence. Please see
[LICENSE](LICENSE.md) for full details.
