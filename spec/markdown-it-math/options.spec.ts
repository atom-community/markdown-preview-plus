import Token from 'markdown-it/lib/token'
import assert = require('assert')
import { math_plugin, MathMeta } from '../../src-worker/markdown-it-math'
import mdIt = require('markdown-it')

describe('Options', function () {
  it('Should allow single-double `$` as delimiters', function () {
    const md = mdIt().use(math_plugin, {
      inlineDelim: [['$', '$']],
      blockDelim: [['$$', '$$']],
    })

    const res1 = md.render('$1+1 = 2$')
    const res2 = md.render('$$\n1+1 = 2\n$$')
    assert.strictEqual(
      res1,
      '<p><span class="math inline">1+1 = 2</span></p>\n',
    )
    assert.strictEqual(res2, '<div class="math block">1+1 = 2\n</div>\n')
  })
  it('Should allow LaTeX style delimiters', function () {
    const md = mdIt().use(math_plugin, {
      inlineDelim: [['\\(', '\\)']],
      blockDelim: [['\\[', '\\]']],
    })

    const res1 = md.render('\\(1+1 = 2\\)')
    const res2 = md.render('\\[\n1+1 = 2\n\\]')
    assert.strictEqual(
      res1,
      '<p><span class="math inline">1+1 = 2</span></p>\n',
    )
    assert.strictEqual(res2, '<div class="math block">1+1 = 2\n</div>\n')
  })
  it('Should allow newline in opening block delimiters', function () {
    const md = mdIt().use(math_plugin, {
      inlineDelim: [['$$', '$$']],
      blockDelim: [['$$\n', '$$']],
    })

    const res1 = md.render('$$1+1 = 2$$')
    const res2 = md.render('$$\n1+1 = 2$$')
    assert.strictEqual(
      res1,
      '<p><span class="math inline">1+1 = 2</span></p>\n',
    )
    assert.strictEqual(res2, '<div class="math block">1+1 = 2</div>\n')
  })
  it('Should allow newline in closing block delimiters', function () {
    const md = mdIt().use(math_plugin, {
      inlineDelim: [['$$', '$$']],
      blockDelim: [['$$\n', '\n$$']],
    })

    const res1 = md.render('$$1+1 = 2$$')
    const res2 = md.render('$$\n1+1 = 2$$')
    const res3 = md.render('$$\n1+1 = 2\n$$')
    assert.strictEqual(
      res1,
      '<p><span class="math inline">1+1 = 2</span></p>\n',
    )
    assert.strictEqual(res2, '<div class="math block">1+1 = 2$$</div>\n')
    assert.strictEqual(res3, '<div class="math block">1+1 = 2\n</div>\n')
  })
  it('Should only support singular newlines in block math closing tags', function () {
    const md = mdIt().use(math_plugin, {
      inlineDelim: [['$$', '$$']],
      blockDelim: [['$$\n', '\n\n$$']],
    })

    const res1 = md.render('$$1+1 = 2$$')
    const res2 = md.render('$$\n1+1 = 2$$')
    const res3 = md.render('$$\n1+1 = 2\n\n$$')
    assert.strictEqual(
      res1,
      '<p><span class="math inline">1+1 = 2</span></p>\n',
    )
    assert.strictEqual(res2, '<div class="math block">1+1 = 2$$</div>\n')
    assert.strictEqual(res3, '<div class="math block">1+1 = 2\n\n$$</div>\n')
  })
})

describe('Rendering options', function () {
  it('Should allow different options', function () {
    const md = mdIt().use(math_plugin, {
      renderingOptions: { decimalMark: ',' },
    })

    const res1 = md.render('$$40,2$$')
    assert.strictEqual(res1, '<p><span class="math inline">40,2</span></p>\n')

    const res2 = md.render('$$$\n40,2\n$$$')
    assert.strictEqual(res2, '<div class="math block">40,2\n</div>\n')
  })
})

describe('Renderer', function () {
  it('Should allow another renderer', function () {
    const md = mdIt().use(math_plugin, {
      inlineRenderer: function (tok: Token) {
        return `<inline>${(tok.meta as MathMeta).rawContent}</inline>`
      },
      blockRenderer: function (tok: Token) {
        return `<display>${(tok.meta as MathMeta).rawContent}</display>`
      },
    })

    const res1 = md.render('$$1+1 = 2$$')
    assert.strictEqual(res1, '<p><inline>1+1 = 2</inline></p>\n')

    const res2 = md.render('$$$\n\\sin(2\\pi)\n$$$')
    assert.strictEqual(res2, '<display>\\sin(2\\pi)\n</display>\n')
  })
})
