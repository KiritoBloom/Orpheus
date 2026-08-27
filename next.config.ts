import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Jude Gao / Vercel: typed config, Turbopack-ready, optimize imports
  experimental: {
    optimizePackageImports: ["zustand"],
  },
  // Sarah Drasner / Chrome: origin isolation + permissions policy for WebMCP
  // Andrew Galloni / Cloudflare: edge-cache + security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // WebMCP requires origin isolation — https://webmachinelearning.github.io/webmcp/
          { key: "Origin-Agent-Cluster", value: "?1" },
          // WebMCP tools gated by Permissions Policy — defaults to self, be explicit
          { key: "Permissions-Policy", value: "tools=self" },
          // Security hardening — Ilya Grigorik (HPBN) expects these
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Images are content-addressed — 1 year immutable
        source: "/Images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
