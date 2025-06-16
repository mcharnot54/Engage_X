// next.config.js
/** @type {import('next').NextConfig} */
const baseConfig = {
  // ——————————————————— dev-only relaxations ———————————————————
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  // ———————————————————   images   ———————————————————
  images: {
    domains: ['cdn.builder.io'],
    unoptimized: true,
  },

  // experimental options removed → Next 15 no longer needs them
};

/* Apply Builder DevTools once (adds live-preview overlay in dev) */
const withBuilderDevTools = require('@builder.io/dev-tools/next');

module.exports = withBuilderDevTools(baseConfig);
