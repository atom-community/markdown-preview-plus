# LaTeX style math

MPP extends the syntax of [GitHub flavored markdown][gfm] with equation blocks.
Inside an equation block you can use any LaTeX macros that are valid in a maths
environment of a LaTeX document. MPP will then render the equation in the
preview window. For a full list of supported macros please see 
[Supported LaTeX commands][macro-support].

If focus is given to either the markdown source
editor or the preview window then math rendering can be toggled in the menu
**Packages &rsaquo; Markdown Preview Plus &rsaquo; Toggle LaTex Rendering** or
using the keymap `ctrl-shift-x`.

To enable LaTeX rendering by default search for **Markdown Preview Plus** in the
**Filter packages** input dialogue of the **File &rsaquo; Settings** menu and
tick **Enable Latex Rendering By Default**.

## Syntax

The syntax to specify an equation uses dollar signs `$`. If you want to
literally display a dollar sign you can use `\$`.

1.  **Displayed equations** are delimited by `$$`. Here is an example:

    ````
    ... Here she comes to wreck the day. it's because i'm green isn't it! hey,
    maybe i will give you a call sometime. your number still 911? $$ R_{\mu \nu}
    - {1 \over 2}g_{\mu \nu}\,R + g_{\mu \nu} \Lambda = {8 \pi G \over c^4}
    T_{\mu \nu} $$ kinda hot in these rhinos. look at that, it's exactly three
    seconds before i honk your nose and pull your underwear over your head ...
    ````

    You can also use the delimiters `\[ ... \]` for display equations. Here is
    an example:

    ````
    ... Here she comes to wreck the day. it's because i'm green isn't it! hey,
    maybe i will give you a call sometime. your number still 911? \[ R_{\mu \nu}
    - {1 \over 2}g_{\mu \nu}\,R + g_{\mu \nu} \Lambda = {8 \pi G \over c^4}
    T_{\mu \nu} \] kinda hot in these rhinos. look at that, it's exactly three
    seconds before i honk your nose and pull your underwear over your head ...
    ````

    You can use either format in the same document, and in fact the parser will
    even match `$$ ... \]` and `\[ ... $$`, however it is advised to use only a
    single format in a particular markdown document.

2.  **Inline equations** are delimited by `$`. Here is an example:

    ````
    ... Here she comes to wreck the day. $\int -xe^{x^2} dx$ it's because i'm
    green isn't it! hey, maybe i will give you a call sometime. your number
    still 911? kinda hot in $\int -xe^{x^2} dx$ these rhinos. look at that,
    it's exactly three seconds before i honk your $\int -xe^{x^2} dx$ nose and
    pull your underwear over your head ...
    ````

[gfm]: https://help.github.com/articles/github-flavored-markdown/
[macro-support]: http://docs.mathjax.org/en/latest/tex.html#supported-latex-commands
