if (
  window.location.hash === '#dev' &&
  require.resolve('typescript') &&
  require.resolve('pirates')
) {
  console.log('Running markdown-preview-plus in dev-mode')
  const addHook = require('pirates').addHook
  const ts = require('typescript')
  const path = require('path')
  const pp = path.dirname(__dirname)

  addHook(
    function (code, filename) {
      const configFileName = ts.findConfigFile(
        path.dirname(filename),
        ts.sys.fileExists,
        'tsconfig.json',
      )
      const configFile = ts.readConfigFile(configFileName, ts.sys.readFile)
      const compilerOptions = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        path.dirname(configFileName),
      )
      return ts.transpileModule(code, {
        compilerOptions: {
          ...compilerOptions.options,
          module: 'commonjs',
          target: 'es2019',
        },
      }).outputText
    },
    {
      exts: ['.ts'],
      function(filename) {
        return filename.startsWith(pp)
      },
    },
  )
  module.exports = require('../src-client/main.ts')
} else {
  module.exports = require('./main.js')
}
