'use client';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    // your custom settings / rules here
    settings: {
      next: { rootDir: ['components/'] },
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',  
      '@typescript-eslint/no-explicit-any':   'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@next/next/no-img-element': 'off', 
    },
  },
];            
