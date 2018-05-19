import { GlobalConfig } from '../config';

export type TestRecord = {
  id: string;
  description?: string;
  value: number | boolean | string | null;
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

export declare class Reporter {
  constructor(url: string, config?: Pick<GlobalConfig, keyof GlobalConfig>);
  getReports(): Promise<Report[]>;
}

export type ReporterClass = new (
  url: string,
  config?: Pick<GlobalConfig, keyof GlobalConfig>,
) => Reporter;
