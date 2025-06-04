import { Builder } from "@builder.io/react"

// This file can be used to configure global Builder.io settings

export function initializeBuilder() {
  // Set global Builder.io options
  Builder.set({
    // Customize default options
    canTrack: false, // Disable tracking by default
    env: process.env.NODE_ENV === "production" ? "production" : "development",
    // Add other global settings as needed
  })

  // You can add custom targeting attributes
  Builder.setUserAttributes({
    // Example: device type
    device: typeof window !== "undefined" && window.innerWidth < 768 ? "mobile" : "desktop",
    // Add other targeting attributes as needed
  })
}
