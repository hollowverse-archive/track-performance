import { flatten } from 'lodash';
import { Reporter, Report } from '../typings/reporter';
import bluebird from 'bluebird';

type CollectReportsOptions = {
  url: string;
  reporters: Array<new (url: string) => Reporter>;
  concurrency?: number;
};

export const collectReports = async ({
  url,
  reporters,
  concurrency = 3,
}: CollectReportsOptions): Promise<Report[]> => {
  return flatten(
    await bluebird.map(
      reporters,
      async ReporterClass => {
        const r = new ReporterClass(url);

        return r.getReports();
      },
      { concurrency },
    ),
  );
};
