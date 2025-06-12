// src/components/builder-content.tsx
'use client';

import { BuilderComponent, builder, useIsPreviewing } from "@builder.io/react";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

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
      data={{ /* any extra props you want to pass into your templates */ }}
    />
  );
}
