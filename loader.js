if (atom.inDevMode() && require.resolve('atom-ts-transpiler')) {
  console.log('Running markdown-preview-plus in dev-mode')
  module.exports = require('./src/main.ts')
} else {
  module.exports = require('./dist/main.js')
}
