import got, { GotPromise } from 'got';
import { Reporter, Report } from '../typings/reporter';
import pixelmatch from 'pixelmatch';
import bluebird from 'bluebird';
import { S3 } from 'aws-sdk';
import { GlobalConfig } from '../config';

/* eslint-disable camelcase */
type Screenshot = {
  id: string;
  os: string;
  os_version: string;
  browser: string;
  browser_version: string;
  url: string;
  orientation: 'portrait' | 'landscape' | null;
} & (
  | {
      state: 'done';
      thumb_url: string;
      image_url: string;
      created_at: string;
    }
  | {
      state: 'processing';
    });

type PostScreenshotResponse = {
  job_id: string;
  state: 'done' | 'queued_all';
  callback_url: string | null;
  win_res: string;
  mac_res: string;
  quality: 'compressed' | 'original';
  wait_time: number;
  orientation: string;
  screenshots: Screenshot[];
};

type GetJobResponse = {
  id: string;
} & {
  [K in Exclude<
    keyof PostScreenshotResponse,
    'job_id'
  >]: PostScreenshotResponse[K]
};

type Browser = {
  os: string;
  os_version: string;
  browser: string;
  device?: string | null;
  browser_version?: string | null;
  real_mobile?: boolean | null;
};

/* eslint-enable camelcase */

export class ScreenshotDiffReporter implements Reporter {
  private static API_ENDPOINT = 'https://www.browserstack.com/screenshots';

  private url: string;
  private bucketName: string;
  private username: string;
  private token: string;
  private s3 = new S3();

  constructor(url: string, config?: Pick<GlobalConfig, 'browserStack'>) {
    this.url = url;

    if (
      !config ||
      !config.browserStack.token ||
      !config.browserStack.username ||
      !config.browserStack.screenshotsBucket
    ) {
      throw new TypeError(
        'Invalid configuration provided to ScreenshotDiffReporter constructor',
      );
    }

    this.bucketName = config.browserStack.screenshotsBucket;
    this.token = config.browserStack.token;
    this.username = config.browserStack.username;
  }

  private static startScreenshotsJob = async ({
      url,
      username,
      token,
      browsers,
    }: {
      url: string;
      username: string;
      token: string;
      browsers: Browser[];
    }): Promise<string> => {
      const { body } = await got.post(ScreenshotDiffReporter.API_ENDPOINT, {
        auth: `${username}:${token}`,
        body: {
          url,
          browsers,
        },
        json: true,
      });

      return (body as PostScreenshotResponse).job_id;
  };

  private static getScreenshotsJob = async ({
      jobId,
      username,
      token,
    }: {
      jobId: string;
      username: string;
      token: string;
    }): Promise<GotPromise<GetJobResponse>> =>
      got(`${ScreenshotDiffReporter.API_ENDPOINT}/${jobId}.json`, {
        auth: `${username}:${token}`,
        json: true,
    });

  private static waitForScreenshots = async ({
    pollIntervalMilliseconds = 3000,
    maxNumAttempts = 50,
    ...restOptions
  }: {
    pollIntervalMilliseconds?: number;
    maxNumAttempts?: number;
    username: string;
    token: string;
    jobId: string;
  }) => {
    let numAttempts = 0;

    /* eslint-disable no-await-in-loop */
    while (numAttempts < maxNumAttempts) {
      const { body } = await ScreenshotDiffReporter.getScreenshotsJob(
        restOptions,
      );

      if (body.state === 'done') {
        const { screenshots } = body;
        if (screenshots.every(screenshot => screenshot.state === 'done')) {
          return screenshots;
        }
      }

      numAttempts += 1;
      await bluebird.delay(pollIntervalMilliseconds);
    }
    /* eslint-enable no-await-in-loop */

    return [];
  };

  async getReports(): Promise<Report[]> {
    const jobId = await ScreenshotDiffReporter.startScreenshotsJob({
      url: this.url,
      token: this.token,
      username: this.username,
      browsers: [
        {
          browser: 'chrome',
          browser_version: '41.0',
          os: 'Windows',
          os_version: '10',
        },
      ],
    });

    const screenshots = await ScreenshotDiffReporter.waitForScreenshots({
      jobId,
      token: this.token,
      username: this.username,
    });

    if (screenshots.length === 0) {
      throw new Error(
        `No screenshots were returned from BrowserStack API call. Job ID: ${jobId}`,
      );
    }

    return bluebird.map(screenshots, this.screenshotToDiffReport);
  }

  private screenshotToDiffReport = async (
    screenshot: Screenshot,
  ): Promise<Report> => {
    if (screenshot.state !== 'done') {
      throw new TypeError('Could not get screenshot URL');
    }

    const newImagePromise = got(screenshot.image_url, {
      encoding: null,
    }).then(async res => res.body);

    const {
      url,
      browser,
      os,
      os_version: osVersion,
      browser_version: browserVersion,
    } = screenshot;

    const normalizedUrl = url.replace(/^https?:\/\//, '');
    const screenshotId = `${browser} ${browserVersion} on ${os} ${osVersion}`;
    const s3ImageKey = `screenshots/${normalizedUrl}/${screenshotId}/referenceScreenshot.png`;

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
      throw new TypeError('Could not find reference image in S3 bucket');
    }

    const diff = pixelmatch(referenceImage, newImage, null, 1024, 1644);

    return {
      testName: `Screenshot Diff (${screenshotId})`,
      records: [
        {
          id: 'diff',
          value: diff,
        },
      ],
    };
  };
}
