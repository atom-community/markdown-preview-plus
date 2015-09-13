{$}           = require 'atom-space-pen-views'
path          = require 'path'
fs            = require 'fs-plus'
temp          = require('temp').track()
mathjaxHelper = require '../lib/mathjax-helper'

describe "MathJax helper module", ->
  describe "loading MathJax TeX macros", ->
    [configDirPath, macrosPath, macros] = []

    beforeEach ->
      configDirPath = temp.mkdirSync('atom-config-dir-')
      macrosPath = path.join configDirPath, 'markdown-preview-plus.cson'

      spyOn(atom, 'getConfigDirPath').andReturn configDirPath
      jasmine.useRealClock() # MathJax queue's will NOT work without this

      mathjaxHelper.resetMathJax()

    afterEach ->
      mathjaxHelper.resetMathJax()

    waitsForMacrosToLoad = ->
      [span] = []

      waitsForPromise ->
        atom.packages.activatePackage("markdown-preview-plus")

      runs ->
        mathjaxHelper.loadMathJax()

      waitsFor "MathJax to load", ->
        MathJax?

      # Trigger MathJax TeX extension to load

      runs ->
        span                  = document.createElement("span")
        equation              = document.createElement("script")
        equation.type         = "math/tex; mode=display"
        equation.textContent  = "\\int_1^2"
        span.appendChild equation
        mathjaxHelper.mathProcessor span

      waitsFor "MathJax macros to be defined", ->
        macros = MathJax.InputJax?.TeX?.Definitions?.macros

      waitsFor "MathJax to process span", ->
        span.childElementCount is 2

    describe "when a macros file exists", ->
      beforeEach ->
        fixturesPath = path.join(__dirname, 'fixtures/macros.cson')
        fixturesFile = fs.readFileSync fixturesPath, 'utf8'
        fs.writeFileSync macrosPath, fixturesFile

      it "loads valid macros", ->
        waitsForMacrosToLoad()
        runs ->
          expect(macros.macroOne).toBeDefined()
          expect(macros.macroParamOne).toBeDefined()

      it "doesn't load invalid macros", ->
        waitsForMacrosToLoad()
        runs ->
          expect(macros.macro1).toBeUndefined()
          expect(macros.macroTwo).toBeUndefined()
          expect(macros.macroParam1).toBeUndefined()
          expect(macros.macroParamTwo).toBeUndefined()

    describe "when a macros file doesn't exist", ->
      it "creates a template macros file", ->
        expect(fs.isFileSync(macrosPath)).toBe(false)
        waitsForMacrosToLoad()
        runs -> expect(fs.isFileSync(macrosPath)).toBe(true)
