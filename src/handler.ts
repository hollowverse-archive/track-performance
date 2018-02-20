// The following module is actually @types/aws-lambda,
// and it only provides types.
// This is how `@types/*` packages can be used in TypeScript.
//
// Not to be confused with https://www.npmjs.com/package/aws-lambda
import { Handler } from 'aws-lambda'; // tslint:disable-line:no-implicit-dependencies

// @ts-ignore
export const hello: Handler = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);
};
