import got from 'got';
import { Reporter, Report } from '../typings/reporter';
import { oneLine } from 'common-tags';
import pThrottle from 'p-throttle';

export class SecurityHeadersReporter implements Reporter {
  private static API_ENDPOINT = 'https://securityheaders.com/';

  private static getApiResponse = pThrottle(
    async ({ url }: { url: string }) =>
      got.head(SecurityHeadersReporter.API_ENDPOINT, {
        query: {
          q: url,
          followRedirects: true,
        },
        followRedirect: true,
      }),
    1,
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

    const score = response.headers['x-grade'];

    if (score === undefined) {
      throw new TypeError(
        'Expected securityheaders.com API call to have a header named "x-grade"',
      );
    } else if (Array.isArray(score)) {
      throw new TypeError(oneLine`
        Expected securityheaders.com API call to return exactly
        one header named "x-grade", instead got ${score.length}
        headers with that name.
      `);
    }

    return [
      {
        testName: 'Security Headers',
        records: [
          {
            id: 'grade',
            value: score,
          },
        ],
      },
    ];
  }
}
