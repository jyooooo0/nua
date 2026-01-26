import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/nua",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
