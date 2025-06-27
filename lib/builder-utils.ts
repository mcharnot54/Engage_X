import { builder } from "@builder.io/sdk";

// Initialize Builder with API key
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
if (apiKey) {
  builder.init(apiKey);
} else {
  console.warn(
    "NEXT_PUBLIC_BUILDER_API_KEY is not defined — Builder content will not load.",
  );
}

export interface ContentSearchResult {
  content: any | null;
  debugInfo: {
    foundInModel?: string;
    foundMethod?: string;
    attempts: Array<{
      model: string;
      exactNameResult?: boolean;
      partialNameResult?: boolean;
      totalItems?: number;
      foundBySearch?: boolean;
      error?: string;
      listError?: string;
    }>;
  };
  error?: string;
}

/**
 * Comprehensive content search utility that tries multiple strategies
 * to find Builder.io content across different models and search methods
 */
export async function searchBuilderContent(
  contentName: string,
  modelsToTry: string[] = ["page", "content", "legacy-content", "EngageX"],
): Promise<ContentSearchResult> {
  let foundContent = null;
  let debugData: any = { attempts: [] };

  if (!apiKey) {
    return {
      content: null,
      debugInfo: debugData,
      error: "NEXT_PUBLIC_BUILDER_API_KEY is not configured",
    };
  }

  try {
    // Strategy 1: Try exact name match across all models
    for (const model of modelsToTry) {
      try {
        console.log(`Trying exact name match in model: ${model}`);

        const contentByName = await builder
          .get(model, {
            query: {
              name: contentName,
            },
          })
          .promise();

        if (contentByName) {
          foundContent = contentByName;
          debugData.foundInModel = model;
          debugData.foundMethod = "exact name match";
          console.log(`Found content in ${model} model by exact name`);
          break;
        }

        debugData.attempts.push({
          model,
          exactNameResult: !!contentByName,
        });
      } catch (modelError) {
        console.log(`Error with exact name in model ${model}:`, modelError);
        debugData.attempts.push({
          model,
          error:
            modelError instanceof Error
              ? modelError.message
              : String(modelError),
        });
      }
    }

    // Strategy 2: Try partial name search if exact match failed
    if (!foundContent) {
      for (const model of modelsToTry) {
        try {
          console.log(`Trying partial name match in model: ${model}`);

          // Create regex pattern from content name
          const nameWords = contentName
            .split(" ")
            .filter((word) => word.length > 2);
          const regexPattern = nameWords.join(".*");

          const contentByPartialName = await builder
            .get(model, {
              query: {
                "name.$regex": regexPattern,
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

          const attemptIndex = debugData.attempts.findIndex(
            (a: any) => a.model === model,
          );
          if (attemptIndex >= 0) {
            debugData.attempts[attemptIndex].partialNameResult =
              !!contentByPartialName;
          } else {
            debugData.attempts.push({
              model,
              partialNameResult: !!contentByPartialName,
            });
          }
        } catch (modelError) {
          console.log(`Error with partial name in model ${model}:`, modelError);
          const attemptIndex = debugData.attempts.findIndex(
            (a: any) => a.model === model,
          );
          if (attemptIndex >= 0) {
            debugData.attempts[attemptIndex].error =
              modelError instanceof Error
                ? modelError.message
                : String(modelError);
          }
        }
      }
    }

    // Strategy 3: Search through all content if previous strategies failed
    if (!foundContent) {
      for (const model of modelsToTry) {
        try {
          console.log(`Searching all content in model: ${model}`);

          const allContent = await builder.getAll(model, {
            limit: 100,
            fields: "name,id,data",
          });

          const nameWords = contentName.toLowerCase().split(" ");
          const foundItem = allContent.find((item: any) =>
            nameWords.every((word) => item.name?.toLowerCase().includes(word)),
          );

          if (foundItem) {
            foundContent = foundItem;
            debugData.foundInModel = model;
            debugData.foundMethod = "search through all content";
            console.log(`Found content in ${model} model by searching all`);
            break;
          }

          const attemptIndex = debugData.attempts.findIndex(
            (a: any) => a.model === model,
          );
          if (attemptIndex >= 0) {
            debugData.attempts[attemptIndex].totalItems = allContent.length;
            debugData.attempts[attemptIndex].foundBySearch = false;
          } else {
            debugData.attempts.push({
              model,
              totalItems: allContent.length,
              foundBySearch: false,
            });
          }
        } catch (listError) {
          console.log(`Error listing from model ${model}:`, listError);
          const attemptIndex = debugData.attempts.findIndex(
            (a: any) => a.model === model,
          );
          if (attemptIndex >= 0) {
            debugData.attempts[attemptIndex].listError =
              listError instanceof Error
                ? listError.message
                : String(listError);
          } else {
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
    }

    return {
      content: foundContent,
      debugInfo: debugData,
      error: foundContent
        ? undefined
        : `Could not find '${contentName}' content`,
    };
  } catch (err) {
    console.error("Error in searchBuilderContent:", err);
    return {
      content: null,
      debugInfo: debugData,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Get content by URL path - useful for catch-all routes
 */
export async function getContentByUrl(
  url: string,
  model: string = "page",
): Promise<ContentSearchResult> {
  if (!apiKey) {
    return {
      content: null,
      debugInfo: { attempts: [] },
      error: "NEXT_PUBLIC_BUILDER_API_KEY is not configured",
    };
  }

  try {
    const content = await builder
      .get(model, {
        url: url,
      })
      .promise();

    return {
      content,
      debugInfo: {
        foundInModel: model,
        foundMethod: "URL lookup",
        attempts: [{ model, foundBySearch: !!content }],
      },
      error: content ? undefined : `No content found for URL: ${url}`,
    };
  } catch (err) {
    console.error("Error fetching content by URL:", err);
    return {
      content: null,
      debugInfo: {
        attempts: [
          { model, error: err instanceof Error ? err.message : String(err) },
        ],
      },
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Test Builder.io API connectivity
 */
export async function testBuilderConnection(): Promise<{
  success: boolean;
  error?: string;
  models?: string[];
}> {
  if (!apiKey) {
    return {
      success: false,
      error: "NEXT_PUBLIC_BUILDER_API_KEY is not configured",
    };
  }

  try {
    // Try to fetch a small amount of content from the main models
    const testModels = ["page", "content"];
    const workingModels = [];

    for (const model of testModels) {
      try {
        await builder.getAll(model, { limit: 1 });
        workingModels.push(model);
      } catch (modelError) {
        console.log(`Model ${model} not accessible:`, modelError);
      }
    }

    return {
      success: workingModels.length > 0,
      models: workingModels,
      error:
        workingModels.length === 0 ? "No accessible models found" : undefined,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Connection test failed",
    };
  }
}

export { builder };
