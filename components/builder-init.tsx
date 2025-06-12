'use client'

import React, { useState, useEffect } from "react"
import { builder, Builder, BuilderComponent } from "@builder.io/react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"

// Initialize the Builder SDK with your public API key
const builderApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY
if (builderApiKey) {
  builder.init(builderApiKey)
} else {
  console.warn("NEXT_PUBLIC_BUILDER_API_KEY is not defined.")
}

/**
 * Register all custom components with Builder.io
 */
export function registerBuilderComponents() {
  Builder.registerComponent(Button, {
    name: "Button",
    inputs: [
      { name: "text", type: "string", defaultValue: "Click me" },
      {
        name: "variant",
        type: "enum",
        enum: ["default", "primary", "secondary", "ghost", "link"],
        defaultValue: "default",
      },
      { name: "size", type: "enum", enum: ["sm", "md", "lg"], defaultValue: "md" },
    ],
  })

  Builder.registerComponent(Card, {
    name: "Card",
    inputs: [
      { name: "title", type: "string", defaultValue: "Card Title" },
      { name: "description", type: "string", defaultValue: "Card description goes here" },
      { name: "image", type: "url", defaultValue: "https://placehold.co/600x400" },
      { name: "buttonText", type: "string", defaultValue: "Learn More" },
      { name: "buttonLink", type: "url", defaultValue: "#" },
      { name: "elevation", type: "number", defaultValue: 1 },
      { name: "className", type: "string", defaultValue: "" },
    ],
  })
}

/**
 * React component to fetch and render Builder content
 */
export default function BuilderContent({
  model = "page",
  entry,
}: {
  model?: string
  entry?: string
}) {
  const [content, setContent] = useState<any>(null)

  useEffect(() => {
    if (!entry) return
    builder
      .get(model, { entry })
      .toPromise()
      .then(setContent)
      .catch((err) => console.error("Builder fetch error:", err))
  }, [model, entry])

  if (!content) {
    return <div>Loading...</div>
  }

  return <BuilderComponent model={model} content={content} />
}
