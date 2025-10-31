import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = { ignored: ["**/*"] };
    }
    return config;
  },

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
        {
          key: "Access-Control-Allow-Headers",
          value: "X-Requested-With, Content-Type, Authorization",
        },
      ],
    },
  ],
};

export default nextConfig;
