// src/builder-registry.ts
"use client";

import { builder, Builder } from "@builder.io/react";

/* Initialise the SDK only if the env var is present and we're on the client */
if (typeof window !== "undefined") {
  const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

  if (apiKey) {
    builder.init(apiKey);
  } else {
    console.warn(
      "NEXT_PUBLIC_BUILDER_API_KEY is not defined — Builder content will not load.",
    );
  }
}
