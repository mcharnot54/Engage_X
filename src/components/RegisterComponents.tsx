"use client"

import { useEffect } from "react"
import { Builder } from "@builder.io/react"
import { Button } from "../ui/Button" // Adjust import path based on your project structure
import { Card } from "../ui/Card" // Adjust import path based on your project structure

export default function RegisterComponents() {
  useEffect(() => {
    // Register Button component
    Builder.registerComponent((props) => <Button {...props}>{props.text}</Button>, {
      name: "Button",
      inputs: [
        {
          name: "text",
          type: "string",
          defaultValue: "Click me",
        },
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
        {
          name: "onClick",
          type: "string",
          defaultValue: "",
          advanced: true,
        },
      ],
    })

    // Register Card component
    Builder.registerComponent(
      (props) => (
        <Card className={props.className}>
          {props.showHeader && (
            <div className="card-header">
              <h3 className="card-title">{props.title}</h3>
              {props.description && <p className="card-description">{props.description}</p>}
            </div>
          )}
          <div className="card-content">{props.content}</div>
          {props.footer && <div className="card-footer">{props.footer}</div>}
        </Card>
      ),
      {
        name: "Card",
        inputs: [
          {
            name: "showHeader",
            type: "boolean",
            defaultValue: true,
          },
          {
            name: "title",
            type: "string",
            defaultValue: "Card Title",
          },
          {
            name: "description",
            type: "string",
            defaultValue: "Card description goes here",
          },
          {
            name: "content",
            type: "string",
            defaultValue: "Card content goes here",
            richText: true,
          },
          {
            name: "footer",
            type: "string",
            defaultValue: "",
          },
          {
            name: "className",
            type: "string",
            defaultValue: "",
          },
        ],
      },
    )

    // Register more components as needed
  }, [])

  return null
}
