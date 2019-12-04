const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = env => ({
  mode: 'development',
  target: 'web',
  devtool: 'source-map',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
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
  plugins: [
    ...(env && env.analyse ? [new BundleAnalyzerPlugin()] : []),
  ],
});
