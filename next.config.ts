import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.1.1:3000', 'localhost:3000'],
};

export default nextConfig;
