// src/builder-registry.ts
"use client";

import { builder, Builder } from "@builder.io/react";

/* Temporarily disable Builder.io initialization to debug build issues */
// if (typeof window !== 'undefined') {
//   const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
//
//   if (apiKey) {
//     builder.init(apiKey);
//   } else {
//     console.warn(
//       'NEXT_PUBLIC_BUILDER_API_KEY is not defined — Builder content will not load.',
//     );
//   }
// }
