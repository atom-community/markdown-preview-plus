# Markdown Preview Plus (MPP)

[![appveyor][ab]][a] [![travis][tb]][t] [![wercker][wb]][w] ![apm version][av] ![apm downloads][ad]

Markdown Preview Plus (MPP) is a fork of
[Markdown Preview](https://github.com/atom/markdown-preview) that provides a
real-time preview of markdown documents.

Should you have any problems while
installing or using MPP, or if you would like to see a new feature added please
open up a [new issue][issue].

We also maintain a [changelog][changelog] for you to see what improved in MPP.

![MPP][preview]

## Features

We also have a more detailed description of [features][features].

-   Fastly open a preview of any markdown with `ctrl-shift-m`
-   Math rendering with persistent macro support, toggled with `ctrl-shift-x`
-   Optionally use pandoc with citation support
-   Live reload while editing
-   And many more...
-   missing one? write an [issue][issue]

## Installation

Long instructions can be found [here][installation]. In short steps:

1.  Make sure node-gyp is [installed correctly][node-gyp] with a python 2.7 version (and Visual Studio 2012 or 2013 if you are on Windows).

2.  Install this package and [`mathjax-wrapper`][mathjax-wrapper]
    for math rendering. Installation of mathjax-wrapper may take a long time.

    ``` bash
    apm install mathjax-wrapper
    apm install markdown-preview-plus
    ```

    If you have issues installing on Windows, please [check here for help][win-install]

3.  Disable built-in package *Markdown Preview*

4.  (optional) enable pandoc

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
[win-install]: docs/win-install.md
[license]: LICENSE.md
[math]: docs/math.md
[features]: docs/features.md
[node-gyp]: https://github.com/TooTallNate/node-gyp#installation
[mathjax-wrapper]: https://atom.io/packages/mathjax-wrapper
[options]: docs/options.md

[ad]: https://img.shields.io/apm/dm/markdown-preview-plus.svg
[av]: https://img.shields.io/apm/v/markdown-preview-plus.svg
[ab]: https://img.shields.io/appveyor/ci/Galadirith/markdown-preview-plus/master.svg?label=appveyor
[a]: https://ci.appveyor.com/project/Galadirith/markdown-preview-plus/branch/master
[tb]:
https://img.shields.io/travis/Galadirith/markdown-preview-plus/master.svg?label=travis
[t]: https://travis-ci.org/Galadirith/markdown-preview-plus
[wb]: https://app.wercker.com/status/c2d80d0da6512a2c065a802a75b9a362/s/master
[w]: https://app.wercker.com/project/bykey/c2d80d0da6512a2c065a802a75b9a362
