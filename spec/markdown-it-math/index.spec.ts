import path = require('path')
import generate = require('markdown-it-testgen')
import mdIt = require('markdown-it')
import { math_plugin } from '../../src-worker/markdown-it-math'

describe('Default math', function () {
  const md = mdIt().use(math_plugin)

  generate(path.join(__dirname, 'fixtures/default.txt'), md)
})
