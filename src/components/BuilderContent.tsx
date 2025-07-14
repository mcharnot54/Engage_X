// src/components/BuilderContent.tsx
"use client";

import {
  builder,
  Builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,
} from "@builder.io/react";

/* 1 ▸ Initialise Builder only in the browser */
if (typeof window !== "undefined") {
  const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (apiKey) {
    builder.init(apiKey);

    // Configure responsive breakpoints for Design/Interact mode
    Builder.set({
      canTrack: false,
      env: process.env.NODE_ENV === "production" ? "production" : "development",
      hideDefaultBuilderBlocks: ["Image"],
      customBreakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
      },
    });

    // Set device attributes for proper responsive behavior
    builder.setUserAttributes({
      device:
        window.innerWidth < 480
          ? "mobile"
          : window.innerWidth < 768
            ? "tablet"
            : "desktop",
    });
  } else {
    console.warn(
      "NEXT_PUBLIC_BUILDER_API_KEY is not set — Builder content will be blank.",
    );
  }
}

/* 2 ▸ Wrapper that accepts strong-typed content */
export default function BuilderContent(props: {
  model?: string;
  content?: BuilderContent | null;
}) {
  const { model = "page", content } = props;

  return (
    <BuilderComponent
      model={model}
      /* Pass `undefined`, not `null`, when empty */
      content={content ?? undefined}
    />
  );
}
