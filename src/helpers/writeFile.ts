import fs from 'fs';
import bluebird from 'bluebird';

export const writeFile = async (
  path: string,
  contents: string | Buffer | ReadableStream,
) => {
  await bluebird.fromNode(cb => fs.writeFile(path, contents, cb));
};
