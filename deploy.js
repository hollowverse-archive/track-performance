#! /usr/bin/env node

/* eslint-disable no-console */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const shelljs = require('shelljs');
const decryptSecrets = require('@hollowverse/common/helpers/decryptSecrets');
const executeCommands = require('@hollowverse/common/helpers/executeCommands');

const {
  ENC_PASS_GITHUB,
  ENC_PASS_WPT,
  ENC_PASS_SSH_PRIVATE_KEY,
  IS_PULL_REQUEST,
} = shelljs.env;

const isPullRequest = IS_PULL_REQUEST !== 'false';

const secrets = [
  {
    password: ENC_PASS_GITHUB,
    decryptedFilename: 'github.json',
  },
  {
    password: ENC_PASS_WPT,
    decryptedFilename: 'webpagetest.json',
  },
  {
    password: ENC_PASS_SSH_PRIVATE_KEY,
    decryptedFilename: 'sshPrivateKey',
  },
];

async function main() {
  const buildCommands = ['npm test'];
  const deploymentCommands = [
    () => decryptSecrets(secrets, './secrets'),
    './node_modules/.bin/synp --source-file yarn.lock',
    'NODE_ENV=production ./node_modules/.bin/serverless deploy --stage production',
  ];

  let isDeployment = false;
  if (isPullRequest === true) {
    console.info('Skipping deployment commands in PRs');
  } else if (secrets.some(secret => secret.password === undefined)) {
    console.info(
      'Skipping deployment commands because some secrets are not provided',
    );
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
