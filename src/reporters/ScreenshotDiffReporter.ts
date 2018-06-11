import got, { GotPromise } from 'got';
import { Reporter, Report } from '../typings/reporter';
import debouncePromise from 'p-debounce';
import pixelmatch from 'pixelmatch';
import bluebird from 'bluebird';
import { S3 } from 'aws-sdk';
import { GlobalConfig } from '../config';
import jimp from 'jimp';

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
      state: 'pending';
    });

type PostScreenshotResponse = {
  job_id: string;
  state: 'done' | 'pending';
  callback_url: string | null;
  win_res: string;
  mac_res: string;
  quality: string;
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

  private static startScreenshotJobs = debouncePromise(
    async ({
      url,
      username,
      apiKey,
      browsers,
    }: {
      url: string;
      username: string;
      apiKey: string;
      browsers: Browser[];
    }): Promise<string> => {
      const { body } = await got.post(ScreenshotDiffReporter.API_ENDPOINT, {
        auth: `${username}:${apiKey}`,
        body: {
          url,
          browsers,
        },
        json: true,
      });

      return (body as PostScreenshotResponse).job_id;
    },
    1000,
  );

  private static getScreenshotsJob = debouncePromise(
    async ({
      jobId,
      username,
      apiKey,
    }: {
      jobId: string;
      username: string;
      apiKey: string;
    }): Promise<GotPromise<GetJobResponse>> =>
      got(`${ScreenshotDiffReporter.API_ENDPOINT}/${jobId}.json`, {
        auth: `${username}:${apiKey}`,
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

  private static waitForScreenshots = async ({
    pollInterval = 500,
    maxNumAttempts = 5,
    ...restOptions
  }: {
    pollInterval?: number;
    maxNumAttempts?: number;
    username: string;
    apiKey: string;
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
      await bluebird.delay(pollInterval);
    }
    /* eslint-enable no-await-in-loop */

    return [];
  };

  async getReports(): Promise<Report[]> {
    const jobId = await ScreenshotDiffReporter.startScreenshotJobs({
      url: this.url,
      apiKey: this.apiKey,
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
      apiKey: this.apiKey,
      username: this.username,
    });

    return bluebird.map(screenshots, async screenshot => {
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

      const [
        { bitmap: { width: refWidth, height: refHeight } },
        { bitmap: { width: newWidth, height: newHeight } },
      ] = await bluebird.map([referenceImage, newImage], async imageBuffer =>
        jimp.read(imageBuffer),
      );

      const diff = pixelmatch(
        referenceImage,
        newImage,
        null,
        Math.min(refWidth, newWidth),
        Math.min(refHeight, newHeight),
      );

      return {
        testName: `Screenshot Diff (${screenshotId})`,
        records: [
          {
            id: 'diff',
            value: diff,
          },
        ],
      };
    });
  }
}
