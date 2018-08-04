# `track-performance` [![Build Status](https://travis-ci.org/hollowverse/track-performance.svg?branch=master)](https://travis-ci.org/hollowverse/track-performance)

An AWS Lambda function that tracks the performance of hollowverse.com.

Every day, the function runs a set of "reporters", each reporter communicates with a particular performance testing service. Some of the services used currently include:

* [securityheaders.io](https://securityheaders.io)
* [WebPageTest](https://webpagetest.org/)
* [Google's Mobile Friendly Test](https://search.google.com/test/mobile-friendly)

The function then collects the results and sends them as log events to our [Splunk](https://splunk.com) instance.

---

[If you need help or wanna get in touch...](https://github.com/hollowverse/hollowverse/wiki/Help)
