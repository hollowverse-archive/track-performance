import { GlobalConfig } from '../config';

export type TestRecord = {
  name: string;
  scores: {
    firstView: number | string;
    repeatView?: number | string;
  };
  formatScore(score: number | string | undefined): string;
};

export type Report = {
  name: string;
  url?: string;
  records: TestRecord[];
};

export declare class Reporter {
  constructor(url: string, config?: Pick<GlobalConfig, keyof GlobalConfig>);
  getReports(): Promise<Report[]>;
}
