path = require 'path'
fs = require 'fs-plus'
temp = require 'temp'
wrench = require 'wrench'
MarkdownPreviewView = require '../lib/markdown-preview-view'
{$} = require 'atom-space-pen-views'

require './spec-helper'

describe "Markdown preview plus package", ->
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

    waitsForPromise ->
      atom.packages.activatePackage('language-gfm')

  afterEach ->
    if preview instanceof MarkdownPreviewView
      preview.destroy()
    preview = null

  expectPreviewInSplitPane = ->
    runs ->
      expect(atom.workspace.getPanes()).toHaveLength 2

    waitsFor "markdown preview to be created", ->
      preview = atom.workspace.getPanes()[1].getActiveItem()

    runs ->
      expect(preview).toBeInstanceOf(MarkdownPreviewView)
      expect(preview.getPath()).toBe atom.workspace.getActivePaneItem().getPath()

  describe "when a preview has not been created for the file", ->
    it "displays a markdown preview in a split pane", ->
      waitsForPromise -> atom.workspace.open("subdir/file.markdown")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expectPreviewInSplitPane()

      runs ->
        [editorPane] = atom.workspace.getPanes()
        expect(editorPane.getItems()).toHaveLength 1
        expect(editorPane.isActive()).toBe true

    describe "when the editor's path does not exist", ->
      it "splits the current pane to the right with a markdown preview for the file", ->
        waitsForPromise -> atom.workspace.open("new.markdown")
        runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expectPreviewInSplitPane()

    describe "when the editor does not have a path", ->
      it "splits the current pane to the right with a markdown preview for the file", ->
        waitsForPromise -> atom.workspace.open("")
        runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expectPreviewInSplitPane()

    # https://github.com/atom/markdown-preview/issues/28
    describe "when the path contains a space", ->
      it "renders the preview", ->
        waitsForPromise -> atom.workspace.open("subdir/file with space.md")
        runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expectPreviewInSplitPane()

    # https://github.com/atom/markdown-preview/issues/29
    describe "when the path contains accented characters", ->
      it "renders the preview", ->
        waitsForPromise -> atom.workspace.open("subdir/áccéntéd.md")
        runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expectPreviewInSplitPane()

  describe "when a preview has been created for the file", ->
    beforeEach ->
      waitsForPromise -> atom.workspace.open("subdir/file.markdown")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expectPreviewInSplitPane()

    it "closes the existing preview when toggle is triggered a second time on the editor and when the preview is its panes active item", ->
      atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'

      [editorPane, previewPane] = atom.workspace.getPanes()
      expect(editorPane.isActive()).toBe true
      expect(previewPane.getActiveItem()).toBeUndefined()

    it "activates the existing preview when toggle is triggered a second time on the editor and when the preview is not its panes active item #nottravis", ->
      [editorPane, previewPane] = atom.workspace.getPanes()

      editorPane.activate()
      waitsForPromise -> atom.workspace.open("subdir/simple.md")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'

      waitsFor "second markdown preview to be created", ->
        previewPane.getItems().length is 2

      waitsFor "second markdown preview to be activated", ->
        previewPane.getActiveItemIndex() is 1

      runs ->
        preview = previewPane.getActiveItem()
        expect(preview).toBeInstanceOf(MarkdownPreviewView)
        expect(preview.getPath()).toBe editorPane.getActiveItem().getPath()
        expect(preview.getPath()).toBe atom.workspace.getActivePaneItem().getPath()

        editorPane.activate()
        editorPane.activateItemAtIndex(0)

        atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'

      waitsFor "first preview to be activated", ->
        previewPane.getActiveItemIndex() is 0

      runs ->
        preview = previewPane.getActiveItem()
        expect(previewPane.getItems().length).toBe(2)
        expect(preview.getPath()).toBe editorPane.getActiveItem().getPath()
        expect(preview.getPath()).toBe atom.workspace.getActivePaneItem().getPath()

    it "closes the existing preview when toggle is triggered on it and it has focus", ->
      [editorPane, previewPane] = atom.workspace.getPanes()
      previewPane.activate()

      atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expect(previewPane.getActiveItem()).toBeUndefined()

    describe "when the editor is modified", ->
      it "re-renders the preview", ->
        spyOn(preview, 'showLoading')

        markdownEditor = atom.workspace.getActiveTextEditor()
        markdownEditor.setText "Hey!"

        waitsFor ->
          preview.text().indexOf("Hey!") >= 0

        runs ->
          expect(preview.showLoading).not.toHaveBeenCalled()

      it "invokes ::onDidChangeMarkdown listeners", ->
        markdownEditor = atom.workspace.getActiveTextEditor()
        preview.onDidChangeMarkdown(listener = jasmine.createSpy('didChangeMarkdownListener'))

        runs ->
          markdownEditor.setText("Hey!")

        waitsFor "::onDidChangeMarkdown handler to be called", ->
          listener.callCount > 0

      describe "when the preview is in the active pane but is not the active item", ->
        it "re-renders the preview but does not make it active", ->
          markdownEditor = atom.workspace.getActiveTextEditor()
          previewPane = atom.workspace.getPanes()[1]
          previewPane.activate()

          waitsForPromise ->
            atom.workspace.open()

          runs ->
            markdownEditor.setText("Hey!")

          waitsFor ->
            preview.text().indexOf("Hey!") >= 0

          runs ->
            expect(previewPane.isActive()).toBe true
            expect(previewPane.getActiveItem()).not.toBe preview

      describe "when the preview is not the active item and not in the active pane", ->
        it "re-renders the preview and makes it active", ->
          markdownEditor = atom.workspace.getActiveTextEditor()
          [editorPane, previewPane] = atom.workspace.getPanes()
          previewPane.splitRight(copyActiveItem: true)
          previewPane.activate()

          waitsForPromise ->
            atom.workspace.open()

          runs ->
            editorPane.activate()
            markdownEditor.setText("Hey!")

          waitsFor ->
            preview.text().indexOf("Hey!") >= 0

          runs ->
            expect(editorPane.isActive()).toBe true
            expect(previewPane.getActiveItem()).toBe preview

      describe "when the liveUpdate config is set to false", ->
        it "only re-renders the markdown when the editor is saved, not when the contents are modified", ->
          atom.config.set 'markdown-preview-plus.liveUpdate', false

          didStopChangingHandler = jasmine.createSpy('didStopChangingHandler')
          atom.workspace.getActiveTextEditor().getBuffer().onDidStopChanging didStopChangingHandler
          atom.workspace.getActiveTextEditor().setText('ch ch changes')

          waitsFor ->
            didStopChangingHandler.callCount > 0

          runs ->
            expect(preview.text()).not.toContain("ch ch changes")
            atom.workspace.getActiveTextEditor().save()

          waitsFor ->
            preview.text().indexOf("ch ch changes") >= 0

    describe "when a new grammar is loaded", ->
      it "re-renders the preview", ->
        atom.workspace.getActiveTextEditor().setText """
          ```javascript
          var x = y;
          ```
        """

        waitsFor "markdown to be rendered after its text changed", ->
          preview.find("atom-text-editor").data("grammar") is "text plain null-grammar"

        grammarAdded = false
        runs ->
          atom.grammars.onDidAddGrammar -> grammarAdded = true

        waitsForPromise ->
          expect(atom.packages.isPackageActive('language-javascript')).toBe false
          atom.packages.activatePackage('language-javascript')

        waitsFor "grammar to be added", -> grammarAdded

        waitsFor "markdown to be rendered after grammar was added", ->
          preview.find("atom-text-editor").data("grammar") isnt "source js"

  describe "when the markdown preview view is requested by file URI", ->
    it "opens a preview editor and watches the file for changes", ->
      waitsForPromise "atom.workspace.open promise to be resolved", ->
        atom.workspace.open("markdown-preview-plus://#{atom.project.getDirectories()[0].resolve('subdir/file.markdown')}")

      runs ->
        preview = atom.workspace.getActivePaneItem()
        expect(preview).toBeInstanceOf(MarkdownPreviewView)

        spyOn(preview, 'renderMarkdownText')
        preview.file.emitter.emit('did-change')

      waitsFor "markdown to be re-rendered after file changed", ->
        preview.renderMarkdownText.callCount > 0

  describe "when the editor's grammar it not enabled for preview", ->
    it "does not open the markdown preview", ->
      atom.config.set('markdown-preview-plus.grammars', [])

      waitsForPromise ->
        atom.workspace.open("subdir/file.markdown")

      runs ->
        spyOn(atom.workspace, 'open').andCallThrough()
        atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
        expect(atom.workspace.open).not.toHaveBeenCalled()

  describe "when the editor's path changes on #win32 and #darwin", ->
    it "updates the preview's title", ->
      titleChangedCallback = jasmine.createSpy('titleChangedCallback')

      waitsForPromise -> atom.workspace.open("subdir/file.markdown")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'

      expectPreviewInSplitPane()

      runs ->
        expect(preview.getTitle()).toBe 'file.markdown Preview'
        preview.onDidChangeTitle(titleChangedCallback)
        filePath = atom.workspace.getActiveTextEditor().getPath()
        fs.renameSync(filePath, path.join(path.dirname(filePath), 'file2.md'))

      waitsFor ->
        preview.getTitle() is "file2.md Preview"

      runs ->
        expect(titleChangedCallback).toHaveBeenCalled()
        preview.destroy()

  describe "when the URI opened does not have a markdown-preview-plus protocol", ->
    it "does not throw an error trying to decode the URI (regression)", ->
      waitsForPromise ->
        atom.workspace.open('%')

      runs ->
        expect(atom.workspace.getActiveTextEditor()).toBeTruthy()

  describe "when markdown-preview-plus:copy-html is triggered", ->
    it "copies the HTML to the clipboard", ->
      waitsForPromise ->
        atom.workspace.open("subdir/simple.md")

      runs ->
        atom.commands.dispatch workspaceElement, 'markdown-preview-plus:copy-html'
        expect(atom.clipboard.read()).toBe """
          <p><em>italic</em></p>
          <p><strong>bold</strong></p>
          <p>encoding \u2192 issue</p>
        """

        atom.workspace.getActiveTextEditor().setSelectedBufferRange [[0, 0], [1, 0]]
        atom.commands.dispatch workspaceElement, 'markdown-preview-plus:copy-html'
        expect(atom.clipboard.read()).toBe """
          <p><em>italic</em></p>
        """

    describe "code block tokenization", ->
      preview = null

      beforeEach ->
        waitsForPromise ->
          atom.packages.activatePackage('language-ruby')

        waitsForPromise ->
          atom.packages.activatePackage('markdown-preview-plus')

        waitsForPromise ->
          atom.workspace.open("subdir/file.markdown")

        runs ->
          workspaceElement = atom.views.getView(atom.workspace)
          atom.commands.dispatch workspaceElement, 'markdown-preview-plus:copy-html'
          preview = $('<div>').append(atom.clipboard.read())

      describe "when the code block's fence name has a matching grammar", ->
        it "tokenizes the code block with the grammar", ->
          expect(preview.find("pre span.entity.name.function.ruby")).toExist()

      describe "when the code block's fence name doesn't have a matching grammar", ->
        it "does not tokenize the code block", ->
          expect(preview.find("pre.lang-kombucha .line .null-grammar").children().length).toBe 2

      describe "when the code block contains empty lines", ->
        it "doesn't remove the empty lines", ->
          expect(preview.find("pre.lang-python").children().length).toBe 6
          expect(preview.find("pre.lang-python div:nth-child(2)").text().trim()).toBe ''
          expect(preview.find("pre.lang-python div:nth-child(4)").text().trim()).toBe ''
          expect(preview.find("pre.lang-python div:nth-child(5)").text().trim()).toBe ''

      describe "when the code block is nested in a list", ->
        it "detects and styles the block", ->
          expect(preview.find("pre.lang-javascript")).toHaveClass 'editor-colors'

  describe "when main::copyHtml() is called directly", ->
    mpp = null

    beforeEach ->
      mpp = atom.packages.getActivePackage('markdown-preview-plus').mainModule

    it "copies the HTML to the clipboard by default", ->
      waitsForPromise ->
        atom.workspace.open("subdir/simple.md")

      runs ->
        mpp.copyHtml()
        expect(atom.clipboard.read()).toBe """
          <p><em>italic</em></p>
          <p><strong>bold</strong></p>
          <p>encoding \u2192 issue</p>
        """

        atom.workspace.getActiveTextEditor().setSelectedBufferRange [[0, 0], [1, 0]]
        mpp.copyHtml()
        expect(atom.clipboard.read()).toBe """
          <p><em>italic</em></p>
        """

    it "passes the HTML to a callback if supplied as the first argument", ->
      waitsForPromise ->
        atom.workspace.open("subdir/simple.md")

      runs ->
        expect(mpp.copyHtml( (html) -> html )).toBe """
          <p><em>italic</em></p>
          <p><strong>bold</strong></p>
          <p>encoding \u2192 issue</p>
        """

        atom.workspace.getActiveTextEditor().setSelectedBufferRange [[0, 0], [1, 0]]
        expect(mpp.copyHtml( (html) -> html )).toBe """
          <p><em>italic</em></p>
        """

    describe "when LaTeX rendering is enabled by default", ->
      beforeEach ->
        spyOn(atom.clipboard, 'write').andCallThrough()

        waitsFor "LaTeX rendering to be enabled", ->
          atom.config.set 'markdown-preview-plus.enableLatexRenderingByDefault', true

        waitsForPromise ->
          atom.workspace.open("subdir/simple.md")

        runs ->
          atom.workspace.getActiveTextEditor().setText '$$\\int_3^4$$'

      it "copies the HTML with maths blocks as svg's to the clipboard by default", ->
        mpp.copyHtml()

        waitsFor "atom.clipboard.write to have been called", ->
          atom.clipboard.write.callCount is 1

        runs ->
          clipboard = atom.clipboard.read()
          expect(clipboard.match(/MathJax\_SVG\_Hidden/).length).toBe(1)
          expect(clipboard.match(/class\=\"MathJax\_SVG\"/).length).toBe(1)

      it "scales the svg's if the scaleMath parameter is passed", ->
        mpp.copyHtml(null, 200)

        waitsFor "atom.clipboard.write to have been called", ->
          atom.clipboard.write.callCount is 1

        runs ->
          clipboard = atom.clipboard.read()
          expect(clipboard.match(/font\-size\: 200%/).length).toBe(1)

      it "passes the HTML to a callback if supplied as the first argument", ->
        html = null
        mpp.copyHtml (proHTML) ->
          html = proHTML

        waitsFor "markdown to be parsed and processed by MathJax", -> html?

        runs ->
          expect(html.match(/MathJax\_SVG\_Hidden/).length).toBe(1)
          expect(html.match(/class\=\"MathJax\_SVG\"/).length).toBe(1)

  describe "sanitization", ->
    it "removes script tags and attributes that commonly contain inline scripts", ->
      waitsForPromise -> atom.workspace.open("subdir/evil.md")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expectPreviewInSplitPane()

      runs ->
        expect($(preview[0]).find("div.update-preview").html()).toBe """
          <p>hello</p>


          <p>sad
          <img>
          world</p>
        """

    it "remove the first <!doctype> tag at the beginning of the file", ->
      waitsForPromise -> atom.workspace.open("subdir/doctype-tag.md")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expectPreviewInSplitPane()

      runs ->
        expect($(preview[0]).find("div.update-preview").html()).toBe """
          <p>content
          &lt;!doctype html&gt;</p>
        """

  describe "when the markdown contains an <html> tag", ->
    it "does not throw an exception", ->
      waitsForPromise -> atom.workspace.open("subdir/html-tag.md")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expectPreviewInSplitPane()

      runs -> expect($(preview[0]).find("div.update-preview").html()).toBe "content"

  describe "when the markdown contains a <pre> tag", ->
    it "does not throw an exception", ->
      waitsForPromise -> atom.workspace.open("subdir/pre-tag.md")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expectPreviewInSplitPane()

      runs -> expect(preview.find('atom-text-editor')).toExist()

  # WARNING If focus is given to this spec alone your `config.cson` may be
  # overwritten. Please ensure that you have yours backed up :D
  describe "GitHub style markdown preview", ->
    beforeEach ->
      atom.config.set 'markdown-preview-plus.useGitHubStyle', false

    it "renders markdown using the default style when GitHub styling is disabled", ->
      waitsForPromise -> atom.workspace.open("subdir/simple.md")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expectPreviewInSplitPane()

      runs -> expect(preview.element.getAttribute('data-use-github-style')).toBeNull()

    it "renders markdown using the GitHub styling when enabled", ->
      atom.config.set 'markdown-preview-plus.useGitHubStyle', true

      waitsForPromise -> atom.workspace.open("subdir/simple.md")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expectPreviewInSplitPane()

      runs -> expect(preview.element.getAttribute('data-use-github-style')).toBe ''

    it "updates the rendering style immediately when the configuration is changed", ->
      waitsForPromise -> atom.workspace.open("subdir/simple.md")
      runs -> atom.commands.dispatch workspaceElement, 'markdown-preview-plus:toggle'
      expectPreviewInSplitPane()

      runs ->
        expect(preview.element.getAttribute('data-use-github-style')).toBeNull()

        atom.config.set 'markdown-preview-plus.useGitHubStyle', true
        expect(preview.element.getAttribute('data-use-github-style')).not.toBeNull()

        atom.config.set 'markdown-preview-plus.useGitHubStyle', false
        expect(preview.element.getAttribute('data-use-github-style')).toBeNull()
