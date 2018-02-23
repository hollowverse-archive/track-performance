// tslint:disable

// interface RootObject {
//   data: Data;
//   statusCode: number;
//   statusText: string;
//   webPagetestVersion: string;
// }

type WithLighthouseConfig = {
  lighthouse: Lighthouse;
};

interface Lighthouse {
  userAgent: string;
  lighthouseVersion: string;
  generatedTime: string;
  initialUrl: string;
  url: string;
  runWarnings: any[];
  audits: Audits;
  runtimeConfig: RuntimeConfig;
  score: number;
  reportCategories: ReportCategory[];
  reportGroups: ReportGroups;
  timing: Timing;
  test_log: string;
}

interface Timing {
  total: number;
}

interface ReportGroups {
  'perf-metric': Perfmetric;
  'perf-hint': Perfmetric;
  'perf-info': Perfmetric;
  'a11y-color-contrast': Perfmetric;
  'a11y-describe-contents': Perfmetric;
  'a11y-well-structured': Perfmetric;
  'a11y-aria': Perfmetric;
  'a11y-correct-attributes': Perfmetric;
  'a11y-element-names': Perfmetric;
  'a11y-language': Perfmetric;
  'a11y-meta': Perfmetric;
  'manual-a11y-checks': Perfmetric;
  'manual-pwa-checks': Perfmetric;
  'seo-mobile': Perfmetric;
  'seo-content': Perfmetric;
  'seo-crawl': Perfmetric;
  'manual-seo-checks': Perfmetric;
}

interface Perfmetric {
  title: string;
  description: string;
}

interface ReportCategory {
  name: string;
  description: string;
  audits: Audit[];
  id: string;
  score: number;
  weight?: number;
}

interface Audit {
  id: string;
  weight: number;
  group?: string;
  result: Result3;
  score: number;
}

interface Result3 {
  score: boolean | boolean | number;
  displayValue: string;
  rawValue: boolean | boolean | number;
  extendedInfo?:
    | ExtendedInfo23
    | any[]
    | any[]
    | ExtendedInfo42
    | ExtendedInfo15
    | ExtendedInfo62;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  informative?: boolean;
  details?: Details9;
  debugString?: string | string;
  manual?: boolean;
  notApplicable?: boolean;
}

interface Details9 {
  type: string;
  header?: Header | Header | string;
  itemHeaders?: ItemHeader[];
  items?: Item4[][];
  chains?: Chains;
  longestChain?: LongestChain;
  scale?: number;
}

interface Item4 {
  type: string;
  selector?: string;
  path?: string;
  snippet?: string;
  text?: string | string;
}

interface ExtendedInfo62 {
  value:
    | Value6
    | Value4[]
    | Value15
    | Info
    | Value16
    | Value7
    | Value19
    | any[]
    | Value3
    | Value8
    | Value17
    | Value
    | Value18[]
    | Value12
    | Value5;
}

interface ExtendedInfo42 {
  value: Value11 | Value10 | any[] | Value9 | Value2;
}

interface ExtendedInfo23 {
  value?: Value20 | any[];
  jsLibs?: JsLib[];
  vulnerabilities?: any[];
}

interface RuntimeConfig {
  environment: Environment[];
  blockedUrlPatterns: any[];
}

interface Environment {
  name: string;
  enabled: boolean;
  description: string;
}

interface Audits {
  'is-on-https': Isonhttps;
  'redirects-http': Redirectshttp;
  'service-worker': Redirectshttp;
  'works-offline': Worksoffline;
  viewport: Worksoffline;
  'without-javascript': Redirectshttp;
  'first-meaningful-paint': Firstmeaningfulpaint;
  'load-fast-enough-for-pwa': Loadfastenoughforpwa;
  'speed-index-metric': Speedindexmetric;
  'screenshot-thumbnails': Screenshotthumbnails;
  'estimated-input-latency': Estimatedinputlatency;
  'errors-in-console': Errorsinconsole;
  'time-to-first-byte': Timetofirstbyte;
  'first-interactive': Firstinteractive;
  'consistently-interactive': Consistentlyinteractive;
  'user-timings': Usertimings;
  'critical-request-chains': Criticalrequestchains;
  redirects: Redirects;
  'webapp-install-banner': Webappinstallbanner;
  'splash-screen': Splashscreen;
  'themed-omnibox': Themedomnibox;
  'manifest-short-name-length': Redirectshttp;
  'content-width': Worksoffline;
  'image-aspect-ratio': Imageaspectratio;
  deprecations: Deprecations;
  'mainthread-work-breakdown': Mainthreadworkbreakdown;
  'bootup-time': Bootuptime;
  'pwa-cross-browser': Pwacrossbrowser;
  'pwa-page-transitions': Pwacrossbrowser;
  'pwa-each-page-has-url': Pwacrossbrowser;
  accesskeys: Accesskeys;
  'aria-allowed-attr': Ariaallowedattr;
  'aria-required-attr': Ariaallowedattr;
  'aria-required-children': Ariaallowedattr;
  'aria-required-parent': Ariaallowedattr;
  'aria-roles': Ariaallowedattr;
  'aria-valid-attr-value': Ariaallowedattr;
  'aria-valid-attr': Ariaallowedattr;
  'audio-caption': Accesskeys;
  'button-name': Accesskeys;
  bypass: Ariaallowedattr;
  'color-contrast': Ariaallowedattr;
  'definition-list': Accesskeys;
  dlitem: Accesskeys;
  'document-title': Ariaallowedattr;
  'duplicate-id': Ariaallowedattr;
  'frame-title': Accesskeys;
  'html-has-lang': Ariaallowedattr;
  'html-lang-valid': Ariaallowedattr;
  'image-alt': Ariaallowedattr;
  'input-image-alt': Accesskeys;
  label: Ariaallowedattr;
  'layout-table': Accesskeys;
  'link-name': Ariaallowedattr;
  list: Ariaallowedattr;
  listitem: Ariaallowedattr;
  'meta-refresh': Accesskeys;
  'meta-viewport': Metaviewport;
  'object-alt': Accesskeys;
  tabindex: Accesskeys;
  'td-headers-attr': Accesskeys;
  'th-has-data-cells': Accesskeys;
  'valid-lang': Accesskeys;
  'video-caption': Accesskeys;
  'video-description': Accesskeys;
  'custom-controls-labels': Pwacrossbrowser;
  'custom-controls-roles': Pwacrossbrowser;
  'focus-traps': Pwacrossbrowser;
  'focusable-controls': Pwacrossbrowser;
  'heading-levels': Pwacrossbrowser;
  'logical-tab-order': Pwacrossbrowser;
  'managed-focus': Pwacrossbrowser;
  'offscreen-content-hidden': Pwacrossbrowser;
  'use-landmarks': Pwacrossbrowser;
  'visual-order-follows-dom': Pwacrossbrowser;
  'uses-long-cache-ttl': Useslongcachettl;
  'total-byte-weight': Totalbyteweight;
  'offscreen-images': Offscreenimages;
  'unminified-css': Offscreenimages;
  'unminified-javascript': Offscreenimages;
  'unused-css-rules': Offscreenimages;
  'uses-webp-images': Offscreenimages;
  'uses-optimized-images': Offscreenimages;
  'uses-request-compression': Offscreenimages;
  'uses-responsive-images': Offscreenimages;
  'appcache-manifest': Worksoffline;
  'dom-size': Domsize;
  'external-anchors-use-rel-noopener': Deprecations;
  'geolocation-on-start': Deprecations;
  'link-blocking-first-paint': Linkblockingfirstpaint;
  'no-document-write': Deprecations;
  'no-mutation-events': Nomutationevents;
  'no-vulnerable-libraries': Novulnerablelibraries;
  'no-websql': Worksoffline;
  'notification-on-start': Deprecations;
  'password-inputs-can-be-pasted-into': Isonhttps;
  'script-blocking-first-paint': Linkblockingfirstpaint;
  'uses-http2': Nomutationevents;
  'uses-passive-event-listeners': Deprecations;
  'meta-description': Redirectshttp;
  'http-status-code': Redirectshttp;
  'font-size': Fontsize;
  'link-text': Imageaspectratio;
  'is-crawlable': Imageaspectratio;
  hreflang: Imageaspectratio;
  plugins: Imageaspectratio;
  canonical: Redirectshttp;
  'mobile-friendly': Pwacrossbrowser;
  'structured-data': Pwacrossbrowser;
}

interface Fontsize {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  debugString?: any;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details8;
}

interface Details8 {
  type: string;
  header: string;
  itemHeaders: ItemHeader[];
  items: Item3[][];
}

interface Item3 {
  type: string;
  text?: string | string;
}

interface Novulnerablelibraries {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  extendedInfo: ExtendedInfo22;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details3;
}

interface ExtendedInfo22 {
  jsLibs: JsLib[];
  vulnerabilities: any[];
}

interface JsLib {
  name: string;
  version?: any;
  npmPkgName: string;
  pkgLink: string;
  vulns: any[];
}

interface Nomutationevents {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  extendedInfo: ExtendedInfo21;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details3;
}

interface ExtendedInfo21 {
  value: Value20;
}

interface Value20 {
  results: any[];
}

interface Linkblockingfirstpaint {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo20;
  scoringMode: string;
  informative: boolean;
  name: string;
  description: string;
  helpText: string;
  details: Details3;
}

interface ExtendedInfo20 {
  value: Value19;
}

interface Value19 {
  wastedMs: string;
  results: any[];
}

interface Domsize {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo19;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details7;
}

interface Details7 {
  type: string;
  header: Header;
  items: Value18[];
}

interface ExtendedInfo19 {
  value: Value18[];
}

interface Value18 {
  title: string;
  value: string;
  target: string;
  snippet?: string;
}

interface Offscreenimages {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo18;
  scoringMode: string;
  informative: boolean;
  name: string;
  description: string;
  helpText: string;
  details: Details3;
}

interface ExtendedInfo18 {
  value: Value17;
}

interface Value17 {
  wastedMs: number;
  wastedKb: number;
  results: any[];
}

interface Totalbyteweight {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo17;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details5;
}

interface ExtendedInfo17 {
  value: Value16;
}

interface Value16 {
  results: Result2[];
  totalCompletedRequests: number;
}

interface Result2 {
  url: string;
  totalBytes: number;
  totalKb: string;
  totalMs: string;
}

interface Useslongcachettl {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo16;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details5;
}

interface ExtendedInfo16 {
  value: Value15;
}

interface Value15 {
  results: Result[];
  queryStringCount: number;
}

interface Result {
  url: string;
  cacheControl: CacheControl;
  cacheLifetimeInSeconds: number;
  cacheLifetimeDisplay: string;
  cacheHitProbability: number;
  totalKb: string;
  totalBytes: number;
  wastedBytes: number;
}

interface CacheControl {
  public: boolean;
  'max-age': number;
  immutable?: boolean;
}

interface Metaviewport {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  extendedInfo: ExtendedInfo15;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details6;
}

interface Details6 {
  type: string;
  header: Header;
  items: Item2[];
}

interface Item2 {
  type: string;
  selector: string;
  path: string;
  snippet: string;
}

interface ExtendedInfo15 {
  value: Value14;
}

interface Value14 {
  id: string;
  impact: string;
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: Node[];
}

interface Node {
  any?: any;
  all?: any;
  none?: any;
  impact: string;
  html: string;
  element?: any;
  target: string[];
  failureSummary: string;
  path: string;
  snippet: string;
}

interface Ariaallowedattr {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  extendedInfo: any[];
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details;
}

interface Accesskeys {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  scoringMode: string;
  informative: boolean;
  notApplicable: boolean;
  name: string;
  description: string;
  helpText: string;
}

interface Pwacrossbrowser {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  scoringMode: string;
  informative: boolean;
  manual: boolean;
  name: string;
  description: string;
  helpText: string;
}

interface Bootuptime {
  score: boolean;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo14;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details5;
}

interface ExtendedInfo14 {
  value: Record<string, Info>;
}

interface Info {
  'Parsing HTML & CSS': number;
  'Script Parsing & Compile': number;
  'Script Evaluation': number;
  'Style & Layout': number;
}

interface Mainthreadworkbreakdown {
  score: boolean;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo13;
  scoringMode: string;
  informative: boolean;
  name: string;
  description: string;
  helpText: string;
  details: Details5;
}

interface ExtendedInfo13 {
  value: Value12;
}

interface Value12 {
  'Evaluate Script': number;
  'Run Microtasks': number;
  Layout: number;
  'Recalculate Style': number;
  'Compile Script': number;
  'Parse HTML': number;
  'Minor GC': number;
  'Update Layer Tree': number;
  'Major GC': number;
  Paint: number;
  'DOM GC': number;
  'Composite Layers': number;
  'Parse Stylesheet': number;
  'Animation Frame Fired': number;
  'Image Decode': number;
}

interface Deprecations {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  extendedInfo: ExtendedInfo;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details3;
}

interface Imageaspectratio {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details3;
}

interface Themedomnibox {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  debugString: string;
  extendedInfo: ExtendedInfo12;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo12 {
  value: Value11;
}

interface Value11 {
  failures: string[];
  manifestValues: ManifestValues;
  themeColor: string;
}

interface Splashscreen {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  debugString: string;
  extendedInfo: ExtendedInfo11;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo11 {
  value: Value10;
}

interface Value10 {
  failures: string[];
  manifestValues: ManifestValues;
}

interface Webappinstallbanner {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  debugString: string;
  extendedInfo: ExtendedInfo10;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo10 {
  value: Value9;
}

interface Value9 {
  warnings: string[];
  failures: string[];
  manifestValues: ManifestValues;
}

interface ManifestValues {
  isParseFailure: boolean;
  parseFailureReason: string;
  allChecks: any[];
}

interface Redirects {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo6;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details5;
}

interface Details5 {
  type: string;
  header: string;
  itemHeaders: ItemHeader[];
  items: Header[][];
}

interface Criticalrequestchains {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  extendedInfo: ExtendedInfo9;
  scoringMode: string;
  informative: boolean;
  name: string;
  description: string;
  helpText: string;
  details: Details4;
}

interface Details4 {
  type: string;
  header: Header;
  chains: Chains;
  longestChain: LongestChain;
}

interface ExtendedInfo9 {
  value: Value8;
}

interface Value8 {
  chains: Chains;
  longestChain: LongestChain;
}

interface LongestChain {
  duration: number;
  length: number;
  transferSize: number;
}

interface Chains {
  '13042.1:redirected.0': _130421redirected0;
  '13042.2': _130421;
  '13042.3': _130421;
  '13042.4': _130421;
  '13042.5': _130421;
  '13042.6': _130421;
  '13042.7': _130421;
  '13042.8': _130421;
}

interface _130421redirected0 {
  request: Request3;
  children: Children;
}

interface Children {
  '13042.1': _130421;
}

interface _130421 {
  request: Request3;
  children: any[];
}

interface Request3 {
  url: string;
  startTime: number;
  endTime: number;
  responseReceivedTime: number;
  transferSize: number;
}

interface Usertimings {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  extendedInfo: ExtendedInfo;
  scoringMode: string;
  informative: boolean;
  name: string;
  description: string;
  helpText: string;
  details: Details3;
}

interface Consistentlyinteractive {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo8;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo8 {
  value: Value7;
}

interface Value7 {
  cpuQuietPeriod: CpuQuietPeriod;
  networkQuietPeriod: CpuQuietPeriod;
  cpuQuietPeriods: CpuQuietPeriod[];
  networkQuietPeriods: CpuQuietPeriod[];
  timestamp: number;
  timeInMs: number;
}

interface CpuQuietPeriod {
  start: number;
  end: number;
}

interface Firstinteractive {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo7;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo7 {
  value: Value6;
}

interface Value6 {
  timeInMs: number;
  timestamp: number;
}

interface Timetofirstbyte {
  score: boolean;
  displayValue: string;
  rawValue: number;
  debugString: string;
  extendedInfo: ExtendedInfo6;
  scoringMode: string;
  informative: boolean;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo6 {
  value: Value5;
}

interface Value5 {
  wastedMs: number;
}

interface Errorsinconsole {
  score: boolean;
  displayValue: string;
  rawValue: number;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details3;
}

interface Details3 {
  type: string;
  header: string;
  itemHeaders: ItemHeader[];
  items: any[];
}

interface ItemHeader {
  type: string;
  itemType: string;
  text: string;
}

interface Estimatedinputlatency {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo5;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo5 {
  value: Value4[];
}

interface Value4 {
  percentile: number;
  time: number;
}

interface Screenshotthumbnails {
  score: number;
  displayValue: string;
  rawValue: boolean;
  scoringMode: string;
  informative: boolean;
  name: string;
  description: string;
  helpText: string;
  details: Details2;
}

interface Details2 {
  type: string;
  scale: number;
  items: Item[];
}

interface Item {
  timing: number;
  timestamp: number;
  data: string;
}

interface Speedindexmetric {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo4;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo4 {
  value: Value3;
}

interface Value3 {
  timings: Timings;
  timestamps: Timings;
  frames: Frame[];
}

interface Frame {
  timestamp: number;
  progress: number;
}

interface Timings {
  firstVisualChange: number;
  visuallyReady: number;
  visuallyComplete: number;
  perceptualSpeedIndex: number;
}

interface Loadfastenoughforpwa {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  extendedInfo: ExtendedInfo3;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo3 {
  value: Value2;
}

interface Value2 {
  areLatenciesAll3G: boolean;
  firstRequestLatencies: FirstRequestLatency[];
  isFast: boolean;
  timeToFirstInteractive: number;
}

interface FirstRequestLatency {
  url: string;
  latency: string;
}

interface Firstmeaningfulpaint {
  score: number;
  displayValue: string;
  rawValue: number;
  extendedInfo: ExtendedInfo2;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface ExtendedInfo2 {
  value: Value;
}

interface Value {
  timestamps: Timestamps;
  timings: Timestamps;
  fmpFellBack: boolean;
}

interface Timestamps {
  navStart: number;
  fCP: number;
  fMP: number;
  onLoad: number;
  endOfTrace: number;
}

interface Worksoffline {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  debugString: string;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface Redirectshttp {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
}

interface Isonhttps {
  score: boolean;
  displayValue: string;
  rawValue: boolean;
  extendedInfo: ExtendedInfo;
  scoringMode: string;
  name: string;
  description: string;
  helpText: string;
  details: Details;
}

interface Details {
  type: string;
  header: Header;
  items: any[];
}

interface Header {
  type: string;
  text: string;
}

interface BlinkFeatureFirstUsed {
  AnimatedCSSFeatures: any[];
  CSSFeatures: CSSFeatures;
  Features: Features;
}

type Features = {
  LangAttribute: number;
  XMLDocument: number;
  UnprefixedUserTiming: number;
  SecureContextCheckPassed: number;
  CSSValueAppearanceNone: number;
  V8Performance_Timing_AttributeGetter: number;
  CSSAtRuleKeyframes: number;
  DocumentUnloadRegistered: number;
  CryptoGetRandomValues: number;
  V8MessageChannel_Constructor: number;
  CSSValueAppearanceTextField: number;
  CrossOriginMainFrameNulledNameAccessed: number;
  IntersectionObserver_Constructor: number;
  CSSAtRuleSupports: number;
  SVGSVGElementInXMLDocument: number;
  SVGSVGElementInDocument: number;
  TimeElement: number;
  SecureContextCheckForSandboxedOriginFailed: number;
  CSSValueAppearanceButton: number;
  UnprefixedRequestAnimationFrame: number;
  UnprefixedPerformanceTimeline: number;
  CSSFilterBlur: number;
  SecureContextCheckFailed: number;
  AspectRatioFlexItem: number;
  V8StrictMode: number;
  CSSSelectorIndirectAdjacent: number;
  V8MessagePort_PostMessage_Method: number;
  XSSAuditorEnabledBlock: number;
  SVGSVGElement: number;
  LangAttributeOnHTML: number;
  CSSAtRuleMedia: number;
  CleanScriptElementWithNonce: number;
  V8SloppyMode: number;
  StarInTimingAllowOrigin: number;
};

type CSSFeatures = {
  CSSPropertyBackgroundRepeat: number;
  CSSPropertyStrokeDashoffset: number;
  CSSPropertyPosition: number;
  CSSPropertyOutline: number;
  CSSPropertyAlignSelf: number;
  CSSPropertyFont: number;
  CSSPropertyOverflow: number;
  CSSPropertyFontFamily: number;
  CSSPropertyBackgroundColor: number;
  CSSPropertyFontWeight: number;
  CSSPropertyTransform: number;
  CSSPropertyObjectFit: number;
  CSSPropertyListStyle: number;
  CSSPropertyOverflowX: number;
  CSSPropertyOverflowY: number;
  CSSPropertyClip: number;
  CSSPropertyCursor: number;
  CSSPropertyTextAlign: number;
  CSSPropertyMaxWidth: number;
  CSSPropertyMargin: number;
  CSSPropertyFlex: number;
  CSSPropertyTop: number;
  CSSPropertyAlignItems: number;
  CSSPropertyWebkitAppearance: number;
  CSSPropertyTextDecoration: number;
  CSSPropertyAnimationFillMode: number;
  CSSPropertyHeight: number;
  CSSPropertyBackground: number;
  CSSPropertyStrokeLinecap: number;
  CSSPropertyStrokeDasharray: number;
  CSSPropertyFloat: number;
  CSSPropertyLetterSpacing: number;
  CSSPropertyStroke: number;
  CSSPropertyMinHeight: number;
  CSSPropertyUserSelect: number;
  CSSPropertyBackgroundPosition: number;
  CSSPropertyLineHeight: number;
  CSSPropertyOutlineOffset: number;
  CSSPropertyTransformOrigin: number;
  CSSPropertyFill: number;
  CSSPropertyOpacity: number;
  CSSPropertyAnimation: number;
  CSSPropertyAliasWebkitUserSelect: number;
  CSSPropertyMarginTop: number;
  CSSPropertyTextOverflow: number;
  CSSPropertyPadding: number;
  CSSPropertyWhiteSpace: number;
  CSSPropertyTextTransform: number;
  CSSPropertyBoxSizing: number;
  CSSPropertyJustifyContent: number;
  CSSPropertyBoxShadow: number;
  CSSPropertyMinWidth: number;
  CSSPropertyFontSize: number;
  CSSPropertyVerticalAlign: number;
  CSSPropertyBackgroundSize: number;
  CSSPropertyTransition: number;
  CSSPropertyBorderColor: number;
  CSSPropertyPaddingBottom: number;
  CSSPropertyZIndex: number;
  CSSPropertyBorder: number;
  CSSPropertyMarginBottom: number;
  CSSPropertyVisibility: number;
  CSSPropertyFlexGrow: number;
  CSSPropertyBackgroundImage: number;
  CSSPropertyAliasWebkitTextSizeAdjust: number;
  CSSPropertyLeft: number;
  CSSPropertyContent: number;
  CSSPropertyFilter: number;
  CSSPropertyBorderBottom: number;
  CSSPropertyColor: number;
  CSSPropertyDisplay: number;
  CSSPropertyWidth: number;
  CSSPropertyBorderRadius: number;
  CSSPropertyFlexDirection: number;
  CSSPropertyWebkitBackgroundClip: number;
  CSSPropertyScrollBehavior: number;
};

interface ChromeUserTiming {
  name: string;
  time: number;
}

interface Request {
  ip_addr: string;
  initiator_line: number | string;
  bytesOut: number;
  load_ms: number;
  http2_stream_id: number;
  http2_stream_weight: number;
  request_id: string;
  image_save?: number;
  minify_total?: any;
  cacheControl: string;
  score_cdn: number;
  id: string;
  dns_end: number;
  priority: string;
  http2_stream_exclusive: string;
  image_total?: number;
  minify_save?: any;
  score_cookies: number;
  ttfb_ms: number;
  score_cache: number;
  connect_start: number;
  score_compress: number;
  cache_time?: number;
  load_start: number;
  server_port?: string;
  protocol: string;
  score_gzip: number;
  type: number;
  full_url: string;
  ssl_end: number;
  objectSize: number;
  gzip_total?: number;
  socket_group?: string;
  contentType: string;
  initiator_column: string;
  expires: string;
  score_combine: number;
  score_etags: number;
  frame_id: string;
  host: string;
  bytesIn: number;
  raw_id: string;
  gzip_save?: number;
  'score_keep-alive': number;
  is_secure: number;
  dns_start: number;
  server_count?: any;
  score_minify: number;
  initiator: string;
  connect_ms: number;
  socket: number;
  url: string;
  ssl_start: number;
  client_port?: string;
  method: string;
  headers: Headers;
  dns_ms: number;
  connect_end: number;
  server_rtt?: any;
  responseCode: number;
  ssl_ms: number;
  http2_stream_dependency: number;
  contentEncoding: string;
  cdn_provider?: string;
  load_end: number;
  ttfb_start: number;
  ttfb_end: number;
  download_start: number;
  download_end: number;
  download_ms: number;
  all_start: number;
  all_end: number;
  all_ms: number;
  index: number;
  number: number;
  objectSizeUncompressed?: number;
  final_base_page?: boolean;
  is_base_page?: boolean;
  score_progressive_jpeg?: number;
  jpeg_scan_count?: number;
}

interface Headers {
  request: string[];
  response: string[];
}
