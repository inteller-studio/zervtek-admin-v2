import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'p3.aleado.com',
        pathname: '/pic/**',
      },
    ],
  },
};

export default nextConfig;
