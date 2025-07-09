// src/components/RegisterComponents.tsx
"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Builder } from "@builder.io/react";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import Image from "next/image";

/* ── 1. Types used by the wrapper components ───────────────────────── */

interface ButtonProps {
  text?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
}

interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  elevation?: number;
  className?: string;
  children?: ReactNode;
}

interface ImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/* ── 2. Wrapper components that adapt Builder-supplied props ───────── */

const BuilderButton = ({ text, ...rest }: ButtonProps) => (
  <Button {...rest}>{text}</Button>
);

const BuilderCard = ({
  title,
  description,
  image,
  buttonText,
  buttonLink,
  elevation,
  className,
  children,
}: CardProps) => (
  <Card
    title={title ?? "Card Title"}
    description={description ?? "Card description goes here"}
    image={image}
    buttonText={buttonText}
    buttonLink={buttonLink}
    elevation={elevation}
    className={className}
  >
    {children}
  </Card>
);

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

/* ── 3. Register once when the component mounts ────────────────────── */

export default function RegisterComponents(): null {
  useEffect(() => {
    /* Button */
    Builder.registerComponent(BuilderButton, {
      name: "Button",
      inputs: [
        { name: "text", type: "string", defaultValue: "Click me" },
        {
          name: "variant",
          type: "enum",
          enum: ["primary", "secondary", "outline", "ghost"],
          defaultValue: "primary",
        },
        {
          name: "size",
          type: "enum",
          enum: ["small", "medium", "large"],
          defaultValue: "medium",
        },
        { name: "onClick", type: "string", advanced: true },
      ],
    });

    /* Card */
    Builder.registerComponent(BuilderCard, {
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

    /* Accessible Image */
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
  }, []); // run once

  /* Side-effect only – renders nothing */
  return null;
}
