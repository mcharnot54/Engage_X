"use client"

import { Builder } from "@builder.io/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Register your custom components for Builder.io
export function registerBuilderComponents() {
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
        enum: ["default", "destructive", "outline", "secondary", "ghost", "link"],
        defaultValue: "default",
      },
      {
        name: "size",
        type: "enum",
        enum: ["default", "sm", "lg", "icon"],
        defaultValue: "default",
      },
    ],
  })

  // Register Card component
  Builder.registerComponent(
    (props) => (
      <Card className={props.className}>
        {props.showHeader && (
          <CardHeader>
            <CardTitle>{props.title}</CardTitle>
            {props.description && <CardDescription>{props.description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{props.content}</CardContent>
        {props.footer && <CardFooter>{props.footer}</CardFooter>}
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
}
