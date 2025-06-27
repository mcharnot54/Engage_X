"use client";

import { useState, useEffect } from "react";
import {
  searchBuilderContent,
  testBuilderConnection,
} from "../../../lib/builder-utils";

export default function Standards() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [connectionTest, setConnectionTest] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // First test the connection
        const connectionResult = await testBuilderConnection();
        setConnectionTest(connectionResult);

        if (!connectionResult.success) {
          setError(`Builder.io connection failed: ${connectionResult.error}`);
          setLoading(false);
          return;
        }

        // Search for the standards content
        const result = await searchBuilderContent(
          "Copy of Mark's Standards Page",
        );

        setDebugInfo(result.debugInfo);

        if (result.content) {
          setContent(result.content);
          setError(null);
        } else {
          setError(
            result.error ||
              "Could not find 'Copy of Mark's Standards Page' content",
          );
        }
      } catch (err) {
        console.error("Error fetching content:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="font-poppins text-black bg-gray-100 min-h-screen">
        <header className="bg-white px-6 py-4 shadow-md">
          <h1 className="m-0 text-red-600 text-2xl font-semibold">
            Standards Page
          </h1>
        </header>
        <main className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <div className="text-lg">Loading standards content...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-poppins text-black bg-gray-100 min-h-screen">
        <header className="bg-white px-6 py-4 shadow-md">
          <h1 className="m-0 text-red-600 text-2xl font-semibold">
            Standards Page
          </h1>
        </header>
        <main className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Content Loading Error
            </h2>
            <p className="mb-4">{error}</p>

            <div className="bg-gray-100 p-4 rounded-lg mt-6">
              <h3 className="font-semibold mb-2">Debug Information:</h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <h3 className="font-semibold mb-2">Troubleshooting steps:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Verify that "Copy of Mark's Standards Page" exists in
                  Builder.io
                </li>
                <li>
                  Check that the content is published and not in draft mode
                </li>
                <li>Ensure the API key has access to the content model</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!content?.data) {
    return (
      <div className="font-poppins text-black bg-gray-100 min-h-screen">
        <header className="bg-white px-6 py-4 shadow-md">
          <h1 className="m-0 text-red-600 text-2xl font-semibold">
            Standards Page
          </h1>
        </header>
        <main className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4">
              No content data found
            </h2>
            <p>The content was found but contains no data to display.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-poppins text-black bg-gray-100 min-h-screen">
      <header className="bg-white px-6 py-4 shadow-md">
        <h1 className="m-0 text-red-600 text-2xl font-semibold">
          Standards Page
        </h1>
      </header>
      <main className="p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div
            dangerouslySetInnerHTML={{
              __html:
                content.data?.content ||
                content.data?.html ||
                "No content available",
            }}
          />
        </div>

        {/* Debug information - remove this in production */}
        <div className="mt-6 bg-gray-100 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Content loaded successfully:</h3>
          <p>Model: {debugInfo?.foundInModel}</p>
          <p>Method: {debugInfo?.foundMethod}</p>
          <p>Content Name: {content.name}</p>
          <p>Content ID: {content.id}</p>
        </div>
      </main>
    </div>
  );
}
