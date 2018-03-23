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
      let body: string;

      if ('error' in report) {
        body = `Failed to run this reporter: ${report.error.message}`;
      } else {
        body = source`
          ${report.testName || 'Name'} | ${report.scoreNames.join(' | ')}
          -----| ${Array(report.scoreNames.length)
            .fill('-------------')
            .join('|')}
          ${report.records.map(({ name, scores, formatScore }) => {
            return `${name} | ${scores.map(formatScore).join(' | ')}`;
          })}
      `;
      }

      return `\n${source`
        ### ${report.url ? `[${report.name}](${report.url})` : report.name}

        ${body}
      `}`;
    })}
  `}
`;
