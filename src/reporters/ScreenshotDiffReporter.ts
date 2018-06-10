import got, { GotPromise } from 'got';
import { Reporter, Report } from '../typings/reporter';
import debouncePromise from 'p-debounce';
import pixelmatch from 'pixelmatch';
import bluebird from 'bluebird';
import { S3 } from 'aws-sdk';
import { GlobalConfig } from '../config';

/* eslint-disable camelcase */
type ScreenshotResponseBody = {
  id: string;
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
    }: {
      url: string;
    }): Promise<GotPromise<ScreenshotResponseBody>> =>
      got.post(ScreenshotDiffReporter.API_ENDPOINT, {
        body: {
          url,
          browser: 'chrome',
          browser_version: '41',
          os: 'Windows',
          os_version: '10',
          device: null,
        },
        json: true,
      }),
    1000,
  );

  private url: string;
  private bucketName: string;
  private s3 = new S3();

  constructor(
    url: string,
    { screenshotsBucket }: Pick<GlobalConfig, 'screenshotsBucket'> = {
      screenshotsBucket: undefined,
    },
  ) {
    this.url = url;

    if (!screenshotsBucket) {
      throw new TypeError(
        'Expected a bucket name to be provided to ScreenshotDiffReporter constructor',
      );
    }

    this.bucketName = screenshotsBucket;
  }

  private static getScreenshotUrl = async ({ jobId }: { jobId: string }) => {
    const { body } = await got(
      `${ScreenshotDiffReporter.API_ENDPOINT}/${jobId}.json`,
      {
        json: true,
      },
    );

    if (body.state === 'done') {
      return body.screenshots[0].image_url;
    }

    return undefined;
  };

  private static waitForScreenshotUrl = async ({
    jobId,
  }: {
    jobId: string;
  }) => {
    let url: string | undefined;

    while (url === undefined) {
      url = await ScreenshotDiffReporter.getScreenshotUrl({ jobId });
    }

    return url;
  };

  async getReports(): Promise<Report[]> {
    const { body } = await ScreenshotDiffReporter.startScreenshotJobs({
      url: this.url,
    });

    const jobId = body.id;

    const timeOut = bluebird.delay(3000).then(() => {
      throw new TypeError('Screenshot reporter timed out');
    });

    const reportDiff = ScreenshotDiffReporter.waitForScreenshotUrl({
      jobId,
    }).then(async (url): Promise<Report[]> => {
      const newImagePromise = got(url, { encoding: null }).then(
        async res => res.body,
      );

      const s3ImageKey = `screenshots/${url}/referenceScreenshot.png`;

      const referenceImagePromise = this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: s3ImageKey,
        })
        .promise()
        .then(res => res.Body);

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

      const diff = pixelmatch(
        referenceImage,
        newImage,
        Buffer.alloc(0),
        1020,
        691,
      );

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
    });

    return bluebird.race<Report[]>([reportDiff, timeOut]);
  }
}
