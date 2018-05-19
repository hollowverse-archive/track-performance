#! /usr/bin/env node

/* eslint-disable no-console */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const {
  executeCommands,
} = require('@hollowverse/utils/helpers/executeCommands');

const { IS_PULL_REQUEST } = process.env;

const isPullRequest = IS_PULL_REQUEST !== 'false';

async function main() {
  const buildCommands = ['yarn test'];
  const deploymentCommands = [
    'NODE_ENV=production yarn serverless deploy --stage production --force',
  ];

  let isDeployment = false;
  if (isPullRequest === true) {
    console.info('Skipping deployment commands in PRs');
  } else {
    isDeployment = true;
  }

  try {
    await executeCommands(
      isDeployment ? [...buildCommands, ...deploymentCommands] : buildCommands,
    );
  } catch (e) {
    console.error('Build/deployment failed:', e);
    process.exit(1);
  }
}

main();
