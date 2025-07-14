"use client";

import { BuilderComponent, useIsPreviewing } from "@builder.io/react";

import type { BuilderContent } from "@builder.io/sdk";
// Remove notFound import since it's for server components

interface BuilderContentProps {
  content?: BuilderContent | null; // explicit type instead of `any`
}

export function RenderBuilderContent({ content }: BuilderContentProps) {
  const isPreviewing = useIsPreviewing();

  // If there's no content and not in preview mode, show 404
  if (!content && !isPreviewing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // If there's no content but we're in preview mode, show a helpful message
  if (!content && isPreviewing) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No Builder.io content found</h1>
        <p>
          Create content in Builder.io and it will appear here when you publish.
        </p>
      </div>
    );
  }

  // Render the Builder.io content
  return (
    <div className="builder-content">
      <BuilderComponent content={content as any} model="page" />
    </div>
  );
}
