# Markdown Preview Plus (MPP)

![MPP](https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/imgs/mpp-full-res-invert.png)

Markdown Preview Plus (MPP) is a fork of
[Markdown Preview](https://github.com/atom/markdown-preview) that provides a
real-time preview of markdown documents. Should you have any problems while
installing or using MPP, or if you would like to see a new feature added please
open up a [new issue][issue].

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

3.  Disable built-in package  *Markdown Preview*

4.  (optional) enable pandoc

## Usage

Please see [options][options] for further details on configuring MPP and
[math][math] for more details on math rendering. For basic usage:

-   Toggle Preview: `ctrl-shift-m`
-   Toggle Math Rendering: `ctrl-shift-x`

## License

Markdown Preview Plus (MPP) is released under the [MIT license][license].

[issue]: https://github.com/Galadirith/markdown-preview-plus/issues
[installation]: docs/installation.md
[win-install]: docs/win-install.md
[license]: LICENSE.md
[math]: docs/math.md
[features]: docs/features.md
[node-gyp]: https://github.com/TooTallNate/node-gyp#installation
[mathjax-wrapper]: https://atom.io/packages/mathjax-wrapper
[options]: docs/options.md
