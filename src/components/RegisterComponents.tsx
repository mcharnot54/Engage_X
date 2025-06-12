'use client';

import { useEffect } from "react";
import { Builder } from "@builder.io/react";
import { Button } from "./ui/Button";
import { Card }   from "./ui/Card";

export default function RegisterComponents() {
  useEffect(() => {
    /* -------------------------------------------------------------
     * Button
     * ----------------------------------------------------------- */
    Builder.registerComponent(
      (props: any) => <Button {...props}>{props.text}</Button>,
      {
        name: "Button",
        inputs: [
          { name: "text",    type: "string", defaultValue: "Click me" },
          { name: "variant", type: "enum",
            enum: ["primary", "secondary", "outline", "ghost"],
            defaultValue: "primary" },
          { name: "size",    type: "enum",
            enum: ["small", "medium", "large"],
            defaultValue: "medium" },
          { name: "onClick", type: "string", advanced: true },
        ],
      }
    );

    /* -------------------------------------------------------------
     * Card
     * ----------------------------------------------------------- */
    Builder.registerComponent(
      (props: any) => (
        <Card
          className={props.className}
          title={props.title}
          description={props.description}
          image={props.image}
          buttonText={props.buttonText}
          buttonLink={props.buttonLink}
          elevation={props.elevation}
        >
          {/* Optional nested content: header / body / footer */}
          {props.children}
        </Card>
      ),
      {
        name: "Card",
        inputs: [
          { name: "title",       type: "string",   defaultValue: "Card Title" },
          { name: "description", type: "string",   defaultValue: "Card description goes here" },
          { name: "image",       type: "url",      defaultValue: "https://placehold.co/600x400" },
          { name: "buttonText",  type: "string",   defaultValue: "Learn More" },
          { name: "buttonLink",  type: "url",      defaultValue: "#" },
          { name: "elevation",   type: "number",   defaultValue: 1 },
          { name: "className",   type: "string",   defaultValue: "" },
        ],
      }
    );
  }, []);

  /* Side-effect only, nothing to render */
  return null;
}
