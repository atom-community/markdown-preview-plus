import markdownIt = require('../lib/markdown-it-helper')
import { expect } from 'chai'
let renderMath = false

import './util'

const compareHTML = function(one: string, two: string) {
  one = markdownIt.render(one, renderMath)
  one = one.replace(/\n\s*/g, '')
  two = two.replace(/\n\s*/g, '')
  expect(one).to.equal(two)
}

describe('MarkdownItHelper (Math)', function() {
  let content: string | undefined

  beforeEach(function() {
    content = undefined
    renderMath = true
  })

  it('Math in markdown inlines', function() {
    content = `\
# Math $x^2$ in heading 1

_math $x^2$ in emphasis_

**math $x^2$ in bold**

[math $x^2$ in link](http://www.mathjax.org/)

\`math $x^2$ in code\`

~~math $x^2$ in strikethrough~~\
`

    const result = `\
<h1>Math <span class='math'><script type='math/tex'>x^2</script></span> in heading 1</h1>
<p><em>math <span class='math'><script type='math/tex'>x^2</script></span> in emphasis</em></p>
<p><strong>math <span class='math'><script type='math/tex'>x^2</script></span> in bold</strong></p>
<p><a href="http://www.mathjax.org/">math <span class='math'><script type='math/tex'>x^2</script></span> in link</a></p>
<p><code>math $x^2$ in code</code></p>
<p><s>math <span class='math'><script type='math/tex'>x^2</script></span> in strikethrough</s></p>\
`

    compareHTML(content, result)
  })

  describe('Interference with markdown syntax (from issue-18)', function() {
    it('should not interfere with *', function() {
      content = 'This $(f*g*h)(x)$ is no conflict'

      const result =
        "<p>This <span class='math'><script type='math/tex'>(f*g*h)(x)</script></span> is no conflict</p>"

      compareHTML(content, result)
    })

    it('should not interfere with _', function() {
      content = 'This $x_1, x_2, \\dots, x_N$ is no conflict'

      const result =
        "<p>This <span class='math'><script type='math/tex'>x_1, x_2, \\dots, x_N</script></span> is no conflict</p>"

      compareHTML(content, result)
    })

    it('should not interfere with link syntax', function() {
      content = 'This $[a+b](c+d)$ is no conflict'

      const result =
        "<p>This <span class='math'><script type='math/tex'>[a+b](c+d)</script></span> is no conflict</p>"

      compareHTML(content, result)
    })
  })

  describe('Examples from stresstest document (issue-18)', function() {
    it('several tex functions', function() {
      content = `\
$k \\times k$, $n \\times 2$, $2 \\times n$, $\\times$

$x \\cdot y$, $\\cdot$

$\\sqrt{x^2+y^2+z^2}$

$\\alpha \\beta \\gamma$

$$
\\begin{aligned}
x\\ &= y\\\\
mc^2\\ &= E
\\end{aligned}
$$\
`

      const result = `\
<p><span class='math'><script type='math/tex'>k \\times k</script></span>, <span class='math'><script type='math/tex'>n \\times 2</script></span>, <span class='math'><script type='math/tex'>2 \\times n</script></span>, <span class='math'><script type='math/tex'>\\times</script></span></p>
<p><span class='math'><script type='math/tex'>x \\cdot y</script></span>, <span class='math'><script type='math/tex'>\\cdot</script></span></p>
<p><span class='math'><script type='math/tex'>\\sqrt{x^2+y^2+z^2}</script></span></p>
<p><span class='math'><script type='math/tex'>\\alpha \\beta \\gamma</script></span></p>
<span class='math'><script type='math/tex; mode=display'>\\begin{aligned}
x\\ &= y\\\\
mc^2\\ &= E
\\end{aligned}
</script></span>\
`

      compareHTML(content, result)
    })

    describe('Escaped Math environments', function() {
      // Disabled as markdown-it-math does not support it
      xit('Empty lines after $$', function() {
        content = `\
$$

should be escaped

$$\
`

        const result = '<p>$$</p><p>should be escaped</p><p>$$</p>'

        compareHTML(content, result)
      })

      it('Inline Math without proper opening and closing', function() {
        content = 'a $5, a $10 and a \\$100 Bill.'

        const result = '<p>a $5, a $10 and a $100 Bill.</p>'

        compareHTML(content, result)
      })

      it('Double escaped \\[ and \\(', function() {
        content = `\

\\\\[
  x+y
\\]

\\\\(x+y\\)\
`

        const result = '<p>\\[x+y]</p><p>\\(x+y)</p>'

        compareHTML(content, result)
      })

      it('In inline code examples', function() {
        content = '`\\$`, `\\[ \\]`, `$x$`'

        const result =
          '<p><code>\\$</code>, <code>\\[ \\]</code>, <code>$x$</code></p>'

        compareHTML(content, result)
      })
    })

    describe('Math Blocks', function() {
      it('$$ should work multiline', function() {
        content = `\
$$
a+b
$$\
`

        const result =
          "<span class='math'><script type='math/tex; mode=display'>a+b</script></span>"

        compareHTML(content, result)
      })

      it('$$ should work singeline', function() {
        content = '$$a+b$$'

        const result =
          "<span class='math'><script type='math/tex; mode=display'>a+b</script></span>"

        compareHTML(content, result)
      })

      it('$$ should work directly after paragraph', function() {
        content = `\
Test
$$
a+b
$$\
`

        const result =
          "<p>Test</p><span class='math'><script type='math/tex; mode=display'>a+b</script></span>"

        compareHTML(content, result)
      })

      it('\\[ should work multiline', function() {
        content = `\
\\[
a+b
\\]\
`

        const result =
          "<span class='math'><script type='math/tex; mode=display'>a+b</script></span>"

        compareHTML(content, result)
      })

      it('\\[ should work singeline', function() {
        content = '\\[a+b\\]'

        const result =
          "<span class='math'><script type='math/tex; mode=display'>a+b</script></span>"

        compareHTML(content, result)
      })

      it('\\[ should work directly after paragraph', function() {
        content = `\
Test
\\[
a+b
\\]\
`

        const result =
          "<p>Test</p><span class='math'><script type='math/tex; mode=display'>a+b</script></span>"

        compareHTML(content, result)
      })
    })
  })

  describe('Examples from issues', function() {
    it('should respect escaped dollar inside code (issue-3)', function() {
      content = `\
\`\`\`
\\$
\`\`\`\
`

      const result = '<pre><code>\\$</code></pre>'

      compareHTML(content, result)
    })

    it('should respect escaped dollar inside code (mp-issue-116)', function() {
      content = `\
start

\`\`\`
$fgf
\`\`\`

\\$ asd
$x$\
`

      const result = `\
<p>start</p>
<pre><code>$fgf</code></pre>
<p>
  $ asd
  <span class='math'>
    <script type='math/tex'>x</script>
  </span>
</p>\
`

      compareHTML(content, result)
    })

    it('should render inline math with \\( (issue-7)', function() {
      content = 'This should \\(x+y\\) work.'

      const result = `\
<p>
 This should <span class='math'>
   <script type='math/tex'>x+y</script>
 </span> work.
</p>\
`

      compareHTML(content, result)
    })

    it('should render inline math with N\\times N (issue-17)', function() {
      content = 'An $N\\times N$ grid.'

      const result = `\
<p>
 An <span class='math'>
   <script type='math/tex'>N\\times N</script>
 </span> grid.
</p>\
`

      compareHTML(content, result)
    })

    it('should respect inline code (issue-20)', function() {
      content = `\
This is broken \`$$\`

$$
a+b
$$\
`

      const result = `\
<p>This is broken <code>$$</code></p>
<span class='math'>
 <script type='math/tex; mode=display'>
   a+b
 </script>
</span>\
`

      compareHTML(content, result)
    })
  })
})
