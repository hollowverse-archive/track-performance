import got from 'got';
import { PageReporter, Report } from '../typings/reporter';
import { defaultFormat } from '../helpers/format';
import debouncePromise from 'p-debounce';
import { oneLine } from 'common-tags';

export class SecurityHeadersReporter implements PageReporter {
  private static API_ENDPOINT = 'https://securityheaders.com/';

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
        name: 'Security Headers',
        testName: 'URL',
        scoreNames: ['Grade'],
        records: [
          {
            name: this.url,
            scores: [score],
            formatScore: defaultFormat,
          },
        ],
      },
    ];
  }
}
