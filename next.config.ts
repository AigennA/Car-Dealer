import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// GitHub Pages serves the site from /Car-Dealer. LOCAL_BUILD=1 (npm run build:test)
// builds for "/" so Playwright and Lighthouse CI can serve `out/` directly.
const basePath = process.env.LOCAL_BUILD === "1" ? "" : isProd ? "/Car-Dealer" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
  },
  poweredByHeader: false,
};

export default nextConfig;
