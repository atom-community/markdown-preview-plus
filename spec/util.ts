// tslint:disable: no-unsafe-any
import { use, expect } from 'chai'
import * as sinonChai from 'sinon-chai'
import { MarkdownPreviewView } from '../lib/markdown-preview-view'

use(sinonChai)

declare global {
  namespace Chai {
    interface Assertion {
      startsWith(prefix: string, message?: string): Assertion
      startWith(prefix: string, message?: string): Assertion
    }
  }
}

use(function(chai: any) {
  const startsWithMethodWrapper = function(this: any, expected: string) {
    const actual = this._obj

    return this.assert(
      actual.startsWith(expected),
      'expected ' + this._obj + ' to start with ' + expected,
      'expected ' + this._obj + ' not to start with ' + expected,
    )
  }

  chai.Assertion.addChainableMethod('startsWith', startsWithMethodWrapper)
  chai.Assertion.addChainableMethod('startWith', startsWithMethodWrapper)
})

export async function waitsFor<T>(
  msg: string,
  f: () => T | undefined,
  delay?: number,
): Promise<T>
export async function waitsFor<T>(
  f: () => T | undefined,
  delay?: number,
): Promise<T>
export async function waitsFor<T>(
  fOrMsg: string | (() => T | undefined),
  delayOrF?: (() => T | undefined) | number,
  delayM: number = 100,
) {
  const msg = typeof fOrMsg === 'string' ? fOrMsg : ''
  const fM =
    typeof fOrMsg === 'function'
      ? fOrMsg
      : typeof delayOrF === 'function' ? delayOrF : undefined
  const delay = typeof delayOrF !== 'function' ? delayOrF : delayM
  if (!fM) throw new Error('f is not defined')
  const f = fM
  return new Promise<T>(function(resolve, reject) {
    let numTries = 0
    function test() {
      try {
        numTries += 1
        if (numTries > 300) {
          return reject(new Error(`Timed out while waiting for ${msg}`))
        }
        const res = f()
        if (res) resolve(res)
        else setTimeout(test, delay)
      } catch (e) {
        reject(e)
      }
    }
    try {
      test()
    } catch (e) {
      reject(e)
    }
  })
}

export async function expectPreviewInSplitPane() {
  await waitsFor(() => atom.workspace.getCenter().getPanes().length === 2)

  const preview = await waitsFor('markdown preview to be created', () => {
    const pv = atom.workspace
      .getCenter()
      .getPanes()[1]
      .getActiveItem() as MarkdownPreviewView
    if (pv.getPath() === atom.workspace.getActiveTextEditor()!.getPath()) {
      return pv
    } else return undefined
  })

  expect(preview.constructor.name).to.be.equal('MarkdownPreviewView')
  expect(preview.getPath()).to.equal(
    atom.workspace.getActiveTextEditor()!.getPath(),
  )

  await preview.renderPromise
  return preview
}
