# student-histogram

**Record a sample and compute its statistical significance.** Uses [`native-hdr-histogram`][native-hdr-histogram] and a two-tailed t-distribution
table under the hood. Good for sample sizes below 200. HDR histogram is
designed for "value measurements in latency and performance sensitive
applications", quantizes values with a configurable precision and has a
constant memory footprint.

[![npm status](http://img.shields.io/npm/v/student-histogram.svg)](https://www.npmjs.org/package/student-histogram)
[![node](https://img.shields.io/node/v/student-histogram.svg)](https://www.npmjs.org/package/student-histogram)
[![Travis build status](https://img.shields.io/travis/vweevers/student-histogram.svg?label=travis)](http://travis-ci.org/vweevers/student-histogram)
[![AppVeyor build status](https://img.shields.io/appveyor/ci/vweevers/student-histogram.svg?label=appveyor)](https://ci.appveyor.com/project/vweevers/student-histogram)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Dependency status](https://img.shields.io/david/vweevers/student-histogram.svg)](https://david-dm.org/vweevers/student-histogram)

## Example

```js
const StudentHistogram = require('student-histogram')
const h = new StudentHistogram(1, 200, 3)

// Record some example values.
const sample = [100, 120, 101, 103, 99]
sample.forEach(v => h.record(v))

const log = console.log
const percent = require('fixed-number')(1, 2, 'percent')

log('arithmetic mean            : %d ±%s', h.mean(), percent(h.rme()))
log('standard deviation         :', h.stddev())
log('minimum and maximum        : %d and %d', h.min(), h.max())
log('75% of values fall below   :', h.percentile(75))
log()

log('standard error of the mean :', h.sem())
log('margin of error            :', h.moe())
log('relative margin of error   :', h.rme())
log('with higher confidence     :', h.rme(0.998))
log()

// Estimate the size (number of sampling points aka recorded values)
// that is required to achieve a relative margin of error of 0.05.
log('recommended sample size    :', h.minimumSize(0.05))
log('for 99.5% confidence       :', h.minimumSize(0.05, 0.995))
log('with 10% error tolerance   :', h.minimumSize(0.10))

if (h.size < h.minimumSize(0.05)) {
  // Maybe record some more!
}
```

Output:

```
arithmetic mean            : 104.6 ±9.27%
standard deviation         : 7.812809993849844
minimum and maximum        : 99 and 120
75% of values fall below   : 103

standard error of the mean : 3.493994848307593
margin of error            : 9.700727296841201
relative margin of error   : 0.09274117874609179
with higher confidence     : 0.23960921458776316

recommended sample size    : 18
for 99.5% confidence       : 70
with 10% error tolerance   : 5
```

## API

### `StudentHistogram(min, max, figures, opts)`

Documentation to follow.

## Install

With [npm](https://npmjs.org) do:

```
npm install student-histogram
```

## See also

- [`hdr-histogram-percentiles-obj`][hdr-histogram-percentiles-obj] (`student-histogram` is compatible)

## License

[MIT](LICENSE) © 2017-present Vincent Weevers. Based in part on [`benchmark.js`][benchmark-js] and [`sample-sizer`][sample-sizer]. See included [`LICENSE`](LICENSE) file for all copyright owners.

[benchmark-js]: https://github.com/bestiejs/benchmark.js
[sample-sizer]: https://github.com/mapbox/sample-sizer
[native-hdr-histogram]: https://github.com/mcollina/native-hdr-histogram
[hdr-histogram-percentiles-obj]: https://github.com/thekemkid/hdr-histogram-percentiles-obj
