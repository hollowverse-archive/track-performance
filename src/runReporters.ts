// The following module is actually @types/aws-lambda,
// and it only provides types.
// This is how `@types/*` packages can be used in TypeScript.
//
// Not to be confused with https://www.npmjs.com/package/aws-lambda
import { Handler } from 'aws-lambda'; // tslint:disable-line:no-implicit-dependencies
import WebPageTest, {
  Response,
  RunTestResponse,
  TestResults,
} from 'webpagetest';
import bluebird from 'bluebird';
import { getNumberOfRequests } from './helpers/webpagetest';
import { octokit } from './helpers/github';

const API_KEY = process.env.WPT_API_KEY;
const testId = '180130_TZ_35993622f9c0ec75ca70ddbacf6b7675';

const hasLighthouseData = (
  view: TestResults.View,
): view is TestResults.View<TestResults.LighthouseResults> => {
  return 'lighthouse.Performance' in view;
};

export const runReporters: Handler = async (_event, _context) => {
  const wpt = new WebPageTest('www.webpagetest.org', API_KEY);

  const result = await bluebird.fromNode<RunTestResponse>(cb => {
    wpt.runTest('https://hollowverse.com', cb);
  });

  if (result.statusCode === 200) {
    // const { testId } = result.data;
    const results = await bluebird.fromNode<
      Response<TestResults.BaseTestResults>
    >(cb => {
      wpt.getTestResults(testId, cb);
    });

    const lighthouseKeyToName: Record<
      keyof TestResults.LighthouseResults,
      { name: string; unit: 'percent' | 'ms' | 'none' }
    > = {
      'lighthouse.Performance': { name: 'Performance', unit: 'percent' },
      'lighthouse.Performance.first-meaningful-paint': {
        name: 'First Meaningful Paint',
        unit: 'ms',
      },
      'lighthouse.Performance.first-interactive': {
        name: 'First Interactive',
        unit: 'ms',
      },
      'lighthouse.Performance.consistently-interactive': {
        name: 'Consistently Interactive',
        unit: 'ms',
      },
      'lighthouse.Performance.speed-index-metric': {
        name: 'Speed Index Metric',
        unit: 'none',
      },
      'lighthouse.Performance.estimated-input-latency': {
        name: 'Estimated Input Latency',
        unit: 'ms',
      },
      'lighthouse.ProgressiveWebApp': { name: 'PWA', unit: 'percent' },
      'lighthouse.Accessibility': { name: 'Accessibility', unit: 'percent' },
      'lighthouse.BestPractices': { name: 'Best Practices', unit: 'percent' },
      'lighthouse.SEO': { name: 'SEO', unit: 'percent' },
    };

    const lighthouseKeys = Object.keys(lighthouseKeyToName) as [
      keyof typeof lighthouseKeyToName
    ];

    const issues = await octokit.issues.getForRepo({
      owner: 'hollowverse',
      repo: 'hollowverse',
      state: 'open',
      per_page: 5,
    });

    console.log(issues.data.map((issue: any) => issue.title));

    if (results.statusCode === 200) {
      const firstView = results.data.runs[1].firstView;
      if (hasLighthouseData(firstView)) {
        for (const key of lighthouseKeys) {
          const { unit, name } = lighthouseKeyToName[key];
          const value = firstView[key];
          console.log(
            name,
            unit === 'percent'
              ? value.toLocaleString('en-US', { style: 'percent' })
              : unit === 'ms' ? `${(value / 1000).toFixed(2)}s` : value,
          );
        }
      }

      const numberOfRequests = getNumberOfRequests(firstView);

      console.log(numberOfRequests);

      return 'ok';
    } else {
      return results;
    }
  } else {
    throw new Error(result.statusText);
  }
};
