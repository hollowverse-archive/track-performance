// The following module is actually @types/aws-lambda,
// and it only provides types.
// This is how `@types/*` packages can be used in TypeScript.
//
// Not to be confused with https://www.npmjs.com/package/aws-lambda
import { Handler } from 'aws-lambda'; // tslint:disable-line:no-implicit-dependencies
import WebPageTest from 'webpagetest';
import bluebird from 'bluebird';

const API_KEY = process.env.WPT_API_KEY;

export const runReporters: Handler = async (_event, _context, callback) => {
  const wpt = new WebPageTest('www.webpagetest.org', API_KEY);

  const runTest = bluebird.promisify(wpt.runTest).bind(wpt);
  const getTestResults = bluebird.promisify(wpt.getTestResults).bind(wpt);
  const { data: { testId } }: WebPageTest.RunTestResponse = await runTest(
    'https://hollowverse.com',
    {
      lighthouse: true,
    },
  );

  // tslint:disable-next-line:no-console
  console.log(await getTestResults(testId));

  callback(null, 'Hello World');
};
