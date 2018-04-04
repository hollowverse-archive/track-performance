import { GenericReporter, Report } from '../typings/reporter';
import awsSdk from 'aws-sdk';

const awsColorsToFormattedColors: Record<string, string> = {
  Green: ':heavy_check_mark: Green',
  Red: ':red_circle: Red',
  Yellow: ':warning: Yellow',
  Grey: ':grey_question: Unknown',
};

const formatAwsHealth = (color: string) => {
  return awsColorsToFormattedColors[color] || awsColorsToFormattedColors.Grey;
};

export class AwsElasticBeanstalkHealthReporter implements GenericReporter {
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
