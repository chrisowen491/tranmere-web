'use strict';

const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const glob = require('glob');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const TranmereWebPlugin = require('./lib/tranmere-web-plugin.js');
const { TRUE } = require('sass');
// Include only the reset

let config = {

  mode: 'production',
  entry: {
    // Auto-detect all pages in directory.
    'tranmere-web': glob.sync(__dirname + '/tranmere-web/assets/js/*.js'),
    modernizr: __dirname + '/lib/modernizr.js'
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
              { source: __dirname + '/tranmere-web/robots.txt', destination: __dirname + '/web.out/', options: {overwrite: true, nodir: true} },
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