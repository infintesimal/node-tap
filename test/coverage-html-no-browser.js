var cp = require('child_process')
var spawn = cp.spawn
var exec = cp.execFile
var node = process.execPath
var run = require.resolve('../bin/run.js')
var ok = require.resolve('./test/ok.js')
var t = require('../')

var fs = require('fs')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var path = require('path')
var findUp = require('find-up')
 
// NOTE: NYC package will ignore value of `cwd` arg
// if a package.json exists and simply write its output
// to root node of package/coverage -- this code adjusts
// for this behavior

// Based on this new NYC behavior, setting up
// a local path is unnecesary, so I drop the
// 'setup a working dir' test found in 10.7.3

var pkgPath = findUp.sync('package.json', { cwd: __dirname })
var dir = '';
if (pkgPath) {
  dir = path.dirname(pkgPath);
} else {
  dir = `cwd`;
}

var htmlfile = dir + '/coverage/lcov-report/bin/run.js.html'

t.test('generate some coverage data', function (t) {
  spawn(node, [run, ok, '--coverage', '--no-coverage-report'], {
    cwd: dir,
    stdio: 'ignore'
  }).on('close', function (code, signal) {
    t.equal(code, 0)
    t.equal(signal, null)
    t.end()
  })
})

t.test('generate html, but do not open in a browser', function (t) {
  spawn(node, [run, '--coverage-report=html', '--no-browser'], {
    cwd: dir,
    stdio: 'ignore'
  }).on('close', function (code, signal) {
    var output = fs.readFileSync(htmlfile, 'utf8')
    t.match(output, /^<!doctype html>/)
    t.match(output, /Code coverage report for bin[\\\/]run\.js/)
    t.equal(code, 0)
    t.equal(signal, null)
    t.end()
  })
})

t.test('cleanup', function (t) {
  rimraf.sync(dir + "/coverage")
  t.end()
})
