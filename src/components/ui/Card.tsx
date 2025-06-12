'use client'

import React, { ReactNode } from "react";
import { Button } from "./Button";
import "./Card.css";

export interface CardProps {
  title: string;
  description: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  elevation?: number;
  className?: string;
  /** NEW – allows nested content in RegisterComponents */
  children?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  image = "https://placehold.co/600x400",
  buttonText = "Learn More",
  buttonLink = "#",
  elevation = 1,
  className = "",
  children, // ← receive children
}) => (
  <div className={`card card--elevation-${elevation} ${className}`}>
    {image && (
      <div className="card__image-container">
        <img src={image} alt={title} className="card__image" />
      </div>
    )}

    <div className="card__content">
      <h3 className="card__title">{title}</h3>
      <p className="card__description">{description}</p>

      {/* Nested Builder content, if any */}
      {children}

      {buttonText && (
        <a href={buttonLink} className="card__button-link">
          <Button text={buttonText} variant="primary" size="medium" />
        </a>
      )}
    </div>
  </div>
);
