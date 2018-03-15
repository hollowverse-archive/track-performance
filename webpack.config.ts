// tslint:disable:no-implicit-dependencies
import webpack from 'webpack';
import slsw from 'serverless-webpack';
import path from 'path';
import nodeExternals from 'webpack-node-externals';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { isProd } from './env';

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '.webpack'),
    filename: '[name].js',
  },
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    // @ts-ignore
    new CopyWebpackPlugin([
      {
        from: 'secrets/**',
        to: '.',
      },
    ]),
    new webpack.WatchIgnorePlugin([/node_modules/]),
  ],
  externals: [nodeExternals()],
};
