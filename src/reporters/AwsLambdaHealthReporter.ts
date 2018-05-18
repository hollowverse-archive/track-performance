import { GenericReporter, Report, TestRecord } from '../typings/reporter';
import { CloudWatch, Lambda } from 'aws-sdk';
import moment from 'moment';
import bluebird from 'bluebird';
import { defaultFormat } from '../helpers/format';
import { sum } from 'lodash';

export class AwsLambdaHealthReporter implements GenericReporter {
  private cloudWatch: CloudWatch;
  private lambda: Lambda;

  constructor() {
    this.lambda = new Lambda({
      apiVersion: '2015-03-31',
    });

    this.cloudWatch = new CloudWatch({
      apiVersion: '2010-08-01',
    });
  }

  async getReports(): Promise<Report[]> {
    const { Functions } = await this.lambda.listFunctions().promise();

    if (!Functions) {
      throw new TypeError(
        'Expected AWS Lambda API call to return a list of functions',
      );
    }

    const records = await bluebird.map(
      Functions,
      async ({ FunctionName }): Promise<TestRecord> => {
        if (!FunctionName) {
          throw new TypeError(
            'Expected AWS Lambda API call to include function names',
          );
        }

        const { Datapoints } = await this.cloudWatch
          .getMetricStatistics({
            Namespace: 'AWS/Lambda',
            Dimensions: [
              {
                Name: 'FunctionName',
                Value: FunctionName,
              },
            ],
            Statistics: ['Sum'],
            MetricName: 'Errors',
            Period: 60,
            StartTime: moment()
              .subtract(1, 'day')
              .toDate(),
            EndTime: new Date(),
          })
          .promise();

        if (!Datapoints) {
          throw new TypeError(
            'Expected AWS CloudWatch API call to include datapoints',
          );
        }

        return {
          id: FunctionName,
          scores: [sum(Datapoints.map(({ Sum }) => Sum))],
          formatScore: defaultFormat,
        };
      },
      { concurrency: 10 },
    );

    return [
      {
        name: 'AWS Lambda Health',
        testName: 'Function',
        scoreNames: ['Number of Invocation Errors (for the past 24 hours)'],
        records,
      },
    ];
  }
}
