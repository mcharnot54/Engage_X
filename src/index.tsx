'use client';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';

import { builder } from '@builder.io/sdk-react';
import registerBuilderComponents from './components/RegisterComponents';

/* 1 ▸ Initialise Builder if an API key is present */
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
if (apiKey) {
  builder.apiKey = apiKey;
} else {
  // eslint-disable-next-line no-console
  console.warn(
    'NEXT_PUBLIC_BUILDER_API_KEY is not defined — Builder content will be blank.',
  );
}

/* 2 ▸ Register custom Builder components */
registerBuilderComponents();

/* 3 ▸ Mount the React tree (guard against missing #root) */
const mountPoint = document.getElementById('root');

if (mountPoint) {
  createRoot(mountPoint).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  // eslint-disable-next-line no-console
  console.error('Could not find an element with id="root" to mount the app.');
}
