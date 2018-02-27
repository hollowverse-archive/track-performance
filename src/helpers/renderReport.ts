import { source, stripIndents } from 'common-tags';
import { Report } from '../typings/reporter';

type GeneratedAggregatedReportOptions = {
  reports: Report[];
};

export const renderReport = ({
  reports,
}: GeneratedAggregatedReportOptions) => stripIndents`
  ${source`
    ${reports.map(report => {
      return `\n${source`
        ### ${report.url ? `[${report.name}](${report.url})` : report.name}

        Test | First View | Repeat View
        -----|------------|-------------
        ${report.records.map(({ name, scores, formatScore }) => {
          return `${name} | ${formatScore(scores.firstView)} | ${formatScore(
            scores.repeatView,
          )}`;
        })}
      `}`;
    })}
  `}
`;
