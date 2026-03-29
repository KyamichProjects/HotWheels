import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd()),
  experimental: {
    clientSegmentCache: true,
    staleTimes: {
      dynamic: 30,
      static: 180
    }
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
