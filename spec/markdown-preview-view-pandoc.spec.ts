// tslint:disable:no-unused-expression
import * as path from 'path'
import * as fs from 'fs'
import * as temp from 'temp'
import { MarkdownPreviewView } from '../lib/markdown-preview-view'
import markdownIt = require('../lib/markdown-it-helper')
import pandocHelper = require('../lib/pandoc-helper')
import { expect } from 'chai'
import * as sinon from 'sinon'

import { waitsFor } from './util'

describe('MarkdownPreviewView when Pandoc is enabled', function() {
  let html: string
  let preview: MarkdownPreviewView
  let filePath: string
  let stub: sinon.SinonStub

  before(async () => atom.packages.activatePackage(path.join(__dirname, '..')))
  after(async () => atom.packages.deactivatePackage('markdown-preview-plus'))

  beforeEach(async function() {
    filePath = path.join(__dirname, 'fixtures/subdir/file.markdown')
    const htmlPath = path.join(__dirname, 'fixtures/subdir/file-pandoc.html')
    html = fs.readFileSync(htmlPath, { encoding: 'utf-8' })

    atom.config.set('markdown-preview-plus.enablePandoc', true)
    stub = sinon
      .stub(pandocHelper, 'renderPandoc')
      .callsFake(
        (
          _text,
          _filePath,
          _renderMath,
          cb: (err: Error | null, result: string) => void,
        ) => cb(null, html),
      )

    preview = new MarkdownPreviewView({ filePath })
  })

  afterEach(async function() {
    atom.config.unset('markdown-preview-plus')
    for (const item of atom.workspace.getPaneItems()) {
      await atom.workspace.paneForItem(item)!.destroyItem(item, true)
    }
    stub.restore()
  })

  describe('image resolving', function() {
    let spy: sinon.SinonSpy
    beforeEach(async function() {
      spy && spy.restore()
      spy = sinon.spy(markdownIt, 'decode')
      await preview.renderMarkdown()
      await preview.renderPromise
    })

    afterEach(function() {
      spy.restore()
    })

    describe('when the image uses a relative path', () =>
      it('resolves to a path relative to the file', async function() {
        const image = await waitsFor(() => preview.find('img[alt=Image1]')!)
        expect(markdownIt.decode).not.to.be.called
        expect(image.getAttribute('src')).to.startWith(
          path.join(__dirname, 'fixtures/subdir/image1.png'),
        )
      }))

    describe('when the image uses an absolute path that does not exist', () =>
      it('resolves to a path relative to the project root', async function() {
        const image = await waitsFor(() => preview.find('img[alt=Image2]')!)
        expect(markdownIt.decode).not.to.be.called
        expect(image.getAttribute('src')).to.startWith('/tmp/image2.png')
      }))

    describe('when the image uses an absolute path that exists', () =>
      it('adds a query to the URL', async function() {
        preview.destroy()

        filePath = path.join(temp.mkdirSync('atom'), 'foo.md')
        fs.writeFileSync(filePath, `![absolute](${filePath})`)

        html = `\
        <div class="figure">
        <img src="${filePath}" alt="absolute"><p class="caption">absolute</p>
        </div>\
        `
        preview = new MarkdownPreviewView({ filePath })

        await preview.renderMarkdown()

        await waitsFor(() => preview.find('img[alt=absolute]'))

        expect(markdownIt.decode).not.to.be.called
        expect(
          preview.find('img[alt=absolute]')!.getAttribute('src')!.startsWith(
            `${filePath}?v=`,
          ),
        ).to.equal(true)
      }))

    describe('when the image uses an URL', function() {
      it("doesn't change the http(s) URL", async function() {
        const image = await waitsFor(() => preview.find('img[alt=Image3]')!)
        expect(markdownIt.decode).not.to.be.called
        expect(image.getAttribute('src')).to.equal(
          'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png',
        )
      })

      it("doesn't change the data URL", function() {
        const image = preview.find('img[alt=Image4]')
        expect(image).to.exist
        expect(markdownIt.decode).not.to.be.called
        expect(image!.getAttribute('src')).to.equal(
          'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
        )
      })
    })
  })
})
