// The following module is actually @types/aws-lambda,
// and it only provides types.
// This is how `@types/*` packages can be used in TypeScript.
//
// Not to be confused with https://www.npmjs.com/package/aws-lambda
import { Handler } from 'aws-lambda'; // tslint:disable-line:no-implicit-dependencies
import { collectReports } from './helpers/collectReports';
import { format as formatDate } from 'date-fns';
import bluebird from 'bluebird';
import NodeGit from 'nodegit';
import { join } from 'path';
import { octokit } from './helpers/github';
import { renderReport } from './helpers/renderReport';
import tmp from 'tmp';
import { WebPageTestReporter } from './reporters/WebPageTestReporter';
import { SecurityHeadersReporter } from './reporters/SecurityHeadersReporter';
import { config } from './config';
import { keyBy, mapValues } from 'lodash';
import { writeFile } from './helpers/writeFile';
import { stripIndents } from 'common-tags';
import prettier from 'prettier';

// tslint:disable no-console
// tslint:disable-next-line:max-func-body-length
export const runReporters: Handler = async (_event, _context) => {
  const urls = ['https://hollowverse.com', 'https://hollowverse.com/Tom_Hanks'];
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

  const rawReports = mapValues(keyBy(results, r => r.url), r => r.raw);
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

  const repoTempDir = tmp.dirSync().name;

  const credentials = (_url: string, userName: string) => {
    return NodeGit.Cred.sshKeyNew(
      userName,
      config.sshKeyPublicKeyPath,
      config.sshPrivateKeyPath,
      '',
    );
  };

  const branchName = `report-${dateStr}`;
  const repo = await NodeGit.Clone.clone(
    'git@github.com:hollowverse/perf-reports.git',
    repoTempDir,
    {
      fetchOpts: {
        callbacks: {
          credentials,
        },
      },
    },
  );

  const repoPath = repo.workdir();

  console.log('Repo cloned to', repoPath);

  const filesToAdd = {
    'mostRecent.md': markdownReport,
    'mostRecent.json': JSON.stringify(rawReports, undefined, 2),
  };

  await bluebird.map(
    Object.entries(filesToAdd),
    async ([fileName, contents]) => {
      await writeFile(join(repoPath, fileName), contents);
    },
  );

  console.info('Report files written');

  const hollowbotSignature = NodeGit.Signature.now(
    'hollowbot',
    'hollowbot@hollowverse.com',
  );

  await repo.createBranch(
    branchName,
    await repo.getReferenceCommit('HEAD'),
    false,
    hollowbotSignature,
    '',
  );

  await repo.checkoutBranch(branchName);

  await repo.createCommitOnHead(
    Object.keys(filesToAdd),
    hollowbotSignature,
    hollowbotSignature,
    `Update report file with results from ${dateStr}`,
  );

  const remote = await repo.getRemote('origin');
  const ref = await repo.getReference(branchName);

  await NodeGit.Branch.setUpstream(ref, branchName);

  if (process.env.PUSH === 'true') {
    await remote.push([`+${ref.toString()}`], {
      callbacks: {
        credentials,
      },
    });

    await octokit.pullRequests.create({
      owner: 'hollowverse',
      repo: 'perf-reports',
      base: 'master',
      head: branchName,
      // @ts-ignore
      title: `Update report to ${dateStr}`,
      body: markdownReport,
    });

    console.log('Pull request created');
  }
};
