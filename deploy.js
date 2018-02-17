#! /usr/bin/env node

/* eslint-disable no-console */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const shelljs = require('shelljs');
const decryptSecrets = require('@hollowverse/common/helpers/decryptSecrets');
const executeCommands = require('@hollowverse/common/helpers/executeCommands');
const createZipFile = require('@hollowverse/common/helpers/createZipFile');

const { ENC_PASS_SUMO, IS_PULL_REQUEST, PROJECT, BRANCH } = shelljs.env;

const isPullRequest = IS_PULL_REQUEST !== 'false';

const secrets = [
  {
    password: ENC_PASS_SUMO,
    decryptedFilename: 'sumo.json',
  },
];

const functionName = `${PROJECT}-${BRANCH}`;

async function main() {
  const buildCommands = ['yarn test', 'yarn build'];
  const deploymentCommands = [
    () => decryptSecrets(secrets, './secrets'),
    () =>
      createZipFile(
        'build.zip',
        ['dist/**/*', 'secrets/**/*', 'yarn.lock', 'package.json'],
        ['secrets/**/*.enc', 'secrets/**/*.d.ts'],
      ),
    `aws lambda update-function-code --function-name ${functionName} --zip-file build.zip`,
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
