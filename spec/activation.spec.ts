import { expect } from 'chai'
import { activateMe } from './util'

describe('Markdown preview plus package activation', function() {
  beforeEach(function() {
    expect(atom.packages.isPackageActive('markdown-preview-plus')).to.be.false
  })
  afterEach(async function() {
    await atom.packages.deactivatePackage('markdown-preview-plus')
  })

  it('activates', async function() {
    await activateMe()
    expect(atom.packages.isPackageActive('markdown-preview-plus')).to.be.true
  })

  it('disables markdown-preview package', async function() {
    atom.packages.enablePackage('markdown-preview')
    await activateMe()
    expect(atom.packages.isPackageDisabled('markdown-preview')).to.be.true
  })

  it('deactivates markdown-preview package', async function() {
    await atom.packages.activatePackage('markdown-preview')
    await activateMe()
    expect(atom.packages.isPackageActive('markdown-preview')).to.be.false
  })

  describe('notifications', function() {
    before(async () => atom.packages.activatePackage('notifications'))
    after(async () => atom.packages.deactivatePackage('notifications'))

    it('notifies about deactivation', async function() {
      await atom.packages.activatePackage('markdown-preview')
      await activateMe()
      expect(
        atom.views
          .getView(atom.workspace)
          .querySelector('atom-notification.info'),
      ).to.exist
    })
  })
})
