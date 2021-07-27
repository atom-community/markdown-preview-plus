import { scopeForFenceName } from './extension-helper'
import { TextBuffer } from 'atom'
import type { LanguageMode } from './types/atom-extra'
import { atomConfig } from './util'
import { hightlightLines } from 'atom-highlight'

export async function highlightCodeBlocks(
  domFragment: Document,
  defaultLanguage: string,
) {
  const highlighter = atom.config.get(
    'markdown-preview-plus.previewConfig.highlighter',
  )
  // tslint:disable-next-line: totality-check
  if (highlighter === 'none') return domFragment
  const fontFamily = atom.config.get('editor.fontFamily')
  if (fontFamily) {
    for (const codeElement of Array.from(
      domFragment.querySelectorAll('code'),
    )) {
      codeElement.style.fontFamily = fontFamily
    }
  }

  const ctw = atomConfig().codeTabWidth || atom.config.get('editor.tabLength')

  await Promise.all(
    Array.from(domFragment.querySelectorAll('pre')).map(async (preElement) => {
      const codeBlock =
        preElement.firstElementChild !== null
          ? preElement.firstElementChild
          : preElement
      const cbClass =
        codeBlock.className && preElement.className
          ? preElement.className
          : codeBlock.className || preElement.className
      const [fenceName, ...extra] = cbClass
        ? cbClass.replace(/^(lang-|sourceCode )/, '').split(' ')
        : [defaultLanguage]
      preElement.style.tabSize = ctw.toString()

      const yielder = await eventLoopYielder(100, 5000)
      const sourceCode = codeBlock.textContent!.replace(/\r?\n$/, '')
      if (highlighter === 'legacy') {
        preElement.innerHTML = await highlightLegacy(
          sourceCode,
          fenceName,
          yielder,
        )
      } else if (highlighter === 'tree-sitter-compatible') {
        preElement.innerHTML = await highlightTreeSitter(
          sourceCode,
          fenceName,
          codeBlock.innerHTML,
          yielder,
        )
      }
      preElement.classList.add('editor-colors')
      if (fenceName) preElement.classList.add(`lang-${fenceName}`)
      if (extra.length > 0) preElement.classList.add(...extra)
    }),
  )

  return domFragment
}

async function highlightLegacy(
  sourceCode: string,
  fenceName: string,
  yielder: () => Promise<void>,
) {
  const lines = hightlightLines(
    sourceCode.split('\n'),
    scopeForFenceName(fenceName),
    'text.plain.null-grammar',
  )
  const linesArr = []
  let line = lines.next()
  while (!line.done) {
    linesArr.push(line.value)
    try {
      await yielder()
    } catch (e) {
      console.error(e)
      break
    }
    line = lines.next()
  }
  return linesArr.join('\n')
}

async function highlightTreeSitter(
  sourceCode: string,
  fenceName: string,
  fallback: string,
  yielder: () => Promise<void>,
) {
  const buf = new TextBuffer()
  try {
    const grammar = atom.grammars.grammarForId(scopeForFenceName(fenceName))
    const lm = atom.grammars.languageModeForGrammarAndBuffer(grammar, buf)
    buf.setLanguageMode(lm)
    buf.setText(sourceCode)
    const end = buf.getEndPosition()
    if (lm.startTokenizing) lm.startTokenizing()
    await tokenized(lm)
    const iter = lm.buildHighlightIterator()
    if (iter.getOpenScopeIds && iter.getCloseScopeIds) {
      let pos = { row: 0, column: 0 }
      iter.seek(pos)
      const res = []
      while (
        pos.row < end.row ||
        (pos.row === end.row && pos.column <= end.column)
      ) {
        res.push(
          ...iter.getCloseScopeIds().map((_) => `</span>`),
          ...iter
            .getOpenScopeIds()
            .map((x) => `<span class="${lm.classNameForScopeId(x)}">`),
        )
        try {
          iter.moveToSuccessor()
        } catch (e) {
          console.error(e)
          const err = e as Error
          atom.notifications.addFatalError('Internal error in highlighter', {
            dismissable: true,
            stack: err.stack,
            description: `${err.message}. You're currently using tree-view-compatible highlighter, you may try
    switching to legacy highlighter instead.`,
            detail: err.toString(),
          })
          break
        }
        const nextPos = iter.getPosition()
        res.push(escapeHTML(buf.getTextInRange([pos, nextPos])))
        try {
          await yielder()
        } catch (e) {
          console.error(e)
          break
        }
        pos = nextPos
      }
      return res.join('')
    } else {
      return fallback
    }
  } finally {
    buf.destroy()
  }
}

async function tokenized(lm: LanguageMode) {
  return new Promise<void>((resolve) => {
    if (lm.fullyTokenized || lm.tree) {
      resolve()
    } else if (lm.onDidTokenize) {
      const disp = lm.onDidTokenize(() => {
        disp.dispose()
        resolve()
      })
    } else {
      resolve() // null language mode
    }
  })
}

async function eventLoopYielder(delayMs: number, maxTimeMs: number) {
  await new Promise(setImmediate)
  const started = performance.now()
  let lastYield = started
  let now = lastYield
  return async function () {
    now = performance.now()
    if (now - lastYield > delayMs) {
      await new Promise(setImmediate)
      lastYield = now
    }
    if (now - started > maxTimeMs) {
      const err = new Error('Max time reached')
      let description = `The highlighter took too long to complete and was terminated.
Some code blocks may be incomplete.`
      if (
        atom.config.get('markdown-preview-plus.previewConfig.highlighter') ===
        'tree-sitter-compatible'
      ) {
        description += ` You're currently using tree-view-compatible highlighter, you may try
switching to legacy highlighter instead.`
      }
      atom.notifications.addError(
        'Markdown-Preview-Plus: Highlighter took more than 5 seconds to complete',
        {
          dismissable: true,
          description,
          stack: err.stack,
        },
      )
      throw err
    }
  }
}

function escapeHTML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
