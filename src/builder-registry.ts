"use client";
import { builder, Builder } from "@builder.io/react";
import App from "./app";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(App, {
  name: "App",
});

Builder.registerComponent(Builder, {
  name: "Builder",
});
