import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Only use static export for production GitHub Pages
  // In development, allow API routes to work
  ...(isProd && { output: 'export' }),
  basePath: isProd ? '/Car-Dealer' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
