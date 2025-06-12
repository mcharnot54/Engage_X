'use client'

import React, { useState, useEffect } from "react"
import { builder, Builder, BuilderComponent } from "@builder.io/react"
import { Button } from "./ui/Button"
// Import Card as default export
import { Card } from "./ui/Card"

// Initialize the Builder SDK with your public API key
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!)

// Register your custom components for Builder.io
export function registerBuilderComponents() {
  // Register Button component
  Builder.registerComponent(Button, {
    name: "Button",
    inputs: [
      { name: "text", type: "string", defaultValue: "Click me" },
      {
        name: "variant",
        type: "enum",
        enum: ["default", "destructive", "outline", "secondary", "ghost", "link"],
        defaultValue: "default",
      },
      { name: "size", type: "enum", enum: ["default", "sm", "lg", "icon"], defaultValue: "default" },
    ],
  })

  // Register Card component with its props
  Builder.registerComponent(Card, {
    name: "Card",
    inputs: [
      { name: "title", type: "string", defaultValue: "Card Title" },
      { name: "description", type: "string", defaultValue: "Card description goes here" },
      { name: "image", type: "url", defaultValue: "https://placehold.co/600x400" },
      { name: "buttonText", type: "string", defaultValue: "Learn More" },
      { name: "buttonLink", type: "string", defaultValue: "#" },
      { name: "elevation", type: "number", defaultValue: 1 },
      { name: "className", type: "string", defaultValue: "" },
    ],
  })
}

// React component to fetch and render Builder content
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
