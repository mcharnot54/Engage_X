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

  // Transpile Stack Auth packages to handle ES modules properly
  transpilePackages: ["@stackframe/stack", "@stackframe/stack-sc"],

  experimental: {
    // Enable ES modules for server components
    esmExternals: "loose",
  },
};

// If you want the Builder DevTools overlay in dev, wrap once:
// const withBuilderDevTools = require('@builder.io/dev-tools/next');
// module.exports = withBuilderDevTools(nextConfig);

module.exports = nextConfig; // production-safe export
