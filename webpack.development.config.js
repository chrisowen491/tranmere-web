'use strict';

const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const glob = require('glob');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const TranmereWebPlugin = require('./lib/tranmere-web-plugin.js');
const { TRUE } = require('sass');

let config = {

  entry: {
    // Auto-detect all pages in directory.
    'tranmere-web': glob.sync(__dirname + '/tranmere-web/assets/js/*.js'),
    modernizr: __dirname + '/lib/modernizr.js'
  },

  devServer: {
    port: 8080,
    hot: true,
    open: true,
    compress: true,
    watchFiles: ['./templates/**/*'],
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
      directory: __dirname + '/local.out',
    },
    proxy: {
      '/result-search': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },
      '/player-search': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },
      '/transfer-search': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },
      '/page': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },
      '/match': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },
      '/builder': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },
      '/contact-us': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },      
      '/transfers': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },
      '/goal': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },
      '/links': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug' /*optional*/
      },
      '/graphql': {
        target: 'https://api.prod.tranmere-web.com',
        changeOrigin: true,
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
    path:  __dirname + '/local.out',
    filename: './assets/scripts/bundle--[name].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./assets/styles/[name].css",
      chunkFilename: "./assets/styles/[id].css",
    }),
    new webpack.ProvidePlugin({$: "jquery",jQuery: "jquery",'window.jQuery': 'jquery'}),
    new TranmereWebPlugin({ index: false }),
    new FileManagerPlugin({
      events: {
        onEnd: [
          {
            copy: [
              { source: __dirname + '/tranmere-web/favicon.ico', destination: __dirname + '/local.out/', options: {overwrite: true, nodir: true} },
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