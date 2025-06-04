"use client"

import { useEffect } from "react"
import { Builder } from "@builder.io/react"
import { registerBuilderComponents } from "@/lib/builder-components"
import { BuilderPreview } from "./builder-preview"

export function BuilderInitializer() {
  useEffect(() => {
    // Initialize Builder.io with your public API key
    Builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY || "")

    // Register custom components
    registerBuilderComponents()
  }, [])

  return <BuilderPreview />
}
