import path = require('path')
import CSON = require('season')
import fs = require('fs')
import { isFileSync } from './util'

function getUserMacrosPath(atomHome: string): string {
  const userMacrosPath: string | undefined | null = CSON.resolve(
    path.join(atomHome, 'markdown-preview-plus'),
  )
  return userMacrosPath != null
    ? userMacrosPath
    : path.join(atomHome, 'markdown-preview-plus.cson')
}

function loadMacrosFile(filePath: string): object {
  if (!CSON.isObjectPath(filePath)) return {}

  const macros = CSON.readFileSync(filePath, function(
    error?: Error,
    object?: object,
  ) {
    if (error !== undefined) {
      console.warn(
        `Error reading Latex Macros file '${filePath}': ${
          error.stack !== undefined ? error.stack : error
        }`,
      )
      console.error(`Failed to load Latex Macros from '${filePath}'`, {
        detail: error.message,
        dismissable: true,
      })
    }
    return object
  })
  return checkMacros(macros || {})
}

export function loadUserMacros(atomHome = atom.getConfigDirPath()) {
  const userMacrosPath = getUserMacrosPath(atomHome)
  if (isFileSync(userMacrosPath)) {
    return loadMacrosFile(userMacrosPath)
  } else {
    console.debug(
      'Creating markdown-preview-plus.cson, this is a one-time operation.',
    )
    createMacrosTemplate(userMacrosPath)
    return loadMacrosFile(userMacrosPath)
  }
}

function createMacrosTemplate(filePath: string) {
  const templatePath = path.join(__dirname, '../assets/macros-template.cson')
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
