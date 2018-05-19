import { post } from 'got';
import { globalAgent as globalHttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

type SplunkLoggerConfig = {
  token: string;
  endpoint: string;
  source?: string;
  host?: string;
};

export class SplunkLogger<T extends object> {
  public token: string;
  public maxQueueLength = 20;
  private endpoint: string;
  private source?: string;
  private host?: string;

  private queue: Array<T & { host?: string; source?: string }> = [];

  constructor({ token, endpoint, source, host }: SplunkLoggerConfig) {
    this.token = token;
    this.endpoint = endpoint;
    this.source = source;
    this.host = host;
  }

  async addEventsToQueue(events: T[]) {
    this.queue.push(
      ...events.map(event => ({
        source: this.source,
        host: this.host,
        ...(event as any),
      })),
    );

    if (this.queue.length >= this.maxQueueLength) {
      await this.flushEvents();
    }
  }

  async flushEvents() {
    if (this.queue.length === 0) {
      return;
    }

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
