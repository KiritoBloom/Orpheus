import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Typed config, Turbopack-ready, optimized imports and images
  experimental: {
    optimizePackageImports: ["zustand"],
  },
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  // Origin isolation and permissions policy for WebMCP + edge caching and security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // WebMCP requires origin isolation — https://webmachinelearning.github.io/webmcp/
          { key: "Origin-Agent-Cluster", value: "?1" },
          // WebMCP tools gated by Permissions Policy — defaults to self, be explicit
          { key: "Permissions-Policy", value: "tools=self" },
          // Security hardening
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        // Next static assets + Images are content-addressed — 1 year immutable
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // CDN cache for all deployment targets (Vercel, Cloudflare, Netlify)
        source: "/Images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Cloudflare-CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Optimized images via _next/image — same long TTL
        source: "/_next/image",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
