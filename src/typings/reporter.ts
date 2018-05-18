import { GlobalConfig } from '../config';

export type TestRecord = {
  id: string;
  description?: string;
  value: number | boolean | string | null;
  formatScore(score: number | string | boolean | null | undefined): string;
};

export type Report = {
  testName: string;
  url?: string;
} & (
  | {
      error: Error;
    }
  | {
      records: TestRecord[];
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
