var fs = require('fs')
var path = require('path')
var match = require('anymatch')
var xtend = require('xtend')

module.exports = ignore

function ignore (dir, opts) {
  if (typeof dir !== 'string') {
    opts = dir
    dir = null
  }
  opts = xtend({
    datignorePath: dir ? path.join(dir, '.datignore') : '.datignore'
  }, opts)

  var ignoreMatches = opts.ignore // we end up with array of ignores here
    ? Array.isArray(opts.ignore)
      ? opts.ignore
      : [opts.ignore]
    : []

  var defaultIgnore = [/^(?:\/.*)?\.dat(?:\/.*)?$/, '.DS_Store'] // ignore .dat (and DS_Store)
  var ignoreHidden = !(opts.ignoreHidden === false) ? [/(^\.|\/\.).*/] : null // ignore hidden files anywhere
  var datIgnore = !(opts.useDatIgnore === false) ? readDatIgnore() : null

  // Add ignore options
  ignoreMatches = ignoreMatches.concat(defaultIgnore) // always ignore .dat folder
  if (datIgnore) ignoreMatches = ignoreMatches.concat(datIgnore) // add .datignore
  if (ignoreHidden) ignoreMatches = ignoreMatches.concat(ignoreHidden) // ignore all hidden things

  return function (file) {
    return match(ignoreMatches, file)
  }

  function readDatIgnore () {
    try {
      var ignores = opts.datignore || fs.readFileSync(opts.datignorePath, 'utf8')
      if (ignores && typeof opts.datignore !== 'string') ignores = ignores.toString()
      return ignores
        .trim()
        .split('\n')
        .filter(function (str) {
          return !!str.trim()
        })
        .map(function (line) {
          return path.join(dir, line) // prepend the dir to each line
        })
    } catch (e) {
      return []
    }
  }
}
