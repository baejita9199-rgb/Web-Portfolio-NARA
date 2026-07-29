import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // All imagery is served from /public — no remote patterns are allowed so the
    // concept never depends on third-party hosts in production.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560],
    imageSizes: [180, 260, 360, 480, 640],
  },
  async headers() {
    return [
      {
        source: "/nara-house/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
