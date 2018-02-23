import Octokit from '@octokit/rest';

export const octokit = new Octokit();

octokit.authenticate({
  token: process.env.GITHUB_ACCESS_TOKEN,
  type: 'token',
});
