namespace WebPageTest {
  type CommonOptions = {
    /**
     * if `true`, method does not make an actual request to the API Server but rather
     * returns an object with url which contains the actual URL to make the `GET`
     * request to WebPageTest API Server
     */
    dryRun?: boolean;

    /**
     * If specified, overrides the WebPageTest server informed in the
     * constructor only for that method call
     */
    server?: string;
  };

  type RunTestOptions = {
    /** location to test from */
    location?: string;

    /** connectivity profile -- requires location to be specified */
    connectivity?:
      | 'Cable'
      | 'DSL'
      | 'FIOS'
      | 'Dial'
      | '3G'
      | '3GFast'
      | 'Native'
      | 'custom';

    /**
     * number of test runs
     * @default 1
     */
    runs?: number;

    /** skip the Repeat View test */
    firstViewOnly?: boolean;

    /** capture video */
    video?: boolean;

    /** keep the test hidden from the test log */
    private?: boolean;

    /** label for the test */
    label?: string;

    /** stop test at document complete. typically, tests run until all activity stops */
    stopAtDocumentComplete?: boolean;

    /** disable JavaScript (IE, Chrome, Firefox) */
    disableJavaScript?: boolean;

    /** clear SSL certificate caches */
    clearCerts?: boolean;

    /** ignore SSL certificate errors, e.g. name mismatch, self-signed certificates, etc. */
    ignoreSSL?: boolean;

    /** forces all pages to load in standards mode (IE only) */
    disableCompatibilityView?: boolean;

    /** capture network packet trace (tcpdump) */
    tcpDump?: boolean;

    /** save response bodies for text resources */
    saveResponseBodies?: boolean;

    /** do not add PTST to the original browser User Agent string */
    keepOriginalUserAgent?: boolean;

    /** DOM element to record for sub-measurement */
    domElement?: string;

    /** minimum test duration in seconds */
    minimumDuration?: number;

    /** run the test on a specific PC (name must match exactly or the test will not run) */
    tester?: string;

    /**
     * (experimental) emulate mobile browser: Chrome mobile user agent,
     * 640x960 screen, 2x scaling and fixed viewport (Chrome only)
     */
    emulateMobile?: boolean;

    /** capture Developer Tools Timeline (Chrome only) */
    timeline?: boolean;

    /**
     * set between 1-5 to include the JS call stack. must be used in conjunction with
     * timeline (increases overhead) (Chrome only)
     */
    timelineCallStack?: boolean;

    /** capture chrome trace (about://tracing) (Chrome only) */
    chromeTrace?: boolean;

    /** capture Network Log (Chrome only) */
    netLog?: boolean;

    /** enable data reduction on Chrome 34+ Android (Chrome only) */
    dataReduction?: boolean;

    /** custom user agent string (Chrome only) */
    userAgent?: string;

    /** use a list of custom command line switches (Chrome only) */
    commandLine?: string;

    /** username for authenticating tests (http authentication) */
    login?: string;

    /** password for authenticating tests (http authentication) */
    password?: string;

    /** discard script and http headers in the result */
    sensitive?: boolean;

    /** disable saving of the http headers (as well as browser status messages and CPU utilization) */
    disableHTTPHeaders?: boolean;

    /** space-delimited list of urls to block (substring match) */
    block?: string;

    /**
     * space-delimited list of domains to simulate failure by re-routing to
     * blackhole.webpagetest.org to silently drop all requests
     */
    spof?: string;

    /** execute arbitrary JavaScript at the end of a test to collect custom metrics */
    customMetrics?: string;

    /**
     * type of authentication: 0 = Basic, 1 = SNS
     * @default 0
     */
    authenticationType?: 0 | 1;

    /** e-mail address to notify with the test results */
    notifyEmail?: string;

    /** URL to ping when the test is complete (the test ID will be passed as an "id" parameter) */
    pingback?: string;

    /** download bandwidth in Kbps (used when specifying a custom connectivity profile) */
    bandwidthDown?: string;

    /** upload bandwidth in Kbps (used when specifying a custom connectivity profile) */
    bandwidthUp?: string;

    /** first-hop Round Trip Time in ms (used when specifying a custom connectivity profile) */
    latency?: string;

    /**
     * packet loss rate - percent of packets to drop
     * (used when specifying a custom connectivity profile)
     */
    packetLossRate?: string;

    /** disable optimization checks (for faster testing) */
    disableOptimization?: boolean;

    /** disable screen shot capturing */
    disableScreenshot?: boolean;

    /** save a full-resolution version of the fully loaded screen shot as a PNG */
    fullResolutionScreenshot?: boolean;

    /** jpeg compression level (30-100) for the screen shots and video capture */
    jpegQuality?: number;

    /** store the video from the median run when capturing video is enabled */
    medianVideo?: boolean;

    /** save the content of only the base HTML response */
    htmlBody?: boolean;

    /**
     * test name to use when submitting results to tsviewdb
     * (for private instances that have integrated with tsviewdb)
     */
    tsView?: string;

    /**
     * configs to use when submitting results to tsviewdb
     * (for private instances that have integrated with tsviewdb)
     */
    tsViewConfigs?: string;

    /**
     * String to hash test to a specific test agent.
     * Tester will be picked by index among available testers
     */
    affinity?: string;

    /**
     * change test priority (0-9)
     * Default: [enforced by API key, otherwise 5]
     */
    priority?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

    /** block ads defined by http://adblockplus.org */
    blockAds?: boolean;

    /** capture video continuously (unstable/experimental, may cause tests to fail) */
    continuousVideoCapture?: boolean;

    /** force SPDY version 3 (Chrome only) */
    forceSpdy3?: boolean;

    /** force software rendering, disable GPU acceleration (Chrome only) */
    forceSoftwareRendering?: boolean;

    /**
     * poll for results after test is scheduled at every seconds
     * @default 5
     */
    pollResults?: number;

    /**
     * wait for test results informed by agent once complete listening on
     * : [hostname:first port available above 8000]
     */
    waitResults?: string;

    /**
     * timeout for polling and waiting results
     * Default: [no timeout]
     */
    timeout?: string;
    /** perform lighthouse test (Chrome only, Linux agent only) */
    lighthouse?: boolean;
  };

  type RequestOptions = {
    /** echo request ID: string, useful to track asynchronous requests */
    requestId?: string;
  };

  type ResultOptions = {
    /** include the breakdown of requests and bytes by mime type */
    breakDown?: boolean;
    /** include the breakdown of requests and bytes by domain */
    domains?: boolean;
    /** include the PageSpeed score in the response (may be slower) */
    pageSpeed?: boolean;
    /** include the request data in the response (slower and results in much larger responses) */
    requests?: boolean;
    /** set the metric used to calculate median for multiple runs tests (default: loadTime) */
    medianMetric?: string;
    /** set the specs for performance test suite */
    specs?: string;

    /**
     * set performance test suite reporter output
     * @default 'dot'
     */
    reporter?:
      | 'dot'
      | 'spec'
      | 'tap'
      | 'xunit'
      | 'list'
      | 'progress'
      | 'min'
      | 'nyan'
      | 'landing'
      | 'json'
      | 'doc'
      | 'markdown'
      | 'teamcity';
  };

  type RunOptions = {
    /**
     * the test run number for multiple runs tests
     * @default 1 // first test
     */
    run?: number;
    /** if `true` returns the repeat view (cached) data */
    repeatView?: boolean;
  };

  type ImageOptions = {
    /** returns the thumbnail of actual image */
    thumbnail?: boolean;
    /** returns the base64 string representation (inline) of actual image */
    dataURI?: boolean;
  };

  type ApiKeyOptions = {
    /**
     *  API key (if assigned).
     * Contact the WebPageTest server administrator for a key if required
     */
    key?: string;
  };

  type ScreenshotOptions = {
    /** returns the full resolution screenshot in PNG format if available */
    fullResolution?: boolean;

    /**
     * returns the page screenshot at the Start Render point
     * (i.e.: when something was first displayed on screen)
     */
    startRender?: boolean;

    /**
     * returns the page screenshot at the Document Complete point
     * (i.e.: when window.onload was fired)
     */
    documentComplete?: boolean;
  };

  type WaterfallOptions = {
    /**
     * set the chart type: waterfall or connection
     * @default 'waterfall`
     */
    chartType?: 'waterfall' | 'connection';
    /**
     * set chart coloring by MIME type
     * @default false
     */
    colorByMime?: boolean;
    /**
     * chart image width in px (300-2000)
     * @default 930
     */
    chartWidth?: number;

    /**
     * set maximum time in seconds
     * Default: (automatic)
     */
    maxTime?: number;

    /**
     * filter requests
     * Default: (all)
     * @example '1,2,3,4-9,8'
     */
    requests?: string;

    /**
     * hide CPU utilization
     * @default false
     */
    noCPU?: boolean;
    /**
     * hide bandwidth utilization
     * @default false
     */
    noBandwidth?: boolean;
    /**
     * hide ellipsis (...) for missing items
     * @default false
     */
    noEllipsis?: boolean;
    /**
     * hide labels for requests (URL)
     * @default false
     */
    noLabels?: boolean;
  };

  type VideoOptions = {
    /**
     * frame comparison end point:
     * * `'visual'`: visually complete
     * * `'all'`: last change
     * * `'doc'`: document complete
     * * `'full'`: fully loaded
     *
     * @default 'visual'
     */
    comparisonEndPoint?: 'visual' | 'all' | 'doc' | 'full';
  };

  type ResponseOptions = {
    /**
     * the request number
     * @default 1
     */
    request?: number;
  };

  type ListenOptions = {
    /** private key file path to use for SSL */
    key?: string;
    /** public x509 certificate file path to use for SSL */
    cert?: string;
  };

  type ImageInfo = {
    type: 'image/jpeg' | 'png';
    encoding: 'utf8' | 'binary';
  };

  type Response<D> = {
    statusCode: number;
    statusText: string;
    data: D;
  };

  export type RunTestResponse = Response<{
    testId: string;
    ownerKey: string;
    jsonUrl: string;
    xmlUrl: string;
    userUrl: string;
    summaryCSV: string;
    detailsCSV: string;
  }>;

  type Callback<D = any> = (error: Error, data: D) => void;
  type CallbackWithInfo<D = any, I = ImageInfo> = (
    error: Error,
    data: D,
    info: I,
  ) => void;

  type Script = any[];

  class WebPageTest {
    /**
     *
     * @param url defaults to `'www.webpagetest.org'`
     * @param apiKey
     */
    constructor(url?: string, apiKey?: string);

    getTestStatus(id: string, options: CommonOptions, callback: Callback): void;
    getTestStatus(id: string, callback: Callback): void;

    getTestResults(id: string, callback: Callback): void;
    getTestResults(
      id: string,
      options: CommonOptions,
      callback: Callback,
    ): void;

    getLocations(callback: Callback): void;
    getLocations(options: CommonOptions, callback: Callback): void;

    getTesters(callback: Callback): void;
    getTesters(options: CommonOptions, callback: Callback): void;

    runTest(
      /** decoded url or script string */
      urlOrScript: string,
      callback: Callback<RunTestResponse>,
    ): void;
    runTest(
      /** decoded url or script string */
      urlOrScript: string,
      options: CommonOptions &
        RunTestOptions &
        ApiKeyOptions &
        RequestOptions &
        ResultOptions,
      callback: Callback<RunTestResponse>,
    ): void;

    cancelTest(id: string, callback: Callback): void;
    cancelTest(
      id: string,
      options: CommonOptions & ApiKeyOptions,
      callback: Callback,
    ): void;

    getHARData(id: string, callback: Callback): void;
    getHARData(id: string, options: CommonOptions, callback: Callback): void;

    getPageSpeedData(id: string, callback: Callback): void;
    getPageSpeedData(
      id: string,
      options: CommonOptions & RunOptions,
      callback: Callback,
    ): void;

    getUtilizationData(id: string, callback: Callback): void;
    getUtilizationData(
      id: string,
      options: CommonOptions & RunOptions,
      callback: Callback,
    ): void;

    getRequestData(id: string, callback: Callback): void;
    getRequestData(
      id: string,
      options: CommonOptions & RunOptions,
      callback: Callback,
    ): void;

    getTimelineData(id: string, callback: Callback): void;
    getTimelineData(
      id: string,
      options: CommonOptions & RunOptions,
      callback: Callback,
    ): void;

    getNetLogData(id: string, callback: Callback): void;
    getNetLogData(
      id: string,
      options: CommonOptions & RunOptions,
      callback: Callback,
    ): void;

    getChromeTraceData(id: string, callback: Callback): void;
    getChromeTraceData(
      id: string,
      options: CommonOptions & RunOptions,
      callback: Callback,
    ): void;

    getConsoleLogData(id: string, callback: Callback): void;
    getConsoleLogData(
      id: string,
      options: CommonOptions & RunOptions,
      callback: Callback,
    ): void;

    getTestInfo(id: string, callback: Callback): void;
    getTestInfo(id: string, options: CommonOptions, callback: Callback): void;

    getHistory(days: number, callback: Callback): void;
    getHistory(days: number, options: CommonOptions, callback: Callback): void;

    getGoogleCsiData(id: string, callback: Callback): void;
    getGoogleCsiData(
      id: string,
      options: CommonOptions & RunOptions,
      callback: Callback,
    ): void;

    getResponseBody(id: string, callback: Callback): void;
    getResponseBody(
      id: string,
      options: CommonOptions & ResponseOptions & RunOptions,
      callback: Callback,
    ): void;

    getWaterfallImage(id: string, callback: CallbackWithInfo): void;
    getWaterfallImage(
      id: string,
      options: CommonOptions & ImageOptions & WaterfallOptions & RunOptions,
      callback: CallbackWithInfo,
    ): void;

    getScreenshotImage(id: string, callback: CallbackWithInfo): void;
    getScreenshotImage(
      id: string,
      options: CommonOptions & ImageOptions & ScreenshotOptions & RunOptions,
      callback: CallbackWithInfo,
    ): void;

    createVideo(tests, callback: Callback): void;
    createVideo(
      tests,
      options: CommonOptions & VideoOptions,
      callback: Callback,
    ): void;

    getEmbedVideoPlayer(id: string, callback: Callback): void;
    getEmbedVideoPlayer(
      id: string,
      options: CommonOptions,
      callback: Callback,
    ): void;

    listen(callback: Callback): void;
    listen(options: CommonOptions & ListenOptions, callback: Callback): void;
    listen(
      port: number,
      options: CommonOptions & ListenOptions,
      callback: Callback,
    ): void;

    scriptToString(script: Script): void;
  }

  export { WebPageTest };
}

declare module 'webpagetest' {
  export = WebPageTest.WebPageTest;
}
