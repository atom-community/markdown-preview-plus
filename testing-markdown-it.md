# Working things in markdown-it

## What works

Inline Math should work with `$`  $\frac{x+y}{y}$
and `\(` \(\frac{x+y}{y}\)

Use `\[` on separate lines:

\[
\int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
\]

Use `$$` on separate lines:

$$
a+b
$$

In marked, this didn't work. (Newlines after start of `$$`)

$$

x+y

$$

Newcommand:

$$
\newcommand{sca}[1]{\langle #1 \rangle}
|\sca{x,y}|^2 \le \sca{x,x} \cdot \sca{y,y},
$$

## What does not work

Inline block statements:

`$$` in single line: $$x+y$$

`\[` in single line: \[x+y\]

<!-- newcommand not in environment-->
\newcommand{\scalong}[1]{(#1_1,\dots,#1_k)}

where $\sca{\cdot,\cdot}$ denotes the inner product $\sca{\scalong{x}, \scalong{x}} = \sum_{i=1}^k x_i y_i$.
