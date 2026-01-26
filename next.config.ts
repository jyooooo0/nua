import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/nua", // For GitHub Pages project site
  images: {
    unoptimized: true, // Required for static export
  },
  reactCompiler: true,
};

export default nextConfig;
