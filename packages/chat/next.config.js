const path = require('path')
const withPlugins = require("next-compose-plugins");

if (process.env.NODE_ENV === "development") {
  const { setupDevPlatform } = require("@cloudflare/next-on-pages/next-dev")
  setupDevPlatform()
}

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withPlugins([[withBundleAnalyzer]], {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  }
});
