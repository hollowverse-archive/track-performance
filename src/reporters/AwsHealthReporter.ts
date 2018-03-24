import { GenericReporter, Report } from '../typings/reporter';
import awsSdk from 'aws-sdk';

const formatAwsHealth = (color: 'Green' | 'Red' | 'Yellow' | 'Grey') => {
  switch (color) {
    case 'Green':
      return ':heavy_check_mark: OK';
    case 'Red':
      return ':red_circle: Error';
    case 'Yellow':
      return ':warning: Warning';
    default:
      return ':grey_question: Unknown';
  }
};

export class AwsHealthReporter implements GenericReporter {
  private eb: AWS.ElasticBeanstalk;

  constructor() {
    this.eb = new awsSdk.ElasticBeanstalk({
      apiVersion: '2010-12-01',
    });
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
        name: 'Elastic Beanstalk Health',
        url:
          'https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/health-enhanced-status.html',
        testName: 'Environment',
        scoreNames: ['Health'],
        records: Environments.map(env => ({
          name: env.EnvironmentName || 'Unknown environment',
          scores: [env.Health || 'Grey'],
          formatScore: formatAwsHealth,
        })),
      },
    ];
  }
}
