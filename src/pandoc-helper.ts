import _ = require('lodash')
import CP = require('child_process')
import fs = require('fs')
import path = require('path')

const atomConfig = () => atom.config.get('markdown-preview-plus')!

/**
 * Sets local mathjaxPath if available
 */
const getMathJaxPath = (function() {
  let cached: string | null = null
  return function() {
    if (cached !== null) {
      return cached
    }
    try {
      return (cached = require.resolve('MathJax'))
    } catch (e) {
      return ''
    }
  }
})()

export function findFileRecursive(
  filePath: string,
  fileName: string,
): string | false {
  const bibFile = path.join(filePath, '../', fileName)
  if (fs.existsSync(bibFile)) {
    return bibFile
  } else {
    const newPath = path.join(bibFile, '..')
    if (newPath !== filePath && !_.includes(atom.project.getPaths(), newPath)) {
      return findFileRecursive(newPath, fileName)
    } else {
      return false
    }
  }
}

export interface Args {
  from: string
  to: 'html'
  mathjax?: string
  filter: string[]
  bibliography?: string
  csl?: string
}

export function setPandocOptions(
  filePath: string | undefined,
  renderMath: boolean,
) {
  // see https://github.com/atom-community/markdown-preview-plus/issues/316
  const opts: CP.ExecFileOptions = { maxBuffer: Infinity }
  if (filePath !== undefined) {
    opts.cwd = path.dirname(filePath)
  }
  const mathjaxPath = getMathJaxPath()
  const args: Args = {
    from: atomConfig().pandocMarkdownFlavor,
    to: 'html',
    mathjax: renderMath ? mathjaxPath : undefined,
    filter: atomConfig().pandocFilters,
  }
  if (atomConfig().pandocBibliography) {
    args.filter.push('pandoc-citeproc')
    let bibFile =
      filePath && findFileRecursive(filePath, atomConfig().pandocBIBFile)
    if (!bibFile) {
      bibFile = atomConfig().pandocBIBFileFallback
    }
    args.bibliography = bibFile ? bibFile : undefined
    let cslFile =
      filePath && findFileRecursive(filePath, atomConfig().pandocCSLFile)
    if (!cslFile) {
      cslFile = atomConfig().pandocCSLFileFallback
    }
    args.csl = cslFile ? cslFile : undefined
  }
  return { args, opts }
}

/**
 * Handle error response from Pandoc
 * @param {error} Returned error
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 */
function handleError(error: string, html: string, renderMath: boolean) {
  html = `<h1>Pandoc Error:</h1><pre>${error}</pre><hr>${html}`
  return handleSuccess(html, renderMath)
}

/**
 * Adjusts all math environments in HTML
 * @param {string} HTML to be adjusted
 * @return {string} HTML with adjusted math environments
 */
function handleMath(html: string) {
  const doc = document.createElement('div')
  doc.innerHTML = html
  doc.querySelectorAll('.math').forEach(function(elem) {
    let math = (elem as HTMLElement).innerText
    // Set mode if it is block math
    const mode = math.indexOf('\\[') > -1 ? '; mode=display' : ''

    // Remove sourrounding \[ \] and \( \)
    math = math.replace(/\\[[()\]]/g, '')
    return (elem.outerHTML =
      '<span class="math">' +
      `<script type='math/tex${mode}'>${math}</script>` +
      '</span>')
  })

  return doc.innerHTML
}

function removeReferences(html: string) {
  const doc = document.createElement('div')
  doc.innerHTML = html
  doc.querySelectorAll('.references').forEach((elem) => {
    elem.remove()
  })
  return doc.innerHTML
}

/**
 * Handle successful response from Pandoc
 * @param {string} Returned HTML
 * @return {array} with Arguments for callbackFunction (error set to null)
 */
function handleSuccess(html: string, renderMath: boolean) {
  if (renderMath) {
    html = handleMath(html)
  }
  if (atomConfig().pandocRemoveReferences) {
    html = removeReferences(html)
  }
  return html
}

/**
 * Handle response from Pandoc
 * @param {Object} error if thrown
 * @param {string} Returned HTML
 */
function handleResponse(error: string, html: string, renderMath: boolean) {
  if (error) {
    return handleError(error, html, renderMath)
  } else {
    return handleSuccess(html, renderMath)
  }
}

/**
 * Renders markdown with pandoc
 * @param {string} document in markdown
 * @param {boolean} whether to render the math with mathjax
 * @param {function} callbackFunction
 */
export async function renderPandoc<T>(
  text: string,
  filePath: string | undefined,
  renderMath: boolean,
  cb: (err: Error | null, result: string) => T,
): Promise<T> {
  const { args, opts } = setPandocOptions(filePath, renderMath)
  return new Promise<T>((resolve, reject) => {
    const cp = CP.execFile(
      atomConfig().pandocPath,
      getArguments(args),
      opts,
      function(error, stdout, stderr) {
        if (error) {
          atom.notifications.addError(error.toString(), {
            stack: error.stack,
            dismissable: true,
          })
          reject(error)
        }
        const result = handleResponse(stderr || '', stdout || '', renderMath)
        resolve(cb(null, result))
      },
    )
    cp.stdin.write(text)
    cp.stdin.end()
  })
}

export function getArguments(iargs: Args) {
  const args = _.reduce(
    iargs,
    function(res: string[], val, key) {
      if (val && !_.isEmpty(val)) {
        const nval: string[] = _.flatten([val])
        _.forEach(nval, function(v: string) {
          if (!_.isEmpty(v)) {
            res.push(`--${key}=${v}`)
          }
        })
      }
      return res
    },
    [],
  )
  const res: string[] = []
  for (const val of [
    ...args,
    ...atom.config.get('markdown-preview-plus.pandocArguments')!,
  ]) {
    const newval = val.replace(/^(--[\w\-]+)\s(.+)$/i, '$1=$2')
    if (newval.substr(0, 1) === '-') {
      res.push(newval)
    }
  }
  return res
}
