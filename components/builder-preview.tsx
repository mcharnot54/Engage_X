"use client"

import { useEffect } from "react"
import { Builder } from "@builder.io/react"

export function BuilderPreview() {
  useEffect(() => {
    // Register for Builder.io preview mode
    Builder.register("editor.settings", {
      hideStyleTab: false,
      hideMainTabs: false,
      hideDataTab: false,
      hideAnimationsTab: false,
    })

    // Set up preview listener
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "builder.updateContent") {
        // Handle preview content updates
        console.log("Builder preview update:", event.data)
        // You can add custom preview handling here
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  return null
}
