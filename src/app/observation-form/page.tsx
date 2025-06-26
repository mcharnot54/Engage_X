"use client";

import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

type DebugState = {
  successModel?: string;
  allResults?: Record<string, any>;
  foundContent?: Array<{ model: string; content: any; name: string }>;
};

export default function ObservationForm() {
  const [observationFormContent, setObservationFormContent] =
    useState<any>(null);
  const [marksObservationContent, setMarksObservationContent] =
    useState<any>(null);
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

    // Search for both ObservationForm and Mark's Observation 2
    const fetchContent = async () => {
      try {
        console.log("=== SEARCHING FOR OBSERVATION FORM CONTENT ===");

        // Test all possible models including legacy content
        const models = [
          "page",
          "content",
          "section",
          "symbol",
          "data",
          "legacy-content",
        ];
        const results: Record<string, unknown> = {};
        const foundContent: Array<{
          model: string;
          content: any;
          name: string;
        }> = [];

        for (const model of models) {
          try {
            // Get all content from this model
            const data = await builder.getAll(model, { limit: 50 });
            results[model] = data?.length || 0;
            console.log(`${model}: ${data?.length || 0} items`);

            if (data && data.length > 0) {
              console.log(
                `✅ FOUND CONTENT IN ${model}:`,
                data.map((item) => item.name || item.id),
              );

              // Look for ObservationForm content
              const observationForm = data.find(
                (item) =>
                  item.name?.toLowerCase().includes("observationform") ||
                  item.name?.toLowerCase().includes("observation form") ||
                  item.id?.toLowerCase().includes("observationform"),
              );

              // Look for Mark's Observation 2 content
              const marksObservation = data.find(
                (item) =>
                  item.name?.toLowerCase().includes("mark's observation 2") ||
                  item.name?.toLowerCase().includes("marks observation 2") ||
                  item.name?.toLowerCase().includes("mark observation 2") ||
                  item.name === "Mark's Observation 2",
              );

              if (observationForm) {
                console.log(
                  `🎯 Found ObservationForm in ${model}:`,
                  observationForm,
                );
                setObservationFormContent(observationForm);
                foundContent.push({
                  model,
                  content: observationForm,
                  name: observationForm.name || "ObservationForm",
                });
              }

              if (marksObservation) {
                console.log(
                  `🎯 Found Mark's Observation 2 in ${model}:`,
                  marksObservation,
                );
                setMarksObservationContent(marksObservation);
                foundContent.push({
                  model,
                  content: marksObservation,
                  name: marksObservation.name || "Mark's Observation 2",
                });
              }
            }
          } catch (err: any) {
            results[model] = `Error: ${err.message}`;
            console.log(`${model}: ERROR -`, err.message);
          }
        }

        // Also try searching by exact name using builder.get()
        try {
          console.log("=== TRYING EXACT NAME SEARCH ===");
          const marksContent = await builder
            .get("content", {
              query: {
                "data.name": "Mark's Observation 2",
              },
            })
            .toPromise();

          if (marksContent) {
            console.log(
              "🎯 Found Mark's Observation 2 via exact search:",
              marksContent,
            );
            setMarksObservationContent(marksContent);
            foundContent.push({
              model: "content (exact search)",
              content: marksContent,
              name: "Mark's Observation 2",
            });
          }
        } catch (err) {
          console.log("Exact search failed:", err);
        }

        // Try legacy content model specifically
        try {
          console.log("=== TRYING LEGACY CONTENT SEARCH ===");
          const legacyContent = await builder.getAll("content", {
            query: {
              "data.published": { $ne: false },
            },
            limit: 100,
          });

          if (legacyContent && legacyContent.length > 0) {
            console.log(
              "Legacy content items:",
              legacyContent.map((item) => ({ name: item.name, id: item.id })),
            );

            const marksLegacy = legacyContent.find(
              (item) =>
                item.name?.includes("Mark's Observation 2") ||
                item.name?.includes("Observation 2"),
            );

            if (marksLegacy) {
              console.log("🎯 Found Mark's content in legacy:", marksLegacy);
              setMarksObservationContent(marksLegacy);
              foundContent.push({
                model: "legacy content",
                content: marksLegacy,
                name: marksLegacy.name,
              });
            }
          }
        } catch (err) {
          console.log("Legacy search failed:", err);
        }

        setDebug({ allResults: results, foundContent });
        setLoading(false);

        if (!observationFormContent && !marksObservationContent) {
          setError(
            "Neither ObservationForm nor Mark's Observation 2 content found",
          );
        }
      } catch (err) {
        setError(
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "An unknown error occurred",
        );
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">
          Loading Observation Form Content...
        </h1>
        <div className="bg-blue-50 p-4 rounded">
          <p>Searching for:</p>
          <ul className="list-disc list-inside mt-2">
            <li>ObservationForm content</li>
            <li>Mark's Observation 2 legacy content</li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">
            Check console for detailed results
          </p>
        </div>
      </div>
    );
  }

  if (error && !observationFormContent && !marksObservationContent) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h2 className="text-xl font-bold text-red-800 mb-4">
            Content Search Results
          </h2>
          <p className="text-red-700 mb-4">{error}</p>

          <h3 className="font-semibold mb-2">Model Search Results:</h3>
          <pre className="bg-white p-2 rounded text-sm overflow-auto mb-4">
            {JSON.stringify(debug.allResults, null, 2)}
          </pre>

          {debug.foundContent && debug.foundContent.length > 0 && (
            <>
              <h3 className="font-semibold mb-2">Found Content:</h3>
              <ul className="list-disc list-inside mb-4">
                {debug.foundContent.map((item, index) => (
                  <li key={index} className="text-sm">
                    <strong>{item.name}</strong> in {item.model}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="bg-blue-50 p-4 rounded mt-4">
            <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>
                Go to Builder.io dashboard and check if "Mark's Observation 2"
                exists in Legacy Content
              </li>
              <li>Verify the content is published (not draft)</li>
              <li>Check that you're in the correct Builder.io space</li>
              <li>
                Try searching for the content with different name variations
              </li>
              <li>Check console logs for detailed search results</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Observation Form
        </h1>

        <div className="grid gap-8">
          {/* ObservationForm Content */}
          {observationFormContent && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 bg-green-50 border-b">
                <h2 className="text-xl font-semibold text-green-800">
                  ✅ ObservationForm Content
                </h2>
                <p className="text-sm text-green-600">
                  Found in:{" "}
                  {
                    debug.foundContent?.find(
                      (item) => item.content === observationFormContent,
                    )?.model
                  }
                </p>
              </div>
              <div className="p-6">
                <BuilderComponent
                  model="content"
                  content={observationFormContent}
                  options={{ includeRefs: true }}
                />
              </div>
            </div>
          )}

          {/* Mark's Observation 2 Content */}
          {marksObservationContent && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 bg-blue-50 border-b">
                <h2 className="text-xl font-semibold text-blue-800">
                  🎯 Mark's Observation 2 (Legacy Content)
                </h2>
                <p className="text-sm text-blue-600">
                  Found in:{" "}
                  {
                    debug.foundContent?.find(
                      (item) => item.content === marksObservationContent,
                    )?.model
                  }
                </p>
              </div>
              <div className="p-6">
                <BuilderComponent
                  model="content"
                  content={marksObservationContent}
                  options={{ includeRefs: true }}
                />
              </div>
            </div>
          )}

          {/* Content Not Found Message */}
          {!observationFormContent && !marksObservationContent && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                No Content Found
              </h2>
              <p className="text-yellow-700 mb-4">
                Neither ObservationForm nor Mark's Observation 2 content could
                be located.
              </p>
              <div className="text-sm text-yellow-600">
                <p>
                  Check the troubleshooting steps above and console logs for
                  more details.
                </p>
              </div>
            </div>
          )}

          {/* Debug Information */}
          <div className="bg-gray-100 rounded-lg p-4">
            <details className="cursor-pointer">
              <summary className="font-semibold text-gray-700 mb-2">
                Debug Information
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-600">
                    Search Results by Model:
                  </h4>
                  <pre className="bg-white p-2 rounded text-xs overflow-auto mt-1">
                    {JSON.stringify(debug.allResults, null, 2)}
                  </pre>
                </div>

                {debug.foundContent && debug.foundContent.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-600">
                      Found Content:
                    </h4>
                    <div className="bg-white p-2 rounded text-sm mt-1">
                      {debug.foundContent.map((item, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 last:border-b-0 py-1"
                        >
                          <strong>{item.name}</strong> ({item.model})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
