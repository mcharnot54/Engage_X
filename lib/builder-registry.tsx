"use client"

import { Builder } from "@builder.io/react"
import dynamic from "next/dynamic"

// Register custom components for Builder.io
export function registerBuilderComponents() {
  // Example of registering a custom component
  Builder.registerComponent(
    dynamic(() => import("../components/ui/button")),
    {
      name: "Button",
      inputs: [
        {
          name: "text",
          type: "string",
          defaultValue: "Click me",
        },
        {
          name: "variant",
          type: "enum",
          enum: ["default", "destructive", "outline", "secondary", "ghost", "link"],
          defaultValue: "default",
        },
      ],
    },
  )

  // Register more components as needed
}
