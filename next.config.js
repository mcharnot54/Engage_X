/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip validation during builds
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Basic image configuration
  images: {
    domains: ["cdn.builder.io"],
    unoptimized: true,
  },

  // Required transpilations
  transpilePackages: ["lucide-react"],

  // Server packages
  serverExternalPackages: ["@prisma/client", "prisma"],
};

module.exports = nextConfig;
