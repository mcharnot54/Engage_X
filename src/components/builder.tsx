"use client"

import { BuilderComponent, useIsPreviewing } from "@builder.io/react"
import { Builder } from "@builder.io/sdk"
import { useEffect, useState } from "react"

// Initialize Builder with your public API key on the client side
if (typeof window !== "undefined") {
  Builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!)
}

interface RenderBuilderContentProps {
  content: any
  model: string
}

// Make sure this is exported correctly
export function RenderBuilderContent({ content, model }: RenderBuilderContentProps) {
  const isPreviewing = useIsPreviewing()
  const [hydrated, setHydrated] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setHydrated(true)
  }, [])

  // If no content and not in preview mode
  if (!content && !isPreviewing) {
    return (
      <div className="builder-no-content">
        <h1>No content found</h1>
        <p>Please check the URL or create content in Builder.io</p>
      </div>
    )
  }

  return (
    <>
      {/* Only render the BuilderComponent after hydration to avoid hydration mismatch */}
      {hydrated && <BuilderComponent model={model} content={content} options={{ includeRefs: true }} />}
    </>
  )
}
