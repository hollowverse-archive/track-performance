// The following module is actually @types/aws-lambda,
// and it only provides types.
// This is how `@types/*` packages can be used in TypeScript.
//
// Not to be confused with https://www.npmjs.com/package/aws-lambda
import Octokit from '@octokit/rest';
import bluebird from 'bluebird';
import executeCommand from '@hollowverse/common/helpers/executeCommand';
import executeCommands from '@hollowverse/common/helpers/executeCommands';
import initGit from 'lambda-git';
import prettier from 'prettier';
import shelljs from 'shelljs';
import tmp from 'tmp';
import { Handler } from 'aws-lambda'; // tslint:disable-line:no-implicit-dependencies
import { SecurityHeadersReporter } from './reporters/SecurityHeadersReporter';
import { WebPageTestReporter } from './reporters/WebPageTestReporter';
import { collectReports } from './helpers/collectReports';
import { config } from './config';
import { format as formatDate } from 'date-fns';
import { join } from 'path';
import { renderReport } from './helpers/renderReport';
import { stripIndents } from 'common-tags';
import { writeFile } from './helpers/writeFile';

// tslint:disable no-console
// tslint:disable-next-line:max-func-body-length
export const runReporters: Handler = async (_event, _context, done) => {
  try {
    const urls = [
      'https://hollowverse.com/?branch=master',
      'https://hollowverse.com/Tom_Hanks?branch=master',
    ];
    const dateStr = formatDate(new Date(), 'YYYY-MM-DD');

    const results = await bluebird.map(urls, async url => {
      const reports = await collectReports({
        url,
        config,
        reporters: [SecurityHeadersReporter, WebPageTestReporter],
      });

      return {
        url,
        raw: reports,
        rendered: renderReport({
          reports,
        }),
      };
    });

    let markdownReport = stripIndents`
      Report for tests performed on ${dateStr}
      ========================================

      ${results
        .map(({ url, rendered }) => {
          return stripIndents`
            [${url}](${url})
            ------------------------------

            ${rendered}
        `;
        })
        .join('\n'.repeat(3))}
    `;

    markdownReport = prettier.format(markdownReport, { parser: 'markdown' });

    const repoPath = tmp.dirSync().name;
    const branchName = `report-${dateStr}`;
    const filesToAdd = {
      'mostRecent.md': markdownReport,
    };

    await executeCommands([
      async () => {
        if (process.env.AWS === 'true') {
          await initGit();
          shelljs.env.LD_LIBRARY_PATH += ':/tmp/git/usr/lib64';
        }
      },
      () => {
        shelljs.cp(config.sshPrivateKeyPath, '/tmp/privateKey');
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
    ]);

    if (process.env.PUSH === 'true') {
      await executeCommand(`git push origin -u ${branchName} --force`);

      const octokit = new Octokit();

      octokit.authenticate({
        token: config.github.token,
        type: 'token',
      });

      const { number } = await octokit.pullRequests.create({
        owner: 'hollowverse',
        repo: 'perf-reports',
        base: 'master',
        head: branchName,
        // @ts-ignore
        title: `Update report to ${dateStr}`,
        body: markdownReport,
      });

      await octokit.issues.edit({
        owner: 'hollowverse',
        repo: 'perf-reports',
        number,
        labels: ['report'],
      });

      try {
        await octokit.pullRequests.merge({
          owner: 'hollowverse',
          repo: 'perf-reports',
          number,
        });
      } catch {
        console.error('Failed to merge PR.');
      }

      done(null, 'Pull request created');
    }
  } catch (error) {
    done(error);
  }
};
