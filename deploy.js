#! /usr/bin/env node

/* eslint-disable no-console */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const shelljs = require('shelljs');
const { decryptSecrets } = require('@hollowverse/utils/helpers/decryptSecrets');
const {
  executeCommands,
} = require('@hollowverse/utils/helpers/executeCommands');

const {
  ENC_PASS_GITHUB,
  ENC_PASS_WPT,
  ENC_PASS_GOOGLE,
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
    password: ENC_PASS_GOOGLE,
    decryptedFilename: 'google.json',
  },
  {
    password: ENC_PASS_SSH_PRIVATE_KEY,
    decryptedFilename: 'sshPrivateKey',
  },
];

async function main() {
  const buildCommands = ['yarn test'];
  const deploymentCommands = [
    () => decryptSecrets(secrets, './secrets'),
    'NODE_ENV=production yarn serverless deploy --stage production --force',
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
