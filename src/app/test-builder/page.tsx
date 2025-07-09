"use client";

import { useState, useEffect } from "react";

// Force dynamic rendering to avoid SSG issues
export const dynamic = "force-dynamic";
import {
  searchBuilderContent,
  testBuilderConnection,
} from "../../../lib/builder-utils";

export default function TestBuilderPage() {
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [contentTest, setContentTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      setLoading(true);

      // Test connection
      console.log("Testing Builder.io connection...");
      const connection = await testBuilderConnection();
      setConnectionTest(connection);
      console.log("Connection test result:", connection);

      // Test content search
      console.log("Testing content search...");
      const content = await searchBuilderContent(
        "Copy of Mark's Standards Page",
      );
      setContentTest(content);
      console.log("Content search result:", content);

      setLoading(false);
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Builder.io Connection Test</h1>
        <div>Testing Builder.io connection and content search...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Builder.io Connection Test</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>
            <strong>NEXT_PUBLIC_BUILDER_API_KEY:</strong>{" "}
            {process.env.NEXT_PUBLIC_BUILDER_API_KEY
              ? `${process.env.NEXT_PUBLIC_BUILDER_API_KEY.substring(0, 8)}...`
              : "Not set"}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
        <div
          className={`p-4 rounded-lg ${connectionTest?.success ? "bg-green-100" : "bg-red-100"}`}
        >
          <p className="mb-2">
            <strong>Status:</strong>{" "}
            <span
              className={
                connectionTest?.success ? "text-green-600" : "text-red-600"
              }
            >
              {connectionTest?.success ? "✓ Connected" : "✗ Failed"}
            </span>
          </p>
          {connectionTest?.models && (
            <p className="mb-2">
              <strong>Accessible models:</strong>{" "}
              {connectionTest.models.join(", ")}
            </p>
          )}
          {connectionTest?.error && (
            <p className="text-red-600">
              <strong>Error:</strong> {connectionTest.error}
            </p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Content Search Test</h2>
        <div
          className={`p-4 rounded-lg ${contentTest?.content ? "bg-green-100" : "bg-yellow-100"}`}
        >
          <p className="mb-2">
            <strong>Content found:</strong>{" "}
            <span
              className={
                contentTest?.content ? "text-green-600" : "text-orange-600"
              }
            >
              {contentTest?.content ? "✓ Yes" : "✗ No"}
            </span>
          </p>
          {contentTest?.debugInfo?.foundInModel && (
            <p className="mb-2">
              <strong>Found in model:</strong>{" "}
              {contentTest.debugInfo.foundInModel}
            </p>
          )}
          {contentTest?.debugInfo?.foundMethod && (
            <p className="mb-2">
              <strong>Found by:</strong> {contentTest.debugInfo.foundMethod}
            </p>
          )}
          {contentTest?.error && (
            <p className="text-orange-600">
              <strong>Error:</strong> {contentTest.error}
            </p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Connection Test Details:</h3>
          <pre className="text-sm overflow-x-auto mb-4">
            {JSON.stringify(connectionTest, null, 2)}
          </pre>

          <h3 className="font-semibold mb-2">Content Search Details:</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(contentTest, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
