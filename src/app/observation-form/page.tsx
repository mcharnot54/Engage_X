"use client";

import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

type DebugState = {
  successModel?: string;
  allResults?: Record<string, any>;
};

export default function ObservationForm() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<DebugState>({});

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

    if (!apiKey) {
      setError("No API key");
      setLoading(false);
      return;
    }

    builder.init(apiKey);

    // Try EVERY possible way to get content
    const fetchContent = async () => {
      try {
        console.log("=== TESTING ALL MODELS ===");

        // Test all possible models
        const models = ["page", "content", "section", "symbol", "data"];
        const results: Record<string, unknown> = {};

        for (const model of models) {
          try {
            const data = await builder.getAll(model, { limit: 10 });
            results[model] = data?.length || 0;
            console.log(`${model}: ${data?.length || 0} items`);

            if (data && data.length > 0) {
              console.log(`✅ FOUND CONTENT IN ${model}:`, data);
              setContent(data[0]); // Use first item
              setDebug({ successModel: model, allResults: results });
              setLoading(false);
              return;
            }
          } catch (err: any) {
            results[model] = `Error: ${err.message}`;
            console.log(`${model}: ERROR -`, err.message);
          }
        }

        // If nothing found, show debug info
        setError("No content found in any model");
        setDebug({ allResults: results });
        setLoading(false);
      } catch (err) {
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div>
        Testing All Builder.io Models...<br />
        Check console for detailed results
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "red" }}>
        <h2>Error: {error}</h2>
        <h3>Model Test Results:</h3>
        <pre>{JSON.stringify(debug, null, 2)}</pre>
        <h4>Next Steps:</h4>
        <ol>
          <li>Check console logs above for which models were tested</li>
          <li>Go to Builder.io → verify &quot;ObservationForm&quot; exists and is PUBLISHED</li>
          <li>Note which section/tab your content is under in Builder.io</li>
          <li>Verify you&#39;re in the correct space (Engage_X)</li>
        </ol>
      </div>
    );
  }

  if (content) {
    return (
      <>
        ✅SUCCESS! Found content: {content!.name} Model: {debug.successModel}
      </>
    );
  }

  return <div>Unexpected state</div>;
}