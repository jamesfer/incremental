const path = require('path');

const configs = [
  { entry: './src/index.ts', outputFilename: 'index.js' },
  { entry: './src/benchmark-index.ts', outputFilename: 'benchmark-index.js' },
  { entry: './src/execute-benchmark.ts', outputFilename: 'execute-benchmark.js' },
];

module.exports = configs.map(({ entry, outputFilename }) => ({
  entry,
  mode: 'development',
  target: 'web',
  devtool: 'source-map',
  output: {
    filename: outputFilename,
    path: path.resolve(__dirname, 'build'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  devServer: {
    publicPath: '/build/',
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
        ],
      },
    ],
  },
}));
