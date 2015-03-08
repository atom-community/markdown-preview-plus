$x$ math at the start of the document

This document is to test $\LaTeX$ rendering with [markdown-preview-plus](https://atom.io/packages/markdown-preview-plus).

$x_1, x_2, \dots, x_N$ conflict with _italics_ syntax?

$(f*g*h)(x)$ conflict with `*` syntax?

$[a+b](c+d)$ conflict with link syntax?

Use `\[` on separate lines:

\[
\int_{-\infty}^\infty e^{-x^2} = \sqrt{\pi}
\]


Use `\[` on the same line:

\[ \frac{-b \pm \sqrt{b^2-4ac}}{2a} \]

Use `$$` on separate lines:

$$
a+b
$$

_italics_ and **bold** and [links](http://atom.io)

----

$k \times k$, $n \times 2$, $2 \times n$, $\times$

$x \cdot y$, $\cdot$

$\sqrt{x^2+y^2+z^2}$

$\alpha \beta \gamma$

----

a \$5 bill

```
$x
```

```
\$
```

`\$`, `\[ \]`, `$x$`, $x$

----

For all $x$ and $y$ in $\mathbb{R}^k$ it is true that
$$
\newcommand{sca}[1]{\langle #1 \rangle}
|\sca{x,y}|^2 \le \sca{x,x} \cdot \sca{y,y},
$$
where $\sca{\cdot,\cdot}$ denotes the inner product $\sca{(x_1,\dots,x_k), (y_1,\dots,y_k)} = \sum_{i=1}^k x_i y_i$.

----

\[
p(\mathbf{m}) \sim \mathcal{N}(\mathbf{m}) e^{-\sum_{i} \beta_i m_i}
\]

\[
\langle \vec{m} \rangle =
\frac{1}{Z(\vec{\beta})}\vec{m}(\mu)
\sum_{\mu\in\mathcal{G}}
e^{-\vec{\beta}\cdot\vec{m}(\mu)}
\]

----

Notice below that the `\[`-separated display math doesn't have a blank line before and after (i.e. in an actual $\LaTeX$ document it woulnd't be placed in a separate paragraph):

The _characteristic polynomial_ $\chi(\lambda)$ of the
$3 \times 3$ matrix
\[ \left( \begin{array}{ccc}
a & b & c \\
d & e & f \\
g & h & i \end{array} \right)\]
is given by the formula
\[ \chi(\lambda) = \left| \begin{array}{ccc}
\lambda - a & -b & -c \\
-d & \lambda - e & -f \\
-g & -h & \lambda - i \end{array} \right|.\]

This is a long line: $\chi(\lambda) = a e i-a e \lambda -a f h-a i \lambda +a \lambda ^2-b d i+b d \lambda +b f g+c d h-c e g+c g \lambda -e i \lambda +e \lambda ^2+f h \lambda +i \lambda ^2-\lambda ^3 $

----

#Math $x^2$ in heading 1

##Math $x^2$ in heading 2

###Math $x^2$ in heading 3

####Math $x^2$ in heading 4

_math $x^2$ in emphasis_

**math $x^2$ in bold**

[math $x^2$ in link](http://www.mathjax.org/)

`math $x^2$ in code`

This is broken `$$`

$$
a+b
$$

\[ \frac{-b \pm \sqrt{b^2-4ac}}{2a} \]

An $N\times N$ grid.
