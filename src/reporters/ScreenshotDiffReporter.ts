import got, { GotPromise } from 'got';
import { Reporter, Report } from '../typings/reporter';
import debouncePromise from 'p-debounce';
import pixelmatch from 'pixelmatch';
import bluebird from 'bluebird';

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

  constructor(url: string) {
    this.url = url;
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

    return bluebird.race<Report[]>([
      ScreenshotDiffReporter.waitForScreenshotUrl({ jobId }).then(async url => {
        const image = await got(url);
        const referenceImage = await s3;
        const diff = pixelmatch(
          image,
          referenceImage,
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
      }),
      bluebird.delay(3000).then(() => {
        throw new TypeError('Screenshot reporter timed out');
      }),
    ]);
  }
}
