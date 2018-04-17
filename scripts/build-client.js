const Bundler = require('parcel-bundler')
const fs = require('fs')
const path = require('path')

let bundler = new Bundler('src-client/template.html', {
  target: 'node',
  outDir: 'client',
  publicURL: '.',
  watch: false,
  production: true,
  contentHash: false,
})
const out = path.join(__dirname, '..', 'client')
if (fs.existsSync(out)) {
  fs.readdirSync(out).forEach(function(f) {
    fs.unlinkSync(path.join(out, f))
  })
}
bundler.bundle()
