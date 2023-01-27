'use strict';

const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const glob = require('glob');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const TranmereWebPlugin = require('./lib/tranmere-web-plugin.js');
const { TRUE } = require('sass');

let config = {
  entry: {
    'vendor': [
      'jquery',
      'bootstrap',
      '@datadog/browser-logs',
      '@datadog/browser-rum',
      'mustache',
      '@algolia/autocomplete-js',
      'algoliasearch/lite',
      '@algolia/autocomplete-theme-classic'
    ],
    // Auto-detect all pages in directory.
    'tranmere-web': glob.sync(__dirname + '/tranmere-web/assets/js/*.js'),
    modernizr: __dirname + '/lib/modernizr.js'
  },

  devServer: {
    port: 8080,
    hot: true,
    open: true,
    compress: true,
    watchFiles: ['templates/**/*'],
    client: {
      overlay: false,
    },
    headers: [
      {
        key: 'X-Custom',
        value: 'foo',
      },
      {
        key: 'Y-Custom',
        value: 'bar',
      },
    ],
    static: {
      directory: __dirname + '/web.out',
    },
    proxy: {
      '/result-search': {
           target: 'http://localhost:8080',
           router: () => 'http://localhost:3000',
           logLevel: 'debug' /*optional*/
      },
      '/player-search': {
        target: 'http://localhost:8080',
        router: () => 'http://localhost:3000',
        logLevel: 'debug' /*optional*/
      },
      '/page': {
        target: 'http://localhost:8080',
        router: () => 'http://localhost:3000',
        logLevel: 'debug' /*optional*/
      },
      '/match': {
        target: 'http://localhost:8080',
        router: () => 'http://localhost:3000',
        logLevel: 'debug' /*optional*/
      },
      '/builder': {
        target: 'http://localhost:8080',
        router: () => 'http://localhost:3000',
        logLevel: 'debug' /*optional*/
      },
      '/contact-us': {
        target: 'http://localhost:8080',
        router: () => 'http://localhost:3000',
        logLevel: 'debug' /*optional*/
      },
      '/graphql': {
        target: 'https://api.prod.tranmere-web.com',
        headers: {
          'host': 'api.prod.tranmere-web.com'
        },
        secure: false,
      },
    },
  },
  module: {
    rules: [
      // CSS: scss, css
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      // Images: png, gif, jpg, jpeg, svg
      {
        test: /\.(png|gif|jpe?g)$/,
        type: 'asset/resource',
        generator: {
          filename: './assets/images/[name][ext]',
        }
      },
      {
        test: /\.(mustache)$/,
        type: 'asset/resource',
        generator: {
          filename: './assets/templates/[name][ext]',
        }
      },
      // HTML: htm, html
      {
        test: /\.html?$/,
        type: 'asset/resource'
      },
      // Font files: eot, ttf, woff, woff2
      {
        test: /\.(eot|ttf|svg|woff2?)(\?.*$|$)/,
        type: 'asset/resource',
        generator: {
          filename: './assets/fonts/[name][ext]',
        }
      }
    ]
  },
  output: {
    path:  __dirname + '/web.out',
    filename: './assets/scripts/bundle--[name].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./assets/styles/[name].css",
      chunkFilename: "./assets/styles/[id].css",
    }),
    new webpack.ProvidePlugin({$: "jquery",jQuery: "jquery",'window.jQuery': 'jquery'}),
    new TranmereWebPlugin({ index: true }),
    new FileManagerPlugin({
      events: {
        onEnd: [
          {
            copy: [
              { source: __dirname + '/tranmere-web/_redirects', destination: __dirname + '/web.out/', options: {overwrite: true, nodir: true} },
              { source: __dirname + '/tranmere-web/_headers', destination: __dirname + '/web.out/', options: {overwrite: true, nodir: true} },
              { source: __dirname + '/tranmere-web/favicon.ico', destination: __dirname + '/web.out/', options: {overwrite: true, nodir: true} },
            ],
          },
        ],
      }
    }),
  ],
  optimization: {
    // Instruct webpack not to obfuscate the resulting code
    splitChunks: false,
  },
};

module.exports = config;