// tslint:disable:no-unused-expression
import * as path from 'path'
import * as fs from 'fs'
import * as wrench from 'fs-extra'
import * as temp from 'temp'
import {
  createFileView,
  MarkdownPreviewView,
} from '../src/markdown-preview-view'
import pandocHelper = require('../src/pandoc-helper')
import { expect, assert } from 'chai'
import sinon from 'sinon'

import {
  waitsFor,
  previewFragment,
  activateMe,
  withFileGen,
  WithFileType,
} from './util'

describe('MarkdownPreviewView when Pandoc is enabled', function () {
  let html: string
  let preview: MarkdownPreviewView
  let filePath: string
  let stub: sinon.SinonStub<any>
  const previews: Set<MarkdownPreviewView> = new Set()

  const createMarkdownPreviewViewFile = function (filePath: string) {
    const mpv = createFileView(filePath)
    assert(mpv.element !== undefined)
    window.workspaceDiv.appendChild(mpv.element!)
    previews.add(mpv)
    return mpv
  }

  before(async () => activateMe())
  after(async () => atom.packages.deactivatePackage('markdown-preview-plus'))

  beforeEach(async function () {
    filePath = path.join(__dirname, 'fixtures/subdir/file.markdown')
    const htmlPath = path.join(__dirname, 'fixtures/subdir/file-pandoc.html')
    html = fs.readFileSync(htmlPath, { encoding: 'utf-8' })

    atom.config.set('markdown-preview-plus.renderer', 'pandoc')
    stub = sinon
      .stub(pandocHelper, 'renderPandoc')
      .callsFake(async (_text, _filePath, _renderMath) => html)

    preview = createMarkdownPreviewViewFile(filePath)
  })

  afterEach(async function () {
    previews.forEach((x) => x.destroy())
    previews.clear()

    atom.config.unset('markdown-preview-plus')
    for (const item of atom.workspace.getPaneItems()) {
      await atom.workspace.paneForItem(item)!.destroyItem(item, true)
    }
    stub.restore()
  })

  describe('image resolving', function () {
    beforeEach(async function () {
      await preview.initialRenderPromise()
    })

    describe('when the image uses a relative path', () =>
      it('resolves to a path relative to the file', async function () {
        const image = await waitsFor(
          async () =>
            (await previewFragment(preview)).querySelector('img[alt=Image1]')!,
        )
        expect(image.getAttribute('src')).to.startWith(
          path.join(__dirname, 'fixtures/subdir/image1.png'),
        )
      }))

    describe('when the image uses an absolute path that does not exist', () =>
      it('resolves to a path relative to the project root', async function () {
        const image = await waitsFor(
          async () =>
            (await previewFragment(preview)).querySelector('img[alt=Image2]')!,
        )
        expect(image.getAttribute('src')).to.startWith('/tmp/image2.png')
      }))

    describe('when the image uses an absolute path that exists', () => {
      let tempPath: string
      let withFile: WithFileType

      before(() => {
        tempPath = temp.mkdirSync('atom')
        withFile = withFileGen(tempPath)
      })

      after(() => {
        wrench.removeSync(tempPath)
      })

      it('adds a query to the URL', async function () {
        await withFile(
          'foo.md',
          `![absolute](${filePath})`,
          async (filePath) => {
            html = `\
<div class="figure">
<img src="${filePath}" alt="absolute"><p class="caption">absolute</p>
</div>\
`
            preview = createMarkdownPreviewViewFile(filePath)

            await preview.initialRenderPromise()

            await waitsFor(async () =>
              (
                await previewFragment(preview)
              ).querySelector('img[alt=absolute]'),
            )

            expect(
              (await previewFragment(preview))
                .querySelector('img[alt=absolute]')!
                .getAttribute('src')!
                .startsWith(`${filePath}?v=`),
            ).to.equal(true)
          },
        )
      })
    })

    describe('when the image uses an URL', function () {
      it("doesn't change the http(s) URL", async function () {
        const image = await waitsFor(
          async () =>
            (await previewFragment(preview)).querySelector('img[alt=Image3]')!,
        )
        expect(image.getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
      })

      it("doesn't change the data URL", async function () {
        const image = (await previewFragment(preview)).querySelector(
          'img[alt=Image4]',
        )
        expect(image).to.exist
        expect(image!.getAttribute('src')).to.equal(
          'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
        )
      })
    })
  })
})
