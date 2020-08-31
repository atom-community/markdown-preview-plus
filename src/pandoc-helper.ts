import * as CP from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { atomConfig } from './util'

/**
 * Sets local mathjaxPath if available
 */
const mathJaxPath =
  'atom://markdown-preview-plus/node_modules/mathjax/MathJax.js'

function findFileRecursive(filePath: string, fileName: string): string | false {
  const bibFile = path.join(filePath, '../', fileName)
  if (fs.existsSync(bibFile)) {
    return bibFile
  } else {
    const newPath = path.join(bibFile, '..')
    if (newPath !== filePath && !atom.project.getPaths().includes(newPath)) {
      return findFileRecursive(newPath, fileName)
    } else {
      return false
    }
  }
}

// exported for tests
export interface Args {
  from: string
  to: 'html'
  mathjax?: string
  filter: string[]
  bibliography?: string
  csl?: string
}

function setPandocOptions(filePath: string | undefined, renderMath: boolean) {
  // see https://github.com/atom-community/markdown-preview-plus/issues/316
  const opts: CP.ExecFileOptions = { maxBuffer: Infinity }
  if (filePath !== undefined) {
    opts.cwd = path.dirname(filePath)
  }
  const config = atomConfig().pandocConfig
  const args: Args = {
    from: config.pandocMarkdownFlavor,
    to: 'html',
    mathjax: renderMath ? mathJaxPath : undefined,
    filter: config.pandocFilters,
  }
  if (config.pandocBibliography) {
    args.filter.push('pandoc-citeproc')
    let bibFile = filePath && findFileRecursive(filePath, config.pandocBIBFile)
    if (!bibFile) {
      bibFile = config.pandocBIBFileFallback
    }
    args.bibliography = bibFile ? bibFile : undefined
    let cslFile = filePath && findFileRecursive(filePath, config.pandocCSLFile)
    if (!cslFile) {
      cslFile = config.pandocCSLFileFallback
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
function handleError(error: string, html: string, renderMath: boolean): never {
  const err = new Error(error) as Error & { html: string }
  err.html = handleSuccess(html, renderMath)
  throw err
}

/**
 * Adjusts all math environments in HTML
 * @param {string} HTML to be adjusted
 * @return {string} HTML with adjusted math environments
 */
function handleMath(html: string): string {
  const doc = document.createElement('div')
  doc.innerHTML = html
  doc.querySelectorAll('.math').forEach(function (elem) {
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
 * @param Returned HTML
 * @return Possibly modified returned HTML
 */
function handleSuccess(html: string, renderMath: boolean): string {
  if (renderMath) {
    html = handleMath(html)
  }
  if (atomConfig().pandocConfig.pandocRemoveReferences) {
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
export async function renderPandoc(
  text: string,
  filePath: string | undefined,
  renderMath: boolean,
  showErrors: boolean,
): Promise<string> {
  const { args, opts } = setPandocOptions(filePath, renderMath)
  let interval: number | undefined
  try {
    return await new Promise<string>((resolve, reject) => {
      const cp = CP.execFile(
        atomConfig().pandocConfig.pandocPath,
        getArguments(args),
        opts,
        function (error, stdout, stderr) {
          if (error) {
            atom.notifications.addError(error.toString(), {
              stack: error.stack,
              dismissable: true,
            })
            reject(error)
          }
          try {
            const result = handleResponse(
              showErrors ? stderr || '' : '',
              stdout || '',
              renderMath,
            )
            resolve(result)
          } catch (e) {
            reject(e)
          }
        },
      )
      if (!cp.stdin) throw new Error('No stdin')
      cp.stdin.write(text)
      cp.stdin.end()
      interval = window.setInterval(() => {
        process.activateUvLoop()
      }, 100)
    })
  } finally {
    if (interval !== undefined) clearInterval(interval)
  }
}

function getArguments(iargs: Args) {
  const args: string[] = []
  for (const [key, val] of Object.entries(iargs)) {
    if (Array.isArray(val)) {
      args.push(...val.map((v) => `--${key}=${v}`))
    } else if (val) {
      args.push(`--${key}=${val}`)
    }
  }
  const res: string[] = []
  for (const val of [...args, ...atomConfig().pandocConfig.pandocArguments]) {
    const newval = val.replace(/^(--[\w\-]+)\s(.+)$/i, '$1=$2')
    if (newval.substr(0, 1) === '-') {
      res.push(newval)
    }
  }
  return res
}

export const testing = {
  setPandocOptions,
  getArguments,
  findFileRecursive,
}
