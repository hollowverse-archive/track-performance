import Octokit from '@octokit/rest';
import bluebird from 'bluebird';
import initGit from 'lambda-git';
import prettier from 'prettier';
import shelljs from 'shelljs';
import tmp from 'tmp';
import { collectReports } from './helpers/collectReports';
import { getConfig } from './config';
import { format as formatDate } from 'date-fns';
import { join } from 'path';
import { renderReport } from './helpers/renderReport';
import { stripIndents } from 'common-tags';
import { writeFile } from './helpers/writeFile';
import { executeCommand } from '@hollowverse/utils/helpers/executeCommand';
import { executeCommands } from '@hollowverse/utils/helpers/executeCommands';
import { retryCommand } from '@hollowverse/utils/helpers/retryCommand';
import { SecurityHeadersReporter } from './reporters/SecurityHeadersReporter';
import { WebPageTestReporter } from './reporters/WebPageTestReporter';
import { MobileFriendlinessReporter } from './reporters/MobileFriendlinessReporter';
import { AwsLambdaHealthReporter } from './reporters/AwsLambdaHealthReporter';
import { GenericReporterClass, PageReporterClass } from './typings/reporter';

// tslint:disable no-console max-func-body-length
export const reportPerformance = async () => {
  const config = await getConfig();

  const urls = [
    'https://hollowverse.com',
    'https://hollowverse.com/Tom_Hanks',
    'https://dev.hollowverse.com',
    'https://dev.hollowverse.com/Tom_Hanks',
  ];
  const dateStr = formatDate(new Date(), 'YYYY-MM-DD');

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

  if (process.env.STAGE === 'local') {
    console.info(markdownReport);

    return;
  }

  if (config.shouldPush) {
    const repoPath = tmp.dirSync().name;
    const branchName = `report-${dateStr}`;
    const filesToAdd = {
      'mostRecent.md': markdownReport,
    };

    await executeCommands([
      async () => {
        if (config.shouldInstallGit) {
          await initGit();
          shelljs.env.LD_LIBRARY_PATH += ':/tmp/git/usr/lib64';
        }
      },
      async () => {
        if (!config.sshPrivateKey) {
          throw new TypeError(
            'Expected SSH private key to be provided in configuration',
          );
        }
        await writeFile('/tmp/privateKey', config.sshPrivateKey);
        shelljs.env.GIT_SSH_COMMAND =
          'ssh -o StrictHostKeyChecking=no -i /tmp/privateKey';
      },
      'chmod 600 /tmp/privateKey',
      `git clone git@github.com:hollowverse/perf-reports.git ${repoPath}`,
      () => {
        shelljs.cd(repoPath);
      },
      'git config --local user.name hollowbot',
      'git config --local user.email hollowbot@hollowverse.com',
      `git checkout -b ${branchName}`,
      async () => {
        await bluebird.map(
          Object.entries(filesToAdd),
          async ([fileName, contents]) => {
            await writeFile(join(repoPath, fileName), contents);
          },
        );
      },
      `git add ${Object.keys(filesToAdd).join(' ')}`,
      `git commit -m 'Update report file with results from ${dateStr}'`,
      `git push origin -u ${branchName} --force`,
    ]);

    if (config.github.token === undefined) {
      throw new TypeError(
        'GitHub access token is required but was not provided',
      );
    }

    const octokit = new Octokit();

    octokit.authenticate({
      token: config.github.token,
      type: 'token',
    });

    const { data: { number } } = await octokit.pullRequests.create({
      owner: 'hollowverse',
      repo: 'perf-reports',
      base: 'master',
      head: branchName,
      // @ts-ignore
      title: `Update report to ${dateStr}`,
      body: markdownReport,
    });

    try {
      await octokit.issues.edit({
        owner: 'hollowverse',
        repo: 'perf-reports',
        number,
        labels: ['report'],
      });
    } catch (error) {
      console.error(`Failed to set label on PR ${number}: ${error.message}`);
    }

    try {
      await retryCommand(async () => {
        await octokit.pullRequests.merge({
          owner: 'hollowverse',
          repo: 'perf-reports',
          number,
          merge_method: 'squash',
        });
      }, 3);

      await executeCommand(`git push origin --delete ${branchName}`);
    } catch (error) {
      console.error(`Failed to merge PR ${number}: ${error.message}`);
    }
    console.info('Pull request created');
  }
};
