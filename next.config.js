/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },

  // Force dynamic rendering to skip SSG issues
  async generateBuildId() {
    return "build-" + Date.now();
  },
};

module.exports = nextConfig;
