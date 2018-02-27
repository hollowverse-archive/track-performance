import fs from 'fs';
import bluebird from 'bluebird';

export const writeFile = async (
  path: string,
  contents: string | Buffer | ReadableStream,
) => {
  return bluebird.fromNode(cb => fs.writeFile(path, contents, cb));
};
