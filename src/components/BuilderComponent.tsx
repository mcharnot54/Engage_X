// src/components/BuilderComponent.tsx
'use client';

import {
  builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,   // ← add this
} from '@builder.io/react';

/* Initialise Builder once, but guard against missing env-var */
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
if (apiKey) {
  builder.init(apiKey);
} else {
   
  console.warn(
    'NEXT_PUBLIC_BUILDER_API_KEY is not defined — Builder content will be blank.',
  );
}

interface RenderBuilderContentProps {
  /** Builder model name (defaults to `"page"`) */
  model?: string;
  /** Entry key or URL slug that Builder should load */
  entry?: string;
  /** Pre-fetched content (skip Builder fetch if provided) */
  content?: BuilderContent | null;
}

/**
 * Universal component that renders a Builder page or section.
 * Pass either `entry="home"` **or** a ready-made `content` object.
 */
export function RenderBuilderContent({
  model = 'page',
  entry,
  content,
}: RenderBuilderContentProps) {
  const isPreview = useIsPreviewing(); // you can use this in `data`

  return (
    <BuilderComponent
      model={model}
      entry={entry}
      content={content ?? undefined} /* Builder prefers `undefined` over null */
      data={{ isPreview }}
      options={{ includeRefs: true }}
    />
  );
}
