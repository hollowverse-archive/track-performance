import { source } from 'common-tags';
import { Report } from '../typings/reporter';

export const renderReport = (report: Report, { headingLevel = 2 }) => {
  if ('error' in report) {
    return `Failed to run this reporter: ${report.error.message}`;
  } else {
    const title = report.url ? `[${report.name}](${report.url})` : report.name;

    return source`
      ${'#'.repeat(headingLevel)} ${title}

      ${report.testName || 'Test'} | ${report.scoreNames.join(' | ')}
      -----${'|---'.repeat(report.scoreNames.length)}
      ${report.records.map(({ name, scores, formatScore }) => {
        return `${name} | ${scores.map(formatScore).join(' | ')}`;
      })}
    `;
  }
};
