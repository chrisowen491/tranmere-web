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
	  {
        protocol: 'https',
        hostname: 'images.tranmere-web.com',
        port: '',
        pathname: '/**',
      },
	  {
        protocol: 'https',
        hostname: 'www.tranmere-web.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
		return [
      {
				source: '/api/contact-us/:path*',
				destination: `https://api.tranmere-web.com/contact-us/:path*`,
			},
      {
				source: '/api/player-search/:path*',
				destination: `https://api.tranmere-web.com/player-search/:path*`,
			},
      {
				source: '/api/result-search/:path*',
				destination: `https://api.tranmere-web.com/result-search/:path*`,
			},
      {
				source: '/api/transfer-search/:path*',
				destination: `https://api.tranmere-web.com/transfer-search/:path*`,
			},
		]
	},
});
