path = require 'path'
fs = require 'fs-plus'
temp = require 'temp'
MarkdownPreviewView = require '../lib/markdown-preview-view'
markdownIt = require '../lib/markdown-it-helper'
pandocHelper = require '../lib/pandoc-helper.coffee'
url = require 'url'
queryString = require 'querystring'

require './spec-helper'

describe "MarkdownPreviewView when Pandoc is enabled", ->
  [html, preview, filePath] = []

  beforeEach ->
    filePath = atom.project.getDirectories()[0].resolve('subdir/file.markdown')
    htmlPath = atom.project.getDirectories()[0].resolve('subdir/file-pandoc.html')
    html = fs.readFileSync htmlPath,
      encoding: 'utf-8'

    waitsForPromise ->
      atom.packages.activatePackage('markdown-preview-plus')

    runs ->
      atom.config.set 'markdown-preview-plus.enablePandoc', true
      spyOn(pandocHelper, 'renderPandoc').andCallFake (text, filePath, renderMath, cb) ->
        cb null, html

      preview = new MarkdownPreviewView({filePath})
      jasmine.attachToDOM(preview.element)

    this.addMatchers
      toStartWith: (expected) ->
        this.actual.slice(0, expected.length) is expected

  afterEach ->
    preview.destroy()

  describe "image resolving", ->
    beforeEach ->
      spyOn(markdownIt, 'decode').andCallThrough()
      waitsForPromise ->
        preview.renderMarkdown()

    describe "when the image uses a relative path", ->
      it "resolves to a path relative to the file", ->
        image = preview.find("img[alt=Image1]")
        expect(markdownIt.decode).not.toHaveBeenCalled()
        expect(image.attr('src')).toStartWith atom.project.getDirectories()[0].resolve('subdir/image1.png')

    describe "when the image uses an absolute path that does not exist", ->
      it "resolves to a path relative to the project root", ->
        image = preview.find("img[alt=Image2]")
        expect(markdownIt.decode).not.toHaveBeenCalled()
        expect(image.attr('src')).toStartWith atom.project.getDirectories()[0].resolve('tmp/image2.png')

    describe "when the image uses an absolute path that exists", ->
      it "adds a query to the URL", ->
        preview.destroy()

        filePath = path.join(temp.mkdirSync('atom'), 'foo.md')
        fs.writeFileSync(filePath, "![absolute](#{filePath})")

        jasmine.unspy(pandocHelper, 'renderPandoc')
        spyOn(pandocHelper, 'renderPandoc').andCallFake (text, filePath, renderMath, cb) ->
          cb null, """
            <div class="figure">
            <img src="#{filePath}" alt="absolute"><p class="caption">absolute</p>
            </div>
            """

        preview = new MarkdownPreviewView({filePath})
        jasmine.attachToDOM(preview.element)

        waitsForPromise ->
          preview.renderMarkdown()

        runs ->
          expect(markdownIt.decode).not.toHaveBeenCalled()
          expect(preview.find("img[alt=absolute]").attr('src')).toStartWith "#{filePath}?v="

    describe "when the image uses a web URL", ->
      it "doesn't change the URL", ->
        image = preview.find("img[alt=Image3]")
        expect(markdownIt.decode).not.toHaveBeenCalled()
        expect(image.attr('src')).toBe 'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png'
