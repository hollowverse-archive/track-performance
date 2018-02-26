import { identity, flow } from 'lodash';
import { Reporter, Report, TestRecord } from '../typings/reporter';

import WebPageTest, {
  Response,
  RunTestResponse,
  TestResults,
} from 'webpagetest';
import bluebird from 'bluebird';
import {
  getNumberOfRequests,
  lighthouseKeys,
  lighthouseKeyToName,
} from '../helpers/webpagetest';

import {
  divideBy,
  formatFixedWithUnit,
  formatPercent,
  defaultFormat,
} from '../helpers/format';

const API_KEY = process.env.WPT_API_KEY;

export class WebPageTestReporter implements Reporter {
  private url: string = this.url;
  private wpt = new WebPageTest('www.webpagetest.org', API_KEY);

  static getLighthouseRecords(
    data: TestResults.BaseTestResultsWithLighthouse,
  ): TestRecord[] {
    const { firstView, repeatView } = data.median;

    return lighthouseKeys.map((key): TestRecord => {
      const { unit, name } = lighthouseKeyToName[key];
      const formatScore =
        unit === 'percent'
          ? formatPercent
          : unit === 'ms'
            ? flow(divideBy(1000), formatFixedWithUnit('s'))
            : defaultFormat;

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

  async getReports() {
    const runTestResponse = await bluebird.fromNode<RunTestResponse>(cb => {
      this.wpt.runTest(
        this.url,
        {
          connectivity: '3G',
          location: 'Dulles_iPhone6s',
          lighthouse: true,
          pageSpeed: true,
          keepOriginalUserAgent: true,
          pollResults: 5,
        },
        cb,
      );
    });

    if (
      runTestResponse.statusCode !== 200 &&
      runTestResponse.statusCode !== 201
    ) {
      throw new Error('Expected run test response to be 200');
    }

    const { testId } = runTestResponse.data;

    const testResultsResponse = await bluebird.fromNode<
      Response<TestResults.BaseTestResultsWithLighthouse>
    >(cb => {
      this.wpt.getTestResults(testId, cb);
    });

    if (testResultsResponse.statusCode !== 200) {
      throw new Error('Expected test results response to be 200');
    }

    const { data } = testResultsResponse;

    return <Report[]>[
      {
        name: 'WebPageTest',
        records: [
          {
            name: 'Number of requests',
            scores: {
              firstView: getNumberOfRequests(data.median.firstView),
              repeatView: getNumberOfRequests(data.median.repeatView),
            },
            formatScore: identity,
          },
          {
            name: 'Time to first byte',
            scores: {
              firstView: data.median.firstView.TTFB,
              repeatView: data.median.repeatView.TTFB,
            },
            formatScore: identity,
          },
        ],
      },
      {
        name: 'Lighthouse via WebPageTest',
        records: WebPageTestReporter.getLighthouseRecords(data),
      },
    ];
  }
}
