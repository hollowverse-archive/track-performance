import { PageReporter, Report, TestRecord } from '../typings/reporter';

import WebPageTest, { TestResults, RunTestResponse } from 'webpagetest';
import bluebird from 'bluebird';
import {
  getNumberOfRequests,
  lighthouseKeys,
  lighthouseKeyToName,
  hasLighthouseData,
  isSuccessfulResponse,
  isWaitUntilTestCompleteResponse,
} from '../helpers/webpagetest';

import { oneLine } from 'common-tags';

import {
  formatMillisecondsAsSeconds,
  formatPercent,
  defaultFormat,
  formatBytesAsKibibytes,
} from '../helpers/format';
import { GlobalConfig } from '../config';

export class WebPageTestReporter implements PageReporter {
  // tslint:disable-next-line:no-multiline-string
  private static CUSTOM_USER_AGENT = oneLine`
    Mozilla/5.0 (Linux;
    Android 4.4.2; Nexus 4 Build/KOT49H)
    AppleWebKit/537.36 (KHTML, like Gecko)
    Chrome/65.0.3325.162
    Mobile Safari/537.36
    WebPageTest
  `;

  private url: string;
  private wpt: WebPageTest;

  constructor(url: string, config?: Pick<GlobalConfig, 'webpagetest'>) {
    if (config === undefined || !config.webpagetest.apiKey) {
      throw new TypeError(
        'Expected global configuration to include WPT configuration',
      );
    }

    this.url = url;
    this.wpt = new WebPageTest(
      'www.webpagetest.org',
      config.webpagetest.apiKey,
    );
  }

  static getLighthouseRecords(
    data: TestResults.BaseTestResultsWithLighthouse,
  ): TestRecord[] {
    const { firstView, repeatView } = data.median;

    return lighthouseKeys.map((key): TestRecord => {
      const { unit, name } = lighthouseKeyToName[key];
      const formatScore =
        unit === 'percent'
          ? formatPercent
          : unit === 'ms' ? formatMillisecondsAsSeconds : defaultFormat;

      return {
        formatScore,
        name: name,
        scores: [firstView[key], repeatView[key]],
      };
    });
  }

  async getReports(): Promise<Report[]> {
    const runTestResponse = await bluebird.fromNode<RunTestResponse>(cb => {
      this.wpt.runTest(
        this.url,
        {
          connectivity: '3G',
          location: 'Dulles_MotoG4',
          lighthouse: true,
          keepOriginalUserAgent: true,
          pollResults: 5,
          userAgent: WebPageTestReporter.CUSTOM_USER_AGENT,
        },
        cb,
      );
    });

    if (
      // tslint:disable-next-line use-default-type-parameter
      isSuccessfulResponse<any>(runTestResponse) &&
      isWaitUntilTestCompleteResponse(runTestResponse)
    ) {
      const { data } = runTestResponse;

      const reports: Report[] = [
        {
          name: 'WebPageTest',
          url: data.summary,
          scoreNames: ['First View', 'Repeat View'],
          records: [
            {
              name: 'Number of requests',
              scores: [data.median.firstView, data.median.repeatView].map(
                getNumberOfRequests,
              ),
              formatScore: defaultFormat,
            },
            {
              name: 'Time to first byte',
              scores: [data.median.firstView.TTFB, data.median.repeatView.TTFB],
              formatScore: formatMillisecondsAsSeconds,
            },
            {
              name: 'Fully loaded',
              scores: [
                data.median.firstView.fullyLoaded,
                data.median.repeatView.fullyLoaded,
              ],
              formatScore: formatMillisecondsAsSeconds,
            },
            {
              name: 'Response size',
              scores: [
                data.median.firstView.bytesIn,
                data.median.repeatView.bytesIn,
              ],
              formatScore: formatBytesAsKibibytes,
            },
            {
              name: 'Response size (compressed)',
              scores: [
                data.median.firstView.gzip_total,
                data.median.repeatView.gzip_total,
              ],
              formatScore: formatBytesAsKibibytes,
            },
          ],
        },
      ];

      if (hasLighthouseData(runTestResponse)) {
        reports.push({
          name: 'Lighthouse via WebPageTest',
          scoreNames: ['First View', 'Repeat View'],
          records: WebPageTestReporter.getLighthouseRecords(
            runTestResponse.data,
          ),
        });
      } else {
        // tslint:disable-next-line:no-multiline-string
        console.warn(oneLine`
          Could not find Lighthouse data in WPT API response.
          Does the location specified support Lighthouse?
          For a list of test locations, see
          http://www.webpagetest.org/getLocations.php?f=html
        `);
      }

      return reports;
    }

    throw new TypeError('Unsuccessful WPT API response');
  }
}
