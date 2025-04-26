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
				source: '/api/contact-us',
				destination: `https://api.tranmere-web.com/contact-us/`,
			},
      {
				source: '/api/player-search',
				destination: `https://api.tranmere-web.com/player-search/`,
			},
      {
				source: '/api/result-search',
				destination: `https://api.tranmere-web.com/result-search/`,
			},
      {
				source: '/api/transfer-search',
				destination: `https://api.tranmere-web.com/transfer-search/`,
			},
		]
  }
};
 
export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();