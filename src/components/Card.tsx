import type React from "react"
import { Button } from "./Button"
import "./Card.css" // Adjust based on your styling approach

interface CardProps {
  title: string
  description: string
  image?: string
  buttonText?: string
  buttonLink?: string
  elevation?: number
  className?: string
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  image = "https://placehold.co/600x400",
  buttonText = "Learn More",
  buttonLink = "#",
  elevation = 1,
  className = "",
}) => {
  return (
    <div className={`card card--elevation-${elevation} ${className}`}>
      {image && (
        <div className="card__image-container">
          <img src={image || "/placeholder.svg"} alt={title} className="card__image" />
        </div>
      )}
      <div className="card__content">
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>
        {buttonText && (
          <a href={buttonLink} className="card__button-link">
            <Button text={buttonText} variant="primary" size="medium" />
          </a>
        )}
      </div>
    </div>
  )
}
