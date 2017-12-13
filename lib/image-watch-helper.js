const fs = require('fs-plus');
const _ = require('lodash');
const path = require('path');
const pathWatcherPath = path.join(atom.packages.resourcePath, '/node_modules/pathwatcher/lib/main');
const pathWatcher = require(pathWatcherPath);

let imageRegister = {};

let MarkdownPreviewView = null; // Defer until used
const isMarkdownPreviewView = function(object) {
  if (MarkdownPreviewView == null) { MarkdownPreviewView = require('./markdown-preview-view'); }
  return object instanceof MarkdownPreviewView;
};

const refreshImages = _.debounce((function(src) {
  if (atom.workspace != null) {
    for (let item of atom.workspace.getPaneItems()) {
      if (isMarkdownPreviewView(item)) {
        // TODO: check against imageRegister[src].version.files
        item.refreshImages(src);
      }
    }
  }
  }), 250);

const srcClosure = src =>
  function(event, path) {
    if ((event === 'change') && fs.isFileSync(src)) {
      imageRegister[src].version = Date.now();
    } else {
      imageRegister[src].watcher.close();
      delete imageRegister[src];
    }
    refreshImages(src);
  }
;

module.exports = {
  removeFile(file) {
    imageRegister = _.mapValues(imageRegister, function(image) {
      image.files = _.without(image.files, file);
      image.files = _.filter(image.files, fs.isFileSync);
      if (_.isEmpty(image.files)) {
        image.watched = false;
        image.watcher.close();
      }
      return image;
    });
  },

  getVersion(image, file) {
    let version;
    const i = _.get(imageRegister, image, {});
    if (_.isEmpty(i)) {
      if (fs.isFileSync(image)) {
        version = Date.now();
        imageRegister[image] = {
          path: image,
          watched: true,
          files: [file],
          version,
          watcher: pathWatcher.watch(image, srcClosure(image))
        };
        return version;
      } else {
        return false;
      }
    }

    const files = _.get(i, 'files');
    if (!_.includes(files, file)) {
      imageRegister[image].files.push(file);
    }

    version = _.get(i, 'version');
    if (!version && fs.isFileSync(image)) {
      version = Date.now();
      imageRegister[image].version = version;
    }
    return version;
  }
};
