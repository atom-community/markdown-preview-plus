import * as path from 'path'
import * as fs from 'fs'
import * as temp from 'temp'
import mathjaxHelper = require('../lib/mathjax-helper')
import * as sinon from 'sinon'
import { waitsFor } from './util'
import { expect } from 'chai'

temp.track()

declare global {
  namespace MathJax {
    interface InputJax {
      TeX: { Definitions: { macros: object } }
    }
  }
}

xdescribe('MathJax helper module', () =>
  describe('loading MathJax TeX macros', function() {
    let configDirPath: string
    let macrosPath: string
    // let macros: { [key: string]: any }
    let stub: sinon.SinonStub
    let div: HTMLDivElement

    before(async () =>
      atom.packages.activatePackage(path.join(__dirname, '..')),
    )
    after(async () => atom.packages.deactivatePackage('markdown-preview-plus'))

    beforeEach(function() {
      configDirPath = temp.mkdirSync('atom-config-dir-')
      macrosPath = path.join(configDirPath, 'markdown-preview-plus.cson')

      stub = sinon.stub(atom, 'getConfigDirPath').returns(configDirPath)

      mathjaxHelper.testing.loadMathJax()

      div = document.createElement('div')
      div.style.visibility = 'hidden'
      document.body.appendChild(div)
    })

    afterEach(function() {
      mathjaxHelper.testing.resetMathJax()
      stub.restore()
      div.remove()
    })

    const waitsForMacrosToLoad = async function(macro: string) {
      // expect(stub).to.be.called

      // Trigger MathJax TeX extension to load

      const span = document.createElement('span')
      const equation = document.createElement('script')
      equation.type = 'math/tex; mode=display'
      equation.textContent = `\\${macro}`
      span.appendChild(equation)
      div.appendChild(span)
      await mathjaxHelper.mathProcessor([span])

      return waitsFor.msg(
        'MathJax to process span',
        () => span.querySelector('svg')!,
      )
    }

    describe('when a macros file exists', function() {
      beforeEach(function() {
        const fixturesPath = path.join(__dirname, 'fixtures/macros.cson')
        const fixturesFile = fs.readFileSync(fixturesPath, 'utf8')
        fs.writeFileSync(macrosPath, fixturesFile)
      })

      it('loads valid macros', async function() {
        expect((await waitsForMacrosToLoad('macroOne')).textContent).to.equal(
          'asd',
        )
        expect(
          (await waitsForMacrosToLoad('macroParamOne')).textContent,
        ).to.equal('asd')
      })

      it("doesn't load invalid macros", async function() {
        expect((await waitsForMacrosToLoad('macro1')).textContent).to.equal(
          'asd',
        )
        expect((await waitsForMacrosToLoad('macro2')).textContent).to.equal(
          'asd',
        )
      })
    })

    describe("when a macros file doesn't exist", () =>
      it('creates a template macros file', async function() {
        expect(fs.existsSync(macrosPath)).to.be.false
        await waitsForMacrosToLoad('asd')
        expect(fs.existsSync(macrosPath)).to.be.true
      }))
  }))
