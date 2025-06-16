'use client';

import { useEffect, useState } from 'react';
import {
  builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,   // ← add this
} from "@builder.io/react"

import { Button } from './ui/Button';
import { Card } from './ui/Card';

/* 1 ▸ Initialise the SDK only when the key exists */
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

if (apiKey) {
  builder.init(apiKey);
} else {
  console.warn(
    'NEXT_PUBLIC_BUILDER_API_KEY is not defined — Builder content will not load.',
  );
}

/* 2 ▸ Register custom components once */
export function registerBuilderComponents(): void {
  Builder.registerComponent(Button, {
    name: 'Button',
    inputs: [
      { name: 'text', type: 'string', defaultValue: 'Click me' },
      {
        name: 'variant',
        type: 'enum',
        enum: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        defaultValue: 'default',
      },
      {
        name: 'size',
        type: 'enum',
        enum: ['default', 'sm', 'lg', 'icon'],
        defaultValue: 'default',
      },
    ],
  });

  Builder.registerComponent(Card, {
    name: 'Card',
    inputs: [
      { name: 'title', type: 'string', defaultValue: 'Card Title' },
      { name: 'description', type: 'string', defaultValue: 'Card description goes here' },
      { name: 'image', type: 'url', defaultValue: 'https://placehold.co/600x400' },
      { name: 'buttonText', type: 'string', defaultValue: 'Learn More' },
      { name: 'buttonLink', type: 'string', defaultValue: '#' },
      { name: 'elevation', type: 'number', defaultValue: 1 },
      { name: 'className', type: 'string', defaultValue: '' },
    ],
  });
}

/* 3 ▸ Fetch & render Builder content */
export default function BuilderContentComponent(props: {
  model?: string;
  entry?: string;
}) {
  const { model = 'page', entry } = props;

  // explicit, safe type instead of `any`
  const [content, setContent] = useState<BuilderContentType | null>(null);

  useEffect(() => {
    if (!entry) return;

    builder
      .get(model, { entry })
      .toPromise()
      .then(setContent)
      .catch((err) => console.error('Builder fetch error:', err));
  }, [model, entry]);

  if (!content) return <div>Loading…</div>;

  // Ensure content.data is never null
  const safeContent =
    content && content.data === null
      ? { ...content, data: undefined }
      : content === null
      ? undefined
      : content;

  return (
    <BuilderComponent
      model={model}
      content={safeContent}
    />
  );
}
