"use client";

import { useState, useEffect } from "react";
import { builder } from "@builder.io/sdk";

// Initialize Builder
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

export default function Standards() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, try to get the specific content by name from different models
        const modelsToTry = ["page", "content", "legacy-content", "EngageX"];
        let foundContent = null;
        let debugData: any = { attempts: [] };

        // Try searching by name "Copy of Mark's Standards Page"
        for (const model of modelsToTry) {
          try {
            console.log(`Trying to fetch from model: ${model}`);

            // Try exact name match
            const contentByName = await builder
              .get(model, {
                query: {
                  name: "Copy of Mark's Standards Page",
                },
              })
              .promise();

            if (contentByName) {
              foundContent = contentByName;
              debugData.foundInModel = model;
              debugData.foundMethod = "exact name match";
              console.log(`Found content in ${model} model by name`);
              break;
            }

            // Try partial name search
            const contentByPartialName = await builder
              .get(model, {
                query: {
                  "name.$regex": "Mark.*Standards",
                },
              })
              .promise();

            if (contentByPartialName) {
              foundContent = contentByPartialName;
              debugData.foundInModel = model;
              debugData.foundMethod = "partial name match";
              console.log(`Found content in ${model} model by partial name`);
              break;
            }

            debugData.attempts.push({
              model,
              exactNameResult: !!contentByName,
              partialNameResult: !!contentByPartialName,
            });
          } catch (modelError) {
            console.log(`Error with model ${model}:`, modelError);
            debugData.attempts.push({
              model,
              error:
                modelError instanceof Error
                  ? modelError.message
                  : String(modelError),
            });
          }
        }

        // If not found by name, try to list all content to find it
        if (!foundContent) {
          for (const model of modelsToTry) {
            try {
              const allContent = await builder.getAll(model, {
                limit: 100,
                fields: "name,id,data",
              });

              const foundItem = allContent.find(
                (item: any) =>
                  item.name?.toLowerCase().includes("standards") &&
                  item.name?.toLowerCase().includes("mark"),
              );

              if (foundItem) {
                foundContent = foundItem;
                debugData.foundInModel = model;
                debugData.foundMethod = "search through all content";
                console.log(`Found content in ${model} model by searching all`);
                break;
              }

              debugData.attempts.push({
                model,
                totalItems: allContent.length,
                foundBySearch: false,
              });
            } catch (listError) {
              console.log(`Error listing from model ${model}:`, listError);
              debugData.attempts.push({
                model,
                listError:
                  listError instanceof Error
                    ? listError.message
                    : String(listError),
              });
            }
          }
        }

        setDebugInfo(debugData);

        if (foundContent) {
          setContent(foundContent);
          setError(null);
        } else {
          setError("Could not find 'Copy of Mark's Standards Page' content");
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
