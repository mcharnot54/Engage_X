// src/app/observation-form/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  builder,
  BuilderComponent,
  type BuilderContent,
} from "@builder.io/react";

// Initialize Builder
if (!builder.apiKey && process.env.NEXT_PUBLIC_BUILDER_API_KEY) {
  builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY);
}

export default function ObservationForm() {
  const [content, setContent] = useState<BuilderContent | null | undefined>(
    null,
  );
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    if (!builder.apiKey) {
      setDebug({ error: "Builder API key not found" });
      return;
    }

    // Try to fetch all pages to see what's available
    builder
      .getAll("page", { limit: 20 })
      .then((pages) => {
        setDebug({
          totalPages: pages.length,
          pages: pages.map((p) => ({
            name: p.name,
            id: p.id,
            data: p.data,
          })),
        });

        // Look for the specific observation form page
        const observationPage = pages.find(
          (p) =>
            p.name?.toLowerCase().includes("observation") ||
            p.name?.toLowerCase().includes("mark") ||
            p.data?.url === "/observation-form",
        );

        if (observationPage) {
          setContent(observationPage);
        } else {
          setContent(undefined);
        }
      })
      .catch((err) => {
        console.error("Builder fetch error:", err);
        setDebug({ error: err.message });
        setContent(undefined);
      });
  }, []);

  if (content === null) {
    return (
      <div className="p-8">
        <h1>Loading Builder.io content...</h1>
        {debug && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h2>Debug Info:</h2>
            <pre>{JSON.stringify(debug, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (content === undefined) {
    return (
      <div className="p-8">
        <h1>Observation Form Not Found</h1>
        <p>Could not find Builder.io content for the observation form.</p>
        {debug && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h2>Available pages:</h2>
            <pre>{JSON.stringify(debug, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <BuilderComponent
      model="page"
      content={content}
      options={{ includeRefs: true }}
    />
  );
}
