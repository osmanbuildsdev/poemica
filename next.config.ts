import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'uuid': path.resolve('./node_modules/uuid/dist/index.js'),
      };
    }
    return config;
  },
};

export default nextConfig;
