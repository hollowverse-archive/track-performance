// The following module is actually @types/aws-lambda,
// and it only provides types.
// This is how `@types/*` packages can be used in TypeScript.
//
// Not to be confused with https://www.npmjs.com/package/aws-lambda
import { Handler } from 'aws-lambda'; // tslint:disable-line:no-implicit-dependencies

const runReporters: Handler = (_event, _context, callback) => {
  callback(null, 'Hello World');
};

exports.runReporters = runReporters;
