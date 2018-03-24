import { flatten } from 'lodash';
import { PageReporter, Report, GenericReporter } from '../typings/reporter';
import bluebird from 'bluebird';

type CollectReportsOptions = {
  reporters: Array<{ name: string; instance: PageReporter | GenericReporter }>;
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
          return instance.getReports();
        } catch (error) {
          return [
            {
              name,
              error,
            },
          ];
        }
      },
      { concurrency },
    ),
  );
};
