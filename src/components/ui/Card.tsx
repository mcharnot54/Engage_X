"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Button } from "./Button";

export interface CardProps {
  title: string;
  description: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  elevation?: number;
  className?: string;
  /** Allows nested Builder content */
  children?: ReactNode;
}

export const Card = ({
  title,
  description,
  image = "https://placehold.co/600x400",
  buttonText = "Learn More",
  buttonLink = "#",
  elevation = 1,
  className = "",
  children,
}: CardProps) => {
  const elevationClasses = {
    0: "",
    1: "shadow-sm",
    2: "shadow-md",
    3: "shadow-lg",
    4: "shadow-xl",
    5: "shadow-2xl",
  };

  return (
    <article
      className={`rounded-lg border bg-card text-card-foreground ${elevationClasses[elevation as keyof typeof elevationClasses] || elevationClasses[1]} ${className}`}
    >
      {image && (
        <div className="overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={title}
            width={600}
            height={400}
            className="h-48 w-full object-cover transition-transform hover:scale-105"
            priority
          />
        </div>
      )}

      <div className="p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        {children}

        {buttonText && (
          <a href={buttonLink} className="inline-block">
            <Button text={buttonText} variant="primary" size="medium" />
          </a>
        )}
      </div>
    </article>
  );
};
