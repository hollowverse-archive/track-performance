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
import {
  getNumberOfRequests,
  lighthouseKeys,
  lighthouseKeyToName,
  hasLighthouseData,
} from './helpers/webpagetest';

const API_KEY = process.env.WPT_API_KEY;
const testId = '180130_TZ_35993622f9c0ec75ca70ddbacf6b7675';

// tslint:disable no-console
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
