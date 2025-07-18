// app-types.d.ts
'use client'
import { Metadata } from 'next';

declare module 'next' {
  export interface PageProps {
    params: Record<string, string | string[]>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}