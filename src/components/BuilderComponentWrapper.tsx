// src/components/BuilderComponentWrapper.tsx
'use client'

import { BuilderComponent } from "@builder.io/react";

export default function BuilderComponentWrapper({ content }: { content: any }) {
  return <BuilderComponent model="page" content={content} />;
}
