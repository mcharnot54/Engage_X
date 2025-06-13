// src/components/BuilderContent.tsx
'use client'

import dynamic from 'next/dynamic'
import { builder } from '@builder.io/sdk-react'

// Initialize Builder.io ONLY on client side
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BUILDER_API_KEY) {
  builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY)
}

const BuilderComponent = dynamic(
  () => import('@builder.io/sdk-react').then((mod) => mod.BuilderComponent),
  { ssr: false }
)

export default function BuilderContent({ content }: { content: any }) {
  return <BuilderComponent model="page" content={content} />
}
