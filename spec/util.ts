// tslint:disable: no-unsafe-any
import { use, expect } from 'chai'
import sinonChai from 'sinon-chai'
import { MarkdownPreviewView } from '../src/markdown-preview-view'

use(sinonChai)

declare global {
  namespace Chai {
    interface Assertion {
      startsWith(prefix: string, message?: string): Assertion
      startWith(prefix: string, message?: string): Assertion
    }
  }
}

use(function (chai: any) {
  const startsWithMethodWrapper = function (this: any, expected: string) {
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

export const waitsFor = async function <T>(
  func: () => T | undefined | null | Promise<T | undefined | null>,
  timeout: number = 8000,
  intervalTime: number = 500,
  msg: string = func.toString(),
): Promise<T> {
  return new Promise<T>(function (fufill, reject) {
    const interval = setInterval(async function () {
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

    const timeoutId = setTimeout(function () {
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
  preview.element.style.width = '100vw'
  preview.element.style.height = '10vh'
  await preview.initialRenderPromise()

  expect(preview.type).to.be.equal('editor')
  expect(preview.getPath()).to.equal(
    atom.workspace.getActiveTextEditor()!.getPath(),
  )

  await preview.initialRenderPromise()
  return preview
}

export async function previewText(preview: MarkdownPreviewView) {
  return preview.runJS<string>(
    `document.querySelector('body > div.update-preview').innerText`,
  )
}

export async function previewHTML(preview: MarkdownPreviewView) {
  return preview.runJS<string>(
    `document.querySelector('body > div.update-preview').innerHTML`,
  )
}

export async function previewHeadHTML(preview: MarkdownPreviewView) {
  return preview.runJS<string>(
    `document.querySelector('head > original-elements').innerHTML`,
  )
}

export async function previewFragment(
  preview: MarkdownPreviewView,
  func = previewHTML,
) {
  const html = await func(preview)
  const dom = new DOMParser()
  return dom.parseFromString(html, 'text/html')
}

declare module 'atom' {
  interface PackageManager {
    loadPackage(path: string): Package
  }
}

import * as path from 'path'
import { Package } from 'atom'
export async function activateMe(): Promise<Package> {
  const pkg = atom.packages.loadPackage(path.join(__dirname, '..'))
  // TODO: Hack to work around Atom issue with fsevents
  pkg.isCompatible = () => true
  return atom.packages.activatePackage(pkg.name)
}

import sinon from 'sinon'
export function stubClipboard() {
  const result = {
    stub: sinon.stub().callsFake(function (arg: { text?: string } | string) {
      if (typeof arg === 'string') {
        result.contents = arg
      } else {
        result.contents = arg.text || ''
      }
    }),
    contents: '',
  }
  before(function () {
    window['markdown-preview-plus-tests'] = { clipboardWrite: result.stub }
  })
  after(function () {
    delete window['markdown-preview-plus-tests']
  })
  afterEach(function () {
    result.contents = ''
    result.stub.resetHistory()
  })
  return result
}

export type InferredSinonSpy<Callable> = Callable extends (
  ...args: infer TArgs
) => infer TReturnValue
  ? sinon.SinonSpy<TArgs, TReturnValue>
  : sinon.SinonSpy

export function sinonPrivateSpy<T>(t: object, k: string) {
  return sinon.spy<any, any>(t, k) as InferredSinonSpy<T>
}

import * as fs from 'fs'
export type WithFileType = {
  <R>(fp: string, cb: (path: string) => R): R extends Promise<any>
    ? Promise<void>
    : void
  <R>(fp: string, c: string, cb: (path: string) => R): R extends Promise<any>
    ? Promise<void>
    : void
}
export function withFileGen(tempPath: string): WithFileType {
  return function (
    filePath: string,
    contentsOrCallback: string | ((path: string) => unknown | Promise<unknown>),
    callback?: (path: string) => unknown | Promise<unknown>,
  ) {
    let contents: string = ''
    if (callback === undefined) {
      callback = contentsOrCallback as (
        path: string,
      ) => unknown | Promise<unknown>
    } else {
      contents = contentsOrCallback as string
    }
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(tempPath, filePath)
    fs.writeFileSync(fullPath, contents)
    const res = callback(fullPath)
    if (isPromise(res)) {
      return res
        .then(() => {
          fs.unlinkSync(fullPath)
        })
        .catch((e: Error) => {
          fs.unlinkSync(fullPath)
          throw e
        })
    } else {
      fs.unlinkSync(fullPath)
      return undefined
    }
  }
}
function isPromise(x: any): x is Promise<unknown> {
  return (
    typeof x === 'object' &&
    x !== null &&
    'then' in x &&
    typeof x.then === 'function'
  )
}
