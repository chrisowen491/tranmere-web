import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        source: "/api/contact-us",
        destination: `https://api.tranmere-web.com/contact-us/`,
      },
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
    ];
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
