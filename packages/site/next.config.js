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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
		return [
			{
				source: '/builder/:path*',
				destination: `https://api.prod.tranmere-web.com/builder/:path*`,
			},
      {
				source: '/api/contact-us/:path*',
				destination: `https://api.prod.tranmere-web.com/contact-us/:path*`,
			},
      {
				source: '/api/player-search/:path*',
				destination: `https://api.prod.tranmere-web.com/player-search/:path*`,
			},
      {
				source: '/api/result-search/:path*',
				destination: `https://api.prod.tranmere-web.com/result-search/:path*`,
			},
      {
				source: '/api/transfer-search/:path*',
				destination: `https://api.prod.tranmere-web.com/transfer-search/:path*`,
			},
		]
	},
});
