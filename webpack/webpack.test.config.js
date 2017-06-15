var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var WebpackShellPlugin = require('webpack-shell-plugin');
var path = require('path');

var config = {
  context: path.join(__dirname, '..', '/test/'),
  entry: {
    'slime/test': './slime/index.js',
  },
  output: {
    path: path.join(__dirname, '..', '/test_dist'),
    filename: '[name].js'
  },
  target: 'node',

  plugins: [
    new WebpackShellPlugin({
      onBuildExit: [
        'echo',
        'echo ===============',
        'echo [ Testing Slime ]',
        'echo ===============',
        'echo',
        'mocha test_dist/slime/test.js --slow 5000 --timeout 10000'
      ]
    })
  ],
  resolveLoader: {
    root: path.join(__dirname, '..', '/node_modules'),
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel"
      },
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx'],
    alias: {}
  },
};

module.exports = config;
