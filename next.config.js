/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build as well
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure images for Builder.io
  images: {
    domains: ["cdn.builder.io"],
    unoptimized: true,
  },
  // Remove the deprecated appDir option
  experimental: {
    // No experimental options needed for Next.js 15.3.2
  },
}

module.exports = nextConfig
