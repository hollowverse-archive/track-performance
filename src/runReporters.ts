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

  const { data: { testId } } = await bluebird.fromNode<
    WebPageTest.RunTestResponse
  >(cb => wpt.runTest('https://hollowverse.com', cb));

  // tslint:disable-next-line:no-console
  console.log(await bluebird.fromNode(cb => wpt.getTestResults(testId, cb)));

  callback(null, 'Hello World');
};
