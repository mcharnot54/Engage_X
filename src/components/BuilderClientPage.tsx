// src/components/BuilderClientPage.tsx
"use client";

import { useEffect, useState } from "react";
import {
  builder,
  BuilderComponent,
  useIsPreviewing,
  type BuilderContent, // ← add this
} from "@builder.io/react";

/* ── 1. Initialise Builder exactly once on the client ─────────────── */
if (!builder.apiKey) {
  const key = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
  if (key) {
    builder.init(key);
  }
}

/* ── 2. Component props ───────────────────────────────────────────── */
export interface BuilderClientPageProps {
  /** URL path that Builder should match, e.g. "/observation-form" */
  slug: string;
}

/* ── 3. Fetch & render the page ───────────────────────────────────── */
export default function BuilderClientPage({ slug }: BuilderClientPageProps) {
  /**
   * `null`   → still loading
   * `undefined` → Builder returned 404
   * `BuilderContent` → page ready
   */
  const [content, setContent] = useState<BuilderContent | null | undefined>(
    null,
  );

  useEffect(() => {
    if (!builder.apiKey) {
      setContent(undefined);
      return;
    }

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

  // Don't render anything if no API key is configured
  if (!builder.apiKey) return null;

  if (content === null) return <div>Loading…</div>; // still fetching
  if (content === undefined) return <div>Not found</div>; // Builder 404

  return (
    <BuilderComponent
      model="page"
      content={content}
      options={{ includeRefs: true }}
    />
  );
}
