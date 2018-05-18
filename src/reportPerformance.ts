import bluebird from 'bluebird';
import prettier from 'prettier';
import { collectReports } from './helpers/collectReports';
import { getConfig } from './config';
import { format as formatDate } from 'date-fns';
import { renderReport } from './helpers/renderReport';
import { stripIndents } from 'common-tags';
import { SecurityHeadersReporter } from './reporters/SecurityHeadersReporter';
import { WebPageTestReporter } from './reporters/WebPageTestReporter';
import { MobileFriendlinessReporter } from './reporters/MobileFriendlinessReporter';
import { AwsLambdaHealthReporter } from './reporters/AwsLambdaHealthReporter';
import { GenericReporterClass, PageReporterClass } from './typings/reporter';

// tslint:disable no-console max-func-body-length
export const reportPerformance = async () => {
  const config = await getConfig();

  const urls = ['https://hollowverse.com', 'https://hollowverse.com/Tom_Hanks'];

  const pageReporters: PageReporterClass[] = [
    SecurityHeadersReporter,
    MobileFriendlinessReporter,
    WebPageTestReporter,
  ];

  const genericReporters: GenericReporterClass[] = [AwsLambdaHealthReporter];

  const pageReportsPromise = bluebird.map(urls, async url => ({
    url,
    reports: await collectReports({
      reporters: pageReporters.map(ReporterClass => ({
        name: ReporterClass.name,
        instance: new ReporterClass(url, config),
      })),
    }),
  }));

  const genericReportersPromise = collectReports({
    reporters: genericReporters.map(ReporterClass => ({
      name: ReporterClass.name,
      instance: new ReporterClass(config),
    })),
  });

  const genericReports = await genericReportersPromise;
  const pageReports = await pageReportsPromise;

  if (process.env.STAGE === 'local') {
    const dateStr = formatDate(new Date(), 'YYYY-MM-DD');
    let markdownReport = stripIndents`
      Report for tests performed on ${dateStr}
      ========================================

      ${pageReports
        .map(
          ({ url, reports }) => `
        ## ${url}

        ${reports
          .map(report => renderReport(report, { headingLevel: 3 }))
          .join('\n'.repeat(2))}
      `,
        )
        .join('\n'.repeat(2))}

      ${genericReports
        .map(report => renderReport(report, { headingLevel: 2 }))
        .join('\n'.repeat(2))}
    `;

    markdownReport = prettier.format(markdownReport, { parser: 'markdown' });
    console.info(markdownReport);

    return;
  }

  if (config.shouldPush) {
  }
};
