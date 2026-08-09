import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.tranmere-web.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.tranmere-web.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  rewrites: async () => {
    return [
      {
        source: "/pdfs/:path*",
        destination: `https://programes.tranmere-web.com/:path*`,
      },
    ];
  },
  redirects() {
    return [
      {
        source: "/page/player/Dick%20Johnson",
        destination: "/page/player/Dickie%20Johnson",
        permanent: true,
      },
      {
        source: "/top-scorers-by-season",
        destination: "/players/top-scorers-by-season",
        permanent: true,
      },
      {
        source: "/playersearch",
        destination: "/players",
        permanent: true,
      },  
      {
        source: "/player-records/:path*",
        destination: "/players/player-records/:path*",
        permanent: true,
      },  
      {
        source: "/player-builder",
        destination: "/players/avatar-builder",
        permanent: true,
      },  
      {
        source: "/hat-tricks",
        destination: "/players/hat-tricks",
        permanent: true,
      },        

    ];
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
