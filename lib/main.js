/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const url = require('url');
const fs = require('fs-plus');

let MarkdownPreviewView = null;
let renderer = null;
let mathjaxHelper = null;

const isMarkdownPreviewView = function(object) {
  if (MarkdownPreviewView == null) { MarkdownPreviewView = require('./markdown-preview-view'); }
  return object instanceof MarkdownPreviewView;
};

module.exports = {
  config: {
    breakOnSingleNewline: {
      type: 'boolean',
      default: false,
      order: 0
    },
    liveUpdate: {
      type: 'boolean',
      default: true,
      order: 10
    },
    openPreviewInSplitPane: {
      type: 'boolean',
      default: true,
      order: 20
    },
    previewSplitPaneDir: {
      title: 'Direction to load the preview in split pane',
      type: 'string',
      default: 'right',
      enum: ['down', 'right'],
      order: 25
    },
    grammars: {
      type: 'array',
      default: [
        'source.gfm',
        'source.litcoffee',
        'text.html.basic',
        'text.md',
        'text.plain',
        'text.plain.null-grammar'
      ],
      order: 30
    },
    enableLatexRenderingByDefault: {
      title: 'Enable Math Rendering By Default',
      type: 'boolean',
      default: false,
      order: 40
    },
    useLazyHeaders: {
      title: 'Use Lazy Headers',
      description: 'Require no space after headings #',
      type: 'boolean',
      default: true,
      order: 45
    },
    useGitHubStyle: {
      title: 'Use GitHub.com style',
      type: 'boolean',
      default: false,
      order: 50
    },
    enablePandoc: {
      type: 'boolean',
      default: false,
      title: 'Enable Pandoc Parser',
      order: 100
    },
    useNativePandocCodeStyles: {
      type: 'boolean',
      default: false,
      description: `\
Don't convert fenced code blocks to Atom editors when using
Pandoc parser`,
      order: 105
    },
    pandocPath: {
      type: 'string',
      default: 'pandoc',
      title: 'Pandoc Options: Path',
      description: 'Please specify the correct path to your pandoc executable',
      dependencies: ['enablePandoc'],
      order: 110
    },
    pandocFilters: {
      type: 'array',
      default: [],
      title: 'Pandoc Options: Filters',
      description: 'Comma separated pandoc filters, in order of application. Will be passed via command-line arguments',
      dependencies: ['enablePandoc'],
      order: 115
    },
    pandocArguments: {
      type: 'array',
      default: [],
      title: 'Pandoc Options: Commandline Arguments',
      description: 'Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.',
      dependencies: ['enablePandoc'],
      order: 120
    },
    pandocMarkdownFlavor: {
      type: 'string',
      default: 'markdown-raw_tex+tex_math_single_backslash',
      title: 'Pandoc Options: Markdown Flavor',
      description: 'Enter the pandoc markdown flavor you want',
      dependencies: ['enablePandoc'],
      order: 130
    },
    pandocBibliography: {
      type: 'boolean',
      default: false,
      title: 'Pandoc Options: Citations',
      description: `\
Enable this for bibliography parsing.
Note: pandoc-citeproc is applied after other filters specified in
Filters, but before other commandline arguments\
`,
      dependencies: ['enablePandoc'],
      order: 140
    },
    pandocRemoveReferences: {
      type: 'boolean',
      default: true,
      title: 'Pandoc Options: Remove References',
      description: 'Removes references at the end of the HTML preview',
      dependencies: ['pandocBibliography'],
      order: 150
    },
    pandocBIBFile: {
      type: 'string',
      default: 'bibliography.bib',
      title: 'Pandoc Options: Bibliography (bibfile)',
      description: 'Name of bibfile to search for recursively',
      dependencies: ['pandocBibliography'],
      order: 160
    },
    pandocBIBFileFallback: {
      type: 'string',
      default: '',
      title: 'Pandoc Options: Fallback Bibliography (bibfile)',
      description: 'Full path to fallback bibfile',
      dependencies: ['pandocBibliography'],
      order: 165
    },
    pandocCSLFile: {
      type: 'string',
      default: 'custom.csl',
      title: 'Pandoc Options: Bibliography Style (cslfile)',
      description: 'Name of cslfile to search for recursively',
      dependencies: ['pandocBibliography'],
      order: 170
    },
    pandocCSLFileFallback: {
      type: 'string',
      default: '',
      title: 'Pandoc Options: Fallback Bibliography Style (cslfile)',
      description: 'Full path to fallback cslfile',
      dependencies: ['pandocBibliography'],
      order: 175
    }
  },


  activate() {
    if (parseFloat(atom.getVersion()) < 1.7) {
      atom.deserializers.add({
        name: 'MarkdownPreviewView',
        deserialize: module.exports.createMarkdownPreviewView.bind(module.exports)
      });
    }

    atom.commands.add('atom-workspace', {
      'markdown-preview-plus:toggle': () => {
        return this.toggle();
      },
      'markdown-preview-plus:copy-html': () => {
        return this.copyHtml();
      },
      'markdown-preview-plus:toggle-break-on-single-newline'() {
        const keyPath = 'markdown-preview-plus.breakOnSingleNewline';
        return atom.config.set(keyPath, !atom.config.get(keyPath));
      }
    }
    );

    const previewFile = this.previewFile.bind(this);
    atom.commands.add('.tree-view .file .name[data-name$=\\.markdown]', 'markdown-preview-plus:preview-file', previewFile);
    atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'markdown-preview-plus:preview-file', previewFile);
    atom.commands.add('.tree-view .file .name[data-name$=\\.mdown]', 'markdown-preview-plus:preview-file', previewFile);
    atom.commands.add('.tree-view .file .name[data-name$=\\.mkd]', 'markdown-preview-plus:preview-file', previewFile);
    atom.commands.add('.tree-view .file .name[data-name$=\\.mkdown]', 'markdown-preview-plus:preview-file', previewFile);
    atom.commands.add('.tree-view .file .name[data-name$=\\.ron]', 'markdown-preview-plus:preview-file', previewFile);
    atom.commands.add('.tree-view .file .name[data-name$=\\.txt]', 'markdown-preview-plus:preview-file', previewFile);

    return atom.workspace.addOpener(uriToOpen => {
      let error, host, pathname, protocol;
      try {
        ({protocol, host, pathname} = url.parse(uriToOpen));
      } catch (error1) {
        error = error1;
        return;
      }

      if (protocol !== 'markdown-preview-plus:') { return; }

      try {
        if (pathname) { pathname = decodeURI(pathname); }
      } catch (error2) {
        error = error2;
        return;
      }

      if (host === 'editor') {
        return this.createMarkdownPreviewView({editorId: pathname.substring(1)});
      } else {
        return this.createMarkdownPreviewView({filePath: pathname});
      }
    });
  },

  createMarkdownPreviewView(state) {
    if (state.editorId || fs.isFileSync(state.filePath)) {
      if (MarkdownPreviewView == null) { MarkdownPreviewView = require('./markdown-preview-view'); }
      return new MarkdownPreviewView(state);
    }
  },

  toggle() {
    let left, needle;
    if (isMarkdownPreviewView(atom.workspace.getActivePaneItem())) {
      atom.workspace.destroyActivePaneItem();
      return;
    }

    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) { return; }

    const grammars = (left = atom.config.get('markdown-preview-plus.grammars')) != null ? left : [];
    if ((needle = editor.getGrammar().scopeName, !Array.from(grammars).includes(needle))) { return; }

    if (!this.removePreviewForEditor(editor)) { return this.addPreviewForEditor(editor); }
  },

  uriForEditor(editor) {
    return `markdown-preview-plus://editor/${editor.id}`;
  },

  removePreviewForEditor(editor) {
    const uri = this.uriForEditor(editor);
    const previewPane = atom.workspace.paneForURI(uri);
    if (previewPane != null) {
      const preview = previewPane.itemForURI(uri);
      if (preview !== previewPane.getActiveItem()) {
        previewPane.activateItem(preview);
        return false;
      }
      previewPane.destroyItem(preview);
      return true;
    } else {
      return false;
    }
  },

  addPreviewForEditor(editor) {
    const uri = this.uriForEditor(editor);
    const previousActivePane = atom.workspace.getActivePane();
    const options =
      {searchAllPanes: true};
    if (atom.config.get('markdown-preview-plus.openPreviewInSplitPane')) {
      options.split = atom.config.get('markdown-preview-plus.previewSplitPaneDir');
    }
    return atom.workspace.open(uri, options).then(function(markdownPreviewView) {
      if (isMarkdownPreviewView(markdownPreviewView)) {
        return previousActivePane.activate();
      }
    });
  },

  previewFile({target}) {
    const filePath = target.dataset.path;
    if (!filePath) { return; }

    for (let editor of Array.from(atom.workspace.getTextEditors())) {
      if (editor.getPath() === filePath) {
        this.addPreviewForEditor(editor);
        return;
      }
    }

    return atom.workspace.open(`markdown-preview-plus://${encodeURI(filePath)}`, {searchAllPanes: true});
  },

  copyHtml(callback, scaleMath) {
    if (callback == null) { callback = atom.clipboard.write.bind(atom.clipboard); }
    if (scaleMath == null) { scaleMath = 100; }
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) { return; }

    if (renderer == null) { renderer = require('./renderer'); }
    const text = editor.getSelectedText() || editor.getText();
    const renderLaTeX = atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
    return renderer.toHTML(text, editor.getPath(), editor.getGrammar(), renderLaTeX, true, function(error, html) {
      if (error) {
        return console.warn('Copying Markdown as HTML failed', error);
      } else if (renderLaTeX) {
        if (mathjaxHelper == null) { mathjaxHelper = require('./mathjax-helper'); }
        return mathjaxHelper.processHTMLString(html, function(proHTML) {
          proHTML = proHTML.replace(/MathJax\_SVG.*?font\-size\: 100%/g, match => match.replace(/font\-size\: 100%/, `font-size: ${scaleMath}%`));
          return callback(proHTML);
        });
      } else {
        return callback(html);
      }
    });
  }
};
