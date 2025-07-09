"use client";

import { useEffect, useState } from "react";
import {
  builder,
  Builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent,
} from "@builder.io/react";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

/* 1 ▸ Temporarily disable Builder initialization for debugging */
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

// Temporarily disable Builder initialization to debug build issues
if (false && apiKey && apiKey !== "YOUR_BUILDER_API_KEY_HERE") {
  builder.init(apiKey);
} else {
  console.warn("Builder initialization temporarily disabled for debugging");
}

/* 2 ▸ Register custom components once */
export function registerBuilderComponents(): void {
  Builder.registerComponent(Button, {
    name: "Button",
    inputs: [
      { name: "text", type: "string", defaultValue: "Click me" },
      {
        name: "variant",
        type: "enum",
        enum: [
          "default",
          "destructive",
          "outline",
          "secondary",
          "ghost",
          "link",
        ],
        defaultValue: "default",
      },
      {
        name: "size",
        type: "enum",
        enum: ["default", "sm", "lg", "icon"],
        defaultValue: "default",
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
      { name: "buttonLink", type: "string", defaultValue: "#" },
      { name: "elevation", type: "number", defaultValue: 1 },
      { name: "className", type: "string", defaultValue: "" },
    ],
  });
}

/* 3 ▸ Fetch & render Builder content */
export default function BuilderContentComponent(props: {
  model?: string;
  entry?: string;
}) {
  const { model = "page", entry } = props;

  // explicit, safe type instead of `any`
  const [content, setContent] = useState<BuilderContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey || apiKey === "YOUR_BUILDER_API_KEY_HERE") {
      setError("Builder.io API key not configured");
      setLoading(false);
      return;
    }

    if (!entry) {
      setLoading(false);
      return;
    }

    builder
      .get(model, { entry })
      .toPromise()
      .then((result) => {
        setContent(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Builder fetch error:", err);
        setError("Failed to load content");
        setLoading(false);
      });
  }, [model, entry]);

  if (error) {
    return (
      <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium">
          Builder.io Configuration Required
        </p>
        <p className="text-yellow-700 text-sm mt-2">
          Please set your NEXT_PUBLIC_BUILDER_API_KEY in .env.local
        </p>
        <p className="text-yellow-600 text-xs mt-1">
          Get your API key from Builder.io dashboard
        </p>
      </div>
    );
  }

  if (loading) return <div>Loading…</div>;

  if (!content) {
    return (
      <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">No content found</p>
      </div>
    );
  }

  // Ensure content.data is never null
  const safeContent =
    content && content.data === null
      ? { ...content, data: undefined }
      : content === null
        ? undefined
        : content;

  return <BuilderComponent model={model} content={safeContent} />;
}
