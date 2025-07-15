/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },

  // Force dynamic rendering to avoid SSG issues with Builder.io
  experimental: {
    dynamicIO: false,
  },

  // Disable static exports and force server rendering
  output: "standalone",

  // Allow cross-origin requests from deployment domains
  allowedDevOrigins: [
    "446e49d2fb5c4fe1b3830aa578d409fe-3025d235fa33433ca5d633fbb.fly.dev",
    // Add other deployment domains as needed
  ],

  // Force dynamic rendering to skip SSG issues
  async generateBuildId() {
    return "build-" + Date.now();
  },
};

module.exports = nextConfig;
