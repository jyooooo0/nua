import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uncomment below for static export (GitHub Pages deployment)
  // output: "export",
  // basePath: "/nua",
  // trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
