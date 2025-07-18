// src/components/BuilderComponentWrapper.tsx
'use client';

import {
  builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,   // ← add this
} from '@builder.io/react';

interface BuilderComponentWrapperProps {
  /** Page or section model name; default is `"page"` */
  model?: string;
  /** Builder content to render; `undefined` means “not found.” */
  content?: BuilderContent | null;
}

export default function BuilderComponentWrapper({
  model = 'page',
  content,
}: BuilderComponentWrapperProps) {
  return (
    <BuilderComponent
      model={model}
      /* Builder prefers `undefined` over `null` */
      content={content ?? undefined}
    />
  );
}
