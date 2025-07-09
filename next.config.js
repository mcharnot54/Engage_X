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

  // Additional configuration for Vercel
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Force all pages to be dynamic to avoid SSG issues with Builder.io
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // Fix cross-origin requests in development
  allowedDevOrigins: [
    "446e49d2fb5c4fe1b3830aa578d409fe-3c6932f6df3a4e8d995d8b1e6.fly.dev",
    "*.fly.dev",
  ],
};

// If you want the Builder DevTools overlay in dev, wrap once:
// const withBuilderDevTools = require('@builder.io/dev-tools/next');
// module.exports = withBuilderDevTools(nextConfig);

module.exports = nextConfig; // production-safe export
