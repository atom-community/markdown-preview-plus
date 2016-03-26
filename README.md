# Markdown Preview Plus (MPP)

[![appveyor][ab]][a] [![travis][tb]][t] ![apm version][av] ![apm downloads][ad]

Markdown Preview Plus (MPP) is a fork of
[Markdown Preview](https://github.com/atom/markdown-preview) that provides a
real-time preview of markdown documents.

Should you have any problems while installing or using MPP please open up a
[new issue][issue].

![MPP][preview]

## Features

We also have a more detailed description of [features][features].

-   Fastly open a preview of any markdown with `ctrl-shift-m`
-   Math rendering with persistent macro support, toggled with `ctrl-shift-x`
-   Optionally use pandoc with citation support
-   Live reload while editing
-   On demand synchronization
-   And many more...

## Installation

Long instructions can be found [here][installation]. In short steps:

1.  Search for and install `markdown-preview-plus` in Atom's Settings view.
2.  Search for and disable the built-in package `markdown-preview`.
3.  (Optional) Install and enable [Pandoc][pandoc].

## Usage

Please see [options][options] for further details on configuring MPP and
[math][math] for more details on math rendering. For basic usage:

-   Toggle Preview: `ctrl-shift-m`
-   Toggle Math Rendering: `ctrl-shift-x`

## License

Markdown Preview Plus (MPP) is released under the [MIT license][license].

[preview]: https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/imgs/mpp-full-res-invert.png
[changelog]: https://github.com/Galadirith/markdown-preview-plus/blob/master/CHANGELOG.md
[issue]: https://github.com/Galadirith/markdown-preview-plus/issues
[installation]: docs/installation.md
[license]: LICENSE.md
[math]: docs/math.md
[features]: docs/features.md
[node-gyp]: https://github.com/TooTallNate/node-gyp#installation
[options]: docs/options.md
[pandoc]: http://pandoc.org

[ad]: https://img.shields.io/apm/dm/markdown-preview-plus.svg
[av]: https://img.shields.io/apm/v/markdown-preview-plus.svg
[ab]: https://img.shields.io/appveyor/ci/Galadirith/markdown-preview-plus/master.svg?label=appveyor
[a]: https://ci.appveyor.com/project/Galadirith/markdown-preview-plus/branch/master
[tb]: https://img.shields.io/travis/Galadirith/markdown-preview-plus/master.svg?label=travis
[t]: https://travis-ci.org/Galadirith/markdown-preview-plus
