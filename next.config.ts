import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ??
  "https://neptune-be-stag.codeswift.org/api";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
