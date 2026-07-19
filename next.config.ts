import type { NextConfig } from "next";

const proxyTarget =
  process.env.NEXT_PUBLIC_API_PROXY_TARGET ||
  process.env.BACKEND_URL ||
  "http://127.0.0.1:8000";

const shouldUseDevProxy =
  !process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL.includes("localhost") ||
  process.env.NEXT_PUBLIC_API_URL.includes("127.0.0.1");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!shouldUseDevProxy) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${proxyTarget}/api/v1/:path*`,
      },
      {
        source: "/ws",
        destination: `${proxyTarget}/ws`,
      },
    ];
  },
};

export default nextConfig;
