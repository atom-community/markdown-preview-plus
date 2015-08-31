# heading

This is a paragraph

This is a
multi-line
paragraph

This is a paragraph that contains inline elements
such as inline maths $E=mc^2$ which can also be written as \(E=mc^2\) and
inline code `like this` and
italic text *like this* and
bold text **like this** and
links [like this](http://github.com/galadirith/markdown-preview-plus) and
images ![like this](subdir/image1.png) and
strike through ~~like this~~.

> This is a block quote

> This is a
> multi-line
> blockquote

```
This is a
fenced
codeblock
```

---

- Unordered 1
- Unordered 2
- Unordered 3

1. Ordered 1
2. Ordered 2
3. Ordered 3

| Column 1 | Column 2 | Column 3 |
| -------- |--------- | ---------|
| This     | is       | a        |
| table    | with     | three    |
| columns  | four     | rows     |

$$
\int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
$$

\[
\int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
\]

We'll repeat everything to make sure the sync parser is correctly identifying
siblings with the same tag.

# heading

This is a paragraph

This is a
multi-line
paragraph

This is a paragraph that contains inline elements
such as inline maths $E=mc^2$ which can also be written as \(E=mc^2\) and
inline code `like this` and
italic text *like this* and
bold text **like this** and
links [like this](http://github.com/galadirith/markdown-preview-plus) and
images ![like this](subdir/image1.png) and
strike through ~~like this~~.

> This is a block quote

> This is a
> multi-line
> blockquote

```
This is a
fenced
codeblock
```

---

- Unordered 1
- Unordered 2
- Unordered 3

1. Ordered 1
2. Ordered 2
3. Ordered 3

| Column 1 | Column 2 | Column 3 |
| -------- |--------- | ---------|
| This     | is       | a        |
| table    | with     | three    |
| columns  | four     | rows     |

$$
\int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
$$

\[
\int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
\]

Now we'll consider embedding block level elements in
[container blocks](http://spec.commonmark.org/0.21/#container-blocks). First
we'll consider embedding in block quotes.

> # heading
>
> This is a paragraph
>
> This is a
> multi-line
> paragraph
>
> This is a paragraph that contains inline elements
> such as inline maths $E=mc^2$ which can also be written as \(E=mc^2\) and
> inline code `like this` and
> italic text *like this* and
> bold text **like this** and
> links [like this](http://github.com/galadirith/markdown-preview-plus) and
> images ![like this](subdir/image1.png) and
> strike through ~~like this~~.
>
> > This is a block quote
>
> > This is a
> > multi-line
> > blockquote
>
> ```
> This is a
> fenced
> codeblock
> ```
>
> ---
>
> - Unordered 1
> - Unordered 2
> - Unordered 3
>
> 1. Ordered 1
> 2. Ordered 2
> 3. Ordered 3
>
> | Column 1 | Column 2 | Column 3 |
> | -------- |--------- | ---------|
> | This     | is       | a        |
> | table    | with     | three    |
> | columns  | four     | rows     |
>
> $$
> \int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
> $$
>
> \[
> \int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
> \]

Now we'll consider embedding in lists.

- item 1

  # heading

  This is a paragraph

  This is a
  multi-line
  paragraph

  This is a paragraph that contains inline elements
  such as inline maths $E=mc^2$ which can also be written as \(E=mc^2\) and
  inline code `like this` and
  italic text *like this* and
  bold text **like this** and
  links [like this](http://github.com/galadirith/markdown-preview-plus) and
  images ![like this](subdir/image1.png) and
  strike through ~~like this~~.

  > This is a block quote

  > This is a
  > multi-line
  > blockquote

  ```
  This is a
  fenced
  codeblock
  ```

  ---

  - Unordered 1
  - Unordered 2
  - Unordered 3

  1. Ordered 1
  2. Ordered 2
  3. Ordered 3

  | Column 1 | Column 2 | Column 3 |
  | -------- |--------- | ---------|
  | This     | is       | a        |
  | table    | with     | three    |
  | columns  | four     | rows     |

  $$
  \int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
  $$

  \[
  \int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
  \]

- item 2

  # heading

  This is a paragraph

  This is a
  multi-line
  paragraph

  This is a paragraph that contains inline elements
  such as inline maths $E=mc^2$ which can also be written as \(E=mc^2\) and
  inline code `like this` and
  italic text *like this* and
  bold text **like this** and
  links [like this](http://github.com/galadirith/markdown-preview-plus) and
  images ![like this](subdir/image1.png) and
  strike through ~~like this~~.

  > This is a block quote

  > This is a
  > multi-line
  > blockquote

  ```
  This is a
  fenced
  codeblock
  ```

  ---

  - Unordered 1
  - Unordered 2
  - Unordered 3

  1. Ordered 1
  2. Ordered 2
  3. Ordered 3

  | Column 1 | Column 2 | Column 3 |
  | -------- |--------- | ---------|
  | This     | is       | a        |
  | table    | with     | three    |
  | columns  | four     | rows     |

  $$
  \int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
  $$

  \[
  \int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
  \]
