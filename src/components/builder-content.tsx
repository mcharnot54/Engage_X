// src/components/builder-content.tsx
"use client";

import { BuilderComponent, useIsPreviewing } from "@builder.io/react";

interface RenderBuilderContentProps {
  model: string;
  entry: any;
}

export function RenderBuilderContent({ model, entry }: RenderBuilderContentProps) {
  const isPreview = useIsPreviewing();
  return (
    <BuilderComponent
      model={model}
      entry={entry}
      showToolbar={isPreview}
    />
  );
}