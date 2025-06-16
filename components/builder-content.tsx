'use client'

import {
  builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,   // ← add this
} from "@builder.io/react"
import DefaultErrorPage from "next/error"

interface BuilderContentProps {
  content?: BuilderContent | null; // explicit type instead of `any`
}

export function RenderBuilderContent({ content }: BuilderContentProps) {
  const isPreviewing = useIsPreviewing()

  // If there's no content and not in preview mode, show a 404 error
  if (!content && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />
  }

  // If there's no content but we're in preview mode, show a helpful message
  if (!content && isPreviewing) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No Builder.io content found</h1>
        <p>Create content in Builder.io and it will appear here when you publish.</p>
      </div>
    )
  }

  // Render the Builder.io content
  return (
    <div className="builder-content">
      <BuilderComponent content={content} model="page" />
    </div>
  )
}
