// src/components/builder-content.tsx
'use client';

import {
  BuilderComponent,
  type BuilderContent,   // ← add this
} from '@builder.io/react';

interface RenderBuilderContentProps {
  model: string;
  content?: BuilderContent | null;   // explicit, no “any”
}

export function RenderBuilderContent({
  model,
  content,
}: RenderBuilderContentProps) {
  return (
    <BuilderComponent
      model={model}
      /* Builder expects undefined, not null */
      content={content ?? undefined}
    />
  );
}
 ``