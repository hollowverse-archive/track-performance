import got from 'got';

type Report = {
  score: string;
};

declare class Reporter {
  constructor(url: string);
  getReport(): Promise<Report>;
}

export class SecurityHeadersReporter implements Reporter {
  private url: string = this.url;

  async getReport() {
    const response = await got.head(this.url, {
      query: {
        followRedirects: true,
      },
    });

    return {
      score: response.headers['x-grade'] as string,
    };
  }
}
