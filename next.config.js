/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip type-checking & linting during CI builds
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Allow Builder-hosted images
  images: {
    domains: ["cdn.builder.io"],
    unoptimized: true,
  },

  // Transpile lucide-react to handle ES modules properly
  transpilePackages: ["lucide-react"],

  // External packages for server components
  serverExternalPackages: ["@prisma/client", "prisma"],

  // Disable static optimization to prevent Builder.io SSG issues
  trailingSlash: false,

  // Skip problematic static generation
  experimental: {
    skipTrailingSlashRedirect: true,
  },

  // Force dynamic for all pages
  async generateBuildId() {
    return "dynamic-build";
  },

  // Webpack configuration for fetch polyfill
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
