# Markdown Preview Plus (MPP)

All the yummy goodness of
[Markdown Preview](https://github.com/atom/markdown-preview) with sprinklings of
delicious new features.

## Installation

Simply search for *Markdown Preview Plus* in the `Packages` tab of the
settings menu in Atom and click `install`. In order to start using MPP you need
to disable the built in Markdown Preview package. You can do this by searching
for *Markdown Preview* in the `Filter packages` input dialogue and clicking
`Disable`.

Note, that the dependencies are ~90MB in size. As Atom provides no feedback as
to the progress of the installation, the installation could be perceived to have
stalled, but this is unlikely. Please allow plenty of time (5-10mins) for
installation.

## Usage

Show the rendered HTML markdown to the right of the current editor using
`ctrl-shift-m`. It can be activated from the editor using the `ctrl-shift-m`
key-binding and is currently enabled for `.markdown`, `.md`, `.mkd`, `.mkdown`,
and `.ron` files.

## New Features

<table style="border: none; width: 80%; margin: 2em auto">
  <tr style="border: none">
    <td style="border: none">
      LaTeX equations in the source markdown are rendered in the preview pane.
      Rendering of LaTeX equations in the preview pane cane be toggled with
      `ctrl-shift-x`. Please see [LaTeX](LATEX.md) for more details.
    </td>
    <td style="border: none; width: 150px">
      <img style="box-shadow: 0 1px 5px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.04); border-radius:75px" src="assets/LaTeX.svg">
    </td>
</table>

## Whats wrong with Markdown Preview?

Absolutely nothing, in fact its the best thing since sliced bread. Markdown
Preview is an incredibly important core package of [Atom](https://atom.io/) and
stability is absolutely crucial. MPP adds new features at the expense of some
potential stability issues, however you shouldn't meet gremlins too often.

## License

Markdown Preview Plus is realised under the MIT licence. Please see
[LICENCE](LICENCE.md) for full details.
