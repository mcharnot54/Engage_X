'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Button } from './Button';
import './Card.css'; // keep your existing styles

interface CardProps {
  title: string;
  description: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  elevation?: number;
  className?: string;
  children?: ReactNode;           // optional slot if you need extra markup
}

export const Card = ({
  title,
  description,
  image = 'https://placehold.co/600x400',
  buttonText = 'Learn More',
  buttonLink = '#',
  elevation = 1,
  className = '',
  children,
}: CardProps) => {
  return (
    <article className={`card card--elevation-${elevation} ${className}`}>
      {image && (
        <div className="card__image-container">
          {/* next/image replaces the <img> tag */}
          <Image
            src={image}
            alt={title}
            width={600}
            height={400}
            className="card__image"
            priority
          />
        </div>
      )}

      <div className="card__content">
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>

        {children /* optional extra JSX */}

        {buttonText && (
          <a href={buttonLink} className="card__button-link">
            <Button text={buttonText} variant="primary" size="medium" />
          </a>
        )}
      </div>
    </article>
  );
};
