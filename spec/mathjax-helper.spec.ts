/// <reference path="../src-client/node.d.ts"/>
/// <reference path="../src-client/global-shims.d.ts"/>
import * as path from 'path'
import * as fs from 'fs'
import * as temp from 'temp'
import { waitsFor, activateMe } from './util'
import { expect } from 'chai'
global.require = require
import * as mathjaxHelper from '../src-client/mathjax-helper'

temp.track()

declare global {
  namespace MathJax {
    interface InputJax {
      TeX: { Definitions: { macros: object } }
    }
  }
}

function resolve<T>(v: T): ResolvablePromise<T> {
  const res = Promise.resolve(v) as ResolvablePromise<T>
  res.resolve = function() {
    /*noop*/
  }
  return res
}

describe('MathJax helper module', () =>
  describe('loading MathJax TeX macros', function() {
    let configDirPath: string
    let macrosPath: string
    let macros: { [key: string]: any }
    let spans = [] as Element[]

    before(async () => activateMe())
    after(async () => {
      await atom.packages.deactivatePackage('markdown-preview-plus')
    })

    beforeEach(async function() {
      configDirPath = temp.mkdirSync('atom-config-dir-')
      macrosPath = path.join(configDirPath, 'markdown-preview-plus.cson')

      window.atomVars = {
        home: resolve(configDirPath),
        mathJaxConfig: resolve({
          numberEquations: false,
          texExtensions: [] as string[],
          undefinedFamily: '',
          renderer: 'SVG' as 'SVG',
        }),
        revSourceMap: new WeakMap(),
        sourceLineMap: new Map(),
      }
    })

    afterEach(function() {
      delete window.atomVars
      mathjaxHelper.unloadMathJax()
      spans.forEach((x) => {
        x.remove()
      })
      spans = []
    })

    const waitsForMacrosToLoad = async function() {
      // Trigger MathJax TeX extension to load

      const span = document.createElement('span')
      const equation = document.createElement('script')
      equation.type = 'math/tex; mode=display'
      equation.textContent = '\\int_1^2'
      span.appendChild(equation)
      atom.views.getView(atom.workspace).appendChild(span)
      spans.push(span)
      await mathjaxHelper.mathProcessor(span)

      macros = await waitsFor.msg('MathJax macros to be defined', function() {
        try {
          // tslint:disable-next-line:no-unsafe-any
          return window.MathJax.InputJax.TeX.Definitions.macros as typeof macros
        } catch {
          return undefined
        }
      })

      await waitsFor.msg(
        'MathJax to process span',
        () => span.childElementCount === 2,
      )
    }

    describe('when a macros file exists', function() {
      beforeEach(function() {
        const fixturesPath = path.join(__dirname, 'fixtures/macros.cson')
        const fixturesFile = fs.readFileSync(fixturesPath, 'utf8')
        fs.writeFileSync(macrosPath, fixturesFile)
      })

      it('loads valid macros', async function() {
        await waitsForMacrosToLoad()
        expect(macros.macroOne).to.exist
        expect(macros.macroParamOne).to.exist
      })

      it("doesn't load invalid macros", async function() {
        await waitsForMacrosToLoad()
        expect(macros.macro1).to.be.undefined
        expect(macros.macroTwo).to.be.undefined
        expect(macros.macroParam1).to.be.undefined
        expect(macros.macroParamTwo).to.be.undefined
      })
    })

    describe("when a macros file doesn't exist", () =>
      it('creates a template macros file', async function() {
        expect(fs.existsSync(macrosPath)).to.be.false
        await waitsForMacrosToLoad()
        expect(fs.existsSync(macrosPath)).to.be.true
      }))
  }))
