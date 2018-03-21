import { Reporter, Report } from '../typings/reporter';

export class AwsHealthReporter implements Reporter {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getReports(): Promise<Report[]> {
    return [
      {
        name: 'AWS Health',
        error: new Error('Not implemented yet'),
      },
    ];
  }
}
