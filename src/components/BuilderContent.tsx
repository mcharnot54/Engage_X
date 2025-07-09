// src/components/BuilderContent.tsx
'use client';

import dynamic from 'next/dynamic';
import {
  builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,   // ← add this
} from '@builder.io/react';

/* 1 ▸ Initialise Builder only in the browser */
if (typeof window !== 'undefined') {
  const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (apiKey) {
    builder.init(apiKey);
  } else {
     
    console.warn(
      'NEXT_PUBLIC_BUILDER_API_KEY is not set — Builder content will be blank.',
    );
  }
}

/* 2 ▸ Dynamically load the component (no SSR) */
const BuilderComponent = dynamic(
  () => import('@builder.io/react').then((m) => m.BuilderComponent),
  { ssr: false },
);

/* 3 ▸ Wrapper that accepts strong-typed content */
export default function BuilderContent(props: {
  model?: string;
  content?: BuilderContent | null;
}) {
  const { model = 'page', content } = props;

  return (
    <BuilderComponent
      model={model}
      /* Pass `undefined`, not `null`, when empty */
      content={content ?? undefined}
    />
  );
}
