'use babel'

var path = require('path')
var generate = require('markdown-it-testgen')
var { math_plugin } = require('../../lib/markdown-it-math/index.js')

describe('Default math', function() {
  var md = require('markdown-it')().use(math_plugin)

  generate(path.join(__dirname, 'fixtures/default.txt'), md)
})
