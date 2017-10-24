'use strict'

// TODO: do not depend on internals.
const TTable = require('sample-sizer/lib/ttable')
const Big = require('big.js')

const T_TABLE_RANGE = 200
const TTABLE = new TTable(T_TABLE_RANGE)

// Two-tailed critical values for df > T_TABLE_RANGE and a <= 0.1 >= 0.01
// From http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm
TTABLE.infinity = {
  a10: 1.645,
  a05: 1.960,
  a02: 2.326,
  a01: 2.576
}

// Get pre-computed two-tailed Student's T critical value.
module.exports = function tcritical (df, confidence) {
  if (typeof df !== 'number' || isNaN(df)) {
    throw new TypeError('df (degree of freedom) must be a number and not NaN')
  }

  if (typeof confidence !== 'number' || isNaN(confidence)) {
    throw new TypeError('confidence must be a number and not NaN')
  }

  const infinite = df > T_TABLE_RANGE
  const table = infinite ? TTABLE.infinity : TTABLE[df || 1]

  if (table === undefined) {
    const sym = infinite ? '∞' : df
    const input = `degree of freedom = ${sym}`
    const msg = `did not pre-compute critical values for ${input}`

    throw new RangeError(msg)
  }

  // Avoid: 1 - 0.95 == 0.050000000000000044
  // TODO: maybe use string input instead, and/or restructure the tables.
  const alpha = Number(new Big(1).minus(confidence))

  let t

  // Only accepts exact significance levels.
  if (alpha === 0.1) {
    t = table.a10
  } else if (alpha === 0.05) {
    t = table.a05
  } else if (alpha === 0.02) {
    t = table.a02
  } else if (alpha === 0.01) {
    t = table.a01
  } else if (alpha === 0.005) {
    t = table.a005
  } else if (alpha === 0.002) {
    t = table.a002
  } else if (alpha === 0.001) {
    t = table.a001
  } else {
    const accepted = `.9, .95, .98, .99, .995, .998 or .999`
    throw new RangeError(`confidence must be one of ${accepted}`)
  }

  if (t === undefined) {
    const sym = infinite ? '∞' : df
    const input = `degree of freedom = ${sym} and confidence = ${confidence}`
    const msg = `did not pre-compute critical value for ${input}`

    throw new RangeError(msg)
  }

  return t
}
