/* eslint-disable */
const webpack = require('webpack');

module.exports = {
  entry: {
    vendor: [
      'bluebird',
      'lodash',
      'dcharts',
      'debug',
      'jquery',
      'moment',
      'redux',
      'superagent',
      'url-parse',
    ],
    app: './public/js/bootstrap.js',
  },
  output: {
    path: __dirname + '/public/bundle',
    filename: '[name].js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'react'],
        cacheDirectory: true,
      },
    }, ],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      // filename: "vendor.js"
      // (Give the chunk a different name)
      minChunks: Infinity,
      // (with more entries, this ensures that no other module
      //  goes into the vendor chunk)
    }),
    new webpack.SourceMapDevToolPlugin({
      test: /\.js$/,
      exclude: /vendor.js/,
      filename: '[name].[chunkhash].map',
    }),
  ],
};
