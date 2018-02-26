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
import { join, relative } from 'path';
import fs from 'fs';
import { octokit } from './helpers/github';
import { generateAggregatedReport } from './helpers/generateReport';
import tmp from 'tmp';
import { WebPageTestReporter } from './reporters/WebPageTestReporter';
import { SecurityHeadersReporter } from './reporters/SecurityHeadersReporter';

const sshKeyPublicKeyPath = join(process.cwd(), 'secrets/rsa_id.pub');
const sshPrivateKeyPath = join(process.cwd(), 'secrets/rsa_id');

// tslint:disable no-console
// tslint:disable-next-line:max-func-body-length
export const runReporters: Handler = async (_event, _context) => {
  const urls = ['https://hollowverse.com', 'https://hollowverse.com/Tom_Hanks'];
  const date = new Date();
  const dateStr = formatDate(date, 'YYYY-MM-DD');

  const renderedReports = await bluebird.map(urls, async url => {
    const reports = await collectReports({
      url,
      reporters: [SecurityHeadersReporter, WebPageTestReporter],
    });

    return generateAggregatedReport({
      reports,
      date,
      testedUrl: url,
    });
  });

  const reportBody = renderedReports.join('\n\n');

  const repoTempDir = tmp.dirSync().name;

  const credentials = (_url: string, userName: string) => {
    return NodeGit.Cred.sshKeyNew(
      userName,
      sshKeyPublicKeyPath,
      sshPrivateKeyPath,
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

  const reportFilePath = join(repoPath, 'mostRecent.md');

  fs.writeFileSync(reportFilePath, reportBody);

  console.info('Report file written to', reportFilePath);

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
    [relative(repoPath, reportFilePath)],
    hollowbotSignature,
    hollowbotSignature,
    `Update report file with results from ${date}`,
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
      body: reportBody,
    });

    console.log('Pull request created');
  }
};
