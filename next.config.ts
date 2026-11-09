import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// GitHub Pages serves the site from /Car-Dealer. LOCAL_BUILD=1 (npm run build:test)
// builds for "/" so Playwright and Lighthouse CI can serve `out/` directly.
const basePath = process.env.LOCAL_BUILD === "1" ? "" : isProd ? "/Car-Dealer" : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  // Absolute links (QR code, calendar file) need the base path at runtime.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    // The static HTML is rendered on this date; the browser then switches to today's date
    // (see src/lib/useToday.ts), so "sold N days ago" rules never cause a hydration mismatch.
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
  },
  poweredByHeader: false,
};

export default nextConfig;
