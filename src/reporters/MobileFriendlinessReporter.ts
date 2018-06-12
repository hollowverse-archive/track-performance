import got from 'got';
import { Reporter, Report } from '../typings/reporter';
import { find } from 'lodash';
import { GlobalConfig } from '../config';
import pThrottle from 'p-throttle';

type Rule =
  | 'USES_INCOMPATIBLE_PLUGINS'
  | 'CONFIGURE_VIEWPORT'
  | 'FIXED_WIDTH_VIEWPORT'
  | 'SIZE_CONTENT_TO_VIEWPORT'
  | 'USE_LEGIBLE_FONT_SIZES'
  | 'TAP_TARGETS_TOO_CLOSE';

const ruleKeyToRuleDescription: Record<Rule, string> = {
  USES_INCOMPATIBLE_PLUGINS:
    'Does not use plugins incompatible with mobile devices',
  CONFIGURE_VIEWPORT: 'Viewport is specified using the meta viewport tag',
  FIXED_WIDTH_VIEWPORT: 'Viewport is not defined to a fixed width',
  SIZE_CONTENT_TO_VIEWPORT: 'Content is sized to viewport',
  USE_LEGIBLE_FONT_SIZES:
    'Font size is large enough for easy reading on a small screen',
  TAP_TARGETS_TOO_CLOSE: 'Touch elements are not too close to each other',
};

type GoogleMobileFriendlinessTestResponse = {
  testStatus: {
    status:
      | 'TEST_STATUS_UNSPECIFIED'
      | 'COMPLETE'
      | 'INTERNAL_ERROR'
      | 'PAGE_UNREACHABLE';
    /** Error details if applicable. */
    details: string;
  };
  mobileFriendliness:
    | 'MOBILE_FRIENDLY_TEST_RESULT_UNSPECIFIED'
    | 'MOBILE_FRIENDLY'
    | 'NOT_MOBILE_FRIENDLY';
  mobileFriendlyIssues: Array<{
    rule: Rule;
  }>;
  resourceIssues: Array<{
    blockedResource: {
      url: string;
    };
  }>;
  screenshot?: {
    /**
     * Image data in format determined by the MIME type.
     * Currently, the format will always be "image/png", but this might change in the future.
     * A base64-encoded string.
     */
    data: string;
    mimeType: 'image/png';
  };
};

export class MobileFriendlinessReporter implements Reporter {
  private static API_ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run';

  private static getApiResponse = pThrottle(
    async ({ url, key }: { url: string; key: string }) =>
      got.post(MobileFriendlinessReporter.API_ENDPOINT, {
        json: true,
        query: {
          key,
        },
        body: {
          url,
          requestScreenshot: false,
        },
      }),
    1,
    200,
  );

  private url: string;
  private key: string;

  constructor(url: string, config?: Pick<GlobalConfig, 'google'>) {
    if (config === undefined || !config.google.apiKey) {
      throw new TypeError(
        'Expected global configuration to include Google Search Console APIs key',
      );
    }
    this.key = config.google.apiKey;
    this.url = url;
  }

  async getReports(): Promise<Report[]> {
    const response = await MobileFriendlinessReporter.getApiResponse({
      key: this.key,
      url: this.url,
    });

    const body = response.body as GoogleMobileFriendlinessTestResponse;

    return [
      {
        testName: 'Mobile Friendliness',
        records: [
          {
            id: 'MOBILE_FRIENDLY',
            description: 'Is page mobile friendly?',
            value: body.mobileFriendliness,
          },
          ...Object.keys(ruleKeyToRuleDescription).map(rule => {
            const hasPassed = !find(
              body.mobileFriendlyIssues,
              issue => issue.rule === rule,
            );

            return {
              id: rule,
              description: ruleKeyToRuleDescription[rule as Rule],
              value: hasPassed ? 'passed' : 'failed',
            };
          }),
        ],
      },
    ];
  }
}
