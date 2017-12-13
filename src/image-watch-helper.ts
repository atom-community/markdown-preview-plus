import fs = require('fs-plus');
import _ = require('lodash');
import path = require('path');
import { isMarkdownPreviewView } from './cast';
const pathWatcherPath = path.join(atom.packages.resourcePath, '/node_modules/pathwatcher/lib/main');
const pathWatcher = require(pathWatcherPath);

let imageRegister = {};

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

function srcClosure(src: string) {
  return function(event: string, _path: string) {
    if ((event === 'change') && fs.isFileSync(src)) {
      imageRegister[src].version = Date.now();
    } else {
      imageRegister[src].watcher.close();
      delete imageRegister[src];
    }
    refreshImages(src);
  }
}


export function removeFile(file: string) {
  imageRegister = _.mapValues(imageRegister, function(image) {
    image.files = _.without(image.files, file);
    image.files = _.filter(image.files, fs.isFileSync);
    if (_.isEmpty(image.files)) {
      image.watched = false;
      image.watcher.close();
    }
    return image;
  });
}

export function getVersion(image: string, file: string) {
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
