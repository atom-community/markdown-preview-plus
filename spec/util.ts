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
    func: () => T | undefined | null | Promise<T | undefined | null>,
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
  func: () => T | undefined | null | Promise<T | undefined | null>,
  timeout = 8000,
  intervalTime = 500,
  msg: string = func.toString(),
): Promise<T> {
  return new Promise<T>(function(fufill, reject) {
    const interval = setInterval(async function() {
      try {
        const res = await func()
        if (res) {
          clearTimeout(timeoutId)
          clearInterval(interval)
          fufill(res)
        }
      } catch (e) {
        reject(e)
      }
    }, intervalTime)

    const timeoutId = setTimeout(function() {
      clearInterval(interval)
      reject(new Error('Waits for condition never met: ' + msg))
    }, timeout)
  })
} as WaitsFor

waitsFor.msg = async (msg, f, t, i) => waitsFor(f, t, i, msg)

export async function expectPreviewInSplitPane() {
  await waitsFor(() => atom.workspace.getCenter().getPanes().length === 2)

  const preview = atom.workspace
    .getCenter()
    .getPanes()[1]
    .getActiveItem() as MarkdownPreviewView
  await preview.renderPromise

  expect(preview.constructor.name).to.be.equal('MarkdownPreviewViewEditor')
  expect(preview.getPath()).to.equal(
    atom.workspace.getActiveTextEditor()!.getPath(),
  )

  await preview.renderPromise
  return preview
}

export async function previewText(preview: MarkdownPreviewView) {
  return preview.runJS<string>(
    `document.querySelector('markdown-preview-plus-view > div').innerText`,
  )
}

export async function previewHTML(preview: MarkdownPreviewView) {
  return preview.runJS<string>(
    `document.querySelector('markdown-preview-plus-view > div').innerHTML`,
  )
}

export async function previewFragment(preview: MarkdownPreviewView) {
  const html = await previewHTML(preview)
  const dom = new DOMParser()
  return dom.parseFromString(html, 'text/html')
}
