import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "MediaInfoModule.wasm$": path.resolve(
        process.cwd(),
        "public/mediainfo/MediaInfoModule.wasm"
      ),
    };
    return config;
  },
};

export default nextConfig;
