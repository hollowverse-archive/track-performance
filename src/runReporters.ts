// The following module is actually @types/aws-lambda,
// and it only provides types.
// This is how `@types/*` packages can be used in TypeScript.
//
// Not to be confused with https://www.npmjs.com/package/aws-lambda
import { Handler } from 'aws-lambda'; // tslint:disable-line:no-implicit-dependencies
import { collectReports } from './helpers/collectReports';
import { format as formatDate } from 'date-fns';
import { source, stripIndents } from 'common-tags';
import NodeGit from 'nodegit';
import { join, relative } from 'path';
import fs from 'fs';
import { octokit } from './helpers/github';
import tmp from 'tmp';
import { SecurityHeadersReporter } from './reporters/securityheaders';
// import { WebPageTestReporter } from './reporters/wpt';

const sshKeyPublicKeyPath = join(process.cwd(), 'secrets/rsa_id.pub');
const sshPrivateKeyPath = join(process.cwd(), 'secrets/rsa_id');

// tslint:disable no-console
// tslint:disable-next-line:max-func-body-length
export const runReporters: Handler = async (_event, _context) => {
  const reports = await collectReports({
    url: 'https://hollowverse.com',
    reporters: [SecurityHeadersReporter],
  });

  const repoTempDir = tmp.dirSync().name;

  const date = formatDate(new Date(), 'YYYY-MM-DD');

  const reportBody = stripIndents`
        Report for tests performed on ${date}
        ========================================
        ${source`
          ${reports.map(report => {
            return `\n${source`
              ${report.name}
              -----------------------

              Test | First View | Repeat View
              -----|------------|-------------
              ${report.records.map(({ name, scores, formatScore }) => {
                return `${name} | ${formatScore(
                  scores.firstView,
                )} | ${formatScore(scores.repeatView)}`;
              })}
            `}`;
          })}
        `}
      `;

  console.log(reportBody);

  const credentials = (_url: string, userName: string) => {
    return NodeGit.Cred.sshKeyNew(
      userName,
      sshKeyPublicKeyPath,
      sshPrivateKeyPath,
      '',
    );
  };

  const branchName = `report-${date}`;
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
      title: `Update report to ${date}`,
      body: reportBody,
    });

    console.log('Pull request created');
  }
};
