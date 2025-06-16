// src/components/RegisterComponents.tsx
'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Builder } from '@builder.io/sdk-react';

import { Button } from './ui/Button';
import { Card } from './ui/Card';

/* ── 1. Types used by the wrapper components ───────────────────────── */

interface ButtonProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
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
    title={title ?? 'Card Title'}
    description={description ?? 'Card description goes here'}
    image={image}
    buttonText={buttonText}
    buttonLink={buttonLink}
    elevation={elevation}
    className={className}
  >
    {children}
  </Card>
);

/* ── 3. Register once when the component mounts ────────────────────── */

export default function RegisterComponents(): null {
  useEffect(() => {
    /* Button */
    Builder.registerComponent(BuilderButton, {
      name: 'Button',
      inputs: [
        { name: 'text', type: 'string', defaultValue: 'Click me' },
        {
          name: 'variant',
          type: 'enum',
          enum: ['primary', 'secondary', 'outline', 'ghost'],
          defaultValue: 'primary',
        },
        {
          name: 'size',
          type: 'enum',
          enum: ['small', 'medium', 'large'],
          defaultValue: 'medium',
        },
        { name: 'onClick', type: 'string', advanced: true },
      ],
    });

    /* Card */
    Builder.registerComponent(BuilderCard, {
      name: 'Card',
      inputs: [
        { name: 'title', type: 'string', defaultValue: 'Card Title' },
        {
          name: 'description',
          type: 'string',
          defaultValue: 'Card description goes here',
        },
        {
          name: 'image',
          type: 'url',
          defaultValue: 'https://placehold.co/600x400',
        },
        { name: 'buttonText', type: 'string', defaultValue: 'Learn More' },
        { name: 'buttonLink', type: 'url', defaultValue: '#' },
        { name: 'elevation', type: 'number', defaultValue: 1 },
        { name: 'className', type: 'string', defaultValue: '' },
      ],
    });
  }, []); // run once

  /* Side-effect only – renders nothing */
  return null;
}
