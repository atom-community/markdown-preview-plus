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

export interface WaitsFor {
  <T>(
    func: () => T | undefined,
    timeout?: number,
    intervalTime?: number,
    msg?: string,
  ): Promise<T>
  msg<T>(
    msg: string,
    func: () => T | undefined,
    timeout?: number,
    intervalTime?: number,
  ): Promise<T>
}

export const waitsFor = async function<T>(
  func: () => T | undefined,
  timeout = 8000,
  intervalTime = 10,
  msg: string = func.toString(),
): Promise<T> {
  return new Promise<T>(function(fufill, reject) {
    const interval = setInterval(function() {
      try {
        const res = func()
        if (res) {
          clearTimeout(timeout)
          clearInterval(interval)
          fufill(res)
        }
      } catch (e) {
        reject(e)
      }
    }, intervalTime)

    setTimeout(function() {
      clearInterval(interval)
      reject(new Error('Waits for condition never met: ' + msg))
    }, timeout)
  })
} as WaitsFor

waitsFor.msg = async (msg, f, t, i) => waitsFor(f, t, i, msg)

export async function expectPreviewInSplitPane() {
  await waitsFor(() => atom.workspace.getCenter().getPanes().length === 2)

  const preview = await waitsFor.msg('markdown preview to be created', () => {
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
