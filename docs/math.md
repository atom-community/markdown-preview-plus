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
    maybe i will give you a call sometime. your number still 911?

    $$
    R_{\mu \nu} - {1 \over 2}g_{\mu \nu}\,R + g_{\mu \nu} \Lambda
    = {8 \pi G \over c^4} T_{\mu \nu}
    $$

    kinda hot in these rhinos. look at that, it's exactly three seconds before i
    honk your nose and pull your underwear over your head ...
    ````

    You can also use the delimiters `\[ ... \]` for display equations. Here is
    an example:

    ````
    ... Here she comes to wreck the day. it's because i'm green isn't it! hey,
    maybe i will give you a call sometime. your number still 911?

    \[
    R_{\mu \nu}- {1 \over 2}g_{\mu \nu}\,R + g_{\mu \nu} \Lambda
    = {8 \pi G \over c^4} T_{\mu \nu}
    \]

    kinda hot in these rhinos. look at that, it's exactly three seconds before i
    honk your nose and pull your underwear over your head ...
    ````

    You do not have to separate a displayed equation block from other blocks
    with blank lines. You can also include content on the same lines as the
    delimiters with the restriction that the opening delimiter must be placed at
    the beginning of its line and the closing delimiter must be placed at the
    end of its line:

    ````
    ... Here she comes to wreck the day. it's because i'm green isn't it! hey,
    maybe i will give you a call sometime. your number still 911?
    $$ R_{\mu \nu} - {1 \over 2}g_{\mu \nu}\,R + g_{\mu \nu} \Lambda
    = {8 \pi G \over c^4} T_{\mu \nu} $$
    kinda hot in these rhinos. look at that, it's exactly three seconds before i
    honk your nose and pull your underwear over your head ...
    ````

2.  **Inline equations** are delimited by `$`. Here is an example:

    ````
    ... Here she comes to wreck the day. $\int -xe^{x^2} dx$ it's because i'm
    green isn't it! hey, maybe i will give you a call sometime. your number
    still 911? kinda hot in $\int -xe^{x^2} dx$ these rhinos. look at that,
    it's exactly three seconds before i honk your $\int -xe^{x^2} dx$ nose and
    pull your underwear over your head ...
    ````

    You can also use the delimiters `\( ... \)` for inline equations. Here is
    an example:

    ````
    ... Here she comes to wreck the day. \(\int -xe^{x^2} dx\) it's because i'm
    green isn't it! hey, maybe i will give you a call sometime. your number
    still 911? kinda hot in \(\int -xe^{x^2} dx\) these rhinos. look at that,
    it's exactly three seconds before i honk your \(\int -xe^{x^2} dx\) nose and
    pull your underwear over your head ...
    ````

## Macros

MPP supports persistent [macro definitions](http://docs.mathjax.org/en/latest/tex.html#defining-tex-macros).
Macros belong in `~/.atom/markdown-preview-plus.cson` and are defined as follows.

### Macro Definition Syntax

#### Zero argument macros

To define a macro that takes no arguments (like `\sin`) just wrap it in quotes like so
```cson
# This is just an alias for \theta.
th: "\\theta"
```

#### 1-9 argument macros

To define a macro that takes arguments (like `\frac`), use an array that specifies
the number of arguments allowed. Then refer to the arguments as `#1` `#2` like so:
```cson
# This one gives you "1 over something" as a fraction.
inv: ["\\frac{1}{#1}",1]

# This one gives you a fraction with nicely typeset parentheses on either side.
pfrac: ["\\left(\\frac{#1}{#2}\\right)",2]
```

#### Macro Names

Macros need to be named with either
  * a single non-alphanumeric character like `\,` or
  * any number of uppercase and lowercase letters (no numbers).

Please see [this](http://tex.stackexchange.com/questions/66666/command-macro-name-cannot-include-numbers-and-symbols)
StackExchange discussion.

Note that since we define the objects in CSON, if you want to use a single non-alphanumeric
character for the name of your macro like

```cson
!: "{OK}"
```

MPP will fail because CSON will throw an `unexpected !` syntax error. So be sure to write such definitions as a string. The following will work fine:

```cson
'!': "{OK}"
```    

[gfm]: https://help.github.com/articles/github-flavored-markdown/
[macro-support]: http://docs.mathjax.org/en/latest/tex.html#supported-latex-commands
