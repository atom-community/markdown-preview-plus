let useTranspiler = false
try {
  useTranspiler = atom.inDevMode() && !!require.resolve('atom-ts-transpiler')
} catch (ex) {}

if (useTranspiler) {
  console.log('Running markdown-preview-plus in dev-mode')
  module.exports = require('./src/main.ts')
} else {
  module.exports = require('./dist/main.js')
}
