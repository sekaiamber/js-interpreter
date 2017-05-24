var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var WebpackShellPlugin = require('webpack-shell-plugin');
var path = require('path');

var config = {
  context: path.join(__dirname, '..', '/test/'),
  entry: {
    'imp/test': './imp/index.js',
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
        'echo [ Testing IMP ]',
        'echo ===============',
        'echo',
        'mocha test_dist/imp/test.js --slow 5000 --timeout 10000 --reporter nyan'
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
