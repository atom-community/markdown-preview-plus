import highlight = require('atom-highlight')
import { scopeForFenceName } from '../lib/extension-helper'

export function highlightCodeBlocks(
  domFragment: Element,
  defaultLanguage: string = 'text',
  fontFamily: string = '',
) {
  if (fontFamily) {
    for (const codeElement of Array.from(
      domFragment.querySelectorAll('code'),
    )) {
      codeElement.style.fontFamily = fontFamily
    }
  }

  for (const preElement of Array.from(domFragment.querySelectorAll('pre'))) {
    const codeBlock =
      preElement.firstElementChild !== null
        ? preElement.firstElementChild
        : preElement
    const cbClass = codeBlock.className
    const fenceName = cbClass
      ? cbClass.replace(/^(lang-|sourceCode )/, '')
      : defaultLanguage

    preElement.outerHTML = highlight({
      fileContents: codeBlock.textContent!.replace(/\n$/, ''),
      scopeName: scopeForFenceName(fenceName),
      nbsp: false,
      lineDivs: true,
      editorDiv: true,
      editorDivTag: 'atom-text-editor',
      // The `editor` class messes things up as `.editor` has absolutely positioned lines
      editorDivClass: fenceName ? `lang-${fenceName}` : '',
    })
  }

  return domFragment
}
