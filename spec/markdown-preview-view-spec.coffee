path = require 'path'
fs = require 'fs-plus'
temp = require 'temp'
MarkdownPreviewView = require '../lib/markdown-preview-view'
markdownIt = require '../lib/markdown-it-helper'
mathjaxHelper = require '../lib/mathjax-helper'
url = require 'url'
queryString = require 'querystring'

require './spec-helper'

describe "MarkdownPreviewView", ->
  [filePath, preview] = []

  beforeEach ->
    filePath = atom.project.getDirectories()[0].resolve('subdir/file.markdown')
    preview = new MarkdownPreviewView({filePath})
    jasmine.attachToDOM(preview.element)

    waitsForPromise ->
      atom.packages.activatePackage('language-ruby')

    waitsForPromise ->
      atom.packages.activatePackage('language-javascript')

    waitsForPromise ->
      atom.packages.activatePackage('markdown-preview-plus')

    this.addMatchers
      toStartWith: (expected) ->
        this.actual.slice(0, expected.length) is expected

  afterEach ->
    preview.destroy()

  expectPreviewInSplitPane = ->
    runs ->
      expect(atom.workspace.getPanes()).toHaveLength 2

    waitsFor "markdown preview to be created", ->
      preview = atom.workspace.getPanes()[1].getActiveItem()

    runs ->
      expect(preview).toBeInstanceOf(MarkdownPreviewView)
      expect(preview.getPath()).toBe atom.workspace.getActivePaneItem().getPath()

  describe "::constructor", ->
    # Loading spinner disabled when DOM update by diff was introduced. If
    # spinner code in `lib/markdown-preview-view` is removed completly this
    # spec should also be removed
    #
    # it "shows a loading spinner and renders the markdown", ->
    #   preview.showLoading()
    #   expect(preview.find('.markdown-spinner')).toExist()
    #
    #   waitsForPromise ->
    #     preview.renderMarkdown()
    #
    #   runs ->
    #     expect(preview.find(".emoji")).toExist()

    it "shows an error message when there is an error", ->
      preview.showError("Not a real file")
      expect(preview.text()).toContain "Failed"

  describe "serialization", ->
    newPreview = null

    afterEach ->
      newPreview?.destroy()

    it "recreates the preview when serialized/deserialized", ->
      newPreview = atom.deserializers.deserialize(preview.serialize())
      jasmine.attachToDOM(newPreview.element)
      expect(newPreview.getPath()).toBe preview.getPath()

    it "does not recreate a preview when the file no longer exists", ->
      filePath = path.join(temp.mkdirSync('markdown-preview-'), 'foo.md')
      fs.writeFileSync(filePath, '# Hi')

      newPreview = new MarkdownPreviewView({filePath})
      serialized = newPreview.serialize()
      fs.removeSync(filePath)

      newPreview = atom.deserializers.deserialize(serialized)
      expect(newPreview).toBeUndefined()

    it "serializes the editor id when opened for an editor", ->
      preview.destroy()

      waitsForPromise ->
        atom.workspace.open('new.markdown')

      runs ->
        preview = new MarkdownPreviewView({editorId: atom.workspace.getActiveTextEditor().id})

        jasmine.attachToDOM(preview.element)
        expect(preview.getPath()).toBe atom.workspace.getActiveTextEditor().getPath()

        newPreview = atom.deserializers.deserialize(preview.serialize())
        jasmine.attachToDOM(newPreview.element)
        expect(newPreview.getPath()).toBe preview.getPath()

  describe "header rendering", ->

    it "should render headings with and without space", ->

      waitsForPromise -> preview.renderMarkdown()

      runs ->
        headlines = preview.find('h2')
        expect(headlines).toExist()
        expect(headlines.length).toBe(2)
        expect(headlines[0].outerHTML).toBe("<h2>Level two header without space</h2>")
        expect(headlines[1].outerHTML).toBe("<h2>Level two header with space</h2>")

    it "should render headings with and without space", ->
      atom.config.set 'markdown-preview-plus.useLazyHeaders', false

      waitsForPromise -> preview.renderMarkdown()

      runs ->
        headlines = preview.find('h2')
        expect(headlines).toExist()
        expect(headlines.length).toBe(1)
        expect(headlines[0].outerHTML).toBe("<h2>Level two header with space</h2>")


  describe "code block conversion to atom-text-editor tags", ->
    beforeEach ->
      waitsForPromise ->
        preview.renderMarkdown()

    it "removes line decorations on rendered code blocks", ->
      editor = preview.find("atom-text-editor[data-grammar='text plain null-grammar']")
      decorations = editor[0].getModel().getDecorations(class: 'cursor-line', type: 'line')
      expect(decorations.length).toBe 0

    it "removes a trailing newline but preserves remaining leading and trailing whitespace", ->
      newFilePath = atom.project.getDirectories()[0].resolve('subdir/trim-nl.md')
      newPreview = new MarkdownPreviewView({filePath: newFilePath})
      jasmine.attachToDOM(newPreview.element)

      waitsForPromise ->
        newPreview.renderMarkdown()

      runs ->
        editor = newPreview.find("atom-text-editor")
        expect(editor).toExist()
        expect(editor[0].getModel().getText()).toBe """

               a
              b
             c
            d
           e
          f

        """

      runs ->
        newPreview.destroy()

    describe "when the code block's fence name has a matching grammar", ->
      it "assigns the grammar on the atom-text-editor", ->
        rubyEditor = preview.find("atom-text-editor[data-grammar='source ruby']")
        expect(rubyEditor).toExist()
        expect(rubyEditor[0].getModel().getText()).toBe """
          def func
            x = 1
          end
        """

        # nested in a list item
        jsEditor = preview.find("atom-text-editor[data-grammar='source js']")
        expect(jsEditor).toExist()
        expect(jsEditor[0].getModel().getText()).toBe """
          if a === 3 {
            b = 5
          }
        """

    describe "when the code block's fence name doesn't have a matching grammar", ->
      it "does not assign a specific grammar", ->
        plainEditor = preview.find("atom-text-editor[data-grammar='text plain null-grammar']")
        expect(plainEditor).toExist()
        expect(plainEditor[0].getModel().getText()).toBe """
          function f(x) {
            return x++;
          }
        """

  describe "image resolving", ->
    beforeEach ->
      spyOn(markdownIt, 'decode').andCallThrough()
      waitsForPromise ->
        preview.renderMarkdown()

    describe "when the image uses a relative path", ->
      it "resolves to a path relative to the file", ->
        image = preview.find("img[alt=Image1]")
        expect(markdownIt.decode).toHaveBeenCalled()
        expect(image.attr('src')).toStartWith atom.project.getDirectories()[0].resolve('subdir/image1.png')

    describe "when the image uses an absolute path that does not exist", ->
      it "resolves to a path relative to the project root", ->
        image = preview.find("img[alt=Image2]")
        expect(markdownIt.decode).toHaveBeenCalled()
        expect(image.attr('src')).toStartWith atom.project.getDirectories()[0].resolve('tmp/image2.png')

    describe "when the image uses an absolute path that exists", ->
      it "adds a query to the URL", ->
        preview.destroy()

        filePath = path.join(temp.mkdirSync('atom'), 'foo.md')
        fs.writeFileSync(filePath, "![absolute](#{filePath})")
        preview = new MarkdownPreviewView({filePath})
        jasmine.attachToDOM(preview.element)

        waitsForPromise ->
          preview.renderMarkdown()

        runs ->
          expect(markdownIt.decode).toHaveBeenCalled()
          expect(preview.find("img[alt=absolute]").attr('src')).toStartWith "#{filePath}?v="

    describe "when the image uses a web URL", ->
      it "doesn't change the URL", ->
        image = preview.find("img[alt=Image3]")
        expect(markdownIt.decode).toHaveBeenCalled()
        expect(image.attr('src')).toBe 'https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png'

  describe "image modification", ->
    [dirPath, filePath, img1Path, workspaceElement] = []

    beforeEach ->
      preview.destroy()

      jasmine.useRealClock()

      dirPath   = temp.mkdirSync('atom')
      filePath  = path.join dirPath, 'image-modification.md'
      img1Path  = path.join dirPath, 'img1.png'

      fs.writeFileSync filePath, "![img1](#{img1Path})"
      fs.writeFileSync img1Path, "clearly not a png but good enough for tests"

      workspaceElement = atom.views.getView(atom.workspace)
      jasmine.attachToDOM(workspaceElement)

      waitsForPromise ->
        atom.packages.activatePackage("markdown-preview-plus")

    getImageVersion = (imagePath, imageURL) ->
      expect(imageURL).toStartWith "#{imagePath}?v="
      urlQueryStr = url.parse(imageURL).query
      urlQuery    = queryString.parse(urlQueryStr)
      urlQuery.v

    describe "when a local image is previewed", ->
      it "adds a timestamp query to the URL", ->
        waitsForPromise -> atom.workspace.open(filePath)
        runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expectPreviewInSplitPane()

        runs ->
          imageURL = preview.find("img[alt=img1]").attr('src')
          imageVer = getImageVersion(img1Path, imageURL)
          expect(imageVer).not.toEqual('deleted')

    describe "when a local image is modified during a preview #notwercker", ->
      it "rerenders the image with a more recent timestamp query", ->
        [imageURL, imageVer] = []

        waitsForPromise -> atom.workspace.open(filePath)
        runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expectPreviewInSplitPane()

        runs ->
          imageURL = preview.find("img[alt=img1]").attr('src')
          imageVer = getImageVersion(img1Path, imageURL)
          expect(imageVer).not.toEqual('deleted')

          fs.writeFileSync img1Path, "still clearly not a png ;D"

        waitsFor "image src attribute to update", ->
          imageURL = preview.find("img[alt=img1]").attr('src')
          not imageURL.endsWith imageVer

        runs ->
          newImageVer = getImageVersion(img1Path, imageURL)
          expect(newImageVer).not.toEqual('deleted')
          expect(parseInt(newImageVer)).toBeGreaterThan(parseInt(imageVer))

    describe "when three images are previewed and all are modified #notwercker", ->
      it "rerenders the images with a more recent timestamp as they are modified", ->
        [img2Path, img3Path] = []
        [img1Ver, img2Ver, img3Ver] = []
        [img1URL, img2URL, img3URL] = []

        runs ->
          preview.destroy()

          img2Path  = path.join dirPath, 'img2.png'
          img3Path  = path.join dirPath, 'img3.png'

          fs.writeFileSync img2Path, "i'm not really a png ;D"
          fs.writeFileSync img3Path, "neither am i ;D"
          fs.writeFileSync filePath, """
            ![img1](#{img1Path})
            ![img2](#{img2Path})
            ![img3](#{img3Path})
          """

        waitsForPromise -> atom.workspace.open(filePath)
        runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expectPreviewInSplitPane()

        getImageElementsURL = ->
          return [
            preview.find("img[alt=img1]").attr('src'),
            preview.find("img[alt=img2]").attr('src'),
            preview.find("img[alt=img3]").attr('src')
          ]

        expectQueryValues = (queryValues) ->
          [img1URL, img2URL, img3URL] = getImageElementsURL()
          if queryValues.img1?
            expect(img1URL).toStartWith "#{img1Path}?v="
            expect(img1URL).toBe "#{img1Path}?v=#{queryValues.img1}"
          if queryValues.img2?
            expect(img2URL).toStartWith "#{img2Path}?v="
            expect(img2URL).toBe "#{img2Path}?v=#{queryValues.img2}"
          if queryValues.img3?
            expect(img3URL).toStartWith "#{img3Path}?v="
            expect(img3URL).toBe "#{img3Path}?v=#{queryValues.img3}"

        runs ->
          [img1URL, img2URL, img3URL] = getImageElementsURL()

          img1Ver = getImageVersion(img1Path, img1URL)
          img2Ver = getImageVersion(img2Path, img2URL)
          img3Ver = getImageVersion(img3Path, img3URL)

          fs.writeFileSync img1Path, "still clearly not a png ;D"

        waitsFor "img1 src attribute to update", ->
          img1URL = preview.find("img[alt=img1]").attr('src')
          not img1URL.endsWith img1Ver

        runs ->
          expectQueryValues
            img2: img2Ver
            img3: img3Ver

          newImg1Ver = getImageVersion(img1Path, img1URL)
          expect(newImg1Ver).not.toEqual('deleted')
          expect(parseInt(newImg1Ver)).toBeGreaterThan(parseInt(img1Ver))
          img1Ver = newImg1Ver

          fs.writeFileSync img2Path, "still clearly not a png either ;D"

        waitsFor "img2 src attribute to update", ->
          img2URL = preview.find("img[alt=img2]").attr('src')
          not img2URL.endsWith img2Ver

        runs ->
          expectQueryValues
            img1: img1Ver
            img3: img3Ver

          newImg2Ver = getImageVersion(img2Path, img2URL)
          expect(newImg2Ver).not.toEqual('deleted')
          expect(parseInt(newImg2Ver)).toBeGreaterThan(parseInt(img2Ver))
          img2Ver = newImg2Ver

          fs.writeFileSync img3Path, "you better believe i'm not a png ;D"

        waitsFor "img3 src attribute to update", ->
          img3URL = preview.find("img[alt=img3]").attr('src')
          not img3URL.endsWith img3Ver

        runs ->
          expectQueryValues
            img1: img1Ver
            img2: img2Ver

          newImg3Ver  = getImageVersion(img3Path, img3URL)
          expect(newImg3Ver).not.toEqual('deleted')
          expect(parseInt(newImg3Ver)).toBeGreaterThan(parseInt(img3Ver))

    describe "when a previewed image is deleted then restored", ->
      it "removes the query timestamp and restores the timestamp after a rerender", ->
        [imageURL, imageVer] = []

        waitsForPromise -> atom.workspace.open(filePath)
        runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expectPreviewInSplitPane()

        runs ->
          imageURL = preview.find("img[alt=img1]").attr('src')
          imageVer = getImageVersion(img1Path, imageURL)
          expect(imageVer).not.toEqual('deleted')

          fs.unlinkSync img1Path

        waitsFor "image src attribute to update", ->
          imageURL = preview.find("img[alt=img1]").attr('src')
          not imageURL.endsWith imageVer

        runs ->
          expect(imageURL).toBe img1Path
          fs.writeFileSync img1Path, "clearly not a png but good enough for tests"
          preview.renderMarkdown()

        waitsFor "image src attribute to update", ->
          imageURL = preview.find("img[alt=img1]").attr('src')
          imageURL isnt img1Path

        runs ->
          newImageVer = getImageVersion(img1Path, imageURL)
          expect(parseInt(newImageVer)).toBeGreaterThan(parseInt(imageVer))

    describe "when a previewed image is renamed and then restored with its original name", ->
      it "removes the query timestamp and restores the timestamp after a rerender", ->
        [imageURL, imageVer] = []

        waitsForPromise -> atom.workspace.open(filePath)
        runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expectPreviewInSplitPane()

        runs ->
          imageURL = preview.find("img[alt=img1]").attr('src')
          imageVer = getImageVersion(img1Path, imageURL)
          expect(imageVer).not.toEqual('deleted')

          fs.renameSync img1Path, img1Path + "trol"

        waitsFor "image src attribute to update", ->
          imageURL = preview.find("img[alt=img1]").attr('src')
          not imageURL.endsWith imageVer

        runs ->
          expect(imageURL).toBe img1Path
          fs.renameSync img1Path + "trol", img1Path
          preview.renderMarkdown()

        waitsFor "image src attribute to update", ->
          imageURL = preview.find("img[alt=img1]").attr('src')
          imageURL isnt img1Path

        runs ->
          newImageVer = getImageVersion(img1Path, imageURL)
          expect(parseInt(newImageVer)).toBeGreaterThan(parseInt(imageVer))

  describe "gfm newlines", ->
    describe "when gfm newlines are not enabled", ->
      it "creates a single paragraph with <br>", ->
        atom.config.set('markdown-preview-plus.breakOnSingleNewline', false)

        waitsForPromise ->
          preview.renderMarkdown()

        runs ->
          expect(preview.find("p:last-child br").length).toBe 0

    describe "when gfm newlines are enabled", ->
      it "creates a single paragraph with no <br>", ->
        atom.config.set('markdown-preview-plus.breakOnSingleNewline', true)

        waitsForPromise ->
          preview.renderMarkdown()

        runs ->
          expect(preview.find("p:last-child br").length).toBe 1

  describe "when core:save-as is triggered", ->
    beforeEach ->
      preview.destroy()
      filePath = atom.project.getDirectories()[0].resolve('subdir/code-block.md')
      preview = new MarkdownPreviewView({filePath})
      jasmine.attachToDOM(preview.element)

    it "saves the rendered HTML and opens it", ->
      outputPath = temp.path(suffix: '.html')
      expectedFilePath = atom.project.getDirectories()[0].resolve('saved-html.html')
      expectedOutput = fs.readFileSync(expectedFilePath).toString()

      createRule = (selector, css) ->
        return {
          selectorText: selector
          cssText: "#{selector} #{css}"
        }

      markdownPreviewStyles = [
        {
          rules: [
            createRule ".markdown-preview", "{ color: orange; }"
          ]
        }, {
          rules: [
            createRule ".not-included", "{ color: green; }"
            createRule ".markdown-preview :host", "{ color: purple; }"
          ]
        }
      ]

      atomTextEditorStyles = [
        "atom-text-editor .line { color: brown; }\natom-text-editor .number { color: cyan; }"
        "atom-text-editor :host .something { color: black; }"
        "atom-text-editor .hr { background: url(atom://markdown-preview-plus/assets/hr.png); }"
      ]

      expect(fs.isFileSync(outputPath)).toBe false

      waitsForPromise ->
        preview.renderMarkdown()

      runs ->
        spyOn(atom, 'showSaveDialogSync').andReturn(outputPath)
        spyOn(preview, 'getDocumentStyleSheets').andReturn(markdownPreviewStyles)
        spyOn(preview, 'getTextEditorStyles').andReturn(atomTextEditorStyles)
        atom.commands.dispatch preview.element, 'core:save-as'

      waitsFor ->
        fs.existsSync(outputPath) and atom.workspace.getActiveTextEditor()?.getPath() is fs.realpathSync(outputPath)

      runs ->
        expect(fs.isFileSync(outputPath)).toBe true
        savedHTML = atom.workspace.getActiveTextEditor().getText()
          .replace(/<body class='markdown-preview'><div>/, '<body class=\'markdown-preview\'>')
          .replace(/\n<\/div><\/body>/, '</body>')
        expect(savedHTML).toBe expectedOutput.replace(/\r\n/g, '\n')

    describe "text editor style extraction", ->

      [extractedStyles] = []

      textEditorStyle = ".editor-style .extraction-test { color: blue; }"
      unrelatedStyle  = ".something else { color: red; }"

      beforeEach ->
        atom.styles.addStyleSheet textEditorStyle,
          context: 'atom-text-editor'

        atom.styles.addStyleSheet unrelatedStyle,
          context: 'unrelated-context'

        extractedStyles = preview.getTextEditorStyles()

      it "returns an array containing atom-text-editor css style strings", ->
        expect(extractedStyles.indexOf(textEditorStyle)).toBeGreaterThan(-1)

      it "does not return other styles", ->
        expect(extractedStyles.indexOf(unrelatedStyle)).toBe(-1)

  describe "when core:copy is triggered", ->
    it "writes the rendered HTML to the clipboard", ->
      preview.destroy()
      preview.element.remove()

      filePath = atom.project.getDirectories()[0].resolve('subdir/code-block.md')
      preview = new MarkdownPreviewView({filePath})
      jasmine.attachToDOM(preview.element)

      waitsForPromise ->
        preview.renderMarkdown()

      runs ->
        atom.commands.dispatch preview.element, 'core:copy'

      waitsFor ->
        atom.clipboard.read() isnt "initial clipboard content"

      runs ->
        expect(atom.clipboard.read()).toBe """
         <h1>Code Block</h1>
         <pre class="editor-colors lang-javascript"><div class="line"><span class="source js"><span class="keyword control js"><span>if</span></span><span>&nbsp;a&nbsp;</span><span class="keyword operator comparison js"><span>===</span></span><span>&nbsp;</span><span class="constant numeric decimal js"><span>3</span></span><span>&nbsp;</span><span class="meta brace curly js"><span>{</span></span></span></div><div class="line"><span class="source js"><span>&nbsp;&nbsp;b&nbsp;</span><span class="keyword operator assignment js"><span>=</span></span><span>&nbsp;</span><span class="constant numeric decimal js"><span>5</span></span></span></div><div class="line"><span class="source js"><span class="meta brace curly js"><span>}</span></span></span></div></pre>
         <p>encoding \u2192 issue</p>
        """

  describe "when maths rendering is enabled by default", ->
    it "notifies the user MathJax is loading when first preview is opened", ->
      [workspaceElement] = []

      preview.destroy()

      waitsForPromise -> atom.packages.activatePackage('notifications')

      runs ->
        workspaceElement = atom.views.getView(atom.workspace)
        jasmine.attachToDOM(workspaceElement)

      waitsForPromise -> atom.workspace.open(filePath)

      runs ->
        mathjaxHelper.resetMathJax()
        atom.config.set 'markdown-preview-plus.enableLatexRenderingByDefault', true
        atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'

      expectPreviewInSplitPane()

      waitsFor "notification", ->
        workspaceElement.querySelector 'atom-notification'

      runs ->
        notification = workspaceElement.querySelector 'atom-notification.info'
        expect(notification).toExist()
