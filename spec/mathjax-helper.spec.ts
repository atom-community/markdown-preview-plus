/// <reference path="../src-client/node.d.ts"/>
import * as path from 'path'
import * as fs from 'fs'
import * as temp from 'temp'
import * as wrench from 'fs-extra'
import { waitsFor, activateMe } from './util'
import { expect } from 'chai'
global.require = require
import { MathJaxController } from '../src-client/mathjax-helper'
import { loadUserMacros } from '../src/macros-util'

temp.track()

declare global {
  namespace MathJax {
    interface InputJax {
      TeX: { Definitions: { macros: object } }
    }
  }
}

describe('MathJax helper module', () =>
  describe('loading MathJax TeX macros', function () {
    let configDirPath: string
    let macrosPath: string
    let macros: { [key: string]: any }
    let spans = [] as Element[]
    let mathJax: MathJaxController

    before(async () => {
      await activateMe()
      configDirPath = temp.mkdirSync('atom-config-dir-')
      macrosPath = path.join(configDirPath, 'markdown-preview-plus.yaml')
    })
    after(async () => {
      await atom.packages.deactivatePackage('markdown-preview-plus')
      wrench.removeSync(configDirPath)
    })

    afterEach(function () {
      mathJax.dispose()
      spans.forEach((x) => {
        x.remove()
      })
      spans = []
    })

    const waitsForMacrosToLoad = async function () {
      // Trigger MathJax TeX extension to load
      const div = document.createElement('div')
      const span = document.createElement('span')
      span.classList.add('math')
      const equation = document.createElement('script')
      div.appendChild(span)
      equation.type = 'math/tex; mode=display'
      equation.textContent = '\\int_1^2'
      span.appendChild(equation)
      atom.views.getView(atom.workspace).appendChild(div)
      spans.push(div)
      await mathJax.queueTypeset(span)

      macros = await waitsFor.msg('MathJax macros to be defined', function () {
        return MathJax?.InputJax?.TeX?.Definitions?.macros
      })
    }

    describe('when a macros file exists', function () {
      before(async function () {
        const fixturesPath = path.join(__dirname, 'fixtures/macros.cson')
        const fixturesFile = fs.readFileSync(fixturesPath, 'utf8')
        fs.writeFileSync(macrosPath, fixturesFile)
        mathJax = await MathJaxController.create(
          loadUserMacros(configDirPath),
          {
            numberEquations: false,
            texExtensions: [] as string[],
            undefinedFamily: '',
            latexRenderer: 'SVG' as 'SVG',
          },
        )
        await waitsForMacrosToLoad()
      })

      after(function () {
        fs.unlinkSync(macrosPath)
      })

      it('loads valid macros', async function () {
        expect(macros.macroOne).to.exist
        expect(macros.macroParamOne).to.exist
      })

      it("doesn't load invalid macros", async function () {
        expect(macros.macro1).to.be.undefined
        expect(macros.macroTwo).to.be.undefined
        expect(macros.macroParam1).to.be.undefined
        expect(macros.macroParamTwo).to.be.undefined
      })
    })

    describe("when a macros file doesn't exist", () => {
      it('creates a template macros file', async function () {
        expect(fs.existsSync(macrosPath)).to.be.false
        mathJax = await MathJaxController.create(
          loadUserMacros(configDirPath),
          {
            numberEquations: false,
            texExtensions: [] as string[],
            undefinedFamily: '',
            latexRenderer: 'SVG' as 'SVG',
          },
        )
        expect(fs.existsSync(macrosPath)).to.be.true
      })
    })
  }))
