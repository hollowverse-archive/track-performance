import { readAwsSecretsForStage } from '@hollowverse/utils/helpers/readAwsSecretsForStage';

export const getConfig = async () => {
  const secrets = await readAwsSecretsForStage([
    'wpt/apiKey',
    'google/searchConsoleApis/apiKey',
  ]);

  return {
    shouldPush: process.env.NODE_ENV === 'production',
    webpagetest: {
      apiKey: secrets['wpt/apiKey'],
    },
    google: {
      apiKey: secrets['google/searchConsoleApis/apiKey'],
    },
  };
};

type UnboxPromise<T> = T extends Promise<infer R> ? R : T;

export type GlobalConfig = UnboxPromise<ReturnType<typeof getConfig>>;
