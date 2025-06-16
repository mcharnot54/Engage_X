// src/components/BuilderContentWrapper.tsx
'use client';

import {
  builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,   // ← add this
} from '@builder.io/react';

interface BuilderContentWrapperProps {
  /** Builder model name; defaults to `"page"` */
  model?: string;
  /** Builder content to render; `undefined` means “not found.” */
  content?: BuilderContent | null;
}

export default function BuilderContentWrapper({
  model = 'page',
  content,
}: BuilderContentWrapperProps) {
  return (
    <BuilderComponent
      model={model}
      /* Builder prefers `undefined` over `null` */
      content={content ?? undefined}
    />
  );
}
