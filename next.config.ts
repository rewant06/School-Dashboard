import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        process: require.resolve("process/browser"), // Polyfill for process
      },
    };
    return config; // Return the modified webpack configuration.
  },
};

export default nextConfig;