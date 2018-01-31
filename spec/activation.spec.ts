import * as path from 'path'
import { expect } from 'chai'

describe('Markdown preview plus package activation', function() {
  afterEach(async function() {
    await atom.packages.deactivatePackage('markdown-preview-plus')
  })

  it('activates', async function() {
    await atom.packages.activatePackage(path.join(__dirname, '..'))
    expect(atom.packages.isPackageActive('markdown-preview-plus')).to.be.true
  })

  it('deactivates markdown-preview package', async function() {
    await atom.packages.activatePackage('markdown-preview')
    await atom.packages.activatePackage(path.join(__dirname, '..'))
    expect(atom.packages.isPackageActive('markdown-preview-plus')).to.be.true
    expect(atom.packages.isPackageActive('markdown-preview')).to.be.false
  })

  describe('notifications', function() {
    before(async () => atom.packages.activatePackage('notifications'))
    after(async () => atom.packages.deactivatePackage('notifications'))

    it('notifies about deactivation', async function() {
      await atom.packages.activatePackage('markdown-preview')
      await atom.packages.activatePackage(path.join(__dirname, '..'))
      expect(
        atom.views
          .getView(atom.workspace)
          .querySelector('atom-notification.info'),
      ).to.exist
    })
  })
})
