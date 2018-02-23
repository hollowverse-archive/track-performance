// The following module is actually @types/aws-lambda,
// and it only provides types.
// This is how `@types/*` packages can be used in TypeScript.
//
// Not to be confused with https://www.npmjs.com/package/aws-lambda
import { Handler } from 'aws-lambda'; // tslint:disable-line:no-implicit-dependencies
// @ts-ignore
import WebPageTest from 'webpagetest';
import bluebird from 'bluebird';

const API_KEY = process.env.WPT_API_KEY;
const testId = '180223_Z3_07a959de4f9ba659edf75fe3e4bacafe';

export const runReporters: Handler = async (_event, _context, callback) => {
  const wpt = new WebPageTest('www.webpagetest.org', API_KEY);

  const result = await bluebird.fromNode<WebPageTest.RunTestResponse>(cb => {
    wpt.runTest('https://hollowverse.com', cb);
  });

  // if (result.statusCode === 200) {
  // const { testId } = result.data;
  const results = await bluebird.fromNode(cb => {
    wpt.getTestResults(testId, cb);
  });

  callback(null, results);
  // } else {
  // callback(new Error(result.statusText), result);
  // }
};
