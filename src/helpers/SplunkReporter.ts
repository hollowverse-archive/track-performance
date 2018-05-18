import { post } from 'got';
import { globalAgent as globalHttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

type SplunkReporterConfig = {
  token: string;
  endpoint: string;
  source?: string;
  host?: string;
};

export class SplunkReporter<T extends object> {
  private endpoint: string;
  private source?: string;
  private host?: string;

  private queue: (T & { host?: string; source?: string })[] = [];

  public token: string;
  public maxQueueLength = 20;

  constructor({ token, endpoint, source, host }: SplunkReporterConfig) {
    this.token = token;
    this.endpoint = endpoint;
    this.source = source;
    this.host = host;
  }

  async addEventToQueue(event: T) {
    const { source, host } = this;
    this.queue.push(Object.assign({ source, host }, event));

    if (this.queue.length >= this.maxQueueLength) {
      await this.flushEvents();
    }
  }

  async flushEvents() {
    await post(this.endpoint, {
      body: this.queue.map(event => JSON.stringify(event)).join(''),
      agent: {
        http: globalHttpAgent,
        https: new HttpsAgent({
          rejectUnauthorized: false,
        }),
      },
      headers: {
        Authorization: `Splunk ${this.token}`,
      },
    });
    this.queue = [];
  }
}
