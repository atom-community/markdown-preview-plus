import * as path from 'path'
import * as yaml from 'yaml'
import * as fs from 'fs'
import { isFileSync, packagePath, handlePromise } from './util'

export function getUserMacrosPath(atomHome: string): string {
  const newPath = path.join(atomHome, 'markdown-preview-plus.yaml')
  if (!isFileSync(newPath)) {
    const oldPath = path.join(atomHome, 'markdown-preview-plus.cson')
    if (isFileSync(oldPath)) {
      /// backwards-compat
      const buttons = [
        {
          text: 'Edit new YAML',
          onDidClick() {
            handlePromise(atom.workspace.open(newPath))
          },
        },
        {
          text: 'Show old CSON',
          onDidClick() {
            handlePromise(atom.workspace.open(oldPath))
          },
        },
      ]
      try {
        const obj = yaml.parseDocument(
          fs.readFileSync(oldPath).toString('utf-8'),
          { keepCstNodes: true },
        )
        fs.writeFileSync(newPath, obj.toString(), { encoding: 'utf-8' })
        if (Object.keys(obj.toJSON() as {}).length > 0) {
          atom.notifications.addInfo(
            `${oldPath} converted to YAML and re-saved as ${newPath}`,
            {
              detail: `markdown-preview-plus.cson was converted to YAML. The backup is kept as ${oldPath}`,
              dismissable: true,
              buttons,
            },
          )
        }
      } catch (e) {
        createMacrosTemplate(newPath)
        atom.notifications.addWarning(
          'Error converting markdown-preview-plus.cson',
          {
            dismissable: true,
            detail: (e as Error).toString(),
            description:
              'Failed to convert markdown-preview-plus.cson to YAML; please make the conversion manually',
            buttons,
          },
        )
      }
      /// end
    } else {
      console.debug(
        'Creating markdown-preview-plus.yaml, this is a one-time operation.',
      )
      createMacrosTemplate(newPath)
    }
  }
  return newPath
}

function loadMacrosFile(filePath: string): object {
  try {
    const contents = fs.readFileSync(filePath).toString('utf-8')
    const macros = yaml.parse(contents) as {}
    return checkMacros(macros || {})
  } catch (e) {
    const error = e as Error
    console.warn(
      `Error reading Latex Macros file '${filePath}': ${
        error.stack !== undefined ? error.stack : error
      }`,
    )
    console.error(`Failed to load Latex Macros from '${filePath}'`, {
      detail: error.message,
      dismissable: true,
    })
    return {}
  }
}

export function loadUserMacros(atomHome = atom.getConfigDirPath()) {
  const userMacrosPath = getUserMacrosPath(atomHome)
  return loadMacrosFile(userMacrosPath)
}

function createMacrosTemplate(filePath: string) {
  const templatePath = path.join(
    packagePath(),
    'assets',
    'macros-template.yaml',
  )
  const templateFile = fs.readFileSync(templatePath, 'utf8')
  fs.writeFileSync(filePath, templateFile)
}

function checkMacros(macrosObject: object) {
  const namePattern = /^[^a-zA-Z\d\s]$|^[a-zA-Z]*$/ // letters, but no numerals.
  const result = {}
  for (const name of Object.keys(macrosObject)) {
    const value = macrosObject[name]
    if (name.match(namePattern) && valueMatchesPattern(value)) {
      result[name] = value
    } else {
      atom.notifications.addWarning(
        `Markdown-Preview-Plus failed to load LaTeX macro named '${name}'.` +
          ` Please see the [LaTeX guide](https://github.com/atom-community/markdown-preview-plus/blob/master/docs/math.md#macro-names)`,
      )
    }
  }
  return result
}

function valueMatchesPattern(value: any) {
  // Different check based on whether value is string or array
  if (Array.isArray(value)) {
    const macroDefinition = value[0]
    const numberOfArgs = value[1]
    if (typeof numberOfArgs === 'number') {
      return numberOfArgs % 1 === 0 && typeof macroDefinition === 'string'
    } else {
      return false
    }
  } else if (typeof value === 'string') {
    return true
  } else {
    return false
  }
}
