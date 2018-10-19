const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, '../build')
  },
  target: 'node',
  plugins: [
    new CopyWebpackPlugin([
      { from: 'web.config', to: '.' },
    ])
  ]
};