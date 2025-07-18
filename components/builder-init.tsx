"use client";

import { useEffect, useState } from "react";
import { builder, Builder, BuilderComponent } from "@builder.io/react";

import type { BuilderContent } from "@builder.io/sdk";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

/* ───────────────────────────────────────────
   1 ▸  Initialise the SDK exactly once
   ─────────────────���───────────────────────── */
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

if (apiKey) {
  builder.init(apiKey);

  // Configure responsive breakpoints for tablet/mobile views
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

  // Set device attributes based on screen size
  if (typeof window !== "undefined") {
    builder.setUserAttributes({
      device:
        window.innerWidth < 480
          ? "mobile"
          : window.innerWidth < 768
            ? "tablet"
            : "desktop",
    });
  }
} else {
  console.warn(
    "NEXT_PUBLIC_BUILDER_API_KEY is not defined — Builder content will not load.",
  );
}

/* ───────────────────────────────────────────
   2 ▸  Register your custom components
   ─────────────────────────────────────────── */
export function registerBuilderComponents(): void {
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
      {
        name: "size",
        type: "enum",
        enum: ["sm", "md", "lg"],
        defaultValue: "md",
      },
    ],
  });

  Builder.registerComponent(Card, {
    name: "Card",
    inputs: [
      { name: "title", type: "string", defaultValue: "Card Title" },
      {
        name: "description",
        type: "string",
        defaultValue: "Card description goes here",
      },
      {
        name: "image",
        type: "url",
        defaultValue: "https://placehold.co/600x400",
      },
      { name: "buttonText", type: "string", defaultValue: "Learn More" },
      { name: "buttonLink", type: "url", defaultValue: "#" },
      { name: "elevation", type: "number", defaultValue: 1 },
      { name: "className", type: "string", defaultValue: "" },
    ],
  });
}

/* ───────────────────────────────────────────
   3 ▸  Fetch & render Builder content
   ─────────────────────────────────────────── */
export default function BuilderContent(props: {
  model?: string;
  entry?: string;
}) {
  const { model = "page", entry } = props;

  //  ✨  explicit type instead of “any”
  const [content, setContent] = useState<BuilderContent | null>(null);

  useEffect(() => {
    if (!entry) return;

    builder
      .get(model, { entry })
      .toPromise()
      .then(setContent)
      .catch((err) => console.error("Builder fetch error:", err));
  }, [model, entry]);

  if (!content) return <div>Loading…</div>;

  return (
    <BuilderComponent
      model={model}
      content={content as any} /* Type assertion for compatibility */
    />
  );
}
