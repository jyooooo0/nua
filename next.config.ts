import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/nua",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
