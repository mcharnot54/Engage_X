import { Builder } from '@builder.io/react';

// Configure Builder.io with branch information
export function initBuilder() {
  // Get the branch name from Vercel environment variable
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'main';
  
  Builder.set({
    apiKey: process.env.NEXT_PUBLIC_BUILDER_API_KEY,
    // Set the branch for content targeting
    userAttributes: {
      branch: branch
    }
  });
}