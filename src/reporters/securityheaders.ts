import got from 'got';
import { Reporter, Report } from '../typings/reporter';
import { defaultFormat } from '../helpers/format';

export class SecurityHeadersReporter implements Reporter {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getReports() {
    const response = await got.head('https://securityheaders.io/', {
      query: {
        q: this.url,
        followRedirects: true,
      },
      followRedirect: true,
    });

    return <Report[]>[
      {
        name: 'Security Headers',
        records: [
          {
            name: 'Grade',
            scores: {
              firstView: response.headers['x-grade'] as string,
            },
            formatScore: defaultFormat,
          },
        ],
      },
    ];
  }
}
