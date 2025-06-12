'use client'
import { Builder, builder } from "@builder.io/react";

export function initializeBuilder() {
  // 1️⃣ Global options —- use the **class**
  Builder.set({
    canTrack: false,
    env: process.env.NODE_ENV === "production" ? "production" : "development",
  });

  // 2️⃣ Targeting attributes —- use the **instance**
  builder.setUserAttributes({
    device:
      typeof window !== "undefined" && window.innerWidth < 768
        ? "mobile"
        : "desktop",
  });

  // 3️⃣ Initialise (if you haven’t elsewhere) —- use the **instance**
  if (!builder.apiKey && process.env.NEXT_PUBLIC_BUILDER_API_KEY) {
    builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);
  }
}
