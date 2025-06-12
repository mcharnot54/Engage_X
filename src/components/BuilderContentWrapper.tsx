// src/components/BuilderContentWrapper.tsx
'use client'

import { BuilderComponent } from "@builder.io/react"

export default function BuilderContentWrapper({
  model,
  content
}: {
  model: string
  content: any
}) {
  return <BuilderComponent model={model} content={content} />
}
