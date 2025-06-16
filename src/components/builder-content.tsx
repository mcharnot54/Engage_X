// src/components/builder-content.tsx
'use client';

import { BuilderComponent, type BuilderContent } from '@builder.io/sdk-react';

/**
 * Renders Builder.io content for a given model.
 */
export function RenderBuilderContent(props: {
  model: string;
  content?: BuilderContent | null; // explicit type instead of `any`
}) {
  const { model, content } = props;

  return (
    <BuilderComponent
      model={model}
      content={content ?? undefined} // graceful fallback
    />
  );
}
