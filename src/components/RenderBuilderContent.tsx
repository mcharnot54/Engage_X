// src/components/RenderBuilderContent.tsx
'use client'

import { BuilderComponent } from "@builder.io/react"

export function RenderBuilderContent({
  model,
  content
}: {
  model: string
  content: any
}) {
  return <BuilderComponent model={model} content={content} />
}
