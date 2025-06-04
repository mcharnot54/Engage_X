const config = {
  plugins: ["@tailwindcss/postcss"],
};
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // This helps Builder.io know which branch is being used
    VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || '',
  },
  // Other Next.js config options...
};
export default config;
