import * as path from 'path'
import * as fs from 'fs'
import * as temp from 'temp'
import * as wrench from 'fs-extra'
import pandocHelper = require('../lib/pandoc-helper')
import { expect } from 'chai'

import './util'

const bibFile = 'test.bib'
const cslFile = 'foo.csl'

let tempPath: string
let file: string

describe('Markdown preview plus pandoc helper', function() {
  before(async function() {
    await atom.packages.activatePackage(path.join(__dirname, '..'))
  })

  after(async function() {
    await atom.packages.deactivatePackage('markdown-preview-plus')
  })

  beforeEach(async function() {
    const fixturesPath = path.join(__dirname, 'fixtures')
    tempPath = temp.mkdirSync('atom')
    wrench.copySync(fixturesPath, tempPath)
    atom.project.setPaths([tempPath])
  })

  describe('PandocHelper::findFileRecursive', function() {
    const fR = pandocHelper.findFileRecursive

    it('should return bibFile in the same directory', function() {
      const bibPath = path.join(tempPath, 'subdir', bibFile)
      fs.writeFileSync(bibPath, '')
      const found = fR(path.join(tempPath, 'subdir', 'simple.md'), bibFile)
      expect(found).to.equal(bibPath)
    })

    it('should return bibFile in a parent directory', function() {
      const bibPath = path.join(tempPath, bibFile)
      fs.writeFileSync(bibPath, '')
      const found = fR(path.join(tempPath, 'subdir', 'simple.md'), bibFile)
      expect(found).to.equal(bibPath)
    })

    it("shouldn't return bibFile in a out of scope directory", function() {
      fs.writeFileSync(path.join(tempPath, '..', bibFile), '')
      const found = fR(path.join(tempPath, 'subdir', 'simple.md'), bibFile)
      expect(found).to.equal(false)
    })
  })

  describe('PandocHelper::getArguments', function() {
    const { getArguments } = pandocHelper

    it('should filter empty arguments', function() {
      const args = {
        from: 'markdown',
        to: 'html',
        filter: [],
      }
      const result = getArguments(args as any)
      expect(result.length).to.equal(2)
      expect(result[0]).to.equal('--from=markdown')
      expect(result[1]).to.equal('--to=html')
    })

    it('should load user arguments', function() {
      atom.config.set('markdown-preview-plus.pandocArguments', [
        '-v',
        '--smart',
        'rem',
        '--filter=/foo/bar',
        '--filter-foo /foo/baz',
      ])
      const args = {}
      const result = getArguments(args as any)
      expect(result.length).to.equal(4)
      expect(result[0]).to.equal('-v')
      expect(result[1]).to.equal('--smart')
      expect(result[2]).to.equal('--filter=/foo/bar')
      expect(result[3]).to.equal('--filter-foo=/foo/baz')
    })

    it('should combine user arguments and given arguments', function() {
      atom.config.set('markdown-preview-plus.pandocArguments', [
        '-v',
        '--filter-foo /foo/baz',
      ])
      const args = {
        foo: 'bar',
        empty3: undefined,
      }
      const result = getArguments(args as any)
      expect(result.length).to.equal(3)
      expect(result[0]).to.equal('--foo=bar')
      expect(result[1]).to.equal('-v')
      expect(result[2]).to.equal('--filter-foo=/foo/baz')
    })
  })

  describe('PandocHelper::setPandocOptions', function() {
    const fallBackBib = '/foo/fallback.bib'
    const fallBackCsl = '/foo/fallback.csl'
    const { setPandocOptions } = pandocHelper

    beforeEach(function() {
      file = path.join(tempPath, 'subdir', 'simple.md')
      atom.config.set('markdown-preview-plus.pandocBibliography', true)
      atom.config.set('markdown-preview-plus.pandocBIBFile', bibFile)
      atom.config.set(
        'markdown-preview-plus.pandocBIBFileFallback',
        fallBackBib,
      )
      atom.config.set('markdown-preview-plus.pandocCSLFile', cslFile)
      atom.config.set(
        'markdown-preview-plus.pandocCSLFileFallback',
        fallBackCsl,
      )
    })

    it("shouldn't set pandoc bib options if citations are disabled", function() {
      atom.config.set('markdown-preview-plus.pandocBibliography', false)
      fs.writeFileSync(path.join(tempPath, bibFile), '')
      const config = setPandocOptions(file, false)
      expect(config.args.bibliography).to.equal(undefined)
    })

    it("shouldn't set pandoc bib options if no fallback file exists", function() {
      atom.config.unset('markdown-preview-plus.pandocBIBFileFallback')
      const config = setPandocOptions(file, false)
      expect(config.args.bibliography).to.equal(undefined)
    })

    it('should set pandoc bib options if citations are enabled and project bibFile exists', function() {
      const bibPath = path.join(tempPath, bibFile)
      fs.writeFileSync(bibPath, '')
      const config = setPandocOptions(file, false)
      expect(config.args.bibliography).to.equal(bibPath)
    })

    it('should set pandoc bib options if citations are enabled and use fallback', function() {
      const config = setPandocOptions(file, false)
      expect(config.args.bibliography).to.equal(fallBackBib)
    })

    it("shouldn't set pandoc csl options if citations are disabled", function() {
      atom.config.set('markdown-preview-plus.pandocBibliography', false)
      fs.writeFileSync(path.join(tempPath, cslFile), '')
      const config = setPandocOptions(file, false)
      expect(config.args.csl).to.equal(undefined)
    })

    it("shouldn't set pandoc csl options if no fallback file exists", function() {
      atom.config.unset('markdown-preview-plus.pandocCSLFileFallback')
      const config = setPandocOptions(file, false)
      expect(config.args.csl).to.equal(undefined)
    })

    it('should set pandoc csl options if citations are enabled and project cslFile exists', function() {
      const cslPath = path.join(tempPath, cslFile)
      fs.writeFileSync(cslPath, '')
      const config = setPandocOptions(file, false)
      expect(config.args.csl).to.equal(cslPath)
    })

    it('should set pandoc csl options if citations are enabled and use fallback', function() {
      const config = setPandocOptions(file, false)
      expect(config.args.csl).to.equal(fallBackCsl)
    })
  })
})
