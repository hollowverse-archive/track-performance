import { source, stripIndents } from 'common-tags';
import { Report } from '../typings/reporter';
import { format as formatDate } from 'date-fns';

type GeneratedAggregatedReportOptions = {
  reports: Report[];
  date: Date;
  testedUrl: string;
};

export const generateAggregatedReport = ({
  reports,
  date,
  testedUrl,
}: GeneratedAggregatedReportOptions) => stripIndents`
  Report for tests performed on ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}
  ========================================
  URL tested: ${testedUrl}

  ${source`
    ${reports.map(report => {
      return `\n${source`
        ${report.url ? `[${report.name}](${report.url})` : report.name}
        -----------------------

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
