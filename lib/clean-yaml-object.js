'use strict'
const path = require('path')
const Module = require('module')
const fs = require('fs')
const binpath = path.resolve(__dirname, '../bin')
const stack = require('./stack.js')
const diff = require('diff')
const yaml = require('tap-yaml')

const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)

const cleanDiag = object => {
  const res = { ...object }
  if (hasOwn(res, 'stack') && !hasOwn(res, 'at'))
    res.at = stack.parseLine(res.stack.split('\n')[0])

  const file = res.at && res.at.file && path.resolve(res.at.file)
  if (file && (file.indexOf(__dirname) === 0 || file.indexOf(binpath) === 0))
    delete res.at

  if (file && res.at && res.at.file && res.at.line && !res.source) {
    const content = (() => {
      try {
        return fs.readFileSync(file, 'utf8')
      } catch (er) {
      }
    })()
    if (content) {
      const lines = content.split('\n')
      if (res.at.line <= lines.length) {
        const startLine = Math.max(res.at.line - 2, 0)
        const endLine = Math.min(res.at.line + 2, lines.length)
        const caret = res.at.column
          ? [new Array(res.at.column).join('-') + '^'] : []
        const context = lines.slice(startLine, res.at.line).concat(caret)
          .concat(lines.slice(res.at.line, endLine))
        const csplit = context.join('\n').trimRight()
        if (csplit)
          res.source = csplit + '\n'
      }
    }
  }

  // show a line by line string diff
  // diff the yaml, to make it more humane, especially
  // when strings or buffers are very large or multi-line
  if (res.found && res.wanted && !res.diff) {
    const f = res.found
    const w = res.wanted
    res.diff = ['--- wanted', '+++ found'].concat(
      diff.createPatch('', yaml.stringify(w), yaml.stringify(f))
        .split(/\n/).slice(5).join('\n')
        .replace(/^ (\||>)(\+|-)?\n/, '')
    ).join('\n')
  }

  for (const [key, value] of Object.entries(res)) {
    if (key === 'todo' ||
        key === 'time' ||
        /^_?tapChild/.test(key) ||
        /^tapStream/.test(key) ||
        /^tapMochaTest/.test(key) ||
        key === 'cb' ||
        key === 'name' ||
        key === 'indent' ||
        key === 'skip' ||
        key === 'bail' ||
        key === 'grep' ||
        key === 'grepInvert' ||
        key === 'only' ||
        key === 'diagnostic' ||
        key === 'buffered' ||
        key === 'parent' ||
        key === 'domainEmitter' ||
        key === 'domainThrew' ||
        key === 'domain' ||
        key === 'at' && !value ||
        key === 'stack' && !value)
      delete res[key]
  }

  return res
}

module.exports = cleanDiag
