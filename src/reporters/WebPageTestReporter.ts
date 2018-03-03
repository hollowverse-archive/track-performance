import { Reporter, Report, TestRecord } from '../typings/reporter';

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

export class WebPageTestReporter implements Reporter {
  // @ts-ignore
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
        scores: {
          firstView: firstView[key],
          repeatView: repeatView[key],
        },
      };
    });
  }

  async getReports(): Promise<Report[]> {
    const runTestResponse = await bluebird.fromNode<RunTestResponse>(cb => {
      // this.wpt.runTest(
      //   this.url,
      //   {
      //     connectivity: '3G',
      //     location: 'Dulles_MotoG4',
      //     lighthouse: true,
      //     pageSpeed: true,
      //     keepOriginalUserAgent: true,
      //     pollResults: 5,
      //   },
      //   cb,
      // );
      this.wpt.getTestResults(
        '180130_TZ_35993622f9c0ec75ca70ddbacf6b7675/',
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
          records: [
            {
              name: 'Number of requests',
              scores: {
                firstView: getNumberOfRequests(data.median.firstView),
                repeatView: getNumberOfRequests(data.median.repeatView),
              },
              formatScore: defaultFormat,
            },
            {
              name: 'Time to first byte',
              scores: {
                firstView: data.median.firstView.TTFB,
                repeatView: data.median.repeatView.TTFB,
              },
              formatScore: formatMillisecondsAsSeconds,
            },
            {
              name: 'Fully loaded',
              scores: {
                firstView: data.median.firstView.fullyLoaded,
                repeatView: data.median.repeatView.fullyLoaded,
              },
              formatScore: formatMillisecondsAsSeconds,
            },
            {
              name: 'Response size',
              scores: {
                firstView: data.median.firstView.bytesIn,
                repeatView: data.median.repeatView.bytesIn,
              },
              formatScore: formatBytesAsKibibytes,
            },
            {
              name: 'Response size (compressed)',
              scores: {
                firstView: data.median.firstView.gzip_total,
                repeatView: data.median.repeatView.gzip_total,
              },
              formatScore: formatBytesAsKibibytes,
            },
          ],
        },
      ];

      if (hasLighthouseData(runTestResponse)) {
        reports.push({
          name: 'Lighthouse via WebPageTest',
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
