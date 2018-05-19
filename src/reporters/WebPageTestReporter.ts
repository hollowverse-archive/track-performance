import { Reporter, Report, TestRecord } from '../typings/reporter';

import WebPageTest, { TestResults, RunTestResponse } from 'webpagetest';
import bluebird from 'bluebird';
import {
  lighthouseKeys,
  lighthouseKeyToName,
  hasLighthouseData,
  isSuccessfulResponse,
  isWaitUntilTestCompleteResponse,
} from '../helpers/webpagetest';

import { oneLine } from 'common-tags';

import { GlobalConfig } from '../config';

export class WebPageTestReporter implements Reporter {
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
    view: TestResults.View<TestResults.LighthouseResults>,
  ): TestRecord[] {
    return lighthouseKeys.map((key): TestRecord => {
      const { name } = lighthouseKeyToName[key];

      return {
        id: name,
        value: view[key],
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
      const {
        data: { summary: url, median: { firstView, repeatView } },
      } = runTestResponse;

      let reports: Report[] = [firstView, repeatView].map(
        (view, i): Report => ({
          testName: `WebPageTest (${i === 0 ? 'First View' : 'Repeat View'})`,
          url,
          records: [
            {
              id: 'Number of requests',
              value: view.requests.length,
            },
            {
              id: 'Time to first byte',
              value: view.TTFB,
            },
            {
              id: 'Fully loaded',
              value: view.fullyLoaded,
            },
            {
              id: 'Response size',
              value: view.bytesIn,
            },
            {
              id: 'Response size (compressed)',
              value: view.gzip_total,
            },
          ],
        }),
      );

      if (hasLighthouseData(runTestResponse)) {
        reports = [
          ...reports,
          ...[
            runTestResponse.data.median.firstView,
            runTestResponse.data.median.repeatView,
          ].map((view, i) => ({
            testName: `Lighthouse via WebPageTest (${
              i === 0 ? 'First View' : 'Repeat View'
            })`,
            records: WebPageTestReporter.getLighthouseRecords(view),
          })),
        ];
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
