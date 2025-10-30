import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ TypeScript options
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Disable React strict mode (optional for dev)
  reactStrictMode: false,

  // ✅ Ignore ESLint build blocking
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Experimental: Allow explicit origins for development
  experimental: {
    allowedDevOrigins: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5000", // legacy backend dev
      "http://127.0.0.1:8000", // 👈 FastAPI backend port
      "http://retina.local",   // custom dev alias if needed
    ],
  },

  // ✅ Webpack config: Disable hot reload watcher spam
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ["**/*"], // disables Next.js hot reload (optional)
      };
    }
    return config;
  },

  // ✅ Future-proof cross-origin fetch behavior
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // You can restrict this later for production
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
