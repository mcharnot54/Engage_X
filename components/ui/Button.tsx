'use client'

import type React from "react"
import "./Button.css" // Adjust based on your styling approach

interface ButtonProps {
  text: string
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "small" | "medium" | "large"
  fullWidth?: boolean
  onClick?: () => void
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  text,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  onClick,
  className = "",
}) => {
  const baseClass = "button"
  const variantClass = `${baseClass}--${variant}`
  const sizeClass = `${baseClass}--${size}`
  const widthClass = fullWidth ? `${baseClass}--full-width` : ""

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <button className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`} onClick={handleClick}>
      {text}
    </button>
  )
}
