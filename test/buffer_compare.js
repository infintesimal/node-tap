var test = require('../').test

compatBuffer_1 = Buffer.from ? Buffer.from([3, 4, 243]) : new Buffer([3, 4, 243])
compatBuffer_2 = Buffer.from ? Buffer.from([3, 4, 243]) : new Buffer([3, 4, 243])
compatBuffer_3 = Buffer.from ? Buffer.from([3, 5, 243]) : new Buffer([3, 4, 243])

test('same buffers', function (t) {
  t.ok(compatBuffer_1.equals(compatBuffer_2))
  t.end()
})

test('not same buffers', function (t) {
  t.notOk(compatBuffer_3.equals(compatBuffer_2))
  t.end()
})
