# `track-performance` [![Build Status](https://travis-ci.org/hollowverse/track-performance.svg?branch=master)](https://travis-ci.org/hollowverse/track-performance)

An AWS Lambda function that tracks the performance of hollowverse.com.

Every day, the function runs a set of "reporters", each reporter communicates with a particular performance testing service. Some of the services used currently include:

* [securityheaders.io](https://securityheaders.io)
* [WebPageTest](https://webpagetest.org/)
* [Google's Mobile Friendly Test](https://search.google.com/test/mobile-friendly)

The function then collects the results and prepares an aggregated report. The report is sent as a pull request to [`hollowverse/perf-reports`](https://github.com/hollowverse/perf-reports) which gets merged automatically. The diff can be previewed on GitHub to detect any potential regressions.

---

[If you'd like to tell us something, or need help with anything...](https://github.com/hollowverse/hollowverse/wiki/Help)
