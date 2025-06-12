// src/components/BuilderClientPage.tsx
"use client";

import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

/**
 * Initialise Builder on the client exactly once.
 */
if (!builder.apiKey) {
  const key = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  console.log("process.env.NEXT_PUBLIC_BUILDER_API_KEY →", key);
  if (key) {
    builder.init(key);
  } else {
    // eslint‑disable‑next‑line no-console
    console.warn("NEXT_PUBLIC_BUILDER_API_KEY is missing → Builder pages will be blank");
  }
}

export interface BuilderClientPageProps {
  /** URL path Builder should match, e.g. "/observation-form" */
  slug: string;
}

/**
 * Client‑only component that fetches and renders a Builder page.
 */
export default function BuilderClientPage({ slug }: BuilderClientPageProps) {
  const [content, setContent] = useState<any | null | undefined>(null);

  useEffect(() => {
    if (!builder.apiKey) return;

    const urlPath = slug.startsWith("/") ? slug : `/${slug}`;

    builder
      .get("page", { userAttributes: { urlPath } })
      .toPromise()
      .then((data) => setContent(data || undefined))
      .catch((err) => {
        console.error("Builder fetch error:", err);
        setContent(undefined);
      });
  }, [slug]);

  if (content === null)      return <div>Loading…</div>;   // still fetching
  if (content === undefined) return <div>Not found</div>;   // Builder 404

  return <BuilderComponent model="page" content={content} options={{ includeRefs: true }} />;
}
