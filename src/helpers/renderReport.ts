import { source } from 'common-tags';
import { Report } from '../typings/reporter';

export const renderReport = (report: Report, { headingLevel = 2 }) => {
  const title = report.url ? `[${report.name}](${report.url})` : report.name;
  let body: string;

  if ('error' in report) {
    body = `Failed to run this reporter: ${report.error.message}`;
  } else {
    body = source`
      ${report.testName || 'Test'} | ${report.scoreNames.join(' | ')}
      -----${'|---'.repeat(report.scoreNames.length)}
      ${report.records.map(({ name, scores, formatScore }) => {
        return `${name} | ${scores.map(formatScore).join(' | ')}`;
      })}
    `;
  }

  return source`
    ${'#'.repeat(headingLevel)} ${title}

    ${body}
  `;
};
