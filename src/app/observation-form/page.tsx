"use client";

import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

export default function ObservationForm() {
  const [allPages, setAllPages] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Check environment and API key
    const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

    setDebugInfo({
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      builderInitialized: !!builder.apiKey,
    });

    // Initialize Builder if not already done
    if (!builder.apiKey && apiKey) {
      builder.init(apiKey);
    }

    if (!builder.apiKey) {
      setError(
        "Builder API key not found. Please set NEXT_PUBLIC_BUILDER_API_KEY environment variable.",
      );
      setLoading(false);
      return;
    }

    // Fetch all Builder.io pages
    builder
      .getAll("page", {
        limit: 50,
        includeRefs: true,
      })
      .then((pages) => {
        console.log("All Builder.io pages:", pages);
        setAllPages(pages);

        // Look for "Mark's observation 2" or any observation-related content
        const observationPage = pages.find(
          (p) =>
            p.name?.toLowerCase().includes("mark") ||
            p.name?.toLowerCase().includes("observation") ||
            p.data?.url === "/observation-form",
        );

        if (observationPage) {
          console.log("Found observation page:", observationPage);
          setSelectedContent(observationPage);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Builder fetch error:", err);
        setError(`Failed to fetch Builder.io content: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const handleSelectPage = (page: any) => {
    setSelectedContent(page);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Loading Builder.io Content...
          </h1>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-800 mb-2">
              ❌ Builder.io Connection Error
            </h1>
            <p className="text-red-700 mb-4">{error}</p>

            <div className="bg-white border rounded p-4">
              <h3 className="font-semibold mb-2">Debug Information:</h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">
                🔧 How to Fix:
              </h3>
              <ol className="list-decimal list-inside text-blue-700 space-y-1">
                <li>Go to your Builder.io dashboard</li>
                <li>Go to Account Settings → Organization Settings</li>
                <li>Copy your Public API Key</li>
                <li>
                  Add it as an environment variable: NEXT_PUBLIC_BUILDER_API_KEY
                </li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Content found and selected
  if (selectedContent) {
    return (
      <div className="min-h-screen bg-white">
        {/* Status bar */}
        <div className="bg-green-100 border-b border-green-200 p-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-green-800">
              ✅ <strong>Builder.io Content Loaded:</strong>{" "}
              {selectedContent.name}
            </p>
            <button
              onClick={() => setSelectedContent(null)}
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              ← Back to Page List
            </button>
          </div>
        </div>

        {/* Render Builder.io content */}
        <BuilderComponent
          model="page"
          content={selectedContent}
          options={{ includeRefs: true }}
        />
      </div>
    );
  }

  // Page list view
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          🔍 Builder.io Content Finder
        </h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-yellow-800 mb-2">
            Looking for "Mark's observation 2"
          </h2>
          <p className="text-yellow-700">
            No content automatically matched. Please select your observation
            form from the list below:
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Available Builder.io Pages ({allPages.length})
          </h2>

          {allPages.length === 0 ? (
            <div className="bg-gray-50 border rounded-lg p-6 text-center">
              <p className="text-gray-600">
                No pages found in your Builder.io space.
              </p>
              <p className="text-gray-500 mt-2">
                Make sure you have created and published content in Builder.io.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {allPages.map((page, index) => (
                <div
                  key={page.id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {page.name || "Untitled Page"}
                      </h3>

                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div>
                          <strong>ID:</strong> {page.id}
                        </div>
                        <div>
                          <strong>URL:</strong> {page.data?.url || "No URL set"}
                        </div>
                        <div>
                          <strong>Created:</strong>{" "}
                          {page.createdDate
                            ? new Date(page.createdDate).toLocaleDateString()
                            : "Unknown"}
                        </div>
                        <div>
                          <strong>Updated:</strong>{" "}
                          {page.lastUpdated
                            ? new Date(page.lastUpdated).toLocaleDateString()
                            : "Unknown"}
                        </div>
                      </div>

                      {/* Highlight potential matches */}
                      {(page.name?.toLowerCase().includes("mark") ||
                        page.name?.toLowerCase().includes("observation")) && (
                        <div className="mt-2 inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                          🎯 Potential Match
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectPage(page)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Load This Page
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug info */}
        <details className="mt-8">
          <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
            🔧 Debug Information (Click to expand)
          </summary>
          <div className="mt-4 p-4 bg-gray-50 border rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(
                {
                  ...debugInfo,
                  totalPages: allPages.length,
                  searchTerms: ["mark", "observation", "/observation-form"],
                },
                null,
                2,
              )}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
