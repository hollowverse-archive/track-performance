// The following module is actually @types/aws-lambda,
// and it only provides types.
// This is how `@types/*` packages can be used in TypeScript.
//
// Not to be confused with https://www.npmjs.com/package/aws-lambda
import { Handler } from 'aws-lambda'; // tslint:disable-line:no-implicit-dependencies
import WebPageTest, {
  Response,
  RunTestResponse,
  TestResults,
} from 'webpagetest';
import bluebird from 'bluebird';
import {
  getNumberOfRequests,
  lighthouseKeys,
  lighthouseKeyToName,
  hasLighthouseData,
} from './helpers/webpagetest';
import { format as formatDate } from 'date-fns';
import { source, stripIndents } from 'common-tags';
import { compact, sortBy } from 'lodash';
import NodeGit from 'nodegit';
import { join, relative } from 'path';
import fs from 'fs';
import { octokit } from './helpers/github';
import tmp from 'tmp';

const API_KEY = process.env.WPT_API_KEY;
const testId = '180130_TZ_35993622f9c0ec75ca70ddbacf6b7675';

const sshKeyPublicKeyPath = join(process.cwd(), 'secrets/rsa_id.pub');
const sshPrivateKeyPath = join(process.cwd(), 'secrets/rsa_id');

// tslint:disable no-console
// tslint:disable-next-line:max-func-body-length
export const runReporters: Handler = async (_event, _context) => {
  const wpt = new WebPageTest('www.webpagetest.org', API_KEY);

  const result = await bluebird.fromNode<RunTestResponse>(cb => {
    wpt.runTest('https://hollowverse.com', cb);
  });

  if (result.statusCode === 200) {
    // const { testId } = result.data;
    const results = await bluebird.fromNode<
      Response<TestResults.BaseTestResults>
    >(cb => {
      wpt.getTestResults(testId, cb);
    });

    if (results.statusCode !== 200) {
      throw new Error('statusCode is not 200');
    }
    const repoTempDir = tmp.dirSync().name;
    const { data } = results;

    const { firstView, repeatView } = data.runs[1];

    const date = formatDate(new Date(), 'YYYY-MM-DD');

    const reportBody = stripIndents`
        Report for tests performed on ${date}
        ========================================
        ${source`
          ${compact([firstView, repeatView]).map((view, i) => {
            const record: Record<string, string | number> = {};

            if (hasLighthouseData(view)) {
              for (const key of lighthouseKeys) {
                const { unit, name } = lighthouseKeyToName[key];
                const value = view[key];
                const formatted =
                  unit === 'percent'
                    ? value.toLocaleString('en-US', { style: 'percent' })
                    : unit === 'ms' ? `${(value / 1000).toFixed(2)}s` : value;

                record[name] = formatted;
              }
            }

            record['Number of requests'] = getNumberOfRequests(view);

            return `\n${source`
              ${i === 0 ? 'First View' : 'Repeat View'}
              -----------------------

              Test | Value
              -----|---------
              ${sortBy(Object.entries(record), ([key]) => key).map(
                ([key, value]) => {
                  return `${key} | ${value}`;
                },
              )}
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
  } else {
    throw new Error(result.statusText);
  }
};
