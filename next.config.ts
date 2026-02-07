import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Car-Dealer',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
