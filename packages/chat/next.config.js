const path = require('path')
const withPlugins = require("next-compose-plugins");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withPlugins([[withBundleAnalyzer]], {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
});
