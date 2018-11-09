# Styling the preview

A short guide on changing the preview look via CSS.

## Preview style isolation

Styles not in `atom-text-editor` context and not in user stylesheet
are not passed through to preview by default. This might lead to
unexpected interactions (or, more likely, lack thereof) with other
packages. It's possible to explicitly whitelist a package in
settings. Examples of packages that might affect preview style
include: `fonts` package, `language-babel` package,
`atom-typescript` package, etc. The `fonts` package is whitelisted
by default. A special value of `*` will pass all
Atom workspace styles through to the preview and apply some tweaks
to keep it presentable -- use this at your own risk, however, it's
impossible to offer any guarantees. Note that HTML export is never
affected by third-party packages.

## Writing your own LESS/CSS

User stylesheet (Edit -> Stylesheet... menu option) is *always* applied to the
preview, so any styles in your stylesheet will affect how the preview renders.

User stylesheet also affects Atom workspace though, so it can be beneficial to
target the preview specifically. To facilitate that, the root `html` element of
the preview has a special attribute `data-markdown-preview-plus-context`, which
can take different values depending on what happens to preview at the moment:

-   For actual preview, `data-markdown-preview-plus-context` has value `live-preview`
-   For exported HTML, `data-markdown-preview-plus-context` has value `html-export`
-   For exported PDF, `data-markdown-preview-plus-context` has value `pdf-export`
-   For copied HTML, `data-markdown-preview-plus-context` has value `copy-html`

So, to target Markdown-Preview-Plus rendering in general, you can do something like this in your stylesheet:

```less
html[data-markdown-preview-plus-context] body {
  /* styles that affect mpp preview */
}
```

If you only want to change something for exported PDF, for instance, you can add
something like this:
```less
html[data-markdown-preview-plus-context="pdf-export"] body {
  /* styles that affect exported PDF only */
}
```

With `copy-html`, the styles are *not* copied to the result, so it could be
considered less useful than others. But it can be useful for affecting MathJax
rendering of math in copied HTML. For instance, to force display math width,
you could do something like this:
```less
html[data-markdown-preview-plus-context="copy-html"] {
  span.display-math { /* force display math container width to 10cm */
    display: block;
    width: 10cm;
  }
}
```
