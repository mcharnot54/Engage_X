// lib/builder-registry.tsx
'use client'

import { builder, Builder } from "@builder.io/react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"

// Initialize Builder
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY
if (apiKey) {
  builder.init(apiKey)
} else {
  console.warn("NEXT_PUBLIC_BUILDER_API_KEY is not defined.")
}

/**
 * Register custom components
 */
export function registerBuilderComponents() {
  // Register Button statically (no dynamic import)
  Builder.registerComponent(Button, {
    name: "Button",
    inputs: [
      { name: "text", type: "string", defaultValue: "Click me" },
      { name: "variant", type: "enum", enum: ["default", "primary", "secondary"], defaultValue: "default" },
      { name: "size", type: "enum", enum: ["sm", "md", "lg"], defaultValue: "md" },
    ],
  })

  // Register Card statically
  Builder.registerComponent(Card, {
    name: "Card",
    inputs: [
      { name: "title", type: "string", defaultValue: "Card Title" },
      { name: "description", type: "string", defaultValue: "Card description" },
      { name: "image", type: "url", defaultValue: "https://placehold.co/600x400" },
      { name: "buttonText", type: "string", defaultValue: "Learn More" },
      { name: "buttonLink", type: "url", defaultValue: "#" },
      { name: "elevation", type: "number", defaultValue: 1 },
      { name: "className", type: "string", defaultValue: "" },
    ],
  })
}
