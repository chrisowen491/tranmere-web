import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
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
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  rewrites: async () => {
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
  }
};
 
export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();