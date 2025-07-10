/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  experimental: {
    outputFileTracingIncludes: {
      "/": ["./prisma/schema.prisma"],
    },
  },
};

module.exports = nextConfig;
