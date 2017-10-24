'use strict'

const NativeHistogram = require('native-hdr-histogram')
const Uint64BE = require('int64-buffer').Uint64BE
const tcritical = require('./lib/tcritical')

const UINT64_SIZE = 8

const _native = Symbol('native')
const _size = Symbol('size')
const _confidence = Symbol('confidence')

module.exports = class Histogram {
  constructor (min, max, figures, opts) {
    // Same defaults as native-hdr-histogram
    if (min == null) min = 1
    if (max == null) max = 100
    if (figures == null) figures = 3

    this[_native] = new NativeHistogram(min, max, figures)
    this[_size] = 0

    // Desired level of confidence for estimates like margin of error
    // and minimum sample size. Can also be specified per method.
    this[_confidence] = (opts && opts.confidence) || 0.95
  }

  record (value) {
    if (this[_native].record(value)) {
      this[_size]++
      return true
    } else {
      return false
    }
  }

  get size () {
    return this[_size]
  }

  reset () {
    this[_native].reset()
    this[_size] = 0
  }

  // Returns standard deviation
  stddev () { return this[_native].stddev() || 0 }

  // Returns arithmetic mean
  mean () { return this[_native].mean() }

  // Returns the minimum or maximum recorded value.
  min () { return this[_native].min() }
  max () { return this[_native].max() }

  // Returns the value at the given percentile.
  // Percentile must be > 0 and <= 100, otherwise it will throw.
  percentile (percentile) { return this[_native].percentile(percentile) }

  // Returns standard error of the mean
  sem () { return this.stddev() / Math.sqrt(this[_size]) }

  // Returns degree of freedom
  df () { return this[_size] - 1 }

  // Returns Student's T critical value
  tcritical (confidence) {
    // TODO: should it return NaN if size is 0?
    return tcritical(Math.max(this.df(), 1), confidence || this[_confidence])
  }

  // Returns margin of error
  moe (confidence) {
    return this.sem() * this.tcritical(confidence)
  }

  // Returns relative margin of error (0-1)
  rme (confidence) {
    return (this.moe(confidence) / this.mean()) || 0
  }

  /**
   * Compute the minimum sample size required to achieve a mean estimate given
   * confidence level and error tolerance. Requires at least two recorded values;
   * what you could do is record a fixed sample size (say 50), then consult
   * minimumSize(rme) to decide whether to continue.
   *
   * Adapted from https://github.com/mapbox/sample-sizer (BSD-3-Clause).
   * This modified version uses a *relative* error tolerance.
   *
   * @param {number} rme - Relative error tolerance (0-1)
   * @param {number} [confidence] - Desired level of confidence (0-1). Defaults
   * to the `confidence` option passed to the constructor.
   * @return {number} Estimated sample size or NaN if size is < 2.
   */
  minimumSize (rme, confidence) {
    if (this[_size] < 2) return NaN

    const t = this.tcritical(confidence)
    const s = this.stddev()
    const e = rme * this.mean()

    return Math.ceil((t * t * s * s) / (e * e))
  }

  encode () {
    // Encode size as unsigned 64-bit integer to fit 2^53-1
    const size64 = new Uint64BE(this[_size]).toBuffer()
    const values = this[_native].encode()

    return Buffer.concat([size64, values], UINT64_SIZE + values.length)
  }

  decode (buf) {
    this[_size] = new Uint64BE(buf, 0).toNumber()
    this[_native].decode(buf.slice(UINT64_SIZE))
  }
}
