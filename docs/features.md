# Features

Below we listed most of our features.
You may configure them in the [settings of MPP][options]

-   **Opening a preview**

    If you are editing a markdown document in atom you can open a preview with
    `ctrl-shift-m` that will update in real-time as you edit the document. You
    can also right click on a markdown document in the tree-view and select
    **Markdown Preview** to open a standalone preview.

-   **LaTeX equation rendering**

    MPP extends the syntax of [GitHub flavored markdown][gfm]
    with equation blocks. An equation block is indicated by enclosing it in
    double dollar signs `$$...$$`. You can use any LaTeX macros that are valid
    in a maths environment of a LaTeX document inside an equation block. For a
    full list of supported macros please see
    [Supported LaTeX commands][macro-support]. Rendering of LaTeX equations in
    the preview pane can be toggled with `ctrl-shift-x`. Please see
    [math](./math.md) for more details.

-   **Pandoc support**

    You can use [Pandoc][pandoc] to render the markdown preview which
    provides a richer functionality including support to define custom
    [pandoc arguments][pandoc-args], adjust the [markdown flavor][pandoc-flavor]
    and enable [citation replacement][pandoc-cit].

[gfm]: https://help.github.com/articles/github-flavored-markdown/
[options]: ./options.md
[pandoc]: https://github.com/jgm/pandoc
[pandoc-args]: http://pandoc.org/README.html#options
[pandoc-flavor]: http://pandoc.org/README.html#pandocs-markdown
[pandoc-cit]: http://pandoc.org/README.html#citations
[macro-support]: http://docs.mathjax.org/en/latest/tex.html#supported-latex-commands
