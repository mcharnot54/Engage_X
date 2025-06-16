// src/components/RenderBuilderContent.tsx
'use client';

import {
  BuilderComponent,
  type BuilderContent,
} from '@builder.io/sdk-react';

interface RenderBuilderContentProps {
  /** Builder model name; defaults to `"page"` */
  model?: string;
  /** Builder content to render; `undefined` means “not found.” */
  content?: BuilderContent | null;
}

export function RenderBuilderContent({
  model = 'page',
  content,
}: RenderBuilderContentProps) {
  return (
    <BuilderComponent
      model={model}
      /* Builder prefers `undefined` over `null` */
      content={content ?? undefined}
    />
  );
}
