import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react", "recharts"],
    staleTimes: {
      dynamic: 60,
      static: 180,
    },
  },
  devIndicators: false,
};

export default nextConfig;
