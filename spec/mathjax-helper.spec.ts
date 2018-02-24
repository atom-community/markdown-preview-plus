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

describe('MathJax helper module', () =>
  describe('loading MathJax TeX macros', function() {
    let configDirPath: string
    let macrosPath: string
    let macros: { [key: string]: any }
    let stub: sinon.SinonStub
    let jaxFrame: HTMLIFrameElement

    before(async () => {
      await atom.packages.activatePackage(path.join(__dirname, '..'))
    })
    after(async () => {
      await atom.packages.deactivatePackage('markdown-preview-plus')
    })

    beforeEach(async function() {
      const jf = (jaxFrame = document.createElement('iframe'))
      jaxFrame.src = 'about:blank'
      const fp = new Promise((resolve) => (jf.onload = resolve))
      window.workspaceDiv.appendChild(jaxFrame)
      await fp

      configDirPath = temp.mkdirSync('atom-config-dir-')
      macrosPath = path.join(configDirPath, 'markdown-preview-plus.cson')

      stub = sinon.stub(atom, 'getConfigDirPath').returns(configDirPath)
    })

    afterEach(function() {
      if (jaxFrame) jaxFrame.remove()
      stub.restore()
    })

    const waitsForMacrosToLoad = async function() {
      await mathjaxHelper.testing.loadMathJax(jaxFrame, 'SVG')

      expect(stub).to.be.called

      // Trigger MathJax TeX extension to load

      const span = jaxFrame.contentDocument.createElement('span')
      const equation = jaxFrame.contentDocument.createElement('script')
      equation.type = 'math/tex; mode=display'
      equation.textContent = '\\int_1^2'
      span.appendChild(equation)
      await mathjaxHelper.mathProcessor(jaxFrame, [span])

      macros = await waitsFor.msg('MathJax macros to be defined', function() {
        try {
          // tslint:disable-next-line:no-unsafe-any
          return (jaxFrame.contentWindow as any)
            .MathJax.InputJax.TeX.Definitions.macros as typeof macros
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
