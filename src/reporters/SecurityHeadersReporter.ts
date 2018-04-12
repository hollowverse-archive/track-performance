import got from 'got';
import { PageReporter, Report } from '../typings/reporter';
import { defaultFormat } from '../helpers/format';
import debouncePromise from 'p-debounce';

export class SecurityHeadersReporter implements PageReporter {
  private static API_ENDPOINT = 'https://securityheaders.io/';

  private static getApiResponse = debouncePromise(
    async ({ url }: { url: string }) =>
      got.head(SecurityHeadersReporter.API_ENDPOINT, {
        query: {
          q: url,
          followRedirects: true,
        },
        followRedirect: true,
      }),
    1000,
  );

  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getReports(): Promise<Report[]> {
    const response = await SecurityHeadersReporter.getApiResponse({
      url: this.url,
    });

    return [
      {
        name: 'Security Headers',
        testName: 'URL',
        scoreNames: ['Grade'],
        records: [
          {
            name: this.url,
            scores: [response.headers['x-grade'] as string],
            formatScore: defaultFormat,
          },
        ],
      },
    ];
  }
}
