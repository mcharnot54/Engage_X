"use client";

import { useEffect, useState } from "react";
import { builder, BuilderComponent } from "@builder.io/react";

export default function ObservationForm() {
  const [allPages, setAllPages] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState({});

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

    // First try to get content directly by URL path
    builder
      .get("page", {
        userAttributes: { urlPath: "/observation-form" },
        includeRefs: true,
      })
      .then((content) => {
        if (content) {
          console.log("Found observation form content by URL:", content);
          setSelectedContent(content);
          setAllPages([content]);
          setLoading(false);
          return; // Exit early if we found it
        }
        
        // If no content found by URL, try getAll as fallback
        return builder.getAll("page", {
          limit: 50,
          includeRefs: true,
        });
      })
      .then((pages) => {
        // Only process this if we didn't already find content above
        if (selectedContent) return;
        
        if (pages && Array.isArray(pages)) {
          console.log("All Builder.io pages:", pages);
          setAllPages(pages);

          // Look for "ObservationForm" content
          const observationPage = pages.find(
            (p) =>
              p.name?.toLowerCase().includes("observationform") ||
              p.name === "ObservationForm" ||
              p.name?.toLowerCase().includes("observation") ||
              p.data?.url === "/observation-form"
          );

          if (observationPage) {
            console.log("Found observation page:", observationPage);
            setSelectedContent(observationPage);
          }
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
    return <div>Loading Builder.io Content...</div>;
  }

  // Error state
  if (error) {
    return (
      <div>
        <h2 style={{ color: "red" }}>Builder.io Connection Error</h2>
        <p>{error}</p>
        <h3>Debug Information:</h3>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    );
  }

  // Content found and selected
  if (selectedContent) {
    return (
      <div>
        {/* Status bar */}
        <div className="mb-4 flex items-center gap-2">
          <span role="img" aria-label="success">✅</span>
          Builder.io Content Loaded: <strong>{selectedContent.name}</strong>
        </div>
        <button
          onClick={() => setSelectedContent(null)}
          className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          ← Back to Page List
        </button>
        {/* Render Builder.io content */}
        <div className="mt-6 border rounded p-4 bg-white shadow">
          <BuilderComponent model="page" content={selectedContent} />
        </div>
      </div>
    );
  }

  // Page list view
  return (
    <div>
      <h1>Builder.io Content Finder</h1>
      <h2>Looking for &quot;ObservationForm&quot;</h2>
      <p>
        No content automatically matched. Please select your observation form from the list below:
      </p>
      <h2>
        Available Builder.io Pages ({allPages.length})
      </h2>
      {allPages.length === 0 ? (
        <div>
          <p>No pages found in your Builder.io space.</p>
          <p>Make sure you have created and published content in Builder.io.</p>
        </div>
      ) : (
        <div>
          {allPages.map((page: any, index: number) => (
            <div key={page.id || index} className="mb-4 p-4 border rounded bg-gray-50">
              <div>
                <strong>{page.name || "Untitled Page"}</strong>
              </div>
              <div>ID: {page.id}</div>
              <div>URL: {page.data?.url || "No URL set"}</div>
              <div>
                Created:{" "}
                <strong>
                  {page.createdDate
                    ? new Date(page.createdDate).toLocaleDateString()
                    : "Unknown"}
                </strong>
              </div>
              <div>
                Updated:{" "}
                <strong>
                  {page.lastUpdated
                    ? new Date(page.lastUpdated).toLocaleDateString()
                    : "Unknown"}
                </strong>
              </div>
              {/* Highlight potential matches */}
              {(page.name?.toLowerCase().includes("observationform") ||
                page.name?.toLowerCase().includes("observation")) && (
                <div className="text-green-700 font-semibold mt-2">
                  🎯 Potential Match
                </div>
              )}
              <button
                onClick={() => handleSelectPage(page)}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Load This Page
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Debug info */}
      <details className="mt-6">
        <summary>🔧 Debug Information (Click to expand)</summary>
        <pre>
          {JSON.stringify(
            {
              ...debugInfo,
              totalPages: allPages.length,
              searchTerms: ["observationform", "observation", "/observation-form"],
            },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}