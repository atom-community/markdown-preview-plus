if (atom.inDevMode() || atom.inSpecMode()) {
  module.exports = require('./src/main.ts')
} else {
  module.exports = require('./dist/main.js')
}
