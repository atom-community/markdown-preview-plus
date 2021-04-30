import path = require('path')
import generate = require('markdown-it-testgen')
import assert = require('assert')
import {
  math_plugin as orig_math_plugin,
  PluginOptions as MathOpts,
} from '../../src-worker/markdown-it-math'
import { makeTable } from '../../src-worker/markdown-it-table'
import mdIt = require('markdown-it')

function math_plugin(md: mdIt, opts: MathOpts) {
  md.use(orig_math_plugin, opts).use(makeTable, opts)
}

describe('Tables with default delimiters', function () {
  const md = mdIt({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true,
  }).use(math_plugin)

  generate(path.join(__dirname, 'fixtures/tables.txt'), md)
})

describe('Tables with non-default delimiters', function () {
  const md = mdIt({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true,
  }).use(math_plugin, {
    inlineDelim: [['$', '$']],
    blockDelim: [['$$', '$$']],
  })

  generate(path.join(__dirname, 'fixtures/tables.txt'), md)
})

describe('Tables with multiple non-default delimiters', function () {
  const md = mdIt({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true,
  })
    .use(math_plugin, {
      inlineDelim: [['$', '$']],
      blockDelim: [['$$', '$$']],
    })
    .use(math_plugin, {
      inlineDelim: [['\\(', '\\)']],
      blockDelim: [['\\[', '\\]']],
    })

  generate(path.join(__dirname, 'fixtures/tables.txt'), md)
})

describe('Parsing pipe inside inline maths delimiters `$`', function () {
  const md = mdIt().use(math_plugin, {
    inlineDelim: [['$', '$']],
    blockDelim: [['$$', '$$']],
  })

  it('Should not delimit a column of a table', function () {
    const res1 = md.render('col a | col b\n--|--\n$P(A|B)$ | foo')
    assert.strictEqual(
      res1,
      '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n</tr>\n</tbody>\n</table>\n',
    )
  })

  it('Should respect multiple inline math on the same row', function () {
    const res1 = md.render(
      'col a | col b | col c\n--|--|--\n$P(A|B)$ | foo | $P(A|B)$',
    )
    assert.strictEqual(
      res1,
      '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n<th>col c</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n<td><span class="math inline">P(A|B)</span></td>\n</tr>\n</tbody>\n</table>\n',
    )
  })
})

describe('Parsing pipe inside inline maths delimiters `\\(`, `\\)`', function () {
  it('Should not delimit a column of a table', function () {
    const md = mdIt().use(math_plugin, {
      inlineDelim: [['\\(', '\\)']],
      blockDelim: [['\\[', '\\]']],
    })

    const res1 = md.render('col a | col b\n--|--\n\\(P(A|B)\\) | foo')
    assert.strictEqual(
      res1,
      '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n</tr>\n</tbody>\n</table>\n',
    )
  })
})

describe('Parsing pipe inside inline maths configured with multiple delimiters', function () {
  const md = mdIt().use(math_plugin, {
    inlineDelim: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    blockDelim: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
  })

  it('Should not delimit a column of a table for `$`', function () {
    const res1 = md.render('col a | col b\n--|--\n$P(A|B)$ | foo')
    assert.strictEqual(
      res1,
      '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n</tr>\n</tbody>\n</table>\n',
    )
  })

  it('Should not delimit a column of a table for `\\(`, `\\)`', function () {
    const res1 = md.render('col a | col b\n--|--\n\\(P(A|B)\\) | foo')
    assert.strictEqual(
      res1,
      '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n</tr>\n</tbody>\n</table>\n',
    )
  })

  it('Should delimit a column of a table for `\\(`, `$`', function () {
    const res1 = md.render('col a | col b\n--|--\n\\(P(A|B)$ | foo')
    assert.strictEqual(
      res1,
      '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>(P(A</td>\n<td>B)$</td>\n</tr>\n</tbody>\n</table>\n',
    )
  })

  it('Should delimit a column of a table for `$`, `\\)`', function () {
    const res1 = md.render('col a | col b\n--|--\n$P(A|B)\\) | foo')
    assert.strictEqual(
      res1,
      '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>$P(A</td>\n<td>B))</td>\n</tr>\n</tbody>\n</table>\n',
    )
  })
})

describe('Parsing pipe inside unclosed maths delimiter', function () {
  it('Should parse columns as if they were normal text', function () {
    const md = mdIt().use(math_plugin, {
      inlineDelim: [['$', '$']],
      blockDelim: [['$$', '$$']],
    })

    const res1 = md.render('col a | col b\n--|--\n$P(A|B) | foo')
    assert.strictEqual(
      res1,
      '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>$P(A</td>\n<td>B)</td>\n</tr>\n</tbody>\n</table>\n',
    )
  })
})

describe('Parsing pipe inside unopened maths delimiter', function () {
  it('Should parse columns as if they were normal text', function () {
    const md = mdIt().use(math_plugin, {
      inlineDelim: [['$', '$']],
      blockDelim: [['$$', '$$']],
    })

    const res1 = md.render('col a | col b\n--|--\nP(A|B)$ | foo')
    assert.strictEqual(
      res1,
      '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>P(A</td>\n<td>B)$</td>\n</tr>\n</tbody>\n</table>\n',
    )
  })
})
