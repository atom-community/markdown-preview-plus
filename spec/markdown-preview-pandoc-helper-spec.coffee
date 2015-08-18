path = require 'path'
fs = require 'fs-plus'
temp = require 'temp'
wrench = require 'wrench'
{$} = require 'atom-space-pen-views'
pandocHelper = require '../lib/pandoc-helper.coffee'

bibFile = 'test.bib'
cslFile = 'foo.csl'

tempPath = null
file = null

require './spec-helper'

describe "Markdown preview plus pandoc helper", ->
  [workspaceElement, preview] = []

  beforeEach ->
    fixturesPath = path.join(__dirname, 'fixtures')
    tempPath = temp.mkdirSync('atom')
    wrench.copyDirSyncRecursive(fixturesPath, tempPath, forceDelete: true)
    atom.project.setPaths([tempPath])

    jasmine.useRealClock()

    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

    waitsForPromise ->
      atom.packages.activatePackage("markdown-preview-plus")

  describe "PandocHelper::findFileRecursive", ->

    fR = pandocHelper.__testing__.findFileRecursive

    it "should return bibFile in the same directory", ->
      runs ->
        bibPath = path.join(tempPath, 'subdir', bibFile)
        fs.writeFileSync bibPath, ''
        found = fR path.join(tempPath, 'subdir', 'simple.md'), bibFile
        expect(found).toEqual(bibPath)

    it "should return bibFile in a parent directory", ->
      runs ->
        bibPath = path.join(tempPath, bibFile)
        fs.writeFileSync bibPath, ''
        found = fR path.join(tempPath, 'subdir', 'simple.md'), bibFile
        expect(found).toEqual(bibPath)

    it "shouldn't return bibFile in a out of scope directory", ->
      runs ->
        fs.writeFileSync path.join(tempPath, '..', bibFile), ''
        found = fR path.join(tempPath, 'subdir', 'simple.md'), bibFile
        expect(found).toEqual(false)

  describe "PandocHelper::getArguments", ->
    getArguments = pandocHelper.__testing__.getArguments

    it 'should work with empty arguments', ->
      atom.config.set 'markdown-preview-plus.pandocArguments', []
      result = getArguments(null)
      expect(result.length).toEqual(0)

    it 'should filter empty arguments', ->
      args =
        foo: 'bar'
        empty: null
        none: 'lala'
        empty2: false
        empty3: undefined
      result = getArguments(args)
      expect(result.length).toEqual(2)
      expect(result[0]).toEqual('--foo=bar')
      expect(result[1]).toEqual('--none=lala')

    it 'should load user arguments', ->
      atom.config.set 'markdown-preview-plus.pandocArguments',
        ['-v', '--smart', 'rem', '--filter=/foo/bar', '--filter-foo /foo/baz']
      args = {}
      result = getArguments(args)
      expect(result.length).toEqual(4)
      expect(result[0]).toEqual('-v')
      expect(result[1]).toEqual('--smart')
      expect(result[2]).toEqual('--filter=/foo/bar')
      expect(result[3]).toEqual('--filter-foo=/foo/baz')

    it 'should combine user arguments and given arguments', ->
      atom.config.set 'markdown-preview-plus.pandocArguments',
        ['-v', '--filter-foo /foo/baz']
      args =
        foo: 'bar'
        empty3: undefined
      result = getArguments(args)
      expect(result.length).toEqual(3)
      expect(result[0]).toEqual('--foo=bar')
      expect(result[1]).toEqual('-v')
      expect(result[2]).toEqual('--filter-foo=/foo/baz')


  describe "PandocHelper::setPandocOptions", ->
    fallBackBib = '/foo/fallback.bib'
    fallBackCsl = '/foo/fallback.csl'
    setPandocOptions = pandocHelper.__testing__.setPandocOptions


    beforeEach ->
      file = path.join tempPath, 'subdir', 'simple.md'
      atom.config.set 'markdown-preview-plus.pandocBibliography', true
      atom.config.set 'markdown-preview-plus.pandocBIBFile', bibFile
      atom.config.set 'markdown-preview-plus.pandocBIBFileFallback', fallBackBib
      atom.config.set 'markdown-preview-plus.pandocCSLFile', cslFile
      atom.config.set 'markdown-preview-plus.pandocCSLFileFallback', fallBackCsl

    it "shouldn't set pandoc bib options if citations are disabled", ->
      runs ->
        atom.config.set 'markdown-preview-plus.pandocBibliography', false
        fs.writeFileSync path.join(tempPath, bibFile), ''
        config = setPandocOptions file
        expect(config.args.bibliography).toEqual(undefined)

    it "shouldn't set pandoc bib options if no fallback file exists", ->
      runs ->
        atom.config.set 'markdown-preview-plus.pandocBIBFileFallback'
        config = setPandocOptions file
        expect(config.args.bibliography).toEqual(undefined)

    it "should set pandoc bib options if citations are enabled and project bibFile exists", ->
      runs ->
        bibPath = path.join(tempPath, bibFile)
        fs.writeFileSync bibPath, ''
        config = setPandocOptions file
        expect(config.args.bibliography).toEqual(bibPath)

    it "should set pandoc bib options if citations are enabled and use fallback", ->
      runs ->
        config = setPandocOptions file
        expect(config.args.bibliography).toEqual(fallBackBib)

    it "shouldn't set pandoc csl options if citations are disabled", ->
      runs ->
        atom.config.set 'markdown-preview-plus.pandocBibliography', false
        fs.writeFileSync path.join(tempPath, cslFile), ''
        config = setPandocOptions file
        expect(config.args.csl).toEqual(undefined)

    it "shouldn't set pandoc csl options if no fallback file exists", ->
      runs ->
        atom.config.set 'markdown-preview-plus.pandocCSLFileFallback'
        config = setPandocOptions file
        expect(config.args.csl).toEqual(undefined)

    it "should set pandoc csl options if citations are enabled and project cslFile exists", ->
      runs ->
        cslPath = path.join(tempPath, cslFile)
        fs.writeFileSync cslPath, ''
        config = setPandocOptions file
        expect(config.args.csl).toEqual(cslPath)

    it "should set pandoc csl options if citations are enabled and use fallback", ->
      runs ->
        config = setPandocOptions file
        expect(config.args.csl).toEqual(fallBackCsl)
