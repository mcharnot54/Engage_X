// lib/builder-registry.tsx
"use client";

import { builder, Builder } from "@builder.io/react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import Image from "next/image";

// Initialize Builder SDK
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
if (apiKey) {
  builder.init(apiKey);
} else {
  console.warn("NEXT_PUBLIC_BUILDER_API_KEY is not defined.");
}

/**
 * Register custom components with Builder.io
 */
interface ImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

const BuilderImage = ({
  src,
  alt,
  width = 600,
  height = 400,
  className,
  priority = false,
}: ImageProps) => {
  if (!src) {
    return null;
  }

  // Ensure alt text is always provided for accessibility
  const altText = alt || "Image";

  return (
    <Image
      src={src}
      alt={altText}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
};

export function registerBuilderComponents() {
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

  Builder.registerComponent(BuilderImage, {
    name: "Image",
    inputs: [
      {
        name: "src",
        type: "file",
        allowedFileTypes: ["jpeg", "jpg", "png", "svg", "gif", "webp"],
        required: true,
      },
      {
        name: "alt",
        type: "string",
        defaultValue: "Image",
        helperText: "Describe this image for screen readers and SEO",
        required: true,
      },
      { name: "width", type: "number", defaultValue: 600 },
      { name: "height", type: "number", defaultValue: 400 },
      { name: "className", type: "string", defaultValue: "" },
      {
        name: "priority",
        type: "boolean",
        defaultValue: false,
        helperText:
          "Load this image with high priority (useful for above-the-fold images)",
      },
    ],
  });
}
