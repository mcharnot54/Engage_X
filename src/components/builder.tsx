// src/components/builder.tsx
'use client';

import {
  builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,   // ← add this
} from "@builder.io/react";
import { useEffect, useState } from "react";

// Initialise Builder on the client (once)
if (typeof window !== "undefined" && !builder.apiKey) {
  const key = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (key) {
    builder.init(key);
  } else {
    console.warn("NEXT_PUBLIC_BUILDER_API_KEY is missing");
  }
}

interface RenderBuilderContentProps {
  /**
   * Builder content JSON returned from builder.get(...) / webhook, etc.
   * Pass `null` or `undefined` if you want the component to render nothing
   * when no content is found (outside preview mode).
   */
  content?: BuilderContent | null; // explicit type instead of `any`
  /** Builder model name, e.g. "page", "section", etc. */
  model: string;
}

export function RenderBuilderContent({
  content,
  model,
}: RenderBuilderContentProps) {
  const isPreviewing = useIsPreviewing();
  const [hydrated, setHydrated] = useState(false);

  // Ensure we only render <BuilderComponent> after hydration to avoid
  // a React hydration mismatch in the browser.
  useEffect(() => setHydrated(true), []);

  // If there is no content and you’re *not* in preview mode, show a fallback.
  if (!content && !isPreviewing) {
    return (
      <div className="builder-no-content">
        <h1>No content found</h1>
        <p>Please check the URL or create content in Builder.io.</p>
      </div>
    );
  }

  return hydrated ? (
    <BuilderComponent
      model={model}
      content={content}
      options={{ includeRefs: true }}
    />
  ) : null;
}
