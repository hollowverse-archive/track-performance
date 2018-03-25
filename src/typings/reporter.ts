import { GlobalConfig } from '../config';

export type TestRecord = {
  name: string;
  scores: Array<number | boolean | string | null>;
  formatScore(score: number | string | boolean | null | undefined): string;
};

export type Report = {
  name: string;
  /**
   * This is used for the first column of the rendered report
   * @default 'Test'
   */
  testName?: string;
  url?: string;
} & (
  | {
      error: Error;
    }
  | {
      records: TestRecord[];
      /** These are used for the columns after the first one in the rendered report */
      scoreNames: string[];
    });

export declare class GenericReporter {
  constructor(config?: Pick<GlobalConfig, keyof GlobalConfig>);
  getReports(): Promise<Report[]>;
}

export type GenericReporterClass = new (
  config?: Pick<GlobalConfig, keyof GlobalConfig>,
) => GenericReporter;

export declare class PageReporter extends GenericReporter {
  constructor(url: string, config?: Pick<GlobalConfig, keyof GlobalConfig>);
}

export type PageReporterClass = new (
  url: string,
  config?: Pick<GlobalConfig, keyof GlobalConfig>,
) => PageReporter;
