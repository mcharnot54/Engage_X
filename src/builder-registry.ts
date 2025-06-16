// src/builder-registry.ts
'use client';

import { builder, Builder } from '@builder.io/react';
import App from './App';

/* Initialise the SDK only if the env var is present */
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

if (apiKey) {
  builder.init(apiKey);
} else {
  console.warn(
    'NEXT_PUBLIC_BUILDER_API_KEY is not defined — Builder content will not load.',
  );
}

/* Register the two custom components */
Builder.registerComponent(App, { name: 'App' });
Builder.registerComponent(Builder, { name: 'Builder' });
