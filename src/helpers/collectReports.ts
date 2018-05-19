import { flatten } from 'lodash';
import { Reporter, Report } from '../typings/reporter';
import bluebird from 'bluebird';

type CollectReportsOptions = {
  reporters: Array<{ name: string; instance: Reporter }>;
  concurrency?: number;
};

export const collectReports = async ({
  reporters,
  concurrency = 3,
}: CollectReportsOptions) => {
  return flatten(
    await bluebird.map(
      reporters,
      async ({ name, instance }): Promise<Report[]> => {
        try {
          return await instance.getReports();
        } catch (error) {
          console.error(`Failed to run this reporter: ${name}`);

          return [];
        }
      },
      { concurrency },
    ),
  );
};
