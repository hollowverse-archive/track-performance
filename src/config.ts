import bluebird from 'bluebird';
import { readAwsSecretsForStage } from '@hollowverse/utils/helpers/readAwsSecretsForStage';

export const getConfig = async () => {
  const secrets = await readAwsSecretsForStage([
    'wpt/apiKey',
    'github/hollowbot/accessToken',
    'google/searchConsoleApis/apiKey',
    'hollowbot/sshPrivateKey',
  ]);

  return {
    sshPrivateKey: secrets['hollowbot/sshPrivateKey'],
    shouldPush: process.env.NODE_ENV === 'production',
    shouldInstallGit: process.env.NODE_ENV !== 'local',
    webpagetest: {
      apiKey: secrets['wpt/apiKey'],
    },
    github: {
      token: secrets['github/hollowbot/accessToken'],
    },
    google: {
      apiKey: secrets['google/searchConsoleApis/apiKey'],
    },
  };
};

type UnboxPromise<T> = T extends Promise<infer R> ? R : T;

export type GlobalConfig = UnboxPromise<ReturnType<typeof getConfig>>;
