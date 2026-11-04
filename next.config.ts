import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    config.optimization = {
      ...config.optimization,
      minimize: false,
    };

    if (dev) {
      config.optimization.concatenateModules = false;
      config.optimization.splitChunks = false;
    }

    return config;
  },
};

export default nextConfig;
