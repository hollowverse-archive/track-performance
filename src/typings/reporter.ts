import { GlobalConfig } from '../config';

export type TestRecord = {
  name: string;
  scores: {
    firstView: number | boolean | string | null;
    repeatView?: number | boolean | string | null;
  };
  formatScore(score: number | string | boolean | null | undefined): string;
};

export type Report = {
  name: string;
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
