'use strict'

const test = require('tape')
const StudentHistogram = require('.')

test('basic', function (t) {
  const h = new StudentHistogram(1, 100, 3)

  t.is(h.record(10), true)
  t.is(h.record(30), true)

  t.is(h.size, 2)
  t.is(h.mean(), 20)
  t.is(h.stddev(), 10)
  t.is(h.min(), 10)
  t.is(h.max(), 30)
  t.is(h.df(), 1)

  t.end()
})
