import { join } from 'path';

const sshKeyPublicKeyPath = join(process.cwd(), 'secrets/sshPublicKey');
const sshPrivateKeyPath = join(process.cwd(), 'secrets/sshPrivateKey');

export const config = {
  sshKeyPublicKeyPath,
  sshPrivateKeyPath,
  webpagetest: {
    apiKey: process.env.WPT_API_KEY,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
  },
};

export type GlobalConfig = typeof config;
