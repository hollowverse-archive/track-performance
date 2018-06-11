import got, { GotPromise } from 'got';
import { Reporter, Report } from '../typings/reporter';
import debouncePromise from 'p-debounce';
import pixelmatch from 'pixelmatch';
import bluebird from 'bluebird';
import { S3 } from 'aws-sdk';
import { GlobalConfig } from '../config';
import { URL } from 'url';

/* eslint-disable camelcase */
type ScreenshotResponseBody = {
  job_id: string;
  state: 'done';
  callback_url?: string;
  win_res: string;
  mac_res: string;
  quality: 'compressed' | 'original';
  wait_time: number;
  screenshots: Array<{
    id: string;
    os: string;
    os_version: string;
    browser: string;
    browser_version: string;
    url: string;
  }> &
    (
      | {
          state: 'done';
          thumb_url: string;
          image_url: string;
          created_at: string;
        }
      | {
          state: 'pending';
        });
};
/* eslint-enable camelcase */

export class ScreenshotDiffReporter implements Reporter {
  private static API_ENDPOINT = 'https://www.browserstack.com/screenshots';

  private static startScreenshotJobs = debouncePromise(
    async ({
      url,
      username,
      password,
    }: {
      url: string;
      username: string;
      password: string;
    }): Promise<GotPromise<ScreenshotResponseBody>> =>
      got.post(ScreenshotDiffReporter.API_ENDPOINT, {
        auth: `${username}:${password}`,
        body: {
          url,
          browsers: [
            {
              browser: 'chrome',
              browser_version: '41.0',
              os: 'Windows',
              os_version: '10',
            },
          ],
        },
        json: true,
      }),
    1000,
  );

  private url: string;
  private bucketName: string;
  private username: string;
  private apiKey: string;
  private s3 = new S3();

  constructor(url: string, config?: Pick<GlobalConfig, 'browserstack'>) {
    this.url = url;

    if (
      !config ||
      !config.browserstack.apiKey ||
      !config.browserstack.username ||
      !config.browserstack.screenshotsBucket
    ) {
      throw new TypeError(
        'Invalid configuration provided to ScreenshotDiffReporter constructor',
      );
    }

    this.bucketName = config.browserstack.screenshotsBucket;
    this.apiKey = config.browserstack.apiKey;
    this.username = config.browserstack.username;
  }

  private static getScreenshotUrl = async ({
    jobId,
    username,
    password,
  }: {
    username: string;
    password: string;
    jobId: string;
  }) => {
    const { body } = await got(
      `${ScreenshotDiffReporter.API_ENDPOINT}/${jobId}.json`,
      {
        auth: `${username}:${password}`,
        json: true,
      },
    );

    if (body.state === 'done') {
      return body.screenshots[0].image_url;
    }

    return undefined;
  };

  private static waitForScreenshotUrl = async (options: {
    username: string;
    password: string;
    jobId: string;
  }) => {
    let url: string | undefined;

    while (url === undefined) {
      url = await ScreenshotDiffReporter.getScreenshotUrl(options);
      if (!url) {
        await bluebird.delay(500);
      }
    }

    return url;
  };

  async getReports(): Promise<Report[]> {
    const { body } = await ScreenshotDiffReporter.startScreenshotJobs({
      url: this.url,
      password: this.apiKey,
      username: this.username,
    });

    const jobId = body.job_id;

    const url = await ScreenshotDiffReporter.waitForScreenshotUrl({
      jobId,
      password: this.apiKey,
      username: this.username,
    });

    const newImagePromise = got(url, { encoding: null }).then(
      async res => res.body,
    );

    const { pathname, hostname } = new URL(this.url);
    const s3ImageKey = `screenshots/${hostname}/${pathname}/referenceScreenshot.png`;

    const referenceImagePromise = this.s3
      .getObject({
        Bucket: this.bucketName,
        Key: s3ImageKey,
      })
      .promise()
      .then(res => res.Body)
      .catch(() => undefined);

    const [newImage, referenceImage] = await Promise.all([
      newImagePromise,
      referenceImagePromise,
    ]);

    await this.s3
      .putObject({
        Bucket: this.bucketName,
        Key: s3ImageKey,
        Body: newImage,
      })
      .promise();

    if (!referenceImage || !(referenceImage instanceof Buffer)) {
      throw new TypeError('Could not find reference image');
    }

    const diff = pixelmatch(referenceImage, newImage, null, 1024, 1644);

    return [
      {
        testName: 'Screenshot Diff',
        records: [
          {
            id: 'diff',
            value: diff,
          },
        ],
      },
    ];
  }
}
