# LaTex

This fork of [markdown-preview](https://github.com/atom/markdown-preview)
enables LaTex to be rendered in a preview window of a markdown document in
[Atom](https://atom.io/). If focus is given to either the markdown source editor
or the preview window then this can be toggled in the menu **Packages &rsaquo;
Markdown Preview Plus &rsaquo; Toggle LaTex Rendering** or using the keymap
`ctrl-shift-x`.

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

## Macros

Depending on what you're using MPP for, you might find yourself typing the same
things over and over again. For example, I'm taking a course in quantum mechanics
this year and often need to write bras and kets and bra-kets in my notes:

```latex
\left| \psi \right
\left< \psi^* \middle| \psi \right>
etc
```

I also find myself needing a lot of 1 over the square-root of somethings like

```latex
\frac{1}{\sqrt{2}}
```

LaTeX let's me make *my own* shortcuts for commonly used things called macros.
For example if I define the macro `\negroot{}` like so

```cson
negroot: ["{\\frac{1}{\\sqrt{#1}}}",1]
```

Then I can just type `\negroot{2}` and the LaTeX engine (MathJax in our case) will
receive `\frac{1}{\sqrt{2}}`. That saves me a lot of typing!

To get started using macros in your installation of Markdown Preview Plus (MPP), go to
`~/.atom` and open up the `markdown-preview-plus.cson` file.

(If you don't have this file that means you haven't run atom with the latest version
of MPP yet.)

This file includes some example macros and explains briefly how to write them.
If you want to learn even more about them, go to the source: the [MathJax docs](http://docs.mathjax.org/en/latest/tex.html#defining-tex-macros).

## Macro Definition Syntax

#### Zero argument macros

To define a macro that takes no arguments (like `\sin`) just wrap it in quotes like so
```cson
# This is just an alias for \theta.
th: "{\\theta}"
```

#### 1-9 argument macros

To define a macro that takes arguments (like `\frac`), use an array that specifies
the number of arguments allowed. Then refer to the arguments with the `#` sign like so:
```cson
# This one gives you "1 over something" as a fraction.
inv: ["{\\frac{1}{#1}}",1]

# This one gives you a fraction with nicely typeset parentheses on either side.
pfrac: ["{\\left(\\frac{#1}{#2}\\right)}",2]
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
