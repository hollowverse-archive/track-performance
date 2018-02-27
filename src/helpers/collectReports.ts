import { flatten } from 'lodash';
import { Reporter, Report } from '../typings/reporter';
import bluebird from 'bluebird';
import { GlobalConfig } from '../config';

type CollectReportsOptions = {
  url: string;
  config: GlobalConfig;
  reporters: Array<
    new (url: string, config?: Partial<GlobalConfig>) => Reporter
  >;
  concurrency?: number;
};

export const collectReports = async ({
  url,
  reporters,
  config,
  concurrency = 3,
}: CollectReportsOptions): Promise<Report[]> => {
  return flatten(
    await bluebird.map(
      reporters,
      async ReporterClass => {
        const r = new ReporterClass(url, config);

        return r.getReports();
      },
      { concurrency },
    ),
  );
};
