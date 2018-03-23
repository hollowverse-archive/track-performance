import { Reporter, Report } from '../typings/reporter';
import awsSdk from 'aws-sdk';
import { defaultFormat } from '../helpers/format';

export class AwsHealthReporter implements Reporter {
  private eb: AWS.ElasticBeanstalk;

  constructor(_url: string) {
    this.eb = new awsSdk.ElasticBeanstalk();
  }

  async getReports(): Promise<Report[]> {
    const { Environments } = await this.eb
      .describeEnvironments({
        IncludeDeleted: false,
      })
      .promise();

    if (!Environments) {
      throw new Error(
        'Expected ElasticBeanstalk API call to return a list of environments',
      );
    }

    return [
      {
        name: 'AWS Health',
        records: Environments.map(env => ({
          name: env.EnvironmentName!,
          scores: {
            firstView: env.Health!,
          },
          formatScore: defaultFormat,
        })),
      },
    ];
  }
}
