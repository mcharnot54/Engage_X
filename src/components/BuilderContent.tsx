// src/components/BuilderContent.tsx
"use client";

import {
  builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,
} from "@builder.io/react";

// Import centralized Builder.io configuration
import "../../../lib/builder-config";

/* 1 ▸ Builder initialization handled by centralized config */

/* 2 ▸ Wrapper that accepts strong-typed content */
export default function BuilderContent(props: {
  model?: string;
  content?: BuilderContent | null;
}) {
  const { model = "page", content } = props;

  return (
    <BuilderComponent
      model={model}
      /* Pass `undefined`, not `null`, when empty */
      content={content ?? undefined}
    />
  );
}
