'use babel'

var assert = require('assert')
var { math_plugin } = require('../../lib/markdown-it-math/index.js')

describe('Options', function() {
  it('Should allow single-double `$` as delimiters', function() {
    var md = require('markdown-it')().use(math_plugin, {
      inlineDelim: [['$', '$']],
      blockDelim: [['$$', '$$']],
    })

    var res1 = md.render('$1+1 = 2$')
    var res2 = md.render('$$\n1+1 = 2\n$$')
    assert.equal(res1, '<p><span class="math inline">1+1 = 2</span></p>\n')
    assert.equal(res2, '<div class="math block">1+1 = 2\n</div>\n')
  })
  it('Should allow LaTeX style delimiters', function() {
    var md = require('markdown-it')().use(math_plugin, {
      inlineDelim: [['\\(', '\\)']],
      blockDelim: [['\\[', '\\]']],
    })

    var res1 = md.render('\\(1+1 = 2\\)'),
      res2 = md.render('\\[\n1+1 = 2\n\\]')
    assert.equal(res1, '<p><span class="math inline">1+1 = 2</span></p>\n')
    assert.equal(res2, '<div class="math block">1+1 = 2\n</div>\n')
  })
  it('Should allow newline in opening block delimiters', function() {
    var md = require('markdown-it')().use(math_plugin, {
      inlineDelim: [['$$', '$$']],
      blockDelim: [['$$\n', '$$']],
    })

    var res1 = md.render('$$1+1 = 2$$'),
      res2 = md.render('$$\n1+1 = 2$$')
    assert.equal(res1, '<p><span class="math inline">1+1 = 2</span></p>\n')
    assert.equal(res2, '<div class="math block">1+1 = 2</div>\n')
  })
  it('Should allow newline in closing block delimiters', function() {
    var md = require('markdown-it')().use(math_plugin, {
      inlineDelim: [['$$', '$$']],
      blockDelim: [['$$\n', '\n$$']],
    })

    var res1 = md.render('$$1+1 = 2$$'),
      res2 = md.render('$$\n1+1 = 2$$'),
      res3 = md.render('$$\n1+1 = 2\n$$')
    assert.equal(res1, '<p><span class="math inline">1+1 = 2</span></p>\n')
    assert.equal(res2, '<div class="math block">1+1 = 2$$</div>\n')
    assert.equal(res3, '<div class="math block">1+1 = 2\n</div>\n')
  })
  it('Should only support singular newlines in block math closing tags', function() {
    var md = require('markdown-it')().use(math_plugin, {
      inlineDelim: [['$$', '$$']],
      blockDelim: [['$$\n', '\n\n$$']],
    })

    var res1 = md.render('$$1+1 = 2$$'),
      res2 = md.render('$$\n1+1 = 2$$'),
      res3 = md.render('$$\n1+1 = 2\n\n$$')
    assert.equal(res1, '<p><span class="math inline">1+1 = 2</span></p>\n')
    assert.equal(res2, '<div class="math block">1+1 = 2$$</div>\n')
    assert.equal(res3, '<div class="math block">1+1 = 2\n\n$$</div>\n')
  })
})

describe('Rendering options', function() {
  it('Should allow different options', function() {
    var md = require('markdown-it')().use(math_plugin, {
      renderingOptions: { decimalMark: ',' },
    })

    var res1 = md.render('$$40,2$$')
    assert.equal(res1, '<p><span class="math inline">40,2</span></p>\n')

    var res2 = md.render('$$$\n40,2\n$$$')
    assert.equal(res2, '<div class="math block">40,2\n</div>\n')
  })
})

describe('Renderer', function() {
  it('Should allow another renderer', function() {
    var md = require('markdown-it')().use(math_plugin, {
      inlineRenderer: function(str) {
        return `<inline>${str}</inline>`
      },
      blockRenderer: function(str) {
        return `<display>${str}</display>`
      },
    })

    var res1 = md.render('$$1+1 = 2$$')
    assert.equal(res1, '<p><inline>1+1 = 2</inline></p>\n')

    var res2 = md.render('$$$\n\\sin(2\\pi)\n$$$')
    assert.equal(res2, '<display>\\sin(2\\pi)\n</display>\n')
  })
})
